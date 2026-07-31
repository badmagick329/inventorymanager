from django.contrib.auth import login
from datetime import timedelta

from django.db import transaction
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

import json

from django.http import StreamingHttpResponse
from items.models import ItemLocation

from .assistant import configuration, estimated_cost, stream_answer
from .models import AssistantConversation, AssistantDailyUsage, AssistantMessage, FrictionEvent, ProblemReport, UserAccount
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


ASSISTANT_DAILY_LIMIT = 50


def assistant_quota(user):
    usage, _ = AssistantDailyUsage.objects.get_or_create(user=user, date=timezone.localdate())
    return {"used": usage.requests, "limit": ASSISTANT_DAILY_LIMIT, "remaining": max(0, ASSISTANT_DAILY_LIMIT - usage.requests), "reset": str(timezone.localdate() + timedelta(days=1))}


def assistant_location(user, location_id):
    if not str(location_id).isdigit():
        return None
    location = ItemLocation.objects.filter(id=location_id).first()
    if not location or not location.is_visible_to(user):
        return None
    return location


class AssistantConversationView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request):
        user = request.user
        assert isinstance(user, UserAccount)
        location = assistant_location(user, request.GET.get("location_id"))
        if not location:
            return Response({"error": "Open the assistant from a school page."}, status=status.HTTP_400_BAD_REQUEST)
        conversation_id = request.GET.get("conversation_id")
        conversations = AssistantConversation.objects.filter(user=user, location=location)
        conversation = conversations.filter(id=conversation_id).first() if conversation_id else None
        messages = [] if not conversation else [{"id": item.id, "role": item.role, "text": item.content, "model": item.model or None, "usage": item.usage, "estimatedCostUsd": item.estimated_cost_usd} for item in conversation.messages.all()]
        return APIResponses.ok({"conversationId": conversation.id if conversation else None, "messages": messages, "quota": assistant_quota(user), "model": __import__("os").environ.get("OPENAI_MODEL", "gpt-5.6-luna"), "reasoningEffort": __import__("os").environ.get("OPENAI_REASONING_EFFORT", "high")})

    def delete(self, request: Request):
        user = request.user
        assert isinstance(user, UserAccount)
        AssistantConversation.objects.filter(id=request.GET.get("conversation_id"), user=user).delete()
        return APIResponses.deleted()


class AssistantMessageView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request: Request):
        user = request.user
        assert isinstance(user, UserAccount)
        location = assistant_location(user, request.data.get("locationId"))
        if not location:
            return Response({"error": "Open the assistant from a school page."}, status=status.HTTP_400_BAD_REQUEST)
        message = request.data.get("message", "").strip()
        if not message:
            return APIResponses.bad_request({"message": ["A message is required."]})
        try:
            configuration()
        except RuntimeError as error:
            return Response({"error": str(error), "quota": assistant_quota(user)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        with transaction.atomic():
            conversation_id = request.data.get("conversationId")
            if conversation_id:
                conversation = AssistantConversation.objects.filter(id=conversation_id, user=user, location=location).first()
                if not conversation:
                    return Response({"error": "That chat is not available for this school."}, status=status.HTTP_404_NOT_FOUND)
            usage, _ = AssistantDailyUsage.objects.select_for_update().get_or_create(user=user, date=timezone.localdate())
            if usage.requests >= ASSISTANT_DAILY_LIMIT:
                return Response({"error": "Daily assistant limit reached.", "quota": assistant_quota(user)}, status=status.HTTP_429_TOO_MANY_REQUESTS)
            usage.requests += 1
            usage.save()
            if not conversation_id:
                conversation = AssistantConversation.objects.create(user=user, location=location)
            AssistantMessage.objects.create(conversation=conversation, role=AssistantMessage.Role.USER, content=message)
        history = [{"role": item.role, "content": item.content} for item in conversation.messages.order_by("-created_at")[1:21]][::-1]

        def sse(event, data):
            return "event: %s\ndata: %s\n\n" % (event, json.dumps(data, default=str))

        def generate():
            text = ""
            started = False
            try:
                yield sse("conversation", {"conversationId": conversation.id, "quota": assistant_quota(user)})
                for event, data in stream_answer(user, location.id, message, history):
                    started = True
                    if event == "delta":
                        text += data
                        yield sse("delta", {"delta": data})
                    else:
                        if not text:
                            text = "I couldn’t produce a response. Please try again."
                            yield sse("delta", {"delta": text})
                        model = data["model"]
                        usage = data["usage"]
                        cost = estimated_cost(usage, model)
                        saved = AssistantMessage.objects.create(conversation=conversation, role=AssistantMessage.Role.ASSISTANT, content=text, model=model, usage=usage, estimated_cost_usd=cost)
                        yield sse("complete", {"id": saved.id, "usage": usage, "estimatedCostUsd": cost, "quota": assistant_quota(user)})
            except Exception as error:
                if not started:
                    with transaction.atomic():
                        usage = AssistantDailyUsage.objects.select_for_update().get(user=user, date=timezone.localdate())
                        usage.requests = max(0, usage.requests - 1)
                        usage.save(update_fields=["requests"])
                yield sse("error", {"error": str(error) if isinstance(error, RuntimeError) else "The assistant could not complete that request.", "quota": assistant_quota(user)})

        response = StreamingHttpResponse(generate(), content_type="text/event-stream")
        response["Cache-Control"] = "no-cache"
        response["X-Accel-Buffering"] = "no"
        return response
