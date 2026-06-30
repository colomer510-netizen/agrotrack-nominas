import React, { useState } from 'react'

export const HydroCoolingReefer: React.FC = () => {
  const [waterTemp, setWaterTemp] = useState<number>(3.5) // Celsius
  const [phLevel, setPhLevel] = useState<number>(5.2) // Ácido cítrico/ascórbico
  const [immersionMinutes, setImmersionMinutes] = useState<number>(25)
  const [reeferTemp, setReeferTemp] = useState<number>(7.0) // Furgón refrigerado
  const [tlcLot, setTlcLot] = useState<string>('TLC-2026-EXPORT-001')
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  const handleRegisterEvent = async () => {
    if (waterTemp > 8.0) {
      alert('⚠️ ALERTA FSMA: La temperatura del agua de Hydro-cooling supera el máximo permitido (8.0°C).')
      return
    }

    setStatusMsg(`✅ Evento Crítico FSMA registrado en Ledger: Lote ${tlcLot} enfriado en agua a ${waterTemp}°C (pH ${phLevel}) y transferido exitosamente al furgón refrigerado a ${reeferTemp}°C.`)
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white">🌊 Control de Hydro-Cooling y Furgón Refrigerado</h1>
          <p className="text-slate-400 text-sm mt-1">Inmersión en pilas de agua helada y embarque en contenedores Reefer (FSMA 204)</p>
        </div>
        <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 rounded-full text-xs font-bold border border-cyan-500/30">Cadena de Frío Activa</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pilas de Agua (Hydro-cooling) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-bold text-cyan-400 flex items-center gap-2">
            <span>🧊 Parámetros de Pila de Agua Helada</span>
          </h2>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Temperatura del Agua (°C)</label>
            <input 
              type="number" step="0.1"
              value={waterTemp}
              onChange={e => setWaterTemp(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-bold text-lg text-center"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nivel de pH (Acidez cítrica/ascórbica)</label>
            <input 
              type="number" step="0.1"
              value={phLevel}
              onChange={e => setPhLevel(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-bold text-center"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Tiempo de Inmersión (Minutos)</label>
            <input 
              type="number"
              value={immersionMinutes}
              onChange={e => setImmersionMinutes(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-bold text-center"
            />
          </div>
        </div>

        {/* Furgón Refrigerado (Reefer) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-teal-400 flex items-center gap-2">
              <span>🚛 Furgón Exportación (Aire Acondicionado)</span>
            </h2>
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Lote Trazabilidad (TLC)</label>
              <input 
                type="text"
                value={tlcLot}
                onChange={e => setTlcLot(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-emerald-400 font-mono font-bold"
              />
            </div>
            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Set-point Temperatura Furgón (°C)</label>
              <input 
                type="number" step="0.1"
                value={reeferTemp}
                onChange={e => setReeferTemp(parseFloat(e.target.value) || 0)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-bold text-lg text-center"
              />
            </div>
          </div>

          <button
            onClick={handleRegisterEvent}
            className="w-full py-4 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-black uppercase tracking-wider rounded-xl shadow-lg transition-all"
          >
            Sellar Evento de Embarque Reefer
          </button>
        </div>
      </div>

      {statusMsg && (
        <div className="p-5 rounded-xl bg-slate-900 border border-cyan-500/40 text-cyan-300 font-bold text-center">
          {statusMsg}
        </div>
      )}
    </div>
  )
}
