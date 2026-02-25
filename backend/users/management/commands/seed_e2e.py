import os

from django.core.management.base import BaseCommand
from django.db import connection
from items.models import ItemLocation
from users.models import UserAccount


class Command(BaseCommand):
    help = "Seed a deterministic baseline for Cypress e2e tests."

    def handle(self, *args, **options):
        admin_username = os.environ.get("E2E_ADMIN_USERNAME", "admin")
        admin_password = os.environ.get("E2E_ADMIN_PASSWORD", "test123")
        user_username = os.environ.get("E2E_USER_USERNAME", "TestUser")
        user_password = os.environ.get("E2E_USER_PASSWORD", "test123")
        location_name = os.environ.get(
            "E2E_LOCATION_NAME", "Cypress Test Location"
        )

        db_name = connection.settings_dict.get("NAME")
        db_host = connection.settings_dict.get("HOST")
        db_port = connection.settings_dict.get("PORT")
        self.stdout.write(
            self.style.WARNING(
                "Seeding e2e baseline on "
                f"db={db_name} host={db_host} port={db_port}"
            )
        )

        admin, _ = UserAccount.objects.update_or_create(
            username=admin_username,
            defaults={"is_admin": True, "is_superuser": True, "is_active": True},
        )
        admin.set_password(admin_password)
        admin.save()

        user, _ = UserAccount.objects.update_or_create(
            username=user_username,
            defaults={"is_admin": False, "is_superuser": False, "is_active": True},
        )
        user.set_password(user_password)
        user.save()

        location, _ = ItemLocation.objects.update_or_create(
            name=location_name,
        )
        location.users.set([admin, user])

        self.stdout.write(
            self.style.SUCCESS(
                "Seed complete: "
                f"admin={admin_username}, user={user_username}, "
                f"location={location_name}"
            )
        )
