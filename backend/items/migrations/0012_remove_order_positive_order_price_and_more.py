# Generated by Django 5.0.1 on 2024-02-06 18:47

import django.db.models.functions.text
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("items", "0011_historicalsale_sale_sale_unique_sale_and_more"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name="order",
            name="positive_order_price",
        ),
        migrations.RemoveConstraint(
            model_name="order",
            name="unique_order_name",
        ),
        migrations.RemoveConstraint(
            model_name="sale",
            name="unique_sale",
        ),
        migrations.RemoveConstraint(
            model_name="sale",
            name="positive_sale_price",
        ),
        migrations.RenameField(
            model_name="historicalorder",
            old_name="price",
            new_name="price_per_item",
        ),
        migrations.RenameField(
            model_name="historicalsale",
            old_name="price",
            new_name="price_per_item",
        ),
        migrations.RenameField(
            model_name="order",
            old_name="price",
            new_name="price_per_item",
        ),
        migrations.RenameField(
            model_name="sale",
            old_name="price",
            new_name="price_per_item",
        ),
        migrations.AddConstraint(
            model_name="order",
            constraint=models.UniqueConstraint(
                django.db.models.functions.text.Lower("name"),
                models.F("location_id"),
                models.F("date"),
                models.F("price_per_item"),
                models.F("quantity"),
                name="unique_order_name",
            ),
        ),
        migrations.AddConstraint(
            model_name="order",
            constraint=models.CheckConstraint(
                check=models.Q(("price_per_item__gt", 0)),
                name="positive_order_price",
            ),
        ),
        migrations.AddConstraint(
            model_name="sale",
            constraint=models.UniqueConstraint(
                models.F("order_id"),
                models.F("vendor_id"),
                models.F("date"),
                models.F("quantity"),
                models.F("price_per_item"),
                name="unique_sale",
            ),
        ),
        migrations.AddConstraint(
            model_name="sale",
            constraint=models.CheckConstraint(
                check=models.Q(("price_per_item__gt", 0)),
                name="positive_sale_price",
            ),
        ),
    ]
