from django.contrib.auth import login
from datetime import timedelta

from django.db.models import Count, Max
from django.shortcuts import get_object_or_404
from django.utils import timezone
from knox.views import LoginView as KnoxLoginView
from rest_framework import permissions, status
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from utils.permissions import ReadOnlyUserPermission
from utils.responses import APIResponses

from .models import FrictionEvent, ProblemReport, UserAccount
from .serializers import (
    FrictionEventSerializer,
    ProblemReportCreateSerializer,
    ProblemReportSerializer,
    UserAccountSerializer,
)


class LoginView(KnoxLoginView):
    permission_classes = (permissions.AllowAny,)
    throttle_classes = [AnonRateThrottle]

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
    permission_classes = (permissions.IsAuthenticated, ReadOnlyUserPermission)

    def delete(self, request: Request, user_id: int):
        user = get_object_or_404(UserAccount, id=user_id)
        user.delete()
        return APIResponses.deleted()

    def get(self, request: Request, user_id: int):
        user = get_object_or_404(UserAccount, id=user_id)
        if request.GET.get("name_only"):
            return APIResponses.ok({"username": user.username})

        serializer = UserAccountSerializer(user)
        return APIResponses.ok(serializer.data)


class MeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request):
        user = request.user
        assert isinstance(user, UserAccount)
        if request.GET.get("name_only"):
            return APIResponses.ok({"username": user.username})

        serializer = UserAccountSerializer(user)
        return APIResponses.ok(serializer.data)

    def patch(self, request: Request):
        user = request.user
        assert isinstance(user, UserAccount)
        old_password = request.data.get("password", "")
        if not user.check_password(raw_password=old_password):
            return APIResponses.bad_request(
                {"password": "Password is incorrect"}
            )
        new_password = request.data.get("newPassword")
        new_password2 = request.data.get("newPassword2")
        if new_password and new_password != new_password2:
            return APIResponses.bad_request(
                {"newPassword": "Passwords do not match"}
            )
        user.set_password(new_password)
        user.save()
        return APIResponses.ok({"message": "Password updated"})


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


class FrictionEventsList(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request: Request):
        user = request.user
        assert isinstance(user, UserAccount)
        serializer = FrictionEventSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        event = serializer.save(user=user)
        return APIResponses.created(FrictionEventSerializer(event).data)


class ProblemReportsList(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request):
        user = request.user
        assert isinstance(user, UserAccount)
        if not user.is_admin:
            return Response(status=status.HTTP_403_FORBIDDEN)
        reports = ProblemReport.objects.select_related(
            "user", "friction_event"
        ).all()
        return APIResponses.ok(ProblemReportSerializer(reports, many=True).data)

    def post(self, request: Request):
        user = request.user
        assert isinstance(user, UserAccount)
        event_id = request.data.get("friction_event_id")
        event = get_object_or_404(FrictionEvent, id=event_id)
        if event.user_id != user.id:
            return Response(status=status.HTTP_403_FORBIDDEN)
        serializer = ProblemReportCreateSerializer(
            data=request.data, context={"friction_event": event}
        )
        serializer.is_valid(raise_exception=True)
        if hasattr(event, "problem_report"):
            return APIResponses.bad_request(
                {"friction_event_id": ["This problem has already been reported."]}
            )
        report = ProblemReport.objects.create(
            friction_event=event,
            user=user,
            submitted_data=serializer.validated_data["submitted_data"],
        )
        return APIResponses.created(ProblemReportSerializer(report).data)


class PossibleFriction(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request: Request):
        since = timezone.now() - timedelta(days=30)
        summary = (
            FrictionEvent.objects.filter(created_at__gte=since)
            .values("action", "route", "error")
            .annotate(
                failure_count=Count("id"),
                affected_user_count=Count("user_id", distinct=True),
                last_occurred=Max("created_at"),
            )
            .order_by("-failure_count", "-last_occurred")
        )
        return APIResponses.ok(list(summary))
