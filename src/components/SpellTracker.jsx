import { useEffect, useMemo, useRef, useState } from 'react';
import Cursor from './Cursor.jsx';
import PixelIcon from './PixelIcon.jsx';
import { useGrimoireStore } from '../store/useGrimoireStore.js';
import { useGamepad } from '../hooks/useGamepad.js';
import { sfx } from '../lib/sfx.js';
import { clamp, wrapIndex } from '../lib/utils.js';
import { focusRow } from '../lib/focus.js';
import { spellOf } from '../store/derive.js';

/**
 * Módulo 4 — Pestaña de Magia (conectada al store).
 *   ↑↓ -> navegar fila "Aprender" / trucos / conjuros / filas de espacios
 *   ←→ -> elegir burbuja dentro de un nivel de espacios
 *   A  -> fila Aprender: abrir explorador · truco/conjuro: ver detalle ·
 *         burbuja: GASTADO/disponible
 *
 * Persiste en el personaje del store (preparedIds, slots.used). El visor
 * conserva L/R (pestañas) y B; este componente gana ↑↓←→/A por recencia.
 */
export default function SpellTracker({ charId, onInspect, onLearn }) {
  const char = useGrimoireStore((s) => s.characters.find((c) => c.id === charId));
  const db = useGrimoireStore((s) => s.db);
  const { setSpellSlotUsed } = useGrimoireStore.getState();
  const magic = char?.spells;

  const rows = useMemo(() => {
    if (!magic) return [];
    const out = [{ type: 'learn' }]; // acción: aprender cualquier conjuro
    const known = magic.knownIds.map((id) => spellOf(id, db)).filter(Boolean);
    const cantrips = known.filter((s) => s.level === 0);
    if (cantrips.length) {
      out.push({ type: 'header', label: 'Trucos (Cantrips)' });
      cantrips.forEach((s) => out.push({ type: 'cantrip', id: s.id, name: s.name }));
    }
    const byLevel = {};
    known.filter((s) => s.level > 0).forEach((s) => { (byLevel[s.level] ||= []).push(s); });
    Object.keys(byLevel).sort().forEach((lvl) => {
      out.push({ type: 'header', label: `Conjuros · Nivel ${lvl}` });
      byLevel[lvl].forEach((s) => out.push({ type: 'spell', id: s.id, name: s.name }));
    });
    const slotLevels = Object.keys(magic.slots || {}).filter((l) => magic.slots[l].total > 0);
    if (slotLevels.length) {
      out.push({ type: 'header', label: 'Espacios de Conjuro' });
      slotLevels.forEach((lvl) => out.push({ type: 'slots', level: Number(lvl), total: magic.slots[lvl].total }));
    }
    return out;
  }, [magic, db]);

  const navIndices = useMemo(() => rows.map((r, i) => (r.type === 'header' ? -1 : i)).filter((i) => i >= 0), [rows]);
  const [sel, setSel] = useState(0);
  const [bubble, setBubble] = useState(0);
  const activeRef = useRef(null);
  const activeRowIndex = navIndices[sel];
  const activeRow = rows[activeRowIndex];

  useEffect(() => { activeRef.current?.scrollIntoView({ block: 'nearest' }); }, [sel]);
  if (!magic) return null;

  const moveSel = (dir) => {
    sfx.move();
    const next = wrapIndex(sel + dir, navIndices.length);
    setSel(next);
    if (rows[navIndices[next]]?.type === 'slots') setBubble(0);
  };
  const moveBubble = (dir) => { if (activeRow?.type !== 'slots') return; sfx.tick(); setBubble((b) => clamp(b + dir, 0, activeRow.total - 1)); };

  const act = () => {
    if (!activeRow) return;
    if (activeRow.type === 'learn') {
      sfx.open();
      onLearn?.();
    } else if (activeRow.type === 'slots') {
      const used = magic.slots[activeRow.level].used;
      setSpellSlotUsed(charId, activeRow.level, bubble < used ? bubble : bubble + 1);
      sfx[bubble < used ? 'tick' : 'back']();
    } else {
      // truco o conjuro -> abrir el detalle (allí se prepara/quita)
      const sp = spellOf(activeRow.id, db);
      if (sp) { sfx.open(); onInspect?.(sp); }
    }
  };

  useGamepad({ onUp: () => moveSel(-1), onDown: () => moveSel(1), onLeft: () => moveBubble(-1), onRight: () => moveBubble(1), onA: act });

  return (
    <div className="font-vt text-ink">
      {rows.map((row, ri) => {
        const active = ri === activeRowIndex;
        if (row.type === 'learn') {
          return (
            <div
              key="learn"
              ref={active ? activeRef : null}
              className={['mb-2 flex items-center gap-2 rounded border-2 border-dashed px-2 py-1 text-lg', active ? focusRow(true) : 'border-moss/60 text-moss'].join(' ')}
            >
              <Cursor visible={active} className={active ? 'text-[#2a1c0c]' : ''} />
              <PixelIcon name="plus" size={16} engrave={active} />
              <span className="font-press text-hud-sm">Aprender conjuro</span>
            </div>
          );
        }
        if (row.type === 'header') {
          return <h3 key={ri} className="mb-1 mt-3 border-b-2 border-gold font-press text-[9px] uppercase tracking-wide text-bronze first:mt-0">{row.label}</h3>;
        }
        if (row.type === 'cantrip') {
          return (
            <div key={ri} ref={active ? activeRef : null} className={`flex items-center gap-2 rounded border-2 px-2 py-0.5 text-lg ${focusRow(active, { onParch: true })}`}>
              <Cursor visible={active} className={active ? 'text-[#2a1c0c]' : ''} />
              <span className="text-arcane">●</span>{row.name}
            </div>
          );
        }
        if (row.type === 'spell') {
          const prep = magic.preparedIds.includes(row.id);
          return (
            <div key={ri} ref={active ? activeRef : null} className={`flex items-center gap-2 rounded border-2 px-2 py-0.5 text-lg ${focusRow(active, { onParch: true })}`}>
              <Cursor visible={active} className={active ? 'text-[#2a1c0c]' : ''} />
              <span className={prep ? 'text-blood' : 'text-bronze/50'}>{prep ? '★' : '☆'}</span>
              <span className={prep ? 'font-semibold' : ''}>{row.name}</span>
              {prep && <span className="ml-auto font-press text-hud-xs text-blood">PREP.</span>}
            </div>
          );
        }
        // slots
        const used = magic.slots[row.level].used;
        return (
          <div key={ri} ref={active ? activeRef : null} className={`flex items-center gap-2 rounded border-2 px-2 py-1 ${focusRow(active, { onParch: true })}`}>
            <Cursor visible={active} className={active ? 'text-[#2a1c0c]' : ''} />
            <span className="w-16 font-press text-hud-xs text-bronze">Nivel {row.level}</span>
            <div className="flex gap-1.5">
              {Array.from({ length: row.total }, (_, b) => {
                const spent = b < used;
                const focused = active && b === bubble;
                return (
                  <span key={b} className={['flex h-6 w-6 items-center justify-center rounded-full border-2 text-sm', focused ? 'border-goldLight' : 'border-bronze/60', spent ? 'bg-bronze/40 text-bronze' : 'bg-parchmentDark/40 text-moss'].join(' ')}>
                    {spent ? '✕' : '◯'}
                  </span>
                );
              })}
            </div>
            <span className="ml-auto font-vt text-base text-bronze">{row.total - used}/{row.total} libres</span>
          </div>
        );
      })}
      <p className="mt-3 border-t border-bronze/30 pt-2 font-vt text-base text-bronze">
        <kbd className="rounded-sm bg-gold px-1 text-[#2a1c0c]">A</kbd> ver detalle · gastar espacio · <kbd className="rounded-sm bg-gold px-1 text-[#2a1c0c]">←→</kbd> elige burbuja
      </p>
    </div>
  );
}
