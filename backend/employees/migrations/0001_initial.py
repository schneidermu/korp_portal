# Generated by Django 4.2.8 on 2024-04-24 09:15

from django.conf import settings
import django.contrib.auth.models
import django.contrib.auth.validators
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import phonenumber_field.modelfields
import uuid


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("auth", "0012_alter_user_first_name_max_length"),
    ]

    operations = [
        migrations.CreateModel(
            name="Employee",
            fields=[
                ("password", models.CharField(max_length=128, verbose_name="password")),
                (
                    "last_login",
                    models.DateTimeField(
                        blank=True, null=True, verbose_name="last login"
                    ),
                ),
                (
                    "is_superuser",
                    models.BooleanField(
                        default=False,
                        help_text="Designates that this user has all permissions without explicitly assigning them.",
                        verbose_name="superuser status",
                    ),
                ),
                (
                    "username",
                    models.CharField(
                        error_messages={
                            "unique": "A user with that username already exists."
                        },
                        help_text="Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.",
                        max_length=150,
                        unique=True,
                        validators=[
                            django.contrib.auth.validators.UnicodeUsernameValidator()
                        ],
                        verbose_name="username",
                    ),
                ),
                (
                    "first_name",
                    models.CharField(
                        blank=True, max_length=150, verbose_name="first name"
                    ),
                ),
                (
                    "last_name",
                    models.CharField(
                        blank=True, max_length=150, verbose_name="last name"
                    ),
                ),
                (
                    "is_staff",
                    models.BooleanField(
                        default=False,
                        help_text="Designates whether the user can log into this admin site.",
                        verbose_name="staff status",
                    ),
                ),
                (
                    "is_active",
                    models.BooleanField(
                        default=True,
                        help_text="Designates whether this user should be treated as active. Unselect this instead of deleting accounts.",
                        verbose_name="active",
                    ),
                ),
                (
                    "date_joined",
                    models.DateTimeField(
                        default=django.utils.timezone.now, verbose_name="date joined"
                    ),
                ),
                (
                    "id",
                    models.UUIDField(
                        default=uuid.uuid4,
                        editable=False,
                        primary_key=True,
                        serialize=False,
                    ),
                ),
                (
                    "fio",
                    models.CharField(
                        blank=True,
                        max_length=256,
                        null=True,
                        verbose_name="Фамилия Имя Отчество",
                    ),
                ),
                (
                    "birth_date",
                    models.DateField(
                        blank=True, null=True, verbose_name="Дата рождения"
                    ),
                ),
                (
                    "email",
                    models.EmailField(
                        blank=True, max_length=254, null=True, verbose_name="Почта"
                    ),
                ),
                (
                    "telephone_number",
                    phonenumber_field.modelfields.PhoneNumberField(
                        blank=True,
                        max_length=128,
                        null=True,
                        region=None,
                        unique=True,
                        verbose_name="Номер телефона",
                    ),
                ),
                (
                    "job_title",
                    models.CharField(
                        blank=True, max_length=256, null=True, verbose_name="Должность"
                    ),
                ),
                (
                    "class_rank",
                    models.CharField(
                        blank=True,
                        max_length=256,
                        null=True,
                        verbose_name="Классный чин",
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        blank=True,
                        choices=[
                            ("В отпуске", "В отпуске"),
                            ("В командировке", "В командировке"),
                            ("На больничном", "На больничном"),
                            ("На рабочем месте", "На рабочем месте"),
                            ("Нет на месте", "Нет на месте"),
                        ],
                        default="На рабочем месте",
                        max_length=16,
                        null=True,
                        verbose_name="Статус",
                    ),
                ),
                (
                    "groups",
                    models.ManyToManyField(
                        blank=True,
                        help_text="The groups this user belongs to. A user will get all permissions granted to each of their groups.",
                        related_name="user_set",
                        related_query_name="user",
                        to="auth.group",
                        verbose_name="groups",
                    ),
                ),
            ],
            options={
                "verbose_name": "сотрудник",
                "verbose_name_plural": "Сотрудники",
            },
            managers=[
                ("objects", django.contrib.auth.models.UserManager()),
            ],
        ),
        migrations.CreateModel(
            name="Characteristic",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "university",
                    models.CharField(
                        blank=True,
                        max_length=256,
                        null=True,
                        verbose_name="Университет",
                    ),
                ),
                (
                    "diploma",
                    models.CharField(
                        blank=True, max_length=256, null=True, verbose_name="Диплом"
                    ),
                ),
                (
                    "experience",
                    models.PositiveSmallIntegerField(
                        blank=True, null=True, verbose_name="Стаж работы (лет)"
                    ),
                ),
                (
                    "about",
                    models.TextField(blank=True, null=True, verbose_name="Обо мне"),
                ),
                (
                    "employee",
                    models.OneToOneField(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="characteristic",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Сотрудник",
                    ),
                ),
            ],
            options={
                "verbose_name": "характеристика",
                "verbose_name_plural": "Характеристики",
            },
        ),
        migrations.CreateModel(
            name="Organization",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=256, verbose_name="Название")),
                (
                    "address",
                    models.CharField(max_length=256, verbose_name="Адрес организации"),
                ),
                (
                    "structural_division",
                    models.CharField(
                        max_length=256, verbose_name="Структурное подразделение"
                    ),
                ),
            ],
            options={
                "verbose_name": "организация",
                "verbose_name_plural": "Организации",
            },
        ),
        migrations.CreateModel(
            name="Volunteer",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=256, verbose_name="Название")),
                (
                    "image",
                    models.ImageField(
                        default=None,
                        null=True,
                        upload_to="employees/%(class)s/",
                        verbose_name="Картинка",
                    ),
                ),
                (
                    "characteristic",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="%(class)s",
                        to="employees.characteristic",
                        verbose_name="Сотрудник",
                    ),
                ),
            ],
            options={
                "verbose_name": "волонтерство",
                "verbose_name_plural": "волонтерства",
            },
        ),
        migrations.CreateModel(
            name="Victory",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=256, verbose_name="Название")),
                (
                    "image",
                    models.ImageField(
                        default=None,
                        null=True,
                        upload_to="employees/%(class)s/",
                        verbose_name="Картинка",
                    ),
                ),
                (
                    "characteristic",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="%(class)s",
                        to="employees.characteristic",
                        verbose_name="Сотрудник",
                    ),
                ),
            ],
            options={
                "verbose_name": "победа в конкурсе",
                "verbose_name_plural": "победы в конкурсе",
            },
        ),
        migrations.CreateModel(
            name="Training",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=256, verbose_name="Название")),
                (
                    "image",
                    models.ImageField(
                        default=None,
                        null=True,
                        upload_to="employees/%(class)s/",
                        verbose_name="Картинка",
                    ),
                ),
                (
                    "characteristic",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="%(class)s",
                        to="employees.characteristic",
                        verbose_name="Сотрудник",
                    ),
                ),
            ],
            options={
                "verbose_name": "повышение квалификации",
                "verbose_name_plural": "повышения квалификации",
            },
        ),
        migrations.CreateModel(
            name="Sport",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=256, verbose_name="Название")),
                (
                    "image",
                    models.ImageField(
                        default=None,
                        null=True,
                        upload_to="employees/%(class)s/",
                        verbose_name="Картинка",
                    ),
                ),
                (
                    "characteristic",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="%(class)s",
                        to="employees.characteristic",
                        verbose_name="Сотрудник",
                    ),
                ),
            ],
            options={
                "verbose_name": "спортивное мероприятия",
                "verbose_name_plural": "спортивные мероприятия",
            },
        ),
        migrations.CreateModel(
            name="Reward",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=256, verbose_name="Название")),
                (
                    "image",
                    models.ImageField(
                        default=None,
                        null=True,
                        upload_to="employees/%(class)s/",
                        verbose_name="Картинка",
                    ),
                ),
                (
                    "characteristic",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="%(class)s",
                        to="employees.characteristic",
                        verbose_name="Сотрудник",
                    ),
                ),
            ],
            options={
                "verbose_name": "награда",
                "verbose_name_plural": "награды",
            },
        ),
        migrations.CreateModel(
            name="Rating",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "rate",
                    models.IntegerField(
                        validators=[
                            django.core.validators.MinValueValidator(0),
                            django.core.validators.MaxValueValidator(5),
                        ]
                    ),
                ),
                (
                    "employee",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="rated",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Оцениваемый сотрудник",
                    ),
                ),
                (
                    "user",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="rates",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Оценивающий сотрудник",
                    ),
                ),
            ],
            options={
                "verbose_name": "оценка",
                "verbose_name_plural": "Оценки",
            },
        ),
        migrations.CreateModel(
            name="Performance",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=256, verbose_name="Название")),
                (
                    "image",
                    models.ImageField(
                        default=None,
                        null=True,
                        upload_to="employees/%(class)s/",
                        verbose_name="Картинка",
                    ),
                ),
                (
                    "characteristic",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="%(class)s",
                        to="employees.characteristic",
                        verbose_name="Сотрудник",
                    ),
                ),
            ],
            options={
                "verbose_name": "выступление",
                "verbose_name_plural": "выступления",
            },
        ),
        migrations.CreateModel(
            name="Hobby",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=256, verbose_name="Название")),
                (
                    "image",
                    models.ImageField(
                        default=None,
                        null=True,
                        upload_to="employees/%(class)s/",
                        verbose_name="Картинка",
                    ),
                ),
                (
                    "characteristic",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="%(class)s",
                        to="employees.characteristic",
                        verbose_name="Сотрудник",
                    ),
                ),
            ],
            options={
                "verbose_name": "хобби",
                "verbose_name_plural": "хобби",
            },
        ),
        migrations.CreateModel(
            name="Course",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=256, verbose_name="Название")),
                ("date", models.DateField(verbose_name="Дата прохождения курса")),
                (
                    "characteristic",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="%(class)s",
                        to="employees.characteristic",
                        verbose_name="Сотрудник",
                    ),
                ),
            ],
            options={
                "verbose_name": "курс",
                "verbose_name_plural": "Курсы",
            },
        ),
        migrations.CreateModel(
            name="Conference",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=256, verbose_name="Название")),
                (
                    "image",
                    models.ImageField(
                        default=None,
                        null=True,
                        upload_to="employees/%(class)s/",
                        verbose_name="Картинка",
                    ),
                ),
                (
                    "characteristic",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="%(class)s",
                        to="employees.characteristic",
                        verbose_name="Сотрудник",
                    ),
                ),
            ],
            options={
                "verbose_name": "конференция",
                "verbose_name_plural": "конференции",
            },
        ),
        migrations.CreateModel(
            name="Competence",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=256, verbose_name="Название")),
                (
                    "characteristic",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="%(class)s",
                        to="employees.characteristic",
                        verbose_name="Сотрудник",
                    ),
                ),
            ],
            options={
                "verbose_name": "компетенция",
                "verbose_name_plural": "компетенции",
            },
        ),
        migrations.CreateModel(
            name="Career",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("date", models.DateField(verbose_name="Дата вступления в должность")),
                ("name", models.CharField(max_length=256, verbose_name="Должность")),
                (
                    "characteristic",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="%(class)s",
                        to="employees.characteristic",
                        verbose_name="Сотрудник",
                    ),
                ),
            ],
            options={
                "verbose_name": "карьера",
                "verbose_name_plural": "Карьера",
            },
        ),
        migrations.AddField(
            model_name="employee",
            name="organization",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="employees",
                to="employees.organization",
                verbose_name="Организация",
            ),
        ),
        migrations.AddField(
            model_name="employee",
            name="user_permissions",
            field=models.ManyToManyField(
                blank=True,
                help_text="Specific permissions for this user.",
                related_name="user_set",
                related_query_name="user",
                to="auth.permission",
                verbose_name="user permissions",
            ),
        ),
        migrations.AddConstraint(
            model_name="rating",
            constraint=models.CheckConstraint(
                check=models.Q(("rate__range", (0, 5))), name="valid_rate"
            ),
        ),
    ]
