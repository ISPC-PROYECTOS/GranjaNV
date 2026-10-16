# Registro de Cambios (Changelog)

Todos los cambios notables del proyecto **Granja NV** se documentarán en este archivo.  
El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

## [v1.0.0-beta.1] - 2026-10-16

### Added
- **Módulo Integral de Producción Avícola:**
  - Modelos relacionales `Galpon`, `MovimientoGallina`, `RegistroProduccion` e `ItemProduccionHuevo` con restricciones de integridad a nivel de base de datos (`CheckConstraint` para stock no negativo y capacidades positivas).
  - Lógica transaccional atómica (`@transaction.atomic` y `select_for_update`) en el registro de movimientos de aves (ingresos, bajas por mortalidad, ventas, traslados) con ajuste automático de población viva.
  - Endpoint de cálculo de stock en tiempo real (`/api/produccion/metricas/`) que deduce las ventas entregadas de los huevos recolectados netos por variedad comercial (Color 1, Color 2, Blanco 1, Blanco 2, Mixto).
  - Vistas SPA en Angular con interfaz táctil y adaptada a dispositivos móviles: formularios de registro de maples con paso a paso (`step counters`), confirmación previa modal y tarjetas de métricas diagonales en carrusel.
- **Módulo de Reportes, Métricas y Gestión Administrativa:**
  - **Submódulo de Reportes:** Generación y descarga bajo demanda de informes en formato PDF (utilizando ReportLab con inserción de membretes/logo) y hojas de cálculo Excel (vía OpenPyXL con formateo dinámico de celdas) para producción, finanzas e informes unificados.
  - **Persistencia NoSQL (MongoDB Atlas):** Registro y auditoría de descargas de reportes en la base de datos `granjanv_reportes` (colección `exportaciones`) con serialización de datos Decimal y marcas de tiempo UTC.
  - **Métricas Comerciales Dinámicas:** Endpoint `/api/reportes/metricas-comerciales/` con análisis de porcentaje de postura, ganancia neta y cálculo de tendencias de producción con granularidad adaptable (diaria $\le 31$ días, semanal $\le 120$ días o mensual).
  - **Gestión de Galpones:** Administración centralizada de instalaciones avícolas con control de capacidad física máxima, población inicial, porcentaje de ocupación en barras de progreso y conmutador de estado activo/inactivo.
  - **Gestión de Usuarios:** Panel administrativo para control de personal con asignación de roles (Administrador / Empleado), actualización de datos personales, blanqueo de contraseñas y baja controlada.
  - **Gestión Avanzada de Clientes:** Filtro de clientes por estado comercial (activos/inactivos con soft delete) y validación preventiva en tiempo real ante duplicados u homónimos exactos.
- **Sistema Reactivo de Notificaciones Internas:**
  - Modelo `Notificacion` con índices compuestos y restricción de unicidad (`unique_notificacion_diaria_por_usuario`) para garantizar idempotencia en avisos del sistema.
  - Disparadores automáticos de eventos: verificación de pedidos programados para la fecha actual al consultar el panel y notificación a administradores ante cualquier movimiento de aves registrado por los operarios.
  - Servicio frontend `NotificacionesService` con sondeo inteligente (*polling*) periódico cada 15 segundos atado a la visibilidad de la pestaña (`document.visibilityState === 'visible'`), contador de alertas no leídas y navegación directa a la ruta SPA correspondiente.
- **Suite Integral de Pruebas Automatizadas (Testing):**
  - **Backend (Django REST Framework):** Pruebas de integración basadas en `APITestCase` para autenticación JWT (`test_auth.py`), validaciones atómicas de compras (`compras/tests.py`), pedidos y cambios de estado (`pedidos/tests.py`), reglas de población en galpones (`produccion/tests.py`) y verificación de reportes con control de acceso por roles (`reportes/tests.py`).
  - **Pruebas de API con Postman & Newman:** Colecciones estructuradas para validar contratos REST, autenticación Bearer y flujos de error HTTP (400, 401, 403, 404) ejecutables en entornos de integración continua mediante Newman.
  - **Pruebas End-to-End (E2E) con Playwright:** Configuración de `@playwright/test` en el frontend para validar flujos críticos de usuario (inicio de sesión, carga de pedidos y transiciones entre paneles).
  - **Accesibilidad Web (A11y):** Incorporación de `@axe-core/playwright` para auditorías automatizadas de accesibilidad según estándares WCAG AA en vistas clave.
- **Infraestructura de Despliegue Multi-Cloud:**
  - Configuración para despliegue del backend en **Render** (Web Service capa gratuita) servido mediante Gunicorn y WhiteNoise para la entrega de estáticos.
  - Despliegue del frontend Angular 21 en **Vercel** (`dist/granjanv/browser`) con configuración de proxy inverso en `vercel.json` para reescribir llamadas a `/api/*` y `/admin/*`, eliminando problemas de CORS.
  - Bases de datos gestionadas: PostgreSQL relacional alojado en **Aiven.io** con SSL obligatorio y MongoDB distribuido en **MongoDB Atlas**.
  - Configuración de DNS perimetral con **Cloudflare** sobre el dominio oficial de `nic.ar`, forzando cifrado SSL/TLS en modo Full (Strict).

### Changed
- Refactorización de servicios HTTP en Angular hacia funciones `inject()` nativas y uso extensivo de Signals para la reactividad de la interfaz.
- Optimización del tiempo de carga mediante componentes Standalone con lazy loading en el árbol de rutas (`app.routes.ts`).
- Mejora de usabilidad móvil en componentes compartidos: rediseño adaptativo del `Buscador` (modo popup), `SelectorFecha` y spinner centralizado de carga.
- Persistencia de preferencias de usuario: modo oscuro configurable en `localStorage` con adaptación global de paleta de colores.
- Integración de API meteorológica pública (Open-Meteo) en el componente `Navbar` para visualización del clima en tiempo real y pronóstico semanal.

---

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