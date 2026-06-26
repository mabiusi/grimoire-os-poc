import { iconBitmaps } from '../icons/iconData';
import { useTheme } from '../hooks/useTheme.js';

/**
 * <PixelIcon /> — ícono pixel-art original de Grimoire OS (bitmap 12×12, 1 <rect>
 * por píxel, crispEdges). Char-set: '.' transp · 'o' outline · 'g' cuerpo ·
 * 'G' brillo · 'd' sombra interna · acentos semánticos b/m/a/s (+ claros B/M/A/S).
 *
 * Color: los tonos oro/bronce SIGUEN EL ACENTO activo del tema (acc.d/m/l). Los
 * chars semánticos de condición (veneno verde, etc.) NO cambian: mantienen su
 * significado. Tres modos de render:
 *
 *   <PixelIcon name="dice" />            // multicolor (acento), sobre fondo neutro
 *   <PixelIcon name="dice" engrave />    // "grabado" oscuro con relieve, sobre fondo acentuado
 *   <PixelIcon name="sun" mono />        // monocromo currentColor
 *   <PixelIcon name="sun" mono="#2a1c0c" /> // monocromo en un color fijo
 *
 * `engrave` es el PAR INVERSO del ícono activo (Launcher/Roster/Enciclopedia/Menú):
 * en vez de una silueta negra plana, conserva variación tonal "tallada".
 */
function paletteFor(engrave, t) {
  if (engrave) {
    return {
      o: '#120c05', g: t.engraveBody, G: t.accDim, d: '#080603',
      b: '#241608', m: '#1f2a12', a: '#241a3a', s: '#143038', p: '#4a3a1f', w: '#4a3a1f',
      B: '#241608', M: '#1f2a12', A: '#241a3a', S: '#143038',
    };
  }
  return {
    o: t.accDim, g: t.gold, G: t.goldLight, d: '#1c1812',
    b: '#9b2c2c', m: '#5a7d3a', a: '#7b6cc4', s: '#5aa9c4', p: '#e9d8b4', w: '#e9d8b4',
    B: '#cf5b5b', M: '#7faa4a', A: '#9a8cd8', S: '#82c4da',
  };
}

export default function PixelIcon({ name, size = 16, mono = false, engrave = false, className = '', title }) {
  const t = useTheme();
  const map = iconBitmaps[name];
  if (!map) {
    if (import.meta.env.DEV) console.warn(`PixelIcon: ícono desconocido "${name}"`);
    return null;
  }
  const rows = map.length;
  const cols = Math.max(...map.map((r) => r.length));
  const pal = paletteFor(engrave, t);
  const monoFill = typeof mono === 'string' ? mono : 'currentColor';

  const rects = [];
  for (let y = 0; y < rows; y += 1) {
    const row = map[y];
    for (let x = 0; x < row.length; x += 1) {
      const c = row[x];
      if (c === '.') continue;
      const fill = mono ? monoFill : pal[c];
      if (!fill) continue;
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill={fill} />);
    }
  }

  return (
    <svg
      width={size}
      height={(size / cols) * rows}
      viewBox={`0 0 ${cols} ${rows}`}
      className={className}
      style={{ imageRendering: 'pixelated', shapeRendering: 'crispEdges', display: 'inline-block', verticalAlign: 'middle' }}
      role="img"
      aria-label={title || name}
    >
      {rects}
    </svg>
  );
}
