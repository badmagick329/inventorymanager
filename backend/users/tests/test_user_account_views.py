from rest_framework.test import APIClient
from users.models import UserAccount
from users.tests.factories import user_factory


def test_user_can_login(api_client: APIClient, user_factory) -> None:
    user, password = user_factory()
    assert isinstance(user, UserAccount)
    response = api_client.post(
        "/api/users/auth/login",
        {
            "username": user.username,
            "password": password,
        },
        format="json",
    )
    assert response.status_code == 200
    assert "token" in response.data


def test_user_cant_access_admin_page(
    api_client: APIClient, user_factory
) -> None:
    user, password = user_factory()
    api_client.login(username=user.username, password=password)
    response = api_client.get("/admin/")
    assert response.status_code != 200


def test_user_can_logout(api_client: APIClient, user_factory) -> None:
    user, password = user_factory()
    login_response = api_client.post(
        "/api/users/auth/login",
        {
            "username": user.username,
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
