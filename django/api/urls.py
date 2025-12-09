from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AgreeWithDataProcessingView,
    ColleagueProfileViewset,
    CommentViewSet,
    CompetenceListView,
    CourseViewSet,
    CustomTokenCreateView,
    FavoriteSegmentViewSet,
    FileUploadAPIView,
    HierarchyViewSet,
    IdeaViewSet,
    NewsViewSet,
    OrganizationViewSet,
    OrgStructureViewset,
    PollGroupListView,
    PollViewset,
    SegmentGroupViewSet,
    SegmentViewSet,
    StructuralSubdivisionViewSet,
    ValidateNextCloudView,
    VideoViewSet,
    SecretSantaAPIView,
)

router_version1 = DefaultRouter()
router_version1.register("polls", PollViewset, basename="poll")
router_version1.register("news", NewsViewSet, basename="news")
router_version1.register("colleagues", ColleagueProfileViewset, basename="colleagues")
router_version1.register("org-structure", OrgStructureViewset, basename="org-structure")
router_version1.register("organization", OrganizationViewSet, basename="organization")
router_version1.register("hierarchy", HierarchyViewSet, basename="hierarchy")
router_version1.register("ideas", IdeaViewSet, basename="idea")
router_version1.register(
    "subdivisions", StructuralSubdivisionViewSet, basename="subdivision",
)
router_version1.register("segments", SegmentViewSet, basename="segment")
router_version1.register("segment-groups", SegmentGroupViewSet, basename="segment-group")
router_version1.register("favorite-segments", FavoriteSegmentViewSet, basename="favorite-segment")
router_version1.register("videos", VideoViewSet, basename="video")
router_version1.register("courses", CourseViewSet, basename="course")
router_version1.register("comments", CommentViewSet, basename="comment")


urlpatterns = [
    path("", include(router_version1.urls)),
    path("competences/", CompetenceListView.as_view(), name="competence-list"),
    path("poll_groups/", PollGroupListView.as_view(), name="poll_group-list"),
    path("auth/token/login/", CustomTokenCreateView.as_view(), name="custom_login"),
    path("auth/", include("djoser.urls.authtoken")),
    path("upload-file/", FileUploadAPIView.as_view(), name="upload-file"),
    path(
        "agree_with_data_processing/",
        AgreeWithDataProcessingView.as_view(),
        name="agree_with_data_processing",
    ),
    path(
        "nextcloud/validate/",
        ValidateNextCloudView.as_view(),
        name="nextcloud-validate",
    ),
    path(
        "seasonal/secret_santa/",
        SecretSantaAPIView.as_view(),
        name="secret-santa",
    ),
]
