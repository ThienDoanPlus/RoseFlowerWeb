"""
Django settings for Rose Flowers project.
"""

from pathlib import Path
import os
import sys

BASE_DIR = Path(__file__).resolve().parent.parent

# Load environment variables from .env if present
try:
    from dotenv import load_dotenv
    load_dotenv(BASE_DIR / '.env')
except ImportError:
    pass

# Add backend directory to sys.path so apps can be imported directly
if str(BASE_DIR) not in sys.path:
    sys.path.insert(0, str(BASE_DIR))

SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'django-insecure-rose-flowers-secret-key-prod-dev')

DEBUG = True

ALLOWED_HOSTS = ['*']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'corsheaders',
    'rest_framework',

    # Local Apps
    'apps.accounts',
    'apps.catalog',
    'apps.promotions',
    'apps.orders',
    'apps.payments',
    'apps.reviews',
    'apps.notifications',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# Database (Supports Local SQLite, TiDB Cloud MySQL, and PostgreSQL via DATABASE_URL)
DATABASE_URL = os.environ.get('DATABASE_URL', '').strip()
if DATABASE_URL:
    import dj_database_url
    DATABASES = {
        'default': dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
    # Tối ưu kết nối cho TiDB Cloud (MySQL protocol)
    if 'mysql' in DATABASES['default'].get('ENGINE', ''):
        DATABASES['default'].setdefault('OPTIONS', {})
        DATABASES['default']['OPTIONS'].setdefault('charset', 'utf8mb4')
        # Bật SSL cho TiDB Cloud nếu connect to cloud gateway
        if 'tidbcloud.com' in DATABASE_URL:
            ssl_candidates = [
                '/etc/ssl/certs/ca-certificates.crt',  # Debian / Ubuntu (Render)
                '/etc/pki/tls/certs/ca-bundle.crt',    # RHEL / CentOS
                '/etc/ssl/ca-bundle.pem',              # OpenSUSE
                '/etc/ssl/cert.pem',                   # macOS / Alpine
            ]
            ca_path = next((p for p in ssl_candidates if os.path.exists(p)), None)
            DATABASES['default']['OPTIONS'].setdefault('ssl', {'ca': ca_path} if ca_path else {})
else:
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.sqlite3',
            'NAME': BASE_DIR / 'db.sqlite3',
        }
    }

# Custom User Model with Role Enum
AUTH_USER_MODEL = 'accounts.User'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
]

# Internationalization
LANGUAGE_CODE = 'vi-vn'
TIME_ZONE = 'Asia/Ho_Chi_Minh'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# CORS configuration
CORS_ALLOW_ALL_ORIGINS = True
CORS_ALLOW_CREDENTIALS = True

# Django REST Framework
REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.AllowAny',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME = os.environ.get('CLOUDINARY_CLOUD_NAME', '').strip()
CLOUDINARY_API_KEY = os.environ.get('CLOUDINARY_API_KEY', '').strip()
CLOUDINARY_API_SECRET = os.environ.get('CLOUDINARY_API_SECRET', '').strip()
CLOUDINARY_FOLDER = os.environ.get('CLOUDINARY_FOLDER', 'roseflowerweb').strip()

if CLOUDINARY_CLOUD_NAME and CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET:
    try:
        import cloudinary
        cloudinary.config(
            cloud_name=CLOUDINARY_CLOUD_NAME,
            api_key=CLOUDINARY_API_KEY,
            api_secret=CLOUDINARY_API_SECRET,
            secure=True,
        )
    except ImportError:
        pass

# Groq AI Assistant Configuration
GROQ_API_KEY = os.environ.get('GROQ_API_KEY', '').strip()
GROQ_MODEL = os.environ.get('GROQ_MODEL', 'llama-3.3-70b-versatile').strip()

