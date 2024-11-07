# matches/views.py

from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Match, Set, PlayerPerformance
from .serializers import (
    PlayerPerformanceSerializer, SubstitutePlayerSerializer,
    TimeoutSerializer, MatchSerializer, MatchDetailSerializer
)
from teams.models import Player
import requests


class MatchListCreateView(generics.ListCreateAPIView):
    queryset = Match.objects.all()
    serializer_class = MatchSerializer

    def perform_create(self, serializer):
        # Llama a la API de clima al crear el partido
        match = serializer.save(status='upcoming')
        lat, lon = 0, 0  # Sustituir con la latitud y longitud reales
        clima_data = self.get_weather_data(lat, lon, match.scheduled_date)

        if clima_data:
            match.weather_info = clima_data
            match.save()

    def get_weather_data(self, lat, lon, date):
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=temperature_2m"
        response = requests.get(url)
        if response.status_code == 200:
            return response.json()
        return None


class MatchDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Match.objects.prefetch_related(
        'sets__performances').order_by('sets__set_number')  # Ordena sets por set_number
    serializer_class = MatchDetailSerializer


class StartMatchView(APIView):
    def post(self, request, match_id):
        try:
            match = Match.objects.get(id=match_id)
            match.start_match()
            return Response({"message": "Match started successfully."}, status=status.HTTP_200_OK)
        except Match.DoesNotExist:
            return Response({"error": "Match not found."}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PlayerPerformanceView(APIView):
    def patch(self, request, match_id):
        serializer = PlayerPerformanceSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data

            # Buscar el set usando set_number y match_id
            try:
                set_instance = Set.objects.get(
                    match_id=match_id, set_number=data['set_number'])
            except Set.DoesNotExist:
                return Response({"error": "Set not found for this match."}, status=status.HTTP_404_NOT_FOUND)

            # Crear o actualizar el rendimiento del jugador en el set
            performance, created = PlayerPerformance.objects.get_or_create(
                set=set_instance,
                player_id=data['player_id'],
                defaults={
                    'points': data['points'],
                    'aces': data['aces'],
                    'assists': data['assists'],
                    'blocks': data['blocks'],
                }
            )
            if not created:
                # Actualizar los puntos y estadísticas
                performance.points += data['points']
                performance.aces += data['aces']
                performance.assists += data['assists']
                performance.blocks += data['blocks']
                performance.save()

            # Añadir puntos al equipo correspondiente
            team = 'A' if Player.objects.get(
                id=data['player_id']).team_id == Match.objects.get(id=match_id).team_a.id else 'B'
            set_instance.add_points(team, data['points'])

            return Response({"message": "Performance updated successfully."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, match_id):
        serializer = PlayerPerformanceSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data

            # Buscar el set usando set_number y match_id
            try:
                set_instance = Set.objects.get(
                    match_id=match_id, set_number=data['set_number'])
            except Set.DoesNotExist:
                return Response({"error": "Set not found for this match."}, status=status.HTTP_404_NOT_FOUND)

            # Buscar el rendimiento del jugador en el set específico
            try:
                performance = PlayerPerformance.objects.get(
                    set=set_instance, player_id=data['player_id']
                )
            except PlayerPerformance.DoesNotExist:
                return Response({"error": "Player performance not found for this set."}, status=status.HTTP_404_NOT_FOUND)

            # Realizar el rollback restando los últimos puntos y estadísticas
            performance.points = max(0, performance.points - data['points'])
            performance.aces = max(0, performance.aces - data['aces'])
            performance.assists = max(0, performance.assists - data['assists'])
            performance.blocks = max(0, performance.blocks - data['blocks'])
            performance.save()

            # Restar puntos al equipo correspondiente
            team = 'A' if Player.objects.get(
                id=data['player_id']).team_id == Match.objects.get(id=match_id).team_a.id else 'B'
            points_to_subtract = data['points']
            if team == 'A':
                set_instance.team_a_points = max(0, set_instance.team_a_points - points_to_subtract)
            else:
                set_instance.team_b_points = max(0, set_instance.team_b_points - points_to_subtract)
            set_instance.save()

            return Response({"message": "Last performance entry rolled back successfully."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class SubstitutePlayerView(APIView):
    def post(self, request, match_id):
        serializer = SubstitutePlayerSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            match = Match.objects.get(id=match_id)
            current_set = match.sets.last()

            if data['team'] == 'A' and current_set.team_a_substitutions < match.max_substitutions_per_set:
                current_set.team_a_substitutions += 1
            elif data['team'] == 'B' and current_set.team_b_substitutions < match.max_substitutions_per_set:
                current_set.team_b_substitutions += 1
            else:
                return Response({"error": "Max substitutions reached for this set."}, status=status.HTTP_400_BAD_REQUEST)

            player_in = Player.objects.get(id=data['player_in'])
            player_out = Player.objects.get(id=data['player_out'])
            player_in.is_starter, player_out.is_starter = True, False
            player_in.save()
            player_out.save()
            current_set.save()

            return Response({"message": "Players substituted successfully."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TimeoutView(APIView):
    def post(self, request, match_id):
        serializer = TimeoutSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            match = Match.objects.get(id=match_id)
            current_set = match.sets.last()

            if data['team'] == 'A':
                if match.team_a_timeouts < match.max_timeouts_per_set:
                    match.team_a_timeouts += 1
                else:
                    return Response({"error": "Max timeouts reached for Team A in this set."}, status=status.HTTP_400_BAD_REQUEST)
            elif data['team'] == 'B':
                if match.team_b_timeouts < match.max_timeouts_per_set:
                    match.team_b_timeouts += 1
                else:
                    return Response({"error": "Max timeouts reached for Team B in this set."}, status=status.HTTP_400_BAD_REQUEST)

            match.save()
            return Response({"message": "Timeout registered successfully."}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
