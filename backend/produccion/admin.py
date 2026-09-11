from django.contrib import admin, messages
from django.db import transaction
from django.db.models import QuerySet
from django.http import HttpRequest

from .models import Galpon, ProduccionDiaria, StockHuevo
from .services import InventarioService


@admin.register(Galpon)
class GalponAdmin(admin.ModelAdmin):
    list_display = (
        "numero",
        "nombre",
        "cantidad_actual_gallinas",
        "capacidad_maxima",
        "porcentaje_ocupacion_display",
        "activo",
        "actualizado_en",
    )
    list_filter = ("activo",)
    search_fields = ("nombre", "descripcion")
    readonly_fields = ("creado_en", "actualizado_en")
    ordering = ("numero",)

    @admin.display(description="% Ocupación")
    def porcentaje_ocupacion_display(self, obj: Galpon) -> str:
        if obj.capacidad_maxima == 0:
            return "0.0%"
        porcentaje = (obj.cantidad_actual_gallinas / obj.capacidad_maxima) * 100
        return f"{porcentaje:.1f}%"


@admin.register(ProduccionDiaria)
class ProduccionDiariaAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "fecha",
        "galpon",
        "tipo_huevo",
        "cantidad_maples_display",
        "cantidad_huevos",
        "cantidad_huevos_rotos",
        "usuario_nombre_display",
        "creado_en",
    )
    list_filter = ("tipo_huevo", "galpon", "fecha")
    search_fields = (
        "galpon__nombre",
        "usuario__nombre",
        "usuario__apellido",
        "usuario__email",
    )
    date_hierarchy = "fecha"
    readonly_fields = ("creado_en", "actualizado_en")
    autocomplete_fields = ("galpon",)

    def get_queryset(self, request: HttpRequest) -> QuerySet[ProduccionDiaria]:
        return (
            super()
            .get_queryset(request)
            .select_related("usuario", "galpon")
        )

    @admin.display(description="Maples Aptos")
    def cantidad_maples_display(self, obj: ProduccionDiaria) -> str:
        return f"{obj.cantidad_huevos // ProduccionDiaria.HUEVOS_POR_MAPLE} maples"

    @admin.display(description="Cargado por")
    def usuario_nombre_display(self, obj: ProduccionDiaria) -> str:
        return f"{obj.usuario.nombre} {obj.usuario.apellido}".strip() or obj.usuario.email

    def save_model(
        self,
        request: HttpRequest,
        obj: ProduccionDiaria,
        form: dict,
        change: bool,
    ) -> None:
        if not change:
            # Asignar automáticamente el usuario autenticado del Admin si no fue seleccionado
            if not getattr(obj, "usuario_id", None):
                obj.usuario = request.user

            with transaction.atomic():
                super().save_model(request, obj, form, change)
                # Incrementar el inventario comercial disponible
                InventarioService.ingresar_produccion(
                    tipo_huevo=obj.tipo_huevo,
                    cantidad_unidades=obj.cantidad_huevos,
                )
        else:
            # En modo edición dentro del Django Admin, advertir que no se recalcula stock automático
            super().save_model(request, obj, form, change)
            self.message_user(
                request,
                "La edición de cargas existentes no ajusta retrospectivamente el stock comercial. Verifique la tabla de Stock.",
                level=messages.WARNING,
            )


@admin.register(StockHuevo)
class StockHuevoAdmin(admin.ModelAdmin):
    list_display = (
        "tipo_huevo",
        "cantidad_maples_display",
        "cantidad_disponible",
        "actualizado_en",
    )
    readonly_fields = ("tipo_huevo", "actualizado_en")
    ordering = ("tipo_huevo",)

    @admin.display(description="Maples Disponibles")
    def cantidad_maples_display(self, obj: StockHuevo) -> str:
        return f"{obj.cantidad_disponible // StockHuevo.HUEVOS_POR_MAPLE} maples"

    def has_add_permission(self, request: HttpRequest) -> bool:
        # Los 4 tipos de stock se siembran en la migración inicial; no deben agregarse más
        return False

    def has_delete_permission(self, request: HttpRequest, obj: StockHuevo = None) -> bool:
        # Prevenir borrado accidental de los acumuladores de stock
        return False