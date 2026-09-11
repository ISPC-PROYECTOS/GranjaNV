from django.db import transaction
from django.db.models import F
from rest_framework.exceptions import ValidationError

from .models import StockHuevo, TipoHuevo


class InventarioService:
    @staticmethod
    @transaction.atomic
    def ingresar_produccion(tipo_huevo: str, cantidad_unidades: int) -> None:
        """Incrementa el stock disponible tras una recolección diaria."""
        if cantidad_unidades <= 0:
            return

        stock, _ = StockHuevo.objects.select_for_update().get_or_create(
            tipo_huevo=tipo_huevo,
            defaults={"cantidad_disponible": 0},
        )
        StockHuevo.objects.filter(pk=stock.pk).update(
            cantidad_disponible=F("cantidad_disponible") + cantidad_unidades
        )

    @staticmethod
    @transaction.atomic
    def descontar_stock(tipo_huevo: str, cantidad_unidades: int) -> None:
        """Descuenta stock al momento de marcar un pedido como entregado."""
        if cantidad_unidades <= 0:
            return

        stock = (
            StockHuevo.objects.select_for_update()
            .filter(tipo_huevo=tipo_huevo)
            .first()
        )

        if not stock or stock.cantidad_disponible < cantidad_unidades:
            disponibles_maples = (stock.cantidad_disponible // 30) if stock else 0
            solicitados_maples = cantidad_unidades // 30
            etiqueta = dict(TipoHuevo.choices).get(tipo_huevo, tipo_huevo)
            raise ValidationError(
                f"No hay stock suficiente para entregar {etiqueta}. "
                f"Disponible: {disponibles_maples} maples, Requerido: {solicitados_maples} maples."
            )

        StockHuevo.objects.filter(pk=stock.pk).update(
            cantidad_disponible=F("cantidad_disponible") - cantidad_unidades
        )

    @staticmethod
    @transaction.atomic
    def revertir_descuento_stock(tipo_huevo: str, cantidad_unidades: int) -> None:
        """Restaura el stock si un pedido entregado pasa a no entregado o se anula."""
        if cantidad_unidades <= 0:
            return

        stock, _ = StockHuevo.objects.select_for_update().get_or_create(
            tipo_huevo=tipo_huevo,
            defaults={"cantidad_disponible": 0},
        )
        StockHuevo.objects.filter(pk=stock.pk).update(
            cantidad_disponible=F("cantidad_disponible") + cantidad_unidades
        )