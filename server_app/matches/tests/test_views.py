from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from teams.models import Team, Player
from matches.models import Match, Set
from django.utils import timezone
import datetime

class SubstitutePlayerViewTest(TestCase):
    def setUp(self):
        # Crear el cliente de API
        self.client = APIClient()
        
        # Crear equipos
        self.team_a = Team.objects.create(
            name="Team A",
            gender="M",
            coach="Coach A"
        )
        self.team_b = Team.objects.create(
            name="Team B",
            gender="M",
            coach="Coach B"
        )
        
        # Crear jugadores del equipo A
        self.starter = Player.objects.create(
            team=self.team_a,
            name="Starter Player",
            jersey_number=1,
            position="CE",
            is_starter=True
        )
        
        self.bench_player = Player.objects.create(
            team=self.team_a,
            name="Bench Player",
            jersey_number=2,
            position="CE",
            is_starter=False
        )
        
        # Crear partido
        self.match = Match.objects.create(
            team_a=self.team_a,
            team_b=self.team_b,
            status='live',
            scheduled_date=timezone.now(),
            latitude='-33.4569400',
            longitude='-70.6482700',
            tournament=None  # Si es necesario
        )
        
        # Crear set actual
        self.current_set = Set.objects.create(
            match=self.match,
            set_number=1
        )

    def test_substitute_player(self):
        """Prueba la funcionalidad de sustitución de jugadores"""
        print("\nPrueba de sustitución de jugadores:")
        print(f"Estado inicial:")
        print(f"- Titular ({self.starter.id}): {self.starter.name} - is_starter={self.starter.is_starter}")
        print(f"- Banca ({self.bench_player.id}): {self.bench_player.name} - is_starter={self.bench_player.is_starter}")
        
        url = reverse('substitute_player', kwargs={'match_id': self.match.id})
        
        # Datos para la sustitución
        data = {
            'team': 'A',
            'player_in': self.bench_player.id,
            'player_out': self.starter.id
        }
        
        print(f"\nEnviando solicitud de sustitución:")
        print(f"URL: {url}")
        print(f"Datos: {data}")
        
        response = self.client.post(url, data, format='json')
        print(f"Código de respuesta: {response.status_code}")
        print(f"Respuesta: {response.data if hasattr(response, 'data') else 'No data'}")
        
        # Refrescar jugadores desde la BD
        self.starter.refresh_from_db()
        self.bench_player.refresh_from_db()
        
        print(f"\nEstado final:")
        print(f"- Ex-Titular ({self.starter.id}): {self.starter.name} - is_starter={self.starter.is_starter}")
        print(f"- Nuevo Titular ({self.bench_player.id}): {self.bench_player.name} - is_starter={self.bench_player.is_starter}")
        
        # Verificaciones
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertFalse(self.starter.is_starter, "El jugador titular debería pasar a banca")
        self.assertTrue(self.bench_player.is_starter, "El jugador de banca debería pasar a titular")

    def test_invalid_substitution(self):
        """Prueba sustitución con datos inválidos"""
        url = reverse('substitute_player', kwargs={'match_id': self.match.id})
        
        # Datos inválidos
        data = {
            'team': 'X',  # Equipo inválido
            'player_in': 9999,  # ID inexistente
            'player_out': self.starter.id
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Verificar que los estados no cambiaron
        self.starter.refresh_from_db()
        self.bench_player.refresh_from_db()
        self.assertTrue(self.starter.is_starter)
        self.assertFalse(self.bench_player.is_starter)