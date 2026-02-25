from items.tests.factories import item_location_factory, order_factory, vendor_factory
from items.views.helpers import (
    forbidden_if_location_invisible,
    forbidden_if_order_invisible,
    forbidden_if_vendor_invisible,
)
from users.tests.factories import user_factory


def test_forbidden_if_location_invisible_returns_403_for_non_member(
    user_factory, item_location_factory
):
    user, _ = user_factory()
    location = item_location_factory()

    response = forbidden_if_location_invisible(location, user)
    assert response is not None
    assert response.status_code == 403


def test_forbidden_if_order_invisible_returns_none_for_admin(
    user_factory, item_location_factory, order_factory
):
    admin_user, _ = user_factory(is_admin=True)
    location = item_location_factory()
    order = order_factory(location=location)

    response = forbidden_if_order_invisible(order, admin_user)
    assert response is None


def test_forbidden_if_vendor_invisible_returns_403_for_non_member(
    user_factory, vendor_factory
):
    user, _ = user_factory()
    vendor, _ = vendor_factory()

    response = forbidden_if_vendor_invisible(vendor, user)
    assert response is not None
    assert response.status_code == 403
