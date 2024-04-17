from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PollViewset, NewsViewSet

router_version1 = DefaultRouter()
router_version1.register("polls", PollViewset, basename="poll")
router_version1.register("news", NewsViewSet, basename="news")


urlpatterns = [
    path("", include(router_version1.urls)),
    path("auth/", include("djoser.urls.authtoken")),
]