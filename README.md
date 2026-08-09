# AgroTrack Nóminas

Sistema móvil y web *offline-first* para el control de pesaje, destajo y automatización de nóminas de trabajadores agrícolas (ERP/MES para Planta Procesadora).

## 🚀 Características Principales

*   **Módulo de Pesaje:** Control preciso de destajo y kilos excedentes. Cálculo automático de nóminas en tiempo real (basado en configuración global de monedas y tarifas).
*   **Trazabilidad:** Almacenamiento local *offline-first* mediante SQLite, creando un *ledger* inmutable para cumplimiento normativo (ej. FSMA 204).
*   **Aduanas y Exportación:** Gestión de contenedores de exportación y generación automática de documentos PDF (Packing List, Factura Comercial, IPSA).
*   **Recursos Humanos y Contabilidad:** Historial de transacciones y exportación de reportes de nómina a formato Excel.
*   **Arquitectura:** Diseño "Clean Architecture" en el backend y estructurado por "Feature Modules" en el frontend.

## 🛠️ Tecnologías Utilizadas

*   **Frontend:** React (Vite), TypeScript, Tailwind CSS
*   **Backend:** C# .NET (Clean Architecture)
*   **Almacenamiento Local:** SQLite

## 📂 Estructura del Proyecto

*   `/Frontend`: Interfaz de usuario (React/Vite).
*   `/Backend`: Servicios, API y dominio de la aplicación (.NET).
*   `/docs`: Diagramas de flujo, base de datos y arquitectura de sistemas.

## 📈 Estado del Desarrollo

Actualmente el proyecto cuenta con el andamiaje inicial y funciones principales de pesaje, aduanas, exportación a excel y trazabilidad en SQLite.

Para ver el avance detallado de tareas y cambios recientes, puedes consultar el archivo [PROJECT_TRACKER.md](./PROJECT_TRACKER.md).
