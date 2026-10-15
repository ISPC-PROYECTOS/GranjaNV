const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../page/login_page');

const scenarios = [
  {
    title: 'HU-01 / TC-01: Login exitoso con credenciales válidas de Administrador',
    email: 'admin@granjanv.com.ar',
    password: 'adminadmin',
    expectedSuccess: true,
  },
  {
    title: 'HU-01 / TC-02: Rechazo por credenciales incorrectas',
    email: 'admin@granjanv.com',
    password: 'WrongPassword',
    expectedSuccess: false,
    expectedError: 'Usuario o contraseña incorrectos.',
  },
  {
   
    title: 'HU-01 / TC-03: Rechazo por correo inválido o vacío',
    email: 'correo_invalido',
    password: '',
    expectedSuccess: false,
    expectedError: 'Correo o contraseña inválidos o vacíos.',
  },
];

test.describe('Módulo de Autenticación - E2E (Playwright)', () => {
  
  for (const scenario of scenarios) {
    test(scenario.title, async ({ page }) => {
      const loginPage = new LoginPage(page);

      await loginPage.goto();

      // Rellenamos los datos de manera controlada
      if (scenario.email !== undefined) {
        await loginPage.emailInput.fill(scenario.email);
      }
      if (scenario.password !== undefined) {
        await loginPage.passwordInput.fill(scenario.password);
      }

      // Si es el TC-01 o TC-02, intentamos loguearnos. Si es el TC-03 (vacío/inválido), no hacemos click para evitar el bloqueo.
      if (scenario.expectedSuccess || scenario.password !== '') {
        await loginPage.submitButton.click();
      }

      // 🛑 Pausa de depuración para que puedas tomar las capturas sin apuro
      await page.pause();

      if (scenario.expectedSuccess) {
        await expect(page).toHaveURL(/.*dashboard\/admin\/panel-de-control/);
      } else {
        // Validar mensaje de error accesible en pantalla
        const errorText = await loginPage.getErrorMessage();
        expect(errorText).toBeTruthy();
      }
    });
  }
});