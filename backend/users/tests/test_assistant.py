from decimal import Decimal

from django.utils import timezone
from items.models import ItemLocation
from users.assistant import financial_lookup
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
