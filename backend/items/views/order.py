from django.core.exceptions import ValidationError
from django.db.models import Q
from django.shortcuts import get_object_or_404
from items.models import ItemLocation, Order
from items.responses import APIResponses
from items.serializers.order import OrderSerializer
from rest_framework import permissions
from rest_framework.request import Request
from rest_framework.views import APIView
from users.models import UserAccount


class OrderDetail(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request, order_id: int):
        user = request.user
        assert isinstance(user, UserAccount)
        order = get_object_or_404(Order, id=order_id)
        if not order.is_visible_to(user):
            return APIResponses.forbidden_order()

        serializer = OrderSerializer(order)
        return APIResponses.ok(serializer.data)

    def patch(self, request: Request, order_id: int):
        user = request.user
        assert isinstance(user, UserAccount)
        order = get_object_or_404(Order, id=order_id)
        if not order.is_visible_to(user):
            return APIResponses.forbidden_order()
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
        order = get_object_or_404(Order, id=order_id)
        if not order.is_visible_to(user):
            return APIResponses.forbidden_order()
        order.delete()
        return APIResponses.deleted()


class OrderList(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request, location_id: int):
        user = request.user
        assert isinstance(user, UserAccount)
        location = get_object_or_404(ItemLocation, id=location_id)
        if not location.is_visible_to(user):
            return APIResponses.forbidden_location()
        orders = OrderList.filter_orders_for(user, location)
        serializer = OrderSerializer(orders, many=True)
        return APIResponses.ok(serializer.data)

    def post(self, request: Request, location_id: int):
        user = request.user
        assert isinstance(user, UserAccount)

        location = get_object_or_404(ItemLocation, id=location_id)
        if not location.is_visible_to(user):
            return APIResponses.forbidden_location()

        initial_data = {
            **request.data,
            "user": user,
            "locationId": location_id,
        }
        serializer = OrderSerializer(data=initial_data)
        if not serializer.is_valid():
            return APIResponses.bad_request(serializer.errors)
        serializer.save()
        return APIResponses.created(serializer.data)

    @staticmethod
    def filter_orders_for(user: UserAccount, location: ItemLocation):
        filters = [Q(location=location)]
        if not user.is_admin:
            filters.append(Q(location__users__in=[user]))

        return Order.objects.filter(*filters)
