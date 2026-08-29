# Registro de Cambios (Changelog)

Todos los cambios notables del proyecto **Granja NV** se documentarán en este archivo.  
El formato está basado en [Keep a Changelog](https://keepachangelog.com/es-ES/1.0.0/) y este proyecto adhiere a [Semantic Versioning](https://semver.org/lang/es/).

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
