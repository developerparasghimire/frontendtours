import os
import secrets
import dj_database_url
from pathlib import Path
from decouple import config, Csv
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent

DEBUG = config('DEBUG', default=False, cast=bool)

# SECRET_KEY MUST be supplied in production. In DEBUG, fall back to a dev key.
if DEBUG:
    SECRET_KEY = config('SECRET_KEY', default='django-insecure-local-dev-only')
else:
    SECRET_KEY = config('SECRET_KEY', default='')
    if not SECRET_KEY or SECRET_KEY.startswith('django-insecure-'):
        raise ImproperlyConfigured(
            "SECRET_KEY env var is required in production and must not be the dev default."
        )

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())
CSRF_TRUSTED_ORIGINS = config(
    'CSRF_TRUSTED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000',
    cast=Csv(),
)

# Fail loudly on insecure prod config rather than silently allowing localhost-only origins.
if not DEBUG:
    if ALLOWED_HOSTS == ['localhost', '127.0.0.1']:
        raise ImproperlyConfigured(
            "ALLOWED_HOSTS must be set in production (e.g. api.gettoursnepal.com)."
        )

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third Party
    'anymail',
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'cloudinary',
    'cloudinary_storage',
    'django_summernote',

    # Custom Apps
    'apps.users',
    'apps.tours',
    'apps.events',
    'apps.bookings',
    'apps.payments',
    'apps.reviews',
    'apps.common',
    'apps.blog',
    'apps.testimonials',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
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

DATABASES = {
    'default': dj_database_url.config(
        default=f"sqlite:///{BASE_DIR / 'db.sqlite3'}",
        conn_max_age=600,
        ssl_require=not DEBUG,
    )
}

AUTH_USER_MODEL = 'users.User'

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Cloudinary — always configure, only activate storage in production
CLOUDINARY_STORAGE = {
    'CLOUD_NAME': config('CLOUDINARY_CLOUD_NAME', default=''),
    'API_KEY': config('CLOUDINARY_API_KEY', default=''),
    'API_SECRET': config('CLOUDINARY_API_SECRET', default=''),
}

# Django 5+ STORAGES dict (replaces deprecated STATICFILES_STORAGE / DEFAULT_FILE_STORAGE).
if DEBUG:
    _DEFAULT_STORAGE_BACKEND = 'django.core.files.storage.FileSystemStorage'
else:
    # Production: serve uploads from Cloudinary, static via WhiteNoise.
    _DEFAULT_STORAGE_BACKEND = 'cloudinary_storage.storage.MediaCloudinaryStorage'

STORAGES = {
    'default': {'BACKEND': _DEFAULT_STORAGE_BACKEND},
    'staticfiles': {'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage'},
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticatedOrReadOnly',
    ),
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': config('DRF_ANON_THROTTLE_RATE', default='1000/hour'),
        'user': config('DRF_USER_THROTTLE_RATE', default='5000/hour'),
        'login': config('DRF_LOGIN_THROTTLE_RATE', default='60/hour'),
        'guest_booking': config('DRF_GUEST_BOOKING_THROTTLE_RATE', default='30/hour'),
    },
    'EXCEPTION_HANDLER': 'drf_standardized_errors.handler.exception_handler'
}

from datetime import timedelta
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=15),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:3000,http://127.0.0.1:3000',
    cast=Csv(),
)
CORS_ALLOW_CREDENTIALS = True

if not DEBUG and not CORS_ALLOWED_ORIGINS:
    raise ImproperlyConfigured(
        "CORS_ALLOWED_ORIGINS must be set in production (e.g. https://gettoursnepal.com)."
    )

# Production security defaults. These remain easy to override via env vars.
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
USE_X_FORWARDED_HOST = config('USE_X_FORWARDED_HOST', default=not DEBUG, cast=bool)
SECURE_SSL_REDIRECT = config('SECURE_SSL_REDIRECT', default=not DEBUG, cast=bool)
SESSION_COOKIE_SECURE = config('SESSION_COOKIE_SECURE', default=not DEBUG, cast=bool)
CSRF_COOKIE_SECURE = config('CSRF_COOKIE_SECURE', default=not DEBUG, cast=bool)
SESSION_COOKIE_HTTPONLY = True
CSRF_COOKIE_HTTPONLY = config('CSRF_COOKIE_HTTPONLY', default=True, cast=bool)
SESSION_COOKIE_SAMESITE = config('SESSION_COOKIE_SAMESITE', default='Lax')
CSRF_COOKIE_SAMESITE = config('CSRF_COOKIE_SAMESITE', default='Lax')
SECURE_HSTS_SECONDS = config('SECURE_HSTS_SECONDS', default=0 if DEBUG else 31536000, cast=int)
SECURE_HSTS_INCLUDE_SUBDOMAINS = config('SECURE_HSTS_INCLUDE_SUBDOMAINS', default=not DEBUG, cast=bool)
SECURE_HSTS_PRELOAD = config('SECURE_HSTS_PRELOAD', default=not DEBUG, cast=bool)
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_CROSS_ORIGIN_OPENER_POLICY = 'same-origin'
X_FRAME_OPTIONS = 'DENY'

# ──────────── Email Configuration (Brevo via Anymail HTTP API) ────────────
EMAIL_BACKEND = 'anymail.backends.brevo.EmailBackend'
ANYMAIL = {
    'BREVO_API_KEY': config('BREVO_API_KEY', default=''),
}
DEFAULT_FROM_EMAIL = config('DEFAULT_FROM_EMAIL', default='Get Tours Nepal <noreply@gettoursnepal.com>')
SERVER_EMAIL = config('SERVER_EMAIL', default=DEFAULT_FROM_EMAIL)

# ADMINS receive 500-error emails in production.
ADMINS = [(e, e) for e in config('ADMIN_EMAILS', default='', cast=Csv()) if e.strip()]
MANAGERS = ADMINS

# Comma-separated list of admin/staff emails to notify when a booking is confirmed.
BOOKING_NOTIFY_EMAILS = [
    e.strip() for e in config('BOOKING_NOTIFY_EMAILS', default='', cast=Csv()) if e.strip()
]

# Frontend URL for email links and post-payment redirects
FRONTEND_URL = config('FRONTEND_URL', default='http://localhost:3000')

# Public URL of THIS backend - used to build the absolute returnUrl handed to MPG.
BACKEND_PUBLIC_URL = config('BACKEND_PUBLIC_URL', default='http://localhost:8000')

# ──────────── MPG (Mastercard Payment Gateway / Fingent) ────────────
# All credentials are env-only. Never commit real values.
MPG_GATEWAY_URL    = config('MPG_GATEWAY_URL',    default='')   # e.g. https://na.gateway.mastercard.com
MPG_MERCHANT_ID    = config('MPG_MERCHANT_ID',    default='')   # e.g. 9104535224
MPG_API_PASSWORD   = config('MPG_API_PASSWORD',   default='')
MPG_WEBHOOK_SECRET = config('MPG_WEBHOOK_SECRET', default='')
MPG_API_VERSION    = config('MPG_API_VERSION',    default='100')
MPG_CURRENCY       = config('MPG_CURRENCY',       default='USD')
MPG_MERCHANT_NAME  = config('MPG_MERCHANT_NAME',  default='Get Tours Nepal')
MPG_HTTP_TIMEOUT   = config('MPG_HTTP_TIMEOUT',   default=15, cast=int)
# Conversion rate used when a booking with a USD-priced tour is paid in NPR
# (Nepali cards generally cannot be charged in USD by Nepali acquirers per NRB rules).
# Override via env when the rate moves significantly.
MPG_NPR_RATE       = config('MPG_NPR_RATE',       default='135.00')
# Currencies that are enabled on the merchant account at the acquirer.
# Comma-separated. Anything not in this list is rejected before MPG is called.
MPG_ALLOWED_CURRENCIES = [
    c.strip().upper() for c in config('MPG_ALLOWED_CURRENCIES', default='USD,NPR').split(',') if c.strip()
]
GOOGLE_OAUTH_CLIENT_IDS = [
    client_id.strip()
    for client_id in config('GOOGLE_OAUTH_CLIENT_IDS', default='', cast=Csv())
    if client_id.strip()
]
GOOGLE_OAUTH_CLIENT_SECRET = config('GOOGLE_OAUTH_CLIENT_SECRET', default='')

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'payments': {
            'handlers': ['console'],
            'level': config('PAYMENTS_LOG_LEVEL', default='INFO'),
            'propagate': False,
        },
        'bookings': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'users': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'apps': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'django.security': {
            'handlers': ['console'],
            'level': 'WARNING',
            'propagate': False,
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
}

# ──────────── Celery (async tasks: emails, refund retries) ────────────
# CELERY_BROKER_URL is auto-set by Heroku Redis as REDIS_URL. If neither is
# configured we fall back to eager mode so the project still works without Redis
# (tasks run synchronously in-process). Email service uses this transparently.
CELERY_BROKER_URL = config('CELERY_BROKER_URL', default=config('REDIS_URL', default=''))
CELERY_RESULT_BACKEND = config('CELERY_RESULT_BACKEND', default=CELERY_BROKER_URL)
CELERY_TASK_ALWAYS_EAGER = not bool(CELERY_BROKER_URL)
CELERY_TASK_EAGER_PROPAGATES = True
CELERY_TASK_ACKS_LATE = True
CELERY_TASK_TIME_LIMIT = 60
CELERY_TASK_SOFT_TIME_LIMIT = 50
CELERY_BROKER_CONNECTION_RETRY_ON_STARTUP = True
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE

# Heroku Redis with self-signed cert requires this for rediss:// URLs.
if CELERY_BROKER_URL.startswith('rediss://'):
    import ssl
    CELERY_BROKER_USE_SSL = {'ssl_cert_reqs': ssl.CERT_NONE}
    CELERY_REDIS_BACKEND_USE_SSL = {'ssl_cert_reqs': ssl.CERT_NONE}

# Obfuscated admin URL (env-driven so it differs per deploy).
ADMIN_URL = config('ADMIN_URL', default='gettoursadmin/')
if not ADMIN_URL.endswith('/'):
    ADMIN_URL += '/'

# Deploy hooks (used by the admin "Trigger Deploy" button). Never store full tokens
# in the DB — keep them as env-only secrets. Hook URLs themselves act as bearer
# credentials; rotate in the provider dashboard to revoke access.
VERCEL_DEPLOY_HOOK_URL = config('VERCEL_DEPLOY_HOOK_URL', default='')
HEROKU_DEPLOY_HOOK_URL = config('HEROKU_DEPLOY_HOOK_URL', default='')
GITHUB_DEPLOY_HOOK_URL = config('GITHUB_DEPLOY_HOOK_URL', default='')
