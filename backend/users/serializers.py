from django.db.utils import IntegrityError
from rest_framework import serializers

from .models import UserAccount


class UserAccountSerializer(serializers.ModelSerializer):
    class Meta:  # type: ignore
        model = UserAccount
        fields = ("id", "username", "password")
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data) -> UserAccount:
        try:
            user = UserAccount.objects.create_user(
                username=validated_data["username"],
                password=validated_data["password"],
            )
        except IntegrityError as e:
            if "users_useraccount_username_key" in str(e):
                error = {"username": ["Username already in use"]}
            else:
                error = {
                    "name": [
                        "Error during creation. Please check the input data"
                    ]
                }
            raise serializers.ValidationError(error)
        return user

    def to_internal_value(self, data):
        return data

    def to_representation(self, instance: UserAccount):
        return {
            "id": instance.id,  # type: ignore
            "username": instance.username,
            "locations": [
                {
                    "id": location.id,
                    "name": location.name,
                    "users": [user.username for user in location.users.all()],
                }
                for location in instance.item_locations.all()  # type: ignore
            ],
        }
