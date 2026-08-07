import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ConfiguracionScreen from './screens/ConfiguracionScreen';
import PesajeScreen from './screens/PesajeScreen';
import HistorialScreen from './screens/HistorialScreen';
import { Settings, Home, FileText, History } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900 flex flex-col">
        {/* Navbar */}
        <nav className="bg-slate-950 border-b border-slate-800 text-white p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-indigo-500 tracking-wider">AGROTRACK</span>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/" className="flex items-center gap-2 hover:text-indigo-400 transition-colors">
                <Home size={18} /> Inicio
              </Link>
              <Link to="/pesaje" className="flex items-center gap-2 hover:text-indigo-400 transition-colors">
                <FileText size={18} /> Línea de Pesaje
              </Link>
              <Link to="/historial" className="flex items-center gap-2 hover:text-indigo-400 transition-colors">
                <History size={18} /> Contabilidad / Historial
              </Link>
              <Link to="/configuracion" className="flex items-center gap-2 hover:text-indigo-400 transition-colors">
                <Settings size={18} /> Configuración
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-6 md:p-8">
          <Routes>
            <Route path="/" element={<div className="text-center mt-20"><h1 className="text-4xl font-bold text-white mb-4">Bienvenido a AgroTrack</h1><p className="text-slate-400 text-lg">Selecciona una opción en el menú superior para comenzar.</p></div>} />
            <Route path="/pesaje" element={<PesajeScreen />} />
            <Route path="/historial" element={<HistorialScreen />} />
            <Route path="/configuracion" element={<ConfiguracionScreen />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
