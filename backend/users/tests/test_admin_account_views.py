from rest_framework.test import APIClient
from users.models import UserAccount
from users.tests.factories import user_factory


def test_admin_can_login(api_client: APIClient, user_factory) -> None:
    admin_user, password = user_factory(is_admin=True)
    assert isinstance(admin_user, UserAccount)
    response = api_client.post(
        "/api/users/auth/login",
        {
            "username": admin_user.username,
            "password": password,
        },
        format="json",
    )
    assert response.status_code == 200
    assert "token" in response.data


def test_admin_can_access_admin_page(
    api_client: APIClient, user_factory
) -> None:
    admin_user, password = user_factory(is_admin=True)
    api_client.login(username=admin_user.username, password=password)
    response = api_client.get("/admin/")
    assert response.status_code == 200
    assert "Log in" not in str(response.content)
    assert "Log out" in str(response.content)


def test_admin_can_logout(api_client: APIClient, user_factory) -> None:
    admin_user, password = user_factory(is_admin=True)
    login_response = api_client.post(
        "/api/users/auth/login",
        {
            "username": admin_user.username,
            "password": password,
        },
        format="json",
    )
    assert login_response.status_code == 200
    assert "token" in login_response.data
    token = login_response.data["token"]
    api_client.credentials(HTTP_AUTHORIZATION="Token " + token)
    logout_response = api_client.post("/api/users/auth/logout")
    assert logout_response.status_code == 204
