import { useEffect, useRef, useState } from 'react';
import Frame from '../components/Frame.jsx';
import Cursor from '../components/Cursor.jsx';
import { useSystem } from '../context/SystemContext.jsx';
import { useGamepad } from '../hooks/useGamepad.js';
import { sfx } from '../lib/sfx.js';
import { rollDie, wrapIndex } from '../lib/utils.js';

const DICE = [4, 6, 8, 10, 12, 20];
const ROLL_MS = 950; // duración de la animación
const TICK_MS = 55; // velocidad del cambio de números

export default function DiceRoller() {
  const { goBack } = useSystem();
  const [dieIndex, setDieIndex] = useState(5); // d20 por defecto
  const [display, setDisplay] = useState(20);
  const [result, setResult] = useState(null);
  const [rolling, setRolling] = useState(false);
  const [history, setHistory] = useState([]);
  const timers = useRef({ interval: null, timeout: null });

  const die = DICE[dieIndex];

  // Limpia cualquier temporizador al desmontar.
  useEffect(() => {
    return () => {
      clearInterval(timers.current.interval);
      clearTimeout(timers.current.timeout);
    };
  }, []);

  const selectDie = (next) => {
    if (rolling) return;
    sfx.move();
    setDieIndex(next);
    setResult(null);
    setDisplay(DICE[next]);
  };

  const roll = () => {
    if (rolling) return;
    setRolling(true);
    setResult(null);
    sfx.open();

    timers.current.interval = setInterval(() => {
      setDisplay(rollDie(die));
      sfx.roll();
    }, TICK_MS);

    timers.current.timeout = setTimeout(() => {
      clearInterval(timers.current.interval);
      const final = rollDie(die);
      setDisplay(final);
      setResult(final);
      setRolling(false);
      sfx.result();
      setHistory((h) => [{ die, value: final }, ...h].slice(0, 6));
    }, ROLL_MS);
  };

  useGamepad({
    onLeft: () => selectDie(wrapIndex(dieIndex - 1, DICE.length)),
    onRight: () => selectDie(wrapIndex(dieIndex + 1, DICE.length)),
    onA: roll,
    onX: roll, // botón X (contextual): repetir tirada con el mismo dado
    onB: () => {
      if (rolling) return;
      sfx.back();
      goBack();
    },
  });

  // Color del resultado: crítico / pifia en d20.
  const isCrit = result === die;
  const isFumble = result === 1;
  const resultColor = isCrit ? 'text-moss' : isFumble ? 'text-blood' : 'text-goldLight';

  return (
    <Frame
      title="DADOS VIRTUALES"
      icon="🎲"
      hints={[
        ['←→', 'Dado'],
        ['A', rolling ? '...' : 'Tirar'],
        ['X', 'Repetir'],
        ['B', 'Atrás'],
      ]}
    >
      <div className="flex h-full flex-col p-3">
        {/* Selector de dados */}
        <div className="flex justify-center gap-2">
          {DICE.map((d, i) => {
            const active = i === dieIndex;
            return (
              <div
                key={d}
                className={[
                  'relative flex h-10 w-12 items-center justify-center rounded border-2 font-press text-[11px] transition-colors',
                  active
                    ? 'border-goldLight bg-gold text-ink shadow-bevel'
                    : 'border-bronze/60 bg-stoneDark text-parchment/70',
                ].join(' ')}
              >
                {active && <Cursor className="absolute -top-4 text-gold" />}
                d{d}
              </div>
            );
          })}
        </div>

        {/* Dado grande / resultado */}
        <div className="flex flex-1 items-center justify-center gap-6">
          <div
            className={[
              'flex h-40 w-40 items-center justify-center rounded-2xl border-4 bg-gradient-to-br from-stone to-stoneDark shadow-bevel',
              rolling ? 'animate-shake border-gold' : 'border-bronze',
              result !== null && !rolling ? 'animate-popin' : '',
            ].join(' ')}
          >
            <span className={`font-press text-5xl ${rolling ? 'text-parchment' : resultColor}`}>
              {display}
            </span>
          </div>

          <div className="w-28">
            <div className="font-press text-[10px] text-gold/80">RESULTADO</div>
            <div className={`font-press text-2xl ${result === null ? 'text-parchment/40' : resultColor}`}>
              {result === null ? '--' : `d${die}=${result}`}
            </div>
            <div className="mt-2 h-5 font-vt text-lg">
              {isCrit && !rolling && <span className="text-moss">¡CRÍTICO!</span>}
              {isFumble && !rolling && <span className="text-blood">¡Pifia!</span>}
            </div>
          </div>
        </div>

        {/* Historial de tiradas */}
        <div className="flex h-12 items-center gap-2 rounded border-2 border-bronze bg-stoneDark px-3">
          <span className="font-press text-[8px] text-gold/70">HIST.</span>
          {history.length === 0 ? (
            <span className="font-vt text-lg text-parchment/40">aún no has tirado</span>
          ) : (
            <div className="flex gap-2 overflow-hidden font-vt text-lg">
              {history.map((h, i) => (
                <span
                  key={i}
                  className={`rounded bg-stone px-2 ${i === 0 ? 'text-goldLight' : 'text-parchment/60'}`}
                >
                  d{h.die}:{h.value}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Frame>
  );
}
