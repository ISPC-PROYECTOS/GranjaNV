from rest_framework import serializers
from .models import Notificacion


class NotificacionSerializer(serializers.ModelSerializer):
    tipo_display = serializers.CharField(source='get_tipo_display', read_only=True)

    class Meta:
        model = Notificacion
        fields = [
            'id',
            'tipo',
            'tipo_display',
            'titulo',
            'mensaje',
            'leida',
            'ruta',
            'fecha_referencia',
            'datos_extra',
            'creada_en',
        ]
        read_only_fields = fields