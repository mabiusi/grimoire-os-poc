import { useState } from 'react';
import { useGamepad } from '../hooks/useGamepad.js';
import { sfx } from '../lib/sfx.js';
import { clamp, wrapIndex } from '../lib/utils.js';

// Alfabeto cíclico para el D-Pad: A-Z + espacio (casilla en blanco).
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ '.split('');
const BLANK = ' ';

// Reparte un string en las casillas (mayúsculas, recortado/rellenado a `length`).
function nameToSlots(name, length) {
  const up = (name || '').toUpperCase().slice(0, length).split('');
  return Array.from({ length }, (_, i) => (up[i] && ALPHABET.includes(up[i]) ? up[i] : BLANK));
}

/**
 * Entrada de nombre estilo máquina Arcade — SOLO gamepad, sin <input> de texto.
 *
 *   ↑ / ↓  -> recorre el abecedario en la casilla activa
 *   ← / →  -> mueve la casilla activa
 *   Y      -> nombre aleatorio (vía `generateName`)
 *   A      -> confirma (onConfirm con el nombre resultante)
 *   B      -> onBack
 *
 * Es controlado por gamepad pero presentacional: el contenedor (Frame, hints)
 * lo provee quien lo usa. Reutilizable para cualquier flujo de nombrado.
 */
export default function ArcadeNameInput({
  length = 5,
  initialName = '',
  generateName,
  onConfirm,
  onBack,
}) {
  const [slots, setSlots] = useState(() => nameToSlots(initialName, length));
  const [cursor, setCursor] = useState(0);

  const name = slots.join('').trimEnd();
  const isEmpty = name.trim().length === 0;

  const cycleLetter = (dir) => {
    sfx.move();
    setSlots((prev) => {
      const next = [...prev];
      const idx = ALPHABET.indexOf(next[cursor]);
      next[cursor] = ALPHABET[wrapIndex(idx + dir, ALPHABET.length)];
      return next;
    });
  };

  const moveCursor = (dir) => {
    sfx.tick();
    setCursor((c) => clamp(c + dir, 0, length - 1));
  };

  const randomize = () => {
    if (!generateName) return;
    sfx.select();
    setSlots(nameToSlots(generateName(), length));
  };

  const confirm = () => {
    if (isEmpty) {
      sfx.error();
      return;
    }
    sfx.open();
    onConfirm?.(name);
  };

  useGamepad({
    onUp: () => cycleLetter(1),
    onDown: () => cycleLetter(-1),
    onLeft: () => moveCursor(-1),
    onRight: () => moveCursor(1),
    onY: randomize,
    onA: confirm,
    onB: onBack,
  });

  return (
    <div className="flex h-full flex-col items-center justify-center p-4">
      <p className="mb-4 font-press text-[9px] text-gold/80">NOMBRA A TU HÉROE</p>

      {/* Casillas estilo marquesina arcade */}
      <div className="flex items-center justify-center gap-2">
        {slots.map((ch, i) => {
          const active = i === cursor;
          const blank = ch === BLANK;
          return (
            <div key={i} className="flex flex-col items-center">
              {/* Flecha superior (solo en la casilla activa) */}
              <span className={`font-press text-[10px] ${active ? 'animate-softpulse text-gold' : 'text-transparent'}`}>
                ▲
              </span>
              <div
                className={[
                  'flex h-14 w-11 items-center justify-center rounded border-2 font-press text-2xl',
                  active
                    ? 'border-goldLight bg-gold text-ink shadow-bevel'
                    : 'border-bronze/60 bg-stoneDark text-parchment',
                ].join(' ')}
              >
                {blank ? <span className={active ? 'text-ink/30' : 'text-parchment/20'}>·</span> : ch}
              </div>
              <span className={`font-press text-[10px] ${active ? 'animate-softpulse text-gold' : 'text-transparent'}`}>
                ▼
              </span>
            </div>
          );
        })}
      </div>

      {/* Vista previa del nombre */}
      <div className="mt-5 font-vt text-2xl text-goldLight">
        {isEmpty ? <span className="text-parchment/40">(sin nombre)</span> : name}
      </div>

      {/* Recordatorio contextual del botón Y */}
      <p className="mt-4 font-vt text-lg text-parchment/60">
        <kbd className="rounded-sm bg-moss px-1.5 text-abyss">Y</kbd> Nombre aleatorio
      </p>
    </div>
  );
}
