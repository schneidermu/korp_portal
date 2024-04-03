from django.db import models
from django.contrib.auth import get_user_model
from homepage.constants import CHARFIELD_LENGTH
from django.core.validators import MaxValueValidator, MinValueValidator
from phonenumber_field.modelfields import PhoneNumberField
from django.db.models import CheckConstraint, Q, UniqueConstraint
from django.db.models import Avg


User = get_user_model()


class Employee(models.Model):
    """Модель сотрудника."""

    user = models.OneToOneField(User, on_delete=models.CASCADE)

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
#    characteristic = models.OneToOneField(
#        'Characteristic',
#        verbose_name='Характеристика сотрудника',
#        related_name='employee',
#        on_delete=models.CASCADE,
#    )

    @property
    def average_rating(self):
        print(self.rates.all())
        return self.rated.all().aggregate(Avg('rate'))['rate__avg']

    def __str__(self) -> str:
        return f'Сотрудник {self.fio}'

    class Meta:
        verbose_name = 'Сотрудник'
        verbose_name_plural = 'Сотрудники'


class AbstractNameModel(models.Model):
    """Абстрактный класс для событий."""

    name = models.CharField(
        verbose_name='Название',
        max_length=CHARFIELD_LENGTH,
    )

    employee = models.ForeignKey(
        Employee,
        verbose_name="Сотрудник",
        related_name='%(class)s',
        on_delete=models.CASCADE
    )

    class Meta:
        abstract = True

    def __str__(self):
        return f'{self.employee.fio} - {self.name}'


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
        verbose_name = 'Оценка'
        verbose_name_plural = 'Оценки'


class Characteristic(models.Model):
    """Модель характеристики сотрудника."""

    employee = models.OneToOneField(
        Employee,
        on_delete=models.CASCADE,
        related_name='characteristic'
    )

    university = models.CharField(
        verbose_name='Университет',
        max_length=CHARFIELD_LENGTH,
    )
    diploma = models.CharField(
        verbose_name='Диплом',
        max_length=CHARFIELD_LENGTH,
    )

    # Курсы через class Course

    experience = models.PositiveSmallIntegerField(
        verbose_name='Стаж',
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


class Course(AbstractNameModel):
    """Модель курса."""

    date = models.DateTimeField(
        verbose_name='Дата прохождения курса',
    )


class Career(models.Model):
    """Модель карьерного роста."""

    date = models.DateTimeField(
        verbose_name='Дата вступления в должность',
    )
    employee = models.ForeignKey(
        Employee,
        on_delete=models.CASCADE,
        verbose_name='Сотрудник',
        related_name='career'
    )
    title = models.CharField(
        verbose_name='Должность',
        max_length=CHARFIELD_LENGTH,
    )


class Competence(AbstractNameModel):
    """Модель наыков и компетенций."""
    pass


class Training(AbstractWithPhotoNameModel):
    """Модель повышения квалификации."""
    pass


class Hobby(AbstractWithPhotoNameModel):
    """Модель хобби."""
    pass


class Reward(AbstractWithPhotoNameModel):
    """Модель награды."""
    pass


class Conference(AbstractWithPhotoNameModel):
    """Модель конференции."""
    pass


class Victory(AbstractWithPhotoNameModel):
    """Модель победы в конкурсе."""
    pass


class Performance(AbstractWithPhotoNameModel):
    """Модель выступления."""
    pass


class Sport(AbstractWithPhotoNameModel):
    """Модель спортивного мероприятия."""
    pass


class Volunteer(AbstractWithPhotoNameModel):
    """Модель волонтерства."""
    pass


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
        verbose_name = 'Организация'
        verbose_name_plural = 'Организации'
