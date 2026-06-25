import React from 'react';
import ReactDOM from 'react-dom/client';
import { registerSW } from 'virtual:pwa-register';
import App from './App.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Registro del Service Worker (PWA). Con registerType 'autoUpdate' la app se
// actualiza sola al detectar una nueva versión. En `vite dev` es un no-op
// (devOptions.enabled = false), así que no interfiere con el desarrollo.
registerSW({ immediate: true });
