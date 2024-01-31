from rest_framework import serializers

from .models import UserAccount


class UserAccountSerializer(serializers.ModelSerializer):
    class Meta:  # type: ignore
        model = UserAccount
        fields = ("id", "username", "password")
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data) -> UserAccount:
        user = UserAccount.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
        )
        return user
