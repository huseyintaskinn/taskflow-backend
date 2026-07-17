from core.permissions.base import BaseAuthenticatedPermission


class HasRole(BaseAuthenticatedPermission):
    required_roles: list[str] = []

    def has_permission(self, request, view):
        if not super().has_permission(request, view):
            return False

        # Read roles from JWT payload if authenticated via JWT to save DB queries
        if request.auth and hasattr(request.auth, "get"):
            user_roles = request.auth.get("roles", [])
        else:
            user_roles = list(request.user.roles.values_list("name", flat=True))

        return any(role in user_roles for role in self.required_roles)


class IsAdmin(HasRole):
    required_roles = ["ADMIN"]


class IsManager(HasRole):
    required_roles = ["MANAGER"]
