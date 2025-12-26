from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from apps.users.views.admin_views import AdminDashboardView

urlpatterns = [
    path("login/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("admin/dashboard/", AdminDashboardView.as_view(), name="admin-dashboard"),
]
