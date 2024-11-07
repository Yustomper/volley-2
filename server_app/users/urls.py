# users/urls.py

from django.urls import path
from .views import CustomAuthToken, UserRegisterView, LogoutView

urlpatterns = [
    path('login/', CustomAuthToken.as_view(), name='api_login'),
    path('register/', UserRegisterView.as_view(),
         name='api_register'),
    path('logout/', LogoutView.as_view(), name='api_logout'),
]
