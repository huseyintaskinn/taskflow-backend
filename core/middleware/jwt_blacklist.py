import redis
from django.conf import settings
from django.http import JsonResponse
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework.exceptions import AuthenticationFailed


class JWTBlacklistMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response
        self.redis = redis.from_url(settings.REDIS_URL)

    def __call__(self, request):
        auth_header = request.headers.get("Authorization")

        if auth_header and auth_header.startswith("Bearer "):
            token_str = auth_header.split(" ")[1]

            try:
                token = AccessToken(token_str)
                jti = token["jti"]

                if self.redis.exists(f"blacklist:access:{jti}"):
                    return JsonResponse(
                        {"detail": "Token has been revoked."},
                        status=401
                    )

            except Exception:
                pass

        return self.get_response(request)
