# matches/serializers.py
from rest_framework import serializers
from .models import Match, PlayerPerformance, Set
from teams.models import Player, Team  # Importamos Team
from tournaments.models import Tournament  # Importamos Tournament

# Serializador para rendimiento de un jugador en un set


class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'name']


class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = ['id', 'name']


class PlayerPerformanceDetailSerializer(serializers.ModelSerializer):
    player_name = serializers.CharField(source='player.name', read_only=True)

    class Meta:
        model = PlayerPerformance
        fields = ['player', 'player_name',
                  'points', 'aces', 'assists', 'blocks']


# Serializador para sets en el contexto de un partido, incluyendo rendimiento de jugadores
class SetDetailSerializer(serializers.ModelSerializer):
    performances = PlayerPerformanceDetailSerializer(many=True, read_only=True)

    class Meta:
        model = Set
        fields = ['set_number', 'team_a_points',
                  'team_b_points', 'completed', 'performances']


# Serializador principal para el partido, incluyendo sets y rendimiento detallado
class MatchDetailSerializer(serializers.ModelSerializer):
    sets = SetDetailSerializer(many=True, read_only=True)
    team_a = TeamSerializer(read_only=True)
    team_b = TeamSerializer(read_only=True)
    tournament = TournamentSerializer(read_only=True)

    class Meta:
        model = Match
        fields = [
            'id', 'tournament', 'team_a', 'team_b', 'scheduled_date',
            'location', 'latitude', 'longitude', 'weather_info',
            'status', 'start_time', 'end_time',
            'team_a_sets_won', 'team_b_sets_won', 'sets'
        ]

# Serializador básico de Match (por si necesitas uno más simple en otros endpoints)


class MatchSerializer(serializers.ModelSerializer):
    team_a_id = serializers.PrimaryKeyRelatedField(
        queryset=Team.objects.all(), source='team_a', write_only=True)
    team_b_id = serializers.PrimaryKeyRelatedField(
        queryset=Team.objects.all(), source='team_b', write_only=True)
    tournament_id = serializers.PrimaryKeyRelatedField(
        queryset=Tournament.objects.all(), source='tournament', write_only=True)
    team_a = TeamSerializer(read_only=True)
    team_b = TeamSerializer(read_only=True)
    tournament = TournamentSerializer(read_only=True)

    class Meta:
        model = Match
        fields = [
            'id', 'tournament_id', 'tournament', 'team_a_id', 'team_b_id', 'team_a', 'team_b',
            'scheduled_date', 'location', 'latitude', 'longitude', 'status', 'start_time', 'end_time',
            'team_a_sets_won', 'team_b_sets_won'
        ]

# Serializador para registrar rendimiento de un jugador en un set específico


class PlayerPerformanceSerializer(serializers.Serializer):
    player_id = serializers.IntegerField()
    points = serializers.IntegerField(default=0)
    aces = serializers.IntegerField(default=0)
    assists = serializers.IntegerField(default=0)
    blocks = serializers.IntegerField(default=0)
    set_number = serializers.IntegerField()

    def validate(self, data):
        # Validar que el jugador exista
        try:
            Player.objects.get(id=data['player_id'])
        except Player.DoesNotExist:
            raise serializers.ValidationError("Player not found.")

        return data


class SubstitutePlayerSerializer(serializers.Serializer):
    player_in = serializers.IntegerField()
    player_out = serializers.IntegerField()
    team = serializers.CharField(max_length=1)

    def validate(self, data):
        # Validar que los jugadores existen y pertenecen al mismo equipo
        try:
            player_in = Player.objects.get(id=data['player_in'])
            player_out = Player.objects.get(id=data['player_out'])
            if player_in.team != player_out.team:
                raise serializers.ValidationError(
                    "Players must belong to the same team.")
        except Player.DoesNotExist:
            raise serializers.ValidationError("Player not found.")

        return data


class TimeoutSerializer(serializers.Serializer):
    team = serializers.CharField(max_length=1)

    def validate_team(self, value):
        if value not in ['A', 'B']:
            raise serializers.ValidationError("Invalid team identifier.")
        return value
