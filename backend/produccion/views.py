from django.db.models import Sum, Value
from django.db.models.functions import Coalesce
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from pedidos.models import ItemPedido
from .models import Galpon, MovimientoGallina, RegistroProduccion, ItemProduccionHuevo
from .serializers import (
    GalponSerializer,
    MovimientoGallinaSerializer,
    RegistroProduccionWriteSerializer,
    DatosProduccionResponseSerializer,
)
from notificaciones.services import notificar_movimiento_gallinas_a_admins


class GalponViewSet(viewsets.ModelViewSet):
    queryset = Galpon.objects.all()
    serializer_class = GalponSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        solo_activos = self.request.query_params.get("solo_activos", None)
        if solo_activos and solo_activos.lower() == "true":
            qs = qs.filter(activo=True)
        return qs


class MovimientoGallinaViewSet(viewsets.ModelViewSet):
    queryset = MovimientoGallina.objects.select_related('galpon').all()
    serializer_class = MovimientoGallinaSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        movimiento = serializer.save(usuario=self.request.user)
        notificar_movimiento_gallinas_a_admins(movimiento, self.request.user)


class ProduccionViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=["post"], url_path="huevos")
    def registrar_huevos(self, request):
        serializer = RegistroProduccionWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        registro = serializer.save()
        return Response(
            {"id": registro.id, "mensaje": "Producción registrada exitosamente."},
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["get"], url_path="metricas")
    def metricas(self, request):
        """
        Calcula el stock físico real disponible en galpón:
        Stock = (Huevos Recolectados) - (Huevos Entregados en Pedidos)
        """
        total_gallinas = (
            Galpon.objects.filter(activo=True).aggregate(
                total=Coalesce(Sum("cantidad_actual_gallinas"), Value(0))
            )["total"]
        )

        # 1. Huevos ingresados a depósito por recolección diaria
        recoleccion_qs = (
            ItemProduccionHuevo.objects.values("tipo_huevo")
            .annotate(total=Coalesce(Sum("cantidad_huevos"), Value(0)))
        )
        recolectados = {item["tipo_huevo"]: item["total"] for item in recoleccion_qs}

        # 2. Huevos egresados físicamente por pedidos entregados
        entregas_qs = (
            ItemPedido.objects.filter(pedido__estado_entrega=True)
            .values("tipo_huevo")
            .annotate(total=Coalesce(Sum("cantidad_unidades"), Value(0)))
        )
        entregados = {item["tipo_huevo"]: item["total"] for item in entregas_qs}

        tipos_maple = [
            ItemPedido.TipoHuevo.COLOR_1,
            ItemPedido.TipoHuevo.COLOR_2,
            ItemPedido.TipoHuevo.BLANCO_1,
            ItemPedido.TipoHuevo.BLANCO_2,
            ItemPedido.TipoHuevo.MIXTO,
        ]

        maples_stock: dict[str, int] = {}
        total_maples_disponibles = 0

        for tipo in tipos_maple:
            huevos_ingresados = recolectados.get(tipo, 0)
            huevos_salidos = entregados.get(tipo, 0)
            huevos_netos = huevos_ingresados - huevos_salidos

            maples = int(huevos_netos // ItemProduccionHuevo.HUEVOS_POR_MAPLE)
            maples_stock[tipo] = maples
            total_maples_disponibles += maples

        total_mermas = (
            RegistroProduccion.objects.aggregate(
                total=Coalesce(Sum("huevos_rotos"), Value(0))
            )["total"]
        )

        payload = {
            "total_maples": total_maples_disponibles,
            "total_gallinas": total_gallinas,
            "maples_color_2": maples_stock[ItemPedido.TipoHuevo.COLOR_2],
            "maples_color_1": maples_stock[ItemPedido.TipoHuevo.COLOR_1],
            "maples_blanco_2": maples_stock[ItemPedido.TipoHuevo.BLANCO_2],
            "maples_blanco_1": maples_stock[ItemPedido.TipoHuevo.BLANCO_1],
            "mixtos": maples_stock[ItemPedido.TipoHuevo.MIXTO],
            "mermas": total_mermas,
        }

        serializer = DatosProduccionResponseSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)