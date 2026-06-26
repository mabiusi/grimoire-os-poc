import { Fragment } from 'react';

/**
 * <GrimoireTextRenderer /> — parsea el "dialecto" de 5etools y lo formatea con
 * el estilo retro de Grimoire OS. Reconoce bloques `{@etiqueta contenido}`.
 *
 * Regla de oro del display:
 *   contenido = "nombre|fuente|texto_display|...".
 *   - sin pipes      -> se muestra el nombre.
 *   - 3+ secciones   -> se muestra el texto_display (3.º, o el último si hay más).
 *   - {@filter ...}  -> caso especial: sólo el 1.º (texto_display inicial),
 *                       ignorando todo lo que va tras el primer pipe.
 *
 * Sólo formato visual: NO genera elementos interactivos (sin onClick), así no
 * rompe la navegación por gamepad ni el layout 4:3. Los colores están afinados
 * para leerse bien tanto sobre pergamino como sobre fondo oscuro.
 */

// Separa el texto conservando los bloques {@...} como tokens.
const SPLIT_RE = /(\{@\w+\s*[^{}]*\})/g;
// Valida/captura un token de etiqueta: grupo 1 = tag, grupo 2 = contenido.
const TAG_RE = /^\{@(\w+)\s*([^{}]*)\}$/;

function displayText(tag, parts) {
  if (tag === 'filter') return parts[0]; // sólo el display inicial
  if (parts.length >= 3) return parts[parts.length - 1] || parts[0];
  return parts[0];
}

function Token({ tag, content }) {
  const parts = content.split('|');
  const text = displayText(tag, parts);

  switch (tag) {
    // --- formato básico ---
    case 'b':
    case 'bold':
      // Sólo peso: hereda el color del texto (legible sobre pergamino y oscuro).
      return <strong className="font-bold">{text}</strong>;
    case 'i':
    case 'italic':
      return <em className="italic">{text}</em>;

    // --- mecánicas / dados (chip destacado) ---
    case 'dice':
    case 'damage':
    case 'hit':
    case 'd20':
    case 'dc':
      return (
        <span className="mx-0.5 inline-block rounded border border-bronze/60 bg-stoneDark px-1 leading-none text-goldLight">
          {tag === 'dc' ? `CD ${text}` : tag === 'hit' ? `+${text}` : text}
        </span>
      );
    case 'chance':
      return <span className="font-bold text-moss">{parts[0]}%</span>;

    // --- entidades clave (color temático) ---
    case 'spell':
      return <span className="font-semibold text-arcane">{text}</span>;
    case 'item':
      return <span className="font-semibold text-bronze">{text}</span>;
    case 'creature':
      return <span className="font-semibold text-blood">{text}</span>;
    case 'class':
    case 'subclass':
      return <span className="font-semibold text-moss">{text}</span>;

    // --- condiciones / habilidades (subrayado de advertencia) ---
    case 'condition':
      return <span className="text-blood underline decoration-dotted underline-offset-2">{text}</span>;
    case 'skill':
    case 'sense':
      return <span className="text-bronze underline decoration-dotted underline-offset-2">{text}</span>;

    // --- filtro y cualquier etiqueta no contemplada -> texto plano ---
    case 'filter':
    default:
      return <>{text}</>;
  }
}

export default function GrimoireTextRenderer({ text, className }) {
  if (!text) return null;

  const tokens = String(text).split(SPLIT_RE).filter(Boolean);

  return (
    <span className={className}>
      {tokens.map((tok, i) => {
        const m = tok.match(TAG_RE);
        if (!m) return <Fragment key={i}>{tok}</Fragment>;
        return <Token key={i} tag={m[1].toLowerCase()} content={m[2]} />;
      })}
    </span>
  );
}
