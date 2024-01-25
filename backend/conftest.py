from typing import Any, Generator

import pytest
from rest_framework.test import APIClient
from users.models import UserAccount


@pytest.fixture(scope="function")
def api_client() -> Generator[APIClient, Any, None]:
    """
    Fixture to provide an API client
    :return: APIClient
    """
    yield APIClient()
