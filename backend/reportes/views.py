from decimal import Decimal
from datetime import datetime, timezone
from io import BytesIO
import pymongo

from django.conf import settings
from django.db.models import Sum
from django.http import HttpResponse
from django.utils import timezone as dj_timezone

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas
from openpyxl import Workbook

from users.permissions import IsAdminRole
from pedidos.models import Pedido
from compras.models import Gasto
from .serializers import MetricasComercialesSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminRole])
def obtener_metricas_comerciales(request):
    """
    Endpoint para calcular los KPIs comerciales conectando 
    con Pedidos y Gastos reales de la base de datos para la US-08.
    """
    hoy = dj_timezone.now()
    mes_actual = hoy.month
    anio_actual = hoy.year

    # 1. Ventas del mes actual (Pedidos cobrados: estado_pago=True)
    total_ventas = Pedido.objects.filter(
        estado_pago=True,
        fecha_entrega__year=anio_actual,
        fecha_entrega__month=mes_actual
    ).aggregate(total=Sum('total'))['total'] or Decimal('0.00')

    # 2. Gastos operativos del mes actual (Para calcular la ganancia neta)
    total_gastos = Gasto.objects.filter(
        fecha__year=anio_actual,
        fecha__month=mes_actual
    ).aggregate(total=Sum('monto'))['total'] or Decimal('0.00')

    # Ganancia neta = Ventas cobradas menos los gastos del mes
    ganancia_neta = total_ventas - total_gastos

    # 3. Datos estructurados para el serializador
    datos_calculados = {
        'ventas_del_mes': total_ventas,
        'porcentaje_cambio_ventas': Decimal('0.00'),
        'produccion_diaria_promedio': Decimal('0.00'),
        'ganancia_neta_mensual': ganancia_neta,
        'evolucion_ventas_meses': [
            {'mes': 'Mes actual', 'total': float(total_ventas)},
        ],
        'tendencia_produccion_meses': [
            {'mes': 'Mes actual', 'promedio': 0},
        ]
    }

    serializer = MetricasComercialesSerializer(data=datos_calculados)
    serializer.is_valid(raise_exception=True)
    
    return Response(serializer.data, status=status.HTTP_200_OK)


def obtener_datos_finanzas(fecha_desde, fecha_hasta):
    ventas = Pedido.objects.filter(estado_pago=True)
    gastos = Gasto.objects.all()

    if fecha_desde:
        ventas = ventas.filter(fecha_entrega__gte=fecha_desde)
        gastos = gastos.filter(fecha__gte=fecha_desde)

    if fecha_hasta:
        ventas = ventas.filter(fecha_entrega__lte=fecha_hasta)
        gastos = gastos.filter(fecha__lte=fecha_hasta)

    total_ingresos = ventas.aggregate(
        total=Sum("total")
    )["total"] or Decimal("0.00")

    total_egresos = gastos.aggregate(
        total=Sum("monto")
    )["total"] or Decimal("0.00")

    balance_neto = total_ingresos - total_egresos

    return {
        "ingresos": total_ingresos,
        "egresos": total_egresos,
        "balance_neto": balance_neto,
    }


def registrar_exportacion(
    usuario,
    formato,
    fecha_desde,
    fecha_hasta,
    datos,
):
    cliente = pymongo.MongoClient(settings.MONGO_URI)
    db = cliente["granjanv_reportes"]
    coleccion = db["exportaciones"]

    registro = {
        "tipo": "finanzas",
        "formato": formato,
        "fecha_desde": fecha_desde,
        "fecha_hasta": fecha_hasta,
        "ingresos": float(datos["ingresos"]),
        "egresos": float(datos["egresos"]),
        "balance_neto": float(datos["balance_neto"]),
        "usuario": str(usuario),
        "fecha_generacion": datetime.now(timezone.utc),
    }

    coleccion.insert_one(registro)
    cliente.close()


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminRole])
def reporte_finanzas(request):
    fecha_desde = request.query_params.get("fecha_desde")
    fecha_hasta = request.query_params.get("fecha_hasta")

    datos = obtener_datos_finanzas(fecha_desde, fecha_hasta)
    return Response(datos)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminRole])
def exportar_finanzas_pdf(request):
    fecha_desde = request.query_params.get("fecha_desde")
    fecha_hasta = request.query_params.get("fecha_hasta")

    datos = obtener_datos_finanzas(fecha_desde, fecha_hasta)
    total_ingresos = datos["ingresos"]
    total_egresos = datos["egresos"]
    balance_neto = datos["balance_neto"]

    registrar_exportacion(request.user, "pdf", fecha_desde, fecha_hasta, datos)

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    pdf.setTitle("Reporte de Finanzas")

    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(50, 790, "Reporte de Finanzas")

    pdf.setFont("Helvetica", 11)
    pdf.drawString(50, 765, f"Período: {fecha_desde} al {fecha_hasta}")

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, 720, "Resumen financiero")

    pdf.setFont("Helvetica", 11)
    pdf.drawString(50, 695, f"Ingresos: ${total_ingresos}")
    pdf.drawString(50, 675, f"Egresos: ${total_egresos}")
    pdf.drawString(50, 655, f"Balance neto: ${balance_neto}")

    pdf.showPage()
    pdf.save()
    buffer.seek(0)

    response = HttpResponse(buffer.getvalue(), content_type="application/pdf")
    response["Content-Disposition"] = 'attachment; filename="reporte_finanzas.pdf"'
    return response


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminRole])
def exportar_finanzas_excel(request):
    fecha_desde = request.query_params.get("fecha_desde")
    fecha_hasta = request.query_params.get("fecha_hasta")

    datos = obtener_datos_finanzas(fecha_desde, fecha_hasta)
    total_ingresos = datos["ingresos"]
    total_egresos = datos["egresos"]
    balance_neto = datos["balance_neto"]

    registrar_exportacion(request.user, "excel", fecha_desde, fecha_hasta, datos)   

    workbook = Workbook()
    hoja = workbook.active
    hoja.title = "Finanzas"

    hoja.append(["Reporte de Finanzas"])
    hoja.append(["Período", f"{fecha_desde} al {fecha_hasta}"])
    hoja.append([])
    hoja.append(["Concepto", "Monto"])
    hoja.append(["Ingresos", total_ingresos])
    hoja.append(["Egresos", total_egresos])
    hoja.append(["Balance neto", balance_neto])

    buffer = BytesIO()
    workbook.save(buffer)
    buffer.seek(0)

    response = HttpResponse(
        buffer.getvalue(),
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    response["Content-Disposition"] = 'attachment; filename="reporte_finanzas.xlsx"'
    return response