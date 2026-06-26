import { useEffect, useRef, useState } from 'react';
import Frame from '../components/Frame.jsx';
import Cursor from '../components/Cursor.jsx';
import PixelIcon from '../components/PixelIcon.jsx';
import Tabs from '../components/Tabs.jsx';
import GrimoireTextRenderer from '../components/GrimoireTextRenderer.jsx';
import { focusRow } from '../lib/focus.js';
import { useSystem } from '../context/SystemContext.jsx';
import { useGrimoireStore } from '../store/useGrimoireStore.js';
import { useGamepad } from '../hooks/useGamepad.js';
import { sfx } from '../lib/sfx.js';
import { wrapIndex } from '../lib/utils.js';
import { RULE_PAGES } from '../data/rules.js';

const SECTIONS = ['Reglas', 'Enciclopedia'];

/**
 * Grimorio de Reglas con DOS secciones (se alternan con los gatillos L/R):
 *   0) Reglas      -> las 4 "flashcards" de consulta rápida (lector paginado).
 *   1) Enciclopedia-> explorador de la base de conocimiento (store).
 *
 * Foco: el contenedor sólo maneja L/R (cambiar de sección); cada sección monta
 * su propio componente y maneja el resto (←→ / ↑↓ / A / B). Como L/R (gatillos)
 * y ←→ (flechas) son botones distintos, nunca se pisan.
 */
export default function RuleGrimoire() {
  const { goBack } = useSystem();
  const [tab, setTab] = useState(0);

  useGamepad({
    onL: () => { sfx.tab(); setTab((t) => wrapIndex(t - 1, SECTIONS.length)); },
    onR: () => { sfx.tab(); setTab((t) => wrapIndex(t + 1, SECTIONS.length)); },
  });

  const hints =
    tab === 0
      ? [['↑↓', 'Scroll'], ['A', 'Página'], ['L/R', 'Sección'], ['B', 'Salir']]
      : [['↑↓', 'Mover'], ['A', 'Ver'], ['L/R', 'Sección'], ['B', 'Atrás']];

  const exit = () => { sfx.back(); goBack(); };

  return (
    <Frame title="GRIMORIO DE REGLAS" icon="book" hints={hints}>
      <div className="flex h-full flex-col p-2">
        <Tabs tabs={SECTIONS} active={tab} className="mb-2" />

        <div className="min-h-0 flex-1">
          {tab === 0 ? <FlashcardsReader onBack={exit} /> : <Encyclopedia onBack={exit} />}
        </div>
      </div>
    </Frame>
  );
}

/* ===================================================================== *
 * Sección 1 — Flashcards (lector paginado de las 4 reglas)
 * ===================================================================== */
function FlashcardsReader({ onBack }) {
  const [page, setPage] = useState(0);
  const scrollRef = useRef(null);
  const [atBottom, setAtBottom] = useState(true);
  const total = RULE_PAGES.length;
  const current = RULE_PAGES[page];

  const updateEdges = () => {
    const el = scrollRef.current;
    if (el) setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - 1);
  };
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; updateEdges(); }, [page]);

  const next = () => (page < total - 1 ? (sfx.page(), setPage(page + 1)) : sfx.error());
  const prev = () => (page > 0 ? (sfx.page(), setPage(page - 1)) : sfx.error());
  const scroll = (d) => { const el = scrollRef.current; if (el) { el.scrollTop += d; updateEdges(); sfx.move(); } };

  // ↑↓ hacen scroll del texto; A / ←→ pasan de página.
  useGamepad({ onUp: () => scroll(-56), onDown: () => scroll(56), onA: next, onRight: next, onLeft: prev, onB: onBack });

  const isLast = page === total - 1;

  return (
    <div className="flex h-full flex-col rounded border-2 border-gold bg-parchment text-ink shadow-[inset_0_0_30px_rgba(120,80,20,0.25)]">
      <div className="flex items-center justify-between border-b-2 border-gold px-4 py-2">
        <h2 className="font-press text-hud text-blood">{current.title}</h2>
        <span className="font-press text-hud-xs text-bronze">Pág. {page + 1}/{total}</span>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <div
          ref={scrollRef}
          onScroll={updateEdges}
          className="h-full overflow-y-auto px-5 py-3 font-vt text-[21px] leading-snug [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {current.lines.map((line, i) => (
            <p key={i} className={line === '' ? 'h-3' : 'text-ink'}>{line}</p>
          ))}
        </div>
        {!atBottom && <div className="parchment-fade pointer-events-none absolute inset-x-0 bottom-0 h-7" />}
      </div>

      <div className="flex items-center justify-between border-t-2 border-gold px-4 py-2 font-press text-hud-xs text-bronze">
        <span className={page > 0 ? 'text-blood' : 'opacity-30'}>◀ ANT.</span>
        <div className="flex gap-1">
          {RULE_PAGES.map((_, i) => (
            <span key={i} className={i === page ? 'text-blood' : 'text-bronze/40'}>●</span>
          ))}
        </div>
        <span className={!isLast ? 'animate-softpulse text-blood' : 'opacity-30'}>{isLast ? 'FIN ▶' : 'SIG. ▶'}</span>
      </div>
    </div>
  );
}

/* ===================================================================== *
 * Sección 2 — Enciclopedia (explorador de la base de conocimiento)
 * ===================================================================== */
const CATEGORIES = [
  {
    id: 'races',
    name: 'Especies',
    icon: 'race',
    get: (db) => db.races,
    sub: (r) => `${r.speed} m`,
    detail: (r) => ({
      title: r.name,
      subtitle: `Velocidad ${r.speed} m`,
      body: [r.description, '', 'Rasgos:', ...(r.traits || []).map((t) => `• ${t.name}: ${t.desc}`), '', `Idiomas: ${r.languages.join(', ')}`],
    }),
  },
  {
    id: 'classes',
    name: 'Clases',
    icon: 'classsw',
    get: (db) => db.classes,
    sub: (c) => `d${c.hitDie}`,
    detail: (c) => ({
      title: c.name,
      subtitle: `Dado de golpe d${c.hitDie} · Salvaciones: ${c.savingThrows.join(', ')}`,
      body: [
        c.description,
        '',
        'Rasgos de nivel 1:',
        ...(c.featuresByLevel?.[1] || []).map((f) => `• ${f.name}: ${f.desc}`),
        ...(c.spellcasting ? ['', `Lanzador de conjuros (característica: ${c.spellcasting.ability}).`] : []),
      ],
    }),
  },
  {
    id: 'spells',
    name: 'Hechizos',
    icon: 'spell',
    get: (db) => db.spells,
    sub: (s) => (s.level === 0 ? 'Truco' : `Nv ${s.level}`),
    detail: (s) => ({
      title: s.name,
      subtitle: `${s.level === 0 ? 'Truco' : `Nivel ${s.level}`} · ${s.school}`,
      body: [`Tiempo: ${s.time}`, `Alcance: ${s.range}`, `Clases: ${s.classes.join(', ')}`, '', s.description],
    }),
  },
  {
    id: 'bestiary',
    name: 'Bestiario',
    icon: 'beast',
    get: (db) => db.bestiary,
    sub: (b) => `VD ${b.cr}`,
    detail: (b) => ({
      title: b.name,
      subtitle: `${b.type} · Valor de Desafío ${b.cr}`,
      body: [`Clase de Armadura ${b.ac} · Puntos de Vida ${b.hp}`, '', b.description],
    }),
  },
];

const SCROLL_STEP = 56;

function Encyclopedia({ onBack }) {
  const db = useGrimoireStore((s) => s.db);
  const [phase, setPhase] = useState('categories'); // 'categories' | 'items' | 'detail'
  const [catIndex, setCatIndex] = useState(0);
  const [itemIndex, setItemIndex] = useState(0);

  const category = CATEGORIES[catIndex];
  const items = category.get(db);
  const item = items[itemIndex];
  const listRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => { listRef.current?.scrollIntoView({ block: 'nearest' }); }, [catIndex, itemIndex, phase]);

  const scrollText = (delta) => { const el = scrollRef.current; if (el) { el.scrollTop += delta; sfx.move(); } };

  useGamepad({
    onUp: () => {
      if (phase === 'categories') { sfx.move(); setCatIndex(wrapIndex(catIndex - 1, CATEGORIES.length)); }
      else if (phase === 'items') { sfx.move(); setItemIndex(wrapIndex(itemIndex - 1, items.length)); }
      else scrollText(-SCROLL_STEP);
    },
    onDown: () => {
      if (phase === 'categories') { sfx.move(); setCatIndex(wrapIndex(catIndex + 1, CATEGORIES.length)); }
      else if (phase === 'items') { sfx.move(); setItemIndex(wrapIndex(itemIndex + 1, items.length)); }
      else scrollText(SCROLL_STEP);
    },
    onA: () => {
      if (phase === 'categories') { sfx.open(); setItemIndex(0); setPhase('items'); }
      else if (phase === 'items') { sfx.open(); setPhase('detail'); }
    },
    onB: () => {
      if (phase === 'detail') { sfx.back(); setPhase('items'); }
      else if (phase === 'items') { sfx.back(); setPhase('categories'); }
      else onBack();
    },
  });

  if (phase === 'categories') {
    return (
      <div className="flex h-full flex-col">
        <p className="mb-2 font-press text-[9px] text-gold/80">BASE DE CONOCIMIENTO 5e</p>
        <div className="flex flex-1 flex-col gap-2">
          {CATEGORIES.map((cat, i) => {
            const active = i === catIndex;
            return (
              <div key={cat.id} ref={active ? listRef : null} className={['flex items-center gap-3 rounded border-2 px-3 py-2', focusRow(active)].join(' ')}>
                <Cursor visible={active} className={active ? 'text-[#2a1c0c]' : ''} />
                <PixelIcon name={cat.icon} size={20} engrave={active} />
                <span className="flex-1 font-press text-[11px]">{cat.name}</span>
                <span className="font-vt text-lg opacity-70">{cat.get(db).length}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  if (phase === 'items') {
    return (
      <div className="flex h-full flex-col">
        <p className="mb-2 flex items-center gap-1.5 font-press text-[9px] text-gold/80">
          <PixelIcon name={category.icon} size={14} /> {category.name.toUpperCase()}
        </p>
        <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {items.map((it, i) => {
            const active = i === itemIndex;
            return (
              <div key={it.id} ref={active ? listRef : null} className={['flex items-center gap-2 rounded border-2 px-3 py-1.5', focusRow(active)].join(' ')}>
                <Cursor visible={active} className={active ? 'text-[#2a1c0c]' : ''} />
                <span className="flex-1 font-vt text-xl">{it.name}</span>
                <span className={`font-press text-hud-xs ${active ? 'text-[#2a1c0c]/70' : 'text-gold/60'}`}>{category.sub(it)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  const d = category.detail(item);
  return (
    <div className="flex h-full flex-col rounded border-2 border-gold bg-parchment text-ink shadow-[inset_0_0_30px_rgba(120,80,20,0.25)]">
      <div className="border-b-2 border-gold px-4 py-2">
        <h2 className="font-press text-[12px] leading-relaxed text-blood">{d.title}</h2>
        <p className="font-vt text-lg text-bronze">{d.subtitle}</p>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 font-vt text-[19px] leading-snug [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {d.body.map((line, i) => (
          <p key={i} className={line === '' ? 'h-3' : 'text-ink'}>
            {line === '' ? null : <GrimoireTextRenderer text={line} />}
          </p>
        ))}
        <div className="h-2" />
      </div>
    </div>
  );
}
