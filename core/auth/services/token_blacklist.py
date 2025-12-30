from django.conf import settings
import redis


redis_client = redis.from_url(settings.REDIS_URL)


class TokenBlacklistService:
    @staticmethod
    def blacklist_token(jti: str, expires_in: int) -> None:
        """
        Token'ı Redis'e blacklist olarak ekler.
        """
        redis_client.setex(
            name=f"blacklist:{jti}",
            time=expires_in,
            value="true"
        )

    @staticmethod
    def is_blacklisted(jti: str) -> bool:
        """
        Token blacklist'te mi kontrol eder.
        """
        return redis_client.exists(f"blacklist:{jti}") == 1
