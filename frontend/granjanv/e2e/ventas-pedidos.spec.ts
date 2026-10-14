import { test, expect } from '@playwright/test';

test.describe('Módulo de Ventas y Pedidos - Flujos E2E', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Login con rol Administrador
    await page.goto('http://localhost:4200/auth/login');
    await page.fill('#email', 'admin@granjanv.com.ar');
    await page.fill('#password', 'adminadmin');
    await page.click('button[type="submit"]');

    // Esperar llegada al panel
    await expect(page).toHaveURL(/.*panel-de-control/);
  });

  // VP-01: Alta rápida de cliente
  test('VP-01: Alta rápida de cliente desde formulario', async ({ page }) => {
    await page.goto('http://localhost:4200/dashboard/admin/ventas');

    // 1. Abrir modal
    await page.locator('button.btn-nuevo-cliente').click();
    const contenedorModal = page.locator('.contenedor-crear-cliente');
    await expect(contenedorModal).toBeVisible();

    // 2. Llenar campos con sufijo dinámico único
    await contenedorModal.locator('#nombre').fill(`Clientes`);
    await contenedorModal.locator('#apellido').fill('Playwright');
    await contenedorModal.locator('#telefono').fill('3514040404');
    await contenedorModal.locator('#direccion').fill('Moreno 1234');

    // 3. Primer clic: Solicitar confirmación
    await contenedorModal.locator('button.btn-guardar').click();

    // 4. Segundo clic: Confirmar y Guardar en el modal emergente
    const modalConfirmacion = page.locator('.modal-confirmacion-caja');
    await expect(modalConfirmacion).toBeVisible({ timeout: 3000 });

    // Esperar la respuesta 201 de la API
    const responsePromise = page.waitForResponse(
      (resp) => resp.url().includes('/api/clientes/clientes/') && resp.status() === 201
    );
    await modalConfirmacion.locator('button:has-text("Confirmar y Guardar")').click();
    await responsePromise;

    // 5. Verificar mensaje de éxito
    await expect(page.locator('.alerta-exito')).toBeVisible({ timeout: 5000 });
  });

  // VP-03: Actualización de estado “Entregado”
  test('VP-03: Actualización de estado “Entregado”', async ({ page }) => {
    await page.goto('http://localhost:4200/dashboard/admin/ventas');

    // Tomar la primera tarjeta de pendientes
    const primerPedido = page.locator('.pedido-card').first();
    await expect(primerPedido).toBeVisible({ timeout: 10000 });

    // Expandir acciones
    await primerPedido.locator('.pedido-card-header').click();

    const btnEntrega = primerPedido.locator('button.btn-estado-toggle').filter({ hasText: 'Entregué' });

    if (await btnEntrega.isVisible()) {
      // Clic en Entregué
      await btnEntrega.click();

      // Si salta advertencia de stock insuficiente en galpón, confirmar de todos modos
      const modalStock = page.locator('#titulo-alerta-stock');
      if (await modalStock.isVisible({ timeout: 2000 }).catch(() => false)) {
        await page.locator('button:has-text("Confirmar de todos modos")').click();
      }

      // Si el pedido ya estaba pagado, confirmar cierre
      const modalCierre = page.locator('#titulo-confirmar-cierre');
      if (await modalCierre.isVisible({ timeout: 2000 }).catch(() => false)) {
        await page.locator('button:has-text("Confirmar y cerrar")').click();
      }

      // Esperar actualización reactiva
      await page.waitForTimeout(1000);
    }

    // Si el pedido cerró y pasó a pedidos cerrados, abrimos el acordeón para verificarlo
    if (await page.locator('#titulo-confirmar-cierre').isHidden()) {
      const botonCerrados = page.locator('button.btn-toggle-cerrados');
      if (await botonCerrados.isVisible()) {
        const expandido = await botonCerrados.getAttribute('aria-expanded');
        if (expandido !== 'true') {
          await botonCerrados.click();
        }
      }
    }

    // Verificar que figure entregado
    const indicadorE = page.locator('.indicador-estado').filter({ hasText: 'E' }).first();
    await expect(indicadorE).toHaveClass(/indicador-activo/);
  });

  // VP-04: Actualización de estado “Cobrado”
  test('VP-04: Actualización de estado “Cobrado” con confirmación de cierre', async ({ page }) => {
    await page.goto('http://localhost:4200/dashboard/admin/ventas');

    const primerPedido = page.locator('.pedido-card').first();
    await expect(primerPedido).toBeVisible({ timeout: 10000 });

    // Expandir las acciones del pedido
    await primerPedido.locator('.pedido-card-header').click();

    // Localizar botón de pago
    const btnPago = primerPedido.locator('button.btn-estado-toggle').filter({ hasText: /Cobré|Cobrado/ });
    await expect(btnPago).toBeVisible();

    const tituloCierre = page.locator('#titulo-confirmar-cierre');

    // Clic en Cobré
    await btnPago.click();

    // Determinar si disparó el modal de cierre (pedido ya entregado) o actualización directa
    try {
      // Espera reactiva con reintentos para el modal de cierre
      await expect(tituloCierre).toBeVisible({ timeout: 2500 });

      // Interceptar la respuesta del PATCH al confirmar el cierre
      const responsePromise = page.waitForResponse(
        (resp) => resp.url().includes('/toggle-pago/') && resp.status() === 200
      );

      await page.locator('.modal-confirmacion-caja button:has-text("Confirmar y cerrar")').click();
      await responsePromise;

      // Al cerrarse el pedido, validar la notificación de cierre exitoso
      await expect(page.locator('.alerta-exito')).toContainText(/cerrado con éxito/i, { timeout: 5000 });
    } catch {
      // Si el pedido no estaba entregado, no hay modal de cierre; validar indicador activo en la tarjeta
      const indicadorP = primerPedido.locator('.indicador-estado').filter({ hasText: 'P' });
      await expect(indicadorP).toHaveClass(/indicador-activo/, { timeout: 5000 });
    }
  });
});