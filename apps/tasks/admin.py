from django.contrib import admin
from .models import Task


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "title",
        "project",
        "assigned_to",
        "status",
        "priority",
        "created_at",
    )
    list_filter = ("status", "priority")
    search_fields = ("title",)
