import { useEffect, useRef, useState } from 'react';
import Frame from './Frame.jsx';
import Cursor from './Cursor.jsx';
import { useGamepad } from '../hooks/useGamepad.js';
import { sfx } from '../lib/sfx.js';
import { wrapIndex } from '../lib/utils.js';

/**
 * Módulo 3 — Lista de selección ÚNICA (Especie, Clase, Trasfondo...).
 *   ↑↓ -> mover · A -> confirmar · B -> atrás
 *
 * `items`: [{ id, name, desc }]. Llama onConfirm(id).
 */
export default function ListSelect({ title, icon, prompt, items, initialId, onConfirm, onBack }) {
  const start = Math.max(0, items.findIndex((i) => i.id === initialId));
  const [sel, setSel] = useState(start);
  const activeRef = useRef(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' });
  }, [sel]);

  const move = (n) => {
    sfx.move();
    setSel(n);
  };

  useGamepad({
    onUp: () => move(wrapIndex(sel - 1, items.length)),
    onDown: () => move(wrapIndex(sel + 1, items.length)),
    onA: () => {
      const it = items[sel];
      if (!it) return;
      sfx.open();
      onConfirm?.(it.id);
    },
    onB: onBack,
  });

  return (
    <Frame
      title={title}
      icon={icon}
      hints={[
        ['↑↓', 'Elegir'],
        ['A', 'Confirmar'],
        ['B', 'Atrás'],
      ]}
    >
      <div className="flex h-full flex-col p-3">
        {prompt && <p className="mb-2 font-press text-[9px] text-gold/80">{prompt}</p>}
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((it, i) => {
            const active = i === sel;
            return (
              <div
                key={it.id}
                ref={active ? activeRef : null}
                className={[
                  'rounded border-2 px-3 py-2 transition-colors',
                  active
                    ? 'border-goldLight bg-gold text-ink shadow-bevel'
                    : 'border-bronze/60 bg-stoneDark text-parchment/80',
                ].join(' ')}
              >
                <div className="flex items-center gap-2">
                  <Cursor visible={active} className={active ? 'text-ink' : ''} />
                  <span className="font-press text-[11px]">{it.name}</span>
                </div>
                {it.desc && (
                  <p className={`ml-6 font-vt text-base leading-tight ${active ? 'text-ink/80' : 'text-parchment/55'}`}>
                    {it.desc}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Frame>
  );
}
