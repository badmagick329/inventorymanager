from django.urls import path
from items.views.location import ItemLocationsDetail, ItemLocationsList
from items.views.order import OrderDetail, OrderList

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
]
