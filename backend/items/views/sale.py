from django.shortcuts import get_object_or_404
from items.models import Order, Sale
from items.serializers.sale import SaleSerializer
from items.views.helpers import forbidden_if_order_invisible
from rest_framework import permissions
from rest_framework.request import Request
from rest_framework.views import APIView
from users.models import UserAccount
from utils.errors import ValidationErrorWithMessage
from utils.responses import APIResponses


class SaleDetail(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request, sale_id: int):
        user = request.user
        assert isinstance(user, UserAccount)
        sale = get_object_or_404(Sale, id=sale_id, deleted=False)
        if forbidden_response := forbidden_if_order_invisible(
            sale.order, user
        ):
            return forbidden_response

        serializer = SaleSerializer(sale)
        return APIResponses.ok(serializer.data)

    def patch(self, request: Request, sale_id: int):
        user = request.user
        assert isinstance(user, UserAccount)
        sale = get_object_or_404(Sale, id=sale_id, deleted=False)
        if forbidden_response := forbidden_if_order_invisible(
            sale.order, user
        ):
            return forbidden_response
        initial_data = {
            **request.data,
            "user": user,
        }
        try:
            serializer = SaleSerializer(sale, data=initial_data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
        except ValidationErrorWithMessage as e:
            raise ValidationErrorWithMessage(e.message_dict)
        return APIResponses.ok(serializer.data)

    def delete(self, request: Request, sale_id: int):
        user = request.user
        assert isinstance(user, UserAccount)
        sale = get_object_or_404(Sale, id=sale_id, deleted=False)
        if forbidden_response := forbidden_if_order_invisible(
            sale.order, user
        ):
            return forbidden_response
        sale.mark_as_deleted(user)
        return APIResponses.deleted()


class SaleList(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request, order_id: int):
        user = request.user
        assert isinstance(user, UserAccount)
        order = get_object_or_404(Order, id=order_id, deleted=False)
        if forbidden_response := forbidden_if_order_invisible(
            order, user, use_location_message=True
        ):
            return forbidden_response
        sales = Sale.objects.filter(order=order, deleted=False)
        serializer = SaleSerializer(sales, many=True)
        return APIResponses.ok(serializer.data)

    def post(self, request: Request, order_id: int):
        user = request.user
        assert isinstance(user, UserAccount)

        order = get_object_or_404(Order, id=order_id)
        if forbidden_response := forbidden_if_order_invisible(order, user):
            return forbidden_response

        initial_data = {
            **request.data,
            "user": user,
            "orderId": order_id,
        }

        try:
            serializer = SaleSerializer(data=initial_data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
        except ValidationErrorWithMessage as e:
            raise ValidationErrorWithMessage(e.message_dict)
        return APIResponses.created(serializer.data)
