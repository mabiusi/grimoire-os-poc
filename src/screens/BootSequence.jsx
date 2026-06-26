import { useEffect, useRef, useState } from 'react';
import PixelIcon from '../components/PixelIcon.jsx';
import { SCREENS, useSystem } from '../context/SystemContext.jsx';
import { useGamepad } from '../hooks/useGamepad.js';
import { useGrimoireStore } from '../store/useGrimoireStore.js';
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
const LOGO_DELAY = 600; // pausa tras las líneas antes de mostrar el logo
const LOGO_HOLD = 4200; // el logo permanece en pantalla para disfrutar la estética

export default function BootSequence() {
  const { reset } = useSystem();
  const loadDatabase = useGrimoireStore((s) => s.loadDatabase);
  const dbProgress = useGrimoireStore((s) => s.progress);
  const [revealed, setRevealed] = useState(0);
  const [phase, setPhase] = useState('console'); // 'console' -> 'logo'
  const timers = useRef([]);

  // Permite saltar el arranque con cualquier botón.
  const skip = () => reset(SCREENS.LAUNCHER);
  useGamepad({ onA: skip, onB: skip, onStart: skip });

  useEffect(() => {
    sfx.boot();
    loadDatabase(); // simula la carga del JSON de la base de conocimiento
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
    timers.current.push(setTimeout(() => setPhase('logo'), afterLines + LOGO_DELAY));
    timers.current.push(
      setTimeout(() => reset(SCREENS.LAUNCHER), afterLines + LOGO_DELAY + LOGO_HOLD)
    );

    return () => timers.current.forEach(clearTimeout);
  }, [reset, loadDatabase]);

  // La barra refleja el progreso real de carga de la base de conocimiento.
  const progress = dbProgress;

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
              <span>CARGANDO BASE 5e</span>
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
          <div className="flex items-center justify-center gap-2">
            <PixelIcon name="book" size={44} />
            <PixelIcon name="spark" size={28} />
          </div>
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
