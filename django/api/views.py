from datetime import datetime

from django.db import transaction
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend
from djoser.views import UserViewSet
from employees.models import Employee, Organization, Rating
from homepage.models import News, Poll
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .permissions import IsAdminUserOrReadOnly, IsUserOrReadOnly
from .serializers import (
    FileUploadSerializer,
    HierarchySerializer,
    NewsSerializer,
    OrganizationSerializer,
    OrgStructureSerializer,
    PollSerializer,
    ProfileInOrganizationSerializer,
    RatingDELETESerializer,
    RatingPOSTSerializer,
    RatingPUTSerializer,
    VoteCreateSerializer,
)


class FileUploadAPIView(APIView):
    parser_classes = (MultiPartParser, FormParser)
    serializer_class = FileUploadSerializer

    permission_classes = (IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PollViewset(viewsets.ModelViewSet):
    """Вьюсет для опросов"""

    queryset = Poll.objects.filter(
        is_published=True, pub_date__lte=datetime.now()
    ).order_by("-pub_date")
    serializer_class = PollSerializer
    permission_classes = (
        IsAuthenticated,
        IsAdminUserOrReadOnly,
    )

    filter_backends = (DjangoFilterBackend,)
    filterset_fields = ("organization__id",)

    @staticmethod
    def validate_poll(serializer_class, request):
        serializer = serializer_class(
            data=request.data,
            context={
                "user": request.user,
            },
        )
        serializer.is_valid(raise_exception=True)

        return serializer

    @transaction.atomic
    @action(
        detail=False,
        methods=[
            "post",
        ],
        permission_classes=(IsAuthenticated,),
        serializer_class=VoteCreateSerializer,
    )
    def vote(self, request):
        serializer = self.validate_poll(VoteCreateSerializer, request)

        serializer.save()

        return Response(
            {"message": "Вы успешно проголосовали в опросе"},
            status=status.HTTP_201_CREATED,
        )


#    @transaction.atomic
#    @vote.mapping.delete
#    def unvote(self, request):
#
#        serializer = self.validate_poll(VoteDeleteSerializer, request)
#
#        choices = serializer.validated_data
#
#        for choice in choices:
#            choice.voted.remove(request.user)
#
#        return Response(
#            {
#                "message":
#                "Вы отменили свой голос"
#            },
#            status=status.HTTP_204_NO_CONTENT
#        )


class NewsViewSet(viewsets.ModelViewSet):
    """Вьюсет для новостей"""

    filter_backends = (DjangoFilterBackend,)

    filterset_fields = ("organization__id",)

    permission_classes = (
        IsAuthenticated,
        IsAdminUserOrReadOnly,
    )
    queryset = News.objects.filter(
        is_published=True, pub_date__lte=datetime.now()
    ).order_by("-pub_date")
    serializer_class = NewsSerializer


class ColleagueProfileViewset(UserViewSet):
    """Вьюсет для профиля"""

    permission_classes = (
        IsAuthenticated,
        IsUserOrReadOnly,
    )
    queryset = Employee.objects.all()

    filter_backends = (DjangoFilterBackend, filters.SearchFilter)
    filterset_fields = (
        "structural_division__name",
        "structural_division__id",
        "chief__id",
        "structural_division__organization__id",
    )

    def get_serializer_class(self):
        if (
            self.action not in ("list", "retrieve", "create")
            and self.request.user.is_staff
            and self.kwargs.get("username")
            and self.kwargs.get("username") != self.request.user.username
        ):
            return ProfileInOrganizationSerializer

        return super().get_serializer_class()

    @staticmethod
    def validate_rating(serializer_class, request, id):
        user = request.user
        employee = get_object_or_404(Employee, id=id)
        request.data["user"] = user.id
        request.data["employee"] = employee.id

        serializer = serializer_class(
            data=request.data,
        )
        serializer.is_valid(raise_exception=True)

        return serializer

    @transaction.atomic
    @action(
        detail=True,
        methods=[
            "post",
        ],
        http_method_names=["post", "put", "delete"],
        permission_classes=(IsAuthenticated,),
        serializer_class=RatingPOSTSerializer,
    )
    def rate(self, request, id):
        serializer = self.validate_rating(RatingPOSTSerializer, request, id)
        employee = serializer.validated_data.get("employee")
        serializer.save()

        return Response(
            {
                "message": "Вы успешно оценили сотрудника.",
                "average_rating": employee.average_rating,
                "num_rates": employee.rated.count(),
            },
            status=status.HTTP_200_OK,
        )

    @transaction.atomic
    @rate.mapping.delete
    def unrate(self, request, id):
        serializer = self.validate_rating(RatingDELETESerializer, request, id)

        employee = serializer.validated_data.get("employee")

        Rating.objects.get(user=request.user, employee=employee).delete()

        return Response(
            {
                "message": "Вы успешно удалили свою оценку.",
                "average_rating": employee.average_rating,
                "num_rates": employee.rated.count(),
            },
            status=status.HTTP_204_NO_CONTENT,
        )

    @transaction.atomic
    @rate.mapping.put
    def change_or_rate(self, request, id):
        serializer = self.validate_rating(RatingPUTSerializer, request, id)
        employee = serializer.validated_data.get("employee")
        serializer.save()

        return Response(
            {
                "message": "Вы успешно оценили сотрудника.",
                "average_rating": employee.average_rating,
                "num_rates": employee.rated.count(),
            },
            status=status.HTTP_200_OK,
        )


class OrgStructureViewset(ListModelMixin, RetrieveModelMixin, viewsets.GenericViewSet):
    """Вьюсет для орг. структуры"""

    serializer_class = OrgStructureSerializer
    permission_classes = (
        IsAuthenticated,
        IsAdminUserOrReadOnly,
    )
    queryset = Employee.objects.all()


class OrganizationViewSet(viewsets.ModelViewSet):
    """Вьюсет для организаций для страницы Орг. структуры"""

    serializer_class = OrganizationSerializer
    permission_classes = (
        IsAuthenticated,
        IsAdminUserOrReadOnly,
    )
    queryset = Organization.objects.all()
    filter_backends = (DjangoFilterBackend, filters.SearchFilter)
    filterset_fields = (
        "name",
        "structural_subdivisions",
        "structural_subdivisions__positions__job_title",
        "structural_subdivisions__positions__class_rank",
        "structural_subdivisions__positions__status",
    )
    search_fields = (
        "structural_subdivisions__positions__name",
        "structural_subdivisions__positions__surname",
        "structural_subdivisions__positions__patronym",
    )


class HierarchyViewSet(ListModelMixin, RetrieveModelMixin, viewsets.GenericViewSet):
    """Вьюсет для иерархии."""

    filter_backends = (DjangoFilterBackend,)

    filterset_fields = ("structural_division__organization__id",)

    serializer_class = HierarchySerializer
    permission_classes = (IsAuthenticated,)
    queryset = Employee.objects.all()


class AgreeWithDataProcessingView(APIView):
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        user = request.user
        user.agreed_with_data_processing = True
        user.save(update_fields=["agreed_with_data_processing"])
        return Response(
            {"message": "Согласие на обрабокту персональных данных отправлено."},
            status=status.HTTP_200_OK,
        )
