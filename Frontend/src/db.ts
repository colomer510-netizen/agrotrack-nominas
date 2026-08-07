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
   Synced: number;
 }
 
 export class AgroTrackDB extends Dexie {
   productores!: Table<Productor>;
   operarios!: Table<Operario>;
   configuracionGlobal!: Table<ConfiguracionGlobal>;
   transaccionesPesaje!: Table<TransaccionPesaje>;
 
   constructor() {
     super('AgroTrackDB');
     
     // Definir el esquema (Primary Keys e Índices)
     this.version(1).stores({
       productores: '++Id, Codigo',
       operarios: '++Id, CodigoInterno, Procedencia',
       configuracionGlobal: '++Id, &Clave',
       transaccionesPesaje: '++Id, OperarioId, ProductorId, Fecha, Synced'
     });
   }
 }
 
 export const db = new AgroTrackDB();
 
 // Seed inicial de configuración
 db.on('populate', async () => {
   await db.configuracionGlobal.bulkAdd([
     { Clave: 'PESO_BOLSA', Valor: '23.0' },
     { Clave: 'TARIFA_BASE', Valor: '15.0' }
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
