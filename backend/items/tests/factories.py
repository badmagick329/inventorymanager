import pytest
from items.models import ItemLocation
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
