from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.permissions import IsAuthenticated

from .models import Task
from .serializers import TaskListSerializer


class TaskViewSet(ReadOnlyModelViewSet):
    serializer_class = TaskListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        # Admin her şeyi görür
        if user.is_staff or user.is_superuser:
            return Task.objects.select_related(
                "project", "assigned_to"
            )

        # Normal user sadece kendisine atanmış task'leri görür
        return Task.objects.filter(assigned_to=user).select_related(
            "project", "assigned_to"
        )
