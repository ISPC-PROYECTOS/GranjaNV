# 🐔 Granja Avícola NV — Sistema de Gestión Integrado

Plataforma web profesional para la gestión y control operativo-administrativo de **Granja Avícola NV**. Repositorio oficial del proyecto ABP para la Tecnicatura Superior en Desarrollo de Software — Equipo **SharkCode**.

El desarrollo se realiza bajo metodologías ágiles (**Scrum**) abarcando los Sprints académicos programados entre **mayo y noviembre de 2026**.

---

## 👥 Equipo de Desarrollo

<p align="center">
  <img width="220" alt="SharkCode Logo" src="https://github.com/user-attachments/assets/61b67249-eeaa-4b17-9f7f-95d1899df5f7" />
</p>

* **Barrera Lautaro** — [@LautyR2D2](https://github.com/LautyR2D2)
* **Marchisone Jorge** — [@jmarchisone](https://github.com/jmarchisone)
* **Pereyra Hebe** — [@PereyraHebe](https://github.com/PereyraHebe)
* **Picco Victoria** — [@vickpicco](https://github.com/vickpicco)
* **Suarez Mariela** — [@MarielarosaSZ](https://github.com/MarielarosaSZ)

---

## 🛠️ Stack Tecnológico

* **Frontend:** [Angular 21](https://angular.dev/) (SPA modular basada en Signals y componentes Standalone).
* **Backend:** [Django 6.0](https://www.djangoproject.com/) + [Django REST Framework (DRF)](https://www.django-rest-framework.org/).
* **Autenticación:** JWT vía `djangorestframework-simplejwt`.
* **Base de Datos:** PostgreSQL en la nube (Aiven.io).

---

## ⚙️ Requisitos Previos

Asegúrate de contar con el siguiente software instalado localmente:

* **Python:** Versión `3.11` o superior (Entorno probado en `3.14.x`).
* **Node.js:** Versión `20.x` LTS o superior (Entorno probado en `v24.14.x`).
* **npm:** Versión `10.x` / `11.x`.
* **Git:** Para clonación y control de versiones.

---

## 🚀 Guía de Instalación y Ejecución

### 1. Clonar el repositorio
```bash
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_DIRECTORIO>
```

---

### 2. Configuración del Backend (Django)

1. Abre una terminal y dirígete al directorio `backend/`:
   ```bash
   cd backend
   ```

2. Crea y activa un entorno virtual de Python:
   * **Linux / macOS:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```
   * **Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```

3. Instala las dependencias del proyecto:
   ```bash
   pip install -r requirements.txt
   ```

4. Ejecuta el servidor de desarrollo:
   ```bash
   python manage.py runserver
   ```
   *El backend estará disponible en `http://127.0.0.1:8000/` con conexión directa a la base de datos remota.*

---

### 3. Configuración del Frontend (Angular)

1. Abre una segunda terminal y navega hasta la raíz de la aplicación web:
   ```bash
   cd frontend/granjanv
   ```

2. Instala los paquetes y dependencias de Node:
   ```bash
   npm install
   ```

3. Inicia el servidor de desarrollo:
   ```bash
   npm start
   ```
   *(O `ng serve` si dispones del CLI de Angular instalado globalmente).*

4. Abre tu navegador e ingresa a `http://localhost:4200/`.

---

### 4. Credenciales de Prueba

Para ingresar y validar las vistas protegidas del Administrador (carga de compras/gastos y alta de usuarios):

* **Correo Electrónico:** `admin@granjanv.com.ar`
* **Contraseña:** `adminadmin`

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
*(La infraestructura basada en Docker y variables de entorno se integrará en la etapa de despliegue final).*