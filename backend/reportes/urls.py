from django.urls import path
from .views import reporte_finanzas, exportar_finanzas_pdf, exportar_finanzas_excel, reporte_produccion, exportar_produccion_pdf, exportar_produccion_excel, reporte_completo, exportar_completo_pdf, exportar_completo_excel

urlpatterns = [
    path("finanzas/", reporte_finanzas, name="reporte-finanzas"),
    path("finanzas/pdf/", exportar_finanzas_pdf, name="exportar-finanzas-pdf"),
    path("finanzas/excel/", exportar_finanzas_excel, name="exportar-finanzas-excel"),
    path("produccion/", reporte_produccion, name="reporte-produccion"),
    path("produccion/pdf/", exportar_produccion_pdf, name="exportar-produccion-pdf"),
    path("produccion/excel/", exportar_produccion_excel, name="exportar-produccion-excel"),
    path("completo/", reporte_completo, name="reporte_completo"),
    path("completo/pdf/", exportar_completo_pdf, name="exportar-completo-pdf"),
    path("completo/excel/", exportar_completo_excel, name="exportar-completo-excel"),
]