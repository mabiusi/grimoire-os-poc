import { useEffect, useRef, useState } from 'react';
import Frame from '../components/Frame.jsx';
import DieShape from '../components/DieShape.jsx';
import { useSystem } from '../context/SystemContext.jsx';
import { useGamepad } from '../hooks/useGamepad.js';
import { sfx } from '../lib/sfx.js';
import { rollDie, wrapIndex, clamp } from '../lib/utils.js';

const DICE = [4, 6, 8, 10, 12, 20, 100];
const MAX_PER = 20;
const ROLL_MS = 620; // duración del temblor/ruleta
const TICK_MS = 55; // velocidad del cambio de números
const MODES = { dis: 'Desventaja', normal: 'Normal', adv: 'Ventaja' };

const emptyPool = () => Object.fromEntries(DICE.map((s) => [s, 0]));

// Resuelve la tirada de todo el pool. La Ventaja/Desventaja sólo afecta a d20:
// tira dos y conserva el mayor (Vent) o el menor (Desv), guardando el par.
function executeRoll(pool, mode) {
  const dice = [];
  for (const sides of DICE) {
    for (let i = 0; i < (pool[sides] || 0); i += 1) {
      if (sides === 20 && mode !== 'normal') {
        const a = rollDie(20);
        const b = rollDie(20);
        dice.push({ sides, pair: [a, b], value: mode === 'adv' ? Math.max(a, b) : Math.min(a, b), mode });
      } else {
        dice.push({ sides, value: rollDie(sides) });
      }
    }
  }
  return { dice, total: dice.reduce((s, d) => s + d.value, 0) };
}

export default function DiceRoller() {
  const { goBack } = useSystem();
  const [pool, setPool] = useState(emptyPool);
  const [sel, setSel] = useState(5); // d20 por defecto
  const [mode, setMode] = useState('normal');
  const [phase, setPhase] = useState('build'); // 'build' | 'result'
  const [rolling, setRolling] = useState(false);
  const [result, setResult] = useState(null);
  const [, setSpin] = useState(0); // fuerza el re-render del efecto ruleta
  const timers = useRef({ i: 0, t: 0 });

  const count = DICE.reduce((s, d) => s + pool[d], 0);

  useEffect(() => () => { clearInterval(timers.current.i); clearTimeout(timers.current.t); }, []);

  const addDie = (sides, delta) => {
    setPool((p) => {
      const next = clamp(p[sides] + delta, 0, MAX_PER);
      if (next === p[sides]) { sfx.error(); return p; }
      sfx[delta > 0 ? 'tick' : 'back']();
      return { ...p, [sides]: next };
    });
  };
  const setModeSfx = (m) => { setMode(m); sfx.tab(); };
  const clearPool = () => {
    if (count === 0) { sfx.back(); goBack(); return; } // pool vacío -> salir de la app
    setPool(emptyPool());
    sfx.back();
  };

  const roll = () => {
    if (count === 0) return sfx.error();
    setResult(executeRoll(pool, mode));
    setPhase('result');
    setRolling(true);
    sfx.open();
    timers.current.i = setInterval(() => { setSpin((s) => s + 1); sfx.roll(); }, TICK_MS);
    timers.current.t = setTimeout(() => { clearInterval(timers.current.i); setRolling(false); sfx.result(); }, ROLL_MS);
  };
  const backToBuild = () => { sfx.back(); setPhase('build'); setRolling(false); };

  // Constructor (sólo activo en 'build').
  useGamepad(
    {
      onLeft: () => { sfx.move(); setSel(wrapIndex(sel - 1, DICE.length)); },
      onRight: () => { sfx.move(); setSel(wrapIndex(sel + 1, DICE.length)); },
      onUp: () => addDie(DICE[sel], +1),
      onDown: () => addDie(DICE[sel], -1),
      onA: roll,
      onB: clearPool,
      onL: () => setModeSfx('dis'),
      onR: () => setModeSfx('adv'),
      onY: () => setModeSfx('normal'),
    },
    { enabled: phase === 'build' }
  );
  // Resultado: A/X vuelven al constructor (input bloqueado durante la animación).
  useGamepad({ onA: backToBuild, onB: backToBuild }, { enabled: phase === 'result' && !rolling });

  if (phase === 'result') return <ResultPanel result={result} rolling={rolling} />;

  const summary = DICE.filter((s) => pool[s] > 0).map((s) => `${pool[s]}d${s}`).join(' + ');

  return (
    <Frame
      title="DADOS VIRTUALES"
      icon="🎲"
      hints={[['←→', 'Dado'], ['↑↓', '+/−'], ['A', 'Tirar'], ['X', count ? 'Limpiar' : 'Salir']]}
    >
      <div className="flex h-full flex-col p-3">
        {/* Ventaja / Desventaja (afecta d20) */}
        <div className="mb-1 flex items-center justify-center gap-2">
          <span className="font-press text-[8px] text-gold/50">d20:</span>
          {['dis', 'normal', 'adv'].map((m) => (
            <span
              key={m}
              className={[
                'rounded border-2 px-2 py-0.5 font-press text-[8px]',
                mode === m
                  ? m === 'adv'
                    ? 'border-moss bg-moss text-abyss'
                    : m === 'dis'
                    ? 'border-blood bg-blood text-parchment'
                    : 'border-goldLight bg-gold text-ink'
                  : 'border-bronze/50 text-parchment/55',
              ].join(' ')}
            >
              {m === 'dis' ? 'L·Desv' : m === 'adv' ? 'Vent·R' : 'Y·Norm'}
            </span>
          ))}
        </div>

        {/* Fila de dados disponibles */}
        <div className="flex flex-1 items-center justify-center gap-1">
          {DICE.map((s, i) => (
            <div key={s} className="flex w-[13.5%] flex-col items-center gap-1">
              <span className={`font-press text-[10px] ${pool[s] > 0 ? 'text-goldLight' : 'text-transparent'}`}>×{pool[s]}</span>
              <DieShape sides={s} value={s === 100 ? '%' : s} size={50} active={i === sel} />
              <span className={`font-press text-[8px] ${i === sel ? 'text-goldLight' : 'text-gold/50'}`}>d{s}</span>
            </div>
          ))}
        </div>

        {/* Pool actual */}
        <div className="mt-2 flex h-11 items-center justify-center rounded border-2 border-bronze bg-stoneDark px-3">
          <span className="font-press text-[8px] text-gold/60">POOL:&nbsp;</span>
          <span className="font-press text-sm text-goldLight">{summary || '(vacío)'}</span>
          {mode !== 'normal' && count > 0 && (
            <span className={`ml-3 font-press text-[8px] ${mode === 'adv' ? 'text-moss' : 'text-blood'}`}>{MODES[mode].toUpperCase()}</span>
          )}
        </div>
      </div>
    </Frame>
  );
}

/* --------------------------------------------------------------------- */
function ResultPanel({ result, rolling }) {
  if (!result) return null;
  const rnd = (s) => rollDie(s); // número aleatorio por render mientras rueda
  const breakdown = result.dice.map((d) => `[${d.value}]`).join(' + ');

  return (
    <Frame title="RESULTADO" icon="🎲" hints={[['A / X', 'Volver']]}>
      <div className="flex h-full flex-col p-3">
        <div className="flex flex-1 flex-wrap content-center items-center justify-center gap-2 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {result.dice.map((d, i) => {
            if (d.pair) {
              const [a, b] = d.pair;
              const winIdx = (d.mode === 'adv' ? a >= b : a <= b) ? 0 : 1;
              return (
                <div key={i} className="flex flex-col items-center gap-0.5">
                  <div className="flex gap-1">
                    {[a, b].map((v, j) => (
                      <DieShape
                        key={j}
                        sides={20}
                        value={rolling ? rnd(20) : v}
                        size={58}
                        shaking={rolling}
                        glow={!rolling && j === winIdx}
                        dim={!rolling && j !== winIdx}
                        crossed={!rolling && j !== winIdx}
                      />
                    ))}
                  </div>
                  <span className={`font-press text-[7px] ${d.mode === 'adv' ? 'text-moss' : 'text-blood'}`}>
                    {d.mode === 'adv' ? 'VENTAJA' : 'DESVENTAJA'}
                  </span>
                </div>
              );
            }
            return <DieShape key={i} sides={d.sides} value={rolling ? rnd(d.sides) : d.value} size={58} shaking={rolling} />;
          })}
        </div>

        <div className="mt-2 flex h-24 flex-col items-center justify-center rounded border-2 border-gold bg-stoneDark">
          {rolling ? (
            <span className="animate-blink font-press text-3xl text-gold/70">…</span>
          ) : (
            <>
              <div className="animate-popin font-press text-4xl text-goldLight text-pixel-shadow">{result.total}</div>
              <div className="mt-1 max-w-[92%] truncate font-vt text-lg text-parchment/70">
                {breakdown} = {result.total}
              </div>
            </>
          )}
        </div>
      </div>
    </Frame>
  );
}
