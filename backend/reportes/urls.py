from django.urls import path
from .views import obtener_metricas_comerciales

urlpatterns = [
    path('metricas-comerciales/', obtener_metricas_comerciales, name='metricas-comerciales'),
]