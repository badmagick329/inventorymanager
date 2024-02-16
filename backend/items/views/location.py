from django.core.exceptions import ValidationError
from items.models import ItemLocation
from items.serializers.location import ItemLocationSerializer
from items.utils.serializers import stringify_error
from rest_framework import permissions, serializers, status
from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.response import Response
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
            item_location = ItemLocation.objects.filter(id=id).first()
        else:
            item_location = ItemLocation.objects.filter(
                id=id, users__in=[user]
            ).first()
        if not item_location:
            return Response(
                data={"errors": "Item location not found"},
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
                data={"errors": "Item location not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        item_location.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def patch(self, request: Request, id: int):
        item_location = ItemLocation.objects.filter(id=id).first()
        if not item_location:
            return Response(
                data={"errors": "Item location not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = ItemLocationSerializer(
            item_location, request.data, partial=True
        )

        try:
            serializer.is_valid(raise_exception=True)
            serializer.save()
        except serializers.ValidationError as e:
            return Response(
                data=stringify_error(e),
                status=status.HTTP_400_BAD_REQUEST,
            )
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
        try:
            serializer.is_valid(raise_exception=True)
            serializer.save()
        except serializers.ValidationError as e:
            return Response(
                data=stringify_error(e),
                status=status.HTTP_400_BAD_REQUEST,
            )
        return Response(
            data=serializer.data,
            status=status.HTTP_201_CREATED,
        )

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
        return Response(
            data=serialized,
            status=status.HTTP_200_OK,
        )
