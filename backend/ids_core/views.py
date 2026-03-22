from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from .models import IDS, Specification
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
