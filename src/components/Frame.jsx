import { useEffect, useState } from 'react';

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
  return (
    <header className="flex h-9 shrink-0 items-center justify-between border-b-2 border-gold/70 bg-gradient-to-b from-stone to-stoneDark px-3 shadow-bevel">
      <div className="flex items-center gap-2 font-press text-[10px] text-goldLight text-pixel-shadow">
        {icon ? <span className="text-sm leading-none">{icon}</span> : null}
        <span>{title}</span>
      </div>
      <div className="flex items-center gap-2 font-press text-[8px] text-gold/80">
        <span>{clock}</span>
        <span className="text-moss" title="batería">▮▮▮▯</span>
      </div>
    </header>
  );
}

// Indicadores de control de la vista actual + recordatorio de globales.
function HintBar({ hints = [] }) {
  return (
    <footer className="flex h-7 shrink-0 items-center justify-between border-t-2 border-bronze bg-stoneDark px-3 font-press text-[8px]">
      <div className="flex items-center gap-3 text-parchment/85">
        {hints.map(([key, label]) => (
          <span key={key + label} className="flex items-center gap-1">
            <kbd className="rounded-sm bg-gold px-1 py-0.5 text-ink">{key}</kbd>
            <span>{label}</span>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-2 text-gold/55">
        <span>Start·Menú</span>
        <span>Y·d20</span>
        <span>Sel·Tema</span>
      </div>
    </footer>
  );
}

/**
 * Chrome común de las apps: barra de título arriba e indicadores de control
 * abajo, con el área de contenido en medio.
 */
export default function Frame({ title, icon, hints, children }) {
  return (
    <div className="flex h-full w-full flex-col bg-abyss text-parchment">
      <TopBar title={title} icon={icon} />
      <main className="relative min-h-0 flex-1">{children}</main>
      <HintBar hints={hints} />
    </div>
  );
}
