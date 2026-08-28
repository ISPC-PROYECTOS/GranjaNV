from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework.validators import UniqueValidator
from .models import Usuario


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializador de Login: Autentica exclusivamente con email y password.
    Retorna tokens JWT y datos completos del usuario.
    """
    username_field = 'email'

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            'id_usuario': self.user.id_usuario,
            'email': self.user.email,
            'nombre': self.user.nombre,
            'apellido': self.user.apellido,
            'rol': self.user.rol,
        }
        return data

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email'] = user.email
        token['nombre'] = user.nombre
        token['apellido'] = user.apellido
        token['rol'] = user.rol
        return token


class RegistroUsuarioSerializer(serializers.ModelSerializer):
    """
    Serializador para que el Administrador registre nuevos usuarios.
    Hashea automáticamente la contraseña.
    """
    email = serializers.EmailField(
        validators=[
            UniqueValidator(
                queryset=Usuario.objects.all(),
                message="Ya existe un usuario registrado con este correo electrónico."
            )
        ]
    )
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Usuario
        fields = ['id_usuario', 'email', 'password', 'nombre', 'apellido', 'rol']

    def create(self, validated_data):
        return Usuario.objects.create_user(**validated_data)

class RequestOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordOTPSerializer(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6)
    new_password = serializers.CharField(min_length=8)