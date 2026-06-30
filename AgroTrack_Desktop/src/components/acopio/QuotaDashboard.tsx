import React, { useState, useEffect } from 'react'
import { calcularRacimosRequeridos } from '../../utils/calculations'

export const QuotaDashboard: React.FC = () => {
  const [producers, setProducers] = useState<any[]>([])
  const [quotas, setQuotas] = useState<any[]>([])
  const [newCod, setNewCod] = useState('')
  const [newName, setNewName] = useState('')
  const [newProc, setNewProc] = useState('AGUACATE')
  const [isComodin, setIsComodin] = useState(false)
  const [loading, setLoading] = useState(true)

  // Drag & Drop reallocation simulation
  const [sourceId, setSourceId] = useState<string>('')
  const [targetId, setTargetId] = useState<string>('')
  const [reassignBags, setReassignBags] = useState<number>(10)
  const [msg, setMsg] = useState<string | null>(null)

  // Raw Material Calculator States
  const [pesoMuestraBruto, setPesoMuestraBruto] = useState<number>(1.2)
  const [pesoMuestraNeto, setPesoMuestraNeto] = useState<number>(0.75)
  const [pesoPromedioRacimo, setPesoPromedioRacimo] = useState<number>(22.5)
  const [cuotaRequeridaKilos, setCuotaRequeridaKilos] = useState<number>(1000)

  const loadData = async () => {
    setLoading(true)
    const p = await (window as any).api?.getProducers?.() || []
    const q = await (window as any).api?.getQuotas?.() || []
    setProducers(p)
    setQuotas(q)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAddProducer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCod || !newName) return alert('Completa código y nombre')

    const res = await (window as any).api?.addProducer?.({
      codigo: newCod,
      nombre: newName,
      procedencia: newProc,
      esComodin: isComodin
    })

    if (res?.success) {
      setNewCod('')
      setNewName('')
      setIsComodin(false)
      loadData()
      setMsg(`✅ Productor ${newCod} registrado dinámicamente en la base de datos limpia.`)
    } else {
      alert(`Error al registrar: ${res?.error}`)
    }
  }

  const handleReassign = async () => {
    if (!sourceId || !targetId) return alert('Selecciona productor origen y destino')
    if (sourceId === targetId) return alert('Origen y destino no pueden ser el mismo')

    const res = await (window as any).api?.reassignQuota?.({
      sourceId,
      targetId,
      bolsas: reassignBags
    })

    if (res?.success) {
      setMsg(`🔄 ¡Redistribución exitosa! ${reassignBags} bolsas reasignadas para equilibrar la meta de exportación.`)
      loadData()
    } else {
      alert(`Error: ${res?.error}`)
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Cabecera */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white">📊 Balanceo y Redistribución de Cuotas</h1>
          <p className="text-slate-400 text-sm mt-1">Gestión Dinámica de Bolsas y Cierre de Contenedor (Sin datos quemados)</p>
        </div>
        <button 
          onClick={loadData}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all"
        >
          🔄 Actualizar Datos
        </button>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-sm font-bold text-center">
          {msg}
        </div>
      )}

      {/* Formulario para Agregar Productor a Base de Datos Limpia */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <span>➕ Registrar Nuevo Productor / Lote de Cierre</span>
          <span className="text-xs text-amber-400 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">Base de Datos Limpia</span>
        </h2>
        <form onSubmit={handleAddProducer} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Código (Ej: A 1, S 18)</label>
            <input 
              type="text" 
              placeholder="A 1"
              value={newCod} 
              onChange={e => setNewCod(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white font-mono"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Nombres y Apellidos / Lote</label>
            <input 
              type="text" 
              placeholder="Yolanda Centeno / Norteamérica"
              value={newName} 
              onChange={e => setNewName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Procedencia</label>
            <select 
              value={newProc} 
              onChange={e => setNewProc(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-sm text-white font-semibold"
            >
              <option value="AGUACATE">AGUACATE</option>
              <option value="LA VILLA">LA VILLA</option>
              <option value="PALMAR">PALMAR</option>
              <option value="INGENIO">INGENIO</option>
              <option value="TOLESMAIDA">TOLESMAIDA</option>
              <option value="SANCHEZ 1">SANCHEZ 1</option>
              <option value="SANCHEZ 2">SANCHEZ 2</option>
              <option value="NORTEAMERICA">NORTEAMERICA (Lote Cierre)</option>
            </select>
          </div>
          <div>
            <button 
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/20"
            >
              Guardar Productor
            </button>
          </div>
        </form>
      </div>

      {/* Calculadora de Materia Prima (Muestreo) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-2">🧮 Simulador de Corte (Muestreo de Rendimiento)</h2>
        <p className="text-xs text-slate-400 mb-6">Calcula cuántos racimos enteros enviar a cortar basado en una muestra de calidad.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center bg-slate-950 p-6 rounded-xl border border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Muestra Bruta (kg)</label>
            <input 
              type="number" step="0.01"
              value={pesoMuestraBruto} 
              onChange={e => setPesoMuestraBruto(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white font-mono text-center"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Muestra Neta (kg)</label>
            <input 
              type="number" step="0.01"
              value={pesoMuestraNeto} 
              onChange={e => setPesoMuestraNeto(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-emerald-400 font-mono text-center"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Promedio Racimo (kg)</label>
            <input 
              type="number" step="0.1"
              value={pesoPromedioRacimo} 
              onChange={e => setPesoPromedioRacimo(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-amber-400 font-mono text-center"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Meta a Pelar (kg)</label>
            <input 
              type="number" step="1"
              value={cuotaRequeridaKilos} 
              onChange={e => setCuotaRequeridaKilos(parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white font-mono text-center"
            />
          </div>

          <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 text-center">
            <span className="block text-xs font-bold text-slate-400 uppercase mb-1">Enviar a cortar:</span>
            <span className="text-3xl font-black text-teal-400">
              {(() => {
                try {
                  const res = calcularRacimosRequeridos(pesoMuestraBruto, pesoMuestraNeto, pesoPromedioRacimo, cuotaRequeridaKilos)
                  return isNaN(res) || !isFinite(res) ? '--' : res
                } catch(e) {
                  return 'Error'
                }
              })()}
            </span>
            <span className="block text-[10px] text-slate-500 font-bold uppercase mt-1">Racimos</span>
          </div>
        </div>
      </div>

      {/* Panel Drag & Drop / Redistribución Rápida */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-2">🔀 Panel de Reasignación de Bolsas (Compensación de Cuota)</h2>
        <p className="text-xs text-slate-400 mb-6">Si un productor dejó bolsas pendientes, reasígnalas a otro con más fruta o al cierre de Norteamérica.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-center bg-slate-950 p-6 rounded-xl border border-slate-800">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-red-400 uppercase mb-1">Productor Origen (Quita bolsas)</label>
            <select 
              value={sourceId} 
              onChange={e => setSourceId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white"
            >
              <option value="">Seleccione Origen...</option>
              {quotas.map(q => <option key={q.id_cuota} value={q.id_cuota}>{q.codigo_productor} - {q.nombre_apellidos} ({q.meta_bolsas_programadas} bols)</option>)}
            </select>
          </div>

          <div className="text-center font-black text-slate-600 text-2xl">➔</div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-emerald-400 uppercase mb-1">Productor Destino (Recibe bolsas)</label>
            <select 
              value={targetId} 
              onChange={e => setTargetId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white"
            >
              <option value="">Seleccione Destino...</option>
              {quotas.map(q => <option key={q.id_cuota} value={q.id_cuota}>{q.codigo_productor} - {q.nombre_apellidos} ({q.meta_bolsas_programadas} bols)</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-amber-400 uppercase mb-1">Cant. Bolsas</label>
            <input 
              type="number" 
              value={reassignBags} 
              onChange={e => setReassignBags(parseInt(e.target.value) || 0)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white text-center font-bold"
            />
          </div>

          <div>
            <button 
              onClick={handleReassign}
              className="w-full mt-5 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg"
            >
              ⚖️ Reasignar
            </button>
          </div>
        </div>
      </div>

      {/* Tabla de Productores y Cuotas */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">📋 Lista de Acopio Diaria ({producers.length} Registrados)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-xs uppercase font-bold border-b border-slate-800">
                <th className="p-4">Procedencia</th>
                <th className="p-4">Cod.</th>
                <th className="p-4">Nombres y Apellidos</th>
                <th className="p-4 text-center">Bolsas Prog.</th>
                <th className="p-4 text-center">Kilos Est.</th>
                <th className="p-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                    ⏳ Cargando base de datos limpia...
                  </td>
                </tr>
              ) : producers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                    📭 Base de datos limpia. Utilice el formulario superior para agregar los productores de la exportadora.
                  </td>
                </tr>
              ) : (
                producers.map(p => (
                  <tr key={p.id_productor} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-slate-300">{p.procedencia}</td>
                    <td className="p-4 font-mono text-emerald-400 font-bold">{p.codigo_productor}</td>
                    <td className="p-4 text-white font-medium">{p.nombre_apellidos}</td>
                    <td className="p-4 text-center font-bold text-slate-200">0</td>
                    <td className="p-4 text-center text-slate-400">0.00 kg</td>
                    <td className="p-4 text-center">
                      <span className="px-3 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-semibold">Activo</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
