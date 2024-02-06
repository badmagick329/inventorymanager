from django.contrib import admin

from .models import ItemLocation, Order, Vendor

admin.site.register(ItemLocation)
admin.site.register(Vendor)
admin.site.register(Order)
