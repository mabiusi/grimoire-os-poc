import { useMemo } from 'react';
import { useSystem } from '../context/SystemContext.jsx';
import { computeTheme } from '../lib/theme.js';

/**
 * Devuelve el objeto de tema computado a partir de (theme, accent) del kernel.
 * Úsalo cuando necesites valores de color crudos en JS (p.ej. PixelIcon, que
 * pinta `<rect>` con colores concretos). Los componentes que sólo necesitan
 * color visual deberían usar los tokens de Tailwind (que ya leen las CSS vars).
 */
export function useTheme() {
  const { theme, accent } = useSystem();
  return useMemo(() => computeTheme(theme, accent), [theme, accent]);
}
