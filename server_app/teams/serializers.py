from rest_framework import serializers
from .models import Team, Player


class PlayerSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Player.
    
    Este serializer maneja la serialización y deserialización de jugadores,
    incluyendo la asignación automática de avatares basada en el género del equipo.
    
    Fields:
        id (int): Identificador único del jugador
        name (str): Nombre completo del jugador
        jersey_number (int): Número de camiseta
        position (str): Posición del jugador (CE: Central, PR: Punta Receptor, 
                       AR: Armador, OP: Opuesto, LI: Líbero)
        is_starter (bool): Indica si el jugador es titular
        status (str): Estado actual del jugador (Active, Injured, etc.)
        avatar (str): URL del avatar del jugador (se asigna automáticamente basado en el género)
    """

    id = serializers.IntegerField(required=False)  # Necesario para actualizaciones parciales
    
    class Meta:
        model = Player
        fields = [
            'id',
            'name',
            'jersey_number',
            'position',
            'is_starter',
            'status',
            'avatar'
        ]
        read_only_fields = ['avatar']  # El avatar se maneja automáticamente

    def validate_jersey_number(self, value):
        """
        Valida que el número de camiseta sea positivo.
        """
        if value <= 0:
            raise serializers.ValidationError(
                "El número de camiseta debe ser positivo."
            )
        return value


class TeamSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Team.
    
    Este serializer maneja la creación y actualización de equipos junto con sus jugadores
    en una sola operación (nested serialization). Soporta operaciones CRUD completas
    para equipos y sus jugadores asociados.
    
    Fields:
        id (int): Identificador único del equipo
        name (str): Nombre del equipo (único)
        gender (str): Género del equipo (M: Masculino, F: Femenino)
        coach (str): Nombre del entrenador principal
        staff (str): Información adicional del personal
        created_by (int): ID del usuario que creó el equipo (solo lectura)
        players (list): Lista de jugadores asociados al equipo
    
    Features:
        - Creación de equipo con múltiples jugadores en una sola operación
        - Actualización parcial o completa de equipo y jugadores
        - Validaciones personalizadas para datos de equipo y jugadores
        - Manejo automático de avatares según el género del equipo
    """
    
    players = PlayerSerializer(many=True)
    created_by = serializers.ReadOnlyField(
        source='created_by.id',
        help_text="ID del usuario que creó el equipo"
    )

    class Meta:
        model = Team
        fields = [
            'id',
            'name',
            'gender',
            'coach',
            'staff',
            'created_by',
            'players'
        ]

    def validate(self, data):
        """
        Realiza validaciones a nivel de equipo.
        
        Validaciones:
        - Verifica números de camiseta únicos entre jugadores
        - Valida la consistencia del género del equipo
        """
        if 'players' in data:
            jersey_numbers = []
            for player in data['players']:
                number = player.get('jersey_number')
                if number in jersey_numbers:
                    raise serializers.ValidationError({
                        'players': f'El número de camiseta {number} está duplicado.'
                    })
                jersey_numbers.append(number)
        return data

    def create(self, validated_data):
        """
        Crea un nuevo equipo con sus jugadores asociados.
        
        Args:
            validated_data (dict): Datos validados del equipo y jugadores
            
        Returns:
            Team: Nueva instancia de equipo con sus jugadores
            
        Example:
            {
                "name": "Volleyball Stars",
                "gender": "M",
                "coach": "John Doe",
                "staff": "Assistant Coach: Jane Smith",
                "players": [
                    {
                        "name": "Player One",
                        "jersey_number": 1,
                        "position": "CE",
                        "is_starter": true
                    }
                ]
            }
        """
        players_data = validated_data.pop('players', [])
        team = Team.objects.create(**validated_data)
        
        for player_data in players_data:
            Player.objects.create(team=team, **player_data)
        
        return team

    def update(self, instance, validated_data):
        """
        Actualiza un equipo existente y sus jugadores.
        
        Este método maneja:
        - Actualización de datos básicos del equipo
        - Actualización de jugadores existentes por ID
        - Creación de nuevos jugadores
        - Eliminación de jugadores no incluidos en la actualización
        
        Args:
            instance (Team): Instancia del equipo a actualizar
            validated_data (dict): Datos validados para la actualización
            
        Returns:
            Team: Instancia del equipo actualizada
            
        Example:
            {
                "name": "Updated Team Name",
                "players": [
                    {
                        "id": 1,
                        "name": "Updated Player Name",
                        "jersey_number": 1
                    },
                    {
                        "name": "New Player",
                        "jersey_number": 2,
                        "position": "AR"
                    }
                ]
            }
        """
        players_data = validated_data.pop('players', [])

        # Actualizar campos del equipo
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Mapear jugadores existentes por ID para búsqueda rápida
        existing_players = {player.id: player for player in instance.players.all()}
        processed_ids = []

        # Procesar datos de jugadores
        for player_data in players_data:
            player_id = player_data.get('id')

            if player_id and player_id in existing_players:
                # Actualizar jugador existente
                player = existing_players[player_id]
                for attr, value in player_data.items():
                    if attr != 'id':  # No actualizar el ID
                        setattr(player, attr, value)
                player.save()
                processed_ids.append(player_id)
            else:
                # Crear nuevo jugador
                new_player = Player.objects.create(team=instance, **player_data)
                processed_ids.append(new_player.id)

        # Eliminar jugadores no incluidos en la actualización
        instance.players.exclude(id__in=processed_ids).delete()

        return instance

    def to_representation(self, instance):
        """
        Personaliza la representación del equipo en la respuesta.
        Asegura que todos los campos necesarios estén presentes.
        """
        representation = super().to_representation(instance)
        
        # Asegurar que players siempre sea una lista
        if 'players' not in representation:
            representation['players'] = []
            
        return representation