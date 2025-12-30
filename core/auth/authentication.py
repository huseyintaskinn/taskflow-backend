from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import AuthenticationFailed
from core.auth.services.token_blacklist import TokenBlacklistService


class BlacklistJWTAuthentication(JWTAuthentication):
    """
    JWT doğrulamasına Redis blacklist kontrolü ekler.
    """

    def get_validated_token(self, raw_token):
        validated_token = super().get_validated_token(raw_token)

        jti = validated_token.get("jti")
        if jti and TokenBlacklistService.is_blacklisted(jti):
            raise AuthenticationFailed("Token has been blacklisted")

        return validated_token
