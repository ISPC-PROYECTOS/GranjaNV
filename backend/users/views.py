from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Usuario
from .permissions import IsAdminRole
from .serializers import CustomTokenObtainPairSerializer, RegistroUsuarioSerializer, RequestOTPSerializer, ResetPasswordOTPSerializer
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView


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

class RequestOTPView(APIView):

    def post(self, request):
        serializer = RequestOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        try:
            user = Usuario.objects.get(email=email)
            otp = user.generate_otp()
            send_mail(
                "Código de Recuperación OTP",
                f"Tu código de verificación es: {otp}",
                "noreply@granjanv.com",
                [email],
                fail_silently=False,
            )
        except Usuario.DoesNotExist:
            pass  # Previene la enumeración de usuarios

        return Response(
            {"message": "Si el correo está registrado, recibirás un OTP."},
            status=status.HTTP_200_OK,
        )


class ResetPasswordOTPView(APIView):

    def post(self, request):
        serializer = ResetPasswordOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data["email"]
        otp = serializer.validated_data["otp"]
        new_password = serializer.validated_data["new_password"]

        try:
            user = Usuario.objects.get(email=email)
            if user.verify_otp(otp):
                user.set_password(new_password)
                user.otp_code = None
                user.otp_expires_at = None
                user.save()
                return Response(
                    {"message": "Contraseña restablecida correctamente."},
                    status=status.HTTP_200_OK,
                )
            return Response(
                {"error": "Código OTP inválido o expirado."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Usuario.DoesNotExist:
            return Response(
                {"error": "Código OTP inválido o expirado."},
                status=status.HTTP_400_BAD_REQUEST,
            )