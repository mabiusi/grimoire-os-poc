import { useState } from 'react';
import Frame from './Frame.jsx';
import { useGamepad } from '../hooks/useGamepad.js';
import { sfx } from '../lib/sfx.js';
import { clamp } from '../lib/utils.js';

// Filas de teclas (minúsculas). Mayúsculas = toUpperCase (dígitos/símbolos no cambian).
const LETTER_ROWS = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'ñ'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', '.', ',', '-'],
  ['!', '?', '@', '#', '&', '(', ')', ':', '/', "'"],
];

// Última fila: teclas de acción (se navegan como celdas, ancho visual variable).
const ACTION_ROW = [
  { id: 'shift', label: '⇧ Aa' },
  { id: 'space', label: '␣ Espacio' },
  { id: 'del', label: '⌫ Borr.' },
  { id: 'ok', label: '✓ OK' },
];

/**
 * Módulo 1 — Teclado virtual en pantalla (estilo consola). 100% gamepad:
 *   D-Pad   -> mover por la grilla (al bajar/subir, la columna se ajusta)
 *   A (Z)   -> pulsar la tecla enfocada
 *   Y / Sel -> alternar Mayúsculas/minúsculas
 *   B       -> cancelar (onBack)
 *
 * Es una pantalla completa (incluye su Frame). Reemplaza al input Arcade.
 */
export default function VirtualKeyboard({
  title = 'CREAR · NOMBRE',
  icon = '⌨️',
  initialValue = '',
  maxLength = 16,
  onSubmit,
  onBack,
}) {
  const [text, setText] = useState(initialValue);
  const [shift, setShift] = useState(true); // arranca en Mayúscula (primera letra)
  const [row, setRow] = useState(1);
  const [col, setCol] = useState(0);

  // Grilla actual según Mayús/minús.
  const letterRows = LETTER_ROWS.map((r) => r.map((ch) => (shift ? ch.toUpperCase() : ch)));
  const rows = [...letterRows, ACTION_ROW]; // 6 filas; la última son acciones
  const isActionRow = row === letterRows.length;
  const rowLen = rows[row].length;

  const toggleShift = () => {
    sfx.tick();
    setShift((s) => !s);
  };

  const press = () => {
    if (isActionRow) {
      const action = ACTION_ROW[col].id;
      if (action === 'shift') return toggleShift();
      if (action === 'space') {
        if (text.length < maxLength) {
          setText((t) => t + ' ');
          sfx.move();
        } else sfx.error();
        return;
      }
      if (action === 'del') {
        setText((t) => t.slice(0, -1));
        sfx.back();
        return;
      }
      if (action === 'ok') {
        if (text.trim().length === 0) return sfx.error();
        sfx.open();
        onSubmit?.(text.trim());
        return;
      }
      return;
    }
    // Tecla de carácter
    const ch = rows[row][col];
    if (text.length >= maxLength) return sfx.error();
    setText((t) => t + ch);
    sfx.move();
  };

  const moveRow = (dir) => {
    sfx.tick();
    const nextRow = clamp(row + dir, 0, rows.length - 1);
    setRow(nextRow);
    setCol((c) => clamp(c, 0, rows[nextRow].length - 1));
  };

  const moveCol = (dir) => {
    sfx.tick();
    setCol((c) => clamp(c + dir, 0, rowLen - 1));
  };

  useGamepad({
    onUp: () => moveRow(-1),
    onDown: () => moveRow(1),
    onLeft: () => moveCol(-1),
    onRight: () => moveCol(1),
    onA: press,
    onY: toggleShift,
    onSelect: toggleShift,
    onB: onBack,
  });

  return (
    <Frame
      title={title}
      icon={icon}
      hints={[
        ['↑↓←→', 'Mover'],
        ['A', 'Tecla'],
        ['Y', 'Aa'],
        ['B', 'Atrás'],
      ]}
    >
      <div className="flex h-full flex-col items-center p-3">
        {/* Display del texto */}
        <div className="mb-3 flex w-full items-center justify-between rounded border-2 border-gold bg-stoneDark px-3 py-2">
          <span className="font-vt text-2xl text-goldLight">
            {text || <span className="text-parchment/40">Escribe un nombre…</span>}
            <span className="animate-blink text-gold">▏</span>
          </span>
          <span className="font-press text-[8px] text-gold/60">
            {text.length}/{maxLength}
          </span>
        </div>

        {/* Grilla de letras */}
        <div className="flex flex-col gap-1">
          {letterRows.map((r, ri) => (
            <div key={ri} className="grid grid-cols-10 gap-1">
              {r.map((ch, ci) => {
                const active = ri === row && ci === col;
                return (
                  <div
                    key={ci}
                    className={[
                      'flex h-9 w-9 items-center justify-center rounded border-2 font-press text-sm',
                      active
                        ? 'border-goldLight bg-gold text-ink shadow-bevel'
                        : 'border-bronze/50 bg-stoneDark text-parchment/85',
                    ].join(' ')}
                  >
                    {ch}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Fila de acciones */}
          <div className="mt-1 flex gap-1">
            {ACTION_ROW.map((a, ci) => {
              const active = isActionRow && ci === col;
              const grow = a.id === 'space' ? 'flex-[3]' : 'flex-1';
              return (
                <div
                  key={a.id}
                  className={[
                    grow,
                    'flex h-9 items-center justify-center rounded border-2 font-press text-[10px]',
                    active
                      ? 'border-goldLight bg-gold text-ink shadow-bevel'
                      : a.id === 'ok'
                      ? 'border-moss/70 bg-stoneDark text-moss'
                      : 'border-bronze/50 bg-stoneDark text-parchment/85',
                  ].join(' ')}
                >
                  {a.label}
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-3 font-vt text-base text-parchment/50">
          <kbd className="rounded-sm bg-moss px-1.5 text-abyss">Y</kbd> /{' '}
          <kbd className="rounded-sm bg-gold px-1.5 text-ink">Sel</kbd> alterna Mayúsculas
        </p>
      </div>
    </Frame>
  );
}
