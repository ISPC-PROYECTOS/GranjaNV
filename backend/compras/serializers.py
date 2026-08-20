from rest_framework import serializers
from .models import Gasto


class GastoSerializer(serializers.ModelSerializer):
    categoria_display = serializers.CharField(
        source='get_categoria_display',
        read_only=True
    )

    class Meta:
        model = Gasto
        fields = [
            'id',
            'monto',
            'categoria',
            'categoria_display',
            'descripcion',
            'fecha',
            'creado_en',
            'actualizado_en',
        ]
        read_only_fields = ['id', 'creado_en', 'actualizado_en']

    def validate_monto(self, value):
        if value <= 0:
            raise serializers.ValidationError('El monto debe ser mayor a 0.')
        return value