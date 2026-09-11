from django.conf import settings
from django.core.validators import MinValueValidator
from django.db import models
from django.utils import timezone


class TipoHuevo(models.TextChoices):
    BLANCO_1 = "BLANCO_1", "Blanco 1"
    BLANCO_2 = "BLANCO_2", "Blanco 2"
    COLOR_1 = "COLOR_1", "Color 1"
    COLOR_2 = "COLOR_2", "Color 2"


class Galpon(models.Model):
    numero = models.PositiveSmallIntegerField(unique=True)
    nombre = models.CharField(max_length=50)
    capacidad_maxima = models.PositiveIntegerField(default=1800)
    cantidad_actual_gallinas = models.PositiveIntegerField(default=1800)
    descripcion = models.CharField(max_length=255, blank=True, default="")
    activo = models.BooleanField(default=True, db_index=True)
    creado_en = models.DateTimeField(auto_now_add=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Galpón"
        verbose_name_plural = "Galpones"
        ordering = ["numero"]

    def __str__(self) -> str:
        return f"Galpón {self.numero} ({self.cantidad_actual_gallinas}/{self.capacidad_maxima} aves)"


class ProduccionDiaria(models.Model):
    HUEVOS_POR_MAPLE: int = 30

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        related_name="producciones_registradas",
        db_index=True,
    )
    galpon = models.ForeignKey(
        Galpon,
        on_delete=models.PROTECT,
        related_name="producciones",
        db_index=True,
    )
    tipo_huevo = models.CharField(
        max_length=20,
        choices=TipoHuevo.choices,
        db_index=True,
    )
    cantidad_huevos = models.PositiveIntegerField(
        help_text="Huevos comerciales aptos (en unidades: maples * 30).",
        validators=[MinValueValidator(0)],
    )
    cantidad_huevos_rotos = models.PositiveIntegerField(
        default=0,
        help_text="Huevos no comerciales por roturas o anomalías (unidades).",
        validators=[MinValueValidator(0)],
    )
    fecha = models.DateField(default=timezone.now, db_index=True)
    creado_en = models.DateTimeField(auto_now_add=True, db_index=True)
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Producción Diaria"
        verbose_name_plural = "Producciones Diarias"
        ordering = ["-fecha", "-creado_en"]
        indexes = [
            models.Index(fields=["fecha", "galpon"]),
            models.Index(fields=["tipo_huevo", "fecha"]),
        ]
        constraints = [
            models.CheckConstraint(
                condition=models.Q(cantidad_huevos__gte=0),
                name="check_produccion_cantidad_huevos_positiva",
            ),
            models.CheckConstraint(
                condition=models.Q(cantidad_huevos_rotos__gte=0),
                name="check_produccion_huevos_rotos_positiva",
            ),
        ]

    def __str__(self) -> str:
        maples = self.cantidad_huevos // self.HUEVOS_POR_MAPLE
        return f"{self.fecha} | Galpón {self.galpon.numero} | {maples} maples {self.get_tipo_huevo_display()}"


class StockHuevo(models.Model):
    HUEVOS_POR_MAPLE: int = 30

    tipo_huevo = models.CharField(
        max_length=20,
        choices=TipoHuevo.choices,
        unique=True,
        db_index=True,
    )
    cantidad_disponible = models.PositiveIntegerField(
        default=0,
        help_text="Total de unidades comerciales aptas disponibles en depósito.",
    )
    actualizado_en = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Stock de Huevos"
        verbose_name_plural = "Stock de Huevos"

    def __str__(self) -> str:
        maples = self.cantidad_disponible // self.HUEVOS_POR_MAPLE
        return f"{self.get_tipo_huevo_display()}: {maples} maples ({self.cantidad_disponible} u.)"