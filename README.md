# 🐔 Granja Avícola NV — Sistema de Gestión Integrado

Plataforma web profesional para la gestión y control administrativo de **Granja Avícola NV**. El sistema consta de una interfaz pública orientada al usuario/cliente y un panel de control privado y restringido para tareas de administración interna.

Este proyecto se desarrolla bajo metodologías ágiles (**Scrum**) abarcando los Sprints académicos programados entre **mayo y noviembre de 2026**.

---

## 👥 Equipo: 

<p align="center">
  <img width="220" alt="SharkCode Logo" src="https://github.com/user-attachments/assets/61b67249-eeaa-4b17-9f7f-95d1899df5f7" />
</p>



A continuación se detallan los integrantes del equipo de desarrollo. *(Haz clic en el enlace para visitar el perfil de GitHub)*:

* **Barrera Lautaro** — [@LautyR2D2](https://github.com/LautyR2D2)
* **Marchisone Jorge** — [@jmarchisone](https://github.com/jmarchisone)
* **Pereyra Hebe** — [@PereyraHebe](https://github.com/PereyraHebe)
* **Picco Victoria** — [@vickpicco](https://github.com/vickpicco)
* **Suarez Mariela** — [@MarielarosaSZ](https://github.com/MarielarosaSZ)

---

## 🛠️ Stack Tecnológico

El proyecto utiliza una arquitectura desacoplada basada en las siguientes tecnologías:

* **Frontend:** [Angular 21](https://angular.dev/) — Framework robusto para aplicaciones web SPAs eficientes y modulares.
* **Backend:** [Django Rest Framework (DRF)](https://www.django-rest-framework.org/) — API RESTful potente, segura y escalable basada en Python.

---

## 🚀 Guía de Instalación y Ejecución

⚠️ **EN CONSTRUCCIÓN** *Las instrucciones detalladas para el despliegue del entorno local, configuración de variables de entorno y ejecución de los servidores de desarrollo se añadirán próximamente.*


# Granja NV — Sistema de Gestión Integrado
Repositorio oficial del proyecto ABP para la Tecnicatura Superior en Desarrollo de Software — Equipo **SharkCode**.

---

## 🛠️ Estructura de Trabajo y Desarrollo Colaborativo

### 1. Estrategia de Ramas (Branching Strategy)
Para garantizar el trabajo en paralelo y la integridad del código fuente, el equipo implementa un flujo basado en **Feature/Personal Branching** con integración continua sobre ramas intermedias:

* `main`: Rama de producción protegida. Contiene únicamente código estable, probado y congelado correspondiente a las Líneas Base (Releases). Queda estrictamente prohibido realizar commits directos sobre `main`.
* `dev`: Rama central de integración. Confluyen los desarrollos validados del equipo y sirve de base para las pruebas de integración local antes de cada release.
* **Ramas Personales / Módulos (`hebepereyra`, `Victoria`, `jorge`, `LautiR2D2`, `mariela`):** Cada desarrollador trabaja sus asignaciones de backend o frontend de forma aislada en su propia rama, evitando interferencias y bloqueos mutuos.

[ Rama Personal ]  ---> (Validación x2 integrantes) ---> [ dev ]
|
(Testeo final x3 integrantes)
|
v
[ main ] ---> Release (Tag)

---

### 2. Proceso de Integración y Gobernanza (Code Review)
El proceso de integración se rige por un esquema colaborativo y rotativo según la coordinación del sprint:

1. **Desarrollo y Testeo Local:** El responsable desarrolla la funcionalidad en su rama personal.
2. **Primera Validación:** Antes de integrar a `dev`, el código es probado por el autor y revisado por **2 compañeros** del equipo para asegurar que no rompa el entorno.
3. **Integración a `dev`:** Se fusiona la funcionalidad a la rama `dev`. Si surgen inconsistencias o bugs, se aplican las correcciones correspondientes directamente en el flujo de integración.
4. **Validación Previa a Producción:** Una vez consolidadas las tareas del sprint en `dev`, se realiza un testing exhaustivo por **3 integrantes** del equipo.
5. **Paso a `main` y Release:** Al superar todas las pruebas, se realiza el merge a `main`, se genera el Tag correspondiente a la nueva versión (`v1.0.0-alpha`) y se redacta el registro en el changelog.

---

### 3. Convenciones de Commits
El equipo implementa el estándar **Conventional Commits** (redactados primordialmente en español) para garantizar un historial claro, descriptivo y trazable:

* `feat(alcance):` Nueva funcionalidad (ej. `feat(compras): crear formulario de egresos en Angular`).
* `fix(alcance):` Corrección de errores (ej. `fix(guards): corregir redirección en AuthGuard`).
* `style(alcance):` Ajustes de estilos y CSS sin afectar la lógica (ej. `style(ui): corregir desborde de tablas en móviles`).
* `docs(alcance):` Modificaciones en la documentación técnica (ej. `docs: actualizar README`).
* `refactor(alcance):` Cambios en el código que no alteran la funcionalidad ni corrigen bugs.

---

### 4. Replicación del Entorno Local
Actualmente el proyecto se ejecuta localmente mediante la instalación de dependencias nativas:
* **Backend:** `pip install -r requirements.txt` dentro de un entorno virtual Python (`venv`).
* **Frontend:** `npm install` para la instalación de paquetes en Angular.
* **Variables de entorno:** Configuradas a través de archivos locales `.env`.
*(La infraestructura basada en Docker se integrará en la etapa de despliegue final).*
