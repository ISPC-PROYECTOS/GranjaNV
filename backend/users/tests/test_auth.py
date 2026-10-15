from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model

Usuario = get_user_model()


class AuthenticationTests(APITestCase):

    def setUp(self):
       
        self.email = "testuser@granjanv.com"
        self.password = "Password123*"
        self.user = Usuario.objects.create_user(
            email=self.email,
            password=self.password,
            nombre="Test",
            apellido="User",
            rol="Administrador"
        )
        self.login_url = reverse("api_login")
        self.refresh_url = reverse("api_token_refresh")

    def test_login_success_returns_jwt_tokens(self):
        # Arrange
        payload = {"email": self.email, "password": self.password}

        # Act
        response = self.client.post(self.login_url, payload, format="json")

        # Assert
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertIn("user", response.data)

    def test_login_invalid_credentials_returns_401(self):
        # Arrange
        payload = {"email": self.email, "password": "WrongPassword!"}

        # Act
        response = self.client.post(self.login_url, payload, format="json")

        # Assert
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn("access", response.data)

    def test_login_incomplete_payload_returns_400(self):
        # Arrange
        payload = {"email": self.email}  # Falta la contraseña a propósito

        # Act
        response = self.client.post(self.login_url, payload, format="json")

        # Assert
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("password", response.data)

    def test_method_not_allowed_on_login(self):
        # Arrange / Act (Intentar usar GET en una ruta de Login diseñada solo para POST)
        response = self.client.get(self.login_url)

        # Assert
        self.assertEqual(
            response.status_code, status.HTTP_405_METHOD_NOT_ALLOWED
        )