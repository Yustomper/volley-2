# teams/models.py

from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

class Team(models.Model):
    GENDER_CHOICES = [
        ('M', 'Male'),
        ('F', 'Female'),
    ]

    name = models.CharField(max_length=100, unique=True)
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    coach = models.CharField(max_length=100)
    staff = models.TextField(blank=True, help_text="Additional staff details")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.name

class Player(models.Model):
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

    team = models.ForeignKey('Team', on_delete=models.CASCADE, related_name="players")
    name = models.CharField(max_length=100)
    jersey_number = models.PositiveIntegerField()
    position = models.CharField(max_length=2, choices=POSITION_CHOICES)
    is_starter = models.BooleanField(default=False)
    status = models.CharField(max_length=50, default="Active")
    avatar = models.URLField(blank=True, null=True)  # Deja en blanco o nulo para asignar el avatar predeterminado

    def save(self, *args, **kwargs):


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
        # Validar que el avatar coincida con el género del equipo
        if self.team.gender == 'M' and self.avatar == self.DEFAULT_AVATAR_FEMALE:
            raise ValidationError("No puedes agregar un jugador femenino a un equipo masculino.")
        if self.team.gender == 'F' and self.avatar == self.DEFAULT_AVATAR_MALE:
            raise ValidationError("No puedes agregar un jugador masculino a un equipo femenino.")
    
    def __str__(self):
        return f"{self.name} - {self.team.name}"
    
    
