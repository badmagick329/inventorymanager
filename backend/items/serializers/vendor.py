from rest_framework import serializers


class VendorSerializer(serializers.BaseSerializer):
    def to_representation(self, instance):
        return {
            "id": instance.id,
            "name": instance.name,
            "location": instance.location.name,
            "debt": instance.debt(),
        }
