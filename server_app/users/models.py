from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    """
    Modelo personalizado de usuario que extiende el AbstractUser de Django.
    
    Este modelo agrega validación de email único mientras mantiene toda
    la funcionalidad estándar de Django User.
    
    Attributes:
        email (str): Dirección de correo electrónico única del usuario
        username (str): Nombre de usuario único (heredado de AbstractUser)
        password (str): Contraseña encriptada (heredado de AbstractUser)
    """
    
    email = models.EmailField(
        unique=True,
        help_text="Email address must be unique"
    )

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"