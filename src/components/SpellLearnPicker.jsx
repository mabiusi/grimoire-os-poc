import { useEffect, useMemo, useRef, useState } from 'react';
import PixelIcon from './PixelIcon.jsx';
import Cursor from './Cursor.jsx';
import { Layer } from '../context/InputContext.jsx';
import { useGamepad } from '../hooks/useGamepad.js';
import { useGrimoireStore } from '../store/useGrimoireStore.js';
import { sfx } from '../lib/sfx.js';
import { clamp, wrapIndex } from '../lib/utils.js';
import { focusRow } from '../lib/focus.js';

const MAX_LVL = 9;
const tierName = (l) => (l === 0 ? 'Trucos' : `Nivel ${l}`);

/**
 * Explorador para APRENDER cualquier conjuro fuera de la subida de nivel
 * (pergaminos, premios...). Pop-up sobre el panel de la ficha (capa OVERLAY que
 * captura la entrada). Navega por NIVEL de conjuro con L/R (no hay tope: se puede
 * aprender cualquiera). A aprende/olvida; B cierra.
 */
export default function SpellLearnPicker({ charId, onClose }) {
  const char = useGrimoireStore((s) => s.characters.find((c) => c.id === charId));
  const db = useGrimoireStore((s) => s.db);
  const toggleSpellKnown = useGrimoireStore((s) => s.toggleSpellKnown);
  const [tier, setTier] = useState(0);
  const [sel, setSel] = useState(0);
  const activeRef = useRef(null);

  const list = useMemo(
    () => db.spells.filter((s) => s.level === tier).sort((a, b) => a.name.localeCompare(b.name)),
    [db, tier]
  );
  const known = new Set(char?.spells?.knownIds || []);

  useEffect(() => { activeRef.current?.scrollIntoView({ block: 'nearest' }); }, [sel, tier]);

  const changeTier = (d) => { sfx.tab(); setTier((t) => clamp(t + d, 0, MAX_LVL)); setSel(0); };

  useGamepad(
    {
      onUp: () => { sfx.move(); setSel((s) => wrapIndex(s - 1, list.length || 1)); },
      onDown: () => { sfx.move(); setSel((s) => wrapIndex(s + 1, list.length || 1)); },
      onLeft: () => changeTier(-1),
      onRight: () => changeTier(1),
      onL: () => changeTier(-1),
      onR: () => changeTier(1),
      onA: () => {
        const sp = list[sel];
        if (!sp) return sfx.error();
        toggleSpellKnown(charId, sp.id);
        sfx[known.has(sp.id) ? 'back' : 'tick']();
      },
      onB: () => { sfx.back(); onClose(); },
    },
    { layer: Layer.OVERLAY, capture: true }
  );

  return (
    <div className="absolute inset-0 z-[40] flex items-center justify-center bg-black/70 p-2">
      <div className="flex h-full w-full flex-col rounded-lg border-2 border-gold bg-stoneDark text-chromeText shadow-bevel">
        {/* Cabecera */}
        <div className="flex items-center gap-2 border-b-2 border-gold/70 px-3 py-2">
          <PixelIcon name="spell" size={16} />
          <span className="flex-1 font-press text-hud text-goldLight">APRENDER CONJURO</span>
          <span className="font-press text-hud-xs text-bronze">{known.size} conoc.</span>
        </div>

        {/* Selector de nivel (L/R) */}
        <div className="flex items-center justify-center gap-3 border-b border-bronze/40 py-1.5 font-press text-hud-sm">
          <span className="text-blood">◀ L</span>
          <span className="w-24 text-center text-goldLight">{tierName(tier)}</span>
          <span className="text-blood">R ▶</span>
        </div>

        {/* Lista del nivel actual */}
        <div className="min-h-0 flex-1 overflow-y-auto px-2 py-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {list.length === 0 ? (
            <p className="py-6 text-center font-vt text-body-sm text-bronze">— sin conjuros en este nivel —</p>
          ) : (
            list.map((sp, i) => {
              const active = i === sel;
              const has = known.has(sp.id);
              return (
                <div
                  key={sp.id}
                  ref={active ? activeRef : null}
                  className={['mb-1 flex items-center gap-2 rounded border-2 px-2 py-1', focusRow(active)].join(' ')}
                >
                  <Cursor visible={active} className={active ? 'text-[#2a1c0c]' : ''} />
                  <span className={has ? 'text-moss' : 'text-bronze/50'}>{has ? '☑' : '☐'}</span>
                  <span className="flex-1 font-vt text-lg">{sp.name}</span>
                  <span className="font-vt text-body-sm text-bronze">{sp.school}</span>
                </div>
              );
            })
          )}
        </div>

        {/* Pie de ayuda */}
        <div className="border-t-2 border-gold/50 px-3 py-1.5 text-center font-press text-hud-xs text-gold/70">
          [A] Aprender / Olvidar · [L/R] Nivel · [B] Cerrar
        </div>
      </div>
    </div>
  );
}
