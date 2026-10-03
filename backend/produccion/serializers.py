from typing import Any
from django.db import transaction
from rest_framework import serializers
from .models import Galpon, MovimientoGallina, RegistroProduccion, ItemProduccionHuevo


class GalponSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="numero_galpon", read_only=True)

    class Meta:
        model = Galpon
        fields = [
            "id",
            "numero_galpon",
            "nombre",
            "capacidad_maxima",
            "cantidad_inicial_gallinas",
            "cantidad_actual_gallinas",
            "descripcion_galpon",
            "activo",
            "creado_en",
            "actualizado_en",
        ]
        read_only_fields = ["creado_en", "actualizado_en"]

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        capacidad = attrs.get("capacidad_maxima", getattr(self.instance, "capacidad_maxima", 0))
        actual = attrs.get("cantidad_actual_gallinas", getattr(self.instance, "cantidad_actual_gallinas", 0))
        if actual > capacidad:
            raise serializers.ValidationError(
                {"cantidad_actual_gallinas": "La cantidad actual no puede superar la capacidad máxima."}
            )
        return attrs


class MovimientoGallinaSerializer(serializers.ModelSerializer):
    tipo_movimiento_display = serializers.CharField(source="get_tipo_movimiento_display", read_only=True)
    motivo_movimiento_display = serializers.CharField(source="get_motivo_movimiento_display", read_only=True)

    class Meta:
        model = MovimientoGallina
        fields = [
            "id",
            "galpon",
            "fecha",
            "tipo_movimiento",
            "tipo_movimiento_display",
            "motivo_movimiento",
            "motivo_movimiento_display",
            "cantidad_gallinas",
            "descripcion_movimiento",
            "creado_en",
            "actualizado_en",
        ]
        read_only_fields = ["id", "creado_en", "actualizado_en"]

    def validate_descripcion_movimiento(self, value: str) -> str:
        valor_limpio = value.strip()
        if not valor_limpio:
            raise serializers.ValidationError("La descripción del movimiento es obligatoria.")
        if len(valor_limpio) < 3:
            raise serializers.ValidationError("La descripción debe contener al menos 3 caracteres.")
        return valor_limpio

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        galpon: Galpon = attrs["galpon"]
        cantidad: int = attrs["cantidad_gallinas"]
        tipo: str = attrs["tipo_movimiento"]

        if tipo == MovimientoGallina.TipoMovimiento.SALIDA:
            if galpon.cantidad_actual_gallinas < cantidad:
                raise serializers.ValidationError(
                    {"cantidad_gallinas": f"No podés retirar {cantidad} aves. El galpón solo cuenta con {galpon.cantidad_actual_gallinas} aves."}
                )
        elif tipo == MovimientoGallina.TipoMovimiento.INGRESO:
            nueva_poblacion = galpon.cantidad_actual_gallinas + cantidad
            if nueva_poblacion > galpon.capacidad_maxima:
                raise serializers.ValidationError(
                    {"cantidad_gallinas": f"El ingreso supera la capacidad máxima ({galpon.capacidad_maxima}). Espacio disponible: {galpon.capacidad_maxima - galpon.cantidad_actual_gallinas}."}
                )
        return attrs

    @transaction.atomic
    def create(self, validated_data: dict[str, Any]) -> MovimientoGallina:
        galpon: Galpon = Galpon.objects.select_for_update().get(pk=validated_data["galpon"].pk)
        cantidad: int = validated_data["cantidad_gallinas"]
        tipo: str = validated_data["tipo_movimiento"]

        if tipo == MovimientoGallina.TipoMovimiento.SALIDA:
            galpon.cantidad_actual_gallinas -= cantidad
        else:
            galpon.cantidad_actual_gallinas += cantidad

        galpon.save(update_fields=["cantidad_actual_gallinas", "actualizado_en"])
        return super().create(validated_data)


class ItemProduccionWriteSerializer(serializers.Serializer):
    tipo_huevo = serializers.CharField(max_length=20)
    cantidad_maples = serializers.IntegerField(min_value=1)


class RegistroProduccionWriteSerializer(serializers.ModelSerializer):
    items = ItemProduccionWriteSerializer(many=True, write_only=True)

    class Meta:
        model = RegistroProduccion
        fields = [
            "id",
            "galpon",
            "fecha",
            "huevos_rotos",
            "total_maples",
            "items",
        ]
        read_only_fields = ["id"]

    def validate_items(self, value: list[dict[str, Any]]) -> list[dict[str, Any]]:
        if not value:
            raise serializers.ValidationError("Debe indicar al menos un maple recolectado.")
        tipos = [i["tipo_huevo"] for i in value]
        if len(tipos) != len(set(tipos)):
            raise serializers.ValidationError("No se pueden repetir categorías de huevos en el mismo registro.")
        return value

    @transaction.atomic
    def create(self, validated_data: dict[str, Any]) -> RegistroProduccion:
        items_data = validated_data.pop("items")
        total_maples = sum(item["cantidad_maples"] for item in items_data)
        validated_data["total_maples"] = total_maples

        registro = RegistroProduccion.objects.create(**validated_data)
        items_db = [
            ItemProduccionHuevo(
                registro=registro,
                tipo_huevo=item["tipo_huevo"],
                cantidad_huevos=item["cantidad_maples"] * ItemProduccionHuevo.HUEVOS_POR_MAPLE,
            )
            for item in items_data
        ]
        ItemProduccionHuevo.objects.bulk_create(items_db)
        return registro


class DatosProduccionResponseSerializer(serializers.Serializer):
    total_maples = serializers.IntegerField()
    total_gallinas = serializers.IntegerField()
    maples_color_2 = serializers.IntegerField()
    maples_color_1 = serializers.IntegerField()
    maples_blanco_2 = serializers.IntegerField()
    maples_blanco_1 = serializers.IntegerField()
    mixtos = serializers.IntegerField()
    mermas = serializers.IntegerField()