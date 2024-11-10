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
from django.shortcuts import get_object_or_404


class MatchListCreateView(generics.ListCreateAPIView):
    queryset = Match.objects.all().select_related('team_a', 'team_b', 'tournament')
    serializer_class = MatchSerializer

    def perform_create(self, serializer):
        # Guardamos el partido con los datos proporcionados
        match = serializer.save(status='upcoming')
        # Obtenemos latitud, longitud y fecha
        lat = serializer.validated_data.get('latitude', None)
        lon = serializer.validated_data.get('longitude', None)
        scheduled_date = serializer.validated_data.get('scheduled_date', None)

        if lat is not None and lon is not None and scheduled_date is not None:
            # Llamamos a la API de clima
            clima_data = self.get_weather_data(lat, lon, scheduled_date)
            if clima_data:
                match.weather_info = clima_data
                match.save()

    def get_weather_data(self, lat, lon, date):
        # Formatear fecha para la API
        date_str = date.strftime('%Y-%m-%d')
        params = {
            'latitude': lat,
            'longitude': lon,
            'hourly': 'temperature_2m,weathercode',
            'start_date': date_str,
            'end_date': date_str,
            'timezone': 'auto'
        }
        url = "https://api.open-meteo.com/v1/forecast"
        response = requests.get(url, params=params)
        if response.status_code == 200:
            data = response.json()
            # Obtener la hora del partido
            hour = date.hour
            # Ajustar el índice si es necesario
            index = data['hourly']['time'].index(f"{date_str}T{hour:02d}:00")
            # Obtener temperatura y código del clima
            temperature = data['hourly']['temperature_2m'][index]
            weather_code = data['hourly']['weathercode'][index]
            # Mapear weather_code a una descripción si lo deseas
            weather_info = {
                'temperature': temperature,
                'weather_code': weather_code
            }
            return weather_info
        return None


class MatchDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = MatchDetailSerializer
    
    def get_object(self):
        queryset = Match.objects.select_related(
            'team_a',
            'team_b',
            'tournament'
        ).prefetch_related(
            'sets',
            'sets__performances',
            'sets__performances__player',
            'team_a__players',
            'team_b__players'
        )
        
        # Obtener el objeto usando el lookup_field
        obj = get_object_or_404(queryset, pk=self.kwargs["pk"])
        self.check_object_permissions(self.request, obj)
        return obj

    def retrieve(self, request, *args, **kwargs):
        try:
            instance = self.get_object()
            serializer = self.get_serializer(instance)
            return Response(serializer.data)
        except Exception as e:
            print(f"Error detallado en MatchDetailView: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

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
                set_instance.team_a_points = max(
                    0, set_instance.team_a_points - points_to_subtract)
            else:
                set_instance.team_b_points = max(
                    0, set_instance.team_b_points - points_to_subtract)
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
