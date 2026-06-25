// Grafo de la aventura de texto "La Mazmorra Olvidada".
// Cada nodo: texto narrativo + opciones { label, to }.
// Los nodos finales llevan `ending: 'good' | 'bad'` y una opción de reinicio.

export const START = 'inicio';

export const STORY = {
  inicio: {
    title: 'La Mazmorra Olvidada',
    text:
      'Despiertas sobre piedra húmeda. La oscuridad es total y huele a moho y a hierro viejo. No recuerdas cómo llegaste hasta aquí.',
    options: [
      { label: 'Encender una antorcha', to: 'antorcha' },
      { label: 'Palpar la pared a ciegas', to: 'pared' },
      { label: 'Quedarte quieto y escuchar', to: 'escuchar' },
    ],
  },

  antorcha: {
    title: 'La Cámara Circular',
    text:
      'La llama prende y revela una cámara circular. Frente a ti, un cofre de hierro. A la izquierda, un pasaje en sombras. A tu espalda, una pesada puerta de roble.',
    options: [
      { label: 'Abrir el cofre de hierro', to: 'cofre' },
      { label: 'Entrar al pasaje en sombras', to: 'pasaje' },
      { label: 'Empujar la puerta de roble', to: 'puerta' },
    ],
  },

  pared: {
    title: 'El Muro Húmedo',
    text:
      'Tus dedos recorren piedra rezumante hasta toparse con una palanca oxidada, incrustada profundamente en la roca.',
    options: [
      { label: 'Tirar de la palanca', to: 'palanca' },
      { label: 'Seguir tanteando en la negrura', to: 'escuchar' },
    ],
  },

  escuchar: {
    title: 'La Respiración',
    text:
      'Conteniendo el aliento, oyes un goteo... y debajo, una respiración lenta y húmeda que no es la tuya. Algo se mueve en la oscuridad.',
    options: [
      { label: 'Encender una antorcha de golpe', to: 'bestia' },
      { label: 'Arrastrarte lejos del sonido', to: 'pared' },
    ],
  },

  cofre: {
    title: 'El Cofre de Hierro',
    text:
      'El cofre cede con un quejido. Dentro hallas una llave de bronce y un frasco de líquido fosforescente. Guardas ambos.',
    options: [
      { label: 'Abrir la puerta con la llave', to: 'pasillo' },
      { label: 'Beber el líquido fosforescente', to: 'pocion' },
    ],
  },

  pocion: {
    title: 'Visión en la Negrura',
    text:
      'El brebaje sabe a tormenta y tus ojos perforan la oscuridad. Ves cada grieta... y dos pupilas que te devuelven la mirada desde el pasaje.',
    options: [
      { label: 'Ir directo a la puerta de roble', to: 'pasillo' },
      { label: 'Acercarte a investigar las pupilas', to: 'bestia' },
    ],
  },

  bestia: {
    title: 'El Morador',
    text:
      'La luz ilumina unos colmillos húmedos y dos ojos sin fondo. Una criatura reptante se interpone entre tú y toda salida.',
    options: [
      { label: 'Blandir la antorcha y luchar', to: 'luchar' },
      { label: 'Lanzar la antorcha y correr', to: 'huir' },
    ],
  },

  luchar: {
    title: 'Fuego y Colmillos',
    text:
      'Golpeas con la antorcha encendida. La bestia chilla, retrocede ante el fuego y huye por una grieta. El camino queda libre: una puerta de roble se entreabre ante ti.',
    options: [{ label: 'Cruzar la puerta', to: 'salida' }],
  },

  huir: {
    title: 'La Carrera',
    text:
      'Corres a ciegas. Tus manos encuentran madera —una puerta— justo cuando algo frío y fuerte se cierra sobre tu tobillo...',
    options: [{ label: '...', to: 'devorado' }],
  },

  palanca: {
    title: 'El Mecanismo',
    text:
      'Un chirrido de piedra resuena. Una sección del muro se desliza y deja al descubierto un estrecho pasaje que asciende. Una corriente de aire fresco te roza el rostro.',
    options: [
      { label: 'Subir por el pasaje', to: 'salida' },
      { label: 'Volver a explorar la cámara', to: 'antorcha' },
    ],
  },

  pasaje: {
    title: 'El Pasaje Estrecho',
    text:
      'El pasaje se estrecha hasta que apenas puedes avanzar. Al fondo, una reja oxidada... y tras ella, lo que parece luz de luna.',
    options: [
      { label: 'Forzar la reja', to: 'salida' },
      { label: 'Retroceder a la cámara', to: 'antorcha' },
    ],
  },

  puerta: {
    title: 'La Puerta de Roble',
    text:
      'La puerta está atrancada desde el otro lado. No cede por más que empujas. Crujidos sospechosos resuenan en el techo cada vez que la golpeas.',
    options: [
      { label: 'Buscar otra salida', to: 'antorcha' },
      { label: 'Golpearla con todas tus fuerzas', to: 'aplastado' },
    ],
  },

  pasillo: {
    title: 'La Llave Gira',
    text:
      'La llave de bronce gira con un chasquido. Tras la puerta, un largo pasillo termina en una escalera de caracol bañada por una luz pálida.',
    options: [{ label: 'Subir hacia la luz', to: 'salida' }],
  },

  // --- Finales -----------------------------------------------------------
  salida: {
    title: '★ LIBERTAD ★',
    ending: 'good',
    text:
      'Emerges a la superficie. El aire frío del bosque llena tus pulmones y el cielo se tiñe de naranja. Has escapado de la mazmorra... por ahora.',
    options: [{ label: 'Vivir otra aventura', to: 'inicio', restart: true }],
  },

  devorado: {
    title: '☠ DEVORADO ☠',
    ending: 'bad',
    text:
      'Lo último que sientes es un aliento caliente y un dolor agudo. La mazmorra reclama otra alma para su colección.',
    options: [{ label: 'Volver a empezar', to: 'inicio', restart: true }],
  },

  aplastado: {
    title: '☠ SEPULTADO ☠',
    ending: 'bad',
    text:
      'Un crujido sobre tu cabeza es el único aviso. El techo, podrido por los siglos, se desploma sobre ti. Después, sólo silencio.',
    options: [{ label: 'Volver a empezar', to: 'inicio', restart: true }],
  },
};
