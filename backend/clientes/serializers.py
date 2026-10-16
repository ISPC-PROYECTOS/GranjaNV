import re
from typing import Any
from rest_framework import serializers
from .models import Cliente

class ClienteSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(
        source='get_tipo_display',
        read_only=True,
    )
    nombre_completo = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Cliente
        fields = [
            'id',
            'nombre',
            'apellido',
            'nombre_completo',
            'telefono',
            'direccion',
            'email',
            'tipo',
            'tipo_display',
            'activo',
            'creado_en',
            'actualizado_en',
        ]
        read_only_fields = ['id', 'creado_en', 'actualizado_en']

    def get_nombre_completo(self, obj: Cliente) -> str:
        return f"{obj.nombre} {obj.apellido}".strip()

    def validate_nombre(self, value: str) -> str:
        valor_limpio = value.strip().upper()
        if not valor_limpio:
            raise serializers.ValidationError('El nombre no puede estar vacío.')

        patron_texto = r'^[A-ZÁÉÍÓÚÑa-záéíóúñ0-9\s\.\,\-]+$'
        if not re.match(patron_texto, valor_limpio):
            raise serializers.ValidationError('El nombre contiene caracteres no permitidos.')

        return valor_limpio

    def validate_apellido(self, value: str) -> str:
        if not value:
            return ''
        valor_limpio = value.strip().upper()
        patron_texto = r'^[A-ZÁÉÍÓÚÑa-záéíóúñ\s\.\-]+$'
        if not re.match(patron_texto, valor_limpio):
            raise serializers.ValidationError('El apellido solo puede contener letras.')
        return valor_limpio

    def validate_telefono(self, value: str) -> str:
        valor_limpio = value.strip()
        if not valor_limpio:
            raise serializers.ValidationError('El teléfono no puede estar vacío.')

        patron_telefono = r'^\+?[\d\s-]+$'
        if not re.match(patron_telefono, valor_limpio):
            raise serializers.ValidationError('El teléfono no puede contener letras ni caracteres especiales.')

        solo_numeros = re.sub(r'\D', '', valor_limpio)
        if len(solo_numeros) < 7:
            raise serializers.ValidationError('El teléfono debe contener al menos 7 dígitos numéricos.')

        return valor_limpio

    def validate_direccion(self, value: str) -> str:
        valor_limpio = value.strip()
        if not valor_limpio:
            raise serializers.ValidationError('La dirección no puede estar vacía.')
        if len(valor_limpio) < 5:
            raise serializers.ValidationError(
                'Ingresá una dirección más específica (calle y altura o referencia).'
            )
        return valor_limpio

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        nombre = attrs.get('nombre', getattr(self.instance, 'nombre', '')).strip().upper()
        apellido = attrs.get('apellido', getattr(self.instance, 'apellido', '')).strip().upper()

        # Validación de duplicidad compuesta activa
        queryset = Cliente.objects.filter(
            nombre__iexact=nombre,
            apellido__iexact=apellido,
            activo=True,
        )
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            nombre_mostrar = f"{nombre} {apellido}".strip()
            raise serializers.ValidationError({
                'nombre': (
                    f"Ya existe un registro activo para '{nombre_mostrar}'. "
                    "Si es un homónimo, agregá un identificador distintivo en el nombre (ej. segundo nombre, apodo o sucursal)."
                )
            })

        return attrs