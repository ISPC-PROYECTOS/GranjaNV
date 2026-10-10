from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import NotificacionViewSet

router = DefaultRouter()
router.register(r'', NotificacionViewSet, basename='notificacion')

urlpatterns = [
    path('', include(router.urls)),
]