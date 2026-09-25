/** Tape 06 chapters 09–12: heap, backtracking, greedy, dynamic programming. */
const plus = parts => parts.join(' + ');

export const CH_C = {
  /* ---------- 09 Heap ---------- */
  'heap.short': { en: 'Top-K, the k-th largest, merging k streams', ru: 'Top-K, k-й по величине, слияние k потоков' },
  'heap.h2': { en: 'Keep only the k best', ru: 'Держи только k лучших' },
  'heap.essence': {
    en: 'A heap hands out the minimum (or maximum) in O(log n). Keep only k items in it and top-k costs O(n log k).',
    ru: 'Куча отдаёт минимум (или максимум) за O(log n). Держи в ней только k элементов — и top-k обойдётся в O(n log k).',
  },
  'heap.signals': {
    en: '<li>“k largest / most frequent / closest”</li><li>You keep needing the current minimum or maximum while the set changes</li><li>Several sorted streams must be merged</li>',
    ru: '<li>«k самых больших / частых / близких»</li><li>Постоянно нужен текущий минимум или максимум, а набор меняется</li><li>Нужно слить несколько отсортированных потоков</li>',
  },
  'heap.pitfall': {
    en: '<b>Trap.</b> C# PriorityQueue is a min-heap; for a max-heap pass −x as the priority. Unity (.NET Standard 2.1) has no PriorityQueue — ask which .NET is assumed, or use SortedSet.',
    ru: '<b>Ловушка.</b> PriorityQueue в C# — min-heap, для max-heap передавай приоритет −x. В Unity (.NET Standard 2.1) его нет — уточни версию .NET или используй SortedSet.',
  },
  'heap.tpl': {
    en: `var heap = new PriorityQueue<T, int>(); // min by priority
foreach (var x in items) {
    heap.Enqueue(x, /* priority */);
    if (heap.Count > k) heap.Dequeue();  // keep the k best
}`,
    ru: `var heap = new PriorityQueue<T, int>(); // min по приоритету
foreach (var x in items) {
    heap.Enqueue(x, /* приоритет */);
    if (heap.Count > k) heap.Dequeue();  // держим k лучших
}`,
  },
  'heap.viz': { en: 'k-th largest · k = 3, stream [4, 1, 7, 3, 8, 5, 9, 2]', ru: 'k-й по величине · k = 3, поток [4, 1, 7, 3, 8, 5, 9, 2]' },
  'heap.p': {
    en: [
      { variant: 'Min-heap of size k', task: 'Find the k-th largest element of an array.', idea: 'A min-heap of size k: push everything, pop the minimum on overflow. At the end the root is the k-th largest.', why: 'The heap as a filter of the best: O(n log k) instead of sorting in O(n log n). Same for Top K Frequent (#347), K Closest Points (#973).', cx: 'O(n log k) time · O(k) memory' },
      { variant: 'Max-heap as a simulation', task: 'Each turn smash the two heaviest stones; the difference stays. What does the last stone weigh?', idea: 'A max-heap. Take the two maxima, push the difference back while more than one stone remains.', why: 'The heap as “give me the maximum” of a set that keeps changing. In C# a max-heap is a negative priority.', cx: 'O(n log n) time · O(n) memory' },
      { variant: 'Merge k streams', task: 'Merge k sorted linked lists into one.', idea: 'The heap holds one head from every list. Take the smallest, append it to the answer and push its next node.', why: 'A heap of size k picks the minimum among k streams in O(log k).', cx: 'O(N log k) time · O(k) memory' },
    ],
    ru: [
      { variant: 'Min-heap размера k', task: 'Найди k-й по величине элемент массива.', idea: 'Min-heap размера k: кладём всё подряд, при переполнении выкидываем минимум. В конце на вершине — k-й по величине.', why: 'Куча как фильтр лучших: O(n log k) вместо сортировки за O(n log n). Так же — Top K Frequent (#347), K Closest Points (#973).', cx: 'O(n log k) время · O(k) память' },
      { variant: 'Max-heap как симуляция', task: 'Каждый ход сталкиваем два самых тяжёлых камня, остаётся разница. Сколько весит последний камень?', idea: 'Max-heap. Достаём два максимума, кладём разницу обратно, пока камней больше одного.', why: 'Куча как «дай максимум» из набора, который постоянно меняется. Max-heap в C# — через отрицательный приоритет.', cx: 'O(n log n) время · O(n) память' },
      { variant: 'Слияние k потоков', task: 'Слей k отсортированных связных списков в один.', idea: 'В куче — по одной «голове» от каждого списка. Достали минимальную — прицепили к ответу и положили в кучу её следующий узел.', why: 'Куча размера k выбирает минимум среди k потоков за O(log k).', cx: 'O(N log k) время · O(k) память' },
    ],
  },
  'heap.ev.start': {
    en: k => `Keep only the ${k} largest numbers in a min-heap. Its root is the smallest of them — the answer.`,
    ru: k => `Держим в min-heap только ${k} самых больших чисел. Корень — самое маленькое из них, это и есть ответ.`,
  },
  'heap.ev.push': {
    en: (x, size, over) => (over ? `Push ${x}. Size ${size} > k — one element has to go.` : `Push ${x}; it sifts up into place. Size ${size} ≤ k.`),
    ru: (x, size, over) => (over ? `Кладём ${x}. Размер ${size} > k — один элемент придётся выкинуть.` : `Кладём ${x}, он всплывает на своё место. Размер ${size} ≤ k.`),
  },
  'heap.ev.pop': {
    en: (m, root, k) => `Drop the minimum ${m}: it cannot be among the ${k} largest. The root is now ${root}.`,
    ru: (m, root, k) => `Выкидываем минимум ${m}: он точно не входит в ${k} наибольших. Корень теперь ${root}.`,
  },
  'heap.ev.done': {
    en: (root, k) => `Stream over. Root = <b>${root}</b> — the answer for k = ${k}. O(n log k); the heap never exceeds k + 1.`,
    ru: (root, k) => `Поток закончился. Корень = <b>${root}</b> — ответ для k = ${k}. O(n log k), куча не больше k + 1.`,
  },

  /* ---------- 10 Backtracking ---------- */
  'back.short': { en: 'All subsets, permutations, combinations', ru: 'Все подмножества, перестановки, комбинации' },
  'back.h2': { en: 'Choose, go deeper, undo', ru: 'Выбрал, ушёл глубже, отменил' },
  'back.essence': {
    en: 'A search with rollback. The decision tree is walked by DFS, and pruning cuts branches that cannot contain an answer.',
    ru: 'Перебор с откатом. Дерево решений обходится DFS, а отсечения срезают ветки, где ответа быть не может.',
  },
  'back.signals': {
    en: '<li>“All” subsets, permutations, combinations, partitions</li><li>Small n (up to ~20), exponential time is acceptable</li><li>Sudoku, N queens, word search in a grid</li>',
    ru: '<li>«Все» подмножества, перестановки, комбинации, разбиения</li><li>Маленькое n (до ~20), экспонента допустима</li><li>Судоку, N ферзей, поиск слова в сетке</li>',
  },
  'back.pitfall': {
    en: '<b>Trap.</b> Save a copy: res.Add(new List&lt;int&gt;(path)). Otherwise every answer is the same reference, empty by the end.',
    ru: '<b>Ловушка.</b> Сохраняй копию: res.Add(new List&lt;int&gt;(path)). Иначе все ответы — одна и та же ссылка, которая к концу опустеет.',
  },
  'back.tpl': {
    en: `void Dfs(/* state */) {
    if (/* solution complete */) { res.Add(new List<int>(path)); return; }
    foreach (var choice in /* options */) {
        if (/* not allowed */) continue;
        path.Add(choice);                // choose
        Dfs(/* deeper */);
        path.RemoveAt(path.Count - 1);  // undo
    }
}`,
    ru: `void Dfs(/* состояние */) {
    if (/* решение готово */) { res.Add(new List<int>(path)); return; }
    foreach (var choice in /* варианты */) {
        if (/* нельзя */) continue;
        path.Add(choice);                // выбор
        Dfs(/* дальше */);
        path.RemoveAt(path.Count - 1);  // откат
    }
}`,
  },
  'back.viz': { en: 'Subsets [1, 2, 3] · the “take / skip” tree', ru: 'Subsets [1, 2, 3] · дерево «брать / не брать»' },
  'back.p': {
    en: [
      { variant: 'Take or skip', task: 'All subsets of an array of distinct numbers.', idea: 'Every number has two branches: take it or not. Depth n, 2ⁿ leaves.', why: 'The choice is binary and in order: index i says whose fate we decide.', cx: 'O(n · 2ⁿ) time · O(n) stack' },
      { variant: 'Any unused one', task: 'All permutations of an array of distinct numbers.', idea: 'On every level try any number not used yet. used[] marks the taken ones.', why: 'Order matters, so the loop starts at 0, not at i. n! leaves.', cx: 'O(n · n!) time · O(n) stack' },
      { variant: 'Sum with pruning', task: 'All combinations (numbers may repeat) that sum to target.', idea: 'Loop from start so that [2,3] and [3,2] are not both produced. Recurse with the same i — the number may be reused. Candidates are sorted: once one exceeds the remainder — break.', why: 'Pruning is the point here; without it the tree explodes. The grid version of the technique is Word Search (#79).', cx: 'exponential; pruning helps a lot' },
    ],
    ru: [
      { variant: 'Брать / не брать', task: 'Все подмножества массива уникальных чисел.', idea: 'У каждого числа две ветки: взять или не взять. Глубина n, листьев 2ⁿ.', why: 'Выбор бинарный и идёт по порядку: индекс i говорит, чью судьбу решаем.', cx: 'O(n · 2ⁿ) время · O(n) стек' },
      { variant: 'Любой неиспользованный', task: 'Все перестановки массива уникальных чисел.', idea: 'На каждом уровне пробуем любое ещё не использованное число. used[] отмечает занятые.', why: 'Порядок важен, поэтому цикл идёт с 0, а не с i. Листьев n!.', cx: 'O(n · n!) время · O(n) стек' },
      { variant: 'Сумма с отсечением', task: 'Все комбинации (числа можно повторять) с суммой target.', idea: 'Цикл от start, чтобы не получить и [2,3], и [3,2]. Рекурсия с тем же i — число можно взять ещё раз. Кандидаты отсортированы: как только число больше остатка — break.', why: 'Главное здесь — отсечение, без него дерево огромное. Та же техника на сетке — Word Search (#79).', cx: 'экспоненциально, отсечение сильно помогает' },
    ],
  },
  'back.ev.start': {
    en: () => 'Start: path = []. Every level decides the fate of one number: take it or skip it.',
    ru: () => 'Старт: path = []. На каждом уровне решаем судьбу одного числа: брать или нет.',
  },
  'back.ev.take': {
    en: (item, set, leaf) => `Take ${item}: path = [${set.join(', ')}].${leaf ? ' Numbers are over — a leaf: save a copy of path.' : ''}`,
    ru: (item, set, leaf) => `Берём ${item}: path = [${set.join(', ')}].${leaf ? ' Числа кончились — это лист, сохраняем копию path.' : ''}`,
  },
  'back.ev.skip': {
    en: (item, set, leaf) => `Undo: remove ${item} from path and take the branch without it: [${set.join(', ')}].${leaf ? ' A leaf: save a copy of path.' : ''}`,
    ru: (item, set, leaf) => `Откат: убрали ${item} из path и идём по ветке без него: [${set.join(', ')}].${leaf ? ' Это лист, сохраняем копию path.' : ''}`,
  },
  'back.ev.done': {
    en: count => `The tree is done: <b>${count}</b> subsets = 2ⁿ. Choose → recurse → undo, on every level.`,
    ru: count => `Дерево обойдено: <b>${count}</b> подмножеств = 2ⁿ. Выбор → рекурсия → откат, и так на каждом уровне.`,
  },

  /* ---------- 11 Greedy ---------- */
  'greedy.short': { en: 'A locally best choice provably leads to the best result', ru: 'Локально лучший выбор доказуемо ведёт к лучшему итогу' },
  'greedy.h2': { en: 'Take the best now, never look back', ru: 'Бери лучшее сейчас и не оглядывайся' },
  'greedy.essence': {
    en: 'It only works when you can prove that the local choice never spoils the global answer.',
    ru: 'Работает только тогда, когда можно доказать, что локальный выбор не портит глобальный ответ.',
  },
  'greedy.signals': {
    en: '<li>Intervals and schedules: “fewest removals / arrows / rooms”</li><li>One record variable updated in a single pass</li><li>You can explain why the local choice is no worse than any other</li>',
    ru: '<li>Интервалы и расписания: «минимум удалений / стрел / комнат»</li><li>Одна переменная-рекорд обновляется за проход</li><li>Можешь объяснить, почему локальный выбор не хуже любого другого</li>',
  },
  'greedy.pitfall': {
    en: '<b>Trap.</b> Greed needs a proof. Look for a counterexample before coding: coins [1, 3, 4] and sum 6 — greedy takes 3 coins, the optimum is 2 (see DP).',
    ru: '<b>Ловушка.</b> Жадность надо обосновать. Ищи контрпример до кода: монеты [1, 3, 4] и сумма 6 — жадный возьмёт 3 монеты, а оптимум 2 (см. DP).',
  },
  'greedy.tpl': {
    en: `Array.Sort(items, /* the key that makes the choice safe */);
foreach (var item in items) {
    if (/* compatible with the current solution */) { /* take it */ }
}`,
    ru: `Array.Sort(items, /* ключ, при котором выбор безопасен */);
foreach (var item in items) {
    if (/* совместим с текущим решением */) { /* берём */ }
}`,
  },
  'greedy.viz': { en: 'Jump Game · a = [2, 0, 2, 0, 1, 3]', ru: 'Jump Game · a = [2, 0, 2, 0, 1, 3]' },
  'greedy.p': {
    en: [
      { variant: 'Frontier of reach', task: 'nums[i] is the longest jump from i. Can you reach the last index?', idea: 'Keep reach — the farthest reachable index. If i > reach, you are stuck.', why: 'No paths are explored at all — a single number is enough.', cx: 'O(n) time · O(1) memory' },
      { variant: 'Best entry so far', task: 'Prices by day. One buy and one later sell — the maximum profit?', idea: 'Walk the days and remember the lowest price so far. Today’s profit = price − that minimum.', why: 'Greedily keep “the best entry point so far”. It can also be read as DP with one variable.', cx: 'O(n) time · O(1) memory' },
      { variant: 'Sort by the end', task: 'The fewest intervals to remove so that the rest do not overlap.', idea: 'Sort by the right end. Keep an interval if it starts no earlier than the last kept one ends; otherwise remove it.', why: 'The right sort key is everything: an interval that ends early leaves the most room for the rest.', cx: 'O(n log n) time · O(1) memory' },
    ],
    ru: [
      { variant: 'Граница досягаемости', task: 'nums[i] — максимальный прыжок из i. Можно ли добраться до последнего индекса?', idea: 'Держим reach — самую дальнюю досягаемую позицию. Если i > reach, мы застряли.', why: 'Пути не перебираем вообще — хватает одного числа.', cx: 'O(n) время · O(1) память' },
      { variant: 'Лучший вход на сейчас', task: 'Цены по дням. Одна покупка и одна продажа позже — какая максимальная прибыль?', idea: 'Идём по дням и помним минимальную цену до сегодня. Прибыль сегодня = цена − этот минимум.', why: 'Жадно храним «лучшую точку входа на данный момент». Можно смотреть и как на DP с одной переменной.', cx: 'O(n) время · O(1) память' },
      { variant: 'Сортировка по концу', task: 'Сколько интервалов минимум удалить, чтобы оставшиеся не пересекались?', idea: 'Сортируем по правому концу. Берём интервал, если он начинается не раньше конца последнего взятого, иначе удаляем.', why: 'Вся сила — в правильной сортировке: рано закончившийся интервал оставляет больше места остальным.', cx: 'O(n log n) время · O(1) память' },
    ],
  },
  'greedy.ev.start': {
    en: () => 'a[i] is the longest jump from i. No path search: keep one number, reach — the farthest index we can get to.',
    ru: () => 'a[i] — самый длинный прыжок из i. Пути не перебираем: храним одно число reach — докуда вообще можно добраться.',
  },
  'greedy.ev.step': {
    en: (i, before, ai, reach) => `i = ${i}: reach = max(${before}, ${i} + ${ai}) = ${reach}.`,
    ru: (i, before, ai, reach) => `i = ${i}: reach = max(${before}, ${i} + ${ai}) = ${reach}.`,
  },
  'greedy.ev.zero': {
    en: (i, before, ai, reach) => `i = ${i}: reach = max(${before}, ${i} + ${ai}) = ${reach}. A zero is harmless here: reach is already further.`,
    ru: (i, before, ai, reach) => `i = ${i}: reach = max(${before}, ${i} + ${ai}) = ${reach}. Ноль здесь не страшен: reach уже дальше.`,
  },
  'greedy.ev.win': {
    en: (i, before, ai, reach, last) => `i = ${i}: reach = max(${before}, ${i} + ${ai}) = ${reach} ≥ ${last} — the last index is reachable: <b>true</b>.`,
    ru: (i, before, ai, reach, last) => `i = ${i}: reach = max(${before}, ${i} + ${ai}) = ${reach} ≥ ${last} — последний индекс досягаем: <b>true</b>.`,
  },
  'greedy.ev.stuck': {
    en: (i, reach) => `i = ${i} > reach = ${reach} — we can never get here. Answer: <b>false</b>.`,
    ru: (i, reach) => `i = ${i} > reach = ${reach} — сюда не добраться. Ответ: <b>false</b>.`,
  },

  /* ---------- 12 Dynamic Programming ---------- */
  'dp.short': { en: 'Number of ways, minimum, maximum; subproblems repeat', ru: 'Число способов, минимум, максимум; подзадачи повторяются' },
  'dp.h2': { en: 'Solve every subproblem once', ru: 'Каждую подзадачу — один раз' },
  'dp.essence': {
    en: 'A big problem splits into smaller ones that repeat. Compute each once and keep it in a table.',
    ru: 'Большая задача раскладывается на меньшие, и они повторяются. Считаем каждую один раз и складываем в таблицу.',
  },
  'dp.signals': {
    en: '<li>“How many ways”, “minimum / maximum”, “is it possible”</li><li>The answer is built from answers to smaller problems, and those repeat</li><li>A greedy solution has a counterexample</li>',
    ru: '<li>«Сколько способов», «минимум / максимум», «можно ли»</li><li>Ответ собирается из ответов на меньшие задачи, и они повторяются</li><li>У жадного решения есть контрпример</li>',
  },
  'dp.pitfall': {
    en: '<b>Trap.</b> State it in words first: “dp[i] is …”. Then the transition, then the base. Code comes last.',
    ru: '<b>Ловушка.</b> Сначала сформулируй словами: «dp[i] — это …». Потом переход, потом база. Код пишется последним.',
  },
  'dp.tpl': {
    en: `var dp = new int[n + 1];
dp[0] = /* base */;
for (int i = 1; i <= n; i++)
    dp[i] = /* from dp[smaller i] */;
return dp[n];`,
    ru: `var dp = new int[n + 1];
dp[0] = /* база */;
for (int i = 1; i <= n; i++)
    dp[i] = /* из dp[меньших i] */;
return dp[n];`,
  },
  'dp.viz': { en: 'Coin Change · coins = [1, 3, 4], amount = 6', ru: 'Coin Change · coins = [1, 3, 4], amount = 6' },
  'dp.p': {
    en: [
      { variant: '1D: sum of the two before', task: 'A staircase of n steps, 1 or 2 at a time. How many ways to the top?', idea: 'Step n is reached from n − 1 or n − 2: ways(n) = ways(n − 1) + ways(n − 2). Two variables are enough.', why: 'The simplest transition — a sum. House Robber (#198) has the same shape with max instead of sum.', cx: 'O(n) time · O(1) memory' },
      { variant: '1D: minimum over choices', task: 'The fewest coins that make up amount (−1 if impossible).', idea: 'dp[x] = 1 + min(dp[x − c]) over all coins c. Fill from 0 to amount.', why: 'The transition picks the best of several options. Greedy breaks here — watch the rig.', cx: 'O(amount · coins) time · O(amount) memory' },
      { variant: '2D: two strings', task: 'Length of the longest common subsequence of two strings.', idea: 'dp[i, j] is the answer for prefixes a[..i] and b[..j]. Equal characters — diagonal + 1, otherwise the max of the cell above and the cell to the left.', why: 'Two inputs — a 2D table. Edit Distance (#72) and other two-string problems share this skeleton.', cx: 'O(m · n) time · O(m · n) memory' },
    ],
    ru: [
      { variant: '1D: сумма двух предыдущих', task: 'Лестница из n ступеней, шаг 1 или 2. Сколькими способами можно подняться?', idea: 'На ступень n пришли с n − 1 или с n − 2: ways(n) = ways(n − 1) + ways(n − 2). Хватает двух переменных.', why: 'Самый простой переход — сумма. Та же форма у House Robber (#198), только там max вместо суммы.', cx: 'O(n) время · O(1) память' },
      { variant: '1D: минимум по выбору', task: 'Минимальное число монет для суммы amount (−1, если собрать нельзя).', idea: 'dp[x] = 1 + min(dp[x − c]) по всем монетам c. Заполняем от 0 до amount.', why: 'Переход — выбор лучшего из нескольких вариантов. Жадность здесь ломается — это видно на стенде.', cx: 'O(amount · coins) время · O(amount) память' },
      { variant: '2D: две строки', task: 'Длина наибольшей общей подпоследовательности двух строк.', idea: 'dp[i, j] — ответ для префиксов a[..i] и b[..j]. Символы равны — диагональ + 1, иначе максимум из верхней и левой клеток.', why: 'Два входа — двумерная таблица. Тот же каркас у Edit Distance (#72) и других задач «на две строки».', cx: 'O(m · n) время · O(m · n) память' },
    ],
  },
  'dp.ev.start': {
    en: coins => `dp[x] = the fewest coins for sum x. Base: dp[0] = 0; everything else is ∞ for now. Coins [${coins.join(', ')}].`,
    ru: coins => `dp[x] — минимум монет для суммы x. База: dp[0] = 0, остальное пока ∞. Монеты [${coins.join(', ')}].`,
  },
  'dp.ev.fill': {
    en: (i, opts, v, pick) => `dp[${i}] = min(${opts.map(o => `dp[${i - o.c}]+1`).join(', ')}) = min(${opts.map(o => o.v).join(', ')}) = <b>${v}</b>, last coin ${pick}.`,
    ru: (i, opts, v, pick) => `dp[${i}] = min(${opts.map(o => `dp[${i - o.c}]+1`).join(', ')}) = min(${opts.map(o => o.v).join(', ')}) = <b>${v}</b>, последняя монета ${pick}.`,
  },
  'dp.ev.skip': {
    en: i => `dp[${i}]: no coin leads here from a reachable sum — it stays ∞.`,
    ru: i => `dp[${i}]: ни одна монета не ведёт сюда из достижимой суммы — остаётся ∞.`,
  },
  'dp.ev.done': {
    en: (amount, answer, parts, greedy) => {
      if (answer < 0) return `The sum ${amount} cannot be made from these coins.`;
      const base = `Answer dp[${amount}] = <b>${answer}</b>: ${plus(parts)}.`;
      if (greedy && greedy.length === answer) return `${base} Greedy happens to agree here.`;
      return `${base} Greedy (largest coin first) ${greedy ? `takes ${plus(greedy)} = ${greedy.length} coins` : 'gets stuck'} — that is why this needs DP.`;
    },
    ru: (amount, answer, parts, greedy) => {
      if (answer < 0) return `Сумму ${amount} этими монетами не собрать.`;
      const base = `Ответ dp[${amount}] = <b>${answer}</b>: ${plus(parts)}.`;
      if (greedy && greedy.length === answer) return `${base} Жадный алгоритм здесь случайно совпал.`;
      return `${base} Жадный (сначала крупная) ${greedy ? `возьмёт ${plus(greedy)} = ${greedy.length} монеты` : 'застрянет'} — поэтому здесь нужен DP.`;
    },
  },
};
