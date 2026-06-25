import { useEffect, useRef, useState } from 'react';
import { SCREENS, useSystem } from '../context/SystemContext.jsx';
import { useGamepad } from '../hooks/useGamepad.js';
import { sfx } from '../lib/sfx.js';

// Líneas estilo consola de comandos cargando "módulos mágicos".
const LINES = [
  'GRIMOIRE OS  v0.1.0',
  '(c) Arcanum Systems  ·  QuestBoy',
  '',
  '> Inicializando nucleo arcano......... OK',
  '> Montando cristal de memoria........ OK',
  '> Cargando modulo de dados........... OK',
  '> Conjurando grimorio de reglas...... OK',
  '> Despertando espiritus de tinta..... OK',
  '> Calibrando runas de entrada........ OK',
  '> Enlazando flujo de Mana............ OK',
  '',
  'Sistema listo.',
];

const LINE_DELAY = 180; // ms entre líneas

export default function BootSequence() {
  const { reset } = useSystem();
  const [revealed, setRevealed] = useState(0);
  const [phase, setPhase] = useState('console'); // 'console' -> 'logo'
  const timers = useRef([]);

  // Permite saltar el arranque con cualquier botón.
  const skip = () => reset(SCREENS.LAUNCHER);
  useGamepad({ onA: skip, onB: skip, onStart: skip });

  useEffect(() => {
    sfx.boot();
    // Revela las líneas una a una.
    for (let i = 1; i <= LINES.length; i++) {
      timers.current.push(
        setTimeout(() => {
          setRevealed(i);
          sfx.tick();
        }, i * LINE_DELAY)
      );
    }
    // Tras las líneas, muestra el logo y luego entra al launcher.
    const afterLines = LINES.length * LINE_DELAY;
    timers.current.push(setTimeout(() => setPhase('logo'), afterLines + 350));
    timers.current.push(setTimeout(() => reset(SCREENS.LAUNCHER), afterLines + 1600));

    return () => timers.current.forEach(clearTimeout);
  }, [reset]);

  const progress = Math.round((revealed / LINES.length) * 100);

  return (
    <div className="flex h-full w-full flex-col bg-abyss p-5 font-vt text-moss">
      {phase === 'console' ? (
        <>
          <div className="flex-1 text-[19px] leading-tight">
            {LINES.slice(0, revealed).map((line, i) => (
              <div
                key={i}
                className={
                  line.includes('OK')
                    ? 'text-moss'
                    : line.startsWith('GRIMOIRE')
                    ? 'mb-1 text-goldLight'
                    : 'text-parchment/80'
                }
              >
                {line || ' '}
                {line.includes('OK') ? <span className="text-gold"> ✦</span> : null}
              </div>
            ))}
            <span className="animate-blink text-goldLight">█</span>
          </div>

          {/* Barra de carga de "módulos mágicos". */}
          <div className="mt-3">
            <div className="mb-1 flex justify-between font-press text-[8px] text-gold/80">
              <span>CARGANDO MODULOS</span>
              <span>{progress}%</span>
            </div>
            <div className="h-4 w-full border-2 border-bronze bg-stoneDark p-0.5">
              <div
                className="h-full bg-gradient-to-r from-bronze to-gold transition-[width] duration-150"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </>
      ) : (
        // Logo final antes de entrar al menú.
        <div className="flex flex-1 animate-popin flex-col items-center justify-center text-center">
          <div className="text-5xl">📖✦</div>
          <h1 className="mt-4 font-press text-2xl leading-relaxed text-goldLight text-pixel-shadow">
            GRIMOIRE
            <br />
            <span className="text-gold">OS</span>
          </h1>
          <p className="mt-4 font-vt text-xl text-parchment/70">Herramientas para aventureros</p>
          <p className="mt-6 animate-blink font-press text-[8px] text-moss">
            ▶ PULSA Z PARA COMENZAR
          </p>
        </div>
      )}
    </div>
  );
}
