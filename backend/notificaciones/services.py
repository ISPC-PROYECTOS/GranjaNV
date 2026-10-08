from datetime import date
from django.contrib.auth import get_user_model
from django.db import IntegrityError, models, transaction
from django.utils import timezone
from pedidos.models import Pedido
from .models import Notificacion

Usuario = get_user_model()


def verificar_pedidos_pendientes_del_dia(usuario: Usuario) -> None:
    """Genera de forma idempotente la notificación de pedidos del día para administradores."""
    if usuario.rol != 'Administrador' and not usuario.is_superuser:
        return

    hoy: date = timezone.localdate()

    if Notificacion.objects.filter(
        usuario=usuario,
        tipo=Notificacion.TipoNotificacion.PEDIDOS_DEL_DIA,
        fecha_referencia=hoy,
    ).exists():
        return

    pedidos_pendientes_hoy: int = Pedido.objects.filter(
        fecha_entrega=hoy,
        estado_entrega=False,
    ).count()

    if pedidos_pendientes_hoy > 0:
        texto_plural = 's' if pedidos_pendientes_hoy > 1 else ''
        try:
            with transaction.atomic():
                Notificacion.objects.create(
                    usuario=usuario,
                    tipo=Notificacion.TipoNotificacion.PEDIDOS_DEL_DIA,
                    titulo='Entregas del día',
                    mensaje=f'Hay {pedidos_pendientes_hoy} pedido{texto_plural} pendiente{texto_plural} de entrega programado{texto_plural} para hoy.',
                    ruta='/dashboard/admin/ventas?seccion=pendientes',
                    fecha_referencia=hoy,
                    datos_extra={'cantidad_pedidos': pedidos_pendientes_hoy},
                )
        except IntegrityError:
            pass


def notificar_movimiento_gallinas_a_admins(movimiento, usuario_creador: Usuario) -> None:
    """
    Notifica a los administradores activos excepto al propio usuario que realizó la carga.
    """
    administradores = Usuario.objects.filter(
        models.Q(rol__iexact='Administrador') | models.Q(is_superuser=True),
        is_active=True,
    ).exclude(pk=usuario_creador.pk).distinct()

    if not administradores.exists():
        return

    notificaciones = [
        Notificacion(
            usuario=admin,
            tipo=Notificacion.TipoNotificacion.MOVIMIENTO_GALLINAS,
            titulo='Nuevo movimiento de gallinas',
            mensaje=(
                f'{usuario_creador.nombre} {usuario_creador.apellido} registró '
                f'{movimiento.cantidad_gallinas} aves ({movimiento.get_tipo_movimiento_display().lower()}) '
                f'en {movimiento.galpon.nombre}.'
            ),
            ruta='/dashboard/produccion',
            datos_extra={
                'movimiento_id': movimiento.id,
                'galpon_id': movimiento.galpon_id,
            },
        )
        for admin in administradores
    ]

    Notificacion.objects.bulk_create(notificaciones)