import re
import pytest
from playwright.sync_api import Page, expect
from pages.produccion_page import ProduccionPage

@pytest.fixture(autouse=True)
def configurar_resolucion_movil(page: Page):
    page.set_viewport_size({"width": 375, "height": 667})

def test_registro_produccion_mobile(page: Page):
    produccion_po = ProduccionPage(page)
    
    # 1. Navegar al login e iniciar sesión como administrador/encargado
    produccion_po.navegar_login()
    produccion_po.iniciar_sesion("admin@granjanv.com.ar", "adminadmin")
    
    # 2. Validar redirección exitosa al panel
    expect(page).to_have_url(re.compile("dashboard"))
    
    # 3. Navegar directamente a la vista de producción de la granja
    page.goto("http://localhost:4200/dashboard/produccion")
    
    # 4. Registrar recolección de maples (ej. incrementar "Blanco N.° 1")
    # Localizamos el botón de sumar (+) correspondiente a Blanco N.° 1 u otro tipo
    btn_mas = page.locator("button:has-text('+')").nth(2) # Ajusta el índice según la fila deseada
    btn_mas.click()
    btn_mas.click()
    
    # 5. Registrar huevos rotos (merma en unidades)
    input_rotos = page.locator("input[formcontrolname='huevosRotos'], input#huevos-rotos, input").filter(has=page.locator("xpath=//ancestor::*[contains(text(), 'Huevos rotos')]"))
    # Si prefieres usar un selector directo por placeholder o etiqueta:
    page.locator("input").nth(5).fill("15") # O el selector específico que tenga tu input de merma
    
    # 6. Guardar el registro de producción[cite: 2]
    page.get_by_role("button", name="Guardar").click()
    
    # 7. Validar que la operación fue exitosa (según la alerta o mensaje de éxito de tu app)
    # expect(page.locator(".alerta-exito")).to_be_visible(timeout=5000)