/**
 * Texts for the problems in problems-bg.js. P_BG[chapter] = { en: [...], ru: [...] } in the order of
 * PROBLEMS_BG[chapter]; i18n.js appends them to `${chapter}.p`. CH_BG holds the rig labels and input errors.
 */
export const P_BG = {
  bits: {
    en: [
      { variant: 'Shift out, shift in — or swap blocks with masks', task: 'Reverse the bits of a 32-bit unsigned integer: bit 0 becomes bit 31, bit 1 becomes bit 30, and so on. In the rig the field mode switches between the loop (loop) and the five mask swaps (masks).', idea: 'Two registers. Every round takes the low bit of n with n & 1, pushes it into r from the right with r = (r << 1) | bit, and drops it from n with n >>= 1. The bit taken first has been pushed up 31 more times by the end, so it lands at bit 31. The loop must run all 32 rounds: once n is 0 the zeros still have to push the earlier bits of r up to their places.', why: 'The mask version is the classic follow-up for “called many times”: swap the two 16-bit halves, then the bytes inside each half (masks 0xFF00FF00 / 0x00FF00FF), the nibbles, the pairs and finally the neighboring bits — log₂ 32 = 5 steps without branches, and each step reverses the order on its own scale. A lookup table of 256 reversed bytes is the other way: four lookups and shifts. In C# use uint: >> on an int is arithmetic and drags the sign bit in. Where it shows up: the bit-reversal permutation of an FFT, Morton codes and some hash mixers.', cx: 'O(32) = O(1) for the loop, 5 steps with masks · O(1) memory' },
    ],
    ru: [
      { variant: 'Сдвинуть из одного, вдвинуть в другой — или поменять блоки масками', task: 'Разверни биты 32-битного беззнакового числа: бит 0 становится битом 31, бит 1 — битом 30 и так далее. На стенде поле mode переключает цикл (loop) и пять обменов по маскам (masks).', idea: 'Два регистра. Каждый раунд берёт младший бит n через n & 1, вдвигает его в r справа — r = (r << 1) | bit — и выбрасывает из n сдвигом n >>= 1. Бит, взятый первым, к концу сдвинется ещё 31 раз и окажется в бите 31. Цикл обязан сделать все 32 раунда: когда n уже 0, нули всё равно должны дотолкать ранние биты r до их мест.', why: 'Версия с масками — классическое продолжение на «функцию вызывают много раз»: поменять местами две половины по 16 бит, затем байты внутри половин (маски 0xFF00FF00 / 0x00FF00FF), тетрады, пары и, наконец, соседние биты — log₂ 32 = 5 шагов без ветвлений, и каждый шаг разворачивает порядок в своём масштабе. Другой путь — таблица из 256 развёрнутых байтов: четыре обращения и сдвиги. В C# бери uint: >> у int арифметический и тащит знаковый бит. Где встречается: перестановка с обращением битов в БПФ, коды Мортона и некоторые перемешивающие функции хешей.', cx: 'O(32) = O(1) для цикла, 5 шагов с масками · O(1) память' },
    ],
  },
  binary: {
    en: [
      { variant: 'The quotient bit by bit, from the top', task: 'Divide two 32-bit integers without *, / and %, truncating toward zero. If the result does not fit into an int, return int.MaxValue — that happens only for int.MinValue / −1.', idea: 'First the special case int.MinValue / −1 = 2^31, which overflows. Then the sign: the result is negative when exactly one operand is, and the rest works on |a| and |b| in long, because |int.MinValue| = 2^31 does not fit an int. Now school long division in base 2: for k from 31 down to 0, if (a >> k) ≥ b, then b · 2^k still fits into what is left of a — subtract it and set bit k of the quotient.', why: 'It is binary search on the answer, one bit per step: deciding bit k from the top halves the range of possible quotients, and the check (a >> k) ≥ b is the monotonic “yes / no” of this chapter. Why a >> k ≥ b and not a ≥ b << k: the shifted divisor can overflow, the shifted dividend never grows. Subtracting b again and again is O(a / b) — two billion rounds for int.MinValue / 1; doubling b until it passes a is the same idea, O(log² n) if you restart it. A strict “32-bit only” version keeps both numbers negative instead of using long: the negative range is one larger. In Unity code there is no reason to avoid / — this is an interview question about shifts, overflow and the edges of int.', cx: 'O(32) = O(1) time · O(1) memory' },
    ],
    ru: [
      { variant: 'Частное по битам, сверху вниз', task: 'Раздели два 32-битных целых без *, / и %, с отбрасыванием дробной части к нулю. Если результат не влезает в int, верни int.MaxValue — такое бывает только у int.MinValue / −1.', idea: 'Сначала особый случай int.MinValue / −1 = 2^31 — переполнение. Потом знак: результат отрицательный, когда отрицателен ровно один из операндов, а дальше работаем с |a| и |b| в long, потому что |int.MinValue| = 2^31 в int не помещается. Теперь деление столбиком, но в двоичной системе: для k от 31 до 0, если (a >> k) ≥ b, то b · 2^k ещё помещается в остаток a — вычитаем его и ставим бит k частного.', why: 'Это бинарный поиск по ответу, по биту за шаг: решая бит k сверху, мы вдвое сужаем диапазон возможных частных, а проверка (a >> k) ≥ b — монотонное «да / нет» из этой главы. Почему a >> k ≥ b, а не a ≥ b << k: сдвинутый делитель может переполниться, а сдвинутое делимое только уменьшается. Вычитать b раз за разом — это O(a / b), два миллиарда раундов для int.MinValue / 1; удваивать b, пока не перерастёт a, — та же идея, O(log² n), если начинать заново. Строгая версия «только 32 бита» держит оба числа отрицательными вместо long: отрицательный диапазон на единицу больше. В коде Unity избегать / незачем — это вопрос с собеседования про сдвиги, переполнение и края int.', cx: 'O(32) = O(1) время · O(1) память' },
    ],
  },
  heap: {
    en: [
      { variant: 'Max-heap of size k: the farthest leaves', task: 'Points on a plane and k. Return the k points closest to the origin (0, 0), in any order.', idea: 'Compare d = x² + y² — the square root keeps the order, so it is not needed. Keep a max-heap of at most k points with the farthest on top. A new point goes to the bottom and rises while its parent is nearer. When the heap holds k + 1 points, the root — the farthest of them — leaves. What stays are the k nearest seen so far.', why: 'The mirror of Kth Largest: there a min-heap drops the smallest to keep the largest, here a max-heap drops the farthest to keep the nearest. Shortcut: once the heap is full, a point with d ≥ the root can be skipped without pushing. O(n log k) and O(k) memory beat sorting all n points when the points arrive as a stream. Quickselect gives O(n) on average if you can reorder the array. In C# 9 for Unity there is no PriorityQueue (it is .NET 6+), so the heap here is an int array of indices; Unity enemies near the player use the same move with sqrMagnitude instead of magnitude. Many queries on the same points: a spatial grid or a k-d tree (chapter 16).', cx: 'O(n log k) time · O(k) memory' },
    ],
    ru: [
      { variant: 'Max-heap размера k: уходит самая дальняя', task: 'Точки на плоскости и k. Верни k точек, ближайших к началу координат (0, 0), в любом порядке.', idea: 'Сравниваем d = x² + y² — корень порядок не меняет, он не нужен. Держим max-heap не больше чем из k точек, сверху самая дальняя. Новая точка ставится вниз и поднимается, пока её родитель ближе. Когда в куче k + 1 точка, корень — самая дальняя из них — уходит. Остаются k ближайших из уже просмотренных.', why: 'Зеркало Kth Largest: там min-heap выкидывает наименьшее, чтобы остались наибольшие, здесь max-heap выкидывает самую дальнюю, чтобы остались ближайшие. Сокращение: когда куча полна, точку с d ≥ корня можно пропустить, не кладя в кучу. O(n log k) и O(k) памяти выигрывают у сортировки всех n точек, когда точки приходят потоком. Quickselect даёт O(n) в среднем, если массив можно переставлять. В C# 9 для Unity нет PriorityQueue (он с .NET 6), поэтому куча здесь — массив индексов int; враги рядом с игроком в Unity ищутся тем же приёмом, с sqrMagnitude вместо magnitude. Много запросов к одним и тем же точкам — пространственная сетка или k-d дерево (глава 16).', cx: 'O(n log k) время · O(k) память' },
    ],
  },
  graph: {
    en: [
      { variant: 'BFS with a dictionary old → new', task: 'A reference to a node of a connected undirected graph; every node has a value and a list of neighbors. Return a deep copy: new nodes with the same values and the same links. In the rig the graph is a list of edges a b, nodes 1..n, the start is node 1.', idea: 'The dictionary old → new is both the visited set and the way to find a copy by its original. Copy the start node and put it into the queue. Take a node from the queue and walk its neighbors: a neighbor without a copy gets one and joins the queue; a neighbor that already has a copy only gets the reference — copies[cur].neighbors.Add(copy). Every edge is seen twice, once from each end, and each time one reference is added.', why: 'Without the dictionary a cycle copies forever and a shared neighbor is copied twice — the copy would be a tree, not the same graph. Create the copy when the node is first met, not when it is dequeued: by then other nodes may have needed it. DFS with recursion works the same, the dictionary is checked before the call. In Unity this is Instantiate of a prefab with internal references: Unity remaps the references inside the copied hierarchy to the new objects — the same old → new table; your own deep copy of a save graph or of a ScriptableObject network has to keep that table itself.', cx: 'O(V + E) time · O(V) memory' },
    ],
    ru: [
      { variant: 'BFS со словарём «старый → новый»', task: 'Ссылка на узел связного неориентированного графа; у каждого узла есть значение и список соседей. Верни глубокую копию: новые узлы с теми же значениями и теми же связями. На стенде граф задаётся списком рёбер a b, узлы 1..n, начало — узел 1.', idea: 'Словарь «старый → новый» — это и множество посещённых, и способ найти копию по оригиналу. Копируем стартовый узел и ставим его в очередь. Берём узел из очереди и идём по его соседям: соседу без копии создаём её и ставим его в очередь; соседу, у которого копия уже есть, — только ссылка: copies[cur].neighbors.Add(copy). Каждое ребро видно дважды, с обоих концов, и каждый раз добавляется одна ссылка.', why: 'Без словаря цикл копируется бесконечно, а общий сосед копируется дважды — копия получится деревом, а не тем же графом. Копию создавай при первой встрече, а не при выходе из очереди: к тому моменту она уже может понадобиться другим. DFS с рекурсией работает так же, словарь проверяется до вызова. В Unity это Instantiate префаба с внутренними ссылками: Unity переназначает ссылки внутри скопированной иерархии на новые объекты — та же таблица «старый → новый»; своя глубокая копия графа сохранения или сети ScriptableObject должна держать такую таблицу сама.', cx: 'O(V + E) время · O(V) память' },
    ],
  },
  games: {
    en: [
      { variant: 'Kruskal: sorted edges and Union-Find', task: 'Points on a plane; connecting two points costs the Manhattan distance |x₁ − x₂| + |y₁ − y₂|. Return the minimum total cost that connects all points.', idea: 'Every pair of points is an edge. Sort the edges by weight and go from the cheapest: if Union joins two different components, the edge goes into the tree and its weight into the sum; if both ends are already in one component, the edge would close a cycle — skip it. After n − 1 taken edges every point is connected, and the loop can stop.', why: 'Why the cheapest edge between two components is always safe: any tree has to cross that cut somewhere, and swapping that crossing for the cheaper edge never costs more (the cut property). Here the graph is complete, n² / 2 edges, so Prim with an array — O(n²), no heap and no sort — is the better fit; Kruskal wins on sparse graphs and when the edges are already sorted. Union-Find is the one from Redundant Connection above. In games: corridors between the rooms of a procedural dungeon (a minimum spanning tree plus a few extra edges back for loops), roads between towns, cables and pipes in a builder.', cx: 'O(n² log n) time for n² / 2 edges · O(n²) memory' },
      { variant: 'Two searches backwards from the oceans', task: 'A height map m × n. The Pacific touches the top and the left edge, the Atlantic the bottom and the right edge. Rain flows to a neighbor that is not higher. Return the cells from which water reaches both oceans.', idea: 'A search from every cell is O((mn)²). Turn the flow around: start a BFS from all border cells of one ocean at once and step only uphill — to a neighbor that is at least as high. A cell is reached exactly when water from it can run down to that ocean. Do the same for the other ocean; the answer is where both maps are marked.', why: 'The same move as a flow field (above) and as 01 Matrix: one multi-source search from the targets instead of one search per start. The condition flips with the direction: water goes down from (y, x) to (r, c) when h[y][x] ≥ h[r][c], so the backwards search climbs. Equal heights pass both ways — a flat lake drains wherever its edge does. DFS works too, but on a 1000 × 1000 map the recursion is a million calls deep: in Unity the queue is safer. In games: which tiles drain to which river or sea, flood sources, erosion and watersheds on a generated terrain.', cx: 'O(m · n) time · O(m · n) memory' },
    ],
    ru: [
      { variant: 'Крускал: рёбра по весу и Union-Find', task: 'Точки на плоскости; соединить две точки стоит манхэттенского расстояния |x₁ − x₂| + |y₁ − y₂|. Верни наименьшую общую стоимость, при которой связаны все точки.', idea: 'Каждая пара точек — ребро. Сортируем рёбра по весу и идём от самого дешёвого: если Union соединяет две разные компоненты, ребро идёт в дерево, а его вес — в сумму; если оба конца уже в одной компоненте, ребро замкнуло бы цикл — пропускаем. После n − 1 взятого ребра все точки связаны, и цикл можно остановить.', why: 'Почему самое дешёвое ребро между двумя компонентами всегда безопасно: любое дерево где-то пересекает этот разрез, и замена того пересечения на более дешёвое ребро не делает дороже (свойство разреза). Здесь граф полный, n² / 2 рёбер, поэтому лучше подходит Прим на массиве — O(n²), без кучи и сортировки; Крускал выигрывает на разреженных графах и когда рёбра уже отсортированы. Union-Find тот же, что в Redundant Connection выше. В играх: коридоры между комнатами процедурного подземелья (минимальный остов плюс несколько рёбер обратно ради петель), дороги между городами, кабели и трубы в строительных играх.', cx: 'O(n² log n) время на n² / 2 рёбер · O(n²) память' },
      { variant: 'Два поиска назад от океанов', task: 'Карта высот m × n. Тихий океан касается верхнего и левого края, Атлантический — нижнего и правого. Дождь стекает к соседу, который не выше. Верни клетки, из которых вода доходит до обоих океанов.', idea: 'Поиск из каждой клетки — это O((mn)²). Развернём течение: запустим BFS сразу от всех краевых клеток одного океана и будем шагать только вверх — к соседу не ниже текущей клетки. Клетка достигнута ровно тогда, когда вода из неё может стечь в этот океан. То же для второго океана; ответ — клетки, отмеченные на обеих картах.', why: 'Тот же приём, что во flow field (выше) и в 01 Matrix: один поиск из многих источников от целей вместо поиска из каждого старта. С направлением переворачивается и условие: вода идёт вниз из (y, x) в (r, c), когда h[y][x] ≥ h[r][c], поэтому обратный поиск карабкается вверх. Равные высоты проходимы в обе стороны — плоское озеро стекает туда же, куда его край. DFS тоже подходит, но на карте 1000 × 1000 рекурсия уходит на миллион вызовов вглубь — в Unity очередь надёжнее. В играх: какие тайлы стекают в какую реку или море, источники затопления, эрозия и водоразделы на сгенерированном рельефе.', cx: 'O(m · n) время · O(m · n) память' },
    ],
  },
};

export const CH_BG = {
  /* rig variables */
  'var.rbRound': { en: 'round', ru: 'раунд' },
  'var.rbLands': { en: 'this bit ends at', ru: 'этот бит окажется' },
  'var.rbStep': { en: 'swap step', ru: 'шаг обмена' },
  'var.rbMasks': { en: 'masks: high blocks · low blocks', ru: 'маски: старшие блоки · младшие блоки' },
  'var.divSign': { en: 'sign of the result', ru: 'знак результата' },
  'var.divTest': { en: 'a >> k vs b', ru: 'a >> k против b' },
  'var.divQ': { en: 'quotient q', ru: 'частное q' },
  'var.kcHeap': { en: 'max-heap d:(x,y), farthest first', ru: 'max-heap d:(x,y), дальняя первой' },
  'var.kcDropped': { en: 'dropped', ru: 'выброшена' },
  'var.cgMap': { en: 'dictionary old → new', ru: 'словарь «старый → новый»' },
  'var.cgRefs': { en: 'references copied / 2 · edges', ru: 'ссылок скопировано / 2 · рёбер' },
  'var.krEdges': { en: 'edges by weight i-j:w', ru: 'рёбра по весу i-j:w' },
  'var.krCost': { en: 'cost', ru: 'стоимость' },
  'var.krTaken': { en: 'taken / n − 1', ru: 'взято / n − 1' },
  'var.paPacific': { en: 'reach the Pacific', ru: 'доходят до Тихого' },
  'var.paAtlantic': { en: 'reach the Atlantic', ru: 'доходят до Атлантического' },
  'var.paBoth': { en: 'both oceans [r,c]', ru: 'оба океана [r,c]' },

  /* input errors */
  'in.err.divZero': {
    en: () => 'The divisor must not be 0.',
    ru: () => 'Делитель не может быть 0.',
  },
  'in.err.kPoints': {
    en: n => `k is at most the number of points (${n}).`,
    ru: n => `k не больше числа точек (${n}).`,
  },
  'in.err.cgPairs': {
    en: () => 'Every edge is a pair a b, e.g. 1 2 | 1 4 | 2 3.',
    ru: () => 'Каждое ребро — пара a b, например 1 2 | 1 4 | 2 3.',
  },
  'in.err.cgEdge': {
    en: () => 'An edge joins two different nodes, and no edge may repeat (2 1 is the same as 1 2).',
    ru: () => 'Ребро соединяет два разных узла, и рёбра не повторяются (2 1 — то же, что 1 2).',
  },
  'in.err.cgLabels': {
    en: n => `The nodes are 1–${n}, and every one of them needs an edge.`,
    ru: n => `Узлы — от 1 до ${n}, и у каждого должно быть ребро.`,
  },
  'in.err.cgConnected': {
    en: n => `The graph must be connected: every node of 1–${n} reachable from 1.`,
    ru: n => `Граф должен быть связным: каждый узел из 1–${n} достижим из 1.`,
  },
  'in.err.samePoint': {
    en: () => 'The points must be different.',
    ru: () => 'Точки не должны повторяться.',
  },
};
