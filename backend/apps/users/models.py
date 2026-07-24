from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model. We extend AbstractUser (which already has username,
    email, password, is_staff, etc.) and add an is_admin flag so we can
    distinguish quiz-admins from regular players without giving them
    full Django staff access.
    """
    is_admin = models.BooleanField(default=False)

    def __str__(self):
        return self.username