# Recordatorio: Implementación de Base de Datos SQLite (Backend)

Este documento sirve como recordatorio y hoja de ruta para la futura implementación de la sincronización de datos de AgroTrack con el servidor central.

## Estado Actual
- **Frontend (Web/Local):** La aplicación web funciona actualmente con una arquitectura **Offline-first**. Los datos generados (productores, trabajadores, registros de pesaje y configuraciones) se almacenan de manera local y rápida en la memoria del navegador usando `IndexedDB` a través de la librería `Dexie.js`.
- **Backend (Servidor/Nube):** Aún no está conectado con la interfaz visual.

## Próximos Pasos (Implementación Futura)
Cuando estemos listos para conectar el sistema centralizado, deberemos seguir este plan:

1. **Desarrollo de API (Backend .NET):**
   - Crear o habilitar los endpoints (Rutas web) en el proyecto Backend que reciban los datos de pesaje y contabilidad.
   - Asegurarse de que el Backend interactúe correctamente con la base de datos **SQLite**.

2. **Lógica de Sincronización en el Frontend (React):**
   - Implementar un proceso en segundo plano (Service Worker o función periódica) que revise si hay conexión a internet.
   - Tomar los registros de `IndexedDB` marcados como "Nuevos" o "Pendientes de sincronizar" y enviarlos por HTTP (POST/PUT) hacia el Backend.
   - Una vez que el servidor responda con éxito, marcar esos registros locales como "Sincronizados" o eliminarlos localmente para no duplicar datos.

3. **Descarga de Datos (Pull):**
   - Al cargar la página en un dispositivo nuevo o si el servidor tiene datos históricos, el Frontend deberá consultar (GET) la base de datos SQLite y actualizar la caché local (IndexedDB).

## Consideraciones para la futura App Android
- Como los datos ya se manejan de manera offline localmente, la futura migración a un APK de Android (usando Capacitor/PWA) no requerirá modificar la estructura de esta sincronización. La app funcionará en zonas rurales sin señal, y sincronizará con SQLite en cuanto detecte Wi-Fi o datos móviles.

---
*Nota: Este archivo fue creado para no perder el enfoque de la estructura a largo plazo de AgroTrack.*
