from django.contrib.auth import login
from knox.views import LoginView as KnoxLoginView
from rest_framework import permissions, status
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserAccount
from .serializers import UserAccountWithLocationsSerializer


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
        return super(LoginView, self).post(request, format=None)


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
        return Response(
            {"message": "You are authenticated!"},
            status=status.HTTP_200_OK,
        )


class IsAdminView(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request: Request):
        return Response(
            {"message": "You are authenticated!"},
            status=status.HTTP_200_OK,
        )


class UserAccountsDetail(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def delete(self, request: Request, user_id: int):
        user = UserAccount.objects.filter(id=user_id).first()
        if not user:
            return Response(
                data={"error": "User not found"},
                status=status.HTTP_404_NOT_FOUND,
            )
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserAccountsList(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request: Request):
        users = UserAccount.objects.all().prefetch_related("item_locations")
        data = list()
        for user in users:
            data.append(UserAccountWithLocationsSerializer(user).data)
        return Response(
            data=data,
            status=status.HTTP_200_OK,
        )

    def post(self, request: Request):
        user = UserAccount.objects.create_user(
            username=request.data["username"].strip().lower(),
            password=request.data["password"],
        )
        return Response(
            data={"id": user.id, "username": user.username},
            status=status.HTTP_201_CREATED,
        )
