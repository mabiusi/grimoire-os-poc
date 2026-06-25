import { useState } from 'react';
import Frame from '../components/Frame.jsx';
import { useSystem } from '../context/SystemContext.jsx';
import { useGamepad } from '../hooks/useGamepad.js';
import { sfx } from '../lib/sfx.js';
import { RULE_PAGES } from '../data/rules.js';

export default function RuleGrimoire() {
  const { goBack } = useSystem();
  const [page, setPage] = useState(0);
  const total = RULE_PAGES.length;
  const current = RULE_PAGES[page];

  const next = () => {
    if (page < total - 1) {
      sfx.page();
      setPage(page + 1);
    } else {
      sfx.error();
    }
  };

  const prev = () => {
    if (page > 0) {
      sfx.page();
      setPage(page - 1);
    } else {
      sfx.error();
    }
  };

  useGamepad({
    onA: next,
    onRight: next,
    onLeft: prev,
    onB: () => {
      sfx.back();
      goBack();
    },
  });

  const isLast = page === total - 1;

  return (
    <Frame
      title="GRIMORIO DE REGLAS"
      icon="📖"
      hints={[
        ['←', 'Anterior'],
        ['A/→', 'Siguiente'],
        ['B', 'Salir'],
      ]}
    >
      <div className="h-full p-2">
        {/* Página de pergamino */}
        <div className="flex h-full flex-col rounded border-2 border-gold bg-parchment text-ink shadow-[inset_0_0_30px_rgba(120,80,20,0.25)]">
          {/* Encabezado de la página */}
          <div className="flex items-center justify-between border-b-2 border-gold px-4 py-2">
            <h2 className="font-press text-[12px] text-blood">{current.title}</h2>
            <span className="font-press text-[9px] text-bronze">
              Pág. {page + 1}/{total}
            </span>
          </div>

          {/* Cuerpo del texto */}
          <div className="flex-1 overflow-hidden px-5 py-3 font-vt text-[21px] leading-snug">
            {current.lines.map((line, i) => (
              <p key={i} className={line === '' ? 'h-3' : 'text-ink'}>
                {line}
              </p>
            ))}
          </div>

          {/* Pie con indicadores de paginación */}
          <div className="flex items-center justify-between border-t-2 border-gold px-4 py-2 font-press text-[9px] text-bronze">
            <span className={page > 0 ? 'text-blood' : 'opacity-30'}>◀ ANT.</span>
            <div className="flex gap-1">
              {RULE_PAGES.map((_, i) => (
                <span key={i} className={i === page ? 'text-blood' : 'text-bronze/40'}>
                  ●
                </span>
              ))}
            </div>
            <span className={!isLast ? 'animate-softpulse text-blood' : 'opacity-30'}>
              {isLast ? 'FIN ▶' : 'SIG. ▶'}
            </span>
          </div>
        </div>
      </div>
    </Frame>
  );
}
