from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.permissions import IsAuthenticated
from django.db import models
from .models import Project
from .serializers import ProjectListSerializer


class ProjectViewSet(ReadOnlyModelViewSet):
    serializer_class = ProjectListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Admin tüm projeleri görür
        if user.is_staff or user.is_superuser:
            return Project.objects.all()

        # Normal user: sahibi olduğu veya üyesi olduğu projeler
        return Project.objects.filter(
            models.Q(owner=user) | models.Q(members=user)
        ).distinct()
