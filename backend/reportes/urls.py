from django.urls import path
from .views import reporte_finanzas, exportar_finanzas_pdf, exportar_finanzas_excel

urlpatterns = [
    path("finanzas/", reporte_finanzas, name="reporte-finanzas"),
    path("finanzas/pdf/", exportar_finanzas_pdf, name="exportar-finanzas-pdf"),
    path("finanzas/excel/", exportar_finanzas_excel, name="exportar-finanzas-excel"),
]