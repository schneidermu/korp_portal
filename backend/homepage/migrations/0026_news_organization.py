# Generated by Django 4.2.8 on 2024-09-11 14:57

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):
    dependencies = [
        (
            "employees",
            "0015_remove_characteristic_university_alter_course_date_and_more",
        ),
        ("homepage", "0025_alter_news_pub_date_alter_poll_pub_date"),
    ]

    operations = [
        migrations.AddField(
            model_name="news",
            name="organization",
            field=models.ForeignKey(
                default=None,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="organization",
                to="employees.organization",
                verbose_name="Организация",
            ),
        ),
    ]
