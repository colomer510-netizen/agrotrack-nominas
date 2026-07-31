import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useSQLiteDB } from '../../../core/database/useSQLiteDB';
import { DatabaseService, Operario, TotalesOperario } from '../../../core/database/DatabaseService';

const TARIFA_BASE_CORDOBAS = 15.00;
const PESO_BOLSA_BASE = 23.0;

type TipoIngreso = 'KILOS' | 'BOLSAS';

export const PesajeScreen: React.FC = () => {
  const history = useHistory();
  const { db, initialized } = useSQLiteDB();
  const dbService = useMemo(() => new DatabaseService(db), [db]);

  const [codigoInput, setCodigoInput] = useState<string>('');
  const [operarioActivo, setOperarioActivo] = useState<Operario | null>(null);
  const [totalesAcumulados, setTotalesAcumulados] = useState<TotalesOperario>({ BolsasBase: 0, KilosExcedentes: 0, TotalGanado: 0 });
  const [errorBusqueda, setErrorBusqueda] = useState<string>('');

  const [tipoIngreso, setTipoIngreso] = useState<TipoIngreso>('KILOS');
  const [valorInput, setValorInput] = useState<string>('');
  const [mensajeExito, setMensajeExito] = useState<boolean>(false);

  // Intentar autocompletar o buscar cuando el código cambie (para escáner de código de barras)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (codigoInput.length >= 3) {
        buscarOperario(codigoInput);
      } else {
        setOperarioActivo(null);
        setErrorBusqueda('');
      }
    }, 500); // Debounce de 500ms
    return () => clearTimeout(timer);
  }, [codigoInput]);

  const buscarOperario = async (codigo: string) => {
    if (!initialized || !db) {
      if (codigo.toUpperCase() === 'OP-001') {
        const mockOperario = { Id: 1, Codigo: 'OP-001', Nombre: 'Carlos Martínez', Productor: 'Finca San José' };
        setOperarioActivo(mockOperario);
        setTotalesAcumulados({ BolsasBase: 0, KilosExcedentes: 0, TotalGanado: 0 });
        setErrorBusqueda('');
      } else {
        setOperarioActivo(null);
      }
      return;
    }

    const operario = await dbService.getOperarioByCodigo(codigo.toUpperCase());
    if (operario) {
      setOperarioActivo(operario);
      const totales = await dbService.getTotalesDiaOperario(operario.Id);
      setTotalesAcumulados(totales);
      setErrorBusqueda('');
    } else {
      setOperarioActivo(null);
      setErrorBusqueda('Código no encontrado');
    }
  };

  const handleKeypadPress = (val: string) => {
    if (val === 'C') {
      setValorInput('');
    } else if (val === '<') {
      setValorInput(prev => prev.slice(0, -1));
    } else if (val === '.') {
      if (!valorInput.includes('.')) setValorInput(prev => prev + val);
    } else {
      if (valorInput.length < 6) setValorInput(prev => prev + val);
    }
  };

  const guardarPesaje = async () => {
    const valorNumerico = parseFloat(valorInput) || 0;
    if (valorNumerico <= 0 || !operarioActivo) return;

    try {
      const idLote = 101; 
      // Si ingresan bolsas, calculamos los kilos equivalentes para guardarlo homogeneizado
      const pesoFinal = tipoIngreso === 'BOLSAS' ? (valorNumerico * PESO_BOLSA_BASE) : valorNumerico;

      if (initialized && db) {
        await dbService.guardarRegistroBolsa(pesoFinal, operarioActivo.Id, idLote);
        const totalesActualizados = await dbService.getTotalesDiaOperario(operarioActivo.Id);
        setTotalesAcumulados(totalesActualizados);
      } else {
        setTotalesAcumulados(prev => ({
          BolsasBase: prev.BolsasBase + Math.floor(pesoFinal / PESO_BOLSA_BASE),
          KilosExcedentes: prev.KilosExcedentes + (pesoFinal % PESO_BOLSA_BASE),
          TotalGanado: prev.TotalGanado + ((pesoFinal / PESO_BOLSA_BASE) * TARIFA_BASE_CORDOBAS)
        }));
      }

      setValorInput('');
      setMensajeExito(true);
      setTimeout(() => setMensajeExito(false), 2000);
      
    } catch (err) {
      console.error("Error guardando transacción:", err);
      alert("Hubo un error al guardar.");
    }
  };

  const keypadButtons = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', '<'];

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans overflow-hidden relative">
      
      {mensajeExito && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-full shadow-[0_10px_30px_rgba(34,197,94,0.5)] font-bold text-lg flex items-center gap-2">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
           Registro Guardado
        </div>
      )}

      {/* Cabecera y Selección Rápida de Operario */}
      <div className="p-4 border-b border-gray-800 bg-gray-950 flex flex-col gap-4 shrink-0">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-widest text-blue-400">ESTACIÓN DE PESAJE</h1>
          <button onClick={() => history.push('/historial')} className="bg-gray-800 p-2 text-sm rounded-lg text-gray-300 hover:text-white flex items-center gap-2 border border-gray-700">
             Historial <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
          </button>
        </div>

        <div className="relative">
          <input 
            type="text"
            placeholder="ESCANEAR O INGRESAR CÓDIGO (Ej: OP-001)"
            value={codigoInput}
            onChange={(e) => setCodigoInput(e.target.value)}
            className={`w-full bg-gray-900 border ${operarioActivo ? 'border-green-500' : 'border-gray-600'} rounded-xl px-4 py-3 text-lg font-bold text-white uppercase focus:ring-2 focus:ring-blue-500 outline-none`}
          />
          {operarioActivo && (
             <div className="absolute right-3 top-3 text-green-400">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
             </div>
          )}
        </div>

        {/* Información del Operario si se encuentra */}
        {operarioActivo ? (
           <div className="flex justify-between items-center bg-gray-900 p-3 rounded-xl border border-gray-800">
             <div>
               <p className="font-bold text-blue-300">{operarioActivo.Nombre}</p>
               <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">Hoy: {totalesAcumulados.BolsasBase} Bolsas (+{totalesAcumulados.KilosExcedentes.toFixed(1)}kg)</p>
             </div>
             <div className="text-right">
               <p className="text-[10px] text-gray-500 uppercase tracking-widest">Acumulado</p>
               <p className="font-mono font-bold text-lg text-green-400">C$ {totalesAcumulados.TotalGanado.toFixed(2)}</p>
             </div>
          </div>
        ) : (
          errorBusqueda && <p className="text-red-400 text-xs font-bold">{errorBusqueda}</p>
        )}
      </div>

      {/* Pantalla de Display Principal (Kilos o Bolsas) */}
      <div className={`flex-1 flex flex-col items-center justify-center p-6 ${!operarioActivo ? 'opacity-30 pointer-events-none' : ''}`}>
        
        {/* Toggle Kilos vs Bolsas */}
        <div className="bg-gray-800 p-1 flex rounded-full mb-6 w-full max-w-sm border border-gray-700">
          <button 
            onClick={() => setTipoIngreso('KILOS')} 
            className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${tipoIngreso === 'KILOS' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400'}`}
          >
            MODO KILOS
          </button>
          <button 
            onClick={() => setTipoIngreso('BOLSAS')} 
            className={`flex-1 py-2 rounded-full text-sm font-bold transition-all ${tipoIngreso === 'BOLSAS' ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-400'}`}
          >
            MODO BOLSAS
          </button>
        </div>

        <div className="bg-gray-800 w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center border border-gray-700 relative overflow-hidden ring-4 ring-gray-800/50">
           <div className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ease-out ${tipoIngreso === 'KILOS' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`} 
                style={{ height: tipoIngreso === 'KILOS' ? `${Math.min(100, ((parseFloat(valorInput)||0) / PESO_BOLSA_BASE) * 100)}%` : '20%' }}>
           </div>
           <div className="relative z-10 flex items-baseline justify-center gap-2">
             <span className={`text-7xl font-mono font-bold tracking-tighter ${!valorInput ? 'text-gray-600' : 'text-white'}`}>
               {valorInput || '0'}
             </span>
             <span className={`text-2xl font-bold ml-1 ${tipoIngreso === 'KILOS' ? 'text-blue-400' : 'text-purple-400'}`}>
               {tipoIngreso === 'KILOS' ? 'kg' : 'bolsas'}
             </span>
           </div>
        </div>
      </div>

      {/* Teclado Numérico */}
      <div className={`bg-gray-950 p-5 shrink-0 pb-8 rounded-t-[2.5rem] border-t border-gray-800 shadow-[0_-10px_50px_rgba(0,0,0,0.5)] ${!operarioActivo ? 'opacity-30 pointer-events-none' : ''}`}>
        <div className="max-w-sm mx-auto">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {keypadButtons.map((btn) => (
              <button key={btn} onClick={() => handleKeypadPress(btn)} className="bg-gray-800 hover:bg-gray-700 active:scale-95 text-3xl font-bold rounded-2xl h-16 transition-all flex items-center justify-center text-gray-200">
                {btn === '<' ? <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2M3 12l6.414 6.414a2 2 0 001.414.586H19a2 2 0 002-2V7a2 2 0 00-2-2h-8.172a2 2 0 00-1.414.586L3 12z"></path></svg> : btn}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={() => handleKeypadPress('C')} className="bg-gray-800 text-red-400 font-bold rounded-2xl h-16 w-1/4 transition-all active:scale-95 uppercase text-sm border border-red-500/20">
              Borrar
            </button>
            <button onClick={guardarPesaje} disabled={!valorInput} className={`flex-1 rounded-2xl font-bold text-lg transition-all flex items-center justify-center uppercase border ${valorInput ? 'bg-green-600 text-white shadow-[0_0_20px_rgba(22,163,74,0.3)] border-green-500 active:scale-95' : 'bg-gray-800 text-gray-600 border-gray-700'}`}>
              Registrar {tipoIngreso === 'KILOS' ? 'Pesaje' : 'Bolsas'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
