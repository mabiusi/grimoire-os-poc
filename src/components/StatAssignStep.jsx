import { useState } from 'react';
import Frame from './Frame.jsx';
import Cursor from './Cursor.jsx';
import StatRoller from './StatRoller.jsx';
import { useGamepad } from '../hooks/useGamepad.js';
import { sfx } from '../lib/sfx.js';
import { clamp, wrapIndex } from '../lib/utils.js';
import { STAT_KEYS, STAT_NAMES } from '../data/constants.js';

const MIN = 0;
const MAX = 20;
const fmtMod = (v) => {
  const m = Math.floor((v - 10) / 2);
  return m >= 0 ? `+${m}` : `${m}`;
};

/**
 * Módulo 2 — Asignación de características (0–20).
 *   ↑↓ -> elegir característica / fila Guardar
 *   ←→ -> subir/bajar el valor a mano (0–20)
 *   X  -> "Tirar Stat" (abre StatRoller 4d6 para la fila enfocada)
 *   A  -> Guardar (en la fila inferior)
 *   B  -> Atrás
 *
 * Mientras el StatRoller está abierto, ESTE input se desactiva (enabled:false),
 * así el foco queda 100% en el roller y la navegación no se rompe.
 */
export default function StatAssignStep({ title = 'CREAR · STATS', initial, onConfirm, onBack }) {
  const [values, setValues] = useState(
    () => initial || Object.fromEntries(STAT_KEYS.map((k) => [k, 10]))
  );
  const [sel, setSel] = useState(0);
  const [rolling, setRolling] = useState(null); // statKey en curso de tirada

  const saveRow = STAT_KEYS.length;
  const onSaveRow = sel === saveRow;

  const move = (n) => {
    sfx.move();
    setSel(n);
  };

  const adjust = (dir) => {
    if (onSaveRow) return;
    const k = STAT_KEYS[sel];
    const next = clamp(values[k] + dir, MIN, MAX);
    if (next === values[k]) return sfx.error();
    sfx.tick();
    setValues((v) => ({ ...v, [k]: next }));
  };

  useGamepad(
    {
      onUp: () => move(wrapIndex(sel - 1, STAT_KEYS.length + 1)),
      onDown: () => move(wrapIndex(sel + 1, STAT_KEYS.length + 1)),
      onLeft: () => adjust(-1),
      onRight: () => adjust(1),
      onX: () => {
        if (!onSaveRow) {
          sfx.open();
          setRolling(STAT_KEYS[sel]);
        }
      },
      onA: () => {
        if (onSaveRow) {
          sfx.open();
          onConfirm?.(values);
        } else sfx.error();
      },
      onB: onBack,
    },
    { enabled: !rolling }
  );

  return (
    <Frame
      title={title}
      icon="dice"
      hints={
        rolling
          ? [['←→', 'Dado'], ['A', 'Elegir'], ['X', 'Re-tirar'], ['B', 'Cancelar']]
          : [['↑↓', 'Elegir'], ['←→', '-/+'], ['X', 'Tirar 4d6'], ['A', 'Guardar']]
      }
    >
      {rolling ? (
        <StatRoller
          statLabel={STAT_NAMES[rolling]}
          onResult={(sum) => {
            setValues((v) => ({ ...v, [rolling]: clamp(sum, MIN, MAX) }));
            setRolling(null);
          }}
          onCancel={() => {
            sfx.back();
            setRolling(null);
          }}
        />
      ) : (
        <div className="flex h-full flex-col p-3">
          <p className="mb-2 font-press text-[8px] text-gold/70">
            ←→ AJUSTA · <kbd className="rounded-sm bg-sky px-1 text-abyss">X</kbd> TIRA 4d6
          </p>

          <div className="flex min-h-0 flex-1 flex-col gap-1">
            {STAT_KEYS.map((k, idx) => {
              const active = idx === sel;
              const v = values[k];
              return (
                <div
                  key={k}
                  className={[
                    'flex items-center gap-2 rounded border-2 px-2 py-1',
                    active ? 'border-goldLight bg-gold/15' : 'border-transparent',
                  ].join(' ')}
                >
                  <Cursor visible={active} />
                  <div className="w-32 font-vt text-lg leading-none">
                    <div className={active ? 'text-goldLight' : 'text-parchment/85'}>{STAT_NAMES[k]}</div>
                    <div className="font-press text-[7px] text-gold/60">{k}</div>
                  </div>
                  <div className="h-3 flex-1 overflow-hidden rounded-sm border border-bronze/50 bg-stoneDark">
                    <div className="h-full bg-gradient-to-r from-bronze to-gold" style={{ width: `${(v / MAX) * 100}%` }} />
                  </div>
                  <div className="flex w-24 items-center justify-end gap-1 font-press text-sm">
                    <span className={active && v > MIN ? 'text-gold' : 'text-transparent'}>◀</span>
                    <span className={active ? 'text-goldLight' : 'text-parchment'}>{v}</span>
                    <span className={active && v < MAX ? 'text-gold' : 'text-transparent'}>▶</span>
                    <span className="ml-1 w-7 text-right text-moss">{fmtMod(v)}</span>
                  </div>
                </div>
              );
            })}

            {/* Fila Guardar */}
            <div
              className={[
                'mt-1 flex items-center justify-center gap-2 rounded border-2 px-2 py-2 font-press text-[11px]',
                onSaveRow ? 'border-goldLight bg-gold text-ink shadow-bevel' : 'border-moss/60 text-moss',
              ].join(' ')}
            >
              <Cursor visible={onSaveRow} className={onSaveRow ? 'text-ink' : ''} />
              ✓ CONFIRMAR STATS
            </div>
          </div>
        </div>
      )}
    </Frame>
  );
}
