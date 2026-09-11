from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import GalponViewSet, ProduccionDiariaViewSet

router = DefaultRouter()
router.register(r"galpones", GalponViewSet, basename="galpon")
router.register(r"cargas", ProduccionDiariaViewSet, basename="produccion-diaria")

urlpatterns = [
    path("", include(router.urls)),
]