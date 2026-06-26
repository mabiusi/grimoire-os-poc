// Tratamiento ÚNICO de "activo/enfocado" — la regla de oro de estados del
// rediseño. Reemplaza las ~12 copias inline divergentes (y los bg-gold/30·/40
// de InventoryTab/CombatTracker) por un solo helper. Devuelve sólo las clases
// de color/relieve; el caller conserva su layout (flex/rounded/padding) y pone
// el SEGUNDO canal con <Cursor visible={active} /> (cursor ▶, no sólo color).
//
//   activo             → relleno acento sólido + borde claro + bevel (texto ink)
//   inactivo (chrome)  → fondo chrome + texto chromeText + borde tenue
//   inactivo (pergamino) → transparente + texto ink (sin borde)
export function focusRow(active, { onParch = false } = {}) {
  if (active) return 'border-goldLight bg-gold text-[#2a1c0c] shadow-bevel';
  return onParch ? 'border-transparent text-[#2a1c0c]' : 'border-borderDim bg-stoneDark text-chromeText';
}
