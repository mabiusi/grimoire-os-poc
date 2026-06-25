import { useEffect, useRef, useState } from 'react';
import { useSystem } from '../context/SystemContext.jsx';

// Resolución lógica fija de la pantalla de la QuestBoy (4:3).
export const SCREEN_W = 640;
export const SCREEN_H = 480;

const BEZEL = 12; // relleno de "carcasa" alrededor del tubo
const BORDER = 4; // grosor del borde de la pantalla

// Tamaño natural del conjunto (pantalla + bisel), antes de escalar.
const NAT_W = SCREEN_W + 2 * (BEZEL + BORDER);
const NAT_H = SCREEN_H + 2 * (BEZEL + BORDER);

/**
 * Marco físico de la consola. Escala el lienzo lógico 640x480 para encajar
 * (contain) dentro del contenedor que lo aloja, manteniendo el 4:3 exacto:
 *   - En desktop ese contenedor es toda la ventana -> centrado, negro alrededor.
 *   - En móvil es la mitad superior -> se ajusta al ancho.
 */
export default function Device({ children }) {
  const { settings } = useSystem();
  const boxRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return undefined;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width && height) setScale(Math.min(width / NAT_W, height / NAT_H));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const crt = settings.crt ? 'crt crt-glow scanlines' : '';

  return (
    <div ref={boxRef} className="flex h-full w-full items-center justify-center overflow-hidden bg-black">
      {/* Carcasa exterior */}
      <div
        style={{ width: NAT_W, height: NAT_H, transform: `scale(${scale})` }}
        className="origin-center rounded-[18px] bg-gradient-to-b from-stone to-stoneDark shadow-[0_0_0_3px_#000,0_12px_40px_rgba(0,0,0,0.8)]"
      >
        <div style={{ padding: BEZEL }} className="h-full w-full">
          {/* Pantalla CRT */}
          <div
            style={{ width: SCREEN_W, height: SCREEN_H, borderWidth: BORDER }}
            className={`relative cursor-none overflow-hidden rounded-[6px] border-stoneDark bg-abyss ${crt}`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
