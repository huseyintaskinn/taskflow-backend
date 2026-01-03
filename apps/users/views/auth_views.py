from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import AccessToken
import redis


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        auth_header = request.headers.get("Authorization")

        if not auth_header:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        token_str = auth_header.split(" ")[1]
        token = AccessToken(token_str)

        jti = token["jti"]
        exp = token["exp"]

        ttl = exp - int(timezone.now().timestamp())

        r = redis.from_url(settings.REDIS_URL)
        r.setex(f"blacklist:access:{jti}", ttl, "1")

        return Response(status=status.HTTP_204_NO_CONTENT)
