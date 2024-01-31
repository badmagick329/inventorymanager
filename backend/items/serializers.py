from rest_framework import serializers
from users.models import UserAccount

from .models import ItemLocation


class ItemLocationSerializer(serializers.ModelSerializer):
    users = serializers.SlugRelatedField(
        many=True, slug_field="username", queryset=UserAccount.objects.all()
    )

    class Meta:  # type: ignore
        model = ItemLocation
        fields = ["id", "name", "users"]

    def validate_users(self, users):
        if not users:
            return users
        for user in users:
            if not user.is_active:
                raise serializers.ValidationError(
                    f"User {user.username} is not active"
                )
        return users

    def create(self, validated_data) -> ItemLocation:
        item_location = ItemLocation.objects.create(
            name=validated_data["name"],
        )
        users = UserAccount.objects.filter(
            username__in=validated_data.get("users", [])
        ).all()
        item_location.users.set(users)
        item_location.save()
        return item_location

    def update(self, instance, validated_data):
        # users = validated_data.get("users", [])
        # user_accounts = UserAccount.objects.filter(username__in=users).all()
        return super().update(instance, validated_data)

    def to_internal_value(self, data):
        if hasattr(data, "_mutable"):
            data._mutable = True
        if "users" in data:
            data["users"] = [user.strip().lower() for user in data["users"]]
        if "name" in data:
            data["name"] = data["name"].strip().lower()
        if hasattr(data, "_mutable"):
            data._mutable = False
        return super().to_internal_value(data)

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        return representation
