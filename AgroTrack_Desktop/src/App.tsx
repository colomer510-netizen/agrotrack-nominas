import { useState } from 'react'
import { WeighingStationHybrid } from './components/destajo/WeighingStationHybrid'
import { QuotaDashboard } from './components/acopio/QuotaDashboard'
import { HydroCoolingReefer } from './components/empaque/HydroCoolingReefer'
import { LedgerViewer } from './components/trazabilidad/LedgerViewer'
import { ProductivityDashboard } from './components/dashboard/ProductivityDashboard'

export default function App() {
  const [activeTab, setActiveTab] = useState<'destajo' | 'acopio' | 'empaque' | 'ledger' | 'dashboard'>('destajo')

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Sidebar Gerencial */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 pb-6 border-b border-slate-800">
            <span className="text-3xl">🍌</span>
            <div>
              <span className="text-lg font-black tracking-wider text-white block">AGROTRACK</span>
              <span className="text-xs text-emerald-400 font-bold uppercase tracking-widest">Desktop Edge</span>
            </div>
          </div>

          <nav className="mt-8 space-y-2">
            <button
              onClick={() => setActiveTab('destajo')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${activeTab === 'destajo' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <span>⚖️</span>
              <span>Pesaje Híbrido</span>
            </button>

            <button
              onClick={() => setActiveTab('acopio')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${activeTab === 'acopio' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <span>📊</span>
              <span>Cuotas & Balanceo</span>
            </button>

            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${activeTab === 'dashboard' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <span>📈</span>
              <span>Productividad</span>
            </button>

            <button
              onClick={() => setActiveTab('empaque')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${activeTab === 'empaque' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <span>🌊</span>
              <span>Hydro-Cooling / Reefer</span>
            </button>

            <button
              onClick={() => setActiveTab('ledger')}
              className={`w-full text-left px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-3 ${activeTab === 'ledger' ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/30' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
            >
              <span>🔒</span>
              <span>Ledger FSMA 204</span>
            </button>
          </nav>
        </div>

        <div className="pt-6 border-t border-slate-800 text-xs text-slate-500">
          <div className="flex items-center gap-2 mb-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-400">Modo Edge Computing</span>
          </div>
          <p>Planta Exportadora v1.0.0</p>
          <p className="mt-1 text-slate-600">Base de Datos SQLite Limpia</p>
        </div>
      </aside>

      {/* Contenido Principal */}
      <main className="flex-1 overflow-y-auto bg-slate-950">
        {activeTab === 'destajo' && <WeighingStationHybrid />}
        {activeTab === 'acopio' && <QuotaDashboard />}
        {activeTab === 'dashboard' && <ProductivityDashboard />}
        {activeTab === 'empaque' && <HydroCoolingReefer />}
        {activeTab === 'ledger' && <LedgerViewer />}
      </main>
    </div>
  )
}
