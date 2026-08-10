import { useState, useEffect, useMemo } from 'react';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Tv, Trophy, TrendingUp, Timer, Target, Zap } from 'lucide-react';

export default function DashboardTVScreen() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const configuracion = useLiveQuery(() => db.configuracionGlobal.toArray(), []);
  const moneda = useMemo(() =>
    configuracion?.find(c => c.Clave === 'MONEDA')?.Valor || 'C$',
  [configuracion]);
  const pesoBolsa = useMemo(() =>
    parseFloat(configuracion?.find(c => c.Clave === 'PESO_BOLSA')?.Valor || '23.0'),
  [configuracion]);

  // Data del día
  const hoy = currentTime.toISOString().split('T')[0];
  
  const transaccionesHoy = useLiveQuery(
    () => db.transaccionesPesaje.filter(t => t.Fecha.startsWith(hoy)).toArray(),
    [hoy]
  );
  const operarios = useLiveQuery(() => db.operarios.toArray(), []);

  // Ranking de operarios
  const ranking = useMemo(() => {
    if (!transaccionesHoy || !operarios) return [];

    const operarioMap = new Map(operarios.map(o => [o.Id, o]));
    const acumulado = new Map<number, { nombre: string, codigo: string, bolsas: number, total: number }>();

    transaccionesHoy.forEach(t => {
      const op = operarioMap.get(t.OperarioId);
      if (!op) return;
      const prev = acumulado.get(t.OperarioId) || { nombre: op.Nombre, codigo: op.CodigoInterno, bolsas: 0, total: 0 };
      prev.bolsas += t.ConteoBolsas;
      prev.total += t.TotalGanado;
      acumulado.set(t.OperarioId, prev);
    });

    return Array.from(acumulado.values())
      .sort((a, b) => b.bolsas - a.bolsas);
  }, [transaccionesHoy, operarios]);

  // Totales
  const totales = useMemo(() => {
    if (!transaccionesHoy) return { bolsas: 0, kilos: 0, pagar: 0 };
    return {
      bolsas: transaccionesHoy.reduce((acc, t) => acc + t.ConteoBolsas, 0),
      kilos: transaccionesHoy.reduce((acc, t) => acc + (t.ConteoBolsas * pesoBolsa) + t.KilosExcedentes, 0),
      pagar: transaccionesHoy.reduce((acc, t) => acc + t.TotalGanado, 0),
    };
  }, [transaccionesHoy, pesoBolsa]);

  // Meta diaria (ejemplo: 500 bolsas)
  const META_DIARIA = 500;
  const progreso = Math.min((totales.bolsas / META_DIARIA) * 100, 100);

  // Kilos por hora (desde las 6am)
  const kilosPorHora = useMemo(() => {
    const ahora = currentTime.getHours();
    const horasActivas = Math.max(ahora - 6, 1); // Planta inicia a las 6am
    return totales.kilos / horasActivas;
  }, [totales.kilos, currentTime]);

  const medalColors = ['text-yellow-400', 'text-slate-300', 'text-amber-600'];

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-10 flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
            <Tv size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">AGROTRACK</h1>
            <p className="text-slate-500 text-sm">Monitor de Planta en Tiempo Real</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-4xl font-mono font-bold text-white">
            {currentTime.toLocaleTimeString('es-NI', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-slate-500">{currentTime.toLocaleDateString('es-NI', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-800/20 rounded-2xl p-6 border border-indigo-500/20">
          <div className="flex items-center gap-2 text-indigo-400 mb-2">
            <Target size={20} />
            <span className="text-sm font-medium uppercase">Bolsas Hoy</span>
          </div>
          <p className="text-5xl font-bold text-white">{totales.bolsas}</p>
          <p className="text-indigo-300/60 text-sm mt-1">Meta: {META_DIARIA}</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 rounded-2xl p-6 border border-emerald-500/20">
          <div className="flex items-center gap-2 text-emerald-400 mb-2">
            <TrendingUp size={20} />
            <span className="text-sm font-medium uppercase">Kilos Totales</span>
          </div>
          <p className="text-5xl font-bold text-white">{totales.kilos.toLocaleString('es', { maximumFractionDigits: 0 })}</p>
          <p className="text-emerald-300/60 text-sm mt-1">kg procesados</p>
        </div>

        <div className="bg-gradient-to-br from-amber-600/20 to-amber-800/20 rounded-2xl p-6 border border-amber-500/20">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <Zap size={20} />
            <span className="text-sm font-medium uppercase">Kg/Hora</span>
          </div>
          <p className="text-5xl font-bold text-white">{kilosPorHora.toFixed(0)}</p>
          <p className="text-amber-300/60 text-sm mt-1">ritmo actual</p>
        </div>

        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-2xl p-6 border border-purple-500/20">
          <div className="flex items-center gap-2 text-purple-400 mb-2">
            <Timer size={20} />
            <span className="text-sm font-medium uppercase">Nómina Total</span>
          </div>
          <p className="text-4xl font-bold text-white">
            <span className="text-2xl text-purple-400">{moneda}</span> {totales.pagar.toFixed(0)}
          </p>
          <p className="text-purple-300/60 text-sm mt-1">acumulado hoy</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <div className="flex justify-between items-center mb-3">
          <span className="text-slate-400 font-medium">Progreso hacia la Meta Diaria</span>
          <span className="text-white font-bold text-xl">{progreso.toFixed(1)}%</span>
        </div>
        <div className="w-full h-6 bg-slate-800 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              progreso >= 100
                ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                : progreso >= 75
                ? 'bg-gradient-to-r from-indigo-500 to-indigo-400'
                : progreso >= 50
                ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                : 'bg-gradient-to-r from-red-500 to-red-400'
            }`}
            style={{ width: `${progreso}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-slate-600">
          <span>0</span>
          <span>{Math.round(META_DIARIA * 0.25)}</span>
          <span>{Math.round(META_DIARIA * 0.5)}</span>
          <span>{Math.round(META_DIARIA * 0.75)}</span>
          <span>{META_DIARIA}</span>
        </div>
      </div>

      {/* Ranking */}
      <div className="flex-1 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col min-h-0">
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <Trophy size={24} className="text-yellow-400" />
          <h2 className="text-xl font-bold text-white">Ranking del Día — Top Peladores</h2>
        </div>
        <div className="flex-1 overflow-auto">
          {ranking.length === 0 ? (
            <div className="p-12 text-center text-slate-600">
              <Trophy className="mx-auto mb-4" size={48} />
              <p>No hay registros hoy. ¡Empieza a registrar pesajes!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {ranking.map((op, idx) => (
                <div key={op.codigo} className={`flex items-center gap-4 p-5 ${idx === 0 ? 'bg-yellow-500/5' : 'hover:bg-slate-800/50'} transition-colors`}>
                  {/* Position */}
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold ${
                    idx < 3 ? medalColors[idx] : 'text-slate-600'
                  } ${idx === 0 ? 'bg-yellow-500/10 border-2 border-yellow-500/30 animate-pulse-glow' : 'bg-slate-800'}`}>
                    {idx < 3 ? ['🥇', '🥈', '🥉'][idx] : `#${idx + 1}`}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <p className={`font-bold ${idx === 0 ? 'text-xl text-yellow-400' : 'text-lg text-white'}`}>
                      {op.nombre}
                    </p>
                    <p className="text-xs text-slate-500 font-mono">{op.codigo}</p>
                  </div>

                  {/* Stats */}
                  <div className="text-right">
                    <p className={`font-bold ${idx === 0 ? 'text-3xl text-yellow-400' : 'text-2xl text-white'}`}>
                      {op.bolsas}
                    </p>
                    <p className="text-xs text-slate-500">bolsas</p>
                  </div>
                  <div className="text-right w-32">
                    <p className="text-lg font-semibold text-emerald-400">
                      {moneda} {op.total.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-500">ganado</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
