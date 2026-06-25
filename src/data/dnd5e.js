// Datos de prueba basados en el SRD de D&D 5e (muestras, no exhaustivo).
// Claves de característica en español (FUE/DES/CON/INT/SAB/CAR == STR/DEX/CON/INT/WIS/CHA).

export const STAT_KEYS = ['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'];
export const STAT_NAMES = {
  FUE: 'Fuerza',
  DES: 'Destreza',
  CON: 'Constitución',
  INT: 'Inteligencia',
  SAB: 'Sabiduría',
  CAR: 'Carisma',
};

export const RACES = [
  { id: 'human', name: 'Humano', desc: '+1 a todas las características. Versátil y ambicioso.', speed: '9 m' },
  { id: 'elf', name: 'Elfo', desc: '+2 DES. Visión en la oscuridad y sentidos agudos.', speed: '9 m' },
  { id: 'dwarf', name: 'Enano', desc: '+2 CON. Resistencia al veneno y visión oscura.', speed: '7,5 m' },
  { id: 'halfling', name: 'Mediano', desc: '+2 DES. Afortunado y valiente.', speed: '7,5 m' },
  { id: 'half-orc', name: 'Semiorco', desc: '+2 FUE, +1 CON. Aguante implacable.', speed: '9 m' },
  { id: 'tiefling', name: 'Tiflin', desc: '+2 CAR, +1 INT. Resistencia al fuego.', speed: '9 m' },
];

export const CLASSES = [
  { id: 'fighter', name: 'Guerrero', hitDie: 10, primary: 'FUE o DES', caster: false, skills: ['Atletismo', 'Percepción'], desc: 'Maestro de armas y armaduras.' },
  { id: 'wizard', name: 'Mago', hitDie: 6, primary: 'INT', caster: true, ability: 'INT', slots1: 2, skills: ['Arcanos', 'Historia'], desc: 'Erudito arcano que lanza conjuros de su libro.' },
  { id: 'rogue', name: 'Pícaro', hitDie: 8, primary: 'DES', caster: false, skills: ['Sigilo', 'Juego de Manos'], desc: 'Sigilo, trampas y ataque furtivo.' },
  { id: 'cleric', name: 'Clérigo', hitDie: 8, primary: 'SAB', caster: true, ability: 'SAB', slots1: 2, skills: ['Religión', 'Perspicacia'], desc: 'Canaliza la magia divina de su deidad.' },
  { id: 'ranger', name: 'Explorador', hitDie: 10, primary: 'DES y SAB', caster: false, skills: ['Supervivencia', 'Sigilo'], desc: 'Cazador de las tierras salvajes.' },
  { id: 'barbarian', name: 'Bárbaro', hitDie: 12, primary: 'FUE', caster: false, skills: ['Atletismo', 'Intimidación'], desc: 'Furia primaria en combate.' },
];

export const BACKGROUNDS = [
  { id: 'acolyte', name: 'Acólito', desc: 'Sirviente devoto de un templo.', skills: ['Religión', 'Perspicacia'] },
  { id: 'criminal', name: 'Criminal', desc: 'Pasado en el bajo mundo.', skills: ['Sigilo', 'Engaño'] },
  { id: 'sage', name: 'Sabio', desc: 'Investigador y erudito incansable.', skills: ['Arcanos', 'Historia'] },
  { id: 'soldier', name: 'Soldado', desc: 'Veterano endurecido por la guerra.', skills: ['Atletismo', 'Intimidación'] },
  { id: 'folk-hero', name: 'Héroe del Pueblo', desc: 'Defensor de la gente común.', skills: ['Supervivencia', 'Trato con Animales'] },
];

export const LANGUAGES = [
  { id: 'comun', name: 'Común' },
  { id: 'elfico', name: 'Élfico' },
  { id: 'enano', name: 'Enano' },
  { id: 'gigante', name: 'Gigante' },
  { id: 'goblin', name: 'Goblin' },
  { id: 'orco', name: 'Orco' },
  { id: 'draconico', name: 'Dracónico' },
  { id: 'infernal', name: 'Infernal' },
  { id: 'silvano', name: 'Silvano' },
];

export const EQUIPMENT = [
  { id: 'explorer', name: 'Pack de Explorador', note: 'Mochila, saco, raciones x5, cuerda' },
  { id: 'dungeoneer', name: 'Pack de Mazmorrero', note: 'Palanca, pitones, antorchas x10' },
  { id: 'scholar', name: 'Pack de Erudito', note: 'Libro, tinta, pluma, pergamino' },
  { id: 'sword', name: 'Espada larga', note: '1d8 cortante' },
  { id: 'bow', name: 'Arco corto', note: '1d6 · 24/96 m' },
  { id: 'shield', name: 'Escudo', note: '+2 CA' },
  { id: 'leather', name: 'Armadura de cuero', note: 'CA 11 + DES' },
  { id: 'potion', name: 'Poción de curación', note: '2d4+2 PV' },
];

// Conjuros SRD de muestra por clase.
const CANTRIPS = {
  wizard: ['Rayo de escarcha', 'Mano de mago', 'Luz', 'Prestidigitación', 'Descarga de fuego'],
  cleric: ['Llama sagrada', 'Luz', 'Taumaturgia', 'Resistencia'],
};
const SPELLS_L1 = {
  wizard: ['Misil mágico', 'Escudo', 'Detectar magia', 'Dormir', 'Manos ardientes', 'Armadura de mago'],
  cleric: ['Curar heridas', 'Bendición', 'Palabra de curación', 'Escudo de fe'],
};

const mod = (v) => Math.floor((v - 10) / 2);
const fmtMod = (m) => (m >= 0 ? `+${m}` : `${m}`);

export const raceById = (id) => RACES.find((r) => r.id === id);
export const classById = (id) => CLASSES.find((c) => c.id === id);
export const backgroundById = (id) => BACKGROUNDS.find((b) => b.id === id);

// Construye la ficha completa (forma que entiende el visor) desde las elecciones.
export function buildDnd5eCharacter({ name, raceId, classId, backgroundId, stats, languages = [], equipment = [] }) {
  const race = raceById(raceId);
  const cls = classById(classId);
  const bg = backgroundById(backgroundId);

  const hp = cls.hitDie + mod(stats.CON);
  const ac = 10 + mod(stats.DES);
  const skills = [...new Set([...(cls.skills || []), ...(bg.skills || [])])];
  const langNames = languages.map((id) => LANGUAGES.find((l) => l.id === id)?.name).filter(Boolean);

  const magic = cls.caster
    ? {
        ability: cls.ability,
        cantrips: CANTRIPS[cls.id] || [],
        spells: (SPELLS_L1[cls.id] || []).map((n) => ({ name: n, level: 1 })),
        slots: { 1: cls.slots1 || 0 },
      }
    : null;

  return {
    name,
    tagline: `${race.name} ${cls.name} · Nivel 1`,
    meta: [
      ['Especie', race.name],
      ['Clase', cls.name],
      ['Trasfondo', bg.name],
      ['Nivel', '1'],
      ['Idiomas', langNames.length ? langNames.join(', ') : 'Común'],
    ],
    vitals: [
      ['Puntos de Vida', `${hp} / ${hp}`, 'blood'],
      ['Clase de Armadura', String(ac), 'sky'],
      ['Iniciativa', fmtMod(mod(stats.DES)), 'parchment'],
      ['Velocidad', race.speed, 'parchment'],
      ['Dado de Golpe', `d${cls.hitDie}`, 'gold'],
    ],
    stats: STAT_KEYS.map((k) => [k, stats[k], fmtMod(mod(stats[k]))]),
    skills: skills.map((s) => [s, '+4']),
    inventory: equipment.length
      ? equipment.map((id) => {
          const e = EQUIPMENT.find((x) => x.id === id);
          return [e.name, e.note];
        })
      : [['Ropas de viajero', '—']],
    magic,
    spells: [], // compatibilidad con el visor antiguo
    spellsNote: cls.caster
      ? `Lanzador de conjuros de ${cls.ability}. Marca tus preparados y gestiona los espacios.`
      : 'Esta clase no lanza conjuros.',
  };
}

// Crea la ENTRADA de roster lista para el visor.
export function createDnd5eEntry(choices) {
  return {
    id: `custom-${Date.now()}`,
    systemId: 'dnd5e',
    name: 'D&D 5e',
    icon: '🐉',
    accent: 'blood',
    character: buildDnd5eCharacter(choices),
  };
}
