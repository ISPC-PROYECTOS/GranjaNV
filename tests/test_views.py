from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from produccion.models import Galpon, ItemProduccionHuevo, RegistroProduccion


User = get_user_model()


class ProduccionBackendTestCase(APITestCase):
    def setUp(self):
        self.empleado = User.objects.create_user(
            email="lauti@granjanv.com.ar",
            password="password123",
            nombre="Lauti",
            apellido="Empleado",
            rol="Empleado",
        )
        self.client.force_authenticate(user=self.empleado)
        self.galpon = Galpon.objects.create(
            numero_galpon=1,
            nombre="Galpón 1",
            capacidad_maxima=2000,
            cantidad_inicial_gallinas=1800,
            cantidad_actual_gallinas=1800,
        )

    def test_recoleccion_registra_stock(self):
        response = self.client.post(
            reverse("produccion-registrar-huevos"),
            {
                "galpon": self.galpon.numero_galpon,
                "huevos_rotos": 12,
                "items": [
                    {"tipo_huevo": "COLOR_1", "cantidad_maples": 15},
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        registro = RegistroProduccion.objects.get()
        self.assertEqual(registro.galpon, self.galpon)
        self.assertEqual(registro.total_maples, 15)
        self.assertEqual(registro.huevos_rotos, 12)
        self.assertEqual(
            ItemProduccionHuevo.objects.get(registro=registro).cantidad_huevos,
            15 * ItemProduccionHuevo.HUEVOS_POR_MAPLE,
        )

    def test_recoleccion_rechaza_cantidad_negativa(self):
        response = self.client.post(
            reverse("produccion-registrar-huevos"),
            {
                "galpon": self.galpon.numero_galpon,
                "items": [
                    {"tipo_huevo": "COLOR_1", "cantidad_maples": -5},
                ],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(RegistroProduccion.objects.exists())

    def test_mortalidad_resta_aves_del_galpon(self):
        response = self.client.post(
            reverse("movimiento-gallina-list"),
            {
                "galpon": self.galpon.numero_galpon,
                "tipo_movimiento": "SALIDA",
                "motivo_movimiento": "MUERTE",
                "cantidad_gallinas": 4,
                "descripcion_movimiento": "Muerte natural",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        self.galpon.refresh_from_db()
        self.assertEqual(self.galpon.cantidad_actual_gallinas, 1796)