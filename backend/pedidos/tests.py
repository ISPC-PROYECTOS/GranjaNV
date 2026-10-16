from decimal import Decimal
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from clientes.models import Cliente
from pedidos.models import Pedido, ItemPedido

Usuario = get_user_model()

class VentasYPedidosAPITests(APITestCase):
    def setUp(self):
        # 1. Usuario con rol Administrador para cumplir IsAdminRole
        self.admin_user = Usuario.objects.create_user(
            email="admin@test.com",
            password="password123",
            nombre="Admin",
            apellido="NV",
            rol="Administrador",
        )
        self.client.force_authenticate(user=self.admin_user)

        # 2. Cliente base
        self.cliente = Cliente.objects.create(
            nombre="CLAUDIO",
            apellido="MOLINA",
            telefono="3514040404",
            direccion="Moreno 123",
            tipo=Cliente.TipoCliente.MINORISTA,
            activo=True,
        )

        self.url_pedidos = reverse("pedido-list")
        self.url_clientes = reverse("cliente-list")

    # VP-01: Alta rápida de cliente
    def test_vp01_alta_rapida_cliente(self):
        data_cliente = {
            "nombre": "Lucas",
            "apellido": "Novillo",
            "telefono": "3515556677",
            "direccion": "Av. Colón 456",
            "tipo": "MINORISTA"
        }
        res = self.client.post(self.url_clientes, data_cliente, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data["nombre"], "LUCAS")
        self.assertTrue(Cliente.objects.filter(telefono="3515556677").exists())

    # VP-02: Creación de pedido válido
    def test_vp02_creacion_pedido(self):
        payload = {
            "cliente": self.cliente.id,
            "fecha_entrega": "2026-10-15",
            "items": [
                {"tipo_huevo": "COLOR_2", "cantidad_maples": 2}
            ],
            "observaciones": "Entregar por la mañana"
        }
        res = self.client.post(self.url_pedidos, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Pedido.objects.count(), 1)
        
        pedido = Pedido.objects.first()
        self.assertEqual(pedido.total, Decimal("9000.00")) # 2 maples * $4500
        self.assertFalse(pedido.estado_entrega)
        self.assertFalse(pedido.estado_pago)

    # VP-03: Actualización a "Entregado"
    def test_vp03_actualizacion_estado_entregado(self):
        pedido = Pedido.objects.create(
            cliente=self.cliente,
            fecha_entrega="2026-10-15",
            total=Decimal("4500.00")
        )
        url_toggle = reverse("pedido-toggle-entrega", kwargs={"pk": pedido.id})
        res = self.client.patch(url_toggle)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        
        pedido.refresh_from_db()
        self.assertTrue(pedido.estado_entrega)

    # VP-04: Actualización a "Cobrado"
    def test_vp04_actualizacion_estado_cobrado(self):
        pedido = Pedido.objects.create(
            cliente=self.cliente,
            fecha_entrega="2026-10-15",
            total=Decimal("4500.00")
        )
        url_toggle = reverse("pedido-toggle-pago", kwargs={"pk": pedido.id})
        res = self.client.patch(url_toggle)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        
        pedido.refresh_from_db()
        self.assertTrue(pedido.estado_pago)

    # VP-05: Filtrado por rango de fechas
    def test_vp05_filtrado_pedidos_rango_fechas(self):
        Pedido.objects.create(cliente=self.cliente, fecha_entrega="2026-10-01", total=Decimal("1000.00"))
        Pedido.objects.create(cliente=self.cliente, fecha_entrega="2026-10-15", total=Decimal("1000.00"))
        Pedido.objects.create(cliente=self.cliente, fecha_entrega="2026-11-05", total=Decimal("1000.00"))

        res = self.client.get(self.url_pedidos, {"fecha_desde": "2026-10-10", "fecha_hasta": "2026-10-20"})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        self.assertEqual(res.data[0]["fecha_entrega"], "2026-10-15")

    # VP-06: Edición de pedido pendiente
    def test_vp06_editar_pedido_creado(self):
        pedido = Pedido.objects.create(
            cliente=self.cliente,
            fecha_entrega="2026-10-15",
            total=Decimal("4500.00")
        )
        ItemPedido.objects.create(
            pedido=pedido,
            tipo_huevo="COLOR_2",
            cantidad_unidades=30,
            precio_unitario=Decimal("150.00"),
            subtotal=Decimal("4500.00")
        )

        url_detalle = reverse("pedido-detail", kwargs={"pk": pedido.id})
        payload_update = {
            "cliente": self.cliente.id,
            "fecha_entrega": "2026-10-20",
            "items": [
                {"tipo_huevo": "BLANCO_2", "cantidad_maples": 3}
            ]
        }
        res = self.client.put(url_detalle, payload_update, format="json")
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        
        pedido.refresh_from_db()
        self.assertEqual(str(pedido.fecha_entrega), "2026-10-20")
        self.assertEqual(pedido.total, Decimal("12600.00")) # 3 * $4200

    # VP-07: Validación - Pedido sin productos / cantidad cero
    def test_vp07_pedido_sin_cantidad_invalido(self):
        payload = {
            "cliente": self.cliente.id,
            "fecha_entrega": "2026-10-15",
            "items": []
        }
        res = self.client.post(self.url_pedidos, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("items", res.data)

    # VP-08: Validación - Pedido con cliente inexistente
    def test_vp08_pedido_cliente_inexistente(self):
        payload = {
            "cliente": 99999,
            "fecha_entrega": "2026-10-15",
            "items": [{"tipo_huevo": "COLOR_2", "cantidad_maples": 1}]
        }
        res = self.client.post(self.url_pedidos, payload, format="json")
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("cliente", res.data)

    # VP-09: Validación - Cantidad negativa o decimal en serializer
    def test_vp09_validacion_cantidades_invalidas(self):
        payload_negativo = {
            "cliente": self.cliente.id,
            "fecha_entrega": "2026-10-15",
            "items": [{"tipo_huevo": "COLOR_2", "cantidad_maples": -1}]
        }
        res_neg = self.client.post(self.url_pedidos, payload_negativo, format="json")
        self.assertEqual(res_neg.status_code, status.HTTP_400_BAD_REQUEST)

        payload_decimal = {
            "cliente": self.cliente.id,
            "fecha_entrega": "2026-10-15",
            "items": [{"tipo_huevo": "COLOR_2", "cantidad_maples": 1.5}]
        }
        res_dec = self.client.post(self.url_pedidos, payload_decimal, format="json")
        self.assertEqual(res_dec.status_code, status.HTTP_400_BAD_REQUEST)