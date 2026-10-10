from django.db.models import Q
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated

from users.permissions import IsAdminRole
from .models import Cliente
from .serializers import ClienteSerializer


class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        queryset = super().get_queryset()
        incluir_inactivos = self.request.query_params.get('incluir_inactivos', '').lower() == 'true'
        if incluir_inactivos:
            queryset = Cliente.objects.all()

        search = self.request.query_params.get('search', None)

        if search:
            termino = search.strip()
            queryset = queryset.filter(
                Q(nombre__icontains=termino) |
                Q(apellido__icontains=termino) |
                Q(telefono__icontains=termino)
            )
        return queryset

    def perform_destroy(self, instance):
        # Soft delete para preservar relaciones de pedidos
        instance.activo = False
        instance.save()


