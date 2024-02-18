from django.db.utils import IntegrityError
from rest_framework import serializers
from utils.errors import ErrorHandler

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
            raise ErrorHandler(e).error
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
