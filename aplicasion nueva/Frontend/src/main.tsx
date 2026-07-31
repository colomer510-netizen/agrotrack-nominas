import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

import { defineCustomElements as jeepSqlite } from 'jeep-sqlite/loader';

// Inyectar componente de base de datos para la web
const jeepEl = document.createElement('jeep-sqlite');
document.body.appendChild(jeepEl);
jeepSqlite(window);

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
