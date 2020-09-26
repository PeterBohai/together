# Generated by Django 3.1.1 on 2020-09-23 17:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('togetherapp', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='RelationshipTip',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200)),
                ('content', models.TextField()),
                ('shown', models.BooleanField(default=False)),
                ('category', models.CharField(choices=[('INF', 'Information'), ('COM', 'Communication'), ('SEX', 'Sex'), ('EMT', 'Emotional'), ('REC', 'Recreation'), ('RES', 'Responsibility')], default='INF', max_length=3)),
            ],
        ),
    ]
