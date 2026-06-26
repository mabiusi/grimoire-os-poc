import { iconBitmaps, ICON_COLORS } from '../icons/iconData';

/**
 * <PixelIcon /> — ícono pixel-art original de Grimoire OS.
 *
 *   <PixelIcon name="dice" size={16} />            // multicolor (sobre fondo oscuro)
 *   <PixelIcon name="dice" size={16} mono />       // monocromo, hereda currentColor
 *
 * `mono` se usa cuando el ícono va sobre un fondo claro/activo (p.ej. tarjeta
 * `bg-gold text-ink`): todos los píxeles toman el color del texto, garantizando
 * contraste. En fondos oscuros usar la versión multicolor (oro/bronce).
 *
 * Pixel-perfect: viewBox = grilla del bitmap; el SVG escala con crispEdges.
 */
export default function PixelIcon({ name, size = 16, mono = false, className = '', title }) {
  const map = iconBitmaps[name];
  if (!map) {
    if (import.meta.env.DEV) console.warn(`PixelIcon: ícono desconocido "${name}"`);
    return null;
  }
  const rows = map.length;
  const cols = Math.max(...map.map((r) => r.length));

  const rects = [];
  for (let y = 0; y < rows; y += 1) {
    const row = map[y];
    for (let x = 0; x < row.length; x += 1) {
      const c = row[x];
      if (c === '.') continue;
      const fill = mono ? 'currentColor' : ICON_COLORS[c];
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
