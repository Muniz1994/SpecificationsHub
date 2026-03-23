from django.contrib import admin
from .models import (
    IDS, Specification, IDSSpecification,
    ApplicabilityCondition, Requirement,
    Tag, IDSTag, SpecificationTag,
    UserLibrary,
    Endorsement,
)


# ---------------------------------------------------------------------------
# Inlines
# ---------------------------------------------------------------------------

class IDSSpecificationInline(admin.TabularInline):
    model = IDSSpecification
    extra = 1
    autocomplete_fields = ('specification',)


class IDSTagInline(admin.TabularInline):
    model = IDSTag
    extra = 1
    autocomplete_fields = ('tag',)


class ApplicabilityConditionInline(admin.TabularInline):
    model = ApplicabilityCondition
    extra = 1


class RequirementInline(admin.TabularInline):
    model = Requirement
    extra = 1


class SpecificationTagInline(admin.TabularInline):
    model = SpecificationTag
    extra = 1
    autocomplete_fields = ('tag',)


# ---------------------------------------------------------------------------
# Model admins
# ---------------------------------------------------------------------------

@admin.register(IDS)
class IDSAdmin(admin.ModelAdmin):
    list_display = ('title', 'owner', 'version', 'is_public', 'is_deleted', 'created_at')
    list_filter = ('is_public', 'is_deleted')
    search_fields = ('title', 'description', 'owner__username')
    date_hierarchy = 'created_at'
    inlines = [IDSSpecificationInline, IDSTagInline]


@admin.register(Specification)
class SpecificationAdmin(admin.ModelAdmin):
    list_display = ('name', 'owner', 'ifc_version', 'is_public', 'is_deleted', 'created_at')
    list_filter = ('ifc_version', 'is_public', 'is_deleted')
    search_fields = ('name', 'description', 'owner__username')
    date_hierarchy = 'created_at'
    inlines = [ApplicabilityConditionInline, RequirementInline, SpecificationTagInline]


@admin.register(Tag)
class TagAdmin(admin.ModelAdmin):
    list_display = ('name', 'category')
    list_filter = ('category',)
    search_fields = ('name',)


@admin.register(UserLibrary)
class UserLibraryAdmin(admin.ModelAdmin):
    list_display = ('user', 'ids', 'specification', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'ids__title', 'specification__name')


@admin.register(Endorsement)
class EndorsementAdmin(admin.ModelAdmin):
    list_display = ('user', 'ids', 'specification', 'created_at')
    list_filter = ('created_at',)
    search_fields = ('user__username', 'ids__title', 'specification__name')
