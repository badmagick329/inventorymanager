# Generated by Django 5.0.1 on 2024-02-09 18:19

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("items", "0016_alter_historicalorder_name_alter_order_name"),
    ]

    operations = [
        migrations.AlterField(
            model_name="historicalvendor",
            name="name",
            field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name="itemlocation",
            name="name",
            field=models.CharField(max_length=100),
        ),
        migrations.AlterField(
            model_name="vendor",
            name="name",
            field=models.CharField(max_length=100),
        ),
    ]
