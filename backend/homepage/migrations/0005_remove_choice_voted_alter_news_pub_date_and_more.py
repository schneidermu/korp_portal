# Generated by Django 4.2.8 on 2024-04-17 07:13

import datetime
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('homepage', '0004_alter_news_pub_date_alter_poll_pub_date'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='choice',
            name='voted',
        ),
        migrations.AlterField(
            model_name='news',
            name='pub_date',
            field=models.DateTimeField(default=datetime.datetime(2024, 4, 17, 10, 13, 34, 777972), help_text='Если установить дату и время в будущем — можно делать отложенные публикации.', verbose_name='Дата и время публикации'),
        ),
        migrations.AlterField(
            model_name='poll',
            name='pub_date',
            field=models.DateTimeField(default=datetime.datetime(2024, 4, 17, 10, 13, 34, 777972), help_text='Если установить дату и время в будущем — можно делать отложенные публикации.', verbose_name='Дата и время публикации'),
        ),
        migrations.AddField(
            model_name='choice',
            name='voted',
            field=models.ManyToManyField(blank=True, related_name='chose', to=settings.AUTH_USER_MODEL, verbose_name='Выбрали этот вариант'),
        ),
    ]
