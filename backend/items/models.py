from django.db import models
from django.db.models.functions import Lower
from django.dispatch import receiver
from simple_history.models import HistoricalRecords
from simple_history.signals import pre_create_historical_record


@receiver(pre_create_historical_record)
def set_history_user(sender, **kwargs):
    history_instance = kwargs["history_instance"]
    user = kwargs["history_user"]
    history_instance.history_user = user


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
    last_change_by = models.ForeignKey(
        "users.UserAccount",
        on_delete=models.SET_NULL,
        null=True,
        related_name="vendors",
    )
    history = HistoricalRecords()

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

    @property
    def _history_user(self):
        return self.last_change_by

    @_history_user.setter
    def _history_user(self, user):
        self.last_change_by = user

    def revert_to_history_instance(self, history_instance):
        if history_instance.instance == self:
            return
        history_instance.instance.save()

    def revert_to_history_id(self, history_id):
        history_instance = HistoricalVendor.objects.filter(id=history_id).first()  # type: ignore
        if history_instance:
            self.revert_to_history_instance(history_instance)

    def __str__(self):
        return (
            f"Vendor<(id={self.id}, name={self.name}, "
            f"location={self.location.name}, "
            f"last_change_by={self.last_change_by.username})>"
        )
