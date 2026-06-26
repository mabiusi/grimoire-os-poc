/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Paleta "Retro Color" themeable: los tokens leen CSS vars (--gr-*) que el
      // kernel computa de (modo Día/Noche × acento). `<alpha-value>` conserva los
      // modificadores de opacidad de Tailwind (text-parchment/80, border-bronze/60…)
      // y de paso arregla el bug de contraste del viejo theme-night !important.
      // El "oro" del sistema ES el acento activo (gold = accent.m).
      colors: {
        abyss: 'rgb(var(--gr-abyss) / <alpha-value>)',           // fondo de pantalla
        stoneDark: 'rgb(var(--gr-stoneDark) / <alpha-value>)',   // paneles (chrome)
        stone: 'rgb(var(--gr-stone) / <alpha-value>)',           // barras (chromeTop)
        bronze: 'rgb(var(--gr-bronze) / <alpha-value>)',         // bordes secundarios
        gold: 'rgb(var(--gr-gold) / <alpha-value>)',             // acento principal
        goldLight: 'rgb(var(--gr-goldLight) / <alpha-value>)',   // acento claro / brillo
        accDim: 'rgb(var(--gr-accDim) / <alpha-value>)',         // acento oscuro
        parchment: 'rgb(var(--gr-parchment) / <alpha-value>)',   // panel de lectura
        parchmentDark: 'rgb(var(--gr-parchmentDark) / <alpha-value>)',
        ink: 'rgb(var(--gr-ink) / <alpha-value>)',               // texto sobre pergamino
        blood: 'rgb(var(--gr-blood) / <alpha-value>)',           // peligro / HP / botón A
        moss: 'rgb(var(--gr-moss) / <alpha-value>)',             // éxito / botón Y
        arcane: 'rgb(var(--gr-arcane) / <alpha-value>)',         // magia / cordura
        sky: 'rgb(var(--gr-sky) / <alpha-value>)',               // info / botón X
        // chrome (barras de sistema, fuera del pergamino)
        chromeText: 'rgb(var(--gr-chromeText) / <alpha-value>)', // texto sobre chrome
        chromeDim: 'rgb(var(--gr-chromeDim) / <alpha-value>)',
        label: 'rgb(var(--gr-label) / <alpha-value>)',           // títulos/etiquetas
        advText: 'rgb(var(--gr-advText) / <alpha-value>)',       // fósforo del libro-juego
        poolBg: 'rgb(var(--gr-poolBg) / <alpha-value>)',         // bandeja de dados
        borderDim: 'rgb(var(--gr-borderDim) / 0.5)',             // borde inactivo
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
