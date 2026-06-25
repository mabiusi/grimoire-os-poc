import { useState } from 'react';
import Frame from '../components/Frame.jsx';
import Cursor from '../components/Cursor.jsx';
import ArcadeNameInput from '../components/ArcadeNameInput.jsx';
import { useGamepad } from '../hooks/useGamepad.js';
import { sfx } from '../lib/sfx.js';
import { wrapIndex } from '../lib/utils.js';
import { CREATION, SYSTEMS, createCharacterEntry, randomName, systemById } from '../data/characters.js';

/**
 * Asistente de Creación de Personaje (solo gamepad, sin teclado de texto):
 *   Paso 1: Selector de Sistema
 *   Paso 2: Nombre Arcade (ArcadeNameInput)
 *   Paso 3: Asignación de Stats (Point Buy)
 *
 * Cada paso monta su propio componente con su useGamepad, así nunca hay dos
 * juegos de handlers activos a la vez.
 */
export default function CharacterCreator({ onCancel, onComplete }) {
  const [step, setStep] = useState('system'); // 'system' | 'name' | 'stats'
  const [systemId, setSystemId] = useState(null);
  const [name, setName] = useState('');

  if (step === 'system') {
    return (
      <SystemPick
        onPick={(id) => {
          setSystemId(id);
          setStep('name');
        }}
        onCancel={onCancel}
      />
    );
  }

  if (step === 'name') {
    const sys = systemById(systemId);
    return (
      <Frame
        title="CREAR · NOMBRE"
        icon={sys.icon}
        hints={[
          ['↑↓', 'Letra'],
          ['←→', 'Posición'],
          ['Y', 'Aleatorio'],
          ['A', 'Confirmar'],
          ['B', 'Atrás'],
        ]}
      >
        <ArcadeNameInput
          length={5}
          initialName={name}
          generateName={() => randomName(systemId)}
          onConfirm={(n) => {
            setName(n);
            setStep('stats');
          }}
          onBack={() => setStep('system')}
        />
      </Frame>
    );
  }

  return (
    <StatAssign
      systemId={systemId}
      name={name}
      onBack={() => setStep('name')}
      onSave={(statValues) => {
        const entry = createCharacterEntry({ systemId, name, statValues });
        onComplete(entry);
      }}
    />
  );
}

/* --------------------------------------------------------------------- */
function SystemPick({ onPick, onCancel }) {
  const [i, setI] = useState(0);
  const move = (n) => {
    sfx.move();
    setI(n);
  };

  useGamepad({
    onUp: () => move(wrapIndex(i - 1, SYSTEMS.length)),
    onDown: () => move(wrapIndex(i + 1, SYSTEMS.length)),
    onA: () => {
      sfx.open();
      onPick(SYSTEMS[i].id);
    },
    onB: onCancel,
  });

  return (
    <Frame
      title="CREAR · SISTEMA"
      icon="🆕"
      hints={[
        ['↑↓', 'Elegir'],
        ['A', 'Continuar'],
        ['B', 'Cancelar'],
      ]}
    >
      <div className="flex h-full flex-col p-4">
        <p className="mb-3 font-press text-[9px] text-gold/80">¿QUÉ AVENTURA TE ESPERA?</p>
        <div className="flex flex-1 flex-col gap-3">
          {SYSTEMS.map((sys, idx) => {
            const active = idx === i;
            return (
              <div
                key={sys.id}
                className={[
                  'flex items-center gap-3 rounded border-2 px-3 py-3 transition-colors',
                  active
                    ? 'border-goldLight bg-gold text-ink shadow-bevel'
                    : 'border-bronze/60 bg-stoneDark text-parchment/80',
                ].join(' ')}
              >
                <Cursor visible={active} className={active ? 'text-ink' : ''} />
                <span className="text-3xl">{sys.icon}</span>
                <div className="leading-tight">
                  <div className="font-press text-[11px]">{sys.genre}</div>
                  <div className="font-vt text-lg opacity-80">{sys.name}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Frame>
  );
}

/* --------------------------------------------------------------------- */
function StatAssign({ systemId, name, onBack, onSave }) {
  const cfg = CREATION[systemId];
  const keys = cfg.statKeys;
  const [values, setValues] = useState(() =>
    Object.fromEntries(keys.map((k) => [k, cfg.base]))
  );
  const [sel, setSel] = useState(0);

  const saveRow = keys.length; // índice de la fila "Guardar"
  const onSaveRow = sel === saveRow;
  const spent = keys.reduce((acc, k) => acc + (values[k] - cfg.base) / cfg.step, 0);
  const remaining = cfg.pool - spent;

  const move = (n) => {
    sfx.move();
    setSel(n);
  };

  const adjust = (dir) => {
    if (onSaveRow) return;
    const k = keys[sel];
    const cur = values[k];
    if (dir > 0) {
      if (cur >= cfg.max || remaining <= 0) return sfx.error();
      sfx.tab();
      setValues((v) => ({ ...v, [k]: cur + cfg.step }));
    } else {
      if (cur <= cfg.base) return sfx.error();
      sfx.tab();
      setValues((v) => ({ ...v, [k]: cur - cfg.step }));
    }
  };

  useGamepad({
    onUp: () => move(wrapIndex(sel - 1, keys.length + 1)),
    onDown: () => move(wrapIndex(sel + 1, keys.length + 1)),
    onLeft: () => adjust(-1),
    onRight: () => adjust(1),
    onA: () => {
      if (onSaveRow) {
        sfx.open();
        onSave(values);
      } else {
        sfx.error();
      }
    },
    onB: onBack,
  });

  const sys = systemById(systemId);

  return (
    <Frame
      title="CREAR · STATS"
      icon={sys.icon}
      hints={[
        ['↑↓', 'Elegir'],
        ['←→', '-/+'],
        ['A', 'Guardar'],
        ['B', 'Atrás'],
      ]}
    >
      <div className="flex h-full flex-col p-3">
        {/* Encabezado: nombre + puntos disponibles */}
        <div className="mb-2 flex items-center justify-between rounded border-2 border-bronze bg-stoneDark px-3 py-1.5">
          <span className="font-vt text-xl text-goldLight">{name || '(sin nombre)'}</span>
          <span className="font-press text-[10px] text-gold">
            PUNTOS: <span className={remaining > 0 ? 'text-moss' : 'text-parchment/60'}>{remaining}</span>/{cfg.pool}
          </span>
        </div>

        {/* Lista de stats */}
        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {keys.map((k, idx) => {
            const active = idx === sel;
            const v = values[k];
            const pct = ((v - cfg.base) / (cfg.max - cfg.base)) * 100;
            return (
              <div
                key={k}
                className={[
                  'flex items-center gap-2 rounded border-2 px-2 py-1',
                  active ? 'border-goldLight bg-gold/15' : 'border-transparent',
                ].join(' ')}
              >
                <Cursor visible={active} />
                <div className="w-28 font-vt text-lg leading-none">
                  <div className={active ? 'text-goldLight' : 'text-parchment/85'}>{cfg.statNames[k]}</div>
                  <div className="font-press text-[7px] text-gold/60">{k}</div>
                </div>
                {/* Barra de valor */}
                <div className="h-3 flex-1 overflow-hidden rounded-sm border border-bronze/50 bg-stoneDark">
                  <div className="h-full bg-gradient-to-r from-bronze to-gold" style={{ width: `${pct}%` }} />
                </div>
                {/* Valor con marcadores -/+ en la fila activa */}
                <div className="flex w-20 items-center justify-end gap-1 font-press text-sm">
                  <span className={active && v > cfg.base ? 'text-gold' : 'text-transparent'}>◀</span>
                  <span className={active ? 'text-goldLight' : 'text-parchment'}>{v}</span>
                  <span className={active && v < cfg.max && remaining > 0 ? 'text-gold' : 'text-transparent'}>▶</span>
                </div>
              </div>
            );
          })}

          {/* Fila Guardar */}
          <div
            className={[
              'mt-1 flex items-center justify-center gap-2 rounded border-2 px-2 py-2 font-press text-[11px]',
              onSaveRow ? 'border-goldLight bg-gold text-ink shadow-bevel' : 'border-moss/60 text-moss',
            ].join(' ')}
          >
            <Cursor visible={onSaveRow} className={onSaveRow ? 'text-ink' : ''} />
            ✓ GUARDAR PERSONAJE
            {remaining > 0 && (
              <span className={`font-vt text-base ${onSaveRow ? 'text-ink/70' : 'text-parchment/50'}`}>
                (quedan {remaining})
              </span>
            )}
          </div>
        </div>
      </div>
    </Frame>
  );
}
