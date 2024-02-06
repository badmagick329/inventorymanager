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

    def cost(self):
        return self.price * self.quantity

    def current_stock(self):
        raise NotImplementedError("current_stock method not implemented")

    def stock_sold(self):
        raise NotImplementedError("stock_sold method not implemented")

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
    price = models.DecimalField(max_digits=10, decimal_places=2)
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2)
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
                "amount_paid",
                name="unique_sale",
            ),
            models.CheckConstraint(
                name="positive_sale_quantity", check=models.Q(quantity__gt=0)
            ),
            models.CheckConstraint(
                name="positive_sale_price", check=models.Q(price__gt=0)
            ),
            models.CheckConstraint(
                name="positive_sale_amount_paid",
                check=models.Q(amount_paid__gt=0),
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
        super().save(*args, **kwargs)

    def profit(self):
        order_sales = self.order.sales.filter(vendor=self.vendor)
        if order_sales.count() == 0:
            return 0
        amount_paid = sum([sale.amount_paid for sale in order_sales])
        order_cost = self.order_cost()
        return (amount_paid - order_cost) / len(order_sales)

    def total_profit(self):
        return self.profit() * self.quantity

    def profit_percentage(self):
        cost = self.order_cost()
        return (self.amount_paid - cost) / cost * 100

    def order_cost(self):
        order_sales = self.order.sales.filter(vendor=self.vendor)
        sale_quantity = sum([sale.quantity for sale in order_sales])
        return self.order.price * sale_quantity

    def calculate_potential_revenue_by_filter(self, filters: list):
        order_sales = self.order.sales.filter(*filters)
        return calculate_potential_revenue_for_sales(order_sales)

    def __str__(self):
        date_str = self.date.strftime("%Y-%m-%d") if self.date else "None"
        return (
            f"Sale<(id={self.id}, order={self.order.name}, "
            f"vendor={self.vendor.name}, "
            f"date={date_str}, "
            f"quantity={self.quantity}, "
            f"price={self.price}, "
            f"amount_paid={self.amount_paid}, "
            f"created_at={self.created_at}, "
            f"last_modified_by={self.last_modified_by.username}, "
            f"last_modified={self.last_modified})>"
        )


def calculate_potential_revenue_for_sales(sales: list["Sale"]):
    revenue = 0
    for sale in sales:
        revenue += sale.quantity * sale.price
    return revenue
