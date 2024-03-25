from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError
from items.models import ItemLocation, Order, Sale, Vendor
from rest_framework import serializers
from users.models import UserAccount
from utils.errors import ErrorHandler, ValidationErrorWithMessage


class OrderSerializer(serializers.BaseSerializer):
    def create(self, validated_data):
        location_id = validated_data.get("locationId")
        location = ItemLocation.objects.filter(id=location_id).first()
        if not location:
            raise ValidationErrorWithMessage(
                {"location_id": ["Location for this order was not found"]}
            )
        order = Order(
            name=validated_data["name"],
            date=validated_data.get("date"),
            location=location,
            price_per_item=validated_data["pricePerItem"],
            quantity=validated_data["quantity"],
            current_sale_price=validated_data["currentSalePrice"],
        )
        try:
            order.save(user=validated_data["user"])
        except ValidationError as e:
            raise ValidationErrorWithMessage(e.message_dict)
        except IntegrityError as e:
            raise ErrorHandler(e).error
        return order

    def update(self, instance, validated_data):
        instance.name = validated_data.get("name", instance.name).strip()
        instance.date = validated_data.get("date", instance.date)
        instance.price_per_item = validated_data.get(
            "pricePerItem", instance.price_per_item
        )
        instance.quantity = validated_data.get("quantity", instance.quantity)
        instance.current_sale_price = validated_data.get(
            "currentSalePrice", instance.current_sale_price
        )
        try:
            instance.save(user=validated_data["user"])
        except ValidationError as e:
            raise ValidationErrorWithMessage(e.message_dict)
        except IntegrityError as e:
            raise ErrorHandler(e).error
        return instance

    def to_internal_value(self, data):
        location_id = data.get("locationId")
        date = data.get("date")
        name = data.get("name").strip() if data.get("name") else None
        try:
            price_per_item = round(data.get("pricePerItem"), 2)
        except TypeError:
            price_per_item = None
        quantity = data.get("quantity")
        try:
            current_sale_price = round(data.get("currentSalePrice"), 2)
        except TypeError:
            current_sale_price = None
        user = data.get("user")
        return {
            "locationId": location_id,
            "date": date,
            "name": name,
            "pricePerItem": price_per_item,
            "quantity": quantity,
            "currentSalePrice": current_sale_price,
            "user": user,
        }

    def to_representation(self, instance):
        date_repr = (
            instance.date.strftime("%Y-%m-%d") if instance.date else None
        )
        sales = instance.sales.filter(deleted=False)
        profit_per_item = sum([sale.profit_per_item() for sale in sales])
        total_profit = sum([sale.profit() for sale in sales])
        debt = sum([sale.debt for sale in sales])
        amount_paid = sum([sale.amount_paid() for sale in sales])
        potential_profit = sum([sale.potential_profit() for sale in sales])
        vendors = [sale.vendor.name for sale in sales]
        sold_quantity = sum([sale.quantity for sale in sales])

        return {
            "id": instance.id,
            "name": instance.name,
            "date": date_repr,
            "location": instance.location.name,
            "pricePerItem": instance.price_per_item,
            "quantity": instance.quantity,
            "soldQuantity": sold_quantity,
            "currentSalePrice": instance.current_sale_price,
            "profit": total_profit,
            "profitPerItem": profit_per_item,
            "debt": debt,
            "amountPaid": amount_paid,
            "potentialProfit": potential_profit,
            "vendors": vendors,
            "created": instance.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "lastModifiedBy": instance.last_modified_by.username,
            "lastModified": instance.last_modified.strftime(
                "%Y-%m-%d %H:%M:%S"
            ),
        }


class HistoricalDelta:
    def __init__(self, old, new):
        self.old = old
        self.new = new
        self.changes = [d for d in new.diff_against(old).changes]
        self.last_modified = new.instance.last_modified

    def __str__(self):
        return f"{len(self.changes)} changes as of {self.last_modified}"


class OrderHistorySerializer:
    def __init__(self, order: Order):
        self._history = order.history.all()  # type: ignore
        self._deltas = list()

        self._first = None
        self._last = None

        if len(self._history) > 0:
            self._first = self._history.first()
        if len(self._history) > 1:
            self._last = self._history.last()

        for i in range(1, len(self._history)):
            self._deltas.append(
                HistoricalDelta(self._history[i], self._history[i - 1])
            )

    @property
    def data(self):
        serialized_deltas = list()
        for delta in self._deltas:
            serialized_deltas.append(OrderDeltaSerializer(delta).data)
        return {
            "first": (
                HistoricalOrderSerializer(self._first).data
                if self._first
                else None
            ),
            "last": (
                HistoricalOrderSerializer(self._last).data
                if self._last
                else None
            ),
            "deltas": serialized_deltas,
        }


class OrderDeltaSerializer:
    field_map = {
        "price_per_item": "pricePerItem",
        "last_modified_by": "lastModifiedBy",
        "current_sale_price": "currentSalePrice",
        "lastModified": "lastModified",
    }

    def __init__(self, delta: HistoricalDelta):
        self.delta = delta

    @property
    def data(self):
        serialized_changes = list()
        for change in self.delta.changes:
            if change.field == "last_modified_by":
                old_username = username_or_none(change.old)
                new_username = username_or_none(change.new)

                serialized = {
                    "field": self.field_map.get(change.field, change.field),
                    "oldValue": old_username,
                    "newValue": new_username,
                }
            else:
                serialized = {
                    "field": self.field_map.get(change.field, change.field),
                    "oldValue": change.old,
                    "newValue": change.new,
                }
            serialized_changes.append(serialized)
        last_modified = self.delta.last_modified
        if last_modified:
            last_modified = last_modified.strftime("%Y-%m-%d %H:%M:%S")
        return {
            "changes": serialized_changes,
            "lastModified": last_modified,
        }


class HistoricalOrderSerializer:
    def __init__(self, instance):
        self.instance = instance

    @property
    def data(self):
        date_repr = (
            self.instance.date.strftime("%Y-%m-%d")
            if self.instance.date
            else None
        )

        return {
            "id": self.instance.id,
            "name": self.instance.name,
            "date": date_repr,
            "pricePerItem": self.instance.price_per_item,
            "quantity": self.instance.quantity,
            "currentSalePrice": self.instance.current_sale_price,
            "deleted": self.instance.deleted,
            "created": self.instance.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "lastModifiedBy": self.instance.last_modified_by.username,
            "lastModified": self.instance.last_modified.strftime(
                "%Y-%m-%d %H:%M:%S"
            ),
        }


class SaleHistorySerializer:
    def __init__(self, sale: Sale):
        self._history = sale.history.all()  # type: ignore
        self._deltas = list()

        self._first = None
        self._last = None

        if len(self._history) > 0:
            self._first = self._history.first()
        if len(self._history) > 1:
            self._last = self._history.last()

        for i in range(1, len(self._history)):
            self._deltas.append(
                HistoricalDelta(self._history[i], self._history[i - 1])
            )

    @property
    def data(self):
        serialized_deltas = list()
        for delta in self._deltas:
            serialized_deltas.append(SaleDeltaSerializer(delta).data)
        return {
            "first": (
                HistoricalSaleSerializer(self._first).data
                if self._first
                else None
            ),
            "last": (
                HistoricalSaleSerializer(self._last).data
                if self._last
                else None
            ),
            "deltas": serialized_deltas,
        }


class SaleDeltaSerializer:
    field_map = {
        "price_per_item": "pricePerItem",
        "last_modified_by": "lastModifiedBy",
        "lastModified": "lastModified",
    }

    def __init__(self, delta: HistoricalDelta):
        self.delta = delta

    @property
    def data(self):
        serialized_changes = list()
        for change in self.delta.changes:
            if change.field == "last_modified_by":
                old_username = username_or_none(change.old)
                new_username = username_or_none(change.new)

                serialized = {
                    "field": self.field_map.get(change.field, change.field),
                    "oldValue": old_username,
                    "newValue": new_username,
                }
            elif change.field == "vendor":
                old_vendor = vendor_or_none(change.old)
                new_vendor = vendor_or_none(change.new)
                serialized = {
                    "field": self.field_map.get(change.field, change.field),
                    "oldValue": old_vendor,
                    "newValue": new_vendor,
                }
            else:
                serialized = {
                    "field": self.field_map.get(change.field, change.field),
                    "oldValue": change.old,
                    "newValue": change.new,
                }
            serialized_changes.append(serialized)
        last_modified = self.delta.last_modified
        if last_modified:
            last_modified = last_modified.strftime("%Y-%m-%d %H:%M:%S")
        return {
            "changes": serialized_changes,
            "lastModified": last_modified,
        }


class HistoricalSaleSerializer:
    def __init__(self, instance):
        self.instance = instance

    @property
    def data(self):
        date_repr = (
            self.instance.date.strftime("%Y-%m-%d")
            if self.instance.date
            else None
        )
        amount_paid = self.instance.instance.amount_paid()

        return {
            "id": self.instance.id,
            "date": date_repr,
            "pricePerItem": self.instance.price_per_item,
            "quantity": self.instance.quantity,
            "vendor": self.instance.vendor.name,
            "amountPaid": amount_paid,
            "deleted": self.instance.deleted,
            "created": self.instance.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "lastModifiedBy": self.instance.last_modified_by.username,
            "lastModified": self.instance.last_modified.strftime(
                "%Y-%m-%d %H:%M:%S"
            ),
        }


def username_or_none(id):
    user = UserAccount.objects.filter(id=id).first()
    return user.username if user else None


def vendor_or_none(id):
    vendor = Vendor.objects.filter(id=id).first()
    return vendor.name if vendor else None
