from rest_framework import viewsets, permissions
from .models import Tournament
from .serializers import TournamentSerializer
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiExample
from rest_framework.decorators import action
from rest_framework.response import Response

@extend_schema_view(
    list=extend_schema(
        summary="Lista todos los torneos",
        description="Obtiene una lista de todos los torneos registrados",
        tags=['Tournaments'],
        parameters=[
            OpenApiParameter(
                name='active',
                type=bool,
                description='Filtrar torneos activos'
            )
        ]
    ),
    create=extend_schema(
        summary="Crea un nuevo torneo",
        description="Registra un nuevo torneo con sus equipos participantes",
        tags=['Tournaments'],
        examples=[
            OpenApiExample(
                'Crear Torneo',
                value={
                    "name": "Torneo de Verano 2024",
                    "start_date": "2024-06-01",
                    "end_date": "2024-06-15",
                    "location": "Polideportivo Central",
                    "description": "Torneo anual de verano",
                    "teams": [1, 2, 3]
                }
            )
        ]
    ),
    retrieve=extend_schema(
        summary="Obtiene los detalles de un torneo",
        description="Retorna información detallada de un torneo específico",
        tags=['Tournaments']
    ),
    update=extend_schema(
        summary="Actualiza un torneo",
        description="Actualiza todos los campos de un torneo existente",
        tags=['Tournaments']
    ),
    destroy=extend_schema(
        summary="Elimina un torneo",
        description="Elimina un torneo y sus relaciones",
        tags=['Tournaments']
    )
)
class TournamentViewSet(viewsets.ModelViewSet):
    """
    ViewSet para la gestión completa de torneos.
    
    Proporciona operaciones CRUD estándar para torneos,
    más acciones personalizadas para gestionar equipos participantes.
    """
    
    queryset = Tournament.objects.all()
    serializer_class = TournamentSerializer
    permission_classes = [permissions.IsAuthenticated]

    @extend_schema(
        summary="Lista equipos del torneo",
        description="Obtiene la lista de equipos participantes en el torneo",
        tags=['Tournaments']
    )
    @action(detail=True, methods=['get'])
    def teams_list(self, request, pk=None):
        """Endpoint adicional para listar equipos de un torneo específico"""
        tournament = self.get_object()
        teams = tournament.teams.all()
        return Response(TeamSerializer(teams, many=True).data)