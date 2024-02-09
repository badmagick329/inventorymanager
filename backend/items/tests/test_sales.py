from datetime import datetime

import pytest
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from items.models import Order, Sale
from items.tests.factories import (
    item_location_factory,
    order_factory,
    sale_factory,
    vendor_factory,
)
from users.tests.factories import user_factory


def test_sales_creation(sale_factory, order_factory, vendor_factory):
    order = order_factory("Test Order", "Test Item Location", "Test User")
    vendor, _ = vendor_factory("Test Vendor", order.location)
    sale = sale_factory(order, vendor, user=order.last_modified_by)
    assert Sale.objects.count() == 1
    assert sale.order == order
    assert sale.date == datetime(1970, 1, 1, 0, 0).date()
    assert sale.vendor == vendor


def test_sales_creation_without_order_fails(sale_factory, vendor_factory):
    vendor, _ = vendor_factory("Test Vendor", "Test Location")
    with pytest.raises(IntegrityError):
        sale_factory(None, vendor)


def test_sales_creation_without_vendor_fails(sale_factory, order_factory):
    order = order_factory("Test Order", "Test Item Location", "Test User")
    with pytest.raises(IntegrityError):
        sale_factory(order, None)


def test_sales_creation_with_negative_debt_fails(
    sale_factory, order_factory, vendor_factory
):
    order = order_factory("Test Order", "Test Item Location", "Test User")
    vendor, _ = vendor_factory("Test Vendor", order.location)
    with pytest.raises(IntegrityError):
        sale_factory(order, vendor, debt=-1)


def test_sales_creation_with_zero_debt_succeeds(
    sale_factory, order_factory, vendor_factory
):
    order = order_factory("Test Order", "Test Item Location", "Test User")
    vendor, _ = vendor_factory("Test Vendor", order.location)
    sale = sale_factory(order, vendor, debt=0, user=order.last_modified_by)
    assert sale.debt == 0


def test_debt_is_initialised_correctly_on_creation(
    sale_factory, order_factory, vendor_factory
):
    order = order_factory("Test Order", "Test Item Location", "Test User")
    vendor, _ = vendor_factory("Test Vendor", order.location)
    sale: Sale = sale_factory(
        order, vendor, debt=None, user=order.last_modified_by
    )
    assert sale.debt == sale.potential_revenue()


def test_debt_cannot_be_edited_to_be_negative(
    sale_factory, order_factory, vendor_factory
):
    order = order_factory("Test Order", "Test Item Location", "Test User")
    vendor, _ = vendor_factory("Test Vendor", order.location)
    sale = sale_factory(order, vendor, user=order.last_modified_by)
    assert sale.debt == sale.potential_revenue()
    with pytest.raises(ValidationError):
        sale.debt = -1
        sale.full_clean()


def test_debt_cannot_be_higher_than_potential_revenue(
    sale_factory, order_factory, vendor_factory
):
    order = order_factory("Test Order", "Test Item Location", "Test User")
    vendor, _ = vendor_factory("Test Vendor", order.location)
    sale = sale_factory(order, vendor, user=order.last_modified_by)
    assert sale.debt == sale.potential_revenue()
    with pytest.raises(ValidationError):
        sale.debt = sale.potential_revenue() + 1
        sale.full_clean()


def test_multiple_vendors_can_create_sales_on_same_order(
    sale_factory, order_factory, vendor_factory
):
    order = order_factory("Test Order", "Test Item Location", "Test User")
    vendor1, _ = vendor_factory("Test Vendor 1", order.location)
    vendor2, _ = vendor_factory("Test Vendor 2", order.location)
    sale1 = sale_factory(order, vendor1, user=order.last_modified_by)
    sale2 = sale_factory(order, vendor2, user=order.last_modified_by)
    assert Sale.objects.count() == 2
    assert sale1.order == order
    assert sale2.order == order
