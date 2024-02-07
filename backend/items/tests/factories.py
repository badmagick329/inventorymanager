from datetime import datetime

import pytest
from items.models import ItemLocation, Order, Sale, Vendor
from users.models import UserAccount


@pytest.fixture
def item_location_factory(db):
    def create_item_locations(
        name: str = "Test Item Location",
        full_clean: bool = False,
        users: list[UserAccount] | None = None,
    ):
        item_location = ItemLocation.objects.create(name=name)
        if users:
            item_location.users.set(users)
        if full_clean:
            try:
                item_location.full_clean()
            except Exception as e:
                item_location.delete()
                raise e
        item_location.save()

        return item_location

    return create_item_locations


@pytest.fixture
def vendor_factory(db):
    def create_vendors(
        name: str = "Test Vendor",
        location: str | ItemLocation = "Test Item Location",
    ):
        base_username = "Test User"
        available_username = base_username
        idx = 0
        while UserAccount.objects.filter(username=available_username).exists():
            available_username = base_username + str(idx)
            idx += 1
        user = UserAccount.objects.create(username=available_username)
        match location:
            case str():
                item_location = ItemLocation.objects.create(
                    name=location,
                )
            case ItemLocation():
                item_location = location
        vendor = Vendor.objects.create(
            name=name, location=item_location, last_modified_by=user
        )
        return vendor, item_location

    return create_vendors


@pytest.fixture
def order_factory(db):
    def create_orders(
        name: str = "Test Order",
        location: str | ItemLocation = "Test Item Location",
        user: str | UserAccount = "Test User",
        date_string: str = "1970-01-01",
        price_per_item: float = 1000.0,
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
        date = datetime.strptime(date_string, "%Y-%m-%d").date()
        order = Order.objects.create(
            name=name,
            location=item_location,
            date=date,
            price_per_item=price_per_item,
            quantity=quantity,
            current_sale_price=current_sale_price,
            last_modified_by=user,
        )
        return order

    return create_orders


@pytest.fixture
def sale_factory(db):
    def create_sales(
        order: Order,
        vendor: Vendor,
        date_string: str = "1970-01-01",
        quantity: int = 5,
        price_per_item: float = 200.0,
        debt: float | None = None,
        user: str | UserAccount = "Test User",
    ):
        date = datetime.strptime(date_string, "%Y-%m-%d").date()
        match user:
            case str():
                user = UserAccount.objects.create(username=user)
            case UserAccount():
                user = user
            case _:
                raise ValueError("Invalid user")
        sale = Sale.objects.create(
            order=order,
            vendor=vendor,
            date=date,
            price_per_item=price_per_item,
            quantity=quantity,
            debt=debt,
            last_modified_by=user,
        )
        return sale

    return create_sales
