from django.db import models
from django.conf import settings


class Specification(models.Model):
    IFC_VERSION_CHOICES = [
        ('IFC2X3', 'IFC2X3'),
        ('IFC4', 'IFC4'),
        ('IFC4X3_ADD2', 'IFC4X3_ADD2'),
    ]

    name = models.CharField(max_length=255)
    ifc_version = models.CharField(max_length=20, choices=IFC_VERSION_CHOICES)
    identifier = models.CharField(max_length=255, blank=True, default='')
    description = models.TextField(blank=True, default='')
    instructions = models.TextField(blank=True, default='')

    # JSON blobs kept for backwards compatibility during transition
    applicability_data = models.JSONField(default=dict, blank=True)
    requirements_data = models.JSONField(default=dict, blank=True)

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='specifications_set',
    )
    is_public = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class IDS(models.Model):
    title = models.CharField(max_length=255)
    copyright_text = models.CharField(max_length=255, blank=True, default='')
    version = models.CharField(max_length=50, blank=True, default='')
    description = models.TextField(blank=True, default='')
    author_email = models.EmailField(blank=True, default='')
    date = models.DateField(blank=True, null=True)
    purpose = models.TextField(blank=True, default='')
    milestone = models.CharField(max_length=255, blank=True, default='')

    specifications = models.ManyToManyField(
        Specification,
        through='IDSSpecification',
        related_name='ids_parents',
        blank=True,
    )

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='ids_set',
    )
    is_public = models.BooleanField(default=True)
    is_deleted = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'IDS'
        verbose_name_plural = 'IDSs'

    def __str__(self):
        return self.title


class IDSSpecification(models.Model):
    """Through table for the IDS <-> Specification M2M relationship."""
    ids = models.ForeignKey(IDS, on_delete=models.CASCADE)
    specification = models.ForeignKey(Specification, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order']
        unique_together = ('ids', 'specification')

    def __str__(self):
        return f'{self.ids.title} - {self.specification.name} (#{self.order})'


class ApplicabilityCondition(models.Model):
    """Relational replacement for Specification.applicability_data JSON."""
    TYPE_CHOICES = [
        ('entity', 'Entity'),
        ('property', 'Property'),
        ('classification', 'Classification'),
        ('material', 'Material'),
    ]

    specification = models.ForeignKey(
        Specification,
        on_delete=models.CASCADE,
        related_name='applicability_conditions',
    )
    type = models.CharField(max_length=20, choices=TYPE_CHOICES)
    key = models.CharField(max_length=255, blank=True, default='')
    operator = models.CharField(max_length=50, blank=True, default='')
    value = models.TextField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.specification.name} — {self.type}: {self.key}'


class Requirement(models.Model):
    """Relational replacement for Specification.requirements_data JSON."""
    CONSTRAINT_TYPE_CHOICES = [
        ('exists', 'Exists'),
        ('equals', 'Equals'),
        ('pattern', 'Pattern'),
    ]

    specification = models.ForeignKey(
        Specification,
        on_delete=models.CASCADE,
        related_name='requirements',
    )
    property_set = models.CharField(max_length=255, blank=True, default='')
    property_name = models.CharField(max_length=255, blank=True, default='')
    constraint_type = models.CharField(max_length=20, choices=CONSTRAINT_TYPE_CHOICES)
    value = models.TextField(blank=True, default='')
    data_type = models.CharField(max_length=50, blank=True, default='')
    unit = models.CharField(max_length=50, blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.specification.name} — {self.property_set}.{self.property_name}'


class Tag(models.Model):
    CATEGORY_CHOICES = [
        ('use_case', 'Use Case'),
        ('stage', 'Stage'),
        ('discipline', 'Discipline'),
        ('other', 'Other'),
    ]

    name = models.CharField(max_length=100, unique=True)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='other')

    def __str__(self):
        return f'{self.name} ({self.category})'


class IDSTag(models.Model):
    ids = models.ForeignKey(IDS, on_delete=models.CASCADE, related_name='ids_tags')
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name='ids_tags')

    class Meta:
        unique_together = ('ids', 'tag')


class SpecificationTag(models.Model):
    specification = models.ForeignKey(
        Specification, on_delete=models.CASCADE, related_name='specification_tags'
    )
    tag = models.ForeignKey(Tag, on_delete=models.CASCADE, related_name='specification_tags')

    class Meta:
        unique_together = ('specification', 'tag')


class UserLibrary(models.Model):
    """Allows users to save IDS or Specifications to their personal library."""
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='library',
    )
    ids = models.ForeignKey(
        IDS, on_delete=models.CASCADE, related_name='saved_by', null=True, blank=True
    )
    specification = models.ForeignKey(
        Specification, on_delete=models.CASCADE, related_name='saved_by', null=True, blank=True
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = [('user', 'ids'), ('user', 'specification')]

    def __str__(self):
        item = self.ids or self.specification
        return f'{self.user.username} → {item}'
