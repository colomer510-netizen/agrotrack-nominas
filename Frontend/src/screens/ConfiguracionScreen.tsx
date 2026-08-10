import { useState, useEffect } from 'react';
import { db } from '../db';
import { useLiveQuery } from 'dexie-react-hooks';
import { UserPlus, PlusCircle, Trash2, Save } from 'lucide-react';

export default function ConfiguracionScreen() {
  const [activeTab, setActiveTab] = useState('General');
  
  const [nuevoProdNombre, setNuevoProdNombre] = useState('');
  const [nuevoProdCodigo, setNuevoProdCodigo] = useState('');
  
  const [nuevoOpNombre, setNuevoOpNombre] = useState('');
  const [nuevoOpCodigo, setNuevoOpCodigo] = useState('');
  const [nuevoOpProcedencia, setNuevoOpProcedencia] = useState('');

  // Estados para edición global
  const [pesoBolsa, setPesoBolsa] = useState('');
  const [tarifaBase, setTarifaBase] = useState('');
  const [moneda, setMoneda] = useState('C$');
  const [pagoProductor, setPagoProductor] = useState('0');
  const [modoCierre, setModoCierre] = useState('Manual');

  // Live Queries to Dexie
  const productores = useLiveQuery(() => db.productores.toArray(), []);
  const operarios = useLiveQuery(() => db.operarios.toArray(), []);
  const configuracion = useLiveQuery(() => db.configuracionGlobal.toArray(), []);

  // Cargar valores globales iniciales
  useEffect(() => {
    if (configuracion) {
      const peso = configuracion.find(c => c.Clave === 'PESO_BOLSA')?.Valor;
      const tarifa = configuracion.find(c => c.Clave === 'TARIFA_BASE')?.Valor;
      const mon = configuracion.find(c => c.Clave === 'MONEDA')?.Valor;
      const pagoP = configuracion.find(c => c.Clave === 'PAGO_PRODUCTOR_BOLSA')?.Valor;
      const modo = configuracion.find(c => c.Clave === 'MODO_CIERRE')?.Valor;
      
      if (peso) setPesoBolsa(peso);
      if (tarifa) setTarifaBase(tarifa);
      if (mon) setMoneda(mon);
      if (pagoP) setPagoProductor(pagoP);
      if (modo) setModoCierre(modo);
    }
  }, [configuracion]);

  const guardarConfiguracion = async () => {
    try {
      const saveOrUpdate = async (clave: string, valor: string) => {
        const obj = configuracion?.find(c => c.Clave === clave);
        if (obj && obj.Id) {
          await db.configuracionGlobal.update(obj.Id, { Valor: valor });
        } else {
          await db.configuracionGlobal.add({ Clave: clave, Valor: valor });
        }
      };

      await saveOrUpdate('PESO_BOLSA', pesoBolsa);
      await saveOrUpdate('TARIFA_BASE', tarifaBase);
      await saveOrUpdate('MONEDA', moneda);
      await saveOrUpdate('PAGO_PRODUCTOR_BOLSA', pagoProductor);
      await saveOrUpdate('MODO_CIERRE', modoCierre);
      
      alert('Configuración guardada exitosamente.');
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      alert('Hubo un error al guardar.');
    }
  };

  const agregarProductor = async () => {
    if (!nuevoProdNombre || !nuevoProdCodigo) return;
    await db.productores.add({
      Nombre: nuevoProdNombre,
      Codigo: nuevoProdCodigo
    });
    setNuevoProdNombre('');
    setNuevoProdCodigo('');
  };

  const eliminarProductor = async (id?: number) => {
    if (!id) return;
    const transacciones = await db.transaccionesPesaje
      .where('ProductorId').equals(id).count();
    if (transacciones > 0) {
      alert(`No se puede eliminar: este productor tiene ${transacciones} registro(s) de pesaje vinculados. Elimine los registros primero.`);
      return;
    }
    if (confirm('¿Estás seguro de eliminar este productor?')) {
      await db.productores.delete(id);
    }
  };

  const agregarOperario = async () => {
    if (!nuevoOpNombre || !nuevoOpCodigo || !nuevoOpProcedencia) return;
    await db.operarios.add({
      Nombre: nuevoOpNombre,
      CodigoInterno: nuevoOpCodigo,
      Procedencia: nuevoOpProcedencia
    });
    setNuevoOpNombre('');
    setNuevoOpCodigo('');
    setNuevoOpProcedencia('');
  };

  const eliminarOperario = async (id?: number) => {
    if (!id) return;
    const transacciones = await db.transaccionesPesaje
      .where('OperarioId').equals(id).count();
    if (transacciones > 0) {
      alert(`No se puede eliminar: este trabajador tiene ${transacciones} registro(s) de pesaje vinculados. Elimine los registros primero.`);
      return;
    }
    if (confirm('¿Estás seguro de eliminar este trabajador?')) {
      await db.operarios.delete(id);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white">Configuración del Sistema</h1>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap justify-center gap-2 bg-slate-800 p-1 rounded-xl w-fit mx-auto">
        {['General', 'Productores / Fincas', 'Trabajadores'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab || (activeTab === 'Productores' && tab === 'Productores / Fincas') || (activeTab === 'Operarios' && tab === 'Trabajadores')
                ? 'bg-indigo-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Productores Tab */}
      {(activeTab === 'Productores' || activeTab === 'Productores / Fincas') && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-indigo-400">Agregar Productor / Finca</h2>
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Nombre Finca/Productor (Ej. El Carmen)"
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 text-white"
                value={nuevoProdNombre}
                onChange={(e) => setNuevoProdNombre(e.target.value)}
              />
              <input
                type="text"
                placeholder="Código (Ej. CAR-1)"
                className="w-full md:w-48 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 text-white"
                value={nuevoProdCodigo}
                onChange={(e) => setNuevoProdCodigo(e.target.value)}
              />
              <button
                onClick={agregarProductor}
                className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
              >
                <PlusCircle size={20} />
                Agregar
              </button>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-xs uppercase tracking-wider text-slate-400 bg-slate-800/50">
                    <th className="p-4 font-semibold">Nombre Finca / Productor</th>
                    <th className="p-4 font-semibold">Código Interno</th>
                    <th className="p-4 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {productores?.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-slate-500">
                        No hay productores registrados.
                      </td>
                    </tr>
                  )}
                  {productores?.map((prod) => (
                    <tr key={prod.Id} className="hover:bg-slate-700/50 transition-colors">
                      <td className="p-4 font-medium text-white">{prod.Nombre}</td>
                      <td className="p-4 text-slate-300">
                        <span className="bg-slate-900 px-3 py-1 rounded-full text-xs font-mono border border-slate-700">
                          {prod.Codigo}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => eliminarProductor(prod.Id)}
                          className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Trabajadores Tab */}
      {(activeTab === 'Trabajadores' || activeTab === 'Operarios') && (
        <div className="space-y-6">
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-indigo-400">Agregar Trabajador</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Nombre completo"
                className="col-span-1 md:col-span-2 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 text-white"
                value={nuevoOpNombre}
                onChange={(e) => setNuevoOpNombre(e.target.value)}
              />
              <input
                type="text"
                placeholder="Código Interno"
                className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 text-white"
                value={nuevoOpCodigo}
                onChange={(e) => setNuevoOpCodigo(e.target.value)}
              />
              <input
                type="text"
                placeholder="Procedencia"
                className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 text-white"
                value={nuevoOpProcedencia}
                onChange={(e) => setNuevoOpProcedencia(e.target.value)}
              />
              <button
                onClick={agregarOperario}
                className="md:col-span-4 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
              >
                <UserPlus size={20} />
                Registrar Trabajador
              </button>
            </div>
          </div>

          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-700 text-xs uppercase tracking-wider text-slate-400 bg-slate-800/50">
                    <th className="p-4 font-semibold">Trabajador</th>
                    <th className="p-4 font-semibold">Código Interno</th>
                    <th className="p-4 font-semibold">Procedencia</th>
                    <th className="p-4 font-semibold text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {operarios?.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-500">
                        No hay trabajadores registrados.
                      </td>
                    </tr>
                  )}
                  {operarios?.map((op) => (
                    <tr key={op.Id} className="hover:bg-slate-700/50 transition-colors">
                      <td className="p-4 font-medium text-white">{op.Nombre}</td>
                      <td className="p-4 text-slate-300">
                        <span className="bg-slate-900 px-3 py-1 rounded-full text-xs font-mono border border-slate-700">
                          {op.CodigoInterno}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">{op.Procedencia}</td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => eliminarOperario(op.Id)}
                          className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* General Tab */}
      {activeTab === 'General' && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-xl max-w-2xl mx-auto">
          <h2 className="text-xl font-semibold mb-6 text-indigo-400">Configuración de Tarifas y Pesos</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Peso Estándar por Bolsa (Kg)</label>
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  step="0.1"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 text-white text-lg font-bold"
                  value={pesoBolsa}
                  onChange={(e) => setPesoBolsa(e.target.value)}
                />
                <span className="text-slate-500 font-medium">Kg</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Este peso se utiliza para calcular los kilos totales y sueltos.</p>
            </div>

            <div className="h-px bg-slate-700/50 w-full"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Tarifa Base por Bolsa (Pelador)</label>
                <div className="flex items-center gap-4">
                  <span className="text-slate-500 font-bold text-xl">{moneda}</span>
                  <input
                    type="number"
                    step="0.5"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 text-white text-lg font-bold"
                    value={tarifaBase}
                    onChange={(e) => setTarifaBase(e.target.value)}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">Valor pagado al operario por cada bolsa completada.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Pago al Productor por Bolsa</label>
                <div className="flex items-center gap-4">
                  <span className="text-slate-500 font-bold text-xl">{moneda}</span>
                  <input
                    type="number"
                    step="0.5"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 text-white text-lg font-bold"
                    value={pagoProductor}
                    onChange={(e) => setPagoProductor(e.target.value)}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">Valor total que gana el productor por cada bolsa.</p>
              </div>
            </div>

            <div className="h-px bg-slate-700/50 w-full"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Moneda del Sistema</label>
                <select
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 text-white font-medium"
                  value={moneda}
                  onChange={(e) => setMoneda(e.target.value)}
                >
                  <option value="C$">Córdobas (C$)</option>
                  <option value="$">Dólares ($)</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">Símbolo de moneda utilizado en los reportes.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Modo de Guardado / Cierre</label>
                <select
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 text-white font-medium"
                  value={modoCierre}
                  onChange={(e) => setModoCierre(e.target.value)}
                >
                  <option value="Manual">Manual (Botón Cerrar Jornada)</option>
                  <option value="Automático">Automático (Al guardar pesaje)</option>
                </select>
                <p className="text-xs text-slate-500 mt-2">Controla cómo los datos pasan al historial contable.</p>
              </div>
            </div>

            <button
              onClick={guardarConfiguracion}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 mt-4"
            >
              <Save size={20} />
              Guardar Configuración Global
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
