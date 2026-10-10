import calendar
from datetime import timedelta
from decimal import Decimal
from django.db import transaction
from django.db.models import Q, QuerySet, Sum
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.mixins import RangoFechaMixin
from users.permissions import IsAdminRole
from .models import Pedido
from .serializers import (
    MetricasDashboardSerializer,
    PedidoReadSerializer,
    PedidoWriteSerializer,
)


class PedidoViewSet(RangoFechaMixin, viewsets.ModelViewSet):
    queryset = (
        Pedido.objects.select_related('cliente')
        .prefetch_related('items')
        .all()
    )
    permission_classes = [IsAuthenticated, IsAdminRole]
    fecha_campo = 'fecha_entrega'

    def get_serializer_class(self):
        if self.action in ['list', 'retrieve']:
            return PedidoReadSerializer
        if self.action == 'metricas':
            return MetricasDashboardSerializer
        return PedidoWriteSerializer

    def get_queryset(self) -> QuerySet[Pedido]:
        qs = super().get_queryset()

        pendientes = self.request.query_params.get('pendientes', None)
        cerrados = self.request.query_params.get('cerrados', None)

        if cerrados is not None and cerrados.lower() == 'true':
            qs = qs.filter(estado_pago=True, estado_entrega=True)
        elif pendientes is not None and pendientes.lower() == 'true':
            qs = qs.filter(Q(estado_pago=False) | Q(estado_entrega=False))

        search = self.request.query_params.get('search', None)
        if search:
            termino = search.strip()
            qs = qs.filter(
                Q(cliente__nombre__icontains=termino)
                | Q(cliente__apellido__icontains=termino)
                | Q(cliente__telefono__icontains=termino)
                | Q(cliente__direccion__icontains=termino)
            )
        return qs

    @action(detail=False, methods=['get'], url_path='metricas')
    def metricas(self, request) -> Response:
        """
        Calcula las métricas operativas para el panel administrativo:
        1. Pedidos pendientes de entrega o cobro.
        2. Ventas cobradas del mes en curso.
        3. Ventas cobradas del mes anterior.
        """
        base_qs: QuerySet[Pedido] = Pedido.objects.all()

        pendientes_count: int = base_qs.filter(
            Q(estado_pago=False) | Q(estado_entrega=False)
        ).count()

        hoy = timezone.localdate()

        # Rango del mes en curso
        inicio_mes_actual = hoy.replace(day=1)
        _, ultimo_dia_actual = calendar.monthrange(hoy.year, hoy.month)
        fin_mes_actual = hoy.replace(day=ultimo_dia_actual)

        # Rango del mes inmediatamente anterior
        fin_mes_anterior = inicio_mes_actual - timedelta(days=1)
        inicio_mes_anterior = fin_mes_anterior.replace(day=1)

        pedidos_cobrados = base_qs.filter(estado_pago=True)

        ventas_mes_actual: Decimal = (
            pedidos_cobrados.filter(
                fecha_entrega__gte=inicio_mes_actual,
                fecha_entrega__lte=fin_mes_actual,
            ).aggregate(total=Sum('total'))['total'] or Decimal('0.00')
        )

        ventas_mes_anterior: Decimal = (
            pedidos_cobrados.filter(
                fecha_entrega__gte=inicio_mes_anterior,
                fecha_entrega__lte=fin_mes_anterior,
            ).aggregate(total=Sum('total'))['total'] or Decimal('0.00')
        )

        data = {
            'pedidos_pendientes': pendientes_count,
            'total_ventas_cobradas': str(ventas_mes_actual),
            'ventas_mes_actual': str(ventas_mes_actual),
            'ventas_mes_anterior': str(ventas_mes_anterior),
        }

        serializer = MetricasDashboardSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @transaction.atomic
    def perform_destroy(self, instance: Pedido) -> None:
        instance.delete()

    @action(detail=True, methods=['patch'], url_path='toggle-pago')
    def toggle_pago(self, request, pk=None) -> Response:
        pedido = self.get_object()
        pedido.estado_pago = not pedido.estado_pago
        pedido.save(update_fields=['estado_pago'])
        return Response(PedidoReadSerializer(pedido).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='toggle-entrega')
    def toggle_entrega(self, request, pk=None) -> Response:
        pedido = self.get_object()
        pedido.estado_entrega = not pedido.estado_entrega
        pedido.save(update_fields=['estado_entrega'])
        return Response(PedidoReadSerializer(pedido).data, status=status.HTTP_200_OK)