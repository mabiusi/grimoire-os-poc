import Cursor from './Cursor.jsx';

/**
 * Pestañas estándar "L [tabs] R" con foco unificado + cursor ▶ (segundo canal).
 * Bloque compartido por el Visor de personaje (CharacterSheets) y el Grimorio
 * (RuleGrimoire), que antes lo duplicaban inline.
 */
export default function Tabs({ tabs, active, className = '' }) {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <span className="px-1 font-press text-hud-sm text-label/70">L</span>
      {tabs.map((label, i) => {
        const on = i === active;
        return (
          <div
            key={label}
            className={[
              'flex flex-1 items-center justify-center gap-0.5 rounded-t border-b-2 px-1 py-1.5 text-center font-press text-hud-sm',
              on ? 'border-goldLight bg-gold text-[#2a1c0c]' : 'border-borderDim bg-stoneDark text-chromeText',
            ].join(' ')}
          >
            <Cursor visible={on} className={`text-[9px] ${on ? 'text-[#2a1c0c]' : ''}`} />
            <span>{label}</span>
          </div>
        );
      })}
      <span className="px-1 font-press text-hud-sm text-label/70">R</span>
    </div>
  );
}
