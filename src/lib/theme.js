// Grimoire OS — motor de tema (rediseño). Dos ejes independientes:
//   modo  : 'day' | 'night'
//   accent: 'gold' | 'moss' | 'blood' | 'sky' | 'arcane'
// El acento tiñe TODA la estructura (no solo los resaltados): el "oro" del
// sistema pasa a ser `accent.m`. El tema se computa como un objeto de tokens y
// se expone como CSS variables (`--gr-*`) en el contenedor raíz de la pantalla,
// para que los tokens de Tailwind (`bg-gold`, `text-ink`, `text-parchment/80`…)
// lean variables en lugar de literales y respondan a (modo × acento) sin tocar
// el markup. Reemplaza al viejo `.theme-night` por overrides `!important`.

export const ACCENTS = ['gold', 'moss', 'blood', 'sky', 'arcane'];

export const ACCENT_LABEL = {
  gold: 'Oro',
  moss: 'Esmeralda',
  blood: 'Rubí',
  sky: 'Zafiro',
  arcane: 'Amatista',
};

// Tríadas de acento (no cambian con el modo): m principal · l claro · d oscuro.
export const ACCENT_TRIAD = {
  gold: { m: '#d8a93a', l: '#f3d27a', d: '#9c7b2e' },
  moss: { m: '#6c9a3f', l: '#a6d36e', d: '#4f7330' },
  blood: { m: '#bf4040', l: '#e3837a', d: '#883030' },
  sky: { m: '#4e9fc0', l: '#86cfe2', d: '#356f86' },
  arcane: { m: '#8a78d0', l: '#b3a6ec', d: '#5f5296' },
};

function hx(h) {
  const s = h.replace('#', '');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}

// Mezcla hex→rgb→lerp→hex. t en [0,1].
export function mix(a, b, t) {
  const A = hx(a);
  const B = hx(b);
  return (
    '#' +
    [0, 1, 2]
      .map((i) => {
        const v = Math.round(A[i] + (B[i] - A[i]) * t);
        return ('0' + v.toString(16)).slice(-2);
      })
      .join('')
  );
}

export function accentTriad(accent) {
  return ACCENT_TRIAD[accent] || ACCENT_TRIAD.gold;
}

// Objeto de tema computado a partir de (modo, acento). Es la fuente de verdad de
// color; tanto las CSS vars como PixelIcon (engrave/accent) leen de acá.
export function computeTheme(mode, accent) {
  const A = accentTriad(accent);
  const m = A.m;
  const night = mode === 'night';

  const base = night
    ? {
        scrnBg: mix('#0c0a07', m, 0.05),
        chrome: mix('#1a160f', m, 0.07),
        chromeTop: mix('#2c2417', m, 0.1),
        chromeText: '#ecdcb6',
        chromeDim: '#b09a6e',
        bronze: '#a98a4f',
        parch: mix('#241d12', m, 0.05),
        parchHi: mix('#2f2616', m, 0.07),
        parchLine: 'rgba(169,138,79,.45)',
        parchInset: 'rgba(0,0,0,.35)',
        ink: '#e7d7b1',
        blood: '#cf6b6b',
        moss: '#84b15a',
        sky: '#7cc3da',
        arcane: '#9a8cd8',
        poolBg: mix('#141009', m, 0.07),
        borderDim: 'rgba(169,138,79,.5)',
        label: A.l,
        advText: '#f3d27a',
      }
    : {
        scrnBg: mix('#e4d6b0', m, 0.05),
        chrome: mix('#cdba8c', m, 0.12),
        chromeTop: mix('#d9c89c', m, 0.1),
        chromeText: '#2a1c0c',
        chromeDim: '#7a6238',
        bronze: '#8a6d3b',
        parch: mix('#f3e8ca', m, 0.03),
        parchHi: mix('#e6d8b2', m, 0.05),
        parchLine: 'rgba(138,109,59,.5)',
        parchInset: 'rgba(120,80,20,.16)',
        ink: '#2a1c0c',
        blood: '#9b2c2c',
        moss: '#4e6f2e',
        sky: '#2f7d9c',
        arcane: '#5f51a0',
        poolBg: mix('#e6d8b2', m, 0.05),
        borderDim: 'rgba(138,109,59,.5)',
        label: mix(A.d, '#1c140a', 0.42),
        advText: '#2a1c0c',
      };

  base.gold = m;
  base.goldLight = A.l;
  base.accDim = A.d;
  base.border = night ? A.d : m;
  base.barBorder = m + (night ? '8c' : 'b3'); // acento + alpha (≈55% noche / 70% día)
  base.engraveBody = mix(A.d, '#170f07', 0.5); // cuerpo del ícono "grabado" (modo engrave)
  base.accent = A;
  base.night = night;
  return base;
}

// Color → "r g b" (canales) para los tokens Tailwind con <alpha-value>.
// Acepta '#rrggbb', '#rrggbbaa' y 'rgb(a)(r,g,b[,a])'.
function channels(color) {
  if (color[0] === '#') {
    const [r, g, b] = hx(color);
    return `${r} ${g} ${b}`;
  }
  const m = color.match(/rgba?\(([^)]+)\)/);
  if (m) {
    const p = m[1].split(',').map((s) => s.trim());
    return `${p[0]} ${p[1]} ${p[2]}`;
  }
  return color;
}

// CSS custom properties para el contenedor raíz. Las themeables van como canales
// (para soportar modificadores de opacidad de Tailwind); las que ya traen alpha
// horneada (barBorder/parchInset/parchLine/border) van como color directo.
export function themeVars(mode, accent) {
  const t = computeTheme(mode, accent);
  return {
    '--gr-abyss': channels(t.scrnBg),
    '--gr-stoneDark': channels(t.chrome),
    '--gr-stone': channels(t.chromeTop),
    '--gr-bronze': channels(t.bronze),
    '--gr-gold': channels(t.gold),
    '--gr-goldLight': channels(t.goldLight),
    '--gr-parchment': channels(t.parch),
    '--gr-parchmentDark': channels(t.parchHi),
    '--gr-ink': channels(t.ink),
    '--gr-blood': channels(t.blood),
    '--gr-moss': channels(t.moss),
    '--gr-sky': channels(t.sky),
    '--gr-arcane': channels(t.arcane),
    '--gr-chromeText': channels(t.chromeText),
    '--gr-chromeDim': channels(t.chromeDim),
    '--gr-label': channels(t.label),
    '--gr-advText': channels(t.advText),
    '--gr-poolBg': channels(t.poolBg),
    '--gr-accDim': channels(t.accDim),
    '--gr-borderDim': channels(t.borderDim),
    // color directo (alpha intrínseca)
    '--gr-barBorder': t.barBorder,
    '--gr-parchInset': t.parchInset,
    '--gr-parchLine': t.parchLine,
    '--gr-border': t.border,
  };
}
