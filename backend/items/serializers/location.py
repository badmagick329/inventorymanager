from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError
from items.models import ItemLocation
from rest_framework import serializers
from users.models import UserAccount
from utils.errors import ErrorHandler, ValidationErrorWithMessage


class ItemLocationSerializer(serializers.ModelSerializer):
    users = serializers.SlugRelatedField(
        many=True, slug_field="username", queryset=UserAccount.objects.all()
    )

    class Meta:  # type: ignore
        model = ItemLocation
        fields = ["id", "name", "users"]

    def create(self, validated_data) -> ItemLocation:
        try:
            item_location = ItemLocation.objects.create(
                name=validated_data["name"],
            )
        except IntegrityError as e:
            raise ErrorHandler(e).error
        users = UserAccount.objects.filter(
            username__in=validated_data.get("users", [])
        ).all()
        item_location.users.set(users)
        try:
            item_location.full_clean()
            item_location.save()
        except ValidationError as e:
            item_location.delete()
            raise ValidationErrorWithMessage(e.message_dict)

        return item_location

    def update(self, instance, validated_data):
        name = validated_data.get("name", instance.name).strip()
        users = validated_data.get("users", instance.users)
        saved_users = UserAccount.objects.filter(username__in=users)
        instance.name = name
        instance.users.set(saved_users)
        try:
            instance.save()
        except IntegrityError as e:
            raise ErrorHandler(e).error
        except ValidationError as e:
            raise ValidationErrorWithMessage(e.message_dict)
        return instance

    def to_internal_value(self, data):
        if hasattr(data, "_mutable"):
            data._mutable = True
        if "users" in data:
            match data["users"]:
                case str():
                    data["users"] = [
                        user.strip().lower()
                        for user in data["users"].split(",")
                        if user.strip()
                    ]
                case list():
                    data["users"] = [
                        user.strip().lower()
                        for user in data["users"]
                        if user.strip()
                    ]
                case _:
                    pass

        if "name" in data:
            data["name"] = data["name"].strip()
        if hasattr(data, "_mutable"):
            data._mutable = False
        return data

    def to_representation(self, instance):
        orders = instance.orders.all()
        spendings = ItemLocation.spendings(orders)
        revenue = ItemLocation.revenue(orders)
        profit = revenue - spendings
        return {
            "id": instance.id,
            "name": instance.name,
            "users": [user.username for user in instance.users.all()],
            "spendings": spendings,
            "revenue": revenue,
            "profit": profit,
        }
