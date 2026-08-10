from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models
import random
from datetime import timedelta
from django.utils import timezone


class UsuarioManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('El email es obligatorio para registrar un usuario.')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)  # Hashea la contraseña en la base de datos
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('rol', 'Administrador')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('El superusuario debe tener is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('El superusuario debe tener is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class Usuario(AbstractBaseUser, PermissionsMixin):
    ROLES = (
        ('Administrador', 'Administrador'),
        ('Empleado', 'Empleado'),
    )

    id_usuario = models.BigAutoField(primary_key=True)
    email = models.EmailField(unique=True, null=False, blank=False)
    nombre = models.CharField(max_length=100, null=False, blank=False)
    apellido = models.CharField(max_length=100, null=False, blank=False)
    rol = models.CharField(max_length=20, choices=ROLES, default='Empleado')
    otp_code = models.CharField(max_length=6, blank=True, null=True)
    otp_expires_at = models.DateTimeField(blank=True, null=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = UsuarioManager()

    def generate_otp(self):
        otp = f"{random.randint(100000, 999999)}"
        self.otp_code = otp
        self.otp_expires_at = timezone.now() + timedelta(minutes=10)
        self.save(update_fields=["otp_code", "otp_expires_at"])
        return otp

    def verify_otp(self, otp):
        if (
            self.otp_code == otp
            and self.otp_expires_at
            and timezone.now() <= self.otp_expires_at
        ):
            return True
        return False

    # Configuración para autenticar ÚNICAMENTE por email
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['nombre', 'apellido', 'rol']

    def __str__(self):
        return f"{self.email} - {self.rol}"