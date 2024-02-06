from django.db import models
from django.db.models.functions import Lower
from django.dispatch import receiver
from simple_history.models import HistoricalRecords
from simple_history.signals import pre_create_historical_record
from users.models import UserAccount


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
    last_modified_by = models.ForeignKey(
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
        return self.last_modified_by

    @_history_user.setter
    def _history_user(self, user):
        self.last_modified_by = user

    def revert_to_history_instance(self, history_instance):
        if history_instance.instance == self:
            return
        history_instance.instance.save()

    def revert_to_history_id(self, history_id):
        history_instance = HistoricalVendor.objects.filter(id=history_id).first()  # type: ignore
        if history_instance:
            self.revert_to_history_instance(history_instance)

    def save(self, *args, **kwargs):
        if "user" in kwargs:
            user = kwargs.pop("user")
            assert isinstance(
                user, UserAccount
            ), "user passed to save must be a UserAccount instance"
            self.last_modified_by = user
        super().save(*args, **kwargs)

    def __str__(self):
        return (
            f"Vendor<(id={self.id}, name={self.name}, "
            f"location={self.location.name}, "
            f"last_modified_by={self.last_modified_by.username})>"
        )


class Order(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True)
    date = models.DateField(blank=True, null=True)
    location = models.ForeignKey(
        "items.ItemLocation", on_delete=models.CASCADE, related_name="orders"
    )
    # per item price
    price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField()
    current_sale_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_by = models.ForeignKey(
        "users.UserAccount",
        on_delete=models.SET_NULL,
        null=True,
        related_name="orders",
    )
    last_modified = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    class Meta:  # type: ignore
        ordering = ["id"]
        verbose_name = "Order"
        constraints = [
            models.UniqueConstraint(
                Lower("name"),
                "location_id",
                "date",
                "price",
                "quantity",
                name="unique_order_name",
            ),
            models.CheckConstraint(
                name="non_empty_order_name", check=~models.Q(name="")
            ),
            models.CheckConstraint(
                name="positive_order_price", check=models.Q(price__gt=0)
            ),
            models.CheckConstraint(
                name="positive_order_quantity", check=models.Q(quantity__gt=0)
            ),
            models.CheckConstraint(
                name="positive_order_current_sale_price",
                check=models.Q(current_sale_price__gt=0),
            ),
        ]

    @property
    def total_price(self):
        return self.price * self.quantity

    @property
    def _history_user(self):
        return self.last_modified_by

    @_history_user.setter
    def _history_user(self, user):
        self.last_modified_by = user

    def save(self, *args, **kwargs):
        if "user" in kwargs:
            user = kwargs.pop("user")
            assert isinstance(
                user, UserAccount
            ), "user passed to save must be a UserAccount instance"
            self.last_modified_by = user
        super().save(*args, **kwargs)

    def cost(self, vendor: Vendor | None = None):
        if vendor:
            order_sales = self.sales.filter(vendor=vendor)  # type: ignore
            order_quantity = sum([sale.quantity for sale in order_sales])
            return self.price * order_quantity
        return self.price * self.quantity

    def revenue(self, vendor: Vendor | None = None):
        if vendor:
            order_sales = self.sales.filter(vendor=vendor)  # type: ignore
        else:
            order_sales = self.sales.all()  # type: ignore
        return sum([sale.revenue for sale in order_sales])

    def profit(self, vendor: Vendor | None = None):
        return self.revenue(vendor) - self.cost(vendor)

    def profit_percentage(self, vendor: Vendor | None = None):
        cost = self.cost(vendor)
        return (self.revenue(vendor) - cost) / cost * 100

    def profit_per_item(self, vendor: Vendor | None = None):
        cost = self.cost(vendor)
        return (self.revenue(vendor) - cost) / self.quantity

    def current_quantity(self):
        sold_quantity = sum([sale.quantity for sale in self.sales()])  # type: ignore
        return self.quantity - sold_quantity

    def sold_quantity(self):
        return sum([sale.quantity for sale in self.sales()])  # type: ignore

    def __str__(self):
        date_str = self.date.strftime("%Y-%m-%d") if self.date else "None"
        return (
            f"Order<(id={self.id}, name={self.name}, "
            f"date={date_str}, "
            f"location={self.location.name}, "
            f"price={self.price}, "
            f"quantity={self.quantity}, "
            f"current_sale_price={self.current_sale_price}, "
            f"created_at={self.created_at}, "
            f"last_modified_by={self.last_modified_by.username}, "
            f"last_modified={self.last_modified})>"
        )


class Sale(models.Model):
    id = models.AutoField(primary_key=True)
    order = models.ForeignKey(
        "items.Order", on_delete=models.CASCADE, related_name="sales"
    )
    vendor = models.ForeignKey(
        "items.Vendor", on_delete=models.CASCADE, related_name="sales"
    )
    date = models.DateField(blank=True, null=True)
    quantity = models.IntegerField()
    # per item price
    price = models.DecimalField(max_digits=10, decimal_places=2)
    debt = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    last_modified_by = models.ForeignKey(
        "users.UserAccount",
        on_delete=models.SET_NULL,
        null=True,
        related_name="sales",
    )
    last_modified = models.DateTimeField(auto_now=True)
    history = HistoricalRecords()

    class Meta:  # type: ignore
        ordering = ["id"]
        verbose_name = "Sale"
        constraints = [
            models.UniqueConstraint(
                "order_id",
                "vendor_id",
                "date",
                "quantity",
                "price",
                name="unique_sale",
            ),
            models.CheckConstraint(
                name="positive_sale_quantity", check=models.Q(quantity__gt=0)
            ),
            models.CheckConstraint(
                name="positive_sale_price", check=models.Q(price__gt=0)
            ),
            models.CheckConstraint(
                name="positive_sale_debt",
                check=models.Q(debt__gte=0),
            ),
        ]

    @property
    def _history_user(self):
        return self.last_modified_by

    @_history_user.setter
    def _history_user(self, user):
        self.last_modified_by = user

    def save(self, *args, **kwargs):
        if "user" in kwargs:
            user = kwargs.pop("user")
            assert isinstance(
                user, UserAccount
            ), "user passed to save must be a UserAccount instance"
            self.last_modified_by = user
        if self.debt is None:
            self.debt = self.price * self.quantity
        if self.debt > self.potential_revenue():
            raise ValueError("Debt cannot be higher than potential revenue")
        super().save(*args, **kwargs)

    def cost(self):
        return self.order.price * self.quantity

    def revenue(self):
        return (self.price * self.quantity) - self.debt

    def potential_revenue(self):
        return self.price * self.quantity

    def profit(self):
        return self.revenue() - self.cost()

    def profit_percentage(self):
        return (self.revenue() - self.cost()) / self.cost * 100

    def profit_per_item(self):
        return (self.revenue() - self.cost()) / self.quantity

    def potential_profit(self):
        return self.potential_revenue() - self.cost()

    def potential_profit_percentage(self):
        return (self.potential_revenue() - self.cost()) / self.cost * 100

    def potential_profit_per_item(self):
        return (self.potential_revenue() - self.cost()) / self.quantity

    def amount_paid(self):
        return self.potential_revenue() - self.debt

    def __str__(self):
        date_str = self.date.strftime("%Y-%m-%d") if self.date else "None"
        return (
            f"Sale<(id={self.id}, order={self.order.name}, "
            f"vendor={self.vendor.name}, "
            f"date={date_str}, "
            f"quantity={self.quantity}, "
            f"price={self.price}, "
            f"debt={self.debt}, "
            f"created_at={self.created_at}, "
            f"last_modified_by={self.last_modified_by.username}, "
            f"last_modified={self.last_modified})>"
        )
