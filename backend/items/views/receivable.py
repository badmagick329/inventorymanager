from collections import defaultdict
from datetime import date
from zoneinfo import ZoneInfo

from django.shortcuts import get_object_or_404
from django.utils import timezone
from items.models import ItemLocation, Sale, Vendor
from items.views.helpers import (
    forbidden_if_location_invisible,
    forbidden_if_vendor_invisible,
)
from rest_framework import permissions
from rest_framework.request import Request
from rest_framework.views import APIView
from users.models import UserAccount
from utils.responses import APIResponses

PAKISTAN_TIME_ZONE = ZoneInfo("Asia/Karachi")
BUCKET_KEYS = ("0_30", "31_60", "61_90", "90_plus", "unknown")
BUCKET_LABELS = {
    "0_30": "0–30 days",
    "31_60": "31–60 days",
    "61_90": "61–90 days",
    "90_plus": "90+ days",
    "unknown": "Unknown",
}
ORDERING_KEYS = {
    "outstanding_desc",
    "outstanding_asc",
    "oldest_desc",
    "name_asc",
}


def pakistan_today() -> date:
    return timezone.now().astimezone(PAKISTAN_TIME_ZONE).date()


def age_and_bucket(sale_date: date | None, as_of_date: date):
    if sale_date is None or sale_date > as_of_date:
        return None, "unknown"

    age_days = (as_of_date - sale_date).days
    if age_days <= 30:
        return age_days, "0_30"
    if age_days <= 60:
        return age_days, "31_60"
    if age_days <= 90:
        return age_days, "61_90"
    return age_days, "90_plus"


def _visible_sales(user: UserAccount):
    sales = Sale.objects.filter(deleted=False, debt__gt=0).select_related(
        "vendor", "order", "order__location"
    )
    if not user.is_admin:
        sales = sales.filter(order__location__users=user)
    return sales.distinct()


def _empty_buckets():
    return {
        key: {
            "key": key,
            "label": BUCKET_LABELS[key],
            "amount": 0.0,
            "saleCount": 0,
        }
        for key in BUCKET_KEYS
    }


def _serialize_buckets(buckets):
    return [buckets[key] for key in BUCKET_KEYS]


def _validate_bucket(raw_bucket: str | None):
    if raw_bucket and raw_bucket not in BUCKET_KEYS:
        return APIResponses.bad_request(
            {"age_bucket": ["Select a valid aging band."]}
        )
    return None


def _sort_vendors(vendors, ordering):
    if ordering == "outstanding_asc":
        return sorted(
            vendors,
            key=lambda item: (item["totalOutstanding"], item["name"].lower()),
        )
    if ordering == "oldest_desc":
        return sorted(
            vendors,
            key=lambda item: (
                item["oldestAgeDays"] is None,
                -(
                    item["oldestAgeDays"]
                    if item["oldestAgeDays"] is not None
                    else -1
                ),
                item["name"].lower(),
            ),
        )
    if ordering == "name_asc":
        return sorted(vendors, key=lambda item: item["name"].lower())
    return sorted(
        vendors,
        key=lambda item: (-item["totalOutstanding"], item["name"].lower()),
    )


class ReceivablesOverview(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request):
        user = request.user
        assert isinstance(user, UserAccount)

        location_id = request.GET.get("location_id")
        bucket_filter = request.GET.get("age_bucket") or None
        ordering = request.GET.get("ordering", "outstanding_desc")
        query = request.GET.get("q", "").strip()

        if response := _validate_bucket(bucket_filter):
            return response
        if ordering not in ORDERING_KEYS:
            return APIResponses.bad_request(
                {"ordering": ["Select a valid ordering."]}
            )

        sales = _visible_sales(user)
        if location_id:
            try:
                parsed_location_id = int(location_id)
            except ValueError:
                return APIResponses.bad_request(
                    {"location_id": ["Location must be a whole number."]}
                )
            location = get_object_or_404(ItemLocation, id=parsed_location_id)
            if response := forbidden_if_location_invisible(location, user):
                return response
            sales = sales.filter(order__location=location)
        if query:
            sales = sales.filter(vendor__name__icontains=query)

        as_of_date = pakistan_today()
        buckets = _empty_buckets()
        prepared_sales = []
        known_ages = []

        for sale in sales:
            age_days, bucket = age_and_bucket(sale.date, as_of_date)
            debt = float(sale.debt or 0)
            buckets[bucket]["amount"] += debt
            buckets[bucket]["saleCount"] += 1
            if age_days is not None:
                known_ages.append(age_days)
            prepared_sales.append((sale, age_days, bucket, debt))

        filtered_sales = [
            item
            for item in prepared_sales
            if bucket_filter is None or item[2] == bucket_filter
        ]
        vendor_groups = defaultdict(list)
        for item in filtered_sales:
            vendor_groups[item[0].vendor_id].append(item)

        vendors = []
        for grouped_sales in vendor_groups.values():
            vendor = grouped_sales[0][0].vendor
            location = grouped_sales[0][0].order.location
            ages = [item[1] for item in grouped_sales if item[1] is not None]
            vendor_buckets = _empty_buckets()
            for _, _, bucket, debt in grouped_sales:
                vendor_buckets[bucket]["amount"] += debt
                vendor_buckets[bucket]["saleCount"] += 1
            vendors.append(
                {
                    "vendorId": vendor.id,
                    "name": vendor.name,
                    "locationId": location.id,
                    "locationName": location.name,
                    "isArchived": vendor.deleted,
                    "totalOutstanding": sum(item[3] for item in grouped_sales),
                    "openSaleCount": len(grouped_sales),
                    "oldestAgeDays": max(ages) if ages else None,
                    "unknownDateCount": sum(
                        1 for item in grouped_sales if item[2] == "unknown"
                    ),
                    "buckets": _serialize_buckets(vendor_buckets),
                }
            )

        return APIResponses.ok(
            {
                "asOfDate": as_of_date.isoformat(),
                "summary": {
                    "totalOutstanding": sum(
                        item[3] for item in prepared_sales
                    ),
                    "openSaleCount": len(prepared_sales),
                    "vendorCount": len(
                        {item[0].vendor_id for item in prepared_sales}
                    ),
                    "oldestAgeDays": max(known_ages) if known_ages else None,
                    "unknownDateCount": buckets["unknown"]["saleCount"],
                },
                "buckets": _serialize_buckets(buckets),
                "vendors": _sort_vendors(vendors, ordering),
                "activeAgeBucket": bucket_filter,
            }
        )


class VendorReceivables(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request, vendor_id: int):
        user = request.user
        assert isinstance(user, UserAccount)
        bucket_filter = request.GET.get("age_bucket") or None
        if response := _validate_bucket(bucket_filter):
            return response

        vendor = get_object_or_404(Vendor, id=vendor_id)
        if response := forbidden_if_vendor_invisible(vendor, user):
            return response

        as_of_date = pakistan_today()
        results = []
        sales = (
            _visible_sales(user).filter(vendor=vendor).order_by("date", "id")
        )
        for sale in sales:
            age_days, bucket = age_and_bucket(sale.date, as_of_date)
            if bucket_filter and bucket != bucket_filter:
                continue
            total_sale_value = sale.potential_revenue()
            results.append(
                {
                    "saleId": sale.id,
                    "orderId": sale.order_id,
                    "orderName": sale.order.name,
                    "locationId": sale.order.location_id,
                    "locationName": sale.order.location.name,
                    "saleDate": sale.date.isoformat() if sale.date else None,
                    "ageDays": age_days,
                    "ageBucket": bucket,
                    "quantity": sale.quantity,
                    "totalSaleValue": float(total_sale_value),
                    "amountPaid": float(total_sale_value - (sale.debt or 0)),
                    "outstandingAmount": float(sale.debt or 0),
                    "isOrderArchived": sale.order.deleted,
                }
            )

        results.sort(
            key=lambda item: (
                item["ageDays"] is None,
                -(item["ageDays"] if item["ageDays"] is not None else -1),
                item["orderName"].lower(),
            )
        )
        return APIResponses.ok(
            {
                "asOfDate": as_of_date.isoformat(),
                "vendor": {
                    "id": vendor.id,
                    "name": vendor.name,
                    "locationId": vendor.location_id,
                    "locationName": vendor.location.name,
                    "isArchived": vendor.deleted,
                },
                "results": results,
            }
        )
