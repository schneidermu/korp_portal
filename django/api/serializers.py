import os.path

from djoser.serializers import UserCreateSerializer, UserSerializer
from drf_extra_fields.fields import Base64ImageField
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from django.db import transaction
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

    characteristic_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Competence
        exclude = ("characteristic",)


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
    trainings = TrainingSerializer(many=True, required=False)
    hobbys = HobbySerializer(many=True, required=False)
    rewards = RewardSerializer(many=True, required=False)
    conferences = ConferenceSerializer(many=True, required=False)
    victorys = VictorySerializer(many=True, required=False)
    performances = PerformanceSerializer(many=True, required=False)
    sports = SportSerializer(many=True, required=False)
    volunteers = VolunteerSerializer(many=True, required=False)
    competences = CompetenceSerializer(many=True, required=False)

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

    supervisor = serializers.SerializerMethodField(read_only=True)
    team = serializers.SerializerMethodField(read_only=True)
    structural_division = StructuralSubdivisionInProfileSerializer(read_only=True)
    organization = OrganizationInProfileSerializer(read_only=True)

    subordinates_count = serializers.SerializerMethodField(read_only=True)
    num_rates = serializers.SerializerMethodField(read_only=True)
    rated_by_me = serializers.SerializerMethodField(read_only=True)
    chief = serializers.SerializerMethodField(read_only=True)

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
            "sex",
            "class_rank",
            "status",
            "average_rating",
            "characteristic",
            "supervisor",
            "team",
            "subordinates_count",
            "num_rates",
            "rated_by_me",
            "agreed_with_data_processing",
        )
        extra_kwargs = {
            "is_superuser": {"read_only": True},
            "agreed_with_data_processing": {"read_only": True},
        }

    def validate_avatar(self, value):
        if value is None:
            return

        if os.path.isfile(value):
            return value
        else:
            raise serializers.ValidationError(f"Incorrect filename {value}")

    def get_supervisor(self, obj):
        if hasattr(obj, "structural_division") and obj.structural_division:
            structural_division = obj.structural_division
            supervisor = structural_division.supervisor
            if supervisor:
                return supervisor.id
        return None

    def get_team(self, object):
        try:
            ids = object.structural_division.positions.values("id")
        except Exception:
            ids = []
        return ids

    def get_subordinates_count(self, obj):
        return obj.subordinates.count()

    def get_num_rates(self, obj):
        return obj.rated.count()

    def get_rated_by_me(self, obj):
        user = self.context["request"].user

        rating = obj.rated.filter(user=user).first()
        if rating:
            rate = rating.rate
        else:
            rate = None
        return rate

    def get_chief(self, obj):
        current_division = obj.structural_division

        while current_division is not None:
            if current_division.chief is not None:
                if current_division.chief != obj:
                    return current_division.chief.id
                elif (
                    current_division.supervisor is not None
                    and current_division.supervisor != obj
                ):
                    return current_division.supervisor.id

            elif (
                current_division.supervisor is not None
                and current_division.supervisor != obj
            ):
                return current_division.supervisor.id

            current_division = current_division.parent_structural_subdivision

        return None

    @staticmethod
    def add_related_fields(characteristic_update, characteristic, name, model_class):
        """
        Adds related objects to the characteristic.
        For Competence, uses get_or_create based on 'name'.
        For other models, creates new instances.
        Pops the key from characteristic_update dictionary.
        """
        objects_data = characteristic_update.pop(name, None)

        # Skip if no data or data is not a list
        if not objects_data or not isinstance(objects_data, list):
            return

        m2m_manager = getattr(characteristic, name)
        instances_to_set = []

        if model_class == Competence:
            # --- Special handling for Competence ---
            for competence_dict in objects_data:
                # Ensure it's a dictionary and has a 'name' key
                if isinstance(competence_dict, dict):
                    competence_name = competence_dict.get("name")
                    if competence_name:
                        # Find existing or create new, using the dict as defaults
                        competence_instance, created = Competence.objects.get_or_create(
                            name=competence_name,
                            defaults=competence_dict,  # Pass the whole dict as defaults
                        )
                        instances_to_set.append(competence_instance)
        else:
            # --- Original handling for other models ---
            new_objects = []
            for obj_data in objects_data:
                # Ensure it's a dictionary before attempting ** unpacking
                if isinstance(obj_data, dict):
                    # Ensure data is suitable for model creation
                    # You might need filtering/validation here depending on input
                    try:
                        new_objects.append(model_class(**obj_data))
                    except TypeError as e:
                        # Handle cases where obj_data keys don't match model fields
                        print(
                            f"Warning: Skipping object creation for {model_class.__name__} due to TypeError: {e}. Data: {obj_data}"
                        )
                        continue  # Skip this item

            if new_objects:
                try:
                    created_objects = model_class.objects.bulk_create(new_objects)
                    instances_to_set.extend(created_objects)
                except Exception as e:
                    # Handle potential bulk_create errors
                    print(f"Error during bulk_create for {model_class.__name__}: {e}")

        # Use set() to assign the final list of instances to the M2M field
        if instances_to_set:
            m2m_manager.set(instances_to_set)
        else:
            # If input data was provided but resulted in no valid instances,
            # ensure the relation is cleared.
            m2m_manager.clear()

    @transaction.atomic
    def update(self, instance, validated_data):
        characteristic_update_original = validated_data.pop("characteristic", None)

        super().update(instance, validated_data)

        if characteristic_update_original:
            characteristic_update_copy = characteristic_update_original.copy()

            characteristic, created = Characteristic.objects.get_or_create(
                employee=instance
            )

            # Get the names of fields managed by ATTRIBUTE_MODEL
            m2m_field_names = {attr for attr, model in ATTRIBUTE_MODEL}

            # --- Clear existing M2M relations before adding new ones ---
            for attribute_name in m2m_field_names:
                # Only clear if new data for this M2M field was provided in the request
                if attribute_name in characteristic_update_copy:
                    if hasattr(characteristic, attribute_name):
                        m2m_manager = getattr(characteristic, attribute_name)
                        if hasattr(m2m_manager, "clear"):
                            m2m_manager.clear()

            for attribute_name, model in ATTRIBUTE_MODEL:
                if attribute_name in characteristic_update_copy:
                    self.add_related_fields(
                        characteristic_update_copy,
                        characteristic,
                        attribute_name,
                        model,
                    )

            # --- Update direct fields on Characteristic model ---
            # Iterate through the *remaining* keys in the copy.
            # These should only be the direct fields of Characteristic,
            # as M2M keys were popped by add_related_fields.
            for key, value in characteristic_update_copy.items():
                # Double-check it's not an M2M field (belt-and-suspenders)
                # and that the attribute exists on the model
                if key not in m2m_field_names and hasattr(characteristic, key):
                    field_object = characteristic.__class__._meta.get_field(key)
                    if (
                        not field_object.is_relation
                        or field_object.one_to_one
                        or field_object.many_to_one
                    ):
                        setattr(characteristic, key, value)

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


class RatingPUTSerializer(RatingPOSTSerializer):
    """Сериализатор для оценивания (PUT)."""

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

        return data

    @transaction.atomic
    def create(self, validated_data):
        user = validated_data.get("user")
        employee = validated_data.get("employee")
        rating = Rating.objects.filter(user=user, employee=employee).first()

        if rating is None:
            rating = Rating.objects.create(**validated_data)
        else:
            rating.rate = validated_data.get("rate")
            rating.save()

        return rating


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


class OrgStructureSerializer(serializers.ModelSerializer):
    """Сериализатор для орг. структуры"""

    supervisor = ProfileInStrucureSerializer(read_only=True)

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
            "supervisor",
            "structural_division",
        )


class ProfileInHierarchySerializer(serializers.ModelSerializer):
    """Сериализатор для профиля в Орг. структуре"""

    class Meta:
        model = Employee
        fields = (
            "id",
            "name",
            "surname",
            "patronym",
            "job_title",
            "structural_division",
            "chief",
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


class StructuralSubdivisionInHierarchySerializer(serializers.ModelSerializer):
    """Сериализатор структурного подразделения"""

    class Meta:
        model = StructuralSubdivision
        fields = (
            "id",
            "name",
            "chief",
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


class HierarchySerializer(serializers.ModelSerializer):
    structural_subdivisions = StructuralSubdivisionInHierarchySerializer(many=True)

    positions = serializers.SerializerMethodField()

    class Meta:
        model = Organization
        fields = (
            "id",
            "name",
            "address",
            "head",
            "structural_subdivisions",
            "positions",
        )

    def get_positions(self, object):
        full_employee_list = []

        for subdiv in object.structural_subdivisions.all():
            full_employee_list.extend(subdiv.positions.all())

        serializer = ProfileInHierarchySerializer(
            full_employee_list,
            many=True,
        )

        return serializer.data
