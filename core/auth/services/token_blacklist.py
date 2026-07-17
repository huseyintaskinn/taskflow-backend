from django.conf import settings
import redis
import logging

logger = logging.getLogger(__name__)

# Initialize connection lazily to allow testing without Redis running
try:
    redis_client = redis.from_url(settings.REDIS_URL, socket_timeout=2.0)
except Exception as e:
    logger.error(f"Failed to initialize Redis client: {e}")
    redis_client = None


class TokenBlacklistService:
    @staticmethod
    def blacklist_token(jti: str, expires_in: int) -> None:
        """
        Safely blacklist token in Redis with error handling.
        """
        if not redis_client:
            logger.warning("Redis is not configured. Token not blacklisted.")
            return

        try:
            redis_client.setex(
                name=f"blacklist:{jti}",
                time=expires_in,
                value="true"
            )
        except redis.RedisError as e:
            logger.error(f"Redis write error during token blacklisting: {e}")

    @staticmethod
    def is_blacklisted(jti: str) -> bool:
        """
        Safely check if token is blacklisted. Fallback to False if Redis is unreachable.
        """
        if not redis_client:
            logger.warning("Redis is not configured. Assuming token is not blacklisted.")
            return False

        try:
            return redis_client.exists(f"blacklist:{jti}") == 1
        except redis.RedisError as e:
            logger.error(f"Redis connection error during blacklist lookup: {e}")
            return False
