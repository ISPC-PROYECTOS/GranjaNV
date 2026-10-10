from django.test import TestCase

from .models import Galpon
from .serializers import GalponSerializer


class GalponSerializerTests(TestCase):
	def test_initial_population_becomes_current_population(self):
		serializer = GalponSerializer(data={
			"numero_galpon": 1,
			"nombre": "Galpón 1",
			"capacidad_maxima": 100,
			"cantidad_inicial_gallinas": 40,
		})

		self.assertTrue(serializer.is_valid(), serializer.errors)
		galpon = serializer.save()

		self.assertEqual(galpon.cantidad_actual_gallinas, 40)

	def test_initial_population_cannot_exceed_capacity(self):
		serializer = GalponSerializer(data={
			"numero_galpon": 1,
			"nombre": "Galpón 1",
			"capacidad_maxima": 30,
			"cantidad_inicial_gallinas": 40,
		})

		self.assertFalse(serializer.is_valid())
		self.assertIn("cantidad_inicial_gallinas", serializer.errors)

	def test_editing_initial_population_does_not_reset_current_population(self):
		galpon = Galpon.objects.create(
			numero_galpon=1,
			nombre="Galpón 1",
			capacidad_maxima=100,
			cantidad_inicial_gallinas=40,
			cantidad_actual_gallinas=25,
		)
		serializer = GalponSerializer(
			galpon,
			data={"cantidad_inicial_gallinas": 45},
			partial=True,
		)

		self.assertTrue(serializer.is_valid(), serializer.errors)
		actualizado = serializer.save()

		self.assertEqual(actualizado.cantidad_inicial_gallinas, 45)
		self.assertEqual(actualizado.cantidad_actual_gallinas, 25)
