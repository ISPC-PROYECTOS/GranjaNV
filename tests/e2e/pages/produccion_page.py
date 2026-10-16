from playwright.sync_api import Page

class ProduccionPage:
    def __init__(self, page: Page):
        self.page = page
        
        # Selectores de autenticación
        self.input_email = page.locator("#email") # O el selector de tu input de usuario
        self.input_password = page.locator("#password") # O el de contraseña
        self.btn_login = page.locator("button[type='submit']")
        
        # Selectores específicos de la vista de Producción (/dashboard/produccion)
        self.select_galpon = page.locator("select, .ng-select") # Selector del desplegable de galpones
        self.input_huevos_rotos = page.locator("input[formcontrolname='huevosRotos']") # O input de merma
        self.btn_guardar = page.get_by_role("button", name="Guardar")
        self.btn_limpiar = page.get_by_role("button", name="Limpiar")
        self.alerta_exito = page.locator(".alerta-exito, .toast-success, .alert-success")

    def navegar_login(self):
        self.page.goto("http://localhost:4200/auth/login")

    def iniciar_sesion(self, email: str, password: str):
        self.input_email.fill(email)
        self.input_password.fill(password)
        self.btn_login.click()

    def navegar_produccion(self):
        self.page.goto("http://localhost:4200/dashboard/produccion")

    def registrar_produccion_maples(self, indice_producto: int, cantidad_clicks: int, mermas: str):
        # Incrementa el producto según su posición en la lista (ej: Color N.° 1, Blanco N.° 1, etc.)
        btn_mas = self.page.locator("button:has-text('+')").nth(indice_producto)
        for _ in range(cantidad_clicks):
            btn_mas.click()
            
        # Ingresa la cantidad de huevos rotos (merma)
        self.input_huevos_rotos.fill(mermas)
        
        # Guarda el registro
        self.btn_guardar.click()