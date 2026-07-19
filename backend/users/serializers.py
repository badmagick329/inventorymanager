from django.db.utils import IntegrityError
from rest_framework import serializers
from utils.errors import ErrorHandler, ValidationErrorWithMessage

from .models import FrictionEvent, ProblemReport, UserAccount


class FrictionEventSerializer(serializers.ModelSerializer):
    class Meta:  # type: ignore
        model = FrictionEvent
        fields = (
            "id",
            "action",
            "route",
            "location_id",
            "order_id",
            "status_code",
            "error",
            "created_at",
        )
        read_only_fields = ("id", "created_at")

    def validate_status_code(self, value):
        if value < 400:
            raise serializers.ValidationError("Must be a failed HTTP status.")
        return value

    def validate_error(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Must be an object.")
        if set(value) != {"field", "message"}:
            raise serializers.ValidationError(
                "Must contain only field and message."
            )
        if not all(isinstance(item, str) for item in value.values()):
            raise serializers.ValidationError("Values must be strings.")
        return value


class ProblemReportSerializer(serializers.ModelSerializer):
    user = serializers.CharField(source="user.username", read_only=True)
    friction_event = FrictionEventSerializer(read_only=True)

    class Meta:  # type: ignore
        model = ProblemReport
        fields = (
            "id",
            "user",
            "friction_event",
            "submitted_data",
            "created_at",
        )


class ProblemReportCreateSerializer(serializers.Serializer):
    friction_event_id = serializers.IntegerField(min_value=1)
    submitted_data = serializers.DictField()

    allowed_fields = {
        FrictionEvent.Action.ORDER_CREATE: {
            "name",
            "date",
            "quantity",
            "pricePerItem",
            "currentSalePrice",
        },
        FrictionEvent.Action.ORDER_UPDATE: {
            "name",
            "date",
            "quantity",
            "pricePerItem",
            "currentSalePrice",
        },
        FrictionEvent.Action.SALE_CREATE: {
            "vendor",
            "date",
            "quantity",
            "pricePerItem",
            "amountPaid",
        },
        FrictionEvent.Action.SALE_UPDATE: {
            "vendor",
            "date",
            "quantity",
            "pricePerItem",
            "amountPaid",
        },
    }

    def validate_submitted_data(self, value):
        if not all(
            item is None or isinstance(item, (str, int, float, bool))
            for item in value.values()
        ):
            raise serializers.ValidationError("Values must be simple JSON values.")
        return value

    def validate(self, attrs):
        event = self.context["friction_event"]
        allowed = self.allowed_fields[event.action]
        submitted_fields = set(attrs["submitted_data"])
        if submitted_fields - allowed:
            raise serializers.ValidationError(
                {"submitted_data": "Contains unsupported fields."}
            )
        return attrs


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
        except ValueError as e:
            raise ValidationErrorWithMessage(str(e))
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
