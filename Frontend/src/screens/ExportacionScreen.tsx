import { useState } from 'react';
import { Package, PlusCircle, Trash2, FileText, Ship, Calendar, MapPin } from 'lucide-react';

interface ContenedorLocal {
  Id?: number;
  NumeroContenedor: string;
  Destino: string;
  FechaSalida: string;
  TotalKilos: number;
  TotalCajas: number;
  Estado: 'Preparando' | 'Cargado' | 'Enviado';
}

// Extender la DB con tabla de contenedores (se agrega en db.ts v3)
// Por ahora usamos estado local como demo
export default function ExportacionScreen() {
  const [contenedores, setContenedores] = useState<ContenedorLocal[]>([
    {
      Id: 1,
      NumeroContenedor: 'CONT-2026-001',
      Destino: 'Miami, FL - USA',
      FechaSalida: '2026-08-15',
      TotalKilos: 23000,
      TotalCajas: 1000,
      Estado: 'Preparando'
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [nuevoContenedor, setNuevoContenedor] = useState('');
  const [nuevoDestino, setNuevoDestino] = useState('');
  const [nuevaFecha, setNuevaFecha] = useState('');

  const agregarContenedor = () => {
    if (!nuevoContenedor || !nuevoDestino || !nuevaFecha) {
      alert('Complete todos los campos.');
      return;
    }
    setContenedores(prev => [...prev, {
      Id: Date.now(),
      NumeroContenedor: nuevoContenedor,
      Destino: nuevoDestino,
      FechaSalida: nuevaFecha,
      TotalKilos: 0,
      TotalCajas: 0,
      Estado: 'Preparando'
    }]);
    setNuevoContenedor('');
    setNuevoDestino('');
    setNuevaFecha('');
    setShowForm(false);
  };

  const eliminarContenedor = (id?: number) => {
    if (id && confirm('¿Eliminar este contenedor?')) {
      setContenedores(prev => prev.filter(c => c.Id !== id));
    }
  };

  const cambiarEstado = (id: number, estado: ContenedorLocal['Estado']) => {
    setContenedores(prev => prev.map(c => c.Id === id ? { ...c, Estado: estado } : c));
  };

  const descargarPDF = (tipo: string, contenedorId: number) => {
    alert(`Generación de PDF "${tipo}" para contenedor #${contenedorId}.\n\nEsta función se activará cuando el Backend .NET esté conectado.\n\nEndpoint: GET /api/exportacion/documentos/${tipo.toLowerCase().replace(' ', '-')}/${contenedorId}`);
  };

  const estadoColor = (estado: string) => {
    switch (estado) {
      case 'Preparando': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Cargado': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'Enviado': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Ship className="text-amber-500" size={32} />
            Aduanas y Exportación
          </h1>
          <p className="text-slate-400 mt-2">Gestión de contenedores y documentos de exportación.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-amber-600 hover:bg-amber-500 text-white px-6 py-3 rounded-xl font-medium transition-colors flex items-center gap-2 shadow-lg shadow-amber-900/20"
        >
          <PlusCircle size={20} />
          Nuevo Contenedor
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl animate-fade-in">
          <h2 className="text-lg font-semibold text-amber-400 mb-4">Registrar Contenedor</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Número de Contenedor</label>
              <input
                type="text"
                placeholder="CONT-2026-XXX"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-amber-500 text-white"
                value={nuevoContenedor}
                onChange={e => setNuevoContenedor(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Destino</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="text"
                  placeholder="Miami, FL - USA"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500 text-white"
                  value={nuevoDestino}
                  onChange={e => setNuevoDestino(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Fecha de Salida</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                <input
                  type="date"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:border-amber-500 text-white"
                  value={nuevaFecha}
                  onChange={e => setNuevaFecha(e.target.value)}
                />
              </div>
            </div>
          </div>
          <button
            onClick={agregarContenedor}
            className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <PlusCircle size={18} />
            Registrar
          </button>
        </div>
      )}

      {/* Lista de Contenedores */}
      <div className="space-y-4">
        {contenedores.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-12 border border-slate-700 text-center">
            <Package className="mx-auto mb-4 text-slate-600" size={48} />
            <p className="text-slate-500">No hay contenedores registrados.</p>
          </div>
        ) : (
          contenedores.map((cont) => (
            <div key={cont.Id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl card-hover">
              <div className="p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <Package size={24} className="text-amber-400" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{cont.NumeroContenedor}</h3>
                      <p className="text-slate-400 flex items-center gap-1 mt-1">
                        <MapPin size={14} /> {cont.Destino}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${estadoColor(cont.Estado)}`}>
                      {cont.Estado}
                    </span>
                    <span className="text-sm text-slate-400 flex items-center gap-1">
                      <Calendar size={14} /> {cont.FechaSalida}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500 uppercase">Kilos Totales</p>
                    <p className="text-lg font-bold text-white">{cont.TotalKilos.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500 uppercase">Cajas</p>
                    <p className="text-lg font-bold text-white">{cont.TotalCajas.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500 uppercase">Destino</p>
                    <p className="text-lg font-bold text-white truncate">{cont.Destino.split(',')[0]}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 text-center">
                    <p className="text-xs text-slate-500 uppercase">Estado</p>
                    <select
                      className="bg-transparent text-white font-bold text-sm text-center w-full focus:outline-none cursor-pointer"
                      value={cont.Estado}
                      onChange={e => cambiarEstado(cont.Id!, e.target.value as ContenedorLocal['Estado'])}
                    >
                      <option value="Preparando">Preparando</option>
                      <option value="Cargado">Cargado</option>
                      <option value="Enviado">Enviado</option>
                    </select>
                  </div>
                </div>

                {/* Acciones de Documentos */}
                <div className="flex flex-wrap gap-2 mt-6 pt-4 border-t border-slate-700">
                  <button
                    onClick={() => descargarPDF('Packing List', cont.Id!)}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <FileText size={16} /> Packing List
                  </button>
                  <button
                    onClick={() => descargarPDF('Factura Comercial', cont.Id!)}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <FileText size={16} /> Factura Comercial
                  </button>
                  <button
                    onClick={() => descargarPDF('IPSA', cont.Id!)}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <FileText size={16} /> Certificado IPSA
                  </button>
                  <div className="flex-1" />
                  <button
                    onClick={() => eliminarContenedor(cont.Id)}
                    className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Eliminar Contenedor"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
