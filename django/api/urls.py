from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import PollViewset, NewsViewSet, ColleagueProfileViewset, OrgStructureViewset, OrganizationViewSet, FileUploadAPIView, HierarchyViewSet

router_version1 = DefaultRouter()
router_version1.register("polls", PollViewset, basename="poll")
router_version1.register("news", NewsViewSet, basename="news")
router_version1.register(
    "colleagues",
    ColleagueProfileViewset,
    basename="colleagues"
)
router_version1.register(
    "org-structure",
    OrgStructureViewset,
    basename="org-structure"
)
router_version1.register(
    "organization",
    OrganizationViewSet,
    basename="organization"
)

router_version1.register(
    "hierarchy",
    HierarchyViewSet,
    basename="hierarchy"
)


urlpatterns = [
    path("", include(router_version1.urls)),
    path("auth/", include("djoser.urls.authtoken")),
    path("upload-file/", FileUploadAPIView.as_view(), name='upload-file'),
]