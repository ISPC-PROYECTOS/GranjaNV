# Registro de Cambios (Changelog)

Todos los cambios notables del proyecto **Granja NV** se documentarán en este archivo.  
El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [v0.3.0-alpha.3] - 2026-09-20

### Added
- **Módulo de Gestión de Clientes:**
  - Modelo relacional `Cliente` con validación estricta por regex de nombres, apellidos y teléfonos.
  - Distinción entre clientes mayoristas y minoristas con soporte de borrado lógico (*soft delete*) y filtros de búsqueda integrados.
  - Componente modal standalone `CrearClienteComponent` con validaciones reactivas y cuadro de confirmación previa al guardado.
- **Módulo de Ventas y Pedidos:**
  - Modelos relacionales `Pedido` e `ItemPedido` con transacciones atómicas (`@transaction.atomic`) para altas y modificaciones.
  - Agrupación y cálculo automático de maples (30 unidades), subtotales y discriminación por variedades (Blanco 1, Blanco 2, Color 1, Color 2).
  - Vistas interactivas de pedidos pendientes y pedidos cerrados con toggles rápidos para estados de cobro y entrega.
  - Endpoint de agregación SQL `metricas` para cálculo en tiempo real de pedidos pendientes e ingresos del período.
- **Flujo de Seguridad y Recuperación de Contraseña (OTP):**
  - Generación de códigos OTP de 6 dígitos con expiración automática a los 10 minutos.
  - Endpoints `request-otp` y `reset-password-otp` integrados con envío de correos vía SMTP.
  - Interfaz de inicio de sesión reactiva con pantalla de ingreso de OTP y actualización de contraseña.
- **Panel de Control con Métricas en Tiempo Real:**
  - Conexión del dashboard administrativo a los servicios de backend para totalizar gastos operativos y ventas cobradas.
- **Componentes Compartidos y Accesibilidad:**
  - Componente `Buscador` con soporte responsive (panel popup en resoluciones móviles).
  - Componente `SelectorFecha` con filtrado dinámico por mes o rango personalizado.
  - Soporte de modo oscuro persistente en `localStorage`.
- **Landing Pública Interactiva:**
  - Integración de recetas avícolas dinámicas consumidas desde base de datos MongoDB.
  - Secciones informativas adaptadas a dispositivos móviles y botón flotante de WhatsApp.

---

## [v0.2.0-alpha.2] - 2026-08-30

### Added
- **Contenerización y Despliegue con Docker:**
  - `Dockerfile` multi-stage para compilar Angular 21 y servir artefactos estáticos con Nginx.
  - `Dockerfile` optimizado en Python 3.12-slim con servidor WSGI Gunicorn para Django.
  - Configuración de `docker-compose.yml` preconfigurado con las variables de entorno operativas para evaluación directa en un solo comando.
  - Desacoplamiento de configuración en `settings.py` permitiendo lectura de variables del entorno con fallbacks controlados.

---

## [v0.1.0-alpha.1] - 2026-08-27

### Added
- **Módulo de Autenticación:**
  - Endpoint de inicio de sesión con emisión de tokens JWT (`access` y `refresh`) en Django REST Framework.
  - Protección de rutas en Angular mediante `AuthGuard` según el rol de usuario (Administrador / Empleado).
  - Pantallas de login y flujo para recuperación de contraseña.
- **Módulo de Compras:**
  - Modelo relacional `Egreso` en Django para el registro de gastos operativos.
  - Interfaz gráfica en Angular para la carga y visualización de gastos diarios.
- **Componentes Base Reutilizables:**
  - Componente `Navbar` con visualización de fecha, hora e integración del clima.
- **Base de Datos:**
  - Migraciones y modelos iniciales en PostgreSQL para las entidades de usuarios y egresos.

### Fixed
- Corrección en el componente `Navbar` para ocultar el icono de perfil de usuario en la pantalla de login.
- Ajuste de estilos CSS en vistas móviles para corregir desbordes visuales.
- Corrección de validación de permisos en backend para respuestas con código `401 Unauthorized` ante credenciales inválidas.
