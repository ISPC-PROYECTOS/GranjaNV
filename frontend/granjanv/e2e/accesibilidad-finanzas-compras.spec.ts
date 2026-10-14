import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { LoginPage } from './pages/LoginPage';

test('Finanzas no presenta problemas graves de accesibilidad', async ({ page }) => {
  const email = process.env['E2E_ADMIN_EMAIL'];
  const password = process.env['E2E_ADMIN_PASSWORD'];

  if (!email || !password) {
    throw new Error('Faltan las credenciales E2E del administrador');
  }

  const loginPage = new LoginPage(page);

  await loginPage.iniciarSesion(email, password);
  await expect(page).toHaveURL(/\/dashboard\/admin/);

  await page.goto('/dashboard/admin/finanzas');
  await expect(page.locator('#monto')).toBeVisible();
  await expect(page.locator('.spinner-texto')).toBeHidden();

  const resultados = await new AxeBuilder({ page }).analyze();
  const erroresGraves = resultados.violations.filter(
    (error) => error.impact === 'serious' || error.impact === 'critical',
  );

  console.log('MODO CLARO');
  console.table(
    erroresGraves.flatMap((error) =>
      error.nodes.map((nodo) => ({
        elemento: nodo.target.join(', '),
        problema: error.id,
        gravedad: error.impact,
      })),
    ),
  );
  expect(erroresGraves).toEqual([]);
});

test('Finanzas no presenta problemas graves de accesibilidad en modo oscuro', async ({ page }) => {
  const email = process.env['E2E_ADMIN_EMAIL'];
  const password = process.env['E2E_ADMIN_PASSWORD'];

  if (!email || !password) {
    throw new Error('Faltan las credenciales E2E del administrador');
  }

  const loginPage = new LoginPage(page);

  await loginPage.iniciarSesion(email, password);
  await expect(page).toHaveURL(/\/dashboard\/admin/);

  await page.goto('/dashboard/admin/finanzas');
  await expect(page.locator('#monto')).toBeVisible();
  await expect(page.locator('.spinner-texto')).toBeHidden();

  // Abrir el menú del perfil
  await page.locator('.profile-pill').click();

  // Activar el modo oscuro, si todavía está en modo claro
  const activarModoOscuro = page.getByRole('button', { name: 'Modo oscuro' });

  if (await activarModoOscuro.isVisible()) {
    await activarModoOscuro.click();
  }

  // Verificar que se activó el modo oscuro
  await expect(page.locator('body')).toHaveClass(/dark-mode/);

  // Analizar accesibilidad
  const resultados = await new AxeBuilder({ page }).analyze();

  const erroresGraves = resultados.violations.filter(
    (error) => error.impact === 'serious' || error.impact === 'critical',
  );

  console.log('MODO OSCURO');
  console.table(
    erroresGraves.flatMap((error) =>
      error.nodes.map((nodo) => ({
        elemento: nodo.target.join(', '),
        problema: error.id,
        gravedad: error.impact,
      })),
    ),
  );
  expect(erroresGraves).toEqual([]);
});
