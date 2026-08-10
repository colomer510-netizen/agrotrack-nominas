import { useState, useMemo } from 'react';
import { Shield, Search, PlusCircle, ChevronRight, Clock, Package, Truck, AlertTriangle, CheckCircle } from 'lucide-react';

interface EventoTrazabilidad {
  id: string;
  tlc: string;
  eventoTipo: 'Recepcion' | 'Transformacion' | 'Empaque' | 'Envio' | 'Rechazo';
  descripcion: string;
  registradoPor: string;
  timestamp: string;
  kdes: Record<string, string>;
}

export default function TrazabilidadScreen() {
  const [buscarLote, setBuscarLote] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [nuevoTLC, setNuevoTLC] = useState('');
  const [nuevoTipo, setNuevoTipo] = useState<EventoTrazabilidad['eventoTipo']>('Recepcion');
  const [nuevaDescripcion, setNuevaDescripcion] = useState('');
  const [nuevoResponsable, setNuevoResponsable] = useState('');

  // Demo data — en producción vendrá de Dexie/backend
  const [eventos, setEventos] = useState<EventoTrazabilidad[]>([
    {
      id: crypto.randomUUID(),
      tlc: 'TLC-2026-0801-001',
      eventoTipo: 'Recepcion',
      descripcion: 'Recepción de 500 racimos de plátano de Finca El Carmen',
      registradoPor: 'Operador 1',
      timestamp: '2026-08-01T08:30:00',
      kdes: { 'Proveedor': 'Finca El Carmen', 'Cantidad': '500 racimos', 'Peso Total': '11,500 kg' }
    },
    {
      id: crypto.randomUUID(),
      tlc: 'TLC-2026-0801-001',
      eventoTipo: 'Transformacion',
      descripcion: 'Pelado y empacado al vacío — Línea A',
      registradoPor: 'Supervisor Turno 1',
      timestamp: '2026-08-01T10:15:00',
      kdes: { 'Línea': 'A', 'Bolsas Producidas': '1,200', 'pH Solución': '3.5', 'Temp Ambiente': '18°C' }
    },
    {
      id: crypto.randomUUID(),
      tlc: 'TLC-2026-0801-001',
      eventoTipo: 'Empaque',
      descripcion: 'Empacado en cajas de cartón corrugado para exportación',
      registradoPor: 'Empaque Team',
      timestamp: '2026-08-01T14:00:00',
      kdes: { 'Cajas': '50', 'Peso por Caja': '23 kg', 'Etiqueta GS1-128': 'Generada' }
    },
    {
      id: crypto.randomUUID(),
      tlc: 'TLC-2026-0801-001',
      eventoTipo: 'Envio',
      descripcion: 'Cargado en contenedor CONT-2026-001 destino Miami',
      registradoPor: 'Logística',
      timestamp: '2026-08-02T06:00:00',
      kdes: { 'Contenedor': 'CONT-2026-001', 'Destino': 'Miami, FL', 'Temp Cuarto Frío': '4°C' }
    },
  ]);

  const eventosFiltrados = useMemo(() => {
    if (!buscarLote) return eventos;
    return eventos.filter(e =>
      e.tlc.toLowerCase().includes(buscarLote.toLowerCase()) ||
      e.descripcion.toLowerCase().includes(buscarLote.toLowerCase())
    );
  }, [eventos, buscarLote]);

  const agregarEvento = () => {
    if (!nuevoTLC || !nuevaDescripcion) {
      alert('Complete los campos obligatorios (TLC y Descripción).');
      return;
    }
    const nuevo: EventoTrazabilidad = {
      id: crypto.randomUUID(),
      tlc: nuevoTLC,
      eventoTipo: nuevoTipo,
      descripcion: nuevaDescripcion,
      registradoPor: nuevoResponsable || 'Sistema',
      timestamp: new Date().toISOString(),
      kdes: {}
    };
    setEventos(prev => [...prev, nuevo]);
    setNuevoTLC('');
    setNuevaDescripcion('');
    setNuevoResponsable('');
    setShowForm(false);
  };

  const iconoEvento = (tipo: string) => {
    switch (tipo) {
      case 'Recepcion': return <Package size={18} className="text-blue-400" />;
      case 'Transformacion': return <Clock size={18} className="text-amber-400" />;
      case 'Empaque': return <CheckCircle size={18} className="text-emerald-400" />;
      case 'Envio': return <Truck size={18} className="text-indigo-400" />;
      case 'Rechazo': return <AlertTriangle size={18} className="text-red-400" />;
      default: return <ChevronRight size={18} className="text-slate-400" />;
    }
  };

  const colorEvento = (tipo: string) => {
    switch (tipo) {
      case 'Recepcion': return 'border-l-blue-500 bg-blue-500/5';
      case 'Transformacion': return 'border-l-amber-500 bg-amber-500/5';
      case 'Empaque': return 'border-l-emerald-500 bg-emerald-500/5';
      case 'Envio': return 'border-l-indigo-500 bg-indigo-500/5';
      case 'Rechazo': return 'border-l-red-500 bg-red-500/5';
      default: return 'border-l-slate-500';
    }
  };

  // Agrupar por TLC
  const gruposPorLote = useMemo(() => {
    const map = new Map<string, EventoTrazabilidad[]>();
    eventosFiltrados.forEach(e => {
      const arr = map.get(e.tlc) || [];
      arr.push(e);
      map.set(e.tlc, arr);
    });
    return Array.from(map.entries());
  }, [eventosFiltrados]);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Shield className="text-cyan-500" size={32} />
            Trazabilidad FSMA 204
          </h1>
          <p className="text-slate-400 mt-2">Ledger inmutable de eventos críticos de seguimiento (CTEs).</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-cyan-900/20"
        >
          <PlusCircle size={20} />
          Registrar Evento
        </button>
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <input
          type="text"
          placeholder="Buscar por código de lote (TLC) o descripción..."
          className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:border-cyan-500 text-white text-lg"
          value={buscarLote}
          onChange={e => setBuscarLote(e.target.value)}
        />
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl animate-fade-in">
          <h2 className="text-lg font-semibold text-cyan-400 mb-4">Nuevo Evento de Trazabilidad</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Código de Lote (TLC) *</label>
              <input
                type="text"
                placeholder="TLC-2026-MMDD-XXX"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 text-white"
                value={nuevoTLC}
                onChange={e => setNuevoTLC(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Tipo de Evento (CTE)</label>
              <select
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 text-white"
                value={nuevoTipo}
                onChange={e => setNuevoTipo(e.target.value as EventoTrazabilidad['eventoTipo'])}
              >
                <option value="Recepcion">📦 Recepción</option>
                <option value="Transformacion">⚙️ Transformación</option>
                <option value="Empaque">✅ Empaque</option>
                <option value="Envio">🚛 Envío</option>
                <option value="Rechazo">⚠️ Rechazo</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-400 mb-2">Descripción *</label>
              <textarea
                placeholder="Describa el evento detalladamente..."
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 text-white h-20 resize-none"
                value={nuevaDescripcion}
                onChange={e => setNuevaDescripcion(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Registrado Por</label>
              <input
                type="text"
                placeholder="Nombre del responsable"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-cyan-500 text-white"
                value={nuevoResponsable}
                onChange={e => setNuevoResponsable(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={agregarEvento}
            className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <PlusCircle size={18} /> Registrar en Ledger
          </button>
        </div>
      )}

      {/* Timeline por Lote */}
      {gruposPorLote.length === 0 ? (
        <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
          <Shield className="mx-auto mb-4 text-slate-600" size={48} />
          <p className="text-slate-500">No hay eventos de trazabilidad registrados.</p>
        </div>
      ) : (
        gruposPorLote.map(([tlc, eventosLote]) => (
          <div key={tlc} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
            <div className="p-5 border-b border-slate-700 bg-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                  <Shield size={20} className="text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">{tlc}</h3>
                  <p className="text-xs text-slate-500">{eventosLote.length} evento(s) registrado(s)</p>
                </div>
              </div>
            </div>

            <div className="p-4 space-y-3">
              {eventosLote
                .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
                .map((evento) => (
                <div key={evento.id} className={`border-l-4 rounded-r-lg p-4 ${colorEvento(evento.eventoTipo)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{iconoEvento(evento.eventoTipo)}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold uppercase text-slate-400">{evento.eventoTipo}</span>
                          <span className="text-xs text-slate-600">·</span>
                          <span className="text-xs text-slate-500">
                            {new Date(evento.timestamp).toLocaleString('es-NI')}
                          </span>
                        </div>
                        <p className="text-white mt-1">{evento.descripcion}</p>
                        <p className="text-xs text-slate-500 mt-1">Registrado por: {evento.registradoPor}</p>
                      </div>
                    </div>
                  </div>

                  {/* KDEs */}
                  {Object.keys(evento.kdes).length > 0 && (
                    <div className="mt-3 ml-7 flex flex-wrap gap-2">
                      {Object.entries(evento.kdes).map(([key, val]) => (
                        <span key={key} className="bg-slate-900/60 border border-slate-700 px-2 py-1 rounded text-xs text-slate-300">
                          <span className="text-slate-500">{key}:</span> {val}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
