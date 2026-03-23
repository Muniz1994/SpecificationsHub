from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from .models import IDS, Specification, IDSSpecification
from .serializers import (
    IDSSerializer,
    IDSListSerializer,
    SpecificationSerializer,
)


class SpecificationViewSet(viewsets.ModelViewSet):
    """
    /api/specifications/        - list all community specifications (GET)
    /api/specifications/<id>/   - detail (GET) / update / delete
    /api/specifications/mine/   - current user's specifications (GET)
    """
    serializer_class = SpecificationSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'name']

    def get_queryset(self):
        return Specification.objects.select_related('owner').all()

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'],
            permission_classes=[permissions.IsAuthenticated])
    def mine(self, request):
        """Return only the specifications owned by the current user."""
        qs = self.get_queryset().filter(owner=request.user)
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(qs, many=True)
        return Response(serializer.data)


class IDSViewSet(viewsets.ModelViewSet):
    """
    /api/ids/        - list all community IDSs (GET)
    /api/ids/<id>/   - detail with nested specifications (GET)
    /api/ids/mine/   - current user's IDSs (GET)
    """
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']

    def get_queryset(self):
        return IDS.objects.select_related('owner').prefetch_related('specifications').all()

    def get_serializer_class(self):
        if self.action == 'list':
            return IDSListSerializer
        return IDSSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=False, methods=['get'],
            permission_classes=[permissions.IsAuthenticated])
    def mine(self, request):
        """Return only the IDSs owned by the current user."""
        qs = self.get_queryset().filter(owner=request.user)
        page = self.paginate_queryset(qs)
        if page is not None:
            serializer = IDSListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = IDSListSerializer(qs, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'],
            permission_classes=[permissions.IsAuthenticated])
    def copy_to_library(self, request, pk=None):
        """Copy this IDS and its specifications to the user's library."""
        ids_obj = self.get_object()
        user = request.user

        # Create a copy of the IDS for the user
        new_ids = IDS.objects.create(
            title=ids_obj.title,
            copyright_text=ids_obj.copyright_text,
            version=ids_obj.version,
            description=ids_obj.description,
            author_email=ids_obj.author_email,
            date=ids_obj.date,
            purpose=ids_obj.purpose,
            milestone=ids_obj.milestone,
            owner=user,
            is_deleted=False,
            is_public=False
        )

        # Copy all specifications to the user and link them to the new IDS
        for ids_spec in IDSSpecification.objects.filter(ids=ids_obj):
            orig_spec = ids_spec.specification
            # Create a copy of the specification for the user
            new_spec = Specification.objects.create(
                name=orig_spec.name,
                ifc_version=orig_spec.ifc_version,
                identifier=orig_spec.identifier,
                description=orig_spec.description,
                instructions=orig_spec.instructions,
                applicability_data=orig_spec.applicability_data,
                requirements_data=orig_spec.requirements_data,
                owner=user,
                is_deleted=False,
                is_public=False
            )
            # Link the new specification to the new IDS
            IDSSpecification.objects.create(
                ids=new_ids,
                specification=new_spec,
                order=ids_spec.order,
                is_active=ids_spec.is_active
            )

        serializer = self.get_serializer(new_ids)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SearchView(viewsets.ViewSet):
    """
    /api/search/?q=<query>  - search both IDSs and Specifications.
    """
    permission_classes = [permissions.AllowAny]

    def list(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response({'ids': [], 'specifications': []})

        ids_qs = IDS.objects.filter(
            Q(title__icontains=query) | Q(description__icontains=query)
        ).select_related('owner')[:10]

        specs_qs = Specification.objects.filter(
            Q(name__icontains=query) | Q(description__icontains=query)
        ).select_related('owner')[:10]

        return Response({
            'ids': IDSListSerializer(ids_qs, many=True).data,
            'specifications': SpecificationSerializer(specs_qs, many=True).data,
        })
