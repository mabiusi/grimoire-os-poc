// Páginas del Grimorio de Reglas (lector paginado de texto plano).
// Cada página: título + líneas (párrafos cortos que caben en pantalla).

export const RULE_PAGES = [
  {
    title: 'Acciones en Combate',
    lines: [
      'En tu turno puedes MOVERTE y realizar UNA acción.',
      '',
      '• Atacar: un golpe c. a c. o a distancia.',
      '• Lanzar un conjuro (según tiempo de lanzamiento).',
      '• Esquivar: imponer desventaja a los ataques contra ti.',
      '• Destrabarse: moverte sin provocar ataques de opo.',
      '• Ayudar: dar ventaja a un aliado.',
      '• Usar un objeto del entorno.',
      '',
      'Además dispones de una acción adicional sólo si un',
      'rasgo o conjuro te la concede.',
    ],
  },
  {
    title: 'La Tirada de Ataque',
    lines: [
      'Para impactar, tira 1d20 y suma tu bonificador de',
      'ataque. Si el total iguala o supera la Clase de',
      'Armadura (CA) del objetivo, aciertas.',
      '',
      'd20 + característica + competencia  ≥  CA',
      '',
      '• 20 natural: impacto crítico (daño x2 de dados).',
      '• 1 natural: fallo automático.',
      '',
      'Con VENTAJA tiras 2d20 y usas el más alto.',
      'Con DESVENTAJA usas el más bajo.',
    ],
  },
  {
    title: 'Estados y Condiciones',
    lines: [
      '• Cegado: fallas pruebas de vista; los ataques',
      '  contra ti tienen ventaja.',
      '• Apresado: tu velocidad pasa a 0.',
      '• Asustado: desventaja mientras veas la fuente.',
      '• Envenenado: desventaja en ataques y pruebas.',
      '• Derribado: te mueves a rastras; cuerpo a cuerpo',
      '  contra ti con ventaja.',
      '• Inconsciente: sueltas lo que llevas y caes.',
      '',
      'Las condiciones se acumulan salvo que se indique',
      'lo contrario.',
    ],
  },
  {
    title: 'Descanso y Curación',
    lines: [
      'DESCANSO CORTO (1 hora):',
      '  Gasta Dados de Golpe para recuperar PV.',
      '  Tira el dado + tu modificador de CON.',
      '',
      'DESCANSO LARGO (8 horas):',
      '  Recuperas todos los PV y la mitad de tus',
      '  Dados de Golpe. Sólo uno por cada 24 horas.',
      '',
      'A 0 PV caes inconsciente y haces tiradas de',
      'salvación contra muerte: 3 éxitos te estabilizan,',
      '3 fallos y mueres.',
    ],
  },
];
