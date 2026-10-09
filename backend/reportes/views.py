from decimal import Decimal
from datetime import datetime, timezone, timedelta
from io import BytesIO


import pymongo
from openpyxl import Workbook
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

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
from produccion.models import RegistroProduccion, Galpon
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
    dias_transcurridos = max(hoy.day, 1)

    # Ventas del mes actual (Pedidos cobrados: estado_pago=True)
    total_ventas = Pedido.objects.filter(
        estado_pago=True,
        fecha_entrega__year=anio_actual,
        fecha_entrega__month=mes_actual
    ).aggregate(total=Sum('total'))['total'] or Decimal('0.00')

    #  Gastos operativos del mes actual (Para calcular la ganancia neta)
    total_gastos = Gasto.objects.filter(
        fecha__year=anio_actual,
        fecha__month=mes_actual
    ).aggregate(total=Sum('monto'))['total'] or Decimal('0.00')

    ganancia_neta = total_ventas - total_gastos

    # Cálculos de Producción y Porcentaje de Postura del mes actual
    registros_mes = RegistroProduccion.objects.filter(
        fecha__year=anio_actual,
        fecha__month=mes_actual
    )
    total_maples_mes = registros_mes.aggregate(total=Sum('total_maples'))['total'] or 0
    
    # Producción diaria promedio de maples
    produccion_diaria_promedio = round( Decimal(total_maples_mes) / Decimal(dias_transcurridos), 2)   # Total de gallinas activas en la granja
    total_gallinas_activas = Galpon.objects.filter(activo=True).aggregate(
        total=Sum('cantidad_actual_gallinas')
    )['total'] or 0

    porcentaje_postura = Decimal('0.00')
    if total_gallinas_activas > 0 and dias_transcurridos > 0:
        total_huevos_mes = total_maples_mes * 30
        
        porcentaje_postura = round(Decimal(total_huevos_mes) / (Decimal(total_gallinas_activas * dias_transcurridos)) * Decimal('100.00'), 2)
        

# 1. Capturar parámetros de fecha opcionales desde el query string (?fecha_desde=...&fecha_hasta=...)
    str_fecha_desde = request.GET.get('fecha_desde')
    str_fecha_hasta = request.GET.get('fecha_hasta')

    tendencia_produccion_meses = []
    nombres_meses_es = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    nivel_descripcion = "Vista mensual"
    if str_fecha_desde and str_fecha_hasta:
        try:
            f_desde = datetime.strptime(str_fecha_desde, '%Y-%m-%d').date()
            f_hasta = datetime.strptime(str_fecha_hasta, '%Y-%m-%d').date()
            delta_dias = (f_hasta - f_desde).days

            # NIVEL 1: Por Día (Rango corto <= 31 días)
            if delta_dias <= 31:
                nivel_descripcion = "Vista diaria"
                fecha_cursor = f_desde
                while fecha_cursor <= f_hasta:
                    maples_dia = RegistroProduccion.objects.filter(fecha=fecha_cursor).aggregate(total=Sum('total_maples'))['total'] or 0
                    tendencia_produccion_meses.append({
                        'mes': fecha_cursor.strftime('%d/%m'),
                        'promedio': float(maples_dia)
                    })
                    fecha_cursor += timedelta(days=1)

            # NIVEL 2: Por Semana / Intervalos de 7 días (Rango intermedio entre 32 y 120 días)
            elif delta_dias <= 120:
                nivel_descripcion = "Vista semanal"
                fecha_cursor = f_desde
                semana_num = 1
                while fecha_cursor <= f_hasta:
                    fin_semana = min(fecha_cursor + timedelta(days=6), f_hasta)
                    maples_semana = RegistroProduccion.objects.filter(
                        fecha__gte=fecha_cursor,
                        fecha__lte=fin_semana
                    ).aggregate(total=Sum('total_maples'))['total'] or 0
                    
                    tendencia_produccion_meses.append({
                        'mes': fecha_cursor.strftime("%d/%m"),
                        'promedio': float(maples_semana)
                    })
                    fecha_cursor = fin_semana + timedelta(days=1)
                    semana_num += 1

            # NIVEL 3: Por Mes (Rango largo > 120 días)
            else:
                nivel_descripcion = "Vista mensual"
                fecha_cursor = f_desde.replace(day=1)
                while fecha_cursor <= f_hasta:
                    m_year = fecha_cursor.year
                    m_month = fecha_cursor.month
                    maples_m = RegistroProduccion.objects.filter(
                        fecha__year=m_year,
                        fecha__month=m_month
                    ).aggregate(total=Sum('total_maples'))['total'] or 0
                    
                    nombre_etiqueta = f"{nombres_meses_es[m_month - 1]} {m_year}" if m_year != anio_actual else nombres_meses_es[m_month - 1]
                    tendencia_produccion_meses.append({
                        'mes': nombre_etiqueta,
                        'promedio': float(maples_m)
                    })
                    # Avanzar al siguiente mes
                    if m_month == 12:
                        fecha_cursor = fecha_cursor.replace(year=m_year + 1, month=1)
                    else:
                        fecha_cursor = fecha_cursor.replace(month=m_month + 1)

        except ValueError:
            # Fallback por seguridad si el formato de fecha no es válido
            pass

    # Si no se mandaron fechas o falló el parseo, se mantiene el comportamiento por defecto (año actual mes a mes)
    if not tendencia_produccion_meses:
        for m in range(1, mes_actual + 1):
            maples_mes_m = RegistroProduccion.objects.filter(
                fecha__year=anio_actual,
                fecha__month=m
            ).aggregate(total=Sum('total_maples'))['total'] or 0
            
            tendencia_produccion_meses.append({
                'mes': nombres_meses_es[m - 1],
                'promedio': float(maples_mes_m)
            })


    # Datos estructurados para el serializador
    datos_calculados = {
        'ventas_del_mes': total_ventas,
        'porcentaje_cambio_ventas': Decimal('0.00'),
        'produccion_diaria_promedio': produccion_diaria_promedio,
        'porcentaje_postura_mes': porcentaje_postura,
        'ganancia_neta_mensual': ganancia_neta,
        'evolucion_ventas_meses': [{'mes': 'Mes actual', 'total': float(total_ventas)}],
        'tendencia_produccion_meses': tendencia_produccion_meses,
        'nivel_descripcion': nivel_descripcion,
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

def obtener_datos_produccion(fecha_desde, fecha_hasta):
    registros = RegistroProduccion.objects.all()

    if fecha_desde:
        registros = registros.filter(fecha__gte=fecha_desde)

    if fecha_hasta:
        registros = registros.filter(fecha__lte=fecha_hasta)

    total_maples = registros.aggregate(
        total=Sum("total_maples")
    )["total"] or 0

    total_mermas = registros.aggregate(
        total=Sum("huevos_rotos")
    )["total"] or 0

    items = ItemProduccionHuevo.objects.filter(
        registro__in=registros
    )

    produccion_por_tipo = {}

    for tipo, _ in ItemProduccionHuevo._meta.get_field("tipo_huevo").choices:
        cantidad_huevos = items.filter(
            tipo_huevo=tipo
        ).aggregate(
            total=Sum("cantidad_huevos")
        )["total"] or 0

        produccion_por_tipo[tipo] = (
            cantidad_huevos // ItemProduccionHuevo.HUEVOS_POR_MAPLE
        )

    return {
        "total_maples": total_maples,
        "mermas": total_mermas,
        "produccion_por_tipo": produccion_por_tipo,
    }

def agregar_finanzas_pdf(pdf, datos, y):
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, y, "RESUMEN FINANCIERO")

    pdf.setFont("Helvetica", 11)
    pdf.drawString(50, y - 25, f"Ingresos: ${datos['ingresos']}")
    pdf.drawString(50, y - 45, f"Egresos: ${datos['egresos']}")
    pdf.drawString(50, y - 65, f"Balance neto: ${datos['balance_neto']}")

    return y - 105

def agregar_produccion_pdf(pdf, datos, y):
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, y, "RESUMEN DE PRODUCCIÓN")

    pdf.setFont("Helvetica", 11)
    pdf.drawString(
        50,
        y - 25,
        f"Total producido: {datos['total_maples']} maples",
    )
    pdf.drawString(
        50,
        y - 45,
        f"Mermas: {datos['mermas']} huevos",
    )

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, y - 85, "Producción por tipo")

    pdf.setFont("Helvetica", 11)
    y -= 100

    for tipo, cantidad in datos["produccion_por_tipo"].items():
        nombre_tipo = tipo.replace("_", " ").title()
        pdf.drawString(50, y, f"{nombre_tipo}: {cantidad} maples")
        y -= 20

    return y

def agregar_finanzas_excel(hoja, datos):
    hoja.append(["Concepto", "Monto"])
    hoja.append(["Ingresos", datos["ingresos"]])
    hoja.append(["Egresos", datos["egresos"]])
    hoja.append(["Balance neto", datos["balance_neto"]])

def agregar_produccion_excel(hoja, datos):
    hoja.append(["Resumen"])
    hoja.append(["Total producido", datos["total_maples"], "maples"])
    hoja.append(["Mermas", datos["mermas"], "huevos"])
    hoja.append([])

    hoja.append(["Producción por tipo", "Maples"])

    for tipo, cantidad in datos["produccion_por_tipo"].items():
        nombre_tipo = tipo.replace("_", " ").title()
        hoja.append([nombre_tipo, cantidad])

def convertir_para_mongo(valor):
    if isinstance(valor, Decimal):
        return float(valor)

    if isinstance(valor, dict):
        return {
            clave: convertir_para_mongo(dato)
            for clave, dato in valor.items()
        }

    if isinstance(valor, list):
        return [convertir_para_mongo(dato) for dato in valor]

    return valor

def registrar_exportacion(
    usuario,
    tipo,
    formato,
    fecha_desde,
    fecha_hasta,
    datos,
):
    cliente = pymongo.MongoClient(settings.MONGO_URI)

    try:
        db = cliente["granjanv_reportes"]
        coleccion = db["exportaciones"]

        datos_mongo = convertir_para_mongo(datos)

        registro = {
            "tipo": tipo,
            "formato": formato,
            "fecha_desde": fecha_desde,
            "fecha_hasta": fecha_hasta,
            "datos": datos_mongo,
            "usuario": str(usuario),
            "fecha_generacion": datetime.now(timezone.utc),
        }

        coleccion.insert_one(registro)

    finally:
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
def reporte_produccion(request):
    fecha_desde = request.query_params.get("fecha_desde")
    fecha_hasta = request.query_params.get("fecha_hasta")

    datos = obtener_datos_produccion(fecha_desde, fecha_hasta)

    return Response(datos)

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminRole])
def exportar_produccion_pdf(request):
    fecha_desde = request.query_params.get("fecha_desde")
    fecha_hasta = request.query_params.get("fecha_hasta")

    datos = obtener_datos_produccion(fecha_desde, fecha_hasta)

    buffer = BytesIO()

    pdf = canvas.Canvas(buffer, pagesize=A4)
    pdf.setTitle("Reporte de Producción")

    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(50, 790, "Reporte de Producción")

    pdf.setFont("Helvetica", 11)
    pdf.drawString(
        50,
        765,
        f"Período: {fecha_desde} al {fecha_hasta}",
    )

    agregar_produccion_pdf(pdf, datos, 720)

    pdf.showPage()
    pdf.save()

    registrar_exportacion(
        request.user,
        "produccion",
        "pdf",
        fecha_desde,
        fecha_hasta,
        datos,
    )

    buffer.seek(0)

    response = HttpResponse(
        buffer.getvalue(),
        content_type="application/pdf",
    )
    response["Content-Disposition"] = (
        'attachment; filename="reporte_produccion.pdf"'
    )

    return response

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminRole])
def exportar_produccion_excel(request):
    fecha_desde = request.query_params.get("fecha_desde")
    fecha_hasta = request.query_params.get("fecha_hasta")

    datos = obtener_datos_produccion(fecha_desde, fecha_hasta)

    workbook = Workbook()
    hoja = workbook.active
    hoja.title = "Producción"

    hoja.append(["Reporte de Producción"])
    hoja.append(["Período", f"{fecha_desde} al {fecha_hasta}"])
    hoja.append([])

    agregar_produccion_excel(hoja, datos)

    buffer = BytesIO()
    workbook.save(buffer)

    registrar_exportacion(
        request.user,
        "produccion",
        "excel",
        fecha_desde,
        fecha_hasta,
        datos,
    )

    buffer.seek(0)

    response = HttpResponse(
        buffer.getvalue(),
        content_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
    )
    response["Content-Disposition"] = (
        'attachment; filename="reporte_produccion.xlsx"'
    )

    return response

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminRole])
def exportar_finanzas_pdf(request):
    fecha_desde = request.query_params.get("fecha_desde")
    fecha_hasta = request.query_params.get("fecha_hasta")

    datos = obtener_datos_finanzas(fecha_desde, fecha_hasta)

    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=A4)
    pdf.setTitle("Reporte de Finanzas")

    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(50, 790, "Reporte de Finanzas")

    pdf.setFont("Helvetica", 11)
    pdf.drawString(
        50,
        765,
        f"Período: {fecha_desde} al {fecha_hasta}",
    )

    agregar_finanzas_pdf(pdf, datos, 720)

    pdf.showPage()
    pdf.save()

    registrar_exportacion(
        request.user,
        "finanzas",
        "pdf",
        fecha_desde,
        fecha_hasta,
        datos,
    )

    buffer.seek(0)

    response = HttpResponse(
        buffer.getvalue(),
        content_type="application/pdf",
    )
    response["Content-Disposition"] = (
        'attachment; filename="reporte_finanzas.pdf"'
    )

    return response


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminRole])
def exportar_finanzas_excel(request):
    fecha_desde = request.query_params.get("fecha_desde")
    fecha_hasta = request.query_params.get("fecha_hasta")

    datos = obtener_datos_finanzas(fecha_desde, fecha_hasta)

    workbook = Workbook()
    hoja = workbook.active
    hoja.title = "Finanzas"

    hoja.append(["Reporte de Finanzas"])
    hoja.append(["Período", f"{fecha_desde} al {fecha_hasta}"])
    hoja.append([])

    agregar_finanzas_excel(hoja, datos)

    buffer = BytesIO()
    workbook.save(buffer)

    registrar_exportacion(
        request.user,
        "finanzas",
        "excel",
        fecha_desde,
        fecha_hasta,
        datos,
    )

    buffer.seek(0)

    response = HttpResponse(
        buffer.getvalue(),
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    )
    response["Content-Disposition"] = (
        'attachment; filename="reporte_finanzas.xlsx"'
    )

    return response

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminRole])
def exportar_completo_pdf(request):
    fecha_desde = request.query_params.get("fecha_desde")
    fecha_hasta = request.query_params.get("fecha_hasta")

    finanzas = obtener_datos_finanzas(fecha_desde, fecha_hasta)
    produccion = obtener_datos_produccion(fecha_desde, fecha_hasta)

    datos = {
        "finanzas": finanzas,
        "produccion": produccion,
    }

    buffer = BytesIO()

    pdf = canvas.Canvas(buffer, pagesize=A4)
    pdf.setTitle("INFORME COMPLETO")

    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(50, 790, "INFORME COMPLETO")

    pdf.setFont("Helvetica", 11)
    pdf.drawString(
        50,
        765,
        f"Período: {fecha_desde} al {fecha_hasta}",
    )

    y = agregar_finanzas_pdf(pdf, finanzas, 730)
    agregar_produccion_pdf(pdf, produccion, y)

    pdf.showPage()
    pdf.save()

    registrar_exportacion(
        request.user,
        "completo",
        "pdf",
        fecha_desde,
        fecha_hasta,
        datos,
    )

    buffer.seek(0)

    response = HttpResponse(
        buffer.getvalue(),
        content_type="application/pdf",
    )
    response["Content-Disposition"] = (
        'attachment; filename="informe_completo.pdf"'
    )

    return response

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminRole])
def exportar_completo_excel(request):
    fecha_desde = request.query_params.get("fecha_desde")
    fecha_hasta = request.query_params.get("fecha_hasta")

    finanzas = obtener_datos_finanzas(fecha_desde, fecha_hasta)
    produccion = obtener_datos_produccion(fecha_desde, fecha_hasta)

    datos = {
        "finanzas": finanzas,
        "produccion": produccion,
    }

    workbook = Workbook()

    # Hoja Finanzas
    hoja_finanzas = workbook.active
    hoja_finanzas.title = "Finanzas"

    hoja_finanzas.append(["Informe Completo - Finanzas"])
    hoja_finanzas.append(
        ["Período", f"{fecha_desde} al {fecha_hasta}"]
    )
    hoja_finanzas.append([])

    agregar_finanzas_excel(hoja_finanzas, finanzas)

    # Hoja Producción
    hoja_produccion = workbook.create_sheet("Producción")

    hoja_produccion.append(["Informe Completo - Producción"])
    hoja_produccion.append(
        ["Período", f"{fecha_desde} al {fecha_hasta}"]
    )
    hoja_produccion.append([])

    agregar_produccion_excel(hoja_produccion, produccion)

    buffer = BytesIO()
    workbook.save(buffer)

    registrar_exportacion(
        request.user,
        "completo",
        "excel",
        fecha_desde,
        fecha_hasta,
        datos,
    )

    buffer.seek(0)

    response = HttpResponse(
        buffer.getvalue(),
        content_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
    )
    response["Content-Disposition"] = (
        'attachment; filename="informe_completo.xlsx"'
    )

    return response