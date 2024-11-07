# Generated by Django 5.1.3 on 2024-11-06 20:31

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('teams', '0002_rename_health_status_player_status_and_more'),
        ('tournaments', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Match',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('scheduled_date', models.DateTimeField()),
                ('location', models.CharField(max_length=200)),
                ('status', models.CharField(choices=[('upcoming', 'Próximamente'), ('live', 'En Vivo'), ('finished', 'Finalizado'), ('suspended', 'Suspendido'), ('rescheduled', 'Reprogramado')], default='upcoming', max_length=20)),
                ('start_time', models.DateTimeField(blank=True, null=True)),
                ('end_time', models.DateTimeField(blank=True, null=True)),
                ('team_a_sets_won', models.PositiveIntegerField(default=0)),
                ('team_b_sets_won', models.PositiveIntegerField(default=0)),
                ('team_a_timeouts', models.PositiveIntegerField(default=0)),
                ('team_b_timeouts', models.PositiveIntegerField(default=0)),
                ('team_a', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='matches_as_team_a', to='teams.team')),
                ('team_b', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='matches_as_team_b', to='teams.team')),
                ('tournament', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='matches', to='tournaments.tournament')),
            ],
        ),
        migrations.CreateModel(
            name='Set',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('set_number', models.PositiveIntegerField()),
                ('team_a_points', models.PositiveIntegerField(default=0)),
                ('team_b_points', models.PositiveIntegerField(default=0)),
                ('completed', models.BooleanField(default=False)),
                ('team_a_substitutions', models.PositiveIntegerField(default=0)),
                ('team_b_substitutions', models.PositiveIntegerField(default=0)),
                ('match', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='sets', to='matches.match')),
            ],
        ),
        migrations.CreateModel(
            name='PlayerPerformance',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('points', models.PositiveIntegerField(default=0)),
                ('assists', models.PositiveIntegerField(default=0)),
                ('blocks', models.PositiveIntegerField(default=0)),
                ('aces', models.PositiveIntegerField(default=0)),
                ('player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='performances', to='teams.player')),
                ('set', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='performances', to='matches.set')),
            ],
        ),
    ]
