from functools import partial

from django.urls import reverse

vendor_list_url = partial(reverse, "vendors")
vendor_detail_url = partial(reverse, "vendor_detail")

from items.tests.factories import item_location_factory, vendor_factory
from rest_framework.test import APIClient
from users.tests.factories import user_factory


def test_user_can_create_vendor(
    api_client: APIClient, user_factory, item_location_factory
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    assert location.is_visible_to(user)
    api_client.force_authenticate(user=user)
    data = {"name": "Test Vendor", "locationId": location.id}
    response = api_client.post(
        vendor_list_url(),
        data=data,
        format="json",
    )
    assert response.status_code == 201, response.json()
    assert response.json()["name"] == data["name"]
    assert response.json()["location"] == location.name


def test_user_cannot_create_vendor_for_location_they_dont_have_access_to(
    api_client: APIClient, user_factory, item_location_factory
):
    user, _ = user_factory()
    location = item_location_factory()
    assert not location.is_visible_to(user)
    api_client.force_authenticate(user=user)
    data = {"name": "Test Vendor", "locationId": location.id}
    response = api_client.post(
        vendor_list_url(),
        data=data,
        format="json",
    )
    assert response.status_code == 400, response.json()


def test_user_can_access_vendor_list(
    api_client: APIClient, user_factory, item_location_factory, vendor_factory
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    vendor, _ = vendor_factory(location=location)
    api_client.force_authenticate(user=user)
    response = api_client.get(
        vendor_list_url(),
    )
    assert response.status_code == 200, response.json()
    vendors = response.json()
    assert len(vendors) == 1
    assert vendors[0]["location"] == location.name


def test_user_cannot_access_vendor_list_for_location_they_dont_have_access_to(
    api_client: APIClient, user_factory, item_location_factory, vendor_factory
):
    user, _ = user_factory()
    location = item_location_factory()
    vendor, _ = vendor_factory(location=location)
    api_client.force_authenticate(user=user)
    data = {"locationId": location.id}
    response = api_client.get(
        vendor_list_url(),
        data=data,
        format="json",
    )
    assert response.status_code == 403, response.json()


def test_user_without_access_gets_empty_list_when_no_location_is_provided(
    api_client: APIClient, user_factory, item_location_factory, vendor_factory
):
    user, _ = user_factory()
    location = item_location_factory()
    vendor, _ = vendor_factory(location=location)
    api_client.force_authenticate(user=user)
    response = api_client.get(
        vendor_list_url(),
    )
    assert response.status_code == 200, response.json()


def test_user_can_edit_vendor(
    api_client: APIClient, user_factory, item_location_factory, vendor_factory
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    vendor, _ = vendor_factory(location=location)
    api_client.force_authenticate(user=user)
    data = {"name": "New Vendor", "locationId": location.id}
    response = api_client.patch(
        vendor_detail_url(kwargs={"vendor_id": vendor.id}),
        data=data,
        format="json",
    )
    assert response.status_code == 200, response.json()
    assert response.json()["name"] == data["name"]
    assert response.json()["location"] == location.name


def test_user_can_delete_vendor(
    api_client: APIClient, user_factory, item_location_factory, vendor_factory
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    vendor, _ = vendor_factory(location=location)
    api_client.force_authenticate(user=user)
    response = api_client.delete(
        vendor_detail_url(kwargs={"vendor_id": vendor.id}),
    )
    assert response.status_code == 204
