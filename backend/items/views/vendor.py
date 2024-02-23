from django.shortcuts import get_object_or_404
from items.models import ItemLocation, Vendor
from items.serializers.vendor import VendorSerializer
from rest_framework import permissions
from rest_framework.request import Request
from rest_framework.views import APIView
from users.models import UserAccount
from utils.responses import APIResponses


class VendorList(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request: Request):
        params = request.GET
        if location_id := params.get("location_id"):
            location = get_object_or_404(ItemLocation, id=location_id)
            vendors = location.vendors.all()  # type: ignore
        else:
            vendors = Vendor.objects.all()
        user = request.user
        assert isinstance(user, UserAccount)
        serializer = VendorSerializer(vendors, many=True)
        return APIResponses.ok(serializer.data)
