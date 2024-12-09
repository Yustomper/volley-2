from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from .serializers import UserRegisterSerializer
from drf_spectacular.utils import extend_schema, OpenApiResponse, OpenApiExample

@extend_schema(
    tags=['Authentication'],
    summary="Login de usuario",
    description="Obtiene un token de autenticación usando credenciales",
    responses={
        200: OpenApiResponse(
            description="Login exitoso",
            examples=[
                OpenApiExample(
                    'Successful Response',
                    value={
                        'token': 'string',
                        'user_id': 1,
                        'email': 'user@example.com',
                        'username': 'string'
                    }
                )
            ]
        ),
        400: OpenApiResponse(description="Credenciales inválidas")
    },
    request=OpenApiExample(
        'Login Request',
        value={
            'username': 'string',
            'password': 'string'
        }
    )
)
class CustomAuthToken(ObtainAuthToken):
    """
    Vista para la autenticación de usuarios.
    
    Permite a los usuarios obtener un token de autenticación
    proporcionando sus credenciales (username y password).
    """
    
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'email': user.email,
            'username': user.username
        })

@extend_schema(
    tags=['Authentication'],
    summary="Registro de usuario",
    description="Crea un nuevo usuario y devuelve un token de autenticación",
    responses={
        201: OpenApiResponse(
            description="Usuario creado exitosamente",
            examples=[
                OpenApiExample(
                    'Successful Registration',
                    value={
                        'user_id': 1,
                        'username': 'string',
                        'email': 'user@example.com',
                        'token': 'string'
                    }
                )
            ]
        ),
        400: OpenApiResponse(description="Datos inválidos")
    }
)
class UserRegisterView(generics.CreateAPIView):
    """
    Vista para el registro de nuevos usuarios.
    
    Permite crear nuevos usuarios y devuelve un token
    de autenticación junto con los datos del usuario.
    """
    
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        token, created = Token.objects.get_or_create(user=user)
        return Response({
            "user_id": user.id,
            "username": user.username,
            "email": user.email,
            "token": token.key
        }, status=status.HTTP_201_CREATED)

@extend_schema(
    tags=['Authentication'],
    summary="Logout de usuario",
    description="Invalida el token de autenticación actual",
    responses={
        200: OpenApiResponse(
            description="Logout exitoso",
            examples=[
                OpenApiExample(
                    'Successful Logout',
                    value={'message': 'Successfully logged out.'}
                )
            ]
        ),
        400: OpenApiResponse(description="Token no encontrado"),
        401: OpenApiResponse(description="No autorizado")
    }
)
class LogoutView(APIView):
    """
    Vista para cerrar sesión.
    
    Invalida el token de autenticación actual del usuario,
    requiriendo que el usuario esté autenticado.
    """
    
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            request.user.auth_token.delete()
            return Response(
                {"message": "Successfully logged out."},
                status=status.HTTP_200_OK
            )
        except Token.DoesNotExist:
            return Response(
                {"error": "Token not found."},
                status=status.HTTP_400_BAD_REQUEST)