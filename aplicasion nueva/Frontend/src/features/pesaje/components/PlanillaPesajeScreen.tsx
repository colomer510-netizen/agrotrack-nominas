import React, { useState, useEffect, useMemo } from 'react';
import { 
  IonIcon,
  IonSelect,
  IonSelectOption
} from '@ionic/react';
import { search, filter, backspaceOutline, saveOutline, closeOutline } from 'ionicons/icons';
import { useSQLiteDB } from '../../../core/database/useSQLiteDB';
import { DatabaseService, Operario, Productor } from '../../../core/database/DatabaseService';

type TipoProceso = 'Platano_Cascara' | 'Platano_Pelado' | 'Conteo_Unidades';

interface FilaOperario extends Operario {
  bolsas: number;
}

export const PlanillaPesajeScreen: React.FC = () => {
  const { db, initialized, saveWebStore } = useSQLiteDB();
  const dbService = useMemo(() => new DatabaseService(db), [db]);

  const [tipoProceso, setTipoProceso] = useState<TipoProceso>('Platano_Pelado');
  const [productorActivo, setProductorActivo] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const [productores, setProductores] = useState<Productor[]>([]);
  const [operarios, setOperarios] = useState<FilaOperario[]>([]);

  // Estados del Teclado
  const [operarioActivo, setOperarioActivo] = useState<FilaOperario | null>(null);
  const [valorIngresado, setValorIngresado] = useState('0');

  useEffect(() => {
    if (initialized) {
      cargarFincas();
      cargarOperarios();
    }
  }, [initialized]);

  const cargarFincas = async () => {
    const list = await dbService.getProductores();
    setProductores(list);
    if (list.length > 0 && !productorActivo) {
      setProductorActivo(list[0].Codigo);
    }
  };

  const cargarOperarios = async () => {
    const ops = await dbService.getOperarios();
    // Reiniciamos contadores visuales a 0 (solo para el badge de la UI)
    const filas: FilaOperario[] = ops.map(op => ({
      ...op,
      bolsas: 0
    }));
    setOperarios(filas);
  };

  const operariosFiltrados = operarios.filter(op => 
    (op.Nombre.toLowerCase().includes(searchTerm.toLowerCase()) || op.CodigoInterno.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Funciones del Teclado
  const handleKeypadPress = (val: string) => {
    if (valorIngresado === '0' && val !== '.') {
      setValorIngresado(val);
    } else {
      // Evitar multiples puntos
      if (val === '.' && valorIngresado.includes('.')) return;
      setValorIngresado(prev => prev + val);
    }
  };

  const handleDelete = () => {
    if (valorIngresado.length === 1) {
      setValorIngresado('0');
    } else {
      setValorIngresado(prev => prev.slice(0, -1));
    }
  };

  const guardarRegistro = async () => {
    if (!operarioActivo) return;
    
    const pesoOUnidades = parseFloat(valorIngresado);
    if (isNaN(pesoOUnidades) || pesoOUnidades <= 0) {
      alert("Por favor ingrese un valor mayor a 0.");
      return;
    }
    
    const productorData = productores.find(p => p.Codigo === productorActivo);
    if (!productorData?.Id) {
      alert("Por favor selecciona una finca/productor antes de pesar.");
      return;
    }

    try {
      if (tipoProceso === 'Conteo_Unidades') {
        // En unidades, el valor va a conteoBolsas, y el peso a 0
        await dbService.guardarRegistroBolsa(0, pesoOUnidades, tipoProceso, operarioActivo.Id!, productorData.Id);
      } else {
        // En kilos, el valor va a peso, y bolsas se calculan
        await dbService.guardarRegistroBolsa(pesoOUnidades, 0, tipoProceso, operarioActivo.Id!, productorData.Id);
      }
      if (saveWebStore) await saveWebStore();

      // Actualizar visualmente la UI (bolsas totales)
      setOperarios(prev => prev.map(op => {
        if (op.Id === operarioActivo.Id) {
          return { ...op, bolsas: op.bolsas + 1 };
        }
        return op;
      }));

      // Cerrar teclado y resetear
      setOperarioActivo(null);
      setValorIngresado('0');
    } catch (e) {
      alert("Error al guardar el registro.");
    }
  };

  return (
    <div className="bg-[#0f172a] text-white font-sans h-full flex flex-col">
      
      {/* HEADER DE CONTROL (FIJO) */}
      <div className="bg-[#1e293b]/90 backdrop-blur-xl border-b border-white/10 z-40 shadow-2xl flex-shrink-0">
        <div className="max-w-5xl mx-auto p-4 flex flex-col gap-4">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
                Línea de Pesaje
              </h1>
            </div>
            
            <div className="w-full md:w-auto relative">
              <div className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-1 flex items-center gap-3">
                <IonIcon icon={filter} className="text-blue-400 text-xl" />
                <IonSelect 
                  value={productorActivo} 
                  onIonChange={e => setProductorActivo(e.detail.value)}
                  placeholder="Finca Productor..."
                  className="bg-transparent text-white font-bold min-w-[150px] outline-none"
                >
                  {productores.map(p => (
                    <IonSelectOption key={p.Id} value={p.Codigo}>{p.Codigo} - {p.Nombre}</IonSelectOption>
                  ))}
                </IonSelect>
              </div>
            </div>
          </div>

          {/* Buscador y Segmentos */}
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full md:flex-1">
              <IonIcon icon={search} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <input 
                type="text" 
                placeholder="Buscar operario o código..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500 transition-all placeholder-slate-500"
              />
            </div>

            <div className="flex bg-slate-900 p-1.5 rounded-xl border border-slate-700 w-full md:w-auto">
              <button 
                onClick={() => setTipoProceso('Platano_Cascara')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${tipoProceso === 'Platano_Cascara' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' : 'text-slate-400 hover:text-white'}`}
              >
                Cáscara
              </button>
              <button 
                onClick={() => setTipoProceso('Platano_Pelado')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${tipoProceso === 'Platano_Pelado' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30' : 'text-slate-400 hover:text-white'}`}
              >
                Pelado
              </button>
              <button 
                onClick={() => setTipoProceso('Conteo_Unidades')}
                className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-sm font-bold transition-all ${tipoProceso === 'Conteo_Unidades' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/30' : 'text-slate-400 hover:text-white'}`}
              >
                Conteo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL: LISTA DE OPERARIOS */}
      <div className="flex-1 overflow-y-auto bg-[#0f172a]">
        <div className={`max-w-5xl mx-auto p-4 transition-all duration-300 ${operarioActivo ? 'pb-[400px]' : 'pb-20'}`}>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {operariosFiltrados.map((op, index) => (
              <div 
                key={op.Id} 
                onClick={() => { setOperarioActivo(op); setValorIngresado('0'); }}
                className={`cursor-pointer rounded-2xl p-4 transition-all duration-200 flex flex-col gap-3 shadow-xl ${
                  operarioActivo?.Id === op.Id 
                    ? 'bg-blue-600 border-blue-400 shadow-blue-500/30 scale-105 z-10' 
                    : 'bg-slate-800/80 border-slate-700 hover:border-slate-500 hover:bg-slate-700/80'
                } border`}
                style={{ animationDelay: `${index * 30}ms`, animation: 'fadeIn 0.3s ease-out forwards' }}
              >
                <div className="flex justify-between items-start">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-black text-sm shadow-inner ${operarioActivo?.Id === op.Id ? 'bg-white text-blue-600' : 'bg-slate-900 text-slate-300'}`}>
                    {op.CodigoInterno}
                  </div>
                  {op.bolsas > 0 && (
                    <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full animate-bounce">
                      +{op.bolsas}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className={`font-bold text-lg leading-tight truncate ${operarioActivo?.Id === op.Id ? 'text-white' : 'text-slate-200'}`}>
                    {op.Nombre}
                  </h3>
                  <p className={`text-xs font-medium uppercase tracking-wider mt-1 truncate ${operarioActivo?.Id === op.Id ? 'text-blue-200' : 'text-slate-500'}`}>
                    {op.Procedencia}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {operariosFiltrados.length === 0 && (
            <div className="text-center py-20">
              <h3 className="text-xl font-bold text-slate-400">Cargando operarios...</h3>
            </div>
          )}
        </div>
      </div>

      {/* TECLADO VIRTUAL (BOTTOM SHEET) */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out transform ${operarioActivo ? 'translate-y-0' : 'translate-y-full'}`}>
        
        {/* Capa para cerrar al tocar fuera (opcional) */}
        {operarioActivo && (
          <div className="fixed inset-0 bg-black/40 -z-10 backdrop-blur-sm" onClick={() => setOperarioActivo(null)}></div>
        )}

        <div className="bg-[#1e293b] border-t border-slate-700 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)] p-4 md:p-6 max-w-3xl mx-auto">
          
          {/* Cabecera del Teclado */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white font-black text-xl shadow-lg">
                {operarioActivo?.CodigoInterno}
              </div>
              <div>
                <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Registrando para</p>
                <h3 className="text-white text-xl font-black">{operarioActivo?.Nombre}</h3>
              </div>
            </div>
            <button onClick={() => setOperarioActivo(null)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">
              <IonIcon icon={closeOutline} className="text-2xl" />
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            
            {/* Pantalla del Teclado */}
            <div className="md:w-1/3 flex flex-col justify-between gap-4">
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center shadow-inner relative overflow-hidden">
                <div className="absolute top-2 left-3">
                  <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">
                    {tipoProceso === 'Conteo_Unidades' ? 'UNIDADES' : 'PESO KILOS'}
                  </span>
                </div>
                <span className="text-5xl font-black text-white font-mono mt-4 truncate w-full text-center">
                  {valorIngresado}
                </span>
              </div>
              
              <button 
                onClick={guardarRegistro}
                className="w-full bg-green-500 hover:bg-green-400 active:bg-green-600 text-white font-black text-xl py-6 rounded-2xl shadow-lg shadow-green-500/20 transition-all flex items-center justify-center gap-3"
              >
                <IonIcon icon={saveOutline} className="text-3xl" />
                GUARDAR
              </button>
            </div>

            {/* Botones Numéricos */}
            <div className="md:w-2/3 grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((num) => (
                <button
                  key={num}
                  onClick={() => handleKeypadPress(num)}
                  className="bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700 text-white font-black text-3xl py-4 md:py-6 rounded-2xl shadow transition-colors touch-manipulation"
                >
                  {num}
                </button>
              ))}
              <button
                onClick={handleDelete}
                className="bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30 border border-red-500/30 text-red-400 font-black text-3xl py-4 md:py-6 rounded-2xl flex items-center justify-center shadow transition-colors touch-manipulation"
              >
                <IonIcon icon={backspaceOutline} />
              </button>
            </div>

          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};
