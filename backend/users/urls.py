from django.urls import path
from knox import views as knox_views

from .views import LoginView, UserView

urlpatterns = [
    path("auth/login/", LoginView.as_view(), name="knox_login"),
    path("auth/logout/", knox_views.LogoutView.as_view(), name="knox_logout"),
    path(
        "auth/logoutall/",
        knox_views.LogoutAllView.as_view(),
        name="knox_logoutall",
    ),
    path("me", UserView.as_view(), name="me"),
]
