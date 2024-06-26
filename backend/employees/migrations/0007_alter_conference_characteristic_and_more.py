# Generated by Django 4.2.8 on 2024-04-26 08:58

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('employees', '0006_alter_career_characteristic_and_more'),
    ]

    operations = [
        migrations.AlterField(
            model_name='conference',
            name='characteristic',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)ss', to='employees.characteristic', verbose_name='Сотрудник'),
        ),
        migrations.AlterField(
            model_name='hobby',
            name='characteristic',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)ss', to='employees.characteristic', verbose_name='Сотрудник'),
        ),
        migrations.AlterField(
            model_name='performance',
            name='characteristic',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)ss', to='employees.characteristic', verbose_name='Сотрудник'),
        ),
        migrations.AlterField(
            model_name='reward',
            name='characteristic',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)ss', to='employees.characteristic', verbose_name='Сотрудник'),
        ),
        migrations.AlterField(
            model_name='sport',
            name='characteristic',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)ss', to='employees.characteristic', verbose_name='Сотрудник'),
        ),
        migrations.AlterField(
            model_name='training',
            name='characteristic',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)ss', to='employees.characteristic', verbose_name='Сотрудник'),
        ),
        migrations.AlterField(
            model_name='victory',
            name='characteristic',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)ss', to='employees.characteristic', verbose_name='Сотрудник'),
        ),
        migrations.AlterField(
            model_name='volunteer',
            name='characteristic',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='%(class)ss', to='employees.characteristic', verbose_name='Сотрудник'),
        ),
    ]
