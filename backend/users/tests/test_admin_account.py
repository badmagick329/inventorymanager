import pytest
from knox.models import AuthToken
from rest_framework.test import APIClient
from users.models import UserAccount


@pytest.mark.django_db
def test_admin_can_login(api_client: APIClient) -> None:
    """
    Test login
    :param api_client: APIClient
    :return: None
    """
    admin_user = UserAccount.objects.create_superuser(
        username="admin",
        password="admin",
    )
    assert isinstance(admin_user, UserAccount)
    response = api_client.post(
        "/api/auth/login/",
        {
            "username": "admin",
            "password": "admin",
        },
        format="json",
    )
    assert response.status_code == 200
    assert "token" in response.data


@pytest.mark.django_db
def test_admin_can_access_admin_page(api_client: APIClient) -> None:
    """
    Test admin can access admin page
    :param api_client: APIClient
    :return: None
    """
    UserAccount.objects.create_superuser(
        username="admin",
        password="admin",
    )
    api_client.login(username="admin", password="admin")
    response = api_client.get("/admin/")
    assert response.status_code == 200
    assert "Log in" not in str(response.content)
    assert "Log out" in str(response.content)


@pytest.mark.django_db
def test_admin_can_logout(api_client: APIClient) -> None:
    """
    Test admin can logout
    :param api_client: APIClient
    :return: None
    """
    UserAccount.objects.create_superuser(
        username="admin",
        password="admin",
    )
    login_response = api_client.post(
        "/api/auth/login/",
        {
            "username": "admin",
            "password": "admin",
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
def test_admin_can_access_me_page(api_client: APIClient) -> None:
    """
    Test admin can access me page
    :param api_client: APIClient
    :return: None
    """
    admin_user = UserAccount.objects.create_superuser(
        username="admin",
        password="admin",
    )
    api_client.login(username="admin", password="admin")
    token = AuthToken.objects.create(user=admin_user)
    api_client.credentials(HTTP_AUTHORIZATION="Token " + str(token[1]))  # type: ignore
    response = api_client.get("/api/me")
    assert response.status_code == 200
    assert "admin" in str(response.content)
    response_json = response.json()
    assert "admin" in response_json["message"]
