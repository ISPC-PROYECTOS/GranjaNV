import { Page, Locator } from '@playwright/test';

export class FinanzasPage {
  private readonly page: Page;
  private readonly montoInput: Locator;
  private readonly categoriaSelect: Locator;
  private readonly descripcionInput: Locator;
  private readonly fechaInput: Locator;
  private readonly guardarButton: Locator;
  private readonly confirmarButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.montoInput = page.locator('#monto');
    this.categoriaSelect = page.locator('#categoria');
    this.descripcionInput = page.locator('#descripcion');
    this.fechaInput = page.locator('#fecha');
    this.guardarButton = page.getByRole('button', { name: 'Guardar', exact: true });
    this.confirmarButton = page.getByRole('button', { name: 'Confirmar y guardar' });
  }

  async abrir() {
    await this.page.goto('/dashboard/admin/finanzas');
  }

  async crearGasto(monto: string, categoria: string, descripcion: string, fecha: string) {
    await this.montoInput.fill(monto);
    await this.categoriaSelect.selectOption(categoria);
    await this.descripcionInput.fill(descripcion);
    await this.fechaInput.fill(fecha);
    await this.guardarButton.click();
    await this.confirmarButton.click();
  }

  obtenerGasto(descripcion: string): Locator {
    return this.page.locator('.gasto-item').filter({ hasText: descripcion });
  }

  async eliminarGasto(descripcion: string) {
    const gasto = this.obtenerGasto(descripcion);

    await gasto.getByRole('button', { name: 'Eliminar gasto' }).click();

    const confirmacion = this.page.getByRole('dialog', {
      name: 'Eliminar gasto',
    });

    await confirmacion
      .getByRole('button', {
        name: 'Eliminar gasto',
      })
      .click();
  }
}
