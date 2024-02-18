from django.contrib.auth import login
from django.shortcuts import get_object_or_404
from knox.views import LoginView as KnoxLoginView
from rest_framework import permissions, status
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from utils.responses import APIResponses

from .models import UserAccount
from .serializers import UserAccountSerializer


class LoginView(KnoxLoginView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request: Request, format=None):
        serializer = AuthTokenSerializer(data=request.data)
        if not serializer.is_valid():
            return APIResponses.unauthorized(serializer.errors)
        user = serializer.validated_data["user"]
        login(request, user)
        return super(LoginView, self).post(request, format=None)


class IsAdminView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request: Request):
        return Response({}, status=status.HTTP_200_OK)


class UserAccountsDetail(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def delete(self, request: Request, user_id: int):
        user = get_object_or_404(UserAccount, id=user_id)
        user.delete()
        return APIResponses.deleted()


class UserAccountsList(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request: Request):
        params = request.GET
        include_admins = (
            params.get("include_admins", "false").lower() == "true"
        )
        if include_admins:
            users = UserAccount.objects.all().prefetch_related(
                "item_locations"
            )
        else:
            users = UserAccount.objects.filter(
                is_admin=False
            ).prefetch_related("item_locations")
        serializer = UserAccountSerializer(users, many=True)
        return APIResponses.ok(serializer.data)

    def post(self, request: Request):
        serializer = UserAccountSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return APIResponses.created({"id": user.id, "username": user.username})
