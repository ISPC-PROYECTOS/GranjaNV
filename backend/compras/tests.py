from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Gasto

Usuario = get_user_model()


class GastoAPITests(APITestCase):

    def setUp(self):
        # Arrange: preparar un administrador para las pruebas
        self.admin = Usuario.objects.create_user(
            email="admin_test@granjanv.com",
            password="Test12345!",
            nombre="Admin",
            apellido="Prueba",
            rol="Administrador",
        )
        self.client.force_authenticate(user=self.admin)
        self.url = reverse("gasto-list")

    def test_crear_gasto_como_administrador(self):
        # Arrange: definir los datos de un gasto válido
        datos = {
            "monto": "15000.00",
            "categoria": "ALIMENTO",
            "descripcion": "Compra de alimento para gallinas",
            "fecha": "2026-10-13",
        }

        # Act: enviar una solicitud POST a la API
        respuesta = self.client.post(self.url, datos, format="json")

        # Assert: verificar la respuesta y el registro creado
        self.assertEqual(respuesta.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Gasto.objects.count(), 1)
        self.assertEqual(
            Gasto.objects.first().descripcion, "Compra de alimento para gallinas"
        )

        # Act: consultar la lista de gastos
        respuesta_get = self.client.get(self.url)

        # Assert: verificar que la consulta sea exitosa
        self.assertEqual(respuesta_get.status_code, status.HTTP_200_OK)

    def test_empleado_no_puede_crear_gasto(self):
        # Arrange: crear un usuario con rol Empleado
        empleado = Usuario.objects.create_user(
            email="empleado_test@granjanv.com",
            password="Test12345!",
            nombre="Empleado",
            apellido="Prueba",
            rol="Empleado",
        )

        self.client.force_authenticate(user=empleado)

        datos = {
            "monto": "15000.00",
            "categoria": "ALIMENTO",
            "descripcion": "Compra de alimento",
            "fecha": "2026-10-13",
        }

        # Act: intentar crear un gasto como empleado
        respuesta = self.client.post(self.url, datos, format="json")

        # Assert: verificar que se rechace la operación
        self.assertEqual(respuesta.status_code, status.HTTP_403_FORBIDDEN)
        self.assertEqual(Gasto.objects.count(), 0)

    def test_no_permite_crear_gasto_con_monto_negativo(self):
        # Arrange: preparar un gasto con monto inválido
        datos = {
            "monto": "-15000.00",
            "categoria": "ALIMENTO",
            "descripcion": "Compra de alimento",
            "fecha": "2026-10-13",
        }

        # Act: intentar registrar el gasto
        respuesta = self.client.post(self.url, datos, format="json")

        # Assert: verificar que se rechace y no se guarde
        self.assertEqual(respuesta.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Gasto.objects.count(), 0)

        # Act: intentar crear un gasto sin el campo obligatorio "monto"
        datos_sin_monto = {
            "categoria": "ALIMENTO",
            "descripcion": "Compra de alimento",
            "fecha": "2026-10-13",
        }

        respuesta_sin_monto = self.client.post(self.url, datos_sin_monto, format="json")

        # Assert: verificar que se rechace por falta de monto
        self.assertEqual(respuesta_sin_monto.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(Gasto.objects.count(), 0)
