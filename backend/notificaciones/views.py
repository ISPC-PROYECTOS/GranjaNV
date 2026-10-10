from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from users.permissions import IsAdminRole
from .models import Notificacion
from .serializers import NotificacionSerializer
from .services import verificar_pedidos_pendientes_del_dia


class NotificacionViewSet(viewsets.ModelViewSet):
    serializer_class = NotificacionSerializer
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get_queryset(self):
        usuario = self.request.user
        verificar_pedidos_pendientes_del_dia(usuario)
        return Notificacion.objects.filter(usuario=usuario)

    @action(detail=True, methods=['patch'], url_path='marcar-leida')
    def marcar_leida(self, request, pk=None) -> Response:
        notificacion = self.get_object()
        if not notificacion.leida:
            notificacion.leida = True
            notificacion.save(update_fields=['leida'])
        return Response(self.get_serializer(notificacion).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['patch'], url_path='marcar-todas-leidas')
    def marcar_todas_leidas(self, request) -> Response:
        actualizadas = self.get_queryset().filter(leida=False).update(leida=True)
        return Response({'actualizadas': actualizadas}, status=status.HTTP_200_OK)