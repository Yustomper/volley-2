# tournaments/serializers.py

from rest_framework import serializers
from .models import Tournament
from teams.models import Team
from teams.serializers import TeamSerializer

class TournamentSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Tournament.
    
    Maneja dos representaciones de equipos:
    - teams: Para entrada (IDs de equipos)
    - teams_detail: Para salida (información completa de equipos)
    
    Fields:
        id (int): ID del torneo
        name (str): Nombre del torneo
        start_date (date): Fecha de inicio
        end_date (date): Fecha de finalización
        location (str, optional): Ubicación
        description (str, optional): Descripción
        teams (list[int]): IDs de equipos participantes
        teams_detail (nested): Detalles de equipos (solo lectura)
    """

    # Campo para escribir - acepta IDs de equipos
    teams = serializers.PrimaryKeyRelatedField(
        queryset=Team.objects.all(),
        many=True,
        required=False,  # Hace el campo opcional en la creación
        write_only=True  # Solo se usa para escritura
    )

    # Campo para lectura - muestra detalles de equipos
    teams_detail = TeamSerializer(
        source='teams',
        many=True,
        read_only=True  # Solo se usa para lectura
    )

    class Meta:
        model = Tournament
        fields = [
            'id',
            'name',
            'start_date',
            'end_date',
            'location',
            'description',
            'teams',  # Campo para escritura
            'teams_detail'  # Campo para lectura
        ]

    def validate(self, data):
        """
        Validación personalizada para los datos del torneo.
        
        Validates:
            - Fechas válidas
            - Datos requeridos
        """
        # Validación de fechas si ambas están presentes
        if 'start_date' in data and 'end_date' in data:
            if data['start_date'] > data['end_date']:
                raise serializers.ValidationError({
                    "dates": "La fecha de inicio debe ser anterior a la fecha de fin"
                })

        return data

    def create(self, validated_data):
        """
        Crea un nuevo torneo con sus equipos asociados.
        
        Args:
            validated_data (dict): Datos validados del torneo
            
        Returns:
            Tournament: Nueva instancia del torneo
        """
        # Extraer los equipos de los datos validados
        teams_data = validated_data.pop('teams', [])
        
        # Crear el torneo
        tournament = Tournament.objects.create(**validated_data)
        
        # Asociar los equipos si existen
        if teams_data:
            tournament.teams.set(teams_data)
        
        return tournament

    def update(self, instance, validated_data):
        """
        Actualiza un torneo existente.
        
        Args:
            instance (Tournament): Instancia existente del torneo
            validated_data (dict): Datos validados para actualizar
            
        Returns:
            Tournament: Instancia actualizada del torneo
        """
        # Extraer los equipos de los datos validados
        teams_data = validated_data.pop('teams', None)
        
        # Actualizar los campos básicos
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
            
        # Actualizar los equipos si se proporcionaron
        if teams_data is not None:
            instance.teams.set(teams_data)
            
        instance.save()
        return instance

    def to_representation(self, instance):
        """
        Personaliza la representación del torneo en la respuesta.
        
        Args:
            instance (Tournament): Instancia del torneo
            
        Returns:
            dict: Representación personalizada del torneo
        """
        representation = super().to_representation(instance)
        
        # Asegurar que teams_detail esté presente incluso si está vacío
        if 'teams_detail' not in representation:
            representation['teams_detail'] = []
            
        return representation