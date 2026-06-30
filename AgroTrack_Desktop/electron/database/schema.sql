PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- 1. Tabla de Productores Agrícolas (Limpia al inicio)
CREATE TABLE IF NOT EXISTS Productores (
    id_productor TEXT PRIMARY KEY,
    codigo_productor TEXT UNIQUE NOT NULL,
    nombre_apellidos TEXT NOT NULL,
    procedencia TEXT NOT NULL,
    es_comodin BOOLEAN DEFAULT 0,
    activo BOOLEAN DEFAULT 1
);

-- 2. Asignación y Redistribución de Cuotas Diarias
CREATE TABLE IF NOT EXISTS Asignacion_Cuotas (
    id_cuota TEXT PRIMARY KEY,
    id_productor TEXT NOT NULL,
    fecha_proceso DATE NOT NULL,
    meta_bolsas_programadas INT NOT NULL,
    est_kilos_por_bolsa DECIMAL(6,2) NOT NULL,
    bolsas_reales_entregadas INT DEFAULT 0,
    kilos_reales_recibidos DECIMAL(10,2) DEFAULT 0.00,
    estado_cuota TEXT DEFAULT 'PROGRAMADA',
    FOREIGN KEY (id_productor) REFERENCES Productores(id_productor)
);

-- 3. Pesaje de Operarios (Soporta modo AUTOMATICO y MANUAL)
CREATE TABLE IF NOT EXISTS Pesaje_Operarios (
    id_transaccion_pesaje TEXT PRIMARY KEY,
    id_lote_materia_prima TEXT NOT NULL,
    id_operario TEXT NOT NULL,
    id_estacion_balanza TEXT NOT NULL,
    peso_bruto_capturado DECIMAL(8,3) NOT NULL,
    tara_recipiente DECIMAL(5,3) NOT NULL,
    peso_neto_pulpa DECIMAL(8,3) DEFAULT 0.000,
    tarifa_destajo_vigente DECIMAL(10,4) NOT NULL,
    monto_ganado DECIMAL(10,4) DEFAULT 0.0000,
    modo_captura TEXT NOT NULL,
    fecha_hora_lectura DATETIME DEFAULT CURRENT_TIMESTAMP,
    firma_criptografica TEXT NOT NULL
);

-- 4. Ledger Inmutable FSMA 204 (Trazabilidad)
CREATE TABLE IF NOT EXISTS Ledger_Trazabilidad (
    id_evento TEXT PRIMARY KEY,
    tlc TEXT NOT NULL,
    cte_type TEXT NOT NULL,
    kde_payload TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    hash_anterior TEXT NOT NULL,
    hash_actual TEXT NOT NULL
);

CREATE TRIGGER IF NOT EXISTS prevent_ledger_update BEFORE UPDATE ON Ledger_Trazabilidad
BEGIN SELECT RAISE(ABORT, 'VIOLACIÓN FSMA 204: Ledger Inmutable.'); END;

CREATE TRIGGER IF NOT EXISTS prevent_ledger_delete BEFORE DELETE ON Ledger_Trazabilidad
BEGIN SELECT RAISE(ABORT, 'VIOLACIÓN FSMA 204: Ledger Inmutable.'); END;
