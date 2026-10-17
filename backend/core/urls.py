from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def health_check(request):
    """
    Endpoint ultra-liviano para monitoreo y pings de keep-alive.
    No toca base de datos ni ejecuta lógica de DRF.
    """
    return HttpResponse("ok", content_type="text/plain", status=200)

urlpatterns = [
    path("api/health/", health_check, name="health_check"),

    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/compras/', include('compras.urls')),
    path('api/clientes/', include('clientes.urls')),
    path('api/pedidos/', include('pedidos.urls')),
    path('api/produccion/', include('produccion.urls')),
    path('api/landing/', include('home.urls')),
    path('api/reportes/', include('reportes.urls')),
    path('api/notificaciones/', include('notificaciones.urls')),
]