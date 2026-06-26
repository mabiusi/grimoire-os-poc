// Silueta 2D de un dado (clip-path CSS puro) con un número dentro.
// d4 triángulo · d6 cuadrado · d8 rombo · d10/d100 cometa · d12 pentágono · d20 hexágono.

const CLIP = {
  4: 'polygon(50% 8%, 8% 92%, 92% 92%)',
  6: 'polygon(8% 8%, 92% 8%, 92% 92%, 8% 92%)',
  8: 'polygon(50% 4%, 96% 50%, 50% 96%, 4% 50%)',
  10: 'polygon(50% 3%, 90% 40%, 50% 97%, 10% 40%)',
  100: 'polygon(50% 3%, 90% 40%, 50% 97%, 10% 40%)',
  12: 'polygon(50% 4%, 96% 40%, 78% 96%, 22% 96%, 4% 40%)',
  20: 'polygon(25% 5%, 75% 5%, 97% 50%, 75% 95%, 25% 95%, 3% 50%)',
};
// El número se baja hacia el centroide en formas con el vértice arriba.
const Y_OFFSET = { 4: '22%', 12: '8%', 10: '6%', 100: '6%' };

/**
 * @param sides   tipo de dado (4,6,8,10,12,20,100)
 * @param value   contenido a mostrar (número o etiqueta)
 * @param size    px
 * @param active  resaltado (selección en el constructor)
 * @param shaking animación de tirada
 * @param glow    dado ganador (Ventaja/Desventaja)
 * @param dim     atenuado (dado perdedor)
 * @param crossed tachado (perdedor)
 */
export default function DieShape({ sides, value, size = 54, active = false, shaking = false, glow = false, dim = false, crossed = false }) {
  const clipPath = CLIP[sides] || CLIP[6];
  const border = size * 0.07;
  const border_color = glow || active ? '#f3d27a' : dim ? '#5c4a2a' : '#d8a93a';
  const fill = dim ? 'linear-gradient(160deg,#2a2118,#16110b)' : 'linear-gradient(160deg,#3a2f20,#1c1610)';
  const text_color = dim ? '#8a6d3b' : glow || active ? '#f3d27a' : '#e9d8b4';
  const len = String(value).length;
  const fontSize = size * (len >= 3 ? 0.24 : len === 2 ? 0.32 : 0.38);

  return (
    <div
      className={[
        'relative shrink-0 transition-transform',
        shaking ? 'animate-shake' : '',
        glow ? 'animate-diceglow' : '',
        dim ? 'opacity-50' : '',
        active ? 'scale-110' : '',
      ].join(' ')}
      style={{ width: size, height: size }}
    >
      {/* borde (capa exterior clipeada) */}
      <div className="absolute inset-0" style={{ clipPath, background: border_color }} />
      {/* relleno (capa interior, inset = borde) */}
      <div className="absolute" style={{ inset: border, clipPath, background: fill }} />
      {/* número */}
      <span
        className="absolute inset-0 flex items-center justify-center font-press text-pixel-shadow"
        style={{ fontSize, color: text_color, transform: `translateY(${Y_OFFSET[sides] || '0'})` }}
      >
        {value}
      </span>
      {crossed && (
        <span className="absolute inset-0 flex items-center justify-center font-press text-blood" style={{ fontSize: size * 0.8, opacity: 0.85 }}>
          ✕
        </span>
      )}
    </div>
  );
}
