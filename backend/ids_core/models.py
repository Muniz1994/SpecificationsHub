from django.db import models
from django.conf import settings


class Specification(models.Model):
    """
    A single specification derived from the IDS XSD schema.
    Maps to <specification> inside <specifications>.

    Attributes mirror the XSD specificationType:
      - name (required)
      - ifc_version (required, one of the allowed IFC versions)
      - identifier, description, instructions (optional)

    The applicability and requirements facet trees are stored as JSON
    for now.  When the IDS Editor is built, these can be normalised
    into relational tables.
    """
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

    # Facet data stored as JSON (entity, classification, property, attribute, material, partOf)
    applicability_data = models.JSONField(default=dict, blank=True)
    requirements_data = models.JSONField(default=dict, blank=True)

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='specifications_set',
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name


class IDS(models.Model):
    """
    An Information Delivery Specification (IDS).
    Maps to the root <ids> element in the XSD.

    The <info> child fields are stored as direct model fields.
    Specifications are linked via an M2M through table so we can
    preserve ordering.
    """
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

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = 'IDS'
        verbose_name_plural = 'IDSs'

    def __str__(self):
        return self.title


class IDSSpecification(models.Model):
    """
    Through table for the IDS <-> Specification M2M relationship.
    Includes an 'order' field so specifications inside an IDS can be ordered.
    """
    ids = models.ForeignKey(IDS, on_delete=models.CASCADE)
    specification = models.ForeignKey(Specification, on_delete=models.CASCADE)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order']
        unique_together = ('ids', 'specification')

    def __str__(self):
        return f'{self.ids.title} - {self.specification.name} (#{self.order})'
