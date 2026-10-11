from django.test import TestCase

from .models import Galpon
from .serializers import GalponSerializer


class GalponSerializerTests(TestCase):
	def setUp(self):
		self.galpon = Galpon.objects.create(
			numero_galpon=1,
			nombre="Galpon de prueba",
			capacidad_maxima=20,
			cantidad_inicial_gallinas=10,
			cantidad_actual_gallinas=10,
		)

	def test_rejects_direct_current_population_changes(self):
		serializer = GalponSerializer(
			self.galpon,
			data={"cantidad_actual_gallinas": 8},
			partial=True,
		)

		self.assertFalse(serializer.is_valid())
		self.assertIn("cantidad_actual_gallinas", serializer.errors)
		self.galpon.refresh_from_db()
		self.assertEqual(self.galpon.cantidad_actual_gallinas, 10)

	def test_allows_editing_other_fields_without_changing_population(self):
		serializer = GalponSerializer(
			self.galpon,
			data={"nombre": "Galpon actualizado"},
			partial=True,
		)

		self.assertTrue(serializer.is_valid(), serializer.errors)
		actualizado = serializer.save()
		self.assertEqual(actualizado.nombre, "Galpon actualizado")
		self.assertEqual(actualizado.cantidad_actual_gallinas, 10)

	def test_rejects_initial_population_as_current_stock(self):
		serializer = GalponSerializer(
			data={
				"numero_galpon": 2,
				"nombre": "Nuevo galpon",
				"capacidad_maxima": 20,
				"cantidad_inicial_gallinas": 10,
				"cantidad_actual_gallinas": 10,
			}
		)

		self.assertFalse(serializer.is_valid())
		self.assertIn("cantidad_actual_gallinas", serializer.errors)
