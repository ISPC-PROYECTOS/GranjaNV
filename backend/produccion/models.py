from decimal import Decimal
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone
from pedidos.models import ItemPedido


class Galpon(models.Model):
    numero_galpon = models.PositiveIntegerField(
        primary_key=True,
        help_text="Número identificador único del galpón.",
    )
    nombre = models.CharField(max_length=100)
    capacidad_maxima = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text="Capacidad física total de aves en el galpón.",
    )
    cantidad_inicial_gallinas = models.PositiveIntegerField(
        default=0,
        help_text="Población con la que inició el lote del galpón.",
    )
    cantidad_actual_gallinas = models.PositiveIntegerField(
        default=0,
        help_text="Población viva actual en el galpón.",
    )
    descripcion_galpon = models.TextField(blank=True, default="")
    activo = models.BooleanField(default=True, db_index=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["numero_galpon"]
        verbose_name = "Galpón"
        verbose_name_plural = "Galpones"
        constraints = [
            models.CheckConstraint(
                condition=models.Q(cantidad_actual_gallinas__gte=0),
                name="check_galpon_gallinas_no_negativas",
            ),
            models.CheckConstraint(
                condition=models.Q(capacidad_maxima__gt=0),
                name="check_galpon_capacidad_positiva",
            ),
        ]

    def __str__(self) -> str:
        return f"Galpón #{self.numero_galpon} - {self.nombre} ({self.cantidad_actual_gallinas} aves)"


class MovimientoGallina(models.Model):
    class TipoMovimiento(models.TextChoices):
        INGRESO = "INGRESO", "Ingreso"
        SALIDA = "SALIDA", "Salida"

    class MotivoMovimiento(models.TextChoices):
        MUERTE = "MUERTE", "Mortalidad / Muerte"
        VENTA = "VENTA", "Venta"
        REHABILITACION = "REHABILITACION", "Rehabilitación / Aislamiento"
        COMPRA = "COMPRA", "Compra / Incorporación"
        RECUPERADA = "RECUPERADA", "Recuperadas"
        OTRO = "OTRO", "Otro"

    galpon = models.ForeignKey(
        Galpon,
        on_delete=models.PROTECT,
        related_name="movimientos_gallinas",
        db_index=True,
    )
    fecha = models.DateField(default=timezone.localdate, db_index=True)
    tipo_movimiento = models.CharField(max_length=10, choices=TipoMovimiento.choices)
    motivo_movimiento = models.CharField(max_length=20, choices=MotivoMovimiento.choices)
    cantidad_gallinas = models.PositiveIntegerField(validators=[MinValueValidator(1)])
    descripcion_movimiento = models.CharField(max_length=255, help_text="Detalle o motivo específico del movimiento de aves.",)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-fecha", "-creado_en"]
        verbose_name = "Movimiento de Gallinas"
        verbose_name_plural = "Movimientos de Gallinas"
        constraints = [
            models.CheckConstraint(
                condition=models.Q(cantidad_gallinas__gt=0),
                name="check_cantidad_movimiento_gallinas_positiva",
            )
        ]

    def __str__(self) -> str:
        return f"{self.tipo_movimiento} {self.cantidad_gallinas} aves - Galpón {self.galpon_id} ({self.fecha})"


class RegistroProduccion(models.Model):
    galpon = models.ForeignKey(
        Galpon,
        on_delete=models.PROTECT,
        related_name="registros_produccion",
        db_index=True,
    )
    fecha = models.DateField(default=timezone.localdate, db_index=True)
    huevos_rotos = models.PositiveIntegerField(
        default=0,
        help_text="Huevos rotos o mermas registradas en unidades individuales.",
    )
    total_maples = models.PositiveIntegerField(
        default=0,
        help_text="Total acumulado de maples comerciales ingresados en la jornada.",
    )
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-fecha", "-creado_en"]
        verbose_name = "Registro de Producción"
        verbose_name_plural = "Registros de Producción"

    def __str__(self) -> str:
        return f"Producción Galpón {self.galpon_id} - {self.fecha} ({self.total_maples} maples)"


class ItemProduccionHuevo(models.Model):
    HUEVOS_POR_MAPLE: int = 30

    registro = models.ForeignKey(
        RegistroProduccion,
        on_delete=models.CASCADE,
        related_name="items",
    )
    tipo_huevo = models.CharField(
        max_length=20,
        choices=ItemPedido.TipoHuevo.choices,
    )
    cantidad_huevos = models.PositiveIntegerField(
        validators=[MinValueValidator(1)],
        help_text="Cantidad de huevos individuales persistida (30 unidades por maple).",
    )

    class Meta:
        verbose_name = "Item de Producción de Huevo"
        verbose_name_plural = "Items de Producción de Huevos"
        constraints = [
            models.UniqueConstraint(
                fields=["registro", "tipo_huevo"],
                name="unique_registro_tipo_huevo",
            ),
            models.CheckConstraint(
                condition=models.Q(cantidad_huevos__gt=0),
                name="check_cantidad_huevos_produccion_positiva",
            ),
        ]

    def __str__(self) -> str:
        maples = self.cantidad_huevos // self.HUEVOS_POR_MAPLE
        return f"{maples} maples ({self.cantidad_huevos} u.) {self.get_tipo_huevo_display()}"