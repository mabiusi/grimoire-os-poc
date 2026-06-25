# 📖 Grimoire OS — POC

Prueba de concepto web del firmware **Grimoire OS**, pensado para correr más
adelante en **QuestBoy**, una consola portátil custom basada en ESP32 enfocada
en herramientas para juegos de rol de mesa y aventuras de texto.

Esta POC sirve para validar **flujo, navegación y estética** en el navegador
antes de portar la lógica a C++/LVGL.

## Stack

- **React 18** + **Vite**
- **Tailwind CSS** (prototipado de la estética "Retro Color" 16-bits)
- Sin librerías de routing ni de estado: la navegación se simula con
  **Context API** (`src/context/SystemContext.jsx`), como un firmware.

## Cómo ejecutar

```bash
npm install
npm run dev
```

Abre la URL que imprime Vite (por defecto http://localhost:5173).

## Controles — layout SNES (teclado + táctil)

Toda la interacción imita los botones físicos de la QuestBoy. Tanto el teclado
como el **Gamepad Virtual** táctil alimentan el mismo bus de entrada, así que
las acciones son idénticas.

| Botón SNES | Tecla (Mac)     | Función                              |
| ---------- | --------------- | ------------------------------------ |
| D-Pad      | Flechas         | Mover el foco / scroll               |
| A          | `Z`             | Aceptar · Confirmar · Tirar          |
| B          | `X` / `Esc`     | Atrás · Cancelar                     |
| X          | `C`             | Acción contextual (p.ej. repetir)    |
| Y          | `V`             | Tirada rápida de d20 (global)        |
| L / R      | `Q` / `E`       | Pestañas (Hojas de Personaje)        |
| Start      | `Enter`         | Menú de sistema (global)             |
| Select     | `Shift`         | Modo noche/día (global)              |

El elemento enfocado siempre se marca con el cursor de espada `▶` + inversión
de colores. Un pie de página dentro de la pantalla recuerda los controles
activos de cada vista.

## Pantalla y layout responsivo

- **Desktop:** lienzo lógico fijo de **640×480 (4:3)** centrado sobre fondo
  negro, escalado para encajar manteniendo la proporción. Efecto CRT.
- **Móvil (vertical):** pantalla partida — arriba la pantalla de Grimoire OS
  (ajustada al ancho, 4:3) y abajo el **Gamepad Virtual** táctil con todo el
  layout SNES (D-Pad, ABXY en diamante, Select/Start, gatillos L/R).

El `Device` se escala con un `ResizeObserver` para llenar su contenedor, sea la
ventana completa (desktop) o la mitad superior (móvil).

## Funciones globales (desde cualquier app)

- **Start** → menú de sistema: Volver al Launcher · Ajustes (tema/CRT/sonido) ·
  Suspender.
- **Y** → tirada rápida de d20 con popup breve.
- **Select** → alterna modo noche (filtro frío) / día.

## Estructura

```
src/
├─ App.jsx                  Providers + layout responsivo (desktop / móvil)
├─ context/
│  ├─ SystemContext.jsx     "Kernel": pila de pantallas + tema + ajustes + energía
│  └─ InputContext.jsx      Bus de entrada unificado (teclado + táctil, por capas)
├─ hooks/useGamepad.js      Suscribe handlers al bus (layer / capture / enabled)
├─ lib/
│  ├─ sfx.js                Efectos de sonido 8-bits sintetizados (Web Audio)
│  └─ utils.js              wrapIndex / clamp / rollDie
├─ components/
│  ├─ Device.jsx            Marco físico 4:3 + CRT + escalado (ResizeObserver)
│  ├─ VirtualGamepad.jsx    Gamepad táctil SNES (D-Pad, ABXY, L/R, Start/Select)
│  ├─ GlobalControls.jsx    Menú Start, Tirada rápida (Y), tema (Select), suspensión
│  ├─ Frame.jsx             Chrome de las apps (barra + indicadores de control)
│  └─ Cursor.jsx            Cursor de espada parpadeante
├─ data/                    Contenido hardcodeado (personajes, reglas, historia)
└─ screens/
   ├─ BootSequence.jsx      1. Arranque (módulos mágicos + barra de carga)
   ├─ MainLauncher.jsx      2. Menú principal (cuadrícula 2×2)
   ├─ CharacterSheets.jsx   3. Hojas de personaje (D&D 5e / Cthulhu)
   ├─ DiceRoller.jsx        4. Dados virtuales (d4–d20 animados)
   ├─ RuleGrimoire.jsx      5. Grimorio de reglas (lector paginado)
   └─ TextAdventure.jsx     6. Aventura de texto (libro-juego ramificado)
```

## Notas para el port a embebido

- La navegación por pila y el hook de input son agnósticos a la UI: ese mismo
  modelo mental (un D-Pad + A/B enrutados a la pantalla activa) se traslada bien
  a LVGL con grupos de foco (`lv_group_t`).
- Los datos viven en `src/data/*` separados de la presentación, listos para
  convertirse en estructuras en C o archivos en la SD.
