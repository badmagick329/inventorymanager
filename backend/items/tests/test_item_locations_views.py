from functools import partial

import pytest
from django.urls import reverse
from items.models import ItemLocation
from items.tests.cases import (
    LOCATION_LIST_POST_LABELS,
    LOCATION_LIST_POST_VALUES,
    LOCATION_PATCH_LABELS,
    LOCATION_PATCH_VALUES,
)
from items.tests.factories import item_location_factory
from rest_framework.test import APIClient
from users.tests.factories import user_factory

LOCATIONS = reverse("locations")
location_url = partial(reverse, "location")


def raise_with(test_name, response, exception):
    raise Exception(
        (
            f"Test {test_name} failed with exception: "
            f"{exception}\n{response.json() if hasattr(response, 'json') else ''}"  # type: ignore
        )
    )


def test_user_can_access_item_locations_list(
    api_client: APIClient, user_factory
):
    user, _ = user_factory()
    api_client.force_authenticate(user=user)
    response = api_client.get(LOCATIONS)
    assert response.status_code == 200
    locations = response.json()
    assert len(locations) == 0


def test_user_can_see_item_locations_with_permission_only(
    api_client: APIClient, item_location_factory, user_factory
):
    user, _ = user_factory()
    item_location_factory(
        name="test item location", users=[user], full_clean=True
    )
    item_location_factory(name="test item location 2", full_clean=True)
    api_client.force_authenticate(user=user)
    response = api_client.get(LOCATIONS)
    assert response.status_code == 200
    locations = response.json()
    assert len(locations) == 1
    assert locations[0]["name"] == "test item location"


def test_admin_can_see_all_item_locations(
    api_client: APIClient, item_location_factory, user_factory
):
    admin, _ = user_factory(is_admin=True)
    item_location_factory(
        name="test item location", users=[admin], full_clean=True
    )
    item_location_factory(name="test item location 2", full_clean=True)
    api_client.force_authenticate(user=admin)
    response = api_client.get(LOCATIONS)
    assert response.status_code == 200
    locations = response.json()
    assert len(locations) == 2
    assert locations[0]["name"] == "test item location"
    assert locations[1]["name"] == "test item location 2"


@pytest.mark.parametrize(LOCATION_LIST_POST_LABELS, LOCATION_LIST_POST_VALUES)
def test_location_list_post_endpoint(
    api_client: APIClient,
    user_factory,
    item_location_factory,
    test_name: str,
    users: list[str],
    locations: list[str],
    post_data: dict,
    expected_status: int,
    expected_json: dict[str, str],
):
    response = None
    try:
        admin, _ = user_factory(is_admin=True)
        api_client.force_authenticate(user=admin)
        for location in locations:
            item_location_factory(name=location, full_clean=True)
        for user in users:
            user_factory(username=user)
        response = api_client.post(
            LOCATIONS,
            post_data,
            format="json",
        )
        assert response.status_code == expected_status
        if expected_json:
            del response.json()["id"]
            assert response.json() == expected_json
    except Exception as e:
        raise_with(test_name, response, e)


@pytest.mark.parametrize(LOCATION_PATCH_LABELS, LOCATION_PATCH_VALUES)
def test_locations_patch_endpoint(
    api_client: APIClient,
    user_factory,
    item_location_factory,
    test_name: str,
    users: list[str],
    locations: list[str],
    patch_data: dict,
    expected_status: int,
    expected_json: dict[str, str],
):
    response = None
    try:
        admin, _ = user_factory(is_admin=True)
        api_client.force_authenticate(user=admin)
        edit_id = 1
        for i, location in enumerate(locations):
            loc = item_location_factory(name=location, full_clean=True)
            if i == 0:
                edit_id = loc.id
        for user in users:
            user_factory(username=user)
        response = api_client.patch(
            location_url(kwargs={"id": edit_id}),
            patch_data,
            format="json",
        )
        assert response.status_code == expected_status
        if expected_json:
            assert response.json() == {**expected_json, "id": edit_id}
    except Exception as e:
        raise_with(test_name, response, e)


def test_item_location_can_be_deleted(
    api_client: APIClient,
    user_factory,
    item_location_factory,
):
    admin, _ = user_factory(is_admin=True)
    api_client.force_authenticate(user=admin)
    item_location = item_location_factory(name="test location")
    response = api_client.delete(location_url(kwargs={"id": item_location.id}))
    assert response.status_code == 204
    assert ItemLocation.objects.all().count() == 0


def test_non_existing_item_location_cannot_be_deleted(
    api_client: APIClient,
    user_factory,
    item_location_factory,
):
    admin, _ = user_factory(is_admin=True)
    api_client.force_authenticate(user=admin)
    response = api_client.delete(location_url(kwargs={"id": 1}))
    assert response.status_code == 404
    assert ItemLocation.objects.all().count() == 0


def test_item_location_with_users_can_be_deleted(
    api_client: APIClient,
    user_factory,
    item_location_factory,
):
    admin, _ = user_factory(is_admin=True)
    api_client.force_authenticate(user=admin)
    item_location = item_location_factory(name="test location", users=[admin])
    response = api_client.delete(location_url(kwargs={"id": item_location.id}))
    assert response.status_code == 204
    assert ItemLocation.objects.all().count() == 0


def test_admin_can_see_any_item_location(
    api_client: APIClient,
    user_factory,
    item_location_factory,
):
    admin, _ = user_factory(is_admin=True)
    api_client.force_authenticate(user=admin)
    item_location = item_location_factory(name="test location")
    response = api_client.get(location_url(kwargs={"id": item_location.id}))
    assert response.status_code == 200


def test_users_cant_see_item_location_without_permission(
    api_client: APIClient,
    user_factory,
    item_location_factory,
):
    user, _ = user_factory()
    api_client.force_authenticate(user=user)
    item_location = item_location_factory(name="test location")
    response = api_client.get(location_url(kwargs={"id": item_location.id}))
    assert response.status_code == 404
