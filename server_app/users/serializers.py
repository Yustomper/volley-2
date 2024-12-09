from rest_framework import serializers
from users.models import CustomUser
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import ValidationError
from django.db import IntegrityError

class UserRegisterSerializer(serializers.ModelSerializer):
    """
    Serializer para el registro de nuevos usuarios.
    
    Maneja la creación de usuarios con validación de contraseña
    y verificación de unicidad de email y username.
    
    Fields:
        username (str): Nombre de usuario único
        password (str): Contraseña (solo escritura)
        email (str): Correo electrónico único
        
    Validations:
        - Contraseña debe cumplir con los requisitos
        - Username y email deben ser únicos
    """
    
    class Meta:
        model = CustomUser
        fields = ('username', 'password', 'email')
        extra_kwargs = {
            'password': {
                'write_only': True,
                'style': {'input_type': 'password'}
            }
        }

    def validate_password(self, value):
        """
        Valida la contraseña usando las validaciones por defecto de Django.
        
        Args:
            value (str): Contraseña a validar
            
        Returns:
            str: Contraseña validada
            
        Raises:
            ValidationError: Si la contraseña no cumple con los requisitos
        """
        validate_password(value)
        return value

    def create(self, validated_data):
        """
        Crea un nuevo usuario con los datos validados.
        
        Args:
            validated_data (dict): Datos validados del usuario
            
        Returns:
            CustomUser: Nueva instancia de usuario
            
        Raises:
            ValidationError: Si el username o email ya existen
        """
        try:
            user = CustomUser.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                password=validated_data['password']
            )
            return user
        except IntegrityError:
            raise ValidationError(
                "A user with that username or email already exists.")