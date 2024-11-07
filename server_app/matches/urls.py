# matches/urls.py

from django.urls import path
from .views import (
    MatchListCreateView, MatchDetailView,
    PlayerPerformanceView, SubstitutePlayerView, TimeoutView, StartMatchView
)

urlpatterns = [
    # CRUD para partidos
    path('matches/', MatchListCreateView.as_view(), name='match_list_create'),
    path('matches/<int:pk>/', MatchDetailView.as_view(), name='match_detail'),

    # Otros endpoints específicos del partido
    path('matches/<int:match_id>/performance/',
         PlayerPerformanceView.as_view(), name='player_performance'),
    path('matches/<int:match_id>/substitute/',
         SubstitutePlayerView.as_view(), name='substitute_player'),
    path('matches/<int:match_id>/timeout/',
         TimeoutView.as_view(), name='timeout_request'),
    path('matches/<int:match_id>/start/',
         StartMatchView.as_view(), name='start_match'),
]
