from django.db import models
from django.core.validators import FileExtensionValidator
from datetime import datetime

from .constants import CHARFIELD_LENGTH


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
        upload_to='news/images/',
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
        default=datetime.now(),
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

    question_text = models.CharField(
        verbose_name='Текст опроса',
        max_length=CHARFIELD_LENGTH
    )

    pub_date = models.DateTimeField(
        default=datetime.now(),
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
    votes = models.IntegerField(
        verbose_name="Число голосов",
        default=0
    )

    def __str__(self):
        return 'Вариант'

    class Meta:
        verbose_name = 'Вариант опроса'
        verbose_name_plural = 'Варианты опроса'
