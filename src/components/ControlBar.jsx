import { Fragment } from 'react';

/**
 * Barra de controles unificada (P3). Cada control es un glyph con el COLOR de
 * su botón físico SNES (A=blood, B=gold, X=sky, Y=moss, L/R/Start/Select=stone)
 * + la acción en VT. Mapa en pantalla 1:1 con el gamepad. Los globales usan el
 * mismo chip, atenuados y tras un divisor. Mantiene la prop `hints` intacta, así
 * ninguna pantalla cambia su llamada.
 */
// A/X/Y siguen el tema (luminancia por modo); B queda ORO FIJO siempre (identidad
// del hardware, aunque el acento sea otro). Los textos de A/X/Y/B son literales
// claros/oscuros para no invertirse con el modo. L/R/Start/Select/D-Pad toman
// colores del tema (chrome + label/chromeText + borde bronce).
const BTN = {
  A: 'bg-blood text-[#e9d8b4] rounded-full',
  B: 'bg-[#d8a93a] text-[#2a1c0c] rounded-full',
  X: 'bg-sky text-[#0c0a07] rounded-full',
  Y: 'bg-moss text-[#e9d8b4] rounded-full',
  L: 'bg-stoneDark text-chromeText rounded-md border border-bronze/70',
  R: 'bg-stoneDark text-chromeText rounded-md border border-bronze/70',
  START: 'bg-stoneDark text-label rounded-full border border-bronze/70',
  SELECT: 'bg-stoneDark text-label rounded-full border border-bronze/70',
  DPAD: 'bg-stoneDark text-chromeText rounded border border-bronze/70',
};
const GLYPH = { DPAD: '✚', START: '≡', SELECT: '◧' };

// Mapea las "keys" que ya pasan las pantallas en su prop `hints` a botones.
function keysFor(k) {
  const s = String(k).trim();
  const direct = { A: ['A'], B: ['B'], X: ['X'], Y: ['Y'], L: ['L'], R: ['R'] };
  if (direct[s]) return direct[s];
  if (s === 'L/R') return ['L', 'R'];
  if (s === 'A / X' || s === 'A/X') return ['A', 'X'];
  if (s === 'A/→') return ['A'];
  if (s === 'Start') return ['START'];
  if (s === 'Sel' || s === 'Select') return ['SELECT'];
  if (/[↑↓←→]/.test(s)) return ['DPAD']; // cualquier combinación de flechas
  return null; // fallback: cap neutral con el texto
}

function Glyph({ b }) {
  const wide = b === 'START' || b === 'SELECT' || b === 'L' || b === 'R';
  return (
    <span className={`inline-flex h-[22px] ${wide ? 'px-1.5' : 'min-w-[22px]'} items-center justify-center font-press text-hud-sm leading-none shadow-bevel ${BTN[b]}`}>
      {GLYPH[b] || b}
    </span>
  );
}

function Chip({ keyStr, label, dim }) {
  const ks = keysFor(keyStr);
  return (
    <span className={`flex items-center gap-1.5 ${dim ? 'opacity-70' : ''}`}>
      <span className="flex items-center">
        {ks ? (
          ks.map((b, i) => (
            <Fragment key={b}>
              {i > 0 && <span className="px-0.5 font-press text-hud-xs text-bronze">/</span>}
              <Glyph b={b} />
            </Fragment>
          ))
        ) : (
          <span className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded bg-stoneDark px-1 font-press text-hud-sm text-chromeText shadow-bevel">
            {keyStr}
          </span>
        )}
      </span>
      <span className="font-vt text-body-sm leading-none text-chromeText">{label}</span>
    </span>
  );
}

// Globales (idénticos en toda la app). Coinciden con GlobalControls.jsx.
const GLOBALS = [
  ['Start', 'Menú'],
  ['Y', 'd20'],
  ['Sel', 'Tema'],
];

export default function ControlBar({ hints = [] }) {
  return (
    <footer className="flex h-[38px] shrink-0 items-center gap-3 overflow-hidden border-t-2 border-bronze bg-stoneDark px-3">
      <div className="flex items-center gap-3">
        {hints.map(([k, l]) => (
          <Chip key={k + l} keyStr={k} label={l} />
        ))}
      </div>
      <div className="mx-1 h-5 w-px shrink-0 bg-bronze/50" />
      <div className="flex items-center gap-3">
        {GLOBALS.map(([k, l]) => (
          <Chip key={k} keyStr={k} label={l} dim />
        ))}
      </div>
    </footer>
  );
}
