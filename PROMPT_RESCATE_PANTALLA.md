# 🚑 Prompt de Rescate Pro: Pantalla Blanca/Negra (Electron / React / Vite)

Si te enfrentas al infame "White Screen of Death" (Pantalla Blanca de la Muerte) en una aplicación web o de escritorio (Electron/React/Vite) que compila bien pero no renderiza nada, utiliza este prompt avanzado. 

Este prompt está enriquecido con las mejores prácticas y causas documentadas por la comunidad técnica para obligar a la IA a realizar una auditoría arquitectónica profunda.

---

### 📋 Copia y pega el siguiente texto a tu asistente de IA:

> **"La aplicación compila pero se queda en una pantalla en blanco/negro y no renderiza el frontend. Actúa como un Arquitecto de Software Experto en Depuración Profunda y ejecuta paso a paso el siguiente 'Protocolo de Rescate'. Tu objetivo es ignorar errores superficiales de CSS/HTML y enfocarte en las causas fatales documentadas del WSOD (White Screen of Death):**
> 
> **1. Forzar DevTools y Captura de Consola:** Instrúyeme para abrir las DevTools forzosamente desde el proceso principal (`win.webContents.openDevTools()`). Pídeme que ejecute el binario compilado desde la terminal (ej. `.\app.exe` o `./app`) para capturar cualquier volcado de error (stderr) que la interfaz gráfica esté ocultando.
> 
> **2. Rutas Estáticas y de Compilación (404s silenciosos):** Revisa si estamos usando rutas relativas rotas en producción. Comprueba que el Main Process carga el frontend usando `win.loadFile(path.join(__dirname, 'index.html'))` y no `loadURL` para archivos locales. Además, revisa si el campo `"homepage": "./"` falta en `package.json` causando que React busque los JS/CSS en la raíz equivocada.
> 
> **3. El Problema del Enrutador (React Router):** Verifica el código del frontend. Si estamos en Electron y usando `BrowserRouter`, cámbialo inmediatamente a `HashRouter`. Las rutas de navegador basadas en historial fallan rotundamente cuando se sirven desde el sistema de archivos (`file://`), causando una pantalla blanca.
> 
> **4. Conflictos de Módulos Nativos C++ (Node vs Electron):** Revisa el `package.json`. Si usamos dependencias nativas (`better-sqlite3`, `serialport`, `node-pty`), verifica si hay un error de `NODE_MODULE_VERSION`. Electron usa una versión interna de Node diferente a la del sistema operativo. Instrúyeme para ejecutar `@electron/rebuild` y recompilar los bindings C++ si sospechas de esto.
> 
> **5. Choque de Ecosistemas (ESM vs CommonJS):** Los módulos nativos en C++ de Node requieren `require()`, pero los frameworks modernos como Vite empujan al uso de ESM (`import`). Revisa si el compilador está inyectando ESM estático en el proceso de Node (Electron Main). De ser así, reescribe la configuración del bundler para que la salida (output) sea estrictamente `cjs` o elimina `"type": "module"` del `package.json`.
> 
> **6. Fallos de Montaje Inicial (React Crashes):** El renderizador puede colapsar si un hook `useEffect` inicial o una llamada asíncrona (`window.api...`) falla sin un bloque `try/catch`. Revisa el punto de entrada de React (`App.tsx` o `main.tsx`) para asegurar que todo error esté siendo atrapado, previniendo que el árbol completo de componentes se desmonte de forma silenciosa."

---

### 💡 ¿Por qué es efectivo este Prompt?
Recopila los "Agujeros Negros" más comunes de las aplicaciones modernas:
- **Punto 2 y 3** atacan los problemas más clásicos del empaquetado de React (Rutas y Router).
- **Punto 4 y 5** abordan la complejidad de juntar el backend Node.js (CommonJS/C++) con el ecosistema de frontend moderno (ESM/Vite) dentro de Electron.
- **Punto 1 y 6** obligan a revelar los errores que de otro modo quedarían ocultos en el abismo de un proceso colapsado.
