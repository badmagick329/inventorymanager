from django.db import transaction
from django.db.models import Q
from django.shortcuts import get_object_or_404
from items.models import ItemLocation, Order
from items.views.helpers import (
    forbidden_if_location_invisible,
    forbidden_if_order_invisible,
)
from items.serializers.order import OrderSerializer
from rest_framework import permissions
from rest_framework.request import Request
from rest_framework.views import APIView
from users.models import UserAccount
from utils.responses import APIResponses


class OrderDetail(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request, order_id: int):
        user = request.user
        assert isinstance(user, UserAccount)
        order = get_object_or_404(Order, id=order_id, deleted=False)
        if forbidden_response := forbidden_if_order_invisible(order, user):
            return forbidden_response

        serializer = OrderSerializer(order)
        return APIResponses.ok(serializer.data)

    def patch(self, request: Request, order_id: int):
        user = request.user
        assert isinstance(user, UserAccount)
        with transaction.atomic():
            order = get_object_or_404(
                Order.objects.select_for_update(), id=order_id, deleted=False
            )
            if forbidden_response := forbidden_if_order_invisible(order, user):
                return forbidden_response
            initial_data = {
                **request.data,
                "user": user,
            }
            serializer = OrderSerializer(order, data=initial_data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return APIResponses.ok(serializer.data)

    def delete(self, request: Request, order_id: int):
        user = request.user
        assert isinstance(user, UserAccount)
        order = get_object_or_404(Order, id=order_id, deleted=False)
        if forbidden_response := forbidden_if_order_invisible(order, user):
            return forbidden_response
        order.mark_as_deleted(user)
        return APIResponses.deleted()


class OrderList(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request, location_id: int):
        user = request.user
        assert isinstance(user, UserAccount)
        location = get_object_or_404(ItemLocation, id=location_id)
        if forbidden_response := forbidden_if_location_invisible(
            location, user
        ):
            return forbidden_response
        orders = OrderList.filter_orders_for(user, location)
        serializer = OrderSerializer(orders, many=True)
        return APIResponses.ok(serializer.data)

    def post(self, request: Request, location_id: int):
        user = request.user
        assert isinstance(user, UserAccount)

        location = get_object_or_404(ItemLocation, id=location_id)
        if forbidden_response := forbidden_if_location_invisible(
            location, user
        ):
            return forbidden_response

        initial_data = {
            **request.data,
            "user": user,
            "locationId": location_id,
        }
        serializer = OrderSerializer(data=initial_data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return APIResponses.created(serializer.data)

    @staticmethod
    def filter_orders_for(user: UserAccount, location: ItemLocation):
        filters = [Q(location=location), Q(deleted=False)]
        if not user.is_admin:
            filters.append(Q(location__users__in=[user]))

        return Order.objects.filter(*filters)
