import { SQLiteDBConnection } from '@capacitor-community/sqlite';

export interface Productor {
  Id?: number;
  Nombre: string;
  Codigo: string;
}

export interface Operario {
  Id?: number;
  CodigoInterno: string;
  Nombre: string;
  Procedencia: string;
}

export interface Configuracion {
  Clave: string;
  Valor: string;
}

export interface TotalesOperario {
  BolsasBase: number;
  KilosExcedentes: number;
  TotalGanado: number;
}

export interface ReporteNominaRow {
  OperarioId: number;
  CodigoInterno: string;
  Nombre: string;
  LugarProcedencia: string;
  TotalBolsasBase: number;
  TotalKilosExcedentes: number;
  TotalBolsasExtra: number;
  TotalPago: number;
}

export interface HistorialRow {
  TransaccionId: number;
  OperarioNombre: string;
  ProductorNombre: string;
  Fecha: string;
  TipoProceso: string;
  TotalBolsas: number;
  KilosExcedentes: number;
  TotalGanado: number;
}

export class DatabaseService {
  constructor(private db: SQLiteDBConnection | undefined) {}

  // --- CONFIGURACIÓN GLOBAL ---
  async getConfiguracion(clave: string): Promise<string | null> {
    if (!this.db) return null;
    try {
      const res = await this.db.query('SELECT Valor FROM ConfiguracionGlobal WHERE Clave = ?', [clave]);
      if (res.values && res.values.length > 0) return res.values[0].Valor;
    } catch (e) { console.error(e); }
    return null;
  }

  async setConfiguracion(clave: string, valor: string): Promise<void> {
    if (!this.db) return;
    try {
      await this.db.run(`
        INSERT INTO ConfiguracionGlobal (Clave, Valor) VALUES (?, ?)
        ON CONFLICT(Clave) DO UPDATE SET Valor = excluded.Valor
      `, [clave, valor]);
    } catch (e) { console.error(e); }
  }

  // --- PRODUCTORES ---
  async getProductores(): Promise<Productor[]> {
    if (!this.db) return [];
    try {
      const res = await this.db.query('SELECT * FROM Productores ORDER BY Nombre ASC');
      return res.values as Productor[] || [];
    } catch (e) { console.error(e); return []; }
  }

  async addProductor(productor: Productor): Promise<void> {
    if (!this.db) return;
    await this.db.run('INSERT INTO Productores (Nombre, Codigo) VALUES (?, ?)', 
      [productor.Nombre, productor.Codigo]);
  }

  async deleteProductor(id: number): Promise<void> {
    if (!this.db) return;
    await this.db.run('DELETE FROM Productores WHERE Id = ?', [id]);
  }

  // --- OPERARIOS ---
  async getOperarios(): Promise<Operario[]> {
    if (!this.db) return [];
    try {
      const res = await this.db.query('SELECT * FROM Operarios ORDER BY Nombre ASC');
      return res.values as Operario[] || [];
    } catch (e) { console.error(e); return []; }
  }

  async getOperariosByProcedencia(procedencia: string): Promise<Operario[]> {
    if (!this.db) return [];
    try {
      const res = await this.db.query('SELECT * FROM Operarios WHERE Procedencia = ? ORDER BY CodigoInterno ASC', [procedencia]);
      return res.values as Operario[] || [];
    } catch (e) { console.error(e); return []; }
  }

  async addOperario(op: Operario): Promise<void> {
    if (!this.db) return;
    await this.db.run('INSERT INTO Operarios (CodigoInterno, Nombre, Procedencia) VALUES (?, ?, ?)', 
      [op.CodigoInterno, op.Nombre, op.Procedencia]);
  }

  async deleteOperario(id: number): Promise<void> {
    if (!this.db) return;
    await this.db.run('DELETE FROM Operarios WHERE Id = ?', [id]);
  }

  // --- TRANSACCIONES ---
  async guardarRegistroBolsa(
    pesoCapturado: number, 
    conteoBolsas: number,
    tipoProceso: string,
    idOperario: number,
    idProductor: number
  ): Promise<void> {
    if (!this.db) return;

    const tarifaBase = parseFloat(await this.getConfiguracion('TARIFA_BASE') || '15.0');
    const pesoBase = parseFloat(await this.getConfiguracion('PESO_BOLSA') || '23.0');

    let bolsasBase = 0;
    let kilosExcedentes = 0;
    let bolsasExtra = 0;

    if (tipoProceso === 'Conteo_Unidades') {
      bolsasBase = conteoBolsas;
    } else {
      bolsasBase = Math.floor(pesoCapturado / pesoBase);
      kilosExcedentes = pesoCapturado % pesoBase;
      bolsasExtra = kilosExcedentes / pesoBase;
    }

    const ganancia = (bolsasBase + bolsasExtra) * tarifaBase;
    const fechaActual = new Date().toISOString();

    const query = `
      INSERT INTO TransaccionesPesaje 
      (OperarioId, ProductorId, Fecha, TipoProceso, ConteoBolsas, PesoBruto, BolsasBase, KilosExcedentes, BolsasExtra, TarifaAplicada, TotalGanado) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await this.db.run(query, [
      idOperario, idProductor, fechaActual, tipoProceso, conteoBolsas, 
      pesoCapturado, bolsasBase, kilosExcedentes, bolsasExtra, 
      tarifaBase, ganancia
    ]);
  }

  // --- REPORTES ---
  async getReporteNomina(productorId: number): Promise<ReporteNominaRow[]> {
    if (!this.db) return [];
    try {
      const query = `
        SELECT 
          o.Id as OperarioId,
          o.CodigoInterno,
          o.Nombre,
          o.Procedencia as LugarProcedencia,
          SUM(t.BolsasBase) as TotalBolsasBase,
          SUM(t.KilosExcedentes) as TotalKilosExcedentes,
          SUM(t.BolsasExtra) as TotalBolsasExtra,
          SUM(t.TotalGanado) as TotalPago
        FROM TransaccionesPesaje t
        JOIN Operarios o ON t.OperarioId = o.Id
        WHERE t.ProductorId = ?
        GROUP BY o.Id, o.CodigoInterno, o.Nombre, o.Procedencia
        ORDER BY o.Nombre ASC
      `;
      const res = await this.db.query(query, [productorId]);
      return res.values as ReporteNominaRow[] || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async getHistorialPesajes(): Promise<HistorialRow[]> {
    if (!this.db) return [];
    try {
      const query = `
        SELECT 
          t.Id as TransaccionId,
          o.Nombre as OperarioNombre,
          p.Nombre as ProductorNombre,
          t.Fecha,
          t.TipoProceso,
          (t.BolsasBase + t.BolsasExtra + t.ConteoBolsas) as TotalBolsas,
          t.KilosExcedentes,
          t.TotalGanado
        FROM TransaccionesPesaje t
        JOIN Operarios o ON t.OperarioId = o.Id
        JOIN Productores p ON t.ProductorId = p.Id
        ORDER BY t.Fecha DESC
      `;
      const res = await this.db.query(query);
      return res.values as HistorialRow[] || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  }

  async deleteTransaccion(id: number): Promise<void> {
    if (!this.db) return;
    await this.db.run('DELETE FROM TransaccionesPesaje WHERE Id = ?', [id]);
  }
}
