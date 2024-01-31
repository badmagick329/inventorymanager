from items.tests.factories import item_location_factory
from rest_framework.test import APIClient
from users.tests.factories import user_factory


def test_user_can_access_item_locations_list(
    api_client: APIClient, user_factory
):
    url = "/api/items/locations"
    user, _ = user_factory()
    api_client.force_authenticate(user=user)
    response = api_client.get(url)
    assert response.status_code == 200
    locations = response.json()["locations"]
    assert len(locations) == 0


def test_user_can_access_item_locations_with_permission_only(
    api_client: APIClient, item_location_factory, user_factory
):
    url = "/api/items/locations"
    user, _ = user_factory()
    item_location_factory(
        name="Test Item Location", users=[user], full_clean=True
    )
    item_location_factory(name="Test Item Location 2", full_clean=True)
    api_client.force_authenticate(user=user)
    response = api_client.get(url)
    assert response.status_code == 200
    locations = response.json()["locations"]
    assert len(locations) == 1
    assert locations[0] == "test item location"


def test_admin_can_access_all_item_locations(
    api_client: APIClient, item_location_factory, user_factory
):
    url = "/api/items/locations"
    admin, _ = user_factory(is_admin=True)
    item_location_factory(
        name="Test Item Location", users=[admin], full_clean=True
    )
    item_location_factory(name="Test Item Location 2", full_clean=True)
    api_client.force_authenticate(user=admin)
    response = api_client.get(url)
    assert response.status_code == 200
    locations = response.json()["locations"]
    assert len(locations) == 2
    assert locations[0] == "test item location"
    assert locations[1] == "test item location 2"


def test_admin_can_create_item_location(api_client: APIClient, user_factory):
    url = "/api/items/locations"
    admin, _ = user_factory(is_admin=True)
    api_client.force_authenticate(user=admin)
    response = api_client.post(url, {"name": "Test Item Location"})
    assert response.status_code == 201
    assert response.json()["name"] == "test item location"
    assert response.json()["users"] == []
