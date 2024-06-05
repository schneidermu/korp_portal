from django.db import models
from django.core.validators import FileExtensionValidator
from django.utils import timezone

from .constants import CHARFIELD_LENGTH
from employees.models import Employee


class Published(models.Model):
    """Абстрактный класс, показывающий время публикации,
    а также позволяющий снимать с публикации."""

    is_published = models.BooleanField(
        default=True,
        verbose_name='Опубликовано',
        help_text='Снимите галочку, чтобы скрыть публикацию.'
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name='Добавлено',
    )

    class Meta:
        abstract = True


class News(Published):
    """Модель для новости."""

    title = models.CharField(
        max_length=CHARFIELD_LENGTH,
        verbose_name='Заголовок'
    )

    text = models.TextField(verbose_name='Текст')

    image = models.ImageField(
        verbose_name='Картинка',
        upload_to='news/',
        null=True,
        default=None
    )

    video = models.FileField(
        verbose_name='Видео',
        upload_to='videos_uploaded',
        blank=True,
        null=True,
        default=None,
        validators=[FileExtensionValidator(
            allowed_extensions=['MOV', 'avi', 'mp4', 'webm', 'mkv']
        )]
    )

    pub_date = models.DateTimeField(
        default=timezone.now,
        verbose_name='Дата и время публикации',
        help_text=('Если установить дату и время в будущем'
                   ' — можно делать отложенные публикации.'),
    )

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = 'Новость'
        verbose_name_plural = 'Новости'


class Poll(Published):
    """Модель для вопроса."""

    is_anonymous = models.BooleanField(
        'Анонимный опрос',
        default=False
    )

    is_multiple_choice = models.BooleanField(
        'Несколько вариантов ответа',
        default=False
    )

    question_text = models.CharField(
        verbose_name='Текст опроса',
        max_length=CHARFIELD_LENGTH
    )

    pub_date = models.DateTimeField(
        default=timezone.now,
        verbose_name='Дата и время публикации',
        help_text=('Если установить дату и время в будущем'
                   ' — можно делать отложенные публикации.'),
    )

    def __str__(self):
        return self.question_text

    class Meta:
        verbose_name = 'Опрос'
        verbose_name_plural = 'Опросы'


class Choice(models.Model):
    """Модель для вырианта опроса."""

    poll = models.ForeignKey(
        Poll,
        verbose_name="Опрос",
        on_delete=models.CASCADE,
        related_name='choices'
    )
    choice_text = models.CharField(
        verbose_name="Текст вопроса",
        max_length=CHARFIELD_LENGTH
    )
    voted = models.ManyToManyField(
        Employee,
        verbose_name="Выбрали этот вариант",
        blank=True,
        related_name="chose",
    )

    def __str__(self):
        return f'Вариант {self.choice_text}'

    class Meta:
        verbose_name = 'Вариант опроса'
        verbose_name_plural = 'Варианты опроса'

