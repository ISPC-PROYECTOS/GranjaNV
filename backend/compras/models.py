from django.db import models
from django.utils import timezone


class Gasto(models.Model):
    class Categoria(models.TextChoices):
        ALIMENTO = 'ALIMENTO', 'Alimento'
        COMBUSTIBLE = 'COMBUSTIBLE', 'Combustible'
        INSUMOS = 'INSUMOS', 'Insumos Veterinarios'
        MANTENIMIENTO = 'MANTENIMIENTO', 'Mantenimiento / Ferretería'
        LIMPIEZA = 'LIMPIEZA', 'Artículos de Limpieza'
        OTROS = 'OTROS', 'Otros'

    monto = models.DecimalField(max_digits=12, decimal_places=2)
    categoria = models.CharField(
        max_length=30,
        choices=Categoria.choices,
        default=Categoria.OTROS
    )
    descripcion = models.CharField(max_length=255)
    fecha = models.DateField(default=timezone.now)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-fecha', '-creado_en']
        verbose_name = 'Gasto'
        verbose_name_plural = 'Gastos'

    def __str__(self):
        return f"{self.categoria} - ${self.monto} ({self.fecha})"