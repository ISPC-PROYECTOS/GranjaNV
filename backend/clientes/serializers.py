from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from .models import Cliente


class ClienteSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(
        max_length=120,
        validators=[
            UniqueValidator(
                queryset=Cliente.objects.all(),
                message="Ya existe un cliente registrado con este nombre.",
            )
        ],
    )
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

    def validate_telefono(self, value):
        valor_limpio = value.strip()
        if not valor_limpio:
            raise serializers.ValidationError('El teléfono no puede estar vacío.')
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