from django.contrib import admin
from .models import Cliente


@admin.register(Cliente)
class ClienteAdmin(admin.ModelAdmin):
    list_display = (
        'nombre',
        'apellido',
        'telefono',
        'direccion',
        'tipo',
        'activo',
        'creado_en',
    )
    list_filter = ('tipo', 'activo')
    search_fields = ('nombre', 'apellido', 'telefono', 'direccion')

