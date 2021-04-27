# Generated by Django 3.1.1 on 2020-12-31 01:27

from django.db import migrations, models
import django.db.models.deletion
import togetherapp.models


class Migration(migrations.Migration):

    dependencies = [
        ('togetherapp', '0011_quizanswer_quizquestion'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='room',
            field=models.ForeignKey(default=togetherapp.models.get_default_room_pk, on_delete=django.db.models.deletion.CASCADE, related_name='participants', to='togetherapp.room'),
        ),
    ]
