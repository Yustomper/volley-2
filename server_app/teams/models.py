# teams/models.py

from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

class Team(models.Model):
    """
    Modelo que representa un equipo de voleibol.
    
    Este modelo almacena la información básica de un equipo, incluyendo su nombre,
    género, entrenador y personal adicional.

    Attributes:
        name (str): Nombre único del equipo
        gender (str): Género del equipo ('M' para masculino, 'F' para femenino)
        coach (str): Nombre del entrenador principal
        staff (str): Información adicional sobre el personal del equipo
        created_by (User): Usuario que creó el registro del equipo
    """
    
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
    ]

    name = models.CharField(
        max_length=100, 
        unique=True,
        help_text="Nombre único del equipo"
    )
    gender = models.CharField(
        max_length=1, 
        choices=GENDER_CHOICES,
        help_text="Género del equipo (M: Masculino, F: Femenino)"
    )
    coach = models.CharField(
        max_length=100,
        help_text="Nombre del entrenador principal"
    )
    staff = models.TextField(
        blank=True, 
        help_text="Información adicional sobre el personal del equipo"
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Usuario que creó el registro del equipo"
    )

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Equipo"
        verbose_name_plural = "Equipos"
        ordering = ['name']

class Player(models.Model):
    """
    Modelo que representa un jugador de voleibol.
    
    Este modelo maneja la información de los jugadores, incluyendo su asignación a un equipo,
    información personal y estado actual. Incluye lógica para asignar avatares automáticamente
    basados en el género del equipo y validaciones para mantener la consistencia de género.

    Attributes:
        team (Team): Equipo al que pertenece el jugador
        name (str): Nombre completo del jugador
        jersey_number (int): Número de camiseta del jugador
        position (str): Posición en la que juega
        is_starter (bool): Indica si el jugador es titular
        status (str): Estado actual del jugador
        avatar (str): URL del avatar del jugador

    Validations:
        - El avatar debe coincidir con el género del equipo
        - Se asigna automáticamente un avatar por defecto basado en el género si no se proporciona uno
    """

    POSITION_CHOICES = [
        ('CE', 'Central'),
        ('PR', 'Punta Receptor'),
        ('AR', 'Armador'),
        ('OP', 'Opuesto'),
        ('LI', 'Líbero'),
    ]

    # Avatares por defecto según el género
    DEFAULT_AVATAR_MALE = "https://cdn.icon-icons.com/icons2/2643/PNG/512/male_boy_person_people_avatar_icon_159358.png"
    DEFAULT_AVATAR_FEMALE = "https://cdn.icon-icons.com/icons2/2643/PNG/512/female_woman_person_people_avatar_icon_159366.png"

    team = models.ForeignKey(
        Team, 
        on_delete=models.CASCADE, 
        related_name='players',
        help_text="Equipo al que pertenece el jugador"
    )
    name = models.CharField(
        max_length=100,
        help_text="Nombre completo del jugador"
    )
    jersey_number = models.PositiveIntegerField(
        help_text="Número de camiseta del jugador"
    )
    position = models.CharField(
        max_length=2, 
        choices=POSITION_CHOICES,
        help_text="Posición en la que juega el jugador"
    )
    is_starter = models.BooleanField(
        default=False,
        help_text="Indica si el jugador es titular"
    )
    status = models.CharField(
        max_length=50, 
        default="Active",
        help_text="Estado actual del jugador (Activo, Lesionado, etc.)"
    )
    avatar = models.URLField(
        blank=True, 
        null=True,
        help_text="URL del avatar del jugador. Si no se proporciona, se asignará uno por defecto según el género del equipo"
    )

    def save(self, *args, **kwargs):
        """
        Sobreescribe el método save para manejar la asignación automática de avatares
        y realizar validaciones antes de guardar el jugador.
        """
        # Asigna un avatar por defecto basado en el género del equipo si no se ha proporcionado uno
        if not self.avatar:
            if self.team.gender == 'M':
                self.avatar = self.DEFAULT_AVATAR_MALE
            elif self.team.gender == 'F':
                self.avatar = self.DEFAULT_AVATAR_FEMALE

        # Llamar a la validación personalizada antes de guardar
        self.clean()
        super().save(*args, **kwargs)

    def clean(self):
        """
        Realiza validaciones personalizadas para asegurar la consistencia de género
        entre el jugador y su equipo.

        Raises:
            ValidationError: Si el avatar del jugador no coincide con el género del equipo.
        """
        if self.team.gender == 'M' and self.avatar == self.DEFAULT_AVATAR_FEMALE:
            raise ValidationError("No puedes agregar un jugador femenino a un equipo masculino.")
        if self.team.gender == 'F' and self.avatar == self.DEFAULT_AVATAR_MALE:
            raise ValidationError("No puedes agregar un jugador masculino a un equipo femenino.")
    
    def __str__(self):
        return f"{self.name} - {self.team.name}"

    class Meta:
        verbose_name = "Jugador"
        verbose_name_plural = "Jugadores"
        ordering = ['team', 'name']
        unique_together = [['team', 'jersey_number']]  # Asegura números únicos por equipo