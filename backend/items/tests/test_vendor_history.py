import pytest
from consts import HistoryType as ht
from items.models import HistoricalVendor, Vendor  # type: ignore
from items.tests.factories import item_location_factory, vendor_factory
from users.tests.factories import user_factory


def test_vendor_edits_create_historical_records(vendor_factory):
    vendor, item_location = vendor_factory("Test Vendor", "Test Item Location")
    assert vendor.history.count() == 1
    vendor.name = "New Vendor"
    vendor.save()
    assert vendor.history.count() == 2


def test_vendor_deletion_creates_historical_record(vendor_factory):
    vendor, item_location = vendor_factory("Test Vendor", "Test Item Location")
    assert vendor.history.count() == 1
    vendor.delete()
    history = HistoricalVendor.objects.all()
    assert history.count() == 2
    assert history.first().history_type == ht.DELETE
    assert history.last().history_type == ht.CREATE


def test_vendor_history_has_correct_values(vendor_factory):
    vendor, item_location = vendor_factory("Test Vendor", "Test Item Location")
    vendor.name = "New Vendor"
    vendor.save()
    assert vendor.history.first().name == "New Vendor"
    assert vendor.history.last().name == "Test Vendor"
    assert vendor.history.last().history_type == ht.CREATE
    assert vendor.history.first().history_type == ht.EDIT


def test_vendor_history_tracks_for_multiple_entries(vendor_factory):
    vendor, item_location = vendor_factory("Test Vendor", "Test Item Location")
    vendor.name = "New Vendor"
    vendor.save()
    vendor2, item_location2 = vendor_factory(
        "Test Vendor2", "Test Item Location2"
    )
    vendor2.name = "New Vendor2"
    vendor2.save()
    history = HistoricalVendor.objects.all()
    assert history.count() == 4
    assert history[0].history_type == ht.EDIT
    assert history[1].history_type == ht.CREATE
    assert history[2].history_type == ht.EDIT
    assert history[3].history_type == ht.CREATE
    vendor2.delete()
    history = HistoricalVendor.objects.all()
    assert history.count() == 5
    assert history[0].history_type == ht.DELETE


def test_vendor_history_has_user_information(vendor_factory, user_factory):
    vendor, item_location = vendor_factory("Test Vendor", "Test Item Location")
    user, _ = user_factory()
    vendor.name = "New Vendor"
    vendor.save(user=user)
    assert vendor.history.first().history_user == user


@pytest.mark.skip(reason="Not implemented")
def test_vendor_deletion_can_be_reverted(vendor_factory):
    vendor, item_location = vendor_factory("Test Vendor", "Test Item Location")
    vendor.delete()
    history = HistoricalVendor.objects.all()
    assert history.count() == 2
    history[1].instance.save()
    assert Vendor.objects.count() == 1
    saved_vendor = Vendor.objects.first()
    assert saved_vendor is not None
    assert saved_vendor.name == "Test Vendor"


@pytest.mark.django_db
@pytest.mark.skip(reason="Not implemented")
def test_vendor_edit_can_be_reverted(item_location_factory, user_factory):
    item_location = item_location_factory()
    user, _ = user_factory()
    vendor = Vendor.objects.create(
        name="Test Vendor", location=item_location, last_modified_by=user
    )
    vendor.name = "New Vendor"
    vendor.save(user=user)
    history = HistoricalVendor.objects.all()
    assert history.count() == 2
    assert history[0].history_type == ht.EDIT
    history[1].instance.save()
    assert HistoricalVendor.objects.count() == 3
    history = HistoricalVendor.objects.all()
    assert history[0].history_type == ht.EDIT


@pytest.mark.django_db
@pytest.mark.skip(reason="Not implemented")
def test_reverting_to_current_state_does_not_create_new_history_entry_using_helper_method(
    vendor_factory,
):
    vendor, item_location = vendor_factory("Test Vendor", "Test Item Location")
    history = HistoricalVendor.objects.all()
    assert history.count() == 1
    vendor.revert_to_history_instance(history[0])
    assert history.count() == 1
    vendor.revert_to_history_id(history[0].id)
    assert history.count() == 1
