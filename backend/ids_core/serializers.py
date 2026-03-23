from rest_framework import serializers
from .models import (
    Specification, IDS, IDSSpecification,
    ApplicabilityCondition, Requirement,
    Tag, IDSTag, SpecificationTag,
    UserLibrary,
    Endorsement,
)
from .ids_export import validate_facet_data


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
    owner_is_certified = serializers.BooleanField(source='owner.is_certified', read_only=True)
    owner_avatar_url = serializers.SerializerMethodField()
    applicability_conditions = ApplicabilityConditionSerializer(many=True, read_only=True)
    requirements = RequirementSerializer(many=True, read_only=True)
    tags = serializers.SerializerMethodField()
    endorsement_count = serializers.SerializerMethodField()
    is_endorsed = serializers.SerializerMethodField()

    class Meta:
        model = Specification
        fields = (
            'id', 'name', 'ifc_version', 'identifier', 'description', 'instructions',
            'applicability_data', 'requirements_data',
            'applicability_conditions', 'requirements',
            'tags',
            'endorsement_count', 'is_endorsed',
            'owner', 'owner_username', 'owner_is_certified', 'owner_avatar_url',
            'is_public', 'is_deleted',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'owner', 'owner_username', 'created_at', 'updated_at')

    def get_owner_avatar_url(self, obj):
        if obj.owner and obj.owner.avatar:
            return f'/avatars/{obj.owner.avatar}'
        return None

    def get_tags(self, obj):
        tags = Tag.objects.filter(specification_tags__specification=obj)
        return TagSerializer(tags, many=True).data

    def get_endorsement_count(self, obj):
        if hasattr(obj, 'endorsement_count'):
            return obj.endorsement_count
        return Endorsement.objects.filter(specification=obj).count()

    def get_is_endorsed(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return Endorsement.objects.filter(specification=obj, user=request.user).exists()
        return False

    def validate_applicability_data(self, value):
        """Validate each facet in applicability_data can build a valid ifctester facet."""
        errors = validate_facet_data(value, label="applicability_data")
        if errors:
            raise serializers.ValidationError(errors)
        return value

    def validate_requirements_data(self, value):
        """Validate each facet in requirements_data can build a valid ifctester facet."""
        errors = validate_facet_data(value, label="requirements_data")
        if errors:
            raise serializers.ValidationError(errors)
        return value


class SpecificationMiniSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    owner_is_certified = serializers.BooleanField(source='owner.is_certified', read_only=True)
    owner_avatar_url = serializers.SerializerMethodField()

    class Meta:
        model = Specification
        fields = ('id', 'name', 'ifc_version', 'description', 'owner_username', 'owner_is_certified', 'owner_avatar_url')

    def get_owner_avatar_url(self, obj):
        if obj.owner and obj.owner.avatar:
            return f'/avatars/{obj.owner.avatar}'
        return None


class IDSSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    owner_is_certified = serializers.BooleanField(source='owner.is_certified', read_only=True)
    owner_avatar_url = serializers.SerializerMethodField()
    specifications = SpecificationMiniSerializer(many=True, read_only=True)
    specifications_count = serializers.IntegerField(source='specifications.count', read_only=True)
    tags = serializers.SerializerMethodField()
    endorsement_count = serializers.SerializerMethodField()
    is_endorsed = serializers.SerializerMethodField()

    class Meta:
        model = IDS
        fields = (
            'id', 'title', 'copyright_text', 'version', 'description',
            'author_email', 'date', 'purpose', 'milestone',
            'owner', 'owner_username', 'owner_is_certified', 'owner_avatar_url',
            'specifications', 'specifications_count',
            'tags',
            'endorsement_count', 'is_endorsed',
            'is_public', 'is_deleted',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'owner', 'owner_username', 'created_at', 'updated_at')

    def get_owner_avatar_url(self, obj):
        if obj.owner and obj.owner.avatar:
            return f'/avatars/{obj.owner.avatar}'
        return None

    def get_tags(self, obj):
        tags = Tag.objects.filter(ids_tags__ids=obj)
        return TagSerializer(tags, many=True).data

    def get_endorsement_count(self, obj):
        if hasattr(obj, 'endorsement_count'):
            return obj.endorsement_count
        return Endorsement.objects.filter(ids=obj).count()

    def get_is_endorsed(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return Endorsement.objects.filter(ids=obj, user=request.user).exists()
        return False


class IDSListSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    owner_is_certified = serializers.BooleanField(source='owner.is_certified', read_only=True)
    owner_avatar_url = serializers.SerializerMethodField()
    specifications_count = serializers.IntegerField(source='specifications.count', read_only=True)
    tags = serializers.SerializerMethodField()
    endorsement_count = serializers.SerializerMethodField()
    is_endorsed = serializers.SerializerMethodField()

    class Meta:
        model = IDS
        fields = (
            'id', 'title', 'version', 'description',
            'owner', 'owner_username', 'owner_is_certified', 'owner_avatar_url', 'specifications_count',
            'tags',
            'endorsement_count', 'is_endorsed',
            'is_public', 'is_deleted',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'owner', 'owner_username', 'created_at', 'updated_at')

    def get_owner_avatar_url(self, obj):
        if obj.owner and obj.owner.avatar:
            return f'/avatars/{obj.owner.avatar}'
        return None

    def get_tags(self, obj):
        tags = Tag.objects.filter(ids_tags__ids=obj)
        return TagSerializer(tags, many=True).data

    def get_endorsement_count(self, obj):
        if hasattr(obj, 'endorsement_count'):
            return obj.endorsement_count
        return Endorsement.objects.filter(ids=obj).count()

    def get_is_endorsed(self, obj):
        request = self.context.get('request')
        if request and request.user and request.user.is_authenticated:
            return Endorsement.objects.filter(ids=obj, user=request.user).exists()
        return False


class UserLibrarySerializer(serializers.ModelSerializer):
    ids_detail = IDSListSerializer(source='ids', read_only=True)
    specification_detail = SpecificationMiniSerializer(source='specification', read_only=True)

    class Meta:
        model = UserLibrary
        fields = ('id', 'ids', 'ids_detail', 'specification', 'specification_detail', 'created_at')
        read_only_fields = ('id', 'created_at')
