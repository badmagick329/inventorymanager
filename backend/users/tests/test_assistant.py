import json
from decimal import Decimal
from types import SimpleNamespace

import pytest
from django.utils import timezone
from items.models import ItemLocation
from users.assistant import combined_usage, financial_lookup, stream_answer
from users.models import (
    AssistantConversation,
    AssistantDailyUsage,
    AssistantMessage,
)
from users.tests.factories import user_factory
from items.tests.factories import (
    item_location_factory,
    order_factory,
    sale_factory,
    vendor_factory,
)


def test_lookup_is_limited_to_active_school(
    user_factory, item_location_factory, vendor_factory, order_factory, sale_factory
):
    user, _ = user_factory()
    allowed = item_location_factory(name="FGS", users=[user])
    blocked = item_location_factory(name="FGHS")
    allowed_vendor, _ = vendor_factory(name="Ali", location=allowed)
    blocked_vendor, _ = vendor_factory(name="Ali", location=blocked)
    allowed_order = order_factory(name="Folder", location=allowed, user=user)
    blocked_order = order_factory(name="Folder", location=blocked, user=user)
    sale_factory(order=allowed_order, vendor=allowed_vendor, debt=Decimal("10"), user=user)
    sale_factory(order=blocked_order, vendor=blocked_vendor, debt=Decimal("99"), user=user)

    result = financial_lookup(user, allowed.id, {
        "query_type": "debt_summary", "location_name": None,
        "vendor_name": None, "order_name": None, "limit": 20,
    })

    assert result["total_due_rs"] == Decimal("10")
    assert result["outstanding_debt"] == [{
        "vendor__name": "Ali", "order__location__name": "FGS",
        "due_rs": Decimal("10"),
    }]


def test_combined_usage_includes_lookup_and_answer_requests():
    lookup = SimpleNamespace(
        input_tokens=10,
        output_tokens=4,
        total_tokens=14,
        input_tokens_details=SimpleNamespace(cached_tokens=3),
        output_tokens_details=SimpleNamespace(reasoning_tokens=2),
    )
    answer = SimpleNamespace(
        input_tokens=6,
        output_tokens=8,
        total_tokens=14,
        input_tokens_details=SimpleNamespace(cached_tokens=1),
        output_tokens_details=SimpleNamespace(reasoning_tokens=5),
    )

    assert combined_usage(lookup, answer) == {
        "input_tokens": 16,
        "cached_input_tokens": 4,
        "output_tokens": 12,
        "reasoning_tokens": 7,
        "total_tokens": 28,
    }


def test_greeting_uses_one_low_reasoning_call_without_inventory_lookup(monkeypatch):
    usage = SimpleNamespace(
        input_tokens=10,
        output_tokens=4,
        total_tokens=14,
        input_tokens_details=SimpleNamespace(cached_tokens=0),
        output_tokens_details=SimpleNamespace(reasoning_tokens=0),
    )
    requests = []

    class FakeResponses:
        def create(self, **kwargs):
            requests.append(kwargs)
            return iter((
                SimpleNamespace(type="response.output_text.delta", delta="Hi! How can I help?"),
                SimpleNamespace(type="response.completed", response=SimpleNamespace(id="response-1", usage=usage)),
            ))

    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.OpenAI", lambda: SimpleNamespace(responses=FakeResponses()))

    assert list(stream_answer(None, 1, "hi", [])) == [
        ("delta", "Hi! How can I help?"),
        ("complete", {"model": "gpt-5.6-luna", "usage": combined_usage(usage)}),
    ]
    assert requests[0]["tool_choice"] == "auto"
    assert requests[0]["reasoning"] == {"effort": "low"}
    assert "Pakistani rupees" in requests[0]["input"][0]["content"]
    assert "never use the ₹ symbol" in requests[0]["input"][0]["content"]


def provider_usage(tokens=10):
    return SimpleNamespace(
        input_tokens=tokens,
        output_tokens=2,
        total_tokens=tokens + 2,
        input_tokens_details=SimpleNamespace(cached_tokens=0),
        output_tokens_details=SimpleNamespace(reasoning_tokens=0),
    )


def completed(response_id, usage=None):
    return SimpleNamespace(
        type="response.completed",
        response=SimpleNamespace(id=response_id, usage=usage or provider_usage()),
    )


def recovery_final(answer):
    return SimpleNamespace(
        type="response.output_text.delta",
        delta=json.dumps({"status": "final_answer", "answer": answer}),
    )


def recovery_incomplete(note="Checking debt now!"):
    return SimpleNamespace(
        type="response.output_text.delta",
        delta=json.dumps({"status": "incomplete", "answer": note}),
    )


def tool_call(arguments, call_id="call-1", name="financial_inventory_lookup"):
    return SimpleNamespace(
        type="response.output_item.done",
        item=SimpleNamespace(
            type="function_call", name=name, call_id=call_id,
            arguments=json.dumps(arguments),
        ),
    )


def valid_arguments(**overrides):
    arguments = {
        "query_type": "debt_summary", "location_name": None,
        "vendor_name": None, "order_name": None, "limit": 10,
    }
    arguments.update(overrides)
    return arguments


def assembled_text(events):
    text = ""
    for kind, data in events:
        if kind == "delta":
            text += data
        elif kind == "replace":
            text = data
    return text


def test_structured_tool_calls_and_results_never_reach_answer(monkeypatch, user_factory, item_location_factory):
    user, _ = user_factory()
    location = item_location_factory(name="FGS", users=[user])
    requests = []
    streams = [
        iter((
            SimpleNamespace(type="response.output_text.delta", delta="I will check.\n"),
            tool_call(valid_arguments()), completed("lookup-1"),
        )),
        iter((
            SimpleNamespace(type="response.output_text.delta", delta="No debt is currently recorded."),
            completed("answer-1"),
        )),
    ]

    class FakeResponses:
        def create(self, **kwargs):
            requests.append(kwargs)
            return streams.pop(0)

    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.OpenAI", lambda: SimpleNamespace(responses=FakeResponses()))

    events = list(stream_answer(user, location.id, "Who owes money?", []))

    assert assembled_text(events) == "No debt is currently recorded."
    assert "I will check" not in assembled_text(events)
    assert requests[1]["previous_response_id"] == "lookup-1"
    assert requests[1]["input"][0]["type"] == "function_call_output"
    assert "total_due_rs" in requests[1]["input"][0]["output"]


def test_textual_tool_syntax_split_across_provider_chunks_is_removed(monkeypatch):
    streams = [
        iter((
            SimpleNamespace(type="response.output_text.delta", delta="FGS has Rs 10 due.\nto=func"),
            SimpleNamespace(type="response.output_text.delta", delta="tions.financial_inventory_lookup code:\n"),
            SimpleNamespace(type="response.output_text.delta", delta='{"query_type":"orders"}'),
            completed("response-1", provider_usage(10)),
        )),
        iter((
            recovery_final("FGS has Rs 10 due from Ali."),
            completed("response-2", provider_usage(6)),
        )),
    ]
    requests = []
    def fake_create(**kwargs):
        requests.append(kwargs)
        return streams.pop(0)
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.OpenAI", lambda: SimpleNamespace(responses=SimpleNamespace(create=fake_create)))

    events = list(stream_answer(None, 1, "hello", []))

    assert assembled_text(events) == "FGS has Rs 10 due from Ali."
    assert "to=" not in assembled_text(events)
    assert len(requests) == 2
    assert requests[1]["tool_choice"] == "none"
    assert events[-1][1]["usage"]["input_tokens"] == 16


def test_clean_answer_streams_live_lines_before_tool_syntax(monkeypatch):
    streams = [
        iter((
            SimpleNamespace(type="response.output_text.delta", delta="FGS has Rs 10 due.\nto=func"),
            SimpleNamespace(type="response.output_text.delta", delta="tions.financial_inventory_lookup code:\n"),
            SimpleNamespace(type="response.output_text.delta", delta='{"query_type":"orders"}'),
            completed("response-1"),
        )),
        iter((
            recovery_final("FGS has Rs 10 due from Ali."),
            completed("response-2"),
        )),
    ]
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.OpenAI", lambda: SimpleNamespace(responses=SimpleNamespace(create=lambda **kwargs: streams.pop(0))))

    events = list(stream_answer(None, 1, "hello", []))

    assert events[0] == ("delta", "FGS has Rs 10 due.\n")
    assert assembled_text(events) == "FGS has Rs 10 due from Ali."


def test_preamble_tool_then_answer_recovers_complete_answer(monkeypatch):
    streams = [iter((
        SimpleNamespace(type="response.output_text.delta", delta="Checking debt now.\nto=func"),
        SimpleNamespace(type="response.output_text.delta", delta="tions.financial_inventory_lookup code:\n"),
        SimpleNamespace(type="response.output_text.delta", delta='{"query_type":"debt_summary","location_name":null,"vendor_name":null,"order_name":null,"limit":10}\n'),
        SimpleNamespace(type="response.output_text.delta", delta="FGS has Rs 10 due from Ali."),
        completed("response-1", provider_usage(10)),
    ))]
    requests = []
    def fake_create(**kwargs):
        requests.append(kwargs)
        return streams.pop(0)
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.OpenAI", lambda: SimpleNamespace(responses=SimpleNamespace(create=fake_create)))

    events = list(stream_answer(None, 1, "Who owes money?", []))

    assert events[0] == ("delta", "Checking debt now.\n")
    assert "FGS has Rs 10 due from Ali." in assembled_text(events)
    assert "to=" not in assembled_text(events)
    assert "query_type" not in assembled_text(events)
    assert len(requests) == 1
    assert events[-1][0] == "complete"
    assert events[-1][1]["usage"]["input_tokens"] == 10


def test_preamble_tool_without_answer_uses_bounded_recovery(monkeypatch):
    streams = [
        iter((
            SimpleNamespace(type="response.output_text.delta", delta="Checking debt now.\nto=functions.financial_inventory_lookup:\n"),
            SimpleNamespace(type="response.output_text.delta", delta='{"query_type":"debt_summary"}'),
            completed("response-1", provider_usage(10)),
        )),
        iter((
            recovery_final("FGS has Rs 10 due from Ali."),
            completed("response-2", provider_usage(6)),
        )),
    ]
    requests = []
    def fake_create(**kwargs):
        requests.append(kwargs)
        return streams.pop(0)
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.OpenAI", lambda: SimpleNamespace(responses=SimpleNamespace(create=fake_create)))

    events = list(stream_answer(None, 1, "Who owes money?", []))

    assert assembled_text(events) == "FGS has Rs 10 due from Ali."
    assert ("replace", "FGS has Rs 10 due from Ali.") in events
    assert len(requests) == 2
    assert requests[1]["tool_choice"] == "none"
    assert requests[1]["previous_response_id"] == "response-1"
    assert events[-1][0] == "complete"
    assert events[-1][1]["usage"]["input_tokens"] == 16


def test_preamble_tool_without_answer_and_failed_recovery_raises(monkeypatch):
    streams = [
        iter((
            SimpleNamespace(type="response.output_text.delta", delta="Checking…\nto=functions.financial_inventory_lookup:\n"),
            SimpleNamespace(type="response.output_text.delta", delta='{"query_type":"debt_summary"}'),
            completed("response-1", provider_usage(10)),
        )),
        iter((
            SimpleNamespace(type="response.output_text.delta", delta=""),
            completed("response-2", provider_usage(6)),
        )),
    ]
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.OpenAI", lambda: SimpleNamespace(responses=SimpleNamespace(create=lambda **kwargs: streams.pop(0))))

    with pytest.raises(RuntimeError, match="incomplete answer"):
        list(stream_answer(None, 1, "Who owes money?", []))


def test_malformed_multiline_tool_payload_recovers_without_leaking_arguments(monkeypatch):
    streams = [
        iter((
            SimpleNamespace(type="response.output_text.delta", delta="Checking debt.\n"),
            SimpleNamespace(type="response.output_text.delta", delta="to=functions.financial_inventory_lookup code:\n"),
            SimpleNamespace(type="response.output_text.delta", delta='{\n"query_type":"orders",\n"location_name":"FGS",\n}\n'),
            SimpleNamespace(type="response.output_text.delta", delta="FGS has Rs 10 due."),
            completed("response-1", provider_usage(10)),
        )),
    ]
    requests = []
    def fake_create(**kwargs):
        requests.append(kwargs)
        return streams.pop(0)
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.OpenAI", lambda: SimpleNamespace(responses=SimpleNamespace(create=fake_create)))

    events = list(stream_answer(None, 1, "What is due?", []))

    assert "FGS has Rs 10 due." in assembled_text(events)
    assert '"query_type"' not in assembled_text(events)
    assert '"location_name"' not in assembled_text(events)
    assert "to=" not in assembled_text(events)
    assert len(requests) == 1
    assert events[-1][1]["usage"]["input_tokens"] == 10


def test_truncated_tool_payload_uses_bounded_recovery(monkeypatch):
    streams = [
        iter((
            SimpleNamespace(type="response.output_text.delta", delta="Checking debt.\n"),
            SimpleNamespace(type="response.output_text.delta", delta="to=functions.financial_inventory_lookup code:\n"),
            SimpleNamespace(type="response.output_text.delta", delta='{\n"query_type":"orders",\n'),
            completed("response-1", provider_usage(10)),
        )),
        iter((
            recovery_final("FGS has Rs 10 due."),
            completed("response-2", provider_usage(6)),
        )),
    ]
    requests = []
    def fake_create(**kwargs):
        requests.append(kwargs)
        return streams.pop(0)
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.OpenAI", lambda: SimpleNamespace(responses=SimpleNamespace(create=fake_create)))

    events = list(stream_answer(None, 1, "What is due?", []))

    assert assembled_text(events) == "FGS has Rs 10 due."
    assert '"query_type"' not in assembled_text(events)
    assert len(requests) == 2
    assert requests[1]["tool_choice"] == "none"
    assert events[-1][1]["usage"]["input_tokens"] == 16


def test_consecutive_tool_blocks_with_trailing_answer(monkeypatch):
    streams = [iter((
        SimpleNamespace(type="response.output_text.delta", delta="Checking debt.\n"),
        SimpleNamespace(type="response.output_text.delta", delta="to=functions.financial_inventory_lookup code:\n"),
        SimpleNamespace(type="response.output_text.delta", delta='{"query_type":"debt_summary","location_name":null,"vendor_name":null,"order_name":null,"limit":10}\n'),
        SimpleNamespace(type="response.output_text.delta", delta="to=functions.financial_inventory_lookup code:\n"),
        SimpleNamespace(type="response.output_text.delta", delta='{"query_type":"vendor_debt","location_name":null,"vendor_name":null,"order_name":null,"limit":10}\n'),
        SimpleNamespace(type="response.output_text.delta", delta="FGS has Rs 10 due from Ali."),
        completed("response-1", provider_usage(10)),
    ))]
    requests = []
    def fake_create(**kwargs):
        requests.append(kwargs)
        return streams.pop(0)
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.OpenAI", lambda: SimpleNamespace(responses=SimpleNamespace(create=fake_create)))

    events = list(stream_answer(None, 1, "Who owes money?", []))

    assert "FGS has Rs 10 due from Ali." in assembled_text(events)
    assert "to=" not in assembled_text(events)
    assert "query_type" not in assembled_text(events)
    assert len(requests) == 1
    assert events[-1][1]["usage"]["input_tokens"] == 10


def test_consecutive_fenced_tool_blocks_with_trailing_answer(monkeypatch):
    streams = [iter((
        SimpleNamespace(type="response.output_text.delta", delta="Checking debt now.\n"),
        SimpleNamespace(type="response.output_text.delta", delta="to=functions.financial_inventory_lookup code:\n"),
        SimpleNamespace(type="response.output_text.delta", delta='```json\n{"query_type":"debt_summary"}\n```\n'),
        SimpleNamespace(type="response.output_text.delta", delta="to=functions.financial_inventory_lookup code:\n"),
        SimpleNamespace(type="response.output_text.delta", delta='```json\n{"query_type":"vendor_debt"}\n```\n'),
        SimpleNamespace(type="response.output_text.delta", delta="FGS has Rs 10 due from Ali."),
        completed("response-1", provider_usage(10)),
    ))]
    requests = []
    def fake_create(**kwargs):
        requests.append(kwargs)
        return streams.pop(0)
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.OpenAI", lambda: SimpleNamespace(responses=SimpleNamespace(create=fake_create)))

    events = list(stream_answer(None, 1, "Who owes money?", []))

    assert events[0] == ("delta", "Checking debt now.\n")
    assert "FGS has Rs 10 due from Ali." in assembled_text(events)
    assert "to=" not in assembled_text(events)
    assert "query_type" not in assembled_text(events)
    assert "```" not in assembled_text(events)
    assert len(requests) == 1
    assert events[-1][0] == "complete"
    assert events[-1][1]["usage"]["input_tokens"] == 10


def test_preamble_only_recovery_raises(monkeypatch):
    streams = [
        iter((
            SimpleNamespace(type="response.output_text.delta", delta="Checking debt now.\n"),
            SimpleNamespace(type="response.output_text.delta", delta="to=functions.financial_inventory_lookup code:\n"),
            SimpleNamespace(type="response.output_text.delta", delta='{"query_type":"debt_summary"}'),
            completed("response-1", provider_usage(10)),
        )),
        iter((
            SimpleNamespace(type="response.output_text.delta", delta="Checking debt now."),
            completed("response-2", provider_usage(6)),
        )),
    ]
    requests = []
    def fake_create(**kwargs):
        requests.append(kwargs)
        return streams.pop(0)
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.OpenAI", lambda: SimpleNamespace(responses=SimpleNamespace(create=fake_create)))

    with pytest.raises(RuntimeError, match="incomplete answer"):
        list(stream_answer(None, 1, "Who owes money?", []))
    assert len(requests) == 2
    assert requests[1]["tool_choice"] == "none"


def test_explicit_incomplete_recovery_with_paraphrased_preamble_raises(monkeypatch):
    streams = [
        iter((
            SimpleNamespace(type="response.output_text.delta", delta="Checking debt now.\n"),
            SimpleNamespace(type="response.output_text.delta", delta="to=functions.financial_inventory_lookup code:\n"),
            SimpleNamespace(type="response.output_text.delta", delta='{"query_type":"debt_summary"}'),
            completed("response-1", provider_usage(10)),
        )),
        iter((
            recovery_incomplete("Checking debt now!"),
            completed("response-2", provider_usage(6)),
        )),
    ]
    requests = []
    def fake_create(**kwargs):
        requests.append(kwargs)
        return streams.pop(0)
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.OpenAI", lambda: SimpleNamespace(responses=SimpleNamespace(create=fake_create)))

    with pytest.raises(RuntimeError, match="incomplete answer"):
        list(stream_answer(None, 1, "Who owes money?", []))
    assert len(requests) == 2
    assert requests[1]["tool_choice"] == "none"


def test_valid_final_answer_recovery_keeps_status_internal(monkeypatch):
    streams = [
        iter((
            SimpleNamespace(type="response.output_text.delta", delta="Checking debt now.\n"),
            SimpleNamespace(type="response.output_text.delta", delta="to=functions.financial_inventory_lookup code:\n"),
            SimpleNamespace(type="response.output_text.delta", delta='{"query_type":"debt_summary"}'),
            completed("response-1", provider_usage(10)),
        )),
        iter((
            recovery_final("FGS has Rs 10 due from Ali."),
            completed("response-2", provider_usage(6)),
        )),
    ]
    requests = []
    def fake_create(**kwargs):
        requests.append(kwargs)
        return streams.pop(0)
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.OpenAI", lambda: SimpleNamespace(responses=SimpleNamespace(create=fake_create)))

    events = list(stream_answer(None, 1, "Who owes money?", []))

    assert assembled_text(events) == "FGS has Rs 10 due from Ali."
    assert "final_answer" not in assembled_text(events)
    assert '"status"' not in assembled_text(events)
    assert len(requests) == 2
    assert events[-1][0] == "complete"
    assert events[-1][1]["usage"]["input_tokens"] == 16


def test_invalid_recovery_structure_raises(monkeypatch):
    streams = [
        iter((
            SimpleNamespace(type="response.output_text.delta", delta="Checking debt now.\n"),
            SimpleNamespace(type="response.output_text.delta", delta="to=functions.financial_inventory_lookup code:\n"),
            SimpleNamespace(type="response.output_text.delta", delta='{"query_type":"debt_summary"}'),
            completed("response-1", provider_usage(10)),
        )),
        iter((
            SimpleNamespace(
                type="response.output_text.delta",
                delta=json.dumps({"status": "done", "answer": "FGS has Rs 10 due."}),
            ),
            completed("response-2", provider_usage(6)),
        )),
    ]
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.OpenAI", lambda: SimpleNamespace(responses=SimpleNamespace(create=lambda **kwargs: streams.pop(0))))

    with pytest.raises(RuntimeError, match="incomplete answer"):
        list(stream_answer(None, 1, "Who owes money?", []))


def test_refused_recovery_raises(monkeypatch):
    streams = [
        iter((
            SimpleNamespace(type="response.output_text.delta", delta="Checking debt now.\n"),
            SimpleNamespace(type="response.output_text.delta", delta="to=functions.financial_inventory_lookup code:\n"),
            SimpleNamespace(type="response.output_text.delta", delta='{"query_type":"debt_summary"}'),
            completed("response-1", provider_usage(10)),
        )),
        iter((
            SimpleNamespace(
                type="response.output_item.done",
                item=SimpleNamespace(type="refusal", refusal="I cannot help with that."),
            ),
            completed("response-2", provider_usage(6)),
        )),
    ]
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.OpenAI", lambda: SimpleNamespace(responses=SimpleNamespace(create=lambda **kwargs: streams.pop(0))))

    with pytest.raises(RuntimeError, match="incomplete answer"):
        list(stream_answer(None, 1, "Who owes money?", []))


def test_preamble_with_currency_still_requires_recovery(monkeypatch):
    streams = [
        iter((
            SimpleNamespace(type="response.output_text.delta", delta="I will check the balance in Rs.\n"),
            SimpleNamespace(type="response.output_text.delta", delta="to=functions.financial_inventory_lookup code:\n"),
            SimpleNamespace(type="response.output_text.delta", delta='{"query_type":"debt_summary","location_name":null,"vendor_name":null,"order_name":null,"limit":10}'),
            completed("response-1", provider_usage(10)),
        )),
        iter((
            recovery_final("FGS has Rs 10 due from Ali."),
            completed("response-2", provider_usage(6)),
        )),
    ]
    requests = []
    def fake_create(**kwargs):
        requests.append(kwargs)
        return streams.pop(0)
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.OpenAI", lambda: SimpleNamespace(responses=SimpleNamespace(create=fake_create)))

    events = list(stream_answer(None, 1, "What is due?", []))

    assert assembled_text(events) == "FGS has Rs 10 due from Ali."
    assert len(requests) == 2
    assert events[-1][1]["usage"]["input_tokens"] == 16


def test_recovery_containing_orchestration_raises(monkeypatch):
    streams = [
        iter((
            SimpleNamespace(type="response.output_text.delta", delta="Checking…\nto=functions.financial_inventory_lookup:\n"),
            SimpleNamespace(type="response.output_text.delta", delta='{"query_type":"debt_summary"}'),
            completed("response-1", provider_usage(10)),
        )),
        iter((
            SimpleNamespace(type="response.output_text.delta", delta="Checking debt now.\nto=functions.financial_inventory_lookup:\n"),
            SimpleNamespace(type="response.output_text.delta", delta='{"query_type":"debt_summary"}'),
            completed("response-2", provider_usage(6)),
        )),
    ]
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.OpenAI", lambda: SimpleNamespace(responses=SimpleNamespace(create=lambda **kwargs: streams.pop(0))))

    with pytest.raises(RuntimeError, match="incomplete answer"):
        list(stream_answer(None, 1, "Who owes money?", []))


def test_unsupported_tool_arguments_fail_before_lookup(monkeypatch):
    streams = [iter((tool_call(valid_arguments(query_type="orders")), completed("lookup-1")))]
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.OpenAI", lambda: SimpleNamespace(responses=SimpleNamespace(create=lambda **kwargs: streams.pop(0))))

    with pytest.raises(RuntimeError, match="unsupported inventory query"):
        list(stream_answer(None, 1, "Show orders", []))


def test_payment_history_question_does_not_infer_payment_status(monkeypatch):
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr(
        "users.assistant.OpenAI",
        lambda: pytest.fail("Payment-history questions must not reach the provider."),
    )

    events = list(stream_answer(None, 1, "Has Ali paid for the folders?", []))

    assert "cannot establish whether a payment was made" in events[0][1]
    assert events[1][1]["usage"]["total_tokens"] == 0


def test_follow_up_tool_call_is_handled_then_answer_stage_is_forced(monkeypatch, user_factory, item_location_factory):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    requests = []
    streams = [
        iter((tool_call(valid_arguments(), "call-1"), completed("lookup-1"))),
        iter((tool_call(valid_arguments(query_type="financial_summary"), "call-2"), completed("lookup-2"))),
        iter((SimpleNamespace(type="response.output_text.delta", delta="There is no recorded debt."), completed("answer-1"))),
    ]

    class FakeResponses:
        def create(self, **kwargs):
            requests.append(kwargs)
            return streams.pop(0)

    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.OpenAI", lambda: SimpleNamespace(responses=FakeResponses()))

    assert list(stream_answer(user, location.id, "Summarise finances", []))[0][1] == "There is no recorded debt."
    assert requests[1]["tool_choice"] == "auto"
    assert requests[2]["tool_choice"] == "none"


def test_follow_up_failure_does_not_return_first_stage_text(monkeypatch, user_factory, item_location_factory):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    streams = [
        iter((SimpleNamespace(type="response.output_text.delta", delta="Checking…"), tool_call(valid_arguments()), completed("lookup-1"))),
        iter((SimpleNamespace(type="response.failed", response=SimpleNamespace(error=SimpleNamespace(message="Provider failed"))),)),
    ]
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.OpenAI", lambda: SimpleNamespace(responses=SimpleNamespace(create=lambda **kwargs: streams.pop(0))))

    with pytest.raises(RuntimeError, match="Provider failed"):
        list(stream_answer(user, location.id, "Who owes money?", []))


def test_debt_summary_totals_all_debt_but_limits_returned_rows(
    user_factory, item_location_factory, vendor_factory, order_factory, sale_factory
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    first_vendor, _ = vendor_factory(name="First", location=location)
    second_vendor, _ = vendor_factory(name="Second", location=location)
    first_order = order_factory(name="First item", location=location, user=user)
    second_order = order_factory(name="Second item", location=location, user=user)
    sale_factory(order=first_order, vendor=first_vendor, debt=Decimal("10"), user=user)
    sale_factory(order=second_order, vendor=second_vendor, debt=Decimal("20"), user=user)

    result = financial_lookup(user, location.id, {
        "query_type": "debt_summary", "location_name": None,
        "vendor_name": None, "order_name": None, "limit": 1,
    })

    assert result["total_due_rs"] == Decimal("30")
    assert result["outstanding_debt"] == [{
        "vendor__name": "Second", "order__location__name": location.name,
        "due_rs": Decimal("20"),
    }]


def test_user_cannot_load_another_users_conversation(
    api_client, user_factory, item_location_factory
):
    owner, _ = user_factory(username="owner")
    other, _ = user_factory(username="other")
    location = item_location_factory(users=[owner, other])
    conversation = AssistantConversation.objects.create(user=owner, location=location)
    AssistantMessage.objects.create(conversation=conversation, role="user", content="private")
    api_client.force_authenticate(other)

    response = api_client.get(
        f"/api/users/assistant?location_id={location.id}&conversation_id={conversation.id}"
    )

    assert response.status_code == 200
    assert response.json()["conversationId"] is None
    assert response.json()["messages"] == []


def test_assistant_rejects_inaccessible_school(api_client, user_factory, item_location_factory):
    user, _ = user_factory()
    location = item_location_factory()
    api_client.force_authenticate(user)

    response = api_client.post(
        "/api/users/assistant/messages",
        {"locationId": location.id, "message": "Who owes money?"}, format="json",
    )

    assert response.status_code == 400


def test_quota_rejects_the_fifty_first_request(
    api_client, monkeypatch, user_factory, item_location_factory
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    AssistantDailyUsage.objects.create(user=user, date=timezone.localdate(), requests=50)
    monkeypatch.setattr("users.views.configuration", lambda: ("gpt-5.6-luna", "high"))
    api_client.force_authenticate(user)

    response = api_client.post(
        "/api/users/assistant/messages",
        {"locationId": location.id, "message": "Who owes money?"}, format="json",
    )

    assert response.status_code == 429
    assert response.json()["quota"]["remaining"] == 0


def test_sse_emits_delta_and_complete(
    api_client, monkeypatch, user_factory, item_location_factory
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    monkeypatch.setattr("users.views.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr(
        "users.views.stream_answer",
        lambda *args: iter((("delta", "Hello"), ("complete", {"model": "gpt-5.6-luna", "usage": {"total_tokens": 2}}))),
    )
    api_client.force_authenticate(user)

    response = api_client.post(
        "/api/users/assistant/messages",
        {"locationId": location.id, "message": "Hello"}, format="json",
        HTTP_X_FORWARDED_FOR="203.0.113.10, 10.0.0.1",
        HTTP_USER_AGENT="Inventory Assistant test browser",
    )
    body = b"".join(response.streaming_content).decode()

    assert response["Content-Type"] == "text/event-stream"
    assert "event: delta" in body
    assert "event: complete" in body
    assert "Hello" in body
    assert AssistantConversation.objects.get().user_id == user.id
    request_message = AssistantMessage.objects.get(conversation__user=user, role="user")
    assert request_message.client_ip == "203.0.113.10"
    assert request_message.user_agent == "Inventory Assistant test browser"
    assert AssistantMessage.objects.get(
        conversation__user=user, role="assistant"
    ).content == "Hello"


def test_sse_accepts_event_stream_accept_header(
    api_client, monkeypatch, user_factory, item_location_factory
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    monkeypatch.setattr("users.views.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr(
        "users.views.stream_answer",
        lambda *args: iter((("delta", "Hello"), ("complete", {"model": "gpt-5.6-luna", "usage": {"total_tokens": 2}}))),
    )
    api_client.force_authenticate(user)

    response = api_client.post(
        "/api/users/assistant/messages",
        {"locationId": location.id, "message": "Hello"}, format="json",
        HTTP_ACCEPT="text/event-stream",
    )
    body = b"".join(response.streaming_content).decode()

    assert response.status_code == 200
    assert response["Content-Type"] == "text/event-stream"
    assert "event: delta" in body
    assert "Hello" in body


def test_sse_and_history_only_receive_clean_provider_answer(
    api_client, monkeypatch, user_factory, item_location_factory
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    streams = [
        iter((
            SimpleNamespace(type="response.output_text.delta", delta="FGS has Rs 10 due.\nto=func"),
            SimpleNamespace(type="response.output_text.delta", delta="tions.financial_inventory_lookup code:\n"),
            SimpleNamespace(type="response.output_text.delta", delta='{"query_type":"orders"}'),
            completed("answer-1"),
        )),
        iter((
            recovery_final("FGS has Rs 10 due from Ali."),
            completed("answer-2"),
        )),
    ]
    monkeypatch.setattr("users.views.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr(
        "users.assistant.OpenAI",
        lambda: SimpleNamespace(responses=SimpleNamespace(create=lambda **kwargs: streams.pop(0))),
    )
    api_client.force_authenticate(user)

    response = api_client.post(
        "/api/users/assistant/messages",
        {"locationId": location.id, "message": "What is due?"}, format="json",
    )
    body = b"".join(response.streaming_content).decode()

    assert "event: replace" in body
    assert "FGS has Rs 10 due from Ali." in body
    assert "to=functions" not in body
    assert '"query_type"' not in body
    saved = AssistantMessage.objects.get(conversation__user=user, role="assistant")
    assert saved.content == "FGS has Rs 10 due from Ali."


def test_sse_and_history_recover_answer_after_preamble_tool_block(
    api_client, monkeypatch, user_factory, item_location_factory
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    events = iter((
        SimpleNamespace(type="response.output_text.delta", delta="Checking debt now.\nto=func"),
        SimpleNamespace(type="response.output_text.delta", delta="tions.financial_inventory_lookup code:\n"),
        SimpleNamespace(type="response.output_text.delta", delta='{"query_type":"debt_summary"}\n'),
        SimpleNamespace(type="response.output_text.delta", delta="FGS has Rs 10 due from Ali."),
        completed("answer-1"),
    ))
    monkeypatch.setattr("users.views.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr(
        "users.assistant.OpenAI",
        lambda: SimpleNamespace(responses=SimpleNamespace(create=lambda **kwargs: events)),
    )
    api_client.force_authenticate(user)

    response = api_client.post(
        "/api/users/assistant/messages",
        {"locationId": location.id, "message": "What is due?"}, format="json",
    )
    body = b"".join(response.streaming_content).decode()

    assert "FGS has Rs 10 due from Ali." in body
    assert "to=functions" not in body
    assert '"query_type"' not in body
    saved = AssistantMessage.objects.get(conversation__user=user, role="assistant")
    assert "FGS has Rs 10 due from Ali." in saved.content
    assert "to=" not in saved.content
    assert '"query_type"' not in saved.content


def test_sse_malformed_payload_recovers_without_leaking_arguments(
    api_client, monkeypatch, user_factory, item_location_factory
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    streams = [
        iter((
            SimpleNamespace(type="response.output_text.delta", delta="Checking debt.\n"),
            SimpleNamespace(type="response.output_text.delta", delta="to=functions.financial_inventory_lookup code:\n"),
            SimpleNamespace(type="response.output_text.delta", delta='{\n"query_type":"orders",\n'),
            completed("answer-1"),
        )),
        iter((
            recovery_final("FGS has Rs 10 due."),
            completed("answer-2"),
        )),
    ]
    monkeypatch.setattr("users.views.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr(
        "users.assistant.OpenAI",
        lambda: SimpleNamespace(responses=SimpleNamespace(create=lambda **kwargs: streams.pop(0))),
    )
    api_client.force_authenticate(user)

    response = api_client.post(
        "/api/users/assistant/messages",
        {"locationId": location.id, "message": "What is due?"}, format="json",
    )
    body = b"".join(response.streaming_content).decode()

    assert "FGS has Rs 10 due." in body
    assert '"query_type"' not in body
    assert "to=functions" not in body
    assert "final_answer" not in body
    assert '"status"' not in body
    saved = AssistantMessage.objects.get(conversation__user=user, role="assistant")
    assert saved.content == "FGS has Rs 10 due."
    assert '"query_type"' not in saved.content
    assert "final_answer" not in saved.content


def test_sse_consecutive_tool_blocks_resolve_to_trailing_answer(
    api_client, monkeypatch, user_factory, item_location_factory
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    streams = [iter((
        SimpleNamespace(type="response.output_text.delta", delta="Checking debt.\n"),
        SimpleNamespace(type="response.output_text.delta", delta="to=functions.financial_inventory_lookup code:\n"),
        SimpleNamespace(type="response.output_text.delta", delta='{"query_type":"debt_summary","location_name":null,"vendor_name":null,"order_name":null,"limit":10}\n'),
        SimpleNamespace(type="response.output_text.delta", delta="to=functions.financial_inventory_lookup code:\n"),
        SimpleNamespace(type="response.output_text.delta", delta='{"query_type":"vendor_debt","location_name":null,"vendor_name":null,"order_name":null,"limit":10}\n'),
        SimpleNamespace(type="response.output_text.delta", delta="FGS has Rs 10 due from Ali."),
        completed("answer-1"),
    ))]
    monkeypatch.setattr("users.views.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr(
        "users.assistant.OpenAI",
        lambda: SimpleNamespace(responses=SimpleNamespace(create=lambda **kwargs: streams.pop(0))),
    )
    api_client.force_authenticate(user)

    response = api_client.post(
        "/api/users/assistant/messages",
        {"locationId": location.id, "message": "What is due?"}, format="json",
    )
    body = b"".join(response.streaming_content).decode()

    assert "event: complete" in body
    assert "event: error" not in body
    assert "FGS has Rs 10 due from Ali." in body
    assert "to=functions" not in body
    assert '"query_type"' not in body
    saved = AssistantMessage.objects.get(conversation__user=user, role="assistant")
    assert "FGS has Rs 10 due from Ali." in saved.content
    assert "to=" not in saved.content


def _fenced_consecutive_deltas(newline):
    args = '"query_type":"debt_summary","location_name":null,"vendor_name":null,"order_name":null,"limit":10'
    second = args.replace("debt_summary", "vendor_debt")
    parts = [
        "Checking debt now." + newline,
        "to=functions.financial_inventory_lookup code:" + newline,
        "```json" + newline + "{" + args + "}" + newline + "```" + newline,
        "to=functions.financial_inventory_lookup code:" + newline,
        "```json" + newline + "{" + second + "}" + newline + "```" + newline,
        "FGS has Rs 10 due from Ali.",
    ]
    return [
        SimpleNamespace(type="response.output_text.delta", delta=parts[0]),
        SimpleNamespace(type="response.output_text.delta", delta=parts[1] + parts[2]),
        SimpleNamespace(type="response.output_text.delta", delta=parts[3] + parts[4]),
        SimpleNamespace(type="response.output_text.delta", delta=parts[5]),
        completed("answer-1"),
    ]


def test_sse_consecutive_fenced_blocks_resolve_to_trailing_answer(
    api_client, monkeypatch, user_factory, item_location_factory
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    streams = [iter(_fenced_consecutive_deltas("\n"))]
    requests = []
    def fake_create(**kwargs):
        requests.append(kwargs)
        return streams.pop(0)
    monkeypatch.setattr("users.views.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr(
        "users.assistant.OpenAI",
        lambda: SimpleNamespace(responses=SimpleNamespace(create=fake_create)),
    )
    api_client.force_authenticate(user)

    response = api_client.post(
        "/api/users/assistant/messages",
        {"locationId": location.id, "message": "What is due?"}, format="json",
    )
    body = b"".join(response.streaming_content).decode()

    assert "event: complete" in body
    assert "event: error" not in body
    assert "FGS has Rs 10 due from Ali." in body
    assert "to=functions" not in body
    assert '"query_type"' not in body
    assert "```" not in body
    assert len(requests) == 1
    saved = AssistantMessage.objects.get(conversation__user=user, role="assistant")
    assert "FGS has Rs 10 due from Ali." in saved.content
    assert "to=" not in saved.content
    assert "```" not in saved.content


def test_sse_consecutive_fenced_blocks_crlf_resolve_to_trailing_answer(
    api_client, monkeypatch, user_factory, item_location_factory
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    streams = [iter(_fenced_consecutive_deltas("\r\n"))]
    requests = []
    def fake_create(**kwargs):
        requests.append(kwargs)
        return streams.pop(0)
    monkeypatch.setattr("users.views.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr(
        "users.assistant.OpenAI",
        lambda: SimpleNamespace(responses=SimpleNamespace(create=fake_create)),
    )
    api_client.force_authenticate(user)

    response = api_client.post(
        "/api/users/assistant/messages",
        {"locationId": location.id, "message": "What is due?"}, format="json",
    )
    body = b"".join(response.streaming_content).decode()

    assert "event: complete" in body
    assert "event: error" not in body
    assert "FGS has Rs 10 due from Ali." in body
    assert "to=functions" not in body
    assert '"query_type"' not in body
    assert "```" not in body
    assert len(requests) == 1
    saved = AssistantMessage.objects.get(conversation__user=user, role="assistant")
    assert "FGS has Rs 10 due from Ali." in saved.content
    assert "to=" not in saved.content


def test_sse_preamble_only_recovery_is_not_saved_as_success(
    api_client, monkeypatch, user_factory, item_location_factory
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    streams = [
        iter((
            SimpleNamespace(type="response.output_text.delta", delta="Checking debt now.\n"),
            SimpleNamespace(type="response.output_text.delta", delta="to=functions.financial_inventory_lookup code:\n"),
            SimpleNamespace(type="response.output_text.delta", delta='{"query_type":"debt_summary"}'),
            completed("answer-1"),
        )),
        iter((
            SimpleNamespace(type="response.output_text.delta", delta="Checking debt now."),
            completed("answer-2"),
        )),
    ]
    requests = []
    def fake_create(**kwargs):
        requests.append(kwargs)
        return streams.pop(0)
    monkeypatch.setattr("users.views.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr(
        "users.assistant.OpenAI",
        lambda: SimpleNamespace(responses=SimpleNamespace(create=fake_create)),
    )
    api_client.force_authenticate(user)

    response = api_client.post(
        "/api/users/assistant/messages",
        {"locationId": location.id, "message": "What is due?"}, format="json",
    )
    body = b"".join(response.streaming_content).decode()

    assert "event: error" in body
    assert "event: complete" not in body
    assert len(requests) == 2
    assert requests[1]["tool_choice"] == "none"
    failure = AssistantMessage.objects.get(conversation__user=user, role="assistant")
    assert failure.content == ""
    assert failure.error_message == "The assistant returned an incomplete answer."


def test_sse_explicit_incomplete_recovery_is_not_saved_as_success(
    api_client, monkeypatch, user_factory, item_location_factory
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    streams = [
        iter((
            SimpleNamespace(type="response.output_text.delta", delta="Checking debt now.\n"),
            SimpleNamespace(type="response.output_text.delta", delta="to=functions.financial_inventory_lookup code:\n"),
            SimpleNamespace(type="response.output_text.delta", delta='{"query_type":"debt_summary"}'),
            completed("answer-1"),
        )),
        iter((
            recovery_incomplete("Checking debt now!"),
            completed("answer-2"),
        )),
    ]
    requests = []
    def fake_create(**kwargs):
        requests.append(kwargs)
        return streams.pop(0)
    monkeypatch.setattr("users.views.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr(
        "users.assistant.OpenAI",
        lambda: SimpleNamespace(responses=SimpleNamespace(create=fake_create)),
    )
    api_client.force_authenticate(user)

    response = api_client.post(
        "/api/users/assistant/messages",
        {"locationId": location.id, "message": "What is due?"}, format="json",
    )
    body = b"".join(response.streaming_content).decode()

    assert "event: error" in body
    assert "event: complete" not in body
    assert "Checking debt now!" not in body
    assert len(requests) == 2
    assert requests[1]["tool_choice"] == "none"
    failure = AssistantMessage.objects.get(conversation__user=user, role="assistant")
    assert failure.content == ""
    assert failure.error_message == "The assistant returned an incomplete answer."


def test_sse_preamble_with_currency_is_not_saved_as_success(
    api_client, monkeypatch, user_factory, item_location_factory
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    streams = [
        iter((
            SimpleNamespace(type="response.output_text.delta", delta="I will check the balance in Rs.\n"),
            SimpleNamespace(type="response.output_text.delta", delta="to=functions.financial_inventory_lookup code:\n"),
            SimpleNamespace(type="response.output_text.delta", delta='{"query_type":"debt_summary"}'),
            completed("answer-1"),
        )),
        iter((
            SimpleNamespace(type="response.output_text.delta", delta=""),
            completed("answer-2"),
        )),
    ]
    monkeypatch.setattr("users.views.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr("users.assistant.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr(
        "users.assistant.OpenAI",
        lambda: SimpleNamespace(responses=SimpleNamespace(create=lambda **kwargs: streams.pop(0))),
    )
    api_client.force_authenticate(user)

    response = api_client.post(
        "/api/users/assistant/messages",
        {"locationId": location.id, "message": "What is due?"}, format="json",
    )
    body = b"".join(response.streaming_content).decode()

    assert "event: error" in body
    assert "event: complete" not in body
    failure = AssistantMessage.objects.get(conversation__user=user, role="assistant")
    assert failure.content == ""
    assert failure.error_message == "The assistant returned an incomplete answer."


def test_sse_replace_updates_stream_and_saved_content(
    api_client, monkeypatch, user_factory, item_location_factory
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    monkeypatch.setattr("users.views.configuration", lambda: ("gpt-5.6-luna", "high"))
    monkeypatch.setattr(
        "users.views.stream_answer",
        lambda *args: iter((
            ("delta", "Checking debt now.\n"),
            ("replace", "FGS has Rs 10 due from Ali."),
            ("complete", {"model": "gpt-5.6-luna", "usage": {"total_tokens": 2}}),
        )),
    )
    api_client.force_authenticate(user)

    response = api_client.post(
        "/api/users/assistant/messages",
        {"locationId": location.id, "message": "What is due?"}, format="json",
    )
    body = b"".join(response.streaming_content).decode()

    assert "event: replace" in body
    assert "FGS has Rs 10 due from Ali." in body
    saved = AssistantMessage.objects.get(conversation__user=user, role="assistant")
    assert saved.content == "FGS has Rs 10 due from Ali."


def test_sse_explains_when_openai_account_has_no_credits(
    api_client, monkeypatch, user_factory, item_location_factory
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    monkeypatch.setattr("users.views.configuration", lambda: ("gpt-5.6-luna", "high"))

    def no_credits(*args):
        raise Exception("You have no credits remaining.")
        yield

    monkeypatch.setattr("users.views.stream_answer", no_credits)
    api_client.force_authenticate(user)

    response = api_client.post(
        "/api/users/assistant/messages",
        {"locationId": location.id, "message": "Hello"}, format="json",
    )
    body = b"".join(response.streaming_content).decode()

    assert "The OpenAI API account has no credits remaining." in body
    failure = AssistantMessage.objects.get(conversation__user=user, role="assistant")
    assert failure.error_message == "The OpenAI API account has no credits remaining. Add API billing credits and try again."


def test_only_admin_can_view_assistant_activity(
    api_client, user_factory, item_location_factory
):
    user, _ = user_factory(username="teacher")
    admin, _ = user_factory(is_admin=True)
    location = item_location_factory(name="FGS", users=[user])
    conversation = AssistantConversation.objects.create(user=user, location=location)
    AssistantMessage.objects.create(
        conversation=conversation,
        role="user",
        content="Who owes us money?",
        client_ip="203.0.113.10",
        user_agent="Inventory Assistant test browser",
    )
    AssistantMessage.objects.create(
        conversation=conversation, role="assistant", content="Ali owes Rs 10.",
        model="gpt-5.6-luna", usage={"total_tokens": 12}, estimated_cost_usd=0.01,
    )

    api_client.force_authenticate(user)
    assert api_client.get("/api/users/assistant/activity").status_code == 403

    api_client.force_authenticate(admin)
    response = api_client.get("/api/users/assistant/activity?q=owes&location_id=" + str(location.id))

    assert response.status_code == 200
    assert response.data["pagination"]["total"] == 1
    activity = response.data["results"][0]
    assert activity["user"]["username"] == "teacher"
    assert activity["location"]["name"] == "FGS"
    assert activity["status"] == "completed"
    assert activity["totalTokens"] == 12
    assert activity["totalCostUsd"] == 0.01
    assert response.data["summary"]["totalCostUsd"] == 0.01
    assert activity["messages"][0]["clientIp"] == "203.0.113.10"
    assert activity["messages"][0]["userAgent"] == "Inventory Assistant test browser"
