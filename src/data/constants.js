// Constantes y fórmulas de la app (no son "datos reemplazables", son reglas).

export const STAT_KEYS = ['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'];
export const STAT_NAMES = {
  FUE: 'Fuerza',
  DES: 'Destreza',
  CON: 'Constitución',
  INT: 'Inteligencia',
  SAB: 'Sabiduría',
  CAR: 'Carisma',
};

// Bonus de competencia derivado del nivel (tabla 5e): 1-4→+2, 5-8→+3, ...
export const proficiencyBonus = (level) => 2 + Math.floor((Math.max(1, level) - 1) / 4);

// Promedio de un Dado de Golpe al subir de nivel (5e): d6→4, d8→5, d10→6, d12→7.
export const hitDieAverage = (die) => Math.floor(die / 2) + 1;

// Archivos JSON de la base de conocimiento (en public/data/), por clave del
// store. Son la SALIDA normalizada del adapter (scripts/build-data.js).
export const DB_FILES = {
  races: 'clean_races.json',
  classes: 'clean_classes.json',
  backgrounds: 'clean_backgrounds.json',
  languages: 'clean_languages.json',
  spells: 'clean_spells.json',
  equipment: 'clean_items.json',
  bestiary: 'clean_bestiary.json',
  conditions: 'clean_conditions.json',
};
