import { useEffect, useRef, useState } from 'react';
import Frame from './Frame.jsx';
import Cursor from './Cursor.jsx';
import ListSelect from './ListSelect.jsx';
import { useGrimoireStore } from '../store/useGrimoireStore.js';
import { useGamepad } from '../hooks/useGamepad.js';
import { sfx } from '../lib/sfx.js';
import { rollDie, wrapIndex } from '../lib/utils.js';
import { STAT_KEYS, STAT_NAMES } from '../data/constants.js';
import { abilityMod, fmtMod, classOf } from '../store/derive.js';
import { planLevelUp, gainHp, setSubclass, applyAsi, finalizeLevel, hitDieAverage } from '../store/levelup.js';

/**
 * Asistente de subida de nivel. Recorre el `plan` (planLevelUp) y aplica cada
 * paso a una copia del personaje; al terminar llama onComplete(finalChar).
 * Cada paso monta su propio componente (su useGamepad es el único activo).
 */
export default function LevelUpWizard({ char, targetLevel, onComplete, onCancel }) {
  const db = useGrimoireStore((s) => s.db);
  const cls = classOf(char, db);
  const [plan] = useState(() => planLevelUp(char, targetLevel, cls));
  const [stepIndex, setStepIndex] = useState(0);
  const [working, setWorking] = useState(char);
  const finished = useRef(false);

  useEffect(() => {
    if (!finished.current && stepIndex >= plan.length) {
      finished.current = true;
      onComplete(finalizeLevel(working, targetLevel, cls));
    }
  }, [stepIndex, plan.length, working, targetLevel, cls, onComplete]);

  const advance = (updated) => { setWorking(updated); setStepIndex((i) => i + 1); };
  const step = plan[stepIndex];
  if (!step) return null;

  const progress = `Nivel ${step.level} · paso ${stepIndex + 1}/${plan.length}`;

  if (step.kind === 'hp') {
    return <HpStep key={stepIndex} working={working} step={step} progress={progress} onResult={(v) => advance(gainHp(working, v))} onCancel={onCancel} />;
  }
  if (step.kind === 'subclass') {
    const items = cls.subclasses.map((s) => ({
      id: s.id,
      name: s.name,
      desc: (s.featuresByLevel?.[step.level] || []).map((f) => f.name).join(' · ') || 'Subclase',
    }));
    return (
      <ListSelect
        key={stepIndex}
        title={`SUBIR · SUBCLASE (Nv ${step.level})`}
        icon="🎖️"
        prompt="ELIGE TU SUBCLASE"
        items={items}
        onConfirm={(id) => advance(setSubclass(working, id))}
        onBack={onCancel}
      />
    );
  }
  return <AsiStep key={stepIndex} working={working} progress={progress} onResult={(d) => advance(applyAsi(working, d))} onCancel={onCancel} />;
}

/* ----- Paso: Puntos de Vida (tirar dado o promedio) ------------------ */
function HpStep({ working, step, progress, onResult, onCancel }) {
  const { hitDie } = step;
  const avg = hitDieAverage(hitDie);
  const conMod = abilityMod(working.abilities.CON);
  const [mode, setMode] = useState('choose'); // 'choose' | 'rolling' | 'rolled'
  const [sel, setSel] = useState(0); // 0 Tirar · 1 Promedio
  const [display, setDisplay] = useState(hitDie);
  const [roll, setRoll] = useState(null);
  const timers = useRef({});

  useEffect(() => () => { clearInterval(timers.current.i); clearTimeout(timers.current.t); }, []);

  const startRoll = () => {
    setMode('rolling');
    sfx.open();
    timers.current.i = setInterval(() => { setDisplay(rollDie(hitDie)); sfx.roll(); }, 60);
    timers.current.t = setTimeout(() => {
      clearInterval(timers.current.i);
      const r = rollDie(hitDie);
      setDisplay(r);
      setRoll(r);
      setMode('rolled');
      sfx.result();
    }, 800);
  };

  useGamepad({
    onLeft: () => { if (mode === 'choose') { sfx.move(); setSel(0); } },
    onRight: () => { if (mode === 'choose') { sfx.move(); setSel(1); } },
    onA: () => {
      if (mode === 'choose') {
        if (sel === 0) startRoll();
        else { sfx.select(); onResult(avg); }
      } else if (mode === 'rolled') {
        sfx.select();
        onResult(roll);
      }
    },
    onB: onCancel,
  });

  const hints =
    mode === 'rolled'
      ? [['A', `Sumar +${Math.max(1, roll + conMod)}`], ['B', 'Cancelar']]
      : [['←→', 'Opción'], ['A', 'Elegir'], ['B', 'Cancelar']];

  return (
    <Frame title="SUBIR DE NIVEL · PV" icon="❤️" hints={hints}>
      <div className="flex h-full flex-col items-center justify-center p-4">
        <p className="mb-1 font-press text-[9px] text-gold/80">{progress}</p>
        <p className="mb-4 font-vt text-xl text-goldLight">
          Aumento de Puntos de Vida <span className="text-bronze">(d{hitDie} + {fmtMod(conMod)} CON)</span>
        </p>

        {mode === 'choose' ? (
          <div className="flex gap-4">
            <Choice focused={sel === 0} title={`🎲 Tirar d${hitDie}`} note="Al azar" />
            <Choice focused={sel === 1} title={`Promedio ${avg}`} note={`= +${Math.max(1, avg + conMod)} PV`} />
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className={['flex h-28 w-28 items-center justify-center rounded-2xl border-4 font-press text-5xl', mode === 'rolling' ? 'animate-shake border-gold text-parchment' : 'border-goldLight text-moss'].join(' ')}>
              {display}
            </div>
            {mode === 'rolled' && (
              <p className="mt-4 font-vt text-2xl text-goldLight">
                +{Math.max(1, roll + conMod)} PV <span className="text-bronze text-lg">(A para sumar)</span>
              </p>
            )}
          </div>
        )}
      </div>
    </Frame>
  );
}

function Choice({ focused, title, note }) {
  return (
    <div className={['flex w-40 flex-col items-center rounded-lg border-2 px-3 py-4 font-press', focused ? 'border-goldLight bg-gold text-ink shadow-bevel' : 'border-bronze/60 bg-stoneDark text-parchment/80'].join(' ')}>
      <span className="text-[11px]">{title}</span>
      <span className="mt-2 font-vt text-base opacity-80">{note}</span>
    </div>
  );
}

/* ----- Paso: Mejora de Puntuación (ASI, repartir 2 puntos) ----------- */
function AsiStep({ working, progress, onResult, onCancel }) {
  const [deltas, setDeltas] = useState(() => Object.fromEntries(STAT_KEYS.map((k) => [k, 0])));
  const [sel, setSel] = useState(0);
  const spent = STAT_KEYS.reduce((a, k) => a + deltas[k], 0);
  const left = 2 - spent;
  const saveRow = STAT_KEYS.length;
  const onSave = sel === saveRow;

  const adjust = (dir) => {
    if (onSave) return;
    const k = STAT_KEYS[sel];
    const cur = deltas[k];
    if (dir > 0) {
      if (left <= 0 || working.abilities[k] + cur >= 20) return sfx.error();
      sfx.tab();
      setDeltas((d) => ({ ...d, [k]: cur + 1 }));
    } else {
      if (cur <= 0) return sfx.error();
      sfx.tab();
      setDeltas((d) => ({ ...d, [k]: cur - 1 }));
    }
  };

  useGamepad({
    onUp: () => { sfx.move(); setSel(wrapIndex(sel - 1, STAT_KEYS.length + 1)); },
    onDown: () => { sfx.move(); setSel(wrapIndex(sel + 1, STAT_KEYS.length + 1)); },
    onLeft: () => adjust(-1),
    onRight: () => adjust(1),
    onA: () => { if (onSave) { if (left !== 0) return sfx.error(); sfx.open(); onResult(deltas); } else sfx.error(); },
    onB: onCancel,
  });

  return (
    <Frame title="SUBIR DE NIVEL · MEJORA" icon="💪" hints={[['↑↓', 'Stat'], ['←→', '-/+'], ['A', 'Guardar'], ['B', 'Cancelar']]}>
      <div className="flex h-full flex-col p-3">
        <div className="mb-2 flex items-center justify-between rounded border-2 border-bronze bg-stoneDark px-3 py-1.5">
          <span className="font-vt text-lg text-goldLight">{progress}</span>
          <span className="font-press text-[10px] text-gold">PUNTOS: <span className={left > 0 ? 'text-moss' : 'text-parchment/60'}>{left}</span>/2</span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-1">
          {STAT_KEYS.map((k, idx) => {
            const active = idx === sel;
            const base = working.abilities[k];
            const val = base + deltas[k];
            return (
              <div key={k} className={['flex items-center gap-2 rounded border-2 px-2 py-1', active ? 'border-goldLight bg-gold/15' : 'border-transparent'].join(' ')}>
                <Cursor visible={active} />
                <span className="w-32 font-vt text-lg">{STAT_NAMES[k]} <span className="font-press text-[7px] text-gold/60">{k}</span></span>
                <div className="flex flex-1 items-center justify-end gap-2 font-press text-sm">
                  <span className="text-parchment/60">{base}</span>
                  {deltas[k] > 0 && <span className="text-moss">+{deltas[k]} →</span>}
                  <span className={active ? 'text-goldLight' : 'text-parchment'}>{val}</span>
                  <span className="ml-1 w-7 text-right text-moss">{fmtMod(abilityMod(val))}</span>
                </div>
              </div>
            );
          })}

          <div className={['mt-1 flex items-center justify-center gap-2 rounded border-2 px-2 py-2 font-press text-[11px]', onSave ? 'border-goldLight bg-gold text-ink shadow-bevel' : 'border-moss/60 text-moss'].join(' ')}>
            <Cursor visible={onSave} className={onSave ? 'text-ink' : ''} />
            ✓ CONFIRMAR MEJORA {left > 0 && <span className="font-vt text-base opacity-70">(faltan {left})</span>}
          </div>
        </div>
      </div>
    </Frame>
  );
}
