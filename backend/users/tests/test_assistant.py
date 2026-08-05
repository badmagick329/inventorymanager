from decimal import Decimal
from types import SimpleNamespace

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
    )
    body = b"".join(response.streaming_content).decode()

    assert response["Content-Type"] == "text/event-stream"
    assert "event: delta" in body
    assert "event: complete" in body
    assert AssistantConversation.objects.get().user_id == user.id


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
    AssistantMessage.objects.create(conversation=conversation, role="user", content="Who owes us money?")
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
