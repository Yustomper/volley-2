# teams/urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TeamViewSet, PlayerViewSet

router = DefaultRouter()
router.register(r'teams', TeamViewSet, basename='teams')
router.register(r'players', PlayerViewSet, basename='players')

urlpatterns = [
    path('', include(router.urls)),
]
