from django.core.validators import FileExtensionValidator
from django.db import models

from employees.models import Employee, Organization
from .constants import CHARFIELD_LENGTH


class Published(models.Model):
    """Абстрактный класс, показывающий время публикации,
    а также позволяющий снимать с публикации."""

    is_published = models.BooleanField(
        default=True,
        verbose_name="Опубликовано",
        help_text="Снимите галочку, чтобы скрыть публикацию.",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Добавлено",
    )

    class Meta:
        abstract = True


class Attachment(models.Model):
    image = models.ImageField("Attachment", upload_to="news_images/")

    publication = models.ForeignKey(
        "News",
        on_delete=models.CASCADE,
        verbose_name="Вложение",
        related_name="attachments",
    )

    class Meta:
        verbose_name = "объект вложения"
        verbose_name_plural = "объекты вложений"


class PollGroup(models.Model):
    name = models.CharField(
        max_length=CHARFIELD_LENGTH, verbose_name="Наименование группы"
    )
    description = models.TextField(blank=True, verbose_name="Описание группы")

    def __str__(self):
        return self.name if self.name else "Пусто"

    class Meta:
        verbose_name = "Группа опросов"
        verbose_name_plural = "Группы опросов"


class News(Published):
    """Модель для новости."""

    title = models.CharField(max_length=CHARFIELD_LENGTH, verbose_name="Заголовок")

    organization = models.ManyToManyField(
        Organization, verbose_name="Организация", null=True, default=None
    )

    text = models.TextField(verbose_name="Текст", blank=True)

    video = models.FileField(
        verbose_name="Видео",
        upload_to="videos_uploaded",
        blank=True,
        null=True,
        default=None,
        validators=[
            FileExtensionValidator(
                allowed_extensions=["MOV", "avi", "mp4", "webm", "mkv"]
            )
        ],
    )

    pub_date = models.DateTimeField(
        verbose_name="Дата и время публикации",
        help_text=(
            "Если установить дату и время в будущем"
            " — можно делать отложенные публикации."
        ),
    )

    def __str__(self):
        return self.title if self.title else "Пусто"

    class Meta:
        verbose_name = "объект новости"
        verbose_name_plural = 'объекты "Новости"'


class Poll(Published):
    class StatusChoices(models.TextChoices):
        DRAFT = "draft", "Черновик"
        PUBLISHED = "published", "Опубликован"
        COMPLETED = "completed", "Завершен"

    name = models.CharField(
        max_length=CHARFIELD_LENGTH, verbose_name="Наименование опроса", null=True
    )
    description = models.TextField(blank=True, verbose_name="Описание опроса")

    author = models.ForeignKey(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        related_name="authored_polls",
        verbose_name="Автор опроса",
    )
    poll_group = models.ForeignKey(
        PollGroup,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Группа опроса",
        related_name="polls",
    )
    status = models.CharField(
        max_length=10,
        choices=StatusChoices.choices,
        default=StatusChoices.DRAFT,
        verbose_name="Статус опроса",
    )

    organization = models.ManyToManyField(
        Organization,
        verbose_name="Организация (целевая аудитория опроса)",
        blank=True,
        help_text="Если опрос не публичный, он будет доступен сотрудникам указанных организаций.",
    )

    is_public = models.BooleanField(
        default=False,
        verbose_name="Публичный опрос",
        help_text="Если отмечено, опрос доступен всем пользователям портала, независимо от организации.",
    )
    is_anonymous = models.BooleanField(default=False, verbose_name="Анонимный опрос")

    pub_date = models.DateTimeField(
        verbose_name="Дата и время публикации",
        help_text=(
            "Если установить дату и время в будущем"
            " — можно делать отложенные публикации."
        ),
        null=True,
        blank=True,
    )
    completion_date = models.DateTimeField(
        verbose_name="Дата и время завершения опроса",
        null=True,
        blank=True,
        help_text="Дата, после которой опрос автоматически переходит в статус 'Завершен'",
    )

    editors = models.ManyToManyField(
        Employee,
        related_name="editable_polls",
        blank=True,
        verbose_name="Редакторы опроса (доступ на редактирование)",
    )
    stats_viewers = models.ManyToManyField(
        Employee,
        related_name="viewable_stats_polls",
        blank=True,
        verbose_name="Просмотр статистики (доступ на просмотр статистики)",
    )

    def __str__(self):
        return self.name if self.name else "Пусто"

    class Meta:
        verbose_name = 'Объект "Опрос"'
        verbose_name_plural = 'Объекты "Опросы"'
        ordering = ["-created_at"]


class Question(models.Model):
    """Модель для вопроса в рамках одного опроса."""

    class QuestionType(models.TextChoices):
        SINGLE_CHOICE = "single", "Один вариант ответа"
        MULTIPLE_CHOICE = "multiple", "Несколько вариантов ответа"
        FREE_TEXT = "text", "Свободный текстовый ответ"

    poll = models.ForeignKey(
        Poll, on_delete=models.CASCADE, related_name="questions", verbose_name="Опрос"
    )
    text = models.TextField(verbose_name="Текст вопроса")
    question_type = models.CharField(
        max_length=10,
        choices=QuestionType.choices,
        default=QuestionType.SINGLE_CHOICE,
        verbose_name="Тип вопроса",
    )
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок вопроса")
    is_required = models.BooleanField(default=True, verbose_name="Обязательный вопрос")

    min_choices = models.PositiveIntegerField(
        null=True, blank=True, verbose_name="Минимальное количество выбранных вариантов"
    )
    max_choices = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name="Максимальное количество выбранных вариантов",
    )

    def __str__(self):
        return (
            f"{self.text[:50]}... (Опрос: {self.poll.name[:20]})"
            if self.text
            else "Пусто"
        )

    class Meta:
        verbose_name = "Вопрос"
        verbose_name_plural = "Вопросы"
        ordering = ["poll", "order"]


class Choice(models.Model):
    """Модель для варианта ответа на вопрос (если вопрос предполагает выбор)."""

    question = models.ForeignKey(
        Question,
        verbose_name="Вопрос",
        on_delete=models.CASCADE,
        related_name="choices",
        null=True,
    )
    choice_text = models.CharField(
        verbose_name="Текст варианта ответа", max_length=CHARFIELD_LENGTH
    )

    order = models.PositiveIntegerField(default=0, verbose_name="Порядок варианта")

    def __str__(self):
        question_text = "[Вопрос не указан]"
        if self.question and hasattr(self.question, "text"):
            question_text = f"'{self.question.text[:30]}...'"

        return f"Вариант '{self.choice_text}' для вопроса {question_text}"

    class Meta:
        verbose_name = "Вариант ответа"
        verbose_name_plural = "Варианты ответа"
        ordering = ["question", "order"]


class QuestionDependency(models.Model):
    """Определяет условие, при котором `dependent_question` будет показан."""

    dependent_question = models.OneToOneField(
        Question,
        on_delete=models.CASCADE,
        related_name="dependency_rule",
        verbose_name="Зависимый вопрос (который показывается/скрывается)",
    )
    trigger_question = models.ForeignKey(
        Question,
        on_delete=models.CASCADE,
        related_name="trigger_for_dependencies",
        verbose_name="Вопрос-триггер (от ответа на который зависит показ)",
        null=True,
        blank=True,
    )

    trigger_choice = models.ForeignKey(
        Choice,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        verbose_name="Вариант ответа-триггер",
    )

    class Meta:
        verbose_name = "Условие отображения вопроса"
        verbose_name_plural = "Условия отображения вопросов"


class PollSubmission(models.Model):
    poll = models.ForeignKey(Poll, on_delete=models.CASCADE, related_name="submissions")
    user = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="poll_submissions",
        null=True,
        blank=True,
    )
    submitted_at = models.DateTimeField(
        auto_now_add=True, verbose_name="Время отправки"
    )

    def __str__(self):
        user_info = self.user.get_full_name() if self.user else "Аноним"
        return (
            f"Ответы от {user_info} на опрос '{self.poll.name}'"
            if self.poll.name
            else "Заполните имя опроса"
        )

    class Meta:
        verbose_name = "Прохождение опроса"
        verbose_name_plural = "Прохождения опросов"
        unique_together = [["poll", "user"]]


class Answer(models.Model):
    submission = models.ForeignKey(
        PollSubmission, on_delete=models.CASCADE, related_name="answers"
    )
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name="answers"
    )

    selected_choices = models.ManyToManyField(
        Choice, blank=True, related_name="chosen_in_answers"
    )

    free_text_answer = models.TextField(blank=True, null=True)

    def __str__(self):
        if self.question.question_type in [
            Question.QuestionType.SINGLE_CHOICE,
            Question.QuestionType.MULTIPLE_CHOICE,
        ]:
            return (
                f"Ответ на '{self.question.text[:30]}...' (выбор)"
                if self.question.text
                else "Пусто"
            )
        elif self.question.question_type == Question.QuestionType.FREE_TEXT:
            return (
                f"Ответ на '{self.question.text[:30]}...': {self.free_text_answer[:30] if self.free_text_answer else '[пусто]'}"
                if self.question.text
                else "Пусто"
            )
        return f"Ответ на вопрос ID {self.question.id}"

    class Meta:
        verbose_name = "Ответ на вопрос"
        verbose_name_plural = "Ответы на вопросы"
