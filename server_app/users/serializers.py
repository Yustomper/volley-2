# users/serializers.py

from rest_framework import serializers
from users.models import CustomUser
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import ValidationError
from django.db import IntegrityError


class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser  # Cambiar a CustomUser
        fields = ('username', 'password', 'email')
        extra_kwargs = {'password': {'write_only': True}}

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        try:
            user = CustomUser.objects.create_user(  # Cambiar a CustomUser
                username=validated_data['username'],
                email=validated_data['email'],
                password=validated_data['password']
            )
            return user
        except IntegrityError:
            raise ValidationError(
                "A user with that username or email already exists.")
