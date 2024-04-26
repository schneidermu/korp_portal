# Generated by Django 4.2.8 on 2024-04-25 12:25

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('employees', '0003_alter_structuralsubdivision_options_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='structuralsubdivision',
            name='positions',
        ),
        migrations.AddField(
            model_name='employee',
            name='structural_division',
            field=models.ForeignKey(default=1, on_delete=django.db.models.deletion.CASCADE, related_name='positions', to='employees.structuralsubdivision', verbose_name='Структурное подразделение'),
            preserve_default=False,
        ),
    ]
