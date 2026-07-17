from rest_framework import serializers
from .models import Task, Comment
from apps.users.serializers import UserSerializer
from apps.projects.serializers import ProjectListSerializer

class CommentSerializer(serializers.ModelSerializer):
    author_email = serializers.EmailField(source="author.email", read_only=True)
    author_name = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Comment
        fields = (
            "id",
            "task",
            "author",
            "author_email",
            "author_name",
            "content",
            "created_at",
        )
        read_only_fields = ("author", "task")

    def get_author_name(self, obj):
        if obj.author:
            return f"{obj.author.first_name} {obj.author.last_name}".strip() or obj.author.email
        return None

class TaskListSerializer(serializers.ModelSerializer):
    project_name = serializers.CharField(source="project.name", read_only=True)
    project_owner_email = serializers.EmailField(source="project.owner.email", read_only=True)
    assigned_to_email = serializers.EmailField(source="assigned_to.email", read_only=True)
    assigned_to_name = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = (
            "id",
            "title",
            "project",
            "project_name",
            "project_owner_email",
            "assigned_to",
            "assigned_to_email",
            "assigned_to_name",
            "status",
            "priority",
            "due_date",
            "created_at",
            "updated_at",
        )

    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return f"{obj.assigned_to.first_name} {obj.assigned_to.last_name}".strip() or obj.assigned_to.email
        return None

class TaskDetailSerializer(serializers.ModelSerializer):
    project = ProjectListSerializer(read_only=True)
    project_owner_email = serializers.EmailField(source="project.owner.email", read_only=True)
    assigned_to = UserSerializer(read_only=True)
    comments = CommentSerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = (
            "id",
            "title",
            "description",
            "project",
            "project_owner_email",
            "assigned_to",
            "status",
            "priority",
            "due_date",
            "created_at",
            "updated_at",
            "comments",
        )

class TaskWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = (
            "id",
            "project",
            "title",
            "description",
            "assigned_to",
            "status",
            "priority",
            "due_date",
        )

    def validate(self, attrs):
        project = attrs.get('project')
        assigned_to = attrs.get('assigned_to')

        if not project and self.instance:
            project = self.instance.project

        if project and assigned_to:
            # Check if assignee is owner or a member of the project
            is_owner = (assigned_to == project.owner)
            is_member = project.members.filter(id=assigned_to.id).exists()
            if not is_owner and not is_member:
                raise serializers.ValidationError(
                    {"assigned_to": "Atanan personel bu projenin bir üyesi veya sahibi olmalıdır."}
                )
        return attrs
