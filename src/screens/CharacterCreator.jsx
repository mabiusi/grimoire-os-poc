import { useState } from 'react';
import Frame from '../components/Frame.jsx';
import VirtualKeyboard from '../components/VirtualKeyboard.jsx';
import ListSelect from '../components/ListSelect.jsx';
import ChecklistSelect from '../components/ChecklistSelect.jsx';
import StatAssignStep from '../components/StatAssignStep.jsx';
import { useGamepad } from '../hooks/useGamepad.js';
import { sfx } from '../lib/sfx.js';
import { clamp } from '../lib/utils.js';
import { useGrimoireStore } from '../store/useGrimoireStore.js';
import { buildCharacterFromChoices } from '../store/derive.js';

/**
 * Asistente de creación D&D 5e — 8 pasos, 100% gamepad. Las opciones provienen
 * del STORE (db). Al finalizar construye el MODELO DE DATOS de nivel 1 y avisa
 * al padre con (char, nivelInicial): si el nivel > 1, el padre lanza el
 * LevelUpWizard para subir desde 1 hasta el nivel elegido.
 */
const STEPS = ['name', 'race', 'class', 'background', 'stats', 'level', 'languages', 'equipment'];

export default function CharacterCreator({ onCancel, onComplete }) {
  const db = useGrimoireStore((s) => s.db);
  const [step, setStep] = useState(0);
  const [choices, setChoices] = useState({
    name: '',
    raceId: null,
    classId: null,
    backgroundId: null,
    stats: null,
    level: 1,
    languages: [],
    equipment: [],
  });

  const back = () => {
    sfx.back();
    if (step === 0) onCancel();
    else setStep((s) => s - 1);
  };
  const advance = (patch) => {
    setChoices((c) => ({ ...c, ...patch }));
    setStep((s) => s + 1);
  };
  const finish = (patch) => {
    const final = { ...choices, ...patch };
    const char = buildCharacterFromChoices(
      {
        name: final.name,
        raceId: final.raceId,
        classId: final.classId,
        backgroundId: final.backgroundId,
        abilities: final.stats,
        languages: final.languages,
        equipment: final.equipment,
      },
      db
    );
    onComplete(char, final.level || 1);
  };

  const tag = (i) => `(${i}/8)`;

  switch (STEPS[step]) {
    case 'name':
      return <VirtualKeyboard key="name" title={`CREAR · NOMBRE ${tag(1)}`} initialValue={choices.name} onSubmit={(name) => advance({ name })} onBack={back} />;
    case 'race':
      return <ListSelect key="race" title={`CREAR · ESPECIE ${tag(2)}`} icon="race" prompt="ELIGE TU ESPECIE" items={db.races.map((r) => ({ id: r.id, name: r.name, desc: r.description }))} initialId={choices.raceId} onConfirm={(raceId) => advance({ raceId })} onBack={back} />;
    case 'class':
      return <ListSelect key="class" title={`CREAR · CLASE ${tag(3)}`} icon="classsw" prompt="ELIGE TU CLASE" items={db.classes.map((c) => ({ id: c.id, name: c.name, desc: `d${c.hitDie} · ${c.spellcasting ? `lanzador (${c.spellcasting.ability})` : 'marcial'}. ${c.description}` }))} initialId={choices.classId} onConfirm={(classId) => advance({ classId })} onBack={back} />;
    case 'background':
      return <ListSelect key="background" title={`CREAR · TRASFONDO ${tag(4)}`} icon="scroll" prompt="ELIGE TU TRASFONDO" items={db.backgrounds.map((b) => ({ id: b.id, name: b.name, desc: b.description }))} initialId={choices.backgroundId} onConfirm={(backgroundId) => advance({ backgroundId })} onBack={back} />;
    case 'stats':
      return <StatAssignStep key="stats" title={`CREAR · STATS ${tag(5)}`} initial={choices.stats} onConfirm={(stats) => advance({ stats })} onBack={back} />;
    case 'level':
      return <LevelStep key="level" title={`CREAR · NIVEL ${tag(6)}`} initial={choices.level} onConfirm={(level) => advance({ level })} onBack={back} />;
    case 'languages':
      return <ChecklistSelect key="languages" title={`CREAR · IDIOMAS ${tag(7)}`} icon="speech" prompt="IDIOMAS CONOCIDOS" items={db.languages.map((l) => ({ id: l.id, name: l.name }))} initial={choices.languages.length ? choices.languages : ['comun']} onConfirm={(languages) => advance({ languages })} onBack={back} />;
    case 'equipment':
      return <ChecklistSelect key="equipment" title={`CREAR · EQUIPO ${tag(8)}`} icon="pack" prompt="EQUIPAMIENTO INICIAL" items={db.equipment.map((e) => ({ id: e.id, name: e.name, note: e.note }))} initial={choices.equipment} onConfirm={(equipment) => finish({ equipment })} onBack={back} />;
    default:
      return null;
  }
}

/* ----- Paso: Nivel inicial (1-20) ------------------------------------ */
function LevelStep({ title, initial, onConfirm, onBack }) {
  const [level, setLevel] = useState(initial || 1);
  const move = (n) => { sfx.move(); setLevel(clamp(n, 1, 20)); };

  useGamepad({
    onLeft: () => move(level - 1),
    onRight: () => move(level + 1),
    onDown: () => move(level - 1),
    onUp: () => move(level + 1),
    onA: () => { sfx.open(); onConfirm(level); },
    onB: onBack,
  });

  return (
    <Frame title={title} icon="level" hints={[['←→', 'Nivel'], ['A', 'Confirmar'], ['B', 'Atrás']]}>
      <div className="flex h-full flex-col items-center justify-center p-4">
        <p className="mb-5 font-press text-[9px] text-gold/80">NIVEL INICIAL</p>
        <div className="flex items-center gap-6">
          <span className={`font-press text-2xl ${level > 1 ? 'text-gold' : 'text-parchment/30'}`}>◀</span>
          <span className="font-press text-6xl text-goldLight text-pixel-shadow">{level}</span>
          <span className={`font-press text-2xl ${level < 20 ? 'text-gold' : 'text-parchment/30'}`}>▶</span>
        </div>
        <p className="mt-7 max-w-[80%] text-center font-vt text-lg text-parchment/70">
          {level > 1
            ? 'Se abrirá el asistente de subida para repartir PV, subclase y mejoras (ASI).'
            : 'Empezarás como aventurero de nivel 1.'}
        </p>
      </div>
    </Frame>
  );
}
