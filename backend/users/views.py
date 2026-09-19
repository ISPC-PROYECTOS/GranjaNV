import logging
from smtplib import SMTPException
from django.conf import settings

from rest_framework import generics
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import Usuario
from .permissions import IsAdminRole
from .serializers import CustomTokenObtainPairSerializer, RegistroUsuarioSerializer, RequestOTPSerializer, ResetPasswordOTPSerializer
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny

logger = logging.getLogger(__name__)

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
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RequestOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"]

        try:
            user = Usuario.objects.get(email=email)
            otp = user.generate_otp()

            send_mail(
                subject="Código de Recuperación OTP - Granja NV",
                message=(
                    f"Hola {user.nombre},\n\n"
                    f"Tu código de recuperación para el sistema de Granja NV es: {otp}\n\n"
                    "Este código expirará en 10 minutos. Si no solicitaste este cambio, ignorá este mensaje."
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )
        except Usuario.DoesNotExist:
            # Prevención de enumeración de usuarios
            pass
        except SMTPException as exc:
            logger.error(f"Fallo al enviar correo OTP a {email}: {str(exc)}")
        except Exception as exc:
            logger.error(f"Error inesperado en servicio de correo: {str(exc)}")

        return Response(
            {"message": "Si el correo está registrado, recibirás un OTP."},
            status=status.HTTP_200_OK,
        )

class ResetPasswordOTPView(APIView):
    permission_classes = [AllowAny]

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