from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError
from items.models import Order, Sale, Vendor
from rest_framework import serializers
from utils.errors import ErrorHandler, ValidationErrorWithMessage


class SaleSerializer(serializers.BaseSerializer):
    def create(self, validated_data):
        order = self._get_order()
        vendor = self._get_vendor(order.location, validated_data["user"])
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
            raise ValidationErrorWithMessage(e.message_dict)
        except IntegrityError as e:
            raise ErrorHandler(e).error
        return sale

    def update(self, instance, validated_data):
        instance.date = validated_data.get("date", instance.date)
        instance.price_per_item = validated_data.get(
            "pricePerItem", instance.price_per_item
        )
        instance.quantity = validated_data.get("quantity", instance.quantity)
        instance.debt = validated_data.get("debt", instance.debt)
        vendor_name = validated_data.get("vendor")
        if vendor_name:
            instance.vendor = self._get_vendor(
                instance.order.location, validated_data["user"]
            )
        else:
            raise ValidationErrorWithMessage(
                {"vendor": ["Vendor name cannot be empty"]}
            )
        try:
            instance.save(user=validated_data["user"])
        except ValidationError as e:
            raise ValidationErrorWithMessage(e.message_dict)
        except IntegrityError as e:
            raise ErrorHandler(e).error
        return instance

    def to_internal_value(self, data):
        date = data.get("date")
        price_per_item = data.get("pricePerItem")
        quantity = data.get("quantity")
        amount_paid = data.get("amountPaid", 0)
        debt = data["pricePerItem"] * data["quantity"] - amount_paid
        vendor = data.get("vendor").strip() if data.get("vendor") else None
        order_id = data.get("orderId")

        return {
            "date": date,
            "pricePerItem": price_per_item,
            "quantity": quantity,
            "debt": debt,
            "vendor": vendor,
            "orderId": order_id,
            "user": data.get("user"),
        }

    def _get_order(self):
        order_id = self.validated_data.get("orderId")
        order = Order.objects.filter(id=order_id, deleted=False).first()
        if not order:
            raise ValidationErrorWithMessage(
                {"order_id": [f"Order with id {order_id} not found"]}
            )
        return order

    def _get_vendor(self, location, user):
        vendor_name = self.validated_data.get("vendor")
        vendor = location.vendors.filter(name__iexact=vendor_name).first()
        if not vendor:
            vendor = Vendor(name=vendor_name, location=location)
            try:
                vendor.save(user=user)
            except IntegrityError as e:
                raise ErrorHandler(e).error
            except ValidationError as e:
                raise ValidationErrorWithMessage(e.message_dict)
        return vendor

    def to_representation(self, instance):
        date_repr = (
            instance.date.strftime("%Y-%m-%d") if instance.date else None
        )

        return {
            "id": instance.id,
            "order": instance.order.name,
            "vendor": instance.vendor.name,
            "date": date_repr,
            "location": instance.order.location.name,
            "pricePerItem": instance.price_per_item,
            "quantity": instance.quantity,
            "cost": instance.cost(),
            "debt": instance.debt,
            "created": instance.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "lastModifiedBy": instance.last_modified_by.username,
            "lastModified": instance.last_modified.strftime(
                "%Y-%m-%d %H:%M:%S"
            ),
        }
