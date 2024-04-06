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

        if location_id := params.get("location_id"):
            location = get_object_or_404(ItemLocation, id=location_id)
            if not location.is_visible_to(user):
                return APIResponses.forbidden_location()
            vendors = location.vendors.all()  # type: ignore
        else:
            all_locations = [
                l for l in ItemLocation.objects.all() if l.is_visible_to(user)
            ]
            vendors = Vendor.objects.filter(location__in=all_locations)

        # TODO: Refactor this
        try:
            order_id = int(params.get("order_id", ""))
        except (TypeError, ValueError):
            order_id = None
        if order_id:
            filtered_vendors = [
                v
                for v in Vendor.vendors_by_order(order_id)
                if v.is_visible_to(user)
            ]
            print("filtered_vendors", filtered_vendors)
            serialized_data = [
                VendorSerializer.to_representation_for(v, order_id)
                for v in filtered_vendors
            ]
        else:
            serializer = VendorSerializer(vendors, many=True)
            serialized_data = serializer.data

        return APIResponses.ok(serialized_data)

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
