from rest_framework import serializers
from .models import Project
from apps.users.serializers import UserSerializer

class ProjectListSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True)
    members_count = serializers.IntegerField(source="members.count", read_only=True)

    class Meta:
        model = Project
        fields = (
            "id",
            "name",
            "description",
            "owner_email",
            "members_count",
            "created_at",
            "updated_at",
        )

class ProjectDetailSerializer(serializers.ModelSerializer):
    owner = UserSerializer(read_only=True)
    members = UserSerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = (
            "id",
            "name",
            "description",
            "owner",
            "members",
            "created_at",
            "updated_at",
        )

class ProjectWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = (
            "id",
            "name",
            "description",
            "members",
        )
        read_only_fields = ("owner",)
