from django.contrib import admin
from .models import IDS, Specification, IDSSpecification


class IDSSpecificationInline(admin.TabularInline):
    model = IDSSpecification
    extra = 1


@admin.register(IDS)
class IDSAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'version', 'created_at')
    search_fields = ('title', 'description')
    inlines = [IDSSpecificationInline]


@admin.register(Specification)
class SpecificationAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'ifc_version', 'created_at')
    search_fields = ('name', 'description')
