from rest_framework.test import APIClient

from users.models import FrictionEvent, ProblemReport
from users.tests.factories import user_factory


def friction_payload(**overrides):
    payload = {
        "action": "sale_create",
        "route": "/app/items/1/2",
        "location_id": 1,
        "order_id": 2,
        "status_code": 400,
        "error": {
            "field": "quantity",
            "message": "Sale quantity cannot exceed the remaining stock.",
        },
    }
    return {**payload, **overrides}


def create_friction_event(api_client: APIClient, user):
    api_client.force_authenticate(user=user)
    response = api_client.post(
        "/api/users/feedback/friction-events", friction_payload(), format="json"
    )
    assert response.status_code == 201
    return response.data


def test_user_can_record_friction_event(api_client: APIClient, user_factory) -> None:
    user, _ = user_factory()
    event = create_friction_event(api_client, user)

    assert event["action"] == "sale_create"
    assert event["error"]["field"] == "quantity"
    assert FrictionEvent.objects.filter(user=user).count() == 1


def test_user_can_report_own_friction_event(
    api_client: APIClient, user_factory
) -> None:
    user, _ = user_factory()
    event = create_friction_event(api_client, user)

    response = api_client.post(
        "/api/users/feedback/reports",
        {
            "friction_event_id": event["id"],
            "submitted_data": {
                "vendor": "Test Vendor",
                "quantity": 12,
                "pricePerItem": 15,
                "amountPaid": 180,
                "date": None,
            },
        },
        format="json",
    )

    assert response.status_code == 201
    assert response.data["user"] == user.username
    assert response.data["submitted_data"]["vendor"] == "Test Vendor"
    assert ProblemReport.objects.filter(user=user).count() == 1


def test_user_cannot_report_someone_elses_friction_event(
    api_client: APIClient, user_factory
) -> None:
    owner, _ = user_factory()
    event = create_friction_event(api_client, owner)
    other_user, _ = user_factory()
    api_client.force_authenticate(user=other_user)

    response = api_client.post(
        "/api/users/feedback/reports",
        {"friction_event_id": event["id"], "submitted_data": {}},
        format="json",
    )

    assert response.status_code == 403


def test_report_rejects_password_data(api_client: APIClient, user_factory) -> None:
    user, _ = user_factory()
    event = create_friction_event(api_client, user)

    response = api_client.post(
        "/api/users/feedback/reports",
        {
            "friction_event_id": event["id"],
            "submitted_data": {"password": "not-stored"},
        },
        format="json",
    )

    assert response.status_code == 400
    assert ProblemReport.objects.count() == 0


def test_only_admin_can_view_reports_and_possible_friction(
    api_client: APIClient, user_factory
) -> None:
    user, _ = user_factory()
    event = create_friction_event(api_client, user)
    api_client.post(
        "/api/users/feedback/reports",
        {"friction_event_id": event["id"], "submitted_data": {}},
        format="json",
    )

    assert api_client.get("/api/users/feedback/reports").status_code == 403
    assert api_client.get("/api/users/feedback/possible-friction").status_code == 403

    admin, _ = user_factory(is_admin=True)
    api_client.force_authenticate(user=admin)
    reports = api_client.get("/api/users/feedback/reports")
    summary = api_client.get("/api/users/feedback/possible-friction")

    assert reports.status_code == 200
    assert reports.data[0]["friction_event"]["id"] == event["id"]
    assert summary.status_code == 200
    assert summary.data[0]["failure_count"] == 1
    assert summary.data[0]["affected_user_count"] == 1
