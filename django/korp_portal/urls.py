import os

from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path, re_path

IS_PRODUCTION_MODE = os.getenv("PROD") == "1"

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include("api.urls")),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

if not IS_PRODUCTION_MODE:
    schema_view = get_schema_view(
        openapi.Info(
            title="Корпоративный портал API",
            default_version="v1",
            description="Документация для приложения корпоративного портала",
            contact=openapi.Contact(email="schneider.m.yu@gmail.com"),
            license=openapi.License(name="BSD License"),
        ),
        public=True,
        permission_classes=(permissions.AllowAny,),
    )

    urlpatterns += [
        re_path(
            r"^swagger(?P<format>\.json|\.yaml)$",
            schema_view.without_ui(cache_timeout=0),
            name="schema-json",
        ),
        re_path(
            r"^swagger/$",
            schema_view.with_ui("swagger", cache_timeout=0),
            name="schema-swagger-ui",
        ),
        re_path(
            r"^redoc/$",
            schema_view.with_ui("redoc", cache_timeout=0),
            name="schema-redoc",
        ),
    ]
