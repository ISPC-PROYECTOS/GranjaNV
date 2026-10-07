import re
from django.db import models
from django.db.models import Q
from django.core.exceptions import ValidationError


class Cliente(models.Model):
    class TipoCliente(models.TextChoices):
        MAYORISTA = 'MAYORISTA', 'Mayorista'
        MINORISTA = 'MINORISTA', 'Minorista'

    nombre = models.CharField(max_length=120)
    apellido = models.CharField(max_length=120, blank=True, default='')
    telefono = models.CharField(max_length=30)
    direccion = models.CharField(max_length=255)
    email = models.EmailField(blank=True, null=True)
    tipo = models.CharField(
        max_length=20,
        choices=TipoCliente.choices,
        default=TipoCliente.MINORISTA,
    )
    activo = models.BooleanField(default=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['nombre', 'apellido']
        verbose_name = 'Cliente'
        verbose_name_plural = 'Clientes'
        constraints = [
            models.UniqueConstraint(
                fields=['nombre', 'apellido'],
                condition=Q(activo=True),
                name='unique_cliente_nombre_apellido_activo',
            )
        ]

    def __str__(self) -> str:
        if self.apellido:
            return f"{self.nombre} {self.apellido}"
        return self.nombre

    def clean(self) -> None:
        super().clean()

        if self.nombre:
            nombre_limpio = self.nombre.strip()
            if not re.match(r'^[A-ZÁÉÍÓÚÑa-záéíóúñ0-9\s\.\,\-]+$', nombre_limpio):
                raise ValidationError({
                    'nombre': 'El nombre contiene caracteres inválidos.'
                })
            
        if self.apellido:
            apellido_limpio = self.apellido.strip()
            if not re.match(r'^[A-ZÁÉÍÓÚÑa-záéíóúñ\s\.\-]+$', apellido_limpio):
                raise ValidationError({
                    'apellido': 'El apellido solo puede contener letras y espacios.'
                })

        if self.telefono:
            tel_limpio = self.telefono.strip()
            if not re.match(r'^\+?[\d\s-]+$', tel_limpio):
                raise ValidationError({
                    'telefono': 'El teléfono no puede contener letras ni caracteres inválidos.'
                })
            
            solo_numeros = re.sub(r'\D', '', tel_limpio)
            if len(solo_numeros) < 7:
                raise ValidationError({
                    'telefono': 'El teléfono debe contener al menos 7 dígitos numéricos.'
                })

    def save(self, *args, **kwargs) -> None:
        if self.nombre:
            self.nombre = self.nombre.strip().upper()
        if self.apellido:
            self.apellido = self.apellido.strip().upper()
        super().save(*args, **kwargs)