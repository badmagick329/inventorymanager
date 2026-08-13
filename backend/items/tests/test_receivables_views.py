from datetime import date, datetime, timezone
from decimal import Decimal
from functools import partial

import pytest
from django.urls import reverse
from items.tests.factories import (
    item_location_factory,
    order_factory,
    sale_factory,
    vendor_factory,
)
from items.views import receivable
from items.views.receivable import age_and_bucket
from rest_framework.test import APIClient
from users.tests.factories import user_factory

receivables_url = partial(reverse, "receivables")
vendor_receivables_url = partial(reverse, "vendor_receivables")
AS_OF_DATE = date(2026, 8, 13)


@pytest.mark.parametrize(
    ("days", "expected_bucket"),
    [
        (0, "0_30"),
        (30, "0_30"),
        (31, "31_60"),
        (60, "31_60"),
        (61, "61_90"),
        (90, "61_90"),
        (91, "90_plus"),
    ],
)
def test_age_bucket_boundaries(days, expected_bucket):
    sale_date = date.fromordinal(AS_OF_DATE.toordinal() - days)
    assert age_and_bucket(sale_date, AS_OF_DATE) == (days, expected_bucket)


def test_missing_and_future_dates_have_unknown_age():
    assert age_and_bucket(None, AS_OF_DATE) == (None, "unknown")
    assert age_and_bucket(date(2026, 8, 14), AS_OF_DATE) == (
        None,
        "unknown",
    )


def test_pakistan_today_uses_pakistan_calendar_date(monkeypatch):
    utc_time = datetime(2026, 8, 13, 21, 30, tzinfo=timezone.utc)
    monkeypatch.setattr(receivable.timezone, "now", lambda: utc_time)
    assert receivable.pakistan_today() == date(2026, 8, 14)


def _create_receivable(
    *,
    user,
    location,
    order_factory,
    vendor_factory,
    sale_factory,
    vendor_name="Vendor",
    date_string="2026-08-01",
    debt=100,
):
    order = order_factory(
        name=f"Item {vendor_name}",
        location=location,
        user=user,
        quantity=100,
    )
    vendor, _ = vendor_factory(name=vendor_name, location=location)
    sale = sale_factory(
        order,
        vendor,
        date_string=date_string,
        quantity=1,
        price_per_item=max(300, float(debt)),
        debt=debt,
        user=user,
    )
    return order, vendor, sale


def test_overview_returns_summary_buckets_and_vendor_groups(
    api_client: APIClient,
    monkeypatch,
    user_factory,
    item_location_factory,
    order_factory,
    vendor_factory,
    sale_factory,
):
    admin, _ = user_factory(is_admin=True)
    location = item_location_factory(name="FGS")
    _create_receivable(
        user=admin,
        location=location,
        order_factory=order_factory,
        vendor_factory=vendor_factory,
        sale_factory=sale_factory,
        vendor_name="Ali",
        date_string="2026-05-01",
        debt=250,
    )
    _create_receivable(
        user=admin,
        location=location,
        order_factory=order_factory,
        vendor_factory=vendor_factory,
        sale_factory=sale_factory,
        vendor_name="Jain Mandir",
        date_string="2026-08-01",
        debt=100,
    )
    monkeypatch.setattr(receivable, "pakistan_today", lambda: AS_OF_DATE)
    api_client.force_authenticate(user=admin)

    response = api_client.get(receivables_url())

    assert response.status_code == 200, response.json()
    data = response.json()
    assert data["asOfDate"] == "2026-08-13"
    assert data["summary"] == {
        "totalOutstanding": 350.0,
        "openSaleCount": 2,
        "vendorCount": 2,
        "oldestAgeDays": 104,
        "unknownDateCount": 0,
    }
    assert [vendor["name"] for vendor in data["vendors"]] == [
        "Ali",
        "Jain Mandir",
    ]
    buckets = {bucket["key"]: bucket for bucket in data["buckets"]}
    assert buckets["0_30"]["amount"] == 100.0
    assert buckets["90_plus"]["amount"] == 250.0


def test_age_filter_keeps_full_distribution_but_filters_vendor_totals(
    api_client: APIClient,
    monkeypatch,
    user_factory,
    item_location_factory,
    order_factory,
    vendor_factory,
    sale_factory,
):
    admin, _ = user_factory(is_admin=True)
    location = item_location_factory(name="FGS")
    order, vendor, _ = _create_receivable(
        user=admin,
        location=location,
        order_factory=order_factory,
        vendor_factory=vendor_factory,
        sale_factory=sale_factory,
        vendor_name="Ali",
        date_string="2026-08-01",
        debt=100,
    )
    sale_factory(
        order,
        vendor,
        date_string="2026-05-01",
        quantity=1,
        price_per_item=300,
        debt=250,
        user=admin,
    )
    monkeypatch.setattr(receivable, "pakistan_today", lambda: AS_OF_DATE)
    api_client.force_authenticate(user=admin)

    response = api_client.get(receivables_url(), {"age_bucket": "90_plus"})

    data = response.json()
    assert data["summary"]["totalOutstanding"] == 350.0
    assert data["vendors"][0]["totalOutstanding"] == 250.0
    assert data["vendors"][0]["openSaleCount"] == 1
    assert data["activeAgeBucket"] == "90_plus"


def test_overview_marks_unknown_archived_and_excludes_closed_or_deleted_sales(
    api_client: APIClient,
    monkeypatch,
    user_factory,
    item_location_factory,
    order_factory,
    vendor_factory,
    sale_factory,
):
    admin, _ = user_factory(is_admin=True)
    location = item_location_factory(name="FGS")
    order, vendor, unknown_sale = _create_receivable(
        user=admin,
        location=location,
        order_factory=order_factory,
        vendor_factory=vendor_factory,
        sale_factory=sale_factory,
        debt=100,
    )
    unknown_sale.date = None
    unknown_sale.save(user=admin)
    vendor.mark_as_deleted(admin)
    order.deleted = True
    order.save(user=admin)

    closed = sale_factory(
        order,
        vendor,
        quantity=1,
        debt=0,
        user=admin,
    )
    deleted = sale_factory(
        order,
        vendor,
        quantity=1,
        debt=50,
        user=admin,
    )
    deleted.deleted = True
    deleted.save(user=admin)
    monkeypatch.setattr(receivable, "pakistan_today", lambda: AS_OF_DATE)
    api_client.force_authenticate(user=admin)

    response = api_client.get(receivables_url())

    assert response.status_code == 200, response.json()
    data = response.json()
    assert data["summary"]["totalOutstanding"] == 100.0
    assert data["summary"]["unknownDateCount"] == 1
    assert data["vendors"][0]["isArchived"] is True
    assert closed.id != deleted.id

    detail = api_client.get(
        vendor_receivables_url(kwargs={"vendor_id": vendor.id})
    ).json()
    assert len(detail["results"]) == 1
    assert detail["results"][0]["isOrderArchived"] is True
    assert detail["results"][0]["ageDays"] is None


def test_receivables_respect_location_permissions(
    api_client: APIClient,
    user_factory,
    item_location_factory,
    order_factory,
    vendor_factory,
    sale_factory,
):
    user, _ = user_factory()
    visible = item_location_factory(name="FGS", users=[user])
    hidden = item_location_factory(name="FGHS")
    _, visible_vendor, _ = _create_receivable(
        user=user,
        location=visible,
        order_factory=order_factory,
        vendor_factory=vendor_factory,
        sale_factory=sale_factory,
        vendor_name="Visible",
        debt=100,
    )
    _, hidden_vendor, _ = _create_receivable(
        user=user,
        location=hidden,
        order_factory=order_factory,
        vendor_factory=vendor_factory,
        sale_factory=sale_factory,
        vendor_name="Hidden",
        debt=200,
    )
    api_client.force_authenticate(user=user)

    response = api_client.get(receivables_url())
    assert response.status_code == 200
    assert [item["name"] for item in response.json()["vendors"]] == ["Visible"]
    assert (
        api_client.get(
            receivables_url(), {"location_id": hidden.id}
        ).status_code
        == 403
    )
    assert (
        api_client.get(
            vendor_receivables_url(kwargs={"vendor_id": hidden_vendor.id})
        ).status_code
        == 403
    )
    assert (
        api_client.get(
            vendor_receivables_url(kwargs={"vendor_id": visible_vendor.id})
        ).status_code
        == 200
    )


def test_receivables_total_matches_location_outstanding_summary(
    api_client: APIClient,
    user_factory,
    item_location_factory,
    order_factory,
    vendor_factory,
    sale_factory,
):
    admin, _ = user_factory(is_admin=True)
    location = item_location_factory(name="FGS")
    _create_receivable(
        user=admin,
        location=location,
        order_factory=order_factory,
        vendor_factory=vendor_factory,
        sale_factory=sale_factory,
        debt=Decimal("123.45"),
    )
    api_client.force_authenticate(user=admin)

    overview = api_client.get(receivables_url()).json()
    locations = api_client.get(reverse("locations")).json()

    assert overview["summary"]["totalOutstanding"] == locations[0]["debt"]


def test_overview_query_count_does_not_grow_with_vendor_count(
    api_client: APIClient,
    django_assert_num_queries,
    user_factory,
    item_location_factory,
    order_factory,
    vendor_factory,
    sale_factory,
):
    admin, _ = user_factory(is_admin=True)
    location = item_location_factory(name="FGS")
    for index in range(5):
        _create_receivable(
            user=admin,
            location=location,
            order_factory=order_factory,
            vendor_factory=vendor_factory,
            sale_factory=sale_factory,
            vendor_name=f"Vendor {index}",
        )
    api_client.force_authenticate(user=admin)

    with django_assert_num_queries(1):
        response = api_client.get(receivables_url())

    assert response.status_code == 200
    assert len(response.json()["vendors"]) == 5
