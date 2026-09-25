/** Step texts for the chapter 05–08 rigs added next to the original ones in i18n-b.js. */
const list = a => `[${a.join(', ')}]`;
const chain = a => a.join(' → ');

export const EV_B = {
  /* Valid Parentheses */
  'par.ev.start': { en: () => 'Opening brackets go on the stack. A closing one must match the top.', ru: () => 'Открывающие скобки кладём в стек. Закрывающая должна совпасть с вершиной.' },
  'par.ev.push': { en: c => `“${c}” opens — push.`, ru: c => `«${c}» открывает — push.` },
  'par.ev.pop': { en: (c, open) => `“${c}” closes “${open}” on top — pop.`, ru: (c, open) => `«${c}» закрывает «${open}» на вершине — pop.` },
  'par.ev.bad': {
    en: (c, top) => `“${c}” but the top is ${top === null ? 'empty' : `“${top}”`} — <b>invalid</b>.`,
    ru: (c, top) => `«${c}», а на вершине ${top === null ? 'пусто' : `«${top}»`} — <b>неправильно</b>.`,
  },
  'par.ev.done': {
    en: (valid, left) => (valid ? 'The string is over and the stack is empty — <b>valid</b>.' : `The string is over but ${left} bracket(s) never closed — <b>invalid</b>.`),
    ru: (valid, left) => (valid ? 'Строка кончилась, стек пуст — <b>всё правильно</b>.' : `Строка кончилась, но скобок не закрыто: ${left} — <b>неправильно</b>.`),
  },

  /* Min Stack */
  'mins.ev.start': { en: () => 'Every entry stores its value and the minimum at the moment it was pushed.', ru: () => 'Каждый элемент хранит своё значение и минимум на момент вставки.' },
  'mins.ev.push': { en: (v, min) => `push ${v}: store (${v}, min = ${min}).`, ru: (v, min) => `push ${v}: кладём (${v}, min = ${min}).` },
  'mins.ev.pop': {
    en: (v, min) => `pop removes ${v}. The minimum rolls back by itself: ${min === null ? 'the stack is empty' : `now ${min}`}.`,
    ru: (v, min) => `pop убирает ${v}. Минимум откатывается сам: ${min === null ? 'стек пуст' : `теперь ${min}`}.`,
  },
  'mins.ev.get': { en: min => `getMin() = <b>${min}</b> — read from the top, O(1).`, ru: min => `getMin() = <b>${min}</b> — читаем с вершины, O(1).` },

  /* Largest Rectangle in Histogram */
  'hist.ev.start': {
    en: () => 'The stack keeps indices with increasing heights. A lower bar pops taller ones and closes their rectangles.',
    ru: () => 'Стек держит индексы с возрастающими высотами. Более низкий столбик выталкивает высокие и закрывает их прямоугольники.',
  },
  'hist.ev.push': { en: (i, h) => `push ${i} (height ${h}) — heights on the stack still increase.`, ru: (i, h) => `push ${i} (высота ${h}) — высоты в стеке по-прежнему растут.` },
  'hist.ev.pop': {
    en: (h, w, area, rec, last) => `${last ? 'End of array (height 0): ' : ''}pop height ${h}. It stretches over width ${w} → area ${area}${rec ? ' — <b>new best</b>' : ''}.`,
    ru: (h, w, area, rec, last) => `${last ? 'Конец массива (высота 0): ' : ''}pop высоты ${h}. Она тянется на ширину ${w} → площадь ${area}${rec ? ' — <b>рекорд</b>' : ''}.`,
  },
  'hist.ev.done': { en: best => `Largest rectangle: <b>${best}</b> (dashed). Each index is pushed and popped once.`, ru: best => `Самый большой прямоугольник: <b>${best}</b> (пунктир). Каждый индекс один раз push и один раз pop.` },

  /* Linked List Cycle */
  'cyc.ev.start': { en: () => 'slow moves 1 link, fast moves 2. Both start at node 0.', ru: () => 'slow шагает на 1 ссылку, fast — на 2. Оба стартуют с узла 0.' },
  'cyc.ev.move': { en: (s, f) => `slow → ${s}, fast → ${f < 0 ? 'null' : f}.`, ru: (s, f) => `slow → ${s}, fast → ${f < 0 ? 'null' : f}.` },
  'cyc.ev.meet': { en: n => `They meet at node ${n} — <b>there is a cycle</b>. Without one, fast would hit null.`, ru: n => `Встретились в узле ${n} — <b>цикл есть</b>. Без цикла fast упёрся бы в null.` },
  'cyc.ev.none': { en: () => 'fast reached null — no cycle.', ru: () => 'fast дошёл до null — цикла нет.' },

  /* Reverse Linked List */
  'rev.ev.start': { en: () => 'prev = null, cur = head. Each step turns one arrow around.', ru: () => 'prev = null, cur = head. Каждый шаг разворачивает одну стрелку.' },
  'rev.ev.step': {
    en: (v, to) => `Save next, point ${v}.next at ${to === null ? 'null' : to}, then prev = ${v}, cur = next.`,
    ru: (v, to) => `Запоминаем next, направляем ${v}.next на ${to === null ? 'null' : to}, затем prev = ${v}, cur = next.`,
  },
  'rev.ev.done': { en: r => `cur is null; prev is the new head: <b>${chain(r)}</b>.`, ru: r => `cur = null, prev — новая голова: <b>${chain(r)}</b>.` },

  /* Reverse Nodes in k-Group */
  'revk.ev.start': { en: k => `Reverse the list in groups of ${k}. Count k nodes ahead first; a shorter tail stays as it is.`, ru: k => `Разворачиваем список группами по ${k}. Сначала отсчитываем k узлов вперёд; хвост короче остаётся как есть.` },
  'revk.ev.group': {
    en: (chunk, rev) => `Group ${list(chunk)} becomes <b>${list(rev)}</b>. Stitch: the node before the group now points to ${rev[0]}, and ${rev.at(-1)} points to the next group.`,
    ru: (chunk, rev) => `Группа ${list(chunk)} становится <b>${list(rev)}</b>. Пришиваем: узел перед группой теперь указывает на ${rev[0]}, а ${rev.at(-1)} — на следующую группу.`,
  },
  'revk.ev.rest': { en: (rest, k) => `Only ${rest.length} node(s) left (${chain(rest)}), fewer than ${k} — leave them.`, ru: (rest, k) => `Осталось узлов: ${rest.length} (${chain(rest)}), меньше ${k} — не трогаем.` },
  'revk.ev.done': { en: r => `Result: <b>${chain(r)}</b>. O(n) time, O(1) memory.`, ru: r => `Результат: <b>${chain(r)}</b>. O(n) время, O(1) память.` },

  /* Flood Fill */
  'fill.ev.start': {
    en: (r, c, from, to) => `Start at (${r},${c}): repaint every connected ${from} into ${to}. Repainting also marks a cell as visited.`,
    ru: (r, c, from, to) => `Старт в (${r},${c}): перекрашиваем все связанные ${from} в ${to}. Перекраска заодно помечает клетку посещённой.`,
  },
  'fill.ev.same': { en: c => `The start is already ${c} — nothing to do (and no infinite recursion).`, ru: c => `Старт уже цвета ${c} — делать нечего (и никакой бесконечной рекурсии).` },
  'fill.ev.paint': { en: (r, c) => `Paint (${r},${c}), then DFS down, up, right, left.`, ru: (r, c) => `Красим (${r},${c}), дальше DFS вниз, вверх, вправо, влево.` },
  'fill.ev.done': { en: n => `Filled <b>${n}</b> cells. O(R·C).`, ru: n => `Перекрашено клеток: <b>${n}</b>. O(R·C).` },

  /* Rotting Oranges */
  'orange.ev.start': {
    en: (rotten, fresh) => `Put all ${rotten} rotten oranges into the queue at once — multi-source BFS. Fresh: ${fresh}.`,
    ru: (rotten, fresh) => `Кладём все гнилые апельсины (${rotten}) в очередь сразу — BFS из многих источников. Свежих: ${fresh}.`,
  },
  'orange.ev.minute': {
    en: (m, newly, fresh) => `Minute ${m}: one BFS level — ${newly} orange(s) rot (outlined). Fresh left: ${fresh}.`,
    ru: (m, newly, fresh) => `Минута ${m}: один уровень BFS — сгнило апельсинов: ${newly} (обведены). Свежих осталось: ${fresh}.`,
  },
  'orange.ev.done': {
    en: (minutes, fresh) => (minutes >= 0 ? `Everything is rotten after <b>${minutes}</b> minutes.` : `${fresh} fresh orange(s) can never be reached — answer <b>−1</b>.`),
    ru: (minutes, fresh) => (minutes >= 0 ? `Всё сгнило за <b>${minutes}</b> мин.` : `До свежих апельсинов (${fresh}) не добраться — ответ <b>−1</b>.`),
  },

  /* Word Ladder */
  'wl.ev.start': {
    en: (b, e) => `From “${b}” to “${e}”. Words are nodes; an edge joins words that differ in one letter. BFS level by level.`,
    ru: (b, e) => `От «${b}» к «${e}». Слова — вершины, ребро соединяет слова с одной отличающейся буквой. BFS по уровням.`,
  },
  'wl.ev.level': {
    en: (n, words) => `Level ${n}: ${list(words)} — every word one letter away from the previous level and not seen before.`,
    ru: (n, words) => `Уровень ${n}: ${list(words)} — слова в одной букве от предыдущего уровня, ещё не встречавшиеся.`,
  },
  'wl.ev.found': { en: (n, path) => `The target is on level ${n}: <b>${chain(path)}</b>, ${n} words.`, ru: (n, path) => `Цель на уровне ${n}: <b>${chain(path)}</b>, слов: ${n}.` },
  'wl.ev.none': { en: e => `“${e}” is unreachable — answer 0.`, ru: e => `«${e}» недостижимо — ответ 0.` },

  /* Level Order */
  'lvl.ev.start': { en: () => 'Queue = [root]. Before each level remember queue.Count — that is the size of the level.', ru: () => 'Очередь = [корень]. Перед уровнем запоминаем queue.Count — это размер уровня.' },
  'lvl.ev.level': {
    en: (n, values, queued) => `Level ${n}: take exactly its nodes → <b>${list(values)}</b>. Their children (${queued}) wait in the queue.`,
    ru: (n, values, queued) => `Уровень ${n}: берём ровно его узлы → <b>${list(values)}</b>. Их дети (${queued}) ждут в очереди.`,
  },
  'lvl.ev.done': { en: n => `Queue is empty: ${n} levels.`, ru: n => `Очередь пуста: уровней — ${n}.` },

  /* Validate BST */
  'bst.ev.start': {
    en: () => 'Each node gets an interval (lo, hi) from its ancestors. Going left narrows hi, going right narrows lo.',
    ru: () => 'Каждый узел получает интервал (lo, hi) от предков. Влево — сужаем hi, вправо — сужаем lo.',
  },
  'bst.ev.ok': { en: (v, lo, hi) => `${v} ∈ (${lo}, ${hi}) — fine, check its children.`, ru: (v, lo, hi) => `${v} ∈ (${lo}, ${hi}) — в порядке, проверяем детей.` },
  'bst.ev.bad': {
    en: (v, lo, hi) => `${v} ∉ (${lo}, ${hi}) — <b>not a BST</b>. Comparing only with the parent would have missed it.`,
    ru: (v, lo, hi) => `${v} ∉ (${lo}, ${hi}) — <b>не BST</b>. Сравнение только с родителем это пропустило бы.`,
  },
  'bst.ev.done': { en: ok => (ok ? 'All nodes fit their intervals — <b>valid BST</b>.' : 'Stopped at the first violation.'), ru: ok => (ok ? 'Все узлы в своих интервалах — <b>корректное BST</b>.' : 'Остановились на первом нарушении.') },

  /* Binary Tree Maximum Path Sum */
  'mps.ev.start': {
    en: () => 'Each node returns its best downward gain and records the best path that turns at it.',
    ru: () => 'Каждый узел возвращает лучший спуск вниз и записывает лучший путь с поворотом в нём.',
  },
  'mps.ev.ret': {
    en: (v, gl, gr, through, up, rec) => `${v}: gains left ${gl}, right ${gr} (negatives cut to 0). Path turning here: ${gl} + ${v} + ${gr} = ${through}${rec ? ' — <b>new best</b>' : ''}. Return ${up} upward.`,
    ru: (v, gl, gr, through, up, rec) => `${v}: выгода слева ${gl}, справа ${gr} (отрицательное → 0). Путь с поворотом здесь: ${gl} + ${v} + ${gr} = ${through}${rec ? ' — <b>рекорд</b>' : ''}. Наверх возвращаем ${up}.`,
  },
  'mps.ev.done': { en: best => `Maximum path sum: <b>${best}</b>. The returned value and the recorded one are different things.`, ru: best => `Максимальная сумма пути: <b>${best}</b>. Возвращаемое и записанное — разные величины.` },
};
