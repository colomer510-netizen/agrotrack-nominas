// Copyright (C) 2026 colomer510-netizen
// This file is part of AgroTrack Nóminas.
// Licensed under the GNU Affero General Public License v3.0. See LICENSE in project root.

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
