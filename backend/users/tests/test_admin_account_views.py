from items.tests.factories import item_location_factory
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


def test_admin_can_create_user(api_client: APIClient, user_factory) -> None:
    admin_user, _ = user_factory(is_admin=True)
    api_client.force_authenticate(user=admin_user)
    response = api_client.post(
        "/api/users",
        {
            "username": "testuser",
            "password": "testuser123456",
        },
        format="json",
    )
    assert response.status_code == 201


def test_admin_can_delete_user(api_client: APIClient, user_factory) -> None:
    admin_user, password = user_factory(is_admin=True)
    api_client.force_authenticate(user=admin_user)
    user, _ = user_factory(username="testuser")
    response = api_client.delete(f"/api/users/{user.id}")
    assert response.status_code == 204


def test_admin_can_list_users(api_client: APIClient, user_factory) -> None:
    admin_user, password = user_factory(is_admin=True)
    api_client.force_authenticate(user=admin_user)
    user, _ = user_factory(username="testuser")
    response = api_client.get("/api/users")
    assert response.status_code == 200
    assert len(response.data) == 2
    assert response.data[0]["username"] == admin_user.username
    assert response.data[1]["username"] == user.username
    expected_user_keys = [
        "id",
        "username",
        "locations",
    ]
    for key in expected_user_keys:
        assert key in response.data[0]
        assert key in response.data[1]


def test_admin_gets_location_list_with_users(
    api_client: APIClient, user_factory, item_location_factory
) -> None:
    admin_user, password = user_factory(is_admin=True)
    api_client.force_authenticate(user=admin_user)
    user, _ = user_factory(username="testuser")
    item_location = item_location_factory()
    item_location.users.add(user)
    item_location.save()
    response = api_client.get("/api/users")
    assert response.status_code == 200
    assert len(response.data) == 2
    expected_location_keys = [
        "id",
        "name",
        "users",
    ]
    for key in expected_location_keys:
        assert key in response.data[1]["locations"][0]
