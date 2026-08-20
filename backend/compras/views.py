from decimal import Decimal
from django.db.models import Q, Sum
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from users.permissions import IsAdminRole
from .models import Gasto
from .serializers import GastoSerializer


class GastoViewSet(viewsets.ModelViewSet):
    queryset = Gasto.objects.all()
    serializer_class = GastoSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                Q(descripcion__icontains=search) |
                Q(categoria__icontains=search)
            )
        return queryset

    @action(detail=False, methods=['get'], url_path='total')
    def total(self, request):
        gastos_filtrados = self.filter_queryset(self.get_queryset())
        total_acumulado = gastos_filtrados.aggregate(
            total=Sum('monto')
        )['total'] or Decimal('0.00')

        return Response(
            {'total': total_acumulado},
            status=status.HTTP_200_OK
        )