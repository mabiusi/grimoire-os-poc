import { useEffect, useMemo, useRef, useState } from 'react';
import PixelIcon from './PixelIcon.jsx';
import Cursor from './Cursor.jsx';
import { useGrimoireStore } from '../store/useGrimoireStore.js';
import { useGamepad } from '../hooks/useGamepad.js';
import { sfx } from '../lib/sfx.js';
import { clamp, wrapIndex } from '../lib/utils.js';
import { focusRow } from '../lib/focus.js';
import { classOf } from '../store/derive.js';

/**
 * Módulo 3 — Tracker de combate (pestaña dentro del visor).
 *   ↑↓ -> moverse entre filas (HP, Temp, Muerte, Condiciones)
 *   ←→ -> elegir botón dentro de una fila (±HP, ±Temp, marcas de muerte)
 *   A  -> aplicar (curar/dañar/temp) · marcar salvación · alternar condición
 *
 * Lee y muta el STORE, así los cambios se reflejan al instante (incluida la
 * cabecera de la ficha). Conserva el manejo de foco por capas con el visor.
 */
const HP_BTNS = [-5, -1, 1, 5];

export default function CombatTracker({ charId }) {
  const char = useGrimoireStore((s) => s.characters.find((c) => c.id === charId));
  const db = useGrimoireStore((s) => s.db);
  const { applyDamage, heal, addTemp, setHitDiceUsed, setDeathSave, toggleCondition } = useGrimoireStore.getState();
  const cls = classOf(char || {}, db);

  const rows = useMemo(() => {
    const out = [
      { type: 'hp', sub: HP_BTNS.length },
      { type: 'temp', sub: 3 },
      { type: 'hitdice', sub: 2 },
      { type: 'death', sub: 6 },
      { type: 'header' },
    ];
    db.conditions.forEach((c) => out.push({ type: 'cond', id: c.id, sub: 0 }));
    return out;
  }, [db]);
  const navIndices = useMemo(() => rows.map((r, i) => (r.type === 'header' ? -1 : i)).filter((i) => i >= 0), [rows]);

  const [sel, setSel] = useState(0);
  const [sub, setSub] = useState(0);
  const activeRef = useRef(null);
  const row = rows[navIndices[sel]];

  useEffect(() => { activeRef.current?.scrollIntoView({ block: 'nearest' }); }, [sel]);
  if (!char) return null;

  const moveSel = (dir) => { sfx.move(); setSel(wrapIndex(sel + dir, navIndices.length)); setSub(0); };
  const moveSub = (dir) => { if (!row?.sub) return; sfx.tick(); setSub((b) => clamp(b + dir, 0, row.sub - 1)); };

  const act = () => {
    if (!row) return;
    if (row.type === 'hp') {
      const amt = HP_BTNS[sub];
      if (amt < 0) { applyDamage(charId, -amt); sfx.back(); } else { heal(charId, amt); sfx.tick(); }
    } else if (row.type === 'temp') {
      if (sub === 0) addTemp(charId, 1);
      else if (sub === 1) addTemp(charId, 5);
      else addTemp(charId, -char.hp.temp); // reset
      sfx.tick();
    } else if (row.type === 'hitdice') {
      setHitDiceUsed(charId, char.hitDiceUsed + (sub === 0 ? 1 : -1)); // gastar / recuperar
      sfx.tick();
    } else if (row.type === 'death') {
      const type = sub < 3 ? 'success' : 'fail';
      const idx = sub < 3 ? sub : sub - 3;
      const cur = char.deathSaves[type];
      setDeathSave(charId, type, idx < cur ? idx : idx + 1);
      sfx.tick();
    } else if (row.type === 'cond') {
      toggleCondition(charId, row.id);
      sfx.tick();
    }
  };

  useGamepad({
    onUp: () => moveSel(-1),
    onDown: () => moveSel(1),
    onLeft: () => moveSub(-1),
    onRight: () => moveSub(1),
    onA: act,
    // Nota: X queda libre para que el visor lo use como "Subir de Nivel".
  });

  const activeIdx = navIndices[sel];

  return (
    <div className="font-vt text-ink">
      {/* HP grande */}
      <div className="mb-2 flex items-end justify-center gap-2 border-b-2 border-gold pb-2">
        <span className="font-press text-2xl text-blood">{char.hp.current}</span>
        <span className="font-vt text-xl text-bronze">/ {char.hp.max}</span>
        {char.hp.temp > 0 && <span className="font-press text-sm text-sky">+{char.hp.temp} temp</span>}
      </div>

      {/* Fila daño / cura */}
      <Row label="Daño / Cura" active={activeIdx === rows.findIndex((r) => r.type === 'hp')} rowRef={row?.type === 'hp' ? activeRef : null}>
        {HP_BTNS.map((n, i) => (
          <Btn key={n} focused={row?.type === 'hp' && sub === i} tone={n < 0 ? 'blood' : 'moss'}>{n > 0 ? `+${n}` : n}</Btn>
        ))}
      </Row>

      {/* Fila HP temporal */}
      <Row label="HP Temporal" active={activeIdx === rows.findIndex((r) => r.type === 'temp')} rowRef={row?.type === 'temp' ? activeRef : null}>
        {['+1', '+5', '✖0'].map((l, i) => (
          <Btn key={l} focused={row?.type === 'temp' && sub === i} tone="sky">{l}</Btn>
        ))}
      </Row>

      {/* Dados de golpe (descanso corto) */}
      <Row label="Dados Golpe" active={activeIdx === rows.findIndex((r) => r.type === 'hitdice')} rowRef={row?.type === 'hitdice' ? activeRef : null}>
        <Btn focused={row?.type === 'hitdice' && sub === 0} tone="blood">Gastar</Btn>
        <Btn focused={row?.type === 'hitdice' && sub === 1} tone="moss">Recup.</Btn>
        <span className="ml-2 font-press text-[10px] text-bronze">
          {char.level - char.hitDiceUsed}/{char.level} d{cls?.hitDie}
        </span>
      </Row>

      {/* Salvaciones de muerte */}
      <Row label="Salv. Muerte" active={activeIdx === rows.findIndex((r) => r.type === 'death')} rowRef={row?.type === 'death' ? activeRef : null}>
        <span className="mr-1 font-press text-hud-xs text-moss">✓</span>
        {[0, 1, 2].map((i) => (
          <Bubble key={`s${i}`} filled={i < char.deathSaves.success} focused={row?.type === 'death' && sub === i} tone="moss" />
        ))}
        <span className="mx-1 font-press text-hud-xs text-blood">✕</span>
        {[0, 1, 2].map((i) => (
          <Bubble key={`f${i}`} filled={i < char.deathSaves.fail} focused={row?.type === 'death' && sub === 3 + i} tone="blood" />
        ))}
      </Row>

      {/* Condiciones */}
      <h3 className="mb-1 mt-3 border-b-2 border-gold font-press text-hud-sm uppercase text-bronze">Condiciones · [A] alternar</h3>
      {db.conditions.map((cond, i) => {
        const rowIdx = rows.findIndex((r) => r.type === 'cond') + i;
        const active = activeIdx === rowIdx;
        const on = char.conditions.includes(cond.id);
        return (
          <div key={cond.id} ref={active ? activeRef : null} className={`flex items-center gap-2 rounded border-2 px-2 py-0.5 text-lg ${focusRow(active, { onParch: true })}`}>
            <Cursor visible={active} className={active ? 'text-[#2a1c0c]' : ''} />
            <span className={on ? 'text-blood' : 'text-bronze/40'}>{on ? '☑' : '☐'}</span>
            <PixelIcon name={`cond_${cond.id}`} size={16} title={cond.name} />
            <span className={on ? 'font-semibold' : ''}>{cond.name}</span>
          </div>
        );
      })}

      <p className="mt-3 border-t border-bronze/30 pt-2 font-vt text-base text-bronze">
        <kbd className="rounded-sm bg-gold px-1 text-[#2a1c0c]">←→</kbd> elige botón · <kbd className="rounded-sm bg-gold px-1 text-[#2a1c0c]">A</kbd> aplicar
      </p>
    </div>
  );
}

function Row({ label, active, rowRef, children }) {
  return (
    <div ref={rowRef} className={`mb-1 flex items-center gap-2 rounded border-2 px-2 py-1 ${focusRow(active, { onParch: true })}`}>
      <span className="w-24 font-press text-hud-xs text-bronze">{label}</span>
      <div className="flex items-center gap-1.5">{children}</div>
    </div>
  );
}

function Btn({ focused, tone, children }) {
  const toneCls = tone === 'blood' ? 'text-blood' : tone === 'moss' ? 'text-moss' : 'text-sky';
  return (
    <span className={['flex h-7 min-w-9 items-center justify-center rounded border-2 px-1 font-press text-[11px]', focused ? 'border-goldLight bg-goldLight shadow-bevel' : 'border-bronze/50', toneCls].join(' ')}>
      {children}
    </span>
  );
}

function Bubble({ filled, focused, tone }) {
  const fillCls = filled ? (tone === 'moss' ? 'bg-moss text-[#0c0a07]' : 'bg-blood text-[#e9d8b4]') : 'bg-parchmentDark/40 text-bronze';
  return (
    <span className={['flex h-6 w-6 items-center justify-center rounded-full border-2 text-sm', focused ? 'border-goldLight' : 'border-bronze/60', fillCls].join(' ')}>
      {filled ? '●' : '○'}
    </span>
  );
}
