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
        if not location:
            raise ValidationErrorWithMessage(
                {"location_id": ["Location for this order was not found"]}
            )
        vendor = Vendor(name=name, location=location)
        try:
            vendor.save()
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
                {"location_id": ["Location for this order was not found"]}
            )
        instance.location = location
        try:
            instance.save()
        except ValidationError as e:
            raise ValidationErrorWithMessage(e.message_dict)
        except IntegrityError as e:
            raise ErrorHandler(e).error

    def to_internal_value(self, data):
        name = data.get("name").strip() if data.get("name") else None
        location_id = data.get("locationId")
        return {
            "name": name,
            "locationId": location_id,
        }

    def to_representation(self, instance):
        return {
            "id": instance.id,
            "name": instance.name,
            "location": instance.location.name,
            "debt": instance.debt(),
        }
