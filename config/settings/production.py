from .base import *

DEBUG = False

ALLOWED_HOSTS = ["*"]

CACHES["default"]["LOCATION"] = "redis://127.0.0.1:6379/1"