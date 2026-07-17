from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from apps.users.models import User, Role
from unittest.mock import patch

class UserAuthTests(APITestCase):
    def setUp(self):
        # Create Roles
        self.admin_role = Role.objects.create(name="ADMIN", description="Admin Role")
        self.user_role = Role.objects.create(name="USER", description="User Role")

        # Create Users
        self.admin_user = User.objects.create_user(
            email="admin_test@baykar.com",
            password="testpassword"
        )
        self.admin_user.roles.add(self.admin_role)

        self.normal_user = User.objects.create_user(
            email="user_test@baykar.com",
            password="testpassword"
        )
        self.normal_user.roles.add(self.user_role)

        self.login_url = reverse("token_obtain_pair")
        self.logout_url = reverse("logout")

        # Mock Redis Database Store
        self.redis_db = {}

        def mock_setex(name, time, value):
            self.redis_db[name] = value

        def mock_exists(name):
            return 1 if name in self.redis_db else 0

        # Patch core redis client
        self.redis_patcher = patch("core.auth.services.token_blacklist.redis_client")
        self.mock_redis = self.redis_patcher.start()
        if self.mock_redis:
            self.mock_redis.setex.side_effect = mock_setex
            self.mock_redis.exists.side_effect = mock_exists

        # Patch TokenBlacklistService used in views and authentication
        self.service_patcher = patch("apps.users.views.auth_views.TokenBlacklistService")
        self.mock_service = self.service_patcher.start()

        self.auth_service_patcher = patch("core.auth.authentication.TokenBlacklistService")
        self.mock_auth_service = self.auth_service_patcher.start()

        def service_blacklist(jti, ttl):
            self.redis_db[f"blacklist:{jti}"] = "true"

        def service_is_blacklisted(jti):
            return f"blacklist:{jti}" in self.redis_db

        self.mock_service.blacklist_token.side_effect = service_blacklist
        self.mock_service.is_blacklisted.side_effect = service_is_blacklisted
        self.mock_auth_service.is_blacklisted.side_effect = service_is_blacklisted

    def tearDown(self):
        self.redis_patcher.stop()
        self.service_patcher.stop()
        self.auth_service_patcher.stop()

    def test_jwt_login_successful_with_roles_claims(self):
        """
        Verify that logging in returns JWT tokens, and the access token
        contains the roles inside its claims.
        """
        response = self.client.post(
            self.login_url,
            {"email": "admin_test@baykar.com", "password": "testpassword"},
            format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)

        # Decode token to verify roles claim
        from rest_framework_simplejwt.tokens import AccessToken
        access_token = AccessToken(response.data["access"])
        self.assertIn("roles", access_token)
        self.assertEqual(access_token["roles"], ["ADMIN"])

    def test_logout_blacklists_token(self):
        """
        Verify that logging out blacklists the active JWT access token.
        """
        # Log in
        login_res = self.client.post(
            self.login_url,
            {"email": "user_test@baykar.com", "password": "testpassword"},
            format="json"
        )
        token = login_res.data["access"]
        
        # Access protected endpoint with token
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        
        # Logout
        logout_res = self.client.post(self.logout_url)
        self.assertEqual(logout_res.status_code, status.HTTP_204_NO_CONTENT)

        # Verify JTI is blacklisted in service
        from rest_framework_simplejwt.tokens import AccessToken
        decoded = AccessToken(token)
        jti = decoded["jti"]
        self.assertTrue(self.mock_service.is_blacklisted(jti))
