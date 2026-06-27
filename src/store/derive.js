// Estado DERIVADO de un personaje (puro). Recibe el modelo del personaje + la
// `db` del store y calcula lo que NO se guarda: mods, CA, competencias, rasgos.
import { proficiencyBonus } from '../data/constants.js';

export const abilityMod = (score) => Math.floor((score - 10) / 2);
export const fmtMod = (m) => (m >= 0 ? `+${m}` : `${m}`);
export { proficiencyBonus };

export const raceOf = (char, db) => db.races.find((r) => r.id === char.raceId);
export const classOf = (char, db) => db.classes.find((c) => c.id === char.classId);
export const subclassOf = (char, db) => classOf(char, db)?.subclasses?.find((s) => s.id === char.subclassId);
export const backgroundOf = (char, db) => db.backgrounds.find((b) => b.id === char.backgroundId);
export const itemOf = (id, db) => db.equipment.find((e) => e.id === id);
export const spellOf = (id, db) => db.spells.find((s) => s.id === id);

/** Clase de Armadura DERIVADA (sin armadura: 10 + DES; con armadura/escudo equipados, recalcula). */
export function deriveAC(char, db) {
  const dex = abilityMod(char.abilities.DES);
  let base = 10 + dex;
  let shield = 0;
  for (const slot of char.inventory) {
    if (!slot.equipped) continue;
    const armor = itemOf(slot.itemId, db)?.armor;
    if (!armor) continue;
    if (armor.type === 'shield') shield += armor.acBonus;
    else {
      const dexPart = armor.addDex ? (armor.maxDex != null ? Math.min(dex, armor.maxDex) : dex) : 0;
      base = armor.baseAC + dexPart;
    }
  }
  return base + shield;
}

// Competencias heredadas de Clase (salvaciones + habilidades) y Trasfondo.
export function deriveProficiencies(char, db) {
  const cls = classOf(char, db);
  const bg = backgroundOf(char, db);
  const skills = [...new Set([...(cls?.skillsFrom?.slice(0, 2) || []), ...(bg?.skills || [])])];
  return { saves: cls?.savingThrows || [], skills };
}

// Rasgos heredados: Especie + Clase y Subclase hasta el nivel ACTUAL.
export function deriveTraits(char, db) {
  const race = raceOf(char, db);
  const cls = classOf(char, db);
  const sub = subclassOf(char, db);
  const out = [];
  (race?.traits || []).forEach((t) => out.push({ source: race.name, name: t.name, desc: t.desc }));
  const collect = (featuresByLevel, label) => {
    if (!featuresByLevel) return;
    for (let lvl = 1; lvl <= char.level; lvl += 1) {
      (featuresByLevel[lvl] || []).forEach((f) => out.push({ source: `${label} ${lvl}`, name: f.name, desc: f.desc }));
    }
  };
  collect(cls?.featuresByLevel, cls?.name);
  collect(sub?.featuresByLevel, sub?.name);
  return out;
}

// Idiomas: heredados de la especie + elegidos.
export function deriveLanguages(char, db) {
  const race = raceOf(char, db);
  return [...new Set([...(race?.languages || []), ...(char.languages || [])])].map(
    (id) => db.languages.find((l) => l.id === id)?.name || id
  );
}

// Espacios de conjuro totales para un nivel de personaje (toma el mayor ≤ level).
export function spellSlotsForLevel(cls, level) {
  const byLevel = cls?.spellcasting?.slotsByLevel;
  if (!byLevel) return null;
  let chosen = null;
  for (let l = level; l >= 1; l -= 1) {
    if (byLevel[l]) { chosen = byLevel[l]; break; }
  }
  if (!chosen) return null;
  const slots = {};
  for (const k in chosen) slots[k] = { total: chosen[k], used: 0 };
  return slots;
}

// Nivel de conjuro MÁS ALTO que el personaje puede lanzar a `level` (por sus
// espacios). 0 = sólo trucos. Define el pool aprendible al subir de nivel.
export function maxCastableLevel(cls, level) {
  const slots = spellSlotsForLevel(cls, level);
  let max = 0;
  if (slots) for (const k in slots) if (slots[k].total > 0) max = Math.max(max, Number(k));
  return max;
}

// Construye el MODELO DE DATOS de un personaje de NIVEL 1 desde las elecciones.
// (Si el nivel inicial elegido es > 1, el LevelUpWizard sube desde aquí.)
export function buildCharacterFromChoices({ name, raceId, classId, backgroundId, abilities, languages, equipment }, db) {
  const cls = db.classes.find((c) => c.id === classId);
  const max = Math.max(1, (cls?.hitDie || 8) + abilityMod(abilities.CON));
  const slots = spellSlotsForLevel(cls, 1);
  // Lanzador recién creado: arranca SIN conjuros; el asistente (paso "Conjuros",
  // semilla) le hace elegir los iniciales. (Los datos no asocian conjuro→clase,
  // así que el pool se filtra por nivel de conjuro, no por clase.)
  const spells = cls?.spellcasting
    ? { knownIds: [], preparedIds: [], slots: slots || {} }
    : null;

  return {
    id: `custom-${Date.now()}`,
    name,
    level: 1,
    raceId,
    classId,
    subclassId: null,
    backgroundId,
    abilities,
    languages: languages || [],
    inventory: (equipment || []).map((itemId) => ({ itemId, equipped: false })),
    spells,
    hp: { current: max, max, temp: 0 },
    hitDiceUsed: 0,
    deathSaves: { success: 0, fail: 0 },
    conditions: [],
  };
}
