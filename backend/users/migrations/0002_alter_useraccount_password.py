# Generated by Django 5.0.1 on 2024-01-24 21:40

import django.contrib.auth.password_validation
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0001_initial"),
    ]

    operations = [
        migrations.AlterField(
            model_name="useraccount",
            name="password",
            field=models.CharField(
                max_length=255,
                validators=[django.contrib.auth.password_validation.validate_password],
            ),
        ),
    ]
