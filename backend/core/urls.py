from django.contrib import admin
from django.urls import path, include

from core.views import HealthCheckView

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', HealthCheckView.as_view(), name='health-check'),
    path('api/auth/', include('users.urls')),
    path('api/compras/', include('compras.urls')),
    path('api/clientes/', include('clientes.urls')),
    path('api/pedidos/', include('pedidos.urls')),
    path('api/produccion/', include('produccion.urls')),
    path('api/landing/', include('home.urls')),
    path('api/reportes/', include('reportes.urls')),
    path('api/notificaciones/', include('notificaciones.urls')),
]