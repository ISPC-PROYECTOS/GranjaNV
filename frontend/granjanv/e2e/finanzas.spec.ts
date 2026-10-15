/// <reference types="node" />

import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { FinanzasPage } from './pages/FinanzasPage';

test('El administrador puede crear y visualizar un gasto', async ({ page }) => {
  const email = process.env['E2E_ADMIN_EMAIL'];
  const password = process.env['E2E_ADMIN_PASSWORD'];

  if (!email || !password) {
    throw new Error('Faltan las credenciales E2E del administrador');
  }

  const loginPage = new LoginPage(page);
  const finanzasPage = new FinanzasPage(page);

  const descripcion = `Prueba E2E ${Date.now()}`;
  const hoy = new Date();
  const fecha = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
  let gastoCreado = false;

  await loginPage.iniciarSesion(email, password);
  await expect(page).toHaveURL(/\/dashboard\/admin/);
  await finanzasPage.abrir();

  try {
    // Crear el gasto
    await finanzasPage.crearGasto('100', 'OTROS', descripcion, fecha);
    gastoCreado = true;

    // Verificar que aparece en el listado
    await expect(finanzasPage.obtenerGasto(descripcion)).toBeVisible();
  } finally {
    // Eliminar el gasto de prueba
    if (gastoCreado) {
      await finanzasPage.eliminarGasto(descripcion);
    }
  }
});
