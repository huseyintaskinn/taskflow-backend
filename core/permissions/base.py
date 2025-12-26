from rest_framework.permissions import BasePermission


class BaseAuthenticatedPermission(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated)


class IsAdmin(BasePermission):
    """
    Sadece ADMIN rolüne sahip kullanıcılar erişebilir.
    """

    def has_permission(self, request, view):
        user = request.user

        if not user or not user.is_authenticated:
            return False

        return user.roles.filter(name="ADMIN").exists()
