/**
 * Adapter / build-step (Node) — normaliza el JSON CRUDO de 5etools a la forma
 * liviana del Store de Grimoire OS.
 *
 *   raw_data/ (5etools crudo, gitignored)  ──►  public/data/clean_*.json (trackeado)
 *
 * Qué hace:
 *   - Descarta `_meta` y extrae los arrays de entidad (race, class, item, spell…).
 *   - Filtra al subset SRD / fuentes núcleo (licencia abierta + dataset chico).
 *   - Dedupe por nombre.
 *   - Aplana los `entries` anidados de 5etools a un párrafo, CONSERVANDO las
 *     etiquetas {@...} (las renderiza <GrimoireTextRenderer />).
 *   - Mapea los campos a nuestra estructura y escribe JSON minificado.
 *
 * Uso:  node scripts/build-data.js
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const RAW = join(ROOT, 'raw_data');
const OUT = join(ROOT, 'public', 'data');
mkdirSync(OUT, { recursive: true });

/* ---------- helpers ---------- */
const slug = (s) =>
  String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const title = (s) => String(s).replace(/\b\w/g, (m) => m.toUpperCase());
const ABIL = { str: 'FUE', dex: 'DES', con: 'CON', int: 'INT', wis: 'SAB', cha: 'CAR' };
const SCHOOL = { A: 'Abjuración', C: 'Conjuración', D: 'Adivinación', E: 'Encantamiento', V: 'Evocación', I: 'Ilusión', N: 'Nigromancia', T: 'Transmutación' };
const ARMOR_TYPE = { LA: 'light', MA: 'medium', HA: 'heavy', S: 'shield' };

// Fuentes núcleo (si la entidad no trae flag `srd`).
const CORE = new Set(['PHB', 'XPHB', 'MM', 'XMM', 'DMG', 'XDMG']);
const isCore = (e) => e && (e.srd === true || CORE.has(e.source));
const byName = (a, b) => a.name.localeCompare(b.name);

// Aplana `entries` de 5etools a texto plano (conserva {@...}).
function flatten(entries) {
  if (entries == null) return '';
  if (typeof entries === 'string') return entries;
  if (Array.isArray(entries)) return entries.map(flatten).filter(Boolean).join(' ');
  if (typeof entries === 'object') {
    if (Array.isArray(entries.entries)) return (entries.name ? `${entries.name}: ` : '') + flatten(entries.entries);
    if (Array.isArray(entries.items)) return flatten(entries.items);
    if (entries.entry) return flatten(entries.entry);
  }
  return '';
}
const para = (entries, max = 360) => {
  const t = flatten(entries).replace(/\s+/g, ' ').trim();
  return t.length > max ? `${t.slice(0, max).trimEnd()}…` : t;
};

// Lee `raw_data/<file>` y devuelve `json[key]` (o []).
function readOne(file, key) {
  const p = join(RAW, file);
  if (!existsSync(p)) return [];
  try {
    const j = JSON.parse(readFileSync(p, 'utf8'));
    return Array.isArray(j[key]) ? j[key] : Array.isArray(j) ? j : [];
  } catch (e) {
    console.warn('  ! no se pudo leer', file, e.message);
    return [];
  }
}
// Junta `key` de todos los `raw_data/<dir>/*.json` (omite fluff/index).
function readDir(dir, key) {
  const p = join(RAW, dir);
  if (!existsSync(p)) return [];
  const out = [];
  for (const f of readdirSync(p)) {
    // Sólo archivos de contenido `<dir>-*.json` (excluye foundry/fluff/index/sources).
    if (!f.startsWith(`${dir}-`) || !f.endsWith('.json')) continue;
    try {
      const j = JSON.parse(readFileSync(join(p, f), 'utf8'));
      if (Array.isArray(j[key])) out.push(...j[key]);
    } catch { /* ignora archivos rotos */ }
  }
  return out;
}
function dedupe(arr) {
  const seen = new Set();
  return arr.filter((e) => {
    const k = (e.name || '').toLowerCase();
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}
function write(name, data) {
  writeFileSync(join(OUT, name), JSON.stringify(data));
  const kb = (Buffer.byteLength(JSON.stringify(data)) / 1024).toFixed(1);
  console.log(`  ✓ ${name.padEnd(22)} ${String(data.length).padStart(4)} entradas · ${kb} KB`);
}

/* ---------- normalizadores ---------- */
const speedOf = (s) => (typeof s === 'number' ? s : s?.walk || 9);

function buildRaces() {
  const raw = dedupe(readOne('races.json', 'race').filter(isCore));
  return raw.map((r) => ({
    id: slug(r.name),
    name: r.name,
    speed: speedOf(r.speed),
    languages: ['common'],
    traits: (r.entries || []).filter((e) => e && e.name).map((e) => ({ name: e.name, desc: para(e.entries, 160) })),
    description: para((r.entries || []).filter((e) => typeof e === 'string'), 220) || `Especie ${r.name}.`,
  }));
}

function buildBackgrounds() {
  const raw = dedupe(readOne('backgrounds.json', 'background').filter(isCore));
  const skillsOf = (sp) => (sp || []).flatMap((o) => Object.keys(o).filter((k) => o[k] === true)).map(title);
  return raw.map((b) => ({ id: slug(b.name), name: b.name, skills: skillsOf(b.skillProficiencies), description: para(b.entries, 220) }));
}

function buildLanguages() {
  const raw = dedupe(readOne('languages.json', 'language').filter(isCore));
  return raw.map((l) => ({ id: slug(l.name), name: l.name }));
}

const COND_ICON = { blinded: '🙈', charmed: '😍', deafened: '🔇', frightened: '😱', grappled: '✊', incapacitated: '😵', invisible: '👻', paralyzed: '🥶', petrified: '🗿', poisoned: '🤢', prone: '🔻', restrained: '⛓️', stunned: '💫', unconscious: '💤', exhaustion: '🥵' };
function buildConditions() {
  const raw = dedupe(readOne('conditionsdiseases.json', 'condition').filter(isCore));
  return raw.map((c) => ({ id: slug(c.name), name: c.name, icon: COND_ICON[slug(c.name)] || '⚠️', desc: para(c.entries, 200) }));
}

const timeStr = (t) => (t && t[0] ? `${t[0].number} ${t[0].unit}${t[0].number > 1 ? 's' : ''}` : '—');
const rangeStr = (r) => {
  if (!r) return '—';
  if (r.distance) return r.distance.amount ? `${r.distance.amount} ${r.distance.type}` : title(r.distance.type);
  return title(r.type || '—');
};
function buildSpells() {
  const raw = dedupe(readDir('spells', 'spell').filter(isCore));
  return raw.map((s) => ({
    id: slug(s.name),
    name: s.name,
    level: s.level,
    school: SCHOOL[s.school] || s.school,
    time: timeStr(s.time),
    range: rangeStr(s.range),
    classes: [], // 5etools mapea spell→class por separado; pendiente (ver README)
    description: para(s.entries),
  }));
}

function buildItems() {
  const raw = dedupe(readOne('items-base.json', 'baseitem').filter(isCore));
  return raw
    .map((it) => {
      const t = (it.type || '').split('|')[0];
      if (['LA', 'MA', 'HA'].includes(t)) {
        return { id: slug(it.name), name: it.name, category: 'armor', armor: { type: ARMOR_TYPE[t], baseAC: it.ac, addDex: t !== 'HA', ...(t === 'MA' ? { maxDex: 2 } : {}) }, note: `CA ${it.ac}${t !== 'HA' ? ' + DES' : ''}` };
      }
      if (t === 'S') return { id: slug(it.name), name: it.name, category: 'shield', armor: { type: 'shield', acBonus: it.ac || 2 }, note: `+${it.ac || 2} CA` };
      if (it.weaponCategory) return { id: slug(it.name), name: it.name, category: 'weapon', note: it.dmg1 ? `${it.dmg1} ${it.dmgType || ''}`.trim() : 'arma' };
      return null;
    })
    .filter(Boolean);
}

const FULL_SLOTS = { 1: { 1: 2 }, 2: { 1: 3 }, 3: { 1: 4, 2: 2 }, 4: { 1: 4, 2: 3 }, 5: { 1: 4, 2: 3, 3: 2 } };
function buildClasses() {
  const dir = join(RAW, 'class');
  if (!existsSync(dir)) return [];
  const out = [];
  for (const file of readdirSync(dir)) {
    if (!file.startsWith('class-') || file.includes('fluff')) continue;
    let j;
    try { j = JSON.parse(readFileSync(join(dir, file), 'utf8')); } catch { continue; }
    const c = (j.class || []).find(isCore) || (j.class || [])[0];
    if (!c) continue;
    const feats = (j.classFeature || []).filter(isCore);
    const featuresByLevel = {};
    for (const f of feats) (featuresByLevel[f.level] ||= []).push({ name: f.name, desc: para(f.entries, 180) });
    const asiLevels = [...new Set(feats.filter((f) => /Ability Score Improvement/i.test(f.name)).map((f) => f.level))].sort((a, b) => a - b);
    let subclassLevel = null;
    for (const cf of c.classFeatures || []) {
      if (cf && typeof cf === 'object' && cf.gainSubclassFeature) { subclassLevel = Number(cf.classFeature.split('|')[3]); break; }
    }
    const subFeats = (j.subclassFeature || []).filter(isCore);
    const subclasses = dedupe((j.subclass || []).filter(isCore)).map((sc) => {
      const fbl = {};
      for (const sf of subFeats) if (sf.subclassShortName === sc.shortName) (fbl[sf.level] ||= []).push({ name: sf.name, desc: para(sf.entries, 150) });
      return { id: slug(sc.shortName || sc.name), name: sc.name, featuresByLevel: fbl };
    });
    const spellcasting = c.casterProgression ? { ability: ABIL[c.spellcastingAbility] || 'INT', slotsByLevel: FULL_SLOTS } : undefined;
    out.push({
      id: slug(c.name),
      name: c.name,
      hitDie: c.hd?.faces || 8,
      savingThrows: (c.proficiency || []).map((a) => ABIL[a]).filter(Boolean),
      skillsFrom: (c.startingProficiencies?.skills?.[0]?.choose?.from || []).map(title),
      subclassLevel: subclassLevel || 3,
      asiLevels: asiLevels.length ? asiLevels : [4, 8, 12, 16, 19],
      subclasses,
      featuresByLevel,
      ...(spellcasting ? { spellcasting } : {}),
      description: para(c.fluff?.entries) || `Clase ${c.name}.`,
    });
  }
  return out;
}

function buildBestiary() {
  const raw = dedupe(readDir('bestiary', 'monster').filter(isCore));
  const acOf = (ac) => (Array.isArray(ac) ? (typeof ac[0] === 'object' ? ac[0].ac : ac[0]) : ac);
  const typeOf = (t) => (typeof t === 'object' ? t.type : t);
  return raw.map((m) => ({
    id: slug(m.name),
    name: m.name,
    cr: typeof m.cr === 'object' ? m.cr.cr : m.cr || '—',
    type: title(typeOf(m.type) || 'criatura'),
    ac: acOf(m.ac) ?? 10,
    hp: m.hp?.average ?? '—',
    description: para([...(m.trait || []), ...(m.action || [])], 300) || `${title(typeOf(m.type) || 'Criatura')}.`,
  }));
}

/* ---------- run ---------- */
console.log('Grimoire · build-data (5etools → clean):');
write('clean_races.json', buildRaces().sort(byName));
write('clean_classes.json', buildClasses().sort(byName));
write('clean_backgrounds.json', buildBackgrounds().sort(byName));
write('clean_languages.json', buildLanguages().sort(byName));
write('clean_spells.json', buildSpells().sort(byName));
write('clean_items.json', buildItems().sort(byName));
write('clean_bestiary.json', buildBestiary().sort(byName));
write('clean_conditions.json', buildConditions().sort(byName));
console.log('Listo.');
