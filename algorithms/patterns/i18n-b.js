/** Tape 06 chapters 05–08: stack, linked list, DFS/BFS, trees. */
export const CH_B = {
  /* ---------- 05 Stack / Monotonic Stack ---------- */
  'stack.short': { en: 'Brackets and nesting; “the next greater or smaller”', ru: 'Скобки и вложенность; «следующий больший или меньший»' },
  'stack.h2': { en: 'The stack remembers what is still open', ru: 'Стек помнит всё незакрытое' },
  'stack.essence': {
    en: 'A monotonic stack keeps its items decreasing (or increasing) and instantly finds the next greater element for each of them.',
    ru: 'Монотонный стек держит элементы по убыванию (или возрастанию) и мгновенно находит для каждого следующий больший.',
  },
  'stack.signals': {
    en: '<li>Brackets, nesting, undo the last action</li><li>“Next greater / smaller element”, “how many days until”</li><li>You need the last added item plus extra information about it</li>',
    ru: '<li>Скобки, вложенность, отмена последнего действия</li><li>«Следующий больший / меньший элемент», «сколько дней ждать»</li><li>Нужен последний добавленный элемент и доп. информация о нём</li>',
  },
  'stack.pitfall': {
    en: '<b>Trap.</b> Keep indices on the stack, not values: from an index you recover both the value and the distance.',
    ru: '<b>Ловушка.</b> Храни в стеке индексы, а не значения: по индексу восстановишь и значение, и расстояние.',
  },
  'stack.tpl': {
    en: `var stack = new Stack<int>(); // indices
for (int i = 0; i < n; i++) {
    while (stack.Count > 0 && a[stack.Peek()] < a[i]) {
        int j = stack.Pop();
        // the next greater for j is i
    }
    stack.Push(i);
}`,
    ru: `var stack = new Stack<int>(); // индексы
for (int i = 0; i < n; i++) {
    while (stack.Count > 0 && a[stack.Peek()] < a[i]) {
        int j = stack.Pop();
        // для j «следующий больший» — это i
    }
    stack.Push(i);
}`,
  },
  'stack.viz': { en: 'Daily Temperatures · t = [73, 74, 75, 71, 69, 72, 76, 73]', ru: 'Daily Temperatures · t = [73, 74, 75, 71, 69, 72, 76, 73]' },
  'stack.p': {
    en: [
      { variant: 'Match pairs', task: 'A string of ()[]{}. Are the brackets balanced?', idea: 'Push an opening bracket. A closing one must match the top, otherwise false. At the end the stack must be empty.', why: 'Plain LIFO: the last opened is closed first.', cx: 'O(n) time · O(n) memory' },
      { variant: 'Monotonic stack: next greater', task: 'For every day — how many days until a warmer one (0 if never).', idea: 'The stack holds indices of days still waiting; their temperatures decrease. A warm day pops everyone colder and writes their answer.', why: 'The stack is not about nesting here but about “who is still waiting”. Every index is pushed and popped once → O(n).', cx: 'O(n) time · O(n) memory' },
      { variant: 'Stack with extra state', task: 'Design a stack with push, pop, top and getMin, all in O(1).', idea: 'Every entry stores a pair: the value and the minimum at the moment of insertion. After pop the minimum rolls back by itself.', why: 'A design task: the stack keeps history, and history can carry any aggregate.', cx: 'O(1) per operation · O(n) memory' },
    ],
    ru: [
      { variant: 'Сопоставление пар', task: 'Строка из ()[]{}. Правильно ли расставлены скобки?', idea: 'Открывающую кладём в стек. Закрывающая должна совпасть с вершиной, иначе false. В конце стек должен быть пуст.', why: 'Классический LIFO: последний открытый закрывается первым.', cx: 'O(n) время · O(n) память' },
      { variant: 'Монотонный стек: следующий больший', task: 'Для каждого дня — через сколько дней станет теплее (0, если никогда).', idea: 'В стеке индексы дней, которые ещё ждут потепления, температуры в нём убывают. Тёплый день выталкивает всех, кто холоднее, и записывает им ответ.', why: 'Стек здесь не про вложенность, а про «ожидающих». Каждый индекс один раз push и один раз pop → O(n).', cx: 'O(n) время · O(n) память' },
      { variant: 'Стек с доп. состоянием', task: 'Спроектируй стек с push, pop, top и getMin, всё за O(1).', idea: 'В каждом элементе храним пару: значение и минимум на момент вставки. После pop минимум «откатывается» сам.', why: 'Задача на дизайн: стек хранит историю, и её можно обогатить любым агрегатом.', cx: 'O(1) на операцию · O(n) память' },
    ],
  },
  'stack.ev.start': {
    en: () => 'The stack holds indices of days still waiting for a warmer one. Their temperatures always decrease from bottom to top.',
    ru: () => 'В стеке индексы дней, которые ещё ждут потепления. Их температуры всегда убывают снизу вверх.',
  },
  'stack.ev.pop': {
    en: (ti, tj, j, i, d) => `${ti}° > ${tj}°: day ${j} finally gets warmer. <b>ans[${j}] = ${i} − ${j} = ${d}</b>, pop.`,
    ru: (ti, tj, j, i, d) => `${ti}° > ${tj}°: для дня ${j} потепление наступило. <b>ans[${j}] = ${i} − ${j} = ${d}</b>, pop.`,
  },
  'stack.ev.push': {
    en: (i, ti, below) => (below === null ? `push ${i} (${ti}°) — the stack was empty.` : `push ${i} (${ti}°) — colder than ${below}° below it, so it waits.`),
    ru: (i, ti, below) => (below === null ? `push ${i} (${ti}°) — стек был пуст.` : `push ${i} (${ti}°) — холоднее ${below}° под ним, ждёт своей очереди.`),
  },
  'stack.ev.done': {
    en: () => 'Whoever is left in the stack never saw a warmer day: ans = 0. Every index is pushed once and popped at most once → O(n).',
    ru: () => 'Кто остался в стеке, тёплого дня не дождался: ans = 0. Каждый индекс один раз push и не больше одного pop → O(n).',
  },

  /* ---------- 06 Linked List ---------- */
  'list.short': { en: 'Linked list: cycle, middle, k-th from the end', ru: 'Связный список: цикл, середина, k-й с конца' },
  'list.h2': { en: 'Two runners on one chain', ru: 'Два бегуна на одной цепочке' },
  'list.essence': {
    en: 'Two pointers along a list: at different speeds or with a fixed head start. No arrays, no extra memory.',
    ru: 'Два указателя по списку: с разной скоростью или с фиксированным отрывом. Никаких массивов и лишней памяти.',
  },
  'list.signals': {
    en: '<li>A linked list and the words “cycle”, “middle”, “k-th from the end”</li><li>O(1) memory is required</li><li>Links must be rewired: reverse, merge, delete</li>',
    ru: '<li>Связный список и слова «цикл», «середина», «k-й с конца»</li><li>Требуют O(1) памяти</li><li>Нужно перешить ссылки: развернуть, слить, удалить</li>',
  },
  'list.pitfall': {
    en: '<b>Trap.</b> The loop condition is fast != null &amp;&amp; fast.next != null, in exactly this order — otherwise a NullReferenceException on an even-length list.',
    ru: '<b>Ловушка.</b> Условие цикла — fast != null &amp;&amp; fast.next != null, именно в таком порядке. Иначе NullReferenceException на списке чётной длины.',
  },
  'list.tape': {
    en: '<b>Already on the shelf:</b> fast &amp; slow with both phases of Floyd (the cycle and its entrance) is on <a href="../two-pointers/#floyd">Tape 03 · Two Pointers</a>. The rig below shows the other variant: equal speed, fixed head start.',
    ru: '<b>Уже на полке:</b> fast &amp; slow с обеими фазами Floyd (цикл и вход в него) — на <a href="../two-pointers/#floyd">кассете 03 · Two Pointers</a>. Стенд ниже показывает другой вариант: скорость одинаковая, отрыв фиксированный.',
  },
  'list.tpl': {
    en: `ListNode slow = head, fast = head;
while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow == fast) { /* cycle */ }
}
// without a cycle, slow ends in the middle`,
    ru: `ListNode slow = head, fast = head;
while (fast != null && fast.next != null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow == fast) { /* цикл */ }
}
// если цикла нет, slow стоит на середине`,
  },
  'list.viz': { en: 'Remove Nth From End · 1 → 2 → 3 → 4 → 5, n = 2', ru: 'Remove Nth From End · 1 → 2 → 3 → 4 → 5, n = 2' },
  'list.p': {
    en: [
      { variant: 'Different speeds (Floyd)', task: 'Does the linked list have a cycle?', idea: 'slow takes 1 step, fast takes 2. With a cycle fast catches slow inside it; if fast reaches null there is none.', why: 'Twins: Middle of the Linked List (#876) — same loop, slow ends in the middle. Cycle II (#142) — the second phase, played on Tape 03.', cx: 'O(n) time · O(1) memory' },
      { variant: 'Fixed head start', task: 'Remove the n-th node from the end in one pass.', idea: 'fast goes n + 1 steps ahead, then both move together. When fast is null, slow sits right before the victim. A dummy node covers removing the head.', why: 'Same speed — the whole trick is the starting gap.', cx: 'O(n) time · O(1) memory' },
      { variant: 'Rewire the links', task: 'Reverse a singly linked list.', idea: 'Three pointers: prev, cur, next. Save next, point cur.next at prev, shift everything one step.', why: 'Not a search but a change of structure. It is a building block of many tasks: palindrome list (#234), Reverse Nodes in k-Group (#25).', cx: 'O(n) time · O(1) memory' },
    ],
    ru: [
      { variant: 'Разная скорость (Floyd)', task: 'Есть ли в связном списке цикл?', idea: 'slow шагает на 1, fast на 2. Если цикл есть, fast догонит slow внутри него. Если fast дошёл до null — цикла нет.', why: 'Близнецы: Middle of the Linked List (#876) — тот же цикл, и slow оказывается в середине. Cycle II (#142) — вторая фаза, она показана на кассете 03.', cx: 'O(n) время · O(1) память' },
      { variant: 'Фиксированный отрыв', task: 'Удали n-й с конца узел за один проход.', idea: 'fast уходит вперёд на n + 1 шаг, потом оба идут вместе. Когда fast = null, slow стоит прямо перед удаляемым. Фиктивный dummy-узел закрывает случай удаления головы.', why: 'Скорость одинаковая, весь приём — в стартовом отрыве.', cx: 'O(n) время · O(1) память' },
      { variant: 'Перешивка ссылок', task: 'Разверни односвязный список.', idea: 'Три указателя: prev, cur, next. Запоминаем next, разворачиваем cur.next на prev, сдвигаемся.', why: 'Не поиск, а изменение структуры. Этот приём встраивается во многие задачи: палиндром (#234), Reverse Nodes in k-Group (#25).', cx: 'O(n) время · O(1) память' },
    ],
  },
  'list.ev.start': {
    en: n => `Remove the ${n}-th node from the end in one pass. The dummy node D before the head lets us remove the head itself.`,
    ru: n => `Удаляем ${n}-й узел с конца за один проход. Фиктивный узел D перед головой позволяет удалить и саму голову.`,
  },
  'list.ev.lead': {
    en: (step, total, isNull) => `fast runs ahead alone: step ${step} of ${total}.${isNull ? ' It already reached null.' : ''}`,
    ru: (step, total, isNull) => `fast убегает вперёд один: шаг ${step} из ${total}.${isNull ? ' Он уже дошёл до null.' : ''}`,
  },
  'list.ev.walk': {
    en: (slow, isNull) => `Both move one link. slow is on ${slow}${isNull ? ', fast hit null — stop.' : '.'}`,
    ru: (slow, isNull) => `Оба шагают на одну ссылку. slow на ${slow}${isNull ? ', fast упёрся в null — стоп.' : '.'}`,
  },
  'list.ev.cut': {
    en: (v, isHead) => `The gap is n + 1, so slow sits right before the target. <b>slow.next = slow.next.next</b> removes ${v}${isHead ? ' — the old head; this is why the dummy exists.' : '.'}`,
    ru: (v, isHead) => `Отрыв n + 1, поэтому slow стоит прямо перед целью. <b>slow.next = slow.next.next</b> удаляет ${v}${isHead ? ' — старую голову; вот зачем нужен dummy.' : '.'}`,
  },

  /* ---------- 07 DFS / BFS ---------- */
  'graph.short': { en: 'Grid or graph: connectivity, flood fill, fewest steps', ru: 'Сетка или граф: связность, заливка, минимум шагов' },
  'graph.h2': { en: 'A grid is a graph with four neighbours', ru: 'Сетка — это граф с четырьмя соседями' },
  'graph.essence': {
    en: 'DFS dives deep and floods a whole component. BFS spreads as a wave and counts steps.',
    ru: 'DFS уходит вглубь и заливает компоненту целиком. BFS расходится волной и считает шаги.',
  },
  'graph.signals': {
    en: '<li>A 2D grid, “islands”, “regions”, “fill”</li><li>“Fewest steps / minutes” — BFS by levels</li><li>Connectivity: how many components, is a cell reachable</li>',
    ru: '<li>Двумерная сетка, «острова», «области», «заливка»</li><li>«Минимальное число шагов / минут» — BFS по уровням</li><li>Связность: сколько компонент, достижима ли клетка</li>',
  },
  'graph.pitfall': {
    en: '<b>Trap.</b> In BFS mark a cell visited when you enqueue it, not when you dequeue it — otherwise one cell enters the queue several times.',
    ru: '<b>Ловушка.</b> В BFS помечай клетку посещённой при добавлении в очередь, а не при извлечении. Иначе одна клетка попадёт в очередь несколько раз.',
  },
  'graph.tape': {
    en: '<b>Already on the shelf:</b> queue versus stack, the frontier, the traversal tree and shortest paths are on <a href="../bfs-dfs/">Tape 02 · BFS and DFS</a>. The rig below adds what that tape does not do: counting components.',
    ru: '<b>Уже на полке:</b> очередь против стека, фронт, дерево обхода и кратчайшие пути — на <a href="../bfs-dfs/">кассете 02 · BFS и DFS</a>. Стенд ниже добавляет то, чего там нет: подсчёт компонент.',
  },
  'graph.tpl': {
    en: `var q = new Queue<(int r, int c)>(starts);
while (q.Count > 0) {
    for (int k = q.Count; k > 0; k--) {  // one level = one step
        var (r, c) = q.Dequeue();
        foreach (var (dr, dc) in dirs) {
            /* inside and not visited? mark and enqueue */
        }
    }
    steps++;
}`,
    ru: `var q = new Queue<(int r, int c)>(starts);
while (q.Count > 0) {
    for (int k = q.Count; k > 0; k--) {  // один уровень = один шаг
        var (r, c) = q.Dequeue();
        foreach (var (dr, dc) in dirs) {
            /* в границах и не посещён? пометить и в очередь */
        }
    }
    steps++;
}`,
  },
  'graph.viz': { en: 'Number of Islands · DFS floods each island', ru: 'Number of Islands · DFS заливает каждый остров' },
  'graph.p': {
    en: [
      { variant: 'DFS from one cell', task: 'An image matrix, a start cell and a new colour. Repaint the cell and the whole connected area of the same colour.', idea: 'Remember the original colour and DFS in four directions. Repainting doubles as the “visited” mark. If the colour is already the new one, return at once — otherwise infinite recursion.', why: 'One source, one component. Visited state lives right in the grid, as colour.', cx: 'O(R·C) time · O(R·C) stack' },
      { variant: 'Count components', task: 'A grid of "1" (land) and "0" (water). How many islands?', idea: 'Loop over every cell. Unvisited land → count + 1, and DFS sinks the whole island so it is never counted again.', why: 'The outer loop finds new components, DFS swallows them. The skeleton for any “how many groups”.', cx: 'O(R·C) time · O(R·C) stack' },
      { variant: 'BFS from many sources', task: 'A rotten orange spoils fresh neighbours each minute. After how many minutes is everything rotten (or −1)?', idea: 'Put ALL rotten oranges into the queue at once — multi-source BFS. Process the queue level by level: one level is one minute.', why: '“How many steps” means BFS, not DFS. Several starts — just enqueue them all at the beginning.', cx: 'O(R·C) time · O(R·C) memory' },
    ],
    ru: [
      { variant: 'DFS из одной точки', task: 'Картинка-матрица, стартовая клетка и новый цвет. Перекрась клетку и всю связную область того же цвета.', idea: 'Запоминаем исходный цвет и идём DFS в 4 стороны. Перекраска сама служит пометкой «посещено». Если цвет уже новый — сразу выходим, иначе бесконечная рекурсия.', why: 'Один источник, одна компонента. Посещённость хранится прямо в сетке — цветом.', cx: 'O(R·C) время · O(R·C) стек' },
      { variant: 'Подсчёт компонент', task: 'Сетка из "1" (суша) и "0" (вода). Сколько островов?', idea: 'Обходим все клетки. Непосещённая суша → счётчик + 1, и DFS «топит» весь остров, чтобы не посчитать его снова.', why: 'Внешний цикл находит новые компоненты, DFS их поглощает. Шаблон для любого «сколько групп».', cx: 'O(R·C) время · O(R·C) стек' },
      { variant: 'BFS из многих источников', task: 'Гнилой апельсин за минуту портит свежих соседей. Через сколько минут сгниют все (или −1)?', idea: 'Кладём в очередь ВСЕ гнилые сразу — multi-source BFS. Обрабатываем очередь слоями: один слой = одна минута.', why: '«За сколько шагов» — значит BFS, а не DFS. Несколько стартов — просто все в очередь в начале.', cx: 'O(R·C) время · O(R·C) память' },
    ],
  },
  'graph.ev.start': {
    en: () => 'Grey is unvisited land, dark is water. The outer loop scans every cell row by row.',
    ru: () => 'Серое — непосещённая суша, тёмное — вода. Внешний цикл обходит клетки по строкам.',
  },
  'graph.ev.found': {
    en: (r, c, k) => `The loop hits unvisited land (${r},${c}) → <b>island #${k}</b>. Start DFS; it will flood the whole island.`,
    ru: (r, c, k) => `Цикл нашёл непосещённую сушу (${r},${c}) → <b>остров №${k}</b>. Запускаем DFS, он зальёт весь остров.`,
  },
  'graph.ev.fill': {
    en: (r, c) => `DFS: (${r},${c}) is land of the same island — paint it. Next: down, up, right, left.`,
    ru: (r, c) => `DFS: (${r},${c}) — суша того же острова, красим. Дальше вниз, вверх, вправо, влево.`,
  },
  'graph.ev.done': {
    en: count => `The scan is over: <b>${count}</b> islands. DFS touched each cell once → O(R·C).`,
    ru: count => `Обход закончен: островов — <b>${count}</b>. DFS посетил каждую клетку один раз → O(R·C).`,
  },

  /* ---------- 08 Trees ---------- */
  'tree.short': { en: 'Height, traversal, checking a property of a tree', ru: 'Высота, обход, проверка свойства дерева' },
  'tree.h2': { en: 'Solve for the children, combine in the node', ru: 'Реши для детей, собери в узле' },
  'tree.essence': {
    en: 'Almost every tree problem is recursion: solve the left and right subtrees, then combine in the node. If levels matter — BFS.',
    ru: 'Почти любая задача на дерево — рекурсия: реши для левого и правого поддерева, потом собери ответ в узле. Если важны уровни — BFS.',
  },
  'tree.signals': {
    en: '<li>You are given a tree — recursion almost always</li><li>“Depth”, “diameter”, “path”, “is it balanced” — combine bottom-up</li><li>“Levels”, “width”, “right side view” — BFS</li>',
    ru: '<li>Дано дерево — почти всегда рекурсия</li><li>«Глубина», «диаметр», «путь», «сбалансировано ли» — собираем снизу вверх</li><li>«Уровни», «ширина», «вид справа» — BFS</li>',
  },
  'tree.pitfall': {
    en: '<b>Trap.</b> Decide first what travels down through parameters (bounds, path) and what comes back up through return (height, sum).',
    ru: '<b>Ловушка.</b> Сначала реши, что передаётся вниз через параметры (границы, путь), а что возвращается вверх через return (высота, сумма).',
  },
  'tree.tpl': {
    en: `int Solve(TreeNode node) {
    if (node == null) return /* base */;
    int left = Solve(node.left);
    int right = Solve(node.right);
    return /* combine left, right and node.val */;
}`,
    ru: `int Solve(TreeNode node) {
    if (node == null) return /* база */;
    int left = Solve(node.left);
    int right = Solve(node.right);
    return /* ответ из left, right и node.val */;
}`,
  },
  'tree.viz': { en: 'Maximum Depth · recursion returns the height bottom-up', ru: 'Maximum Depth · рекурсия возвращает высоту снизу вверх' },
  'tree.p': {
    en: [
      { variant: 'Bottom-up: return', task: 'The maximum depth of a binary tree.', idea: 'A node’s depth is 1 + the larger depth of its children. null returns 0.', why: 'Information flows bottom-up through return. Diameter (#543) and Balanced Binary Tree (#110) work the same way.', cx: 'O(n) time · O(h) stack' },
      { variant: 'BFS by levels', task: 'Return the values level by level: [[3],[9,20],[15,7]].', idea: 'A queue. Before processing a level, remember queue.Count — exactly that many nodes belong to the level.', why: 'BFS, not recursion. Use it when the statement says “level”, “width”, Right Side View (#199).', cx: 'O(n) time · O(width) memory' },
      { variant: 'Top-down: bounds', task: 'Is the tree a valid BST?', idea: 'Every node must lie inside the interval (lo, hi) inherited from its ancestors. Going left narrows hi, going right narrows lo.', why: 'Information flows top-down through parameters. Comparing a node only with its direct children is the classic mistake.', cx: 'O(n) time · O(h) stack' },
    ],
    ru: [
      { variant: 'Снизу вверх: return', task: 'Максимальная глубина бинарного дерева.', idea: 'Глубина узла = 1 + максимум глубин детей. null возвращает 0.', why: 'Информация течёт снизу вверх через return. Так же решаются Diameter (#543) и Balanced Binary Tree (#110).', cx: 'O(n) время · O(h) стек' },
      { variant: 'BFS по уровням', task: 'Верни значения дерева по уровням: [[3],[9,20],[15,7]].', idea: 'Очередь. Перед обработкой уровня запоминаем queue.Count — ровно столько узлов в этом уровне.', why: 'Не рекурсия, а BFS. Нужен, когда в условии «уровень», «ширина», Right Side View (#199).', cx: 'O(n) время · O(ширина) память' },
      { variant: 'Сверху вниз: границы', task: 'Является ли дерево корректным BST?', idea: 'Каждый узел должен лежать в интервале (lo, hi), унаследованном от предков. Влево — сужаем hi, вправо — сужаем lo.', why: 'Информация течёт сверху вниз через параметры. Сравнивать узел только с прямыми детьми — классическая ошибка.', cx: 'O(n) время · O(h) стек' },
    ],
  },
  'tree.ev.start': {
    en: () => 'maxDepth(node) = 1 + max(maxDepth(left), maxDepth(right)); null returns 0. Answers travel bottom-up.',
    ru: () => 'maxDepth(node) = 1 + max(maxDepth(left), maxDepth(right)), для null — 0. Ответы поднимаются снизу вверх.',
  },
  'tree.ev.enter': {
    en: v => `Enter ${v}. First ask the left subtree for its depth, then the right one.`,
    ru: v => `Вход в ${v}. Сначала спросим глубину у левого поддерева, потом у правого.`,
  },
  'tree.ev.return': {
    en: (v, l, r, d, hasL, hasR) => `${v}: left ${l}${hasL ? '' : ' (null)'}, right ${r}${hasR ? '' : ' (null)'} → 1 + max(${l}, ${r}) = <b>${d}</b>. Return it upward.`,
    ru: (v, l, r, d, hasL, hasR) => `${v}: слева ${l}${hasL ? '' : ' (null)'}, справа ${r}${hasR ? '' : ' (null)'} → 1 + max(${l}, ${r}) = <b>${d}</b>. Возвращаем наверх.`,
  },
  'tree.ev.done': {
    en: d => `The root returned <b>${d}</b> — the depth of the tree. Badges show what each node returned.`,
    ru: d => `Корень вернул <b>${d}</b> — это глубина дерева. Бейджи показывают, что вернул каждый узел.`,
  },
};
