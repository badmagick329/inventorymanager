from django.db import models


class ItemLocation(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    users = models.ManyToManyField(
        "users.UserAccount", related_name="item_locations"
    )

    def __str__(self):
        return f"ItemLocation<(name={self.name})>"

    class Meta:  # type: ignore
        ordering = ["name"]
        verbose_name = "ItemLocation"

    def clean_fields(self, exclude=None) -> None:
        self.name = self.name.strip().lower()
        super().clean_fields(exclude=exclude)
