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
from pedidos.models import Pedido, ItemPedido
from produccion.models import ItemProduccionHuevo, RegistroProduccion, Galpon, MovimientoGallina
from users.permissions import IsAdminRole

from pathlib import Path
from reportlab.lib.utils import ImageReader

from openpyxl.drawing.image import Image as ExcelImage

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

    cantidad_ventas = ventas.count()

    ticket_promedio = (
        (total_ingresos / cantidad_ventas).quantize(Decimal("0.01"))
        if cantidad_ventas > 0
        else Decimal("0.00")
    )

    gastos_por_categoria = (
    gastos
    .values("categoria")
    .annotate(total=Sum("monto"))
    .order_by("categoria")
    )

    ventas_por_tipo = (
    ItemPedido.objects
    .filter(pedido__in=ventas)
    .values("tipo_huevo")
    .annotate(total=Sum("subtotal"))
    .order_by("tipo_huevo")
    )

    return {
        "ingresos": total_ingresos,
        "egresos": total_egresos,
        "balance_neto": balance_neto,
        "cantidad_ventas": cantidad_ventas,
        "ticket_promedio": ticket_promedio,
        "gastos_por_categoria": list(gastos_por_categoria),
        "ventas_por_tipo": list(ventas_por_tipo),
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

    total_huevos = items.aggregate(
    total=Sum("cantidad_huevos")
    )["total"] or 0

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

    galpones_activos = Galpon.objects.filter(activo=True)

    total_gallinas = galpones_activos.aggregate(
        total=Sum("cantidad_actual_gallinas")
    )["total"] or 0

    cantidad_galpones_activos = galpones_activos.count()

    movimientos = MovimientoGallina.objects.all()

    if fecha_desde:
        movimientos = movimientos.filter(fecha__gte=fecha_desde)

    if fecha_hasta:
        movimientos = movimientos.filter(fecha__lte=fecha_hasta)

    ingresos_gallinas = movimientos.filter(
        tipo_movimiento=MovimientoGallina.TipoMovimiento.INGRESO
    ).aggregate(
        total=Sum("cantidad_gallinas")
    )["total"] or 0

    salidas_gallinas = movimientos.filter(
        tipo_movimiento=MovimientoGallina.TipoMovimiento.SALIDA
    ).aggregate(
        total=Sum("cantidad_gallinas")
    )["total"] or 0

    mortalidad = movimientos.filter(
        motivo_movimiento=MovimientoGallina.MotivoMovimiento.MUERTE
    ).aggregate(
        total=Sum("cantidad_gallinas")
    )["total"] or 0

    return {
        "total_maples": total_maples,
        "mermas": total_mermas,
        "produccion_por_tipo": produccion_por_tipo,
        "total_gallinas": total_gallinas,
        "galpones_activos": cantidad_galpones_activos,
        "ingresos_gallinas": ingresos_gallinas,
        "salidas_gallinas": salidas_gallinas,
        "mortalidad": mortalidad,
        "total_huevos": total_huevos,
    }

def verificar_espacio_pdf(pdf, y, espacio_necesario=60):
    margen_inferior = 50

    if y - espacio_necesario < margen_inferior:
        pdf.showPage()
        return 800

    return y

def agregar_logo_pdf(pdf):
    ruta_logo = Path(__file__).resolve().parent / "assets" / "logo-granja.png"

    pdf.drawImage(
        ImageReader(str(ruta_logo)),
        480, 755,
        width=60,
        height=60,
        mask="auto",
    )

def agregar_logo_excel(hoja):
    ruta_logo = Path(__file__).resolve().parent / "assets" / "logo-granja.png"

    imagen = ExcelImage(str(ruta_logo))
    imagen.width = 65
    imagen.height = 65

    hoja.add_image(imagen, "D1")

def agregar_finanzas_pdf(pdf, datos, y):
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, y, "RESUMEN FINANCIERO")

    pdf.setFont("Helvetica", 11)
    y -= 25
    pdf.drawString(50, y, f"Ingresos: ${datos['ingresos']}")

    y -= 20
    pdf.drawString(50, y, f"Egresos: ${datos['egresos']}")

    y -= 20
    pdf.drawString(50, y, f"Balance neto: ${datos['balance_neto']}")

    y -= 20
    pdf.drawString(50, y, f"Ventas pagadas: {datos['cantidad_ventas']}")

    y -= 20
    pdf.drawString(50, y, f"Ticket promedio: ${datos['ticket_promedio']}")

    y -= 40
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, y, "INGRESOS POR TIPO DE PRODUCTO")

    pdf.setFont("Helvetica", 11)
    y -= 25

    for venta in datos["ventas_por_tipo"]:
        y = verificar_espacio_pdf(pdf, y)

        nombre_tipo = venta["tipo_huevo"].replace("_", " ").title()
        pdf.drawString(50, y, f"{nombre_tipo}: ${venta['total']}")
        y -= 20

    y -= 20
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, y, "GASTOS POR CATEGORÍA")

    pdf.setFont("Helvetica", 11)
    y -= 25

    for gasto in datos["gastos_por_categoria"]:
        y = verificar_espacio_pdf(pdf, y)

        nombre_categoria = gasto["categoria"].replace("_", " ").title()
        pdf.drawString(50, y, f"{nombre_categoria}: ${gasto['total']}")
        y -= 20

    return y - 20

def agregar_produccion_pdf(pdf, datos, y):
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, y, "RESUMEN DE PRODUCCIÓN")

    pdf.setFont("Helvetica", 11)
    y -= 25
    pdf.drawString(
        50,
        y,
        f"Total producido: {datos['total_maples']} maples",
    )

    y -= 20
    pdf.drawString(
        50,
        y,
        f"Total de huevos: {datos['total_huevos']}",
    )

    y -= 20
    pdf.drawString(
        50,
        y,
        f"Mermas: {datos['mermas']} huevos",
    )

    # Producción por tipo
    y -= 40
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, y, "PRODUCCIÓN POR TIPO")

    pdf.setFont("Helvetica", 11)
    y -= 25

    for tipo, cantidad in datos["produccion_por_tipo"].items():
        y = verificar_espacio_pdf(pdf, y)

        nombre_tipo = tipo.replace("_", " ").title()
        pdf.drawString(50, y, f"{nombre_tipo}: {cantidad} maples")
        y -= 20

    # Plantel actual
    y -= 20
    y = verificar_espacio_pdf(pdf, y, 100)
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, y, "PLANTEL ACTUAL")

    pdf.setFont("Helvetica", 11)
    y -= 25
    pdf.drawString(
        50,
        y,
        f"Gallinas actuales: {datos['total_gallinas']}",
    )

    y -= 20
    pdf.drawString(
        50,
        y,
        f"Galpones activos: {datos['galpones_activos']}",
    )

    # Movimientos de gallinas
    y -= 40
    y = verificar_espacio_pdf(pdf, y, 100)
    pdf.setFont("Helvetica-Bold", 12)
    pdf.drawString(50, y, "MOVIMIENTOS DE GALLINAS DEL PERÍODO")

    pdf.setFont("Helvetica", 11)
    y -= 25
    pdf.drawString(
        50,
        y,
        f"Ingresos: {datos['ingresos_gallinas']} gallinas",
    )

    y -= 20
    pdf.drawString(
        50,
        y,
        f"Salidas: {datos['salidas_gallinas']} gallinas",
    )

    y -= 20
    pdf.drawString(
        50,
        y,
        f"Mortalidad: {datos['mortalidad']} gallinas",
    )

    return y - 20

def ajustar_ancho_columnas(hoja):
    for columna in hoja.columns:
        ancho_maximo = 0
        letra_columna = columna[0].column_letter

        for celda in columna:
            if celda.value is not None:
                ancho_maximo = max(
                    ancho_maximo,
                    len(str(celda.value))
                )

        hoja.column_dimensions[letra_columna].width = ancho_maximo + 2

def agregar_finanzas_excel(hoja, datos):

    ajustar_ancho_columnas(hoja)

    # Resumen financiero
    hoja.append(["RESUMEN FINANCIERO"])
    hoja.append(["Concepto", "Valor"])
    hoja.append(["Ingresos", datos["ingresos"]])
    hoja.append(["Egresos", datos["egresos"]])
    hoja.append(["Balance neto", datos["balance_neto"]])
    hoja.append(["Ventas pagadas", datos["cantidad_ventas"]])
    hoja.append(["Ticket promedio", datos["ticket_promedio"]])

    hoja.append([])

    # Ingresos por tipo de producto
    hoja.append(["INGRESOS POR TIPO DE PRODUCTO"])
    hoja.append(["Tipo de producto", "Monto"])

    for venta in datos["ventas_por_tipo"]:
        nombre_tipo = venta["tipo_huevo"].replace("_", " ").title()
        hoja.append([nombre_tipo, venta["total"]])

    hoja.append([])

    # Gastos por categoría
    hoja.append(["GASTOS POR CATEGORÍA"])
    hoja.append(["Categoría", "Monto"])

    for gasto in datos["gastos_por_categoria"]:
        nombre_categoria = gasto["categoria"].replace("_", " ").title()
        hoja.append([nombre_categoria, gasto["total"]])

def agregar_produccion_excel(hoja, datos):
    # Resumen de producción
    hoja.append(["RESUMEN DE PRODUCCIÓN"])
    hoja.append(["Concepto", "Valor"])
    hoja.append(["Total producido", datos["total_maples"]])
    hoja.append(["Total de huevos", datos["total_huevos"]])
    hoja.append(["Mermas (huevos)", datos["mermas"]])

    hoja.append([])

    # Producción por tipo
    hoja.append(["PRODUCCIÓN POR TIPO"])
    hoja.append(["Tipo de producto", "Maples"])

    for tipo, cantidad in datos["produccion_por_tipo"].items():
        nombre_tipo = tipo.replace("_", " ").title()
        hoja.append([nombre_tipo, cantidad])

    hoja.append([])

    # Plantel actual
    hoja.append(["PLANTEL ACTUAL"])
    hoja.append(["Concepto", "Cantidad"])
    hoja.append(["Gallinas actuales", datos["total_gallinas"]])
    hoja.append(["Galpones activos", datos["galpones_activos"]])

    hoja.append([])

    # Movimientos del período
    hoja.append(["MOVIMIENTOS DE GALLINAS DEL PERÍODO"])
    hoja.append(["Movimiento", "Cantidad"])
    hoja.append(["Ingresos", datos["ingresos_gallinas"]])
    hoja.append(["Salidas", datos["salidas_gallinas"]])
    hoja.append(["Mortalidad", datos["mortalidad"]])

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

    agregar_logo_pdf(pdf)

    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(50, 790, "Reporte de Producción")

    pdf.setFont("Helvetica", 11)
    pdf.drawString(
        50,
        765,
        f"Período: {fecha_desde} al {fecha_hasta}",
    )

    agregar_produccion_pdf(pdf, datos, 720)

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

    agregar_logo_excel(hoja)

    hoja.append(["Reporte de Producción"])
    hoja.append(["Período", f"{fecha_desde} al {fecha_hasta}"])
    hoja.append([])

    agregar_produccion_excel(hoja, datos)

    ajustar_ancho_columnas(hoja)

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

    agregar_logo_pdf(pdf)

    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(50, 790, "Reporte de Finanzas")

    pdf.setFont("Helvetica", 11)
    pdf.drawString(
        50,
        765,
        f"Período: {fecha_desde} al {fecha_hasta}",
    )

    agregar_finanzas_pdf(pdf, datos, 720)

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

    agregar_logo_excel(hoja)

    hoja.append(["Reporte de Finanzas"])
    hoja.append(["Período", f"{fecha_desde} al {fecha_hasta}"])
    hoja.append([])

    agregar_finanzas_excel(hoja, datos)

    ajustar_ancho_columnas(hoja)

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

    agregar_logo_pdf(pdf)

    pdf.setFont("Helvetica-Bold", 18)
    pdf.drawString(50, 790, "INFORME COMPLETO")

    pdf.setFont("Helvetica", 11)
    pdf.drawString(
        50,
        765,
        f"Período: {fecha_desde} al {fecha_hasta}",
    )

    y = agregar_finanzas_pdf(pdf, finanzas, 730)
    y = verificar_espacio_pdf(pdf, y, 180)

    pdf.line(50, y, 545, y)
    y -= 25
    agregar_produccion_pdf(pdf, produccion, y)

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

    agregar_logo_excel(hoja_finanzas)

    hoja_finanzas.append(["Informe Completo - Finanzas"])
    hoja_finanzas.append(
        ["Período", f"{fecha_desde} al {fecha_hasta}"]
    )
    hoja_finanzas.append([])

    agregar_finanzas_excel(hoja_finanzas, finanzas)

    # Hoja Producción
    hoja_produccion = workbook.create_sheet("Producción")

    agregar_logo_excel(hoja_produccion)

    hoja_produccion.append(["Informe Completo - Producción"])
    hoja_produccion.append(
        ["Período", f"{fecha_desde} al {fecha_hasta}"]
    )
    hoja_produccion.append([])

    agregar_produccion_excel(hoja_produccion, produccion)

    # Ajustar ancho de columnas
    ajustar_ancho_columnas(hoja_finanzas)
    ajustar_ancho_columnas(hoja_produccion)

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