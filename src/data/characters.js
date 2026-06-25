// Personajes de MUESTRA del visor (roster inicial). La lógica de creación de
// personajes D&D 5e vive en `dnd5e.js`.

export const SYSTEMS = [
  {
    id: 'dnd5e',
    name: 'D&D 5e',
    genre: 'Fantasía Clásica',
    subtitle: 'Dungeons & Dragons',
    icon: '🐉',
    accent: 'blood',
    character: {
      name: 'Thorin Piedrahierro',
      tagline: 'Guerrero Enano · Nivel 5',
      meta: [
        ['Raza', 'Enano de las Colinas'],
        ['Clase', 'Guerrero'],
        ['Trasfondo', 'Soldado'],
        ['Alineamiento', 'Legal Bueno'],
        ['Experiencia', '6.500 PX'],
      ],
      vitals: [
        ['Puntos de Vida', '44 / 44', 'blood'],
        ['Clase de Armadura', '18', 'sky'],
        ['Iniciativa', '+1', 'parchment'],
        ['Velocidad', '7,5 m', 'parchment'],
        ['Bono Comp.', '+3', 'gold'],
      ],
      stats: [
        ['FUE', 17, '+3'],
        ['DES', 12, '+1'],
        ['CON', 16, '+3'],
        ['INT', 10, '+0'],
        ['SAB', 13, '+1'],
        ['CAR', 8, '-1'],
      ],
      skills: [
        ['Atletismo', '+6'],
        ['Percepción', '+4'],
        ['Intimidación', '+1'],
        ['Supervivencia', '+4'],
        ['Perspicacia', '+4'],
      ],
      inventory: [
        ['Hacha a dos manos', '2d6 cortante'],
        ['Armadura de placas', 'CA 18'],
        ['Escudo de roble tachonado', '+2 CA'],
        ['Pócima de curación', 'x2 · 2d4+2'],
        ['Antorcha', 'x5 · Yesca'],
        ['Bolsa de monedas', '42 po'],
      ],
      spells: [], // Guerrero marcial: no lanza conjuros
      spellsNote: 'Los guerreros marciales no lanzan conjuros. En su lugar, dominan maniobras de combate y golpes precisos.',
    },
  },
  {
    id: 'coc',
    name: 'La Llamada de Cthulhu',
    genre: 'Horror Cósmico',
    subtitle: 'Call of Cthulhu 7ª ed.',
    icon: '🐙',
    accent: 'arcane',
    character: {
      name: 'Dra. Eleanor Vance',
      tagline: 'Anticuaria · Arkham, 1923',
      meta: [
        ['Ocupación', 'Anticuaria'],
        ['Edad', '38'],
        ['Residencia', 'Arkham, MA'],
        ['Lugar de origen', 'Boston'],
        ['Era', 'Años 20'],
      ],
      vitals: [
        ['Puntos de Vida', '11 / 13', 'blood'],
        ['Cordura', '45 / 70', 'arcane'],
        ['Puntos de Magia', '14', 'sky'],
        ['Suerte', '55', 'moss'],
        ['Movimiento', '7', 'parchment'],
      ],
      stats: [
        ['FUE', 50, '25'],
        ['CON', 65, '32'],
        ['TAM', 55, '27'],
        ['DES', 60, '30'],
        ['APA', 70, '35'],
        ['INT', 80, '40'],
        ['POD', 70, '35'],
        ['EDU', 85, '42'],
      ],
      skills: [
        ['Historia', '70%'],
        ['Ocultismo', '45%'],
        ['Biblioteconomía', '65%'],
        ['Idioma: Latín', '50%'],
        ['Avistar', '55%'],
        ['Psicología', '40%'],
      ],
      inventory: [
        ['Revólver .38', '1d10 · 6 balas'],
        ['Linterna de queroseno', '3 h de luz'],
        ['Cuaderno de campo', 'Notas y bocetos'],
        ['Amuleto de jade verde', '+5 Cordura (1 uso)'],
        ['Recorte de periódico', '"Desapariciones en Innsmouth"'],
        ['Cartera', '15 dólares'],
      ],
      spells: [
        ['Contactar (Profundo)', '1d3 COR · 8 PM', 'Atrae a un morador de las profundidades cercano.'],
        ['Señal de los Ancianos', '1 PM', 'Símbolo protector que repele a ciertos horrores.'],
        ['Marchitar miembro', '1d6 COR · variable', 'Atrofia un miembro de la víctima a distancia.'],
      ],
      spellsNote: 'Conjuros aprendidos de tomos prohibidos. Lanzarlos cuesta Puntos de Magia y, a menudo, Cordura.',
    },
  },
];

export function systemById(id) {
  return SYSTEMS.find((s) => s.id === id);
}

// Entradas iniciales del roster: los personajes de muestra de cada sistema.
export const SAMPLE_ENTRIES = SYSTEMS.map((s) => ({
  id: `sample-${s.id}`,
  systemId: s.id,
  name: s.name,
  icon: s.icon,
  accent: s.accent,
  character: s.character,
}));
