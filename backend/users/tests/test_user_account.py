import pytest
from knox.models import AuthToken
from rest_framework.test import APIClient
from users.models import UserAccount


@pytest.mark.django_db
def test_user_can_login(api_client: APIClient) -> None:
    user = UserAccount.objects.create_user(
        username="user",
        password="user",
    )
    assert isinstance(user, UserAccount)
    response = api_client.post(
        "/api/auth/login/",
        {
            "username": "user",
            "password": "user",
        },
        format="json",
    )
    assert response.status_code == 200
    assert "token" in response.data


@pytest.mark.django_db
def test_user_cant_access_admin_page(api_client: APIClient) -> None:
    UserAccount.objects.create_user(
        username="user",
        password="user",
    )
    api_client.login(username="user", password="user")
    response = api_client.get("/admin/")
    assert response.status_code != 200


@pytest.mark.django_db
def test_user_can_logout(api_client: APIClient) -> None:
    UserAccount.objects.create_user(
        username="user",
        password="user",
    )
    login_response = api_client.post(
        "/api/auth/login/",
        {
            "username": "user",
            "password": "user",
        },
        format="json",
    )
    assert login_response.status_code == 200
    assert "token" in login_response.data
    token = login_response.data["token"]
    api_client.credentials(HTTP_AUTHORIZATION="Token " + token)
    logout_response = api_client.post("/api/auth/logout/")
    assert logout_response.status_code == 204


@pytest.mark.django_db
def test_user_can_access_me_page(api_client: APIClient) -> None:
    user = UserAccount.objects.create_user(
        username="user",
        password="user",
    )
    api_client.login(username="user", password="user")
    token = AuthToken.objects.create(user=user)
    api_client.credentials(HTTP_AUTHORIZATION="Token " + str(token[1]))  # type: ignore
    response = api_client.get("/api/me")
    assert response.status_code == 200
    response_json = response.json()
    assert "user" in response_json["message"]
