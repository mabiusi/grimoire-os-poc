import { useEffect, useRef, useState } from 'react';
import { useInput } from '../context/InputContext.jsx';

/**
 * Gamepad Virtual táctil (modo móvil). Cada botón emite hacia el MISMO bus de
 * entrada que el teclado, por lo que las acciones son idénticas. El D-Pad y los
 * gatillos auto-repiten al mantenerse pulsados.
 *
 * Layout: ocupa todo el cuerpo bajo la pantalla. Gatillos L/R arriba (hombros),
 * y el bloque de pulgares (D-Pad · Select/Start · ABXY) anclado abajo para que
 * caiga natural bajo los pulgares. Botones y D-Pad mantienen proporción circular.
 */

function PadButton({ button, repeat = false, className = '', children, label }) {
  const { emit } = useInput();
  const [active, setActive] = useState(false);
  const rep = useRef({ t: 0, i: 0 });

  const press = (e) => {
    e.preventDefault();
    if (active) return;
    setActive(true);
    emit(button);
    if (repeat) {
      rep.current.t = window.setTimeout(() => {
        rep.current.i = window.setInterval(() => emit(button), 90);
      }, 300);
    }
  };

  const release = () => {
    setActive(false);
    window.clearTimeout(rep.current.t);
    window.clearInterval(rep.current.i);
  };

  useEffect(() => release, []);

  return (
    <button
      type="button"
      aria-label={label || button}
      onPointerDown={press}
      onPointerUp={release}
      onPointerLeave={release}
      onPointerCancel={release}
      onContextMenu={(e) => e.preventDefault()}
      className={[
        'relative touch-none select-none border border-black/50 shadow-bevel transition-transform',
        active ? 'scale-95 brightness-150' : 'brightness-100',
        className,
      ].join(' ')}
    >
      {children}
    </button>
  );
}

function DPad() {
  const tip = 'flex items-center justify-center bg-stone text-chromeText text-[15px]';
  return (
    <div className="grid h-[136px] w-[136px] grid-cols-3 grid-rows-3">
      <span />
      <PadButton button="up" repeat label="Arriba" className={`${tip} rounded-t-md`}>
        ▲
      </PadButton>
      <span />
      <PadButton button="left" repeat label="Izquierda" className={`${tip} rounded-l-md`}>
        ◀
      </PadButton>
      <div className="flex items-center justify-center border border-black/50 bg-stone">
        <span className="h-4 w-4 rounded-full bg-stoneDark" />
      </div>
      <PadButton button="right" repeat label="Derecha" className={`${tip} rounded-r-md`}>
        ▶
      </PadButton>
      <span />
      <PadButton button="down" repeat label="Abajo" className={`${tip} rounded-b-md`}>
        ▼
      </PadButton>
      <span />
    </div>
  );
}

function FaceButtons() {
  const base =
    'h-[50px] w-[50px] rounded-full font-press text-[14px] flex items-center justify-center';
  return (
    <div className="grid h-[136px] w-[136px] grid-cols-3 grid-rows-3 place-items-center">
      <span />
      <PadButton button="x" label="X" className={`${base} bg-sky text-[#0c0a07]`}>
        X
      </PadButton>
      <span />
      <PadButton button="y" label="Y" className={`${base} bg-moss text-[#e9d8b4]`}>
        Y
      </PadButton>
      <span />
      <PadButton button="a" label="A" className={`${base} bg-blood text-[#e9d8b4]`}>
        A
      </PadButton>
      <span />
      <PadButton button="b" label="B" className={`${base} bg-[#d8a93a] text-[#2a1c0c]`}>
        B
      </PadButton>
      <span />
    </div>
  );
}

function MiniButton({ button, label, sub }) {
  return (
    <PadButton
      button={button}
      label={label}
      className="flex flex-col items-center rounded-full bg-stone px-4 py-1.5 font-press text-hud-xs leading-tight text-chromeText"
    >
      <span>{label}</span>
      <span className="text-gold/70">{sub}</span>
    </PadButton>
  );
}

export default function VirtualGamepad() {
  return (
    <section
      className="flex h-full w-full flex-col touch-none select-none border-t-4 border-bronze bg-gradient-to-b from-stone to-stoneDark px-4 pt-4"
      style={{ paddingBottom: 'calc(1rem + env(safe-area-inset-bottom))' }}
    >
      {/* Gatillos L / R (hombros, arriba) */}
      <div className="flex justify-between">
        <PadButton
          button="l"
          label="L"
          className="flex flex-col items-center rounded-b-xl rounded-t-sm bg-stone px-9 py-2 font-press text-[12px] text-chromeText"
        >
          <span>L</span>
          <span className="text-hud-xs text-gold/70">◀ PESTAÑA</span>
        </PadButton>
        <PadButton
          button="r"
          label="R"
          className="flex flex-col items-center rounded-b-xl rounded-t-sm bg-stone px-9 py-2 font-press text-[12px] text-chromeText"
        >
          <span>R</span>
          <span className="text-hud-xs text-gold/70">PESTAÑA ▶</span>
        </PadButton>
      </div>

      {/* Bloque de pulgares — anclado abajo (alcance natural del pulgar) */}
      <div className="mt-auto flex items-end justify-between gap-1">
        <DPad />

        {/* Columna central: marca arriba, Select/Start ABAJO */}
        <div className="flex h-[136px] flex-col items-center justify-end gap-2 pb-1">
          <div className="mb-auto pt-1 font-press text-hud-xs tracking-[0.2em] text-gold/70">QUESTBOY</div>
          <div className="flex gap-2.5">
            <MiniButton button="select" label="SELECT" sub="Noche" />
            <MiniButton button="start" label="START" sub="Menú" />
          </div>
        </div>

        <FaceButtons />
      </div>
    </section>
  );
}
