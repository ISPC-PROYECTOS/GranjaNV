from django.db import transaction
from django.db.models import Q, QuerySet
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from users.permissions import IsAdminRole

from .models import Pedido
from .serializers import PedidoReadSerializer, PedidoWriteSerializer


class PedidoViewSet(viewsets.ModelViewSet):
    queryset = Pedido.objects.select_related("cliente").prefetch_related("items").all()
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"]:
            return PedidoReadSerializer
        return PedidoWriteSerializer

    def get_queryset(self) -> QuerySet[Pedido]:
        qs = super().get_queryset()

        # Filtro de pedidos pendientes (pago o entrega sin completar)
        pendientes = self.request.query_params.get("pendientes", None)
        if pendientes is not None and pendientes.lower() == "true":
            qs = qs.filter(Q(estado_pago=False) | Q(estado_entrega=False))

        # Buscador por datos de cliente o dirección
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

    @transaction.atomic
    def perform_destroy(self, instance: Pedido) -> None:
        # Hook listo para el próximo Sprint:
        # ProduccionService.restituir_stock(instance.items.all())
        instance.delete()

    @action(detail=True, methods=["patch"], url_path="toggle-pago")
    def toggle_pago(self, request, pk=None):
        pedido = self.get_object()
        pedido.estado_pago = not pedido.estado_pago
        pedido.save(update_fields=["estado_pago"])
        return Response(PedidoReadSerializer(pedido).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"], url_path="toggle-entrega")
    def toggle_entrega(self, request, pk=None):
        pedido = self.get_object()
        pedido.estado_entrega = not pedido.estado_entrega
        pedido.save(update_fields=["estado_entrega"])
        return Response(PedidoReadSerializer(pedido).data, status=status.HTTP_200_OK)
