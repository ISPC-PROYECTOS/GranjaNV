from django.urls import path
from .views import (
    exportar_finanzas_excel,
    exportar_finanzas_pdf,
    obtener_metricas_comerciales,
    reporte_finanzas,
)

urlpatterns = [
    path("metricas-comerciales/", obtener_metricas_comerciales, name="metricas-comerciales"),
    path("finanzas/", reporte_finanzas, name="reporte-finanzas"),
    path("finanzas/pdf/", exportar_finanzas_pdf, name="exportar-finanzas-pdf"),
    path("finanzas/excel/", exportar_finanzas_excel, name="exportar-finanzas-excel"),
]