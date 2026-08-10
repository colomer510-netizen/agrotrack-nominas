<div align="center">
  <br>
  <h1>🌿 AgroTrack Nóminas</h1>
  <p>
    <b>Sistema ERP / MES Offline-First para Plantas Procesadoras Agrícolas</b>
  </p>
  <p>
    <img src="https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react" alt="React">
    <img src="https://img.shields.io/badge/.NET-8.0-purple?style=flat-square&logo=dotnet" alt=".NET">
    <img src="https://img.shields.io/badge/Vite-8.0-yellow?style=flat-square&logo=vite" alt="Vite">
    <img src="https://img.shields.io/badge/TailwindCSS-4.0-cyan?style=flat-square&logo=tailwind-css" alt="Tailwind">
    <img src="https://img.shields.io/badge/IndexedDB-Dexie-orange?style=flat-square&logo=database" alt="IndexedDB">
    <img src="https://img.shields.io/badge/SQLite-EF_Core-blue?style=flat-square&logo=sqlite" alt="SQLite">
  </p>
</div>

---

## 📖 Acerca del Proyecto

**AgroTrack Nóminas** es un sistema integral de Planificación de Recursos Empresariales (ERP) y Sistema de Ejecución de Manufactura (MES) diseñado específicamente para plantas procesadoras de plátano pelado al vacío en Nicaragua. 

El sistema digitaliza, automatiza y asegura la **trazabilidad de producción**, el **pesaje por destajo**, y el **cálculo automático de nóminas**, garantizando que la planta pueda seguir operando sin interrupciones gracias a su robusta arquitectura **Offline-First**.

## ✨ Características Principales

- 📡 **Arquitectura Offline-First:** Los operarios pueden registrar pesajes en la planta de procesamiento incluso sin conexión a internet. Los datos se almacenan localmente en IndexedDB y se sincronizan automáticamente con el servidor central al detectar conexión.
- ⚖️ **Módulo de Pesaje por Destajo:** Cálculo automatizado en tiempo real de salarios basado en bolsas base y kilos excedentes.
- 📋 **Trazabilidad FSMA 204:** Registro inmutable (Ledger) de todos los eventos del proceso, asegurando trazabilidad desde el campo hasta la exportación (Lote a Contenedor).
- 🚢 **Aduanas y Exportación:** Módulo dedicado para gestionar contenedores, destinos y generar documentos como Packing List y Certificados IPSA.
- 📊 **Reportería y Contabilidad:** Generación automática de planillas en Excel agrupadas por Operario y Productor, listas para el pago.
- ⚙️ **Configuración Dinámica:** Tarifa de pago, peso base de bolsas y tipo de moneda (C$ / USD) configurables globalmente.

## 🏗️ Arquitectura del Sistema

El proyecto sigue un patrón de diseño **Clean Architecture** en el backend y una arquitectura basada en componentes en el frontend.

- **[Ver Diagrama de Entidad-Relación (ERD)](docs/Diagrama_ERD.html)**
- **[Ver Diagrama de Clases del Dominio](docs/Diagrama_Clases.html)**

### Flujo de Sincronización
1. **Local (Navegador):** React app inserta transacciones marcadas como `Synced = 0` usando `Dexie.js`.
2. **Servicio en Background:** Un worker detecta la conexión de red y hace un ping al servidor.
3. **Batch Upload:** Si hay conexión, se envían las transacciones pendientes a la API.
4. **Almacenamiento Central:** .NET guarda en SQLite central y el cliente actualiza los registros a `Synced = 1`.

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Framework:** React 19 + TypeScript + Vite
- **Estilos:** Tailwind CSS v4 + Lucide Icons
- **Estado y Navegación:** React Router DOM
- **Persistencia Local:** Dexie.js (Wrapper de IndexedDB)
- **Exportación:** ExcelJS

### Backend
- **Framework:** C# .NET 8 Web API
- **Arquitectura:** Clean Architecture (Domain, Application, Infrastructure, Presentation)
- **Base de Datos:** SQLite centralizado
- **ORM:** Entity Framework Core

## 🚀 Cómo Iniciar el Proyecto (Desarrollo Local)

Para ejecutar el sistema en tu máquina, cuentas con un script automatizado que levanta ambos servidores (Frontend y Backend) y abre ventanas de monitoreo en tiempo real.

### Requisitos Previos
- [Node.js](https://nodejs.org/) (v18+)
- [.NET SDK 8.0+](https://dotnet.microsoft.com/en-us/download)

### Instrucciones
1. Abre tu terminal o explorador de archivos.
2. Navega a la raíz del proyecto.
3. Ejecuta el archivo:
   ```cmd
   AgroTrack_Monitor.bat
   ```
   *Esto iniciará el Backend en el puerto `5000` y el Frontend en el puerto `5173`, proporcionando consolas de Logs separadas para fácil depuración.*

## 📁 Estructura del Repositorio

```text
agrotrack-nominas-main/
├── Backend/                 # Solución .NET (API y Lógica de Negocio)
│   ├── AgroTrack.Domain/    # Entidades y Reglas de Negocio Puras
│   ├── AgroTrack.App/       # Servicios, Casos de Uso y CQRS
│   ├── AgroTrack.Infra/     # EF Core, SQLite, y Repositorios
│   └── AgroTrack.Present/   # Controladores API (Endpoints)
├── Frontend/                # SPA React + Vite
│   ├── src/
│   │   ├── components/      # Componentes UI reutilizables
│   │   ├── screens/         # Vistas principales (Pesaje, Historial, etc.)
│   │   ├── services/        # Lógica de Sincronización y API
│   │   └── db.ts            # Esquema de IndexedDB (Dexie)
├── docs/                    # Diagramas de Arquitectura y Base de datos
├── AgroTrack_Monitor.bat    # Script de arranque del ERP
└── README.md
```

## 🗺️ Hoja de Ruta (Roadmap)
Puedes ver las tareas pendientes, características implementadas y el estado actual del desarrollo en el [Project Tracker](PROJECT_TRACKER.md).
