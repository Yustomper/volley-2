from django.urls import path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

urlpatterns = [
    # Endpoint para descargar el schema de OpenAPI
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    # Interfaz Swagger UI
    path('swagger/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    # Interfaz alternativa Redoc
    path('redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
