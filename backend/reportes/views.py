from decimal import Decimal
from django.db.models import Sum
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from users.permissions import IsAdminRole
from pedidos.models import Pedido
from .serializers import MetricasComercialesSerializer

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminRole])
def obtener_metricas_comerciales(request):
   
    # 1. Cálculo de ventas del mes (ejemplo basado en pedidos cobrados)
    total_ventas = Pedido.objects.filter(estado_pago=True).aggregate(
        total=Sum('total')
    )['total'] or Decimal('0.00')

    # 2. Datos estructurados para el serializador
    datos_calculados = {
        'ventas_del_mes': total_ventas,
        'porcentaje_cambio_ventas': Decimal('12.00'), # Mock temporal o cálculo previo
        'produccion_diaria_promedio': Decimal('273.00'), # Mock temporal
        'ganancia_neta_mensual': total_ventas * Decimal('0.5'), # Ejemplo de cálculo base
        'evolucion_ventas_meses': [
            {'mes': 'Enero', 'total': 110000},
            {'mes': 'Febrero', 'total': 125000},
            {'mes': 'Marzo', 'total': 137000},
        ],
        'tendencia_produccion_meses': [
            {'mes': 'Enero', 'promedio': 250},
            {'mes': 'Febrero', 'promedio': 260},
            {'mes': 'Marzo', 'promedio': 273},
        ]
    }

    serializer = MetricasComercialesSerializer(data=datos_calculados)
    serializer.is_valid(raise_exception=True)
    
    return Response(serializer.data, status=status.HTTP_200_OK)


