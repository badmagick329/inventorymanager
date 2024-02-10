from functools import partial

from django.urls import reverse

sale_list_url = partial(reverse, "sales")
sale_detail_url = partial(reverse, "sale_detail")

from items.tests.factories import (
    item_location_factory,
    order_factory,
    sale_factory,
    vendor_factory,
)
from rest_framework.test import APIClient
from users.tests.factories import user_factory


def test_user_can_access_sale_list(
    api_client: APIClient, user_factory, item_location_factory, order_factory
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    order = order_factory(location=location)
    api_client.force_authenticate(user=user)
    response = api_client.get(sale_list_url(kwargs={"order_id": order.id}))
    assert response.status_code == 200, f"Response: {response.json()}"
    sales = response.json()
    assert len(sales) == 0


def test_users_without_access_cannot_see_sale_list(
    api_client: APIClient, user_factory, item_location_factory, order_factory
):
    user, _ = user_factory()
    location = item_location_factory()
    order = order_factory(location=location)
    api_client.force_authenticate(user=user)
    response = api_client.get(sale_list_url(kwargs={"order_id": order.id}))
    assert response.status_code == 403, f"Response: {response.json()}"


def test_admin_can_see_sale_list(
    api_client: APIClient, user_factory, item_location_factory, order_factory
):
    admin, _ = user_factory(is_admin=True)
    location = item_location_factory()
    order = order_factory(location=location)
    api_client.force_authenticate(user=admin)
    response = api_client.get(sale_list_url(kwargs={"order_id": order.id}))
    assert response.status_code == 200, f"Response: {response.json()}"
    sales = response.json()
    assert len(sales) == 0


def test_user_can_create_sale(
    api_client: APIClient,
    user_factory,
    item_location_factory,
    order_factory,
    vendor_factory,
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    order = order_factory(location=location)
    vendor, _ = vendor_factory(location=location)
    api_client.force_authenticate(user=user)
    data = {
        "orderId": order.id,
        "vendorId": vendor.id,
        "quantity": 10,
        "date": "2021-01-01",
        "pricePerItem": 10,
        "amountPaid": 50,
    }
    response = api_client.post(
        sale_list_url(kwargs={"order_id": order.id}),
        data=data,
        format="json",
    )
    assert response.status_code == 201, f"Response: {response.json()}"
    sale = response.json()
    assert sale["order"] == order.name
    assert sale["vendor"] == vendor.name


def test_user_without_access_cannot_create_sale(
    api_client: APIClient,
    user_factory,
    item_location_factory,
    order_factory,
    vendor_factory,
):
    user, _ = user_factory()
    location = item_location_factory()
    order = order_factory(location=location)
    vendor, _ = vendor_factory(location=location)
    api_client.force_authenticate(user=user)
    data = {
        "orderId": order.id,
        "vendorId": vendor.id,
        "quantity": 10,
        "date": "2021-01-01",
        "pricePerItem": 10,
        "amountPaid": 50,
    }
    response = api_client.post(
        sale_list_url(kwargs={"order_id": order.id}),
        data=data,
        format="json",
    )
    assert response.status_code == 403, f"Response: {response.json()}"


def test_admin_can_create_sale(
    api_client: APIClient,
    user_factory,
    item_location_factory,
    order_factory,
    vendor_factory,
):
    admin, _ = user_factory(is_admin=True)
    location = item_location_factory()
    order = order_factory(location=location)
    vendor, _ = vendor_factory(location=location)
    api_client.force_authenticate(user=admin)
    data = {
        "orderId": order.id,
        "vendorId": vendor.id,
        "quantity": 10,
        "date": "2021-01-01",
        "pricePerItem": 10,
        "amountPaid": 50,
    }
    response = api_client.post(
        sale_list_url(kwargs={"order_id": order.id}),
        data=data,
        format="json",
    )
    assert response.status_code == 201, f"Response: {response.json()}"
    sale = response.json()
    assert sale["order"] == order.name
    assert sale["vendor"] == vendor.name


def test_user_can_access_sale(
    api_client: APIClient,
    user_factory,
    item_location_factory,
    vendor_factory,
    order_factory,
    sale_factory,
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    order = order_factory(location=location)
    vendor, _ = vendor_factory(location=location)
    sale = sale_factory(order=order, vendor=vendor, user=user)
    api_client.force_authenticate(user=user)
    response = api_client.get(sale_detail_url(kwargs={"sale_id": sale.id}))
    assert response.status_code == 200, f"Response: {response.json()}"


def test_user_without_access_cannot_see_sale(
    api_client: APIClient,
    user_factory,
    item_location_factory,
    vendor_factory,
    order_factory,
    sale_factory,
):
    user, _ = user_factory()
    location = item_location_factory()
    order = order_factory(location=location)
    vendor, _ = vendor_factory(location=location)
    sale = sale_factory(order=order, vendor=vendor, user=user)
    api_client.force_authenticate(user=user)
    response = api_client.get(sale_detail_url(kwargs={"sale_id": sale.id}))
    assert response.status_code == 403, f"Response: {response.json()}"


def test_admin_can_see_sale(
    api_client: APIClient,
    user_factory,
    item_location_factory,
    vendor_factory,
    order_factory,
    sale_factory,
):
    admin, _ = user_factory(is_admin=True)
    location = item_location_factory()
    order = order_factory(location=location)
    vendor, _ = vendor_factory(location=location)
    sale = sale_factory(order=order, vendor=vendor, user=admin)
    api_client.force_authenticate(user=admin)
    response = api_client.get(sale_detail_url(kwargs={"sale_id": sale.id}))
    assert response.status_code == 200, f"Response: {response.json()}"


def test_user_can_delete_sale(
    api_client: APIClient,
    user_factory,
    item_location_factory,
    order_factory,
    vendor_factory,
    sale_factory,
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    order = order_factory(location=location)
    vendor, _ = vendor_factory(location=location)
    sale = sale_factory(order=order, vendor=vendor, user=user)
    api_client.force_authenticate(user=user)
    response = api_client.delete(sale_detail_url(kwargs={"sale_id": sale.id}))
    assert response.status_code == 204, f"Response: {response.json()}"


def test_user_without_access_cannot_delete_sale(
    api_client: APIClient,
    user_factory,
    item_location_factory,
    order_factory,
    vendor_factory,
    sale_factory,
):
    user, _ = user_factory()
    location = item_location_factory()
    order = order_factory(location=location)
    vendor, _ = vendor_factory(location=location)
    sale = sale_factory(order=order, vendor=vendor, user=user)
    api_client.force_authenticate(user=user)
    response = api_client.delete(sale_detail_url(kwargs={"sale_id": sale.id}))
    assert response.status_code == 403, f"Response: {response.json()}"


def test_admin_can_delete_sale(
    api_client: APIClient,
    user_factory,
    item_location_factory,
    order_factory,
    vendor_factory,
    sale_factory,
):
    admin, _ = user_factory(is_admin=True)
    location = item_location_factory()
    order = order_factory(location=location)
    vendor, _ = vendor_factory(location=location)
    sale = sale_factory(order=order, vendor=vendor, user=admin)
    api_client.force_authenticate(user=admin)
    response = api_client.delete(sale_detail_url(kwargs={"sale_id": sale.id}))
    assert response.status_code == 204, f"Response: {response.json()}"


def test_user_can_update_sale(
    api_client: APIClient,
    user_factory,
    item_location_factory,
    order_factory,
    vendor_factory,
    sale_factory,
):
    user, _ = user_factory()
    location = item_location_factory(users=[user])
    order = order_factory(location=location)
    vendor, _ = vendor_factory(location=location)
    sale = sale_factory(order=order, vendor=vendor, user=user)
    api_client.force_authenticate(user=user)
    data = {
        "quantity": 5,
        "date": None,
        "pricePerItem": 10,
        "amountPaid": 10,
        "orderId": order.id,
        "vendorId": vendor.id,
    }
    response = api_client.patch(
        sale_detail_url(kwargs={"sale_id": sale.id}),
        data=data,
        format="json",
    )
    assert response.status_code == 200, f"Response: {response.json()}"
    sale_response = response.json()
    assert sale_response["quantity"] == 5
    assert sale_response["date"] == None
