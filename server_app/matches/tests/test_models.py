from django.test import TestCase
from teams.models import Team, Player
from matches.models import Match

class PlayerModelTest(TestCase):
    def setUp(self):
        # Crear un equipo de prueba
        self.team = Team.objects.create(
            name="Test Team",
            gender="M",
            coach="Test Coach"
        )
        
        # Crear jugadores de prueba
        self.player1 = Player.objects.create(
            team=self.team,
            name="Player 1",
            jersey_number=1,
            position="CE",
            is_starter=True
        )
        
        self.player2 = Player.objects.create(
            team=self.team,
            name="Player 2",
            jersey_number=2,
            position="LI",
            is_starter=False
        )

    def test_player_starter_status(self):
        """Test para verificar el estado is_starter de los jugadores"""
        # Verificar estado inicial
        print("\nPrueba de estado de jugadores titulares:")
        print(f"Player 1 (inicial): {self.player1.is_starter}")
        print(f"Player 2 (inicial): {self.player2.is_starter}")
        
        self.assertTrue(self.player1.is_starter)
        self.assertFalse(self.player2.is_starter)
        
        # Cambiar estados
        self.player1.is_starter = False
        self.player1.save()
        self.player2.is_starter = True
        self.player2.save()
        
        # Refrescar desde la base de datos
        self.player1.refresh_from_db()
        self.player2.refresh_from_db()
        
        print(f"\nDespués del cambio:")
        print(f"Player 1 (final): {self.player1.is_starter}")
        print(f"Player 2 (final): {self.player2.is_starter}")
        
        # Verificar cambio de estados
        self.assertFalse(self.player1.is_starter)
        self.assertTrue(self.player2.is_starter)

class MatchModelTest(TestCase):
    def test_match_fields(self):
        """Imprime los campos disponibles en el modelo Match"""
        print("\nCampos del modelo Match:")
        for field in Match._meta.get_fields():
            print(f"- {field.name}: {field.get_internal_type()}")
