from django.contrib.auth import login
from knox.views import LoginView as KnoxLoginView
from rest_framework import permissions, status
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserAccount


class LoginView(KnoxLoginView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request: Request, format=None):
        serializer = AuthTokenSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors, status=status.HTTP_401_UNAUTHORIZED
            )
        user = serializer.validated_data["user"]
        login(request, user)
        response = super(LoginView, self).post(request, format=None)
        response.data["showAdmin"] = user.is_admin
        return response


class UserView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request):
        user = request.user
        return Response(
            {"message": f"Hello {user}", "showAdmin": False},
            status=status.HTTP_200_OK,
        )


class IsAuthedView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request):
        user_account = request.user
        show_admin = False
        match (user_account):
            case UserAccount(is_admin=True):
                show_admin = True
            case _:
                show_admin = False
        return Response(
            {"message": "You are authenticated!", "showAdmin": show_admin},
            status=status.HTTP_200_OK,
        )


class IsAdminView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request: Request):
        return Response(
            {"message": "You are authenticated!", "showAdmin": True},
            status=status.HTTP_200_OK,
        )
