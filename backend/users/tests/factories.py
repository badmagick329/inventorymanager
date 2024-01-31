import pytest
from users.models import UserAccount


@pytest.fixture
def user_factory(db):
    def create_user(username="test_user", is_admin=False, full_clean=False):
        password = f"{username}123456789"
        saved_user = UserAccount.objects.filter(username=username).first()
        idx = 1
        new_username = username
        while saved_user:
            new_username = f"{username}_{idx}"
            saved_user = UserAccount.objects.filter(
                username=new_username
            ).first()
            idx += 1
        user = UserAccount.objects.create_user(username=new_username)
        user.set_password(password)
        user.is_admin = is_admin
        if full_clean:
            user.full_clean()
        user.save()
        return user, password

    return create_user
