from django.core.exceptions import ValidationError
from items.models import Order, Sale
from items.utils.serializer_validator import SerializerValidator as SV
from rest_framework import serializers


class SaleSerializer(serializers.BaseSerializer):
    def create(self, validated_data):
        order = self._get_order()
        vendor = self._get_vendor(order.location)
        sale = Sale(
            order=order,
            vendor=vendor,
            date=validated_data["date"],
            quantity=validated_data["quantity"],
            price_per_item=validated_data["pricePerItem"],
            debt=validated_data["debt"],
        )
        try:
            sale.save(user=validated_data["user"])
        except ValidationError as e:
            raise serializers.ValidationError(e.message_dict)
        return sale

    def update(self, instance, validated_data):
        instance.date = validated_data.get("date", instance.date)
        instance.price_per_item = validated_data.get(
            "pricePerItem", instance.price_per_item
        )
        instance.quantity = validated_data.get("quantity", instance.quantity)
        instance.debt = validated_data.get("debt", instance.debt)
        try:
            instance.save(user=validated_data["user"])
        except ValidationError as e:
            raise serializers.ValidationError(e.message_dict)
        return instance

    def to_internal_value(self, data):
        if hasattr(data, "_mutable"):
            data._mutable = True

        data["date"] = SV.valid_date(data.get("date"), "date")
        data["pricePerItem"] = SV.positive_float(
            data.get("pricePerItem"), "pricePerItem", "Price per item"
        )
        data["quantity"] = SV.positive_int(
            data.get("quantity"), "quantity", "Quantity"
        )
        data["amountPaid"] = SV.positive_float(
            data.get("amountPaid", 0), "amountPaid", "Amount paid"
        )
        data["debt"] = (
            data["pricePerItem"] * data["quantity"] - data["amountPaid"]
        )
        data["vendorId"] = SV.positive_int(
            data.get("vendorId"), "vendorId", "Vendor ID"
        )
        data["orderId"] = SV.positive_int(
            data.get("orderId"), "orderId", "Order ID"
        )

        if hasattr(data, "_mutable"):
            data._mutable = False
        return data

    def _get_order(self):
        order_id = self.validated_data.get("orderId")
        order = Order.objects.filter(id=order_id).first()
        if not order:
            raise serializers.ValidationError({"order_id": f"Order not found"})
        return order

    def _get_vendor(self, location):
        vendor_id = self.validated_data.get("vendorId")
        vendor = location.vendors.filter(id=vendor_id).first()
        if not vendor:
            raise serializers.ValidationError(
                {"vendor_id": f"Vendor not found"}
            )
        return vendor

    def to_representation(self, instance):
        date_repr = (
            instance.date.strftime("%Y-%m-%d") if instance.date else None
        )

        return {
            "id": instance.id,
            "item": instance.order.name,
            "vendor": instance.vendor.name,
            "date": date_repr,
            "location": instance.order.location.name,
            "pricePerItem": instance.price_per_item,
            "quantity": instance.quantity,
            "debt": instance.debt,
            "created": instance.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "lastModifiedBy": instance.last_modified_by.username,
            "lastModified": instance.last_modified.strftime(
                "%Y-%m-%d %H:%M:%S"
            ),
        }
