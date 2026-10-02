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

        datos_mongo = {}

        for clave, valor in datos.items():
            if isinstance(valor, Decimal):
                datos_mongo[clave] = float(valor)
            else:
                datos_mongo[clave] = valor

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

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, 720, "Resumen de producción")

    pdf.setFont("Helvetica", 11)
    pdf.drawString(
        50,
        695,
        f"Total producido: {datos['total_maples']} maples",
    )
    pdf.drawString(
        50,
        675,
        f"Mermas: {datos['mermas']} huevos",
    )

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, 635, "Producción por tipo")

    y = 610

    for tipo, cantidad in datos["produccion_por_tipo"].items():
        nombre_tipo = tipo.replace("_", " ").title()
        pdf.drawString(
            50,
            y,
            f"{nombre_tipo}: {cantidad} maples",
        )
        y -= 20

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

    hoja.append(["Resumen"])
    hoja.append(["Total producido", datos["total_maples"], "maples"])
    hoja.append(["Mermas", datos["mermas"], "huevos"])
    hoja.append([])

    hoja.append(["Producción por tipo", "Maples"])

    for tipo, cantidad in datos["produccion_por_tipo"].items():
        nombre_tipo = tipo.replace("_", " ").title()
        hoja.append([nombre_tipo, cantidad])

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

    total_ingresos = datos["ingresos"]
    total_egresos = datos["egresos"]
    balance_neto = datos["balance_neto"]

    registrar_exportacion(
        request.user,
        "finanzas",
        "pdf",
        fecha_desde,
        fecha_hasta,
        datos,
    )

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

    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, 720, "Resumen financiero")

    pdf.setFont("Helvetica", 11)
    pdf.drawString(50, 695, f"Ingresos: ${total_ingresos}")
    pdf.drawString(50, 675, f"Egresos: ${total_egresos}")
    pdf.drawString(50, 655, f"Balance neto: ${balance_neto}")

    pdf.showPage()
    pdf.save()

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

    total_ingresos = datos["ingresos"]
    total_egresos = datos["egresos"]
    balance_neto = datos["balance_neto"]

    registrar_exportacion(
        request.user,
        "finanzas",
        "excel",
        fecha_desde,
        fecha_hasta,
        datos,
    )

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
        content_type=(
            "application/vnd.openxmlformats-officedocument."
            "spreadsheetml.sheet"
        ),
    )

    response["Content-Disposition"] = (
        'attachment; filename="reporte_finanzas.xlsx"'
    )

    return response