from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Usuario
from .permissions import IsAdminRole
from .serializers import CustomTokenObtainPairSerializer, RegistroUsuarioSerializer


class LoginView(TokenObtainPairView):
    """
    Endpoint público de Login. Recibe 'email' y 'password'.
    """
    serializer_class = CustomTokenObtainPairSerializer


class RegistroUsuarioView(generics.CreateAPIView):
    """
    Endpoint de Registro. Protegido: Requiere JWT válido y rol 'Administrador'.
    """
    queryset = Usuario.objects.all()
    serializer_class = RegistroUsuarioSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]