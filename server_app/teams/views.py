# teams/views.py

from rest_framework import viewsets, permissions, filters, status
from django_filters.rest_framework import DjangoFilterBackend 
from rest_framework.response import Response
from .models import Team, Player
from .serializers import TeamSerializer, PlayerSerializer
from django.db import transaction
from django.shortcuts import get_object_or_404
from rest_framework.pagination import PageNumberPagination


class StandardResultsSetPagination(PageNumberPagination):
    page_size = 6
    page_size_query_param = 'page_size'
    max_page_size = 100


class TeamViewSet(viewsets.ModelViewSet):
    queryset = Team.objects.all()
    serializer_class = TeamSerializer
    pagination_class = StandardResultsSetPagination
    permission_classes = [permissions.IsAuthenticated]

    # Filtros para búsqueda, ordenamiento y filtrado
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
        # Elimina el equipo y sus jugadores en cascada automáticamente
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)


class PlayerViewSet(viewsets.ModelViewSet):
    queryset = Player.objects.all()
    serializer_class = PlayerSerializer
    permission_classes = [permissions.IsAuthenticated]

    # Filtros para búsqueda y ordenamiento
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'team__name', 'position']
    ordering_fields = ['name', 'jersey_number', 'position']
    ordering = ['name']
