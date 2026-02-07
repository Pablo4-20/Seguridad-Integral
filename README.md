# 🛡️ Sistema de Seguridad Integral - Universidad Estatal de Bolívar (UEB)

Plataforma tecnológica integral para la **Unidad de Gestión de Riesgos (UGR)**, diseñada para centralizar reportes de incidentes, gestionar alertas de pánico en tiempo real y difundir protocolos de seguridad a la comunidad universitaria.

<p align="center">
  <img width="300" alt="image" src="https://github.com/user-attachments/assets/47ab03d3-2e3e-4cca-970c-abe4ee3c8896" />
  <img width="300" alt="image" src="https://github.com/user-attachments/assets/77a97499-c3db-46bf-a1f2-a18af9cf093e" />
  <img width="300" alt="image" src="https://github.com/user-attachments/assets/55895c4e-b63d-4be5-9e92-66917c2b8022" />
  <img width="300" alt="image" src="https://github.com/user-attachments/assets/26af6bfc-a408-4e80-be65-f0de2f802bcf" />
  <img width="300" alt="image" src="https://github.com/user-attachments/assets/014a0937-0969-4985-be86-577f0f009eb8" />
  <img width="300" alt="image" src="https://github.com/user-attachments/assets/6c8931bc-e6ec-4a9b-8b0c-090558ee080a" />
</p>

## 📋 Descripción del Proyecto

Este sistema implementa una arquitectura **Cliente-Servidor** para mejorar los tiempos de respuesta ante emergencias dentro del campus. Consta de tres componentes principales:

1.  **Backend (API REST):** Gestiona la lógica de negocio, base de datos y seguridad.
2.  **Panel Administrativo (Web):** Dashboard para el Director y Administradores para gestionar incidentes, usuarios y noticias.
3.  **Aplicación Móvil (Android):** Herramienta para estudiantes y docentes que permite enviar alertas SOS y reportar incidentes con evidencia multimedia.

---

## 🚀 Tecnologías Utilizadas

### 🔙 Backend (Servidor)
* **Framework:** Laravel 10 (PHP 8.2+)
* **Base de Datos:** PostgreSQL
* **Autenticación:** Laravel Sanctum (Tokens)
* **Almacenamiento:** File Storage (Local/Public)

### 🖥️ Frontend (Panel Administrativo)
* **Librería:** React.js 18 + Vite
* **Estilos:** TailwindCSS
* **Gráficos:** Chart.js
* **Mapas:** Leaflet / React-Leaflet
* **Editor de Texto:** React-Quill-New

### 📱 Aplicación Móvil (Android)
* **Lenguaje:** Kotlin
* **UI Framework:** Jetpack Compose (Material Design 3)
* **Red:** Retrofit + OkHttp
* **Mapas:** Osmdroid (OpenStreetMap)
* **Imágenes:** Coil
* **Hardware:** GPS, Cámara, Vibración

---

## ✨ Funcionalidades Clave

### 🚨 App Móvil
* **Botón de Pánico (SOS):** Envío inmediato de alerta con ubicación GPS en tiempo real y señal acústica.
* **Reporte de Incidentes:** Formulario con geolocalización automática, carga de fotos y selección de categoría.
* **Modo Offline:** Pantalla de protección y reintento cuando no hay conexión a internet.
* **Historial:** Consulta de estado de reportes ("Pendiente", "En Curso", "Resuelto").
* **Información:** Acceso a Rutas de Evacuación, Protocolos y Mochila de Emergencia.

### 💻 Panel Web
* **Dashboard en Vivo:** Estadísticas y gráficos de incidentes por mes/tipo con actualización automática (Polling).
* **Gestión de Incidentes:** Tabla detallada con filtros, visualización de evidencia y cambio de estado.
* **Gestor de Contenidos:** Editor de texto enriquecido para publicar noticias y alertas en la app.
* **Mapa de Calor:** Visualización de zonas de peligro y puntos de encuentro.

---

## 🛠️ Guía de Instalación y Despliegue

Sigue estos pasos para levantar el proyecto en un entorno local.

### 1. Configuración del Backend (Laravel)

```bash
# Clonar repositorio
git clone <url-del-repo>
cd mi-backend

# Instalar dependencias PHP
composer install

# Configurar entorno
cp .env.example .env
# --> Configurar DB_CONNECTION=pgsql y credenciales en .env

# Generar clave de aplicación
php artisan key:generate

# Migrar base de datos
php artisan migrate

# Crear enlace simbólico para imágenes (IMPORTANTE)
php artisan storage:link

# Iniciar servidor
php artisan serve --host=0.0.0.0


```
### 2. Configuración del Panel Web (React)
```bash
cd panel-administrativo

# Instalar dependencias Node
npm install

# Iniciar entorno de desarrollo
npm run dev
```
### 3. Configuración de la App Móvil (Android)
```bash
Abrir la carpeta app-movil en Android Studio.

Localizar el archivo de configuración global: com/example/ejemplo/data/Config.kt.

Actualizar la IP del servidor según tu entorno

Sincronizar Gradle y ejecutar en el dispositivo/emulador.
```
## 📂 Estructura del Repositorio
```bash
/
├── mi-backend/           # API Laravel (Lógica y BD)
│   ├── app/
│   │   ├── Http/Controllers/Api/   # Controladores lógicos
│   │   │   ├── AuthController.php      # Login y gestión de tokens
│   │   │   ├── AdminController.php     # Dashboard y estadísticas
│   │   │   ├── IncidenteController.php # Recepción de reportes
│   │   │   ├── NoticiaController.php
│   │   │   └── PanicoController.php    # Gestión de alertas SOS
│   │   └── Models/                 # Modelos Eloquent (ORM)
│   │       ├── User.php
│   │       └── PuntoMapa.php
│   ├── database/
│   │   ├── migrations/             # Esquemas de tablas (SQL)
│   │   └── seeders/                # Datos de prueba iniciales
│   ├── routes/
│   │   └── api.php                 # Definición de Endpoints
│   └── storage/app/public/         # Almacenamiento de evidencias (Imágenes)
│
├── panel-administrativo/ # React Web (Dashboard)
│   ├──public/
│   │  └── alert.mp3
│   │
│   ├── src/           # Vistas: Dashboard, Incidentes, Noticias
│   │   ├── api/              # Configuración de Axios
│   │   │   └── axios.js
│   │   │
│   │   ├── assent/
│   │   │   └── ugr.png
│   │   │
│   │   ├── components/       # MapaGestor, Sidebar, Modales
│   │   │   └── MapaGestor.jsx
│   │   │
│   │   ├── layout/
│   │   │   └── MainLayout.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Alertas.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Incidentes.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Noticias.jsx
│   │   │   └── Usuarios.jsx
│   │   │
│   │   ├── App.jsx
│   │   ├── index.jsx
│   └── └── main.jsx
│
│
└── app/            # Android Kotlin (Cliente)
    ├──manifest/
    │  └── androidmanifest.xml
    │
    ├──Kotlin+java/
    │   └── com.example.ejemplo/
    │   │   ├── data/
    │   │   │   ├── Config.kt               # IP Global del Servidor
    │   │   │   ├── Modelo.kt               # Data Classes (ReporteItem, Noticia...)
    │   │   │   ├── RetrofitClient.kt       # Cliente HTTP
    │   │   │   ├── SessionManager.kt       # Gestión de Sesión
    │   │   │   ├── loginModels.kt
    │   │   │   └── SettingsManager.kt      # Preferencias de Usuario
    │   │   │
    │   │   ├── EvacuationScreen.kt    # Mapa de Rutas (Osmdroid)
    │   │   ├── HomeScreen.kt          # Menú Principal y Botón de Pánico
    │   │   ├── LoginScreen.kt         # Autenticación
    │   │   ├── MyAlertsScreen.kt      # Historial de Pánico (Timeline)
    │   │   ├── MyReportsScreen.kt     # Historial de Reportes
    │   │   ├── NewsListContent.kt     # Listas de Noticias/Protocolos
        │   ├── NoticiaDetailScreen.kt # Vista de Detalle (HTML Render)
        │   ├── ProfileScreen.kt       # Menú de Perfil
        │   ├── ReportScreen.kt        # Formulario de Incidentes (GPS/Cámara)
        │   ├── SettingsScreen.kt      # Configuración de Notificaciones
        │   ├── SupportScreen.kt       # Pantalla de Soporte
        │   └── UserProfileScreen.kt   # Edición de Perfil y Foto

      ui/                   # Screens: Login, Home, Report, Mapas, etc
    ├── data/                 # Modelos, RetrofitClient, Config, etc
    └── utils/                # NetworkUtils, VibrationUtils, LocationService
```
## 👥 Autores
Trabajo de Integración Curricular para la obtención del título de Ingeniero en Software.
###  Autores
* **Pablo David Holguin Rios**
* **Nataly Domenica Silva Villagran**
###  Directora:
* **Ing. Maricela Espín**
###  Institución:
* **Universidad Estatal de Bolívar**
## 📄 Licencia
Este proyecto es de uso exclusivo académico e institucional para la Universidad Estatal de Bolívar. Todos los derechos reservados.

