from rest_framework import serializers

from homepage.models import Poll, News, Choice


class ChoiceSerializer(serializers.ModelSerializer):
    '''Сериализатор варианта ответа'''

    voted = serializers.SerializerMethodField()

    class Meta:
        model = Choice
        fields = (
            "choice_text",
            "voted",
        )

    def get_voted(self, obj):
        if hasattr(obj, 'voted'):
            return obj.voted.count()
        else:
            return 0


class PollSerializer(serializers.ModelSerializer):
    '''Сериализатор для опросов'''

    choices = ChoiceSerializer(
        many=True
    )

    class Meta:
        model = Poll
        fields = ("question_text", "choices",)


class VoteCreateSerializer(serializers.Serializer):
    '''Сериализатор для голосования'''

    poll_id = serializers.IntegerField()
    choice_id = serializers.IntegerField()

    def validate(self, data):
        user = self.context.get("user")
        poll_id = data.get("poll_id")
        choice_id = data.get("choice_id")

        poll_exists = Poll.objects.filter(
            id=poll_id
        ).exists()

        if not poll_exists:
            raise serializers.ValidationError(
                {"error": "Опроса не существует"}
            )
        
        choice_exists = Choice.objects.filter(
            id=choice_id,
            poll_id=poll_id
        )

        if not choice_exists:
            raise serializers.ValidationError(
                {"error": "Такого варианта ответа нет"}
            )

        already_voted = Choice.objects.filter(
            poll_id=poll_id,
            voted = user
        ).exists()

        if already_voted:
            raise serializers.ValidationError(
                {"error": "Нельзя проголосовать дважды"}
            )
        
        return data
    
    def create(self, validated_data):

        choice = Choice.objects.get(id=validated_data.get("choice_id"))
        choice.voted.add(self.context.get("user"))

        return validated_data


class VoteDeleteSerializer(serializers.Serializer):
    '''Сериализатор для отмены голоса'''

    poll_id = serializers.IntegerField()

    def validate(self, data):
        user = self.context.get("user")
        poll_id = data.get("poll_id")

        poll_exists = Poll.objects.filter(
            id=poll_id
        ).exists()

        if not poll_exists:
            raise serializers.ValidationError(
                {"error": "Опроса не существует"}
            )

        choice = Choice.objects.filter(
            poll_id=poll_id,
            voted = user
        ).first()

        if not choice:
            raise serializers.ValidationError(
                {"error": "Вы не голосовали в данном опросе"}
            )

        return choice


class NewsSerializer(serializers.ModelSerializer):
    '''Сериализатор для новостей'''

    class Meta:
        model = News
        fields = '__all__'



