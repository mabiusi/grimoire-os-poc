import { useEffect, useRef, useState } from 'react';
import Cursor from './Cursor.jsx';
import PixelIcon from './PixelIcon.jsx';
import { Layer } from '../context/InputContext.jsx';
import { SCREENS, useSystem } from '../context/SystemContext.jsx';
import { ACCENT_LABEL } from '../lib/theme.js';
import { useGamepad } from '../hooks/useGamepad.js';
import { sfx } from '../lib/sfx.js';
import { rollDie, wrapIndex } from '../lib/utils.js';
import { focusRow } from '../lib/focus.js';

/**
 * Capa de controles GLOBALES (disponibles desde cualquier app):
 *   Start  -> Menú de sistema (Launcher / Ajustes / Suspender)
 *   Y      -> Tirada rápida de d20 (popup breve)
 *   Select -> Alternar modo noche/día
 *
 * Se registra en la capa GLOBAL, así las pantallas conservan A/B/D-Pad/L/R y sólo
 * "caen" a estos handlers los botones que ellas no usan.
 */
export default function GlobalControls() {
  const { current, toggleTheme, suspended, resume } = useSystem();
  const [menuOpen, setMenuOpen] = useState(false);
  const [quick, setQuick] = useState(null); // { value, id }
  const quickTimer = useRef(0);

  const active = current !== SCREENS.BOOT && !suspended;

  const doQuickRoll = () => {
    const value = rollDie(20);
    setQuick({ value, id: Date.now() });
    sfx.result();
    window.clearTimeout(quickTimer.current);
    quickTimer.current = window.setTimeout(() => setQuick(null), 1700);
  };

  useEffect(() => () => window.clearTimeout(quickTimer.current), []);

  useGamepad(
    {
      onStart: () => {
        sfx.menuOpen();
        setMenuOpen(true);
      },
      onY: doQuickRoll,
      onSelect: () => {
        sfx.theme();
        toggleTheme();
      },
    },
    { layer: Layer.GLOBAL, enabled: active && !menuOpen }
  );

  return (
    <>
      {quick && <QuickRollPopup value={quick.value} key={quick.id} />}
      {menuOpen && <SystemMenu onClose={() => setMenuOpen(false)} />}
      {suspended && <SuspendOverlay onResume={resume} />}
    </>
  );
}

/* --------------------------------------------------------------------- */
function QuickRollPopup({ value }) {
  const crit = value === 20;
  const fail = value === 1;
  const color = crit ? 'text-moss border-moss' : fail ? 'text-blood border-blood' : 'text-goldLight border-gold';
  return (
    <div className="pointer-events-none absolute inset-x-0 top-6 z-[70] flex justify-center">
      <div className={`animate-popin rounded-lg border-2 bg-stoneDark/95 px-6 py-3 text-center shadow-bevel ${color}`}>
        <div className="flex items-center justify-center gap-1 font-press text-hud-xs text-gold/80">
          <PixelIcon name="bolt" size={10} /> TIRADA RÁPIDA
        </div>
        <div className="mt-1 font-press text-3xl">{value}</div>
        <div className="font-vt text-lg">
          d20{crit ? ' · ¡CRÍTICO!' : fail ? ' · ¡Pifia!' : ''}
        </div>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- */
function SystemMenu({ onClose }) {
  const { reset, current, suspend } = useSystem();
  const [view, setView] = useState('root'); // 'root' | 'settings'

  const close = () => {
    sfx.menuClose();
    onClose();
  };

  const ROOT = [
    {
      label: 'Volver al Launcher',
      icon: 'castle',
      disabled: current === SCREENS.LAUNCHER,
      action: () => {
        reset(SCREENS.LAUNCHER);
        onClose();
      },
    },
    { label: 'Ajustes', icon: 'gear', action: () => setView('settings') },
    {
      label: 'Suspender',
      icon: 'moon',
      action: () => {
        sfx.suspend();
        suspend();
        onClose();
      },
    },
  ];

  return (
    <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/70">
      <div className="w-[78%] rounded-lg border-2 border-gold bg-stoneDark shadow-bevel">
        <div className="flex items-center justify-between border-b-2 border-gold/70 px-4 py-2">
          <span className="flex items-center gap-1.5 font-press text-[11px] text-goldLight">
            <PixelIcon name={view === 'root' ? 'menu' : 'gear'} size={12} />
            {view === 'root' ? 'MENÚ DE SISTEMA' : 'AJUSTES'}
          </span>
          <span className="font-press text-hud-xs text-gold/60">{view === 'root' ? '[B] Cerrar' : '[B] Volver'}</span>
        </div>
        <div className="p-3">
          {view === 'root' ? (
            <RootMenu items={ROOT} onClose={close} />
          ) : (
            <SettingsMenu onBack={() => setView('root')} />
          )}
        </div>
      </div>
    </div>
  );
}

function RootMenu({ items, onClose }) {
  const [sel, setSel] = useState(0);
  const move = (n) => {
    sfx.move();
    setSel(n);
  };

  useGamepad(
    {
      onUp: () => move(wrapIndex(sel - 1, items.length)),
      onDown: () => move(wrapIndex(sel + 1, items.length)),
      onA: () => {
        const it = items[sel];
        if (it.disabled) return sfx.error();
        sfx.select();
        it.action();
      },
      onB: onClose,
      onStart: onClose,
    },
    { layer: Layer.OVERLAY, capture: true }
  );

  return (
    <ul className="flex flex-col gap-2">
      {items.map((it, i) => {
        const activeRow = i === sel;
        return (
          <li
            key={it.label}
            className={[
              'flex items-center gap-2 rounded border-2 px-3 py-2 font-vt text-xl',
              focusRow(activeRow),
              it.disabled ? 'opacity-40' : '',
            ].join(' ')}
          >
            <Cursor visible={activeRow} className={activeRow ? 'text-[#2a1c0c]' : ''} />
            <PixelIcon name={it.icon} size={16} engrave={activeRow} />
            <span>{it.label}</span>
          </li>
        );
      })}
    </ul>
  );
}

function SettingsMenu({ onBack }) {
  const { theme, toggleTheme, accent, cycleAccent, settings, setSetting } = useSystem();
  const [sel, setSel] = useState(0);

  const items = [
    { label: 'Tema', value: theme === 'day' ? 'Día' : 'Noche', valueIcon: theme === 'day' ? 'sun' : 'moon', toggle: toggleTheme },
    { label: 'Color', value: ACCENT_LABEL[accent], swatch: true, toggle: cycleAccent },
    { label: 'Pantalla CRT', value: settings.crt ? 'ON' : 'OFF', toggle: () => setSetting('crt', !settings.crt) },
    { label: 'Sonido', value: settings.sound ? 'ON' : 'OFF', toggle: () => setSetting('sound', !settings.sound) },
    {
      label: 'Movimiento',
      value: { auto: 'Auto', reduced: 'Reducido', full: 'Completo' }[settings.motion],
      toggle: () => setSetting('motion', { auto: 'reduced', reduced: 'full', full: 'auto' }[settings.motion]),
    },
  ];

  const move = (n) => {
    sfx.move();
    setSel(n);
  };

  useGamepad(
    {
      onUp: () => move(wrapIndex(sel - 1, items.length)),
      onDown: () => move(wrapIndex(sel + 1, items.length)),
      onA: () => {
        sfx.tab();
        items[sel].toggle();
      },
      onLeft: () => items[sel].toggle(),
      onRight: () => items[sel].toggle(),
      onB: () => {
        sfx.back();
        onBack();
      },
      onStart: onBack,
    },
    { layer: Layer.OVERLAY, capture: true }
  );

  return (
    <ul className="flex flex-col gap-2">
      {items.map((it, i) => {
        const activeRow = i === sel;
        return (
          <li
            key={it.label}
            className={[
              'flex items-center justify-between rounded border-2 px-3 py-2 font-vt text-xl',
              focusRow(activeRow),
            ].join(' ')}
          >
            <span className="flex items-center gap-2">
              <Cursor visible={activeRow} className={activeRow ? 'text-[#2a1c0c]' : ''} />
              {it.label}
            </span>
            <span className="flex items-center gap-1.5 font-press text-[10px]">
              {it.valueIcon && <PixelIcon name={it.valueIcon} size={12} mono={activeRow} />}
              {it.swatch && (
                <span className="inline-block h-[15px] w-[15px] rounded-sm border border-black/45 bg-gold shadow-[inset_1px_1px_0_rgba(255,255,255,0.25)]" />
              )}
              {it.value}
            </span>
          </li>
        );
      })}
      <li className="mt-1 text-center font-press text-hud-xs text-gold/60">[A] Cambiar · [B] Volver</li>
    </ul>
  );
}

/* --------------------------------------------------------------------- */
function SuspendOverlay({ onResume }) {
  useGamepad(
    {
      onStart: onResume,
      onA: onResume,
      onB: onResume,
      onSelect: onResume,
      onY: onResume,
    },
    { layer: Layer.OVERLAY, capture: true }
  );

  return (
    <div className="absolute inset-0 z-[80] flex flex-col items-center justify-center bg-black/95 text-center">
      <PixelIcon name="moon" size={48} className="animate-softpulse" />
      <div className="mt-4 font-press text-sm text-gold/80">SUSPENDIDO</div>
      <div className="mt-3 animate-blink font-press text-hud-xs text-chromeText/70">
        ▶ PULSA START PARA DESPERTAR
      </div>
    </div>
  );
}
