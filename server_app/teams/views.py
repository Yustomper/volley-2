# teams/views.py

from rest_framework import viewsets, permissions, filters
from .models import Team, Player
from .serializers import TeamSerializer, PlayerSerializer


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Agregar filtros de búsqueda, ordenamiento y paginación
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'coach']
    ordering_fields = ['name', 'gender']
    ordering = ['name']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Agregar filtros de búsqueda, ordenamiento y paginación
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'team__name', 'position']
    ordering_fields = ['name', 'jersey_number', 'position']
    ordering = ['name']
