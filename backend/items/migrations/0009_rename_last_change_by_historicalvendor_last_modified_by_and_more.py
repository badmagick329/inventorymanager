# Generated by Django 5.0.1 on 2024-02-06 15:12

import django.db.models.deletion
import django.db.models.functions.text
import simple_history.models
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("items", "0008_historicalvendor_last_change_by_and_more"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RenameField(
            model_name="historicalvendor",
            old_name="last_change_by",
            new_name="last_modified_by",
        ),
        migrations.RenameField(
            model_name="vendor",
            old_name="last_change_by",
            new_name="last_modified_by",
        ),
        migrations.CreateModel(
            name="HistoricalOrder",
            fields=[
                ("id", models.IntegerField(blank=True, db_index=True)),
                ("name", models.CharField(db_index=True, max_length=100)),
                (
                    "price",
                    models.DecimalField(decimal_places=2, max_digits=10),
                ),
                ("quantity", models.IntegerField()),
                (
                    "current_sale_price",
                    models.DecimalField(decimal_places=2, max_digits=10),
                ),
                (
                    "created_at",
                    models.DateTimeField(blank=True, editable=False),
                ),
                (
                    "last_modified",
                    models.DateTimeField(blank=True, editable=False),
                ),
                (
                    "history_id",
                    models.AutoField(primary_key=True, serialize=False),
                ),
                ("history_date", models.DateTimeField(db_index=True)),
                (
                    "history_change_reason",
                    models.CharField(max_length=100, null=True),
                ),
                (
                    "history_type",
                    models.CharField(
                        choices=[
                            ("+", "Created"),
                            ("~", "Changed"),
                            ("-", "Deleted"),
                        ],
                        max_length=1,
                    ),
                ),
                (
                    "history_user",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="+",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "last_modified_by",
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name="+",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "location",
                    models.ForeignKey(
                        blank=True,
                        db_constraint=False,
                        null=True,
                        on_delete=django.db.models.deletion.DO_NOTHING,
                        related_name="+",
                        to="items.itemlocation",
                    ),
                ),
            ],
            options={
                "verbose_name": "historical Order",
                "verbose_name_plural": "historical Orders",
                "ordering": ("-history_date", "-history_id"),
                "get_latest_by": ("history_date", "history_id"),
            },
            bases=(simple_history.models.HistoricalChanges, models.Model),
        ),
        migrations.CreateModel(
            name="Order",
            fields=[
                ("id", models.AutoField(primary_key=True, serialize=False)),
                ("name", models.CharField(max_length=100, unique=True)),
                (
                    "price",
                    models.DecimalField(decimal_places=2, max_digits=10),
                ),
                ("quantity", models.IntegerField()),
                (
                    "current_sale_price",
                    models.DecimalField(decimal_places=2, max_digits=10),
                ),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("last_modified", models.DateTimeField(auto_now=True)),
                (
                    "last_modified_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="orders",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "location",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="orders",
                        to="items.itemlocation",
                    ),
                ),
            ],
            options={
                "verbose_name": "Order",
                "ordering": ["id"],
            },
        ),
        migrations.AddConstraint(
            model_name="order",
            constraint=models.UniqueConstraint(
                django.db.models.functions.text.Lower("name"),
                models.F("location_id"),
                name="unique_order_name",
            ),
        ),
        migrations.AddConstraint(
            model_name="order",
            constraint=models.CheckConstraint(
                check=models.Q(("name", ""), _negated=True),
                name="non_empty_order_name",
            ),
        ),
        migrations.AddConstraint(
            model_name="order",
            constraint=models.CheckConstraint(
                check=models.Q(("price__gt", 0)), name="positive_order_price"
            ),
        ),
        migrations.AddConstraint(
            model_name="order",
            constraint=models.CheckConstraint(
                check=models.Q(("quantity__gt", 0)),
                name="positive_order_quantity",
            ),
        ),
        migrations.AddConstraint(
            model_name="order",
            constraint=models.CheckConstraint(
                check=models.Q(("current_sale_price__gt", 0)),
                name="positive_order_current_sale_price",
            ),
        ),
    ]