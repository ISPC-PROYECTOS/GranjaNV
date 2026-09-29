from django.db.models import Sum, Q
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from pedidos.models import ItemPedido
from users.permissions import IsAdminRole
from .models import Galpon, MovimientoGallina, RegistroProduccion, ItemProduccionHuevo
from .serializers import (
    GalponSerializer,
    MovimientoGallinaSerializer,
    RegistroProduccionWriteSerializer,
    DatosProduccionResponseSerializer,
)


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
    queryset = MovimientoGallina.objects.select_related("galpon").all()
    serializer_class = MovimientoGallinaSerializer
    permission_classes = [IsAuthenticated]


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
        Calcula las métricas de producción y existencias consolidadas.
        """
        total_gallinas = (
            Galpon.objects.filter(activo=True).aggregate(total=Sum("cantidad_actual_gallinas"))["total"]
            or 0
        )

        huevos_por_tipo = (
            ItemProduccionHuevo.objects.values("tipo_huevo")
            .annotate(total_huevos=Sum("cantidad_huevos"))
        )

        maples_dict = {
            "COLOR_1": 0,
            "COLOR_2": 0,
            "BLANCO_1": 0,
            "BLANCO_2": 0,
            "MIXTO": 0,
        }

        total_huevos_aptos = 0
        for item in huevos_por_tipo:
            tipo = item["tipo_huevo"]
            if tipo in maples_dict:
                maples = item["total_huevos"] // ItemProduccionHuevo.HUEVOS_POR_MAPLE
                maples_dict[tipo] = maples
                total_huevos_aptos += item["total_huevos"]

        total_mermas = (
            RegistroProduccion.objects.aggregate(total=Sum("huevos_rotos"))["total"] or 0
        )

        total_maples = total_huevos_aptos // ItemProduccionHuevo.HUEVOS_POR_MAPLE

        payload = {
            "total_maples": total_maples,
            "total_gallinas": total_gallinas,
            "maples_color_2": maples_dict["COLOR_2"],
            "maples_color_1": maples_dict["COLOR_1"],
            "maples_blanco_2": maples_dict["BLANCO_2"],
            "maples_blanco_1": maples_dict["BLANCO_1"],
            "mixtos": maples_dict["MIXTO"],
            "mermas": total_mermas,
        }

        serializer = DatosProduccionResponseSerializer(data=payload)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data, status=status.HTTP_200_OK)