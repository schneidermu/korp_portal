import logging

import base64
from datetime import datetime

from django_filters.rest_framework import DjangoFilterBackend
from djoser.views import TokenCreateView, UserViewSet
from rest_framework import filters, generics, status, viewsets
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from django.db import transaction
from django.db.models import CharField, Count, Value
from django.db.models.functions import Concat
from django.shortcuts import get_object_or_404

from employees.models import Competence, Employee, Organization, Rating
from .filters import CompetenceFilter
from homepage.models import News, Poll
from .permissions import IsAdminUserOrReadOnly, IsUserOrReadOnly
from .serializers import (
    CompetenceSerializer,
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

    def get_queryset(self):
        queryset = super().get_queryset()
        sort_by = self.request.query_params.get("sort_by")

        if sort_by == "name":
            queryset = queryset.annotate(
                full_name=Concat(
                    "surname",
                    Value(" "),
                    "name",
                    Value(" "),
                    "patronym",
                    Value(" "),
                    "email",
                    output_field=CharField(),
                )
            ).order_by("full_name")
        elif sort_by:
            valid_fields = [field.name for field in Employee._meta.fields]
            if sort_by in valid_fields:
                queryset = queryset.order_by(sort_by)
        return queryset

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

    filterset_fields = ("id",)

    serializer_class = HierarchySerializer
    permission_classes = (IsAuthenticated,)
    queryset = Organization.objects.all()


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


class ValidateNextCloudView(APIView):
    """
    На эндпоинт приходит запрос с заголовком Authorization: Basic base64("{email}:{token}")
    Нужно вернуть 200 или 401, проверив токен Django (djoser).
    И добавить заголовок WWW-Authenticate: Basic realm="Nextcloud"
    """

    permission_classes = ()  # Allow any by default

    def get(self, request):
        logging.warn(request)
        auth_header = request.META.get("HTTP_AUTHORIZATION", "")
        unauthorized = Response(
            status=status.HTTP_401_UNAUTHORIZED,
            headers={"WWW-Authenticate": 'Basic realm="Nextcloud"'},
        )

        if not auth_header.startswith("Basic "):
            return Response(
                {},
                status=status.HTTP_200_OK,
                headers={"WWW-Authenticate": 'Basic realm="Nextcloud"'},
            )

        try:
            encoded = auth_header.split(" ", 1)[1]
            decoded = base64.b64decode(encoded).decode("utf-8")
            email, token_key = decoded.split(":", 1)
            logging.warn(email, token_key)
        except Exception:
            return unauthorized

        try:
            token = Token.objects.select_related("user").get(key=token_key)
        except Token.DoesNotExist:
            return unauthorized

        if token.user.email != email:
            return unauthorized

        return Response(
            {"message": "Token is valid."},
            status=status.HTTP_200_OK,
            headers={"WWW-Authenticate": 'Basic realm="Nextcloud"'},
        )


class CompetenceListView(generics.ListAPIView):
    """
    Provides a read-only list of all available Competences (id and name).

    Supports searching by competence name using the 'search' query parameter.
    Example: /api/v1/competences/?search=Python
    """

    serializer_class = CompetenceSerializer
    permission_classes = (IsAuthenticated,)

    filter_backends = (
        DjangoFilterBackend,
        filters.SearchFilter,
    )
    filterset_class = CompetenceFilter
    search_fields = ["name"]

    def get_queryset(self):
        """
        Annotate the queryset with the count of related characteristics.
        """
        queryset = Competence.objects.annotate(
            characteristic_count=Count("characteristic")
        ).order_by("name")

        return queryset.order_by("name")


import logging

logger = logging.getLogger(__name__)


class CustomTokenCreateView(TokenCreateView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        if response.status_code == status.HTTP_200_OK:
            try:
                auth_token_key = response.data.get("auth_token")

                if not auth_token_key:
                    return response

                try:
                    token_obj = Token.objects.select_related("user").get(
                        key=auth_token_key
                    )
                except Token.DoesNotExist:
                    return response

                user_email = token_obj.user.email

                if not user_email:
                    return response

                credentials_to_encode = f"{user_email}:{auth_token_key}"
                credentials_as_bytes = credentials_to_encode.encode("utf-8")

                encoded_credentials_bytes = base64.b64encode(credentials_as_bytes)

                encoded_credentials_str = encoded_credentials_bytes.decode("utf-8")

                response.set_cookie(
                    key="nextcloud_authorization",
                    value=encoded_credentials_str,
                    secure=False,
                    httponly=True,
                    path="/",
                    samesite="Lax",
                )

            except Exception as e:
                pass

        return response
