from django.urls import path
from knox import views as knox_views

from .views import (
    FrictionEventsList,
    IsAdminView,
    LoginView,
    MeView,
    PossibleFriction,
    ProblemReportsList,
    UserAccountsDetail,
    UserAccountsList,
)

urlpatterns = [
    path("/auth/login", LoginView.as_view(), name="knox_login"),
    path("/auth/logout", knox_views.LogoutView.as_view(), name="knox_logout"),
    path(
        "/auth/logoutall",
        knox_views.LogoutAllView.as_view(),
        name="knox_logoutall",
    ),
    path("/auth/is-admin", IsAdminView.as_view(), name="is_admin"),
    path(
        "/feedback/friction-events",
        FrictionEventsList.as_view(),
        name="friction_events",
    ),
    path(
        "/feedback/reports",
        ProblemReportsList.as_view(),
        name="problem_reports",
    ),
    path(
        "/feedback/possible-friction",
        PossibleFriction.as_view(),
        name="possible_friction",
    ),
    path("", UserAccountsList.as_view(), name="user_accounts"),
    path("/<int:user_id>", UserAccountsDetail.as_view(), name="user_account"),
    path("/me", MeView.as_view(), name="me"),
]
