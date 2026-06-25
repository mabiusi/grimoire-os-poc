import { useEffect, useRef, useState } from 'react';
import Frame from '../components/Frame.jsx';
import Cursor from '../components/Cursor.jsx';
import CharacterCreator from './CharacterCreator.jsx';
import { useSystem } from '../context/SystemContext.jsx';
import { useCharacters } from '../context/CharacterContext.jsx';
import { useGamepad } from '../hooks/useGamepad.js';
import { sfx } from '../lib/sfx.js';
import { clamp, wrapIndex } from '../lib/utils.js';

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
  const { roster, addCharacter } = useCharacters();
  const [phase, setPhase] = useState('roster'); // 'roster' | 'view' | 'create'
  const [viewEntry, setViewEntry] = useState(null);

  if (phase === 'view' && viewEntry) {
    return <SheetViewer entry={viewEntry} onBack={() => { sfx.back(); setPhase('roster'); }} />;
  }

  if (phase === 'create') {
    return (
      <CharacterCreator
        onCancel={() => {
          sfx.back();
          setPhase('roster');
        }}
        onComplete={(entry) => {
          addCharacter(entry);
          setViewEntry(entry); // mostramos la ficha recién creada
          setPhase('view');
        }}
      />
    );
  }

  return (
    <Roster
      roster={roster}
      onOpen={(entry) => {
        sfx.open();
        setViewEntry(entry);
        setPhase('view');
      }}
      onCreate={() => {
        sfx.open();
        setPhase('create');
      }}
      onBack={() => {
        sfx.back();
        goBack();
      }}
    />
  );
}

/* --------------------------------------------------------------------- */
function Roster({ roster, onOpen, onCreate, onBack }) {
  // El último índice es la opción "Crear nuevo personaje".
  const total = roster.length + 1;
  const [sel, setSel] = useState(0);
  const activeRef = useRef(null);

  const index = clamp(sel, 0, total - 1);
  const onCreateRow = index === roster.length;

  const move = (n) => {
    sfx.move();
    setSel(n);
  };

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' });
  }, [index]);

  useGamepad({
    onUp: () => move(wrapIndex(index - 1, total)),
    onDown: () => move(wrapIndex(index + 1, total)),
    onA: () => (onCreateRow ? onCreate() : onOpen(roster[index])),
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
      <div className="flex h-full flex-col p-3">
        <p className="mb-2 font-press text-[9px] text-gold/80">
          TUS PERSONAJES <span className="text-gold/50">({roster.length})</span>
        </p>
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {roster.map((entry, i) => {
            const active = i === index;
            return (
              <div
                key={entry.id}
                ref={active ? activeRef : null}
                className={[
                  'flex items-center gap-3 rounded border-2 px-3 py-2 transition-colors',
                  active
                    ? 'border-goldLight bg-gold text-ink shadow-bevel'
                    : 'border-bronze/60 bg-stoneDark text-parchment/80',
                ].join(' ')}
              >
                <Cursor visible={active} className={active ? 'text-ink' : ''} />
                <span className="text-2xl">{entry.icon}</span>
                <div className="leading-tight">
                  <div className="font-vt text-xl">{entry.character.name}</div>
                  <div className="font-press text-[7px] opacity-70">{entry.name}</div>
                </div>
              </div>
            );
          })}

          {/* Fila "Crear nuevo" */}
          <div
            ref={onCreateRow ? activeRef : null}
            className={[
              'flex items-center gap-3 rounded border-2 border-dashed px-3 py-2',
              onCreateRow
                ? 'border-goldLight bg-gold text-ink shadow-bevel'
                : 'border-moss/60 text-moss',
            ].join(' ')}
          >
            <Cursor visible={onCreateRow} className={onCreateRow ? 'text-ink' : ''} />
            <span className="text-2xl">＋</span>
            <div className="font-press text-[10px]">Crear nuevo personaje</div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

/* --------------------------------------------------------------------- */
function SheetViewer({ entry, onBack }) {
  const scrollRef = useRef(null);
  const [tab, setTab] = useState(0);
  const [edges, setEdges] = useState({ top: true, bottom: false });
  const c = entry.character;

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
      title={entry.name.toUpperCase()}
      icon={entry.icon}
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
