import { useState } from 'react';
import { useGamepad } from '../hooks/useGamepad.js';
import { sfx } from '../lib/sfx.js';
import { clamp, rollDie } from '../lib/utils.js';

const rollFour = () => Array.from({ length: 4 }, () => rollDie(6));

/**
 * Módulo 2 (tirada) — Lanza 4d6 y deja elegir 3 dados; su suma se asigna.
 *   ←→ / ↑↓  -> moverse entre los 4 dados y el botón Asignar
 *   A (Z)    -> marcar/desmarcar dado (máx. 3) · o confirmar en "Asignar"
 *   X        -> volver a tirar
 *   B        -> cancelar
 *
 * Se renderiza COMO REEMPLAZO de la lista de stats, de modo que es el único
 * con handlers activos (StatAssignStep desactiva los suyos mientras tira).
 */
export default function StatRoller({ statLabel, onResult, onCancel }) {
  const [dice, setDice] = useState(rollFour);
  const [picked, setPicked] = useState([]); // índices elegidos (máx 3)
  const [sel, setSel] = useState(0); // 0..3 dados, 4 = botón Asignar

  const ready = picked.length === 3;
  const sum = picked.reduce((acc, i) => acc + dice[i], 0);

  const reroll = () => {
    sfx.roll();
    setDice(rollFour());
    setPicked([]);
  };

  const togglePick = (i) => {
    setPicked((prev) => {
      if (prev.includes(i)) {
        sfx.back();
        return prev.filter((x) => x !== i);
      }
      if (prev.length >= 3) {
        sfx.error();
        return prev;
      }
      sfx.tick();
      return [...prev, i];
    });
  };

  const confirm = () => {
    if (!ready) return sfx.error();
    sfx.result();
    onResult?.(sum);
  };

  useGamepad({
    onLeft: () => {
      sfx.move();
      setSel((s) => clamp(s - 1, 0, 4));
    },
    onRight: () => {
      sfx.move();
      setSel((s) => clamp(s + 1, 0, 4));
    },
    onUp: () => setSel((s) => (s === 4 ? 0 : s)),
    onDown: () => setSel((s) => (s < 4 ? 4 : s)),
    onA: () => (sel === 4 ? confirm() : togglePick(sel)),
    onX: reroll,
    onB: onCancel,
  });

  return (
    <div className="flex h-full flex-col items-center justify-center p-4">
      <p className="mb-1 font-press text-[10px] text-gold/80">TIRADA 4d6 → ELIGE 3</p>
      <p className="mb-4 font-vt text-xl text-goldLight">
        Asignar a <span className="text-blood">{statLabel}</span>
      </p>

      {/* Los 4 dados */}
      <div className="flex gap-3">
        {dice.map((value, i) => {
          const isPicked = picked.includes(i);
          const active = sel === i;
          return (
            <div
              key={i}
              className={[
                'flex h-20 w-20 animate-popin items-center justify-center rounded-xl border-4 font-press text-3xl transition-colors',
                active ? 'border-goldLight' : 'border-bronze/60',
                isPicked ? 'bg-gold text-ink' : 'bg-stoneDark text-parchment',
              ].join(' ')}
            >
              {value}
            </div>
          );
        })}
      </div>

      {/* Marcador de selección */}
      <div className="mt-4 font-vt text-xl text-parchment/80">
        Elegidos: <span className="text-goldLight">{picked.length}/3</span>
        {ready && <span className="ml-3 text-moss">Suma = {sum}</span>}
      </div>

      {/* Botón Asignar */}
      <div
        className={[
          'mt-4 rounded border-2 px-5 py-2 font-press text-[11px]',
          sel === 4
            ? ready
              ? 'border-goldLight bg-gold text-ink shadow-bevel'
              : 'border-blood/60 bg-stoneDark text-blood'
            : 'border-moss/60 text-moss',
        ].join(' ')}
      >
        {ready ? `✓ ASIGNAR (${sum})` : 'ELIGE 3 DADOS'}
      </div>

      <p className="mt-4 font-vt text-base text-parchment/50">
        <kbd className="rounded-sm bg-sky px-1.5 text-abyss">X</kbd> Volver a tirar ·{' '}
        <kbd className="rounded-sm bg-gold px-1.5 text-ink">B</kbd> Cancelar
      </p>
    </div>
  );
}
