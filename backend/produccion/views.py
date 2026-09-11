from typing import Any

from core.mixins import RangoFechaMixin
from django.db.models import QuerySet
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response

from .models import Galpon, ProduccionDiaria, StockHuevo
from .serializers import (
    GalponSerializer,
    ProduccionDiariaReadSerializer,
    ProduccionDiariaWriteSerializer,
    StockHuevoSerializer,
)


class ProduccionDiariaViewSet(RangoFechaMixin, viewsets.ModelViewSet):
    queryset = ProduccionDiaria.objects.select_related("usuario", "galpon").all()
    permission_classes = [IsAuthenticated]
    fecha_campo = "fecha"

    def get_serializer_class(self):
        if self.action in ["list", "retrieve"]:
            return ProduccionDiariaReadSerializer
        return ProduccionDiariaWriteSerializer

    def get_queryset(self) -> QuerySet[ProduccionDiaria]:
        qs = super().get_queryset()
        galpon_id = self.request.query_params.get("galpon")
        tipo_huevo = self.request.query_params.get("tipo_huevo")

        if galpon_id:
            qs = qs.filter(galpon_id=galpon_id)
        if tipo_huevo:
            qs = qs.filter(tipo_huevo=tipo_huevo.upper())
        return qs

    def perform_create(self, serializer: Any) -> None:
        serializer.save(usuario=self.request.user)

    @action(detail=False, methods=["get"], url_path="stock")
    def stock(self, request: Request) -> Response:
        """Consulta el stock actual disponible en maples y unidades."""
        stock_qs = StockHuevo.objects.all().order_by("tipo_huevo")
        serializer = StockHuevoSerializer(stock_qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class GalponViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Galpon.objects.filter(activo=True)
    serializer_class = GalponSerializer
    permission_classes = [IsAuthenticated]
