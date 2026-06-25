import { useEffect, useRef, useState } from 'react';
import Frame from './Frame.jsx';
import Cursor from './Cursor.jsx';
import { useGamepad } from '../hooks/useGamepad.js';
import { sfx } from '../lib/sfx.js';
import { wrapIndex } from '../lib/utils.js';

/**
 * Módulo 3 — Lista con CHECKBOXES (Idiomas, Equipo...).
 *   ↑↓ -> mover · A -> marcar/desmarcar (o confirmar en "Continuar") · B -> atrás
 *
 * `items`: [{ id, name, note }]. `max` opcional limita la cantidad marcada.
 * Llama onConfirm(ids[]).
 */
export default function ChecklistSelect({ title, icon, prompt, items, initial = [], max, onConfirm, onBack }) {
  const [checked, setChecked] = useState(() => new Set(initial));
  const [sel, setSel] = useState(0);
  const activeRef = useRef(null);

  const total = items.length + 1; // +1 = fila "Continuar"
  const onContinue = sel === items.length;

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' });
  }, [sel]);

  const move = (n) => {
    sfx.move();
    setSel(n);
  };

  const toggle = () => {
    const item = items[sel];
    if (!item) return; // defensa: fila fuera de rango
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(item.id)) {
        next.delete(item.id);
        sfx.back();
      } else {
        if (max && next.size >= max) {
          sfx.error();
          return prev;
        }
        next.add(item.id);
        sfx.tick();
      }
      return next;
    });
  };

  useGamepad({
    onUp: () => move(wrapIndex(sel - 1, total)),
    onDown: () => move(wrapIndex(sel + 1, total)),
    onA: () => {
      if (onContinue) {
        sfx.open();
        onConfirm?.([...checked]);
      } else {
        toggle();
      }
    },
    onB: onBack,
  });

  return (
    <Frame
      title={title}
      icon={icon}
      hints={[
        ['↑↓', 'Mover'],
        ['A', 'Marcar'],
        ['B', 'Atrás'],
      ]}
    >
      <div className="flex h-full flex-col p-3">
        <div className="mb-2 flex items-center justify-between">
          {prompt && <p className="font-press text-[9px] text-gold/80">{prompt}</p>}
          <span className="font-press text-[8px] text-gold/60">
            {checked.size}
            {max ? `/${max}` : ''} marcados
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((it, i) => {
            const active = i === sel;
            const isChecked = checked.has(it.id);
            return (
              <div
                key={it.id}
                ref={active ? activeRef : null}
                className={[
                  'flex items-center gap-2 rounded border-2 px-3 py-1.5 transition-colors',
                  active ? 'border-goldLight bg-gold/20' : 'border-bronze/50 bg-stoneDark',
                ].join(' ')}
              >
                <Cursor visible={active} />
                <span className={`font-press text-sm ${isChecked ? 'text-moss' : 'text-parchment/40'}`}>
                  {isChecked ? '☑' : '☐'}
                </span>
                <div className="flex-1 font-vt text-lg leading-tight">
                  <span className={active ? 'text-goldLight' : 'text-parchment/85'}>{it.name}</span>
                  {it.note && <span className="ml-2 text-bronze">{it.note}</span>}
                </div>
              </div>
            );
          })}

          {/* Fila Continuar */}
          <div
            ref={onContinue ? activeRef : null}
            className={[
              'mt-1 flex items-center justify-center gap-2 rounded border-2 px-2 py-2 font-press text-[11px]',
              onContinue ? 'border-goldLight bg-gold text-ink shadow-bevel' : 'border-moss/60 text-moss',
            ].join(' ')}
          >
            <Cursor visible={onContinue} className={onContinue ? 'text-ink' : ''} />
            ✓ CONTINUAR
          </div>
        </div>
      </div>
    </Frame>
  );
}
