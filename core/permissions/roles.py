from core.permissions.base import BaseAuthenticatedPermission


class HasRole(BaseAuthenticatedPermission):
    required_roles = []

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False

        user_roles = request.user.roles.values_list("name", flat=True)
        return any(role in user_roles for role in self.required_roles)


class IsAdmin(HasRole):
    required_roles = ["admin"]


class IsManager(HasRole):
    required_roles = ["manager"]
