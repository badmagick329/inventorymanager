from django.urls import path
from items.views.location import ItemLocationsDetail, ItemLocationsList
from items.views.order import OrderDetail, OrderList
from items.views.sale import SaleDetail, SaleList
from items.views.vendor import VendorList

urlpatterns = [
    path("/locations", ItemLocationsList.as_view(), name="locations"),
    path(
        "/locations/<int:id>",
        ItemLocationsDetail.as_view(),
        name="location",
    ),
    path("/orders/<int:location_id>", OrderList.as_view(), name="orders"),
    path(
        "/orders/detail/<int:order_id>",
        OrderDetail.as_view(),
        name="order_detail",
    ),
    path("/sales/<int:order_id>", SaleList.as_view(), name="sales"),
    path(
        "/sales/detail/<int:sale_id>",
        SaleDetail.as_view(),
        name="sale_detail",
    ),
    path(
        "/vendors/",
        VendorList.as_view(),
        name="vendors",
    ),
]
