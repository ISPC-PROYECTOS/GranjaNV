import re
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

    def get_nombre_completo(self, obj):
        return f"{obj.nombre} {obj.apellido}".strip()

    def validate_nombre(self, value):
        valor_limpio = value.strip().upper()
        if not valor_limpio:
            raise serializers.ValidationError('El nombre no puede estar vacío.')

        # Valida que solo contenga letras (con tildes/ñ) y espacios
        patron_texto = r'^[A-ZÁÉÍÓÚÑa-záéíóúñ\s]+$'
        if not re.match(patron_texto, valor_limpio):
            raise serializers.ValidationError('El nombre solo puede contener letras.')

        # Verificación insensible a mayúsculas/minúsculas de duplicados
        queryset = Cliente.objects.filter(nombre__iexact=valor_limpio)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)

        if queryset.exists():
            raise serializers.ValidationError('Ya existe un cliente registrado con este nombre.')

        return valor_limpio

    def validate_apellido(self, value):
        if not value:
            return ''
        valor_limpio = value.strip().upper()
        patron_texto = r'^[A-ZÁÉÍÓÚÑa-záéíóúñ\s]+$'
        if not re.match(patron_texto, valor_limpio):
            raise serializers.ValidationError('El apellido solo puede contener letras.')
        return valor_limpio

    def validate_telefono(self, value):
        valor_limpio = value.strip()
        if not valor_limpio:
            raise serializers.ValidationError('El teléfono no puede estar vacío.')

        # Permite dígitos, espacios, guiones y un '+' opcional al comienzo (ej: +54 9 351 1234567)
        patron_telefono = r'^\+?[\d\s-]+$'
        if not re.match(patron_telefono, valor_limpio):
            raise serializers.ValidationError('El teléfono no puede contener letras ni caracteres especiales.')

        solo_numeros = re.sub(r'\D', '', valor_limpio)
        if len(solo_numeros) < 10:
            raise serializers.ValidationError('El teléfono debe contener al menos 10 dígitos numéricos.')

        return valor_limpio

    def validate_direccion(self, value):
        valor_limpio = value.strip()
        if not valor_limpio:
            raise serializers.ValidationError('La dirección no puede estar vacía.')
        if len(valor_limpio) < 5:
            raise serializers.ValidationError(
                'Ingresá una dirección más específica (calle y altura o referencia).'
            )
        return valor_limpio