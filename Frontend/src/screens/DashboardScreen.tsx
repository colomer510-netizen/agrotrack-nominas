import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { Scale, Users, Briefcase, TrendingUp, Package, History, Settings, Tv, Shield, ArrowRight } from 'lucide-react';

export default function DashboardScreen() {
  const productores = useLiveQuery(() => db.productores.count(), []);
  const operarios = useLiveQuery(() => db.operarios.count(), []);
  const transaccionesHoy = useLiveQuery(() => {
    const hoy = new Date().toISOString().split('T')[0];
    return db.transaccionesPesaje
      .filter(t => t.Fecha.startsWith(hoy))
      .count();
  }, []);
  const transaccionesActivas = useLiveQuery(() =>
    db.transaccionesPesaje
      .filter(t => !t.Estado || t.Estado === 'Activo')
      .count()
  , []);
  const configuracion = useLiveQuery(() => db.configuracionGlobal.toArray(), []);

  const moneda = useMemo(() =>
    configuracion?.find(c => c.Clave === 'MONEDA')?.Valor || 'C$',
  [configuracion]);

  // Resumen de bolsas hoy
  const resumenHoy = useLiveQuery(async () => {
    const hoy = new Date().toISOString().split('T')[0];
    const transacciones = await db.transaccionesPesaje
      .filter(t => t.Fecha.startsWith(hoy))
      .toArray();
    return {
      totalBolsas: transacciones.reduce((acc, t) => acc + t.ConteoBolsas, 0),
      totalPagar: transacciones.reduce((acc, t) => acc + t.TotalGanado, 0),
    };
  }, []);

  // Últimas 5 transacciones
  const ultimasTransacciones = useLiveQuery(async () => {
    const trans = await db.transaccionesPesaje.orderBy('Id').reverse().limit(5).toArray();
    const ops = await db.operarios.toArray();
    const opMap = new Map(ops.map(o => [o.Id, o]));
    return trans.map(t => ({ ...t, operario: opMap.get(t.OperarioId) }));
  }, []);

  const modules = [
    {
      icon: Scale, title: 'Línea de Pesaje', desc: 'Registrar bolsas y kilos',
      to: '/pesaje', color: 'from-indigo-600 to-indigo-800', iconColor: 'text-indigo-300'
    },
    {
      icon: History, title: 'Contabilidad', desc: 'Historial y reportes',
      to: '/historial', color: 'from-emerald-600 to-emerald-800', iconColor: 'text-emerald-300'
    },
    {
      icon: Package, title: 'Exportación', desc: 'Contenedores y documentos',
      to: '/exportacion', color: 'from-amber-600 to-amber-800', iconColor: 'text-amber-300'
    },
    {
      icon: Shield, title: 'Trazabilidad', desc: 'Ledger FSMA 204',
      to: '/trazabilidad', color: 'from-cyan-600 to-cyan-800', iconColor: 'text-cyan-300'
    },
    {
      icon: Tv, title: 'Dashboard TV', desc: 'Monitor para planta',
      to: '/tv', color: 'from-purple-600 to-purple-800', iconColor: 'text-purple-300'
    },
    {
      icon: Settings, title: 'Configuración', desc: 'Tarifas y trabajadores',
      to: '/configuracion', color: 'from-slate-600 to-slate-800', iconColor: 'text-slate-300'
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Hero */}
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
          Bienvenido a <span className="bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">AgroTrack</span>
        </h1>
        <p className="text-slate-400 mt-3 text-lg">Sistema de Gestión de Nóminas y Trazabilidad</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700 card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
              <Scale size={20} className="text-indigo-400" />
            </div>
            <span className="text-sm text-slate-400">Bolsas Hoy</span>
          </div>
          <p className="text-3xl font-bold text-white">{resumenHoy?.totalBolsas ?? 0}</p>
        </div>

        <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700 card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp size={20} className="text-emerald-400" />
            </div>
            <span className="text-sm text-slate-400">Nómina Hoy</span>
          </div>
          <p className="text-3xl font-bold text-white">
            <span className="text-lg text-slate-500">{moneda}</span> {(resumenHoy?.totalPagar ?? 0).toFixed(2)}
          </p>
        </div>

        <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700 card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Users size={20} className="text-amber-400" />
            </div>
            <span className="text-sm text-slate-400">Trabajadores</span>
          </div>
          <p className="text-3xl font-bold text-white">{operarios ?? 0}</p>
        </div>

        <div className="bg-slate-800/80 rounded-xl p-5 border border-slate-700 card-hover">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Briefcase size={20} className="text-cyan-400" />
            </div>
            <span className="text-sm text-slate-400">Productores</span>
          </div>
          <p className="text-3xl font-bold text-white">{productores ?? 0}</p>
        </div>
      </div>

      {/* Quick Access Modules */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Módulos del Sistema</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {modules.map((mod) => (
            <Link
              key={mod.to}
              to={mod.to}
              className={`bg-gradient-to-br ${mod.color} rounded-xl p-6 border border-white/10 card-hover group relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-x-4 -translate-y-4 group-hover:scale-150 transition-transform duration-500" />
              <mod.icon size={28} className={`${mod.iconColor} mb-3`} />
              <h3 className="text-white font-semibold text-lg">{mod.title}</h3>
              <p className="text-white/60 text-sm mt-1">{mod.desc}</p>
              <ArrowRight size={16} className="absolute bottom-4 right-4 text-white/30 group-hover:text-white/60 group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800/80 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-5 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">Actividad Reciente</h2>
        </div>
        <div className="divide-y divide-slate-700/50">
          {(!ultimasTransacciones || ultimasTransacciones.length === 0) ? (
            <div className="p-8 text-center text-slate-500">
              No hay registros todavía. Inicia registrando pesajes.
            </div>
          ) : (
            ultimasTransacciones.map((t) => (
              <div key={t.Id} className="p-4 flex items-center justify-between hover:bg-slate-700/20 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${t.Estado === 'Cerrado' ? 'bg-slate-500' : 'bg-emerald-400'}`} />
                  <div>
                    <p className="text-white font-medium">{t.operario?.Nombre || 'Operario desconocido'}</p>
                    <p className="text-xs text-slate-500">
                      {t.operario?.CodigoInterno} · {new Date(t.Fecha).toLocaleDateString('es-NI')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-white font-semibold">{t.ConteoBolsas} bolsas</p>
                  <p className="text-xs text-slate-400">{moneda} {t.TotalGanado.toFixed(2)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-center gap-4 text-sm text-slate-500 pb-4">
        <div className="flex items-center gap-2">
          <span className={`status-dot ${navigator.onLine ? 'online' : 'offline'}`} />
          {navigator.onLine ? 'Conectado' : 'Modo Offline'}
        </div>
        <span>·</span>
        <span>Registros hoy: {transaccionesHoy ?? 0}</span>
        <span>·</span>
        <span>Activos: {transaccionesActivas ?? 0}</span>
      </div>
    </div>
  );
}
