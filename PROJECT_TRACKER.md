# PROJECT_TRACKER - ERP/MES Planta Procesadora

## Estado Actual
- **Fase:** Iniciación / Arquitectura.
- **Progreso:** Estableciendo bases documentales, diagramas y andamiaje de software.

## Historial de Cambios (Changelog)
- **31-07-2026:** Creación de la estructura base del proyecto, diagramas de arquitectura y PROJECT_TRACKER.md. Configuración inicial de Clean Architecture para Backend y Feature Modules para Frontend.

## Lista de Tareas (To-Do)

### Módulo: Core / Arquitectura
- [x] Crear diagramas de arquitectura (ERD, Flujo, Componentes).
- [x] Crear archivo de control (PROJECT_TRACKER.md).
- [x] Generar andamiaje de Clean Architecture (.NET) y Feature Modules (Ionic).

### Módulo: Pesaje (Destajo y Kilos Excedentes)
- [x] Implementar modelos de dominio (Operario, TransaccionPesaje).
- [x] Desarrollar lógica de `CalculoNominaService` en Córdobas.
- [x] Construir UI Móvil `PesajeScreen.tsx` (Indicador visual 23kg, panel de ganancias).
- [x] Integrar mock de `BalanzaMTService` (MT-SICS).

### Módulo: Trazabilidad
- [x] Configurar SQLite local (Ledger inmutable - FSMA 204).
- [ ] Sincronización offline-first con el backend.

### Módulo: Aduanas y Exportación
- [x] Modelo `ContenedorExportacion`.
- [x] Pantalla `AdminExportacionScreen.tsx`.
- [x] Controlador `ExportacionController.cs`.
- [x] Generación de PDF (QuestPDF): Packing List, Factura Comercial, IPSA.

### Módulo: Recursos Humanos (RRHH)
- [x] Controlador `ReportesController.cs`.
- [x] Exportación de nómina a Excel (ClosedXML).

### Módulo: Gamificación en TV (Futuro)
- [ ] Desarrollar capa de infraestructura y UI sin afectar módulo de Pesaje.
