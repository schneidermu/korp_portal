# Generated by Django 4.2.8 on 2024-04-24 08:40

import datetime
from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("homepage", "0007_alter_news_pub_date_alter_poll_pub_date"),
    ]

    operations = [
        migrations.AlterField(
            model_name="poll",
            name="pub_date",
            field=models.DateTimeField(
                default=datetime.datetime(2024, 4, 24, 11, 38, 36, 610940),
                help_text="Если установить дату и время в будущем — можно делать отложенные публикации.",
                verbose_name="Дата и время публикации",
            ),
        ),
    ]
