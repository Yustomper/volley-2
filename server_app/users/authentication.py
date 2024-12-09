from rest_framework.authentication import TokenAuthentication

class FlexibleTokenAuthentication(TokenAuthentication):
    """
    Autenticación personalizada que usa 'Bearer' como palabra clave para tokens.
    
    Esta clase modifica el comportamiento estándar de TokenAuthentication
    para aceptar el formato: 'Bearer <token>' en lugar de 'Token <token>'.
    """
    
    keyword = 'Bearer'