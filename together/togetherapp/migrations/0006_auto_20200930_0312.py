# Generated by Django 3.1.1 on 2020-09-30 03:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('togetherapp', '0005_auto_20200930_0311'),
    ]

    operations = [
        migrations.AlterField(
            model_name='room',
            name='canvasDataURL',
            field=models.TextField(blank=True, default=' '),
        ),
    ]
