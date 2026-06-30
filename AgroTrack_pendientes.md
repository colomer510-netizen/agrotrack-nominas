# Tareas Pendientes para AgroTrack

A continuación se detalla todo lo que falta por implementar del documento de requisitos original para que podamos continuar desde casa sin perder el hilo:

## 1. Módulo de Acopio (Completado)
- [x] **Calculadora de estimación**: Algoritmo para predecir racimos a cortar basado en la meta de bolsas (ej. 2.5 racimos por bolsa).

## 2. Adquisición de Datos y Edge Computing (Completado)
- [x] **Automatización de pesos**: Cálculo automático de Tara-Bruto-Neto para rellenar la relación "Kilos vs Bolsa".
- [x] **Motor de impresión ZPL**: Inyección de código raw ZPL para impresoras Zebra (generación de etiquetas GS1-128 con FNC1).

## 3. Productividad y Recursos Humanos (Destajo) (Completado)
- [x] **Vinculación trabajador-estación**: Lógica de escaneo de código de barras/QR mediante Lector Imager 2D.
- [x] **Motor de reglas salariales**: Lógica en el ViewModel para calcular el pago por kilos netos pelados (tarifas planas y diferenciales).

## 4. Control de Calidad y WMS (Cuarto Frío) (Completado)
- [x] **Bitácoras de tratamiento químico**: Gestión y registro de pH, concentración de ácido cítrico/ascórbico.
- [x] **Gestión de inventario**: Implementación de reglas FIFO/FEFO y mapeo de bins en cuartos fríos (4°C a 12°C).

## 5. Infraestructura y Sincronización (Completado)
- [x] **Sincronización Background**: Configuración del `WorkManager` para procesar el estado `PENDING` a `SYNCED` enviando datos a la API (REST/GraphQL) en modo offline-first.
- [x] **Inicialización del IDE**: Generar los archivos Gradle usando Android Studio e incluir dependencias (Room, Coroutines, Jetpack Compose).

## 6. Funcionalidades Avanzadas (Nuevos Requerimientos)
- [x] **Calculadora de Despacho (Carga a Granel)**: Algoritmo para calcular la cantidad de bolsas grandes o bins que debe llevar un camión dado un pedido total en kilos y la capacidad de cada saco (ej. pedido de 1000kg en bolsas de 23kg).
- [x] **Trazabilidad de Mermas**: Registro de descartes (daño mecánico, hongos) para sacar el porcentaje de rendimiento por productor.
- [x] **Control de Insumos Críticos**: Descuento automático de inventario de bolsas de vacío y etiquetas Zebra.
- [x] **Bitácora de BPM (Higiene)**: Check-list diario para operarios (redecilla, guantes, botas limpias) antes de iniciar turno.
- [x] **Dashboard de Ritmo de Planta**: Gráficas de rendimiento (Kilos por Hora vs Meta) en tiempo real para el gerente.
- [x] **Mantenimiento Preventivo (TPM)**: Recordatorios de limpieza de empacadoras y calibración de balanzas MT-SICS.
