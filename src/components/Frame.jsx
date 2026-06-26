import { useEffect, useState } from 'react';
import ControlBar from './ControlBar.jsx';
import PixelIcon from './PixelIcon.jsx';
import { useSystem } from '../context/SystemContext.jsx';

// Reloj "del sistema" en la barra superior (hora real, formato 24h).
function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 15000);
    return () => clearInterval(id);
  }, []);
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function TopBar({ title, icon }) {
  const clock = useClock();
  const { theme } = useSystem();
  return (
    <header className="flex h-[38px] shrink-0 items-center justify-between border-b-2 border-[color:var(--gr-barBorder)] bg-gradient-to-b from-stone to-stoneDark px-3 shadow-bevel">
      <div className="flex items-center gap-2 font-press text-hud text-label text-pixel-shadow">
        {icon ? <PixelIcon name={icon} size={16} /> : null}
        <span>{title}</span>
      </div>
      <div className="flex items-center gap-2 font-press text-hud-xs text-chromeDim">
        <span>{clock}</span>
        <PixelIcon
          name={theme === 'night' ? 'moon' : 'sun'}
          size={12}
          title={theme === 'night' ? 'Noche' : 'Día'}
        />
      </div>
    </header>
  );
}

/**
 * Chrome común de las apps: barra de título arriba e indicadores de control
 * abajo, con el área de contenido en medio.
 */
export default function Frame({ title, icon, hints, children }) {
  return (
    <div className="flex h-full w-full flex-col bg-abyss text-chromeText">
      <TopBar title={title} icon={icon} />
      <main className="relative min-h-0 flex-1">{children}</main>
      <ControlBar hints={hints} />
    </div>
  );
}
