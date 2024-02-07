import pytest
from django.db import IntegrityError
from items.models import ItemLocation
from items.tests.factories import item_location_factory
from users.tests.factories import user_factory


def test_item_location_creation_without_users(item_location_factory):
    item_location = item_location_factory(full_clean=True)
    assert isinstance(item_location, ItemLocation)
    assert item_location.name == "Test Item Location"
    assert item_location.users.count() == 0


def test_item_locations_creation_with_users(
    item_location_factory, user_factory
):
    user1, _ = user_factory(username="user1")
    user2, _ = user_factory(username="user2")
    item_location = item_location_factory(
        users=[user1, user2], full_clean=True
    )
    assert isinstance(item_location, ItemLocation)
    assert item_location.name == "Test Item Location"
    assert item_location.users.count() == 2
    assert user1 in item_location.users.all()
    assert user2 in item_location.users.all()


def test_adding_same_user_twice_does_not_create_two_entries(
    item_location_factory, user_factory
):
    user1, _ = user_factory(username="user1")
    item_location = item_location_factory()
    item_location.users.add(user1)
    item_location.users.add(user1)
    assert item_location.users.count() == 1


def test_item_location_creation_fails_with_non_unique_name(
    item_location_factory,
):
    item_location_factory(name="Test Item Location", full_clean=True)
    with pytest.raises(IntegrityError):
        ItemLocation.objects.create(
            name="Test Item Location",
        )


def test_item_location_shows_admin_has_access(
    item_location_factory, user_factory
):
    admin, _ = user_factory(username="admin", is_admin=True)
    item_location = item_location_factory()
    assert item_location.is_visible_to(admin) == True


def test_item_location_shows_user_has_access(
    item_location_factory, user_factory
):
    user, _ = user_factory(username="user")
    item_location = item_location_factory(users=[user])
    assert item_location.is_visible_to(user) == True


def test_item_location_shows_user_does_not_have_access(
    item_location_factory, user_factory
):
    user, _ = user_factory(username="user")
    item_location = item_location_factory()
    assert item_location.is_visible_to(user) == False
