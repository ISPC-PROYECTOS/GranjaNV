from django.db import migrations


def cargar_galpon_y_stock(apps, schema_editor):
    Galpon = apps.get_model("produccion", "Galpon")
    StockHuevo = apps.get_model("produccion", "StockHuevo")

    # Inicializar Galpón 1 (capacidad 1800 aves, completo)
    Galpon.objects.create(
        numero=1,
        nombre="Galpón 1",
        capacidad_maxima=1800,
        cantidad_actual_gallinas=1800,
        descripcion="Galpón inicial operativo completo",
        activo=True,
    )

    # Inicializar acumuladores de inventario por tipo de huevo
    tipos_huevo = ["BLANCO_1", "BLANCO_2", "COLOR_1", "COLOR_2"]
    for tipo in tipos_huevo:
        StockHuevo.objects.create(
            tipo_huevo=tipo,
            cantidad_disponible=0,
        )


def revertir_galpon_y_stock(apps, schema_editor):
    Galpon = apps.get_model("produccion", "Galpon")
    StockHuevo = apps.get_model("produccion", "StockHuevo")

    Galpon.objects.filter(numero=1).delete()
    StockHuevo.objects.filter(
        tipo_huevo__in=["BLANCO_1", "BLANCO_2", "COLOR_1", "COLOR_2"]
    ).delete()


class Migration(migrations.Migration):
    dependencies = [
        ("produccion", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(
            code=cargar_galpon_y_stock,
            reverse_code=revertir_galpon_y_stock,
        ),
    ]