# Generated by Django 4.2.8 on 2024-04-25 13:11

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('employees', '0004_remove_structuralsubdivision_positions_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='characteristic',
            name='avatar',
            field=models.ImageField(default=None, null=True, upload_to='', verbose_name='Аватар'),
        ),
    ]
