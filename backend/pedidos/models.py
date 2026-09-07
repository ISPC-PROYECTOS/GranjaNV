from decimal import Decimal

from clientes.models import Cliente
from django.core.validators import MinValueValidator
from django.db import models


class Pedido(models.Model):
    class DiaEntrega(models.TextChoices):
        JUEVES = "JUEVES", "Jueves"
        VIERNES = "VIERNES", "Viernes"

    cliente = models.ForeignKey(
        Cliente,
        on_delete=models.PROTECT,
        related_name="pedidos",
        db_index=True,
    )
    dia_entrega = models.CharField(
        max_length=10,
        choices=DiaEntrega.choices,
        default=DiaEntrega.JUEVES,
    )
    estado_pago = models.BooleanField(default=False, db_index=True)
    estado_entrega = models.BooleanField(default=False, db_index=True)
    total = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=Decimal("0.00"),
        validators=[MinValueValidator(Decimal("0.00"))],
    )
    observaciones = models.CharField(max_length=255, blank=True, default="")
    creado_en = models.DateTimeField(auto_now_add=True, db_index=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-creado_en"]
        verbose_name = "Pedido"
        verbose_name_plural = "Pedidos"
        indexes = [
            models.Index(fields=["estado_pago", "estado_entrega"]),
        ]

    def __str__(self) -> str:
        return f"Pedido #{self.pk} - {self.cliente.nombre} (${self.total})"

    def recalcular_total(self) -> Decimal:
        total_acumulado = sum(
            (item.subtotal for item in self.items.all()), Decimal("0.00")
        )
        self.total = total_acumulado
        self.save(update_fields=["total"])
        return self.total


class ItemPedido(models.Model):
    HUEVOS_POR_MAPLE: int = 30

    class TipoHuevo(models.TextChoices):
        BLANCO_1 = "BLANCO_1", "Blanco 1"
        BLANCO_2 = "BLANCO_2", "Blanco 2"
        COLOR_1 = "COLOR_1", "Color 1"
        COLOR_2 = "COLOR_2", "Color 2"

    pedido = models.ForeignKey(
        Pedido,
        on_delete=models.CASCADE,
        related_name="items",
    )
    tipo_huevo = models.CharField(
        max_length=20,
        choices=TipoHuevo.choices,
    )
    # Persistencia estricta por unidad individual para sincronizar con la producción diaria
    cantidad_unidades = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    precio_unitario = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )
    subtotal = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(Decimal("0.01"))],
    )

    class Meta:
        verbose_name = "Item de Pedido"
        verbose_name_plural = "Items de Pedido"
        constraints = [
            models.UniqueConstraint(
                fields=["pedido", "tipo_huevo"],
                name="unique_pedido_tipo_huevo",
            ),
            models.CheckConstraint(
                condition=models.Q(cantidad_unidades__gt=0),
                name="check_cantidad_unidades_positiva",
            ),
        ]

    def __str__(self) -> str:
        maples = self.cantidad_unidades // self.HUEVOS_POR_MAPLE
        return f"{maples} maples ({self.cantidad_unidades} u.) {self.get_tipo_huevo_display()}"
