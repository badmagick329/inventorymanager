from datetime import datetime

from django.core.exceptions import ValidationError
from items.models import ItemLocation, Order
from rest_framework import serializers


class OrderSerializer(serializers.BaseSerializer):
    def create(self, validated_data):
        location_id = validated_data.get("locationId")
        location = ItemLocation.objects.filter(id=location_id).first()
        if not location:
            raise serializers.ValidationError(
                {"location_id": f"Location for this order was not found"}
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
            raise serializers.ValidationError(e.message_dict)
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
            raise serializers.ValidationError(e.message_dict)
        return instance

    def to_internal_value(self, data):
        if hasattr(data, "_mutable"):
            data._mutable = True

        if "date" in data and data["date"]:
            data["date"] = data["date"].strip()
            try:
                data["date"] = datetime.strptime(
                    data["date"], "%Y-%m-%d"
                ).date()
            except ValueError:
                raise serializers.ValidationError(
                    {"date": "Date must be in the format YYYY-MM-DD"}
                )

        if hasattr(data, "_mutable"):
            data._mutable = False
        return data

    def to_representation(self, instance):
        date_repr = (
            instance.date.strftime("%Y-%m-%d") if instance.date else None
        )
        sales = instance.sales.all()
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
