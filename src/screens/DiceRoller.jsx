import { Fragment, useEffect, useRef, useState } from 'react';
import Frame from '../components/Frame.jsx';
import DieShape from '../components/DieShape.jsx';
import { useSystem } from '../context/SystemContext.jsx';
import { useGamepad } from '../hooks/useGamepad.js';
import { sfx } from '../lib/sfx.js';
import { rollDie, wrapIndex, clamp, isReducedMotion } from '../lib/utils.js';

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
  const { goBack, settings } = useSystem();
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
    sfx.open();
    // Movimiento reducido: sin ruleta, el resultado se muestra directo.
    if (isReducedMotion(settings.motion)) { sfx.result(); return; }
    setRolling(true);
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

  return (
    <Frame
      title="DADOS VIRTUALES"
      icon="dice"
      hints={[['←→', 'Dado'], ['↑↓', '+/−'], ['A', 'Tirar'], ['X', count ? 'Limpiar' : 'Salir']]}
    >
      <div className="flex h-full flex-col gap-2 p-3">
        {/* Modo d20 (Ventaja / Desventaja) */}
        <div className="flex items-center justify-center gap-2">
          <span className="font-press text-hud-xs text-bronze">VENTAJA d20</span>
          {[['dis', '◀ L · Desv.'], ['normal', 'Normal'], ['adv', 'Vent. · R ▶']].map(([m, txt]) => (
            <span
              key={m}
              className={`rounded border-2 px-3 py-1 font-press text-hud-sm ${
                mode === m
                  ? m === 'adv'
                    ? 'border-moss bg-moss text-abyss'
                    : m === 'dis'
                    ? 'border-blood bg-blood text-parchment'
                    : 'border-goldLight bg-gold text-ink'
                  : 'border-bronze/50 text-parchment/55'
              }`}
            >
              {txt}
            </span>
          ))}
        </div>

        {/* Paleta (héroe) — llena el centro */}
        <div className="flex flex-1 flex-col rounded border-2 border-bronze/50 bg-stoneDark/40">
          <div className="px-3 pt-1.5 font-press text-hud-xs uppercase tracking-wider text-bronze/80">
            Añadir dados <span className="text-gold/60">· ←→ elegir · ▲▼ cantidad</span>
          </div>
          <div className="flex flex-1 items-center justify-center gap-1 px-2">
            {DICE.map((s, i) => {
              const active = i === sel;
              return (
                <div key={s} className="flex w-[13%] flex-col items-center gap-0.5">
                  <span className={`font-press text-hud-sm leading-none ${active ? 'animate-blink text-gold' : 'text-transparent'}`}>▲</span>
                  <span className={`font-press text-[11px] leading-none ${pool[s] > 0 ? 'text-goldLight' : 'text-transparent'}`}>×{pool[s]}</span>
                  <DieShape sides={s} value={s === 100 ? '%' : s} size={56} active={active} />
                  <span className={`font-press text-hud-xs leading-none ${active ? 'text-goldLight' : 'text-gold/50'}`}>d{s}</span>
                  <span className={`font-press text-hud-sm leading-none ${active ? 'animate-blink text-gold' : 'text-transparent'}`}>▼</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bandeja — TU TIRADA */}
        <div className="rounded border-2 border-gold bg-stoneDark px-3 py-2">
          <div className="flex items-center justify-between">
            <span className="font-press text-hud-xs text-gold/70">TU TIRADA</span>
            <span className="font-press text-[8px] text-bronze">
              {count} dado{count === 1 ? '' : 's'}
              {mode !== 'normal' && count > 0 ? ` · ${MODES[mode].toUpperCase()}` : ''}
            </span>
          </div>
          <div className="mt-1.5 flex items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {count === 0 ? (
                <span className="font-vt text-body-sm text-parchment/40">(vacío)</span>
              ) : (
                DICE.filter((s) => pool[s] > 0).map((s, i) => (
                  <Fragment key={s}>
                    {i > 0 && <span className="font-press text-sm text-bronze">+</span>}
                    <div className="relative flex flex-col items-center">
                      {pool[s] > 1 && <span className="absolute -right-1 -top-1 z-10 rounded-full bg-gold px-1 font-press text-[8px] text-ink">×{pool[s]}</span>}
                      <DieShape sides={s} value={s === 100 ? '%' : s} size={32} />
                      <span className="mt-0.5 font-press text-[8px] text-gold/70">d{s}</span>
                    </div>
                  </Fragment>
                ))
              )}
            </div>
            <span className="flex shrink-0 items-center gap-2 font-press text-[11px] text-goldLight">
              <span className="inline-flex h-[22px] min-w-[22px] items-center justify-center rounded-full bg-blood font-press text-hud-sm text-parchment shadow-bevel">A</span>
              TIRAR
            </span>
          </div>
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
    <Frame title="RESULTADO" icon="dice" hints={[['A / X', 'Volver']]}>
      <div className="flex h-full flex-col gap-2 p-3">
        {/* Bandeja de dados (definida, no flotan) */}
        <div className="flex flex-1 flex-col rounded border-2 border-bronze/50 bg-stoneDark/40">
          <div className="px-3 pt-1.5 font-press text-hud-xs uppercase tracking-wider text-bronze/80">Dados · {result.dice.length}</div>
          <div className="flex flex-1 flex-wrap content-center items-center justify-center gap-5 overflow-y-auto px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {result.dice.map((d, i) => {
              if (d.pair) {
                const [a, b] = d.pair;
                const winIdx = (d.mode === 'adv' ? a >= b : a <= b) ? 0 : 1;
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <div className="flex items-end gap-1.5">
                      {[a, b].map((v, j) => (
                        <DieShape
                          key={j}
                          sides={20}
                          value={rolling ? rnd(20) : v}
                          size={j === winIdx ? 64 : 52}
                          shaking={rolling}
                          glow={!rolling && j === winIdx}
                          dim={!rolling && j !== winIdx}
                          crossed={!rolling && j !== winIdx}
                        />
                      ))}
                    </div>
                    <span className={`font-press text-[8px] ${d.mode === 'adv' ? 'text-moss' : 'text-blood'}`}>
                      d20 · {d.mode === 'adv' ? 'VENTAJA' : 'DESVENTAJA'}
                    </span>
                  </div>
                );
              }
              return (
                <div key={i} className="flex flex-col items-center gap-1">
                  <DieShape sides={d.sides} value={rolling ? rnd(d.sides) : d.value} size={60} shaking={rolling} />
                  <span className="font-press text-[8px] text-bronze">d{d.sides}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* TOTAL héroe */}
        <div className="flex items-center justify-between rounded border-2 border-gold bg-stoneDark px-4 py-2">
          <div className="flex min-w-0 flex-col">
            <span className="font-press text-hud-xs text-gold/70">TOTAL</span>
            {!rolling && <span className="mt-1 truncate font-vt text-body-sm text-parchment/70">{breakdown}</span>}
          </div>
          {rolling ? (
            <span className="animate-blink font-press text-3xl text-gold/70">…</span>
          ) : (
            <span className="animate-popin font-press text-[44px] leading-none text-goldLight text-pixel-shadow">{result.total}</span>
          )}
        </div>
      </div>
    </Frame>
  );
}
