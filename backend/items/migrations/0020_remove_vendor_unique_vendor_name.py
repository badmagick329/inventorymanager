# Generated by Django 5.0.1 on 2024-02-12 14:39

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("items", "0019_remove_sale_positive_sale_debt_and_more"),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name="vendor",
            name="unique_vendor_name",
        ),
    ]
