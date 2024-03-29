import pytest

LOCATION_LIST_POST_LABELS = [
    "test_name",
    "users",
    "locations",
    "post_data",
    "expected_status",
    "expected_json",
]

LOCATION_LIST_POST_VALUES = [
    (
        "creating duplicate item location fails",
        [],
        ["test item location"],
        {"name": "test item location"},
        400,
        {},
    ),
    (
        "create item location with 0 users",
        [],
        [],
        {"name": "test item location", "users": ""},
        201,
        {"name": "test item location", "users": []},
    ),
    (
        "create item location with empty string fails",
        [],
        [],
        {"name": "", "users": ""},
        400,
        {},
    ),
    (
        "item location with missing fields fails",
        [],
        [],
        {"name": "test item location"},
        400,
        {},
    ),
    (
        "create item location with users",
        ["test_user"],
        [],
        {"name": "test item location", "users": "test_user"},
        201,
        {"name": "test item location", "users": ["test_user"]},
    ),
    (
        "create item location with users list",
        ["test_user", "test_user2"],
        [],
        {"name": "test item location", "users": ["test_user", "test_user2"]},
        201,
        {"name": "test item location", "users": ["test_user", "test_user2"]},
    ),
    (
        "adding non-existent users to item location does not create user",
        [],
        [],
        {
            "name": "test item location2",
            "users": "non-existent-user",
        },
        201,
        {"name": "test item location2", "users": []},
    ),
    (
        "adding existing and non-existent users only adds existing users",
        ["test_user"],
        ["test item location"],
        {
            "name": "test item location3",
            "users": "test_user,non-existent-user",
        },
        201,
        {"name": "test item location3", "users": ["test_user"]},
    ),
    (
        "posting irrelevant data fails",
        [],
        ["test item location"],
        {"name": "test item location", "irrelevant": "data"},
        400,
        {},
    ),
    (
        "posting without data fails",
        [],
        [],
        {},
        400,
        {},
    ),
]

LOCATION_PATCH_LABELS = [
    "test_name",
    "users",
    "locations",
    "patch_data",
    "expected_status",
    "expected_json",
]

LOCATION_PATCH_VALUES = [
    (
        "can edit item location with 0 users",
        [],
        ["location 1", "location 2"],  # first in list will be target of patch
        {"name": "location 3", "users": ""},
        200,
        {"name": "location 3", "users": []},
    ),
    (
        "cannot edit item location name to an empty string",
        [],
        ["location 1", "location 2"],
        {"name": "", "users": ""},
        400,
        {},
    ),
    (
        "can edit item location with multiple users",
        ["test_user1", "test_user2"],
        ["location 1", "location 2"],
        {"name": "location 1", "users": "test_user1"},
        200,
        {"name": "location 1", "users": ["test_user1"]},
    ),
    (
        "can edit item location with multiple users list",
        ["test_user1", "test_user2"],
        ["location 1", "location 2"],
        {"name": "location 1", "users": ["test_user1"]},
        200,
        {"name": "location 1", "users": ["test_user1"]},
    ),
    (
        "editing name to existing name fails",
        [],
        ["location 1", "location 2"],
        {"name": "location 2", "users": ""},
        400,
        {},
    ),
    (
        "adding non existent user does not add user",
        ["test_user"],
        ["location 1"],
        {"name": "location 2", "users": "non-existent-user"},
        200,
        {"name": "location 2", "users": []},
    ),
]
