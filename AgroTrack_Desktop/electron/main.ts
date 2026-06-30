import { app, BrowserWindow, ipcMain, Menu, dialog } from 'electron'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import { initDatabase, getDb, saveTransactionWithLedger } from './database/db'
import { ScaleReader } from './hardware/ScaleReader'
import { ZebraPrinter } from './hardware/ZebraPrinter'

process.env.APP_ROOT = path.join(__dirname, '..')

const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null = null
let scaleReader: ScaleReader | null = null

function createWindow() {
  win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'AgroTrack Desktop - Planta Procesadora de Plátano',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  // Configure Application Menu
  const template = [
    {
      label: 'Configuración de Entrada',
      submenu: [
        { 
          label: 'Modo: Báscula Serial', 
          type: 'radio', 
          checked: true,
          click: () => {
            const w = BrowserWindow.getAllWindows()[0] || win;
            w?.webContents.send('set-weighing-mode', 'serial');
          }
        },
        { 
          label: 'Modo: Teclado Manual', 
          type: 'radio', 
          checked: false,
          click: () => {
            const w = BrowserWindow.getAllWindows()[0] || win;
            w?.webContents.send('set-weighing-mode', 'manual');
          }
        }
      ]
    },
    {
      label: 'Ver',
      submenu: [
        { role: 'reload', label: 'Recargar' },
        { role: 'forceReload', label: 'Recargar Fuerte' },
        { role: 'toggleDevTools', label: 'Herramientas de Desarrollador' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Pantalla Completa' }
      ]
    }
  ]
  const menu = Menu.buildFromTemplate(template as any)
  Menu.setApplicationMenu(menu)

  // Initialize SQLite Database
  try {
    const dbPath = path.join(app.getPath('userData'), 'agrotrack_ledger.sqlite')
    initDatabase(dbPath)
    console.log(`[AgroTrack] Base de datos SQLite inicializada en: ${dbPath}`)
  } catch (err) {
    console.error('[AgroTrack] Error al inicializar base de datos:', err)
  }

  // Initialize Scale Reader (won't crash if no serial ports)
  try {
    scaleReader = new ScaleReader(win.webContents)
    console.log('[AgroTrack] Módulo de báscula inicializado (en espera de conexión)')
  } catch (err) {
    console.error('[AgroTrack] Error al inicializar ScaleReader:', err)
  }

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(() => {
  createWindow()

  // --- IPC HANDLERS ---
  
  // Scale
  ipcMain.on('scale:connect', (_event, portPath) => {
    scaleReader?.connect(portPath)
  })
  ipcMain.on('scale:request-weight', () => {
    scaleReader?.requestImmediateWeight()
  })

  // DB Transactions
  ipcMain.handle('db:save-weighing', (_event, payload) => {
    return saveTransactionWithLedger(payload)
  })

  ipcMain.handle('db:get-producers', () => {
    try {
      return getDb().prepare('SELECT * FROM Productores WHERE activo = 1 ORDER BY codigo_productor ASC').all()
    } catch (err: any) {
      console.error('[IPC db:get-producers]', err)
      return []
    }
  })

  ipcMain.handle('db:add-producer', (_event, p) => {
    try {
      const id = crypto.randomUUID()
      getDb().prepare('INSERT INTO Productores (id_productor, codigo_productor, nombre_apellidos, procedencia, es_comodin) VALUES (?, ?, ?, ?, ?)')
        .run(id, p.codigo, p.nombre, p.procedencia, p.esComodin ? 1 : 0)
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('db:get-quotas', () => {
    try {
      return getDb().prepare(`
        SELECT q.*, p.codigo_productor, p.nombre_apellidos, p.procedencia 
        FROM Asignacion_Cuotas q 
        JOIN Productores p ON q.id_productor = p.id_productor
        ORDER BY p.codigo_productor ASC
      `).all()
    } catch (err: any) {
      console.error('[IPC db:get-quotas]', err)
      return []
    }
  })

  ipcMain.handle('db:reassign-quota', (_event, payload) => {
    try {
      const db = getDb()
      const tx = db.transaction(() => {
        db.prepare('UPDATE Asignacion_Cuotas SET meta_bolsas_programadas = meta_bolsas_programadas - ? WHERE id_cuota = ?')
          .run(payload.bolsas, payload.sourceId)
        db.prepare('UPDATE Asignacion_Cuotas SET meta_bolsas_programadas = meta_bolsas_programadas + ? WHERE id_cuota = ?')
          .run(payload.bolsas, payload.targetId)
      })
      tx()
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('db:get-ledger', () => {
    try {
      return getDb().prepare('SELECT * FROM Ledger_Trazabilidad ORDER BY timestamp DESC LIMIT 50').all()
    } catch (err: any) {
      console.error('[IPC db:get-ledger]', err)
      return []
    }
  })

  // Printer
  ipcMain.handle('printer:print-zpl', async (_event, { zpl, ip }) => {
    return await ZebraPrinter.printZpl(ip, 9100, zpl)
  })

  // Dashboard & Export
  ipcMain.handle('db:get-dashboard-stats', () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const db = getDb()
      
      const totalKgsRow = db.prepare(`
        SELECT SUM(peso_neto_pulpa) as total 
        FROM Pesaje_Operarios 
        WHERE date(fecha_hora_lectura) = ?
      `).get(today)
      
      const operarioStats = db.prepare(`
        SELECT id_operario, SUM(peso_neto_pulpa) as totalKgs, SUM(monto_ganado) as totalMonto
        FROM Pesaje_Operarios
        WHERE date(fecha_hora_lectura) = ?
        GROUP BY id_operario
      `).all(today)
      
      return {
        totalKgs: totalKgsRow?.total || 0,
        operarioStats
      }
    } catch (err: any) {
      console.error('[IPC db:get-dashboard-stats]', err)
      return { totalKgs: 0, operarioStats: [] }
    }
  })

  ipcMain.handle('db:export-payroll', async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const db = getDb()
      const records = db.prepare(`
        SELECT id_operario, SUM(peso_neto_pulpa) as KilosTotales, SUM(monto_ganado) as PagoTotalUSD
        FROM Pesaje_Operarios
        WHERE date(fecha_hora_lectura) = ?
        GROUP BY id_operario
      `).all(today)

      if (records.length === 0) {
        return { success: false, error: 'No hay datos para exportar hoy' }
      }

      const { filePath } = await dialog.showSaveDialog({
        title: 'Guardar Nómina del Día',
        defaultPath: `Nomina_Destajo_${today}.csv`,
        filters: [{ name: 'CSV', extensions: ['csv'] }]
      })

      if (!filePath) return { success: false, error: 'Cancelado por el usuario' }

      let csvContent = 'ID_Operario,Kilos_Totales,Pago_Total_USD\n'
      records.forEach((r: any) => {
        csvContent += `"${r.id_operario}",${r.KilosTotales.toFixed(2)},${r.PagoTotalUSD.toFixed(2)}\n`
      })

      fs.writeFileSync(filePath, csvContent, 'utf8')
      return { success: true, filePath }
    } catch (err: any) {
      console.error('[IPC db:export-payroll]', err)
      return { success: false, error: err.message }
    }
  })
})
