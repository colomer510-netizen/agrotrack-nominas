import Database from 'better-sqlite3'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

let db: any = null

const SCHEMA_SQL = `
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS Productores (
    id_productor TEXT PRIMARY KEY,
    codigo_productor TEXT UNIQUE NOT NULL,
    nombre_apellidos TEXT NOT NULL,
    procedencia TEXT NOT NULL,
    es_comodin BOOLEAN DEFAULT 0,
    activo BOOLEAN DEFAULT 1
);

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
`

export function initDatabase(dbPath: string): any {
  const dir = path.dirname(dbPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  db = new Database(dbPath)
  db.exec(SCHEMA_SQL)

  try {
    const count = (db.prepare('SELECT COUNT(*) as c FROM Productores').get() as any).c
    if (count === 0) {
      const insertP = db.prepare('INSERT INTO Productores (id_productor, codigo_productor, nombre_apellidos, procedencia, es_comodin) VALUES (?, ?, ?, ?, ?)')
      insertP.run(crypto.randomUUID(), 'AGU-01', 'Finca Aguacate - Lote 1', 'Aguacate', 0)
      insertP.run(crypto.randomUUID(), 'PAL-01', 'Hacienda Palmar - Sector A', 'Palmar', 0)
      insertP.run(crypto.randomUUID(), 'ING-01', 'Ingenio Central - Lote 3', 'Ingenio', 0)
      insertP.run(crypto.randomUUID(), 'VIL-01', 'Cooperativa La Villa', 'La Villa', 0)
      insertP.run(crypto.randomUUID(), 'SAN-01', 'Productor Sánchez (Mitad 1/2)', 'Sánchez 1/2', 1)
      console.log('[Database] 5 productores iniciales sembrados.')
    }
  } catch (err) {
    console.error('[Database Seed Error]', err)
  }

  return db
}

export function getDb(): any {
  if (!db) throw new Error('Database not initialized. Call initDatabase() first.')
  return db
}

/**
 * Calculates SHA-256 hash for FSMA 204 Ledger integrity
 */
export function generateHash(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex')
}

/**
 * Saves a weighing transaction and seals it in the Append-Only Ledger
 */
export function saveTransactionWithLedger(payload: any): { success: boolean; error?: string; netWeight?: number } {
  const database = getDb()
  
  try {
    const netWeight = Number((payload.peso_bruto_capturado - payload.tara_recipiente).toFixed(3))
    const montoGanado = Number((netWeight * payload.tarifa_destajo_vigente).toFixed(4))
    const idTx = crypto.randomUUID()
    const timestamp = new Date().toISOString()
    
    const signatureInput = `${idTx}|${payload.id_operario}|${netWeight}|${timestamp}`
    const firma = generateHash(signatureInput)

    const insertTx = database.prepare(`
      INSERT INTO Pesaje_Operarios (
        id_transaccion_pesaje, id_lote_materia_prima, id_operario, id_estacion_balanza,
        peso_bruto_capturado, tara_recipiente, peso_neto_pulpa, tarifa_destajo_vigente,
        monto_ganado, modo_captura, fecha_hora_lectura, firma_criptografica
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)

    // Get last hash from ledger
    const lastLedger = database.prepare('SELECT hash_actual FROM Ledger_Trazabilidad ORDER BY ROWID DESC LIMIT 1').get() as any
    const hashAnterior = lastLedger?.hash_actual || 'GENESIS_HASH_FSMA_204_AGROTRACK'
    
    const idEvento = crypto.randomUUID()
    const kdePayload = JSON.stringify({
      event: 'WEIGHING_PIECE_RATE',
      operator: payload.id_operario,
      gross: payload.peso_bruto_capturado,
      tare: payload.tara_recipiente,
      net: netWeight,
      mode: payload.modo_captura
    })
    const hashActual = generateHash(`${idEvento}|${payload.id_lote_materia_prima}|${kdePayload}|${hashAnterior}`)

    const insertLedger = database.prepare(`
      INSERT INTO Ledger_Trazabilidad (id_evento, tlc, cte_type, kde_payload, timestamp, hash_anterior, hash_actual)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)

    // Execute in transaction
    const tx = database.transaction(() => {
      insertTx.run(
        idTx, payload.id_lote_materia_prima, payload.id_operario, payload.id_estacion_balanza,
        payload.peso_bruto_capturado, payload.tara_recipiente, netWeight, payload.tarifa_destajo_vigente,
        montoGanado, payload.modo_captura, timestamp, firma
      )
      insertLedger.run(idEvento, payload.id_lote_materia_prima, 'TRANSFORMATION_WEIGHING', kdePayload, timestamp, hashAnterior, hashActual)
    })

    tx()
    return { success: true, netWeight }
  } catch (error: any) {
    console.error('[SQLite Transaction Error]', error)
    return { success: false, error: error.message }
  }
}
