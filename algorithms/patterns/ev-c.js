/** Step texts for the chapter 09–12 rigs added next to the original ones in i18n-c.js. */
const list = a => `[${a.join(', ')}]`;

export const EV_C = {
  /* Last Stone Weight */
  'stone.ev.start': { en: n => `Put all ${n} stones into a max-heap: the heaviest is always on top.`, ru: n => `Кладём все камни (${n}) в max-heap: самый тяжёлый всегда на вершине.` },
  'stone.ev.smash': { en: (a, b, d) => `Take ${a} and ${b}, smash them: ${a} − ${b} = ${d} goes back into the heap.`, ru: (a, b, d) => `Достаём ${a} и ${b}, сталкиваем: ${a} − ${b} = ${d} возвращается в кучу.` },
  'stone.ev.equal': { en: a => `Two stones of ${a} destroy each other — nothing goes back.`, ru: a => `Два камня по ${a} уничтожают друг друга — в кучу ничего не возвращается.` },
  'stone.ev.done': { en: last => `One stone or none left: answer <b>${last}</b>.`, ru: last => `Остался один камень или ни одного: ответ <b>${last}</b>.` },

  /* Merge k Sorted Lists */
  'mk.ev.start': { en: k => `The heap holds one head from each of the ${k} lists. The smallest head is the next output.`, ru: k => `В куче — по одной «голове» от каждого из ${k} списков. Самая маленькая голова идёт в ответ.` },
  'mk.ev.take': {
    en: (v, l, next) => `Pop ${v} from L${l} and append it. ${next === null ? `L${l} is empty now.` : `Push L${l}’s next node ${next} into the heap.`}`,
    ru: (v, l, next) => `Достаём ${v} из L${l} и дописываем. ${next === null ? `L${l} опустел.` : `Кладём в кучу следующий узел L${l}: ${next}.`}`,
  },
  'mk.ev.done': { en: n => `All ${n} nodes merged. O(N log k).`, ru: n => `Слиты все узлы (${n}). O(N log k).` },

  /* Find Median from Data Stream */
  'mstr.ev.start': {
    en: () => 'low is a max-heap with the smaller half, high is a min-heap with the larger half. low may hold one extra.',
    ru: () => 'low — max-heap с меньшей половиной, high — min-heap с большей. В low может быть на один больше.',
  },
  'mstr.ev.add': {
    en: (x, toLow, moved, to, median) => `${x} → ${toLow ? 'low' : 'high'}.${moved === null ? '' : ` Sizes drifted: move ${moved} to ${to}.`} Median = <b>${median}</b>.`,
    ru: (x, toLow, moved, to, median) => `${x} → ${toLow ? 'low' : 'high'}.${moved === null ? '' : ` Размеры разъехались: переносим ${moved} в ${to}.`} Медиана = <b>${median}</b>.`,
  },

  /* Permutations */
  'perm.ev.start': { en: () => 'Every level picks any number that is not used yet. Order matters.', ru: () => 'На каждом уровне берём любое ещё не использованное число. Порядок важен.' },
  'perm.ev.pick': {
    en: (x, path, left) => `Pick ${x}: path = ${list(path)}, ${left} number(s) left to place. Going back up will undo it.`,
    ru: (x, path, left) => `Берём ${x}: path = ${list(path)}, осталось расставить: ${left}. При возврате наверх выбор откатится.`,
  },
  'perm.ev.hit': { en: (x, path) => `Pick ${x}: ${list(path)} uses every number — save a copy.`, ru: (x, path) => `Берём ${x}: ${list(path)} использует все числа — сохраняем копию.` },
  'perm.ev.done': { en: n => `<b>${n}</b> permutations = n!.`, ru: n => `Перестановок: <b>${n}</b> = n!.` },

  /* Combination Sum */
  'comb.ev.start': {
    en: t => `Nodes show what is left of ${t}. Candidates are sorted and the loop starts at the current index, so a number may repeat but order never flips.`,
    ru: t => `В узлах — сколько осталось от ${t}. Кандидаты отсортированы, цикл идёт с текущего индекса: число можно повторить, но порядок не переворачивается.`,
  },
  'comb.ev.step': { en: (c, path, rest) => `Take ${c}: path = ${list(path)}, ${rest} left.`, ru: (c, path, rest) => `Берём ${c}: path = ${list(path)}, осталось ${rest}.` },
  'comb.ev.hit': { en: (c, path) => `Take ${c}: exactly 0 left — <b>${list(path)}</b> is an answer.`, ru: (c, path) => `Берём ${c}: осталось ровно 0 — <b>${list(path)}</b> в ответ.` },
  'comb.ev.cut': {
    en: (c, path, rest) => `${c} > ${rest}: this and every larger candidate overshoot — <b>break</b> (pruned).`,
    ru: (c, path, rest) => `${c} > ${rest}: и это, и все большие кандидаты перелетают — <b>break</b> (отсечение).`,
  },
  'comb.ev.done': { en: n => `Done: <b>${n}</b> combinations. Pruning skipped whole subtrees.`, ru: n => `Готово: комбинаций — <b>${n}</b>. Отсечение пропустило целые поддеревья.` },

  /* N-Queens */
  'nq.ev.start': { en: n => `${n}×${n} board, one queen per row. Try columns left to right, undo on a dead end.`, ru: n => `Доска ${n}×${n}, по ферзю в строке. Пробуем столбцы слева направо, откатываемся в тупике.` },
  'nq.ev.clash': {
    en: (r, c, qr, qc) => `(${r},${c}) is attacked by the queen at (${qr},${qc}) — same column or diagonal. Skip.`,
    ru: (r, c, qr, qc) => `(${r},${c}) бьёт ферзь на (${qr},${qc}) — тот же столбец или диагональ. Пропускаем.`,
  },
  'nq.ev.place': { en: (r, c) => `Place a queen at (${r},${c}) and go to row ${r + 1}.`, ru: (r, c) => `Ставим ферзя на (${r},${c}) и идём в строку ${r + 1}.` },
  'nq.ev.undo': { en: (r, c) => `Row ${r + 1} is a dead end — <b>undo</b> the queen at (${r},${c}) and try the next column.`, ru: (r, c) => `Строка ${r + 1} — тупик: <b>убираем</b> ферзя с (${r},${c}) и пробуем следующий столбец.` },
  'nq.ev.solution': { en: k => `All rows are filled — arrangement #${k} found.`, ru: k => `Все строки заполнены — расстановка №${k} найдена.` },
  'nq.ev.done': {
    en: (k, n, stopped) => (stopped ? `Stopped at the first arrangement. Backtracking further finds all solutions for n = ${n}.` : `<b>${k}</b> arrangements for n = ${n}.`),
    ru: (k, n, stopped) => (stopped ? `Остановились на первой расстановке. Если откатываться дальше, найдутся все решения для n = ${n}.` : `Расстановок для n = ${n}: <b>${k}</b>.`),
  },

  /* Best Time to Buy and Sell Stock */
  'stk.ev.start': { en: () => 'Walk the days and remember the cheapest price so far. Selling today earns price − that minimum.', ru: () => 'Идём по дням и помним самую низкую цену до сегодня. Продажа сегодня даёт цена − этот минимум.' },
  'stk.ev.low': { en: (i, p) => `Day ${i}: ${p} is a new minimum — the best day to buy so far.`, ru: (i, p) => `День ${i}: ${p} — новый минимум, лучший день для покупки на сейчас.` },
  'stk.ev.sell': {
    en: (i, p, min, profit, rec) => `Day ${i}: sell at ${p} after buying at ${min} → ${profit}${rec ? ' — <b>best profit</b>' : ''}.`,
    ru: (i, p, min, profit, rec) => `День ${i}: продаём по ${p}, купив по ${min} → ${profit}${rec ? ' — <b>лучшая прибыль</b>' : ''}.`,
  },
  'stk.ev.done': { en: best => `Maximum profit: <b>${best}</b>. One pass, O(1) memory.`, ru: best => `Максимальная прибыль: <b>${best}</b>. Один проход, O(1) память.` },

  /* Non-overlapping Intervals */
  'int.ev.start': { en: n => `Sort the ${n} intervals by their end. Keep what ends earliest: it leaves the most room.`, ru: n => `Сортируем ${n} интервалов по концу. Оставляем то, что заканчивается раньше: так остаётся больше места.` },
  'int.ev.keep': {
    en: (a, b, prev) => `[${a}, ${b}] starts at ${a} ≥ ${prev === null ? '−∞' : prev} — keep it; the line moves to ${b}.`,
    ru: (a, b, prev) => `[${a}, ${b}] начинается в ${a} ≥ ${prev === null ? '−∞' : prev} — оставляем; линия сдвигается на ${b}.`,
  },
  'int.ev.drop': { en: (a, b, end) => `[${a}, ${b}] starts before ${end} — overlap, <b>remove</b> it.`, ru: (a, b, end) => `[${a}, ${b}] начинается раньше ${end} — пересечение, <b>удаляем</b>.` },
  'int.ev.done': { en: (removed, kept) => `Removed <b>${removed}</b>, kept ${kept}.`, ru: (removed, kept) => `Удалили <b>${removed}</b>, оставили ${kept}.` },

  /* Candy */
  'candy.ev.start': { en: n => `${n} children, everyone starts with 1 candy.`, ru: n => `Детей: ${n}, у каждого сначала по 1 конфете.` },
  'candy.ev.pass1': { en: () => 'Pass 1, left → right: fix the rule against the left neighbour.', ru: () => 'Проход 1, слева направо: чиним правило относительно левого соседа.' },
  'candy.ev.left': { en: (i, r, rl, c) => `rating ${r} > ${rl} on the left → ${c} candies.`, ru: (i, r, rl, c) => `рейтинг ${r} > ${rl} слева → ${c} конфет.` },
  'candy.ev.pass2': { en: () => 'Pass 2, right → left: fix the rule against the right neighbour without breaking pass 1.', ru: () => 'Проход 2, справа налево: чиним правило относительно правого соседа, не ломая проход 1.' },
  'candy.ev.right': { en: (i, r, rr, old, c) => `rating ${r} > ${rr} on the right → max(${old}, ${c}) = ${c}.`, ru: (i, r, rr, old, c) => `рейтинг ${r} > ${rr} справа → max(${old}, ${c}) = ${c}.` },
  'candy.ev.done': { en: total => `Total: <b>${total}</b> candies. Two greedy passes satisfy both neighbours.`, ru: total => `Всего: <b>${total}</b> конфет. Два жадных прохода удовлетворяют обоих соседей.` },

  /* Climbing Stairs */
  'climb.ev.start': { en: n => `ways[i] = ways to reach step i. ways[0] = ways[1] = 1. Target: step ${n}.`, ru: n => `ways[i] — сколькими способами дойти до ступени i. ways[0] = ways[1] = 1. Цель: ступень ${n}.` },
  'climb.ev.step': { en: (i, a, b, v) => `ways[${i}] = ways[${i - 1}] + ways[${i - 2}] = ${a} + ${b} = <b>${v}</b>.`, ru: (i, a, b, v) => `ways[${i}] = ways[${i - 1}] + ways[${i - 2}] = ${a} + ${b} = <b>${v}</b>.` },
  'climb.ev.done': { en: (n, ways) => `<b>${ways}</b> ways to climb ${n} steps. Only the last two values were ever needed.`, ru: (n, ways) => `Способов подняться на ${n} ступеней: <b>${ways}</b>. Нужны были только два последних значения.` },

  /* Longest Common Subsequence */
  'lcs.ev.start': { en: (a, b) => `dp[i][j] = LCS of “${a}”[..i] and “${b}”[..j]. The empty row and column are 0.`, ru: (a, b) => `dp[i][j] — LCS префиксов «${a}»[..i] и «${b}»[..j]. Пустая строка и столбец — нули.` },
  'lcs.ev.cell': {
    en: (i, j, ca, cb, op, v) => (op === 'match' ? `“${ca}” = “${cb}” → diagonal + 1 = <b>${v}</b>.` : `“${ca}” ≠ “${cb}” → max(up, left) = ${v} (from ${op === 'up' ? 'above' : 'the left'}).`),
    ru: (i, j, ca, cb, op, v) => (op === 'match' ? `«${ca}» = «${cb}» → диагональ + 1 = <b>${v}</b>.` : `«${ca}» ≠ «${cb}» → max(сверху, слева) = ${v} (${op === 'up' ? 'сверху' : 'слева'}).`),
  },
  'lcs.ev.done': { en: v => `The bottom-right cell: LCS length <b>${v}</b>.`, ru: v => `Правая нижняя клетка: длина LCS <b>${v}</b>.` },

  /* Edit Distance */
  'ed.ev.start': {
    en: (a, b) => `dp[i][j] = edits to turn “${a}”[..i] into “${b}”[..j]. First row and column: insert or delete everything.`,
    ru: (a, b) => `dp[i][j] — правок, чтобы превратить «${a}»[..i] в «${b}»[..j]. Первая строка и столбец: вставить или удалить всё.`,
  },
  'ed.ev.cell': {
    en: (i, j, ca, cb, op, v) => (op === 'keep' ? `“${ca}” = “${cb}” → free, take the diagonal: <b>${v}</b>.`
      : `“${ca}” ≠ “${cb}” → 1 + min(replace ↖, delete ↑, insert ←) = <b>${v}</b> via ${op}.`),
    ru: (i, j, ca, cb, op, v) => (op === 'keep' ? `«${ca}» = «${cb}» → бесплатно, берём диагональ: <b>${v}</b>.`
      : `«${ca}» ≠ «${cb}» → 1 + min(замена ↖, удаление ↑, вставка ←) = <b>${v}</b> через ${{ replace: 'замену', delete: 'удаление', insert: 'вставку' }[op]}.`),
  },
  'ed.ev.done': { en: (v, a, b) => `“${a}” → “${b}” in <b>${v}</b> edits.`, ru: (v, a, b) => `«${a}» → «${b}» за <b>${v}</b> правки.` },
};
