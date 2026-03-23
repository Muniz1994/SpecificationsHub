from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom user model that extends Django's AbstractUser.
    Adds a profile picture field and helper properties for counts.
    """
    profile_picture = models.ImageField(
        upload_to='profile_pictures/',
        blank=True,
        null=True,
    )
    is_certified = models.BooleanField(
        default=False,
        help_text='Designates whether this user is a certified creator.',
    )

    @property
    def ids_count(self):
        """Number of IDSs owned by this user."""
        return self.ids_set.count()

    @property
    def specifications_count(self):
        """Number of Specifications owned by this user."""
        return self.specifications_set.count()

    def __str__(self):
        return self.username
