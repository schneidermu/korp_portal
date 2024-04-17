from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PollViewset

router_version1 = DefaultRouter()
router_version1.register("polls", PollViewset, basename="poll")


urlpatterns = [
    path("", include(router_version1.urls)),
    path("auth/", include("djoser.urls.authtoken")),
]