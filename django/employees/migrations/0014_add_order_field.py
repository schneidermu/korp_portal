# Generated manually to add order field to SegmentGroup

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('employees', '0013_segmentgroup_segment_status_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='segmentgroup',
            name='order',
            field=models.IntegerField(default=0, verbose_name='Порядок сортировки'),
        ),
        migrations.AlterModelOptions(
            name='segmentgroup',
            options={'ordering': ['order', 'name'], 'verbose_name': 'Группа сегментов', 'verbose_name_plural': 'Группы сегментов'},
        ),
    ]
