import os.path

from django.core.validators import (
    EmailValidator,
    RegexValidator,
    MinValueValidator,
    MaxValueValidator,
)
from django.core.exceptions import ValidationError
from django.db import transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from djoser.serializers import UserCreateSerializer, UserSerializer
from drf_extra_fields.fields import Base64ImageField
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from employees.models import (
    Career,
    Characteristic,
    Competence,
    Conference,
    Course,
    Diploma,
    Employee,
    Hobby,
    Idea,
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
from homepage.models import (
    Answer,
    Attachment,
    Choice,
    News,
    Poll,
    PollGroup,
    PollSubmission,
    Question,
    QuestionDependency,
)


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
    id = serializers.IntegerField(required=False)

    class Meta:
        model = Choice
        fields = (
            "id",
            "choice_text",
            "order",
        )


class QuestionDependencySerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = QuestionDependency
        fields = (
            "id",
            "trigger_question",
            "trigger_choice",
        )


class QuestionSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)
    choices = ChoiceSerializer(many=True, required=False, allow_null=True, default=[])
    dependency_rule = QuestionDependencySerializer(
        required=False, allow_null=True, default=None
    )

    class Meta:
        model = Question
        fields = (
            "id",
            "text",
            "question_type",
            "order",
            "initial_value",
            "is_required",
            "min_choices",
            "max_choices",
            "choices",
            "dependency_rule",
            "allow_custom_answer",
        )

    def validate_choices(self, choices_data):
        if choices_data:
            orders = [
                choice.get("order")
                for choice in choices_data
                if choice.get("order") is not None
            ]
            if len(orders) != len(set(orders)):
                raise serializers.ValidationError(
                    "Порядок вариантов ответов в рамках одного вопроса должен быть уникальным."
                )
        return choices_data

    def validate(self, data):
        question_type = data.get(
            "question_type", getattr(self.instance, "question_type", None)
        )
        choices = data.get("choices")
        min_choices = data.get("min_choices")
        max_choices = data.get("max_choices")
        dependency_rule = data.get("dependency_rule")
        allow_custom_answer = data.get(
            "allow_custom_answer",
            getattr(self.instance, "allow_custom_answer", False)
            if self.instance
            else False,
        )

        if question_type in [
            Question.QuestionType.SINGLE_CHOICE,
            Question.QuestionType.MULTIPLE_CHOICE,
        ]:
            has_choices = choices is not None and len(choices) > 0

            if self.instance and choices is None:
                has_choices = self.instance.choices.exists()

            if not has_choices and not allow_custom_answer:
                raise serializers.ValidationError(
                    {
                        "choices": "Для вопроса с выбором необходимо предоставить либо варианты ответа, либо разрешить опцию 'Другое' (свой вариант)."
                    }
                )

            if question_type == Question.QuestionType.MULTIPLE_CHOICE:
                if (
                    min_choices is not None
                    and max_choices is not None
                    and min_choices > max_choices
                ):
                    raise serializers.ValidationError(
                        {
                            "min_choices": "Минимальное количество не может быть больше максимального."
                        }
                    )
                if choices and max_choices is not None and len(choices) < max_choices:
                    pass
                if choices and min_choices is not None and len(choices) < min_choices:
                    raise serializers.ValidationError(
                        {
                            "min_choices": f"Количество предоставленных вариантов ({len(choices)}) меньше минимально необходимого ({min_choices})."
                        }
                    )

        elif question_type == Question.QuestionType.FREE_TEXT:
            if choices and len(choices) > 0:
                raise serializers.ValidationError(
                    {
                        "choices": "Для вопросов со свободным текстовым ответом варианты ответов не указываются."
                    }
                )
            if min_choices is not None or max_choices is not None:
                raise serializers.ValidationError(
                    {
                        "min_choices_max_choices": "Для вопросов со свободным текстовым ответом min/max вариантов не указываются."
                    }
                )

        if dependency_rule:
            trigger_question_id = dependency_rule.get("trigger_question")

            current_question_id = data.get("id") or (
                self.instance.id if self.instance else None
            )
            if (
                current_question_id
                and trigger_question_id
                and int(trigger_question_id) == int(current_question_id)
            ):
                raise serializers.ValidationError(
                    {"dependency_rule": "Вопрос не может зависеть сам от себя."}
                )

        question_type = data.get(
            "question_type", getattr(self.instance, "question_type", None)
        )
        allow_custom_answer = data.get(
            "allow_custom_answer",
            getattr(self.instance, "allow_custom_answer", False)
            if self.instance
            else False,
        )

        if allow_custom_answer and question_type not in [
            Question.QuestionType.SINGLE_CHOICE,
            Question.QuestionType.MULTIPLE_CHOICE,
        ]:
            raise serializers.ValidationError(
                {
                    "allow_custom_answer": f"Опция 'Разрешить свой вариант ответа' не применима к вопросам типа '{question_type}'."
                }
            )
        return data


class PollSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, required=False, default=[])
    author = serializers.PrimaryKeyRelatedField(read_only=True)
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.all(), many=True, required=False
    )
    editors = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(), many=True, required=False
    )
    stats_viewers = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(), many=True, required=False
    )
    poll_group = serializers.PrimaryKeyRelatedField(
        queryset=PollGroup.objects.all(), required=False, allow_null=True
    )
    submission_count = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Poll
        fields = (
            "id",
            "kind",
            "name",
            "description",
            "author",
            "poll_group",
            "status",
            "organization",
            "is_public",
            "is_anonymous",
            "pub_date",
            "completion_date",
            "editors",
            "stats_viewers",
            "questions",
            "submission_count",
        )
        read_only_fields = ("id", "author", "submission_count")

    def get_submission_count(self, obj):
        return obj.submissions.count()

    def _handle_questions(self, poll_instance, questions_data_list_original):
        question_orders_in_payload = [
            q_data.get("order")
            for q_data in questions_data_list_original
            if q_data.get("order") is not None
        ]
        if len(question_orders_in_payload) != len(set(question_orders_in_payload)):
            raise serializers.ValidationError(
                {
                    "questions": "Порядок (order) вопросов в рамках одного запроса должен быть уникальным."
                }
            )

        questions_data_list_for_first_pass = [
            q_data.copy() for q_data in questions_data_list_original
        ]

        created_questions_map = {}
        created_choices_map = {}
        processed_question_ids_for_poll = []

        for q_data in questions_data_list_for_first_pass:
            question_id_from_payload = q_data.pop("id", None)
            choices_data_list = q_data.pop("choices", [])
            q_data.pop("dependency_rule", None)

            question_order = q_data.get("order")
            if question_order is None:
                raise serializers.ValidationError(
                    {"questions": "Каждый вопрос должен иметь поле 'order'."}
                )

            choice_orders_in_question = [
                c_data.get("order")
                for c_data in choices_data_list
                if c_data.get("order") is not None
            ]
            if len(choice_orders_in_question) != len(set(choice_orders_in_question)):
                raise serializers.ValidationError(
                    {
                        "questions": f"Порядок (order) вариантов ответов для вопроса с order={question_order} должен быть уникальным."
                    }
                )

            if question_id_from_payload:
                question_instance = get_object_or_404(
                    Question, id=question_id_from_payload, poll=poll_instance
                )
                for attr, value in q_data.items():
                    if hasattr(question_instance, attr):
                        setattr(question_instance, attr, value)
                question_instance.save()
            else:
                question_instance = Question.objects.create(
                    poll=poll_instance, **q_data
                )

            processed_question_ids_for_poll.append(question_instance.id)
            created_questions_map[question_order] = question_instance

            # Обработка вариантов (Choice)
            processed_choice_ids_for_question = []
            if question_instance.question_type in [
                Question.QuestionType.SINGLE_CHOICE,
                Question.QuestionType.MULTIPLE_CHOICE,
            ]:
                for choice_item_data_original in choices_data_list:
                    choice_item_data = choice_item_data_original.copy()
                    choice_id_from_payload = choice_item_data.pop("id", None)
                    choice_order = choice_item_data.get("order")
                    if choice_order is None:
                        raise serializers.ValidationError(
                            {
                                "questions": f"Каждый вариант ответа для вопроса с order={question_order} должен иметь поле 'order'."
                            }
                        )

                    if choice_id_from_payload:
                        choice_instance = get_object_or_404(
                            Choice,
                            id=choice_id_from_payload,
                            question=question_instance,
                        )
                        for attr, value in choice_item_data.items():
                            if hasattr(choice_instance, attr):
                                setattr(choice_instance, attr, value)
                        choice_instance.save()
                    else:
                        choice_instance = Choice.objects.create(
                            question=question_instance, **choice_item_data
                        )
                    processed_choice_ids_for_question.append(choice_instance.id)
                    created_choices_map[(question_order, choice_order)] = (
                        choice_instance
                    )

                if question_id_from_payload:
                    question_instance.choices.exclude(
                        id__in=processed_choice_ids_for_question
                    ).delete()
            else:
                question_instance.choices.all().delete()

        for q_data_original_for_deps in questions_data_list_original:
            question_order_for_deps = q_data_original_for_deps.get("order")
            dependent_question_instance = created_questions_map.get(
                question_order_for_deps
            )

            if not dependent_question_instance:
                continue

            if (
                hasattr(dependent_question_instance, "dependency_rule")
                and dependent_question_instance.dependency_rule
            ):
                dependent_question_instance.dependency_rule.delete()

            dependency_rule_payload = q_data_original_for_deps.get("dependency_rule")

            if (
                isinstance(dependency_rule_payload, dict)
                and not dependency_rule_payload
            ):
                dependency_rule_payload = None

            if dependency_rule_payload:
                trigger_question_order = dependency_rule_payload.get(
                    "trigger_question_order"
                )
                trigger_choice_order = dependency_rule_payload.get(
                    "trigger_choice_order"
                )

                if trigger_question_order is not None:
                    trigger_question_instance = created_questions_map.get(
                        trigger_question_order
                    )
                    if not trigger_question_instance:
                        raise serializers.ValidationError(
                            {
                                "questions": f"[Order: {question_order_for_deps}] Вопрос-триггер с order={trigger_question_order} не найден среди созданных/обновленных вопросов."
                            }
                        )

                    if (
                        dependent_question_instance.order
                        <= trigger_question_instance.order
                    ):
                        raise serializers.ValidationError(
                            {
                                "questions": f"[Order: {question_order_for_deps}] Зависимый вопрос (order: {dependent_question_instance.order}) должен идти после вопроса-триггера (order: {trigger_question_instance.order}) по порядку."
                            }
                        )

                    trigger_choice_instance = None
                    if trigger_question_instance.question_type in [
                        Question.QuestionType.SINGLE_CHOICE,
                        Question.QuestionType.MULTIPLE_CHOICE,
                    ]:
                        if trigger_choice_order is None:
                            raise serializers.ValidationError(
                                {
                                    "questions": f"[Order: {question_order_for_deps}] Для вопроса-триггера (order={trigger_question_order}) типа 'выбор' необходимо указать 'trigger_choice_order'."
                                }
                            )
                        trigger_choice_instance = created_choices_map.get(
                            (trigger_question_order, trigger_choice_order)
                        )
                        if not trigger_choice_instance:
                            raise serializers.ValidationError(
                                {
                                    "questions": f"[Order: {question_order_for_deps}] Вариант-триггер (order={trigger_choice_order}) для вопроса-триггера (order={trigger_question_order}) не найден."
                                }
                            )
                    elif trigger_choice_order is not None:
                        raise serializers.ValidationError(
                            {
                                "questions": f"[Order: {question_order_for_deps}] Вопрос-триггер (order={trigger_question_order}) не является вопросом с выбором вариантов, 'trigger_choice_order' не должен быть указан."
                            }
                        )

                    QuestionDependency.objects.create(
                        dependent_question=dependent_question_instance,
                        trigger_question=trigger_question_instance,
                        trigger_choice=trigger_choice_instance,
                    )

        if poll_instance.pk:
            poll_instance.questions.exclude(
                id__in=processed_question_ids_for_poll
            ).delete()

    @transaction.atomic
    def create(self, validated_data):
        questions_data = validated_data.pop("questions", [])
        organizations_data = validated_data.pop("organization", [])
        editors_data = validated_data.pop("editors", [])
        stats_viewers_data = validated_data.pop("stats_viewers", [])

        validated_data["author"] = self.context["request"].user

        poll_instance = Poll.objects.create(**validated_data)

        poll_instance.organization.set(organizations_data)
        poll_instance.editors.set(editors_data)
        poll_instance.stats_viewers.set(stats_viewers_data)

        self._handle_questions(poll_instance, questions_data)
        return poll_instance

    @transaction.atomic
    def update(self, instance, validated_data):
        questions_data = validated_data.pop("questions", None)

        if "organization" in validated_data:
            instance.organization.set(validated_data.pop("organization"))
        if "editors" in validated_data:
            instance.editors.set(validated_data.pop("editors"))
        if "stats_viewers" in validated_data:
            instance.stats_viewers.set(validated_data.pop("stats_viewers"))

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if questions_data is not None:
            self._handle_questions(instance, questions_data)

        return instance


class AnswerCreateSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    selected_choice_ids = serializers.ListField(
        child=serializers.IntegerField(), required=False, allow_empty=True, default=[]
    )
    free_text_answer = serializers.CharField(
        required=False, allow_blank=True, allow_null=True, default=None
    )
    custom_choice_text = serializers.CharField(
        required=False, allow_blank=True, allow_null=True, default=None
    )

    phone_validator = RegexValidator(
        regex=r"^\+?1?\d{9,15}$",
        message="Введите корректный номер телефона (например, +79123456789).",
    )
    email_validator = EmailValidator()

    def validate(self, data):
        question_id = data.get("question_id")
        selected_choice_ids = data.get("selected_choice_ids", [])
        free_text_answer = data.get("free_text_answer")
        custom_choice_text = data.get("custom_choice_text")

        try:
            question = Question.objects.get(id=question_id)
        except Question.DoesNotExist:
            raise serializers.ValidationError({"question_id": "Вопрос не найден."})

        if custom_choice_text:
            if not question.allow_custom_answer:
                raise serializers.ValidationError(
                    {
                        "custom_choice_text": f"Для вопроса '{question.text}' не разрешен свой вариант ответа ('Другое')."
                    }
                )
            if question.question_type not in [
                Question.QuestionType.SINGLE_CHOICE,
                Question.QuestionType.MULTIPLE_CHOICE,
            ]:
                raise serializers.ValidationError(
                    {
                        "custom_choice_text": "Опция 'Другое' применима только к вопросам с выбором вариантов."
                    }
                )
            if (
                question.question_type == Question.QuestionType.SINGLE_CHOICE
                and selected_choice_ids
            ):
                raise serializers.ValidationError(
                    {
                        "selected_choice_ids": "Если указан свой вариант ответа ('Другое') для вопроса с одним выбором, другие стандартные варианты не должны быть выбраны.",
                        "custom_choice_text": "Если указан свой вариант ответа ('Другое') для вопроса с одним выбором, другие стандартные варианты не должны быть выбраны.",
                    }
                )

        total_options_selected = 0
        if question.question_type in [
            Question.QuestionType.SINGLE_CHOICE,
            Question.QuestionType.MULTIPLE_CHOICE,
        ]:
            total_options_selected = len(selected_choice_ids)
            if custom_choice_text and question.allow_custom_answer:
                total_options_selected += 1

        if question.question_type in [
            Question.QuestionType.SINGLE_CHOICE,
            Question.QuestionType.MULTIPLE_CHOICE,
        ]:
            if (
                total_options_selected > 1
                and question.question_type == Question.QuestionType.SINGLE_CHOICE
            ):
                raise serializers.ValidationError(
                    {
                        "selected_choice_ids": "Для вопроса с одним вариантом ответа можно выбрать только одну опцию.",
                        "custom_choice_text": "Для вопроса с одним вариантом ответа можно выбрать только одну опцию.",
                    }
                )
            if question.question_type == Question.QuestionType.MULTIPLE_CHOICE:
                if (
                    question.min_choices
                    and total_options_selected < question.min_choices
                ):
                    raise serializers.ValidationError(
                        {
                            "selected_choice_ids": f"Необходимо выбрать минимум {question.min_choices} опций (включая свой вариант, если указан). Выбрано: {total_options_selected}.",
                            "custom_choice_text": f"Необходимо выбрать минимум {question.min_choices} опций (включая свой вариант, если указан). Выбрано: {total_options_selected}.",
                        }
                    )
                if (
                    question.max_choices
                    and total_options_selected > question.max_choices
                ):
                    raise serializers.ValidationError(
                        {
                            "selected_choice_ids": f"Можно выбрать максимум {question.max_choices} опций (включая свой вариант, если указан). Выбрано: {total_options_selected}.",
                            "custom_choice_text": f"Можно выбрать максимум {question.max_choices} опций (включая свой вариант, если указан). Выбрано: {total_options_selected}.",
                        }
                    )

        elif question.question_type == Question.QuestionType.DATE:
            if selected_choice_ids or custom_choice_text:
                raise serializers.ValidationError(
                    {
                        "selected_choice_ids": "Для вопросов типа 'Дата' варианты выбора не ожидаются."
                    }
                )
            if free_text_answer:
                try:
                    serializers.DateField().to_internal_value(free_text_answer)
                except ValidationError:
                    raise serializers.ValidationError(
                        {
                            "free_text_answer": "Введите корректную дату в формате ГГГГ-ММ-ДД."
                        }
                    )

        elif question.question_type == Question.QuestionType.TELEPHONE:
            if selected_choice_ids or custom_choice_text:
                raise serializers.ValidationError(
                    {
                        "selected_choice_ids": "Для вопросов типа 'Телефон' варианты выбора не ожидаются."
                    }
                )
            if free_text_answer:
                try:
                    self.phone_validator(free_text_answer)
                except ValidationError as e:
                    raise serializers.ValidationError({"free_text_answer": e.messages})

        elif question.question_type == Question.QuestionType.MAIL:
            if selected_choice_ids or custom_choice_text:
                raise serializers.ValidationError(
                    {
                        "selected_choice_ids": "Для вопросов типа 'Почта' варианты выбора не ожидаются."
                    }
                )
            if free_text_answer:
                try:
                    self.email_validator(free_text_answer)
                except ValidationError:
                    raise serializers.ValidationError(
                        {
                            "free_text_answer": "Введите корректный адрес электронной почты."
                        }
                    )

        elif question.question_type == Question.QuestionType.FREE_TEXT:
            if selected_choice_ids or custom_choice_text:
                raise serializers.ValidationError(
                    {
                        "selected_choice_ids": "Для вопросов со свободным текстом варианты выбора не ожидаются."
                    }
                )

        if question.is_required:
            answered = False
            if question.question_type in [
                Question.QuestionType.SINGLE_CHOICE,
                Question.QuestionType.MULTIPLE_CHOICE,
            ]:
                if total_options_selected > 0:
                    answered = True
            else:
                if free_text_answer:
                    answered = True

            if not answered:
                error_message = (
                    f"Ответ на обязательный вопрос '{question.text}' не предоставлен."
                )
                if question.question_type in [
                    Question.QuestionType.SINGLE_CHOICE,
                    Question.QuestionType.MULTIPLE_CHOICE,
                ]:
                    error_fields = {"selected_choice_ids": error_message}
                    if question.allow_custom_answer:
                        error_fields["custom_choice_text"] = error_message
                    raise serializers.ValidationError(error_fields)
                else:
                    raise serializers.ValidationError(
                        {"free_text_answer": error_message}
                    )
        return data


class PollSubmissionCreateSerializer(serializers.ModelSerializer):
    answers = AnswerCreateSerializer(many=True, default=[])

    class Meta:
        model = PollSubmission
        fields = (
            "poll",
            "answers",
        )

    def validate_poll(self, poll_instance):
        if poll_instance.status != Poll.StatusChoices.PUBLISHED:
            raise serializers.ValidationError(
                "Данный опрос не опубликован и не может быть пройден."
            )
        if poll_instance.pub_date and poll_instance.pub_date > timezone.now():
            raise serializers.ValidationError(
                "Данный опрос еще не доступен для прохождения."
            )
        if (
            poll_instance.completion_date
            and poll_instance.completion_date < timezone.now()
        ):
            raise serializers.ValidationError("Срок прохождения данного опроса истек.")

        request = self.context.get("request")
        if request and hasattr(request, "user") and request.user.is_authenticated:
            user = request.user
            if not poll_instance.is_public:
                if not hasattr(user, "organization") or not user.organization:
                    raise serializers.ValidationError(
                        "У вас нет организации для доступа к этому опросу."
                    )
                if not poll_instance.organization.filter(
                    id=user.organization.id
                ).exists():
                    raise serializers.ValidationError(
                        "Данный опрос недоступен для вашей организации."
                    )
        elif not poll_instance.is_public:
            raise serializers.ValidationError(
                "Невозможно определить доступность непубличного опроса."
            )

        return poll_instance

    def validate_answers(self, answers_data):
        poll_pk = self.initial_data.get("poll")
        if not poll_pk:
            raise serializers.ValidationError({"poll": "Необходимо указать опрос."})
        try:
            poll_obj = Poll.objects.prefetch_related("questions__choices").get(
                pk=poll_pk
            )
        except Poll.DoesNotExist:
            raise serializers.ValidationError({"poll": "Указанный опрос не найден."})

        if not answers_data and poll_obj.questions.filter(is_required=True).exists():
            raise serializers.ValidationError(
                "Необходимо предоставить ответы на обязательные вопросы."
            )

        poll_questions_map = {q.id: q for q in poll_obj.questions.all()}
        answered_question_ids = set()

        for answer_data in answers_data:
            q_id = answer_data.get("question_id")
            if not q_id or q_id not in poll_questions_map:
                raise serializers.ValidationError(
                    f"Ответ содержит вопрос с ID {q_id}, не принадлежащий данному опросу."
                )
            answered_question_ids.add(q_id)

        for q_id, question_instance in poll_questions_map.items():
            if question_instance.is_required and q_id not in answered_question_ids:
                raise serializers.ValidationError(
                    {
                        f"question_{q_id}": f"Ответ на обязательный вопрос '{question_instance.text}' не предоставлен."
                    }
                )
        return answers_data

    @transaction.atomic
    def create(self, validated_data):
        poll = validated_data["poll"]
        answers_data = validated_data.pop("answers")
        request_user = self.context["request"].user

        user_to_assign = (
            request_user
            if not poll.is_anonymous and request_user.is_authenticated
            else None
        )

        if (
            user_to_assign
            and PollSubmission.objects.filter(poll=poll, user=user_to_assign).exists()
        ):
            raise serializers.ValidationError(
                {"detail": "Вы уже проходили этот опрос."}
            )

        submission = PollSubmission.objects.create(poll=poll, user=user_to_assign)

        for answer_data in answers_data:
            question_instance = Question.objects.get(id=answer_data["question_id"])

            created_answer = Answer.objects.create(
                submission=submission,
                question=question_instance,
                free_text_answer=answer_data.get("free_text_answer"),
                custom_choice_text=answer_data.get("custom_choice_text"),
            )

            selected_ids = answer_data.get("selected_choice_ids", [])
            if selected_ids:
                valid_choices = Choice.objects.filter(
                    id__in=selected_ids, question=question_instance
                )
                if len(valid_choices) != len(selected_ids):
                    raise serializers.ValidationError(
                        {
                            f"question_{question_instance.id}": "Один или несколько выбранных вариантов не принадлежат данному вопросу."
                        }
                    )
                created_answer.selected_choices.set(valid_choices)
        return submission


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
    organization = serializers.PrimaryKeyRelatedField(
        queryset=Organization.objects.all(), many=True, required=False, allow_null=True
    )

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
        organization_data = validated_data.pop("organization", None)

        news_defaults = validated_data

        news_item, created = News.objects.get_or_create(
            title=validated_data["title"], defaults=news_defaults
        )

        if created:
            if organization_data is not None:
                news_item.organization.set(organization_data)

            for attachment_data in attachments_data:
                Attachment.objects.create(publication=news_item, **attachment_data)
        else:
            pass

        return news_item


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
        if obj.chief is not None:
            return obj.chief.id

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

    class Meta:
        model = Rating
        fields = ("rate", "text")
        extra_kwargs = {
            "rate": {
                "required": True,
                "validators": [
                    MinValueValidator(1, message="Оценка не может быть меньше 1."),
                    MaxValueValidator(5, message="Оценка не может быть больше 5."),
                ],
            }
        }


class RatingPUTSerializer(RatingPOSTSerializer):
    """
    Сериализатор для создания/обновления оценки.
    Валидирует только поля 'rate' и 'text', которые присылает клиент.
    """

    pass


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


class RatingListSerializer(serializers.ModelSerializer):
    """
    Сериализатор для листинга рейтинга.
    """

    class Meta:
        model = Rating
        fields = ("id", "user", "rate", "text", "date")


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


class StructuralSubdivisionInOrgSerializer(serializers.ModelSerializer):
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
            "supervisor",
        )


class OrganizationSerializer(serializers.ModelSerializer):
    """Сериализатор организаций для страницы Орг. структуры"""

    structural_subdivisions = StructuralSubdivisionInOrgSerializer(many=True)

    class Meta:
        model = Organization
        fields = ("id", "name", "head", "address", "structural_subdivisions")


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


class MyProfileSerializer(ProfileSerializer):
    """
    Сериализатор для эндпоинта /me/, включающий группы пользователя.
    Наследует все поля от ProfileSerializer.
    """

    user_groups_display = serializers.SerializerMethodField()

    class Meta(ProfileSerializer.Meta):
        fields = ProfileSerializer.Meta.fields + ("user_groups_display",)

    def get_user_groups_display(self, obj):
        """
        Возвращает список имен групп пользователя.
        obj - это экземпляр Employee (request.user).
        """
        if not hasattr(obj, "groups"):
            return []

        return [group.name for group in obj.groups.all().order_by("name")]


class PollGroupSerializer(serializers.ModelSerializer):
    """Сериализатор для типов опросов"""

    class Meta:
        model = PollGroup
        fields = "__all__"


class UserInPollAnswersSerializer(serializers.ModelSerializer):
    """Сериализатор для краткой информации о пользователе."""

    class Meta:
        model = Employee
        fields = ("id", "username")


class AnswerDetailForUserSerializer(serializers.ModelSerializer):
    """Сериализатор для детального ответа пользователя на один вопрос."""

    question_id = serializers.ReadOnlyField(source="question.id")
    question_text = serializers.ReadOnlyField(source="question.text")
    question_type = serializers.ReadOnlyField(source="question.question_type")
    selected_choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Answer
        fields = (
            "question_id",
            "question_text",
            "question_type",
            "selected_choices",
            "free_text_answer",
            "custom_choice_text",
        )


class PollSubmissionWithAnswersSerializer(serializers.ModelSerializer):
    """Сериализатор для одного прохождения опроса с ответами пользователя."""

    user = UserInPollAnswersSerializer(read_only=True)  # Может быть null для анонимных
    answers = AnswerDetailForUserSerializer(many=True, read_only=True)
    submitted_at = serializers.DateTimeField(
        format="%Y-%m-%dT%H:%M:%SZ", read_only=True
    )

    class Meta:
        model = PollSubmission
        fields = ("user", "submitted_at", "answers")


class PollUserAnswersListSerializer(serializers.Serializer):
    poll_id = serializers.IntegerField()
    poll_name = serializers.CharField()
    results = PollSubmissionWithAnswersSerializer(many=True)
    count = serializers.IntegerField()
    next = serializers.URLField(allow_null=True)
    previous = serializers.URLField(allow_null=True)


class IdeaSerializer(serializers.ModelSerializer):
    """
    Сериализатор для модели Idea.
    """

    author_name = serializers.StringRelatedField(source="author", read_only=True)

    class Meta:
        model = Idea
        fields = [
            "id",
            "text",
            "status",
            "resolution",
            "created_at",
            "author",
            "author_name",
        ]

        read_only_fields = ["author", "created_at", "author_name"]

    def create(self, validated_data):
        """
        Создание идеи. Обычные пользователи не могут устанавливать статус и резолюцию.
        """
        user = self.context["request"].user

        # Обычные пользователи не могут устанавливать статус и резолюцию при создании
        if not user.is_staff:
            validated_data.pop("status", None)
            validated_data.pop("resolution", None)

        return super().create(validated_data)

    def update(self, instance, validated_data):
        """
        Обновление идеи. Обычные пользователи могут изменять только свои идеи и только текст.
        Администраторы могут изменять статус и резолюцию любых идей.
        """
        user = self.context["request"].user

        # Если пользователь не является автором идеи и не администратор
        if instance.author != user and not user.is_staff:
            raise serializers.ValidationError(
                "Вы можете редактировать только свои идеи."
            )

        # Обычные пользователи могут изменять только текст своих идей
        if instance.author == user and not user.is_staff:
            if "status" in validated_data or "resolution" in validated_data:
                raise serializers.ValidationError(
                    "Вы можете изменять только текст своей идеи."
                )
            instance.text = validated_data.get("text", instance.text)
        else:
            # Администраторы могут изменять все поля
            for attr, value in validated_data.items():
                setattr(instance, attr, value)

        instance.save()
        return instance


class StructuralSubdivisionWriteSerializer(serializers.ModelSerializer):
    """
    Универсальный сериализатор для создания (POST) и обновления (PUT/PATCH)
    структурных подразделений. Управляет всеми изменяемыми полями,
    включая вложенный список сотрудников (positions).
    """

    positions = serializers.PrimaryKeyRelatedField(
        queryset=Employee.objects.all(), many=True, required=False, write_only=True
    )

    class Meta:
        model = StructuralSubdivision

        fields = (
            "id",
            "name",
            "organization",
            "chief",
            "supervisor",
            "parent_structural_subdivision",
            "positions",
        )
        read_only_fields = ("id",)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

        if self.instance:
            self.fields["organization"].read_only = True

    @transaction.atomic
    def create(self, validated_data):
        """
        Переопределяем метод создания.
        """

        positions_data = validated_data.pop("positions", [])

        subdivision = StructuralSubdivision.objects.create(**validated_data)

        if positions_data:
            subdivision.positions.set(positions_data)

        return subdivision

    @transaction.atomic
    def update(self, instance, validated_data):
        positions_data = validated_data.pop("positions", None)

        updated_instance = super().update(instance, validated_data)

        if positions_data is not None:
            updated_instance.positions.set(positions_data)

        return updated_instance

    def to_representation(self, instance):
        read_serializer = StructuralSubdivisionReadSerializer(
            instance, context=self.context
        )
        return read_serializer.data


class StructuralSubdivisionReadSerializer(serializers.ModelSerializer):
    """
    Serializer for READ operations (GET list/detail).
    Provides nested, readable data for related objects.
    """

    class Meta:
        model = StructuralSubdivision
        fields = (
            "id",
            "name",
            "organization",
            "chief",
            "supervisor",
            "parent_structural_subdivision",
            "positions",
        )
