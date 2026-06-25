import { useEffect, useState } from 'react';
import Device from './components/Device.jsx';
import VirtualGamepad from './components/VirtualGamepad.jsx';
import GlobalControls from './components/GlobalControls.jsx';
import { InputProvider } from './context/InputContext.jsx';
import { SCREENS, SystemProvider, useSystem } from './context/SystemContext.jsx';

import BootSequence from './screens/BootSequence.jsx';
import MainLauncher from './screens/MainLauncher.jsx';
import CharacterSheets from './screens/CharacterSheets.jsx';
import DiceRoller from './screens/DiceRoller.jsx';
import RuleGrimoire from './screens/RuleGrimoire.jsx';
import TextAdventure from './screens/TextAdventure.jsx';

const REGISTRY = {
  [SCREENS.BOOT]: BootSequence,
  [SCREENS.LAUNCHER]: MainLauncher,
  [SCREENS.CHARACTER]: CharacterSheets,
  [SCREENS.DICE]: DiceRoller,
  [SCREENS.RULES]: RuleGrimoire,
  [SCREENS.ADVENTURE]: TextAdventure,
};

function ActiveScreen() {
  const { current } = useSystem();
  const Screen = REGISTRY[current] ?? MainLauncher;
  return <Screen key={current} />;
}

// Contenido de la pantalla del OS: app activa + capa global + filtro de tema.
function OSRoot() {
  const { theme } = useSystem();
  return (
    <div className={`relative h-full w-full overflow-hidden ${theme === 'night' ? 'theme-night' : ''}`}>
      <ActiveScreen />
      <GlobalControls />
    </div>
  );
}

// Decide desktop vs móvil según el viewport (móvil = estrecho o táctil vertical).
function useViewportMode() {
  const get = () => {
    if (typeof window === 'undefined') return 'desktop';
    const coarsePortrait =
      window.matchMedia?.('(pointer: coarse)').matches && window.innerHeight >= window.innerWidth;
    return window.innerWidth < 768 || coarsePortrait ? 'mobile' : 'desktop';
  };
  const [mode, setMode] = useState(get);
  useEffect(() => {
    const onResize = () => setMode(get());
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
    };
  }, []);
  return mode;
}

function Shell() {
  const mode = useViewportMode();

  // Móvil (vertical): arriba la pantalla (ajustada al ancho, 4:3) y abajo el
  // gamepad táctil. El espacio intermedio hace de "cuerpo" de la consola.
  if (mode === 'mobile') {
    return (
      <div className="flex w-screen select-none flex-col bg-black" style={{ height: '100dvh' }}>
        {/* Pantalla anclada arriba, escalada al ancho */}
        <div className="w-full shrink-0" style={{ height: '75vw', maxHeight: '60vh' }}>
          <Device>
            <OSRoot />
          </Device>
        </div>
        {/* Cuerpo de la consola */}
        <div className="min-h-0 flex-1 bg-gradient-to-b from-black to-stoneDark/60" />
        <VirtualGamepad />
      </div>
    );
  }

  // Desktop: pantalla 4:3 centrada, fondo negro alrededor.
  return (
    <div className="fixed inset-0 bg-black">
      <Device>
        <OSRoot />
      </Device>
    </div>
  );
}

export default function App() {
  return (
    <SystemProvider>
      <InputProvider>
        <Shell />
      </InputProvider>
    </SystemProvider>
  );
}
