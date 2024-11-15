# Generated by Django 5.1.3 on 2024-11-08 03:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('matches', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='match',
            name='latitude',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='match',
            name='longitude',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='match',
            name='weather_info',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='match',
            name='location',
            field=models.CharField(max_length=255),
        ),
    ]
