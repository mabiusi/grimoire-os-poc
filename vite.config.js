import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// El "firmware" se sirve como una SPA sin routing real: toda la navegación
// entre pantallas se simula con Context API. Se empaqueta como PWA para poder
// instalarlo en el móvil y usar el Gamepad Virtual a pantalla completa.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // El Service Worker se registra manualmente en src/main.jsx.
      injectRegister: false,
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'Grimoire OS',
        short_name: 'Grimoire',
        description:
          'Herramientas para juegos de rol de mesa y aventuras de texto. Firmware POC de la consola QuestBoy.',
        lang: 'es',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone', // oculta la UI del navegador (modo app)
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      // El SW sólo se activa en producción (build/preview), no en `vite dev`.
      devOptions: { enabled: false },
    }),
  ],
  server: { port: 5173, host: true },
});
