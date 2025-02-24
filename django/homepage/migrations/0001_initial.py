# Generated by Django 4.2.18 on 2025-02-22 09:06

from django.conf import settings
import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('employees', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Poll',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_published', models.BooleanField(default=True, help_text='Снимите галочку, чтобы скрыть публикацию.', verbose_name='Опубликовано')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Добавлено')),
                ('is_anonymous', models.BooleanField(default=False, verbose_name='Анонимный опрос')),
                ('is_multiple_choice', models.BooleanField(default=False, verbose_name='Несколько вариантов ответа')),
                ('question_text', models.CharField(max_length=256, verbose_name='Текст опроса')),
                ('pub_date', models.DateTimeField(help_text='Если установить дату и время в будущем — можно делать отложенные публикации.', verbose_name='Дата и время публикации')),
                ('organization', models.ManyToManyField(blank=True, default=None, null=True, to='employees.organization', verbose_name='Организация')),
            ],
            options={
                'verbose_name': 'Объект "Опрос"',
                'verbose_name_plural': 'Объекты "Опросы"',
            },
        ),
        migrations.CreateModel(
            name='News',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('is_published', models.BooleanField(default=True, help_text='Снимите галочку, чтобы скрыть публикацию.', verbose_name='Опубликовано')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Добавлено')),
                ('title', models.CharField(max_length=256, verbose_name='Заголовок')),
                ('text', models.TextField(blank=True, verbose_name='Текст')),
                ('video', models.FileField(blank=True, default=None, null=True, upload_to='videos_uploaded', validators=[django.core.validators.FileExtensionValidator(allowed_extensions=['MOV', 'avi', 'mp4', 'webm', 'mkv'])], verbose_name='Видео')),
                ('pub_date', models.DateTimeField(help_text='Если установить дату и время в будущем — можно делать отложенные публикации.', verbose_name='Дата и время публикации')),
                ('organization', models.ManyToManyField(default=None, null=True, to='employees.organization', verbose_name='Организация')),
            ],
            options={
                'verbose_name': 'объект новости',
                'verbose_name_plural': 'объекты "Новости"',
            },
        ),
        migrations.CreateModel(
            name='Choice',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('choice_text', models.CharField(max_length=256, verbose_name='Текст вопроса')),
                ('poll', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='choices', to='homepage.poll', verbose_name='Опрос')),
                ('voted', models.ManyToManyField(blank=True, related_name='chose', to=settings.AUTH_USER_MODEL, verbose_name='Выбрали этот вариант')),
            ],
            options={
                'verbose_name': 'запись варианта опроса',
                'verbose_name_plural': 'записи вариантов опроса',
            },
        ),
        migrations.CreateModel(
            name='Attachment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('image', models.ImageField(upload_to='news_images/', verbose_name='Attachment')),
                ('publication', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='attachments', to='homepage.news', verbose_name='Вложение')),
            ],
            options={
                'verbose_name': 'объект вложения',
                'verbose_name_plural': 'объекты вложений',
            },
        ),
    ]
