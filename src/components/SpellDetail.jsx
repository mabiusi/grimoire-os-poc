import PixelIcon from './PixelIcon.jsx';
import GrimoireTextRenderer from './GrimoireTextRenderer.jsx';
import { Layer } from '../context/InputContext.jsx';
import { useGamepad } from '../hooks/useGamepad.js';
import { useGrimoireStore } from '../store/useGrimoireStore.js';
import { sfx } from '../lib/sfx.js';

/**
 * Ventana de DETALLE de un conjuro/truco (pop-up sobre el panel de la ficha).
 * Se abre al seleccionar (A) una fila en la pestaña de Magia. Captura toda la
 * entrada (capa OVERLAY): A prepara/quita (no aplica a trucos), B cierra.
 */
export default function SpellDetail({ charId, spell, onClose }) {
  const char = useGrimoireStore((s) => s.characters.find((c) => c.id === charId));
  const toggleSpellPrepared = useGrimoireStore((s) => s.toggleSpellPrepared);
  const isCantrip = spell.level === 0;
  const prepared = !!char?.spells?.preparedIds?.includes(spell.id);

  useGamepad(
    {
      onA: () => {
        if (isCantrip) return sfx.error();
        toggleSpellPrepared(charId, spell.id);
        sfx.tick();
      },
      onB: () => { sfx.back(); onClose(); },
    },
    { layer: Layer.OVERLAY, capture: true }
  );

  return (
    <div className="absolute inset-0 z-[40] flex items-center justify-center bg-black/70 p-3">
      <div className="flex max-h-full w-full flex-col rounded-lg border-2 border-gold bg-stoneDark text-chromeText shadow-bevel">
        {/* Cabecera */}
        <div className="flex items-center gap-2 border-b-2 border-gold/70 px-3 py-2">
          <PixelIcon name="spell" size={18} />
          <div className="min-w-0 flex-1">
            <div className="font-press text-hud leading-relaxed text-goldLight">{spell.name}</div>
            <div className="font-vt text-body-sm text-bronze">
              {isCantrip ? 'Truco' : `Nivel ${spell.level}`} · {spell.school}
            </div>
          </div>
          {!isCantrip && (
            <span className={`shrink-0 font-press text-hud-xs ${prepared ? 'text-blood' : 'text-bronze'}`}>
              {prepared ? '★ PREPARADO' : '☆ no prep.'}
            </span>
          )}
        </div>

        {/* Meta + descripción (scrolleable) */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2 font-vt text-body leading-snug [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="mb-2 flex flex-wrap gap-x-4 gap-y-0.5 font-vt text-body-sm text-bronze">
            <span>Tiempo: <span className="text-chromeText">{spell.time}</span></span>
            <span>Alcance: <span className="text-chromeText">{spell.range}</span></span>
          </div>
          <GrimoireTextRenderer text={spell.description} />
        </div>

        {/* Pie de ayuda */}
        <div className="border-t-2 border-gold/50 px-3 py-1.5 text-center font-press text-hud-xs text-gold/70">
          {isCantrip ? 'Truco · siempre preparado · [B] Cerrar' : '[A] Preparar / Quitar · [B] Cerrar'}
        </div>
      </div>
    </div>
  );
}
