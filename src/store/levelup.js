// Lógica central de progresión / subida de nivel (pura). El LevelUpWizard la
// usa para construir el "plan" de pasos y aplicar cada elección al personaje.
import { hitDieAverage } from '../data/constants.js';
import { abilityMod, spellSlotsForLevel } from './derive.js';

export { hitDieAverage };

/**
 * Construye el plan de pasos para subir de `char.level` a `targetLevel`.
 * Por cada nivel ganado:
 *   - 'hp'       siempre (tirar dado o promedio)
 *   - 'subclass' si ese nivel es el de elección de subclase y aún no tiene
 *   - 'asi'      si ese nivel está en la lista de ASI de la clase
 * Devuelve [{ level, kind, hitDie? }].
 */
export function planLevelUp(char, targetLevel, cls) {
  const steps = [];
  if (!cls) return steps;
  for (let lvl = char.level + 1; lvl <= targetLevel; lvl += 1) {
    steps.push({ level: lvl, kind: 'hp', hitDie: cls.hitDie });
    if (cls.subclassLevel === lvl && !char.subclassId) steps.push({ level: lvl, kind: 'subclass' });
    if ((cls.asiLevels || []).includes(lvl)) steps.push({ level: lvl, kind: 'asi' });
  }
  return steps;
}

// Suma PV al máximo (y al actual): tirada o promedio, + modificador de CON.
export function gainHp(char, value) {
  const gain = Math.max(1, value + abilityMod(char.abilities.CON));
  return { ...char, hp: { ...char.hp, max: char.hp.max + gain, current: char.hp.current + gain } };
}

export const setSubclass = (char, subclassId) => ({ ...char, subclassId });

// Aplica un reparto de ASI ({ FUE:+1, CON:+1 }), tope 20 por característica.
export function applyAsi(char, deltas) {
  const abilities = { ...char.abilities };
  for (const k in deltas) abilities[k] = Math.min(20, Math.max(0, (abilities[k] || 0) + deltas[k]));
  return { ...char, abilities };
}

// Cierre del nivel: fija el nivel y recalcula espacios de conjuro totales
// (preservando los usados) y los dados de golpe disponibles.
export function finalizeLevel(char, targetLevel, cls) {
  let next = { ...char, level: targetLevel };
  if (cls?.spellcasting && next.spells) {
    const fresh = spellSlotsForLevel(cls, targetLevel) || {};
    const slots = {};
    for (const k in fresh) {
      const prevUsed = next.spells.slots?.[k]?.used || 0;
      slots[k] = { total: fresh[k].total, used: Math.min(prevUsed, fresh[k].total) };
    }
    next = { ...next, spells: { ...next.spells, slots } };
  }
  next.hitDiceUsed = Math.min(next.hitDiceUsed, targetLevel);
  return next;
}
