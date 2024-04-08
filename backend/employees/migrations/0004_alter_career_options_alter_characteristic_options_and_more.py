# Generated by Django 4.2.8 on 2024-04-08 16:08

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("employees", "0003_remove_employee_characteristic_and_more"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="career",
            options={"verbose_name": "карьера", "verbose_name_plural": "Карьера"},
        ),
        migrations.AlterModelOptions(
            name="characteristic",
            options={
                "verbose_name": "характеристика",
                "verbose_name_plural": "Характеристики",
            },
        ),
        migrations.AlterModelOptions(
            name="competence",
            options={
                "verbose_name": "компетенция",
                "verbose_name_plural": "компетенции",
            },
        ),
        migrations.AlterModelOptions(
            name="conference",
            options={
                "verbose_name": "конференция",
                "verbose_name_plural": "конференции",
            },
        ),
        migrations.AlterModelOptions(
            name="course",
            options={"verbose_name": "курс", "verbose_name_plural": "Курсы"},
        ),
        migrations.AlterModelOptions(
            name="employee",
            options={"verbose_name": "сотрудник", "verbose_name_plural": "Сотрудники"},
        ),
        migrations.AlterModelOptions(
            name="hobby",
            options={"verbose_name": "хобби", "verbose_name_plural": "хобби"},
        ),
        migrations.AlterModelOptions(
            name="organization",
            options={
                "verbose_name": "организация",
                "verbose_name_plural": "Организации",
            },
        ),
        migrations.AlterModelOptions(
            name="performance",
            options={
                "verbose_name": "выступление",
                "verbose_name_plural": "выступления",
            },
        ),
        migrations.AlterModelOptions(
            name="rating",
            options={"verbose_name": "оценка", "verbose_name_plural": "Оценки"},
        ),
        migrations.AlterModelOptions(
            name="reward",
            options={"verbose_name": "награда", "verbose_name_plural": "награды"},
        ),
        migrations.AlterModelOptions(
            name="sport",
            options={
                "verbose_name": "спортивное мероприятия",
                "verbose_name_plural": "спортивные мероприятия",
            },
        ),
        migrations.AlterModelOptions(
            name="training",
            options={
                "verbose_name": "повышение квалификации",
                "verbose_name_plural": "повышения квалификации",
            },
        ),
        migrations.AlterModelOptions(
            name="victory",
            options={
                "verbose_name": "победа в конкурсе",
                "verbose_name_plural": "победы в конкурсе",
            },
        ),
        migrations.AlterModelOptions(
            name="volunteer",
            options={
                "verbose_name": "волонтерство",
                "verbose_name_plural": "волонтерства",
            },
        ),
        migrations.RenameField(
            model_name="career",
            old_name="title",
            new_name="name",
        ),
        migrations.RemoveField(
            model_name="abstractwithphotonamemodel",
            name="employee",
        ),
        migrations.RemoveField(
            model_name="career",
            name="employee",
        ),
        migrations.RemoveField(
            model_name="competence",
            name="employee",
        ),
        migrations.RemoveField(
            model_name="course",
            name="employee",
        ),
        migrations.AddField(
            model_name="abstractwithphotonamemodel",
            name="characteristic",
            field=models.ForeignKey(
                default=1,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="%(class)s",
                to="employees.characteristic",
                verbose_name="Сотрудник",
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="career",
            name="characteristic",
            field=models.ForeignKey(
                default=1,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="%(class)s",
                to="employees.characteristic",
                verbose_name="Сотрудник",
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="characteristic",
            name="about",
            field=models.TextField(blank=True, verbose_name="Обо мне"),
        ),
        migrations.AddField(
            model_name="competence",
            name="characteristic",
            field=models.ForeignKey(
                default=1,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="%(class)s",
                to="employees.characteristic",
                verbose_name="Сотрудник",
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="course",
            name="characteristic",
            field=models.ForeignKey(
                default=1,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="%(class)s",
                to="employees.characteristic",
                verbose_name="Сотрудник",
            ),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name="employee",
            name="status",
            field=models.CharField(
                choices=[
                    ("В отпуске", "В отпуске"),
                    ("В командировке", "В командировке"),
                    ("На больничном", "На больничном"),
                    ("На рабочем месте", "На рабочем месте"),
                    ("Нет на месте", "Нет на месте"),
                ],
                default="На рабочем месте",
                max_length=16,
            ),
        ),
        migrations.AlterField(
            model_name="career",
            name="date",
            field=models.DateField(verbose_name="Дата вступления в должность"),
        ),
        migrations.AlterField(
            model_name="characteristic",
            name="employee",
            field=models.OneToOneField(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="characteristic",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AlterField(
            model_name="characteristic",
            name="experience",
            field=models.PositiveSmallIntegerField(verbose_name="Стаж работы"),
        ),
        migrations.AlterField(
            model_name="course",
            name="date",
            field=models.DateField(verbose_name="Дата прохождения курса"),
        ),
    ]
