from rest_framework import status
from rest_framework.response import Response


class APIResponses:
    @staticmethod
    def ok(data):
        """200"""
        return Response(
            data=data,
            status=status.HTTP_200_OK,
        )

    @staticmethod
    def created(data):
        """201"""
        return Response(
            data=data,
            status=status.HTTP_201_CREATED,
        )

    @staticmethod
    def deleted():
        """204"""
        return Response(status=status.HTTP_204_NO_CONTENT)

    @staticmethod
    def bad_request(errors):
        """400"""
        return Response(
            data=errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    @staticmethod
    def unauthorized(errors):
        """401"""
        return Response(data=errors, status=status.HTTP_401_UNAUTHORIZED)

    @staticmethod
    def forbidden_order():
        """403"""
        return Response(
            data={"errors": "You do not have access to this order"},
            status=status.HTTP_403_FORBIDDEN,
        )

    @staticmethod
    def forbidden_location():
        """403"""
        return Response(
            data={"errors": "You do not have access to this location"},
            status=status.HTTP_403_FORBIDDEN,
        )
