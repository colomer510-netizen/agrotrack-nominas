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
        for (const prod of prodResponse.data) {
          const existing = await db.productores.where('Codigo').equals(prod.Codigo).first();
          if (!existing) {
            await db.productores.add({ Nombre: prod.Nombre, Codigo: prod.Codigo });
            pulled++;
          }
        }
      }

      // Operarios
      const opResponse = await apiClient.get<Operario[]>('/operarios');
      if (opResponse.ok && opResponse.data) {
        for (const op of opResponse.data) {
          const existing = await db.operarios.where('CodigoInterno').equals(op.CodigoInterno).first();
          if (!existing) {
            await db.operarios.add({ Nombre: op.Nombre, CodigoInterno: op.CodigoInterno, Procedencia: op.Procedencia });
            pulled++;
          }
        }
      }

      // Configuración
      const confResponse = await apiClient.get<ConfiguracionGlobal[]>('/configuracion');
      if (confResponse.ok && confResponse.data) {
        for (const conf of confResponse.data) {
          const existing = await db.configuracionGlobal.where('Clave').equals(conf.Clave).first();
          if (existing && existing.Id) {
            await db.configuracionGlobal.update(existing.Id, { Valor: conf.Valor });
          } else {
            await db.configuracionGlobal.add({ Clave: conf.Clave, Valor: conf.Valor });
          }
          pulled++;
        }
      }

      const result: SyncResult = { success: true, pushed, pulled, errors, timestamp: new Date() };
      this.notify(result);
      return result;

    } catch (err: any) {
      errors.push(err.message || 'Error inesperado en sincronización.');
      const result: SyncResult = { success: false, pushed, pulled, errors, timestamp: new Date() };
      this.notify(result);
      return result;
    } finally {
      this.isSyncing = false;
    }
  }

  /**
   * Inicia sincronización automática periódica.
   */
  startAutoSync(intervalMs: number = 60000): () => void {
    const interval = setInterval(() => {
      if (navigator.onLine) {
        this.sync().catch(console.error);
      }
    }, intervalMs);

    // Sincronizar cuando se recupera la conexión
    const onOnline = () => {
      console.log('[SyncService] Conexión recuperada, sincronizando...');
      this.sync().catch(console.error);
    };
    window.addEventListener('online', onOnline);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('online', onOnline);
    };
  }

  /**
   * Obtiene el conteo de registros pendientes de sincronización.
   */
  async getPendingCount(): Promise<number> {
    return db.transaccionesPesaje.where('Synced').equals(0).count();
  }
}

// Singleton exportado
export const syncService = new SyncService();
export type { SyncResult };
