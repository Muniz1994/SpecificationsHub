from rest_framework import serializers
from .models import (
    Specification, IDS, IDSSpecification,
    ApplicabilityCondition, Requirement,
    Tag, IDSTag, SpecificationTag,
    UserLibrary,
)


class TagSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tag
        fields = ('id', 'name', 'category')


class ApplicabilityConditionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApplicabilityCondition
        fields = ('id', 'type', 'key', 'operator', 'value', 'created_at')
        read_only_fields = ('id', 'created_at')


class RequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Requirement
        fields = (
            'id', 'property_set', 'property_name',
            'constraint_type', 'value', 'data_type', 'unit', 'created_at',
        )
        read_only_fields = ('id', 'created_at')


class SpecificationSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    applicability_conditions = ApplicabilityConditionSerializer(many=True, read_only=True)
    requirements = RequirementSerializer(many=True, read_only=True)
    tags = serializers.SerializerMethodField()

    class Meta:
        model = Specification
        fields = (
            'id', 'name', 'ifc_version', 'identifier', 'description', 'instructions',
            'applicability_data', 'requirements_data',
            'applicability_conditions', 'requirements',
            'tags',
            'owner', 'owner_username',
            'is_public', 'is_deleted',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'owner', 'owner_username', 'created_at', 'updated_at')

    def get_tags(self, obj):
        tags = Tag.objects.filter(specification_tags__specification=obj)
        return TagSerializer(tags, many=True).data


class SpecificationMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Specification
        fields = ('id', 'name', 'ifc_version', 'description')


class IDSSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    specifications = SpecificationMiniSerializer(many=True, read_only=True)
    specifications_count = serializers.IntegerField(source='specifications.count', read_only=True)
    tags = serializers.SerializerMethodField()

    class Meta:
        model = IDS
        fields = (
            'id', 'title', 'copyright_text', 'version', 'description',
            'author_email', 'date', 'purpose', 'milestone',
            'owner', 'owner_username',
            'specifications', 'specifications_count',
            'tags',
            'is_public', 'is_deleted',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'owner', 'owner_username', 'created_at', 'updated_at')

    def get_tags(self, obj):
        tags = Tag.objects.filter(ids_tags__ids=obj)
        return TagSerializer(tags, many=True).data


class IDSListSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    specifications_count = serializers.IntegerField(source='specifications.count', read_only=True)
    tags = serializers.SerializerMethodField()

    class Meta:
        model = IDS
        fields = (
            'id', 'title', 'version', 'description',
            'owner', 'owner_username', 'specifications_count',
            'tags',
            'is_public', 'is_deleted',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'owner', 'owner_username', 'created_at', 'updated_at')

    def get_tags(self, obj):
        tags = Tag.objects.filter(ids_tags__ids=obj)
        return TagSerializer(tags, many=True).data


class UserLibrarySerializer(serializers.ModelSerializer):
    ids_detail = IDSListSerializer(source='ids', read_only=True)
    specification_detail = SpecificationMiniSerializer(source='specification', read_only=True)

    class Meta:
        model = UserLibrary
        fields = ('id', 'ids', 'ids_detail', 'specification', 'specification_detail', 'created_at')
        read_only_fields = ('id', 'created_at')
