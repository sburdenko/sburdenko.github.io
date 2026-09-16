/** Словарь кассеты «BFS и DFS». Значение-функция получает аргументы из t(). */
import { fmtI, plural } from '../../assets/vhs.js?v=202609161617';

const pl = (n, one, many) => `${fmtI(n)} ${n === 1 ? one : many}`;
const plRu = (n, one, few, many) => `${fmtI(n)} ${plural(n, one, few, many)}`;

export const DICT = {
  'page.title': {
    en: 'BFS and DFS — graph traversal · Tape 02',
    ru: 'BFS и DFS — обход графа · Кассета №2'
  },
  'page.desc': {
    en: 'An interactive walkthrough of breadth-first and depth-first search: queue versus stack, on a grid and on a graph, step by step, with shortest paths and memory.',
    ru: 'Интерактивный разбор обхода в ширину и в глубину: очередь против стека, сетка и граф, пошаговая перемотка, кратчайший путь и память.'
  },

  /* ---------------- hero ---------------- */
  'hero.eyebrow': { en: 'Tape 02 · Algorithms · interview prep', ru: 'Кассета №2 · Алгоритмы · для собеседования' },
  'hero.title': { en: 'Graph<br>traversal', ru: 'Обход графа' },
  'hero.subtitle': { en: 'BFS and DFS: queue versus stack', ru: 'BFS и DFS: очередь против стека' },
  'hero.lede': {
    en: 'Both algorithms do the same job — they visit everything reachable in O(V + E). The difference is a single line: <b>where we take the next node from</b>. From the head of a queue you get a wave. From the top of a stack you get a probe drilling down.',
    ru: 'Оба алгоритма делают одно и то же: аккуратно обходят всё, до чего можно дойти, за O(V + E). Разница ровно в одной строчке — <b>откуда мы достаём следующую вершину</b>. Из головы очереди — получается волна. С вершины стека — получается щуп, уходящий вглубь.'
  },
  'hero.thesis': {
    en: '<b>The point of this tape:</b> BFS and DFS differ by one data structure. Everything else follows from it — shortest paths, memory use, how well recursion fits, and the list of problems each one belongs to.',
    ru: '<b>Главная мысль кассеты:</b> код BFS и DFS отличается одной структурой данных. Всё остальное — следствие: кратчайший путь, расход памяти, склонность к рекурсии и список задач, где алгоритм уместен.'
  },
  'hero.legendBfs': { en: 'left — BFS, queue', ru: 'слева — BFS, очередь' },
  'hero.legendDfs': { en: 'right — DFS, stack', ru: 'справа — DFS, стек' },
  'hero.canvasAria': {
    en: 'On the left breadth-first search spreads in rings, on the right depth-first search runs along a single line',
    ru: 'Слева обход в ширину расходится кругами, справа обход в глубину уходит по одной линии'
  },
  'hero.note': {
    en: 'The same empty field, the same start in the middle. On the left the frontier is a ring; on the right it is one long snake.',
    ru: 'Одно и то же пустое поле, один и тот же старт в центре. Слева фронт — окружность, справа — длинная змейка.'
  },

  /* ---------------- terms ---------------- */
  'terms.h2': { en: 'Six words you will need', ru: 'Шесть слов, без которых дальше никак' },
  'terms.graph': {
    en: '<dt>Graph</dt><dd>Nodes and the edges between them. A grid of cells is a graph too: a cell is a node, a side-by-side neighbour is an edge. That is why the same code runs on both the maze and the diagram below.</dd>',
    ru: '<dt>Граф</dt><dd>Вершины (узлы) и рёбра между ними. Двумерный массив клеток — тоже граф: клетка — вершина, сосед по стороне — ребро. Поэтому один и тот же код работает и на сетке, и на схеме.</dd>'
  },
  'terms.frontier': {
    en: '<dt>Frontier <i style="background:rgba(255,210,63,.16);color:var(--osd)">FRONTIER</i></dt><dd>Nodes that are already open but not processed yet. The entire difference between BFS and DFS is which container holds the frontier.</dd>',
    ru: '<dt>Фронт <i style="background:rgba(255,210,63,.16);color:var(--osd)">FRONTIER</i></dt><dd>Вершины, которые уже открыты, но ещё не обработаны. Всё различие BFS и DFS — в том, какой контейнер хранит фронт.</dd>'
  },
  'terms.queue': {
    en: '<dt>Queue <i style="background:rgba(38,227,234,.14);color:var(--gpu)">FIFO</i></dt><dd>Push to the tail, take from the head. Opened first means processed first — that is where layer-by-layer order and shortest paths come from.</dd>',
    ru: '<dt>Очередь <i style="background:rgba(38,227,234,.14);color:var(--gpu)">FIFO</i></dt><dd>Кладём в хвост, берём из головы. Кто раньше открыт, тот раньше обработан — отсюда обход по слоям и кратчайший путь.</dd>'
  },
  'terms.stack': {
    en: '<dt>Stack <i style="background:rgba(255,62,165,.16);color:var(--cpu)">LIFO</i></dt><dd>Push and pop at the same end. The freshest neighbour is processed next — that is where the dive and the backtrack-only-at-a-dead-end behaviour come from.</dd>',
    ru: '<dt>Стек <i style="background:rgba(255,62,165,.16);color:var(--cpu)">LIFO</i></dt><dd>Кладём и берём с одного конца. Обрабатывается самый свежий сосед — отсюда спуск вглубь и возврат только из тупика.</dd>'
  },
  'terms.open': {
    en: '<dt>Open ≠ visited</dt><dd>“Open” means it sits in the frontier and waits. “Visited” means we already took it out and processed it. BFS marks a node when it is pushed, otherwise it lands in the queue once per neighbour.</dd>',
    ru: '<dt>Открыт ≠ посещён</dt><dd>«Открыт» — лежит во фронте и ждёт. «Посещён» — уже достали и обработали. В BFS вершину помечают при добавлении, иначе она попадёт в очередь по разу на каждого соседа.</dd>'
  },
  'terms.tree': {
    en: '<dt>Traversal tree</dt><dd>The <code>parent[]</code> array: who we first arrived from. Walking it backwards reconstructs the path to the start. For BFS it is a shortest-path tree; for DFS it is a set of long dive branches.</dd>',
    ru: '<dt>Дерево обхода</dt><dd>Массив <code>parent[]</code>: из кого мы впервые пришли в вершину. По нему восстанавливают путь назад к старту. У BFS это дерево кратчайших путей, у DFS — длинные ветки спуска.</dd>'
  },

  /* ---------------- grid deck ---------------- */
  'grid.tag': { en: 'CH.02 // GRID DECK', ru: 'CH.02 // GRID DECK' },
  'grid.h2': { en: 'A 2D array: wave versus probe', ru: 'Двумерный массив: волна против щупа' },
  'grid.kicker': {
    en: 'A grid of cells is the most readable graph there is. Draw walls with the mouse, move the start and the finish, hit Play and scrub step by step. Cell colour is the visit order, the outline is what sits in the frontier right now, and the yellow line is the path along the parents.',
    ru: 'Сетка клеток — самый наглядный граф. Рисуй стены мышкой, переноси старт и финиш, жми «Пуск» и мотай по шагам. Цвет клетки — порядок посещения, рамка — что сейчас лежит во фронте, жёлтая линия — путь по родителям.'
  },
  'grid.lblAlg': { en: 'ALGORITHM', ru: 'АЛГОРИТМ' },
  'grid.lblData': { en: 'DATA', ru: 'ДАННЫЕ' },
  'grid.lblClick': { en: 'CLICK ON THE FIELD', ru: 'КЛИК ПО ПОЛЮ' },
  'grid.lblActions': { en: 'ACTIONS', ru: 'ДЕЙСТВИЯ' },
  'grid.lblShow': { en: 'SHOW', ru: 'ПОКАЗАТЬ' },
  'grid.bfs': { en: 'BFS · queue', ru: 'BFS · очередь' },
  'grid.dfs': { en: 'DFS · stack', ru: 'DFS · стек' },
  'grid.maze': { en: 'Maze', ru: 'Лабиринт' },
  'grid.cave': { en: 'Cave', ru: 'Пещера' },
  'grid.wall': { en: 'Wall', ru: 'Стена' },
  'grid.start': { en: 'Start', ru: 'Старт' },
  'grid.goal': { en: 'Finish', ru: 'Финиш' },
  'grid.rnd': { en: '🎲 New data', ru: '🎲 Новые данные' },
  'grid.clear': { en: 'Clear the field', ru: 'Очистить поле' },
  'grid.tree': { en: 'Traversal tree', ru: 'Дерево обхода' },
  'grid.depth': { en: 'Colour by layer', ru: 'Цвет по слоям' },
  'grid.diag': { en: '8 directions', ru: '8 направлений' },
  'grid.size': { en: 'Field size', ru: 'Размер поля' },
  'grid.dens': { en: 'Wall density', ru: 'Плотность стен' },
  'grid.canvasAria': { en: 'Grid of cells: traversal step by step', ru: 'Поле клеток: обход по шагам' },
  'grid.ariaAlg': { en: 'Algorithm', ru: 'Алгоритм' },
  'grid.ariaData': { en: 'Field type', ru: 'Тип поля' },
  'grid.ariaClick': { en: 'What a click does', ru: 'Что делает клик' },
  'grid.note': {
    en: 'The maze is generated by the very same DFS with a stack: dig until you are stuck, back up to the last junction. The cave is random walls; if the finish ends up walled off, a corridor to it is dug on purpose.',
    ru: 'Лабиринт генерируется тем же DFS со стеком — «прокопать до упора, вернуться в развилку». Пещера — случайные стены; если цель оказалась отрезана, коридор к ней прокапывается принудительно.'
  },

  /* ---------------- graph deck ---------------- */
  'graph.tag': { en: 'CH.03 // GRAPH DECK', ru: 'CH.03 // GRAPH DECK' },
  'graph.h2': { en: 'A graph: nodes, edges and the traversal tree', ru: 'Граф: узлы, рёбра и дерево обхода' },
  'graph.kicker': {
    en: 'Same code, different data. Thick edges are the traversal tree (<code>parent[]</code>); thin ones are edges we walked along only to find the node already open. Click a node to make it the start.',
    ru: 'Тот же код, другие данные. Жирные рёбра — дерево обхода (<code>parent[]</code>), тонкие — рёбра, по которым мы прошли, но узел уже был открыт. Клик по узлу делает его стартом.'
  },
  'graph.lblShape': { en: 'GRAPH SHAPE', ru: 'ФОРМА ГРАФА' },
  'graph.geo': { en: 'Random', ru: 'Случайный' },
  'graph.tree': { en: 'Tree', ru: 'Дерево' },
  'graph.ring': { en: 'Ring', ru: 'Кольцо' },
  'graph.nodes': { en: 'Nodes', ru: 'Узлов' },
  'graph.rnd': { en: '🎲 New graph', ru: '🎲 Новый граф' },
  'graph.canvasAria': { en: 'Graph: nodes and edges, traversal step by step', ru: 'Граф: узлы и рёбра, обход по шагам' },
  'graph.ariaShape': { en: 'Graph shape', ru: 'Форма графа' },
  'graph.note': {
    en: 'Here the traversal runs to the end instead of stopping at the finish: you can see that both algorithms visit exactly the same set of nodes — only the order differs.',
    ru: 'Здесь обход идёт до конца, а не до цели: видно, что оба алгоритма посещают одно и то же множество вершин — различается только порядок.'
  },

  /* ---------------- shared deck chrome ---------------- */
  'ui.frontTitle': { en: 'Frontier: what is in the container right now', ru: 'Фронт: что лежит в контейнере прямо сейчас' },
  'ui.codeTitle': { en: 'Pseudocode · current line highlighted', ru: 'Псевдокод · подсвечена текущая строка' },
  'ui.empty': { en: 'empty', ru: 'пусто' },
  'ui.queueEnds': {
    en: '<span>◀ HEAD · we take from here</span><span>we push here · TAIL ▶</span>',
    ru: '<span>◀ ГОЛОВА · берём отсюда</span><span>кладём сюда · ХВОСТ ▶</span>'
  },
  'ui.stackEnds': {
    en: '<span>BOTTOM</span><span>we push and pop here · TOP ▶</span>',
    ru: '<span>ДНО</span><span>берём и кладём сюда · ВЕРШИНА ▶</span>'
  },
  'ui.stepTitle': { en: 'What happens on this step', ru: 'Что происходит на этом шаге' },

  /* pseudocode */
  'code.bfs': {
    en: [
      'BFS(start):',
      '  queue ← [start]      // FIFO queue',
      '  seen  ← {start}',
      '  while queue not empty:',
      '    v ← queue.dequeue()   // from the head',
      '    visit(v)',
      '    for u in neighbours(v):',
      '      if u ∈ seen: continue',
      '      seen.add(u); parent[u] ← v',
      '      queue.enqueue(u)    // to the tail'
    ],
    ru: [
      'BFS(start):',
      '  queue ← [start]      // очередь, FIFO',
      '  seen  ← {start}',
      '  while queue не пуст:',
      '    v ← queue.dequeue()   // из головы',
      '    visit(v)',
      '    for u in соседи(v):',
      '      if u ∈ seen: continue',
      '      seen.add(u); parent[u] ← v',
      '      queue.enqueue(u)    // в хвост'
    ]
  },
  'code.dfs': {
    en: [
      'DFS(start):',
      '  stack ← [start]      // LIFO stack',
      '  visited ← {}',
      '  while stack not empty:',
      '    v ← stack.pop()       // from the top',
      '    if v ∈ visited: continue',
      '    visited.add(v)',
      '    for u in neighbours(v) reversed:',
      '      if u ∉ visited:',
      '        parent[u] ← v; stack.push(u)'
    ],
    ru: [
      'DFS(start):',
      '  stack ← [start]      // стек, LIFO',
      '  visited ← {}',
      '  while stack не пуст:',
      '    v ← stack.pop()       // с вершины',
      '    if v ∈ visited: continue',
      '    visited.add(v)',
      '    for u in соседи(v) обратно:',
      '      if u ∉ visited:',
      '        parent[u] ← v; stack.push(u)'
    ]
  },

  /* события ленты */
  'ev.tag.init': { en: 'START', ru: 'СТАРТ' },
  'ev.tag.pop': { en: 'TAKE OUT', ru: 'ИЗВЛЕКАЕМ' },
  'ev.tag.visit': { en: 'VISIT', ru: 'ПОСЕЩАЕМ' },
  'ev.tag.push': { en: 'PUSH', ru: 'ДОБАВЛЯЕМ' },
  'ev.tag.skip': { en: 'SKIP', ru: 'ПРОПУСК' },
  'ev.tag.dup': { en: 'DUPLICATE', ru: 'ДУБЛЬ' },
  'ev.tag.goal': { en: 'GOAL', ru: 'ЦЕЛЬ' },
  'ev.tag.done': { en: 'END', ru: 'КОНЕЦ' },
  'ev.init': {
    en: (order, A) => `Put <b>${A}</b> into the ${order === 'bfs' ? 'queue' : 'stack'} and mark it open.`,
    ru: (order, A) => `Кладём <b>${A}</b> в ${order === 'bfs' ? 'очередь' : 'стек'} и помечаем как открытую.`
  },
  'ev.pop': {
    en: (order, A) => order === 'bfs'
      ? `Take <b>${A}</b> from the <b>head</b> of the queue — the oldest open node.`
      : `Pop <b>${A}</b> off the <b>top</b> of the stack — the freshest open node.`,
    ru: (order, A) => order === 'bfs'
      ? `Берём <b>${A}</b> из <b>головы</b> очереди — это самая «старая» открытая вершина.`
      : `Снимаем <b>${A}</b> с <b>вершины</b> стека — это самая «свежая» открытая вершина.`
  },
  'ev.visit': {
    en: (order, A, B, ev) => `Visit <b>${A}</b>. Traversal number ${ev.order + 1}, depth ${ev.depth}.`,
    ru: (order, A, B, ev) => `Посещаем <b>${A}</b>. Номер обхода ${ev.order + 1}, глубина ${ev.depth}.`
  },
  'ev.push': {
    en: (order, A, B) => `Neighbour <b>${A}</b> is not open yet: remember parent <b>${B}</b> and push it ${order === 'bfs' ? 'to the tail of the queue' : 'onto the top of the stack'}.`,
    ru: (order, A, B) => `Сосед <b>${A}</b> ещё не открыт: запоминаем родителя <b>${B}</b> и кладём ${order === 'bfs' ? 'в хвост очереди' : 'на вершину стека'}.`
  },
  'ev.skip': {
    en: (order, A) => `Neighbour <b>${A}</b> is already ${order === 'bfs' ? 'queued or visited' : 'visited'} — we do not open it twice.`,
    ru: (order, A) => `Сосед <b>${A}</b> уже ${order === 'bfs' ? 'в очереди или посещён' : 'посещён'} — второй раз не открываем.`
  },
  'ev.dup': {
    en: (order, A) => `<b>${A}</b> was in the stack twice. This copy is stale — drop it.`,
    ru: (order, A) => `<b>${A}</b> лежал в стеке дважды. Эта копия устарела — выбрасываем.`
  },
  'ev.goal': {
    en: (order, A) => `<b>${A}</b> is the goal. The path is rebuilt by walking the parents back to the start.`,
    ru: (order, A) => `<b>${A}</b> — это цель. Путь восстанавливаем по родителям назад до старта.`
  },
  'ev.done': {
    en: (order, A, B, ev) => ev.found
      ? 'Goal reached — no need to go further. The path is already collected from the parents.'
      : `The ${order === 'bfs' ? 'queue' : 'stack'} is empty: everything reachable has been visited.`,
    ru: (order, A, B, ev) => ev.found
      ? 'Цель найдена — дальше обход можно не продолжать. Путь уже собран по родителям.'
      : `${order === 'bfs' ? 'Очередь пуста' : 'Стек пуст'}: всё, до чего можно дойти, обойдено.`
  },

  /* ---------------- боковая панель сетки ---------------- */
  'grid.kvFrontier': { en: order => order === 'bfs' ? 'In the queue' : 'In the stack', ru: order => order === 'bfs' ? 'В очереди' : 'В стеке' },
  'grid.kvVisited': { en: 'Visited', ru: 'Посещено' },
  'grid.kvOf': { en: (a, b) => `${fmtI(a)} of ${fmtI(b)}`, ru: (a, b) => `${fmtI(a)} из ${fmtI(b)}` },
  'grid.kvDepth': { en: 'Depth of current', ru: 'Глубина текущей' },
  'grid.kvPath': { en: 'Path to the finish', ru: 'Путь до финиша' },
  'grid.legStart': { en: 'start', ru: 'старт' },
  'grid.legGoal': { en: 'finish', ru: 'финиш' },
  'grid.legFrontier': { en: order => order === 'bfs' ? 'in the queue (open)' : 'in the stack (open)', ru: order => order === 'bfs' ? 'в очереди (открыты)' : 'в стеке (открыты)' },
  'grid.legVisited': { en: byDepth => `visited ${byDepth ? '(colour = layer)' : '(colour = order)'}`, ru: byDepth => `посещённые ${byDepth ? '(цвет = слой)' : '(цвет = порядок)'}` },
  'grid.legPath': { en: 'path found', ru: 'найденный путь' },
  'grid.clickNote': {
    en: mode => `Clicking the field ${mode === 'wall' ? 'adds and removes a wall' : mode === 'start' ? 'moves the start' : 'moves the finish'}. Switch with the “Click” buttons.`,
    ru: mode => `Клик по полю: ${mode === 'wall' ? 'ставит и убирает стену' : mode === 'start' ? 'переносит старт' : 'переносит финиш'}. Переключить — кнопками «Клик».`
  },
  'grid.osd': {
    en: (order, cols, rows, kind, seed) => `${order.toUpperCase()} · ${cols}×${rows} · ${kind === 'maze' ? 'MAZE' : 'CAVE'} #${seed}`,
    ru: (order, cols, rows, kind, seed) => `${order.toUpperCase()} · ${cols}×${rows} · ${kind === 'maze' ? 'ЛАБИРИНТ' : 'ПЕЩЕРА'} #${seed}`
  },
  'grid.osdGoal': { en: '■ GOAL FOUND', ru: '■ ЦЕЛЬ НАЙДЕНА' },
  'grid.osdDone': { en: '■ TRAVERSAL DONE', ru: '■ ОБХОД ЗАКОНЧЕН' },
  'grid.osdRec': { en: '● REC', ru: '● REC' },
  'grid.osdPause': { en: '❚❚ PAUSE', ru: '❚❚ PAUSE' },
  'grid.tipWall': { en: (x, y) => `${x},${y} · wall`, ru: (x, y) => `${x},${y} · стена` },
  'grid.tipVisited': { en: (x, y, n, d) => `${x},${y} · visited ${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}, depth ${d}`, ru: (x, y, n, d) => `${x},${y} · посещена ${n}-й, глубина ${d}` },
  'grid.tipOpen': { en: (x, y) => `${x},${y} · open, waiting in the frontier`, ru: (x, y) => `${x},${y} · открыта, ждёт во фронте` },
  'grid.tipClosed': { en: (x, y) => `${x},${y} · not open yet`, ru: (x, y) => `${x},${y} · ещё не открыта` },

  /* плитки сетки */
  'grid.tileVisited': { en: 'Cells visited', ru: 'Посещено клеток' },
  'grid.tileVisitedUnit': { en: n => `of ${fmtI(n)}`, ru: n => `из ${fmtI(n)}` },
  'grid.tileVisitedFoot': {
    en: (done, found) => done ? (found ? 'stopped at the goal' : 'goal not reachable') : 'traversal running',
    ru: (done, found) => done ? (found ? 'обход остановлен на цели' : 'цель не найдена') : 'обход идёт'
  },
  'grid.tileFrontier': { en: 'Frontier now', ru: 'Фронт сейчас' },
  'grid.tileFrontierUnit': { en: order => order === 'bfs' ? 'in the queue' : 'in the stack', ru: order => order === 'bfs' ? 'в очереди' : 'в стеке' },
  'grid.tileFrontierFoot': { en: n => `peak over the run: ${fmtI(n)}`, ru: n => `максимум за прогон: ${fmtI(n)}` },
  'grid.tilePath': { en: 'Path length', ru: 'Длина пути' },
  'grid.tilePathUnit': { en: 'steps', ru: 'шагов' },
  'grid.tilePathFoot': {
    en: order => order === 'bfs' ? 'BFS: this is the shortest path' : 'DFS: some path, not the shortest',
    ru: order => order === 'bfs' ? 'BFS: это кратчайший путь' : 'DFS: путь любой, не кратчайший'
  },
  'grid.tileSteps': { en: 'Algorithm steps', ru: 'Шагов алгоритма' },
  'grid.tileStepsUnit': { en: 'events', ru: 'событий' },
  'grid.tileStepsFoot': { en: n => `played ${fmtI(n)}`, ru: n => `просмотрено ${fmtI(n)}` },

  /* ---------------- боковая панель графа ---------------- */
  'graph.kvBox': { en: order => order === 'bfs' ? 'Queue' : 'Stack', ru: order => order === 'bfs' ? 'Очередь' : 'Стек' },
  'graph.kvVisited': { en: 'Visited', ru: 'Посещено' },
  'graph.kvEdges': { en: 'Edges in the graph', ru: 'Рёбер в графе' },
  'graph.layers': { en: 'Layers from the start', ru: 'Слои от старта' },
  'graph.layer': { en: d => `layer ${d}`, ru: d => `слой ${d}` },
  'graph.chain': { en: 'Dive chain (the recursion stack)', ru: 'Цепочка спуска (как рекурсия)' },
  'graph.empty': { en: 'empty so far', ru: 'пока пусто' },
  'graph.clickNote': {
    en: goal => `Click a node to make it the start. The finish is the last node (${goal}).`,
    ru: goal => `Клик по узлу — сделать его стартом. Финиш — последний узел (${goal}).`
  },
  'graph.osd': {
    en: (order, v, e, kind, seed) => `${order.toUpperCase()} · V=${v} E=${e} · ${({ geo: 'RANDOM', tree: 'TREE', ring: 'RING' })[kind]} #${seed}`,
    ru: (order, v, e, kind, seed) => `${order.toUpperCase()} · V=${v} E=${e} · ${({ geo: 'СЛУЧАЙНЫЙ', tree: 'ДЕРЕВО', ring: 'КОЛЬЦО' })[kind]} #${seed}`
  },
  'graph.tip': {
    en: (label, neighbours, state) => `${label} · neighbours: ${neighbours} · ${state}`,
    ru: (label, neighbours, state) => `${label} · соседи: ${neighbours} · ${state}`
  },
  'graph.tipVisited': { en: (n, d) => `visited ${n}${n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th'}, depth ${d}`, ru: (n, d) => `посещён ${n}-м, глубина ${d}` },
  'graph.tipOpen': { en: 'open, waiting', ru: 'открыт, ждёт' },
  'graph.tipClosed': { en: 'not open yet', ru: 'ещё не открыт' },
  'graph.tileVisited': { en: 'Visited', ru: 'Посещено' },
  'graph.tileVisitedUnit': { en: n => `of ${fmtI(n)}`, ru: n => `из ${fmtI(n)}` },
  'graph.tileVisitedFoot': { en: 'graph nodes', ru: 'узлов графа' },
  'graph.tileFrontier': { en: 'Frontier', ru: 'Фронт' },
  'graph.tileFrontierFoot': { en: n => `peak: ${fmtI(n)}`, ru: n => `максимум: ${fmtI(n)}` },
  'graph.tileDepth': { en: 'Tree depth', ru: 'Глубина дерева' },
  'graph.tileDepthUnit': { en: 'lv.', ru: 'ур.' },
  'graph.tileDepthFoot': {
    en: order => order === 'bfs' ? 'BFS: this is the distance' : 'DFS: length of the dive',
    ru: order => order === 'bfs' ? 'BFS: это и есть расстояние' : 'DFS: длина спуска'
  },
  'graph.tilePath': { en: 'Path S → F', ru: 'Путь S → F' },
  'graph.tilePathUnit': { en: 'edges', ru: 'рёбер' },
  'graph.tilePathFoot': { en: order => order === 'bfs' ? 'shortest' : 'whatever it found', ru: order => order === 'bfs' ? 'кратчайший' : 'какой получился' },

  /* ---------------- гонка ---------------- */
  'race.tag': { en: 'CH.04 // SIDE BY SIDE', ru: 'CH.04 // SIDE BY SIDE' },
  'race.h2': { en: 'One maze, two traversals, one transport', ru: 'Один лабиринт, два обхода, общая перемотка' },
  'race.kicker': {
    en: 'Both look for the finish and stop as soon as they reach it. Watch not only the path length but the frontier peak — that is the memory the algorithm holds at its worst moment.',
    ru: 'Оба ищут финиш и останавливаются, как только его нашли. Смотри не только на длину пути, но и на пик фронта — это та память, которую алгоритм держит в самый тяжёлый момент.'
  },
  'race.rnd': { en: '🎲 New field', ru: '🎲 Новое поле' },
  'race.colB': { en: '◀ BFS · queue', ru: '◀ BFS · очередь' },
  'race.colD': { en: 'DFS · stack ▶', ru: 'DFS · стек ▶' },
  'race.canvasB': { en: 'Breadth-first search in a maze', ru: 'Обход в ширину в лабиринте' },
  'race.canvasD': { en: 'Depth-first search in the same maze', ru: 'Обход в глубину в том же лабиринте' },
  'race.line': {
    en: (v, free, front, path) => `${fmtI(v)} / ${fmtI(free)} cells · frontier ${fmtI(front)} · path ${path}`,
    ru: (v, free, front, path) => `${fmtI(v)} / ${fmtI(free)} клеток · фронт ${fmtI(front)} · путь ${path}`
  },
  'race.tilePathB': { en: 'BFS path', ru: 'Путь BFS' },
  'race.tilePathD': { en: 'DFS path', ru: 'Путь DFS' },
  'race.tileSteps': { en: 'steps', ru: 'шагов' },
  'race.footShortest': { en: 'shortest by definition', ru: 'кратчайший по определению' },
  'race.footNotFound': { en: 'finish not found yet', ru: 'финиш ещё не найден' },
  'race.footLonger': { en: p => `${p}% longer than BFS`, ru: p => `длиннее BFS на ${p}%` },
  'race.footSame': { en: 'here it matched the shortest', ru: 'здесь совпал с кратчайшим' },
  'race.tileCellsB': { en: 'Cells walked · BFS', ru: 'Обошёл клеток · BFS' },
  'race.tileCellsD': { en: 'Cells walked · DFS', ru: 'Обошёл клеток · DFS' },
  'race.footArea': { en: 'grows like the area of a circle', ru: 'растёт как площадь круга' },
  'race.footLucky': { en: 'fewer so far: the corridor leads to the goal', ru: 'пока меньше: коридор ведёт к цели' },
  'race.footWander': { en: 'wandering longer', ru: 'блуждает дольше' },
  'race.tilePeakB': { en: 'Frontier peak · BFS', ru: 'Пик фронта · BFS' },
  'race.tilePeakD': { en: 'Frontier peak · DFS', ru: 'Пик фронта · DFS' },
  'race.tilePeakUnit': { en: 'cells', ru: 'клеток' },
  'race.footWidth': { en: 'memory = width of the wave', ru: 'память = ширина волны' },
  'race.footDepth': { en: 'memory = depth of the dive', ru: 'память = глубина спуска' },
  'race.verdictRunning': {
    en: '<b>Running.</b> On the left the wave spreads in rings; on the right the probe dives into one corridor and comes back only at a dead end.',
    ru: '<b>Идёт прогон.</b> Слева волна расходится кругами, справа щуп уходит в один коридор до упора и возвращается только в тупике.'
  },
  'race.verdictDone': {
    en: (vb, pb, vd, pd, narrower) => `<b>Result.</b> BFS walked ${pl(vb, 'cell', 'cells')} and produced a path of ${pl(pb, 'step', 'steps')} — nothing shorter exists. DFS walked ${fmtI(vd)} and produced ${fmtI(pd)}. ${pd > pb
      ? `Further from the optimum, but its frontier is ${narrower ? 'narrower' : 'no wider'}: DFS keeps one branch, BFS keeps the whole layer.`
      : 'In a perfect maze the path is unique, so the lengths matched — the difference is left in the order of traversal and in memory.'}`,
    ru: (vb, pb, vd, pd, narrower) => `<b>Итог.</b> BFS обошёл ${plRu(vb, 'клетку', 'клетки', 'клеток')} и выдал путь в ${plRu(pb, 'шаг', 'шага', 'шагов')} — короче не бывает. DFS обошёл ${fmtI(vd)} и выдал ${fmtI(pd)}. ${pd > pb
      ? `Дальше от оптимума, зато фронт ${narrower ? 'уже' : 'не шире'}: DFS хранит одну ветку, BFS — весь слой.`
      : 'В идеальном лабиринте путь единственный, поэтому длина совпала — разница осталась только в порядке обхода и в памяти.'}`
  },

  /* ---------------- шпаргалка ---------------- */
  'cheat.tag': { en: 'CH.05 // CHEAT SHEET', ru: 'CH.05 // CHEAT SHEET' },
  'cheat.h2': { en: 'Cheat sheet: what to ask yourself first', ru: 'Шпаргалка: что спросить у себя перед выбором' },
  'cheat.kicker': {
    en: 'Need the shortest path in an unweighted graph — BFS. Just need to walk everything, find a cycle or go deep — DFS. Weights appeared — that is Dijkstra already.',
    ru: 'Нужен кратчайший путь в невзвешенном графе — BFS. Нужно просто всё обойти, найти цикл или уйти вглубь — DFS. Появились веса — это уже Дейкстра.'
  },
  'cheat.prio1': {
    en: '<span class="n">1</span><h3>Do you need the shortest path?</h3><p>Unweighted graph — BFS. Weights 0 and 1 — 0-1 BFS on a deque. Arbitrary weights — Dijkstra. A heuristic that tells you where to go — A*.</p>',
    ru: '<span class="n">1</span><h3>Нужен кратчайший путь?</h3><p>Невзвешенный граф — BFS. Веса 0 и 1 — 0-1 BFS на деке. Произвольные веса — Дейкстра. Есть эвристика (знаем, куда идти) — A*.</p>'
  },
  'cheat.prio2': {
    en: '<span class="n">2</span><h3>Is the graph deep or wide?</h3><p>Wide and shallow — the queue balloons, DFS is cheaper. Deep and narrow — recursion risks blowing the stack, so take BFS or DFS on an explicit stack.</p>',
    ru: '<span class="n">2</span><h3>Граф глубокий или широкий?</h3><p>Широкий и мелкий — очередь распухнет, дешевле DFS. Глубокий и узкий — рекурсия рискует переполнить стек, берём BFS или DFS на явном стеке.</p>'
  },
  'cheat.prio3': {
    en: '<span class="n">3</span><h3>What happens on the way out?</h3><p>Topological sort, bridges, subtree sizes — all of it happens at the moment you <b>return</b> from a node, and only DFS has that moment.</p>',
    ru: '<span class="n">3</span><h3>Что делаем при выходе?</h3><p>Топологическая сортировка, поиск мостов, подсчёт размеров поддеревьев — всё это про момент <b>возврата</b> из вершины, а он есть только у DFS.</p>'
  },
  'cheat.thProp': { en: 'Property', ru: 'Свойство' },
  'cheat.thBfs': { en: 'BFS · breadth-first', ru: 'BFS · обход в ширину' },
  'cheat.thDfs': { en: 'DFS · depth-first', ru: 'DFS · обход в глубину' },
  'cheat.rows': {
    en: [
      ['Frontier structure', 'Queue (FIFO): first in, first out', 'Stack (LIFO): last in, first out'],
      ['Traversal order', 'By layers: all neighbours, then their neighbours', 'Depth first: down one branch, back only at a dead end'],
      ['Shortest path', 'Yes — in an unweighted graph the number of edges is minimal', 'No — finds some path, usually longer'],
      ['Time', 'O(V + E) — every node and every edge once', 'O(V + E) — the same'],
      ['Memory', 'O(width) — the queue holds a whole layer; on a grid that is the perimeter of a circle', 'O(depth) — the stack holds one branch; on a deep graph that is its full length'],
      ['When a node is marked', 'When pushed — otherwise one node lands in the queue many times', 'Usually when popped; that is why duplicates live in the stack'],
      ['Recursion', 'Not written recursively — a queue does not match the call stack', 'Fits recursion naturally; the call stack is the traversal stack'],
      ['Typical problems', 'Shortest path on a tile map, wave algorithm, dependency levels, “two handshakes away”', 'Connected components, cycle detection, topological sort, maze generation, flood fill'],
      ['Risk in practice', 'Memory: the queue balloons on a large map', 'Depth: recursion dies with a stack overflow — long chains need an explicit stack']
    ],
    ru: [
      ['Структура фронта', 'Очередь (FIFO): первым вышел тот, кто первым вошёл', 'Стек (LIFO): первым вышел тот, кто вошёл последним'],
      ['Порядок обхода', 'По слоям: сначала все соседи, потом соседи соседей', 'Вглубь: до упора по одной ветке, назад только из тупика'],
      ['Кратчайший путь', 'Да — в невзвешенном графе число рёбер минимально', 'Нет — находит какой-то путь, обычно длиннее'],
      ['Время', 'O(V + E) — каждый узел и каждое ребро по разу', 'O(V + E) — столько же'],
      ['Память', 'O(ширины) — в очереди лежит целый слой; на сетке это «периметр круга»', 'O(глубины) — в стеке лежит одна ветка; на глубоком графе это вся её длина'],
      ['Когда узел помечается', 'При добавлении в очередь — иначе один узел попадёт в неё много раз', 'Обычно при снятии со стека; поэтому в стеке бывают дубли'],
      ['Рекурсия', 'Не пишут рекурсивно — очередь не совпадает со стеком вызовов', 'Естественно ложится на рекурсию; стек вызовов = стек обхода'],
      ['Типичные задачи', 'Кратчайший путь по клеткам, волновой алгоритм, уровни зависимостей, сеть друзей «на 2 рукопожатия»', 'Компоненты связности, поиск циклов, топологическая сортировка, генерация лабиринтов, заливка'],
      ['Риск на практике', 'Память: очередь на большой карте распухает', 'Глубина: рекурсия падает со stack overflow — на длинных цепочках нужен явный стек']
    ]
  },

  /* ---------------- вопросы ---------------- */
  'qa.tag': { en: 'CH.06 // INTERVIEW', ru: 'CH.06 // INTERVIEW' },
  'qa.h2': { en: 'Questions you will be asked', ru: 'Вопросы, которые спросят' },
  'qa.kicker': { en: 'Answer out loud first, then open the card.', ru: 'Сначала ответь вслух сам, потом открывай.' },
  'qa.items': {
    en: [
      ['What is the difference between BFS and DFS in one sentence?', '<p>Both walk the same set of reachable nodes in O(V + E) and differ only in the structure of the frontier: BFS keeps open nodes in a <b>queue</b> and spreads in layers, DFS keeps them in a <b>stack</b> and dives down one branch.</p>'],
      ['Why does BFS find the shortest path and DFS does not?', '<p>BFS takes nodes out in non-decreasing order of distance from the start: first everything at distance 1, then 2, and so on. So the first time a node is taken out, its distance is already minimal. DFS has no such order: it descends into the first neighbour it sees and can reach the goal the long way round. Important: this holds for an <b>unweighted</b> graph. As soon as edges have weights you need Dijkstra or 0-1 BFS.</p>'],
      ['When do you mark a node as seen — on push or on pop?', '<p>In BFS — <b>on push</b>. Otherwise the same node lands in the queue once per neighbour and the queue balloons. In iterative DFS people usually mark <b>on pop</b>, so duplicates in the stack are normal and get dropped on the way out. You can see it on this page: DFS produces “DUPLICATE” events.</p>'],
      ['What about memory complexity?', '<p>O(V) in the worst case for both, but they behave differently. BFS holds a whole layer: on a grid that is the perimeter of an expanding circle, on a tree the widest level (b^d). DFS holds one branch: O(depth). On a wide shallow graph DFS is cheaper; on a deep one BFS is.</p>'],
      ['How do you recover the path itself, not just reachability?', '<p>Keep a <code>parent[]</code> array: when you push a neighbour, record who you came from. Once you reach the goal, walk the parents back to the start and reverse the list. That is exactly the yellow line drawn on this page.</p>'],
      ['DFS with recursion or with a stack?', '<p>Recursion is shorter and reads better, but on long chains (a grid of a million cells, a long list) the call stack overflows. An explicit stack takes the same memory on the heap instead of the thread stack and does not crash. The order matches recursion if you push neighbours in reverse — which is what this page does.</p>'],
      ['What happens if you forget the visited set?', '<p>On a graph with a cycle the traversal never ends: nodes keep getting added forever. On a tree (no cycles) everything works, which is exactly why people forget the check in an interview.</p>'],
      ['Where does BFS show up in practice?', '<p>Wave pathfinding on a tile map, “how many handshakes to this person”, dependency levels in a build, finding the nearest matching object, flood fill that expands evenly, and multi-source BFS: push several starts at once and get a distance map to the nearest source.</p>'],
      ['Where does DFS show up in practice?', '<p>Connected components, cycle detection, topological sort (the order nodes are left in), bridges and articulation points, maze generation (that is how the maze on this page is built), walking a file tree, parsing expressions.</p>'],
      ['How do you traverse a graph with weighted edges?', '<p>BFS stops working: “one edge = one step” no longer means “closer”. You need Dijkstra (a priority queue), for weights 0 and 1 a 0-1 BFS on a deque, and with a heuristic A*. The frontier idea is the same; only the rule for who comes out next changes.</p>'],
      ['How many times is an edge processed?', '<p>In an undirected graph every edge is looked at twice — once from each end — so there is no extra factor in O(V + E), it hides in the constant. In a directed graph, once.</p>'],
      ['How do you count connected components?', '<p>Loop over all nodes: if a node has not been visited, start a traversal from it (either one) and bump the counter. The complexity stays O(V + E) because every node ends up in exactly one traversal.</p>']
    ],
    ru: [
      ['Чем BFS отличается от DFS одной фразой?', '<p>Обе перебирают одно и то же множество достижимых вершин за O(V + E) и различаются только структурой фронта: BFS хранит открытые вершины в <b>очереди</b> и расходится слоями, DFS — в <b>стеке</b> и уходит по одной ветке до упора.</p>'],
      ['Почему BFS находит кратчайший путь, а DFS нет?', '<p>BFS достаёт вершины в порядке неубывания расстояния от старта: сначала все на расстоянии 1, потом 2 и так далее. Поэтому когда вершину достали в первый раз, её расстояние уже минимально. DFS такого порядка не даёт: он спускается в первого попавшегося соседа и может прийти к цели окольной дорогой. Важно: это верно для <b>невзвешенного</b> графа. Как только у рёбер появляется вес — нужен Дейкстра или 0-1 BFS.</p>'],
      ['Когда помечать вершину посещённой — при добавлении или при извлечении?', '<p>В BFS — <b>при добавлении в очередь</b>. Иначе одна и та же вершина попадёт в очередь столько раз, сколько у неё соседей, и очередь распухнет. В итеративном DFS обычно помечают <b>при снятии со стека</b>, поэтому в стеке нормально лежат дубли — их отбрасывают на выходе. На странице это видно: у DFS появляются события «ДУБЛЬ».</p>'],
      ['Какая сложность по памяти?', '<p>У обоих O(V) в худшем случае, но ведут себя по-разному. BFS держит целый слой: на сетке это периметр расходящегося круга, на дереве — самый широкий уровень (b^d). DFS держит одну ветку: O(глубины). На широком неглубоком графе дешевле DFS, на глубоком — BFS.</p>'],
      ['Как восстановить сам путь, а не только факт достижимости?', '<p>Хранить массив <code>parent[]</code>: при добавлении соседа записать, из кого мы в него пришли. Дойдя до цели, идти по родителям назад до старта и развернуть список. Это и рисуют на странице жёлтой линией.</p>'],
      ['DFS рекурсией или стеком?', '<p>Рекурсия короче и читается лучше, но на длинных цепочках (сетка миллион клеток, длинный список) стек вызовов переполняется. Явный стек занимает ту же память в куче, а не в стеке потока, и не падает. Порядок обхода у рекурсии и у стека совпадёт, если класть соседей в стек в обратном порядке — на странице так и сделано.</p>'],
      ['Что будет, если забыть про множество посещённых?', '<p>На графе с циклом обход не завершится никогда: вершины будут добавляться друг за другом бесконечно. На дереве (циклов нет) всё отработает, поэтому про эту проверку и забывают на собеседовании.</p>'],
      ['Где на практике встречается BFS?', '<p>Волновой алгоритм поиска пути на тайловой карте, «сколько рукопожатий до этого человека», уровни зависимостей при сборке, поиск ближайшего подходящего объекта, flood fill с равномерным расширением, а также multi-source BFS: кладём в очередь сразу несколько стартов и получаем карту расстояний до ближайшего источника.</p>'],
      ['Где на практике встречается DFS?', '<p>Компоненты связности, поиск циклов, топологическая сортировка (порядок выхода из вершин), мосты и точки сочленения, генерация лабиринтов (именно так сделан лабиринт на этой странице), обход дерева файлов, разбор выражений.</p>'],
      ['Как обойти граф, если у рёбер есть вес?', '<p>BFS перестаёт работать: «одно ребро = один шаг» больше не равно «ближе». Нужен Дейкстра (очередь с приоритетом), для весов 0 и 1 — 0-1 BFS на деке, при наличии эвристики — A*. Идея фронта та же, меняется только правило, кого доставать следующим.</p>'],
      ['Сколько всего раз обрабатывается ребро?', '<p>В неориентированном графе каждое ребро просматривается дважды — по разу с каждого конца, поэтому в оценке O(V + E) множителя нет, он скрыт в константе. В ориентированном — по разу.</p>'],
      ['Как посчитать компоненты связности?', '<p>Внешний цикл по всем вершинам: если вершина ещё не посещена — запускаем от неё обход (любой, BFS или DFS) и увеличиваем счётчик. Сложность остаётся O(V + E), потому что каждая вершина попадает ровно в один обход.</p>']
    ]
  },

  /* ---------------- подвал ---------------- */
  'foot.stop': { en: '■ STOP · END OF TAPE 02', ru: '■ STOP · КОНЕЦ КАССЕТЫ 02' },
  'foot.line': { en: 'End of tape 02.', ru: 'Конец кассеты №2.' }
};
