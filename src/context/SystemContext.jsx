import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { setSoundEnabled } from '../lib/sfx.js';

/**
 * "Kernel" de Grimoire OS: navegación + estado global del sistema.
 *
 * Navegación (sin router real, como un firmware): una PILA de pantallas.
 *   navigate / goBack / reset.
 *
 * Estado del sistema:
 *   theme      -> 'day' | 'night'  (alternable con Select)
 *   settings   -> { crt, sound }
 *   suspended  -> modo reposo (opción "Suspender" del menú Start)
 */

export const SCREENS = {
  BOOT: 'BOOT',
  LAUNCHER: 'LAUNCHER',
  CHARACTER: 'CHARACTER',
  DICE: 'DICE',
  RULES: 'RULES',
  ADVENTURE: 'ADVENTURE',
};

const SystemContext = createContext(null);

export function SystemProvider({ children }) {
  const [stack, setStack] = useState([SCREENS.BOOT]);
  const [theme, setTheme] = useState('day');
  const [settings, setSettings] = useState({ crt: true, sound: true, motion: 'auto' });
  const [suspended, setSuspended] = useState(false);

  const navigate = useCallback((screen) => setStack((p) => [...p, screen]), []);
  const goBack = useCallback(
    () => setStack((p) => (p.length > 1 ? p.slice(0, -1) : p)),
    []
  );
  const reset = useCallback((screen) => setStack([screen]), []);

  const toggleTheme = useCallback(
    () => setTheme((t) => (t === 'day' ? 'night' : 'day')),
    []
  );
  const setSetting = useCallback(
    (key, val) => setSettings((s) => ({ ...s, [key]: val })),
    []
  );

  // Mantiene el flag de sonido del módulo de sfx sincronizado con los ajustes.
  useEffect(() => {
    setSoundEnabled(settings.sound);
  }, [settings.sound]);

  const value = useMemo(
    () => ({
      // navegación
      stack,
      current: stack[stack.length - 1],
      canGoBack: stack.length > 1,
      navigate,
      goBack,
      reset,
      // tema
      theme,
      setTheme,
      toggleTheme,
      // ajustes
      settings,
      setSetting,
      // energía
      suspended,
      suspend: () => setSuspended(true),
      resume: () => setSuspended(false),
    }),
    [stack, navigate, goBack, reset, theme, toggleTheme, settings, setSetting, suspended]
  );

  return <SystemContext.Provider value={value}>{children}</SystemContext.Provider>;
}

export function useSystem() {
  const ctx = useContext(SystemContext);
  if (!ctx) throw new Error('useSystem debe usarse dentro de <SystemProvider>');
  return ctx;
}
