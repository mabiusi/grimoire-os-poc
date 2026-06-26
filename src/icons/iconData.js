// Grimoire OS — bitmaps de iconografía original (12×12 pixel-art).
// Cada ícono es un array de filas; cada char = un píxel:
//   '.' transparente · 'o' bronce · 'g' oro · 'G' oro claro · 'd' oscuro
//   (acentos opcionales: 'b' blood · 'm' moss · 'a' arcane · 's' sky · 'p' parchment)
// Render: <PixelIcon name="dice" size={16} />  (ver PixelIcon.jsx)

export const ICON_COLORS = {
  o: '#8a6d3b', g: '#d8a93a', G: '#f3d27a', d: '#1c1812',
  b: '#9b2c2c', m: '#5a7d3a', a: '#7b6cc4', s: '#5aa9c4', p: '#e9d8b4', w: '#e9d8b4',
  // variantes claras de acento (para condiciones sobre fondo oscuro)
  B: '#cf5b5b', M: '#7faa4a', A: '#9a8cd8', S: '#82c4da',
};

export const iconBitmaps = {
  // --- Apps / barra de título ---
  scroll: ["............",".gggg..gggg.",".gooG..gooG.",".gGGGGGGGGGo",".oGGGGGGGGGo",".ogooooooGGo",".oGGGGGGGGGo",".ogoooooGGGo",".oGGGGGGGGGo",".gGGGGGGGGGo",".gooG..gooG.",".gggg..gggg."],
  dice:   ["............","...gggggg...","..gGGGGGGg..",".gGGdGGdGGg.",".gGGGGGGGGg.",".gGGGGdGGGg.",".gGGdGGGGGg.",".gGGGGGGGGg.",".gGGGdGGdGg.","..gGGGGGGg..","...gggggg...","............"],
  book:   ["............","..oo....oo..",".oGGo..oGGo.","oGGGGooGGGGo","oGgGGooGGgGo","oGGGGooGGGGo","oGgGGooGGgGo","oGGGGooGGGGo","oGgGGooGGgGo","oGGGGooGGGGo",".oooo..oooo.","............"],
  sword:  ["..........G.",".........GGo","........GGG.",".......GGG..","......GGG...",".....GGG....","..o.GGG.....",".ogGGo......","..ogGo......","...ogo......","..o.go......",".....o......"],
  castle: ["g.g.g.g.g.g.","gggggggggggg","g.gggggggg.g","g.gggggggg.g","gggggggggggg","gGGGgggGGGgg","gGGGgggGGGgg","ggggGGggggg.","ggggGGgggggg","ggggGGgggggg","gggggggggggg","oooooooooooo"],
  plus:   ["............","....gggg....","....gGGg....","....gGGg....","gggggGGggggg","gGGGGGGGGGGg","gGGGGGGGGGGg","gggggGGggggg","....gGGg....","....gGGg....","....gggg....","............"],

  // --- Personajes ---
  dragon: ["..o.......o.",".ogo.....ogo","oGGGoo.ooGGo","oGdGGoooGdGo","oGGGGGGGGGGo",".oGGGGGGGGo.","..oGGGGGGo..","..oGooooGo..",".oGo.oo.oGo.","oGo..oo..oGo","o....oo....o","............"],
  octopus:["...gggggg...","..gGGGGGGg..",".gGGGGGGGGg.",".gGdGGGGdGg.",".gGGGGGGGGg.",".gGGGGGGGGg.","..gGGGGGGg..",".g.g.gg.g.g.","g.g.g..g.g.g","g.g.g..g.g.g",".g...g..g.g.","............"],
  page:   [".ooooooo.o..",".oGGGGGoGo..",".oGGGGGoooo.",".oGoooGGGGo.",".oGGGGGGGGo.",".oGoooooGGo.",".oGGGGGGGGo.",".oGoooooGGo.",".oGGGGGGGGo.",".oGooooGGGo.",".oGGGGGGGGo.",".oooooooooo."],
  heart:  ["............",".gg.gg..gg..","gGGgGGggGGg.","gGGGGGGGGGGg","gGGGGGGGGGGg","oGGGGGGGGGGg",".oGGGGGGGGo.","..oGGGGGGo..","...oGGGGo...","....oGGo....",".....oo.....","............"],
  boostup:["............",".....GG.....","....GGGG....","...GGGGGG...","..GGG..GGG..",".GGG....GGG.","............",".....GG.....","....GGGG....","...GGGGGG...","..GGG..GGG..",".GGG....GGG."],
  medal:  [".o......o...",".go....og...",".gGo..oGg...","..gGooGg....","...gGGg.....","..gGGGGg....",".gGGddGGg...",".gGGddGGg...",".gGGGGGGg...","..gGGGGg....","...gggg.....","............"],

  // --- Creación ---
  keyb:   ["............","oooooooooooo","oGgGgGgGgGGo","oGGGGGGGGGGo","ogGgGgGgGggo","oGGGGGGGGGGo","ogGgGgGgGggo","oGGGGGGGGGGo","oggGGGGGGggo","oooooooooooo","............","............"],
  level:  ["..........G.",".......G..G.",".......G..G.","....G..G..G.","....G..G..G.","....G..G..G.",".G..G..G..G.",".G..G..G..G.",".G..G..G..G.",".G..G..G..G.","oooooooooooo","............"],
  speech: [".gggggggggg.","gGGGGGGGGGGg","gGoGoGoGoGGg","gGGGGGGGGGGg","gGoGoGoGGGGg","gGGGGGGGGGGg","gGGGGGGGGGGg",".gggggggggg.","...gg.g.....","..gg........",".g..........","............"],
  pack:   ["....gggg....","...gGGGGg...","..gGo..oGg..",".gGGGGGGGGg.","gGGGGGGGGGGg","gGGoooooGGGg","gGGGGGGGGGGg","gGGo....oGGg","gGGo.GG.oGGg","gGGo....oGGg","gGGGGGGGGGGg",".oo......oo."],

  // --- Enciclopedia / categorías ---
  race:    ["............","....gggg....","g..gGGGGg..g","go.gGGGGg.og",".gggGGGGggg.",".gGGGGGGGGg.",".gGGdGGdGGg.",".gGGGGGGGGg.",".gGGGGGGGGg.",".gGGGGGGGGg.","..gggggggg..","............"],
  classsw: [".o......o..g",".gGo...gGo..","..gGo.gGo...","...gGgGo....","....ooo.....","...gGgGo....","..gGo.gGo...",".gGo...gGo..","oGo.....gGo.","o........gGo","............","............"],
  spell:   ["......G.....",".....GGG....","......G.....","..G..g.g..G.",".GGG.....GGG","..G..g.g..G.","......G.....","..G..GGG..G.",".GGG..G..GGG","..G.......G.","......G.....",".....GGG...."],
  beast:   ["..oo....oo..",".oGGo..oGGo.","oGGGGooGGGGo","oGdGGGGGGdGo","oGGGGGGGGGGo","oGGGGGGGGGGo",".oGGGGGGGGo.",".oGoGoGoGGo.","..oGoGoGo...","...oooooo...","............","............"],

  // --- Sistema / overlays ---
  gear:  ["....gggg....","..g.gGGg.g..",".gggGGGGggg.","..gGGddGGg..",".gGGddddGGg.","gGGdd..ddGGg","gGGdd..ddGGg",".gGGddddGGg.","..gGGddGGg..",".gggGGGGggg.","..g.gGGg.g..","....gggg...."],
  moon:  ["...gggg.....","..gGGGgg....",".gGGgooo....","gGGgo.......","gGGo........","gGGo........","gGGo........","gGGgo.......",".gGGgooo....","..gGGGgg....","...gggg.....","............"],
  sun:   ["....g..g....","....g..g....","..g.gGGg.g..","...gGGGGg...",".g.gGGGGg.g.","ggggGGGGgggg","ggggGGGGgggg",".g.gGGGGg.g.","...gGGGGg...","..g.gGGg.g..","....g..g....","....g..g...."],
  menu:  ["............","............",".gggggggggg.",".gggggggggg.","............",".gggggggggg.",".gggggggggg.","............",".gggggggggg.",".gggggggggg.","............","............"],
  bolt:  ["......gg....",".....gGg....","....gGG.....","...gGG......","..gGGgggg...","....gGGGg...","......gGG...",".....gGG....","....gGG.....","...gG.......","..g.........","............"],
  spark: ["............",".....g......","....gGg.....","....gGg.....","..g.gGg.g...",".gGgGGGgGg..","..g.gGg.g...","....gGg.....","....gGg.....",".....g......","............","............"],
  skull: ["...oooooo...","..oGGGGGGo..",".oGGGGGGGGo.","oGGddGGddGGo","oGGddGGddGGo","oGGGGooGGGGo","oGGGooooGGGo",".oGGGGGGGGo.","..oGoGoGo...","..oGoGoGo...","...oooooo...","............"],

  // --- Condiciones (inline ~14-16px). Clave: cond_<id de clean_conditions.json> ---
  cond_blinded:       ["............","....BBBB....","..BBwwwwBB..",".BwwddwwwwB.","BwwddBBwwwwB","BwwwwwwddwwB",".BwwwwddwwB.","..BBwwwwBB..","....BBBB.b..","........bb..","......bb....",".....b......"],
  cond_charmed:       ["...........G","..AA.AA...G.",".AAAAAAA.G..","AAAAAAAAA...","AAAAAAAAA...",".AAAAAAA....","..AAAAA.....","...AAA......","....A.......","......G.....",".....GGG....","......G....."],
  cond_deafened:      ["...gggg.....","..gGGGGg....",".gGGooGGg..b",".gGGoGGGg.b.",".gGGoGGg.b..",".gGGooo.b...",".gGGGGb.....",".gGGGbGg....","..gGbGg.....","...bgg......","..b.........",".b.........."],
  cond_exhaustion:    [".ooo....ooo.","..ooo..ooo..","...oooooo...","....oooo....",".....oo.....","............",".ooo....ooo.","..ooo..ooo..","...oooooo...","....oooo....",".....oo.....","............"],
  cond_frightened:    [".BBBBBBBBBB.","BwwwwwwwwwwB","BwddwwwwddwB","BwddwwwwddwB","BwwwwwwwwwwB","BwwwddddwwwB","BwwddwwddwwB","BwwwwwwwwwwB",".BBBBBBBBBB.","..b..b..b...","..b..b..b...","............"],
  cond_grappled:      ["............",".gg.gg.gg...","gGGgGGgGGg..","gGGgGGgGGg..","gGGgGGgGGggg","gGGGGGGGGGGg","oGGGGGGGGGGg",".oGGGGGGGGGo",".oGGGGGGGGo.",".oGGGGGGGGo.",".ooooooooo..","............"],
  cond_incapacitated: [".oooooooooo.","oGGGGGGGGGGo","oGdGGGGGGdGo","odGdGGGGdGdo","oGdGdGGdGdGo","oGGdGooGdGGo","oGGGoddoGGGo","oGGGGGGGGGGo","oGGdddddGGGo","oGdGGGGGdGGo",".oGGGGGGGGo.","..oooooooo.."],
  cond_invisible:     ["...gg.gg....",".g......g...","g..g..g..g..","g........g..",".g......g...","..g....g....","g..gggg..g..",".g.gGGg.g...","g..gGGg..g..",".g.g..g.g...","g..g..g..g..",".g......g..."],
  cond_paralyzed:     ["....SS......",".S..SS..S...","..S.SS.S....","SSSSSSSSSSSS","..S.SS.S....",".S..SS..S...","....SS......","....SS......","...SSSS.....","..S.SS.S....",".S..SS..S...","....SS......"],
  cond_petrified:     ["............",".oooooooooo.","oGGoGGGGoGGo","oGGoGGGGoGGo","ooooooooooGo","oGGGGoGGGGGo","oGGGGoGGGGoo","oooooooooooo","oGGoGGGGoGGo","oGGoGGGGoGGo",".oooooooooo.","............"],
  cond_poisoned:      ["....MM......","...MMMM.....","..MMMMMM....",".MMMMMMMM...","MMdMMMMdMM..","MMdMMMMdMM..","MMMMddMMMM..","MMMddddMMM..",".MMMMMMMM...","..MdMdMd....","...MMMM.....","....MM......"],
  cond_prone:         ["............","......b.....","....bbbbb...","......b.....","............","..gGGg......",".gGGGGgggg..","gGGddGGGGGg.",".gGGGGgggg..","..gGGg......","............","oooooooooooo"],
  cond_restrained:    ["..oo....oo..",".oGGo..oGGo.",".oGoo..ooGo.",".oGo....oGo.","..ooooooooo.","..oGGGGGGo..","..oGoooGGo..","..ooo..ooo..",".oGGo..oGGo.",".oGoo..ooGo.",".oGo....oGo.","..oo....oo.."],
  cond_stunned:       [".....G......","..G.GGG..G..",".GGG.G.GGG..","..G.....G...","....GGG.....","...GGGGG.G..","G..GGGGG....","...GGG......","....G..GGG..","..G.....G...",".GGG..G.....","..G........."],
  cond_unconscious:   ["............","..GGGG......","....GG......","...GG.......","..GGGG..GG..","........GG..","......GGGG..","..........GG","....GGGG..G.","....GG....G.","...GG...GGGG","..GGGG......"],
};
