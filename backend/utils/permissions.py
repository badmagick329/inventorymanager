from rest_framework.permissions import BasePermission
from users.models import UserAccount


class ReadOnlyUserPermission(BasePermission):
    ADMIN_METHODS = ["POST", "PUT", "DELETE", "PATCH"]

    def has_permission(self, request, view):
        user = request.user
        assert isinstance(user, UserAccount)
        if user.is_admin:
            return True
        return request.method not in self.ADMIN_METHODS
