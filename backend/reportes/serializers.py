from rest_framework import serializers

class MetricasComercialesSerializer(serializers.Serializer):
    # Datos para KPI
    ventas_del_mes = serializers.DecimalField(max_digits=12, decimal_places=2)
    porcentaje_cambio_ventas = serializers.DecimalField(max_digits=5, decimal_places=2)
    produccion_diaria_promedio = serializers.DecimalField(max_digits=8, decimal_places=2)
    ganancia_neta_mensual = serializers.DecimalField(max_digits=12, decimal_places=2)
    porcentaje_postura_mes = serializers.DecimalField(max_digits=5, decimal_places=2)
    # Datos para los gráficos 
    evolucion_ventas_meses = serializers.ListField(
        child=serializers.DictField(),
        help_text="Lista con el total de ventas agrupado por mes"
    )
    tendencia_produccion_meses = serializers.ListField(
        child=serializers.DictField(),
        help_text="Lista con el promedio de producción agrupado por mes"
    )