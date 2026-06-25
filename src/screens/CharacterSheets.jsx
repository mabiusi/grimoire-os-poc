import { useEffect, useRef, useState } from 'react';
import Frame from '../components/Frame.jsx';
import Cursor from '../components/Cursor.jsx';
import { useSystem } from '../context/SystemContext.jsx';
import { useGamepad } from '../hooks/useGamepad.js';
import { sfx } from '../lib/sfx.js';
import { SYSTEMS } from '../data/characters.js';
import { wrapIndex } from '../lib/utils.js';

// Mapa accent -> clase de color (literal, para que Tailwind no lo purgue).
const ACCENT = {
  blood: 'text-blood',
  arcane: 'text-arcane',
  sky: 'text-sky',
  moss: 'text-moss',
  gold: 'text-bronze',
  parchment: 'text-ink',
};

const TABS = ['Stats', 'Inventario', 'Hechizos'];
const SCROLL_STEP = 64;

export default function CharacterSheets() {
  const { goBack } = useSystem();
  const [phase, setPhase] = useState('select'); // 'select' | 'sheet'
  const [sysIndex, setSysIndex] = useState(0);

  if (phase === 'select') {
    return (
      <SystemSelect
        index={sysIndex}
        setIndex={setSysIndex}
        onOpen={() => {
          sfx.open();
          setPhase('sheet');
        }}
        onBack={() => {
          sfx.back();
          goBack();
        }}
      />
    );
  }

  return (
    <SheetViewer
      system={SYSTEMS[sysIndex]}
      onBack={() => {
        sfx.back();
        setPhase('select');
      }}
    />
  );
}

/* --------------------------------------------------------------------- */
function SystemSelect({ index, setIndex, onOpen, onBack }) {
  const move = (next) => {
    sfx.move();
    setIndex(next);
  };

  useGamepad({
    onUp: () => move(wrapIndex(index - 1, SYSTEMS.length)),
    onDown: () => move(wrapIndex(index + 1, SYSTEMS.length)),
    onA: onOpen,
    onB: onBack,
  });

  return (
    <Frame
      title="HOJAS DE PERSONAJE"
      icon="📜"
      hints={[
        ['↑↓', 'Elegir'],
        ['A', 'Abrir'],
        ['B', 'Atrás'],
      ]}
    >
      <div className="flex h-full flex-col p-4">
        <p className="mb-3 font-press text-[9px] text-gold/80">SELECCIONA UN SISTEMA</p>
        <div className="flex flex-1 flex-col gap-3">
          {SYSTEMS.map((sys, i) => {
            const active = i === index;
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
                  <div className="font-press text-[11px]">{sys.name}</div>
                  <div className="font-vt text-lg opacity-80">{sys.subtitle}</div>
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
function SheetViewer({ system, onBack }) {
  const scrollRef = useRef(null);
  const [tab, setTab] = useState(0);
  const [edges, setEdges] = useState({ top: true, bottom: false });
  const c = system.character;

  const updateEdges = () => {
    const el = scrollRef.current;
    if (!el) return;
    setEdges({
      top: el.scrollTop <= 1,
      bottom: el.scrollTop + el.clientHeight >= el.scrollHeight - 1,
    });
  };

  // Al cambiar de pestaña, vuelve arriba y recalcula los bordes de scroll.
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    updateEdges();
  }, [tab]);

  const scrollByStep = (delta) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop += delta;
    sfx.move();
    updateEdges();
  };

  const changeTab = (next) => {
    if (next === tab) return;
    sfx.tab();
    setTab(next);
  };

  useGamepad({
    onUp: () => scrollByStep(-SCROLL_STEP),
    onDown: () => scrollByStep(SCROLL_STEP),
    onL: () => changeTab(wrapIndex(tab - 1, TABS.length)),
    onR: () => changeTab(wrapIndex(tab + 1, TABS.length)),
    onB: onBack,
  });

  return (
    <Frame
      title={system.name.toUpperCase()}
      icon={system.icon}
      hints={[
        ['L/R', 'Pestañas'],
        ['↑↓', 'Scroll'],
        ['B', 'Atrás'],
      ]}
    >
      <div className="flex h-full flex-col p-2">
        {/* Pestañas (L/R) */}
        <div className="mb-2 flex items-center gap-1">
          <span className="px-1 font-press text-[10px] text-gold/70">L</span>
          {TABS.map((label, i) => {
            const active = i === tab;
            return (
              <div
                key={label}
                className={[
                  'flex-1 rounded-t border-b-2 px-2 py-1 text-center font-press text-[9px]',
                  active
                    ? 'border-goldLight bg-gold text-ink'
                    : 'border-bronze/50 bg-stoneDark text-parchment/60',
                ].join(' ')}
              >
                {label}
              </div>
            );
          })}
          <span className="px-1 font-press text-[10px] text-gold/70">R</span>
        </div>

        {/* Panel de pergamino con el contenido de la pestaña activa */}
        <div className="relative min-h-0 flex-1 overflow-hidden rounded border-2 border-gold bg-parchment text-ink shadow-[inset_0_0_30px_rgba(120,80,20,0.25)]">
          <div className="border-b-2 border-gold px-4 py-2">
            <h2 className="font-press text-[12px] leading-relaxed text-blood">{c.name}</h2>
            <p className="font-vt text-lg text-bronze">{c.tagline}</p>
          </div>

          <div
            ref={scrollRef}
            onScroll={updateEdges}
            className="h-[calc(100%-3.25rem)] overflow-y-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {tab === 0 && <StatsTab c={c} />}
            {tab === 1 && <InventoryTab c={c} />}
            {tab === 2 && <SpellsTab c={c} />}
            <div className="h-2" />
          </div>

          {/* Indicadores de scroll */}
          {!edges.top && (
            <div className="pointer-events-none absolute right-2 top-12 animate-blink font-press text-[10px] text-blood">
              ▲
            </div>
          )}
          {!edges.bottom && (
            <div className="pointer-events-none absolute bottom-1 right-2 animate-blink font-press text-[10px] text-blood">
              ▼
            </div>
          )}
        </div>
      </div>
    </Frame>
  );
}

/* ----- Contenido de pestañas ---------------------------------------- */
function Section({ label, children }) {
  return (
    <section className="mb-3">
      <h3 className="mb-1 border-b-2 border-gold font-press text-[9px] uppercase tracking-wide text-bronze">
        {label}
      </h3>
      {children}
    </section>
  );
}

function StatsTab({ c }) {
  return (
    <>
      <Section label="Información">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 font-vt text-lg">
          {c.meta.map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-bronze/30">
              <dt className="text-bronze">{k}</dt>
              <dd className="font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section label="Vitales">
        <div className="grid grid-cols-2 gap-2">
          {c.vitals.map(([k, v, accent]) => (
            <div
              key={k}
              className="flex items-center justify-between rounded border border-bronze/50 bg-parchmentDark/40 px-2 py-1"
            >
              <span className="font-vt text-base text-bronze">{k}</span>
              <span className={`font-press text-[11px] ${ACCENT[accent] || 'text-ink'}`}>{v}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section label="Características">
        <div className="grid grid-cols-4 gap-2">
          {c.stats.map(([label, value, sub]) => {
            const subColor =
              typeof sub === 'string' && sub.startsWith('+')
                ? 'text-moss'
                : typeof sub === 'string' && sub.startsWith('-')
                ? 'text-blood'
                : 'text-bronze';
            return (
              <div
                key={label}
                className="flex flex-col items-center rounded border-2 border-bronze/60 bg-parchmentDark/40 py-1"
              >
                <span className="font-press text-[8px] text-bronze">{label}</span>
                <span className="font-press text-base text-ink">{value}</span>
                <span className={`font-vt text-base ${subColor}`}>{sub}</span>
              </div>
            );
          })}
        </div>
      </Section>

      <Section label="Habilidades">
        <ul className="grid grid-cols-2 gap-x-4 font-vt text-lg">
          {c.skills.map(([k, v]) => (
            <li key={k} className="flex justify-between border-b border-bronze/30">
              <span>{k}</span>
              <span className="font-semibold text-blood">{v}</span>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}

function InventoryTab({ c }) {
  return (
    <Section label="Inventario">
      <ul className="font-vt text-lg leading-snug">
        {c.inventory.map(([name, note]) => (
          <li
            key={name}
            className="flex items-center justify-between gap-2 border-b border-bronze/30 py-0.5"
          >
            <span className="flex items-center gap-2">
              <span className="text-gold">◆</span>
              {name}
            </span>
            <span className="text-bronze">{note}</span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

function SpellsTab({ c }) {
  if (!c.spells || c.spells.length === 0) {
    return (
      <Section label="Hechizos">
        <div className="rounded border-2 border-dashed border-bronze/50 p-4 text-center font-vt text-lg text-bronze">
          ✦ Sin conjuros ✦
          <p className="mt-2 text-base leading-snug">{c.spellsNote}</p>
        </div>
      </Section>
    );
  }
  return (
    <Section label="Hechizos">
      <p className="mb-2 font-vt text-base italic leading-snug text-bronze">{c.spellsNote}</p>
      <ul className="flex flex-col gap-2">
        {c.spells.map(([name, cost, desc]) => (
          <li key={name} className="rounded border border-bronze/50 bg-parchmentDark/40 px-3 py-1.5">
            <div className="flex items-center justify-between font-vt text-lg">
              <span className="font-semibold text-arcane">{name}</span>
              <span className="font-press text-[8px] text-blood">{cost}</span>
            </div>
            <p className="font-vt text-base leading-snug text-ink/80">{desc}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
