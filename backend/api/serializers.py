from rest_framework import serializers

from homepage.models import Poll, News, Choice
from employees.models import Employee, Course, Career, Competence, Training, Hobby, Reward, Conference, Victory, Performance, Sport, Volunteer, Characteristic, Rating


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
        fields = (
            'title',
            'text',
            'image',
            'video'
        )


class CourseSerializer(serializers.ModelSerializer):
    '''Сериализатор для курса'''

    class Meta:
        model = Course
        exclude = ("characteristic",)


class CareerSerializer(serializers.ModelSerializer):
    '''Сериализатор для карьерного роста'''

    class Meta:
        model = Career
        exclude = ("characteristic",)


class CompetenceSerializer(serializers.ModelSerializer):
    '''Сериализатор для компетенций'''
    class Meta:
        model = Competence
        exclude = ("characteristic",)


class TrainingSerializer(serializers.ModelSerializer):
    '''Сериализатор повышения квалификации'''
    class Meta:
        model = Training
        exclude = ("characteristic",)


class HobbySerializer(serializers.ModelSerializer):
    '''Сериализатор хобби'''
    class Meta:
        model = Hobby
        exclude = ("characteristic",)


class RewardSerializer(serializers.ModelSerializer):
    '''Сериализатор наград'''
    class Meta:
        model = Reward
        exclude = ("characteristic",)


class ConferenceSerializer(serializers.ModelSerializer):
    '''Сериализатор конференций'''
    class Meta:
        model = Conference
        exclude = ("characteristic",)


class VictorySerializer(serializers.ModelSerializer):
    '''Сериализатор победы в конкурсе'''
    class Meta:
        model = Victory
        exclude = ("characteristic",)


class PerformanceSerializer(serializers.ModelSerializer):
    '''Сериализатор выступления'''
    class Meta:
        model = Performance
        exclude = ("characteristic",)


class SportSerializer(serializers.ModelSerializer):
    '''Сериализатор спортивного мероприятия'''
    class Meta:
        model = Sport
        exclude = ("characteristic",)


class VolunteerSerializer(serializers.ModelSerializer):
    '''Сериализатор волонтерства'''
    class Meta:
        model = Volunteer
        exclude = ("characteristic",)


class CharacteristicSerializer(serializers.ModelSerializer):
    '''Сериализатор характеристики сотрудника'''

    course = CourseSerializer(many=True)
    career = CareerSerializer(many=True)
    competence = CompetenceSerializer(many=True)
    training = TrainingSerializer(many=True)
    hobby = HobbySerializer(many=True)
    reward = RewardSerializer(many=True)
    conference = ConferenceSerializer(many=True)
    victory = VictorySerializer(many=True)
    performance = PerformanceSerializer(many=True)
    sport = SportSerializer(many=True)
    volunteer = VolunteerSerializer(many=True)

    class Meta:
        model = Characteristic
        exclude = (
            "employee",
        )


class MyProfileSerializer(serializers.ModelSerializer):
    '''Сериализатор для личной страницы'''

    characteristic = CharacteristicSerializer()

    class Meta:
        model = Employee
        fields = '__all__'


class ProfileSerializer(serializers.ModelSerializer):
    '''Сериализатор для просмотра чужих страниц'''

    characteristic = CharacteristicSerializer()
    organization = serializers.SlugRelatedField(
        read_only=True,
        slug_field='name'
    )

    class Meta:
        model = Employee
        fields = (
            "id",
            "fio",
            "birth_date",
            "email",
            "telephone_number",
            "organization",
            "job_title",
            "class_rank",
            "status",
            "average_rating",
            "characteristic"
        )


class RatingPOSTSerializer(serializers.ModelSerializer):

    def validate(self, data):
        employee = data.get('employee')
        user = data.get('user')
        rate = data.get('rate')

        if employee.id == user.id:
            raise serializers.ValidationError(
                {"error": "Вы не можете оценить самого себя."}
            )
        if rate < 0 or rate > 5:
            raise serializers.ValidationError(
                {"error": "Недопустимая оценка."}
            )
        already_rated = user.rates.filter(employee_id=employee.id).exists()

        if already_rated:
            raise serializers.ValidationError(
                {"error": "Нельзя оценивать одного сотрудника дважды."}
            )

        return data

    def create(self, validated_data):
        rating = Rating.objects.create(**validated_data)
        return rating

    class Meta:
        model = Rating
        fields = '__all__'


class RatingDELETESerializer(serializers.ModelSerializer):

    def validate(self, data):
        employee = data.get('employee')
        user = data.get('user')

        already_rated = user.rates.filter(employee_id=employee.id).exists()

        if employee.id == user.id:
            raise serializers.ValidationError(
                {"error": "Недопустимое действие."}
            )

        if not already_rated:
            raise serializers.ValidationError(
                {"error": "Вы не оценивали данного сотрудника."}
            )

        return data

    class Meta:
        model = Rating
        exclude = ("rate",)