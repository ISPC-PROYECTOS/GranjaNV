from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/compras/', include('compras.urls')),
    path('api/clientes/', include('clientes.urls')),
    path('api/pedidos/', include('pedidos.urls')),
    path('api/landing/', include('home.urls')),
    path('api/produccion/', include('produccion.urls')),
]