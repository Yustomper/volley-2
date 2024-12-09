from django.db import models
from teams.models import Team

class Tournament(models.Model):
    """
    Modelo que representa un torneo de voleibol.
    
    Este modelo gestiona la información básica de los torneos y su relación
    con los equipos participantes.
    
    Attributes:
        name (str): Nombre del torneo
        start_date (date): Fecha de inicio del torneo
        end_date (date): Fecha de finalización del torneo
        location (str, optional): Ubicación donde se realiza el torneo
        description (str, optional): Descripción detallada del torneo
        teams (ManyToMany): Equipos participantes en el torneo
    """
    
    name = models.CharField(
        max_length=100,
        help_text="Nombre del torneo"
    )
    start_date = models.DateField(
        help_text="Fecha de inicio del torneo"
    )
    end_date = models.DateField(
        help_text="Fecha de finalización del torneo"
    )
    location = models.CharField(
        max_length=200,
        blank=True,
        null=True,
        help_text="Ubicación donde se realiza el torneo"
    )
    description = models.TextField(
        blank=True,
        null=True,
        help_text="Descripción detallada del torneo"
    )
    teams = models.ManyToManyField(
        Team,
        related_name="tournaments",
        help_text="Equipos participantes en el torneo"
    )

    def __str__(self):
        return self.name

    def clean(self):
        """
        Realiza validaciones personalizadas para el modelo.
        
        Validates:
            - La fecha de inicio debe ser anterior a la fecha de fin
            - Las fechas no deben estar en el pasado
        """
        from django.core.exceptions import ValidationError
        from django.utils.timezone import now
        
        if self.start_date and self.end_date and self.start_date > self.end_date:
            raise ValidationError("La fecha de inicio debe ser anterior a la fecha de fin")
        
        if self.start_date and self.start_date < now().date():
            raise ValidationError("La fecha de inicio no puede estar en el pasado")

    class Meta:
        verbose_name = "Torneo"
        verbose_name_plural = "Torneos"
        ordering = ['-start_date', 'name']