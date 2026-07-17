from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from .models import Task, Comment
from .serializers import TaskListSerializer, TaskDetailSerializer, TaskWriteSerializer, CommentSerializer
from apps.projects.models import Project

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

    def perform_create(self, serializer):
        user = self.request.user
        project_id = self.request.data.get("project")
        
        try:
            project = Project.objects.get(id=project_id)
        except Project.DoesNotExist:
            raise PermissionDenied("Geçersiz proje seçimi.")

        # Check if user has permission to create tasks in this project
        is_member_or_owner = project.owner == user or project.members.filter(id=user.id).exists()
        is_admin_or_manager = user.roles.filter(name__in=["ADMIN", "MANAGER"]).exists() or user.is_superuser
        
        if not (is_member_or_owner or is_admin_or_manager):
            raise PermissionDenied("Bu projeye görev ekleme yetkiniz bulunmamaktadır.")

        serializer.save()

    def perform_update(self, serializer):
        user = self.request.user
        task = self.get_object()
        project = task.project

        # Enforce transitions validation
        next_status = self.request.data.get("status")
        if next_status and next_status != task.status:
            # If changing status to DONE: only project owner, manager or admin can approve it
            if next_status == "DONE":
                is_authorized_approver = project.owner == user or user.roles.filter(name__in=["ADMIN", "MANAGER"]).exists() or user.is_superuser
                if not is_authorized_approver:
                    raise PermissionDenied("Görevleri 'Tamamlandı' durumuna geçirme yetkisi sadece Proje Yöneticisi (Manager) veya Admin rollerine aittir.")
            else:
                # Regular transition or rollback (TODO, IN_PROGRESS, IN_REVIEW): must be assignee, project owner, manager or admin
                is_assignee = task.assigned_to == user
                is_authorized = is_assignee or project.owner == user or user.roles.filter(name__in=["ADMIN", "MANAGER"]).exists() or user.is_superuser
                if not is_authorized:
                    raise PermissionDenied("Bu görevin durumunu güncelleme yetkiniz bulunmamaktadır.")

        serializer.save()

    def perform_destroy(self, instance):
        user = self.request.user
        project = instance.project

        # Only project owner, admin or manager can delete tasks
        is_owner = project.owner == user
        is_manager_or_admin = user.roles.filter(name__in=["ADMIN", "MANAGER"]).exists() or user.is_superuser

        if not (is_owner or is_manager_or_admin):
            raise PermissionDenied("Görev silme yetkisi sadece Proje Sahibi, Manager veya Admin rollerine aittir.")

        instance.delete()

    @action(detail=True, methods=["post"], url_path="comments")
    def add_comment(self, request, pk=None):
        """
        Creates a comment for the task.
        """
        task = self.get_object()
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(task=task, author=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)
