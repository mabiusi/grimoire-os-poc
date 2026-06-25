import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';

/**
 * Bus de entrada unificado de la QuestBoy (layout SNES).
 *
 * Tanto el TECLADO físico como el GAMEPAD VIRTUAL táctil llaman a `emit(button)`,
 * de modo que las acciones son idénticas sin importar el método de entrada.
 *
 * Los suscriptores (pantallas, overlays) se registran con `useGamepad` indicando
 * una CAPA de prioridad. Al pulsar un botón, el bus recorre los suscriptores de
 * mayor a menor prioridad:
 *   - si el suscriptor tiene handler para ese botón -> lo llama y se detiene.
 *   - si no lo tiene pero es `capture` -> se detiene igualmente (bloquea capas
 *     inferiores). Esto permite que un modal "atrape" toda la entrada.
 *   - si no, sigue cayendo hacia capas inferiores (p.ej. Start/Y globales).
 */

// Botones lógicos del mando.
export const BUTTONS = [
  'up',
  'down',
  'left',
  'right',
  'a',
  'b',
  'x',
  'y',
  'l',
  'r',
  'start',
  'select',
];

// Capas de prioridad (mayor número = más arriba).
export const Layer = {
  GLOBAL: 0, // Start / Y / Select globales (debajo de todo)
  SCREEN: 10, // la app activa
  OVERLAY: 100, // modales: menú de sistema, suspensión...
};

// botón lógico -> nombre de prop del handler.
export const BUTTON_TO_PROP = {
  up: 'onUp',
  down: 'onDown',
  left: 'onLeft',
  right: 'onRight',
  a: 'onA',
  b: 'onB',
  x: 'onX',
  y: 'onY',
  l: 'onL',
  r: 'onR',
  start: 'onStart',
  select: 'onSelect',
};

// Mapeo de teclas físicas (Mac) -> botón SNES, por posición física (e.code).
const KEY_TO_BUTTON = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  KeyZ: 'a', // A · Aceptar / Confirmar
  KeyX: 'b', // B · Atrás / Cancelar
  KeyC: 'x', // X · Acción contextual
  KeyV: 'y', // Y · Acción rápida (Quick Roll)
  KeyQ: 'l', // Gatillo L
  KeyE: 'r', // Gatillo R
  Enter: 'start', // Start · Menú de sistema
  ShiftLeft: 'select', // Select · Modo noche
  ShiftRight: 'select',
  Escape: 'b', // alias de conveniencia para "Atrás"
};

// El D-Pad puede auto-repetirse al mantener pulsado; los botones de acción no.
const REPEATABLE = new Set(['up', 'down', 'left', 'right']);

const InputContext = createContext(null);

let nextId = 1;

export function InputProvider({ children }) {
  // Registro de suscriptores: id -> { handlers(ref), layer, capture }.
  const subs = useRef(new Map());

  const register = useCallback((entry) => {
    const id = nextId++;
    subs.current.set(id, entry);
    return () => subs.current.delete(id);
  }, []);

  const emit = useCallback((button) => {
    const prop = BUTTON_TO_PROP[button];
    if (!prop) return;
    // Orden: capa desc, y dentro de la capa, registro más reciente primero.
    const ordered = [...subs.current.entries()].sort(
      (a, b) => b[1].layer - a[1].layer || b[0] - a[0]
    );
    for (const [, sub] of ordered) {
      const fn = sub.handlers.current?.[prop];
      if (typeof fn === 'function') {
        fn();
        return;
      }
      if (sub.capture) return; // un modal bloquea las capas inferiores
    }
  }, []);

  // Único listener de teclado para toda la app.
  useEffect(() => {
    const onKeyDown = (e) => {
      const button = KEY_TO_BUTTON[e.code];
      if (!button) return;
      e.preventDefault();
      if (e.repeat && !REPEATABLE.has(button)) return;
      emit(button);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [emit]);

  const value = useMemo(() => ({ register, emit }), [register, emit]);
  return <InputContext.Provider value={value}>{children}</InputContext.Provider>;
}

export function useInput() {
  const ctx = useContext(InputContext);
  if (!ctx) throw new Error('useInput debe usarse dentro de <InputProvider>');
  return ctx;
}
