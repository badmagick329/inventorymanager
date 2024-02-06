import pytest
from consts import HistoryType as ht
from items.models import HistoricalOrder, Order  # type: ignore
from items.tests.factories import (
    item_location_factory,
    order_factory,
    vendor_factory,
)
from users.tests.factories import user_factory


def test_order_edits_create_historical_records(order_factory):
    order = order_factory("Test Order", "Test Item Location", "Test User")
    assert order.history.count() == 1
    order.name = "New Order"
    order.save()
    assert order.history.count() == 2


def test_order_deletion_creates_historical_record(order_factory):
    order = order_factory("Test Order", "Test Item Location", "Test User")
    assert order.history.count() == 1
    order.delete()
    history = HistoricalOrder.objects.all()
    assert history.count() == 2
    assert history.first().history_type == ht.DELETE
    assert history.last().history_type == ht.CREATE


def test_order_history_has_correct_values(order_factory):
    order = order_factory("Test Order", "Test Item Location", "Test User")
    order.name = "New Order"
    order.save()
    assert order.history.first().name == "New Order"
    assert order.history.last().name == "Test Order"
    assert order.history.last().history_type == ht.CREATE
    assert order.history.first().history_type == ht.EDIT


def test_order_history_tracks_for_multiple_entries(order_factory):
    order = order_factory("Test Order", "Test Item Location", "Test User")
    order.name = "New Order"
    order.save()
    order2 = order_factory("Test Order2", "Test Item Location2", "Test User2")
    order2.name = "New Order2"
    order2.save()
    history = HistoricalOrder.objects.all()
    assert history.count() == 4
    assert history[0].history_type == ht.EDIT
    assert history[1].history_type == ht.CREATE
    assert history[2].history_type == ht.EDIT
    assert history[3].history_type == ht.CREATE
    order2.delete()
    history = HistoricalOrder.objects.all()
    assert history.count() == 5
    assert history[0].history_type == ht.DELETE


def test_order_history_has_user_information(order_factory, user_factory):
    user, _ = user_factory()
    order = order_factory("Test Order", "Test Item Location", user)
    history = order.history.first()
    assert history.history_user == user
    user, _ = user_factory()
    order.name = "New Order"
    order.save(user=user)
    assert order.history.first().history_user == user
