import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import DashboardScreen from './screens/DashboardScreen';
import PesajeScreen from './screens/PesajeScreen';
import HistorialScreen from './screens/HistorialScreen';
import ConfiguracionScreen from './screens/ConfiguracionScreen';
import ExportacionScreen from './screens/ExportacionScreen';
import TrazabilidadScreen from './screens/TrazabilidadScreen';
import DashboardTVScreen from './screens/DashboardTVScreen';
import { Settings, Home, Scale, History, Package, Shield, Tv, Menu, X } from 'lucide-react';
import './App.css';

function NavLink({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive
          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
          : 'text-slate-400 hover:text-white hover:bg-slate-800'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </Link>
  );
}

function AppContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // El Dashboard TV usa su propia layout sin navbar
  if (location.pathname === '/tv') {
    return <DashboardTVScreen />;
  }

  const navItems = [
    { to: '/', icon: Home, label: 'Inicio' },
    { to: '/pesaje', icon: Scale, label: 'Pesaje' },
    { to: '/historial', icon: History, label: 'Contabilidad' },
    { to: '/exportacion', icon: Package, label: 'Exportación' },
    { to: '/trazabilidad', icon: Shield, label: 'Trazabilidad' },
    { to: '/tv', icon: Tv, label: 'Dashboard TV' },
    { to: '/configuracion', icon: Settings, label: 'Configuración' },
  ];

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col">
      {/* Navbar */}
      <nav className="bg-slate-950 border-b border-slate-800 text-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Scale size={16} className="text-white" />
            </div>
            <span className="text-xl font-bold tracking-wider bg-gradient-to-r from-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              AGROTRACK
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <NavLink key={item.to} {...item} />
            ))}
          </div>

          {/* Connection Status */}
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
            <span className={`status-dot ${navigator.onLine ? 'online' : 'offline'}`} />
            {navigator.onLine ? 'Online' : 'Offline'}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden text-slate-400 hover:text-white p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-950 animate-fade-in">
            <div className="p-4 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    location.pathname === item.to
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <item.icon size={20} />
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="px-4 py-3 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-500">
              <span className={`status-dot ${navigator.onLine ? 'online' : 'offline'}`} />
              {navigator.onLine ? 'Conectado' : 'Modo Offline'}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8">
        <Routes>
          <Route path="/" element={<DashboardScreen />} />
          <Route path="/pesaje" element={<PesajeScreen />} />
          <Route path="/historial" element={<HistorialScreen />} />
          <Route path="/exportacion" element={<ExportacionScreen />} />
          <Route path="/trazabilidad" element={<TrazabilidadScreen />} />
          <Route path="/configuracion" element={<ConfiguracionScreen />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
