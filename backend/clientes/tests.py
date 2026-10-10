from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from users.models import Usuario
from .models import Cliente


class ClienteInactivosApiTests(APITestCase):
	def setUp(self):
		admin = Usuario.objects.create_user(
			email='admin@example.com',
			password='Admin-pass-123',
			nombre='Admin',
			apellido='Test',
			rol='Administrador',
		)
		self.client.force_authenticate(admin)
		self.activo = Cliente.objects.create(
			nombre='Activo', telefono='1234567890', direccion='Calle 123', activo=True,
		)
		self.inactivo = Cliente.objects.create(
			nombre='Inactivo', telefono='1234567891', direccion='Calle 456', activo=False,
		)

	def test_list_hides_inactive_clients_by_default(self):
		response = self.client.get(reverse('cliente-list'))

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual([item['id'] for item in response.data], [self.activo.id])

	def test_list_can_include_inactive_clients(self):
		response = self.client.get(reverse('cliente-list'), {'incluir_inactivos': 'true'})

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(
			{item['id'] for item in response.data},
			{self.activo.id, self.inactivo.id},
		)
