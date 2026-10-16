# 🐔 Granja Avícola NV — Sistema de Gestión Integrado

Plataforma web profesional para la gestión y control operativo-administrativo de **Granja Avícola NV**. Repositorio oficial del proyecto ABP para la Tecnicatura Superior en Desarrollo de Software — Equipo **SharkCode**.

El desarrollo se realiza bajo metodologías ágiles (**Scrum**) abarcando los Sprints académicos programados entre **mayo y noviembre de 2026**.

---

## 👥 Equipo de Desarrollo

* **Barrera Lautaro** — [@LautyR2D2](https://github.com/LautyR2D2)
* **Marchisone Jorge** — [@jmarchisone](https://github.com/jmarchisone)
* **Pereyra Hebe** — [@PereyraHebe](https://github.com/PereyraHebe)
* **Picco Victoria** — [@vickpicco](https://github.com/vickpicco)
* **Suarez Mariela** — [@MarielarosaSZ](https://github.com/MarielarosaSZ)

---

## 🛠️ Stack Tecnológico

* **Frontend:** [Angular 21](https://angular.dev/) (SPA modular basada en Signals, componentes Standalone y control flow nativo `@if`/`@for`).
* **Backend:** [Django 6.0](https://www.djangoproject.com/) + [Django REST Framework (DRF)](https://www.django-rest-framework.org/) + [Gunicorn](https://gunicorn.org/).
* **Servidor Web Local:** [Nginx](https://nginx.org/) como proxy reverso para los contenedores Docker locales.
* **Autenticación y Seguridad:** JWT vía `djangorestframework-simplejwt`, recuperación de contraseñas mediante código OTP por correo electrónico (SMTP) y control de acceso basado en roles (`Administrador` y `Empleado`).
* **Bases de Datos:**
  * **PostgreSQL:** Alojado en [Aiven.io](https://aiven.io/) para el core transaccional relacional con conexiones forzadas vía SSL.
  * **MongoDB:** Alojado en [MongoDB Atlas](https://www.mongodb.com/atlas) para recetas dinámicas de la landing y auditoría de reportes exportados.
* **Infraestructura Cloud (Producción):**
  * **Frontend Hosting:** [Vercel](https://vercel.com/) con reescritura de rutas proxy (`vercel.json`).
  * **Backend Hosting:** [Render](https://render.com/) (Web Service ejecutando migraciones automáticas, WhiteNoise y Gunicorn).
  * **DNS y Edge SSL:** [Cloudflare](https://www.cloudflare.com/) administrando el dominio oficial de [NIC.ar](https://nic.ar/) bajo cifrado SSL/TLS en modo Full (Strict).
* **Testing:**
  * **Backend Unit & Integration:** Django `APITestCase`.
  * **API Testing:** Colecciones de Postman automatizadas con Newman.
  * **Frontend E2E & Accesibilidad:** [Playwright](https://playwright.dev/) + `@axe-core/playwright` para estándares WCAG AA.
* **Contenedores:** Docker & Docker Compose.

---

## 📦 Módulos del Sistema

1. **Ventas y Pedidos:** Registro rápido de pedidos por maple (30 unidades), discriminación por tamaño/color, control de cobro/entrega y balance comercial.
2. **Producción Avícola:** Registro diario de recolección de huevos, control de mermas (roturas), traslados de gallinas y balance dinámico de stock por galpón.
3. **Finanzas y Compras:** Registro categorizado de gastos operativos (alimentos, combustible, insumos, ferretería) con cálculo de balance neto del período.
4. **Gestión y Reportes:**
   * **Exportación de Informes:** Generación de archivos descargables en PDF (ReportLab) y Excel (OpenPyXL) con resúmenes ejecutivos.
   * **Métricas Comerciales:** Gráficos SVG interactivos de efectividad de postura, comparativas mensuales y tendencias de recolección.
   * **Gestión de Galpones:** Monitoreo visual de ocupación de aves frente a la capacidad máxima instalada.
   * **Gestión de Clientes y Usuarios:** Mantenimiento de cuentas, control de duplicados y asignación de roles del sistema.
5. **Notificaciones del Sistema:** Panel de avisos en tiempo real sobre entregas pendientes de la jornada y cambios en la población avícola.
6. **Landing Page Pública:** Portal institucional informativo con catálogo de recetas de cocina avícola y canal de contacto comercial.

---

## 🌐 Entorno de Producción (Cloud Deployment)

* **Aplicación Web Oficial:** `https://granjanv.com.ar` *(reemplazar por el dominio delegado)*
* **API Backend:** `https://granjanv.com.ar/api/` (redirigido a Render vía Vercel Rewrites)
* **Panel Administrativo Django:** `https://granjanv.com.ar/admin/`

> **Nota sobre Cold Starts en Render:** En la capa gratuita, tras 15 minutos sin peticiones entrantes el servicio entra en reposo. La primera consulta puede experimentar una latencia inicial de 40 a 50 segundos mientras se levanta el contenedor.

---

## ⚙️ Requisitos Previos

* **Docker & Docker Compose** (Docker Desktop en Windows/macOS o Docker Engine + compose plugin en Linux).
* Alternativa local sin Docker: **Python 3.12+** y **Node.js 22+**.

---

## 🐳 Ejecución Rápida con Docker (Evaluación Docente)

El proyecto incluye la orquestación y variables listas para reproducir el entorno completo en un solo comando:

### 1. Clonar el repositorio
```bash
git clone [https://github.com/ISPC-PROYECTOS/GranjaNV.git](https://github.com/ISPC-PROYECTOS/GranjaNV.git)
cd GranjaNV
```

### 2. Configurar variables de entorno
Creá el archivo `.env` en la raíz a partir de la plantilla base:
```bash
cp .env.example .env
```
**Se enviará por correo electrónico al cuerpo docente para implementación.**

### 3. Levantar la aplicación completa
Desde la raíz del repositorio:
```bash
docker compose up --build -d
```
*El servicio `backend` ejecutará automáticamente las migraciones pendientes y levantará el servidor WSGI (Gunicorn), mientras que el servicio `frontend` compilará la SPA y la servirá mediante Nginx.*

### 4. Puntos de acceso locales
* **Frontend (Aplicación Web):** `http://localhost` (Puerto 80).
* **Backend API:** `http://localhost:8000/api/`
* **Panel de Administración Django:** `http://localhost:8000/admin/`

### 5. Detener los servicios
```bash
docker compose down
```

---

## 🧪 Ejecución de Pruebas Automatizadas

### Pruebas Backend (Django APITestCase)
Para ejecutar la suite completa de pruebas unitarias y de integración del backend:
```bash
cd backend
python manage.py test
```

### Pruebas de API con Newman (Postman)
Para ejecutar los tests de integración de endpoints vía consola:
```bash
newman run tests/postman_collection.json -e tests/postman_environment.json
```

### Pruebas Frontend E2E y Accesibilidad (Playwright)
Para correr los tests de interfaz y auditoría de accesibilidad WCAG AA:
```bash
cd frontend/granjanv
npx playwright test
```

---

## 🔐 Credenciales de Prueba

Para iniciar sesión y evaluar el sistema con privilegios de Administrador:

* **Correo Electrónico:** `admin@granjanv.com.ar`
* **Contraseña:** **Se enviará por correo electrónico al cuerpo docente.**

---

## 🚀 Ejecución Manual en Desarrollo (Sin Docker)

### 1. Backend (Django)
```bash
cd backend
python -m venv venv
# Linux/macOS: source venv/bin/activate
# Windows: .\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```
Disponible en `http://127.0.0.1:8000/`.

### 2. Frontend (Angular)
```bash
cd frontend/granjanv
npm install
npm start
```
Disponible en `http://localhost:4200/`.

---

## 🛠️ Estructura de Trabajo y Gobernanza

### 1. Estrategia de Ramas (Branching Strategy)

* `main`: Rama de producción protegida. Contiene únicamente código estable y congelado correspondiente a las Líneas Base (Releases).
* `dev`: Rama central de integración donde confluyen los módulos validados del equipo.
* **Ramas Personales (`hebepereyra`, `Victoria`, `jorge`, `LautiR2D2`, `mariela`):** Cada desarrollador implementa sus asignaciones de forma aislada.

```text
[ Rama Personal ] ---> (Validación x2 integrantes) ---> [ dev ]
                                                           |
                                                (Testeo final x3 integrantes)
                                                           |
                                                           v
                                    [ main ] ---> Release Tag (v1.0.0-beta.1)
```

### 2. Proceso de Integración Continua (Code Review)

1. **Desarrollo Local:** El responsable desarrolla la funcionalidad en su rama asignada.
2. **Primera Validación:** Antes del merge a `dev`, el código es probado por el autor y revisado por **2 compañeros**.
3. **Integración en `dev`:** Se integran los cambios en `dev` y se resuelven posibles conflictos.
4. **Validación Previa a Release:** Con las tareas consolidadas en `dev`, se ejecuta una sesión de testing con **3 integrantes** del equipo.
5. **Paso a `main`:** Al superar las pruebas, se mergea hacia `main`, se genera la etiqueta SemVer (`v1.0.0-beta.1`) y se actualiza el changelog.