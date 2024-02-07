from datetime import datetime

import pytest
from django.core.exceptions import ValidationError
from items.models import Order, Sale
from items.tests.factories import (
    item_location_factory,
    order_factory,
    sale_factory,
    vendor_factory,
)
from users.tests.factories import user_factory


def test_order_creation(order_factory):
    order = order_factory(
        name="Test Order", location="Test Location", user="Test User"
    )
    assert Order.objects.count() == 1
    assert order.name == "Test Order"
    assert order.date == datetime(1970, 1, 1, 0, 0).date()


@pytest.mark.django_db
def test_order_creation_without_location_fails():
    with pytest.raises(ValidationError):
        Order.objects.create(
            name="Test Order",
            price_per_item=100,
            quantity=10,
            current_sale_price=200,
        )


def test_order_creation_fails_with_non_unique_name(order_factory):
    order_factory(
        name="Test Order", location="Test Location", user="Test User"
    )
    with pytest.raises(ValidationError):
        order_factory(
            name="Test Order", location="Test Location2", user="Test User2"
        )


def test_price_must_be_positive(order_factory):
    with pytest.raises(ValidationError):
        order_factory(price_per_item=0)


def test_current_price_must_be_positive(order_factory):
    with pytest.raises(ValidationError):
        order_factory(current_sale_price=-1)


def test_quantity_must_be_positive(order_factory):
    with pytest.raises(ValidationError):
        order_factory(quantity=0)


def test_order_cost_is_correct(order_factory):
    order = order_factory(price_per_item=100, quantity=10)
    assert order.cost() == 1000
