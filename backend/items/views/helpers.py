from items.models import ItemLocation, Order, Vendor
from users.models import UserAccount
from utils.responses import APIResponses


def forbidden_if_location_invisible(
    location: ItemLocation, user: UserAccount
):
    if not location.is_visible_to(user):
        return APIResponses.forbidden_location()
    return None


def forbidden_if_order_invisible(
    order: Order,
    user: UserAccount,
    use_location_message: bool = False,
):
    if not order.is_visible_to(user):
        if use_location_message:
            return APIResponses.forbidden_location()
        return APIResponses.forbidden_order()
    return None


def forbidden_if_vendor_invisible(vendor: Vendor, user: UserAccount):
    return forbidden_if_location_invisible(vendor.location, user)
