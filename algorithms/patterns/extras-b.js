/** Extras for chapters binary, stack, list, tree: tricky inputs, an operation counter, predict-the-step forks, interviewer follow-ups, related problems. */

/* ---------- helpers for the operation counters (pure, no imports) ---------- */

/** LeetCode level-order array (null for a missing child) → { v, l, r } nodes, or null. */
function treeOf(values) {
  if (!values || !values.length || values[0] === null) return null;
  const root = { v: values[0], l: null, r: null }, queue = [root];
  let i = 1;
  while (queue.length && i < values.length) {
    const node = queue.shift();
    for (const side of ['l', 'r']) {
      if (i >= values.length) break;
      const v = values[i++];
      if (v === null) continue;
      node[side] = { v, l: null, r: null };
      queue.push(node[side]);
    }
  }
  return root;
}

const countNodes = t => (t ? 1 + countNodes(t.l) + countNodes(t.r) : 0);
/** Sum of node depths, the root at depth 1: what “walk up from every node to the root” costs. */
const depthSum = (t, d = 1) => (t ? d + depthSum(t.l, d + 1) + depthSum(t.r, d + 1) : 0);
const height = t => (t ? 1 + Math.max(height(t.l), height(t.r)) : 0);

/** Node k links to k + 1, the last one to pos (-1 for null): the rigs' list with an optional cycle. */
const listNext = (n, pos) => Array.from({ length: n }, (_, i) => (i + 1 < n ? i + 1 : pos));

/**
 * Cycle search in O(1) memory without Floyd: after every step of cur, walk p from the head over the nodes
 * already passed; the first time p meets cur, cur is a revisit (and it is the cycle entrance). Counts link hops.
 */
function naiveRevisitHops(next) {
  let cur = 0, s = 0, hops = 0;
  for (;;) {
    if (next[cur] === -1) return hops;
    cur = next[cur];
    s++;
    hops++;
    let p = 0;
    for (let t = 0; t < s; t++) {
      if (p === cur) return hops;
      if (t + 1 < s) { p = next[p]; hops++; }
    }
  }
}

/** Floyd, phase one (and phase two when entry is set): slow makes 1 hop and fast 2 per round. */
function floydHops(next, entry) {
  let slow = 0, fast = 0, hops = 0, met = false;
  while (fast !== -1 && next[fast] !== -1) {
    slow = next[slow];
    fast = next[next[fast]];
    hops += 3;
    if (slow === fast) { met = true; break; }
  }
  if (!entry || !met) return hops;
  let p = 0;
  while (p !== slow) { p = next[p]; slow = next[slow]; hops += 2; }
  return hops;
}

export const EX_B = {
  /* ================= binary search ================= */
  bsearch: {
    tricky: [
      { input: { a: '7', target: '7' },
        ru: 'Один элемент: при условии <code>while (lo &lt; hi)</code> цикл не выполнится ни разу и вернётся −1, а правильный ответ — 0.',
        en: 'One element: with <code>while (lo &lt; hi)</code> the loop never runs and you return −1, while the answer is 0.' },
      { input: { a: '2, 5, 8, 12', target: '13' },
        ru: 'target больше всех: lo уходит за конец массива. Если начать с <code>hi = n</code> и оставить <code>lo &lt;= hi</code>, код прочитает <code>a[4]</code> за границей. Ответ −1.',
        en: 'target is larger than everything, so lo runs past the end. Start with <code>hi = n</code> and keep <code>lo &lt;= hi</code>, and the code reads <code>a[4]</code> out of bounds. The answer is −1.' },
    ],
    ops: {
      unit: { ru: 'сравнений с target', en: 'comparisons with target' },
      naive: { ru: 'линейный поиск', en: 'linear scan', count: p => { const i = p.a.indexOf(p.target); return i < 0 ? p.a.length : i + 1; } },
      ours: { ru: 'бинарный поиск', en: 'binary search', count: p => {
        let lo = 0, hi = p.a.length - 1, c = 0;
        while (lo <= hi) {
          const mid = lo + Math.floor((hi - lo) / 2);
          c++;
          if (p.a[mid] === p.target) break;
          if (p.a[mid] < p.target) lo = mid + 1; else hi = mid - 1;
        }
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Следующая середина: попадаем в target, снова отбрасываем половину или кандидатов уже нет?', en: 'Next middle: does it hit target, drop another half, or are there no candidates left?' },
        keys: { 'binary.ev.found': { ru: 'a[mid] = target, нашли', en: 'a[mid] = target, found' },
                'binary.ev.probe': { ru: 'мимо, режем половину', en: 'miss, cut a half' },
                'binary.ev.none': { ru: 'lo обогнал hi, нет', en: 'lo passed hi, not there' } } },
    ],
    followups: [
      { ru: { q: 'А если в массиве есть повторы и нужен первый индекс target?', a: 'При равенстве не останавливайся, а запоминай ответ и иди влево: <code>hi = mid - 1</code>. Это lower_bound; число вхождений — разность upper_bound и lower_bound, оба за O(log n).' },
        en: { q: 'What if there are duplicates and you need the first index of target?', a: 'On equality do not stop: remember the index and keep going left with <code>hi = mid - 1</code>. That is lower_bound; the number of occurrences is upper_bound minus lower_bound, both O(log n).' } },
      { ru: { q: 'Длина массива неизвестна (поток или «бесконечный» массив). Как искать?', a: 'Экспоненциальный поиск: удваивай hi (1, 2, 4, …), пока <code>a[hi] &lt; target</code>, потом обычный бинпоиск на [hi/2, hi]. Выходит O(log i), где i — позиция ответа.' },
        en: { q: 'The length is unknown (a stream or an “infinite” array). How do you search?', a: 'Exponential search: double hi (1, 2, 4, …) while <code>a[hi] &lt; target</code>, then run a normal binary search on [hi/2, hi]. That is O(log i), where i is the answer’s position.' } },
      { ru: { q: 'Почему не делить на три части — тернарный поиск ведь быстрее?', a: 'Шагов меньше, а сравнений больше: на шаг нужно два сравнения, итого 2·log₃n ≈ 1,26·log₂n. Деление пополам оптимально по числу сравнений.' },
        en: { q: 'Why not split into three — isn’t ternary search faster?', a: 'Fewer steps but more comparisons: two per step, 2·log₃n ≈ 1.26·log₂n in total. Halving is optimal in comparisons.' } },
    ],
    related: [
      { id: 'validBst', ru: 'спуск по BST — тот же бинпоиск, а коридор (lo, hi) — те же границы', en: 'walking down a BST is the same search, and its (lo, hi) corridor is the same bounds' },
      { id: 'twoSumII', ru: 'отсортированный вход: два указателя вместо бинпоиска для каждого числа', en: 'sorted input: two pointers instead of a binary search per number' },
    ],
  },

  rotated: {
    tricky: [
      { input: { nums: '3, 1', target: '1' },
        ru: 'Два элемента, lo = mid. Если писать <code>nums[lo] &lt; nums[mid]</code> вместо <code>&lt;=</code>, «отсортированной» окажется правая половина [3, 1] — поиск уйдёт влево и вернёт −1. Ответ 1.',
        en: 'Two elements, lo = mid. Write <code>nums[lo] &lt; nums[mid]</code> instead of <code>&lt;=</code> and the right half [3, 1] counts as “sorted”: the search goes left and returns −1. The answer is 1.' },
      { input: { nums: '4, 5, 6, 7, 0, 1, 2', target: '4' },
        ru: 'target на левом краю отсортированной половины. Строгая проверка <code>nums[lo] &lt; target</code> выкинет его и уведёт вправо; нужна нестрогая. Ответ 0.',
        en: 'target sits on the left edge of the sorted half. A strict <code>nums[lo] &lt; target</code> rules it out and goes right; the check must be inclusive. The answer is 0.' },
    ],
    ops: {
      unit: { ru: 'сравнений с target', en: 'comparisons with target' },
      naive: { ru: 'линейный поиск', en: 'linear scan', count: p => { const i = p.nums.indexOf(p.target); return i < 0 ? p.nums.length : i + 1; } },
      ours: { ru: 'бинпоиск по отсортированной половине', en: 'search in the sorted half', count: p => {
        const a = p.nums, t = p.target;
        let lo = 0, hi = a.length - 1, c = 0;
        while (lo <= hi) {
          const mid = lo + Math.floor((hi - lo) / 2);
          c++;
          if (a[mid] === t) break;
          const leftSorted = a[lo] <= a[mid];
          const inside = leftSorted ? a[lo] <= t && t < a[mid] : a[mid] < t && t <= a[hi];
          if (leftSorted === inside) hi = mid - 1; else lo = mid + 1;
        }
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Следующая середина: это target, снова выбираем половину или диапазон опустел?', en: 'Next middle: is it target, do we pick a half again, or is the range empty?' },
        keys: { 'rsa.ev.found': { ru: 'нашли target', en: 'found target' },
                'rsa.ev.probe': { ru: 'мимо, выбираем половину', en: 'miss, pick a half' },
                'rsa.ev.none': { ru: 'диапазон пуст', en: 'the range is empty' } } },
    ],
    followups: [
      { ru: { q: 'Как найти сам минимум, то есть точку поворота (#153)?', a: 'Сравнивай <code>nums[mid]</code> с <code>nums[hi]</code>: если больше, минимум правее (<code>lo = mid + 1</code>), иначе <code>hi = mid</code>. Индекс минимума и есть число сдвигов.' },
        en: { q: 'How do you find the minimum itself, the rotation point (#153)?', a: 'Compare <code>nums[mid]</code> with <code>nums[hi]</code>: if it is larger, the minimum is to the right (<code>lo = mid + 1</code>), otherwise <code>hi = mid</code>. The index of the minimum is the rotation count.' } },
      { ru: { q: 'Можно ли решить в два прохода, но проще?', a: 'Да: сначала бинпоиском найти поворот k, потом обычный бинпоиск по «виртуальным» индексам <code>(i + k) % n</code>. Тоже O(log n), только сравнений вдвое больше, зато меньше развилок, где можно ошибиться.' },
        en: { q: 'Is there a simpler two-pass solution?', a: 'Yes: find the rotation k with one binary search, then run a normal one over “virtual” indices <code>(i + k) % n</code>. Still O(log n) with about twice the comparisons, but fewer branches to get wrong.' } },
    ],
    related: [
      { id: 'bsearch', ru: 'обычный бинпоиск — сюда сводится каждый шаг внутри отсортированной половины', en: 'plain binary search, which every step inside the sorted half reduces to' },
      { id: 'validBst', ru: 'решение «влево или вправо» по проверке диапазона [lo, hi]', en: 'the left-or-right decision is a range check on [lo, hi]' },
    ],
  },

  koko: {
    tricky: [
      { input: { piles: '5', h: '2' },
        ru: 'Часы считают с округлением вверх. Если делить нацело (<code>p / k</code>), скорость 2 «успевает» за 5 / 2 = 2 часа, а на деле нужно 3. Ответ 3.',
        en: 'Hours round up. With integer division (<code>p / k</code>) speed 2 “fits” in 5 / 2 = 2 hours, but it really takes 3. The answer is 3.' },
      { input: { piles: '3, 6, 7, 11', h: '4' },
        ru: 'Часов ровно столько, сколько куч: каждую надо съесть за час, ответ — максимум, 11. Если взять <code>hi = max - 1</code>, ответа в диапазоне не будет.',
        en: 'As many hours as piles: each pile must go in one hour, so the answer is the maximum, 11. Take <code>hi = max - 1</code> and the answer is not in the range at all.' },
      { input: { piles: '3, 6, 7, 11', h: '60' },
        ru: 'Часов с запасом, хватит скорости 1. Если начать с <code>lo = 0</code>, первая же проверка поделит на ноль.',
        en: 'Plenty of hours, speed 1 is enough. Start with <code>lo = 0</code> and the very first check divides by zero.' },
    ],
    ops: {
      unit: { ru: 'делений', en: 'divisions' },
      naive: { ru: 'скорости 1, 2, 3… по очереди', en: 'speeds 1, 2, 3… in turn', count: p => {
        let c = 0;
        for (let k = 1; ; k++) {
          c += p.piles.length;
          if (p.piles.reduce((s, x) => s + Math.ceil(x / k), 0) <= p.h) return c;
        }
      } },
      ours: { ru: 'бинпоиск по скорости', en: 'binary search on speed', count: p => {
        let lo = 1, hi = Math.max(...p.piles), c = 0;
        while (lo < hi) {
          const k = lo + Math.floor((hi - lo) / 2);
          c += p.piles.length;
          if (p.piles.reduce((s, x) => s + Math.ceil(x / k), 0) <= p.h) hi = k; else lo = k + 1;
        }
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Пробуем ещё одну скорость или lo уже сошёлся с hi?', en: 'Do we try one more speed, or have lo and hi met?' },
        keys: { 'koko.ev.probe': { ru: 'проверяем ещё скорость', en: 'check another speed' },
                'koko.ev.done': { ru: 'lo = hi, ответ готов', en: 'lo = hi, the answer is ready' } } },
    ],
    followups: [
      { ru: { q: 'Можно ли сузить диапазон поиска?', a: 'Да: <code>lo = ⌈sum / h⌉</code> — медленнее не успеть даже без простоев, <code>hi = max</code> — быстрее бессмысленно, куча всё равно занимает час. Это экономит пару шагов, асимптотика та же.' },
        en: { q: 'Can you narrow the search range?', a: 'Yes: <code>lo = ⌈sum / h⌉</code>, since slower cannot work even with no idle time, and <code>hi = max</code>, since faster is pointless when a pile takes an hour anyway. It saves a few steps; the complexity is the same.' } },
      { ru: { q: 'Где ещё работает «бинпоиск по ответу»?', a: 'Везде, где проверка «годится ли x» монотонна и считается жадно: грузоподъёмность корабля за D дней (#1011), разбиение массива на k частей с минимальной наибольшей суммой (#410), расстановка шаров на максимальном расстоянии (#1552).' },
        en: { q: 'Where else does “binary search on the answer” apply?', a: 'Wherever the check “does x work” is monotone and greedy to compute: ship capacity within D days (#1011), splitting an array into k parts with the smallest largest sum (#410), placing balls as far apart as possible (#1552).' } },
    ],
    related: [
      { id: 'minEffort', ru: 'тоже решается бинпоиском по ответу: «пройдём ли с усилием ≤ x?» плюс обход', en: 'also solvable by searching the answer: “can we pass with effort ≤ x?” plus a traversal' },
      { id: 'swim', ru: 'бинпоиск по времени t, проверка — достижимость при уровне воды t', en: 'binary search over time t, the check is reachability at water level t' },
    ],
  },

  weightedPick: {
    tricky: [
      { input: { w: '3, 1, 4, 2', r: '3' },
        ru: 'r ровно на границе: prefix[0] = 3. Поиск через ≥ (lower_bound) вернёт 0, и индекс 0 получит 4 значения из 10 вместо 3. Ответ 1.',
        en: 'r sits right on a boundary: prefix[0] = 3. Searching with ≥ (lower_bound) returns 0, and index 0 gets 4 values out of 10 instead of 3. The answer is 1.' },
      { input: { w: '3, 1, 4, 2', r: '9' },
        ru: 'Последнее допустимое значение r = total − 1, ответ 3. Если тянуть r из [0, total], r = 10 не найдёт префикса больше себя и вывалится за массив.',
        en: 'The last valid r = total − 1, the answer is 3. Draw r from [0, total] and r = 10 finds no prefix above it and falls off the array.' },
    ],
    ops: {
      unit: { ru: 'сравнений с r', en: 'comparisons with r' },
      naive: { ru: 'линейно по префиксам', en: 'linear over prefixes', count: p => {
        let sum = 0;
        for (let i = 0; i < p.w.length; i++) { sum += p.w[i]; if (sum > p.r) return i + 1; }
        return p.w.length;
      } },
      ours: { ru: 'upper_bound', en: 'upper_bound', count: p => {
        const prefix = [];
        let sum = 0, lo = 0, hi = p.w.length - 1, c = 0;
        for (const x of p.w) prefix.push(sum += x);
        while (lo < hi) {
          const mid = lo + Math.floor((hi - lo) / 2);
          c++;
          if (prefix[mid] > p.r) hi = mid; else lo = mid + 1;
        }
        return c;
      } },
    },
    predict: [
      { q: { ru: 'prefix[mid] против r: больше, ровно r или меньше?', en: 'prefix[mid] against r: greater, exactly r, or less?' },
        keys: { 'wp.ev.left': { ru: 'больше r: hi = mid', en: 'greater than r: hi = mid' },
                'wp.ev.edge': { ru: 'ровно r: lo = mid + 1', en: 'exactly r: lo = mid + 1' },
                'wp.ev.right': { ru: 'меньше r: lo = mid + 1', en: 'less than r: lo = mid + 1' } } },
    ],
    followups: [
      { ru: { q: 'Веса меняются между выборками. Что делать?', a: 'Префиксный массив пересчитывать O(n) дорого. Дерево Фенвика даёт обновление веса и выбор (спуск по битам дерева) — оба за O(log n).' },
        en: { q: 'The weights change between picks. What now?', a: 'Rebuilding the prefix array is O(n). A Fenwick tree gives both a weight update and a pick (descending through its bits) in O(log n).' } },
      { ru: { q: 'Нужно выбрать k разных индексов без возвращения, за один проход по потоку весов.', a: 'Взвешенная резервуарная выборка (Эфраимидис–Спиракис): каждому элементу ключ <code>u^(1/w)</code>, u ∈ (0, 1), и держим k наибольших ключей в min-куче. O(n log k).' },
        en: { q: 'Pick k distinct indices without replacement, in one pass over a stream of weights.', a: 'Weighted reservoir sampling (Efraimidis–Spirakis): give each item the key <code>u^(1/w)</code>, u ∈ (0, 1), and keep the k largest keys in a min-heap. O(n log k).' } },
    ],
    related: [
      { id: 'psum', ru: 'те же префиксные суммы, только ищем не в словаре, а бинпоиском', en: 'the same prefix sums, searched with binary search instead of a dictionary' },
      { id: 'lisTails', ru: 'там lower_bound (≥), здесь upper_bound (&gt;) — граница решает всё', en: 'lower_bound (≥) there, upper_bound (&gt;) here: the boundary is everything' },
    ],
  },

  median: {
    tricky: [
      { input: { A: '', B: '1, 2, 3, 4' },
        ru: 'A пустой: i может быть только 0. Без стражей −∞/+∞ код полезет в <code>A[-1]</code> и <code>A[0]</code>. Ответ 2,5.',
        en: 'A is empty, so i can only be 0. Without the −∞/+∞ sentinels the code reaches for <code>A[-1]</code> and <code>A[0]</code>. The answer is 2.5.' },
      { input: { A: '1, 2, 3', B: '4, 5, 6, 7' },
        ru: 'Весь A меньше B: верный разрез — i = 3, справа от A ничего нет, там +∞. Ответ 4 — середина из семи.',
        en: 'All of A is below B: the right cut is i = 3, with nothing to the right of A, so +∞ there. The answer is 4, the middle of seven.' },
      { input: { A: '2, 2', B: '2, 2, 2' },
        ru: 'Одни двойки. Если проверять разрез через ≥ вместо &gt;, равные края сочтутся ошибкой, и поиск не сойдётся. Ответ 2.',
        en: 'Nothing but twos. Check the cut with ≥ instead of &gt; and equal edges count as a mistake, so the search never settles. The answer is 2.' },
    ],
    ops: {
      unit: { ru: 'сравнений', en: 'comparisons' },
      naive: { ru: 'слияние до середины', en: 'merge up to the middle', count: p => {
        const total = p.A.length + p.B.length, stop = Math.floor(total / 2);
        let a = 0, b = 0, c = 0;
        for (let k = 0; k <= stop; k++) {
          if (a < p.A.length && b < p.B.length) { c++; if (p.A[a] <= p.B[b]) a++; else b++; }
          else if (a < p.A.length) a++; else b++;
        }
        return c;
      } },
      ours: { ru: 'бинпоиск по разрезу', en: 'binary search on the cut', count: p => {
        const [a, b] = p.A.length <= p.B.length ? [p.A, p.B] : [p.B, p.A];
        const m = a.length, n = b.length, half = Math.floor((m + n + 1) / 2);
        let lo = 0, hi = m, c = 0;
        while (lo <= hi) {
          const i = Math.floor((lo + hi) / 2), j = half - i;
          const al = i > 0 ? a[i - 1] : -Infinity, ar = i < m ? a[i] : Infinity;
          const bl = j > 0 ? b[j - 1] : -Infinity, br = j < n ? b[j] : Infinity;
          c++;
          if (al > br) { hi = i - 1; continue; }
          c++;
          if (bl > ar) { lo = i + 1; continue; }
          return c;
        }
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Разрез уже верный — считаем медиану, или двигаем i ещё раз?', en: 'Is the cut right already, so we compute the median, or do we move i again?' },
        keys: { 'med.ev.cut': { ru: 'ещё один разрез', en: 'one more cut' },
                'med.ev.done': { ru: 'медиана готова', en: 'the median is ready' } } },
    ],
    followups: [
      { ru: { q: 'А k-й по величине элемент двух массивов?', a: 'Тот же разрез, только слева должно оказаться k чисел: <code>half = k</code>, i ищем в [max(0, k − n), min(k, m)]. Ответ — больший из левых краёв.' },
        en: { q: 'What about the k-th smallest element of the two arrays?', a: 'The same cut, but the left side must hold k numbers: <code>half = k</code>, with i searched in [max(0, k − n), min(k, m)]. The answer is the larger left edge.' } },
      { ru: { q: 'Зачем искать именно по меньшему массиву?', a: 'Тогда <code>j = half − i</code> всегда попадает в [0, n] и не нужно его зажимать, а шагов — log(min(m, n)).' },
        en: { q: 'Why search over the smaller array?', a: 'Then <code>j = half − i</code> always lands in [0, n] with no clamping, and it takes log(min(m, n)) steps.' } },
      { ru: { q: 'Массивов не два, а k. Как найти медиану?', a: 'Бинпоиск по значению: для кандидата x считаем, сколько чисел ≤ x, — бинпоиском в каждом массиве. Это O(k · log n · log V), где V — диапазон значений.' },
        en: { q: 'There are k arrays, not two. How do you find the median?', a: 'Binary search over the value: for a candidate x count the numbers ≤ x with a binary search in each array. That is O(k · log n · log V), where V is the value range.' } },
    ],
    related: [
      { id: 'mergeTwo', ru: 'наивное решение — это слияние, которое там делают целиком', en: 'the naive solution is the merge that problem does in full' },
      { id: 'medianStream', ru: 'та же граница «левая половина | правая», но на двух кучах и для потока', en: 'the same left-half | right-half split, kept by two heaps for a stream' },
    ],
  },

  lisTails: {
    tricky: [
      { input: { nums: '3, 3, 3, 3' },
        ru: 'Одни повторы. Если искать upper_bound (&gt;) вместо lower_bound (≥), каждая тройка допишется в tails и выйдет 4. Строго возрастающая — длины 1.',
        en: 'All repeats. Search with upper_bound (&gt;) instead of lower_bound (≥) and every 3 is appended, giving 4. The strictly increasing answer is 1.' },
      { input: { nums: '1, 5, 6, 2' },
        ru: 'Длина 3 верна, но tails = [1, 2, 6] — не подпоследовательность: 2 стоит после 6. Возвращать tails как ответ нельзя; настоящая LIS — [1, 5, 6].',
        en: 'Length 3 is right, but tails = [1, 2, 6] is not a subsequence: 2 comes after 6. You cannot return tails as the answer; the real LIS is [1, 5, 6].' },
    ],
    ops: {
      unit: { ru: 'сравнений', en: 'comparisons' },
      naive: { ru: 'DP O(n²)', en: 'O(n²) DP', count: p => (p.nums.length * (p.nums.length - 1)) / 2 },
      ours: { ru: 'хвосты + бинпоиск', en: 'tails + binary search', count: p => {
        const tails = [];
        let c = 0;
        for (const x of p.nums) {
          let lo = 0, hi = tails.length;
          while (lo < hi) { const m = (lo + hi) >> 1; c++; if (tails[m] < x) lo = m + 1; else hi = m; }
          tails[lo] = x;
        }
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Куда встанет следующее x?', en: 'Where does the next x go?' },
        keys: { 'lt.ev.append': { ru: 'в конец, tails растёт', en: 'at the end, tails grows' },
                'lt.ev.replace': { ru: 'заменит хвост побольше', en: 'it replaces a larger tail' },
                'lt.ev.equal': { ru: 'такой хвост уже есть', en: 'that tail is already there' } } },
    ],
    followups: [
      { ru: { q: 'А если подпоследовательность неубывающая, равные можно?', a: 'Поменяй lower_bound на upper_bound: равное x тогда встаёт после своих двойников и продлевает цепочку.' },
        en: { q: 'What if the subsequence may be non-decreasing, equal values allowed?', a: 'Swap lower_bound for upper_bound: an equal x then goes after its twins and extends the run.' } },
      { ru: { q: 'Как применить к конвертам «матрёшкой» (#354)?', a: 'Сортируй по ширине по возрастанию, а при равной ширине — по высоте по убыванию, и ищи LIS по высотам. Убывание при равной ширине не даёт вложить конверт в такой же ширины.' },
        en: { q: 'How does it apply to Russian doll envelopes (#354)?', a: 'Sort by width ascending and, for equal widths, by height descending, then take the LIS of the heights. The descending tie-break stops an envelope from nesting into one of the same width.' } },
      { ru: { q: 'Можно ли так же посчитать число самых длинных подпоследовательностей (#673)?', a: 'Одними хвостами — нет, они теряют, сколькими способами достигнута длина. Нужна DP O(n²) с парой (длина, количество) или дерево отрезков по значениям за O(n log n).' },
        en: { q: 'Can the same trick count the longest subsequences (#673)?', a: 'Not with tails alone: they forget how many ways each length was reached. You need an O(n²) DP over (length, count) pairs or a segment tree over values for O(n log n).' } },
    ],
    related: [
      { id: 'lis', ru: 'та же задача квадратичной DP — видно, что именно ускоряет бинпоиск', en: 'the same problem as an O(n²) DP: shows exactly what binary search speeds up' },
      { id: 'weightedPick', ru: 'там upper_bound, здесь lower_bound — один знак меняет ответ', en: 'upper_bound there, lower_bound here: one sign changes the answer' },
    ],
  },

  divideBits: {
    tricky: [
      { input: { dividend: '-2147483648', divisor: '-1' },
        ru: 'Единственное переполнение: 2³¹ в int не помещается. Без отдельной проверки получится снова −2147483648 или исключение; ответ 2147483647.',
        en: 'The only overflow: 2³¹ does not fit an int. Without a dedicated check you get −2147483648 again or an exception; the answer is 2147483647.' },
      { input: { dividend: '-2147483648', divisor: '1' },
        ru: '<code>Math.Abs(int.MinValue)</code> в C# бросает <code>OverflowException</code>: модули надо брать в long. Ответ −2147483648.',
        en: '<code>Math.Abs(int.MinValue)</code> throws <code>OverflowException</code> in C#: take the absolute values in long. The answer is −2147483648.' },
      { input: { dividend: '-7', divisor: '2' },
        ru: 'Деление округляет к нулю: −3, а не −4. Сдвиг вправо отрицательного числа (<code>-7 &gt;&gt; 1</code>) округлил бы вниз.',
        en: 'Division truncates toward zero: −3, not −4. Shifting a negative number right (<code>-7 &gt;&gt; 1</code>) would round down.' },
    ],
    ops: {
      unit: { ru: 'шагов цикла', en: 'loop steps' },
      naive: { ru: 'вычитать b по одному разу', en: 'subtract b one at a time', count: p => {
        if (p.dividend === -2147483648 && p.divisor === -1) return 0;
        return Math.floor(Math.abs(p.dividend) / Math.abs(p.divisor));
      } },
      ours: { ru: 'по битам частного', en: 'bit by bit', count: p => {
        if (p.dividend === -2147483648 && p.divisor === -1) return 0;
        const a = Math.abs(p.dividend), b = Math.abs(p.divisor);
        for (let k = 31; k >= 0; k--) if (Math.floor(a / 2 ** k) >= b) return k + 1;
        return 0;
      } },
    },
    predict: [
      { q: { ru: 'Помещается ли b · 2^k в остаток a?', en: 'Does b · 2^k fit into what is left of a?' },
        keys: { 'div.ev.fit': { ru: 'да: вычитаем, бит 1', en: 'yes: subtract, bit 1' },
                'div.ev.skip': { ru: 'нет: бит 0', en: 'no: bit 0' } } },
      { q: { ru: 'Какой знак у результата?', en: 'What is the sign of the result?' },
        keys: { 'div.ev.signPos': { ru: 'неотрицательный', en: 'non-negative' },
                'div.ev.signNeg': { ru: 'отрицательный', en: 'negative' },
                'div.ev.overflow': { ru: 'переполнение', en: 'overflow' } } },
    ],
    followups: [
      { ru: { q: 'Нужен ещё и остаток. Где он?', a: 'Это то, что осталось в a после всех вычитаний. В C# знак остатка совпадает со знаком делимого: −7 % 2 = −1.' },
        en: { q: 'You also need the remainder. Where is it?', a: 'It is what is left in a after all subtractions. In C# the remainder takes the dividend’s sign: −7 % 2 = −1.' } },
      { ru: { q: 'А если long тоже нельзя?', a: 'Работай в отрицательных числах: отрицательный диапазон int на одно значение шире, −2³¹ в нём есть. Сравнения переворачиваются, сдвиги b делай, пока <code>b &gt;= int.MinValue &gt;&gt; 1</code>.' },
        en: { q: 'And if long is off-limits too?', a: 'Work with negatives: the negative int range is one value wider, so −2³¹ fits. The comparisons flip, and you shift b only while <code>b &gt;= int.MinValue &gt;&gt; 1</code>.' } },
      { ru: { q: 'Как умножить без <code>*</code>?', a: 'Тот же разбор по битам, только наоборот: для каждого единичного бита b прибавляй <code>a &lt;&lt; k</code> («русское крестьянское» умножение). O(32) сложений.' },
        en: { q: 'How do you multiply without <code>*</code>?', a: 'The same bit walk in reverse: for every set bit k of b add <code>a &lt;&lt; k</code> (Russian peasant multiplication). O(32) additions.' } },
    ],
    related: [
      { id: 'popcount', ru: 'вычитаний в нашем делении ровно столько, сколько единиц в частном', en: 'our division subtracts exactly as many times as the quotient has set bits' },
      { id: 'koko', ru: 'бит за битом сверху — это бинпоиск по ответу', en: 'deciding bits from the top is a binary search on the answer' },
    ],
  },

  /* ================= stack ================= */
  parens: {
    tricky: [
      { input: { s: '([)]' },
        ru: 'Три счётчика (по одному на тип) сойдутся в ноль и скажут true. Важен порядок: ) закрывает [, ответ false.',
        en: 'Three counters, one per bracket type, all return to zero and say true. Order matters: ) closes [, so the answer is false.' },
      { input: { s: '((' },
        ru: 'Ни одной ошибки по ходу, но в конце стек не пуст. Без финальной проверки <code>stack.Count == 0</code> вернётся true; ответ false.',
        en: 'No error along the way, but the stack is not empty at the end. Skip the final <code>stack.Count == 0</code> check and you return true; the answer is false.' },
      { input: { s: ')(' },
        ru: 'Закрывающая на пустом стеке: <code>Pop()</code> без проверки бросит <code>InvalidOperationException</code>. Ответ false.',
        en: 'A closing bracket on an empty stack: an unchecked <code>Pop()</code> throws <code>InvalidOperationException</code>. The answer is false.' },
    ],
    ops: {
      unit: { ru: 'прочитанных символов', en: 'characters read' },
      naive: { ru: 'стирать пары (), [], {} до упора', en: 'erase (), [], {} pairs until stuck', count: p => {
        let t = p.s, c = 0;
        for (;;) {
          c += t.length;
          const u = t.replace(/\(\)|\[\]|\{\}/g, '');
          if (u === t) return c;
          t = u;
        }
      } },
      ours: { ru: 'стек', en: 'stack', count: p => {
        const pairs = { ')': '(', ']': '[', '}': '{' }, stack = [];
        let c = 0;
        for (const ch of p.s) {
          c++;
          if (!pairs[ch]) { stack.push(ch); continue; }
          if (stack.pop() !== pairs[ch]) break;
        }
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Следующий символ: в стек, снимает пару или ошибка?', en: 'Next character: onto the stack, closes a pair, or an error?' },
        keys: { 'par.ev.push': { ru: 'кладём в стек', en: 'push it' },
                'par.ev.pop': { ru: 'закрывает вершину', en: 'it closes the top' },
                'par.ev.bad': { ru: 'не та пара — false', en: 'wrong pair — false' } } },
    ],
    followups: [
      { ru: { q: 'Сколько скобок минимум удалить, чтобы строка стала правильной (#1249)?', a: 'Стек индексов открывающих: закрывающую без пары помечаем на удаление, а оставшиеся в стеке открывающие удаляем в конце. O(n).' },
        en: { q: 'What is the fewest brackets to remove to make the string valid (#1249)?', a: 'A stack of opening indices: mark any unmatched closing bracket for removal, and remove whatever openers remain on the stack at the end. O(n).' } },
      { ru: { q: 'Найди длину самой длинной правильной подстроки (#32).', a: 'Стек индексов с «дном» −1: на ( кладём индекс, на ) снимаем; если стек опустел — кладём текущий индекс как новое дно, иначе длина = i − вершина.' },
        en: { q: 'Find the length of the longest valid substring (#32).', a: 'A stack of indices with a −1 “floor”: push on (, pop on ); if the stack is empty, push i as the new floor, otherwise the length is i − top.' } },
    ],
    related: [
      { id: 'daily', ru: 'стек держит то, что ещё ждёт своей пары', en: 'the stack holds whatever still waits for its match' },
      { id: 'maxDepth', ru: 'глубина вложенности скобок — это высота стека, как глубина дерева', en: 'bracket nesting depth is the stack height, like tree depth' },
    ],
  },

  daily: {
    tricky: [
      { input: { t: '70, 70, 70' },
        ru: 'Равные дни теплее не делают. Если выталкивать по <code>&lt;=</code>, получится [1, 1, 0]; ответ [0, 0, 0].',
        en: 'An equal day is not warmer. Pop on <code>&lt;=</code> and you get [1, 1, 0]; the answer is [0, 0, 0].' },
      { input: { t: '73, 72, 71, 70, 100' },
        ru: 'Стек копит четыре дня, а 100 выталкивает их разом: один шаг дорогой, но каждый день выталкивается один раз, в сумме O(n). Ответ [4, 3, 2, 1, 0].',
        en: 'The stack piles up four days and 100 pops them all at once: one expensive step, but each day is popped once, O(n) in total. The answer is [4, 3, 2, 1, 0].' },
    ],
    ops: {
      unit: { ru: 'сравнений температур', en: 'temperature comparisons' },
      naive: { ru: 'для каждого дня смотреть вперёд', en: 'look ahead from every day', count: p => {
        let c = 0;
        for (let i = 0; i < p.t.length; i++) for (let j = i + 1; j < p.t.length; j++) { c++; if (p.t[j] > p.t[i]) break; }
        return c;
      } },
      ours: { ru: 'монотонный стек', en: 'monotonic stack', count: p => {
        const stack = [];
        let c = 0;
        p.t.forEach((x, i) => {
          while (stack.length) { c++; if (p.t[stack.at(-1)] < x) stack.pop(); else break; }
          stack.push(i);
        });
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Текущий день выталкивает вершину стека или ложится сверху?', en: 'Does the current day pop the top of the stack, or go on top?' },
        keys: { 'stack.ev.pop': { ru: 'выталкивает: теплее вершины', en: 'pops: warmer than the top' },
                'stack.ev.push': { ru: 'ложится сверху', en: 'goes on top' } } },
    ],
    followups: [
      { ru: { q: 'Можно ли без стека, O(1) доп. памяти?', a: 'Да, идя справа налево: для дня i прыгаем <code>j = i + 1</code>, затем <code>j += ans[j]</code>, пока <code>t[j] &lt;= t[i]</code>; если <code>ans[j] == 0</code>, теплее не будет. Прыжки по готовым ответам дают амортизированное O(n).' },
        en: { q: 'Can you do it without a stack, O(1) extra memory?', a: 'Yes, going right to left: for day i jump <code>j = i + 1</code>, then <code>j += ans[j]</code> while <code>t[j] &lt;= t[i]</code>; if <code>ans[j] == 0</code> no warmer day exists. Jumping over finished answers is amortised O(n).' } },
      { ru: { q: 'А если массив кольцевой (#503)?', a: 'Пройди индексы от 0 до 2n − 1 и бери <code>t[i % n]</code>, а в стек клади только индексы первого круга. Ответ остаётся O(n).' },
        en: { q: 'What if the array is circular (#503)?', a: 'Run i from 0 to 2n − 1 and read <code>t[i % n]</code>, pushing only first-round indices. It stays O(n).' } },
    ],
    related: [
      { id: 'slidingMax', ru: 'тот же монотонный приём, только в деке и с окном', en: 'the same monotonic trick, in a deque with a window' },
      { id: 'trap', ru: 'дождевую воду тоже считают монотонным стеком — по слоям между стенками', en: 'trapped rain water also falls to a monotonic stack, layer by layer between walls' },
    ],
  },

  minStack: {
    tricky: [
      { input: { ops: 'push 3, push 1, pop, getMin' },
        ru: 'Одна переменная <code>min</code> не помнит прошлого: после pop 1 она так и останется 1. Ответ getMin — 3.',
        en: 'A single <code>min</code> variable has no history: after pop 1 it still says 1. The answer to getMin is 3.' },
      { input: { ops: 'push 2, push 2, pop, getMin' },
        ru: 'Повтор минимума. В варианте с двумя стеками, если класть во второй только при <code>x &lt; min</code>, первый pop снимет единственную двойку оттуда. Ответ getMin — 2.',
        en: 'A repeated minimum. In the two-stack version, pushing onto the min stack only when <code>x &lt; min</code> lets the first pop remove its only 2. The answer to getMin is 2.' },
    ],
    ops: {
      unit: { ru: 'шагов', en: 'steps' },
      naive: { ru: 'getMin просматривает стек', en: 'getMin scans the stack', count: p => {
        let size = 0, c = 0;
        for (const [op] of p.ops) {
          if (op === 'push') { size++; c++; } else if (op === 'pop') { size--; c++; } else c += size;
        }
        return c;
      } },
      ours: { ru: 'пары (значение, минимум)', en: '(value, min) pairs', count: p => p.ops.length },
    },
    predict: [
      { q: { ru: 'Что следующая операция сделает со стеком пар?', en: 'What does the next operation do to the stack of pairs?' },
        keys: { 'mins.ev.push': { ru: 'кладёт пару', en: 'pushes a pair' },
                'mins.ev.pop': { ru: 'снимает пару', en: 'pops a pair' },
                'mins.ev.get': { ru: 'читает минимум с вершины', en: 'reads the min off the top' } } },
    ],
    followups: [
      { ru: { q: 'Можно ли хранить по одному числу на элемент?', a: 'Да: храни разность <code>x − min</code> в long и одну переменную min. Отрицательная разность значит, что x стал новым минимумом; при pop старый минимум восстанавливается как <code>min − diff</code>.' },
        en: { q: 'Can you store one number per element?', a: 'Yes: store the difference <code>x − min</code> as a long plus a single min variable. A negative difference marks a new minimum; on pop the old one comes back as <code>min − diff</code>.' } },
      { ru: { q: 'А стек с <code>popMax</code>, который снимает максимум из середины (#716)?', a: 'Пары тут не помогут. Нужен двусвязный список плюс упорядоченная структура (SortedSet по (значение, номер)): push, pop и popMax за O(log n).' },
        en: { q: 'And a stack with <code>popMax</code> that removes the maximum from the middle (#716)?', a: 'Pairs do not help there. You need a doubly linked list plus an ordered structure (a SortedSet over (value, id)): push, pop and popMax in O(log n).' } },
    ],
    related: [
      { id: 'slidingMax', ru: 'из двух таких стеков складывается очередь с максимумом — ещё одно решение окна', en: 'two such stacks make a max-queue, another way to solve the window' },
      { id: 'lru', ru: 'тоже дизайн: обычную структуру дополняем, чтобы ответ был за O(1)', en: 'also design: augment a plain structure so the answer costs O(1)' },
    ],
  },

  histogram: {
    tricky: [
      { input: { heights: '2, 1, 2' },
        ru: 'Ширину надо мерить от нового верха стека, а не от вытолкнутого индекса. Иначе у столбика 1 ширина выйдет 2 вместо 3 и ответ 2. Правильно: 1 × 3 = 3.',
        en: 'Measure the width from the new stack top, not from the popped index. Otherwise bar 1 gets width 2 instead of 3 and you return 2. Correct: 1 × 3 = 3.' },
      { input: { heights: '1, 2, 3, 4, 5' },
        ru: 'Высоты только растут, по ходу никто не выталкивается. Без нулевого стража в конце стек так и не разберётся и ответ будет 0; правильно 9 (3 × 3).',
        en: 'Heights only grow, so nothing is popped along the way. Without a zero sentinel at the end the stack is never drained and you return 0; the answer is 9 (3 × 3).' },
    ],
    ops: {
      unit: { ru: 'шагов', en: 'steps' },
      naive: { ru: 'все пары границ с бегущим минимумом', en: 'all pairs of edges with a running min', count: p => (p.heights.length * (p.heights.length + 1)) / 2 },
      ours: { ru: 'монотонный стек: push и pop', en: 'monotonic stack: push and pop', count: p => 2 * p.heights.length },
    },
    predict: [
      { q: { ru: 'Следующий столбик выталкивает вершину или ложится на стек?', en: 'Does the next bar pop the top, or go onto the stack?' },
        keys: { 'hist.ev.pop': { ru: 'выталкивает: не выше вершины', en: 'pops: not taller than the top' },
                'hist.ev.push': { ru: 'ложится на стек', en: 'goes onto the stack' } } },
    ],
    followups: [
      { ru: { q: 'Сумма минимумов всех подмассивов (#907) — при чём тут этот стек?', a: 'Тот же «ближайший меньший слева и справа»: элемент h[j] — минимум ровно для <code>(j − left) · (right − j)</code> подмассивов. Один проход стеком, O(n); равные разводим строгим и нестрогим сравнением.' },
        en: { q: 'Sum of subarray minimums (#907) — how is this stack involved?', a: 'The same “nearest smaller on both sides”: h[j] is the minimum of exactly <code>(j − left) · (right − j)</code> subarrays. One stack pass, O(n); ties are split by a strict and a non-strict comparison.' } },
      { ru: { q: 'Есть ли решение без стека?', a: 'Разделяй и властвуй: самый низкий столбик даёт прямоугольник на всю ширину, дальше рекурсия слева и справа от него. С деревом отрезков для минимума — O(n log n), без него на отсортированном входе O(n²).' },
        en: { q: 'Is there a solution without a stack?', a: 'Divide and conquer: the lowest bar spans the full width, then recurse left and right of it. With a segment tree for the minimum it is O(n log n); without one, sorted input makes it O(n²).' } },
    ],
    related: [
      { id: 'maxRect', ru: 'эта же гистограмма, построенная для каждой строки матрицы', en: 'this very histogram, built for every row of a matrix' },
      { id: 'trap', ru: 'тоже столбики, и тоже решается монотонным стеком', en: 'bars again, and also solvable with a monotonic stack' },
    ],
  },

  /* ================= linked list ================= */
  cycle: {
    tricky: [
      { input: { n: '1', pos: '-1' },
        ru: 'Один узел без цикла. Код, который сразу берёт <code>fast.next.next</code> без проверки <code>fast.next</code>, упадёт с NullReferenceException. Ответ false.',
        en: 'One node, no cycle. Code that grabs <code>fast.next.next</code> without checking <code>fast.next</code> throws NullReferenceException. The answer is false.' },
      { input: { n: '2', pos: '-1' },
        ru: 'Если сравнить <code>slow == fast</code> до первого шага, они равны (оба на голове), и любой список «зациклится». Ответ false.',
        en: 'Compare <code>slow == fast</code> before the first move and they are equal (both at the head), so every list “has a cycle”. The answer is false.' },
      { input: { n: '9', pos: '8' },
        ru: 'Хвост из восьми узлов и петля последнего узла на себя: fast долетает туда первым и ждёт slow. Ответ true.',
        en: 'An eight-node tail and the last node looping onto itself: fast gets there first and waits for slow. The answer is true.' },
    ],
    ops: {
      unit: { ru: 'переходов по ссылкам', en: 'link hops' },
      naive: { ru: 'O(1) памяти: каждый раз проверять путь с головы', en: 'O(1) memory: recheck the path from the head', count: p => naiveRevisitHops(listNext(p.n, p.pos)) },
      ours: { ru: 'черепаха и заяц', en: 'tortoise and hare', count: p => floydHops(listNext(p.n, p.pos), false) },
    },
    predict: [
      { q: { ru: 'После следующего хода: встретятся, разойдутся или fast упрётся в null?', en: 'After the next move: do they meet, pass on, or does fast hit null?' },
        keys: { 'cyc.ev.move': { ru: 'идут дальше', en: 'they move on' },
                'cyc.ev.meet': { ru: 'встретились — цикл', en: 'they meet — a cycle' },
                'cyc.ev.none': { ru: 'fast дошёл до null', en: 'fast reached null' } } },
    ],
    followups: [
      { ru: { q: 'Как узнать длину цикла?', a: 'После встречи оставь один указатель на месте, а другой веди по одной ссылке, пока он не вернётся. Число шагов и есть λ.' },
        en: { q: 'How do you get the cycle length?', a: 'After they meet, park one pointer and walk the other one link at a time until it comes back. The step count is λ.' } },
      { ru: { q: 'Почему fast ходит на 2, а не на 3?', a: 'При скорости 2 расстояние до slow сокращается ровно на 1 за ход, перепрыгнуть нельзя. При 3 оно меняется на 2, и в цикле чётной длины нечётный разрыв может не закрыться никогда.' },
        en: { q: 'Why does fast move by 2 and not by 3?', a: 'At speed 2 the gap to slow shrinks by exactly 1 per move, so it cannot be skipped. At 3 it changes by 2, and in an even-length cycle an odd gap may never close.' } },
      { ru: { q: 'Можно ли решить, если разрешено портить список?', a: 'Да: перенаправляй каждый пройденный узел на общий узел-метку; если пришли в узел, который уже указывает на метку, — цикл. O(1) памяти, но список уничтожен.' },
        en: { q: 'Can you solve it if you may destroy the list?', a: 'Yes: point every visited node at a shared marker node; reaching a node that already points at the marker means a cycle. O(1) memory, but the list is gone.' } },
    ],
    related: [
      { id: 'course', ru: 'цикл в ориентированном графе: Kahn не может взять все курсы', en: 'a cycle in a directed graph: Kahn cannot take every course' },
      { id: 'unionFind', ru: 'цикл в неориентированном графе: ребро, концы которого уже в одном множестве', en: 'a cycle in an undirected graph: an edge whose ends are already in one set' },
    ],
  },

  cycleEntry: {
    tricky: [
      { input: { n: '5', pos: '0' },
        ru: 'Цикл с самой головы: μ = 0, встреча сразу в узле 0, и вторая фаза не делает ни шага. Цикл do-while сначала шагнёт и проскочит вход. Ответ — узел 0.',
        en: 'The cycle starts at the head: μ = 0, they meet right at node 0, and phase two takes no steps. A do-while loop moves first and overshoots the entrance. The answer is node 0.' },
      { input: { n: '9', pos: '8' },
        ru: 'Хвост μ = 8 длиннее петли λ = 1: во второй фазе slow восемь раз крутится на одном узле, пока p идёт с головы. Ответ — узел 8.',
        en: 'The tail μ = 8 is longer than the loop λ = 1: in phase two slow spins on one node eight times while p walks from the head. The answer is node 8.' },
    ],
    ops: {
      unit: { ru: 'переходов по ссылкам', en: 'link hops' },
      naive: { ru: 'O(1) памяти: каждый раз проверять путь с головы', en: 'O(1) memory: recheck the path from the head', count: p => naiveRevisitHops(listNext(p.n, p.pos)) },
      ours: { ru: 'Флойд, две фазы', en: 'Floyd, two phases', count: p => floydHops(listNext(p.n, p.pos), true) },
    },
    predict: [
      { q: { ru: 'Первая фаза: после следующего хода встретятся, пойдут дальше или fast упрётся в null?', en: 'Phase one: after the next move, do they meet, go on, or does fast hit null?' },
        keys: { 'cye.ev.move': { ru: 'идут дальше', en: 'they move on' },
                'cye.ev.meet': { ru: 'встретились', en: 'they meet' },
                'cye.ev.none': { ru: 'цикла нет', en: 'no cycle' } } },
    ],
    followups: [
      { ru: { q: 'Как найти, где пересекаются два списка (#160)?', a: 'Два указателя, и каждый, дойдя до конца, перескакивает на голову чужого списка. Оба пройдут a + b узлов и встретятся в точке пересечения (или оба в null). То же выравнивание расстояний, что во второй фазе.' },
        en: { q: 'How do you find where two lists intersect (#160)?', a: 'Two pointers; each one, on reaching the end, jumps to the other list’s head. Both cover a + b nodes and meet at the intersection (or both at null). The same distance-evening as in phase two.' } },
      { ru: { q: 'А длину хвоста μ и длину цикла λ?', a: 'μ — это число шагов второй фазы. λ — пройди от входа один круг. Обе величины даёт тот же O(1) по памяти.' },
        en: { q: 'And the tail length μ and the cycle length λ?', a: 'μ is the number of steps in phase two. For λ, walk one lap from the entrance. Both come with the same O(1) memory.' } },
    ],
    related: [
      { id: 'cycle', ru: 'первая фаза — это она целиком', en: 'phase one is exactly that problem' },
      { id: 'removeNth', ru: 'два указателя с выверенным расстоянием между ними', en: 'two pointers with a carefully set distance between them' },
    ],
  },

  removeNth: {
    tricky: [
      { input: { values: '1, 2, 3, 4, 5', n: '5' },
        ru: 'Удаляем саму голову. Без фиктивного узла slow не на чем остановить «перед» ней — нужна отдельная ветка. Ответ [2, 3, 4, 5].',
        en: 'We remove the head itself. Without a dummy node there is nothing for slow to stop on “before” it, so you need a special case. The answer is [2, 3, 4, 5].' },
      { input: { values: '7', n: '1' },
        ru: 'Единственный узел: ответ — пустой список. Код, который возвращает <code>head</code>, а не <code>dummy.next</code>, вернёт удалённый узел.',
        en: 'The only node: the answer is an empty list. Code that returns <code>head</code> instead of <code>dummy.next</code> returns the removed node.' },
    ],
    ops: {
      unit: { ru: 'переходов по ссылкам', en: 'link hops' },
      naive: { ru: 'два прохода: длина, потом L − n', en: 'two passes: length, then L − n', count: p => 2 * p.values.length - p.n },
      ours: { ru: 'один проход, два указателя', en: 'one pass, two pointers', count: p => 2 * p.values.length - p.n + 1 },
    },
    predict: [
      { q: { ru: 'fast ещё уходит в отрыв или оба уже идут вместе?', en: 'Is fast still pulling ahead, or do both move together now?' },
        keys: { 'list.ev.lead': { ru: 'fast уходит вперёд один', en: 'fast moves ahead alone' },
                'list.ev.walk': { ru: 'шагают оба', en: 'both step' } } },
    ],
    followups: [
      { ru: { q: 'Как найти середину списка за один проход (#876)?', a: 'Тот же дуэт, но не с отставанием, а с разной скоростью: fast +2, slow +1. Когда fast упрётся в конец, slow стоит на середине.' },
        en: { q: 'How do you find the middle of the list in one pass (#876)?', a: 'The same duo, with different speeds instead of a gap: fast +2, slow +1. When fast hits the end, slow is at the middle.' } },
      { ru: { q: 'Можно ли честно за один проход, без второго указателя?', a: 'Да, если хранить последние n + 1 узлов в кольцевом буфере: в конце предшественник удаляемого — самый старый в буфере. Цена — O(n) памяти.' },
        en: { q: 'Can you do it in a truly single pass without a second pointer?', a: 'Yes, by keeping the last n + 1 nodes in a ring buffer: at the end the predecessor of the target is the oldest one in it. The cost is O(n) memory.' } },
    ],
    related: [
      { id: 'maxAvg', ru: 'зазор между fast и slow — это окно фиксированной длины', en: 'the gap between fast and slow is a fixed-size window' },
      { id: 'mergeTwo', ru: 'фиктивный узел перед головой убирает особые случаи', en: 'a dummy node before the head removes the special cases' },
    ],
  },

  reverse: {
    tricky: [
      { input: { values: '7' },
        ru: 'Один узел. После цикла <code>cur</code> равен null, а новая голова — <code>prev</code>; вернёшь cur — потеряешь список. Ответ [7].',
        en: 'One node. After the loop <code>cur</code> is null and the new head is <code>prev</code>; return cur and the list is gone. The answer is [7].' },
      { input: { values: '1, 2' },
        ru: 'В рекурсивном развороте легко забыть <code>head.next = null</code>: тогда 1 и 2 указывают друг на друга, и печать списка не кончится. Ответ [2, 1].',
        en: 'In the recursive version it is easy to forget <code>head.next = null</code>: then 1 and 2 point at each other and printing never ends. The answer is [2, 1].' },
    ],
    ops: {
      unit: { ru: 'переходов по ссылкам', en: 'link hops' },
      naive: { ru: 'O(1) памяти: искать каждый предыдущий узел с головы', en: 'O(1) memory: find every previous node from the head', count: p => (p.values.length * (p.values.length - 1)) / 2 },
      ours: { ru: 'prev / cur', en: 'prev / cur', count: p => p.values.length },
    },
    predict: [
      { q: { ru: 'cur ещё не null — разворачиваем следующую ссылку, или пора отдавать prev?', en: 'Is cur still non-null, so we flip the next link, or is it time to return prev?' },
        keys: { 'rev.ev.step': { ru: 'разворачиваем ссылку', en: 'flip a link' },
                'rev.ev.done': { ru: 'cur = null, ответ prev', en: 'cur = null, return prev' } } },
    ],
    followups: [
      { ru: { q: 'Проверь, что список — палиндром, за O(1) памяти (#234).', a: 'Найди середину (slow/fast), разверни вторую половину, сравни с первой, а потом разверни обратно, чтобы вернуть список вызывающему коду в прежнем виде.' },
        en: { q: 'Check that the list is a palindrome in O(1) memory (#234).', a: 'Find the middle (slow/fast), reverse the second half, compare it with the first, then reverse it back so the caller gets the list unchanged.' } },
      { ru: { q: 'А двусвязный список?', a: 'В каждом узле меняем местами <code>prev</code> и <code>next</code>; новой головой становится бывший хвост. Тоже O(n) и O(1).' },
        en: { q: 'And a doubly linked list?', a: 'Swap <code>prev</code> and <code>next</code> in every node; the old tail becomes the head. Also O(n) and O(1).' } },
      { ru: { q: 'Список неизменяемый. Как развернуть?', a: 'Строим новый, добавляя каждый элемент в начало: n новых узлов, старый список цел. Так устроен <code>List.rev</code> в F#.' },
        en: { q: 'The list is immutable. How do you reverse it?', a: 'Build a new one by prepending each element: n new nodes, and the old list stays intact. That is how F#’s <code>List.rev</code> works.' } },
    ],
    related: [
      { id: 'reverseK', ru: 'тот же разворот, только кусками по k', en: 'the same reversal, in chunks of k' },
      { id: 'palindrome', ru: 'палиндром проверяют с двух концов; у списка второй конец добывают разворотом', en: 'a palindrome is checked from both ends; a list gets its far end by reversing' },
    ],
  },

  mergeTwo: {
    tricky: [
      { input: { list1: '', list2: '1, 3' },
        ru: 'Один список пуст. Код, который сразу читает <code>list1.val</code>, упадёт; с dummy цикл просто не начнётся и пришьётся весь list2. Ответ [1, 3].',
        en: 'One list is empty. Code that reads <code>list1.val</code> right away crashes; with a dummy the loop never starts and all of list2 is attached. The answer is [1, 3].' },
      { input: { list1: '5, 6', list2: '1, 2, 3' },
        ru: 'list2 кончается раньше, а list1 целиком больше. Забудешь пришить остаток после цикла — получишь [1, 2, 3]; ответ [1, 2, 3, 5, 6].',
        en: 'list2 runs out first and all of list1 is larger. Forget to attach the rest after the loop and you get [1, 2, 3]; the answer is [1, 2, 3, 5, 6].' },
    ],
    ops: {
      unit: { ru: 'сравнений', en: 'comparisons' },
      naive: { ru: 'вставлять узлы list2 в list1 с головы', en: 'insert list2 nodes into list1 from the head', count: p => {
        const arr = [...p.list1];
        let c = 0;
        for (const y of p.list2) {
          let i = 0;
          while (i < arr.length) { c++; if (arr[i] > y) break; i++; }
          arr.splice(i, 0, y);
        }
        return c;
      } },
      ours: { ru: 'слияние двух голов', en: 'merge the two heads', count: p => {
        let a = 0, b = 0, c = 0;
        while (a < p.list1.length && b < p.list2.length) { c++; if (p.list1[a] <= p.list2[b]) a++; else b++; }
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Какой узел пришиваем к tail следующим?', en: 'Which node goes onto tail next?' },
        keys: { 'm2.ev.takeA': { ru: 'голову list1, она меньше', en: 'list1’s head, it is smaller' },
                'm2.ev.takeB': { ru: 'голову list2, она меньше', en: 'list2’s head, it is smaller' },
                'm2.ev.tie': { ru: 'равны — берём из list1', en: 'equal — take from list1' },
                'm2.ev.rest': { ru: 'один кончился — пришиваем остаток', en: 'one ran out — attach the rest' } } },
    ],
    followups: [
      { ru: { q: 'Слить два отсортированных массива на месте, когда в первом есть свободный хвост (#88)?', a: 'Сливай с конца: три индекса — конец данных первого, конец второго и конец всего буфера. Больший пишется в конец, и ничего не затирается. O(m + n), O(1).' },
        en: { q: 'Merge two sorted arrays in place when the first has a free tail (#88)?', a: 'Merge from the back: three indices — the end of the first’s data, the end of the second, and the end of the buffer. The larger goes to the end and nothing is overwritten. O(m + n), O(1).' } },
      { ru: { q: 'А рекурсивная версия?', a: 'Короче: меньшая голова + слияние остатков. Но глубина рекурсии m + n, и на длинных списках будет переполнение стека.' },
        en: { q: 'And the recursive version?', a: 'Shorter: the smaller head plus the merge of the rest. But recursion goes m + n deep, and long lists overflow the stack.' } },
      { ru: { q: 'Нужно объединение без повторов, как у множеств.', a: 'Сливай так же, но при равных головах бери одну и сдвигай обе, а перед пришиванием пропускай значения, равные текущему хвосту.' },
        en: { q: 'You need a union without repeats, like sets.', a: 'Merge the same way, but on equal heads take one and advance both, and skip any value equal to the current tail before attaching.' } },
    ],
    related: [
      { id: 'mergeK', ru: 'k списков: голов много, меньшую выбирает куча', en: 'k lists: many heads, and a heap picks the smallest' },
      { id: 'median', ru: 'медиану двух массивов можно найти слиянием, а можно за логарифм', en: 'the median of two arrays falls out of a merge, or out of a log-time search' },
    ],
  },

  lru: {
    tricky: [
      { input: { capacity: '2', ops: 'put 1 1, put 2 2, put 1 10, put 3 3, get 1, get 2' },
        ru: 'put существующего ключа тоже делает его свежим. Если только обновить значение, put 3 вытеснит ключ 1. Правильно: get 1 → 10, get 2 → −1.',
        en: 'A put on an existing key also makes it fresh. Update only the value and put 3 evicts key 1. Correct: get 1 → 10, get 2 → −1.' },
      { input: { capacity: '1', ops: 'put 1 1, put 2 2, get 1, get 2' },
        ru: 'Вместимость 1: каждый новый ключ вытесняет предыдущий. Ответы get: −1, 2.',
        en: 'Capacity 1: every new key evicts the previous one. The get answers: −1, 2.' },
    ],
    ops: {
      unit: { ru: 'сравнений ключей', en: 'key comparisons' },
      naive: { ru: 'список без словаря: искать ключ перебором', en: 'a list without a dictionary: scan for the key', count: p => {
        let order = [], c = 0;
        for (const [op, key, value] of p.ops) {
          const at = order.findIndex(([x]) => x === key);
          c += at < 0 ? order.length : at + 1;
          if (op === 'get') { if (at >= 0) order = [order[at], ...order.filter((_, i) => i !== at)]; continue; }
          order = [[key, value], ...order.filter((_, i) => i !== at)];
          if (order.length > p.capacity) order = order.slice(0, -1);
        }
        return c;
      } },
      ours: { ru: 'словарь + двусвязный список (один поиск в словаре)', en: 'dictionary + doubly linked list (one hash lookup)', count: p => p.ops.length },
    },
    predict: [
      { q: { ru: 'get: ключ ещё в кэше или уже вытеснен?', en: 'get: is the key still cached, or already evicted?' },
        keys: { 'lru.ev.hit': { ru: 'есть — переносим в начало', en: 'there — move it to the front' },
                'lru.ev.miss': { ru: 'нет — вернём −1', en: 'gone — return −1' } } },
    ],
    followups: [
      { ru: { q: 'Кэш читают из многих потоков. Как сделать потокобезопасным?', a: 'Даже get меняет порядок, поэтому <code>ReaderWriterLock</code> не спасает — нужен один lock на обе структуры. Под нагрузкой кэш шардируют: несколько независимых LRU по хешу ключа, у каждого свой lock.' },
        en: { q: 'Many threads read the cache. How do you make it thread-safe?', a: 'Even get changes the order, so a <code>ReaderWriterLock</code> does not help: one lock must cover both structures. Under load the cache is sharded into several independent LRUs by key hash, each with its own lock.' } },
      { ru: { q: 'Добавь срок жизни записи (TTL).', a: 'Храни в узле время истечения и проверяй его лениво на get: просроченный узел удаляем и отвечаем −1. Чтобы память не копилась, иногда чистим хвост или заводим кучу по времени истечения.' },
        en: { q: 'Add a time-to-live per entry.', a: 'Keep the expiry in the node and check it lazily on get: an expired node is removed and you return −1. To stop memory piling up, sweep the tail now and then or keep a heap by expiry time.' } },
    ],
    related: [
      { id: 'lfu', ru: 'то же, но вытесняем по частоте, а не по свежести', en: 'the same, evicting by frequency rather than recency' },
      { id: 'medianStream', ru: 'тоже две структуры, каждая закрывает слабость другой', en: 'also two structures, each covering the other’s weakness' },
    ],
  },

  reverseK: {
    tricky: [
      { input: { values: '1, 2, 3, 4, 5', k: '1' },
        ru: 'k = 1: группы из одного узла, разворачивать нечего, список не меняется. Хороший тест, что пришивание ничего не рвёт.',
        en: 'k = 1: one-node groups, nothing to reverse, the list stays the same. A good test that the stitching breaks nothing.' },
      { input: { values: '1, 2, 3, 4', k: '4' },
        ru: 'k равно длине: одна полная группа. Ошибка на единицу в проверке «есть ли ещё k узлов» сочтёт её хвостом и не тронет. Ответ [4, 3, 2, 1].',
        en: 'k equals the length: one full group. An off-by-one in the “are there k more nodes” check treats it as the tail and leaves it alone. The answer is [4, 3, 2, 1].' },
    ],
    ops: {
      unit: { ru: 'узлов в доп. памяти', en: 'nodes held in extra memory' },
      naive: { ru: 'группа в стек, потом перешить', en: 'push the group on a stack, then relink', count: p => p.k },
      ours: { ru: 'разворот ссылок на месте', en: 'reverse the links in place', count: () => 0 },
    },
    predict: [
      { q: { ru: 'Впереди есть ещё полные k узлов?', en: 'Are there k more nodes ahead?' },
        keys: { 'revk.ev.group': { ru: 'есть — разворачиваем группу', en: 'yes — reverse the group' },
                'revk.ev.rest': { ru: 'нет — хвост остаётся', en: 'no — the tail stays' } } },
    ],
    followups: [
      { ru: { q: 'А если хвост короче k тоже надо развернуть?', a: 'Убери проверку «есть ли k узлов» для последней группы: разворачивай столько, сколько осталось. Пришивание то же.' },
        en: { q: 'What if the tail shorter than k must be reversed too?', a: 'Drop the “are there k nodes” check for the last group and reverse whatever is left. The stitching is the same.' } },
      { ru: { q: 'Группы надо отсчитывать с конца списка.', a: 'Сначала посчитай длину L, пропусти первые L mod k узлов и дальше делай то же самое: оставшиеся узлы делятся на k без остатка.' },
        en: { q: 'The groups must be counted from the end of the list.', a: 'Count the length L first, skip the first L mod k nodes, and then do the same thing: the rest splits into groups of k exactly.' } },
    ],
    related: [
      { id: 'reverse', ru: 'один шаг этой задачи — обычный разворот', en: 'one step of this problem is a plain reversal' },
      { id: 'reverseBits', ru: 'масками биты разворачивают тоже группами: половины, четверти, восьмые…', en: 'masks reverse bits in groups too: halves, quarters, eighths…' },
    ],
  },

  /* ================= trees ================= */
  maxDepth: {
    tricky: [
      { input: { root: '1, 2, null, 3, null, 4' },
        ru: 'Дерево-цепочка влево: глубина 4. Тут же видно, что рекурсия уходит на n уровней — на цепочке в сотни тысяч узлов это переполнение стека.',
        en: 'A chain going left: depth 4. It also shows the recursion goes n levels deep: on a chain of hundreds of thousands of nodes that is a stack overflow.' },
      { input: { root: '5' },
        ru: 'Один узел. LeetCode считает глубину в узлах — ответ 1. Кто считает в рёбрах, вернёт 0.',
        en: 'One node. LeetCode counts depth in nodes, so the answer is 1. Counting edges gives 0.' },
    ],
    ops: {
      unit: { ru: 'посещений узлов', en: 'node visits' },
      naive: { ru: 'от каждого узла подниматься к корню', en: 'climb from every node to the root', count: p => depthSum(treeOf(p.root)) },
      ours: { ru: 'DFS, один раз в каждый узел', en: 'DFS, each node once', count: p => countNodes(treeOf(p.root)) },
    },
    predict: [
      { q: { ru: 'Спускаемся в ребёнка или узел уже отдаёт глубину наверх?', en: 'Do we go down into a child, or does the node hand its depth up?' },
        keys: { 'tree.ev.enter': { ru: 'заходим в узел', en: 'enter a node' },
                'tree.ev.return': { ru: 'узел возвращает глубину', en: 'the node returns its depth' } } },
    ],
    followups: [
      { ru: { q: 'Как обойтись без рекурсии?', a: 'BFS по уровням: глубина — число уровней. Или явный стек пар (узел, глубина). Память — O(ширины) или O(высоты), но переполнения стека вызовов уже нет.' },
        en: { q: 'How do you avoid recursion?', a: 'BFS by levels: the depth is the number of levels. Or an explicit stack of (node, depth) pairs. Memory is O(width) or O(height), with no call-stack overflow.' } },
      { ru: { q: 'А минимальная глубина (#111)?', a: 'Осторожно с узлом, у которого один ребёнок: это не лист, и <code>min(left, right)</code> вернёт для него ноль. Проще BFS до первого листа — он и даёт ответ, глубже можно не ходить.' },
        en: { q: 'And the minimum depth (#111)?', a: 'Careful with a node that has one child: it is not a leaf, and <code>min(left, right)</code> returns zero for it. BFS to the first leaf is simpler: that leaf is the answer and nothing deeper needs a visit.' } },
      { ru: { q: 'Проверь, что дерево сбалансировано (#110), за O(n).', a: 'Та же рекурсия, но при разнице высот детей больше 1 возвращаем −1, и −1 протаскиваем наверх. Каждый узел посещается один раз.' },
        en: { q: 'Check that the tree is balanced (#110) in O(n).', a: 'The same recursion, but return −1 when the children’s heights differ by more than 1, and pass −1 up. Each node is visited once.' } },
    ],
    related: [
      { id: 'levelOrder', ru: 'та же глубина, посчитанная по уровням BFS', en: 'the same depth, counted level by level with BFS' },
      { id: 'islands', ru: 'тот же рекурсивный DFS, только соседи — клетки сетки', en: 'the same recursive DFS, with grid cells as neighbours' },
    ],
  },

  levelOrder: {
    tricky: [
      { input: { root: '1, 2, 3, 4, null, null, 5' },
        ru: 'Если в цикле уровня сравнивать i с <code>queue.Count</code>, который меняется на ходу, уровни перемешаются: [[1, 2], [3, 4], [5]]. Размер уровня надо запомнить до цикла; ответ [[1], [2, 3], [4, 5]].',
        en: 'Compare i with <code>queue.Count</code>, which changes as you go, and the levels get mixed: [[1, 2], [3, 4], [5]]. Save the level size before the loop; the answer is [[1], [2, 3], [4, 5]].' },
      { input: { root: '7' },
        ru: 'Один узел: ровно один уровень [[7]]. Очередь пустеет сразу после него.',
        en: 'One node: exactly one level, [[7]]. The queue empties right after it.' },
    ],
    ops: {
      unit: { ru: 'посещений узлов', en: 'node visits' },
      naive: { ru: 'для каждого уровня d — новый DFS до глубины d', en: 'a fresh DFS to depth d for every level d', count: p => {
        const t = treeOf(p.root), h = height(t);
        const upTo = (s, d, lim) => (s && d <= lim ? 1 + upTo(s.l, d + 1, lim) + upTo(s.r, d + 1, lim) : 0);
        let c = 0;
        for (let d = 1; d <= h; d++) c += upTo(t, 1, d);
        return c;
      } },
      ours: { ru: 'BFS, очередь по уровням', en: 'BFS, a queue by levels', count: p => countNodes(treeOf(p.root)) },
    },
    predict: [
      { q: { ru: 'В очереди ещё есть узлы — будет новый уровень, или обход закончен?', en: 'Are there nodes left in the queue, so another level comes, or is the traversal over?' },
        keys: { 'lvl.ev.level': { ru: 'новый уровень', en: 'another level' },
                'lvl.ev.done': { ru: 'очередь пуста', en: 'the queue is empty' } } },
    ],
    followups: [
      { ru: { q: 'Обход «змейкой» (#103)?', a: 'Тот же BFS, только каждый второй уровень записываем задом наперёд — разворотом списка или вставкой в начало дека.' },
        en: { q: 'Zigzag order (#103)?', a: 'The same BFS, but every other level is written backwards, by reversing the list or pushing to the front of a deque.' } },
      { ru: { q: 'Вид дерева справа (#199)?', a: 'Последний узел каждого уровня. Или DFS «сначала правый» с глубиной: первый узел, пришедший на новую глубину, и виден справа.' },
        en: { q: 'The right side view (#199)?', a: 'The last node of every level. Or a right-first DFS that tracks depth: the first node to reach a new depth is the one seen from the right.' } },
      { ru: { q: 'Дерево очень широкое. Чем плох BFS?', a: 'Очередь держит целый уровень — до n/2 узлов. DFS с номером уровня (дописываем узел в <code>levels[depth]</code>) даёт тот же ответ при памяти O(высоты).' },
        en: { q: 'The tree is very wide. What is wrong with BFS?', a: 'The queue holds a whole level, up to n/2 nodes. A DFS that appends each node to <code>levels[depth]</code> gives the same answer with O(height) memory.' } },
    ],
    related: [
      { id: 'oranges', ru: 'BFS по уровням на сетке: уровень — это минута', en: 'level-by-level BFS on a grid: a level is a minute' },
      { id: 'ladder', ru: 'уровень BFS — это длина цепочки слов', en: 'a BFS level is the length of the word chain' },
    ],
  },

  validBst: {
    tricky: [
      { input: { root: '2, 2, 2' },
        ru: 'Повторы. В строгом BST равных быть не может; с проверкой через <code>&lt;=</code> такое дерево пройдёт. Ответ false.',
        en: 'Duplicates. A strict BST has no equal keys; check with <code>&lt;=</code> and this tree passes. The answer is false.' },
      { input: { root: '10, 5, 15, null, null, 6, 20' },
        ru: '6 — левый ребёнок 15, тут всё честно, но 6 лежит в правом поддереве 10. Проверка только «родитель–ребёнок» скажет true; ответ false.',
        en: '6 is the left child of 15, which is fine, but 6 lies in the right subtree of 10. A parent–child check alone says true; the answer is false.' },
    ],
    ops: {
      unit: { ru: 'посещений узлов', en: 'node visits' },
      naive: { ru: 'каждый узел сверить со всеми потомками', en: 'check every node against all its descendants', count: p => {
        let c = 0, bad = false;
        const scan = (s, ok) => { if (!s || bad) return; c++; if (!ok(s.v)) { bad = true; return; } scan(s.l, ok); scan(s.r, ok); };
        const go = s => {
          if (!s || bad) return;
          c++;
          scan(s.l, v => v < s.v);
          scan(s.r, v => v > s.v);
          go(s.l);
          go(s.r);
        };
        go(treeOf(p.root));
        return c;
      } },
      ours: { ru: 'коридор (lo, hi)', en: 'the (lo, hi) corridor', count: p => {
        let c = 0;
        const go = (s, lo, hi) => {
          if (!s) return true;
          c++;
          if (!(s.v > lo && s.v < hi)) return false;
          return go(s.l, lo, s.v) && go(s.r, s.v, hi);
        };
        go(treeOf(p.root), -Infinity, Infinity);
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Следующий узел попадает в свой коридор (lo, hi)?', en: 'Does the next node fit its (lo, hi) corridor?' },
        keys: { 'bst.ev.ok': { ru: 'да, идём глубже', en: 'yes, go deeper' },
                'bst.ev.bad': { ru: 'нет — не BST', en: 'no — not a BST' } } },
    ],
    followups: [
      { ru: { q: 'Как проверить через симметричный обход?', a: 'In-order у BST даёт строго возрастающую последовательность: обходи итеративно со стеком и сравнивай с предыдущим значением. O(n) времени, O(h) памяти.' },
        en: { q: 'How do you check it with an in-order traversal?', a: 'In-order over a BST is strictly increasing: walk it iteratively with a stack and compare with the previous value. O(n) time, O(h) memory.' } },
      { ru: { q: 'Два узла BST поменяли местами. Восстанови дерево (#99).', a: 'В in-order появятся одна или две «ступеньки вниз». Первый узел — больший из первой ступеньки, второй — меньший из последней; поменяй их значения.' },
        en: { q: 'Two nodes of a BST were swapped. Recover the tree (#99).', a: 'In-order shows one or two “drops”. The first node is the larger one of the first drop, the second is the smaller one of the last; swap their values.' } },
    ],
    related: [
      { id: 'bsearch', ru: 'коридор (lo, hi) сужается так же, как отрезок бинпоиска', en: 'the (lo, hi) corridor narrows just like a binary search range' },
      { id: 'rotated', ru: 'тоже решение по проверке «лежит ли x в диапазоне»', en: 'also decided by an “is x in the range” check' },
    ],
  },

  lca: {
    tricky: [
      { input: { root: '3, 5, 1, 6, 2, 0, 8, null, null, 7, 4', p: '5', q: '4' },
        ru: 'p — предок q. Рекурсия возвращает 5, как только его видит, и до 4 даже не спускается. Ответ 5; код, ждущий p и q в разных поддеревьях, ответит 3.',
        en: 'p is an ancestor of q. The recursion returns 5 as soon as it sees it and never goes down to 4. The answer is 5; code that expects p and q in different subtrees answers 3.' },
      { input: { root: '3, 5, 1, 6, 2, 0, 8, null, null, 7, 4', p: '6', q: '6' },
        ru: 'p = q: узел сам себе потомок, ответ 6.',
        en: 'p = q: a node is its own descendant, so the answer is 6.' },
    ],
    ops: {
      unit: { ru: 'посещений узлов', en: 'node visits' },
      naive: { ru: 'два поиска пути от корня и сравнение путей', en: 'two root-to-node path searches, then compare the paths', count: p => {
        const t = treeOf(p.root);
        let c = 0;
        const find = (s, x) => { if (!s) return false; c++; return s.v === x || find(s.l, x) || find(s.r, x); };
        find(t, p.p);
        find(t, p.q);
        return c;
      } },
      ours: { ru: 'один DFS, наверх «что нашёл»', en: 'one DFS returning what it found', count: p => {
        let c = 0;
        const go = s => {
          if (!s) return null;
          c++;
          if (s.v === p.p || s.v === p.q) return s;
          const l = go(s.l), r = go(s.r);
          return l && r ? s : l || r;
        };
        go(treeOf(p.root));
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Что дальше: новый узел, встреча с p или q, или узел отдаёт ответ наверх?', en: 'What next: a new node, running into p or q, or a node handing its answer up?' },
        keys: { 'lca.ev.enter': { ru: 'заходим в узел', en: 'enter a node' },
                'lca.ev.self': { ru: 'это p или q', en: 'it is p or q' },
                'lca.ev.ret': { ru: 'узел возвращает результат', en: 'the node returns its result' } } },
    ],
    followups: [
      { ru: { q: 'У узлов есть ссылка на родителя (#1650).', a: 'Корень не нужен: поднимайся от p и q, как в пересечении двух списков — дойдя до корня, перескакивай на старт другого. Встретятся в LCA. O(h), O(1).' },
        en: { q: 'Nodes have a parent link (#1650).', a: 'No root needed: climb from p and q as in the intersection of two lists — on reaching the root, jump to the other start. They meet at the LCA. O(h), O(1).' } },
      { ru: { q: 'Запросов LCA миллионы, дерево не меняется.', a: 'Предобработка: двоичные подъёмы (up[k][v] — предок на 2^k выше) дают O(log n) на запрос, эйлеров обход + sparse table — O(1). Предобработка O(n log n).' },
        en: { q: 'There are millions of LCA queries on a fixed tree.', a: 'Preprocess: binary lifting (up[k][v], the ancestor 2^k above) answers in O(log n), an Euler tour plus a sparse table in O(1). Preprocessing is O(n log n).' } },
      { ru: { q: 'p или q может не быть в дереве (#1644).', a: 'Нельзя возвращаться, едва увидев p: досчитай обход до конца и считай, сколько из двух реально найдено. Если меньше двух — ответ null.' },
        en: { q: 'p or q may be missing from the tree (#1644).', a: 'You cannot return the moment you see p: finish the traversal and count how many of the two were actually found. Fewer than two means null.' } },
    ],
    related: [
      { id: 'cycleEntry', ru: 'с ссылками на родителя это пересечение двух путей — тот же приём выравнивания', en: 'with parent links it is two paths intersecting — the same evening-out trick' },
      { id: 'maxPath', ru: 'тоже: наверх возвращаем одно, а ответ ловим в узле, где сошлись обе стороны', en: 'also: one thing goes up, and the answer is caught where both sides meet' },
    ],
  },

  maxPath: {
    tricky: [
      { input: { root: '-3, -5, -2' },
        ru: 'Все отрицательные. Если начать <code>best = 0</code>, вернётся 0 — пустой путь. Путь из одного узла обязателен, ответ −2.',
        en: 'All negative. Start <code>best = 0</code> and you return 0, an empty path. A path needs at least one node, so the answer is −2.' },
      { input: { root: '10, 5, null, 4, 3' },
        ru: 'Наверх можно отдать только одну ветку. Вернёшь «вилку» 4 + 5 + 3 = 12 — корень посчитает 10 + 12 = 22, а такого пути нет. Ответ 19: 10 → 5 → 4.',
        en: 'Only one branch may go up. Return the fork 4 + 5 + 3 = 12 and the root computes 10 + 12 = 22, a path that does not exist. The answer is 19: 10 → 5 → 4.' },
    ],
    ops: {
      unit: { ru: 'посещений узлов', en: 'node visits' },
      naive: { ru: 'для каждого узла заново считать спуски вниз', en: 'recompute the descents below every node', count: p => depthSum(treeOf(p.root)) },
      ours: { ru: 'один пост-порядок', en: 'one post-order pass', count: p => countNodes(treeOf(p.root)) },
    },
    predict: [
      { q: { ru: 'Ещё какой-то узел должен вернуть спуск, или все уже посчитаны?', en: 'Does some node still have to return its descent, or are they all done?' },
        keys: { 'mps.ev.ret': { ru: 'ещё узел возвращает спуск', en: 'another node returns its descent' },
                'mps.ev.done': { ru: 'все узлы посчитаны', en: 'every node is done' } } },
    ],
    followups: [
      { ru: { q: 'Верни сам путь, а не только сумму.', a: 'Запомни узел-вершину лучшего пути и для каждого узла — в какого ребёнка ведёт его лучший спуск. Путь — спуск влево от вершины задом наперёд, сама вершина и спуск вправо.' },
        en: { q: 'Return the path itself, not just the sum.', a: 'Remember the apex of the best path and, for every node, which child its best descent goes to. The path is the left descent reversed, the apex, then the right descent.' } },
      { ru: { q: 'Путь может только спускаться (без поворота). Что изменится?', a: 'Глобальный ответ — просто максимум из возвращаемых значений: поворот <code>left + node + right</code> не нужен.' },
        en: { q: 'The path may only go down, no turn. What changes?', a: 'The global answer is just the maximum of the returned values: the <code>left + node + right</code> turn is no longer needed.' } },
      { ru: { q: 'А если у узла не два ребёнка, а много?', a: 'Наверх — сам узел плюс лучший неотрицательный спуск; для поворота — две лучшие ветки, их достаёт один проход по детям.' },
        en: { q: 'What if a node has many children, not two?', a: 'Up goes the node plus its best non-negative descent; the turn uses the two best branches, found in one pass over the children.' } },
    ],
    related: [
      { id: 'kadane', ru: 'на цепочке это ровно Кадане: отрицательное начало отбрасываем', en: 'on a chain this is exactly Kadane: drop a negative prefix' },
      { id: 'maxDepth', ru: 'тот же пост-порядок: ребёнок отдаёт число, родитель собирает', en: 'the same post-order: a child returns a number, the parent combines' },
    ],
  },

  invertTree: {
    tricky: [
      { input: { root: '1, 2, null, 3' },
        ru: 'Ловушка в двух строках <code>root.left = Invert(root.right); root.right = Invert(root.left);</code>: вторая читает уже затёртый left, и поддерево 2 → 3 пропадает. Сохрани один результат во временную переменную. Ответ [1, null, 2, null, 3].',
        en: 'The trap is in two lines, <code>root.left = Invert(root.right); root.right = Invert(root.left);</code>: the second reads the already overwritten left, and the 2 → 3 subtree is lost. Keep one result in a temporary. The answer is [1, null, 2, null, 3].' },
      { input: { root: '1' },
        ru: 'Один узел: менять нечего, ответ [1]. Код без проверки на null у детей упадёт на первом же листе.',
        en: 'One node: nothing to swap, the answer is [1]. Code that does not check children for null crashes on the very first leaf.' },
    ],
    ops: {
      unit: { ru: 'посещений узлов', en: 'node visits' },
      naive: { ru: 'собрать уровни, развернуть, построить заново', en: 'collect the levels, reverse them, rebuild', count: p => 2 * countNodes(treeOf(p.root)) },
      ours: { ru: 'рекурсия с обменом детей', en: 'recursion swapping children', count: p => countNodes(treeOf(p.root)) },
    },
    predict: [
      { q: { ru: 'Что дальше: внутренний узел, лист или обмен детей у узла, чьи поддеревья готовы?', en: 'What next: an inner node, a leaf, or a swap at a node whose subtrees are done?' },
        keys: { 'inv.ev.enter': { ru: 'заходим во внутренний узел', en: 'enter an inner node' },
                'inv.ev.leaf': { ru: 'лист — менять нечего', en: 'a leaf — nothing to swap' },
                'inv.ev.swap': { ru: 'меняем детей местами', en: 'swap the children' } } },
    ],
    followups: [
      { ru: { q: 'Без рекурсии?', a: 'Очередь или стек: достаём узел, меняем детей местами, кладём детей. Порядок неважен — каждый узел меняется независимо.' },
        en: { q: 'Without recursion?', a: 'A queue or a stack: take a node, swap its children, add the children. The order does not matter — each node is swapped independently.' } },
      { ru: { q: 'Проверь, что дерево симметрично (#101), не переворачивая его.', a: 'Рекурсия по паре (a, b): значения равны, <code>a.left</code> зеркален <code>b.right</code>, <code>a.right</code> — <code>b.left</code>. Начинаем с (root.left, root.right).' },
        en: { q: 'Check that a tree is symmetric (#101) without inverting it.', a: 'Recurse on a pair (a, b): equal values, <code>a.left</code> mirrors <code>b.right</code>, <code>a.right</code> mirrors <code>b.left</code>. Start with (root.left, root.right).' } },
      { ru: { q: 'Дерево неизменяемое и разделяется между потоками.', a: 'Строим зеркальную копию: новый узел, у которого левый ребёнок — зеркало правого, и наоборот. O(n) новых узлов, оригинал остаётся целым, и читатели ничего не замечают.' },
        en: { q: 'The tree is immutable and shared between threads.', a: 'Build a mirrored copy: a new node whose left child is the mirror of the old right one, and vice versa. O(n) new nodes, the original stays intact and readers notice nothing.' } },
    ],
    related: [
      { id: 'reverse', ru: 'разворот списка — то же зеркало для цепочки', en: 'reversing a list is the same mirror for a chain' },
      { id: 'rotate', ru: 'поворот матрицы складывается из двух отражений', en: 'rotating a matrix is two reflections put together' },
    ],
  },
};
