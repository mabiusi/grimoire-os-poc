import { create } from 'zustand';
import { DB_FILES } from '../data/constants.js';

const clampN = (v, min, max) => Math.min(max, Math.max(min, v));

// Tolera dos formas de JSON: array plano (mock normalizado) o el "sobre" de
// 5etools `{ _meta, <entidad>: [...] }`, del que extraemos el primer array.
// (Stopgap: aún no mapea los CAMPOS de 5etools a nuestra forma; eso es el adapter.)
function toArray(json) {
  if (Array.isArray(json)) return json;
  if (json && typeof json === 'object') {
    for (const k of Object.keys(json)) if (Array.isArray(json[k])) return json[k];
  }
  return [];
}

const EMPTY_DB = {
  races: [],
  classes: [],
  backgrounds: [],
  languages: [],
  spells: [],
  equipment: [],
  bestiary: [],
  conditions: [],
};

// Personajes de muestra (modelo de datos; los valores derivados se calculan).
const SAMPLE_CHARACTERS = [
  {
    id: 'sample-thorin',
    name: 'Thorin',
    level: 3,
    raceId: 'dwarf',
    classId: 'fighter',
    subclassId: 'champion',
    backgroundId: 'soldier',
    abilities: { FUE: 16, DES: 12, CON: 15, INT: 10, SAB: 13, CAR: 8 },
    languages: ['common', 'dwarvish'],
    inventory: [
      { itemId: 'chain-mail', equipped: true },
      { itemId: 'shield', equipped: true },
      { itemId: 'longsword', equipped: true },
    ],
    spells: null,
    hp: { current: 28, max: 28, temp: 0 },
    hitDiceUsed: 0,
    deathSaves: { success: 0, fail: 0 },
    conditions: [],
  },
  {
    id: 'sample-lia',
    name: 'Lía',
    level: 1,
    raceId: 'elf',
    classId: 'wizard',
    subclassId: null,
    backgroundId: 'sage',
    abilities: { FUE: 8, DES: 16, CON: 13, INT: 16, SAB: 11, CAR: 10 },
    languages: ['common', 'elvish'],
    inventory: [
      { itemId: 'leather-armor', equipped: false },
      { itemId: 'longsword', equipped: false },
    ],
    spells: {
      knownIds: ['fire-bolt', 'mage-hand', 'magic-missile', 'shield'],
      preparedIds: ['magic-missile'],
      slots: { 1: { total: 2, used: 0 } },
    },
    hp: { current: 7, max: 7, temp: 0 },
    hitDiceUsed: 0,
    deathSaves: { success: 0, fail: 0 },
    conditions: [],
  },
];

export const useGrimoireStore = create((set, get) => ({
  // --- carga de la base de conocimiento (offline-first: fetch de public/data) ---
  loaded: false,
  loading: false,
  progress: 0,
  db: EMPTY_DB,

  loadDatabase: async () => {
    if (get().loaded || get().loading) return;
    set({ loading: true, progress: 5 });
    const base = import.meta.env.BASE_URL || '/';
    const keys = Object.keys(DB_FILES);
    const db = { ...EMPTY_DB };
    let done = 0;
    await Promise.all(
      keys.map(async (key) => {
        try {
          const res = await fetch(`${base}data/${DB_FILES[key]}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          db[key] = toArray(await res.json());
        } catch (e) {
          console.error('Grimoire: no se pudo cargar', DB_FILES[key], e);
          db[key] = [];
        }
        done += 1;
        set({ progress: Math.max(get().progress, Math.round((done / keys.length) * 100)) });
      })
    );
    set({ db, loaded: true, loading: false, progress: 100 });
  },

  // --- roster de personajes (modelo de datos mutable) ---
  characters: SAMPLE_CHARACTERS,
  getCharacter: (id) => get().characters.find((c) => c.id === id),
  addCharacter: (char) => set((s) => ({ characters: [...s.characters, char] })),
  removeCharacter: (id) => set((s) => ({ characters: s.characters.filter((c) => c.id !== id) })),
  updateCharacter: (id, updater) =>
    set((s) => ({ characters: s.characters.map((c) => (c.id === id ? updater(c) : c)) })),

  // --- inventario: equipar (recalcula CA reactivamente) ---
  toggleEquipped: (id, itemId) =>
    get().updateCharacter(id, (c) => ({
      ...c,
      inventory: c.inventory.map((it) => (it.itemId === itemId ? { ...it, equipped: !it.equipped } : it)),
    })),

  // --- combate: HP ---
  applyDamage: (id, amount) =>
    get().updateCharacter(id, (c) => {
      const fromTemp = Math.min(c.hp.temp, amount);
      const rest = amount - fromTemp;
      return { ...c, hp: { ...c.hp, temp: c.hp.temp - fromTemp, current: Math.max(0, c.hp.current - rest) } };
    }),
  heal: (id, amount) =>
    get().updateCharacter(id, (c) => ({ ...c, hp: { ...c.hp, current: Math.min(c.hp.max, c.hp.current + amount) } })),
  addTemp: (id, amount) =>
    get().updateCharacter(id, (c) => ({ ...c, hp: { ...c.hp, temp: Math.max(0, c.hp.temp + amount) } })),

  // --- combate: dados de golpe (descanso corto) ---
  setHitDiceUsed: (id, used) =>
    get().updateCharacter(id, (c) => ({ ...c, hitDiceUsed: clampN(used, 0, c.level) })),

  // --- combate: salvaciones de muerte ---
  setDeathSave: (id, type, count) =>
    get().updateCharacter(id, (c) => ({ ...c, deathSaves: { ...c.deathSaves, [type]: clampN(count, 0, 3) } })),
  resetDeathSaves: (id) => get().updateCharacter(id, (c) => ({ ...c, deathSaves: { success: 0, fail: 0 } })),

  // --- combate: condiciones ---
  toggleCondition: (id, condId) =>
    get().updateCharacter(id, (c) => ({
      ...c,
      conditions: c.conditions.includes(condId) ? c.conditions.filter((x) => x !== condId) : [...c.conditions, condId],
    })),

  // --- magia: preparar / gastar espacios ---
  toggleSpellPrepared: (id, spellId) =>
    get().updateCharacter(id, (c) => {
      if (!c.spells) return c;
      const prep = c.spells.preparedIds.includes(spellId)
        ? c.spells.preparedIds.filter((x) => x !== spellId)
        : [...c.spells.preparedIds, spellId];
      return { ...c, spells: { ...c.spells, preparedIds: prep } };
    }),
  setSpellSlotUsed: (id, level, used) =>
    get().updateCharacter(id, (c) => {
      if (!c.spells?.slots?.[level]) return c;
      const total = c.spells.slots[level].total;
      return { ...c, spells: { ...c.spells, slots: { ...c.spells.slots, [level]: { total, used: clampN(used, 0, total) } } } };
    }),
}));
