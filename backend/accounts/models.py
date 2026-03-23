import os
import random

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models

AVATARS_DIR = os.path.join(settings.BASE_DIR, 'assets', 'avatars')


def get_random_avatar():
    """Return a random avatar filename from assets/avatars/."""
    try:
        files = [
            f for f in os.listdir(AVATARS_DIR)
            if f.lower().endswith(('.png', '.jpg', '.jpeg', '.svg', '.webp'))
        ]
        return random.choice(files) if files else ''
    except FileNotFoundError:
        return ''


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
    avatar = models.CharField(
        max_length=200,
        blank=True,
        default='',
        help_text='Filename of the chosen avatar from assets/avatars/.',
    )
    is_certified = models.BooleanField(
        default=False,
        help_text='Designates whether this user is a certified creator.',
    )

    def save(self, *args, **kwargs):
        if not self.pk and not self.avatar:
            self.avatar = get_random_avatar()
        super().save(*args, **kwargs)

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
