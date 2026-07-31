import React, { useState, useEffect, useMemo } from 'react';
import { IonPage, IonContent, IonIcon } from '@ionic/react';
import { timeOutline, trashOutline, warningOutline } from 'ionicons/icons';
import { useSQLiteDB } from '../../../core/database/useSQLiteDB';
import { DatabaseService, HistorialRow } from '../../../core/database/DatabaseService';

export const HistorialScreen: React.FC = () => {
  const { db, initialized } = useSQLiteDB();
  const dbService = useMemo(() => new DatabaseService(db), [db]);

  const [historial, setHistorial] = useState<HistorialRow[]>([]);

  useEffect(() => {
    if (initialized) {
      cargarHistorial();
    }
  }, [initialized]);

  const cargarHistorial = async () => {
    const data = await dbService.getHistorialPesajes();
    setHistorial(data);
  };

  const handleEliminar = async (id: number) => {
    const confirm = window.confirm('¿Está seguro de eliminar este pesaje? Esta acción no se puede deshacer y ajustará la nómina.');
    if (confirm) {
      await dbService.deleteTransaccion(id);
      await cargarHistorial();
    }
  };

  return (
    <div className="bg-[#0f172a] text-white font-sans h-full flex flex-col">
      {/* HEADER */}
      <div className="bg-[#1e293b]/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto p-4 md:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg border border-white/20">
              <IonIcon icon={timeOutline} className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white">Historial de Pesajes</h1>
              <p className="text-slate-400 text-sm">Auditoría y corrección de errores</p>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          
          {historial.length === 0 ? (
            <div className="text-center py-20 bg-slate-800/20 rounded-3xl border border-slate-700/50 border-dashed mt-4">
              <IonIcon icon={timeOutline} className="text-6xl text-slate-600 mb-4" />
              <h2 className="text-xl font-bold text-slate-400">No hay registros de pesaje recientes.</h2>
            </div>
          ) : (
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-700">
                    <tr>
                      <th className="p-4 font-bold tracking-wider">FECHA / HORA</th>
                      <th className="p-4 font-bold tracking-wider">TRABAJADOR</th>
                      <th className="p-4 font-bold tracking-wider">FINCA</th>
                      <th className="p-4 font-bold tracking-wider text-center">BOLSAS</th>
                      <th className="p-4 font-bold tracking-wider text-right">TOTAL (C$)</th>
                      <th className="p-4 font-bold tracking-wider text-center">ACCIÓN</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {historial.map(row => {
                      const fecha = new Date(row.Fecha);
                      return (
                        <tr key={row.TransaccionId} className="hover:bg-slate-700/30 transition-colors">
                          <td className="p-4 text-slate-300">
                            <span className="font-bold block">{fecha.toLocaleDateString()}</span>
                            <span className="text-xs text-slate-500">{fecha.toLocaleTimeString()}</span>
                          </td>
                          <td className="p-4 font-bold text-white">{row.OperarioNombre}</td>
                          <td className="p-4 text-indigo-300 font-medium">{row.ProductorNombre}</td>
                          <td className="p-4 text-center">
                            <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full font-bold">
                              {row.TotalBolsas}
                            </span>
                          </td>
                          <td className="p-4 text-right font-black text-emerald-400">C$ {row.TotalGanado.toFixed(2)}</td>
                          <td className="p-4 text-center">
                            <button 
                              onClick={() => handleEliminar(row.TransaccionId)}
                              className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-colors"
                              title="Eliminar registro"
                            >
                              <IonIcon icon={trashOutline} className="text-xl" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};
