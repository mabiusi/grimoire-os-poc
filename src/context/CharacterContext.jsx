import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { SAMPLE_ENTRIES } from '../data/characters.js';

/**
 * Roster de personajes de la sesión: los de muestra + los creados por el usuario.
 *
 * Vive por encima de las pantallas (montado en App), así los personajes creados
 * persisten aunque salgas y vuelvas a entrar a la app de Hojas de Personaje.
 * (Sesión en memoria; no hay persistencia en disco en esta POC.)
 */
const CharacterContext = createContext(null);

export function CharacterProvider({ children }) {
  const [custom, setCustom] = useState([]);

  const addCharacter = useCallback((entry) => {
    setCustom((prev) => [...prev, entry]);
  }, []);

  const value = useMemo(
    () => ({
      roster: [...SAMPLE_ENTRIES, ...custom],
      addCharacter,
    }),
    [custom, addCharacter]
  );

  return <CharacterContext.Provider value={value}>{children}</CharacterContext.Provider>;
}

export function useCharacters() {
  const ctx = useContext(CharacterContext);
  if (!ctx) throw new Error('useCharacters debe usarse dentro de <CharacterProvider>');
  return ctx;
}
