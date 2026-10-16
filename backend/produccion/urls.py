from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import GalponViewSet, MovimientoGallinaViewSet, ProduccionViewSet

router = DefaultRouter()
router.register(r"galpones", GalponViewSet, basename="galpon")
router.register(r"movimiento-gallinas", MovimientoGallinaViewSet, basename="movimiento-gallina")
router.register(r"", ProduccionViewSet, basename="produccion")

urlpatterns = [
    path("", include(router.urls)),
]