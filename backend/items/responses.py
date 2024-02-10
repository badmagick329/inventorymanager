from rest_framework import status
from rest_framework.response import Response


class APIResponses:
    @staticmethod
    def order_not_found():
        return Response(
            data={"errors": "Order not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    @staticmethod
    def sale_not_found():
        return Response(
            data={"errors": "Sale not found"},
            status=status.HTTP_404_NOT_FOUND,
        )

    @staticmethod
    def forbidden_order():
        return Response(
            data={"errors": "You do not have access to this order"},
            status=status.HTTP_403_FORBIDDEN,
        )

    @staticmethod
    def forbidden_location():
        return Response(
            data={"errors": "You do not have access to this location"},
            status=status.HTTP_403_FORBIDDEN,
        )

    @staticmethod
    def created(data):
        return Response(
            data=data,
            status=status.HTTP_201_CREATED,
        )

    @staticmethod
    def bad_request(errors):
        return Response(
            data=errors,
            status=status.HTTP_400_BAD_REQUEST,
        )

    @staticmethod
    def deleted():
        return Response(status=status.HTTP_204_NO_CONTENT)

    @staticmethod
    def ok(data):
        return Response(
            data=data,
            status=status.HTTP_200_OK,
        )
