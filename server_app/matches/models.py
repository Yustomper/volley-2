# matches/models.py
from django.db import models
from teams.models import Team, Player
from tournaments.models import Tournament
from django.utils import timezone


class Match(models.Model):
    STATUS_CHOICES = [
        ('upcoming', 'Próximamente'),
        ('live', 'En Vivo'),
        ('finished', 'Finalizado'),
        ('suspended', 'Suspendido'),
        ('rescheduled', 'Reprogramado'),
    ]

    tournament = models.ForeignKey(
        Tournament, on_delete=models.CASCADE, related_name="matches")
    team_a = models.ForeignKey(
        Team, on_delete=models.CASCADE, related_name="matches_as_team_a")
    team_b = models.ForeignKey(
        Team, on_delete=models.CASCADE, related_name="matches_as_team_b")
    scheduled_date = models.DateTimeField()
    scheduled_date = models.DateTimeField()
    location = models.CharField(max_length=255)
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    weather_info = models.JSONField(null=True, blank=True)
    status = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='upcoming')
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    team_a_sets_won = models.PositiveIntegerField(default=0)
    team_b_sets_won = models.PositiveIntegerField(default=0)
    team_a_timeouts = models.PositiveIntegerField(default=0)
    team_b_timeouts = models.PositiveIntegerField(default=0)
    max_timeouts_per_set = 2
    max_substitutions_per_set = 6

    def start_match(self):
        if self.status == 'upcoming':
            self.status = 'live'
            self.start_time = timezone.now()
            self.save()
            # Crear el primer set
            Set.objects.create(match=self, set_number=1)
        else:
            raise ValueError(
                "El partido debe estar en 'upcoming' para iniciar.")

    def check_set_completion(self, set_instance):
        if set_instance.set_number < 5:
            if ((set_instance.team_a_points >= 25 or set_instance.team_b_points >= 25) and
                    abs(set_instance.team_a_points - set_instance.team_b_points) >= 2) or max(set_instance.team_a_points, set_instance.team_b_points) >= 30:
                self.update_set_winner(set_instance)
        elif set_instance.set_number == 5:
            if ((set_instance.team_a_points >= 15 or set_instance.team_b_points >= 15) and
                    abs(set_instance.team_a_points - set_instance.team_b_points) >= 2) or max(set_instance.team_a_points, set_instance.team_b_points) >= 20:
                self.update_set_winner(set_instance)

        # Verificar si el partido ha terminado
        if self.team_a_sets_won == 2 or self.team_b_sets_won == 2:
            self.status = 'finished'
            self.end_time = timezone.now()  # Registrar la hora de finalización
            self.save()
        elif set_instance.completed:  # Inicia el siguiente set solo si el actual ha finalizado
            self.start_next_set()

    def start_next_set(self):
        # Crear un nuevo set solo si el partido no ha terminado
        if self.status == 'live' and self.team_a_sets_won < 3 and self.team_b_sets_won < 3:
            next_set_number = self.sets.count() + 1
            Set.objects.create(match=self, set_number=next_set_number)

    def update_set_winner(self, set_instance):
        if set_instance.team_a_points > set_instance.team_b_points:
            self.team_a_sets_won += 1
        else:
            self.team_b_sets_won += 1
        set_instance.completed = True
        set_instance.save()
        self.save()  # Guardar el estado del partido después de actualizar los sets ganados

    def __str__(self):
        return f"{self.team_a.name} vs {self.team_b.name} - {self.status}"


class Set(models.Model):
    match = models.ForeignKey(
        Match, on_delete=models.CASCADE, related_name="sets")
    set_number = models.PositiveIntegerField()
    team_a_points = models.PositiveIntegerField(default=0)
    team_b_points = models.PositiveIntegerField(default=0)
    completed = models.BooleanField(default=False)
    team_a_substitutions = models.PositiveIntegerField(default=0)
    team_b_substitutions = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"Set {self.set_number} - {self.match}"

    def add_points(self, team, points):
        if not self.completed:
            if team == 'A':
                self.team_a_points += points
            elif team == 'B':
                self.team_b_points += points
            self.save()
            self.match.check_set_completion(self)

    def use_timeout(self, team):
        if team == 'A' and self.match.team_a_timeouts < self.match.max_timeouts_per_set:
            self.match.team_a_timeouts += 1
            self.match.save()
        elif team == 'B' and self.match.team_b_timeouts < self.match.max_timeouts_per_set:
            self.match.team_b_timeouts += 1
            self.match.save()

    def use_substitution(self, team):
        if team == 'A' and self.team_a_substitutions < self.match.max_substitutions_per_set:
            self.team_a_substitutions += 1
            self.save()
        elif team == 'B' and self.team_b_substitutions < self.match.max_substitutions_per_set:
            self.team_b_substitutions += 1
            self.save()


class PlayerPerformance(models.Model):
    set = models.ForeignKey(Set, on_delete=models.CASCADE,
                            related_name="performances")
    player = models.ForeignKey(
        Player, on_delete=models.CASCADE, related_name="performances")
    points = models.PositiveIntegerField(default=0)
    assists = models.PositiveIntegerField(default=0)
    blocks = models.PositiveIntegerField(default=0)
    aces = models.PositiveIntegerField(default=0)

    def __str__(self):
        return f"{self.player.name} - Set {self.set.set_number} - {self.set.match}"
