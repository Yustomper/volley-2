# tournaments/serializers.py

from rest_framework import serializers
from .models import Tournament
from teams.models import Team


class TournamentSerializer(serializers.ModelSerializer):
    teams = serializers.PrimaryKeyRelatedField(
        queryset=Team.objects.all(), many=True)

    class Meta:
        model = Tournament
        fields = ['id', 'name', 'start_date', 'end_date',
                  'location', 'description', 'teams']
