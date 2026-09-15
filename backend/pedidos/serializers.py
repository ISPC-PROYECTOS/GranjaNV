from decimal import Decimal
from typing import Any

from clientes.models import Cliente
from clientes.serializers import ClienteSerializer
from django.db import transaction
from rest_framework import serializers

from .models import ItemPedido, Pedido

PRECIOS_MAPLE_REFERENCIA: dict[str, Decimal] = {
    ItemPedido.TipoHuevo.BLANCO_1: Decimal("4500.00"),
    ItemPedido.TipoHuevo.BLANCO_2: Decimal("4200.00"),
    ItemPedido.TipoHuevo.COLOR_1: Decimal("4800.00"),
    ItemPedido.TipoHuevo.COLOR_2: Decimal("4500.00"),
}


class MetricasDashboardSerializer(serializers.Serializer):
    pedidos_pendientes = serializers.IntegerField(min_value=0)
    total_ventas_cobradas = serializers.DecimalField(max_digits=12, decimal_places=2)


class ItemPedidoReadSerializer(serializers.ModelSerializer):
    tipo_huevo_display = serializers.CharField(
        source="get_tipo_huevo_display", read_only=True
    )
    cantidad_maples = serializers.SerializerMethodField()

    class Meta:
        model = ItemPedido
        fields = [
            "id",
            "tipo_huevo",
            "tipo_huevo_display",
            "cantidad_unidades",
            "cantidad_maples",
            "precio_unitario",
            "subtotal",
        ]

    def get_cantidad_maples(self, obj: ItemPedido) -> int:
        return obj.cantidad_unidades // ItemPedido.HUEVOS_POR_MAPLE


class ItemPedidoWriteSerializer(serializers.Serializer):
    tipo_huevo = serializers.ChoiceField(choices=ItemPedido.TipoHuevo.choices)
    cantidad_maples = serializers.IntegerField(min_value=1)

    def validate(self, attrs: dict[str, Any]) -> dict[str, Any]:
        tipo = attrs["tipo_huevo"]
        maples = attrs["cantidad_maples"]
        precio_maple = PRECIOS_MAPLE_REFERENCIA[tipo]
        attrs["cantidad_unidades"] = maples * ItemPedido.HUEVOS_POR_MAPLE
        attrs["precio_unitario"] = (
            precio_maple / Decimal(ItemPedido.HUEVOS_POR_MAPLE)
        ).quantize(Decimal("0.01"))
        attrs["subtotal"] = precio_maple * Decimal(maples)
        return attrs


class PedidoReadSerializer(serializers.ModelSerializer):
    cliente = ClienteSerializer(read_only=True)
    items = ItemPedidoReadSerializer(many=True, read_only=True)
    resumen_productos = serializers.SerializerMethodField()
    dia_semana_entrega = serializers.SerializerMethodField()

    class Meta:
        model = Pedido
        fields = [
            "id",
            "cliente",
            "fecha_entrega",
            "dia_semana_entrega",
            "estado_pago",
            "estado_entrega",
            "total",
            "observaciones",
            "items",
            "resumen_productos",
            "creado_en",
            "actualizado_en",
        ]

    def get_resumen_productos(self, obj: Pedido) -> str:
        partes = [
            f"{item.cantidad_unidades // ItemPedido.HUEVOS_POR_MAPLE} maples {item.get_tipo_huevo_display().lower()}"
            for item in obj.items.all()
        ]
        return " + ".join(partes) if partes else "Sin productos"

    def get_dia_semana_entrega(self, obj: Pedido) -> str:
        dias = {
            0: "Lunes",
            1: "Martes",
            2: "Miércoles",
            3: "Jueves",
            4: "Viernes",
            5: "Sábado",
            6: "Domingo",
        }
        return dias.get(obj.fecha_entrega.weekday(), "")


class PedidoWriteSerializer(serializers.ModelSerializer):
    cliente = serializers.PrimaryKeyRelatedField(
        queryset=Cliente.objects.filter(activo=True)
    )
    items = ItemPedidoWriteSerializer(many=True, write_only=True)

    class Meta:
        model = Pedido
        fields = [
            "id",
            "cliente",
            "fecha_entrega",
            "estado_pago",
            "estado_entrega",
            "observaciones",
            "items",
        ]

    def validate_items(self, value: list[dict[str, Any]]) -> list[dict[str, Any]]:
        if not value:
            raise serializers.ValidationError(
                "Debe incluir al menos un producto en el pedido."
            )
        tipos = [item["tipo_huevo"] for item in value]
        if len(tipos) != len(set(tipos)):
            raise serializers.ValidationError(
                "No se pueden duplicar tipos de huevo en un mismo pedido."
            )
        return value

    @transaction.atomic
    def create(self, validated_data: dict[str, Any]) -> Pedido:
        items_data = validated_data.pop("items")
        pedido = Pedido.objects.create(**validated_data)

        total_pedido = Decimal("0.00")
        items_a_crear: list[ItemPedido] = []

        for item in items_data:
            total_pedido += item["subtotal"]
            items_a_crear.append(
                ItemPedido(
                    pedido=pedido,
                    tipo_huevo=item["tipo_huevo"],
                    cantidad_unidades=item["cantidad_unidades"],
                    precio_unitario=item["precio_unitario"],
                    subtotal=item["subtotal"],
                )
            )

        ItemPedido.objects.bulk_create(items_a_crear)
        pedido.total = total_pedido
        pedido.save(update_fields=["total"])
        return pedido

    @transaction.atomic
    def update(self, instance: Pedido, validated_data: dict[str, Any]) -> Pedido:
        items_data = validated_data.pop("items", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if items_data is not None:
            instance.items.all().delete()
            total_pedido = Decimal("0.00")
            items_a_crear: list[ItemPedido] = []
            for item in items_data:
                total_pedido += item["subtotal"]
                items_a_crear.append(
                    ItemPedido(
                        pedido=instance,
                        tipo_huevo=item["tipo_huevo"],
                        cantidad_unidades=item["cantidad_unidades"],
                        precio_unitario=item["precio_unitario"],
                        subtotal=item["subtotal"],
                    )
                )
            ItemPedido.objects.bulk_create(items_a_crear)
            instance.total = total_pedido
            instance.save(update_fields=["total"])

        return instance
