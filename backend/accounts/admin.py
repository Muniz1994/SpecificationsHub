from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff', 'is_certified')
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Extra', {'fields': ('profile_picture', 'avatar', 'is_certified')}),
    )
    list_filter = BaseUserAdmin.list_filter + ('is_certified',)
