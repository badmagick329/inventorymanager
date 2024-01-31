from django.urls import path

from .views import ItemLocations

urlpatterns = [
    path("locations", ItemLocations.as_view(), name="locations"),
]
