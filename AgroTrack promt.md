quiero que analises todo el proyecto de esta carpeta y verificar que es lo que falta por completar ára que continuemos des de donde lo dejamos la ultima ves

Actúa como un Arquitecto de Software Senior y Tech Lead especializado en Android (Kotlin) para aplicaciones de Edge Computing agroindustrial offline-first. Tu tarea es generar la arquitectura base, el esquema de base de datos relacional y los fragmentos críticos de código para una aplicación de gestión de una planta exportadora de plátano pelado al vacío.

Stack Tecnológico Estricto:

Lenguaje: Kotlin

UI: Jetpack Compose

Arquitectura: Clean Architecture + MVVM

Persistencia: Room Database (Offline-First mandatorio).

Sincronización: WorkManager para background sync (REST/GraphQL).

Hardware: Bluetooth/Serial Port Profile (SPP) nativo de Android.

Requerimientos del Sistema (Módulos Core):

1. Acopio y Balanceo de Cuotas (Gestión Dinámica):

Lógica para gestionar "Metas Diarias" por productor (agrupados por 'Procedencia' ej. Aguacate, La Villa).

Función de reasignación en tiempo real: Si un productor no cumple su meta de "Bolsas", permitir transferir el déficit a un "Productor Comodín" o a otro con excedente.

Calculadora de estimación: Algoritmo para predecir racimos a cortar basado en la meta de bolsas (ej. 2.5 racimos por bolsa).

1. Adquisición de Datos y Edge Computing:

Integración de balanzas: Servicio en Kotlin para leer y parsear cadenas del protocolo MT-SICS vía RS-232/Bluetooth de forma continua.

Automatización del cálculo Tara-Bruto-Neto para rellenar automáticamente la relación "Kilos vs Bolsa".

Motor de impresión: Inyección de código raw ZPL para impresoras Zebra (generación de etiquetas GS1-128 con FNC1).

1. Trazabilidad Inmutable (Cumplimiento FDA FSMA 204):

Implementación de un patrón Append-Only Ledger en Room para los registros.

Generación de Traceability Lot Codes (TLC) y captura de Eventos Críticos de Seguimiento (CTEs) y Elementos de Datos Clave (KDEs).

1. Productividad y Recursos Humanos (Destajo):

Vinculación trabajador-estación vía escaneo de código de barras/QR (Lector Imager 2D).

Motor de reglas salariales en el ViewModel para el cálculo de pago por kilos netos pelados (tarifas planas y diferenciales).

1. Control de Calidad y WMS (Cuarto Frío):

Bitácoras de tratamiento químico (pH, concentración de ácido cítrico/ascórbico).

Gestión de inventario con reglas FIFO/FEFO y mapeo de bins en cuartos fríos (4°C a 12°C).

Instrucciones de Salida (Lo que debes generar AHORA):
No me expliques qué es Clean Architecture ni me des teoría. Entrégame directamente lo siguiente:

Estructura del Proyecto: El árbol de directorios sugerido para este proyecto en Android Studio.

Entidades Room (Data Classes): El código Kotlin para las tablas Productor, Cuota_Diaria, pesaje_destajo_operarios (incluyendo ID de lote, UUID, timestamp, peso bruto, tara, kilos_netos, estado_sincronizacion) y el Ledger_Trazabilidad.

Interfaz de Hardware: Una clase o servicio BluetoothScaleReader en Kotlin configurada para escuchar y limpiar cadenas del protocolo MT-SICS (buscando la confirmación "S S").

Lógica de Negocio (Use Case): El código para el caso de uso ReassignQuotaUseCase que actualice la base de datos local transfiriendo bolsas de un productor a otro de manera transaccional.
