from rest_framework import permissions, status
from rest_framework.permissions import BasePermission
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from users.models import UserAccount

from .models import ItemLocation
from .serializers import ItemLocationSerializer


class ItemLocationPermission(BasePermission):
    ADMIN_METHODS = ["POST", "PUT", "DELETE", "PUT"]

    def has_permission(self, request, view):
        user = request.user
        assert isinstance(user, UserAccount)
        if user.is_admin:
            return True
        return request.method not in self.ADMIN_METHODS


class ItemLocations(APIView):
    permission_classes = (
        permissions.IsAuthenticated,
        ItemLocationPermission,
    )

    def post(self, request: Request):
        serializer = ItemLocationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )
        serializer.create(serializer.validated_data)
        return Response(
            data=serializer.validated_data,
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
