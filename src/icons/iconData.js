// Grimoire OS — bitmaps de iconografía original (12×12 pixel-art).
// Cada ícono es un array de filas; cada char = un píxel. Char-set:
//   '.' transparente · 'o' outline · 'g' cuerpo · 'G' brillo · 'd' sombra interna
//   acentos semánticos de condición: 'b' blood · 'm' moss · 'a' arcane · 's' sky ·
//   'p'/'w' pergamino (+ claros 'B/M/A/S' para fondo oscuro).
// Los tonos o/g/G SIGUEN EL ACENTO del tema; el color real lo resuelve PixelIcon
// (ver paletteFor en PixelIcon.jsx: normal vs engrave). Los semánticos no cambian.

export const iconBitmaps = {
  // --- Apps / barra de título ---
  scroll: ["............",".gGGGGGGGGg.","goGGGGGGGGog",".gGddddddGg.",".gGGGGGGGGg.",".gGddddddGg.",".gGGGGGGGGg.",".gGddddddGg.",".gGGGGGGGGg.","goGGGGGGGGog",".gGGGGGGGGg.","............"],
  dice:   ["............","...gggggg...","..gGGGGGGo..",".gGGdGGdGGo.",".gGGGGGGGGo.",".gGGdGGGGGo.",".gGGGGGGdGo.",".gGGGdGGGGo.",".gGGGGGGGGo.","..oGGGGGGo..","...oooooo...","............"],
  book:   ["............","..oo....oo..",".oGGo..oGGo.","oGGGGooGGGGo","oGddGooGddGo","oGGGGooGGGGo","oGddGooGddGo","oGGGGooGGGGo","oGddGooGddGo","oGGGGooGGGGo",".oGGGooGGGo.","..ooo..ooo.."],
  sword:  ["..........gG",".........gGo","........gGo.",".......gGo..","......gGo...",".....gGo....","....gGo.....","..o.gG.o....",".oGoGoGo....","...ogo......","...ogo......","...ooo......"],
  castle: ["g.g.g.g.g.g.","gggggggggggg","gGgggddgggGg","ggggggddgggg","gggggddddggg","ggggddooddgg","ggggdo..oddg","ggggdo..oddg","ggggdo..oddg","ggggdo..oddg","gggggggggggg","oooooooooooo"],
  plus:   ["............","....gggg....","....gGGg....","....gGGg....","gggggGGggggg","gGGGGGGGGGGg","gGGGGGGGGGGg","gggggGGggggg","....gGGg....","....gGGg....","....gggg....","............"],

  // --- Personajes ---
  dragon: ["o..........o",".o........o.",".go......og.",".ogoooooogo.","..gGGGGGGg..",".gGGGGGGGGg.","gGdGGGGGGdGg","gGGGGGGGGGGg","gGGoGGGGoGGg",".gGGGGGGGGg.","..ogGGGGgo..","...oo..oo..."],
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
