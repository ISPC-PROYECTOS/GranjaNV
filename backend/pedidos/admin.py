from decimal import Decimal
from django.contrib import admin, messages
from django.db import transaction
from django.db.models import QuerySet
from django.http import HttpRequest
from rest_framework.exceptions import ValidationError

from produccion.services import InventarioService
from .models import ItemPedido, Pedido


class ItemPedidoInline(admin.TabularInline):
    model = ItemPedido
    extra = 0
    fields = (
        "tipo_huevo",
        "cantidad_maples_display",
        "cantidad_unidades",
        "precio_unitario",
        "subtotal",
    )
    readonly_fields = ("cantidad_maples_display", "subtotal")

    @admin.display(description="Maples")
    def cantidad_maples_display(self, obj: ItemPedido) -> str:
        if obj.cantidad_unidades is None:
            return "0 maples"
        return f"{obj.cantidad_unidades // ItemPedido.HUEVOS_POR_MAPLE} maples"


@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "cliente",
        "fecha_entrega",
        "estado_pago",
        "estado_entrega",
        "total",
        "resumen_productos_display",
        "creado_en",
    )
    list_filter = ("estado_pago", "estado_entrega", "fecha_entrega")
    search_fields = (
        "cliente__nombre",
        "cliente__apellido",
        "cliente__telefono",
        "observaciones",
    )
    date_hierarchy = "fecha_entrega"
    readonly_fields = ("total", "creado_en", "actualizado_en")
    inlines = [ItemPedidoInline]
    actions = ["marcar_como_entregado", "revertir_entrega", "marcar_como_pagado"]

    def get_queryset(self, request: HttpRequest) -> QuerySet[Pedido]:
        return (
            super()
            .get_queryset(request)
            .select_related("cliente")
            .prefetch_related("items")
        )

    @admin.display(description="Resumen Productos")
    def resumen_productos_display(self, obj: Pedido) -> str:
        partes = [
            f"{item.cantidad_unidades // ItemPedido.HUEVOS_POR_MAPLE} maples {item.get_tipo_huevo_display()}"
            for item in obj.items.all()
        ]
        return ", ".join(partes) if partes else "Sin productos"

    @admin.action(description="Marcar pedidos seleccionados como ENTREGADOS (descontar stock)")
    def marcar_como_entregado(self, request: HttpRequest, queryset: QuerySet[Pedido]) -> None:
        pedidos_procesados = 0
        for pedido in queryset.filter(estado_entrega=False):
            try:
                with transaction.atomic():
                    for item in pedido.items.all():
                        InventarioService.descontar_stock(
                            tipo_huevo=item.tipo_huevo,
                            cantidad_unidades=item.cantidad_unidades,
                        )
                    pedido.estado_entrega = True
                    pedido.save(update_fields=["estado_entrega"])
                    pedidos_procesados += 1
            except ValidationError as err:
                self.message_user(
                    request,
                    f"Error en Pedido #{pedido.pk}: {err.detail[0] if isinstance(err.detail, list) else err.detail}",
                    level=messages.ERROR,
                )

        if pedidos_procesados > 0:
            self.message_user(
                request,
                f"Se marcaron {pedidos_procesados} pedido(s) como entregados y se actualizó el stock.",
                level=messages.SUCCESS,
            )

    @admin.action(description="Revertir entrega de pedidos seleccionados (restituir stock)")
    def revertir_entrega(self, request: HttpRequest, queryset: QuerySet[Pedido]) -> None:
        pedidos_revertidos = 0
        with transaction.atomic():
            for pedido in queryset.filter(estado_entrega=True):
                for item in pedido.items.all():
                    InventarioService.revertir_descuento_stock(
                        tipo_huevo=item.tipo_huevo,
                        cantidad_unidades=item.cantidad_unidades,
                    )
                pedido.estado_entrega = False
                pedido.save(update_fields=["estado_entrega"])
                pedidos_revertidos += 1

        self.message_user(
            request,
            f"Se revirtió la entrega de {pedidos_revertidos} pedido(s) y se repuso el stock.",
            level=messages.INFO,
        )

    @admin.action(description="Marcar pedidos seleccionados como PAGADOS")
    def marcar_como_pagado(self, request: HttpRequest, queryset: QuerySet[Pedido]) -> None:
        actualizados = queryset.update(estado_pago=True)
        self.message_user(
            request,
            f"{actualizados} pedido(s) marcados como pagados.",
            level=messages.SUCCESS,
        )

    def delete_model(self, request: HttpRequest, obj: Pedido) -> None:
        with transaction.atomic():
            if obj.estado_entrega:
                for item in obj.items.all():
                    InventarioService.revertir_descuento_stock(
                        tipo_huevo=item.tipo_huevo,
                        cantidad_unidades=item.cantidad_unidades,
                    )
            super().delete_model(request, obj)

    def delete_queryset(self, request: HttpRequest, queryset: QuerySet[Pedido]) -> None:
        with transaction.atomic():
            for pedido in queryset.filter(estado_entrega=True):
                for item in pedido.items.all():
                    InventarioService.revertir_descuento_stock(
                        tipo_huevo=item.tipo_huevo,
                        cantidad_unidades=item.cantidad_unidades,
                    )
            super().delete_queryset(request, queryset)