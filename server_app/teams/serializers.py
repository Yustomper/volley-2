# teams/serializers.py

from rest_framework import serializers
from .models import Team, Player


class TeamSerializer(serializers.ModelSerializer):
    class Meta:
        model = Team
        fields = ['id', 'name', 'gender', 'coach', 'staff', 'created_by']


class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['id', 'team', 'name', 'jersey_number',
                  'position', 'is_starter', 'status', 'avatar']
