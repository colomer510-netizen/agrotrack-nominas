# I. Título
AgroTrack Nóminas: Sistema de control de producción y pagos para plantas agrícolas con funcionamiento sin internet

# II. Resumen
Este proyecto consiste en crear **AgroTrack Nóminas**, un sistema informático diseñado para plantas que procesan productos agrícolas, como el plátano pelado al vacío en Nicaragua. Lo que hace especial a este sistema es que **funciona sin necesidad de tener internet todo el tiempo**. Permite a los trabajadores registrar el peso del producto y calcular sus pagos automáticamente, guardando toda la información en la misma computadora o tableta. Cuando la conexión a internet regresa, el sistema envía los datos de forma segura al servidor principal. Se utilizaron herramientas modernas de desarrollo web (como React y .NET) para automatizar el cálculo de la nómina, asegurar que se sepa de dónde viene cada producto (trazabilidad) y generar reportes listos para contabilidad y exportación.

# III. Planteamiento del Problema
Las plantas agrícolas suelen estar en zonas rurales donde el internet es inestable o no existe. Normalmente, el registro del peso de las bolsas de plátano y el cálculo del pago a los trabajadores se hace a mano en cuadernos o usando plantillas básicas. Esto causa varios problemas importantes:

1. **Errores humanos y quejas:** Calcular el pago a mano dependiendo de cuánto pesó cada bolsa genera equivocaciones y retrasos en el pago a los trabajadores.
2. **Pérdida del historial del producto:** Sin un registro digital, es muy difícil saber de qué finca vino un lote específico de plátanos. Esto es un requisito obligatorio de las leyes internacionales para poder exportar alimentos de forma segura.
3. **Papeleo lento:** Tener la información regada en papeles hace que sea difícil crear rápidamente los documentos necesarios para las aduanas y los envíos.
4. **Paros en la producción:** Si usamos un sistema normal que dependa 100% de la nube (internet), la planta tendría que detenerse cada vez que se cae la conexión, lo cual echaría a perder el producto.

Por esto, se necesita un sistema que pueda trabajar todo el tiempo de forma local y que se actualice solo cuando haya internet, asegurando que los pagos sean correctos y que la información nunca se pierda.

# IV. Desarrollo del Software

El desarrollo de AgroTrack Nóminas se hizo paso a paso, desde entender el problema hasta publicar el código terminado.

### 1. Análisis y Diseño
Primero identificamos a las personas que usarían el sistema: operarios, administradores y personal de aduanas. Nos dimos cuenta de que la prioridad absoluta era que el sistema no fallara si se iba el internet.
*   **Diseño de la Base de Datos:** Planeamos cómo se guardaría la información de los trabajadores, los pesos y las configuraciones de pago.
*   **Estructura del Código:** Organizamos el código de forma separada ("Arquitectura Limpia") para dividir la parte visual de las reglas de los pagos, así es más fácil hacerle mejoras en el futuro sin que se rompa.

### 2. Creación de la Aplicación para el Usuario (Frontend)
Esta es la pantalla que ven los trabajadores en la planta.
*   **Tecnologías:** Usamos herramientas populares como React para que el sistema sea rápido y se vea bien en cualquier pantalla.
*   **Funcionamiento sin internet:** Usamos una tecnología de almacenamiento en el navegador web que permite guardar los datos internamente en el dispositivo. 
*   **Pantalla de Pesaje:** Creamos una pantalla visual, con botones grandes, donde el trabajador registra el peso (ej. 23kg) y el sistema le muestra al instante cuánto dinero ganó, sin requerir internet en ese momento.

### 3. Creación del Servidor Principal (Backend)
Es el "cerebro" central del sistema que recibe y junta la información de todos los dispositivos de la planta.
*   **Tecnologías:** Se construyó usando C# y .NET, con una base de datos local (SQLite) que es muy fácil de instalar en cualquier computadora principal de la planta.
*   **Módulos de trabajo:** Tiene un programa automático que calcula el pago final de las nóminas de todos los trabajadores, y otro que genera los documentos en formato PDF listos para las aduanas y exportación de contenedores.

### 4. ¿Cómo se comunican sin internet?
Se programó una tarea automática en la pantalla del usuario que siempre está revisando si hay conexión. Mientras no hay internet, el sistema guarda todo con una etiqueta de "Pendiente". En cuanto detecta que el internet regresó, envía todos esos datos guardados de golpe al servidor principal. Una vez guardados con éxito, les cambia la etiqueta a "Sincronizado".

### 5. Pruebas y Publicación
Creamos un archivo ejecutable muy sencillo (un botón de inicio) para que cualquier persona en la planta pueda prender el sistema con doble clic, mostrando ventanas donde se ve que todo está funcionando bien. Finalmente, todo el código fuente y sus manuales se organizaron y se publicaron en la plataforma GitHub para su entrega.
