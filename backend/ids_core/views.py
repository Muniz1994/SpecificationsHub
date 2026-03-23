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
    serializer_class = SpecificationSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'name']

    def get_queryset(self):
        return Specification.objects.select_related('owner').all()

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.IsAuthenticatedOrReadOnly()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        # Only the owner may update
        if serializer.instance.owner != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied
        serializer.save()

    def perform_destroy(self, instance):
        if instance.owner != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied
        instance.delete()

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def mine(self, request):
        qs = self.get_queryset().filter(owner=request.user)
        page = self.paginate_queryset(qs)
        if page is not None:
            return self.get_paginated_response(self.get_serializer(page, many=True).data)
        return Response(self.get_serializer(qs, many=True).data)


class IDSViewSet(viewsets.ModelViewSet):
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']

    def get_queryset(self):
        return IDS.objects.select_related('owner').prefetch_related('specifications').all()

    def get_serializer_class(self):
        if self.action == 'list':
            return IDSListSerializer
        return IDSSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [permissions.IsAuthenticatedOrReadOnly()]
        return [permissions.IsAuthenticated()]

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.owner != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied
        serializer.save()

    def perform_destroy(self, instance):
        if instance.owner != self.request.user:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied
        instance.delete()

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def mine(self, request):
        qs = self.get_queryset().filter(owner=request.user)
        page = self.paginate_queryset(qs)
        if page is not None:
            return self.get_paginated_response(IDSListSerializer(page, many=True).data)
        return Response(IDSListSerializer(qs, many=True).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated],
            url_path='add_specification')
    def add_specification(self, request, pk=None):
        ids_obj = self.get_object()
        if ids_obj.owner != request.user:
            return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        spec_id = request.data.get('specification_id')
        spec = Specification.objects.filter(pk=spec_id).first()
        if not spec:
            return Response({'detail': 'Specification not found.'}, status=status.HTTP_404_NOT_FOUND)
        order = ids_obj.specifications.count()
        IDSSpecification.objects.get_or_create(ids=ids_obj, specification=spec, defaults={'order': order})
        return Response(IDSSerializer(ids_obj, context={'request': request}).data)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated],
            url_path='remove_specification')
    def remove_specification(self, request, pk=None):
        ids_obj = self.get_object()
        if ids_obj.owner != request.user:
            return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        spec_id = request.data.get('specification_id')
        IDSSpecification.objects.filter(ids=ids_obj, specification_id=spec_id).delete()
        return Response(IDSSerializer(ids_obj, context={'request': request}).data)


class SearchView(viewsets.ViewSet):
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
