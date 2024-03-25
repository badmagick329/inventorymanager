from django.shortcuts import get_object_or_404
from items.models import ItemLocation, Vendor
from items.serializers.vendor import VendorSerializer
from rest_framework import permissions
from rest_framework.request import Request
from rest_framework.views import APIView
from users.models import UserAccount
from utils.errors import ValidationErrorWithMessage
from utils.responses import APIResponses


class VendorList(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request):
        params = request.GET
        user = request.user
        assert isinstance(user, UserAccount)
        if location_id := params.get("locationId"):
            location = get_object_or_404(ItemLocation, id=location_id)
            if not location.is_visible_to(user):
                return APIResponses.forbidden_location()
            vendors = location.vendors.all()  # type: ignore
        else:
            all_locations = [
                l for l in ItemLocation.objects.all() if l.is_visible_to(user)
            ]
            vendors = Vendor.objects.filter(location__in=all_locations)
        serializer = VendorSerializer(vendors, many=True)
        return APIResponses.ok(serializer.data)

    def post(self, request: Request):
        user = request.user
        assert isinstance(user, UserAccount)
        initial_data = {
            **request.data,
            "user": user,
        }
        try:
            serializer = VendorSerializer(data=initial_data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return APIResponses.created(serializer.data)
        except ValidationErrorWithMessage as e:
            raise ValidationErrorWithMessage(e.message_dict)


class VendorDetail(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def delete(self, request: Request, vendor_id: int):
        user = request.user
        assert isinstance(user, UserAccount)
        vendor = get_object_or_404(Vendor, id=vendor_id)
        if not vendor.location.is_visible_to(user):
            return APIResponses.forbidden_location()
        vendor.delete()
        return APIResponses.deleted()

    def patch(self, request: Request, vendor_id: int):
        user = request.user
        assert isinstance(user, UserAccount)
        vendor = get_object_or_404(Vendor, id=vendor_id)
        if not vendor.location.is_visible_to(user):
            return APIResponses.forbidden_location()
        initial_data = {
            **request.data,
            "user": user,
        }
        try:
            serializer = VendorSerializer(
                vendor, data=initial_data, partial=True
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return APIResponses.ok(serializer.data)
        except ValidationErrorWithMessage as e:
            raise ValidationErrorWithMessage(e.message_dict)
