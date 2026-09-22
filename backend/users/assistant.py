import json
import os
import re
from decimal import Decimal

from django.db.models import Sum
from items.models import ItemLocation, Order, Sale, Vendor
from openai import OpenAI

VALID_MODELS = {"gpt-6-luna", "gpt-5.6-luna", "gpt-5.6-terra", "gpt-5.6-sol"}
VALID_EFFORTS = {"none", "low", "medium", "high", "xhigh", "max"}
CHAT_HISTORY_LIMIT = 6
DEFAULT_RESULT_LIMIT = 10
MAX_RESULT_LIMIT = 25
MAX_TOOL_ROUNDS = 2
QUERY_TYPES = {
    "vendor_debt", "debt_summary", "unpaid_sales", "financial_summary",
    "profit_orders", "loss_making_orders",
}

TOOL = {
    "type": "function",
    "name": "financial_inventory_lookup",
    "description": "Look up authorised inventory financial data when the user's question needs inventory, sales, debt, profit, vendor, or item data.",
    "strict": True,
    "parameters": {
        "type": "object", "additionalProperties": False,
        "required": ["query_type", "location_name", "vendor_name", "order_name", "limit"],
        "properties": {
            "query_type": {"type": "string", "enum": sorted(QUERY_TYPES)},
            "location_name": {"type": ["string", "null"]},
            "vendor_name": {"type": ["string", "null"]},
            "order_name": {"type": ["string", "null"]},
            "limit": {"type": "integer", "minimum": 1, "maximum": MAX_RESULT_LIMIT},
        },
    },
}

TOOL_TEXT_MARKER = re.compile(
    r"(?:^|\n)[ \t]*(?:assistant[ \t]+)?to=(?:functions\.)?"
    r"[A-Za-z_][\w.-]*(?:[ \t]+code)?[ \t]*:",
    re.IGNORECASE,
)
PAYMENT_HISTORY_QUESTION = re.compile(
    r"\bpayment history\b|\bproof of payment\b|\bdid\b.{0,60}\bpay\b|"
    r"\b(?:has|have|when)\b.{0,60}\bpaid\b",
    re.IGNORECASE,
)


def configuration():
    if not os.environ.get("OPENAI_API_KEY"):
        raise RuntimeError("OPENAI_API_KEY is not configured on the backend.")
    model = os.environ.get("OPENAI_MODEL", "gpt-6-luna")
    if model not in VALID_MODELS:
        raise RuntimeError("OPENAI_MODEL must be one of: " + ", ".join(sorted(VALID_MODELS)))
    effort = os.environ.get("OPENAI_REASONING_EFFORT", "high")
    if effort not in VALID_EFFORTS:
        raise RuntimeError("OPENAI_REASONING_EFFORT must be one of: " + ", ".join(sorted(VALID_EFFORTS)))
    return model, effort


def locations_for(user, active_location_id, location_name=None):
    locations = ItemLocation.objects.all() if user.is_admin else ItemLocation.objects.filter(users=user)
    locations = locations.filter(id=active_location_id)
    return locations.filter(name__iexact=location_name) if location_name else locations


def validate_tool_call(call):
    if getattr(call, "name", None) != TOOL["name"]:
        raise RuntimeError("The assistant requested an unsupported lookup tool.")
    try:
        arguments = json.loads(call.arguments)
    except (TypeError, json.JSONDecodeError):
        raise RuntimeError("The assistant returned an invalid lookup request.")
    if not isinstance(arguments, dict):
        raise RuntimeError("The assistant returned an invalid lookup request.")
    expected = {"query_type", "location_name", "vendor_name", "order_name", "limit"}
    if set(arguments) != expected or arguments.get("query_type") not in QUERY_TYPES:
        raise RuntimeError("The assistant requested an unsupported inventory query.")
    if any(arguments.get(key) is not None and not isinstance(arguments[key], str) for key in ("location_name", "vendor_name", "order_name")):
        raise RuntimeError("The assistant returned invalid lookup arguments.")
    limit = arguments.get("limit")
    if isinstance(limit, bool) or not isinstance(limit, int) or not 1 <= limit <= MAX_RESULT_LIMIT:
        raise RuntimeError("The assistant returned invalid lookup arguments.")
    return arguments


def financial_lookup(user, active_location_id, arguments):
    kind = arguments.get("query_type")
    if kind not in QUERY_TYPES:
        raise RuntimeError("The assistant requested an unsupported inventory query.")
    location_name = arguments.get("location_name")
    locations = locations_for(user, active_location_id, location_name)
    if location_name and not locations.exists():
        return {"clarification": "That school is unavailable or does not exist."}
    vendor_name = arguments.get("vendor_name")
    vendors = Vendor.objects.filter(location__in=locations, deleted=False)
    if vendor_name:
        vendors = vendors.filter(name__iexact=vendor_name)
        if not vendors.exists():
            return {"clarification": "That vendor is unavailable or does not exist."}
        if not location_name and vendors.values("location_id").distinct().count() > 1:
            return {"clarification": "That vendor name exists at multiple schools; please name the school."}
    if kind in {"vendor_debt", "debt_summary", "unpaid_sales"}:
        sales = Sale.objects.filter(order__location__in=locations, deleted=False, debt__gt=0).select_related("vendor", "order__location", "order")
        if vendor_name:
            sales = sales.filter(vendor__in=vendors)
        if kind == "unpaid_sales":
            return {"unpaid_sales": [{"vendor": sale.vendor.name, "school": sale.order.location.name, "item": sale.order.name, "quantity": sale.quantity, "due_rs": sale.debt} for sale in sales.order_by("-debt")[:arguments["limit"]]]}
        debt_rows = sales.values("vendor__name", "order__location__name").annotate(due_rs=Sum("debt")).order_by("-due_rs")
        return {"outstanding_debt": list(debt_rows[:arguments["limit"]]), "total_due_rs": sales.aggregate(total=Sum("debt"))["total"] or Decimal("0")}
    orders = Order.objects.filter(location__in=locations, deleted=False).prefetch_related("sales", "location")
    if arguments.get("order_name"):
        orders = orders.filter(name__iexact=arguments["order_name"])
        if not orders.exists():
            return {"clarification": "That order is unavailable or does not exist."}
    rows = []
    for order in orders:
        sales = [sale for sale in order.sales.all() if not sale.deleted]
        profit = sum((sale.profit() for sale in sales), Decimal("0"))
        potential = sum((sale.potential_profit() for sale in sales), Decimal("0"))
        rows.append({"school": order.location.name, "item": order.name, "profit_rs": profit, "potential_profit_rs": potential, "margin_percent": (profit / order.total_price * 100) if order.total_price else Decimal("0"), "remaining_stock": order.current_quantity()})
    if kind == "financial_summary":
        rows.sort(key=lambda row: row["profit_rs"])
        return {
            "total_profit_rs": sum((r["profit_rs"] for r in rows), Decimal("0")),
            "total_potential_profit_rs": sum((r["potential_profit_rs"] for r in rows), Decimal("0")),
            "loss_making_orders": rows[:arguments["limit"]],
            "most_profitable_orders": rows[-arguments["limit"]:][::-1],
        }
    rows.sort(key=lambda row: row["profit_rs"])
    return {"orders": rows[:arguments["limit"]] if kind == "loss_making_orders" else rows[-arguments["limit"]:][::-1]}


def _balanced_end(text, start):
    """End offset just past the balanced bracket group at start, or (len, False)."""
    pairs = {"{": "}", "[": "]"}
    closers = set(pairs.values())
    stack = []
    in_string = False
    escaped = False
    index = start
    length = len(text)
    while index < length:
        char = text[index]
        if in_string:
            if escaped:
                escaped = False
            elif char == "\\":
                escaped = True
            elif char == '"':
                in_string = False
        elif char == '"':
            in_string = True
        elif char in pairs:
            stack.append(pairs[char])
        elif char in closers:
            if not stack or stack.pop() != char:
                return length, False
            if not stack:
                return index + 1, True
        index += 1
    return length, False


def _skip_tool_payload(text, pos):
    """Advance past one textual tool payload; trailing newlines are preserved.

    Returns (index, certain). Newlines after the payload, including the one
    ending a closing fence line, are left in place so a following tool marker
    keeps its line-start boundary. Malformed payloads (unbalanced brackets,
    unterminated fences) report uncertain boundaries.
    """
    index = pos
    length = len(text)
    while index < length and text[index] in " \t\r\n":
        index += 1
    if text.startswith("```", index):
        fence_end = text.find("\n", index)
        if fence_end == -1:
            return length, False
        index = fence_end + 1
        while index < length and text[index] in " \t\r\n":
            index += 1
    if index < length and text[index] in "{[":
        end, balanced = _balanced_end(text, index)
        if not balanced:
            return length, False
        index = end
        peek = index
        while peek < length and text[peek] in " \t\r\n":
            peek += 1
        if text.startswith("```", peek):
            fence_end = text.find("\n", peek)
            if fence_end == -1:
                return length, False
            index = fence_end
        while index < length and text[index] in " \t":
            index += 1
    return index, True


TOOL_ARG_RESIDUE = re.compile(
    r'(?m)^[ \t]*"(query_type|location_name|vendor_name|order_name|limit)"[ \t]*:'
    r"|^[ \t]*[{}][ \t]*,?[ \t]*$",
)


def _extract_answer(text):
    """Split provider text into (cleaned, trailing, certain).

    cleaned preserves prose on both sides of tool blocks. trailing is True
    when prose remains after the first tool block. certain is False when a
    payload boundary was uncertain or argument residue remains.
    """
    if not TOOL_TEXT_MARKER.search(text):
        return text.strip(), bool(text.strip()), True
    segments = []
    pos = 0
    certain = True
    for match in TOOL_TEXT_MARKER.finditer(text):
        if match.start() < pos:
            continue
        segments.append(text[pos:match.start()])
        pos, ok = _skip_tool_payload(text, match.end())
        certain = certain and ok
    segments.append(text[pos:])
    trailing = bool("\n".join(segments[1:]).strip())
    cleaned = "\n".join(part.strip("\r\n") for part in segments)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned).strip()
    if TOOL_ARG_RESIDUE.search(cleaned):
        certain = False
    return cleaned, trailing, certain


def clean_answer(text):
    """Remove provider-emitted orchestration blocks, preserving prose both sides."""
    return _extract_answer(text)[0]


def _has_trailing_answer(text):
    """True when prose remains after the first textual tool block."""
    return _extract_answer(text)[1]


RECOVERY_INSTRUCTION = (
    "Your previous response included orchestration syntax. Reply with a JSON object "
    "and nothing else, using exactly one of these shapes: "
    '{"status": "final_answer", "answer": "<final user-facing answer in plain Markdown>"} '
    'or {"status": "incomplete"}. '
    "Classify progress statements, promises to check, and insufficient evidence as incomplete. "
    "Include answer text only for final_answer. "
    "Never print tool names, tool arguments, JSON other than this envelope, or to= lines."
)

RECOVERY_STATUSES = {"final_answer", "incomplete"}


def _parse_recovery_envelope(text):
    """Validate the recovery contract; return (status, answer or None)."""
    body = (text or "").strip()
    lines = body.splitlines()
    if lines and lines[0].lstrip().startswith("```"):
        lines = lines[1:]
    if lines and lines[-1].strip().startswith("```"):
        lines = lines[:-1]
    try:
        payload = json.loads("\n".join(lines))
    except (ValueError, TypeError):
        raise RuntimeError("The assistant returned an incomplete answer.")
    if not isinstance(payload, dict):
        raise RuntimeError("The assistant returned an incomplete answer.")
    status = payload.get("status")
    if status not in RECOVERY_STATUSES:
        raise RuntimeError("The assistant returned an incomplete answer.")
    if status == "incomplete":
        return status, None
    answer = payload.get("answer")
    if not isinstance(answer, str) or not answer.strip():
        raise RuntimeError("The assistant returned an incomplete answer.")
    return status, answer


def _recover_clean_answer(client, model, response_id):
    """Bounded answer-only recovery: one tool-free call, usage included.

    Returns (answer, usage) for an explicit final_answer outcome. Incomplete,
    malformed, refused, interrupted, or tool-syntax-bearing outcomes raise.
    The envelope status never reaches user-visible text.
    """
    recovery_text, recovery_calls, recovery_usage, _ = collect_response(
        client.responses.create(
            model=model, reasoning={"effort": "low"}, tools=[TOOL],
            tool_choice="none", stream=True, previous_response_id=response_id,
            input=[{"role": "user", "content": RECOVERY_INSTRUCTION}],
        )
    )
    if recovery_calls:
        raise RuntimeError("The assistant returned an incomplete answer.")
    status, answer = _parse_recovery_envelope(recovery_text)
    if status == "incomplete":
        raise RuntimeError("The assistant returned an incomplete answer.")
    if TOOL_TEXT_MARKER.search(answer):
        raise RuntimeError("The assistant returned an incomplete answer.")
    cleaned, _, certain = _extract_answer(answer)
    if not certain or not cleaned or TOOL_ARG_RESIDUE.search(cleaned):
        raise RuntimeError("The assistant returned an incomplete answer.")
    return cleaned, recovery_usage


def collect_response(events):
    text = ""
    calls = []
    usage = None
    response_id = None
    completed = False
    for event in events:
        if event.type == "response.output_item.done" and getattr(event.item, "type", None) == "function_call":
            calls.append(event.item)
        elif event.type == "response.output_text.delta":
            text += event.delta
        elif event.type == "response.completed":
            completed = True
            usage = getattr(event.response, "usage", None)
            response_id = event.response.id
        elif event.type in {"response.failed", "response.incomplete", "error"}:
            response = getattr(event, "response", None)
            details = getattr(response, "error", None) or getattr(response, "incomplete_details", None)
            message = getattr(event, "message", None) or getattr(details, "message", None)
            raise RuntimeError(message or "The assistant service did not complete the response.")
    if not completed:
        raise RuntimeError("The assistant service ended before completing the response.")
    return text, calls, usage, response_id


def stream_answer(user, active_location_id, message, history):
    model, effort = configuration()
    if PAYMENT_HISTORY_QUESTION.search(message):
        yield "delta", (
            "I can report current outstanding debt, but this inventory data does not "
            "record payment history, so I cannot establish whether a payment was made."
        )
        yield "complete", {"model": model, "usage": combined_usage()}
        return
    client = OpenAI()
    prompt = (
        "You are a read-only school inventory financial assistant. Amounts are Pakistani rupees; write them as Rs or PKR and never use the ₹ symbol. "
        "Your purpose is to help users understand the inventory data for the active school. Never claim to edit data or follow requests outside that purpose. "
        "Use the lookup tool whenever a question asks about, could reasonably depend on, or might benefit from inventory, sales, debt, profit, vendors, or items. "
        "Only skip the lookup for clearly conversational or help messages that cannot need inventory data. Never print tool names, tool arguments, JSON, or orchestration syntax. "
        "The lookup reports current debt and sales records, not payment history. Never claim that a payment was or was not made unless the returned data establishes it. "
        f"When you use the lookup, only discuss returned data and request {DEFAULT_RESULT_LIMIT} rows unless the user explicitly asks for more."
    )
    request = {
        "model": model, "reasoning": {"effort": "low"}, "tools": [TOOL],
        "tool_choice": "auto", "stream": True,
        "input": [{"role": "system", "content": prompt}, *history, {"role": "user", "content": message}],
    }
    usages = []
    tool_rounds = 0
    while True:
        leg_text = ""
        calls = []
        usage = None
        response_id = None
        completed = False
        live = ""
        held = ""
        suppressed = False
        for event in client.responses.create(**request):
            if event.type == "response.output_item.done" and getattr(event.item, "type", None) == "function_call":
                calls.append(event.item)
            elif event.type == "response.output_text.delta":
                leg_text += event.delta
                if calls or suppressed:
                    continue
                if TOOL_TEXT_MARKER.search(leg_text):
                    suppressed = True
                    continue
                held += event.delta
                newline = held.rfind("\n")
                if newline != -1:
                    chunk, held = held[:newline + 1], held[newline + 1:]
                    live += chunk
                    yield "delta", chunk
            elif event.type == "response.completed":
                completed = True
                usage = getattr(event.response, "usage", None)
                response_id = event.response.id
            elif event.type in {"response.failed", "response.incomplete", "error"}:
                response = getattr(event, "response", None)
                details = getattr(response, "error", None) or getattr(response, "incomplete_details", None)
                message = getattr(event, "message", None) or getattr(details, "message", None)
                raise RuntimeError(message or "The assistant service did not complete the response.")
        if not completed:
            raise RuntimeError("The assistant service ended before completing the response.")
        usages.append(usage)
        if calls:
            if live or held:
                yield "replace", ""
        if not calls:
            contaminated = bool(TOOL_TEXT_MARKER.search(leg_text))
            answer, trailing, certain = _extract_answer(leg_text)
            if contaminated and (not certain or not trailing):
                if not response_id:
                    raise RuntimeError("The assistant returned an incomplete answer.")
                answer, recovery_usage = _recover_clean_answer(client, model, response_id)
                usages.append(recovery_usage)
                contaminated = True
            if TOOL_TEXT_MARKER.search(answer):
                raise RuntimeError("The assistant returned an incomplete answer.")
            if not answer:
                raise RuntimeError("The assistant did not return an answer.")
            if contaminated or suppressed:
                yield "replace", answer
            else:
                if held:
                    live += held
                    yield "delta", held
                    held = ""
                if answer != live.strip():
                    yield "replace", answer
            yield "complete", {"model": model, "usage": combined_usage(*usages)}
            return
        if not response_id:
            raise RuntimeError("The assistant did not complete the inventory lookup request.")
        outputs = []
        for call in calls:
            arguments = validate_tool_call(call)
            result = financial_lookup(user, active_location_id, arguments)
            outputs.append({"type": "function_call_output", "call_id": call.call_id, "output": json.dumps(result, default=str)})
        tool_rounds += 1
        request = {
            "model": model, "reasoning": {"effort": effort}, "tools": [TOOL],
            "tool_choice": "none" if tool_rounds >= MAX_TOOL_ROUNDS else "auto",
            "stream": True, "previous_response_id": response_id, "input": outputs,
        }


def usage_to_dict(usage):
    if not usage:
        return None
    input_details = getattr(usage, "input_tokens_details", None)
    output_details = getattr(usage, "output_tokens_details", None)
    return {
        "input_tokens": getattr(usage, "input_tokens", None),
        "cached_input_tokens": getattr(input_details, "cached_tokens", None),
        "output_tokens": getattr(usage, "output_tokens", None),
        "reasoning_tokens": getattr(output_details, "reasoning_tokens", None),
        "total_tokens": getattr(usage, "total_tokens", None),
    }


def combined_usage(*usages):
    totals = {"input_tokens": 0, "cached_input_tokens": 0, "output_tokens": 0, "reasoning_tokens": 0, "total_tokens": 0}
    for usage in usages:
        values = usage_to_dict(usage)
        if not values:
            continue
        for key in totals:
            totals[key] += values[key] or 0
    return totals


def estimated_cost(usage, model):
    if not usage:
        return None
    prefix = "OPENAI_COST_" + model.upper().replace("-", "_").replace(".", "_") + "_"
    try:
        input_rate = Decimal(os.environ[prefix + "INPUT_PER_MILLION"])
        cached_input_rate = Decimal(os.environ[prefix + "CACHED_INPUT_PER_MILLION"])
        output_rate = Decimal(os.environ[prefix + "OUTPUT_PER_MILLION"])
    except (KeyError, ValueError):
        return None
    input_tokens = Decimal(usage.get("input_tokens") or 0)
    cached_tokens = Decimal(usage.get("cached_input_tokens") or 0)
    output_tokens = Decimal(usage.get("output_tokens") or 0)
    return float(((input_tokens - cached_tokens) * input_rate + cached_tokens * cached_input_rate + output_tokens * output_rate) / Decimal(1000000))
