import { useState } from 'react';
import Frame from '../components/Frame.jsx';
import Cursor from '../components/Cursor.jsx';
import PixelIcon from '../components/PixelIcon.jsx';
import { SCREENS, useSystem } from '../context/SystemContext.jsx';
import { useGamepad } from '../hooks/useGamepad.js';
import { sfx } from '../lib/sfx.js';

const APPS = [
  {
    screen: SCREENS.CHARACTER,
    icon: 'scroll',
    name: 'Hojas de\nPersonaje',
    desc: 'Fichas de personaje multi-sistema (D&D, Cthulhu...)',
  },
  {
    screen: SCREENS.DICE,
    icon: 'dice',
    name: 'Dados\nVirtuales',
    desc: 'Lanza d4, d6, d8, d10, d12 y d20 con un botón.',
  },
  {
    screen: SCREENS.RULES,
    icon: 'book',
    name: 'Grimorio\nde Reglas',
    desc: 'Consulta reglas básicas sin abrir el manual.',
  },
  {
    screen: SCREENS.ADVENTURE,
    icon: 'sword',
    name: 'Aventura\nde Texto',
    desc: 'Un libro-juego de mazmorras en tu bolsillo.',
  },
];

const COLS = 2;

export default function MainLauncher() {
  const { navigate } = useSystem();
  const [index, setIndex] = useState(0);

  const move = (nextIndex) => {
    if (nextIndex !== index) sfx.move();
    setIndex(nextIndex);
  };

  const row = Math.floor(index / COLS);
  const col = index % COLS;
  const rows = Math.ceil(APPS.length / COLS);

  useGamepad({
    onLeft: () => move(row * COLS + (col + COLS - 1) % COLS),
    onRight: () => move(row * COLS + (col + 1) % COLS),
    onUp: () => move(((row + rows - 1) % rows) * COLS + col),
    onDown: () => move(((row + 1) % rows) * COLS + col),
    onA: () => {
      sfx.open();
      navigate(APPS[index].screen);
    },
  });

  return (
    <Frame
      title="GRIMOIRE OS"
      icon="castle"
      hints={[
        ['↑↓←→', 'Mover'],
        ['A', 'Abrir'],
      ]}
    >
      <div className="flex h-full flex-col p-3">
        {/* Cuadrícula de apps 2x2 */}
        <div className="grid flex-1 grid-cols-2 grid-rows-2 gap-3">
          {APPS.map((app, i) => {
            const active = i === index;
            return (
              <div
                key={app.screen}
                className={[
                  'relative flex flex-col items-center justify-center rounded border-2 text-center transition-colors',
                  active
                    ? 'border-goldLight bg-gold text-ink shadow-bevel'
                    : 'border-bronze/60 bg-stoneDark text-parchment/80',
                ].join(' ')}
              >
                {active && (
                  <Cursor className="absolute left-1.5 top-1.5 text-ink" />
                )}
                <span className={active ? 'drop-shadow-[2px_2px_0_rgba(0,0,0,0.4)]' : 'opacity-90'}>
                  <PixelIcon name={app.icon} size={40} mono={active} />
                </span>
                <span className="mt-2 whitespace-pre-line font-press text-[9px] leading-relaxed">
                  {app.name}
                </span>
              </div>
            );
          })}
        </div>

        {/* Pie con la descripción de la app enfocada. */}
        <div className="mt-3 flex h-12 items-center rounded border-2 border-bronze bg-stoneDark px-3">
          <PixelIcon name={APPS[index].icon} size={18} className="mr-2" />
          <p className="font-vt text-lg leading-tight text-goldLight">{APPS[index].desc}</p>
        </div>
      </div>
    </Frame>
  );
}
