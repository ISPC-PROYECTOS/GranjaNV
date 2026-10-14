exports.LoginPage = class LoginPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
    // Localizadores ajustados a los IDs y clases reales de tu auth.html
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('.btn-formulario');
    this.errorMessage = page.locator('.alerta-error');
  }

  async goto() {
    await this.page.goto('http://localhost:4200/auth/login');
  }

  async login(email, password) {
    if (email !== undefined) await this.emailInput.fill(email);
    if (password !== undefined) await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }
};