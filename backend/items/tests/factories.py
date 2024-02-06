from datetime import datetime

import pytest
from items.models import ItemLocation, Order, Vendor
from users.models import UserAccount


@pytest.fixture
def item_location_factory(db):
    def create_item_locations(
        name="Test Item Location", full_clean=False, users=None
    ):
        item_location = ItemLocation.objects.create(name=name)
        if users:
            item_location.users.set(users)
        if full_clean:
            item_location.full_clean()
        item_location.save()

        return item_location

    return create_item_locations


@pytest.fixture
def vendor_factory(db):
    def create_vendors(name="Test Vendor", location_name="Test Item Location"):
        item_location = ItemLocation.objects.create(name=location_name)
        vendor = Vendor.objects.create(name=name, location=item_location)
        return vendor, item_location

    return create_vendors


@pytest.fixture
def order_factory(db):
    def create_orders(
        name: str = "Test Order",
        location: str | ItemLocation = "Test Item Location",
        user: str | UserAccount = "Test User",
        date: str | datetime = "1970-01-01",
        price: float = 1000.0,
        quantity: int = 10,
        current_sale_price: float = 200.0,
    ):
        match location:
            case str():
                item_location = ItemLocation.objects.create(name=location)
            case ItemLocation():
                item_location = location
            case _:
                raise ValueError("Invalid location")
        match user:
            case str():
                user = UserAccount.objects.create(username=user)
            case UserAccount():
                user = user
            case _:
                raise ValueError("Invalid user")
        match date:
            case str():
                date = datetime.strptime(date, "%Y-%m-%d")
            case datetime():
                date = date
            case _:
                raise ValueError("Invalid date")
        order = Order.objects.create(
            name=name,
            location=item_location,
            date=date,
            price=price,
            quantity=quantity,
            current_sale_price=current_sale_price,
            last_modified_by=user,
        )
        return order

    return create_orders
