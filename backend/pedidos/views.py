from decimal import Decimal

from core.mixins import RangoFechaMixin
from django.db import transaction
from django.db.models import Q, QuerySet, Sum
from produccion.services import InventarioService
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from users.permissions import IsAdminRole

from .models import Pedido
from .serializers import (
    MetricasDashboardSerializer,
    PedidoReadSerializer,
    PedidoWriteSerializer,
)


class PedidoViewSet(RangoFechaMixin, viewsets.ModelViewSet):
    queryset = Pedido.objects.select_related("cliente").prefetch_related("items").all()
    permission_classes = [IsAuthenticated, IsAdminRole]
    fecha_campo = "fecha_entrega"

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"]:
            return PedidoReadSerializer
        if self.action == "metricas":
            return MetricasDashboardSerializer
        return PedidoWriteSerializer

    def get_queryset(self) -> QuerySet[Pedido]:
        qs = super().get_queryset()

        pendientes = self.request.query_params.get("pendientes", None)
        cerrados = self.request.query_params.get("cerrados", None)

        if cerrados is not None and cerrados.lower() == "true":
            qs = qs.filter(estado_pago=True, estado_entrega=True)
        elif pendientes is not None and pendientes.lower() == "true":
            qs = qs.filter(Q(estado_pago=False) | Q(estado_entrega=False))

        search = self.request.query_params.get("search", None)
        if search:
            termino = search.strip()
            qs = qs.filter(
                Q(cliente__nombre__icontains=termino)
                | Q(cliente__apellido__icontains=termino)
                | Q(cliente__telefono__icontains=termino)
                | Q(cliente__direccion__icontains=termino)
            )
        return qs

    @action(detail=False, methods=["get"], url_path="metricas")
    def metricas(self, request) -> Response:
        """
        Calcula las métricas operativas para el dashboard mediante agregación SQL:
        1. Cantidad de pedidos pendientes (sin pagar o sin entregar).
        2. Total acumulado de ventas cobradas (estado_pago=True).
        """
        base_qs = Pedido.objects.all()

        pendientes_count: int = base_qs.filter(
            Q(estado_pago=False) | Q(estado_entrega=False)
        ).count()

        ventas_cobradas_total: Decimal = base_qs.filter(estado_pago=True).aggregate(
            total=Sum("total")
        )["total"] or Decimal("0.00")

        data = {
            "pedidos_pendientes": pendientes_count,
            "total_ventas_cobradas": str(ventas_cobradas_total),
        }
        serializer = MetricasDashboardSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @transaction.atomic
    def perform_destroy(self, instance: Pedido) -> None:
        instance.delete()

    @action(detail=True, methods=["patch"], url_path="toggle-pago")
    def toggle_pago(self, request, pk=None) -> Response:
        pedido = self.get_object()
        pedido.estado_pago = not pedido.estado_pago
        pedido.save(update_fields=["estado_pago"])
        return Response(PedidoReadSerializer(pedido).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"], url_path="toggle-entrega")
    @transaction.atomic
    def toggle_entrega(self, request, pk=None) -> Response:
        # select_for_update sobre el pedido para evitar dobles entregas concurrentes
        pedido = Pedido.objects.select_for_update().prefetch_related("items").get(pk=pk)

        nuevo_estado = not pedido.estado_entrega

        if nuevo_estado:
            # Pasa de NO ENTREGADO a ENTREGADO: Descuenta stock
            for item in pedido.items.all():
                InventarioService.descontar_stock(
                    tipo_huevo=item.tipo_huevo,
                    cantidad_unidades=item.cantidad_unidades,
                )
        else:
            # Pasa de ENTREGADO a NO ENTREGADO: Revierte y devuelve stock
            for item in pedido.items.all():
                InventarioService.revertir_descuento_stock(
                    tipo_huevo=item.tipo_huevo,
                    cantidad_unidades=item.cantidad_unidades,
                )

        pedido.estado_entrega = nuevo_estado
        pedido.save(update_fields=["estado_entrega"])
        return Response(PedidoReadSerializer(pedido).data, status=status.HTTP_200_OK)

    @transaction.atomic
    def perform_destroy(self, instance: Pedido) -> None:
        # Si el pedido estaba entregado, se devuelve el stock antes de eliminarlo
        if instance.estado_entrega:
            for item in instance.items.all():
                InventarioService.revertir_descuento_stock(
                    tipo_huevo=item.tipo_huevo,
                    cantidad_unidades=item.cantidad_unidades,
                )
        instance.delete()
