from rest_framework import serializers
from .models import Team, Player


class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['id', 'name', 'jersey_number',
                  'position', 'is_starter', 'status', 'avatar']


class TeamSerializer(serializers.ModelSerializer):
    players = PlayerSerializer(many=True)
    created_by = serializers.ReadOnlyField(source='created_by.id')

    class Meta:
        model = Team
        fields = ['id', 'name', 'gender', 'coach',
                  'staff', 'created_by', 'players']

    def create(self, validated_data):
        players_data = validated_data.pop('players', [])
        team = Team.objects.create(**validated_data)
        for player_data in players_data:
            Player.objects.create(team=team, **player_data)
        return team

    def update(self, instance, validated_data):
        players_data = validated_data.pop('players', [])

        # Update team fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Map existing players by ID for quick lookup
        existing_players = {player.id: player for player in instance.players.all()}

        # IDs of players that have been processed
        processed_ids = []

        for player_data in players_data:
            player_id = player_data.get('id')

            if player_id and player_id in existing_players:
                # Update existing player
                player = existing_players[player_id]
                for attr, value in player_data.items():
                    setattr(player, attr, value)
                player.save()
                processed_ids.append(player_id)
            else:
                # Create new player
                new_player = Player.objects.create(team=instance, **player_data)
                processed_ids.append(new_player.id)

        # Delete players not in the incoming data
        instance.players.exclude(id__in=processed_ids).delete()

        return instance
