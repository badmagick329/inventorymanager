from functools import partial

import pytest
from django.urls import reverse

order_list_url = partial(reverse, "orders")
order_detail_url = partial(reverse, "order_detail")

from items.models import ItemLocation, Order
from items.tests.factories import item_location_factory, order_factory
from rest_framework.test import APIClient
from users.tests.factories import user_factory


def test_user_can_access_order_list(
    api_client: APIClient, user_factory, item_location_factory
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    api_client.force_authenticate(user=user)
    response = api_client.get(
        order_list_url(kwargs={"location_id": location.id})
    )
    assert response.status_code == 200
    orders = response.json()
    assert len(orders) == 0


def test_users_without_access_cannot_see_orders(
    api_client: APIClient, user_factory, item_location_factory, order_factory
):
    user, _ = user_factory()
    location = item_location_factory()
    order = order_factory(location=location)
    api_client.force_authenticate(user=user)
    response = api_client.get(
        order_list_url(kwargs={"location_id": location.id})
    )
    assert response.status_code == 403


def test_admin_can_see_all_orders(
    api_client: APIClient, user_factory, item_location_factory, order_factory
):
    admin, _ = user_factory(is_admin=True)
    location = item_location_factory()
    order = order_factory(location=location)
    api_client.force_authenticate(user=admin)
    response = api_client.get(
        order_list_url(kwargs={"location_id": location.id})
    )
    assert response.status_code == 200
    orders = response.json()
    assert len(orders) == 1
    assert orders[0]["id"] == order.id


def test_user_can_access_order_detail(
    api_client: APIClient, user_factory, item_location_factory, order_factory
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    order = order_factory(location=location)
    api_client.force_authenticate(user=user)
    response = api_client.get(order_detail_url(kwargs={"order_id": order.id}))
    assert response.status_code == 200
    assert response.json()["id"] == order.id


def test_users_without_access_cannot_see_order_detail(
    api_client: APIClient, user_factory, item_location_factory, order_factory
):
    user, _ = user_factory()
    location = item_location_factory()
    order = order_factory(location=location)
    api_client.force_authenticate(user=user)
    response = api_client.get(order_detail_url(kwargs={"order_id": order.id}))
    assert response.status_code == 403


def test_admin_can_see_order_detail(
    api_client: APIClient, user_factory, item_location_factory, order_factory
):
    admin, _ = user_factory(is_admin=True)
    location = item_location_factory()
    order = order_factory(location=location)
    api_client.force_authenticate(user=admin)
    response = api_client.get(order_detail_url(kwargs={"order_id": order.id}))
    assert response.status_code == 200
    assert response.json()["id"] == order.id


def test_user_can_delete_order(
    api_client: APIClient, user_factory, item_location_factory, order_factory
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    order = order_factory(location=location)
    api_client.force_authenticate(user=user)
    response = api_client.delete(
        order_detail_url(kwargs={"order_id": order.id})
    )
    assert response.status_code == 204


def test_users_without_access_cannot_delete_order(
    api_client: APIClient, user_factory, item_location_factory, order_factory
):
    user, _ = user_factory()
    location = item_location_factory()
    order = order_factory(location=location)
    api_client.force_authenticate(user=user)
    response = api_client.delete(
        order_detail_url(kwargs={"order_id": order.id})
    )
    assert response.status_code == 403


def test_admin_can_delete_any_order(
    api_client: APIClient, user_factory, item_location_factory, order_factory
):
    admin, _ = user_factory(is_admin=True)
    location = item_location_factory()
    order = order_factory(location=location)
    api_client.force_authenticate(user=admin)
    response = api_client.delete(
        order_detail_url(kwargs={"order_id": order.id})
    )
    assert response.status_code == 204


def test_user_can_create_order(
    api_client: APIClient, user_factory, item_location_factory
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    api_client.force_authenticate(user=user)
    data = {
        "name": "test order 2",
        "date": "2024-01-01",
        "pricePerItem": 0.5,
        "quantity": 10,
        "currentSalePrice": 200,
    }
    response = api_client.post(
        order_list_url(kwargs={"location_id": location.id}),
        data,
        format="json",
    )
    assert response.status_code == 201


def test_order_creation_fails_with_invalid_data(
    api_client: APIClient, user_factory, item_location_factory
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    api_client.force_authenticate(user=user)
    data = {
        "name": "test order 2",
        "date": "2024-01-01",
        "pricePerItem": "invalid",
        "quantity": 10,
        "currentSalePrice": 200,
    }
    response = api_client.post(
        order_list_url(kwargs={"location_id": location.id}),
        data,
        format="json",
    )
    assert response.status_code == 400


def test_order_creation_fails_with_invalid_date(
    api_client: APIClient, user_factory, item_location_factory
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    api_client.force_authenticate(user=user)
    data = {
        "name": "test order 2",
        "date": "2024-13-01",
        "pricePerItem": 0.5,
        "quantity": 10,
        "currentSalePrice": 200,
    }
    response = api_client.post(
        order_list_url(kwargs={"location_id": location.id}),
        data,
        format="json",
    )
    assert response.status_code == 400


def test_user_without_access_cannot_create_order(
    api_client: APIClient, user_factory, item_location_factory
):
    user, _ = user_factory()
    location = item_location_factory()
    api_client.force_authenticate(user=user)
    data = {
        "name": "test order 2",
        "date": "2024-01-01",
        "pricePerItem": 0.5,
        "quantity": 10,
        "currentSalePrice": 200,
    }
    response = api_client.post(
        order_list_url(kwargs={"location_id": location.id}),
        data,
        format="json",
    )
    assert response.status_code == 403


def test_admin_can_create_order(
    api_client: APIClient, user_factory, item_location_factory
):
    admin, _ = user_factory(is_admin=True)
    location = item_location_factory()
    api_client.force_authenticate(user=admin)
    data = {
        "name": "test order 2",
        "date": "2024-01-01",
        "pricePerItem": 0.5,
        "quantity": 10,
        "currentSalePrice": 200,
    }
    response = api_client.post(
        order_list_url(kwargs={"location_id": location.id}),
        data,
        format="json",
    )
    assert response.status_code == 201
    assert response.json()["name"] == "test order 2"


def test_user_can_update_order(
    api_client: APIClient, user_factory, item_location_factory, order_factory
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    order = order_factory(location=location)
    api_client.force_authenticate(user=user)
    data = {
        "name": "test order 3",
        "date": "2024-01-01",
        "pricePerItem": 0.5,
        "quantity": 10,
        "currentSalePrice": 200,
    }
    response = api_client.patch(
        order_detail_url(kwargs={"order_id": order.id}),
        data,
        format="json",
    )
    assert response.status_code == 200
    assert response.json()["id"] == order.id
    assert response.json()["name"] == "test order 3"


def test_user_without_access_cannot_update_order(
    api_client: APIClient, user_factory, item_location_factory, order_factory
):
    user, _ = user_factory()
    location = item_location_factory()
    order = order_factory(location=location)
    api_client.force_authenticate(user=user)
    data = {
        "name": "test order 3",
        "date": "2024-01-01",
        "pricePerItem": 0.5,
        "quantity": 10,
        "currentSalePrice": 200,
    }
    response = api_client.patch(
        order_detail_url(kwargs={"order_id": order.id}),
        data,
        format="json",
    )
    assert response.status_code == 403


def test_admin_can_update_order(
    api_client: APIClient, user_factory, item_location_factory, order_factory
):
    admin, _ = user_factory(is_admin=True)
    location = item_location_factory()
    order = order_factory(location=location)
    api_client.force_authenticate(user=admin)
    data = {
        "name": "test order 3",
        "date": "2024-01-01",
        "pricePerItem": 0.5,
        "quantity": 10,
        "currentSalePrice": 200,
    }
    response = api_client.patch(
        order_detail_url(kwargs={"order_id": order.id}),
        data,
        format="json",
    )
    assert response.status_code == 200
    assert response.json()["id"] == order.id
    assert response.json()["name"] == "test order 3"
