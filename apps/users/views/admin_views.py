from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from core.permissions import IsAdmin
from apps.users.services.user_service import UserService


class AdminDashboardView(APIView):
    """
    Sadece ADMIN rolüne sahip kullanıcılar erişebilir.
    """

    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        user = request.user

        return Response({
            "message": "Admin dashboard erişimi başarılı.",
            "email": user.email,
            "roles": UserService.list_user_roles(user),
        })
