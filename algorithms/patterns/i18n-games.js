/** Tape 06 chapter 16: games — paths and space. A*, flow fields, spatial hashing and Union-Find. */
export const CH_GAMES = {
  'games.short': {
    en: 'A*, flow fields, a spatial hash and Union-Find: the grid questions of game interviews',
    ru: 'A*, flow field, пространственный хэш и Union-Find: вопросы про сетку с геймдев-собеседований',
  },
  'games.h2': { en: 'Do not look at the whole map', ru: 'Не смотри на всю карту' },
  'games.essence': {
    en: 'Game code asks the same few questions every frame: how do I get there, where should all of them go, who is near me, are these two areas connected. Each has a trick that avoids touching the whole map. A* aims Dijkstra at the goal with an estimate of the rest. A flow field runs one search from the goal and shares it among every unit. A spatial grid buckets objects by cell, so “who is within r” reads 9 cells instead of n objects. Union-Find keeps connected sets and merges them in almost O(1).',
    ru: 'Игровой код каждый кадр задаёт одни и те же вопросы: как туда дойти, куда идти всем сразу, кто рядом со мной, связаны ли эти две области. На каждый есть приём, который не трогает всю карту. A* нацеливает Дейкстру на цель оценкой оставшегося пути. Flow field делает один поиск от цели и делит его между всеми юнитами. Пространственная сетка раскладывает объекты по клеткам, и вопрос «кто в радиусе r» читает 9 клеток, а не n объектов. Union-Find хранит связные множества и сливает их почти за O(1).',
  },
  'games.signals': {
    en: '<li>“A path from A to B” on a grid or a navigation graph, as fast as possible — A* with a heuristic that matches the moves</li><li>“Thousands of units to one goal” (RTS, tower defence) — a flow field: one Dijkstra from the goal</li><li>“Who is within radius r”, collision broadphase, all pairs O(n²) — a uniform grid or a spatial hash</li><li>“Are they connected?” while edges arrive: rooms of a dungeon, Kruskal — Union-Find</li><li>“Minimise the worst step” or “the highest point on the route” — Dijkstra with max, binary search, or Union-Find in order of height</li>',
    ru: '<li>«Путь из A в B» по сетке или навигационному графу, как можно быстрее — A* с эвристикой под правила ходов</li><li>«Тысячи юнитов к одной цели» (RTS, tower defence) — flow field: один Дейкстра от цели</li><li>«Кто в радиусе r», broadphase столкновений, все пары за O(n²) — равномерная сетка или пространственный хэш</li><li>«Связаны ли они?», пока приходят рёбра: комнаты подземелья, Крускал — Union-Find</li><li>«Минимизировать худший шаг» или «самую высокую точку маршрута» — Дейкстра с max, бинарный поиск или Union-Find по возрастанию высоты</li>',
  },
  'games.pitfall': {
    en: '<b>Trap.</b> A* is only exact while h never overestimates the real rest of the path. Manhattan on 8 directions, or octile when a diagonal costs 1 like a straight step, overestimates: the search gets faster and returns a longer path. The heuristic must also be in the units of the move costs: with costs 10 and 14 (≈ 10·√2) the octile estimate is 10·max + 4·min, not max + 0.41·min.',
    ru: '<b>Ловушка.</b> A* точен, только пока h не переоценивает настоящий остаток пути. Манхэттен на 8 направлениях или октиль, когда диагональ стоит 1, как прямой шаг, переоценивают: поиск ускоряется и возвращает путь длиннее. И эвристика должна быть в тех же единицах, что цены ходов: при ценах 10 и 14 (≈ 10·√2) октиль — это 10·max + 4·min, а не max + 0,41·min.',
  },
  'games.tpl': {
    en: `// A*: Dijkstra ordered by f = g + h, h never overestimates
search++;                                   // marks of older searches are stale
g[start] = 0; opened[start] = search;
open.Push(start, h(start));
while (open.TryPop(out int u)) {
    if (closed[u] == search) continue;      // stale entry
    closed[u] = search;
    if (u == goal) return g[u];
    foreach (var (v, cost) in Neighbours(u)) {
        int cand = g[u] + cost;
        if (closed[v] == search) continue;
        if (opened[v] == search && cand >= g[v]) continue;
        g[v] = cand; opened[v] = search; from[v] = u;
        open.Push(v, cand + h(v));          // ties: the smaller h first
    }
}
// Union-Find
int Find(int x) => parent[x] == x ? x : parent[x] = Find(parent[x]);`,
    ru: `// A*: Дейкстра по f = g + h, h не переоценивает
search++;                                   // отметки прошлых поисков устарели
g[start] = 0; opened[start] = search;
open.Push(start, h(start));
while (open.TryPop(out int u)) {
    if (closed[u] == search) continue;      // устаревшая запись
    closed[u] = search;
    if (u == goal) return g[u];
    foreach (var (v, cost) in Neighbours(u)) {
        int cand = g[u] + cost;
        if (closed[v] == search) continue;
        if (opened[v] == search && cand >= g[v]) continue;
        g[v] = cand; opened[v] = search; from[v] = u;
        open.Push(v, cand + h(v));          // при равенстве — меньшее h
    }
}
// Union-Find
int Find(int x) => parent[x] == x ? x : parent[x] = Find(parent[x]);`,
  },
  'games.p': {
    en: [
      {
        variant: 'A*: Dijkstra with an aim',
        task: 'An n × n grid of 0 (open) and 1 (blocked). Return the length, in cells, of the shortest clear path from the top-left to the bottom-right cell moving in 8 directions, or −1. In the rig the field h switches the heuristic: chebyshev, octile, manhattan or zero.',
        idea: 'Dijkstra takes the cell with the smallest g, the distance from the start. A* takes the smallest f = g + h, where h estimates the rest of the way. With 8 directions and a diagonal that costs 1, the exact rest on an empty map is Chebyshev, max(dr, dc): it never overestimates, so the first time the goal leaves the heap its g is final. Ties on f go to the smaller h — the cell nearer the goal — and the search runs straight at it.',
        why: 'h = 0 is Dijkstra (here simply BFS): the same answer, many more expanded cells — compare the counter. Manhattan, or octile while a diagonal costs 1, overestimates: fewer cells, but the path can come out longer. In a game a NavMesh (Unity AI Navigation, NavMeshAgent) covers big open 3D worlds with a few polygons; a grid suits tile maps, RTS and obstacles that change. Keep nodes as structs in one array indexed by cell (g, parent, marks) instead of class Node: no garbage, and neighbours sit close in memory. Make the closed set an int array of search numbers, closed[cell] == search, so the next search only does search++ instead of clearing it. Many agents: run the searches in an IJobParallelFor compiled by Burst, over NativeArray grids and heaps, with one scratch buffer per worker thread. Unity’s .NET has no PriorityQueue (.NET 6+) — bring a binary heap.',
        cx: 'O(E log V) in the worst case, like Dijkstra, V = n², E ≤ 8V; with a good h far less · O(V) memory',
      },
      {
        variant: 'Flow field: one search for every unit',
        task: 'The frame is 01 Matrix (#542): the distance from every cell to the nearest target. A flow field adds a cost per cell — 0 is a wall, 1–9 is what crossing the cell costs — and turns distances into arrows: for every cell, where should a unit standing there step to reach the nearest goal most cheaply?',
        idea: 'Three fields. The cost field is the map as given. The integration field is Dijkstra from all goals at once (like the multi-source BFS of 01 Matrix): integration = the cost of the cell + the smallest integration of a neighbour. The direction field points every cell at its neighbour with the smallest integration. A unit only reads the arrow under its feet, every frame.',
        why: 'A* per unit is one search per unit; a thousand units heading for one base share a single Dijkstra over the map, and then pay O(1) each — the price is O(cells) memory per goal. With every cost 1 this is exactly the BFS of 01 Matrix. The cost sits on the cell, so the first time a cell is reached is already its cheapest: no stale entries, no decrease-key, and with small integer costs a bucket queue replaces the heap. Recompute only when the map or the goal changes, and only the chunks that changed: big maps are split into sectors joined by portals (hierarchical flow fields). In Unity the three fields are NativeArrays, the build is an IJob with Burst, and steering is an IJobParallelFor over the units. Real games also use 8 directions without cutting corners, and smooth the motion: the arrow only says where to go.',
        cx: 'O(C log C) to build, C = cells (O(C) with a bucket queue) · O(1) per unit per step · O(C) memory',
      },
      {
        variant: 'Spatial hash: 3 × 3 cells, not everything',
        task: 'Points on a plane and queries (x, y, r). For each query count the points inside the circle, the border included. Brute force checks every point for every query; here the points are put into cells first. In the rig every r must fit into the cell size.',
        idea: 'Cut the plane into square cells of side s ≥ r and put every point into the bucket of its cell, with the key (⌊x / s⌋, ⌊y / s⌋). A point within r of the query lies in the query’s own cell or in one of the 8 around it, so a query reads 9 buckets and checks dx² + dy² ≤ r² only for the points found there.',
        why: 'Brute force is n·q distance checks, and “every enemy looks for enemies within its radius” is n² pairs; the grid makes it about n·k, k = the points in 9 cells. The cell size is the knob: smaller than r, and the circle spans more cells; much bigger, and each bucket holds more points — try it with the cell field. A sparse or endless world keys a hash by (cx, cy) instead of keeping a dense array. K Closest Points (#973) on the same grid searches rings of cells outward from the query. In Unity, Physics.OverlapSphereNonAlloc already runs a broadphase for colliders; thousands of agents without colliders use NativeParallelMultiHashMap<int, int> (cell hash → agent), filled by a parallel job — the standard DOTS move. Quadtrees and BVHs win when object sizes differ a lot.',
        cx: 'O(n + q · k) time, k = points in the 9 cells · O(n) memory',
      },
      {
        variant: 'Union-Find: path compression, union by rank',
        task: 'A tree on the nodes 1..n got one extra edge. Return an edge that can be removed so the graph is a tree again; if several fit, the one that comes last in the input.',
        idea: 'Keep a forest: parent[v] points up, a root is its own parent, and each tree is one connected set. For every edge find both roots. Different roots — union: hang the root of the lower tree under the root of the higher one. The same root — the ends are already connected, so this edge closes the cycle: return it. find hangs every node it walks past straight onto the root (path compression).',
        why: 'With both tricks a find costs α(n) amortised — at most 4 for any n that fits in memory; without them a chain of unions makes every find O(n). Unlike BFS, Union-Find answers “connected?” online, while edges keep arriving, and never walks the graph again. Number of Provinces (#547) counts the roots that are left. Kruskal’s minimum spanning tree (Min Cost to Connect All Points, #1584) takes edges by weight and skips those whose ends already share a root. In games: corridors between the rooms of a procedural dungeon, regions of a destructible map, which islands are linked. Two int arrays — no node objects, no allocations.',
        cx: 'O(n · α(n)) time · O(n) memory',
      },
      {
        variant: 'Union-Find as the water rises',
        task: 'An n × n grid of distinct heights 0..n² − 1. At time t the water stands at height t everywhere, and you can swim between neighbouring cells whose heights are both ≤ t. Return the smallest t at which you can get from the top-left to the bottom-right corner.',
        idea: 'Let the water rise one level at a time. At time t the cell of height t gets wet — heights are all different, so it is exactly one cell, known up front. Union it with every wet neighbour. The answer is the first t at which both corners share a root.',
        why: 'This problem has three solutions, and an interviewer likes to hear all three. Dijkstra where a path costs its highest cell — max instead of +, as in Path With Minimum Effort (#1631): O(n² log n). Binary search on t with a BFS over the cells ≤ t: O(n² log n). And this one, Union-Find in order of height: O(n² · α(n)) here, because the heights 0..n² − 1 give the order for free; arbitrary heights need a sort first. In games the same move answers “at what water level do these two areas join” — flooding, erosion, which islands a rising tide cuts off.',
        cx: 'O(n² · α(n)) time (plus O(n² log n) for sorting arbitrary heights) · O(n²) memory',
      },
    ],
    ru: [
      {
        variant: 'A*: Дейкстра с прицелом',
        task: 'Сетка n × n из 0 (свободно) и 1 (занято). Верни длину кратчайшего свободного пути в клетках от левой верхней до правой нижней клетки, если ходить в 8 направлениях, или −1. На стенде поле h переключает эвристику: chebyshev, octile, manhattan или zero.',
        idea: 'Дейкстра берёт клетку с наименьшим g — расстоянием от старта. A* берёт наименьшее f = g + h, где h — оценка оставшегося пути. При 8 направлениях и диагонали за 1 точный остаток на пустой карте — расстояние Чебышёва, max(dr, dc): оно никогда не переоценивает, поэтому когда цель впервые выходит из кучи, её g окончательно. При равных f первой идёт клетка с меньшим h — та, что ближе к цели, и поиск бежит прямо к ней.',
        why: 'h = 0 — это Дейкстра (здесь просто BFS): ответ тот же, раскрытых клеток намного больше — сравни счётчик. Манхэттен или октиль при диагонали за 1 переоценивают: клеток меньше, но путь может выйти длиннее. В игре NavMesh (Unity AI Navigation, NavMeshAgent) покрывает большие открытые 3D-миры парой полигонов, а сетка подходит тайловым картам, RTS и меняющимся препятствиям. Узлы храни структурами в одном массиве по индексу клетки (g, родитель, отметки), а не class Node: нет мусора, и соседи лежат в памяти рядом. Закрытое множество — массив int с номерами поиска, closed[cell] == search: следующему поиску хватит search++, ничего не чистим. Много агентов — поиски в IJobParallelFor, собранном Burst, над сетками и кучами в NativeArray, по рабочему буферу на поток. В .NET у Unity нет PriorityQueue (он с .NET 6) — нужна своя двоичная куча.',
        cx: 'O(E log V) в худшем случае, как у Дейкстры, V = n², E ≤ 8V; с хорошей h гораздо меньше · O(V) память',
      },
      {
        variant: 'Flow field: один поиск на всех юнитов',
        task: 'Основа — 01 Matrix (#542): расстояние от каждой клетки до ближайшей цели. Flow field добавляет цену клетки — 0 стена, 1–9 сколько стоит её пересечь — и превращает расстояния в стрелки: куда шагнуть юниту из каждой клетки, чтобы дешевле всего дойти до ближайшей цели?',
        idea: 'Три поля. Поле стоимости — карта как есть. Поле интеграции — Дейкстра сразу от всех целей (как BFS из многих источников в 01 Matrix): интеграция = цена клетки + наименьшая интеграция соседа. Поле направлений: каждая клетка указывает на соседа с наименьшей интеграцией. Юнит каждый кадр просто читает стрелку под ногами.',
        why: 'A* на каждого юнита — по поиску на юнита; тысяча юнитов, идущих к одной базе, делят один Дейкстру по карте и потом платят по O(1) — ценой O(клеток) памяти на каждую цель. Если все цены 1, это ровно BFS из 01 Matrix. Цена стоит на клетке, поэтому первое касание клетки уже самое дешёвое: нет устаревших записей и decrease-key, а при маленьких целых ценах кучу заменяет очередь по корзинам. Пересчитывай только когда меняется карта или цель, и только изменившиеся куски: большие карты делят на секторы с порталами (иерархический flow field). В Unity три поля — NativeArray, построение — IJob с Burst, управление юнитами — IJobParallelFor. В настоящих играх берут ещё 8 направлений без срезания углов и сглаживают движение: стрелка лишь говорит, куда идти.',
        cx: 'O(C log C) на построение, C — число клеток (O(C) с очередью по корзинам) · O(1) на юнита за шаг · O(C) память',
      },
      {
        variant: 'Пространственный хэш: 3 × 3 клетки, а не всё',
        task: 'Точки на плоскости и запросы (x, y, r). Для каждого запроса посчитай точки внутри окружности, границу тоже. Перебор проверяет каждую точку для каждого запроса; здесь точки сначала раскладывают по клеткам. На стенде каждый r должен помещаться в размер клетки.',
        idea: 'Режем плоскость на квадратные клетки со стороной s ≥ r и кладём каждую точку в корзину её клетки с ключом (⌊x / s⌋, ⌊y / s⌋). Точка ближе r к запросу лежит в клетке самого запроса или в одной из 8 соседних, поэтому запрос читает 9 корзин и проверяет dx² + dy² ≤ r² только у найденных там точек.',
        why: 'Перебор — это n·q проверок расстояния, а «каждый враг ищет врагов в своём радиусе» — n² пар; сетка превращает это примерно в n·k, где k — точки в 9 клетках. Размер клетки — главная ручка: меньше r — окружность задевает больше клеток, намного больше — в каждой корзине больше точек; попробуй на поле cell. В разреженном или бесконечном мире вместо плотного массива берут хэш по (cx, cy). K Closest Points (#973) на той же сетке ищет кольцами клеток от запроса наружу. В Unity Physics.OverlapSphereNonAlloc уже делает broadphase для коллайдеров; для тысяч агентов без коллайдеров берут NativeParallelMultiHashMap<int, int> (хэш клетки → агент), заполненный параллельной задачей, — стандартный приём DOTS. Квадродеревья и BVH выигрывают, когда размеры объектов сильно разные.',
        cx: 'O(n + q · k) время, k — точки в 9 клетках · O(n) память',
      },
      {
        variant: 'Union-Find: сжатие путей и объединение по рангу',
        task: 'К дереву на узлах 1..n добавили одно лишнее ребро. Верни ребро, без которого граф снова станет деревом; если подходит несколько — то, что стоит во входе последним.',
        idea: 'Храним лес: parent[v] указывает вверх, корень — сам себе родитель, каждое дерево — одно связное множество. Для каждого ребра находим оба корня. Корни разные — объединяем: корень низкого дерева подвешиваем под корень высокого. Корень общий — концы уже связаны, это ребро замыкает цикл: его и возвращаем. find по дороге подвешивает каждый пройденный узел прямо к корню (сжатие путей).',
        why: 'С обоими приёмами find стоит α(n) в среднем по серии операций — не больше 4 для любого n, которое влезет в память; без них цепочка объединений делает каждый find O(n). В отличие от BFS, Union-Find отвечает «связаны ли?» онлайн, пока рёбра ещё приходят, и не обходит граф заново. Number of Provinces (#547) считает оставшиеся корни. Минимальный остов Крускала (Min Cost to Connect All Points, #1584) берёт рёбра по весу и пропускает те, у которых концы уже под общим корнем. В играх — коридоры между комнатами процедурного подземелья, области разрушаемой карты, какие острова связаны. Два массива int: ни объектов-узлов, ни аллокаций.',
        cx: 'O(n · α(n)) время · O(n) память',
      },
      {
        variant: 'Union-Find по мере подъёма воды',
        task: 'Сетка n × n из разных высот 0..n² − 1. В момент t вода везде стоит на высоте t, и плыть можно между соседними клетками, если обе не выше t. Верни наименьшее t, при котором можно добраться из левого верхнего угла в правый нижний.',
        idea: 'Поднимаем воду по одному уровню. В момент t намокает клетка высоты t — высоты все разные, так что это ровно одна клетка, и она известна заранее. Объединяем её со всеми мокрыми соседями. Ответ — первое t, при котором у обоих углов общий корень.',
        why: 'У задачи три решения, и интервьюеру приятно услышать все три. Дейкстра, где путь стоит своей самой высокой клетки, — max вместо +, как в Path With Minimum Effort (#1631): O(n² log n). Бинарный поиск по t с BFS по клеткам ≤ t: O(n² log n). И это — Union-Find по возрастанию высоты: здесь O(n² · α(n)), потому что высоты 0..n² − 1 дают порядок даром; произвольные высоты сначала нужно отсортировать. В играх тот же приём отвечает на вопрос «на каком уровне воды эти две области соединятся» — затопление, эрозия, какие острова отрежет прилив.',
        cx: 'O(n² · α(n)) время (плюс O(n² log n) на сортировку произвольных высот) · O(n²) память',
      },
    ],
  },

  /* labels of the chapter 16 rig variables */
  'var.heuristic': { en: 'h', ru: 'h' },
  'var.openHeap': { en: 'open set: heap f:(r,c), smallest first', ru: 'открытое множество: куча f:(r,c), меньшее первым' },
  'var.expanded': { en: 'cells expanded', ru: 'раскрыто клеток' },
  'var.costField': { en: 'walls / dearest cell', ru: 'стен / самая дорогая клетка' },
  'var.arrows': { en: 'arrows', ru: 'стрелок' },
  'var.agentPath': { en: 'steps on the dearest way', ru: 'шагов на самом дорогом пути' },
  'var.sgChecks': { en: 'distance checks / brute force n·q', ru: 'проверок расстояния / перебор n·q' },
  'var.bucket': { en: 'bucket of the cell (i:(x,y))', ru: 'корзина клетки (i:(x,y))' },
  'var.sgAnswers': { en: 'circles → points inside', ru: 'окружности → точек внутри' },
  'var.edges': { en: 'edges', ru: 'рёбра' },
  'var.sets': { en: 'sets', ru: 'множеств' },
  'var.waterLevel': { en: 'water level t', ru: 'уровень воды t' },
  'var.pools': { en: 'pools', ru: 'водоёмов' },

  /* input errors of the chapter 16 rigs */
  'in.err.choice': {
    en: options => `Pick one of: ${options}.`,
    ru: options => `Выбери одно из: ${options}.`,
  },
  'in.err.goalPairs': {
    en: () => 'Every goal is a pair r c, e.g. 2 6 | 0 0.',
    ru: () => 'Каждая цель — пара r c, например 2 6 | 0 0.',
  },
  'in.err.goalCell': {
    en: (r, c, maxR, maxC) => `Goal (${r}, ${c}) must be inside the map (r 0–${maxR}, c 0–${maxC}) and not on a wall (0).`,
    ru: (r, c, maxR, maxC) => `Цель (${r}, ${c}) должна быть внутри карты (r 0–${maxR}, c 0–${maxC}) и не на стене (0).`,
  },
  'in.err.points': {
    en: () => 'Every point is a pair x y, e.g. 1 3 | 5 2.',
    ru: () => 'Каждая точка — пара x y, например 1 3 | 5 2.',
  },
  'in.err.circles': {
    en: () => 'Every query is x y r, e.g. 2 3 1 | 6 5 3.',
    ru: () => 'Каждый запрос — x y r, например 2 3 1 | 6 5 3.',
  },
  'in.err.radiusMin': {
    en: () => 'A radius must be at least 1.',
    ru: () => 'Радиус — не меньше 1.',
  },
  'in.err.radius': {
    en: (r, cell) => `A radius of ${r} does not fit into cells of ${cell}: make cell ≥ ${r}, then 3 × 3 cells always cover the circle.`,
    ru: (r, cell) => `Радиус ${r} не помещается в клетки размера ${cell}: сделай cell ≥ ${r}, тогда 3 × 3 клетки всегда накрывают окружность.`,
  },
  'in.err.ufPairs': {
    en: () => 'Every edge is a pair a b, e.g. 1 2 | 1 3 | 2 3.',
    ru: () => 'Каждое ребро — пара a b, например 1 2 | 1 3 | 2 3.',
  },
  'in.err.ufNodes': {
    en: n => `With ${n} edges the nodes are 1–${n}.`,
    ru: n => `Если рёбер ${n}, узлы — от 1 до ${n}.`,
  },
  'in.err.ufEdge': {
    en: () => 'An edge joins two different nodes, and no edge may repeat.',
    ru: () => 'Ребро соединяет два разных узла, и рёбра не повторяются.',
  },
  'in.err.ufTree': {
    en: n => `The graph must be connected: a tree on 1–${n} plus one extra edge.`,
    ru: n => `Граф должен быть связным: дерево на узлах 1–${n} и одно лишнее ребро.`,
  },
  'in.err.perm': {
    en: max => `The heights must be 0–${max}, each exactly once.`,
    ru: max => `Высоты — от 0 до ${max}, каждая ровно один раз.`,
  },
};
