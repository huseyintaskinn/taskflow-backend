from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.routers import DefaultRouter
from apps.users.views.user_views import UserViewSet

router = DefaultRouter()
router.register("users", UserViewSet, basename="user")

urlpatterns = [
    path('admin/', admin.site.urls),
    path("api/auth/", include("apps.users.urls")),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path("api/docs/", SpectacularSwaggerView.as_view(url_name="schema")),

    path("api/", include(router.urls)),
    path("api/", include("apps.projects.urls")),
    path("api/", include("apps.tasks.urls")),
]
