from django.contrib import admin
from .models import Galpon, MovimientoGallina, RegistroProduccion, ItemProduccionHuevo


class ItemProduccionHuevoInline(admin.TabularInline):
    model = ItemProduccionHuevo
    extra = 0
    min_num = 1
    fields = ('tipo_huevo', 'cantidad_huevos')


@admin.register(Galpon)
class GalponAdmin(admin.ModelAdmin):
    list_display = (
        'numero_galpon',
        'nombre',
        'capacidad_maxima',
        'cantidad_inicial_gallinas',
        'cantidad_actual_gallinas',
        'activo',
        'creado_en',
    )
    list_filter = ('activo',)
    search_fields = ('nombre', 'numero_galpon')
    ordering = ('numero_galpon',)
    readonly_fields = ('creado_en', 'actualizado_en')


@admin.register(MovimientoGallina)
class MovimientoGallinaAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'galpon',
        'fecha',
        'tipo_movimiento',
        'motivo_movimiento',
        'cantidad_gallinas',
        'creado_en',
    )
    list_filter = ('tipo_movimiento', 'motivo_movimiento', 'fecha', 'galpon')
    search_fields = ('descripcion_movimiento', 'galpon__nombre')
    date_hierarchy = 'fecha'
    readonly_fields = ('creado_en', 'actualizado_en')


@admin.register(RegistroProduccion)
class RegistroProduccionAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'galpon',
        'fecha',
        'total_maples',
        'huevos_rotos',
        'creado_en',
    )
    list_filter = ('galpon', 'fecha')
    date_hierarchy = 'fecha'
    readonly_fields = ('creado_en', 'actualizado_en')
    inlines = [ItemProduccionHuevoInline]