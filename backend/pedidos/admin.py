from django.contrib import admin
from .models import ItemPedido, Pedido


class ItemPedidoInline(admin.TabularInline):
    model = ItemPedido
    extra = 0
    min_num = 1
    fields = (
        'tipo_huevo',
        'cantidad_unidades',
        'maples_estimados',
        'precio_unitario',
        'subtotal',
    )
    readonly_fields = ('maples_estimados',)

    @admin.display(description="Maples (30 u.)")
    def maples_estimados(self, obj: ItemPedido) -> str:
        if obj.pk:
            maples = obj.cantidad_unidades // ItemPedido.HUEVOS_POR_MAPLE
            sobrante = obj.cantidad_unidades % ItemPedido.HUEVOS_POR_MAPLE
            return f"{maples} maples" if sobrante == 0 else f"{maples} maples + {sobrante} u."
        return "-"


@admin.register(Pedido)
class PedidoAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'cliente',
        'fecha_entrega',
        'total',
        'estado_pago',
        'estado_entrega',
        'creado_en',
    )
    list_filter = (
        'estado_pago',
        'estado_entrega',
        'fecha_entrega',
    )
    search_fields = (
        'cliente__nombre',
        'cliente__apellido',
        'cliente__telefono',
        'observaciones',
    )
    date_hierarchy = 'fecha_entrega'
    ordering = ('-fecha_entrega', '-creado_en')
    readonly_fields = ('creado_en', 'actualizado_en')
    inlines = [ItemPedidoInline]
    actions = [
        'marcar_como_pagado',
        'marcar_como_entregado',
        'marcar_como_pendiente',
    ]

    @admin.action(description="Marcar pedidos seleccionados como PAGADOS")
    def marcar_como_pagado(self, request, queryset):
        filas_actualizadas = queryset.update(estado_pago=True)
        self.message_user(request, f"{filas_actualizadas} pedido(s) marcado(s) como pagado(s).")

    @admin.action(description="Marcar pedidos seleccionados como ENTREGADOS")
    def marcar_como_entregado(self, request, queryset):
        filas_actualizadas = queryset.update(estado_entrega=True)
        self.message_user(request, f"{filas_actualizadas} pedido(s) marcado(s) como entregado(s).")

    @admin.action(description="Reabrir pedidos (Poner entrega y pago en FALSO)")
    def marcar_como_pendiente(self, request, queryset):
        filas_actualizadas = queryset.update(estado_pago=False, estado_entrega=False)
        self.message_user(request, f"{filas_actualizadas} pedido(s) reabierto(s).")


@admin.register(ItemPedido)
class ItemPedidoAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'pedido',
        'tipo_huevo',
        'cantidad_unidades',
        'precio_unitario',
        'subtotal',
    )
    list_filter = ('tipo_huevo',)
    search_fields = ('pedido__cliente__nombre', 'pedido__cliente__apellido')