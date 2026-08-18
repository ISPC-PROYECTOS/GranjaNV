from django.urls import path
from . import views

urlpatterns = [
    path('recetas/', views.obtener_recetas, name='obtener_recetas'),
]