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

* **Frontend:** [Angular 21](https://angular.dev/) (SPA modular basada en Signals y componentes Standalone).
* **Backend:** [Django 6.0](https://www.djangoproject.com/) + [Django REST Framework (DRF)](https://www.django-rest-framework.org/) + [Gunicorn](https://gunicorn.org/).
* **Servidor Web / Proxy:** [Nginx](https://nginx.org/).
* **Autenticación:** JWT vía `djangorestframework-simplejwt`.
* **Base de Datos:** PostgreSQL en la nube (Aiven.io).
* **Contenedores:** Docker & Docker Compose.

---

## ⚙️ Requisitos Previos

* **Docker & Docker Compose** (Docker Desktop en Windows/macOS o Docker Engine + compose plugin en Linux).
* Opcional (para desarrollo local sin Docker): **Python 3.11+** y **Node.js 20+**.

---

## 🐳 Ejecución Rápida con Docker (Evaluación Docente)

El proyecto incluye la orquestación y variables de base de datos listas para desplegarse sin configuración manual de archivos `.env`:

### 1. Clonar el repositorio
```bash
git clone https://github.com/ISPC-PROYECTOS/GranjaNV.git
cd <NOMBRE_DEL_DIRECTORIO>
```

### 2. Levantar la aplicación completa
Desde la raíz del repositorio, ejecuta:
```bash
docker compose up --build -d
```
*El servicio `backend` ejecutará automáticamente las migraciones y levantará el servidor WSGI (Gunicorn), mientras que el servicio `frontend` compilará la SPA y la servirá mediante Nginx.*

### 3. Puntos de acceso
* **Frontend (Aplicación Web):** `http://localhost` (Puerto 80).
* **Backend API:** `http://localhost:8000/api/`
* **Panel de Administración Django:** `http://localhost:8000/admin/`

### 4. Detener los servicios
```bash
docker compose down
```

---

## 🔐 Credenciales de Prueba

Para iniciar sesión y verificar los módulos con privilegios administrativos (carga de egresos/gastos y alta de usuarios):

* **Correo Electrónico:** `admin@granjanv.com.ar`
* **Contraseña:** `adminadmin`

---

## 🚀 Ejecución Alternativa (Desarrollo Local sin Docker)

### 1. Configuración del Backend (Django)
```bash
cd backend
python -m venv venv
# Linux/macOS: source venv/bin/activate
# Windows: .\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py runserver
```
Disponible en `http://127.0.0.1:8000/`.

### 2. Configuración del Frontend (Angular)
```bash
cd frontend/granjanv
npm install
npm start
```
Disponible en `http://localhost:4200/`.

---

## 🛠️ Estructura de Trabajo y Desarrollo Colaborativo

### 1. Estrategia de Ramas (Branching Strategy)

El flujo de trabajo se basa en aislamiento por desarrollador e integración continua sobre ramas intermedias:

* `main`: Rama de producción protegida. Contiene únicamente código estable y congelado correspondiente a las Líneas Base (Releases). No se admiten commits directos.
* `dev`: Rama central de integración donde confluyen los módulos validados del equipo.
* **Ramas Personales (`hebepereyra`, `Victoria`, `jorge`, `LautiR2D2`, `mariela`):** Cada desarrollador implementa sus asignaciones de forma aislada.

```text
[ Rama Personal ] ---> (Validación x2 integrantes) ---> [ dev ]
                                                           |
                                                (Testeo final x3 integrantes)
                                                           |
                                                           v
                                    [ main ] ---> Release Tag (v0.1.0-alpha.1)
```

---

### 2. Proceso de Integración y Gobernanza (Code Review)

1. **Desarrollo Local:** El responsable desarrolla la funcionalidad en su rama asignada.
2. **Primera Validación:** Antes del merge a `dev`, el código es probado por el autor y revisado por **2 compañeros**.
3. **Integración en `dev`:** Se integran los cambios en `dev` y se resuelven posibles conflictos.
4. **Validación Previa a Release:** Con las tareas del sprint consolidadas en `dev`, se ejecuta una sesión de testing con **3 integrantes** del equipo.
5. **Paso a `main`:** Al superar las pruebas, se mergea hacia `main`, se genera la etiqueta SemVer (`v0.1.0-alpha.1`) y se actualiza el changelog.

---

### 3. Convenciones de Commits (Conventional Commits)

Los mensajes de commit deben redactarse en español siguiendo el estándar:

* `feat(alcance):` Nueva funcionalidad (ej. `feat(compras): crear formulario de egresos en Angular`).
* `fix(alcance):` Corrección de errores (ej. `fix(auth): corregir redirección en AuthGuard`).
* `style(alcance):` Ajustes de estilos y CSS sin cambios de lógica (ej. `style(ui): adaptar vistas a responsive`).
* `docs(alcance):` Actualización de documentación técnica (ej. `docs: actualizar guía de instalación en README`).
* `refactor(alcance):` Reestructuración de código sin alterar funcionalidad.

---

### 4. Replicación del Entorno Local
Actualmente el proyecto se ejecuta localmente mediante la instalación de dependencias nativas:
* **Backend:** `pip install -r requirements.txt` dentro de un entorno virtual Python (`venv`).
* **Frontend:** `npm install` para la instalación de paquetes en Angular.