import { useState } from 'react';
import Frame from '../components/Frame.jsx';
import Cursor from '../components/Cursor.jsx';
import PixelIcon from '../components/PixelIcon.jsx';
import { useSystem } from '../context/SystemContext.jsx';
import { useGamepad } from '../hooks/useGamepad.js';
import { sfx } from '../lib/sfx.js';
import { START, STORY } from '../data/story.js';
import { wrapIndex } from '../lib/utils.js';

export default function TextAdventure() {
  const { goBack } = useSystem();
  const [nodeKey, setNodeKey] = useState(START);
  const [selected, setSelected] = useState(0);

  const node = STORY[nodeKey];
  const options = node.options || [];
  const ending = node.ending; // 'good' | 'bad' | undefined

  const choose = () => {
    const opt = options[selected];
    if (!opt) return;
    sfx.select();
    setNodeKey(opt.to);
    setSelected(0);
  };

  useGamepad({
    onUp: () => {
      sfx.move();
      setSelected((s) => wrapIndex(s - 1, options.length));
    },
    onDown: () => {
      sfx.move();
      setSelected((s) => wrapIndex(s + 1, options.length));
    },
    onA: choose,
    onB: () => {
      sfx.back();
      goBack();
    },
  });

  const titleColor =
    ending === 'good' ? 'text-moss' : ending === 'bad' ? 'text-blood' : 'text-sky';

  return (
    <Frame
      title="AVENTURA DE TEXTO"
      icon="sword"
      hints={[
        ['↑↓', 'Elegir'],
        ['A', 'Confirmar'],
        ['B', 'Salir'],
      ]}
    >
      {/* Pantalla estilo terminal ámbar/fósforo */}
      <div className="flex h-full flex-col bg-abyss p-4 font-vt">
        {/* Título del nodo */}
        <div className={`mb-2 font-press text-[11px] ${titleColor} text-pixel-shadow`}>
          {ending ? node.title : `» ${node.title}`}
        </div>

        {/* Narrativa — scrolleable, con fade inferior (sin recorte mudo) */}
        <div className="relative flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto text-[22px] leading-snug text-advText [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <span className="text-moss">&gt; </span>
            {node.text}
            {!ending && <span className="animate-blink text-advText">▋</span>}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6" style={{ background: 'linear-gradient(to top, rgb(var(--gr-abyss)), rgb(var(--gr-abyss) / 0))' }} />
        </div>

        {/* Banner de final */}
        {ending && (
          <div
            className={[
              'mb-2 rounded border-2 px-3 py-1 text-center font-press text-[10px]',
              ending === 'good'
                ? 'border-moss text-moss'
                : 'border-blood text-blood',
            ].join(' ')}
          >
            <span className="flex items-center justify-center gap-2">
              <PixelIcon name={ending === 'good' ? 'spark' : 'skull'} size={14} />
              {ending === 'good' ? 'HAS SOBREVIVIDO' : 'FIN DEL CAMINO'}
              <PixelIcon name={ending === 'good' ? 'spark' : 'skull'} size={14} />
            </span>
          </div>
        )}

        {/* Opciones seleccionables */}
        <div className="space-y-1.5">
          {options.map((opt, i) => {
            const active = i === selected;
            return (
              <div
                key={opt.to + opt.label}
                className={[
                  'flex items-center gap-2 rounded border-2 px-2 py-1.5 text-[19px] transition-colors',
                  active
                    ? 'border-goldLight bg-gold text-[#2a1c0c]'
                    : 'border-transparent text-chromeText/80',
                ].join(' ')}
              >
                <Cursor visible={active} className={active ? 'text-[#2a1c0c]' : ''} />
                <span className={`font-press text-[9px] ${active ? 'text-[#2a1c0c]' : 'text-gold/70'}`}>
                  {i + 1}.
                </span>
                <span className="leading-tight">{opt.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Frame>
  );
}
