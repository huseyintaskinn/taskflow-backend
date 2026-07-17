from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import AccessToken
from core.auth.services.token_blacklist import TokenBlacklistService
import logging

logger = logging.getLogger(__name__)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return Response(
                {"detail": "Authorization header format must be: Bearer <token>"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            token_str = auth_header.split(" ")[1]
            token = AccessToken(token_str)

            jti = token.get("jti")
            exp = token.get("exp")

            if not jti or not exp:
                return Response(
                    {"detail": "Geçersiz token yapısı."},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Calculate remaining Time-To-Live (TTL)
            ttl = exp - int(timezone.now().timestamp())

            if ttl > 0:
                TokenBlacklistService.blacklist_token(jti, ttl)
            
            return Response(status=status.HTTP_204_NO_CONTENT)

        except Exception as e:
            logger.error(f"Logout error: {e}")
            return Response(
                {"detail": "Oturum kapatılamadı. Token geçersiz veya süresi dolmuş."},
                status=status.HTTP_400_BAD_REQUEST
            )
