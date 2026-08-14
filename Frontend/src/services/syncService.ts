// Copyright (C) 2026 colomer510-netizen
// This file is part of AgroTrack Nóminas.
// Licensed under the GNU Affero General Public License v3.0. See LICENSE in project root.

/**
 * AgroTrack — Servicio de Sincronización Offline-First
 * 
 * Lógica:
 * 1. Detectar conectividad (navigator.onLine + ping al backend)
 * 2. Leer registros de Dexie donde Synced === 0
 * 3. Enviar batch al POST /api/pesaje/sync
 * 4. Si éxito → marcar Synced = 1 en IndexedDB
 * 5. Si fallo → retry con backoff exponencial
 * 6. Pull: descargar datos maestros (productores, operarios, config)
 */

import { db, type Productor, type Operario, type ConfiguracionGlobal } from '../db';
import { apiClient } from './apiClient';

interface SyncResult {
  success: boolean;
  pushed: number;
  pulled: number;
  errors: string[];
  timestamp: Date;
}

class SyncService {
  private isSyncing = false;
  private listeners: ((result: SyncResult) => void)[] = [];

  /**
   * Registra un listener para notificaciones de sincronización.
   */
  onSyncComplete(callback: (result: SyncResult) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  private notify(result: SyncResult) {
    this.listeners.forEach(l => l(result));
  }

  /**
   * Ejecuta un ciclo completo de sincronización (push + pull).
   */
  async sync(): Promise<SyncResult> {
    if (this.isSyncing) {
      return { success: false, pushed: 0, pulled: 0, errors: ['Sincronización ya en progreso.'], timestamp: new Date() };
    }

    this.isSyncing = true;
    const errors: string[] = [];
    let pushed = 0;
    let pulled = 0;

    try {
      // Verificar conectividad
      const serverReachable = await apiClient.isServerReachable();
      if (!serverReachable) {
        return { success: false, pushed: 0, pulled: 0, errors: ['Servidor no disponible.'], timestamp: new Date() };
      }

      // ── PUSH: Enviar datos pendientes al servidor ──
      const pendientes = await db.transaccionesPesaje
        .where('Synced')
        .equals(0)
        .toArray();

      if (pendientes.length > 0) {
        const response = await apiClient.post<{ Creadas: number; Actualizadas: number; Errores: string[] }>(
          '/pesaje/sync',
          pendientes
        );

        if (response.ok && response.data) {
          // Marcar como sincronizados en IndexedDB
          await Promise.all(
            pendientes.map(t => 
              t.Id ? db.transaccionesPesaje.update(t.Id, { Synced: 1 }) : Promise.resolve()
            )
          );
          pushed = response.data.Creadas + response.data.Actualizadas;
          if (response.data.Errores?.length) {
            errors.push(...response.data.Errores);
          }
        } else {
          errors.push(response.error || 'Error al enviar datos.');
        }
      }

      // ── PULL: Descargar datos maestros desde el servidor ──
      
      // Productores
      const prodResponse = await apiClient.get<Productor[]>('/productores');
      if (prodResponse.ok && prodResponse.data) {
