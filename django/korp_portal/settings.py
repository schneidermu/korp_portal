"""
Django settings for korp_portal project.

Generated by 'django-admin startproject' using Django 4.2.8.

For more information on this file, see
https://docs.djangoproject.com/en/4.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/4.2/ref/settings/
"""

import os
import socket
from pathlib import Path

import ldap
from django_auth_ldap.config import GroupOfUniqueNamesType, LDAPSearch

FORCE_SCRIPT_NAME = os.getenv("SCRIPT_NAME", "")


AUTH_LDAP_SERVER_URI = os.getenv("LDAP_URI", "0")
LDAP_USER = os.getenv("LDAP_USER", "0")
LDAP_ROOT = os.getenv("LDAP_ROOT", "0")

AUTH_LDAP_BIND_DN = f"cn={LDAP_USER},ou=users,{LDAP_ROOT}"
AUTH_LDAP_BIND_PASSWORD = os.getenv("LDAP_PASSWORD", "0")

AUTH_LDAP_USER_SEARCH = LDAPSearch(
    f"ou=users,{LDAP_ROOT}",
    ldap.SCOPE_SUBTREE,
    "(uid=%(user)s)",
)

AUTH_LDAP_GROUP_SEARCH = LDAPSearch(
    f"ou=groups,{LDAP_ROOT}",
    ldap.SCOPE_SUBTREE,
    "(objectClass=groupOfUniqueNames)",
)

AUTH_LDAP_GROUP_TYPE = GroupOfUniqueNamesType()

AUTH_LDAP_MIRROR_GROUPS = True

AUTH_LDAP_USER_ATTR_MAP = {
    "id": "employeeNumber",
    "email": "uid",
    "password": "userPassword",
    "name": "givenName",
    "patronym": "displayName",
    "surname": "sn",
    "job_title": "title",
}

AUTH_LDAP_GROUP_ATTR_MAP = {
    "name": "cn",
    "description": "description",
    "members": "uniqueMember",
}

GROUP_USER = os.getenv("GROUP_USER", "kp_user")
GROUP_ADMIN = os.getenv("GROUP_ADMIN", "kp_admin")

AUTH_LDAP_USER_FLAGS_BY_GROUP = {
    "is_active": f"cn=active,ou=groups,{LDAP_ROOT}",
    "is_staff": f"cn=staff,ou=groups,{LDAP_ROOT}",
    "is_superuser": f"cn=superuser,ou=groups,{LDAP_ROOT}",
}

AUTHENTICATION_BACKENDS = ("korp_portal.backends.LiferayDatabaseBackend",)

LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "handlers": {
        "mail_admins": {
            "level": "ERROR",
            "class": "django.utils.log.AdminEmailHandler",
        },
        "stream_to_console": {"level": "DEBUG", "class": "logging.StreamHandler"},
    },
    "loggers": {
        "django.request": {
            "handlers": ["mail_admins"],
            "level": "ERROR",
            "propagate": True,
        },
        "django_auth_ldap": {
            "handlers": ["stream_to_console"],
            "level": "DEBUG",
            "propagate": True,
        },
    },
}
ldap.OPT_DEBUG_LEVEL = 1

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/4.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.getenv("SECRET_KEY", "")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = os.getenv("DEBUG", "").lower() in ["1", "true", "yes"]

ALLOWED_HOSTS = [".localhost", socket.gethostname()]
if os.getenv("ALLOWED_HOSTS", "") != "":
    ALLOWED_HOSTS.extend(os.environ["ALLOWED_HOSTS"].split(","))

CORS_URLS_REGEX = r"^/api/.*$"

CORS_ALLOWED_ORIGIN_REGEXES = [r"^http://([a-z0-9]+\.)*localhost(:[0-9]+)?$"]

DJANGO_PORT = os.getenv("DJANGO_PORT", 8000)

CORS_ALLOWED_ORIGINS = [f"http://{socket.gethostname()}:{DJANGO_PORT}"]
if os.getenv("ALLOWED_ORIGINS", "") != "":
    CORS_ALLOWED_ORIGINS.extend(os.environ["ALLOWED_ORIGINS"].split(","))

CORS_ALLOW_CREDENTIALS = True

# Application definition

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "django_extensions",
    "django_bootstrap5",
    "drf_yasg",
    "rest_framework",
    "corsheaders",
    "django_filters",
    "rest_framework.authtoken",
    "djoser",
    "phonenumber_field",
    "homepage",
    "employees",
    "api",
]


MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "korp_portal.urls"

TEMPLATES_DIR = BASE_DIR / "templates"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [TEMPLATES_DIR],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "korp_portal.wsgi.application"


# Database
# https://docs.djangoproject.com/en/4.2/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.getenv("POSTGRES_DB", "django"),
        "USER": os.getenv("POSTGRES_USER", "django"),
        "PASSWORD": os.getenv("POSTGRES_PASSWORD", ""),
        "HOST": os.getenv("DB_HOST", "127.0.0.1"),
        "PORT": os.getenv("DB_PORT", 5432),
    }
}

AUTH_USER_MODEL = "employees.Employee"

# Password validation
# https://docs.djangoproject.com/en/4.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

MEDIA_URL = "/media/"
MEDIA_ROOT = "/media/"


# Internationalization
# https://docs.djangoproject.com/en/4.2/topics/i18n/

LANGUAGE_CODE = "ru-ru"

TIME_ZONE = "Europe/Moscow"

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/4.2/howto/static-files/

STATIC_URL = FORCE_SCRIPT_NAME + "/static/"
STATIC_ROOT = BASE_DIR / "collected_static"

STORAGES = {
    "default": {
        "BACKEND": "django.core.files.storage.FileSystemStorage",
    },
    "staticfiles": {
        "BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage",
    },
}

# Default primary key field type
# https://docs.djangoproject.com/en/4.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.TokenAuthentication",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.LimitOffsetPagination",
}

DJOSER = {
    "HIDE_USERS": False,
    "SERIALIZERS": {
        "user": "api.serializers.ProfileSerializer",
        "user_list": "api.serializers.ProfileSerializer",
        "current_user": "api.serializers.ProfileSerializer",
        "user_create": "api.serializers.ProfileCreateSerializer",
    },
}
