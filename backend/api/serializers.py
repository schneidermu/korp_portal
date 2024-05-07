from rest_framework import serializers
from django.db import transaction
from djoser.serializers import UserSerializer, UserCreateSerializer
from rest_framework.validators import UniqueValidator

from homepage.models import Poll, News, Choice
from homepage.constants import CHARFIELD_LENGTH
from employees.models import Employee, Course, Career, Competence, Training, Hobby, Reward, Conference, Victory, Performance, Sport, Volunteer, Characteristic, Rating

ATTRIBUTE_MODEL = (
    ("courses", Course),
    ("competences", Competence),
    ("trainings", Training),
    ("hobbys", Hobby),
    ("rewards", Reward),
    ("conferences", Conference),
    ("victorys", Victory),
    ("performances", Performance),
    ("sports", Sport),
    ("volunteers", Volunteer),
)

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

    @transaction.atomic
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

    courses = CourseSerializer(many=True, required=False)
    careers = CareerSerializer(many=True, required=False)
    competences = CompetenceSerializer(many=True, required=False)
    trainings = TrainingSerializer(many=True, required=False)
    hobbys = HobbySerializer(many=True, required=False)
    rewards = RewardSerializer(many=True, required=False)
    conferences = ConferenceSerializer(many=True, required=False)
    victorys = VictorySerializer(many=True, required=False)
    performances = PerformanceSerializer(many=True, required=False)
    sports = SportSerializer(many=True, required=False)
    volunteers = VolunteerSerializer(many=True, required=False)

    class Meta:
        model = Characteristic
        exclude = (
            "employee",
        )


class ProfileSerializer(UserSerializer):
    '''Сериализатор для просмотра чужих страниц'''

    characteristic = CharacteristicSerializer(required=False)
    organization = serializers.SlugRelatedField(
        read_only=True,
        slug_field='name'
    )
    supervizor = serializers.SerializerMethodField(
        read_only=True
    )
    team = serializers.SerializerMethodField(
        read_only=True
    )
    structural_division = serializers.SlugRelatedField(
        read_only=True,
        slug_field='name'
    )

    class Meta(UserSerializer.Meta):
        model = Employee
        fields = (
            "email",
            "structural_division",
            "id",
            "username",
            "fio",
            "birth_date",
            "email",
            "telephone_number",
            "organization",
            "job_title",
            "class_rank",
            "status",
            "average_rating",
            "characteristic",
            "supervizor",
            "team",
        )

    def get_supervizor(self, object):
        supervizor = object.structural_division.positions.filter(job_title='Руководитель').first()

        if not supervizor:
            return None
        return {
            "id":supervizor.id,
        }
    
    def get_team(self, object):
        ids = object.structural_division.positions.values('id')
        return ids

    @staticmethod
    def add_related_fields(characteristic_update, characteristic, name, model_class):
        objects = characteristic_update.pop(name, None)

        if not objects:
            return

        new_objects = []

        for obj in objects:
            new_objects.append(model_class(**obj))

        created_objects = model_class.objects.bulk_create(new_objects)

        for created_object in created_objects:
            getattr(characteristic, name).add(created_object)


    @transaction.atomic
    def update(self, instance, validated_data):
        characteristic_update = validated_data.pop("characteristic", None)

        characteristic, created = Characteristic.objects.get_or_create(employee=instance)

        for attribute, model in ATTRIBUTE_MODEL:
            self.add_related_fields(characteristic_update, characteristic, attribute, model)

        Characteristic.objects.filter(employee=instance).update(**characteristic_update)

        super().update(instance, validated_data)
        instance.save()

        return instance
    

class ProfileCreateSerializer(UserCreateSerializer):

    email = serializers.EmailField(
        max_length=CHARFIELD_LENGTH,
        required=True,
        validators=[
            UniqueValidator(queryset=Employee.objects.all()),
        ],
    )

    username = serializers.CharField(
        max_length=CHARFIELD_LENGTH,
        required=True,
        validators=[
            UniqueValidator(queryset=Employee.objects.all()),
        ],
    )

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = Employee(**validated_data)
        user.set_password(password)
        user.save()
        return user

    class Meta(UserCreateSerializer.Meta):
        model = Employee



class RatingPOSTSerializer(serializers.ModelSerializer):
    '''Сериализатор для оценивания.'''

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

    @transaction.atomic
    def create(self, validated_data):
        rating = Rating.objects.create(**validated_data)
        return rating

    class Meta:
        model = Rating
        fields = '__all__'


class RatingDELETESerializer(serializers.ModelSerializer):
    '''Сериализатор для удаления оценки.'''

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


class OrgStructureSerializer(serializers.ModelSerializer):
    '''Сериализатор для орг. структуры'''

    supervizor = serializers.SerializerMethodField(
        read_only=True
    )

    structural_division = serializers.SlugRelatedField(
        read_only=True,
        slug_field='name'
    )

    class Meta:
        model = Employee
        fields = (
            "id",
            "username",
            "job_title",
            "fio",
            "email",
            "telephone_number",
            "supervizor",
            "structural_division",
        )

    def get_supervizor(self, object):
        supervizor = object.structural_division.positions.filter(job_title='Руководитель').first()

        if not supervizor:
            return None
        return {
            "id": supervizor.id,
            "fio": supervizor.fio,
        }


        