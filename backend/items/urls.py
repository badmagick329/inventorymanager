from django.urls import path

from .views import ItemLocationsDetail, ItemLocationsList

urlpatterns = [
    path("/locations", ItemLocationsList.as_view(), name="locations"),
    path(
        "/locations/<int:id>",
        ItemLocationsDetail.as_view(),
        name="location",
    ),
]
