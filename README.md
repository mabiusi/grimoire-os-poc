# 📖 Grimoire OS — POC (v1.4)

Prueba de concepto web del firmware **Grimoire OS**, pensado para correr más
adelante en **QuestBoy**, una consola portátil custom basada en ESP32, enfocada
en herramientas para juegos de rol de mesa y aventuras de texto.

Sirve para validar **flujo, navegación, estética y lógica de juego** en el
navegador antes de portar a C++/LVGL. Es una **PWA offline-first** instalable en
el móvil.

- 🌐 Producción: **https://grimoire-os-poc.vercel.app**
- 📦 Repo: https://github.com/mabiusi/grimoire-os-poc

## Stack

- **React 18** + **Vite**
- **Tailwind CSS** (estética "Retro Color" 16-bits)
- **Zustand** — estado global (base de conocimiento + personajes)
- **vite-plugin-pwa** — instalable y offline

## Cómo ejecutar

```bash
npm install
npm run dev        # http://localhost:5173
```

> El Service Worker (PWA) sólo se activa en build/preview, no en `vite dev`.
> Para probar la instalación: `npm run build && npm run preview`.

## Base de conocimiento (datos de 5etools)

La app es **data-driven** y **offline-first**: la base de conocimiento (clases,
especies, conjuros, objetos, bestiario…) se sirve como JSON estáticos en
`public/data/` y se cargan por `fetch` durante la Boot Screen, precacheados por
la PWA.

Esos JSON son la **salida normalizada de un adapter**, no el dump crudo:

```
raw_data/  (5etools crudo, GITIGNORED)
   │
   ▼   node scripts/build-data.js   (alias: npm run build:data)
   │
public/data/clean_*.json  (liviano, versionado)
   │
   ▼   fetch en el boot
useGrimoireStore.db
```

El adapter ([scripts/build-data.js](scripts/build-data.js)):

- Extrae los arrays de entidad de cada archivo de 5etools (descarta `_meta`).
- Filtra al subset **SRD / fuentes núcleo** (licencia abierta + dataset chico).
- Deduplica por nombre y mapea los campos a la forma del Store.
- **Aplana** los `entries` anidados a un párrafo **conservando las etiquetas
  `{@...}`** (las renderiza [GrimoireTextRenderer](src/components/GrimoireTextRenderer.jsx)).

Para regenerar los datos: colocá el dump de 5etools en `raw_data/` y corré
`npm run build:data`. (Sólo se versionan los `clean_*.json`; el crudo queda en
`raw_data/`, ignorado por git.)

## Controles — layout SNES (teclado + táctil)

Toda la interacción imita los botones físicos de la QuestBoy. Tanto el teclado
como el **Gamepad Virtual** táctil alimentan el mismo bus de entrada, así que
las acciones son idénticas.

| Botón SNES | Tecla (Mac)     | Función                                  |
| ---------- | --------------- | ---------------------------------------- |
| D-Pad      | Flechas         | Mover el foco / scroll / ajustar         |
| A          | `Z`             | Aceptar · Confirmar · Tirar              |
| B          | `X` / `Esc`     | Atrás · Cancelar                         |
| X          | `C`             | Acción contextual (p.ej. Subir de Nivel) |
| Y          | `V`             | Tirada rápida de d20 (global)            |
| L / R      | `Q` / `E`       | Pestañas / secciones                     |
| Start      | `Enter`         | Menú de sistema (global)                 |
| Select     | `Shift`         | Modo noche/día (global)                  |

El elemento enfocado se marca con el cursor de espada `▶` + inversión de
colores. Un pie de página dentro de la pantalla recuerda los controles activos.

## Pantalla y layout responsivo

- **Desktop:** lienzo lógico fijo de **640×480 (4:3)** centrado sobre fondo
  negro, escalado para encajar manteniendo la proporción. Efecto CRT.
- **Móvil (vertical):** pantalla partida — arriba la pantalla de Grimoire OS
  (4:3) y abajo el **Gamepad Virtual** táctil con todo el layout SNES.

## Apps

1. **Hojas de Personaje** — roster de personajes (modelo de datos en el Store).
   - **Creación** multi-paso: teclado virtual para el nombre, especie/clase/
     trasfondo desde la base de conocimiento, stats (manual 0–20 o tirada 4d6),
     idiomas, equipo y **nivel inicial (1–20)**.
   - **Hoja reactiva (estado derivado):** CA recalculada al equipar armadura/
     escudo, **bonus de competencia** por nivel, rasgos de clase/subclase
     heredados según el nivel.
   - Pestañas (L/R): **Stats · Inventario · Magia · Combate**.
   - **Subir de Nivel** (X): wizard de PV (tirada/promedio), subclase y ASI.
   - **Combate:** HP/temp, dados de golpe, salvaciones de muerte y condiciones.
2. **Dados Virtuales** — **constructor de tiradas (dice pool)** con siluetas de
   cada dado (d4–d100), ventaja/desventaja en d20 (L/R/Y) y animación de tirada.
3. **Grimorio de Reglas** — 2 secciones (L/R): **Reglas** (flashcards rápidas) y
   **Enciclopedia** (explorador de la base de conocimiento, con render de
   etiquetas 5etools).
4. **Aventura de Texto** — libro-juego ramificado estilo terminal.

## Funciones globales (desde cualquier app)

- **Start** → menú de sistema: Volver al Launcher · Ajustes (tema/CRT/sonido) ·
  Suspender.
- **Y** → tirada rápida de d20 con popup breve.
- **Select** → alterna modo noche (filtro frío) / día.

## Estructura

```
scripts/build-data.js        Adapter 5etools (raw_data → public/data/clean_*.json)
public/data/clean_*.json     Base de conocimiento normalizada (SRD)
src/
├─ App.jsx                    Providers + layout responsivo (desktop / móvil)
├─ store/
│  ├─ useGrimoireStore.js     Zustand: db (fetch) + personajes + acciones
│  ├─ derive.js               Estado derivado (CA, competencia, rasgos…)
│  └─ levelup.js              Lógica de progresión (plan / HP / subclase / ASI)
├─ context/
│  ├─ SystemContext.jsx       "Kernel": pila de pantallas + tema + ajustes
│  └─ InputContext.jsx        Bus de entrada unificado (teclado + táctil, por capas)
├─ hooks/useGamepad.js        Suscribe handlers al bus (layer / capture / enabled)
├─ lib/                       sfx (Web Audio 8-bits) · utils (wrapIndex/clamp/rollDie)
├─ data/                      constants (stats, PB, DB_FILES) + contenido (rules/story)
├─ components/
│  ├─ Device · VirtualGamepad · GlobalControls · Frame · Cursor
│  ├─ VirtualKeyboard · ListSelect · ChecklistSelect      (creación)
│  ├─ StatAssignStep · StatRoller · LevelUpWizard         (stats / niveles)
│  ├─ CombatTracker · SpellTracker                        (ficha)
│  ├─ DieShape                                            (siluetas de dados)
│  └─ GrimoireTextRenderer                                (parser de etiquetas 5etools)
└─ screens/
   ├─ BootSequence            Arranque + carga de la base de conocimiento
   ├─ MainLauncher            Menú principal (cuadrícula 2×2)
   ├─ CharacterSheets         Hojas de personaje (creación + visor reactivo)
   ├─ DiceRoller              Constructor de tiradas (dice pool)
   ├─ RuleGrimoire            Reglas (flashcards) + Enciclopedia
   └─ TextAdventure           Aventura de texto
```

## Despliegue

Conectado a **Vercel**: cada `git push` a `main` redespliega producción
automáticamente. Config SPA + headers de PWA en [vercel.json](vercel.json).
