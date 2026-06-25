import { useState } from 'react';
import VirtualKeyboard from '../components/VirtualKeyboard.jsx';
import ListSelect from '../components/ListSelect.jsx';
import ChecklistSelect from '../components/ChecklistSelect.jsx';
import StatAssignStep from '../components/StatAssignStep.jsx';
import { sfx } from '../lib/sfx.js';
import { RACES, CLASSES, BACKGROUNDS, LANGUAGES, EQUIPMENT, createDnd5eEntry } from '../data/dnd5e.js';

/**
 * Asistente de creación D&D 5e — 7 pasos, 100% gamepad.
 *   1 Nombre (teclado)  2 Especie  3 Clase  4 Trasfondo
 *   5 Stats (0–20 / 4d6)  6 Idiomas  7 Equipo → Guardar
 *
 * Cada paso es UN componente montado solo (su useGamepad es el único activo),
 * así el foco nunca se rompe al cambiar de pantalla. B retrocede de paso (o
 * cancela en el primero); cada onConfirm avanza y acumula las elecciones.
 */
const STEPS = ['name', 'race', 'class', 'background', 'stats', 'languages', 'equipment'];

export default function CharacterCreator({ onCancel, onComplete }) {
  const [step, setStep] = useState(0);
  const [choices, setChoices] = useState({
    name: '',
    raceId: null,
    classId: null,
    backgroundId: null,
    stats: null,
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
  const finish = (patch) => onComplete(createDnd5eEntry({ ...choices, ...patch }));

  const tag = (i) => `(${i}/7)`;

  switch (STEPS[step]) {
    case 'name':
      return (
        <VirtualKeyboard
          title={`CREAR · NOMBRE ${tag(1)}`}
          initialValue={choices.name}
          onSubmit={(name) => advance({ name })}
          onBack={back}
        />
      );
    case 'race':
      return (
        <ListSelect
          key="race"
          title={`CREAR · ESPECIE ${tag(2)}`}
          icon="🧝"
          prompt="ELIGE TU ESPECIE"
          items={RACES}
          initialId={choices.raceId}
          onConfirm={(raceId) => advance({ raceId })}
          onBack={back}
        />
      );
    case 'class':
      return (
        <ListSelect
          key="class"
          title={`CREAR · CLASE ${tag(3)}`}
          icon="⚔️"
          prompt="ELIGE TU CLASE"
          items={CLASSES.map((c) => ({
            id: c.id,
            name: c.name,
            desc: `d${c.hitDie} · ${c.primary}${c.caster ? ' · lanzador' : ''}. ${c.desc}`,
          }))}
          initialId={choices.classId}
          onConfirm={(classId) => advance({ classId })}
          onBack={back}
        />
      );
    case 'background':
      return (
        <ListSelect
          key="background"
          title={`CREAR · TRASFONDO ${tag(4)}`}
          icon="📜"
          prompt="ELIGE TU TRASFONDO"
          items={BACKGROUNDS}
          initialId={choices.backgroundId}
          onConfirm={(backgroundId) => advance({ backgroundId })}
          onBack={back}
        />
      );
    case 'stats':
      return (
        <StatAssignStep
          title={`CREAR · STATS ${tag(5)}`}
          initial={choices.stats}
          onConfirm={(stats) => advance({ stats })}
          onBack={back}
        />
      );
    case 'languages':
      return (
        <ChecklistSelect
          key="languages"
          title={`CREAR · IDIOMAS ${tag(6)}`}
          icon="💬"
          prompt="IDIOMAS CONOCIDOS"
          items={LANGUAGES}
          initial={choices.languages.length ? choices.languages : ['comun']}
          onConfirm={(languages) => advance({ languages })}
          onBack={back}
        />
      );
    case 'equipment':
      return (
        <ChecklistSelect
          key="equipment"
          title={`CREAR · EQUIPO ${tag(7)}`}
          icon="🎒"
          prompt="EQUIPAMIENTO INICIAL"
          items={EQUIPMENT}
          initial={choices.equipment}
          onConfirm={(equipment) => finish({ equipment })}
          onBack={back}
        />
      );
    default:
      return null;
  }
}
