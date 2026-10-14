from playwright.sync_api import Page, expect

class ProduccionPage:
    def __init__(self, page: Page):
        self.page = page
        # Selectores de Login
        self.input_email = page.locator("#email")
        self.input_password = page.locator("#password")
        self.btn_submit_login = page.locator("button[type='submit'].btn-formulario")
        
        # Selectores de Pedidos / Producción / Navegación
        self.buscador_cliente = page.locator("#buscar-cliente")
        self.btn_guardar_pedido = page.locator("button.btn-guardar")
        self.alerta_exito = page.locator(".alerta-exito")
        self.modal_confirmacion = page.locator(".modal-overlay-backdrop")
        self.btn_confirmar_guardar = page.locator("div.modal-confirmacion-caja button.btn-guardar")

    def navegar_login(self, url: str = "http://localhost:4200/auth/login"):
        self.page.goto(url)

    def iniciar_sesion(self, email: str, password: str):
        self.input_email.fill(email)
        self.input_password.fill(password)
        self.btn_submit_login.click()

    def registrar_pedido_ejemplo(self, nombre_cliente: str, maples_cantidad: int):
        # Seleccionar cliente mediante autocompletado
        self.buscador_cliente.fill(nombre_cliente)
        sugerencia = self.page.locator(".dropdown-clientes-sugerencias li").first
        sugerencia.click()
        
        # Incrementar maples del primer producto disponible (Blanco N.° 1)
        btn_mas = self.page.locator(".producto-fila button.btn-step").nth(1) # El segundo botón es '+'
        for _ in range(maples_cantidad):
            btn_mas.click()
            
        # Guardar pedido
        self.btn_guardar_pedido.click()
        
        # Confirmar en el modal de revisión si aparece
        if self.modal_confirmacion.is_visible():
            self.btn_confirmar_guardar.click()