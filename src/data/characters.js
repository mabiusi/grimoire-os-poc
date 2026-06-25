// Personajes de prueba para el visor + datos para el flujo de creación.
// Cada sistema ("adapter") define los bloques de Stats, Inventario y Hechizos.

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

/* ---------------------------------------------------------------------
 * Configuración del flujo de CREACIÓN (Point Buy + nombres por sistema)
 * --------------------------------------------------------------------- */
// Modelo Point Buy unificado: cada "paso" (+step al valor) cuesta 1 punto del
// pool; restar devuelve el punto. `pool` = cantidad de pasos disponibles.
export const CREATION = {
  dnd5e: {
    statKeys: ['FUE', 'DES', 'CON', 'INT', 'SAB', 'CAR'],
    statNames: {
      FUE: 'Fuerza',
      DES: 'Destreza',
      CON: 'Constitución',
      INT: 'Inteligencia',
      SAB: 'Sabiduría',
      CAR: 'Carisma',
    },
    base: 8,
    max: 15,
    step: 1,
    pool: 27,
    names: ['THORN', 'BRYNN', 'KAEL', 'MIRA', 'DRAKE', 'GROM', 'ELDA', 'FARA', 'RUNE', 'VESK'],
  },
  coc: {
    statKeys: ['FUE', 'CON', 'TAM', 'DES', 'APA', 'INT', 'POD', 'EDU'],
    statNames: {
      FUE: 'Fuerza',
      CON: 'Constitución',
      TAM: 'Tamaño',
      DES: 'Destreza',
      APA: 'Apariencia',
      INT: 'Inteligencia',
      POD: 'Poder',
      EDU: 'Educación',
    },
    base: 40,
    max: 80,
    step: 5,
    pool: 20, // 20 pasos de +5 = +100 a repartir
    names: ['ABNER', 'SILAS', 'MABEL', 'EZRA', 'CORA', 'RUTH', 'OTIS', 'IRMA', 'MYRA', 'VERA'],
  },
};

// Nombre aleatorio (en mayúsculas, ≤5 letras) según el sistema.
export function randomName(systemId) {
  const pool = CREATION[systemId]?.names || ['HERO'];
  return pool[Math.floor(Math.random() * pool.length)];
}

const fmtMod = (m) => (m >= 0 ? `+${m}` : `${m}`);

// Construye la ficha (forma que entiende el visor) a partir de las stats.
function buildDnd(name, sv) {
  const mod = (v) => Math.floor((v - 10) / 2);
  const hp = Math.max(1, 8 + mod(sv.CON));
  const ac = 11 + mod(sv.DES); // armadura de cuero
  return {
    name,
    tagline: 'Aventurero · Nivel 1',
    meta: [
      ['Sistema', 'D&D 5e'],
      ['Clase', 'Aventurero'],
      ['Nivel', '1'],
      ['Trasfondo', 'Forastero'],
      ['Origen', 'Recién creado'],
    ],
    vitals: [
      ['Puntos de Vida', `${hp} / ${hp}`, 'blood'],
      ['Clase de Armadura', String(ac), 'sky'],
      ['Iniciativa', fmtMod(mod(sv.DES)), 'parchment'],
      ['Velocidad', '9 m', 'parchment'],
      ['Bono Comp.', '+2', 'gold'],
    ],
    stats: CREATION.dnd5e.statKeys.map((k) => [k, sv[k], fmtMod(mod(sv[k]))]),
    skills: [
      ['Atletismo', fmtMod(2 + mod(sv.FUE))],
      ['Percepción', fmtMod(2 + mod(sv.SAB))],
      ['Sigilo', fmtMod(mod(sv.DES))],
    ],
    inventory: [
      ['Espada corta', '1d6 perforante'],
      ['Armadura de cuero', 'CA 11'],
      ['Mochila de aventurero', 'Cuerda · Raciones x3'],
      ['Antorcha', 'x2'],
      ['Monedas', '10 po'],
    ],
    spells: [],
    spellsNote: 'Personaje recién creado. Elige clase y dotes para desbloquear conjuros.',
  };
}

function buildCoc(name, sv) {
  const half = (v) => String(Math.floor(v / 2));
  const hp = Math.floor((sv.CON + sv.TAM) / 10);
  const mp = Math.floor(sv.POD / 5);
  const san = sv.POD;
  return {
    name,
    tagline: 'Investigador · Recién llegado',
    meta: [
      ['Sistema', 'La Llamada de Cthulhu'],
      ['Ocupación', 'Investigador'],
      ['Era', 'Años 20'],
      ['Residencia', 'Arkham, MA'],
    ],
    vitals: [
      ['Puntos de Vida', `${hp} / ${hp}`, 'blood'],
      ['Cordura', `${san} / ${san}`, 'arcane'],
      ['Puntos de Magia', String(mp), 'sky'],
      ['Suerte', '50', 'moss'],
      ['Movimiento', '8', 'parchment'],
    ],
    stats: CREATION.coc.statKeys.map((k) => [k, sv[k], half(sv[k])]),
    skills: [
      ['Avistar', '25%'],
      ['Escuchar', '20%'],
      ['Buscar libros', '20%'],
      ['Esquivar', `${half(sv.DES)}%`],
    ],
    inventory: [
      ['Cuaderno de notas', 'Pistas y bocetos'],
      ['Linterna', 'Pilas x2'],
      ['Navaja', '1d4'],
      ['Dinero', '20 dólares'],
    ],
    spells: [],
    spellsNote: 'Aún no conoce conjuros prohibidos. (Por suerte para su cordura.)',
  };
}

// Crea una ENTRADA de roster (misma forma que SAMPLE_ENTRIES) lista para el visor.
export function createCharacterEntry({ systemId, name, statValues }) {
  const sys = systemById(systemId);
  const character = systemId === 'coc' ? buildCoc(name, statValues) : buildDnd(name, statValues);
  return {
    id: `custom-${Date.now()}`,
    systemId,
    name: sys.name,
    icon: sys.icon,
    accent: sys.accent,
    character,
  };
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
