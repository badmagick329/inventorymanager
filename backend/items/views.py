from pytest import fail
from rest_framework import permissions, status
from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from users.models import UserAccount

from .models import ItemLocation
from .serializers import ItemLocationSerializer


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
            item_location = ItemLocation.objects.filter(id=id).first()
        else:
            item_location = ItemLocation.objects.filter(
                id=id, users__in=[user]
            ).first()
        if not item_location:
            return Response(
                data={"error": "Item location not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = ItemLocationSerializer(item_location)
        return Response(
            data=serializer.data,
            status=status.HTTP_200_OK,
        )

    def delete(self, request: Request, id: int):
        item_location = ItemLocation.objects.filter(id=id).first()
        if not item_location:
            return Response(
                data={"error": "Item location not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        item_location.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def patch(self, request: Request, id: int):
        item_location = ItemLocation.objects.filter(id=id).first()
        if not item_location:
            return Response(
                data={"error": "Item location not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = ItemLocationSerializer(
            item_location, request.data, partial=True
        )
        if serializer.is_valid(raise_exception=True):
            serializer.save()
            return Response(
                data=serializer.data,
                status=status.HTTP_200_OK,
            )


class ItemLocationsList(APIView):
    permission_classes = (
        permissions.IsAuthenticated,
        ItemLocationPermission,
    )

    def post(self, request: Request):
        serializer = ItemLocationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.create(serializer.validated_data)
        return Response(
            data=serializer.data,
            status=status.HTTP_201_CREATED,
        )

    def get(self, request: Request):
        user = request.user
        assert isinstance(user, UserAccount)
        if user.is_admin:
            locations = ItemLocation.objects.all()
        else:
            locations = ItemLocation.objects.filter(users__in=[user]).all()
        location_names = [location.name for location in locations]
        return Response(
            {"locations": location_names},
            status=status.HTTP_200_OK,
        )
