# matches/serializers.py

from rest_framework import serializers
from .models import Match, PlayerPerformance, Set
from teams.models import Player, Team
from tournaments.models import Tournament

class PlayerSerializer(serializers.ModelSerializer):
    """
    Serializer para información básica de jugadores.
    
    Utilizado para mostrar información de jugadores en el contexto
    de partidos y rendimiento.
    """
    class Meta:
        model = Player
        fields = ['id', 'name', 'jersey_number', 'position', 'is_starter', 'status']

class TeamSerializer(serializers.ModelSerializer):
    """
    Serializer para información básica de equipos.
    
    Utilizado cuando solo se necesita información básica del equipo
    sin incluir la lista de jugadores.
    """
    class Meta:
        model = Team
        fields = ['id', 'name']

class TeamWithPlayersSerializer(serializers.ModelSerializer):
    """
    Serializer extendido para equipos que incluye la lista de jugadores.
    
    Utilizado en vistas detalladas de partidos donde se necesita
    información completa del equipo y sus jugadores.
    """
    players = PlayerSerializer(many=True, read_only=True)
    
    class Meta:
        model = Team
        fields = ['id', 'name', 'players']

class TournamentSerializer(serializers.ModelSerializer):
    """
    Serializer para información básica de torneos.
    
    Utilizado en el contexto de partidos para mostrar
    información del torneo al que pertenecen.
    """
    class Meta:
        model = Tournament
        fields = ['id', 'name']

class PlayerPerformanceDetailSerializer(serializers.ModelSerializer):
    """
    Serializer para mostrar el rendimiento detallado de un jugador.
    
    Incluye el nombre del jugador junto con sus estadísticas
    en un set específico.
    """
    player_name = serializers.CharField(
        source='player.name',
        read_only=True,
        help_text="Nombre del jugador"
    )

    class Meta:
        model = PlayerPerformance
        fields = ['player', 'player_name', 'points', 'aces', 'assists', 'blocks']

class SetDetailSerializer(serializers.ModelSerializer):
    """
    Serializer para mostrar información detallada de un set.
    
    Incluye puntuación, estado y rendimiento de todos los
    jugadores participantes.
    """
    performances = PlayerPerformanceDetailSerializer(
        many=True,
        read_only=True,
        help_text="Rendimiento de jugadores en este set"
    )

    class Meta:
        model = Set
        fields = ['set_number', 'team_a_points', 'team_b_points', 'completed', 'performances']

class MatchDetailSerializer(serializers.ModelSerializer):
    """
    Serializer para vista detallada de un partido.
    
    Proporciona información completa del partido incluyendo:
    - Información de equipos con sus jugadores
    - Detalles de todos los sets
    - Estadísticas y puntuaciones
    """
    sets = SetDetailSerializer(
        many=True,
        read_only=True,
        help_text="Sets jugados en este partido"
    )
    team_a = TeamWithPlayersSerializer(
        read_only=True,
        help_text="Primer equipo con lista de jugadores"
    )
    team_b = TeamWithPlayersSerializer(
        read_only=True,
        help_text="Segundo equipo con lista de jugadores"
    )
    tournament = TournamentSerializer(
        read_only=True,
        help_text="Torneo al que pertenece el partido"
    )

    class Meta:
        model = Match
        fields = [
            'id', 'tournament', 'team_a', 'team_b', 'scheduled_date',
            'location', 'latitude', 'longitude', 'weather_info',
            'status', 'start_time', 'end_time',
            'team_a_sets_won', 'team_b_sets_won', 'sets'
        ]

class MatchSerializer(serializers.ModelSerializer):
    """
    Serializer para operaciones básicas de partidos.
    
    Maneja la creación y actualización de partidos con validación
    de IDs de equipos y torneo. Separa los campos de escritura y lectura
    para mejor manejo de datos.
    
    Fields de escritura:
        team_a_id: ID del primer equipo
        team_b_id: ID del segundo equipo
        tournament_id: ID del torneo
        
    Fields de lectura:
        team_a: Información básica del primer equipo
        team_b: Información básica del segundo equipo
        tournament: Información básica del torneo
    """
    team_a_id = serializers.PrimaryKeyRelatedField(
        queryset=Team.objects.all(),
        source='team_a',
        write_only=True,
        help_text="ID del primer equipo"
    )
    team_b_id = serializers.PrimaryKeyRelatedField(
        queryset=Team.objects.all(),
        source='team_b',
        write_only=True,
        help_text="ID del segundo equipo"
    )
    tournament_id = serializers.PrimaryKeyRelatedField(
        queryset=Tournament.objects.all(),
        source='tournament',
        write_only=True,
        help_text="ID del torneo"
    )
    team_a = TeamSerializer(read_only=True)
    team_b = TeamSerializer(read_only=True)
    tournament = TournamentSerializer(read_only=True)

    class Meta:
        model = Match
        fields = [
            'id', 'tournament_id', 'tournament', 
            'team_a_id', 'team_b_id', 'team_a', 'team_b',
            'scheduled_date', 'location', 'latitude', 'longitude', 
            'status', 'start_time', 'end_time',
            'team_a_sets_won', 'team_b_sets_won'
        ]

    def validate(self, data):
        """
        Validación personalizada para la creación/actualización de partidos.
        
        Validates:
            - Equipos diferentes
            - Fecha válida
            - Ubicación válida si se proporcionan coordenadas
        """
        if data.get('team_a') == data.get('team_b'):
            raise serializers.ValidationError(
                "Los equipos del partido deben ser diferentes"
            )
        return data

class PlayerPerformanceSerializer(serializers.Serializer):
    """
    Serializer para registrar el rendimiento de jugadores.
    
    Maneja la actualización de estadísticas de jugadores
    durante un partido, incluyendo puntos, aces, asistencias y bloqueos.
    """
    player_id = serializers.IntegerField()
    points = serializers.IntegerField(default=0)
    aces = serializers.IntegerField(default=0)
    assists = serializers.IntegerField(default=0)
    blocks = serializers.IntegerField(default=0)
    set_number = serializers.IntegerField()

    def validate(self, data):
        """
        Valida que el jugador exista y los valores sean válidos.
        """
        try:
            Player.objects.get(id=data['player_id'])
        except Player.DoesNotExist:
            raise serializers.ValidationError("Player not found.")
        return data

class SubstitutePlayerSerializer(serializers.Serializer):
    """
    Serializer para manejar sustituciones de jugadores.
    
    Gestiona el proceso de sustituir un jugador por otro
    durante un partido activo.
    """
    player_in = serializers.IntegerField(
        help_text="ID del jugador que entra"
    )
    player_out = serializers.IntegerField(
        help_text="ID del jugador que sale"
    )
    team = serializers.CharField(
        max_length=1,
        help_text="Equipo que realiza la sustitución (A/B)"
    )

    def validate(self, data):
        """
        Valida que ambos jugadores existan y pertenezcan al mismo equipo.
        """
        try:
            player_in = Player.objects.get(id=data['player_in'])
            player_out = Player.objects.get(id=data['player_out'])
            if player_in.team != player_out.team:
                raise serializers.ValidationError(
                    "Players must belong to the same team."
                )
        except Player.DoesNotExist:
            raise serializers.ValidationError("Player not found.")
        return data

class TimeoutSerializer(serializers.Serializer):
    """
    Serializer para manejar tiempos fuera.
    
    Gestiona la solicitud de tiempos fuera durante un partido.
    """
    team = serializers.CharField(
        max_length=1,
        help_text="Equipo que solicita el tiempo fuera (A/B)"
    )

    def validate_team(self, value):
        """
        Valida que el identificador del equipo sea válido.
        """
        if value not in ['A', 'B']:
            raise serializers.ValidationError("Invalid team identifier.")
        return value