import React, { useState, useEffect } from 'react'

export const LedgerViewer: React.FC = () => {
  const [ledger, setLedger] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  const loadLedger = async () => {
    setLoading(true)
    const data = await (window as any).api?.getLedger?.() || []
    setLedger(data)
    setLoading(false)
  }

  useEffect(() => {
    loadLedger()
  }, [])

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-white">🔒 Libro Mayor Inmutable (Ledger FSMA 204)</h1>
          <p className="text-slate-400 text-sm mt-1">Registros Append-Only con sellado criptográfico SHA-256 (Sin UPDATE ni DELETE)</p>
        </div>
        <button 
          onClick={loadLedger}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700"
        >
          🔄 Auditar Ledger
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-950 text-slate-400 text-xs uppercase font-bold border-b border-slate-800">
                <th className="p-4">Timestamp</th>
                <th className="p-4">TLC Lote</th>
                <th className="p-4">Tipo Evento (CTE)</th>
                <th className="p-4">Payload (KDE)</th>
                <th className="p-4">Hash Actual (SHA-256)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">Cargando cadena criptográfica...</td>
                </tr>
              ) : ledger.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    No hay transacciones registradas aún en esta base de datos limpia.
                  </td>
                </tr>
              ) : (
                ledger.map((row: any) => (
                  <tr key={row.id_evento} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 text-slate-400">{new Date(row.timestamp).toLocaleTimeString()}</td>
                    <td className="p-4 font-bold text-emerald-400">{row.tlc}</td>
                    <td className="p-4 font-semibold text-cyan-300">{row.cte_type}</td>
                    <td className="p-4 text-slate-300 max-w-xs truncate">{row.kde_payload}</td>
                    <td className="p-4 text-slate-500 max-w-xs truncate" title={row.hash_actual}>{row.hash_actual}</td>
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
