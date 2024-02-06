from django.contrib import admin

from .models import ItemLocation, Order, Sale, Vendor

admin.site.register(ItemLocation)
admin.site.register(Vendor)
admin.site.register(Order)
admin.site.register(Sale)
