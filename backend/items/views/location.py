from django.shortcuts import get_object_or_404
from items.models import ItemLocation
from items.serializers.location import ItemLocationSerializer
from items.utils.errors import ValidationErrorWithMessage
from responses import APIResponses
from rest_framework import permissions
from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.views import APIView
from users.models import UserAccount


class ItemLocationPermission(BasePermission):
    ADMIN_METHODS = ["POST", "PUT", "DELETE", "PATCH"]

    def has_permission(self, request, view):
        user = request.user
        assert isinstance(user, UserAccount)
        if user.is_admin:
            return True
        return request.method not in self.ADMIN_METHODS


class ItemLocationsDetail(APIView):
    permission_classes = (
        permissions.IsAuthenticated,
        ItemLocationPermission,
    )
    lookup_url_kwarg = "id"

    def get(self, request: Request, id: int):
        user = request.user
        assert isinstance(user, UserAccount)

        if user.is_admin:
            item_location = get_object_or_404(ItemLocation, id=id)
        else:
            item_location = get_object_or_404(
                ItemLocation, id=id, users__in=[user]
            )

        serializer = ItemLocationSerializer(item_location)
        return APIResponses.ok(serializer.data)

    def delete(self, request: Request, id: int):
        item_location = get_object_or_404(ItemLocation, id=id)
        item_location.delete()
        return APIResponses.deleted()

    def patch(self, request: Request, id: int):
        item_location = get_object_or_404(ItemLocation, id=id)
        serializer = ItemLocationSerializer(
            item_location, request.data, partial=True
        )

        try:
            serializer.is_valid(raise_exception=True)
            serializer.save()
        except ValidationErrorWithMessage as e:
            return APIResponses.bad_request(e.message_dict)
        return APIResponses.ok(serializer.data)


class ItemLocationsList(APIView):
    permission_classes = (
        permissions.IsAuthenticated,
        ItemLocationPermission,
    )

    def post(self, request: Request):
        serializer = ItemLocationSerializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
            serializer.save()
        except ValidationErrorWithMessage as e:
            return APIResponses.bad_request(e.message_dict)
        return APIResponses.ok(serializer.data)

    def get(self, request: Request):
        user = request.user
        assert isinstance(user, UserAccount)
        if user.is_admin:
            locations = ItemLocation.objects.all()
            serialized = ItemLocationSerializer(locations, many=True).data
        else:
            locations = ItemLocation.objects.filter(users__in=[user]).all()
            serialized = [
                {"id": location.id, "name": location.name}
                for location in locations
            ]
        return APIResponses.ok(serialized)
