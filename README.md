// Copyright (C) 2026 colomer510-netizen
// This file is part of AgroTrack Nóminas.
// Licensed under the GNU Affero General Public License v3.0. See LICENSE in project root.

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
    <img src="https://img.shields.io/badge/License-AGPL--3.0-blue.svg?style=flat-square" alt="License">
  </p>
</div>

---

## 📖 Acerca del Proyecto

**AgroTrack Nóminas** es un sistema integral de Planificación de Recursos Empresariales (ERP) y Sistema de Ejecución de Manufactura (MES) diseñado específicamente para plantas procesadoras agrícolas.

El sistema digitaliza, automatiza y asegura la **trazabilidad de producción**, el **pesaje por destajo**, y el **cálculo automático de nóminas**, garantizando que la planta pueda seguir operando incluso sin conexión a internet.

## ✨ Características Principales

- 📡 **Arquitectura Offline-First:** Los operarios pueden registrar pesajes en la planta de procesamiento incluso sin conexión a internet. Los datos se almacenan localmente en IndexedDB y se sincronizan automáticamente.
- ⚖️ **Módulo de Pesaje por Destajo:** Cálculo automatizado en tiempo real de salarios basado en bolsas base y kilos excedentes.
- 📋 **Trazabilidad FSMA 204:** Registro inmutable (Ledger) de todos los eventos del proceso, asegurando trazabilidad desde el campo hasta la exportación (Lote a Contenedor).
- 🚢 **Aduanas y Exportación:** Módulo dedicado para gestionar contenedores, destinos y generar documentos como Packing List y Certificados IPSA.
- 📊 **Reportería y Contabilidad:** Generación automática de planillas en Excel agrupadas por Operario y Productor, listas para el pago.
- ⚙️ **Configuración Dinámica:** Tarifa de pago, peso base de bolsas y tipo de moneda (C$ / USD) configurables globalmente.

## 🏗️ Arquitectura del Sistema

El proyecto sigue un patrón de diseño **Clean Architecture** en el backend y una arquitectura basada en componentes en el frontend.

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React/TypeScript)             │
│              (Interfaz Offline-First con Dexie)             │
└────────────────────────────┬────────────────────────────────┘
                             │
                   ┌─────────┴─────────┐
                   │                   │
            ┌──────▼────────┐    ┌─────▼──────────┐
            │   IndexedDB   │    │  LocalStorage  │
            │    (Dexie)    │    │  Sincronización│
            └──────┬────────┘    └─────┬──────────┘
                   │                   │
                   └─────────┬─────────┘
                             │
            ┌────────────────▼─────────────────┐
            │   Backend API (.NET 8 / C#)      │
            │  (Clean Architecture Pattern)    │
            └────────────────┬─────────────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
    ┌────▼──────┐    ┌──────▼──────┐    ┌──────▼──────┐
    │   SQLite  │    │   Servicios │    │  Reportería │
    │  (BD Loc) │    │   Negocio   │    │   (Excel)   │
    └───────────┘    └─────────────┘    └─────────────┘
```

## 🛠️ Requisitos del Sistema

### Herramientas Necesarias (Obligatorias)

Antes de ejecutar el proyecto, debes instalar los siguientes programas:

#### 1. **Node.js y npm** (para Frontend)
- **Versión mínima:** Node.js 18.0 o superior
- **Descargar:** https://nodejs.org/
- **Verificar instalación:**
  ```bash
  node --version
  npm --version
  ```

#### 2. **.NET SDK 8.0** (para Backend)
- **Versión:** .NET 8.0 o superior
- **Descargar:** https://dotnet.microsoft.com/download/dotnet/8.0
- **Verificar instalación:**
  ```bash
  dotnet --version
  ```

#### 3. **Git** (para clonar el repositorio)
- **Descargar:** https://git-scm.com/
- **Verificar instalación:**
  ```bash
  git --version
  ```

### Herramientas Recomendadas (Opcionales pero útiles)

- **Visual Studio Code** (Editor): https://code.visualstudio.com/
  - Extensiones recomendadas:
    - ES7+ React/Redux/React-Native snippets
    - Prettier - Code formatter
    - C# Dev Kit
    - SQLite Viewer

- **Visual Studio 2022 Community** (IDE para .NET): https://visualstudio.microsoft.com/downloads/
  - Seleccionar la carga de trabajo "ASP.NET and web development"

- **Postman** (Pruebas API): https://www.postman.com/downloads/

- **SQLite Browser** (Ver base de datos): https://sqlitebrowser.org/

## 🚀 Guía de Instalación y Ejecución

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/colomer510-netizen/agrotrack-nominas.git
cd agrotrack-nominas
```

### Paso 2: Configurar el Backend (.NET)

```bash
cd Backend
dotnet restore
dotnet build
```

**Para ejecutar el backend:**
```bash
dotnet run
```

El backend estará disponible en: `http://localhost:5000` (o el puerto configurado)

### Paso 3: Configurar el Frontend (React)

```bash
cd Frontend
npm install
```

**Para ejecutar el frontend en modo desarrollo:**
```bash
npm run dev
```

El frontend estará disponible en: `http://localhost:5173` (o el puerto que Vite asigne)

### Paso 4: Ejecutar Ambos Simultáneamente (Recomendado)

En Windows, puedes usar los scripts proporcionados:

```bash
# Inicia tanto el Backend como el Frontend
Iniciar_AgroTrack.bat
```

O en una terminal de PowerShell/Bash:

```bash
# Terminal 1: Backend
cd Backend
dotnet run

# Terminal 2: Frontend (en otra pestaña)
cd Frontend
npm run dev
```

## 📦 Dependencias Principales

### Frontend
- **React** 19.0
- **TypeScript** 5.x
- **Vite** 8.0 (Build tool)
- **TailwindCSS** 4.0 (Estilos)
- **Dexie** (IndexedDB wrapper)
- **React Router**

### Backend
- **.NET** 8.0
- **Entity Framework Core** (ORM)
- **SQLite** (Base de datos)
- **ASP.NET Core** (Framework web)

Instalar todas las dependencias automáticamente con:
```bash
# Frontend
npm install

# Backend
dotnet restore
```

## 🗄️ Configuración de Base de Datos

### SQLite (Backend)
- Ubicación: `Backend/agrotrack.db`
- Se genera automáticamente en la primera ejecución
- Conexión: definida en `appsettings.json`

### IndexedDB (Frontend)
- Se sincroniza automáticamente con el usuario en navegador
- No requiere configuración manual
- Los datos se almacenan localmente en el navegador

## 📝 Comandos Útiles

### Frontend
```bash
cd Frontend

# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linting
npm run lint
```

### Backend
```bash
cd Backend

# Desarrollo
dotnet run

# Build
dotnet build

# Publicar para producción
dotnet publish -c Release

# Migraciones Entity Framework
dotnet ef migrations add NombreMigracion
dotnet ef database update
```

## 🔄 Flujo de Sincronización Offline-First

1. **Modo Offline:** Los datos se guardan en IndexedDB del navegador
2. **Reconexión:** Se sincroniza automáticamente con el backend
3. **Resolución de Conflictos:** El sistema usa timestamps para resolver conflictos
4. **Persistencia:** Garantiza que no se pierdan datos

## 📚 Documentación Adicional

- [Diagrama de Clases](/docs/Diagrama_Clases.md)
- [Diagrama ERD](/docs/Diagrama_ERD.md)
- [Relaciones Explicadas](/docs/diagramas_relaciones_explicados.md)
- [Documento Entregable](/docs/documento_entregable.md)

## 📄 Licencia

Este proyecto está licenciado bajo la GNU Affero General Public License v3.0 (AGPL-3.0).

Copyright (C) 2026 colomer510-netizen

Para más detalles, consulte el archivo [LICENSE](LICENSE) en la raíz del repositorio.

## 👤 Autor

**colomer510-netizen** - https://github.com/colomer510-netizen

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:
1. Fork el repositorio
2. Crea una rama con tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## ❓ Soporte

Si tienes preguntas o encuentras problemas, abre un issue en el repositorio.
