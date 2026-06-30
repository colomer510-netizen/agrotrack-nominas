import React, { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { Download, RefreshCw, TrendingUp } from 'lucide-react'

export const ProductivityDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>({ totalKgs: 0, operarioStats: [] })
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    setLoading(true)
    const data = await (window as any).api?.getDashboardStats?.()
    if (data) setStats(data)
    setLoading(false)
  }

  useEffect(() => {
    loadStats()
  }, [])

  const handleExport = async () => {
    const res = await (window as any).api?.exportPayroll?.()
    if (res?.success) {
      alert(`Nómina guardada exitosamente en:\n${res.filePath}`)
    } else {
      alert(`Error al exportar: ${res?.error}`)
    }
  }

  const chartData = stats.operarioStats.map((op: any) => ({
    name: op.id_operario,
    Kilos: op.totalKgs,
    Pago: op.totalMonto
  }))

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white tracking-wide flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-teal-400" />
            <span>Dashboard de Productividad</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Rendimiento en tiempo real y nómina</p>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={loadStats}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors border border-slate-600"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-emerald-900/50"
          >
            <Download className="w-4 h-4" />
            Exportar Nómina CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest block mb-2">
            Producción Total Hoy
          </span>
          <span className="text-6xl font-black text-white">
            {stats.totalKgs.toFixed(2)} <span className="text-2xl text-slate-400">KG</span>
          </span>
        </div>
        
        <div className="col-span-1 md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <span className="text-sm font-bold text-slate-500 uppercase tracking-widest block mb-6">
            Kilos por Operario
          </span>
          <div className="h-64">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip 
                    cursor={{fill: '#1e293b'}} 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc' }}
                  />
                  <Bar dataKey="Kilos" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                No hay datos de pesaje para hoy.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
