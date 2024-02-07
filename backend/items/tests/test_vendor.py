import pytest
from django.core.exceptions import ValidationError
from items.models import Vendor
from items.tests.factories import item_location_factory, vendor_factory
from users.tests.factories import user_factory


@pytest.mark.django_db
def test_vendor_creation_without_location_fails():
    with pytest.raises(ValidationError):
        Vendor.objects.create(name="Test Vendor")


def test_vendor_creation_with_location(vendor_factory):
    vendor, item_location = vendor_factory("Test Vendor", "Test Item Location")
    assert vendor.name == "Test Vendor"
    assert vendor.location == item_location
    assert vendor.location.vendors.count() == 1
    assert vendor in item_location.vendors.all()


@pytest.mark.django_db
def test_vendor_creation_fails_with_non_unique_name(vendor_factory):
    _, item_location = vendor_factory("Test Vendor", "Test Item Location")
    with pytest.raises(ValidationError):
        Vendor.objects.create(name="test vendor", location=item_location)
