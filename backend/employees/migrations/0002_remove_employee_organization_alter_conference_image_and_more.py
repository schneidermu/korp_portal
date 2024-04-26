# Generated by Django 4.2.8 on 2024-04-25 11:36

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('employees', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='employee',
            name='organization',
        ),
        migrations.AlterField(
            model_name='conference',
            name='image',
            field=models.ImageField(default=None, null=True, upload_to='', verbose_name='Картинка'),
        ),
        migrations.AlterField(
            model_name='employee',
            name='job_title',
            field=models.CharField(blank=True, choices=[('Разработчик', 'Разработчик'), ('Руководитель', 'Руководитель')], max_length=256, null=True, verbose_name='Должность'),
        ),
        migrations.AlterField(
            model_name='hobby',
            name='image',
            field=models.ImageField(default=None, null=True, upload_to='', verbose_name='Картинка'),
        ),
        migrations.AlterField(
            model_name='performance',
            name='image',
            field=models.ImageField(default=None, null=True, upload_to='', verbose_name='Картинка'),
        ),
        migrations.AlterField(
            model_name='reward',
            name='image',
            field=models.ImageField(default=None, null=True, upload_to='', verbose_name='Картинка'),
        ),
        migrations.AlterField(
            model_name='sport',
            name='image',
            field=models.ImageField(default=None, null=True, upload_to='', verbose_name='Картинка'),
        ),
        migrations.AlterField(
            model_name='training',
            name='image',
            field=models.ImageField(default=None, null=True, upload_to='', verbose_name='Картинка'),
        ),
        migrations.AlterField(
            model_name='victory',
            name='image',
            field=models.ImageField(default=None, null=True, upload_to='', verbose_name='Картинка'),
        ),
        migrations.AlterField(
            model_name='volunteer',
            name='image',
            field=models.ImageField(default=None, null=True, upload_to='', verbose_name='Картинка'),
        ),
        migrations.CreateModel(
            name='StructuralSubdivision',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=256, verbose_name='Название')),
                ('positions', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='structural_division', to=settings.AUTH_USER_MODEL, verbose_name='Должности')),
            ],
        ),
        migrations.AlterField(
            model_name='organization',
            name='structural_division',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='organization', to='employees.structuralsubdivision', verbose_name='Структурное подразделение'),
        ),
    ]
