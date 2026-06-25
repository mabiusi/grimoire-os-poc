// Efectos de sonido sintetizados (Web Audio). Cero assets, todo cuadrado/8-bits.
// El AudioContext se crea de forma perezosa en la primera tecla (gesto del
// usuario), así cumplimos la política de autoplay de los navegadores.

let ctx = null;
let enabled = true;

// Permite silenciar todo el audio desde los Ajustes del sistema.
export function setSoundEnabled(value) {
  enabled = value;
}

function ac() {
  if (!enabled) return null;
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

// Un "blip" simple: onda + envolvente de decaimiento rápido.
function blip({ freq = 440, dur = 0.06, type = 'square', vol = 0.07 } = {}) {
  const a = ac();
  if (!a) return;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, a.currentTime);
  gain.gain.setValueAtTime(vol, a.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
  osc.connect(gain).connect(a.destination);
  osc.start();
  osc.stop(a.currentTime + dur);
}

// Pequeño deslizamiento de frecuencia (para confirmaciones / arranque).
function sweep({ from = 300, to = 700, dur = 0.12, type = 'square', vol = 0.06 } = {}) {
  const a = ac();
  if (!a) return;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(from, a.currentTime);
  osc.frequency.linearRampToValueAtTime(to, a.currentTime + dur);
  gain.gain.setValueAtTime(vol, a.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
  osc.connect(gain).connect(a.destination);
  osc.start();
  osc.stop(a.currentTime + dur);
}

export const sfx = {
  move: () => blip({ freq: 320, dur: 0.04, vol: 0.05 }),
  select: () => sweep({ from: 420, to: 760, dur: 0.1 }),
  back: () => blip({ freq: 200, dur: 0.08, type: 'triangle' }),
  open: () => sweep({ from: 300, to: 900, dur: 0.18 }),
  error: () => blip({ freq: 120, dur: 0.14, type: 'sawtooth' }),
  tick: () => blip({ freq: 880, dur: 0.02, vol: 0.03 }),
  roll: () => blip({ freq: 600, dur: 0.02, vol: 0.04 }),
  result: () => sweep({ from: 500, to: 1100, dur: 0.22 }),
  boot: () => sweep({ from: 160, to: 880, dur: 0.5, vol: 0.05 }),
  page: () => blip({ freq: 540, dur: 0.05, type: 'triangle', vol: 0.05 }),
  menuOpen: () => sweep({ from: 280, to: 620, dur: 0.14, type: 'triangle' }),
  menuClose: () => sweep({ from: 620, to: 240, dur: 0.14, type: 'triangle' }),
  tab: () => blip({ freq: 700, dur: 0.05, type: 'square', vol: 0.05 }),
  theme: () => sweep({ from: 500, to: 250, dur: 0.25, type: 'sine', vol: 0.06 }),
  suspend: () => sweep({ from: 600, to: 80, dur: 0.6, type: 'sine', vol: 0.06 }),
};
