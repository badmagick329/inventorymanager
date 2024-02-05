from django.db import models
from django.db.models.functions import Lower


class ItemLocation(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    users = models.ManyToManyField(
        "users.UserAccount", related_name="item_locations"
    )

    def __str__(self):
        usernames = [user.username for user in self.users.all()]
        return f"ItemLocation<(id={self.id}, name={self.name}, users={usernames})>"

    class Meta:  # type: ignore
        ordering = ["id"]
        verbose_name = "Location"
        constraints = [
            models.UniqueConstraint(
                Lower("name"), name="unique_item_location_name"
            ),
            models.CheckConstraint(
                name="non_empty_item_location_name", check=~models.Q(name="")
            ),
        ]


class Vendor(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    location = models.ForeignKey(
        "items.ItemLocation", on_delete=models.CASCADE, related_name="vendors"
    )

    class Meta:  # type: ignore
        ordering = ["id"]
        verbose_name = "Vendor"
        constraints = [
            models.UniqueConstraint(
                Lower("name"), "location_id", name="unique_vendor_name"
            ),
            models.CheckConstraint(
                name="non_empty_vendor_name", check=~models.Q(name="")
            ),
        ]

    def __str__(self):
        return f"Vendor<(id={self.id}, name={self.name}, location={self.location})>"
