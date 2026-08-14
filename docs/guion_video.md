# Guion y Estructura Sugerida para el Video de 15 Minutos

Este es un bosquejo de cómo puedes estructurar tu presentación de 15 minutos, usando palabras sencillas para que cualquiera pueda entender el gran valor de tu proyecto.

**Requisito indispensable:** Asegúrate de que tu cámara web esté encendida (se debe ver tu rostro) y estés compartiendo tu pantalla completa.

---

### Minuto 0:00 - 2:00 | Introducción y Planteamiento del Problema
*   **Acción en Pantalla:** Muestra una diapositiva inicial con tu nombre y el título del proyecto, o el documento PDF que generamos.
*   **Lo que debes decir:** 
    *   Saluda y preséntate.
    *   Presenta el proyecto: "Hoy les voy a presentar AgroTrack Nóminas, un sistema de control de producción y pagos para plantas agrícolas que tiene la capacidad de funcionar sin internet."
    *   Explica el problema de forma sencilla: "Las plantas procesadoras de alimentos muchas veces están en zonas sin buen internet. Llevar el control de cuánto pesa cada operario a mano en un papel causa errores de cálculo en los pagos. Además, si pierdes esos papeles, pierdes el historial del producto, lo cual es grave porque la ley exige saber exactamente de dónde viene cada plátano para poder exportarlo. Si usáramos un sistema normal de internet y este falla, la planta entera tendría que parar de trabajar."

### Minuto 2:00 - 4:00 | La Solución y la Organización del Sistema
*   **Acción en Pantalla:** Muestra el diagrama del sistema (los que tienes en la carpeta `docs/Diagrama_ERD.html` o `docs/Diagrama_Clases.html`).
*   **Lo que debes decir:**
    *   "Para solucionar esto, desarrollamos una aplicación web que guarda la información en la misma computadora o tableta cuando se corta el internet."
    *   "El sistema se divide en dos partes: La pantalla que ve el trabajador (desarrollada con herramientas como React), y un servidor o 'cerebro' central instalado en la oficina de la planta (desarrollado con .NET y una base de datos sencilla). Cuando la tableta del trabajador recupera la conexión, le envía todo lo que guardó al servidor de la oficina automáticamente."

### Minuto 4:00 - 9:00 | Demostración del Software (El Sistema en Acción)
*   **Acción en Pantalla:** Ejecuta el archivo `AgroTrack_Monitor.bat`. Abre el navegador en `http://localhost:5173`.
*   **Lo que debes decir:**
    *   "Aquí vemos cómo iniciamos el sistema en nuestra computadora localmente. Entremos a la pantalla de pesaje."
    *   **Demuestra el uso normal:** Simula que eres un trabajador pesando bolsas de plátano. Muestra cómo el sistema calcula su pago en base a los kilos extra de forma automática y al instante.
    *   **Simulación de Caída de Internet (Lo más importante):** "Ahora vamos a simular que la planta se quedó sin internet." En tu navegador, presiona F12 (Herramientas de desarrollador), ve a la pestaña "Network" o "Red" y cambia la opción a "Offline" (Sin conexión).
    *   Haz otro pesaje y muestra cómo el sistema no se traba, sino que permite seguir trabajando. 
    *   Vuelve a activar el internet y explica: "Como ven, el sistema guardó el dato internamente, y al regresar el internet, lo mandó al servidor central."

### Minuto 9:00 - 12:00 | Módulo de Exportación y Nóminas
*   **Acción en Pantalla:** Ve a la pantalla de historial o reportes dentro de la aplicación.
*   **Lo que debes decir:**
    *   "Gracias a que la información ya no está en papeles, el trabajo de administración se hace solo. Aquí podemos generar y descargar la nómina en Excel para pagarle a los trabajadores sin errores de cálculo."
    *   "También contamos con un módulo de exportación, donde toda la información recolectada nos permite generar en un solo clic los documentos en formato PDF necesarios para la aduana, garantizando que sabemos toda la historia de cada lote."

### Minuto 12:00 - 14:00 | Revisión del Código en GitHub
*   **Acción en Pantalla:** Abre tu repositorio de GitHub o tu editor de código (VS Code).
*   **Lo que debes decir:**
    *   "Para organizar bien el proyecto, usamos una plataforma llamada GitHub. Aquí se puede ver cómo dividimos las carpetas: una para el 'Frontend' que es la pantalla del usuario, y otra para el 'Backend' que es nuestro servidor."
    *   Muestra rápido un archivo de código y explica: "Tratamos de mantener el código muy ordenado, separando la parte visual de la parte donde se hacen las matemáticas de los pagos, para que si en el futuro alguien quiere cambiar cómo se ve la aplicación, no rompa los cálculos."

### Minuto 14:00 - 15:00 | Conclusiones y Despedida
*   **Acción en Pantalla:** Vuelve a la pantalla principal de tu app o a la presentación.
*   **Lo que debes decir:**
    *   "En conclusión, AgroTrack moderniza el trabajo en el campo sin depender del internet. Automatiza el pago a los trabajadores de forma justa y nos prepara para exportar nuestros productos de manera segura cumpliendo con las leyes internacionales."
    *   Agradece al profesor y a la clase por su atención y despídete.
