from django.shortcuts import get_object_or_404
from items.models import ItemLocation, Sale
from items.serializers.location import ItemLocationSerializer
from items.serializers.order import (
    OrderHistorySerializer,
    SaleHistorySerializer,
)
from rest_framework import permissions
from rest_framework.request import Request
from rest_framework.views import APIView
from users.models import UserAccount
from utils.permissions import ReadOnlyUserPermission
from utils.responses import APIResponses


class ItemLocationsDetail(APIView):
    permission_classes = (
        permissions.IsAuthenticated,
        ReadOnlyUserPermission,
    )
    lookup_url_kwarg = "id"

    def get(self, request: Request, id: int):
        user = request.user
        assert isinstance(user, UserAccount)

        if user.is_admin:
            item_location = get_object_or_404(ItemLocation, id=id)
        else:
            item_location = get_object_or_404(
                ItemLocation, id=id, users__in=[user]
            )

        serializer = ItemLocationSerializer(item_location)
        return APIResponses.ok(serializer.data)

    def delete(self, request: Request, id: int):
        item_location = get_object_or_404(ItemLocation, id=id)
        item_location.delete()
        return APIResponses.deleted()

    def patch(self, request: Request, id: int):
        item_location = get_object_or_404(ItemLocation, id=id)
        serializer = ItemLocationSerializer(
            item_location, request.data, partial=True
        )

        serializer.is_valid(raise_exception=True)
        serializer.save()
        return APIResponses.ok(serializer.data)


class ItemLocationsList(APIView):
    permission_classes = (
        permissions.IsAuthenticated,
        ReadOnlyUserPermission,
    )

    def post(self, request: Request):
        serializer = ItemLocationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return APIResponses.created(serializer.data)

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
        return APIResponses.ok(serialized)


class ItemLocationsHistory(APIView):
    permission_classes = (permissions.IsAdminUser,)

    def get(self, request: Request, location_id: int):
        location = get_object_or_404(ItemLocation, id=location_id)

        try:
            page = max(int(request.GET.get("page", 1)), 1)
            page_size = min(max(int(request.GET.get("page_size", 10)), 1), 25)
        except ValueError:
            return APIResponses.bad_request({"page": ["Page and page size must be whole numbers."]})

        orders = location.orders.prefetch_related("sales").order_by("-id")  # type: ignore
        if query := request.GET.get("q", "").strip():
            orders = orders.filter(name__icontains=query)
        total = orders.count()
        orders = orders[(page - 1) * page_size:page * page_size]

        serialized_orders = list()
        for order in orders:
            serialized_order = OrderHistorySerializer(order).data

            serialized_sales = list()
            for sale in order.sales.all():
                serialized_sales.append(SaleHistorySerializer(sale).data)

            serialized_order["sales"] = serialized_sales
            serialized_orders.append(serialized_order)

        return APIResponses.ok({
            "results": serialized_orders,
            "pagination": {
                "page": page,
                "pageSize": page_size,
                "total": total,
                "hasNext": page * page_size < total,
            },
        })
