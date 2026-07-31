import React, { useState, useEffect, useMemo } from 'react';
import { IonIcon, IonSelect, IonSelectOption } from '@ionic/react';
import { add, trash, save } from 'ionicons/icons';
import { useSQLiteDB } from '../../../core/database/useSQLiteDB';
import { DatabaseService, Productor, Operario } from '../../../core/database/DatabaseService';

type ConfigTab = 'GLOBAL' | 'PRODUCTORES' | 'TRABAJADORES';

export const ConfiguracionScreen: React.FC = () => {
  const { db, initialized, saveWebStore } = useSQLiteDB();
  const dbService = useMemo(() => new DatabaseService(db), [db]);

  const [activeTab, setActiveTab] = useState<ConfigTab>('GLOBAL');

  // Datos Globales
  const [pesoBolsa, setPesoBolsa] = useState<string>('23.0');
  const [tarifaBase, setTarifaBase] = useState<string>('15.0');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Productores
  const [productores, setProductores] = useState<Productor[]>([]);
  const [nuevoProdNombre, setNuevoProdNombre] = useState('');
  const [nuevoProdCodigo, setNuevoProdCodigo] = useState('');

  // Operarios
  const [operarios, setOperarios] = useState<Operario[]>([]);
  const [nuevoOpNombre, setNuevoOpNombre] = useState('');
  const [nuevoOpCodigo, setNuevoOpCodigo] = useState('');
  const [nuevoOpProcedencia, setNuevoOpProcedencia] = useState('');

  useEffect(() => {
    if (initialized) {
      cargarDatos();
    }
  }, [initialized, activeTab]);

  const cargarDatos = async () => {
    if (activeTab === 'GLOBAL') {
      const p = await dbService.getConfiguracion('PESO_BOLSA');
      const t = await dbService.getConfiguracion('TARIFA_BASE');
      if (p) setPesoBolsa(p);
      if (t) setTarifaBase(t);
    } else if (activeTab === 'PRODUCTORES') {
      const list = await dbService.getProductores();
      setProductores(list);
    } else if (activeTab === 'TRABAJADORES') {
      const listProd = await dbService.getProductores();
      setProductores(listProd);
      const listOp = await dbService.getOperarios();
      setOperarios(listOp);
    }
  };

  const guardarConfiguracion = async () => {
    await dbService.setConfiguracion('PESO_BOLSA', pesoBolsa);
    await dbService.setConfiguracion('TARIFA_BASE', tarifaBase);
    if (saveWebStore) await saveWebStore();
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const agregarProductor = async () => {
    if (!nuevoProdNombre || !nuevoProdCodigo) return;
    await dbService.addProductor({ Nombre: nuevoProdNombre, Codigo: nuevoProdCodigo });
    if (saveWebStore) await saveWebStore();
    setNuevoProdNombre('');
    setNuevoProdCodigo('');
    cargarDatos();
  };

  const eliminarProductor = async (id: number) => {
    if (confirm('¿Eliminar este productor?')) {
      await dbService.deleteProductor(id);
      if (saveWebStore) await saveWebStore();
      cargarDatos();
    }
  };

  const agregarOperario = async () => {
    if (!nuevoOpNombre || !nuevoOpCodigo || !nuevoOpProcedencia) return;
    await dbService.addOperario({ Nombre: nuevoOpNombre, CodigoInterno: nuevoOpCodigo, Procedencia: nuevoOpProcedencia });
    if (saveWebStore) await saveWebStore();
    setNuevoOpNombre('');
    setNuevoOpCodigo('');
    setNuevoOpProcedencia('');
    cargarDatos();
  };

  const eliminarOperario = async (id: number) => {
    if (confirm('¿Eliminar este trabajador?')) {
      await dbService.deleteOperario(id);
      if (saveWebStore) await saveWebStore();
      cargarDatos();
    }
  };

  return (
    <div className="bg-[#0f172a] text-white font-sans h-full flex flex-col">
      <div className="bg-[#1e293b]/90 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto p-4 flex flex-col gap-4">
          <h1 className="text-2xl font-black text-white">Configuración del Sistema</h1>
          
          <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-700/50 overflow-x-auto hide-scrollbar">
            <button onClick={() => setActiveTab('GLOBAL')} className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'GLOBAL' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>General</button>
            <button onClick={() => setActiveTab('PRODUCTORES')} className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'PRODUCTORES' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Productores / Fincas</button>
            <button onClick={() => setActiveTab('TRABAJADORES')} className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all ${activeTab === 'TRABAJADORES' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Trabajadores</button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#0f172a]">
        <div className="max-w-4xl mx-auto p-4 md:p-6 pb-20">
          
          {/* TAB: GLOBAL */}
          {activeTab === 'GLOBAL' && (
            <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-xl font-bold mb-4 text-indigo-400">Parámetros Globales</h2>
              
              <div className="flex flex-col gap-4 max-w-sm">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Peso Base por Bolsa (kg)</label>
                  <input type="number" value={pesoBolsa} onChange={e => setPesoBolsa(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase">Tarifa Base por Bolsa (C$)</label>
                  <input type="number" value={tarifaBase} onChange={e => setTarifaBase(e.target.value)} className="w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:border-indigo-500 outline-none" />
                </div>
                
                <button onClick={guardarConfiguracion} className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg p-3 flex justify-center items-center gap-2 transition-colors">
                  <IonIcon icon={save} /> Guardar Cambios
                </button>
                {saveSuccess && <p className="text-green-400 font-bold text-sm text-center">¡Guardado con éxito!</p>}
              </div>
            </div>
          )}

          {/* TAB: PRODUCTORES */}
          {activeTab === 'PRODUCTORES' && (
            <div className="flex flex-col gap-6">
              <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4 text-indigo-400">Agregar Productor / Finca</h2>
                <div className="flex flex-col md:flex-row gap-4">
                  <input type="text" placeholder="Nombre Finca/Productor (Ej. El Carmen)" value={nuevoProdNombre} onChange={e => setNuevoProdNombre(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none" />
                  <input type="text" placeholder="Código (Ej. CAR-1)" value={nuevoProdCodigo} onChange={e => setNuevoProdCodigo(e.target.value)} className="w-full md:w-48 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none" />
                  <button onClick={agregarProductor} disabled={!nuevoProdNombre || !nuevoProdCodigo} className="bg-green-600 disabled:opacity-50 text-white font-bold rounded-lg p-3 px-6 flex justify-center items-center gap-2">
                    <IonIcon icon={add} /> Agregar
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/40 border border-slate-700 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/80 text-slate-400">
                    <tr>
                      <th className="p-4">NOMBRE FINCA / PRODUCTOR</th>
                      <th className="p-4">CÓDIGO INTERNO</th>
                      <th className="p-4 text-right">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {productores.map(p => (
                      <tr key={p.Id} className="hover:bg-slate-700/20">
                        <td className="p-4 font-bold text-white">{p.Nombre}</td>
                        <td className="p-4 text-indigo-300 font-mono">{p.Codigo}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => p.Id && eliminarProductor(p.Id)} className="text-red-400 hover:bg-red-500/20 p-2 rounded-lg transition-colors">
                            <IonIcon icon={trash} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {productores.length === 0 && (
                      <tr><td colSpan={3} className="p-6 text-center text-slate-500">No hay productores registrados.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: TRABAJADORES */}
          {activeTab === 'TRABAJADORES' && (
            <div className="flex flex-col gap-6">
              <div className="bg-slate-800/40 border border-slate-700 rounded-2xl p-6">
                <h2 className="text-xl font-bold mb-4 text-indigo-400">Agregar Trabajador</h2>
                <div className="flex flex-col md:flex-row gap-4">
                  <input type="text" placeholder="Nombre Completo" value={nuevoOpNombre} onChange={e => setNuevoOpNombre(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none" />
                  <input type="text" placeholder="Código (Ej. S1)" value={nuevoOpCodigo} onChange={e => setNuevoOpCodigo(e.target.value)} className="w-full md:w-32 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none" />
                  
                  <input 
                    type="text" 
                    placeholder="Lugar de procedencia (Ej. San Jorge)" 
                    value={nuevoOpProcedencia} 
                    onChange={e => setNuevoOpProcedencia(e.target.value)} 
                    className="w-full md:w-64 bg-slate-900 border border-slate-700 rounded-lg p-3 text-white outline-none" 
                  />

                  <button onClick={agregarOperario} disabled={!nuevoOpNombre || !nuevoOpCodigo || !nuevoOpProcedencia} className="bg-green-600 disabled:opacity-50 text-white font-bold rounded-lg p-3 px-6 flex justify-center items-center gap-2">
                    <IonIcon icon={add} /> Agregar
                  </button>
                </div>
              </div>

              <div className="bg-slate-800/40 border border-slate-700 rounded-2xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-900/80 text-slate-400">
                    <tr>
                      <th className="p-4">CÓDIGO</th>
                      <th className="p-4">NOMBRE TRABAJADOR</th>
                      <th className="p-4">LUGAR PROCEDENCIA</th>
                      <th className="p-4 text-right">ACCIONES</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {operarios.map(op => (
                      <tr key={op.Id} className="hover:bg-slate-700/20">
                        <td className="p-4 text-indigo-300 font-mono font-bold">{op.CodigoInterno}</td>
                        <td className="p-4 font-bold text-white">{op.Nombre}</td>
                        <td className="p-4 text-slate-300">{op.Procedencia}</td>
                        <td className="p-4 text-right">
                          <button onClick={() => op.Id && eliminarOperario(op.Id)} className="text-red-400 hover:bg-red-500/20 p-2 rounded-lg transition-colors">
                            <IonIcon icon={trash} />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {operarios.length === 0 && (
                      <tr><td colSpan={4} className="p-6 text-center text-slate-500">No hay trabajadores registrados.</td></tr>
                    )}
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
