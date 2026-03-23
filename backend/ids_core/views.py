from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from .models import IDS, Specification, Tag, UserLibrary, IDSSpecification
from .serializers import (
    IDSSerializer, IDSListSerializer,
    SpecificationSerializer,
    TagSerializer,
    UserLibrarySerializer,
    ApplicabilityConditionSerializer,
    RequirementSerializer,
)


class SpecificationViewSet(viewsets.ModelViewSet):
    """
    /api/specifications/                    - list / create
    /api/specifications/<id>/               - detail / update / delete
    /api/specifications/mine/               - current user's specifications
    /api/specifications/<id>/applicability/ - list / create applicability conditions
    /api/specifications/<id>/requirements/  - list / create requirements
    /api/specifications/<id>/tags/          - add / remove tags
    """
    serializer_class = SpecificationSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['created_at', 'name']

    def get_queryset(self):
        return Specification.objects.filter(is_deleted=False).select_related('owner')

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

    @action(detail=True, methods=['get', 'post'],
            permission_classes=[permissions.IsAuthenticatedOrReadOnly])
    def applicability(self, request, pk=None):
        spec = self.get_object()
        if request.method == 'GET':
            return Response(ApplicabilityConditionSerializer(
                spec.applicability_conditions.all(), many=True
            ).data)
        serializer = ApplicabilityConditionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(specification=spec)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get', 'post'],
            permission_classes=[permissions.IsAuthenticatedOrReadOnly])
    def requirements(self, request, pk=None):
        spec = self.get_object()
        if request.method == 'GET':
            return Response(RequirementSerializer(
                spec.requirements.all(), many=True
            ).data)
        serializer = RequirementSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(specification=spec)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post', 'delete'],
            permission_classes=[permissions.IsAuthenticated])
    def tags(self, request, pk=None):
        spec = self.get_object()
        tag_id = request.data.get('tag_id')
        if not tag_id:
            return Response({'detail': 'tag_id required.'}, status=status.HTTP_400_BAD_REQUEST)
        tag = Tag.objects.filter(pk=tag_id).first()
        if not tag:
            return Response({'detail': 'Tag not found.'}, status=status.HTTP_404_NOT_FOUND)
        if request.method == 'POST':
            spec.specification_tags.get_or_create(tag=tag)
            return Response({'detail': 'Tag added.'})
        spec.specification_tags.filter(tag=tag).delete()
        return Response({'detail': 'Tag removed.'})


class IDSViewSet(viewsets.ModelViewSet):
    """
    /api/ids/           - list / create
    /api/ids/<id>/      - detail / update / delete
    /api/ids/mine/      - current user's IDSs
    /api/ids/<id>/tags/ - add / remove tags
    """
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title']

    def get_queryset(self):
        return IDS.objects.filter(is_deleted=False).select_related('owner').prefetch_related('specifications')

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

    @action(detail=True, methods=['post', 'delete'],
            permission_classes=[permissions.IsAuthenticated])
    def tags(self, request, pk=None):
        ids_obj = self.get_object()
        tag_id = request.data.get('tag_id')
        if not tag_id:
            return Response({'detail': 'tag_id required.'}, status=status.HTTP_400_BAD_REQUEST)
        tag = Tag.objects.filter(pk=tag_id).first()
        if not tag:
            return Response({'detail': 'Tag not found.'}, status=status.HTTP_404_NOT_FOUND)
        if request.method == 'POST':
            ids_obj.ids_tags.get_or_create(tag=tag)
            return Response({'detail': 'Tag added.'})
        ids_obj.ids_tags.filter(tag=tag).delete()
        return Response({'detail': 'Tag removed.'})

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
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated],
            url_path='copy_to_library')
    def copy_to_library(self, request, pk=None):
        """Copy this IDS and its specifications to the user's library."""
        ids_obj = self.get_object()
        user = request.user

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

        for ids_spec in IDSSpecification.objects.filter(ids=ids_obj):
            orig_spec = ids_spec.specification
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
            IDSSpecification.objects.create(
                ids=new_ids,
                specification=new_spec,
                order=ids_spec.order,
                is_active=ids_spec.is_active
            )

        return Response(IDSSerializer(new_ids, context={'request': request}).data, status=status.HTTP_201_CREATED)


class TagViewSet(viewsets.ModelViewSet):
    """
    /api/tags/      - list all tags / create
    /api/tags/<id>/ - detail / update / delete
    """
    queryset = Tag.objects.all()
    serializer_class = TagSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'category']


class UserLibraryViewSet(viewsets.ModelViewSet):
    """
    /api/library/       - current user's saved items (GET) / save an item (POST)
    /api/library/<id>/  - remove a saved item (DELETE)
    """
    serializer_class = UserLibrarySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserLibrary.objects.filter(user=self.request.user).select_related('ids', 'specification')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class SearchView(viewsets.ViewSet):
    """
    /api/search/?q=<query>  - search both IDSs and Specifications
    """
    permission_classes = [permissions.AllowAny]

    def list(self, request):
        query = request.query_params.get('q', '').strip()
        if not query:
            return Response({'ids': [], 'specifications': []})

        ids_qs = IDS.objects.filter(is_deleted=False).filter(
            Q(title__icontains=query) | Q(description__icontains=query)
        ).select_related('owner')[:10]

        specs_qs = Specification.objects.filter(is_deleted=False).filter(
            Q(name__icontains=query) | Q(description__icontains=query)
        ).select_related('owner')[:10]

        return Response({
            'ids': IDSListSerializer(ids_qs, many=True).data,
            'specifications': SpecificationSerializer(specs_qs, many=True).data,
        })
