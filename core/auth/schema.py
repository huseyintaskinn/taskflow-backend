from drf_spectacular.extensions import OpenApiAuthenticationExtension


class BlacklistJWTAuthenticationScheme(OpenApiAuthenticationExtension):
    target_class = "core.auth.authentication.BlacklistJWTAuthentication"
    name = "BearerAuth"

    def get_security_definition(self, auto_schema):
        return {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT",
        }
