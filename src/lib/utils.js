// Mueve un índice dentro de [0, length) con "wrap" (envuelve por los bordes).
export function wrapIndex(index, length) {
  return (index + length) % length;
}

// Limita un valor entre min y max.
export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

// Entero aleatorio entre 1 y n (una "cara" de dado).
export function rollDie(n) {
  return Math.floor(Math.random() * n) + 1;
}
