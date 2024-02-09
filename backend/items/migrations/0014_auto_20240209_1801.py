# Generated by Django 5.0.1 on 2024-02-09 18:01

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        (
            "items",
            "0013_remove_itemlocation_unique_item_location_name_and_more",
        ),
    ]

    operations = [
        migrations.RunSQL(
            "CREATE UNIQUE INDEX unique_case_insensitive_name ON items_order (LOWER(name), location_id, date, price_per_item, quantity);",
            "DROP INDEX unique_case_insensitive_name;"
        ),
    ]
