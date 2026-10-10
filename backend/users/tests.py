from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Usuario


class UsuarioAdminApiTests(APITestCase):
	def setUp(self):
		self.admin = Usuario.objects.create_user(
			email='admin@example.com',
			password='Admin-pass-123',
			nombre='Admin',
			apellido='Test',
			rol='Administrador',
		)
		self.usuario = Usuario.objects.create_user(
			email='empleado@example.com',
			password='Empleado-pass-123',
			nombre='Ana',
			apellido='Paz',
			rol='Empleado',
		)

	def test_admin_can_list_users_without_passwords(self):
		self.client.force_authenticate(self.admin)

		response = self.client.get(reverse('usuario-admin-list'))

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.assertEqual(len(response.data), 2)
		self.assertNotIn('password', response.data[0])

	def test_admin_can_update_user_and_hash_new_password(self):
		self.client.force_authenticate(self.admin)

		response = self.client.patch(
			reverse('usuario-admin-detail', args=[self.usuario.pk]),
			{'nombre': 'Ana María', 'password': 'Nueva-pass-456'},
			format='json',
		)

		self.assertEqual(response.status_code, status.HTTP_200_OK)
		self.usuario.refresh_from_db()
		self.assertEqual(self.usuario.nombre, 'Ana María')
		self.assertTrue(self.usuario.check_password('Nueva-pass-456'))

	def test_non_admin_cannot_list_users(self):
		self.client.force_authenticate(self.usuario)

		response = self.client.get(reverse('usuario-admin-list'))

		self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

	def test_admin_can_delete_user(self):
		self.client.force_authenticate(self.admin)

		response = self.client.delete(
			reverse('usuario-admin-detail', args=[self.usuario.pk]),
		)

		self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
		self.assertFalse(Usuario.objects.filter(pk=self.usuario.pk).exists())
