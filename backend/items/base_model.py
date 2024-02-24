from abc import abstractmethod

from django.db import models
from users.models import UserAccount


class ModelWithLastModified(models.Model):
    @classmethod
    def from_db(cls, db, field_names, values):
        instance = super().from_db(db, field_names, values)
        instance._loaded_values = dict(zip(field_names, values))  # type: ignore

        return instance

    class Meta:  # type: ignore
        abstract = True

    @property
    def _history_user(self):
        return self.last_modified_by

    @_history_user.setter
    def _history_user(self, user):
        self.last_modified_by = user

    @abstractmethod
    def is_changed(self) -> bool:
        raise NotImplementedError

    def set_last_modified_by(self, **kwargs):
        if "user" in kwargs:
            user = kwargs.pop("user")
            assert isinstance(
                user, UserAccount
            ), "user passed to save must be a UserAccount instance"
            self.last_modified_by = user
        return kwargs
