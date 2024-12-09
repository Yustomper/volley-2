# teams/views.py

from rest_framework import viewsets, permissions, filters, status
from django_filters.rest_framework import DjangoFilterBackend 
from rest_framework.response import Response
from .models import Team, Player
from .serializers import TeamSerializer, PlayerSerializer
from django.db import transaction
from rest_framework.pagination import PageNumberPagination
from drf_spectacular.utils import extend_schema, extend_schema_view, OpenApiParameter, OpenApiExample
from drf_spectacular.types import OpenApiTypes


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 6
    page_size_query_param = 'page_size'
    max_page_size = 100


@extend_schema_view(
    list=extend_schema(
        tags=['Teams'],
        summary="Lista todos los equipos",
        description="""
        Retorna una lista paginada de todos los equipos.
        Se puede filtrar por género, buscar por nombre o entrenador, y ordenar por diferentes campos.
        """,
        parameters=[
            OpenApiParameter(
                name='search',
                type=str,
                description='Buscar por nombre o entrenador del equipo'
            ),
            OpenApiParameter(
                name='ordering',
                type=str,
                description='Ordenar por nombre o género (prefix con - para orden descendente)',
                examples=[
                    OpenApiExample('Por nombre', value='name'),
                    OpenApiExample('Por género', value='gender'),
                    OpenApiExample('Por nombre descendente', value='-name'),
                ]
            ),
            OpenApiParameter(
                name='gender',
                type=str,
                description='Filtrar por género (male/female)',
                examples=[
                    OpenApiExample('Masculino', value='male'),
                    OpenApiExample('Femenino', value='female'),
                ]
            ),
        ]
    ),
    create=extend_schema(
        tags=['Teams'],
        summary="Crea un nuevo equipo",
        description="Crea un nuevo equipo con la información proporcionada. El usuario autenticado será registrado como creador.",
        examples=[
            OpenApiExample(
                'Ejemplo de creación de equipo',
                value={
                    'name': 'Volleyball Stars',
                    'gender': 'Female',
                    'coach': 'John Doe',
                    'assistant_coach': 'Jane Smith',
                }
            )
        ]
    ),
    retrieve=extend_schema(
        tags=['Teams'],
        summary="Obtiene los detalles de un equipo",
        description="Retorna la información detallada de un equipo específico"
    ),
    update=extend_schema(
        tags=['Teams'],
        summary="Actualiza un equipo completo",
        description="Actualiza todos los campos de un equipo existente"
    ),
    partial_update=extend_schema(
        tags=['Teams'],
        summary="Actualiza parcialmente un equipo",
        description="Actualiza uno o más campos de un equipo existente"
    ),
    destroy=extend_schema(
        tags=['Teams'],
        summary="Elimina un equipo",
        description="Elimina un equipo y todos sus jugadores asociados"
    )
)
class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    search_fields = ['name', 'coach']
    ordering_fields = ['name', 'gender']
    ordering = ['name']
    filterset_fields = ['gender']

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()

        with transaction.atomic():
            serializer = self.get_serializer(
                instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)

        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


@extend_schema_view(
    list=extend_schema(
        tags=['Players'],
        summary="Lista todos los jugadores",
        description="""
        Retorna una lista de todos los jugadores registrados.
        Se puede buscar por nombre, equipo o posición, y ordenar por diferentes campos.
        """,
        parameters=[
            OpenApiParameter(
                name='search',
                type=str,
                description='Buscar por nombre, equipo o posición del jugador'
            ),
            OpenApiParameter(
                name='ordering',
                type=str,
                description='Ordenar por nombre, número o posición',
                examples=[
                    OpenApiExample('Por nombre', value='name'),
                    OpenApiExample('Por número', value='jersey_number'),
                    OpenApiExample('Por posición', value='position'),
                ]
            ),
        ]
    ),
    create=extend_schema(
        tags=['Players'],
        summary="Registra un nuevo jugador",
        description="Crea un nuevo jugador y lo asocia a un equipo existente",
        examples=[
            OpenApiExample(
                'Ejemplo de creación de jugador',
                value={
                    'name': 'John Smith',
                    'team': 1,
                    'jersey_number': 10,
                    'position': 'setter',
                    'is_starter': True,
                    'status': 'active'
                }
            )
        ]
    ),
    retrieve=extend_schema(
        tags=['Players'],
        summary="Obtiene los detalles de un jugador",
        description="Retorna la información detallada de un jugador específico"
    ),
    update=extend_schema(
        tags=['Players'],
        summary="Actualiza un jugador",
        description="Actualiza toda la información de un jugador existente"
    ),
    partial_update=extend_schema(
        tags=['Players'],
        summary="Actualiza parcialmente un jugador",
        description="Actualiza uno o más campos de un jugador existente"
    ),
    destroy=extend_schema(
        tags=['Players'],
        summary="Elimina un jugador",
        description="Elimina un jugador del sistema"
    )
)
class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'team__name', 'position']
    ordering_fields = ['name', 'jersey_number', 'position']
    ordering = ['name']