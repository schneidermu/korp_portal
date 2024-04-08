from django.db import models
from django.contrib.auth import get_user_model
from homepage.constants import CHARFIELD_LENGTH
from django.core.validators import MaxValueValidator, MinValueValidator
from phonenumber_field.modelfields import PhoneNumberField
from django.db.models import CheckConstraint, Q, UniqueConstraint
from django.db.models import Avg


User = get_user_model()

CHOICES = (
    ('В отпуске', 'В отпуске'),
    ('В командировке', 'В командировке'),
    ('На больничном', 'На больничном'),
    ('На рабочем месте', 'На рабочем месте'),
    ('Нет на месте', 'Нет на месте'),
)


class Employee(models.Model):
    """Модель сотрудника."""

    user = models.OneToOneField(
        User, on_delete=models.CASCADE, related_name='information'
    )

    fio = models.CharField(
        verbose_name='Фамилия Имя Отчество',
        max_length=CHARFIELD_LENGTH,
    )

    birth_date = models.DateField(
        verbose_name='Дата рождения',
    )
    email = models.EmailField(
        verbose_name='Почта',
    )
    telephone_number = PhoneNumberField(
        verbose_name='Номер телефона',
        null=False, blank=False, unique=True
    )
    organization = models.ForeignKey(
        'Organization',
        related_name='employees',
        verbose_name='Организация',
        on_delete=models.CASCADE
    )
    job_title = models.CharField(
        verbose_name='Должность',
        max_length=CHARFIELD_LENGTH,
    )
    class_rank = models.CharField(
        verbose_name='Классный чин',
        max_length=CHARFIELD_LENGTH,
    )

    status = models.CharField(
        verbose_name='Статус',
        max_length=16, choices=CHOICES, default='На рабочем месте'
    )

    @property
    def average_rating(self):
        return self.rated.all().aggregate(Avg('rate'))['rate__avg']

    def __str__(self) -> str:
        return self.fio

    class Meta:
        verbose_name = 'сотрудник'
        verbose_name_plural = 'Сотрудники'


class AbstractNameModel(models.Model):
    """Абстрактный класс для событий."""

    name = models.CharField(
        verbose_name='Название',
        max_length=CHARFIELD_LENGTH,
    )

    characteristic = models.ForeignKey(
        "Characteristic",
        verbose_name="Сотрудник",
        related_name='%(class)s',
        on_delete=models.CASCADE,
    )

    class Meta:
        abstract = True

    def __str__(self):
        return self.name


class AbstractWithPhotoNameModel(AbstractNameModel):
    """Абстрактный класс для событий с фото."""

    image = models.ImageField(
        verbose_name='Картинка',
        upload_to='employees/%(class)s/',
        null=True,
        default=None
    )


class Rating(models.Model):
    """Модель рейтинга."""

    rate = models.IntegerField(
        validators=[
            MinValueValidator(0),
            MaxValueValidator(5)
        ]
    )
    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE,
        related_name='rated',
        verbose_name='Оцениваемый сотрудник'
    )
    user = models.ForeignKey(
        Employee, on_delete=models.CASCADE,
        related_name='rates',
        verbose_name='Оценивающий сотрудник'
    )

    def __str__(self):
        return f"Оценка кого: {self.employee.fio}\n Кем: {self.user.fio}"

    class Meta:
        constraints = [
            CheckConstraint(check=Q(rate__range=(0, 5)), name='valid_rate'),
            UniqueConstraint(fields=['user', 'employee'], name='rating_once')
        ]
        verbose_name = 'оценка'
        verbose_name_plural = 'Оценки'


class Characteristic(models.Model):
    """Модель характеристики сотрудника."""

    employee = models.OneToOneField(
        Employee,
        on_delete=models.CASCADE,
        related_name='characteristic',
        verbose_name='Сотрудник',
    )

    university = models.CharField(
        verbose_name='Университет',
        max_length=CHARFIELD_LENGTH,
        blank=True,
        null=True,
    )
    diploma = models.CharField(
        verbose_name='Диплом',
        max_length=CHARFIELD_LENGTH,
        blank=True,
        null=True,
    )

    # Курсы через class Course

    experience = models.PositiveSmallIntegerField(
        verbose_name='Стаж работы (лет)',
        blank=True,
        null=True,
    )

    # Карьерный рост через class Career

    # Компетенции через class Competence

    # Повышение квалификации class Training

    # Хобби class Hobby

    # Награды class Reward

    # Конференции class Conference

    # Победы в конкурсах class Victory

    # Выступления class Performance

    # Спортивные мероприятия class Sport

    # Волонтерская деятельность class Volunteer

    about = models.TextField(
        verbose_name='Обо мне',
        blank=True,
        null=True,
    )

    class Meta:
        verbose_name = "характеристика"
        verbose_name_plural = "Характеристики"

    def __str__(self):
        return self.employee.fio


class Course(AbstractNameModel):
    """Модель курса."""

    date = models.DateField(
        verbose_name='Дата прохождения курса',
    )

    class Meta:
        verbose_name = 'курс'
        verbose_name_plural = 'Курсы'


class Career(AbstractNameModel):
    """Модель карьерного роста."""

    date = models.DateField(
        verbose_name='Дата вступления в должность',
    )

    name = models.CharField(
        verbose_name='Должность',
        max_length=CHARFIELD_LENGTH,
    )

    class Meta:
        verbose_name = 'карьера'
        verbose_name_plural = 'Карьера'


class Competence(AbstractNameModel):
    """Модель навыков и компетенций."""
    class Meta:
        verbose_name = 'компетенция'
        verbose_name_plural = 'компетенции'


class Training(AbstractWithPhotoNameModel):
    """Модель повышения квалификации."""
    class Meta:
        verbose_name = 'повышение квалификации'
        verbose_name_plural = 'повышения квалификации'


class Hobby(AbstractWithPhotoNameModel):
    """Модель хобби."""
    class Meta:
        verbose_name = 'хобби'
        verbose_name_plural = 'хобби'


class Reward(AbstractWithPhotoNameModel):
    """Модель награды."""
    class Meta:
        verbose_name = 'награда'
        verbose_name_plural = 'награды'


class Conference(AbstractWithPhotoNameModel):
    """Модель конференции."""
    class Meta:
        verbose_name = 'конференция'
        verbose_name_plural = 'конференции'


class Victory(AbstractWithPhotoNameModel):
    """Модель победы в конкурсе."""
    class Meta:
        verbose_name = 'победа в конкурсе'
        verbose_name_plural = 'победы в конкурсе'


class Performance(AbstractWithPhotoNameModel):
    """Модель выступления."""
    class Meta:
        verbose_name = 'выступление'
        verbose_name_plural = 'выступления'


class Sport(AbstractWithPhotoNameModel):
    """Модель спортивного мероприятия."""
    class Meta:
        verbose_name = 'спортивное мероприятия'
        verbose_name_plural = 'спортивные мероприятия'


class Volunteer(AbstractWithPhotoNameModel):
    """Модель волонтерства."""
    class Meta:
        verbose_name = 'волонтерство'
        verbose_name_plural = 'волонтерства'


class Organization(models.Model):
    """Модель организации."""

    name = models.CharField(
        verbose_name='Название',
        max_length=CHARFIELD_LENGTH,
    )

    address = models.CharField(
        verbose_name='Адрес организации',
        max_length=CHARFIELD_LENGTH,
    )

    structural_division = models.CharField(
        verbose_name='Структурное подразделение',
        max_length=CHARFIELD_LENGTH,
    )

    def __str__(self):
        return f'{self.name}'

    class Meta:
        verbose_name = 'организация'
        verbose_name_plural = 'Организации'