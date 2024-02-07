from users.models import UserAccount


class LastModifiedByMixin:
    @property
    def _history_user(self):
        return self.last_modified_by

    @_history_user.setter
    def _history_user(self, user):
        self.last_modified_by = user

    def set_last_modified_by(self, **kwargs):
        if "user" in kwargs:
            user = kwargs.pop("user")
            assert isinstance(
                user, UserAccount
            ), "user passed to save must be a UserAccount instance"
            self.last_modified_by = user
        return kwargs
