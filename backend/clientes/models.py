from django.db import models


class Cliente(models.Model):
    class TipoCliente(models.TextChoices):
        MAYORISTA = 'MAYORISTA', 'Mayorista'
        MINORISTA = 'MINORISTA', 'Minorista'

    nombre = models.CharField(max_length=120, unique=True)
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

    def __str__(self):
        if self.apellido:
            return f"{self.nombre} {self.apellido}"
        return self.nombrefrom 


