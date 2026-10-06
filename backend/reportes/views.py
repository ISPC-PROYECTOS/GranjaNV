from datetime import datetime, timezone
from decimal import Decimal
from io import BytesIO

import pymongo
from openpyxl import Workbook
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

from django.conf import settings
from django.db.models import Sum
from django.http import HttpResponse

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from compras.models import Gasto
from pedidos.models import Pedido
from produccion.models import ItemProduccionHuevo, RegistroProduccion
from users.permissions import IsAdminRole

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
def reporte_produccion(request):
    fecha_desde = request.query_params.get("fecha_desde")
    fecha_hasta = request.query_params.get("fecha_hasta")

    datos = obtener_datos_produccion(fecha_desde, fecha_hasta)

    return Response(datos)

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminRole])
def reporte_finanzas(request):
    fecha_desde = request.query_params.get("fecha_desde")
    fecha_hasta = request.query_params.get("fecha_hasta")

    datos = obtener_datos_finanzas(fecha_desde, fecha_hasta)

    return Response(datos)

@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminRole])
def reporte_completo(request):
    fecha_desde = request.query_params.get("fecha_desde")
    fecha_hasta = request.query_params.get("fecha_hasta")

    finanzas = obtener_datos_finanzas(fecha_desde, fecha_hasta)
    produccion = obtener_datos_produccion(fecha_desde, fecha_hasta)

    datos = {
        "finanzas": finanzas,
        "produccion": produccion,
    }

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
        content_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
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