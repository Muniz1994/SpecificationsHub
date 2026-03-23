from rest_framework import serializers
from .models import Specification, IDS, IDSSpecification


class SpecificationSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = Specification
        fields = (
            'id', 'name', 'ifc_version', 'identifier', 'description',
            'instructions', 'applicability_data', 'requirements_data',
            'owner', 'owner_username', 'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'owner', 'owner_username', 'created_at', 'updated_at')


class SpecificationMiniSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)

    class Meta:
        model = Specification
        fields = ('id', 'name', 'ifc_version', 'description', 'owner_username')


class IDSSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    specifications = SpecificationMiniSerializer(many=True, read_only=True)
    specifications_count = serializers.IntegerField(
        source='specifications.count', read_only=True
    )

    class Meta:
        model = IDS
        fields = (
            'id', 'title', 'copyright_text', 'version', 'description',
            'author_email', 'date', 'purpose', 'milestone',
            'owner', 'owner_username',
            'specifications', 'specifications_count',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'owner', 'owner_username', 'created_at', 'updated_at')


class IDSListSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    specifications_count = serializers.IntegerField(
        source='specifications.count', read_only=True
    )

    class Meta:
        model = IDS
        fields = (
            'id', 'title', 'version', 'description',
            'owner', 'owner_username', 'specifications_count',
            'created_at', 'updated_at',
        )
        read_only_fields = ('id', 'owner', 'owner_username', 'created_at', 'updated_at')
