from django.db.utils import IntegrityError
from rest_framework import serializers
from rest_framework.exceptions import ErrorDetail

constraint_to_error_dict = {
    "unique_item_location_name": {"name": ["Location name already in use"]},
    "non_empty_item_location_name": {
        "name": ["Location name cannot be empty"]
    },
}


class ValidationErrorWithMessage(serializers.ValidationError):
    detail: dict[str, list[ErrorDetail]]  # type: ignore

    def __init__(self, detail, code=None):
        super().__init__(detail, code)

    @property
    def message_dict(self):
        error_dict = dict()
        for key, value in self.detail.items():
            error_dict[key] = str(value[0])
        return error_dict


class ErrorHandler:
    """
    This class is used to translate the errors from the database or django into
    a more user-friendly format for the frontend
    """

    def __init__(self, error) -> None:
        if isinstance(error, IntegrityError):
            error = self._handle_integrity_error(str(error))
        self.error = ValidationErrorWithMessage(error)

    def _handle_integrity_error(self, error_string: str):
        for constraint, error_dict in constraint_to_error_dict.items():
            if constraint in error_string:
                return error_dict
        return {"errors": ["Error during update. Please check the input data"]}
