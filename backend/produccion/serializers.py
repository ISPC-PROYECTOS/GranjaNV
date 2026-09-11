from typing import Any

from django.db import transaction
from rest_framework import serializers

from .models import Galpon, ProduccionDiaria, StockHuevo
from .services import InventarioService


class GalponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Galpon
        fields = [
            "id",
            "numero",
            "nombre",
            "capacidad_maxima",
            "cantidad_actual_gallinas",
            "activo",
        ]


class ProduccionDiariaWriteSerializer(serializers.Serializer):
    """
    Serializador de entrada ajustado a la interfaz de Figma:
    Recibe Galpón, Tipo, Número, Cantidad (en maples) y Cantidad de rotos (unidades).
    """

    TIPO_CHOICES = (("BLANCO", "Blanco"), ("COLOR", "Color"))
    NUMERO_CHOICES = (("1", "1"), ("2", "2"))

    galpon = serializers.PrimaryKeyRelatedField(
        queryset=Galpon.objects.filter(activo=True)
    )
    tipo = serializers.ChoiceField(choices=TIPO_CHOICES, write_only=True)
    numero = serializers.ChoiceField(choices=NUMERO_CHOICES, write_only=True)
    cantidad = serializers.IntegerField(
        min_value=0,
        help_text="Cantidad de maples aptos cargados",
    )
    cantidad_rotos = serializers.IntegerField(
        min_value=0,
        default=0,
        help_text="Huevos rotos o con anomalías en unidades sueltas",
    )

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        tipo = attrs.pop("tipo")
        numero = attrs.pop("numero")
        attrs["tipo_huevo"] = f"{tipo}_{numero}"

        maples = attrs.pop("cantidad")
        attrs["cantidad_huevos"] = maples * ProduccionDiaria.HUEVOS_POR_MAPLE
        attrs["cantidad_huevos_rotos"] = attrs.pop("cantidad_rotos")

        if attrs["cantidad_huevos"] == 0 and attrs["cantidad_huevos_rotos"] == 0:
            raise serializers.ValidationError(
                "Debe registrar al menos un maple recolectado o un huevo roto."
            )
        return attrs

    @transaction.atomic
    def create(self, validated_data: dict[str, Any]) -> ProduccionDiaria:
        produccion = ProduccionDiaria.objects.create(**validated_data)
        # Sumar los huevos aptos al inventario disponible
        InventarioService.ingresar_produccion(
            tipo_huevo=produccion.tipo_huevo,
            cantidad_unidades=produccion.cantidad_huevos,
        )
        return produccion


class ProduccionDiariaReadSerializer(serializers.ModelSerializer):
    """
    Serializador de salida para el endpoint de consulta histórica de cargas.
    """

    usuario_nombre = serializers.SerializerMethodField()
    galpon_numero = serializers.IntegerField(source="galpon.numero", read_only=True)
    galpon_nombre = serializers.CharField(source="galpon.nombre", read_only=True)
    tipo_huevo_display = serializers.CharField(
        source="get_tipo_huevo_display", read_only=True
    )
    cantidad_maples = serializers.SerializerMethodField()

    class Meta:
        model = ProduccionDiaria
        fields = [
            "id",
            "usuario_nombre",
            "fecha",
            "galpon",
            "galpon_numero",
            "galpon_nombre",
            "tipo_huevo",
            "tipo_huevo_display",
            "cantidad_maples",
            "cantidad_huevos",
            "cantidad_huevos_rotos",
            "creado_en",
        ]

    def get_usuario_nombre(self, obj: ProduccionDiaria) -> str:
        return (
            f"{obj.usuario.nombre} {obj.usuario.apellido}".strip() or obj.usuario.email
        )

    def get_cantidad_maples(self, obj: ProduccionDiaria) -> int:
        return obj.cantidad_huevos // ProduccionDiaria.HUEVOS_POR_MAPLE


class StockHuevoSerializer(serializers.ModelSerializer):
    tipo_huevo_display = serializers.CharField(
        source="get_tipo_huevo_display", read_only=True
    )
    cantidad_maples_disponibles = serializers.SerializerMethodField()

    class Meta:
        model = StockHuevo
        fields = [
            "tipo_huevo",
            "tipo_huevo_display",
            "cantidad_disponible",
            "cantidad_maples_disponibles",
            "actualizado_en",
        ]

    def get_cantidad_maples_disponibles(self, obj: StockHuevo) -> int:
        return obj.cantidad_disponible // StockHuevo.HUEVOS_POR_MAPLE
