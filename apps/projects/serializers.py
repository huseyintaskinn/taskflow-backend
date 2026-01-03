from rest_framework import serializers
from .models import Project


class ProjectListSerializer(serializers.ModelSerializer):
    owner_email = serializers.EmailField(source="owner.email", read_only=True)

    class Meta:
        model = Project
        fields = (
            "id",
            "name",
            "description",
            "owner_email",
            "created_at",
        )
