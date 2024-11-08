# users/authentication.py

from rest_framework.authentication import TokenAuthentication


class FlexibleTokenAuthentication(TokenAuthentication):
    keyword = 'Bearer'  
