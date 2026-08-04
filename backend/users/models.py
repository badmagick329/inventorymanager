from django.contrib.auth.models import (
    AbstractBaseUser,
    BaseUserManager,
    PermissionsMixin,
)
from django.contrib.auth.password_validation import validate_password
from django.db import models
from django.conf import settings


class UserAccountManager(BaseUserManager):
    def create_user(self, username, password=None):
        if not username:
            raise ValueError("Users must have an username")

        user = self.model(
            username=username,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, username, password=None):
        user = self.create_user(
            username=username,
            password=password,
        )
        user.is_superuser = True
        user.is_admin = True
        user.save(using=self._db)
        return user


class UserAccount(AbstractBaseUser, PermissionsMixin):  # type: ignore
    username = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=255, validators=[validate_password])
    is_active = models.BooleanField(default=True)
    is_admin = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    objects: UserAccountManager = UserAccountManager()  # type: ignore

    USERNAME_FIELD = "username"

    class Meta:  # type: ignore
        ordering = ["id"]

    def __str__(self):
        return self.username

    def has_perm(self, perm, obj=None):
        "Does the user have a specific permission?"
        return True

    def has_module_perms(self, app_label):
        "Does the user have permissions to view the app `app_label`?"
        return True

    @property
    def is_staff(self):
        "Is the user a member of staff?"
        return self.is_admin

    def clean_fields(self, exclude=None):
        self.username = self.username.strip().lower()
        super().clean_fields(exclude=exclude)


class FrictionEvent(models.Model):
    class Action(models.TextChoices):
        ORDER_CREATE = "order_create", "Create order"
        ORDER_UPDATE = "order_update", "Update order"
        SALE_CREATE = "sale_create", "Create sale"
        SALE_UPDATE = "sale_update", "Update sale"

    user = models.ForeignKey(
        UserAccount, on_delete=models.CASCADE, related_name="friction_events"
    )
    action = models.CharField(max_length=20, choices=Action.choices)
    route = models.CharField(max_length=255)
    location_id = models.PositiveIntegerField(null=True, blank=True)
    order_id = models.PositiveIntegerField(null=True, blank=True)
    status_code = models.PositiveSmallIntegerField()
    error = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:  # type: ignore
        ordering = ["-created_at"]


class ProblemReport(models.Model):
    friction_event = models.OneToOneField(
        FrictionEvent, on_delete=models.CASCADE, related_name="problem_report"
    )
    user = models.ForeignKey(
        UserAccount, on_delete=models.CASCADE, related_name="problem_reports"
    )
    submitted_data = models.JSONField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:  # type: ignore
        ordering = ["-created_at"]


class AssistantConversation(models.Model):
    user = models.ForeignKey(
        UserAccount, on_delete=models.CASCADE, related_name="assistant_chats"
    )
    location = models.ForeignKey(
        "items.ItemLocation", on_delete=models.CASCADE,
        related_name="assistant_chats", null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class AssistantMessage(models.Model):
    class Role(models.TextChoices):
        USER = "user"
        ASSISTANT = "assistant"

    conversation = models.ForeignKey(
        AssistantConversation, on_delete=models.CASCADE, related_name="messages"
    )
    role = models.CharField(max_length=10, choices=Role.choices)
    content = models.TextField()
    model = models.CharField(max_length=100, blank=True)
    usage = models.JSONField(null=True, blank=True)
    estimated_cost_usd = models.FloatField(null=True, blank=True)
    error_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:  # type: ignore
        ordering = ["created_at"]


class AssistantDailyUsage(models.Model):
    user = models.ForeignKey(
        UserAccount, on_delete=models.CASCADE, related_name="assistant_usage"
    )
    date = models.DateField()
    requests = models.PositiveSmallIntegerField(default=0)

    class Meta:  # type: ignore
        constraints = [models.UniqueConstraint(fields=["user", "date"], name="unique_assistant_usage_per_day")]
