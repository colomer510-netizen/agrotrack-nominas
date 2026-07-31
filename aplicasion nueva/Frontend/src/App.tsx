import React from 'react';
import { BrowserRouter as Router, Switch, Route, Link } from 'react-router-dom';
import { PlanillaPesajeScreen } from './features/pesaje/components/PlanillaPesajeScreen';
import { AdminExportacionScreen } from './features/aduanas/components/AdminExportacionScreen';
import { ConfiguracionScreen } from './features/aduanas/components/ConfiguracionScreen';
import { HistorialScreen } from './features/pesaje/components/HistorialScreen';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
        {/* Navbar Global de Navegación */}
        <nav className="bg-gray-950 p-4 border-b border-gray-800 flex gap-6 items-center">
          <div className="font-bold text-xl text-blue-500 tracking-wider mr-4">AGROTRACK</div>
          <Link to="/" className="text-gray-300 hover:text-white transition-colors font-medium">Línea de Pesaje</Link>
          <Link to="/historial" className="text-gray-300 hover:text-white transition-colors font-medium">Historial</Link>
          <Link to="/aduanas" className="text-gray-300 hover:text-white transition-colors font-medium">Nóminas y Reportes</Link>
          <Link to="/config" className="text-gray-300 hover:text-white transition-colors font-medium flex items-center gap-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            Configuración
          </Link>
        </nav>

        {/* Contenedor de Rutas */}
        <div className="flex-1">
          <Switch>
            <Route exact path="/" component={PlanillaPesajeScreen} />
            <Route exact path="/historial">
              <HistorialScreen />
            </Route>
            <Route exact path="/aduanas">
              <AdminExportacionScreen />
            </Route>
            <Route exact path="/config" component={ConfiguracionScreen} />
          </Switch>
        </div>
      </div>
    </Router>
  );
};

export default App;
