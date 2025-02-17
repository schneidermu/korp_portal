import os.path

from djoser.serializers import UserCreateSerializer, UserSerializer
from drf_extra_fields.fields import Base64ImageField
from employees.models import (
    Career,
    Characteristic,
    Competence,
    Conference,
    Course,
    Diploma,
    Employee,
    Hobby,
    Organization,
    Performance,
    Rating,
    Reward,
    Sport,
    StructuralSubdivision,
    Training,
    University,
    UploadedFile,
    Victory,
    Volunteer,
)
from homepage.constants import CHARFIELD_LENGTH
from homepage.models import Attachment, Choice, News, Poll
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from django.db import transaction


class FileUploadSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = ("file",)


ATTRIBUTE_MODEL = (
    ("courses", Course),
    ("competences", Competence),
    ("careers", Career),
    ("trainings", Training),
    ("hobbys", Hobby),
    ("rewards", Reward),
    ("conferences", Conference),
    ("victorys", Victory),
    ("performances", Performance),
    ("sports", Sport),
    ("volunteers", Volunteer),
    ("diplomas", Diploma),
    ("universitys", University),
)


class AttachmentSerializer(serializers.ModelSerializer):
    """Сериализатор картинки"""

    image = Base64ImageField()

    class Meta:
        model = Attachment

        fields = ("image",)


class ChoiceSerializer(serializers.ModelSerializer):
    """Сериализатор варианта ответа"""

    voted = serializers.SerializerMethodField()
    who_voted = serializers.SerializerMethodField()

    class Meta:
        model = Choice
        fields = (
            "id",
            "choice_text",
            "voted",
            "who_voted",
        )
        extra_kwargs = {"id": {"read_only": True}}

    def get_voted(self, obj):
        if hasattr(obj, "voted"):
            return obj.voted.count()
        else:
            return 0

    def get_who_voted(self, obj):
        if obj.poll.is_anonymous:
            current_user = self.context["request"].user
            return [user.id for user in obj.voted.all() if current_user == user]
        return [user.id for user in obj.voted.all()]


class PollSerializer(serializers.ModelSerializer):
    """Сериализатор для опросов"""

    choices = ChoiceSerializer(many=True, required=True)
    voted_count = serializers.SerializerMethodField()

    class Meta:
        model = Poll
        fields = (
            "id",
            "question_text",
            "choices",
            "is_anonymous",
            "is_multiple_choice",
            "organization",
            "pub_date",
            "voted_count",
        )
        extra_kwargs = {
            "id": {"read_only": True},
            "question_text": {"required": True},
            "pub_date": {"required": False},
            "organization": {"required": False},
        }

    @transaction.atomic
    def create(self, validated_data):
        question_text = validated_data.pop("question_text")
        choices = validated_data.pop("choices")
        poll = Poll.objects.create(question_text=question_text)
        for choice in choices:
            Choice.objects.create(poll=poll, choice_text=choice["choice_text"])

        super().update(instance=poll, validated_data=validated_data)

        return poll

    def get_voted_count(self, obj):
        users = []

        for choice in obj.choices.all():
            users.extend([user.id for user in choice.voted.all()])

        return len(set(users))


class VoteCreateSerializer(serializers.Serializer):
    """Сериализатор для голосования"""

    poll_id = serializers.IntegerField()
    choice_ids = serializers.ListField(child=serializers.IntegerField())

    def validate(self, data):
        user = self.context.get("user")
        poll_id = data.get("poll_id")
        choice_ids = data.get("choice_ids")

        poll = Poll.objects.filter(id=poll_id).first()

        if not poll:
            raise serializers.ValidationError({"error": "Опроса не существует"})

        if not poll.is_multiple_choice and len(choice_ids) > 1:
            raise serializers.ValidationError(
                {"error": "Можно выбрать только один вариант ответа."}
            )

        for choice_id in choice_ids:
            choice_exists = Choice.objects.filter(id=choice_id, poll_id=poll_id)

            if not choice_exists:
                raise serializers.ValidationError(
                    {"error": "Такого варианта ответа нет"}
                )

        already_voted = Choice.objects.filter(poll_id=poll_id, voted=user).exists()

        if already_voted:
            raise serializers.ValidationError(
                {"error": "Нельзя голосовать несколько раз"}
            )

        return data

    @transaction.atomic
    def create(self, validated_data):
        for id in validated_data.get("choice_ids"):
            choice = Choice.objects.get(id=id)
            choice.voted.add(self.context.get("user"))

        return validated_data


class VoteDeleteSerializer(serializers.Serializer):
    """Сериализатор для отмены голоса"""

    poll_id = serializers.IntegerField()

    def validate(self, data):
        user = self.context.get("user")
        poll_id = data.get("poll_id")

        poll_exists = Poll.objects.filter(id=poll_id).exists()

        if not poll_exists:
            raise serializers.ValidationError({"error": "Опроса не существует"})

        choices = Choice.objects.filter(poll_id=poll_id, voted=user)

        if not choices:
            raise serializers.ValidationError(
                {"error": "Вы не голосовали в данном опросе"}
            )

        return choices


class NewsSerializer(serializers.ModelSerializer):
    """Сериализатор для новостей"""

    attachments = AttachmentSerializer(many=True, required=False)

    class Meta:
        model = News
        fields = (
            "id",
            "title",
            "text",
            "attachments",
            "video",
            "organization",
            "pub_date",
        )
        optional_fields = (
            "attachments",
            "video",
            "organization",
            "pub_date",
        )

    @transaction.atomic
    def create(self, validated_data):
        attachments_data = validated_data.pop("attachments", [])
        news = News.objects.create(**validated_data)
        for attachment_data in attachments_data:
            Attachment.objects.create(publication=news, **attachment_data)
        return news


class CourseSerializer(serializers.ModelSerializer):
    """Сериализатор для курса"""

    file = serializers.CharField(required=False)

    class Meta:
        model = Course
        exclude = ("characteristic",)

    def validate_file(self, value):
        if value is None:
            return

        if os.path.isfile(value):
            return value
        else:
            raise serializers.ValidationError(f"Incorrect filename {value}")


class DiplomaSerializer(serializers.ModelSerializer):
    """Сериализатор для диплома"""

    file = serializers.CharField(required=False)

    class Meta:
        model = Diploma
        exclude = ("characteristic",)

    def validate_file(self, value):
        if value is None:
            return

        if os.path.isfile(value):
            return value
        else:
            raise serializers.ValidationError(f"Incorrect filename {value}")


class UniversitySerializer(serializers.ModelSerializer):
    """Сериализатор для университета"""

    file = serializers.CharField(required=False)

    class Meta:
        model = University
        exclude = ("characteristic",)

    def validate_file(self, value):
        if value is None:
            return

        if os.path.isfile(value):
            return value
        else:
            raise serializers.ValidationError(f"Incorrect filename {value}")


class CareerSerializer(serializers.ModelSerializer):
    """Сериализатор для карьерного роста"""

    file = serializers.CharField(required=False)

    class Meta:
        model = Career
        exclude = ("characteristic",)

    def validate_file(self, value):
        if value is None:
            return

        if os.path.isfile(value):
            return value
        else:
            raise serializers.ValidationError(f"Incorrect filename {value}")


class CompetenceSerializer(serializers.ModelSerializer):
    """Сериализатор для компетенций"""

    file = serializers.CharField(required=False)

    class Meta:
        model = Competence
        exclude = ("characteristic",)

    def validate_file(self, value):
        if value is None:
            return

        if os.path.isfile(value):
            return value
        else:
            raise serializers.ValidationError(f"Incorrect filename {value}")


class TrainingSerializer(serializers.ModelSerializer):
    """Сериализатор повышения квалификации"""

    file = serializers.CharField(required=False)

    class Meta:
        model = Training
        exclude = ("characteristic",)

    def validate_file(self, value):
        if value is None:
            return

        if os.path.isfile(value):
            return value
        else:
            raise serializers.ValidationError(f"Incorrect filename {value}")


class HobbySerializer(serializers.ModelSerializer):
    """Сериализатор хобби"""

    file = serializers.CharField(required=False)

    class Meta:
        model = Hobby
        exclude = ("characteristic",)

    def validate_file(self, value):
        if value is None:
            return

        if os.path.isfile(value):
            return value
        else:
            raise serializers.ValidationError(f"Incorrect filename {value}")


class RewardSerializer(serializers.ModelSerializer):
    """Сериализатор наград"""

    file = serializers.CharField(required=False)

    class Meta:
        model = Reward
        exclude = ("characteristic",)

    def validate_file(self, value):
        if value is None:
            return

        if os.path.isfile(value):
            return value
        else:
            raise serializers.ValidationError(f"Incorrect filename {value}")


class ConferenceSerializer(serializers.ModelSerializer):
    """Сериализатор конференций"""

    file = serializers.CharField(required=False)

    class Meta:
        model = Conference
        exclude = ("characteristic",)

    def validate_file(self, value):
        if value is None:
            return

        if os.path.isfile(value):
            return value
        else:
            raise serializers.ValidationError(f"Incorrect filename {value}")


class VictorySerializer(serializers.ModelSerializer):
    """Сериализатор победы в конкурсе"""

    file = serializers.CharField(required=False)

    class Meta:
        model = Victory
        exclude = ("characteristic",)

    def validate_file(self, value):
        if value is None:
            return

        if os.path.isfile(value):
            return value
        else:
            raise serializers.ValidationError(f"Incorrect filename {value}")


class PerformanceSerializer(serializers.ModelSerializer):
    """Сериализатор выступления"""

    file = serializers.CharField(required=False)

    class Meta:
        model = Performance
        exclude = ("characteristic",)

    def validate_file(self, value):
        if value is None:
            return

        if os.path.isfile(value):
            return value
        else:
            raise serializers.ValidationError(f"Incorrect filename {value}")


class SportSerializer(serializers.ModelSerializer):
    """Сериализатор спортивного мероприятия"""

    file = serializers.CharField(required=False)

    class Meta:
        model = Sport
        exclude = ("characteristic",)

    def validate_file(self, value):
        if value is None:
            return

        if os.path.isfile(value):
            return value
        else:
            raise serializers.ValidationError(f"Incorrect filename {value}")


class VolunteerSerializer(serializers.ModelSerializer):
    """Сериализатор волонтерства"""

    file = serializers.CharField(required=False)

    class Meta:
        model = Volunteer
        exclude = ("characteristic",)

    def validate_file(self, value):
        if value is None:
            return

        if os.path.isfile(value):
            return value
        else:
            raise serializers.ValidationError(f"Incorrect filename {value}")


class CharacteristicSerializer(serializers.ModelSerializer):
    """Сериализатор характеристики сотрудника"""

    courses = CourseSerializer(many=True, required=False)
    careers = CareerSerializer(many=True, required=False)
    diplomas = DiplomaSerializer(many=True, required=False)
    universitys = UniversitySerializer(many=True, required=False)
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
            "id",
        )


class StructuralSubdivisionInProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = StructuralSubdivision
        fields = ("id", "name", "parent_structural_subdivision")


class OrganizationInProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organization

        fields = (
            "id",
            "name",
        )


class ProfileSerializer(UserSerializer):
    """Сериализатор для просмотра чужих страниц"""

    characteristic = CharacteristicSerializer(required=False)

    supervizor = serializers.SerializerMethodField(read_only=True)
    team = serializers.SerializerMethodField(read_only=True)
    structural_division = StructuralSubdivisionInProfileSerializer(read_only=True)
    organization = OrganizationInProfileSerializer(read_only=True)

    subordinates_count = serializers.SerializerMethodField(read_only=True)

    class Meta(UserSerializer.Meta):
        model = Employee
        fields = (
            "is_superuser",
            "email",
            "structural_division",
            "id",
            "username",
            "name",
            "surname",
            "patronym",
            "avatar",
            "chief",
            "birth_date",
            "email",
            "telephone_number",
            "inner_telephone_number",
            "office",
            "organization",
            "job_title",
            "class_rank",
            "status",
            "average_rating",
            "characteristic",
            "supervizor",
            "team",
            "subordinates_count",
        )
        extra_kwargs = {"is_superuser": {"read_only": True}}

    def validate_avatar(self, value):
        if value is None:
            return

        if os.path.isfile(value):
            return value
        else:
            raise serializers.ValidationError(f"Incorrect filename {value}")

    def get_supervizor(self, object):
        try:
            supervizor = object.structural_division.positions.filter(
                job_title="Руководитель"
            ).first()
        except Exception:
            return None

        if not supervizor:
            return None
        return {
            "id": supervizor.id,
        }

    def get_team(self, object):
        try:
            ids = object.structural_division.positions.values("id")
        except Exception:
            return []
        return ids

    def get_subordinates_count(self, obj):
        return obj.subordinates.count()

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

        super().update(instance, validated_data)
        instance.save()

        if characteristic_update:
            characteristic, created = Characteristic.objects.get_or_create(
                employee=instance
            )
            if not created:
                characteristic.delete()
                characteristic = Characteristic.objects.create(employee=instance)

            for attribute, model in ATTRIBUTE_MODEL:
                self.add_related_fields(
                    characteristic_update, characteristic, attribute, model
                )

            for key in characteristic_update:
                if key:
                    setattr(characteristic, key, characteristic_update[key])

            characteristic.save()

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

    structural_division = serializers.PrimaryKeyRelatedField(
        required=True, queryset=StructuralSubdivision.objects.all()
    )

    def create(self, validated_data):
        password = validated_data.pop("password")
        user = Employee(**validated_data)
        user.set_password(password)
        user.save()
        return user

    class Meta(UserCreateSerializer.Meta):
        model = Employee
        fields = (
            "username",
            "email",
            "password",
            "structural_division",
        )
        extra_kwars = {
            "password": {"write_only": True},
        }


class RatingPOSTSerializer(serializers.ModelSerializer):
    """Сериализатор для оценивания."""

    def validate(self, data):
        employee = data.get("employee")
        user = data.get("user")
        rate = data.get("rate")

        if employee.id == user.id:
            raise serializers.ValidationError(
                {"error": "Вы не можете оценить самого себя."}
            )
        if rate < 1 or rate > 5:
            raise serializers.ValidationError({"error": "Недопустимая оценка."})
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
        fields = "__all__"


class RatingDELETESerializer(serializers.ModelSerializer):
    """Сериализатор для удаления оценки."""

    def validate(self, data):
        employee = data.get("employee")
        user = data.get("user")

        already_rated = user.rates.filter(employee_id=employee.id).exists()

        if employee.id == user.id:
            raise serializers.ValidationError({"error": "Недопустимое действие."})

        if not already_rated:
            raise serializers.ValidationError(
                {"error": "Вы не оценивали данного сотрудника."}
            )

        return data

    class Meta:
        model = Rating
        exclude = ("rate",)


class OrgStructureSerializer(serializers.ModelSerializer):
    """Сериализатор для орг. структуры"""

    supervizor = serializers.SerializerMethodField(read_only=True)

    structural_division = serializers.SlugRelatedField(
        read_only=True, slug_field="name"
    )

    class Meta:
        model = Employee
        fields = (
            "id",
            "username",
            "job_title",
            "name",
            "surname",
            "patronym",
            "avatar",
            "chief",
            "email",
            "telephone_number",
            "inner_telephone_number",
            "office",
            "supervizor",
            "structural_division",
        )

    def get_supervizor(self, object):
        if object:
            try:
                supervizor = object.structural_division.positions.filter(
                    job_title="Руководитель"
                ).first()
            except Exception:
                return None

        if not supervizor:
            return None
        return {
            "id": supervizor.id,
            "name": supervizor.name,
            "surname": supervizor.surname,
            "patronym": supervizor.patronym,
        }


class ProfileInStrucureSerializer(serializers.ModelSerializer):
    """Сериализатор для профиля в Орг. структуре"""

    class Meta:
        model = Employee
        fields = (
            "id",
            "name",
            "surname",
            "patronym",
            "avatar",
            "job_title",
            "class_rank",
            "status",
        )


class StructuralSubdivisionSerializer(serializers.ModelSerializer):
    """Сериализатор структурного подразделения"""

    positions = ProfileInStrucureSerializer(many=True)

    class Meta:
        model = StructuralSubdivision
        fields = (
            "id",
            "name",
            "positions",
            "parent_structural_subdivision",
        )


class OrganizationSerializer(serializers.ModelSerializer):
    """Сериализатор организаций для страницы Орг. структуры"""

    structural_subdivisions = StructuralSubdivisionSerializer(many=True)

    class Meta:
        model = Organization
        fields = ("id", "name", "address", "structural_subdivisions")


class ProfileInOrganizationSerializer(UserSerializer):
    """Сериализатор для изменения орг. структуры"""

    organization = serializers.SlugRelatedField(
        slug_field="name", queryset=Organization.objects.all(), required=False
    )
    structural_division = serializers.SlugRelatedField(
        slug_field="name", queryset=StructuralSubdivision.objects.all()
    )

    class Meta(UserSerializer.Meta):
        model = Employee
        fields = (
            "id",
            "structural_division",
            "organization",
            "job_title",
            "class_rank",
        )

    @transaction.atomic
    def update(self, instance, validated_data):
        structural_division = validated_data.pop("structural_division")
        validated_data.pop("organization", None)

        if structural_division:
            structural_division.positions.add(instance)

        super().update(instance=instance, validated_data=validated_data)

        return instance


class HierarchySerializer(UserSerializer):
    class Meta(UserSerializer.Meta):
        model = Employee
        fields = (
            "id",
            "subordinates",
        )
