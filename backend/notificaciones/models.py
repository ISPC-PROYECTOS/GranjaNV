from django.conf import settings
from django.db import models


class Notificacion(models.Model):
    class TipoNotificacion(models.TextChoices):
        PEDIDOS_DEL_DIA = 'PEDIDOS_DEL_DIA', 'Pedidos del Día'
        MOVIMIENTO_GALLINAS = 'MOVIMIENTO_GALLINAS', 'Movimiento de Gallinas'
        SISTEMA = 'SISTEMA', 'Sistema'

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notificaciones',
        db_index=True,
    )
    tipo = models.CharField(
        max_length=30,
        choices=TipoNotificacion.choices,
        db_index=True,
    )
    titulo = models.CharField(max_length=150)
    mensaje = models.CharField(max_length=255)
    leida = models.BooleanField(default=False, db_index=True)
    ruta = models.CharField(
        max_length=200,
        blank=True,
        default='',
        help_text='Ruta SPA interna para redirección al interactuar con la notificación.',
    )
    fecha_referencia = models.DateField(
        null=True,
        blank=True,
        db_index=True,
        help_text='Garantiza idempotencia en notificaciones diarias de sistema.',
    )
    datos_extra = models.JSONField(blank=True, default=dict)
    creada_en = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-creada_en']
        verbose_name = 'Notificación'
        verbose_name_plural = 'Notificaciones'
        indexes = [
            models.Index(fields=['usuario', 'leida', '-creada_en']),
            models.Index(fields=['usuario', 'tipo', 'fecha_referencia']),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=['usuario', 'tipo', 'fecha_referencia'],
                condition=models.Q(fecha_referencia__isnull=False),
                name='unique_notificacion_diaria_por_usuario',
            )
        ]

    def __str__(self) -> str:
        return f'{self.usuario.email} | [{self.tipo}] {self.titulo} (Leída: {self.leida})'