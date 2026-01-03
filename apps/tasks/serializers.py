from rest_framework import serializers
from .models import Task


class TaskListSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    assigned_to_email = serializers.EmailField(
        source="assigned_to.email", read_only=True
    )

    class Meta:
        model = Task
        fields = (
            "id",
            "title",
            "project_name",
            "assigned_to_email",
            "status",
            "priority",
            "due_date",
        )
