from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from django.db import models
from .models import Task
from .serializers import TaskListSerializer, TaskDetailSerializer, TaskWriteSerializer

class TaskViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TaskDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return TaskWriteSerializer
        return TaskListSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Task.objects.all().select_related("project", "assigned_to")

        # Admin views all tasks in the system
        if user.roles.filter(name="ADMIN").exists() or user.is_superuser:
            pass
        else:
            # Users can see tasks if they own the project, are members of the project, or are assigned to the task
            queryset = queryset.filter(
                models.Q(project__owner=user) | 
                models.Q(project__members=user) | 
                models.Q(assigned_to=user)
            ).distinct()

        # Optional project filter: /api/tasks/?project=<project_id>
        project_id = self.request.query_params.get('project')
        if project_id:
            queryset = queryset.filter(project_id=project_id)

        return queryset.order_by("-id")
