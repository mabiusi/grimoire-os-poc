import { useEffect, useRef, useState } from 'react';
import Frame from '../components/Frame.jsx';
import Cursor from '../components/Cursor.jsx';
import SpellTracker from '../components/SpellTracker.jsx';
import CombatTracker from '../components/CombatTracker.jsx';
import LevelUpWizard from '../components/LevelUpWizard.jsx';
import CharacterCreator from './CharacterCreator.jsx';
import { useSystem } from '../context/SystemContext.jsx';
import { useGrimoireStore } from '../store/useGrimoireStore.js';
import { useGamepad } from '../hooks/useGamepad.js';
import { sfx } from '../lib/sfx.js';
import { clamp, wrapIndex } from '../lib/utils.js';
import { STAT_KEYS, STAT_NAMES } from '../data/constants.js';
import {
  abilityMod,
  fmtMod,
  proficiencyBonus,
  deriveAC,
  deriveProficiencies,
  deriveTraits,
  deriveLanguages,
  raceOf,
  classOf,
  subclassOf,
  backgroundOf,
  itemOf,
} from '../store/derive.js';

const ACCENT = { blood: 'text-blood', arcane: 'text-arcane', sky: 'text-sky', moss: 'text-moss', gold: 'text-bronze', parchment: 'text-ink' };
const TABS = ['Stats', 'Inventario', 'Magia', 'Combate'];
const SCROLL_STEP = 64;

export default function CharacterSheets() {
  const { goBack } = useSystem();
  const characters = useGrimoireStore((s) => s.characters);
  const addCharacter = useGrimoireStore((s) => s.addCharacter);
  const updateCharacter = useGrimoireStore((s) => s.updateCharacter);
  const [phase, setPhase] = useState('roster'); // 'roster' | 'view' | 'create' | 'levelup'
  const [viewId, setViewId] = useState(null);
  const [levelUp, setLevelUp] = useState(null); // { char, target, isNew }

  if (phase === 'create') {
    return (
      <CharacterCreator
        onCancel={() => setPhase('roster')}
        onComplete={(char, level) => {
          if (level > 1) {
            setLevelUp({ char, target: level, isNew: true });
            setPhase('levelup');
          } else {
            addCharacter(char);
            setViewId(char.id);
            setPhase('view');
          }
        }}
      />
    );
  }

  if (phase === 'levelup' && levelUp) {
    return (
      <LevelUpWizard
        char={levelUp.char}
        targetLevel={levelUp.target}
        onComplete={(final) => {
          if (levelUp.isNew) addCharacter(final);
          else updateCharacter(final.id, () => final);
          setViewId(final.id);
          setPhase('view');
        }}
        onCancel={() => {
          // Cancelar: si era nuevo, lo guardamos igual a nivel 1; si existía, sin cambios.
          if (levelUp.isNew) { addCharacter(levelUp.char); setViewId(levelUp.char.id); }
          setPhase('view');
        }}
      />
    );
  }

  if (phase === 'view' && characters.some((c) => c.id === viewId)) {
    return (
      <SheetViewer
        charId={viewId}
        onBack={() => { sfx.back(); setPhase('roster'); }}
        onLevelUp={() => {
          const c = characters.find((x) => x.id === viewId);
          if (!c || c.level >= 20) { sfx.error(); return; }
          sfx.open();
          setLevelUp({ char: c, target: c.level + 1, isNew: false });
          setPhase('levelup');
        }}
      />
    );
  }

  return (
    <Roster
      characters={characters}
      onOpen={(id) => { sfx.open(); setViewId(id); setPhase('view'); }}
      onCreate={() => { sfx.open(); setPhase('create'); }}
      onBack={() => { sfx.back(); goBack(); }}
    />
  );
}

/* --------------------------------------------------------------------- */
function Roster({ characters, onOpen, onCreate, onBack }) {
  const db = useGrimoireStore((s) => s.db);
  const total = characters.length + 1;
  const [sel, setSel] = useState(0);
  const activeRef = useRef(null);
  const index = clamp(sel, 0, total - 1);
  const onCreateRow = index === characters.length;

  useEffect(() => { activeRef.current?.scrollIntoView({ block: 'nearest' }); }, [index]);

  const move = (n) => { sfx.move(); setSel(n); };
  useGamepad({
    onUp: () => move(wrapIndex(index - 1, total)),
    onDown: () => move(wrapIndex(index + 1, total)),
    onA: () => (onCreateRow ? onCreate() : onOpen(characters[index].id)),
    onB: onBack,
  });

  return (
    <Frame title="HOJAS DE PERSONAJE" icon="📜" hints={[['↑↓', 'Elegir'], ['A', 'Abrir'], ['B', 'Atrás']]}>
      <div className="flex h-full flex-col p-3">
        <p className="mb-2 font-press text-[9px] text-gold/80">
          TUS PERSONAJES <span className="text-gold/50">({characters.length})</span>
        </p>
        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pr-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {characters.map((char, i) => {
            const active = i === index;
            const race = raceOf(char, db);
            const cls = classOf(char, db);
            return (
              <div
                key={char.id}
                ref={active ? activeRef : null}
                className={['flex items-center gap-3 rounded border-2 px-3 py-2 transition-colors', active ? 'border-goldLight bg-gold text-ink shadow-bevel' : 'border-bronze/60 bg-stoneDark text-parchment/80'].join(' ')}
              >
                <Cursor visible={active} className={active ? 'text-ink' : ''} />
                <span className="text-2xl">{cls ? '🐉' : '📄'}</span>
                <div className="flex-1 leading-tight">
                  <div className="font-vt text-xl">{char.name}</div>
                  <div className="font-press text-[7px] opacity-70">
                    {race?.name} {cls?.name} · Nv {char.level}
                  </div>
                </div>
                <ConditionIcons ids={char.conditions} db={db} />
              </div>
            );
          })}

          <div
            ref={onCreateRow ? activeRef : null}
            className={['flex items-center gap-3 rounded border-2 border-dashed px-3 py-2', onCreateRow ? 'border-goldLight bg-gold text-ink shadow-bevel' : 'border-moss/60 text-moss'].join(' ')}
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

function ConditionIcons({ ids, db }) {
  if (!ids?.length) return null;
  return (
    <span className="flex gap-0.5 text-base" title="condiciones activas">
      {ids.map((id) => {
        const c = db.conditions.find((x) => x.id === id);
        return c ? <span key={id}>{c.icon}</span> : null;
      })}
    </span>
  );
}

/* --------------------------------------------------------------------- */
function SheetViewer({ charId, onBack, onLevelUp }) {
  // Selector reactivo: cualquier mutación del store re-renderiza y re-deriva.
  const char = useGrimoireStore((s) => s.characters.find((c) => c.id === charId));
  const db = useGrimoireStore((s) => s.db);
  const scrollRef = useRef(null);
  const [tab, setTab] = useState(0);
  const [edges, setEdges] = useState({ top: true, bottom: false });

  const updateEdges = () => {
    const el = scrollRef.current;
    if (!el) return;
    setEdges({ top: el.scrollTop <= 1, bottom: el.scrollTop + el.clientHeight >= el.scrollHeight - 1 });
  };
  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = 0; updateEdges(); }, [tab]);

  const changeTab = (next) => { if (next === tab) return; sfx.tab(); setTab(next); };

  // Sólo la pestaña Stats hace scroll vía el visor; las interactivas manejan su ↑↓.
  useGamepad({
    onUp: () => { if (tab === 0) { const el = scrollRef.current; if (el) { el.scrollTop -= SCROLL_STEP; sfx.move(); updateEdges(); } } },
    onDown: () => { if (tab === 0) { const el = scrollRef.current; if (el) { el.scrollTop += SCROLL_STEP; sfx.move(); updateEdges(); } } },
    onL: () => changeTab(wrapIndex(tab - 1, TABS.length)),
    onR: () => changeTab(wrapIndex(tab + 1, TABS.length)),
    onX: onLevelUp, // botón X (contextual): subir de nivel
    onB: onBack,
  });

  if (!char) return null;
  const ac = deriveAC(char, db);

  return (
    <Frame title={`${(classOf(char, db)?.name || 'PERSONAJE').toUpperCase()}`} icon="🐉" hints={[['L/R', 'Pestañas'], tab === 0 ? ['↑↓', 'Scroll'] : ['↑↓', 'Mover'], ['X', 'Subir niv'], ['B', 'Atrás']]}>
      <div className="flex h-full flex-col p-2">
        {/* Pestañas */}
        <div className="mb-2 flex items-center gap-1">
          <span className="px-1 font-press text-[10px] text-gold/70">L</span>
          {TABS.map((label, i) => (
            <div key={label} className={['flex-1 rounded-t border-b-2 px-1 py-1 text-center font-press text-[8px]', i === tab ? 'border-goldLight bg-gold text-ink' : 'border-bronze/50 bg-stoneDark text-parchment/60'].join(' ')}>
              {label}
            </div>
          ))}
          <span className="px-1 font-press text-[10px] text-gold/70">R</span>
        </div>

        {/* Panel pergamino */}
        <div className="relative min-h-0 flex-1 overflow-hidden rounded border-2 border-gold bg-parchment text-ink shadow-[inset_0_0_30px_rgba(120,80,20,0.25)]">
          {/* Cabecera con AC/HP vivos + condiciones */}
          <div className="flex items-center justify-between border-b-2 border-gold px-4 py-2">
            <div>
              <h2 className="flex items-center gap-2 font-press text-[12px] leading-relaxed text-blood">
                {char.name}
                <span className="flex gap-0.5 text-sm">
                  {char.conditions.map((id) => { const c = db.conditions.find((x) => x.id === id); return c ? <span key={id} title={c.name}>{c.icon}</span> : null; })}
                </span>
              </h2>
              <p className="font-vt text-base text-bronze">{raceOf(char, db)?.name} {classOf(char, db)?.name} · Nivel {char.level}</p>
            </div>
            <div className="flex gap-2 text-center font-press text-[8px]">
              <div className="rounded border border-bronze/50 bg-parchmentDark/50 px-2 py-1"><div className="text-bronze">CA</div><div className="text-sm text-sky">{ac}</div></div>
              <div className="rounded border border-bronze/50 bg-parchmentDark/50 px-2 py-1"><div className="text-bronze">PV</div><div className="text-sm text-blood">{char.hp.current}/{char.hp.max}</div></div>
            </div>
          </div>

          <div ref={scrollRef} onScroll={updateEdges} className="h-[calc(100%-3.5rem)] overflow-y-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tab === 0 && <StatsTab char={char} db={db} />}
            {tab === 1 && <InventoryTab charId={charId} char={char} db={db} />}
            {tab === 2 && (char.spells ? <SpellTracker charId={charId} /> : <EmptyState text="Esta clase no lanza conjuros." />)}
            {tab === 3 && <CombatTracker charId={charId} />}
            <div className="h-2" />
          </div>

          {tab === 0 && !edges.top && <div className="pointer-events-none absolute right-2 top-14 animate-blink font-press text-[10px] text-blood">▲</div>}
          {tab === 0 && !edges.bottom && <div className="pointer-events-none absolute bottom-1 right-2 animate-blink font-press text-[10px] text-blood">▼</div>}
        </div>
      </div>
    </Frame>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded border-2 border-dashed border-bronze/50 p-4 text-center font-vt text-lg text-bronze">
      ✦ Sin datos ✦
      <p className="mt-2 text-base leading-snug">{text}</p>
    </div>
  );
}

/* ----- Pestaña Stats (derivada) ------------------------------------- */
function Section({ label, children }) {
  return (
    <section className="mb-3">
      <h3 className="mb-1 border-b-2 border-gold font-press text-[9px] uppercase tracking-wide text-bronze">{label}</h3>
      {children}
    </section>
  );
}

function StatsTab({ char, db }) {
  const race = raceOf(char, db);
  const cls = classOf(char, db);
  const bg = backgroundOf(char, db);
  const { saves, skills } = deriveProficiencies(char, db);
  const traits = deriveTraits(char, db);
  const dexMod = abilityMod(char.abilities.DES);

  const sub = subclassOf(char, db);
  const meta = [
    ['Especie', race?.name],
    ['Clase', cls?.name],
    sub && ['Subclase', sub.name],
    ['Trasfondo', bg?.name],
    ['Nivel', String(char.level)],
    ['Idiomas', deriveLanguages(char, db).join(', ')],
  ].filter(Boolean);
  const vitals = [
    ['Puntos de Vida', `${char.hp.current}/${char.hp.max}${char.hp.temp ? ` (+${char.hp.temp})` : ''}`, 'blood'],
    ['Clase de Armadura', String(deriveAC(char, db)), 'sky'],
    ['Iniciativa', fmtMod(dexMod), 'parchment'],
    ['Bono Comp.', fmtMod(proficiencyBonus(char.level)), 'gold'],
    ['Velocidad', `${race?.speed} m`, 'parchment'],
    ['Dado de Golpe', `d${cls?.hitDie}`, 'gold'],
  ];

  return (
    <>
      <Section label="Información">
        <dl className="grid grid-cols-2 gap-x-4 gap-y-1 font-vt text-lg">
          {meta.map(([k, v]) => (
            <div key={k} className="flex justify-between border-b border-bronze/30"><dt className="text-bronze">{k}</dt><dd className="font-semibold">{v}</dd></div>
          ))}
        </dl>
      </Section>

      <Section label="Vitales (derivados)">
        <div className="grid grid-cols-2 gap-2">
          {vitals.map(([k, v, accent]) => (
            <div key={k} className="flex items-center justify-between rounded border border-bronze/50 bg-parchmentDark/40 px-2 py-1">
              <span className="font-vt text-base text-bronze">{k}</span>
              <span className={`font-press text-[11px] ${ACCENT[accent] || 'text-ink'}`}>{v}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section label="Características">
        <div className="grid grid-cols-3 gap-2">
          {STAT_KEYS.map((k) => {
            const v = char.abilities[k];
            return (
              <div key={k} className="flex items-center justify-between rounded border-2 border-bronze/60 bg-parchmentDark/40 px-2 py-1">
                <span className="font-press text-[8px] text-bronze">{k}</span>
                <span className="font-press text-sm text-ink">{v}</span>
                <span className="font-vt text-base text-moss">{fmtMod(abilityMod(v))}</span>
              </div>
            );
          })}
        </div>
      </Section>

      <Section label="Competencias (heredadas)">
        <p className="font-vt text-lg"><span className="text-bronze">Salvaciones: </span>{saves.map((s) => STAT_NAMES[s]).join(', ') || '—'}</p>
        <p className="font-vt text-lg"><span className="text-bronze">Habilidades: </span>{skills.join(', ') || '—'}</p>
      </Section>

      <Section label="Rasgos (heredados)">
        <ul className="flex flex-col gap-1 font-vt text-base leading-snug">
          {traits.map((t) => (
            <li key={t.source + t.name}><span className="font-semibold text-arcane">{t.name}</span> <span className="text-bronze">({t.source})</span> — {t.desc}</li>
          ))}
        </ul>
      </Section>
    </>
  );
}

/* ----- Pestaña Inventario (interactiva: equipar -> recalcula CA) ----- */
const EQUIPPABLE = new Set(['armor', 'shield', 'weapon']);

function InventoryTab({ charId, char, db }) {
  const toggleEquipped = useGrimoireStore((s) => s.toggleEquipped);
  const [sel, setSel] = useState(0);
  const activeRef = useRef(null);
  const rows = char.inventory;

  useEffect(() => { activeRef.current?.scrollIntoView({ block: 'nearest' }); }, [sel]);

  const move = (n) => { sfx.move(); setSel(clamp(n, 0, rows.length - 1)); };
  useGamepad({
    onUp: () => move(wrapIndex(sel - 1, rows.length)),
    onDown: () => move(wrapIndex(sel + 1, rows.length)),
    onA: () => {
      const slot = rows[sel];
      const item = itemOf(slot.itemId, db);
      if (item && EQUIPPABLE.has(item.category)) { toggleEquipped(charId, slot.itemId); sfx.tick(); }
      else sfx.error();
    },
  });

  return (
    <Section label="Inventario · [A] Equipar">
      <ul className="flex flex-col gap-1">
        {rows.map((slot, i) => {
          const item = itemOf(slot.itemId, db);
          const active = i === sel;
          const can = item && EQUIPPABLE.has(item.category);
          return (
            <li
              key={slot.itemId}
              ref={active ? activeRef : null}
              className={['flex items-center gap-2 rounded px-2 py-1 font-vt text-lg', active ? 'bg-gold/30' : ''].join(' ')}
            >
              <span className={can ? (slot.equipped ? 'text-moss' : 'text-bronze/50') : 'text-transparent'}>{slot.equipped ? '☑' : '☐'}</span>
              <span className="flex-1">{item?.name}</span>
              <span className="text-bronze">{item?.note}</span>
              {slot.equipped && <span className="font-press text-[7px] text-moss">EQUIP.</span>}
            </li>
          );
        })}
      </ul>
      <p className="mt-2 border-t border-bronze/30 pt-1 font-vt text-base text-bronze">
        Equipar armadura/escudo recalcula la <span className="text-sky">CA</span> al instante (mirá la cabecera).
      </p>
    </Section>
  );
}
