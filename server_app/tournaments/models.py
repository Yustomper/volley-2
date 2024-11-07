# tournaments/models.py

from django.db import models
from teams.models import Team


class Tournament(models.Model):
    name = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    location = models.CharField(max_length=200, blank=True, null=True)
    description = models.TextField(blank=True, null=True)

    # Relación de muchos a muchos con equipos
    teams = models.ManyToManyField(Team, related_name="tournaments")

    def __str__(self):
        return self.name
