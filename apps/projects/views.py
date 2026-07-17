from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from django.db import models
from .models import Project
from .serializers import ProjectListSerializer, ProjectDetailSerializer, ProjectWriteSerializer

class ProjectViewSet(ModelViewSet):
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ProjectDetailSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return ProjectWriteSerializer
        return ProjectListSerializer

    def get_queryset(self):
        user = self.request.user

        # Admin can view all projects in the system
        if user.roles.filter(name="ADMIN").exists() or user.is_superuser:
            return Project.objects.all().select_related("owner").prefetch_related("members").order_by("-id")

        # Normal user: owned projects or shared projects
        return Project.objects.filter(
            models.Q(owner=user) | models.Q(members=user)
        ).distinct().select_related("owner").prefetch_related("members").order_by("-id")

    def perform_create(self, serializer):
        # Automatically set request user as project owner
        serializer.save(owner=self.request.user)
