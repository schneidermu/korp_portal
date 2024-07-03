# Generated by Django 4.2.8 on 2024-07-03 16:18

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        ("employees", "0012_remove_rating_valid_rate_alter_conference_image_and_more"),
    ]

    operations = [
        migrations.RenameField(
            model_name="career",
            old_name="date",
            new_name="date_start",
        ),
        migrations.RemoveField(
            model_name="characteristic",
            name="diploma",
        ),
        migrations.RemoveField(
            model_name="conference",
            name="image",
        ),
        migrations.RemoveField(
            model_name="hobby",
            name="image",
        ),
        migrations.RemoveField(
            model_name="performance",
            name="image",
        ),
        migrations.RemoveField(
            model_name="reward",
            name="image",
        ),
        migrations.RemoveField(
            model_name="sport",
            name="image",
        ),
        migrations.RemoveField(
            model_name="training",
            name="image",
        ),
        migrations.RemoveField(
            model_name="victory",
            name="image",
        ),
        migrations.RemoveField(
            model_name="volunteer",
            name="image",
        ),
        migrations.AddField(
            model_name="career",
            name="date_finish",
            field=models.DateField(
                blank=True,
                default=None,
                null=True,
                verbose_name="Дата ухода из должности",
            ),
        ),
        migrations.AddField(
            model_name="conference",
            name="file",
            field=models.FileField(
                blank=True,
                default=None,
                null=True,
                upload_to="employees/%(class)s/",
                validators=[
                    django.core.validators.FileExtensionValidator(
                        allowed_extensions=[
                            "doc",
                            "docx",
                            "xlsx",
                            "xls",
                            "csv",
                            "pdf",
                            "jpg",
                            "png",
                            "jpeg",
                        ]
                    )
                ],
                verbose_name="Документ",
            ),
        ),
        migrations.AddField(
            model_name="course",
            name="file",
            field=models.FileField(
                blank=True,
                default=None,
                null=True,
                upload_to="employees/%(class)s/",
                validators=[
                    django.core.validators.FileExtensionValidator(
                        allowed_extensions=[
                            "doc",
                            "docx",
                            "xlsx",
                            "xls",
                            "csv",
                            "pdf",
                            "jpg",
                            "png",
                            "jpeg",
                        ]
                    )
                ],
                verbose_name="Документ",
            ),
        ),
        migrations.AddField(
            model_name="hobby",
            name="file",
            field=models.FileField(
                blank=True,
                default=None,
                null=True,
                upload_to="employees/%(class)s/",
                validators=[
                    django.core.validators.FileExtensionValidator(
                        allowed_extensions=[
                            "doc",
                            "docx",
                            "xlsx",
                            "xls",
                            "csv",
                            "pdf",
                            "jpg",
                            "png",
                            "jpeg",
                        ]
                    )
                ],
                verbose_name="Документ",
            ),
        ),
        migrations.AddField(
            model_name="performance",
            name="file",
            field=models.FileField(
                blank=True,
                default=None,
                null=True,
                upload_to="employees/%(class)s/",
                validators=[
                    django.core.validators.FileExtensionValidator(
                        allowed_extensions=[
                            "doc",
                            "docx",
                            "xlsx",
                            "xls",
                            "csv",
                            "pdf",
                            "jpg",
                            "png",
                            "jpeg",
                        ]
                    )
                ],
                verbose_name="Документ",
            ),
        ),
        migrations.AddField(
            model_name="reward",
            name="file",
            field=models.FileField(
                blank=True,
                default=None,
                null=True,
                upload_to="employees/%(class)s/",
                validators=[
                    django.core.validators.FileExtensionValidator(
                        allowed_extensions=[
                            "doc",
                            "docx",
                            "xlsx",
                            "xls",
                            "csv",
                            "pdf",
                            "jpg",
                            "png",
                            "jpeg",
                        ]
                    )
                ],
                verbose_name="Документ",
            ),
        ),
        migrations.AddField(
            model_name="sport",
            name="file",
            field=models.FileField(
                blank=True,
                default=None,
                null=True,
                upload_to="employees/%(class)s/",
                validators=[
                    django.core.validators.FileExtensionValidator(
                        allowed_extensions=[
                            "doc",
                            "docx",
                            "xlsx",
                            "xls",
                            "csv",
                            "pdf",
                            "jpg",
                            "png",
                            "jpeg",
                        ]
                    )
                ],
                verbose_name="Документ",
            ),
        ),
        migrations.AddField(
            model_name="training",
            name="file",
            field=models.FileField(
                blank=True,
                default=None,
                null=True,
                upload_to="employees/%(class)s/",
                validators=[
                    django.core.validators.FileExtensionValidator(
                        allowed_extensions=[
                            "doc",
                            "docx",
                            "xlsx",
                            "xls",
                            "csv",
                            "pdf",
                            "jpg",
                            "png",
                            "jpeg",
                        ]
                    )
                ],
                verbose_name="Документ",
            ),
        ),
        migrations.AddField(
            model_name="victory",
            name="file",
            field=models.FileField(
                blank=True,
                default=None,
                null=True,
                upload_to="employees/%(class)s/",
                validators=[
                    django.core.validators.FileExtensionValidator(
                        allowed_extensions=[
                            "doc",
                            "docx",
                            "xlsx",
                            "xls",
                            "csv",
                            "pdf",
                            "jpg",
                            "png",
                            "jpeg",
                        ]
                    )
                ],
                verbose_name="Документ",
            ),
        ),
        migrations.AddField(
            model_name="volunteer",
            name="file",
            field=models.FileField(
                blank=True,
                default=None,
                null=True,
                upload_to="employees/%(class)s/",
                validators=[
                    django.core.validators.FileExtensionValidator(
                        allowed_extensions=[
                            "doc",
                            "docx",
                            "xlsx",
                            "xls",
                            "csv",
                            "pdf",
                            "jpg",
                            "png",
                            "jpeg",
                        ]
                    )
                ],
                verbose_name="Документ",
            ),
        ),
        migrations.CreateModel(
            name="Diploma",
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
                    "file",
                    models.FileField(
                        blank=True,
                        default=None,
                        null=True,
                        upload_to="employees/%(class)s/",
                        validators=[
                            django.core.validators.FileExtensionValidator(
                                allowed_extensions=[
                                    "doc",
                                    "docx",
                                    "xlsx",
                                    "xls",
                                    "csv",
                                    "pdf",
                                    "jpg",
                                    "png",
                                    "jpeg",
                                ]
                            )
                        ],
                        verbose_name="Документ",
                    ),
                ),
                ("date", models.DateField(verbose_name="Дата получения диплома")),
                (
                    "characteristic",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="%(class)ss",
                        to="employees.characteristic",
                        verbose_name="Сотрудник",
                    ),
                ),
            ],
            options={
                "verbose_name": "диплом",
                "verbose_name_plural": "дипломы",
            },
        ),
    ]
