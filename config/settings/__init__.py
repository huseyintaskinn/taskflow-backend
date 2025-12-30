import os
from dotenv import load_dotenv

load_dotenv()

ENV = os.getenv('ENV', 'local').lower()

if ENV == 'production':
    from .production import *
else:
    from .local import *