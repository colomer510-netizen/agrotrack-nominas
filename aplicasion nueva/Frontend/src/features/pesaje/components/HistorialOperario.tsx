import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useSQLiteDB } from '../../../core/database/useSQLiteDB';

interface TransaccionPesaje {
  Id?: number;
  PesoBruto: number;
  BolsasBase: number;
  KilosExcedentes: number;
  TotalGanado: number;
  Fecha: string;
}

export const HistorialOperario: React.FC = () => {
  const history = useHistory();
  const { db, initialized } = useSQLiteDB();
  const [transacciones, setTransacciones] = useState<TransaccionPesaje[]>([]);

  useEffect(() => {
    const cargarHistorial = async () => {
      if (initialized && db) {
        try {
          const res = await db.query('SELECT * FROM TransaccionesPesaje WHERE OperarioId = 1 ORDER BY Id DESC');
          if (res.values) {
            setTransacciones(res.values as TransaccionPesaje[]);
          }
        } catch (error) {
          console.error('Error cargando historial', error);
        }
      } else {
        // Mocks de fallback para previsualización web (Vite)
        setTransacciones([
          { Id: 2, PesoBruto: 24.5, BolsasBase: 1, KilosExcedentes: 1.5, TotalGanado: 15.98, Fecha: new Date().toISOString() },
          { Id: 1, PesoBruto: 23.0, BolsasBase: 1, KilosExcedentes: 0.0, TotalGanado: 15.00, Fecha: new Date(Date.now() - 3600000).toISOString() }
        ]);
      }
    };
    cargarHistorial();
  }, [initialized, db]);

  const totalCordobas = transacciones.reduce((acc, curr) => acc + curr.TotalGanado, 0);
  const totalKilos = transacciones.reduce((acc, curr) => acc + curr.PesoBruto, 0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <div className="bg-gray-900 text-white p-6 pb-12 rounded-b-[2rem] shadow-lg sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => history.push('/')}
            className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"></path></svg>
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-wide">Historial Diario</h1>
            <p className="text-sm text-gray-400">Carlos Martínez</p>
          </div>
        </div>

        <div className="flex justify-between items-end">
          <div>
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Total Ganado Hoy</p>
            <p className="text-4xl font-mono font-bold text-green-400">C$ {totalCordobas.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Bolsas Totales</p>
            <p className="text-2xl font-bold">{transacciones.length} <span className="text-sm font-normal text-gray-500">({totalKilos.toFixed(1)}kg)</span></p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-xl mx-auto space-y-4 -mt-6 relative z-20">
        {transacciones.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-3xl border border-gray-100 shadow-sm mt-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 text-gray-400 mb-4">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800">No hay registros hoy</h3>
            <p className="text-gray-500 text-sm mt-2">Empieza a registrar pesajes para ver tu avance del día.</p>
          </div>
        ) : (
          transacciones.map((t, index) => (
            <div key={t.Id || index} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                  #{transacciones.length - index}
                </div>
                <div>
                  <p className="font-bold text-gray-900">{t.PesoBruto.toFixed(2)} kg</p>
                  <p className="text-xs text-gray-500">
                    Bolsa Base: {t.BolsasBase} | Excedente: <span className="text-yellow-600 font-semibold">{t.KilosExcedentes.toFixed(2)}kg</span>
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-mono font-bold text-green-600">C$ {t.TotalGanado.toFixed(2)}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
                  {new Date(t.Fecha).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
