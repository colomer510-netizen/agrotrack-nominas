import Dexie, { type Table } from 'dexie';
 
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
 
 export interface ConfiguracionGlobal {
   Id?: number;
   Clave: string;
   Valor: string;
 }
 
export interface TransaccionPesaje {
  Id?: number;
  OperarioId: number;
  ProductorId: number;
  Fecha: string;
  TipoProceso: string;
  ConteoBolsas: number;
  PesoBruto: number;
  BolsasBase: number;
  KilosExcedentes: number;
  BolsasExtra: number;
  TarifaAplicada: number;
  TotalGanado: number;
  Estado?: 'Activo' | 'Cerrado';
  Synced: number;
}

export interface ContenedorExportacion {
  Id?: number;
  NumeroContenedor: string;
  Destino: string;
  FechaSalida: string;
  TotalKilos: number;
  TotalCajas: number;
  Estado: 'Preparando' | 'Cargado' | 'Enviado';
  Synced?: number;
}

export class AgroTrackDB extends Dexie {
  productores!: Table<Productor>;
  operarios!: Table<Operario>;
  configuracionGlobal!: Table<ConfiguracionGlobal>;
  transaccionesPesaje!: Table<TransaccionPesaje>;
  contenedores!: Table<ContenedorExportacion>;

  constructor() {
    super('AgroTrackDB');
    
    // Definir el esquema (Primary Keys e Índices)
    this.version(1).stores({
      productores: '++Id, Codigo',
      operarios: '++Id, CodigoInterno, Procedencia',
      configuracionGlobal: '++Id, &Clave',
      transaccionesPesaje: '++Id, OperarioId, ProductorId, Fecha, Synced'
    });

    // Actualización de versión 2 (Agregar estado a transacciones)
    this.version(2).stores({
      transaccionesPesaje: '++Id, OperarioId, ProductorId, Fecha, Estado, Synced'
    }).upgrade(async tx => {
      // 1. Marcar como Activos a los existentes
      await tx.table('transaccionesPesaje').toCollection().modify(t => {
        if(!t.Estado) t.Estado = 'Activo';
      });

      // 2. Agregar nuevas configuraciones si no existen
      const configs = await tx.table('configuracionGlobal').toArray();
      const keys = configs.map(c => c.Clave);
      const toAdd = [];
      if (!keys.includes('MONEDA')) toAdd.push({ Clave: 'MONEDA', Valor: 'C$' });
      if (!keys.includes('PAGO_PRODUCTOR_BOLSA')) toAdd.push({ Clave: 'PAGO_PRODUCTOR_BOLSA', Valor: '0' });
      if (!keys.includes('MODO_CIERRE')) toAdd.push({ Clave: 'MODO_CIERRE', Valor: 'Manual' });
      
      if (toAdd.length > 0) {
        await tx.table('configuracionGlobal').bulkAdd(toAdd);
      }
    });

    // Actualización de versión 3 (Módulo de Exportación y Sync Tracking)
    this.version(3).stores({
      contenedores: '++Id, NumeroContenedor, Estado, Synced'
    });

    // Hooks para rastrear modificaciones y marcar como pendientes de sincronización (Synced = 0)
    this.transaccionesPesaje.hook('creating', (_primKey, obj: any, _transaction) => {
      obj.Synced = 0;
    });
    this.transaccionesPesaje.hook('updating', (mods: any, _primKey, _obj, _transaction) => {
      // Si el update no es del propio SyncService, lo marcamos como desincronizado
      if (mods.Synced !== 1) {
        return { Synced: 0 };
      }
    });
  }
}
 
 export const db = new AgroTrackDB();
 
 // Seed inicial de configuración
 db.on('populate', async () => {
   await db.configuracionGlobal.bulkAdd([
     { Clave: 'PESO_BOLSA', Valor: '23.0' },
     { Clave: 'TARIFA_BASE', Valor: '15.0' },
     { Clave: 'MONEDA', Valor: 'C$' },
     { Clave: 'PAGO_PRODUCTOR_BOLSA', Valor: '0' },
     { Clave: 'MODO_CIERRE', Valor: 'Manual' }
   ]);
 
   // Productores Demo
   await db.productores.bulkAdd([
     { Nombre: 'Productor Demo 1', Codigo: 'PROD-1' }
   ]);
   
   // Operarios Demo
   await db.operarios.bulkAdd([
       { CodigoInterno: 'S 1', Nombre: 'ROSMERI ESPINOZA', Procedencia: 'SANCHEZ 2' },
       { CodigoInterno: 'S 2', Nombre: 'RITA E. RODRIGUEZ', Procedencia: 'SANCHEZ 2' },
       { CodigoInterno: 'SL 1', Nombre: 'IDANIA ARIAS', Procedencia: 'SANCHEZ 1' }
   ]);
 });
