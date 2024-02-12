from django.core.exceptions import ValidationError
from items.models import ItemLocation
from rest_framework import serializers
from users.models import UserAccount


class ItemLocationSerializer(serializers.ModelSerializer):
    users = serializers.SlugRelatedField(
        many=True, slug_field="username", queryset=UserAccount.objects.all()
    )

    class Meta:  # type: ignore
        model = ItemLocation
        fields = ["id", "name", "users"]

    def create(self, validated_data) -> ItemLocation:
        item_location = ItemLocation.objects.create(
            name=validated_data["name"],
        )
        users = UserAccount.objects.filter(
            username__in=validated_data.get("users", [])
        ).all()
        item_location.users.set(users)
        try:
            item_location.full_clean()
        except ValidationError as e:
            item_location.delete()
            raise serializers.ValidationError(e.message_dict)
        item_location.save()
        return item_location

    def update(self, instance, validated_data):
        name = validated_data.get("name", instance.name).strip()
        self.validate_new_name(name, instance.id)
        return super().update(instance, validated_data)

    def validate_new_name(self, name, self_id):
        name = name.strip()
        if not name:
            raise serializers.ValidationError("Name cannot be empty")
        saved_instance = ItemLocation.objects.filter(name__iexact=name).first()
        if saved_instance and saved_instance.id != self_id:
            raise serializers.ValidationError(
                {"name": f"ItemLocation with name {name} already exists"}
            )
        return name

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
        return super().to_internal_value(data)

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
