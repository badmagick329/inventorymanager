# Generated by Django 5.0.1 on 2024-02-09 18:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("items", "0015_remove_order_unique_order_name"),
    ]

    operations = [
        migrations.AlterField(
            model_name="historicalorder",
            name="name",
            field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name="order",
            name="name",
            field=models.CharField(max_length=100),
        ),
    ]