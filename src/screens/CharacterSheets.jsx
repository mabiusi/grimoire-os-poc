import { useEffect, useRef, useState } from 'react';
import Frame from '../components/Frame.jsx';
import Cursor from '../components/Cursor.jsx';
import PixelIcon from '../components/PixelIcon.jsx';
import Tabs from '../components/Tabs.jsx';
import SpellTracker from '../components/SpellTracker.jsx';
import SpellDetail from '../components/SpellDetail.jsx';
import CombatTracker from '../components/CombatTracker.jsx';
import LevelUpWizard from '../components/LevelUpWizard.jsx';
import CharacterCreator from './CharacterCreator.jsx';
import { useSystem } from '../context/SystemContext.jsx';
import { useGrimoireStore } from '../store/useGrimoireStore.js';
import { useGamepad } from '../hooks/useGamepad.js';
import { sfx } from '../lib/sfx.js';
import { clamp, wrapIndex } from '../lib/utils.js';
import { focusRow } from '../lib/focus.js';
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
          // Nivel >1 o lanzador de nivel 1 (debe elegir su repertorio inicial)
          // pasan por el asistente; el resto se guarda directo.
          if (level > 1 || char.spells) {
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
    <Frame title="HOJAS DE PERSONAJE" icon="scroll" hints={[['↑↓', 'Elegir'], ['A', 'Abrir'], ['B', 'Atrás']]}>
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
                className={['flex items-center gap-3 rounded border-2 px-3 py-2 transition-colors', focusRow(active)].join(' ')}
              >
                <Cursor visible={active} className={active ? 'text-[#2a1c0c]' : ''} />
                <PixelIcon name={cls ? 'dragon' : 'page'} size={22} engrave={active} />
                <div className="flex-1 leading-tight">
                  <div className="font-vt text-xl">{char.name}</div>
                  <div className={`font-vt text-body-sm ${active ? 'text-[#3a2a14]' : 'text-bronze'}`}>
                    {race?.name} · {cls?.name} · Nivel {char.level}
                  </div>
                </div>
                <ConditionIcons ids={char.conditions} db={db} />
              </div>
            );
          })}

          <div
            ref={onCreateRow ? activeRef : null}
            className={['flex items-center gap-3 rounded border-2 border-dashed px-3 py-2', onCreateRow ? focusRow(true) : 'border-moss/60 text-moss'].join(' ')}
          >
            <Cursor visible={onCreateRow} className={onCreateRow ? 'text-[#2a1c0c]' : ''} />
            <PixelIcon name="plus" size={20} engrave={onCreateRow} />
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
        return c ? <PixelIcon key={id} name={`cond_${c.id}`} size={14} title={c.name} /> : null;
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
  const [edges, setEdges] = useState({ top: true, bottom: false, scrollTop: 0, scrollH: 1, clientH: 1 });
  const [inspect, setInspect] = useState(null); // conjuro en detalle (pop-up de Magia)

  const updateEdges = () => {
    const el = scrollRef.current;
    if (!el) return;
    setEdges({
      top: el.scrollTop <= 1,
      bottom: el.scrollTop + el.clientHeight >= el.scrollHeight - 1,
      scrollTop: el.scrollTop,
      scrollH: el.scrollHeight,
      clientH: el.clientHeight,
    });
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
  // Thumb del riel de scroll (proporción y posición clampeada dentro del riel).
  const railH = Math.max(12, (edges.clientH / edges.scrollH) * 100);
  const railTop = Math.min(100 - railH, Math.max(0, (edges.scrollTop / edges.scrollH) * 100));

  return (
    <Frame title={`${(classOf(char, db)?.name || 'PERSONAJE').toUpperCase()}`} icon="dragon" hints={[['L/R', 'Pestañas'], tab === 0 ? ['↑↓', 'Scroll'] : ['↑↓', 'Mover'], ['X', 'Subir niv'], ['B', 'Atrás']]}>
      <div className="flex h-full flex-col p-2">
        {/* Pestañas */}
        <Tabs tabs={TABS} active={tab} className="mb-2" />

        {/* Panel pergamino */}
        <div className="relative min-h-0 flex-1 overflow-hidden rounded border-2 border-gold bg-parchment text-ink shadow-[inset_0_0_30px_var(--gr-parchInset)]">
          {/* Cabecera: identidad compacta + badge de datos fijos */}
          <div className="flex items-center justify-between border-b border-gold/60 px-4 pt-2 pb-1.5">
            <div className="min-w-0">
              <h2 className="flex items-center gap-2 font-press text-hud leading-relaxed text-blood">
                {char.name}
                <span className="flex gap-0.5">
                  {char.conditions.map((id) => { const c = db.conditions.find((x) => x.id === id); return c ? <PixelIcon key={id} name={`cond_${c.id}`} size={14} title={c.name} /> : null; })}
                </span>
              </h2>
              <p className="truncate font-vt text-body-sm text-bronze">
                {raceOf(char, db)?.name} · {classOf(char, db)?.name}
                {subclassOf(char, db) ? ` (${subclassOf(char, db).name})` : ''} · {backgroundOf(char, db)?.name} · Nv {char.level}
              </p>
            </div>
            <span className="shrink-0 rounded border border-bronze/50 bg-parchmentDark/60 px-2 py-0.5 font-press text-hud-xs text-bronze">
              d{classOf(char, db)?.hitDie} · {raceOf(char, db)?.speed}m
            </span>
          </div>

          {/* NIVEL 1 — INSTRUMENTOS (derivado / vivo). Fuera del scroll. */}
          <div className="relative border-b-2 border-gold bg-parchmentDark/55 px-3 py-2">
            <span className="absolute right-3 top-1 flex items-center gap-1 font-vt text-[12px] text-bronze/70">
              <span className="animate-softpulse">⟳</span> se recalcula solo
            </span>
            <div className="mb-1 font-press text-hud-xs uppercase tracking-wider text-bronze/80">Instrumentos</div>
            <div className="grid grid-cols-4 gap-2">
              <Inst label="PV" value={char.hp.current} sub={`/ ${char.hp.max}`} color="text-blood" />
              <Inst label="CA" value={ac} color="text-sky" />
              <Inst label="INIC." value={fmtMod(abilityMod(char.abilities.DES))} color="text-ink" />
              <Inst label="COMP." value={fmtMod(proficiencyBonus(char.level))} color="text-gold" />
            </div>
          </div>

          <div ref={scrollRef} onScroll={updateEdges} className="h-[calc(100%-7.6rem)] overflow-y-auto px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {tab === 0 && <StatsTab char={char} db={db} />}
            {tab === 1 && <InventoryTab charId={charId} char={char} db={db} />}
            {tab === 2 && (char.spells ? <SpellTracker charId={charId} onInspect={setInspect} /> : <EmptyState title="SIN CONJUROS" text="Esta clase no canaliza magia arcana ni divina." />)}
            {tab === 3 && <CombatTracker charId={charId} />}
            <div className="h-2" />
          </div>

          {/* Afordancia de scroll: riel + thumb derivado + fade (sin flechas) */}
          <div className="pointer-events-none absolute right-1.5 bottom-3 top-[7.6rem] w-[3px] rounded bg-bronze/25">
            <div className="absolute left-0 w-[3px] rounded bg-gold/80" style={{ height: `${railH}%`, top: `${railTop}%` }} />
          </div>
          {/* Fade inferior sólo en la pestaña de TEXTO (Stats): en las listas
              interactivas tapaba la fila activa del fondo (artefacto de "línea")
              y el riel ya indica la posición de scroll. */}
          {tab === 0 && !edges.bottom && <div className="parchment-fade pointer-events-none absolute inset-x-0 bottom-0 h-7" />}

          {/* Pop-up de detalle de conjuro/truco (capa modal sobre el panel) */}
          {inspect && <SpellDetail charId={charId} spell={inspect} onClose={() => setInspect(null)} />}
        </div>
      </div>
    </Frame>
  );
}

function EmptyState({ title = 'SIN DATOS', icon = 'spell', text }) {
  return (
    <div className="rounded border-2 border-dashed border-bronze/50 p-5 text-center">
      <span className="opacity-60">
        <PixelIcon name={icon} size={28} />
      </span>
      <p className="mt-2 font-press text-hud uppercase tracking-wider text-bronze">{title}</p>
      <p className="mt-2 font-vt text-body-sm leading-snug text-bronze">{text}</p>
    </div>
  );
}

// Tile de la franja Instrumentos (dato derivado/vivo en su color de acento).
function Inst({ label, value, sub, color }) {
  return (
    <div className="flex flex-col items-center justify-center rounded border border-bronze/40 bg-parchment px-1 py-1.5 shadow-[inset_0_-2px_0_rgba(0,0,0,.07)]">
      <span className="font-press text-hud-xs leading-none text-bronze">{label}</span>
      <span className={`mt-1 font-press text-[17px] leading-none ${color}`}>{value}</span>
      <span className="font-vt text-[13px] leading-none text-bronze/70">{sub || ' '}</span>
    </div>
  );
}

/* ----- Pestaña Stats (derivada) ------------------------------------- */
function Section({ label, children }) {
  return (
    <section className="mb-3">
      <h3 className="mb-1 border-b-2 border-gold font-press text-hud-sm uppercase tracking-wide text-bronze">{label}</h3>
      {children}
    </section>
  );
}

function StatsTab({ char, db }) {
  const { saves, skills } = deriveProficiencies(char, db);
  const traits = deriveTraits(char, db);

  return (
    <>
      {/* NÚCLEO — el modificador es protagonista; neutral ink. */}
      <div className="mb-1 font-press text-hud-xs uppercase tracking-wider text-bronze/80">Núcleo · Características</div>
      <div className="mb-3 grid grid-cols-3 gap-1.5">
        {STAT_KEYS.map((k) => {
          const v = char.abilities[k];
          return (
            <div key={k} className="flex items-center justify-between rounded border-2 border-bronze/50 bg-parchment px-2 py-1">
              <span className="flex flex-col leading-none">
                <span className="font-press text-hud-xs text-bronze">{k}</span>
                <span className="mt-0.5 font-vt text-[14px] text-ink/55">{v}</span>
              </span>
              <span className="font-press text-[16px] text-ink">{fmtMod(abilityMod(v))}</span>
            </div>
          );
        })}
      </div>

      {/* REFERENCIA — atenuado, compacto, al fondo del scroll. */}
      <div className="rounded border border-bronze/30 bg-parchment/40 px-2 py-1.5">
        <div className="mb-1 font-press text-hud-xs uppercase tracking-wider text-bronze/60">Referencia</div>
        <p className="font-vt text-body-sm leading-snug text-ink/75"><span className="text-bronze">Idiomas:</span> {deriveLanguages(char, db).join(', ')}</p>
        <p className="font-vt text-body-sm leading-snug text-ink/75"><span className="text-bronze">Salvaciones:</span> {saves.map((s) => STAT_NAMES[s]).join(', ') || '—'}</p>
        <p className="font-vt text-body-sm leading-snug text-ink/75"><span className="text-bronze">Habilidades:</span> {skills.join(', ') || '—'}</p>
        <div className="mt-1 border-t border-bronze/25 pt-1">
          {traits.map((t, i) => (
            <p key={`${t.source}-${t.name}-${i}`} className="font-vt text-body-sm leading-snug text-ink/75">
              <span className="font-semibold text-arcane">{t.name}</span> <span className="text-bronze">({t.source})</span> — {t.desc}
            </p>
          ))}
        </div>
      </div>
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
              className={['flex items-center gap-2 rounded border-2 px-2 py-1 font-vt text-lg', focusRow(active, { onParch: true })].join(' ')}
            >
              <Cursor visible={active} className={active ? 'text-[#2a1c0c]' : ''} />
              <span className={can ? (slot.equipped ? 'text-moss' : 'text-bronze/50') : 'text-transparent'}>{slot.equipped ? '☑' : '☐'}</span>
              <span className="flex-1">{item?.name}</span>
              <span className="text-bronze">{item?.note}</span>
              {slot.equipped && <span className="font-vt text-sm text-moss">EQUIP.</span>}
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
