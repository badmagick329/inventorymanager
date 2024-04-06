from django.core.exceptions import ValidationError
from django.db.utils import IntegrityError
from items.models import ItemLocation, Vendor
from rest_framework import serializers
from utils.errors import ErrorHandler, ValidationErrorWithMessage


class VendorSerializer(serializers.BaseSerializer):

    def create(self, validated_data):
        name = validated_data["name"]
        location_id = validated_data["locationId"]
        location = ItemLocation.objects.filter(id=location_id).first()
        if not location or not location.is_visible_to(validated_data["user"]):
            raise ValidationErrorWithMessage(
                {"location_id": ["Location for this vendor was not found"]}
            )
        vendor = Vendor(name=name, location=location)
        try:
            vendor.save(user=validated_data["user"])
        except ValidationError as e:
            raise ValidationErrorWithMessage(e.message_dict)
        except IntegrityError as e:
            raise ErrorHandler(e).error
        return vendor

    def update(self, instance, validated_data):
        instance.name = validated_data.get("name", instance.name)
        location_id = validated_data.get("locationId")
        location = ItemLocation.objects.filter(id=location_id).first()
        if not location:
            raise ValidationErrorWithMessage(
                {"location_id": ["Location for this vendor was not found"]}
            )
        instance.location = location
        try:
            instance.save()
        except ValidationError as e:
            raise ValidationErrorWithMessage(e.message_dict)
        except IntegrityError as e:
            raise ErrorHandler(e).error
        return instance

    def to_internal_value(self, data):
        name = data.get("name").strip() if data.get("name") else None
        location_id = data.get("locationId")
        user = data.get("user")
        return {
            "name": name,
            "locationId": location_id,
            "user": user,
        }

    def to_representation(self, instance):
        return {
            "id": instance.id,
            "name": instance.name,
            "location": instance.location.name,
            "debt": instance.debt(),
        }

    @classmethod
    def to_representation_for(cls, instance, order_id: int):
        return {
            "id": instance.id,
            "name": instance.name,
            "location": instance.location.name,
            "debt": instance.debt(order_id=order_id),
        }
