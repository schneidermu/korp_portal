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

    def __str__(self):
        return super().__str__()


class PollGroup(models.Model):
    name = models.CharField(
        max_length=CHARFIELD_LENGTH, verbose_name="Наименование группы",
    )
    description = models.TextField(blank=True, verbose_name="Описание группы")

    class Meta:
        verbose_name = "Группа опросов"
        verbose_name_plural = "Группы опросов"

    def __str__(self):
        return self.name if self.name else "Пусто"


class News(Published):
    """Модель для новости."""

    title = models.CharField(max_length=CHARFIELD_LENGTH, verbose_name="Заголовок")

    author = models.ForeignKey(
        Employee,
        verbose_name="Автор",
        on_delete=models.SET_NULL,
        null=True,
        related_name="authored_news",
    )

    organization = models.ManyToManyField(
        Organization, verbose_name="Организация", null=True, default=None,
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
                allowed_extensions=["MOV", "avi", "mp4", "webm", "mkv"],
            ),
        ],
    )

    pub_date = models.DateTimeField(
        verbose_name="Дата и время публикации",
        help_text=(
            "Если установить дату и время в будущем"
            " — можно делать отложенные публикации."
        ),
    )

    class Meta:
        verbose_name = "объект новости"
        verbose_name_plural = 'объекты "Новости"'

    def __str__(self):
        return self.title if self.title else "Пусто"


class Poll(Published):
    class StatusChoices(models.TextChoices):
        DRAFT = "draft", "Черновик"
        PUBLISHED = "published", "Опубликован"
        COMPLETED = "completed", "Завершен"

    class KindChoices(models.TextChoices):
        PLAIN = "plain", "Опрос"
        FORM = "form", "Форма"

    name = models.CharField(
        max_length=CHARFIELD_LENGTH, verbose_name="Наименование опроса", null=True,
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
    kind = models.CharField(
        max_length=10,
        choices=KindChoices.choices,
        default=KindChoices.PLAIN,
        verbose_name="Тип опроса",
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

    class Meta:
        verbose_name = 'Объект "Опрос"'
        verbose_name_plural = 'Объекты "Опросы"'
        ordering = ["-created_at"]

    def __str__(self):
        return self.name if self.name else "Пусто"


class Question(models.Model):
    """Модель для вопроса в рамках одного опроса."""

    class QuestionType(models.TextChoices):
        SINGLE_CHOICE = "single", "Один вариант ответа"
        MULTIPLE_CHOICE = "multiple", "Несколько вариантов ответа"
        FREE_TEXT = "text", "Свободный текстовый ответ"
        DATE = "date", "Дата"
        TELEPHONE = "telephone", "Номер телефона"
        MAIL = "mail", "Почта"

    class InitialValueType(models.TextChoices):
        FULLNAME = "fullname", "ФИО"
        POSITION = "position", "Должность"
        ORGANIZATION = "organization", "Организация"
        PHONE = "phone", "Номер телефона"
        EMAIL = "email", "Почта"

    poll = models.ForeignKey(
        Poll, on_delete=models.CASCADE, related_name="questions", verbose_name="Опрос",
    )
    text = models.TextField(verbose_name="Текст вопроса")
    question_type = models.CharField(
        max_length=10,
        choices=QuestionType.choices,
        default=QuestionType.SINGLE_CHOICE,
        verbose_name="Тип вопроса",
    )
    initial_value = models.CharField(
        max_length=15,
        choices=InitialValueType.choices,
        blank=True,
        null=True,
        default=None,
        verbose_name="Предзаполнение",
    )
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок вопроса")
    is_required = models.BooleanField(default=True, verbose_name="Обязательный вопрос")

    min_choices = models.PositiveIntegerField(
        null=True, blank=True, verbose_name="Минимальное количество выбранных вариантов",
    )
    max_choices = models.PositiveIntegerField(
        null=True,
        blank=True,
        verbose_name="Максимальное количество выбранных вариантов",
    )
    allow_custom_answer = models.BooleanField(
        default=False,
        verbose_name="Разрешить свой вариант ответа ('Другое')",
        help_text="Если отмечено, пользователь сможет вписать свой вариант (для типов 'Один вариант' и 'Несколько вариантов').",
    )

    class Meta:
        verbose_name = "Вопрос"
        verbose_name_plural = "Вопросы"
        ordering = ["poll", "order"]

    def __str__(self):
        return (
            f"{self.text[:50]}... (Опрос: {self.poll.name[:20] if self.poll and self.poll.name else '[Опрос не указан]'})"
            if self.text
            else "Пустой вопрос"
        )


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
        verbose_name="Текст варианта ответа", max_length=CHARFIELD_LENGTH,
    )

    order = models.PositiveIntegerField(default=0, verbose_name="Порядок варианта")

    class Meta:
        verbose_name = "Вариант ответа"
        verbose_name_plural = "Варианты ответа"
        ordering = ["question", "order"]

    def __str__(self):
        question_text = "[Вопрос не указан]"
        if self.question and hasattr(self.question, "text"):
            question_text = f"'{self.question.text[:30]}...'"

        return f"Вариант '{self.choice_text}' для вопроса {question_text}"


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

    def __str__(self):
        return f"{self.dependent_question} {self.trigger_question}"


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
        auto_now_add=True, verbose_name="Время отправки",
    )
    
    class Meta:
        verbose_name = "Прохождение опроса"
        verbose_name_plural = "Прохождения опросов"
        unique_together = [["poll", "user"]]

    def __str__(self):
        user_info = self.user.get_full_name() if self.user else "Аноним"
        return (
            f"Ответы от {user_info} на опрос '{self.poll.name}'"
            if self.poll.name
            else "Заполните имя опроса"
        )


class Answer(models.Model):
    submission = models.ForeignKey(
        PollSubmission, on_delete=models.CASCADE, related_name="answers",
    )
    question = models.ForeignKey(
        Question, on_delete=models.CASCADE, related_name="answers",
    )

    selected_choices = models.ManyToManyField(
        Choice, blank=True, related_name="chosen_in_answers",
    )

    free_text_answer = models.TextField(blank=True, null=True)

    custom_choice_text = models.TextField(
        blank=True,
        null=True,
        verbose_name="Текст своего варианта ответа ('Другое')",
        help_text="Заполняется, если пользователь выбрал опцию 'Другое' и вписал свой вариант.",
    )

    class Meta:
        verbose_name = "Ответ на вопрос"
        verbose_name_plural = "Ответы на вопросы"

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


class Video(Published):
    """Модель для обучающего видео."""

    name = models.CharField(max_length=CHARFIELD_LENGTH, verbose_name="Название видео")
    description = models.TextField(verbose_name="Описание", blank=True)
    author = models.ForeignKey(
        Employee,
        verbose_name="Автор",
        on_delete=models.SET_NULL,
        null=True,
        related_name="authored_videos",
    )
    media = models.FileField(
        verbose_name="Видеофайл",
        upload_to="educational_videos/",
        validators=[
            FileExtensionValidator(
                allowed_extensions=["MOV", "avi", "mp4", "webm", "mkv"],
            ),
        ],
    )
    pub_date = models.DateTimeField(verbose_name="Дата публикации")

    class Meta:
        verbose_name = "Видео"
        verbose_name_plural = "Видео"
        ordering = ["-pub_date"]

    def __str__(self):
        return self.name


class Course(Published):
    """Модель для обучающего курса, состоящего из видео."""

    name = models.CharField(max_length=CHARFIELD_LENGTH, verbose_name="Название курса")
    description = models.TextField(verbose_name="Описание", blank=True)
    author = models.ForeignKey(
        Employee,
        verbose_name="Автор",
        on_delete=models.SET_NULL,
        null=True,
        related_name="authored_courses",
    )
    videos = models.ManyToManyField(
        Video,
        through="CourseVideo",
        verbose_name="Видео в курсе",
        related_name="courses",
    )
    pub_date = models.DateTimeField(verbose_name="Дата публикации")

    class Meta:
        verbose_name = "Курс"
        verbose_name_plural = "Курсы"
        ordering = ["-pub_date"]

    def __str__(self):
        return self.name


class CourseVideo(models.Model):
    """Промежуточная модель для связи Курса и Видео с указанием порядка."""

    course = models.ForeignKey(Course, on_delete=models.CASCADE, verbose_name="Курс")
    video = models.ForeignKey(Video, on_delete=models.CASCADE, verbose_name="Видео")
    order = models.PositiveIntegerField(default=0, verbose_name="Порядок в курсе")

    class Meta:
        verbose_name = "Видео в курсе"
        verbose_name_plural = "Видео в курсах"
        ordering = ["order"]
        unique_together = ("course", "video")

    def __str__(self):
        return f"Видео {self.video} курса {self.course}"


class Comment(models.Model):
    """Модель для комментария к видео."""

    video = models.ForeignKey(
        Video,
        on_delete=models.CASCADE,
        related_name="comments",
        verbose_name="Видео",
    )
    user = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="video_comments",
        verbose_name="Пользователь",
    )
    text = models.TextField(verbose_name="Текст комментария")
    pub_date = models.DateTimeField(auto_now_add=True, verbose_name="Дата публикации")

    class Meta:
        verbose_name = "Комментарий к видео"
        verbose_name_plural = "Комментарии к видео"
        ordering = ["-pub_date"]

    def __str__(self):
        return f"Комментарий от {self.user} к видео '{self.video.name}'"


class VideoView(models.Model):
    """Модель для отслеживания просмотров видео."""

    video = models.ForeignKey(
        Video, on_delete=models.CASCADE, related_name="views", verbose_name="Видео",
    )
    user = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="video_views",
        verbose_name="Пользователь",
    )
    viewed_at = models.DateTimeField(
        auto_now_add=True, verbose_name="Дата и время просмотра",
    )

    class Meta:
        verbose_name = "Просмотр видео"
        verbose_name_plural = "Просмотры видео"
        ordering = ["-viewed_at"]

    def __str__(self):
        return f"Просмотр видео '{self.video.name}' пользователем {self.user}"


class Like(models.Model):
    """Модель для отслеживания лайков к видео."""

    video = models.ForeignKey(
        Video, on_delete=models.CASCADE, related_name="likes", verbose_name="Видео",
    )
    user = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        related_name="video_likes",
        verbose_name="Пользователь",
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Дата лайка")

    class Meta:
        verbose_name = "Лайк"
        verbose_name_plural = "Лайки"
        ordering = ["-created_at"]
        unique_together = ("video", "user")

    def __str__(self):
        return f"Лайк от {self.user} к видео '{self.video.name}'"


class SecretSantaSeason(models.Model):
    """Хранит общие константы для мероприятия Тайного Санты."""

    deadline = models.DateTimeField(
        null=True, blank=True, verbose_name="Крайний срок регистрации/изменений",
    )
    budget = models.DecimalField(
        max_digits=8, decimal_places=2, default=0, verbose_name="Бюджет (руб.)",
    )
    is_active = models.BooleanField(default=False, verbose_name="Активен")

    class Meta:
        verbose_name = "Настройки Тайного Санты"
        verbose_name_plural = "Настройки Тайного Санты"

    def __str__(self):
        return f"SecretSantaSeason(active={self.is_active}, deadline={self.deadline})"


class SecretSantaParticipant(models.Model):
    """Анкета участника Тайного Санты.

    Каждый пользователь может иметь одну анкету (gift_giver).
    Поле gift_receiver заполняется вручную после жеребьевки и должно быть уникальным.
    """

    gift_giver = models.OneToOneField(
        Employee,
        on_delete=models.CASCADE,
        related_name="secret_santa_participant",
        verbose_name="Отправитель подарка",
    )
    wishes = models.TextField(blank=True, verbose_name="Пожелания")
    address = models.TextField(blank=True, verbose_name="Адрес")
    zip_code = models.IntegerField(null=True, blank=True, verbose_name="Индекс")
    phone = models.CharField(max_length=50, blank=True, verbose_name="Телефон")

    # Связан с другим пользователем — получателем подарка.
    # OneToOneField гарантирует уникальность получателя в рамках мероприятия.
    gift_receiver = models.OneToOneField(
        Employee,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="secret_santa_receiver",
        verbose_name="Получатель подарка",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Участник Тайного Санты"
        verbose_name_plural = "Участники Тайного Санты"

    def __str__(self):
        return f"SecretSantaParticipant({self.gift_giver})"
