from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.mixins import ListModelMixin, RetrieveModelMixin
from datetime import datetime
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from django.db import transaction
from djoser.views import UserViewSet
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters

from homepage.models import Poll, News
from employees.models import Employee, Rating, Organization
from .serializers import VoteCreateSerializer, VoteDeleteSerializer, PollSerializer, NewsSerializer, ProfileSerializer, RatingPOSTSerializer, RatingDELETESerializer, OrgStructureSerializer, OrganizationSerializer, ProfileInOrganizationSerializer
from .permissions import IsAdminUserOrReadOnly, IsUserOrReadOnly


class PollViewset(viewsets.ModelViewSet):
    '''Вьюсет для опросов'''

    queryset = Poll.objects.filter(
        is_published=True,
        pub_date__lte=datetime.now()
    )
    serializer_class = PollSerializer
    permission_classes = (IsAdminUserOrReadOnly,)

    @staticmethod
    def validate_poll(serializer_class, request):
        serializer = serializer_class(
            data=request.data,
            context={
                "user": request.user,
            }
        )
        serializer.is_valid(raise_exception=True)

        return serializer

    @transaction.atomic
    @action(
        detail=False, methods=["post",],
        permission_classes=(IsAuthenticated,),
        serializer_class=VoteCreateSerializer,
    )
    def vote(self, request):

        serializer = self.validate_poll(VoteCreateSerializer, request)

        serializer.save()

        return Response(
            {
                "message":
                "Вы успешно проголосовали в опросе"
            },
            status=status.HTTP_201_CREATED
            )

    @transaction.atomic
    @vote.mapping.delete
    def unvote(self, request):

        serializer = self.validate_poll(VoteDeleteSerializer, request)

        choices = serializer.validated_data

        for choice in choices:
            choice.voted.remove(request.user)

        return Response(
            {
                "message":
                "Вы отменили свой голос"
            },
            status=status.HTTP_204_NO_CONTENT
        )


class NewsViewSet(viewsets.ModelViewSet):
    '''Вьюсет для новостей'''

    permission_classes = (IsAdminUserOrReadOnly,)
    queryset = News.objects.filter(
        is_published=True,
        pub_date__lte=datetime.now()
    )
    serializer_class = NewsSerializer


class ColleagueProfileViewset(UserViewSet):
    """Вьюсет для профиля"""

    lookup_field = 'username'

    permission_classes = (IsUserOrReadOnly,)
    queryset = Employee.objects.all()

    def get_serializer_class(self):

        if self.action not in ('list', 'retrieve', 'create'):
            if self.request.user.is_staff and self.kwargs["username"] != self.request.user.username:
                return ProfileInOrganizationSerializer

        return ProfileSerializer

    @staticmethod
    def validate_rating(serializer_class, request, username):
        user = request.user
        employee = get_object_or_404(Employee, username=username)
        request.data['user'] = user.id
        request.data['employee'] = employee.id

        serializer = serializer_class(
            data=request.data,
        )
        serializer.is_valid(raise_exception=True)

        return serializer

    @transaction.atomic
    @action(
        detail=True,
        methods=["post",],
        http_method_names=["post", "delete"],
        permission_classes=(IsAuthenticated,),
        serializer_class=RatingPOSTSerializer
    )
    def rate(self, request, username):

        serializer = self.validate_rating(RatingPOSTSerializer, request, username)
        serializer.save()

        return Response(
            {
                "message": "Вы успешно оценили сотрудника."
            },
            status=status.HTTP_200_OK
        )

    @transaction.atomic
    @rate.mapping.delete
    def unrate(self, request, username):

        serializer = self.validate_rating(RatingDELETESerializer, request, username)

        employee = serializer.validated_data.get("employee")

        Rating.objects.get(user=request.user, employee=employee).delete()

        return Response(
            {
                "message": "Вы успешно удалили свою оценку."
            },
            status=status.HTTP_204_NO_CONTENT
        )


class OrgStructureViewset(
    ListModelMixin,
    RetrieveModelMixin,
    viewsets.GenericViewSet
):
    '''Вьюсет для орг. структуры'''

    serializer_class = OrgStructureSerializer
    permission_classes = (IsAdminUserOrReadOnly,)
    queryset = Employee.objects.all()


class OrganizationViewSet(viewsets.ModelViewSet):
    '''Вьюсет для организаций для страницы Орг. структуры'''

    serializer_class = OrganizationSerializer
    permission_classes = (IsAdminUserOrReadOnly,)
    queryset = Organization.objects.all()
    filter_backends = (DjangoFilterBackend, filters.SearchFilter)
    filterset_fields = (
        'name',
        'structural_subdivisions',
        'structural_subdivisions__positions__job_title',
        'structural_subdivisions__positions__class_rank',
        'structural_subdivisions__positions__status'
    )
    search_fields = ('structural_subdivisions__positions__fio',)
