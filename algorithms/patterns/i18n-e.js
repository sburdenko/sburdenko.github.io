/** Tape 06 chapter: shortest paths — BFS when every step costs 1, Dijkstra when steps have weights. */
export const CH_E = {
  'paths.short': {
    en: 'Fewest steps or the cheapest route: BFS layers, Dijkstra, BFS over states',
    ru: 'Меньше всего шагов или самый дешёвый путь: слои BFS, Дейкстра, BFS по состояниям',
  },
  'paths.h2': { en: 'Closest first — and then it is final', ru: 'Сначала ближайшее — и оно уже окончательно' },
  'paths.essence': {
    en: 'When every step costs 1, BFS reaches cells in order of distance, so the first visit is the shortest. When steps have weights, a priority queue restores that order: Dijkstra always expands the closest unfinished node. Both work on any state, not just on a cell.',
    ru: 'Когда каждый шаг стоит 1, BFS доходит до клеток в порядке расстояния, поэтому первое посещение и есть кратчайшее. Когда у шагов есть веса, порядок возвращает очередь с приоритетом: Дейкстра всегда раскрывает ближайшую из незаконченных вершин. Оба работают на любом состоянии, не только на клетке.',
  },
  'paths.signals': {
    en: '<li>“Shortest”, “minimum time”, “fewest steps” on a grid or a graph</li><li>All steps cost the same — BFS; non-negative weights — Dijkstra</li><li>The distance to the nearest of many sources — put every source into the queue at once</li><li>A resource spent on the way (breaks, keys, fuel) — make it part of the state</li>',
    ru: '<li>«Кратчайший», «минимальное время», «меньше всего шагов» на сетке или графе</li><li>Все шаги стоят одинаково — BFS; веса неотрицательные — Дейкстра</li><li>Расстояние до ближайшего из многих источников — все источники сразу в очередь</li><li>По пути тратится ресурс (ломания, ключи, топливо) — сделай его частью состояния</li>',
  },
  'paths.pitfall': {
    en: '<b>Trap.</b> Dijkstra breaks on negative weights: a node already taken as final could get cheaper later — that is Bellman–Ford territory. And in the lazy version keep the stale check: an entry whose distance is larger than dist[u] must be skipped, or the node is expanded again with an outdated distance.',
    ru: '<b>Ловушка.</b> На отрицательных весах Дейкстра ломается: вершина, которую уже сочли окончательной, может потом подешеветь — это задача для Беллмана–Форда. А в «ленивой» версии не забудь проверку на устаревшую запись: если её расстояние больше dist[u], запись пропускают, иначе вершина раскроется ещё раз со старым расстоянием.',
  },
  'paths.tpl': {
    en: `var dist = new int[n]; Array.Fill(dist, int.MaxValue);
dist[start] = 0;
var pq = new PriorityQueue<int, int>();
pq.Enqueue(start, 0);
while (pq.TryDequeue(out int u, out int d)) {
    if (d > dist[u]) continue;            // stale entry
    foreach (var (v, w) in adj[u])
        if (d + w < dist[v]) {
            dist[v] = d + w;
            pq.Enqueue(v, dist[v]);       // push again instead of decrease-key
        }
}
// every weight is 1? Then a Queue is enough: that is BFS`,
    ru: `var dist = new int[n]; Array.Fill(dist, int.MaxValue);
dist[start] = 0;
var pq = new PriorityQueue<int, int>();
pq.Enqueue(start, 0);
while (pq.TryDequeue(out int u, out int d)) {
    if (d > dist[u]) continue;            // устаревшая запись
    foreach (var (v, w) in adj[u])
        if (d + w < dist[v]) {
            dist[v] = d + w;
            pq.Enqueue(v, dist[v]);       // кладём заново вместо decrease-key
        }
}
// все веса равны 1? Тогда хватит Queue — это BFS`,
  },
  'paths.p': {
    en: [
      { variant: 'BFS from every source at once', task: 'A matrix of 0s and 1s. For every cell return the distance to the nearest 0, moving up, down, left or right.', idea: 'Put all zeros into the queue with distance 0 and mark the ones as unknown. One BFS: the first time the wave reaches a cell is its answer, so set it on enqueue and never touch it again.', why: 'A BFS from every 1 would cost O((R·C)²). Turning it around — from the zeros outwards — makes it one pass, like Rotting Oranges (#994), but the answer is the whole distance map, not one number. Walls and Gates (#286) is the same move.', cx: 'O(R·C) time · O(R·C) memory' },
      { variant: 'Dijkstra with lazy deletion', task: 'A signal is sent from node k over directed edges with travel times. How long until all n nodes receive it? −1 if some never do.', idea: 'Dijkstra from k: always take the node with the smallest distance from the priority queue — it is final. Relaxing an edge pushes a new entry instead of updating the old one; when the old one surfaces, d > dist[u] tells it is stale. The answer is the largest distance.', why: 'Weights end BFS: a path of three cheap edges can beat one expensive edge. .NET’s PriorityQueue has no decrease-key, so lazy deletion is the normal way; the heap holds up to E entries, which is still O(E log E).', cx: 'O(E log E) time · O(V + E) memory' },
      { variant: 'Dijkstra with max instead of +', task: 'A height map. A route’s effort is its largest absolute height difference between neighboring cells. Find the minimum effort from the top-left to the bottom-right corner.', idea: 'Dijkstra over cells where the cost of a path is max(effort so far, |step|). The cell popped from the queue is final; stop as soon as the corner is popped.', why: 'Dijkstra needs only one thing from the cost: it must never decrease along a path. max fits, just like a sum of non-negative weights. Binary search on the effort with a BFS check also works, at an extra log factor. Swim in Rising Water (#778) is the same with heights instead of differences.', cx: 'O(R·C · log(R·C)) time · O(R·C) memory' },
      { variant: 'BFS over (cell, resource) states', task: 'A grid of 0 (empty) and 1 (wall). You may break up to k walls. Return the fewest steps from the top-left to the bottom-right corner, or −1.', idea: 'The state is (r, c, breaks left), and BFS runs over states: stepping onto a wall spends a break. visited is keyed by all three — the same cell with more breaks left is a different, more hopeful state.', why: 'A plain visited[r][c] is the classic bug: the first arrival may have spent its breaks, and a later one with breaks to spare is thrown away. Shortcut: if k ≥ rows + cols − 3, the straight Manhattan path is always possible.', cx: 'O(R·C·k) time · O(R·C·k) memory' },
    ],
    ru: [
      { variant: 'BFS сразу из всех источников', task: 'Матрица из 0 и 1. Для каждой клетки верни расстояние до ближайшего 0, двигаясь вверх, вниз, влево или вправо.', idea: 'Кладём в очередь все нули с расстоянием 0, единицы помечаем как неизвестные. Один BFS: когда волна впервые доходит до клетки, это и есть ответ, поэтому ставим его при добавлении в очередь и больше не трогаем.', why: 'BFS от каждой единицы стоил бы O((R·C)²). Если развернуть его — от нулей наружу, — хватит одного прохода, как в Rotting Oranges (#994), только ответ — вся карта расстояний, а не одно число. Walls and Gates (#286) — тот же приём.', cx: 'O(R·C) время · O(R·C) память' },
      { variant: 'Дейкстра с ленивым удалением', task: 'Сигнал идёт из узла k по ориентированным рёбрам со временем в пути. Через сколько его получат все n узлов? −1, если кто-то не получит никогда.', idea: 'Дейкстра из k: из очереди с приоритетом всегда берём узел с наименьшим расстоянием — оно окончательное. Улучшив ребро, кладём новую запись, а не обновляем старую; когда старая всплывёт, условие d > dist[u] покажет, что она устарела. Ответ — наибольшее расстояние.', why: 'С весами BFS не годится: путь из трёх дешёвых рёбер бывает короче одного дорогого. У PriorityQueue в .NET нет decrease-key, поэтому ленивое удаление — обычный способ; в куче до E записей, и это всё равно O(E log E).', cx: 'O(E log E) время · O(V + E) память' },
      { variant: 'Дейкстра с max вместо +', task: 'Карта высот. Усилие маршрута — самый большой перепад высот между соседними клетками на нём. Найди минимальное усилие от левого верхнего до правого нижнего угла.', idea: 'Дейкстра по клеткам, где цена пути — max(усилие до сих пор, |шаг|). Клетка, вынутая из очереди, окончательна; останавливаемся, как только вынут угол.', why: 'От цены Дейкстре нужно одно: вдоль пути она не должна уменьшаться. max подходит так же, как сумма неотрицательных весов. Можно и бинарным поиском по усилию с проверкой через BFS — ценой лишнего логарифма. Swim in Rising Water (#778) — то же самое, только с высотами вместо перепадов.', cx: 'O(R·C · log(R·C)) время · O(R·C) память' },
      { variant: 'BFS по состояниям (клетка, ресурс)', task: 'Сетка из 0 (пусто) и 1 (стена). Можно сломать не больше k стен. Верни наименьшее число шагов от левого верхнего до правого нижнего угла или −1.', idea: 'Состояние — (r, c, осталось ломаний), и BFS идёт по состояниям: шаг на стену тратит одно ломание. visited хранится по всем трём — та же клетка с бо́льшим запасом ломаний — другое, более перспективное состояние.', why: 'Обычный visited[r][c] — классическая ошибка: первый пришедший мог потратить ломания, а более поздний с запасом будет отброшен. Короткий путь: если k ≥ rows + cols − 3, прямой путь по Манхэттену возможен всегда.', cx: 'O(R·C·k) время · O(R·C·k) память' },
    ],
  },

  /* labels of the shortest paths rig variables */
  'var.distLevel': { en: 'distance', ru: 'расстояние' },
  'var.pqueue': { en: 'priority queue, smallest first', ru: 'очередь с приоритетом, меньшее первым' },
  'var.finalized': { en: 'final', ru: 'окончательны' },
  'var.state': { en: 'state (r,c) · breaks left', ru: 'состояние (r,c) · ломаний осталось' },
};
