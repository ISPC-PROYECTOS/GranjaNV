from datetime import timedelta
from decimal import Decimal
from django.urls import reverse
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APITestCase

from compras.models import Gasto
from users.models import Usuario


class ReportesBackendTestCase(APITestCase):
    """
    Suite de pruebas automatizadas para el módulo de Reportes y Landing Page.
    Cobertura Sprint 4 (AUT-BE-05):
    - HU-07 (Gestión y Reportes): GR-01, GR-02
    - HU-10 (Portal Web Público): LP-01
    """

    def setUp(self):
        # Credenciales documentadas en el Plan de Pruebas
        self.admin_user = Usuario.objects.create_superuser(
            email="admin@granjanv.com.ar",
            password="adminadmin",
            nombre="Nahuel",
            apellido="administrador",
            rol="Administrador",
        )
        self.empleado_user = Usuario.objects.create_user(
            email="empleado@granjanv.com.ar",
            password="pruebaprueba",
            nombre="Empleado",
            apellido="operativo",
            rol="Empleado",
        )
        # Endpoints del módulo de Reportes y Landing
        self.url_reporte_finanzas = reverse("reporte-finanzas")
        self.url_landing_recetas = reverse("obtener_recetas")

    
    # 1. CASO FELIZ: GR-02 (Filtrado de reporte por rango de fechas)
  
    def test_filtrado_reportes_por_fecha_exitoso(self):
        # [ARRANGE] - Autenticar administrador
        self.client.force_authenticate(user=self.admin_user)
        hoy = timezone.localdate()
        fecha_desde = (hoy - timedelta(days=7)).strftime("%Y-%m-%d")
        fecha_hasta = hoy.strftime("%Y-%m-%d")

        # Sembrar gasto dentro del rango
        Gasto.objects.create(
            monto=Decimal("4500.00"),
            categoria="ALIMENTO",
            descripcion="Alimento balanceado lote prueba",
            fecha=hoy,
        )

        # [ACT] - Solicitar reporte financiero filtrado por rango de fechas
        response = self.client.get(
            self.url_reporte_finanzas,
            {"fecha_desde": fecha_desde, "fecha_hasta": fecha_hasta},
        )

        # [ASSERT] - Validar código 200 OK y estructura de finanzas
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("egresos", response.data)

    
    # 2. SEGURIDAD / PERMISOS: GR-01 (Sin credenciales)
    
    def test_reportes_sin_autenticacion_retorna_401(self):
        # [ACT] - Intento anónimo sin token
        response = self.client.get(self.url_reporte_finanzas)

        # [ASSERT] - Acceso no autorizado
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_reportes_con_rol_empleado_retorna_403(self):
        # [ARRANGE] - Autenticar con rol no autorizado (Empleado)
        self.client.force_authenticate(user=self.empleado_user)

        # [ACT] - Intento de acceso a reportes
        response = self.client.get(self.url_reporte_finanzas)

        # [ASSERT] - Acceso prohibido por falta de rol Administrador
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    
    # 3. SMOKE BACKEND: LP-01 (Endpoint público Landing Page)
    
    def test_landing_page_publica_retorna_200(self):
        # [ACT] - Consulta pública al catálogo de recetas
        response = self.client.get(self.url_landing_recetas)

        # [ASSERT] - El endpoint responde 200 OK sin autenticación
        self.assertEqual(response.status_code, status.HTTP_200_OK)