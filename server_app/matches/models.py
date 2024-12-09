# matches/models.py

from django.db import models
from teams.models import Team, Player
from tournaments.models import Tournament
from django.utils import timezone

class Match(models.Model):
    """
    Modelo que representa un partido de voleibol.
    
    Este modelo maneja toda la información relacionada con un partido,
    incluyendo equipos participantes, puntuación, estado y ubicación.
    
    Attributes:
        tournament (Tournament): Torneo al que pertenece el partido
        team_a (Team): Primer equipo
        team_b (Team): Segundo equipo
        scheduled_date (datetime): Fecha y hora programada
        location (str): Ubicación del partido
        latitude (float): Latitud para información del clima
        longitude (float): Longitud para información del clima
        weather_info (json): Información del clima en formato JSON
        status (str): Estado actual del partido
        start_time (datetime): Hora de inicio real
        end_time (datetime): Hora de finalización
        team_a_sets_won (int): Sets ganados por equipo A
        team_b_sets_won (int): Sets ganados por equipo B
        team_a_timeouts (int): Tiempos fuera usados por equipo A
        team_b_timeouts (int): Tiempos fuera usados por equipo B
    """

    STATUS_CHOICES = [
        ('upcoming', 'Próximamente'),
        ('live', 'En Vivo'),
        ('finished', 'Finalizado'),
        ('suspended', 'Suspendido'),
        ('rescheduled', 'Reprogramado'),
    ]

    tournament = models.ForeignKey(
        Tournament, 
        on_delete=models.CASCADE, 
        related_name="matches",
        help_text="Torneo al que pertenece el partido"
    )
    team_a = models.ForeignKey(
        Team, 
        on_delete=models.CASCADE, 
        related_name="matches_as_team_a",
        help_text="Primer equipo del partido"
    )
    team_b = models.ForeignKey(
        Team, 
        on_delete=models.CASCADE, 
        related_name="matches_as_team_b",
        help_text="Segundo equipo del partido"
    )
    scheduled_date = models.DateTimeField(
        help_text="Fecha y hora programada para el partido"
    )
    location = models.CharField(
        max_length=255,
        help_text="Ubicación donde se jugará el partido"
    )
    latitude = models.FloatField(
        null=True, 
        blank=True,
        help_text="Latitud para obtener información del clima"
    )
    longitude = models.FloatField(
        null=True, 
        blank=True,
        help_text="Longitud para obtener información del clima"
    )
    weather_info = models.JSONField(
        null=True, 
        blank=True,
        help_text="Información del clima en formato JSON"
    )
    status = models.CharField(
        max_length=20, 
        choices=STATUS_CHOICES, 
        default='upcoming',
        help_text="Estado actual del partido"
    )
    start_time = models.DateTimeField(
        null=True, 
        blank=True,
        help_text="Hora real de inicio del partido"
    )
    end_time = models.DateTimeField(
        null=True, 
        blank=True,
        help_text="Hora de finalización del partido"
    )
    team_a_sets_won = models.PositiveIntegerField(
        default=0,
        help_text="Número de sets ganados por el equipo A"
    )
    team_b_sets_won = models.PositiveIntegerField(
        default=0,
        help_text="Número de sets ganados por el equipo B"
    )
    team_a_timeouts = models.PositiveIntegerField(
        default=0,
        help_text="Tiempos fuera utilizados por el equipo A"
    )
    team_b_timeouts = models.PositiveIntegerField(
        default=0,
        help_text="Tiempos fuera utilizados por el equipo B"
    )
    max_timeouts_per_set = 2
    max_substitutions_per_set = 6

    def start_match(self):
        """
        Inicia el partido cambiando su estado a 'live' y creando el primer set.
        
        Raises:
            ValueError: Si el partido no está en estado 'upcoming'
        """
        if self.status == 'upcoming':
            self.status = 'live'
            self.start_time = timezone.now()
            self.save()
            Set.objects.create(match=self, set_number=1)
        else:
            raise ValueError("El partido debe estar en 'upcoming' para iniciar.")

    def check_set_completion(self, set_instance):
        """
        Verifica si un set ha terminado basado en las reglas del voleibol.
        
        Args:
            set_instance (Set): Instancia del set a verificar
        """
        if set_instance.set_number < 5:  # Sets normales
            if ((set_instance.team_a_points >= 25 or set_instance.team_b_points >= 25) and 
                    abs(set_instance.team_a_points - set_instance.team_b_points) >= 2):
                self.update_set_winner(set_instance)
        elif set_instance.set_number == 5:  # Set decisivo
            if ((set_instance.team_a_points >= 15 or set_instance.team_b_points >= 15) and 
                    abs(set_instance.team_a_points - set_instance.team_b_points) >= 2):
                self.update_set_winner(set_instance)

        if set_instance.completed:
            if self.team_a_sets_won < 3 and self.team_b_sets_won < 3:
                self.start_next_set()
            else:
                self.status = 'finished'
                self.save()

    def start_next_set(self):
        """Inicia el siguiente set si el partido aún no ha terminado."""
        if self.status == 'live' and self.team_a_sets_won < 3 and self.team_b_sets_won < 3:
            next_set_number = self.sets.count() + 1
            Set.objects.create(match=self, set_number=next_set_number)

    def update_set_winner(self, set_instance):
        """
        Actualiza el ganador del set y el conteo de sets ganados.
        
        Args:
            set_instance (Set): Set que ha terminado
        """
        if set_instance.team_a_points > set_instance.team_b_points:
            self.team_a_sets_won += 1
        else:
            self.team_b_sets_won += 1
        set_instance.completed = True
        set_instance.save()
        self.save()

    def __str__(self):
        return f"{self.team_a.name} vs {self.team_b.name} - {self.status}"

    class Meta:
        verbose_name = "Partido"
        verbose_name_plural = "Partidos"
        ordering = ['-scheduled_date']


class Set(models.Model):
    """
    Modelo que representa un set dentro de un partido.
    
    Attributes:
        match (Match): Partido al que pertenece el set
        set_number (int): Número de set
        team_a_points (int): Puntos del equipo A
        team_b_points (int): Puntos del equipo B
        completed (bool): Indica si el set ha terminado
        team_a_substitutions (int): Sustituciones usadas por equipo A
        team_b_substitutions (int): Sustituciones usadas por equipo B
    """
    
    match = models.ForeignKey(
        Match, 
        on_delete=models.CASCADE, 
        related_name="sets",
        help_text="Partido al que pertenece este set"
    )
    set_number = models.PositiveIntegerField(
        help_text="Número de set dentro del partido"
    )
    team_a_points = models.PositiveIntegerField(
        default=0,
        help_text="Puntos anotados por el equipo A"
    )
    team_b_points = models.PositiveIntegerField(
        default=0,
        help_text="Puntos anotados por el equipo B"
    )
    completed = models.BooleanField(
        default=False,
        help_text="Indica si el set ha terminado"
    )
    team_a_substitutions = models.PositiveIntegerField(
        default=0,
        help_text="Número de sustituciones realizadas por el equipo A"
    )
    team_b_substitutions = models.PositiveIntegerField(
        default=0,
        help_text="Número de sustituciones realizadas por el equipo B"
    )

    def add_points(self, team, points):
        """
        Añade puntos al equipo especificado.
        
        Args:
            team (str): 'A' o 'B' indicando el equipo
            points (int): Cantidad de puntos a añadir
        """
        if not self.completed:
            if team == 'A':
                self.team_a_points += points
            elif team == 'B':
                self.team_b_points += points
            self.save()
            self.match.check_set_completion(self)

    def use_timeout(self, team):
        """
        Registra un tiempo fuera para el equipo especificado.
        
        Args:
            team (str): 'A' o 'B' indicando el equipo
        """
        if team == 'A' and self.match.team_a_timeouts < self.match.max_timeouts_per_set:
            self.match.team_a_timeouts += 1
            self.match.save()
        elif team == 'B' and self.match.team_b_timeouts < self.match.max_timeouts_per_set:
            self.match.team_b_timeouts += 1
            self.match.save()

    def use_substitution(self, team):
        """
        Registra una sustitución para el equipo especificado.
        
        Args:
            team (str): 'A' o 'B' indicando el equipo
        """
        if team == 'A' and self.team_a_substitutions < self.match.max_substitutions_per_set:
            self.team_a_substitutions += 1
            self.save()
        elif team == 'B' and self.team_b_substitutions < self.match.max_substitutions_per_set:
            self.team_b_substitutions += 1
            self.save()

    def __str__(self):
        return f"Set {self.set_number} - {self.match}"

    class Meta:
        verbose_name = "Set"
        verbose_name_plural = "Sets"
        ordering = ['match', 'set_number']


class PlayerPerformance(models.Model):
    """
    Modelo que registra el rendimiento de un jugador en un set específico.
    
    Attributes:
        set (Set): Set en el que se registra el rendimiento
        player (Player): Jugador evaluado
        points (int): Puntos anotados
        assists (int): Asistencias realizadas
        blocks (int): Bloqueos efectivos
        aces (int): Servicios directos
    """
    
    set = models.ForeignKey(
        Set, 
        on_delete=models.CASCADE,
        related_name="performances",
        help_text="Set en el que se registra el rendimiento"
    )
    player = models.ForeignKey(
        Player, 
        on_delete=models.CASCADE, 
        related_name="performances",
        help_text="Jugador al que pertenece este registro"
    )
    points = models.PositiveIntegerField(
        default=0,
        help_text="Puntos anotados por el jugador"
    )
    assists = models.PositiveIntegerField(
        default=0,
        help_text="Asistencias realizadas"
    )
    blocks = models.PositiveIntegerField(
        default=0,
        help_text="Bloqueos efectivos"
    )
    aces = models.PositiveIntegerField(
        default=0,
        help_text="Servicios directos"
    )

    def __str__(self):
        return f"{self.player.name} - Set {self.set.set_number} - {self.set.match}"

    class Meta:
        verbose_name = "Rendimiento de Jugador"
        verbose_name_plural = "Rendimientos de Jugadores"
        ordering = ['set', 'player']