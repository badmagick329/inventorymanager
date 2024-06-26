from datetime import datetime

from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q
from django.db.models.functions import Lower
from items.base_model import ModelWithLastModified
from simple_history.models import HistoricalRecords
from users.models import UserAccount


class ItemLocation(models.Model):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    users = models.ManyToManyField(
        "users.UserAccount", related_name="item_locations"
    )

    def __str__(self):
        usernames = [user.username for user in self.users.all()]
        return f"ItemLocation<(id={self.id}, name={self.name}, users={usernames})>"

    def is_visible_to(self, user):
        return user.is_admin or self.users.filter(id=user.id).exists()

    @classmethod
    def spendings(cls, orders: list["Order"]):
        return sum([order.total_price for order in orders])

    @classmethod
    def revenue(cls, orders: list["Order"]):
        return sum([order.revenue() for order in orders])

    @classmethod
    def profit(cls, orders: list["Order"]):
        return sum([order.profit() for order in orders])

    class Meta:  # type: ignore
        ordering = ["id"]
        verbose_name = "Location"
        constraints = [
            models.UniqueConstraint(
                Lower("name"),
                name="unique_item_location_name",
                violation_error_message="Name must be unique.",
            ),
            models.CheckConstraint(
                name="non_empty_item_location_name",
                check=~models.Q(name=""),
                violation_error_message="Name cannot be empty.",
            ),
        ]


class Vendor(ModelWithLastModified):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
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
            # NOTE: LOWER(name), location_id uniqueness being enforced by
            # manual migration (0021)
            # unique_case_insensitive_vendor_name
            models.CheckConstraint(
                name="non_empty_vendor_name", check=~models.Q(name="")
            ),
        ]

    def is_changed(self) -> bool:
        if not hasattr(self, "_loaded_values"):
            return True
        loaded_fields = ["name", "location_id"]
        instance_values = [self.name, self.location.id]

        return instance_values != [self._loaded_values[field] for field in loaded_fields]  # type: ignore

    def revert_to_history_instance(self, history_instance):
        if history_instance.instance == self:
            return
        history_instance.instance.save()

    def revert_to_history_id(self, history_id):
        history_instance = HistoricalVendor.objects.filter(id=history_id).first()  # type: ignore
        if history_instance:
            self.revert_to_history_instance(history_instance)

    def save(self, *args, **kwargs):
        kwargs = super().set_last_modified_by(**kwargs)
        self.full_clean()
        super().save(*args, **kwargs)

    def debt(self, order_id: int | None = None):
        filters = [Q(deleted=False)]
        if order_id:
            filters.append(Q(order__id=order_id))
        return sum([sale.debt for sale in self.sales.filter(*filters)])  # type: ignore

    def __str__(self):
        username = (
            self.last_modified_by.username if self.last_modified_by else "None"
        )
        return (
            f"Vendor<(id={self.id}, name={self.name}, "
            f"location={self.location.name}, "
            f"last_modified_by={username})>"
        )

    @classmethod
    def vendors_by_order(cls, order_id: int):
        sales = Sale.objects.filter(order_id=order_id, deleted=False)
        vendors = Vendor.objects.filter(sales__in=sales).distinct()
        return vendors

    def is_visible_to(self, user):
        return user.is_admin or self.location.users.filter(id=user.id).exists()


class Order(ModelWithLastModified):
    id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    date = models.DateField(blank=True, null=True)
    location = models.ForeignKey(
        "items.ItemLocation", on_delete=models.CASCADE, related_name="orders"
    )
    price_per_item = models.DecimalField(max_digits=10, decimal_places=2)
    quantity = models.IntegerField()
    current_sale_price = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)
    deleted = models.BooleanField(default=False)
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
            models.CheckConstraint(
                name="non_empty_order_name",
                check=~models.Q(name=""),
                violation_error_message="Name cannot be empty.",
            ),
            models.CheckConstraint(
                name="positive_order_price",
                check=models.Q(price_per_item__gt=0),
                violation_error_message="Price must be greater than 0.",
            ),
            models.CheckConstraint(
                name="positive_order_quantity",
                check=models.Q(quantity__gt=0),
                violation_error_message="Quantity must be greater than 0.",
            ),
            models.CheckConstraint(
                name="positive_order_current_sale_price",
                check=models.Q(current_sale_price__gt=0),
                violation_error_message="Current sale price must be greater than 0.",
            ),
        ]

    def is_changed(self) -> bool:
        if not hasattr(self, "_loaded_values"):
            return True
        loaded_fields = [
            "name",
            "date",
            "location_id",
            "price_per_item",
            "quantity",
            "current_sale_price",
            "deleted",
            "created_at",
            "last_modified_by_id",
            "last_modified",
        ]
        instance_values = [
            self.name,
            self.date,
            self.location.id,
            self.price_per_item,
            self.quantity,
            self.current_sale_price,
            self.deleted,
            self.created_at,
            self.last_modified_by.id,  # type: ignore
            self.last_modified,
        ]

        return instance_values != [self._loaded_values[field] for field in loaded_fields]  # type: ignore

    @property
    def total_price(self):
        return self.price_per_item * self.quantity

    def save(self, *args, **kwargs):
        if not self.is_changed():
            return
        kwargs = super().set_last_modified_by(**kwargs)
        self.full_clean()
        super().save(*args, **kwargs)

    def mark_as_deleted(self, user: UserAccount):
        self.last_modified = datetime.utcnow()
        self.last_modified_by = user
        self.deleted = True
        self.save()
        return self.id

    def cost(self, vendor: Vendor | None = None):
        if vendor:
            order_sales = self.sales.filter(vendor=vendor, deleted=False)  # type: ignore
            order_quantity = sum([sale.quantity for sale in order_sales])
            return self.price_per_item * order_quantity
        return self.total_price

    def revenue(self, vendor: Vendor | None = None):
        if vendor:
            order_sales = self.sales.filter(vendor=vendor, deleted=False)  # type: ignore
        else:
            order_sales = self.sales.filter(deleted=False)  # type: ignore
        return sum([sale.revenue() for sale in order_sales])

    def profit(self, vendor: Vendor | None = None):
        return self.revenue(vendor) - self.cost(vendor)

    def profit_percentage(self, vendor: Vendor | None = None):
        cost = self.cost(vendor)
        return (self.revenue(vendor) - cost) / cost * 100

    def current_quantity(self):
        sold_quantity = sum([sale.quantity for sale in self.sales.filter(deleted=False)])  # type: ignore
        return self.quantity - sold_quantity

    def sold_quantity(self):
        return sum([sale.quantity for sale in self.sales.filter(deleted=False)])  # type: ignore

    def is_visible_to(self, user):
        return user.is_admin or self.location.users.filter(id=user.id).exists()

    def __str__(self):
        date_str = self.date.strftime("%Y-%m-%d") if self.date else "None"
        username = (
            self.last_modified_by.username if self.last_modified_by else "None"
        )
        return (
            f"Order<(id={self.id}, name={self.name}, "
            f"date={date_str}, "
            f"location={self.location.name}, "
            f"price_per_item={self.price_per_item}, "
            f"quantity={self.quantity}, "
            f"current_sale_price={self.current_sale_price}, "
            f"deleted={self.deleted}, "
            f"created_at={self.created_at}, "
            f"last_modified_by={username}, "
            f"last_modified={self.last_modified})>"
        )


class Sale(ModelWithLastModified):
    id = models.AutoField(primary_key=True)
    order = models.ForeignKey(
        "items.Order", on_delete=models.CASCADE, related_name="sales"
    )
    vendor = models.ForeignKey(
        "items.Vendor", on_delete=models.CASCADE, related_name="sales"
    )
    date = models.DateField(blank=True, null=True)
    quantity = models.IntegerField()
    price_per_item = models.DecimalField(max_digits=10, decimal_places=2)
    debt = models.DecimalField(
        max_digits=10, decimal_places=2, blank=True, null=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    deleted = models.BooleanField(default=False)
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
            models.CheckConstraint(
                name="positive_sale_quantity",
                check=models.Q(quantity__gt=0),
                violation_error_message="Quantity must be greater than 0.",
            ),
            models.CheckConstraint(
                name="positive_sale_price",
                check=models.Q(price_per_item__gt=0),
                violation_error_message="Price must be greater than 0.",
            ),
            models.CheckConstraint(
                name="positive_sale_debt",
                check=models.Q(debt__gte=0),
                violation_error_message="Amount paid cannot be greater than potential revenue for this sale. Try adjusting the sale price or quantity.",
            ),
        ]

    def is_changed(self) -> bool:
        if not hasattr(self, "_loaded_values"):
            return True
        loaded_fields = [
            "order_id",
            "vendor_id",
            "date",
            "quantity",
            "price_per_item",
            "debt",
            "deleted",
            "created_at",
            "last_modified_by_id",
        ]
        instance_values = [
            self.order.id,
            self.vendor.id,
            self.date,
            self.quantity,
            self.price_per_item,
            self.debt,
            self.deleted,
            self.created_at,
            self.last_modified_by.id,
        ]

        return instance_values != [self._loaded_values[field] for field in loaded_fields]  # type: ignore

    def save(self, *args, **kwargs):
        if not self.is_changed():
            return
        kwargs = super().set_last_modified_by(**kwargs)
        self.full_clean()
        super().save(*args, **kwargs)
        self.order.last_modified = self.last_modified
        self.order.last_modified_by = self.last_modified_by
        self.order.current_sale_price = self.price_per_item
        self.order.save()

    def mark_as_deleted(self, user: UserAccount):
        self.order.last_modified = datetime.utcnow()
        self.order.last_modified_by = user
        self.order.save()
        self.deleted = True
        self.save()
        return self.id

    def delete(self, *args, **kwargs):
        user = kwargs.pop("user", None)
        self.order.last_modified = datetime.utcnow()
        self.order.last_modified_by = user
        self.order.save()
        return super().delete(*args, **kwargs)

    def full_clean(self, *args, **kwargs):
        if self.debt is None:
            self.debt = self.price_per_item * self.quantity
        if self.debt > self.potential_revenue():
            raise ValidationError(
                {
                    "amount_paid": (
                        f"Amount paid cannot be greater "
                        f"than {self.potential_revenue()} for this sale."
                    )
                }
            )
        super().full_clean(*args, **kwargs)

    def cost(self):
        return self.order.price_per_item * self.quantity

    def revenue(self):
        return (self.price_per_item * self.quantity) - self.debt

    def potential_revenue(self):
        return self.price_per_item * self.quantity

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
        if isinstance(self.date, str):
            date_str = self.date
        else:
            date_str = self.date.strftime("%Y-%m-%d") if self.date else None
        username = (
            self.last_modified_by.username if self.last_modified_by else None
        )
        return (
            f"Sale<(id={self.id}, order={self.order.name}, "
            f"vendor={self.vendor.name}, "
            f"date={date_str}, "
            f"quantity={self.quantity}, "
            f"price_per_item={self.price_per_item}, "
            f"debt={self.debt}, "
            f"deleted={self.deleted}, "
            f"created_at={self.created_at}, "
            f"last_modified_by={username}, "
            f"last_modified={self.last_modified})>"
        )
