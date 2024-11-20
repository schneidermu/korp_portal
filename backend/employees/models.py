import uuid
from django.db import models
from homepage.constants import CHARFIELD_LENGTH
from phonenumber_field.modelfields import PhoneNumberField
from django.db.models import Avg
from django.contrib.auth.models import AbstractUser
from django.core.validators import FileExtensionValidator, MaxValueValidator, MinValueValidator


CHOICES = (
    ('В отпуске', 'В отпуске'),
    ('В командировке', 'В командировке'),
    ('На больничном', 'На больничном'),
    ('На рабочем месте', 'На рабочем месте'),
    ('Нет на месте', 'Нет на месте'),
)

POSITIONS = (
    ('Разработчик', 'Разработчик'),
    ('Руководитель', 'Руководитель'),
    ('Тестировщик', 'Тестировщик')
)


class Employee(AbstractUser):
    """Модель страницы сотрудника."""

    REQUIRED_FIELDS = ["email", "password"]

    id = models.UUIDField( 
        primary_key=True,
        default=uuid.uuid4,
        editable=False
    )

    name = models.CharField(
        verbose_name='Имя',
        max_length=CHARFIELD_LENGTH,
        blank=True,
        null=True,
    )

    surname = models.CharField(
        verbose_name='Фамилия',
        max_length=CHARFIELD_LENGTH,
        blank=True,
        null=True,
    )

    patronym = models.CharField(
        verbose_name='Отчество',
        max_length=CHARFIELD_LENGTH,
        blank=True,
        null=True,
    )
    
    chief = models.ForeignKey(
        "Employee",
        verbose_name="Начальник",
        on_delete=models.SET_NULL,
        related_name='subordinates',
        blank=True,
        null=True,
    )

    birth_date = models.DateField(
        verbose_name='Дата рождения',
        blank=True,
        null=True,
    )
    email = models.EmailField(
        verbose_name='Почта',
        blank=True,
        null=True,
    )
    telephone_number = PhoneNumberField(
        verbose_name='Номер телефона',
        blank=True,
        null=True,
        unique=True
    )
    job_title = models.CharField(
        verbose_name='Должность',
        max_length=CHARFIELD_LENGTH,
        blank=True,
        null=True,
    )
    class_rank = models.CharField(
        verbose_name='Классный чин',
        max_length=CHARFIELD_LENGTH,
        blank=True,
        null=True,
    )

    status = models.CharField(
        verbose_name='Статус',
        max_length=16, choices=CHOICES, default='На рабочем месте',
        blank=True,
        null=True,
    )

    structural_division = models.ForeignKey(
        'StructuralSubdivision',
        verbose_name='Структурное подразделение',
        on_delete=models.SET_NULL,
        related_name='positions',
        blank=True,
        null=True,
    )

    @property
    def average_rating(self):
        return self.rated.all().aggregate(Avg('rate'))['rate__avg']

    @property
    def organization(self):
        return self.structural_division.organization

    def __str__(self):

        name = " ".join(
            [name_part for name_part in (self.surname, self.name, self.patronym) if name_part is not None]
        )

        if not name:
            return self.username

        return name

    class Meta:
        verbose_name = 'запись о сотруднике'
        verbose_name_plural = 'Записи сотрудников'


class AbstractNameModel(models.Model):
    """Абстрактный класс для событий."""

    name = models.CharField(
        verbose_name='Название',
        max_length=CHARFIELD_LENGTH,
    )

    characteristic = models.ForeignKey(
        "Characteristic",
        verbose_name="Сотрудник",
        related_name='%(class)ss',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    class Meta:
        abstract = True

    def __str__(self):
        return self.name


class AbstractWithPhotoNameModel(models.Model):
    """Абстрактный класс для событий с фото."""

    name = models.CharField(
        verbose_name='Название',
        max_length=CHARFIELD_LENGTH,
    )

    characteristic = models.ForeignKey(
        "Characteristic",
        verbose_name="Сотрудник",
        related_name='%(class)ss',
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    file = models.FileField(
        verbose_name='Документ',
        upload_to='employees/%(class)s/',
        blank=True,
        null=True,
        default=None,
        validators=[FileExtensionValidator(
            allowed_extensions=[
                'doc', 'docx',
                'xlsx', 'xls', 'csv', 'pdf',
                'jpg', 'png', 'jpeg'
            ]
        )]
    )

    class Meta:
        abstract = True

    def __str__(self):
        return self.name


class Rating(models.Model):
    """Модель рейтинга."""

    rate = models.PositiveSmallIntegerField(
        choices=(
            (1, '1'),
            (2, '2'),
            (3, '3'),
            (4, '4'),
            (5, '5')
        ),
    )
    employee = models.ForeignKey(
        Employee, on_delete=models.CASCADE,
        related_name='rated',
        verbose_name='Кого оценивают'
    )
    user = models.ForeignKey(
        Employee, on_delete=models.CASCADE,
        related_name='rates',
        verbose_name='Кто оценивает'
    )

    def __str__(self):
        return f"{self.employee} оценил {self.user} на {self.rate}"

    class Meta:
        verbose_name = 'запись оценки'
        verbose_name_plural = 'Записи оценок'


class Characteristic(models.Model):
    """Модель характеристики сотрудника."""

    employee = models.OneToOneField(
        Employee,
        on_delete=models.CASCADE,
        related_name='characteristic',
        verbose_name='Сотрудник',
    )

#    university = models.CharField(
#        verbose_name='Университет',
#        max_length=CHARFIELD_LENGTH,
#        blank=True,
#        null=True,
#    )

    avatar = models.ImageField(
        verbose_name='Аватар',
        upload_to='employees/avatars/',
        null=True,
        blank=True,
        default=None
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

    # Диплом через class Diploma

    about = models.TextField(
        verbose_name='Обо мне',
        blank=True,
        null=True,
    )

    class Meta:
        verbose_name = "запись характеристики"
        verbose_name_plural = "Записи характеристик"

    def __str__(self):
        return str(self.employee)


class Course(AbstractWithPhotoNameModel):
    """Модель курса."""

    year = models.IntegerField(
        verbose_name='Год прохождения курса',
        blank=True,
        null=True
    )
    month = models.IntegerField(
        verbose_name='Месяц прохождения курса',
        blank=True,
        null=True,
        validators=[
            MinValueValidator(1),
            MaxValueValidator(12)
        ]
    )

    class Meta:
        verbose_name = 'запись курса'
        verbose_name_plural = 'Записи курсов'


class Career(AbstractNameModel):
    """Модель карьерного роста."""

    year_start = models.IntegerField(
        verbose_name='Год вступления в должность',
        default=1970,
    )
    month_start = models.IntegerField(
        verbose_name='Месяц вступления в должность',
        validators=[
            MinValueValidator(1),
            MaxValueValidator(12)
        ],
        blank=True,
        null=True,
    )

    year_finish = models.IntegerField(
        verbose_name='Год ухода из должности',
        blank=True,
        null=True
    )
    month_finish = models.IntegerField(
        verbose_name='Месяц ухода из должности',
        validators=[
            MinValueValidator(1),
            MaxValueValidator(12)
        ],
        blank=True,
        null=True
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
        verbose_name = 'запись компетенции'
        verbose_name_plural = 'записи компетенций'


class Diploma(AbstractWithPhotoNameModel):
    """Модель диплома."""


    year = models.IntegerField(
        verbose_name='Год получения диплома',
        blank=True,
        null=True
    )
    month = models.IntegerField(
        verbose_name='Месяц получения диплома',
        blank=True,
        null=True,
        validators=[
            MinValueValidator(1),
            MaxValueValidator(12)
        ]
    )

    class Meta:
        verbose_name = 'запись диплома'
        verbose_name_plural = 'записи дипломов'


class University(AbstractWithPhotoNameModel):
    """Модель университета."""

    year = models.IntegerField(
        verbose_name='Год окончания университета',
        blank=True,
        null=True
    )
    month = models.IntegerField(
        verbose_name='Месяц окончания университета',
        blank=True,
        null=True,
        validators=[
            MinValueValidator(1),
            MaxValueValidator(12)
        ]
    )

    faculty = models.CharField(
        verbose_name='Факультет',
        blank=True,
        null=True,
    )

    class Meta:
        verbose_name = 'запись университета'
        verbose_name_plural = 'записи университетов'


class Training(AbstractWithPhotoNameModel):
    """Модель повышения квалификации."""
    class Meta:
        verbose_name = 'запись повышения квалификации'
        verbose_name_plural = 'записи повышений квалификации'


class Hobby(AbstractWithPhotoNameModel):
    """Модель хобби."""
    class Meta:
        verbose_name = 'запись хобби'
        verbose_name_plural = 'записи хобби'


class Reward(AbstractWithPhotoNameModel):
    """Модель награды."""
    class Meta:
        verbose_name = 'запись награды'
        verbose_name_plural = 'записи наград'


class Conference(AbstractWithPhotoNameModel):
    """Модель конференции."""
    class Meta:
        verbose_name = 'запись конференции'
        verbose_name_plural = 'записи конференций'


class Victory(AbstractWithPhotoNameModel):
    """Модель победы в конкурсе."""
    class Meta:
        verbose_name = 'запись победы в конкурсе'
        verbose_name_plural = 'записи побед в конкурсе'


class Performance(AbstractWithPhotoNameModel):
    """Модель выступления."""
    class Meta:
        verbose_name = 'запись выступления'
        verbose_name_plural = 'записи выступлений'


class Sport(AbstractWithPhotoNameModel):
    """Модель спортивного мероприятия."""
    class Meta:
        verbose_name = 'запись спортивного мероприятия'
        verbose_name_plural = 'записи спортивных мероприятий'


class Volunteer(AbstractWithPhotoNameModel):
    """Модель волонтерства."""
    class Meta:
        verbose_name = 'запись волонтерства'
        verbose_name_plural = 'записи волонтерств'


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

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = 'запись организации'
        verbose_name_plural = 'записи организаций'


class StructuralSubdivision(models.Model):
    '''Модель структурного подразделения'''
    name = models.CharField(
        verbose_name='Название',
        max_length=CHARFIELD_LENGTH,
    )

    organization = models.ForeignKey(
        Organization,
        verbose_name='Организация',
        on_delete=models.CASCADE,
        related_name='structural_subdivisions'
    )

    parent_structural_subdivision = models.ForeignKey(
        "StructuralSubdivision",
        verbose_name='Родительское СП',
        on_delete=models.SET_NULL,
        related_name="controlled_structural_subdivision",
        blank=True,
        null=True,
    )

    class Meta:
        verbose_name = 'запись структурного подразделения'
        verbose_name_plural = 'записи структурных подразделений'

    def __str__(self):
        return f'{self.name} ({self.organization})'
