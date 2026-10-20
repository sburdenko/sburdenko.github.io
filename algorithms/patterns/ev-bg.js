/** Step texts for the rigs in rigs-bg.js. */
const num = v => String(v).replace('-', '−');
/** Russian plural: 1 шаг, 2 шага, 5 шагов. */
const ru = (n, one, few, many) => {
  const t = Math.abs(n) % 100, u = t % 10;
  return `${n} ${t > 10 && t < 20 ? many : u === 1 ? one : u > 1 && u < 5 ? few : many}`;
};
const enPlural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;
const at = (r, c) => `(${r}, ${c})`;
const cellsList = list => list.map(([r, c]) => at(r, c)).join(', ');
const OCEAN = { P: { en: 'Pacific', ru: 'Тихий' }, A: { en: 'Atlantic', ru: 'Атлантический' } };
const OCEAN_OF = { P: { en: 'the Pacific', ru: 'Тихого' }, A: { en: 'the Atlantic', ru: 'Атлантического' } };
const EDGE_OF = { P: { en: 'the top row and the left column', ru: 'верхней строки и левого столбца' }, A: { en: 'the bottom row and the right column', ru: 'нижней строки и правого столбца' } };

export const EV_BG = {
  /* Reverse Bits: the loop */
  'rb.ev.start': {
    en: n => `n = ${n}, r = 0. Every round: take the low bit of n (n & 1), push it into r from the right (r << 1 | bit), drop it from n (n >>= 1). 32 rounds, whatever n is.`,
    ru: n => `n = ${n}, r = 0. Каждый раунд: берём младший бит n (n & 1), вдвигаем его в r справа (r << 1 | bit) и выбрасываем из n (n >>= 1). 32 раунда, каким бы ни было n.`,
  },
  'rb.ev.one': {
    en: (round, bit, i) => `Round ${round}: bit ${i} of the original n is <b>1</b>. r moves one place up and takes the 1 at bit 0; n shifts right, its next bit comes down to bit 0.`,
    ru: (round, bit, i) => `Раунд ${round}: бит ${i} исходного n — <b>1</b>. r сдвигается на разряд вверх и принимает 1 в бит 0; n сдвигается вправо, его следующий бит спускается в бит 0.`,
  },
  'rb.ev.zero': {
    en: (round, bit, i) => `Round ${round}: bit ${i} of the original n is <b>0</b>. r still moves up and gets a 0 at the bottom — a zero is a bit too, its place in the answer matters.`,
    ru: (round, bit, i) => `Раунд ${round}: бит ${i} исходного n — <b>0</b>. r всё равно сдвигается вверх и получает 0 снизу — ноль тоже бит, и его место в ответе важно.`,
  },
  'rb.ev.pad': {
    en: (round, bit, i, to, r) => (r === 0 ? `Round ${round}: n is 0, and so is r — the answer is 0, but the loop still runs all 32 rounds.` : `Round ${round}: n is already 0, but the loop does not stop. The shift moves every bit of r one place up, toward its final position; stopping now would leave r = ${r >>> 1} — too small by a factor of 2^${33 - round}.`),
    ru: (round, bit, i, to, r) => (r === 0 ? `Раунд ${round}: n — 0, и r тоже — ответ будет 0, но цикл всё равно делает все 32 раунда.` : `Раунд ${round}: n уже 0, но цикл не останавливается. Сдвиг поднимает каждый бит r на разряд — к его окончательному месту; если остановиться сейчас, останется r = ${r >>> 1} — в 2^${33 - round} раз меньше нужного.`),
  },
  'rb.ev.done': {
    en: (n, r) => `32 rounds. Bit i of ${n} has been pushed up 31 − i times after it entered r, so it is now bit 31 − i. Answer <b>${r}</b>.`,
    ru: (n, r) => `32 раунда. Бит i числа ${n} после входа в r поднялся ещё 31 − i раз и теперь стоит в бите 31 − i. Ответ <b>${r}</b>.`,
  },

  /* Reverse Bits: masks */
  'rb.ev.masks': {
    en: n => `n = ${n}. Without a loop: reverse the order of the two halves, then of the bytes inside each half, the nibbles, the pairs and the single bits. Five swaps of blocks, each with a pair of masks.`,
    ru: n => `n = ${n}. Без цикла: меняем местами две половины, потом байты внутри каждой половины, тетрады, пары и отдельные биты. Пять обменов блоков, у каждого — пара масок.`,
  },
  'rb.ev.halves': {
    en: (w, before, after) => `Step 1: (n >> 16) | (n << 16). The two 16-bit halves change places; the shifts themselves push out what does not belong, so no mask is needed yet. n = ${after}.`,
    ru: (w, before, after) => `Шаг 1: (n >> 16) | (n << 16). Две половины по 16 бит меняются местами; лишнее выталкивают сами сдвиги, маска пока не нужна. n = ${after}.`,
  },
  'rb.ev.swap': {
    en: (w, before, after, step, hi, lo) => `Step ${step}: blocks of ${enPlural(w, 'bit')}. The mask 0x${hi.toString(16).toUpperCase()} keeps the upper block of every pair and moves it down by ${w}, 0x${lo.toString(16).toUpperCase().padStart(8, '0')} keeps the lower one and moves it up by ${w}. n = ${after}.`,
    ru: (w, before, after, step, hi, lo) => `Шаг ${step}: блоки по ${ru(w, 'биту', 'бита', 'бит')}. Маска 0x${hi.toString(16).toUpperCase()} оставляет верхний блок каждой пары и сдвигает его вниз на ${w}, 0x${lo.toString(16).toUpperCase().padStart(8, '0')} — нижний, и сдвигает его вверх на ${w}. n = ${after}.`,
  },
  'rb.ev.masksDone': {
    en: (n, r) => `After the swaps of 16, 8, 4, 2 and 1 every bit has crossed every scale once, and the order is reversed: <b>${r}</b>. Five steps instead of 32 rounds, no branches.`,
    ru: (n, r) => `После обменов по 16, 8, 4, 2 и 1 каждый бит пересёк каждый масштаб по разу, и порядок развёрнут: <b>${r}</b>. Пять шагов вместо 32 раундов и без ветвлений.`,
  },

  /* Divide Two Integers */
  'div.ev.start': {
    en: (a, b) => `${num(a)} / ${num(b)} without *, / and %. The quotient is built bit by bit, from bit 31 down, like long division in base 2.`,
    ru: (a, b) => `${num(a)} / ${num(b)} без *, / и %. Частное собираем по битам, с 31-го вниз, — как деление столбиком в двоичной системе.`,
  },
  'div.ev.overflow': {
    en: () => 'int.MinValue / −1 = 2^31 = 2147483648, and the largest int is 2^31 − 1. This is the only overflow in int division; LeetCode asks for <b>int.MaxValue = 2147483647</b>.',
    ru: () => 'int.MinValue / −1 = 2^31 = 2147483648, а наибольший int — 2^31 − 1. Это единственное переполнение при делении int; LeetCode просит вернуть <b>int.MaxValue = 2147483647</b>.',
  },
  'div.ev.signPos': {
    en: (x, y, a, b) => `${x < 0 ? 'Both are negative' : 'Neither is negative'}: the result is <b>non-negative</b>. From now on only |a| = ${a} and |b| = ${b}, in long — |int.MinValue| = 2^31 would not fit an int.`,
    ru: (x, y, a, b) => `${x < 0 ? 'Оба отрицательные' : 'Ни одно не отрицательно'}: результат <b>неотрицательный</b>. Дальше только |a| = ${a} и |b| = ${b}, в long — |int.MinValue| = 2^31 в int не поместился бы.`,
  },
  'div.ev.signNeg': {
    en: (x, y, a, b) => `Exactly one of the two is negative (bit 31 is set in ${x < 0 ? 'the dividend' : 'the divisor'}): the result is <b>negative</b>. Divide |a| = ${a} by |b| = ${b} in long and put the minus back at the end.`,
    ru: (x, y, a, b) => `Отрицательно ровно одно из двух (бит 31 стоит у ${x < 0 ? 'делимого' : 'делителя'}): результат <b>отрицательный</b>. Делим |a| = ${a} на |b| = ${b} в long, а минус вернём в конце.`,
  },
  'div.ev.lead': {
    en: (from, to, a, b, top) => (top < 0
      ? `For every k from 31 to 0, a >> k < ${b}: even a itself is smaller than b. Every bit of the quotient is 0.`
      : `For k = ${from} … ${to}: a >> k < ${b}, b · 2^k does not fit into ${a}. These bits of the quotient are 0; the first real question is k = ${top}.`),
    ru: (from, to, a, b, top) => (top < 0
      ? `Для всех k от 31 до 0 a >> k < ${b}: даже само a меньше b. Все биты частного — 0.`
      : `Для k = ${from} … ${to}: a >> k < ${b}, b · 2^k не помещается в ${a}. Эти биты частного — 0; первый настоящий вопрос — k = ${top}.`),
  },
  'div.ev.fit': {
    en: (k, shifted, b, sub, a, q, before) => `k = ${k}: a >> ${k} = ${shifted} ≥ ${b}, so b · 2^${k} = ${sub} fits into ${before}. Subtract it: a = ${a}; bit ${k} of the quotient is <b>1</b>, q = ${q}.`,
    ru: (k, shifted, b, sub, a, q, before) => `k = ${k}: a >> ${k} = ${shifted} ≥ ${b}, значит, b · 2^${k} = ${sub} помещается в ${before}. Вычитаем: a = ${a}; бит ${k} частного — <b>1</b>, q = ${q}.`,
  },
  'div.ev.skip': {
    en: (k, shifted, b, a, q) => `k = ${k}: a >> ${k} = ${shifted} < ${b} — b · 2^${k} is more than what is left (${a}). Bit ${k} of the quotient is <b>0</b>, a stays.`,
    ru: (k, shifted, b, a, q) => `k = ${k}: a >> ${k} = ${shifted} < ${b} — b · 2^${k} больше остатка (${a}). Бит ${k} частного — <b>0</b>, a не меняется.`,
  },
  'div.ev.done': {
    en: (x, y, answer, rem, neg, q) => `All 32 bits are decided: q = ${q}, the remainder ${rem} is dropped (truncation toward zero)${neg ? ', and the sign is minus' : ''}. ${num(x)} / ${num(y)} = <b>${num(answer)}</b>.`,
    ru: (x, y, answer, rem, neg, q) => `Все 32 бита решены: q = ${q}, остаток ${rem} отбрасываем (округление к нулю)${neg ? ', а знак — минус' : ''}. ${num(x)} / ${num(y)} = <b>${num(answer)}</b>.`,
  },

  /* K Closest Points */
  'kc.ev.start': {
    en: (k, n) => `${n} points, keep the ${k} nearest. A max-heap of at most ${k} by d = x² + y²: the farthest of the kept points is always on top, ready to leave.`,
    ru: (k, n) => `${ru(n, 'точка', 'точки', 'точек')}, оставить нужно ${k} ближайших. Max-heap не больше чем на ${k} по d = x² + y²: сверху всегда самая дальняя из оставленных, и уйти ей проще всего.`,
  },
  'kc.ev.add': {
    en: (i, x, y, d, size) => `Point #${i} (${num(x)}, ${num(y)}): d = ${x * x} + ${y * y} = <b>${d}</b>, no square root needed. It goes to the bottom of the heap, slot ${size - 1}.`,
    ru: (i, x, y, d, size) => `Точка №${i} (${num(x)}, ${num(y)}): d = ${x * x} + ${y * y} = <b>${d}</b>, корень не нужен. Она ставится в низ кучи, в ячейку ${size - 1}.`,
  },
  'kc.ev.up': {
    en: (i, d, above, dAbove, j) => `${d} > ${dAbove}: the parent (point #${above}) is nearer, so #${i} rises above it — now in slot ${j}.`,
    ru: (i, d, above, dAbove, j) => `${d} > ${dAbove}: родитель (точка №${above}) ближе, поэтому №${i} поднимается над ним — теперь в ячейке ${j}.`,
  },
  'kc.ev.drop': {
    en: (gone, x, y, d, root) => `The heap holds k + 1 points: the root leaves — point #${gone} (${num(x)}, ${num(y)}), d = ${d}, the farthest of them. The last slot moves to the top and sinks; the new farthest kept is d = ${root}.`,
    ru: (gone, x, y, d, root) => `В куче k + 1 точка: корень уходит — точка №${gone} (${num(x)}, ${num(y)}), d = ${d}, самая дальняя из них. Последняя ячейка встаёт наверх и тонет; теперь самая дальняя из оставленных — d = ${root}.`,
  },
  'kc.ev.dropNew': {
    en: (gone, x, y, d, root) => `The new point is farther than all k kept ones, so it rose to the root — and leaves at once: #${gone}, d = ${d}. The kept set does not change; the full heap could have skipped it by comparing with the root (${root}).`,
    ru: (gone, x, y, d, root) => `Новая точка дальше всех k оставленных, поэтому поднялась в корень — и сразу уходит: №${gone}, d = ${d}. Оставленные не меняются; полная куча могла пропустить её, сравнив с корнем (${root}).`,
  },
  'kc.ev.done': {
    en: (answer, k, root) => `All points seen. The heap holds the <b>${k}</b> nearest: ${answer.map(([x, y]) => `[${num(x)}, ${num(y)}]`).join(', ')} — every one inside the circle d ≤ ${root}, every dropped one outside or on it.`,
    ru: (answer, k, root) => `Все точки просмотрены. В куче <b>${k}</b> ближайших: ${answer.map(([x, y]) => `[${num(x)}, ${num(y)}]`).join(', ')} — все внутри круга d ≤ ${root}, все выброшенные — снаружи или на границе.`,
  },

  /* Clone Graph */
  'cg.ev.start': {
    en: (n, m) => `${n} nodes, ${m} edges. Copy them with a BFS from node 1 and a dictionary old → new: it says whether a node already has its copy, and gives that copy.`,
    ru: (n, m) => `${ru(n, 'узел', 'узла', 'узлов')}, ${ru(m, 'ребро', 'ребра', 'рёбер')}. Копируем обходом в ширину от узла 1 со словарём «старый → новый»: он говорит, есть ли у узла копия, и выдаёт её.`,
  },
  'cg.ev.root': {
    en: () => 'Copy the start: 1 → 1′ goes into the dictionary, 1 into the queue. The copy is made when a node is first met, not when it leaves the queue.',
    ru: () => 'Копируем старт: 1 → 1′ — в словарь, 1 — в очередь. Копия создаётся при первой встрече с узлом, а не когда он выходит из очереди.',
  },
  'cg.ev.pop': {
    en: (cur, adj) => `Take ${cur} from the queue. Its neighbours: ${adj.join(', ')}. For each one, ${cur}′ must get a reference to that neighbour’s copy.`,
    ru: (cur, adj) => `Берём ${cur} из очереди. Его соседи: ${adj.join(', ')}. Для каждого ${cur}′ должен получить ссылку на копию этого соседа.`,
  },
  'cg.ev.new': {
    en: (cur, nb) => `${nb} has no copy yet: create ${nb}′, write ${nb} → ${nb}′, put ${nb} into the queue — and add ${nb}′ to the neighbours of ${cur}′.`,
    ru: (cur, nb) => `У ${nb} копии ещё нет: создаём ${nb}′, записываем ${nb} → ${nb}′, ставим ${nb} в очередь — и добавляем ${nb}′ в соседи ${cur}′.`,
  },
  'cg.ev.link': {
    en: (cur, nb, state) => `${nb}′ already exists (${state === 'done' ? `${nb} is processed` : `${nb} waits in the queue`}): no new node, <b>only the reference</b> — ${nb}′ goes into the neighbours of ${cur}′. Making another copy would split the graph.`,
    ru: (cur, nb, state) => `${nb}′ уже есть (${state === 'done' ? `${nb} уже обработан` : `${nb} ждёт в очереди`}): новый узел не нужен, <b>только ссылка</b> — ${nb}′ попадает в соседи ${cur}′. Вторая копия разорвала бы граф.`,
  },
  'cg.ev.done': {
    en: (n, refs, m) => `The queue is empty: ${n} copies and ${refs} references — every edge twice, once from each end, as in the original. Return 1′.`,
    ru: (n, refs, m) => `Очередь пуста: ${ru(n, 'копия', 'копии', 'копий')} и ${ru(refs, 'ссылка', 'ссылки', 'ссылок')} — каждое ребро дважды, по разу с каждого конца, как в оригинале. Возвращаем 1′.`,
  },

  /* Min Cost to Connect All Points */
  'kr.ev.start': {
    en: (n, m) => (n > 1 ? `${n} points, so ${m} possible edges — every pair, weighted by |dx| + |dy|. A spanning tree needs ${n - 1} of them.` : 'One point: nothing to connect, the cost is 0.'),
    ru: (n, m) => (n > 1 ? `${ru(n, 'точка', 'точки', 'точек')}, значит, ${ru(m, 'возможное ребро', 'возможных ребра', 'возможных рёбер')} — каждая пара, вес |dx| + |dy|. Остову нужно ${n - 1} из них.` : 'Одна точка: соединять нечего, стоимость 0.'),
  },
  'kr.ev.sort': {
    en: (m, lo, hi) => `Sort all ${m} edges by weight, ${lo} to ${hi}. Kruskal goes from the cheapest: an edge is taken if it joins two different components.`,
    ru: (m, lo, hi) => `Сортируем все рёбра (${m}) по весу, от ${lo} до ${hi}. Крускал идёт от самого дешёвого: ребро берётся, если соединяет две разные компоненты.`,
  },
  'kr.ev.take': {
    en: (i, j, w, total, taken, need) => `Edge ${i}-${j}, weight ${w}: Union returns <b>true</b> — the ends were in different components, now they are one. Cost ${total}, ${taken} of ${need} edges.`,
    ru: (i, j, w, total, taken, need) => `Ребро ${i}-${j}, вес ${w}: Union возвращает <b>true</b> — концы были в разных компонентах, теперь в одной. Стоимость ${total}, ребро ${taken} из ${need}.`,
  },
  'kr.ev.skip': {
    en: (i, j, w) => `Edge ${i}-${j}, weight ${w}: ${i} and ${j} already share a root — <b>skip</b>. The edge would close a cycle, and the tree connects them more cheaply already.`,
    ru: (i, j, w) => `Ребро ${i}-${j}, вес ${w}: у ${i} и ${j} уже общий корень — <b>пропускаем</b>. Ребро замкнуло бы цикл, а дерево уже связывает их дешевле.`,
  },
  'kr.ev.done': {
    en: (total, need, rest) => (need > 0
      ? `${need} edges taken: every point is connected. Minimum cost <b>${total}</b>${rest ? `; the remaining ${rest} edges are not even looked at` : ''}.`
      : 'Cost <b>0</b>.'),
    ru: (total, need, rest) => (need > 0
      ? `Взято ${ru(need, 'ребро', 'ребра', 'рёбер')}: все точки связаны. Наименьшая стоимость <b>${total}</b>${rest ? `; ${ru(rest, 'оставшееся ребро', 'оставшихся ребра', 'оставшихся рёбер')} даже не смотрим` : ''}.`
      : 'Стоимость <b>0</b>.'),
  },

  /* Pacific Atlantic */
  'pa.ev.start': {
    en: (m, n) => `${m} × ${n} heights. Searching downhill from every cell would repeat the same work; instead search backwards from each ocean — uphill.`,
    ru: (m, n) => `Высоты ${m} × ${n}. Поиск вниз из каждой клетки повторял бы одну и ту же работу; вместо этого ищем назад от каждого океана — вверх.`,
  },
  'pa.ev.seed': {
    en: (side, count) => `${OCEAN[side].en}: all ${count} cells of ${EDGE_OF[side].en} touch it, so water from them gets there. They all go into the queue at once.`,
    ru: (side, count) => `${OCEAN[side].ru} океан: все клетки ${EDGE_OF[side].ru} (${count}) касаются его, вода из них туда попадает. Все сразу — в очередь.`,
  },
  'pa.ev.climb': {
    en: (side, r, c, h, added, lower) => `${at(r, c)}, height ${h}, reaches ${OCEAN_OF[side].en}. ${added.length > 1 ? 'Neighbours' : 'A neighbour'} at least as high: ${added.map(([y, x, v]) => `${at(y, x)} = ${v}`).join(', ')} — water from ${added.length > 1 ? 'them runs down here, so they reach' : 'there runs down here, so it reaches'} it too.${lower ? ` ${enPlural(lower, 'lower neighbour')} — water from there cannot climb.` : ''}`,
    ru: (side, r, c, h, added, lower) => `${at(r, c)}, высота ${h}, достаёт до ${OCEAN_OF[side].ru}. ${added.length > 1 ? 'Соседи' : 'Сосед'} не ниже: ${added.map(([y, x, v]) => `${at(y, x)} = ${v}`).join(', ')} — вода ${added.length > 1 ? 'из них стекает сюда, значит, и они достают' : 'оттуда стекает сюда, значит, и он достаёт'}.${lower ? ` Ниже — ${ru(lower, 'сосед', 'соседа', 'соседей')}: оттуда вода сюда не поднимется.` : ''}`,
  },
  'pa.ev.stuck': {
    en: (side, r, c, h, added, lower) => `${at(r, c)}, height ${h}: nothing new — ${lower ? `${enPlural(lower, 'neighbour')} lower, the rest already marked` : 'every neighbour is already marked'}.`,
    ru: (side, r, c, h, added, lower) => `${at(r, c)}, высота ${h}: ничего нового — ${lower ? `${ru(lower, 'сосед ниже', 'соседа ниже', 'соседей ниже')}, остальные уже отмечены` : 'все соседи уже отмечены'}.`,
  },
  'pa.ev.both': {
    en: (cells, total) => `Both maps are done. Marked on both — water from there reaches both oceans: <b>${cellsList(cells)}</b> (${cells.length} of ${total}).`,
    ru: (cells, total) => `Обе карты готовы. Отмечены на обеих — вода оттуда доходит до обоих океанов: <b>${cellsList(cells)}</b> (${cells.length} из ${total}).`,
  },
};
