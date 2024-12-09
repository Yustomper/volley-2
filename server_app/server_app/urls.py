# server_app/urls.py

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/', include('teams.urls')),
    path('api/', include('tournaments.urls')),
    path('api/', include('matches.urls')),
    path('api/', include('docs.urls')),
]
