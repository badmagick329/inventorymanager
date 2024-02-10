from datetime import datetime

from rest_framework import serializers


class SerializerValidator:
    @staticmethod
    def positive_float(value, field_name, field_label):
        try:
            num = float(value)
        except (TypeError, ValueError):
            raise serializers.ValidationError(
                {field_name: f"{field_label} must be a number"}
            )
        if num < 0:
            raise serializers.ValidationError(
                {field_name: f"{field_label} must be positive"}
            )
        return num

    @staticmethod
    def positive_int(value, field_name, field_label):
        try:
            num = int(value)
        except (TypeError, ValueError):
            raise serializers.ValidationError(
                {field_name: f"{field_label} must be an integer"}
            )
        if num < 0:
            raise serializers.ValidationError(
                {field_name: f"{field_label} must be positive"}
            )
        return num

    @staticmethod
    def valid_date(value, field_name):
        if not value:
            return None
        value = value.strip()
        try:
            return datetime.strptime(value, "%Y-%m-%d").date()
        except ValueError:
            raise serializers.ValidationError(
                {field_name: "Date must be in the format YYYY-MM-DD"}
            )
