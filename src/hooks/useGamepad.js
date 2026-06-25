import { useEffect, useRef } from 'react';
import { Layer, useInput } from '../context/InputContext.jsx';

/**
 * Suscribe un conjunto de handlers al bus de entrada unificado (teclado + touch).
 *
 *   useGamepad({ onUp, onDown, onA, onB, onL, onR, onStart, ... }, opts)
 *
 * opts:
 *   - layer:   capa de prioridad (Layer.SCREEN por defecto). Los overlays usan
 *              Layer.OVERLAY para quedar por encima de la app activa.
 *   - capture: si es true, atrapa TODA la entrada (bloquea capas inferiores
 *              aunque no tenga handler para ese botón). Útil en modales.
 *   - enabled: desactiva la suscripción sin desmontar el componente.
 *
 * Los handlers se guardan en un ref, así siempre se ejecuta la versión fresca
 * sin necesidad de re-suscribir en cada render.
 */
export function useGamepad(handlers, { layer = Layer.SCREEN, capture = false, enabled = true } = {}) {
  const { register } = useInput();
  const ref = useRef(handlers);
  ref.current = handlers;

  useEffect(() => {
    if (!enabled) return undefined;
    return register({ handlers: ref, layer, capture });
  }, [register, layer, capture, enabled]);
}

export { Layer };
