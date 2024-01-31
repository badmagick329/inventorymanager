from rest_framework import serializers
from users.models import UserAccount

from .models import ItemLocation


class ItemLocationSerializer(serializers.ModelSerializer):
    users = serializers.StringRelatedField(many=True)

    class Meta:  # type: ignore
        model = ItemLocation
        fields = ["name", "users"]

    def create(self, validated_data) -> ItemLocation:
        item_location = ItemLocation.objects.create(
            name=validated_data["name"],
        )
        users = UserAccount.objects.filter(
            username__in=validated_data.get("username", [])
        ).all()
        item_location.users.set(users)
        item_location.save()
        return item_location

    def to_internal_value(self, data):
        try:
            data._mutable = True
            if "username" in data:
                data["username"] = [
                    username.strip().lower() for username in data["username"]
                ]
            if "name" in data:
                data["name"] = data["name"].strip().lower()
        finally:
            data._mutable = False
        return super().to_internal_value(data)
