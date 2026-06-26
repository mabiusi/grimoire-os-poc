/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Paleta "Retro Color" 16-bits: pergamino, oro, piedra y abismo.
      colors: {
        abyss: '#0c0a07',       // fondo de pantalla (casi negro cálido)
        stoneDark: '#1c1812',   // paneles oscuros
        stone: '#33291d',       // barras / marcos
        bronze: '#8a6d3b',      // bordes secundarios
        gold: '#d8a93a',        // bordes / acentos principales
        goldLight: '#f3d27a',   // resaltado / brillo
        parchment: '#e9d8b4',   // pergamino claro (paneles de texto)
        parchmentDark: '#d3bd8e',
        ink: '#2a1c0c',         // texto oscuro sobre pergamino
        blood: '#9b2c2c',       // peligro / HP
        moss: '#5a7d3a',        // éxito / naturaleza
        arcane: '#7b6cc4',      // magia / cordura
        sky: '#5aa9c4',         // información
      },
      fontFamily: {
        press: ['"Press Start 2P"', 'monospace'], // títulos / etiquetas
        vt: ['"VT323"', 'monospace'],             // cuerpo de texto legible
      },
      // Escala tipográfica (P1). Press Start 2P: piso 9px, sólo HUD/labels/números.
      // VT323: ≥16px para cualquier información (nombres, descripciones, datos).
      fontSize: {
        'hud-xs': ['9px', { letterSpacing: '0.04em' }], // chips, key-caps, eyebrows
        'hud-sm': ['10px', { letterSpacing: '0.04em' }], // pestañas, meta-labels
        hud: ['12px'], // títulos de panel / app
        'hud-lg': ['16px'], // encabezados de pantalla
        'body-sm': ['16px'], // piso para CUALQUIER dato que se lee
        body: ['19px'],
        'body-lg': ['22px'],
      },
      boxShadow: {
        bevel: 'inset 2px 2px 0 rgba(255,255,255,0.12), inset -2px -2px 0 rgba(0,0,0,0.55)',
        bevelIn: 'inset -2px -2px 0 rgba(255,255,255,0.10), inset 2px 2px 0 rgba(0,0,0,0.55)',
      },
    },
  },
  plugins: [],
};
