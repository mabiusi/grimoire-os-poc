import { useEffect, useMemo, useRef, useState } from 'react';
import { useGamepad } from '../hooks/useGamepad.js';
import { sfx } from '../lib/sfx.js';
import { clamp, wrapIndex } from '../lib/utils.js';

/**
 * Módulo 4 — Pestaña de Magia. Se renderiza DENTRO del visor (panel pergamino).
 *
 *   ↑↓ -> navegar trucos / conjuros / filas de espacios
 *   ←→ -> moverse entre las burbujas de un espacio de conjuro
 *   A (Z) -> conjuro: marca/desmarca PREPARADO · burbuja: GASTADO/disponible
 *
 * El visor (SheetViewer) conserva L/R (pestañas) y B (atrás): como este
 * componente se monta después, sus handlers de ↑↓←→/A ganan por capa/recencia,
 * y al cambiar de pestaña se desmonta y el scroll del visor vuelve a funcionar.
 */
export default function SpellTracker({ magic }) {
  // Construye las filas (con cabeceras no enfocables).
  const rows = useMemo(() => {
    const out = [];
    if (magic.cantrips?.length) {
      out.push({ type: 'header', label: 'Trucos (Cantrips)' });
      magic.cantrips.forEach((name) => out.push({ type: 'cantrip', name }));
    }
    const byLevel = {};
    (magic.spells || []).forEach((s) => {
      (byLevel[s.level] ||= []).push(s.name);
    });
    Object.keys(byLevel)
      .sort()
      .forEach((lvl) => {
        out.push({ type: 'header', label: `Conjuros · Nivel ${lvl}` });
        byLevel[lvl].forEach((name) => out.push({ type: 'spell', name, level: Number(lvl) }));
      });
    const slotLevels = Object.keys(magic.slots || {}).filter((l) => magic.slots[l] > 0);
    if (slotLevels.length) {
      out.push({ type: 'header', label: 'Espacios de Conjuro' });
      slotLevels.forEach((lvl) => out.push({ type: 'slots', level: Number(lvl), count: magic.slots[lvl] }));
    }
    return out;
  }, [magic]);

  const navIndices = useMemo(() => rows.map((r, i) => (r.type === 'header' ? -1 : i)).filter((i) => i >= 0), [rows]);

  const [sel, setSel] = useState(0);
  const [bubble, setBubble] = useState(0);
  const [prepared, setPrepared] = useState(() => new Set());
  const [spent, setSpent] = useState(() => {
    const s = {};
    (Object.keys(magic.slots || {})).forEach((lvl) => {
      if (magic.slots[lvl] > 0) s[lvl] = Array(magic.slots[lvl]).fill(false);
    });
    return s;
  });
  const activeRef = useRef(null);

  const activeRowIndex = navIndices[sel];
  const activeRow = rows[activeRowIndex];

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' });
  }, [sel]);

  const moveSel = (dir) => {
    sfx.move();
    const next = wrapIndex(sel + dir, navIndices.length);
    setSel(next);
    if (rows[navIndices[next]]?.type === 'slots') setBubble(0);
  };

  const moveBubble = (dir) => {
    if (activeRow?.type !== 'slots') return;
    sfx.tick();
    setBubble((b) => clamp(b + dir, 0, activeRow.count - 1));
  };

  const act = () => {
    if (!activeRow) return;
    if (activeRow.type === 'spell') {
      setPrepared((prev) => {
        const next = new Set(prev);
        if (next.has(activeRow.name)) {
          next.delete(activeRow.name);
          sfx.back();
        } else {
          next.add(activeRow.name);
          sfx.tick();
        }
        return next;
      });
    } else if (activeRow.type === 'slots') {
      setSpent((prev) => {
        const arr = [...(prev[activeRow.level] || [])];
        arr[bubble] = !arr[bubble];
        sfx[arr[bubble] ? 'back' : 'tick']();
        return { ...prev, [activeRow.level]: arr };
      });
    } else {
      sfx.tick(); // truco: siempre conocido
    }
  };

  useGamepad({
    onUp: () => moveSel(-1),
    onDown: () => moveSel(1),
    onLeft: () => moveBubble(-1),
    onRight: () => moveBubble(1),
    onA: act,
  });

  return (
    <div className="font-vt text-ink">
      {rows.map((row, ri) => {
        const active = ri === activeRowIndex;
        if (row.type === 'header') {
          return (
            <h3
              key={ri}
              className="mb-1 mt-3 border-b-2 border-gold font-press text-[9px] uppercase tracking-wide text-bronze first:mt-0"
            >
              {row.label}
            </h3>
          );
        }
        if (row.type === 'cantrip') {
          return (
            <div
              key={ri}
              ref={active ? activeRef : null}
              className={`flex items-center gap-2 rounded px-2 py-0.5 text-lg ${active ? 'bg-gold/30' : ''}`}
            >
              <span className="text-arcane">●</span>
              {row.name}
            </div>
          );
        }
        if (row.type === 'spell') {
          const isPrep = prepared.has(row.name);
          return (
            <div
              key={ri}
              ref={active ? activeRef : null}
              className={`flex items-center gap-2 rounded px-2 py-0.5 text-lg ${active ? 'bg-gold/30' : ''}`}
            >
              <span className={isPrep ? 'text-blood' : 'text-bronze/50'}>{isPrep ? '★' : '☆'}</span>
              <span className={isPrep ? 'font-semibold' : ''}>{row.name}</span>
              {isPrep && <span className="ml-auto font-press text-[7px] text-blood">PREP.</span>}
            </div>
          );
        }
        // slots
        const arr = spent[row.level] || [];
        return (
          <div
            key={ri}
            ref={active ? activeRef : null}
            className={`flex items-center gap-2 rounded px-2 py-1 ${active ? 'bg-gold/30' : ''}`}
          >
            <span className="w-16 font-press text-[9px] text-bronze">Nivel {row.level}</span>
            <div className="flex gap-1.5">
              {Array.from({ length: row.count }, (_, b) => {
                const isSpent = arr[b];
                const focused = active && b === bubble;
                return (
                  <span
                    key={b}
                    className={[
                      'flex h-6 w-6 items-center justify-center rounded-full border-2 text-sm',
                      focused ? 'border-goldLight' : 'border-bronze/60',
                      isSpent ? 'bg-bronze/40 text-bronze' : 'bg-parchmentDark/40 text-moss',
                    ].join(' ')}
                  >
                    {isSpent ? '✕' : '◯'}
                  </span>
                );
              })}
            </div>
            <span className="ml-auto font-vt text-base text-bronze">
              {arr.filter((x) => !x).length}/{row.count} libres
            </span>
          </div>
        );
      })}

      <p className="mt-3 border-t border-bronze/30 pt-2 font-vt text-base text-bronze">
        <kbd className="rounded-sm bg-gold px-1 text-ink">A</kbd> marca preparados y gasta espacios ·{' '}
        <kbd className="rounded-sm bg-gold px-1 text-ink">←→</kbd> elige burbuja
      </p>
    </div>
  );
}
