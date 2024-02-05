import pytest
from items.models import ItemLocation, Vendor
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
