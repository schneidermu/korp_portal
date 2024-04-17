from rest_framework import status, viewsets
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from datetime import datetime
from django.shortcuts import get_object_or_404
from rest_framework.response import Response

from homepage.models import Poll, Choice
from .serializers import VoteCreateSerializer, VoteDeleteSerializer, PollSerializer


class PollViewset(viewsets.ModelViewSet):
    '''Вьюсет для опросов'''

    queryset = Poll.objects.filter(
        is_published=True,
        pub_date__lte=datetime.now()
    )
    serializer_class = PollSerializer

    @staticmethod
    def validate_poll(serializer_class, request):
        serializer = serializer_class(
            data=request.data,
            context = {
                "user": request.user,
            }
        )
        serializer.is_valid(raise_exception=True)

        return serializer


    @action(
        detail=False, methods=["post",],
        permission_classes=(IsAuthenticated,),
        serializer_class=VoteCreateSerializer
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
    
    @vote.mapping.delete
    def unvote(self, request):

        serializer = self.validate_poll(VoteDeleteSerializer, request)

        choice = serializer.validated_data

        choice.voted.remove(request.user)

        return Response(
            {
                "message":
                "Вы отменили свой голос"
            },
            status=status.HTTP_204_NO_CONTENT
        )



    
