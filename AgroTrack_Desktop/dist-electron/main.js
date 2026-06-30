//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
let electron = require("electron");
let path = require("path");
path = __toESM(path);
let fs = require("fs");
fs = __toESM(fs);
let crypto = require("crypto");
crypto = __toESM(crypto);
let better_sqlite3 = require("better-sqlite3");
better_sqlite3 = __toESM(better_sqlite3);
let serialport = require("serialport");
let _serialport_parser_readline = require("@serialport/parser-readline");
let net = require("net");
net = __toESM(net);
//#region electron/database/db.ts
var db = null;
var SCHEMA_SQL = `
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
`;
function initDatabase(dbPath) {
	const dir = path.default.dirname(dbPath);
	if (!fs.default.existsSync(dir)) fs.default.mkdirSync(dir, { recursive: true });
	db = new better_sqlite3.default(dbPath);
	db.exec(SCHEMA_SQL);
	try {
		if (db.prepare("SELECT COUNT(*) as c FROM Productores").get().c === 0) {
			const insertP = db.prepare("INSERT INTO Productores (id_productor, codigo_productor, nombre_apellidos, procedencia, es_comodin) VALUES (?, ?, ?, ?, ?)");
			insertP.run(crypto.default.randomUUID(), "AGU-01", "Finca Aguacate - Lote 1", "Aguacate", 0);
			insertP.run(crypto.default.randomUUID(), "PAL-01", "Hacienda Palmar - Sector A", "Palmar", 0);
			insertP.run(crypto.default.randomUUID(), "ING-01", "Ingenio Central - Lote 3", "Ingenio", 0);
			insertP.run(crypto.default.randomUUID(), "VIL-01", "Cooperativa La Villa", "La Villa", 0);
			insertP.run(crypto.default.randomUUID(), "SAN-01", "Productor Sánchez (Mitad 1/2)", "Sánchez 1/2", 1);
			console.log("[Database] 5 productores iniciales sembrados.");
		}
	} catch (err) {
		console.error("[Database Seed Error]", err);
	}
	return db;
}
function getDb() {
	if (!db) throw new Error("Database not initialized. Call initDatabase() first.");
	return db;
}
/**
* Calculates SHA-256 hash for FSMA 204 Ledger integrity
*/
function generateHash(data) {
	return crypto.default.createHash("sha256").update(data).digest("hex");
}
/**
* Saves a weighing transaction and seals it in the Append-Only Ledger
*/
function saveTransactionWithLedger(payload) {
	const database = getDb();
	try {
		const netWeight = Number((payload.peso_bruto_capturado - payload.tara_recipiente).toFixed(3));
		const montoGanado = Number((netWeight * payload.tarifa_destajo_vigente).toFixed(4));
		const idTx = crypto.default.randomUUID();
		const timestamp = (/* @__PURE__ */ new Date()).toISOString();
		const firma = generateHash(`${idTx}|${payload.id_operario}|${netWeight}|${timestamp}`);
		const insertTx = database.prepare(`
      INSERT INTO Pesaje_Operarios (
        id_transaccion_pesaje, id_lote_materia_prima, id_operario, id_estacion_balanza,
        peso_bruto_capturado, tara_recipiente, peso_neto_pulpa, tarifa_destajo_vigente,
        monto_ganado, modo_captura, fecha_hora_lectura, firma_criptografica
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
		const hashAnterior = database.prepare("SELECT hash_actual FROM Ledger_Trazabilidad ORDER BY ROWID DESC LIMIT 1").get()?.hash_actual || "GENESIS_HASH_FSMA_204_AGROTRACK";
		const idEvento = crypto.default.randomUUID();
		const kdePayload = JSON.stringify({
			event: "WEIGHING_PIECE_RATE",
			operator: payload.id_operario,
			gross: payload.peso_bruto_capturado,
			tare: payload.tara_recipiente,
			net: netWeight,
			mode: payload.modo_captura
		});
		const hashActual = generateHash(`${idEvento}|${payload.id_lote_materia_prima}|${kdePayload}|${hashAnterior}`);
		const insertLedger = database.prepare(`
      INSERT INTO Ledger_Trazabilidad (id_evento, tlc, cte_type, kde_payload, timestamp, hash_anterior, hash_actual)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
		database.transaction(() => {
			insertTx.run(idTx, payload.id_lote_materia_prima, payload.id_operario, payload.id_estacion_balanza, payload.peso_bruto_capturado, payload.tara_recipiente, netWeight, payload.tarifa_destajo_vigente, montoGanado, payload.modo_captura, timestamp, firma);
			insertLedger.run(idEvento, payload.id_lote_materia_prima, "TRANSFORMATION_WEIGHING", kdePayload, timestamp, hashAnterior, hashActual);
		})();
		return {
			success: true,
			netWeight
		};
	} catch (error) {
		console.error("[SQLite Transaction Error]", error);
		return {
			success: false,
			error: error.message
		};
	}
}
//#endregion
//#region electron/hardware/ScaleReader.ts
var ScaleReader = class {
	port = null;
	parser = null;
	webContents;
	currentWeight = 0;
	isStable = false;
	constructor(webContents) {
		this.webContents = webContents;
	}
	connect(portPath, baudRate = 9600) {
		try {
			if (this.port && this.port.isOpen) this.port.close();
			this.port = new serialport.SerialPort({
				path: portPath,
				baudRate
			});
			this.parser = this.port.pipe(new _serialport_parser_readline.ReadlineParser({ delimiter: "\r\n" }));
			this.port.on("open", () => {
				console.log(`[Hardware] Puerto serial ${portPath} abierto con éxito.`);
				this.webContents.send("scale:status", {
					connected: true,
					port: portPath
				});
			});
			this.port.on("error", (err) => {
				console.error(`[Hardware Error] ${err.message}`);
				this.webContents.send("scale:status", {
					connected: false,
					error: err.message
				});
			});
			this.parser.on("data", (line) => {
				this.parseMtSicsCommand(line.trim());
			});
		} catch (error) {
			console.error(`[Hardware Exception] ${error.message}`);
			this.webContents.send("scale:status", {
				connected: false,
				error: error.message
			});
		}
	}
	parseMtSicsCommand(data) {
		if (data.startsWith("S S") || data.startsWith("S D")) {
			const stable = data.startsWith("S S");
			const matches = data.match(/S\s+[SD]\s+([-\d.]+)\s+([a-zA-Z]+)/);
			if (matches && matches.length >= 3) {
				const weight = parseFloat(matches[1]);
				const unit = matches[2];
				if (!isNaN(weight)) {
					this.currentWeight = weight;
					this.isStable = stable;
					this.webContents.send("scale:reading", {
						weight: this.currentWeight,
						unit,
						isStable: this.isStable,
						timestamp: Date.now()
					});
				}
			}
		}
	}
	requestImmediateWeight() {
		if (this.port && this.port.isOpen) this.port.write("SI\r\n");
	}
	disconnect() {
		if (this.port && this.port.isOpen) {
			this.port.close();
			this.webContents.send("scale:status", { connected: false });
		}
	}
};
//#endregion
//#region electron/hardware/ZebraPrinter.ts
var ZebraPrinter = class {
	static async printZpl(ip, port = 9100, zplCommand) {
		return new Promise((resolve) => {
			const client = new net.default.Socket();
			client.connect(port, ip, () => {
				client.write(zplCommand, "utf8", () => {
					client.end();
					resolve({ success: true });
				});
			});
			client.on("error", (err) => {
				console.error(`[Zebra Printer Error @ ${ip}:${port}]`, err.message);
				resolve({
					success: false,
					error: err.message
				});
			});
			client.setTimeout(5e3, () => {
				client.destroy();
				resolve({
					success: false,
					error: "Printer TCP Socket Timeout (5000ms)"
				});
			});
		});
	}
	/**
	* Generates a standard GS1-128 ZPL string with FNC1 escape character (>8 or ^BCN)
	*/
	static generateGs1Zpl(gtin, lotCode, dateStr) {
		return `
^XA
^PW800
^LL600
^CF0,40
^FO50,50^FDAGROTRACK - PLATANO EXPORTACION^FS
^CF0,25
^FO50,110^FDLote Trazabilidad (TLC): ${lotCode}^FS
^FO50,150^FDFecha Empaque: ${dateStr}^FS
^BY3,2,150
^FO50,220^BCN,150,Y,N,N^FD>801${gtin}>810${lotCode}>811${dateStr}^FS
^XZ
    `.trim();
	}
};
//#endregion
//#region electron/main.ts
process.env.APP_ROOT = path.default.join(__dirname, "..");
var VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];
path.default.join(process.env.APP_ROOT, "dist-electron");
var RENDERER_DIST = path.default.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.default.join(process.env.APP_ROOT, "public") : RENDERER_DIST;
var win = null;
var scaleReader = null;
function createWindow() {
	win = new electron.BrowserWindow({
		width: 1400,
		height: 900,
		minWidth: 1024,
		minHeight: 768,
		title: "AgroTrack Desktop - Planta Procesadora de Plátano",
		webPreferences: {
			preload: path.default.join(__dirname, "preload.js"),
			nodeIntegration: false,
			contextIsolation: true
		}
	});
	const menu = electron.Menu.buildFromTemplate([{
		label: "Configuración de Entrada",
		submenu: [{
			label: "Modo: Báscula Serial",
			type: "radio",
			checked: true,
			click: () => {
				(electron.BrowserWindow.getAllWindows()[0] || win)?.webContents.send("set-weighing-mode", "serial");
			}
		}, {
			label: "Modo: Teclado Manual",
			type: "radio",
			checked: false,
			click: () => {
				(electron.BrowserWindow.getAllWindows()[0] || win)?.webContents.send("set-weighing-mode", "manual");
			}
		}]
	}, {
		label: "Ver",
		submenu: [
			{
				role: "reload",
				label: "Recargar"
			},
			{
				role: "forceReload",
				label: "Recargar Fuerte"
			},
			{
				role: "toggleDevTools",
				label: "Herramientas de Desarrollador"
			},
			{ type: "separator" },
			{
				role: "togglefullscreen",
				label: "Pantalla Completa"
			}
		]
	}]);
	electron.Menu.setApplicationMenu(menu);
	try {
		const dbPath = path.default.join(electron.app.getPath("userData"), "agrotrack_ledger.sqlite");
		initDatabase(dbPath);
		console.log(`[AgroTrack] Base de datos SQLite inicializada en: ${dbPath}`);
	} catch (err) {
		console.error("[AgroTrack] Error al inicializar base de datos:", err);
	}
	try {
		scaleReader = new ScaleReader(win.webContents);
		console.log("[AgroTrack] Módulo de báscula inicializado (en espera de conexión)");
	} catch (err) {
		console.error("[AgroTrack] Error al inicializar ScaleReader:", err);
	}
	if (VITE_DEV_SERVER_URL) {
		win.loadURL(VITE_DEV_SERVER_URL);
		win.webContents.openDevTools();
	} else win.loadFile(path.default.join(RENDERER_DIST, "index.html"));
}
electron.app.on("window-all-closed", () => {
	if (process.platform !== "darwin") electron.app.quit();
});
electron.app.on("activate", () => {
	if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
});
electron.app.whenReady().then(() => {
	createWindow();
	electron.ipcMain.on("scale:connect", (_event, portPath) => {
		scaleReader?.connect(portPath);
	});
	electron.ipcMain.on("scale:request-weight", () => {
		scaleReader?.requestImmediateWeight();
	});
	electron.ipcMain.handle("db:save-weighing", (_event, payload) => {
		return saveTransactionWithLedger(payload);
	});
	electron.ipcMain.handle("db:get-producers", () => {
		try {
			return getDb().prepare("SELECT * FROM Productores WHERE activo = 1 ORDER BY codigo_productor ASC").all();
		} catch (err) {
			console.error("[IPC db:get-producers]", err);
			return [];
		}
	});
	electron.ipcMain.handle("db:add-producer", (_event, p) => {
		try {
			const id = crypto.default.randomUUID();
			getDb().prepare("INSERT INTO Productores (id_productor, codigo_productor, nombre_apellidos, procedencia, es_comodin) VALUES (?, ?, ?, ?, ?)").run(id, p.codigo, p.nombre, p.procedencia, p.esComodin ? 1 : 0);
			return { success: true };
		} catch (err) {
			return {
				success: false,
				error: err.message
			};
		}
	});
	electron.ipcMain.handle("db:get-quotas", () => {
		try {
			return getDb().prepare(`
        SELECT q.*, p.codigo_productor, p.nombre_apellidos, p.procedencia 
        FROM Asignacion_Cuotas q 
        JOIN Productores p ON q.id_productor = p.id_productor
        ORDER BY p.codigo_productor ASC
      `).all();
		} catch (err) {
			console.error("[IPC db:get-quotas]", err);
			return [];
		}
	});
	electron.ipcMain.handle("db:reassign-quota", (_event, payload) => {
		try {
			const db = getDb();
			db.transaction(() => {
				db.prepare("UPDATE Asignacion_Cuotas SET meta_bolsas_programadas = meta_bolsas_programadas - ? WHERE id_cuota = ?").run(payload.bolsas, payload.sourceId);
				db.prepare("UPDATE Asignacion_Cuotas SET meta_bolsas_programadas = meta_bolsas_programadas + ? WHERE id_cuota = ?").run(payload.bolsas, payload.targetId);
			})();
			return { success: true };
		} catch (err) {
			return {
				success: false,
				error: err.message
			};
		}
	});
	electron.ipcMain.handle("db:get-ledger", () => {
		try {
			return getDb().prepare("SELECT * FROM Ledger_Trazabilidad ORDER BY timestamp DESC LIMIT 50").all();
		} catch (err) {
			console.error("[IPC db:get-ledger]", err);
			return [];
		}
	});
	electron.ipcMain.handle("printer:print-zpl", async (_event, { zpl, ip }) => {
		return await ZebraPrinter.printZpl(ip, 9100, zpl);
	});
	electron.ipcMain.handle("db:get-dashboard-stats", () => {
		try {
			const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
			const db = getDb();
			const totalKgsRow = db.prepare(`
        SELECT SUM(peso_neto_pulpa) as total 
        FROM Pesaje_Operarios 
        WHERE date(fecha_hora_lectura) = ?
      `).get(today);
			const operarioStats = db.prepare(`
        SELECT id_operario, SUM(peso_neto_pulpa) as totalKgs, SUM(monto_ganado) as totalMonto
        FROM Pesaje_Operarios
        WHERE date(fecha_hora_lectura) = ?
        GROUP BY id_operario
      `).all(today);
			return {
				totalKgs: totalKgsRow?.total || 0,
				operarioStats
			};
		} catch (err) {
			console.error("[IPC db:get-dashboard-stats]", err);
			return {
				totalKgs: 0,
				operarioStats: []
			};
		}
	});
	electron.ipcMain.handle("db:export-payroll", async () => {
		try {
			const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
			const records = getDb().prepare(`
        SELECT id_operario, SUM(peso_neto_pulpa) as KilosTotales, SUM(monto_ganado) as PagoTotalUSD
        FROM Pesaje_Operarios
        WHERE date(fecha_hora_lectura) = ?
        GROUP BY id_operario
      `).all(today);
			if (records.length === 0) return {
				success: false,
				error: "No hay datos para exportar hoy"
			};
			const { filePath } = await electron.dialog.showSaveDialog({
				title: "Guardar Nómina del Día",
				defaultPath: `Nomina_Destajo_${today}.csv`,
				filters: [{
					name: "CSV",
					extensions: ["csv"]
				}]
			});
			if (!filePath) return {
				success: false,
				error: "Cancelado por el usuario"
			};
			let csvContent = "ID_Operario,Kilos_Totales,Pago_Total_USD\n";
			records.forEach((r) => {
				csvContent += `"${r.id_operario}",${r.KilosTotales.toFixed(2)},${r.PagoTotalUSD.toFixed(2)}\n`;
			});
			fs.default.writeFileSync(filePath, csvContent, "utf8");
			return {
				success: true,
				filePath
			};
		} catch (err) {
			console.error("[IPC db:export-payroll]", err);
			return {
				success: false,
				error: err.message
			};
		}
	});
});
//#endregion
