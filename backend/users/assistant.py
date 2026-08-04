import json
import os
from decimal import Decimal

from django.db.models import Sum
from items.models import ItemLocation, Order, Sale, Vendor
from openai import OpenAI

VALID_MODELS = {"gpt-5.6-luna", "gpt-5.6-terra", "gpt-5.6-sol"}
VALID_EFFORTS = {"none", "low", "medium", "high", "xhigh", "max"}
CHAT_HISTORY_LIMIT = 6
DEFAULT_RESULT_LIMIT = 10
MAX_RESULT_LIMIT = 25

TOOL = {
    "type": "function",
    "name": "financial_inventory_lookup",
    "description": "Look up authorised inventory financial data. Always use this before answering.",
    "strict": True,
    "parameters": {
        "type": "object", "additionalProperties": False,
        "required": ["query_type", "location_name", "vendor_name", "order_name", "limit"],
        "properties": {
            "query_type": {"type": "string", "enum": ["vendor_debt", "debt_summary", "unpaid_sales", "financial_summary", "profit_orders", "loss_making_orders"]},
            "location_name": {"type": ["string", "null"]},
            "vendor_name": {"type": ["string", "null"]},
            "order_name": {"type": ["string", "null"]},
            "limit": {"type": "integer", "minimum": 1, "maximum": MAX_RESULT_LIMIT},
        },
    },
}


def configuration():
    if not os.environ.get("OPENAI_API_KEY"):
        raise RuntimeError("OPENAI_API_KEY is not configured on the backend.")
    model = os.environ.get("OPENAI_MODEL", "gpt-5.6-luna")
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


def financial_lookup(user, active_location_id, arguments):
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
    kind = arguments["query_type"]
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


def stream_answer(user, active_location_id, message, history):
    model, effort = configuration()
    client = OpenAI()
    prompt = f"You are a read-only school inventory financial assistant. Amounts are rupees. Use the lookup tool before answering and only discuss returned data. Never claim to edit data. Request {DEFAULT_RESULT_LIMIT} rows unless the user explicitly asks for more."
    response = client.responses.create(model=model, reasoning={"effort": "low"}, tools=[TOOL], tool_choice="required", stream=True, input=[{"role": "system", "content": prompt}, *history, {"role": "user", "content": message}])
    calls = []
    lookup_usage = None
    lookup_response_id = None
    for event in response:
        if event.type == "response.output_item.done" and getattr(event.item, "type", None) == "function_call":
            calls.append(event.item)
        elif event.type == "response.completed":
            lookup_usage = getattr(event.response, "usage", None)
            lookup_response_id = event.response.id
        elif event.type == "error":
            raise RuntimeError(getattr(event, "message", "The assistant service returned an error."))
    if not calls:
        raise RuntimeError("The assistant did not request authorised inventory data.")
    outputs = []
    for call in calls:
        try:
            arguments = json.loads(call.arguments)
        except (TypeError, json.JSONDecodeError):
            raise RuntimeError("The assistant returned an invalid lookup request.")
        outputs.append({"type": "function_call_output", "call_id": call.call_id, "output": json.dumps(financial_lookup(user, active_location_id, arguments), default=str)})
    if not lookup_response_id:
        raise RuntimeError("The assistant did not complete the inventory lookup request.")
    final_stream = client.responses.create(model=model, reasoning={"effort": effort}, previous_response_id=lookup_response_id, stream=True, input=outputs)
    usage = None
    for event in final_stream:
        if event.type == "response.output_text.delta":
            yield "delta", event.delta
        elif event.type == "response.completed":
            usage = getattr(event.response, "usage", None)
    yield "complete", {"model": model, "usage": combined_usage(lookup_usage, usage)}


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
