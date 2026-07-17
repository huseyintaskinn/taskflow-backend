from rest_framework.viewsets import ReadOnlyModelViewSet
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.users.models import User
from apps.users.serializers import UserSerializer


class UserViewSet(ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = UserSerializer
    queryset = User.objects.all().prefetch_related("roles").order_by("id")

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        """
        Returns active authenticated user's details.
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
