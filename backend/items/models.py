from django.core.exceptions import ValidationError
from django.db import models


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
        verbose_name = "ItemLocation"

    def clean_fields(self, exclude=None) -> None:
        self.name = self.name.strip()
        saved_instance = ItemLocation.objects.filter(
            name__iexact=self.name
        ).first()
        if saved_instance and saved_instance.id != self.id:
            raise ValidationError(
                {"name": "ItemLocation with this name already exists"},
                params={"value": self.name},
                code="unique",
            )

        super().clean_fields(exclude=exclude)
