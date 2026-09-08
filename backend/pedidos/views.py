from core.mixins import RangoFechaMixin
from django.db import transaction
from django.db.models import Q, QuerySet
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from users.permissions import IsAdminRole

from .models import Pedido
from .serializers import PedidoReadSerializer, PedidoWriteSerializer


class PedidoViewSet(RangoFechaMixin, viewsets.ModelViewSet):
    queryset = Pedido.objects.select_related("cliente").prefetch_related("items").all()
    permission_classes = [IsAuthenticated, IsAdminRole]
    fecha_campo = "fecha_entrega"

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"]:
            return PedidoReadSerializer
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

    @transaction.atomic
    def perform_destroy(self, instance: Pedido) -> None:
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
