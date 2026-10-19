/** Step texts for the chapter 01–04 rigs added next to the original ones in i18n-a.js. */
const list = a => `[${a.join(', ')}]`;
/** Russian plural: 1 элемент, 2 элемента, 5 элементов. */
const ru = (n, one, few, many) => {
  const t = Math.abs(n) % 100, u = t % 10;
  return `${n} ${t > 10 && t < 20 ? many : u === 1 ? one : u > 1 && u < 5 ? few : many}`;
};
const en = (n, one, many) => `${n} ${n === 1 ? one : many}`;
/** n · (n − 1) · … · 2, written out when short. */
const product = n => (n <= 4 ? Array.from({ length: n - 1 }, (_, k) => n - k).join(' · ') : `${n} · ${n - 1} · … · 2`);

export const EV_A = {
  /* Contains Duplicate */
  'dup.ev.start': { en: () => 'Walk once and drop every value into a HashSet. Add() says whether it was new.', ru: () => 'Идём один раз и кладём каждое число в HashSet. Add() сообщает, было ли оно новым.' },
  'dup.ev.add': { en: x => `Add(${x}) → true: first time we see ${x}.`, ru: x => `Add(${x}) → true: ${x} встречается впервые.` },
  'dup.ev.hit': {
    en: (x, j, i) => `Add(${x}) → <b>false</b>: ${x} was already at index ${j}. Duplicate found at ${i} — stop.`,
    ru: (x, j, i) => `Add(${x}) → <b>false</b>: ${x} уже было на индексе ${j}. Дубликат на ${i} — стоп.`,
  },
  'dup.ev.none': { en: () => 'Every Add() returned true: all values are distinct.', ru: () => 'Каждый Add() вернул true: все числа разные.' },

  /* Group Anagrams */
  'anag.ev.start': { en: () => 'The key of a word is its letters sorted. Anagrams share the key, so they land in the same bucket.', ru: () => 'Ключ слова — его отсортированные буквы. У анаграмм ключ общий, поэтому они попадают в одну корзину.' },
  'anag.ev.key': {
    en: (s, key, isNew) => `“${s}” → key “${key}”. ${isNew ? 'New key — open a new group.' : 'The key exists — append to its group.'}`,
    ru: (s, key, isNew) => `«${s}» → ключ «${key}». ${isNew ? 'Ключ новый — открываем группу.' : 'Ключ уже есть — добавляем в его группу.'}`,
  },
  'anag.ev.done': { en: n => `Done: <b>${n}</b> groups. The dictionary values are the answer.`, ru: n => `Готово: групп — <b>${n}</b>. Значения словаря и есть ответ.` },

  /* Subarray Sum Equals K */
  'psum.ev.start': {
    en: k => `Count subarrays with sum ${k}. A window will not work: numbers can be negative. Keep prefix sums and how often each appeared; 0 has appeared once.`,
    ru: k => `Считаем подмассивы с суммой ${k}. Окно не подойдёт: числа бывают отрицательными. Храним префиксные суммы и сколько раз каждая встречалась; 0 встречался один раз.`,
  },
  'psum.ev.step': {
    en: (i, x, sum, need, found, count) => `+${x} → sum = ${sum}. A subarray ending at ${i} sums to k when an earlier prefix was ${sum} − k = ${need}: ${found ? `seen ${found}×, count = <b>${count}</b>` : 'never seen'}.`,
    ru: (i, x, sum, need, found, count) => `+${x} → sum = ${sum}. Подмассив, кончающийся на ${i}, даёт k, если раньше был префикс ${sum} − k = ${need}: ${found ? `встречался ${found} раз, count = <b>${count}</b>` : 'не встречался'}.`,
  },
  'psum.ev.done': { en: (count, k) => `<b>${count}</b> subarrays sum to ${k}. One pass, O(n).`, ru: (count, k) => `Подмассивов с суммой ${k}: <b>${count}</b>. Один проход, O(n).` },

  /* Container With Most Water */
  'water.ev.start': { en: () => 'Start with the outermost lines: the width is at its maximum. Area = min(heights) × width.', ru: () => 'Начинаем с крайних линий: ширина максимальна. Площадь = min(высот) × ширина.' },
  'water.ev.step': {
    en: (hl, hr, w, area, rec, move) => `min(${hl}, ${hr}) × ${w} = ${area}${rec ? ' — <b>new best</b>' : ''}. ${move === 'L' ? 'The left side is lower — move L; moving R cannot help.' : move === 'R' ? 'The right side is lower — move R.' : 'Equal heights — move either, say R.'}`,
    ru: (hl, hr, w, area, rec, move) => `min(${hl}, ${hr}) × ${w} = ${area}${rec ? ' — <b>рекорд</b>' : ''}. ${move === 'L' ? 'Левая ниже — двигаем L: сдвиг R не поможет.' : move === 'R' ? 'Правая ниже — двигаем R.' : 'Высоты равны — двигаем любую, например R.'}`,
  },
  'water.ev.done': { en: best => `The pointers met. Answer: <b>${best}</b> (dashed). n − 1 pairs checked instead of n²/2.`, ru: best => `Указатели встретились. Ответ: <b>${best}</b> (пунктир). Проверили n − 1 пар вместо n²/2.` },

  /* 3Sum */
  'tsum.ev.start': { en: a => `Sort first: ${list(a)}. Then fix one number and find the other two with pointers.`, ru: a => `Сначала сортируем: ${list(a)}. Потом фиксируем одно число, а два других ищем указателями.` },
  'tsum.ev.skip': { en: v => `${v} again — skip it, or the same triples come out twice.`, ru: v => `Снова ${v} — пропускаем, иначе те же тройки выйдут дважды.` },
  'tsum.ev.fix': { en: (v, need) => `Fix ${v}. Now we need a pair summing to ${need}: L from the left, R from the right.`, ru: (v, need) => `Фиксируем ${v}. Нужна пара с суммой ${need}: L слева, R справа.` },
  'tsum.ev.check': {
    en: (a, b, c, sum, small) => `${a} + ${b} + ${c} = ${sum}. ${small ? 'Too small — move L right.' : 'Too big — move R left.'}`,
    ru: (a, b, c, sum, small) => `${a} + ${b} + ${c} = ${sum}. ${small ? 'Мало — двигаем L вправо.' : 'Много — двигаем R влево.'}`,
  },
  'tsum.ev.found': { en: (a, b, c) => `${a} + ${b} + ${c} = 0 — <b>found</b>. Skip equal values on both sides and keep going.`, ru: (a, b, c) => `${a} + ${b} + ${c} = 0 — <b>нашли</b>. Пропускаем одинаковые значения с обеих сторон и идём дальше.` },
  'tsum.ev.done': { en: n => `Done: <b>${n}</b> unique triples. O(n²) instead of O(n³).`, ru: n => `Готово: уникальных троек — <b>${n}</b>. O(n²) вместо O(n³).` },

  /* Trapping Rain Water */
  'trap.ev.start': {
    en: () => 'Water above a bar = min(max on the left, max on the right) − its height. Two pointers find it without extra arrays.',
    ru: () => 'Вода над столбиком = min(максимум слева, максимум справа) − его высота. Два указателя находят её без лишних массивов.',
  },
  'trap.ev.left': {
    en: (l, h, lmax, add, hr) => `h[${l}] = ${h} < h[R] = ${hr}: the left side is the limit, lmax = ${lmax}. Water here: ${add ? `<b>${lmax} − ${h} = ${add}</b>` : '0'}. Move L.`,
    ru: (l, h, lmax, add, hr) => `h[${l}] = ${h} < h[R] = ${hr}: ограничивает левая сторона, lmax = ${lmax}. Воды здесь: ${add ? `<b>${lmax} − ${h} = ${add}</b>` : '0'}. Двигаем L.`,
  },
  'trap.ev.right': {
    en: (r, h, rmax, add, hl) => `h[${r}] = ${h} ≤ h[L] = ${hl}: the right side is the limit, rmax = ${rmax}. Water here: ${add ? `<b>${rmax} − ${h} = ${add}</b>` : '0'}. Move R.`,
    ru: (r, h, rmax, add, hl) => `h[${r}] = ${h} ≤ h[L] = ${hl}: ограничивает правая сторона, rmax = ${rmax}. Воды здесь: ${add ? `<b>${rmax} − ${h} = ${add}</b>` : '0'}. Двигаем R.`,
  },
  'trap.ev.done': { en: total => `The pointers met. Trapped water: <b>${total}</b>. O(n) time, O(1) memory.`, ru: total => `Указатели встретились. Воды задержалось: <b>${total}</b>. O(n) время, O(1) память.` },

  /* Maximum Average Subarray */
  'avg.ev.init': { en: (k, sum) => `Sum of the first ${k} elements: ${sum}. This is the starting window.`, ru: (k, sum) => `Сумма первых ${k} элементов: ${sum}. Это стартовое окно.` },
  'avg.ev.slide': {
    en: (inn, out, sum, rec) => `Slide: +${inn} on the right, −${out} on the left → sum = ${sum}${rec ? ' — <b>new best</b>' : ''}.`,
    ru: (inn, out, sum, rec) => `Сдвиг: +${inn} справа, −${out} слева → sum = ${sum}${rec ? ' — <b>рекорд</b>' : ''}.`,
  },
  'avg.ev.done': { en: (best, k, avg) => `Best sum ${best} → average ${best} / ${k} = <b>${avg}</b>.`, ru: (best, k, avg) => `Лучшая сумма ${best} → среднее ${best} / ${k} = <b>${avg}</b>.` },

  /* Minimum Size Subarray Sum */
  'minw.ev.start': { en: t => `Shortest window with sum ≥ ${t}. All numbers are positive, so shrinking always lowers the sum.`, ru: t => `Самое короткое окно с суммой ≥ ${t}. Все числа положительные, поэтому сжатие всегда уменьшает сумму.` },
  'minw.ev.grow': {
    en: (x, sum, t, enough) => `Grow: +${x} → sum = ${sum}. ${enough ? `≥ ${t} — the window qualifies, now shrink it.` : `Still < ${t}.`}`,
    ru: (x, sum, t, enough) => `Расширяем: +${x} → sum = ${sum}. ${enough ? `≥ ${t} — окно подходит, теперь сжимаем.` : `Всё ещё < ${t}.`}`,
  },
  'minw.ev.shrink': {
    en: (len, rec, out, sum) => `Length ${len}${rec ? ' — <b>new shortest</b>' : ''}. Drop ${out} from the left → sum = ${sum}.`,
    ru: (len, rec, out, sum) => `Длина ${len}${rec ? ' — <b>новый минимум</b>' : ''}. Убираем ${out} слева → sum = ${sum}.`,
  },
  'minw.ev.done': { en: best => `Answer: <b>${best}</b>. Each element entered and left once → O(n).`, ru: best => `Ответ: <b>${best}</b>. Каждый элемент вошёл и вышел один раз → O(n).` },

  /* Minimum Window Substring */
  'mwin.ev.start': {
    en: (t, distinct) => `We need every letter of “${t}”. formed counts how many of the ${distinct} distinct letters are fully covered.`,
    ru: (t, distinct) => `Нужны все буквы «${t}». formed считает, сколько из ${distinct} разных букв уже покрыто полностью.`,
  },
  'mwin.ev.grow': {
    en: (c, needed, formed, total) => `Grow: “${c}”${needed ? ` is needed — formed = ${formed} of ${total}` : ' is not needed'}.${formed === total ? ' The window covers t — shrink it.' : ''}`,
    ru: (c, needed, formed, total) => `Расширяем: «${c}»${needed ? ` нужна — formed = ${formed} из ${total}` : ' не нужна'}.${formed === total ? ' Окно покрывает t — сжимаем.' : ''}`,
  },
  'mwin.ev.shrink': {
    en: (win, rec, out, still) => `“${win}” covers t${rec ? ' — <b>shortest so far</b>' : ''}. Drop “${out}” from the left${still ? ', still covered.' : ' — coverage lost, grow again.'}`,
    ru: (win, rec, out, still) => `«${win}» покрывает t${rec ? ' — <b>пока самое короткое</b>' : ''}. Убираем «${out}» слева${still ? ', покрытие держится.' : ' — покрытие потеряно, снова расширяем.'}`,
  },
  'mwin.ev.done': { en: w => (w ? `Answer: <b>“${w}”</b>. O(|s| + |t|).` : 'No window covers t.'), ru: w => (w ? `Ответ: <b>«${w}»</b>. O(|s| + |t|).` : 'Ни одно окно не покрывает t.') },

  /* Search in Rotated Sorted Array */
  'rsa.ev.start': { en: t => `Looking for ${t}. The array is rotated, but one half around mid is always sorted.`, ru: t => `Ищем ${t}. Массив повёрнут, но одна половина вокруг mid всегда отсортирована.` },
  'rsa.ev.probe': {
    en: (mid, v, leftSorted, lo, hi, t, inside, goLeft) => `a[mid] = ${v}. The ${leftSorted ? 'left' : 'right'} half [${lo}..${hi}] is sorted (highlighted). ${t} is ${inside ? '' : 'not '}inside it → go ${goLeft ? 'left' : 'right'}.`,
    ru: (mid, v, leftSorted, lo, hi, t, inside, goLeft) => `a[mid] = ${v}. ${leftSorted ? 'Левая' : 'Правая'} половина [${lo}..${hi}] отсортирована (подсвечена). ${t} ${inside ? '' : 'не '}лежит в ней → идём ${goLeft ? 'влево' : 'вправо'}.`,
  },
  'rsa.ev.found': { en: mid => `a[${mid}] is the target — <b>found</b> in O(log n).`, ru: mid => `a[${mid}] — искомое, <b>нашли</b> за O(log n).` },
  'rsa.ev.none': { en: t => `The range is empty: ${t} is not in the array.`, ru: t => `Диапазон пуст: ${t} в массиве нет.` },

  /* Koko Eating Bananas */
  'koko.ev.start': {
    en: (lo, hi, h) => `There is no array to search — search the speeds [${lo}..${hi}]. fits(k) = “can finish in ${h} hours”; it is false…false, true…true.`,
    ru: (lo, hi, h) => `Массива для поиска нет — ищем по скоростям [${lo}..${hi}]. fits(k) = «успеваю за ${h} часов»: false…false, true…true.`,
  },
  'koko.ev.probe': {
    en: (k, per, hours, h, fits) => `k = ${k}: hours per pile ${list(per)} → ${hours} ${fits ? `≤ ${h} — fits, try slower (hi = k)` : `> ${h} — too slow, go faster (lo = k + 1)`}.`,
    ru: (k, per, hours, h, fits) => `k = ${k}: часов по кучам ${list(per)} → ${hours} ${fits ? `≤ ${h} — успеваем, пробуем медленнее (hi = k)` : `> ${h} — не успеваем, быстрее (lo = k + 1)`}.`,
  },
  'koko.ev.done': { en: k => `lo = hi: the minimal speed is <b>${k}</b>.`, ru: k => `lo = hi: минимальная скорость — <b>${k}</b>.` },

  /* Median of Two Sorted Arrays */
  'med.ev.start': {
    en: (m, n, half) => `Cut A (${en(m, 'item', 'items')}, the smaller) at i and B at j = ${half} − i, so the left side holds ${en(half, 'number', 'numbers')}. Binary search over i.`,
    ru: (m, n, half) => `Режем A (${ru(m, 'элемент', 'элемента', 'элементов')}, меньший) по i, B — по j = ${half} − i, чтобы слева было ${ru(half, 'число', 'числа', 'чисел')}. Бинпоиск по i.`,
  },
  'med.ev.cut': {
    en: (i, j, al, ar, bl, br, verdict) => `i = ${i}, j = ${j}: A left ${al} | right ${ar}, B left ${bl} | right ${br}. ${verdict === 'ok' ? 'Both left ends ≤ both right ends — <b>the cut is right</b>.' : verdict === 'left' ? `${al} > ${br}: A gives too much — move i left.` : `${bl} > ${ar}: A gives too little — move i right.`}`,
    ru: (i, j, al, ar, bl, br, verdict) => `i = ${i}, j = ${j}: A слева ${al} | справа ${ar}, B слева ${bl} | справа ${br}. ${verdict === 'ok' ? 'Оба левых края ≤ обоих правых — <b>разрез верный</b>.' : verdict === 'left' ? `${al} > ${br}: A отдаёт слишком много — двигаем i влево.` : `${bl} > ${ar}: A отдаёт слишком мало — двигаем i вправо.`}`,
  },
  'med.ev.done': {
    en: (median, odd) => `Median = <b>${median}</b> (${odd ? 'odd total: the larger left end' : 'even total: the average of the two ends around the cut'}).`,
    ru: (median, odd) => `Медиана = <b>${median}</b> (${odd ? 'всего нечётно: больший из левых краёв' : 'всего чётно: среднее двух краёв у разреза'}).`,
  },

  /* Longest Consecutive Sequence */
  'lcq.ev.start': { en: n => `Put all numbers into a set (${n} distinct). Count a run only from its first number.`, ru: n => `Кладём все числа в множество (разных: ${n}). Серию считаем только от её первого числа.` },
  'lcq.ev.skip': { en: (x, prev) => `${x}: ${prev} is in the set, so ${x} is not a start — skip it.`, ru: (x, prev) => `${x}: ${prev} есть в множестве, значит ${x} не начало — пропускаем.` },
  'lcq.ev.run': {
    en: (from, to, len, rec) => `${from} starts a run: ${from}…${to}, length ${len}${rec ? ' — <b>new best</b>' : ''}.`,
    ru: (from, to, len, rec) => `${from} начинает серию: ${from}…${to}, длина ${len}${rec ? ' — <b>рекорд</b>' : ''}.`,
  },
  'lcq.ev.done': { en: best => `Longest run: <b>${best}</b>. Each number was touched O(1) times → O(n).`, ru: best => `Самая длинная серия: <b>${best}</b>. Каждое число тронуто O(1) раз → O(n).` },

  /* First Missing Positive */
  'fmp.ev.start': { en: n => `Only 1…${n} can be the answer. Put every such value v into slot #v; ignore the rest.`, ru: n => `Ответ может быть только в 1…${n}. Кладём каждое такое значение v в ячейку #v, остальное игнорируем.` },
  'fmp.ev.swap': { en: (v, i, j) => `${v} belongs in slot #${v}: swap positions ${i + 1} and ${j + 1}.`, ru: (v, i, j) => `${v} должно лежать в ячейке #${v}: меняем позиции ${i + 1} и ${j + 1}.` },
  'fmp.ev.stay': {
    en: (i, v, inRange, home) => `Slot #${i + 1}: ${v} ${home ? 'is home.' : inRange ? 'is a duplicate of a placed value — leave it.' : 'is outside 1…n — leave it.'}`,
    ru: (i, v, inRange, home) => `Ячейка #${i + 1}: ${v} ${home ? 'на своём месте.' : inRange ? '— дубль уже поставленного значения, оставляем.' : 'вне 1…n — оставляем.'}`,
  },
  'fmp.ev.done': {
    en: (answer, full) => (full ? `Every slot holds its number, so the answer is n + 1 = <b>${answer}</b>.` : `Slot #${answer} does not hold ${answer} — answer <b>${answer}</b>.`),
    ru: (answer, full) => (full ? `Все ячейки на месте, значит ответ n + 1 = <b>${answer}</b>.` : `В ячейке #${answer} нет ${answer} — ответ <b>${answer}</b>.`),
  },

  /* Longest Repeating Character Replacement */
  'lrc.ev.start': { en: k => `A window is fine while length − (its most frequent letter) ≤ ${k}: that many letters get replaced.`, ru: k => `Окно годится, пока длина − (самая частая буква) ≤ ${k}: столько букв придётся заменить.` },
  'lrc.ev.grow': {
    en: (c, len, top, need, k) => `Add “${c}”: length ${len}, most frequent ×${top} → replace ${need}${need > k ? ` > ${k}, too many.` : ` ≤ ${k}, fine.`}`,
    ru: (c, len, top, need, k) => `Добавляем «${c}»: длина ${len}, самая частая ×${top} → заменить ${need}${need > k ? ` > ${k}, слишком много.` : ` ≤ ${k}, годится.`}`,
  },
  'lrc.ev.shrink': { en: (out, len, need) => `Drop “${out}” from the left: length ${len}, replace ${need}.`, ru: (out, len, need) => `Убираем «${out}» слева: длина ${len}, заменить ${need}.` },
  'lrc.ev.done': { en: best => `Longest window: <b>${best}</b>.`, ru: best => `Самое длинное окно: <b>${best}</b>.` },

  /* Sliding Window Maximum */
  'swm.ev.start': {
    en: k => `Window of size ${k}. The deque keeps indices whose values decrease from front to back: the front is the maximum, the rest are candidates for later.`,
    ru: k => `Окно размера ${k}. Дека хранит индексы, значения которых убывают от начала к концу: в начале — максимум, дальше — кандидаты на потом.`,
  },
  'swm.ev.out': {
    en: (j, v, l) => `The window now starts at ${l}. Index ${j} (value ${v}) fell out on the left — remove it from the <b>front</b>.`,
    ru: (j, v, l) => `Окно теперь начинается с ${l}. Индекс ${j} (значение ${v}) выпал слева — убираем его из <b>начала</b>.`,
  },
  'swm.ev.pop': {
    en: (j, v, x, i) => `${v} (index ${j}) ≤ ${x}: while ${x} is in the window, ${v} can never be the maximum — pop it from the <b>back</b>.`,
    ru: (j, v, x, i) => `${v} (индекс ${j}) ≤ ${x}: пока ${x} в окне, ${v} максимумом уже не станет — выталкиваем с <b>конца</b>.`,
  },
  'swm.ev.push': {
    en: (i, x, size, full) => `Push index ${i} (value ${x}) to the back. The deque holds ${size}, values still decrease.${full ? '' : ' The window is not full yet.'}`,
    ru: (i, x, size, full) => `Кладём индекс ${i} (значение ${x}) в конец. В деке ${size}, значения по-прежнему убывают.${full ? '' : ' Окно ещё не заполнено.'}`,
  },
  'swm.ev.max': {
    en: (l, i, max, j) => `Window [${l}..${i}] is full: its maximum is the front, index ${j} → <b>${max}</b>.`,
    ru: (l, i, max, j) => `Окно [${l}..${i}] заполнено: его максимум — начало деки, индекс ${j} → <b>${max}</b>.`,
  },
  'swm.ev.done': {
    en: ans => `Answer: <b>${list(ans)}</b>. Every index entered the deque once and left at most once → O(n).`,
    ru: ans => `Ответ: <b>${list(ans)}</b>. Каждый индекс вошёл в деку один раз и вышел не больше раза → O(n).`,
  },

  /* Two Sum II */
  'tsii.ev.start': {
    en: (target, n) => `The array is sorted. lo starts at the smallest number, hi at the largest; indices are counted from 1. Every step compares the sum with ${target} and moves one pointer.`,
    ru: (target, n) => `Массив отсортирован. lo стоит на самом маленьком числе, hi — на самом большом; индексы считаем с 1. На каждом шаге сравниваем сумму с ${target} и двигаем один указатель.`,
  },
  'tsii.ev.big': {
    en: (a, b, sum, target) => `${a} + ${b} = ${sum} > ${target}: too big. ${b} is too big even with ${a}, the smallest number still in play, so <b>hi−−</b> drops it for good.`,
    ru: (a, b, sum, target) => `${a} + ${b} = ${sum} > ${target}: много. ${b} слишком велико даже с ${a}, самым маленьким из оставшихся, поэтому <b>hi−−</b> отбрасывает его насовсем.`,
  },
  'tsii.ev.small': {
    en: (a, b, sum, target) => `${a} + ${b} = ${sum} < ${target}: too small. ${a} falls short even with ${b}, the largest number still in play, so <b>lo++</b> drops it for good.`,
    ru: (a, b, sum, target) => `${a} + ${b} = ${sum} < ${target}: мало. ${a} не хватает даже с ${b}, самым большим из оставшихся, поэтому <b>lo++</b> отбрасывает его насовсем.`,
  },
  'tsii.ev.hit': {
    en: (a, b, sum, i, j) => `${a} + ${b} = ${sum} — found. Answer: <b>[${i}, ${j}]</b>, counted from 1.`,
    ru: (a, b, sum, i, j) => `${a} + ${b} = ${sum} — нашли. Ответ: <b>[${i}, ${j}]</b>, считая с 1.`,
  },
  'tsii.ev.none': {
    en: target => `The pointers met: every number was dropped with a reason, so no pair adds up to ${target}. (LeetCode promises an answer; here the input is yours.)`,
    ru: target => `Указатели встретились: каждое число отброшено с причиной, значит, пары с суммой ${target} нет. (LeetCode обещает, что ответ есть, но здесь входные данные твои.)`,
  },

  /* Shuffle an Array */
  'shf.ev.start': {
    en: (n, count) => (n === 1 ? 'One element: there is nothing to shuffle.' : `Fisher–Yates: i goes from ${n - 1} down to 1, and j is drawn from [0, i]. The j values come from the field, so the run is repeatable. There are ${product(n)} = ${count} possible j sequences — one per permutation.`),
    ru: (n, count) => (n === 1 ? 'Один элемент — перемешивать нечего.' : `Фишер–Йетс: i идёт от ${n - 1} вниз до 1, а j тянется из [0, i]. Значения j берутся из поля, поэтому прогон повторяем. Возможных последовательностей j — ${product(n)} = ${count}, по одной на каждую перестановку.`),
  },
  'shf.ev.pick': {
    en: (i, j, choices) => `i = ${i}: j is drawn from [0, ${i}] — ${choices} equally likely choices, i itself included. Here j = <b>${j}</b>.`,
    ru: (i, j, choices) => `i = ${i}: j тянем из [0, ${i}] — ${ru(choices, 'вариант', 'варианта', 'вариантов')}, все равновероятны, сам i тоже среди них. Выпало j = <b>${j}</b>.`,
  },
  'shf.ev.swap': {
    en: (i, j, x, y) => `Swap a[${i}] = ${x} and a[${j}] = ${y}. a[${i}] = ${y} is final: from now on nothing touches index ${i} and the tail to its right.`,
    ru: (i, j, x, y) => `Меняем a[${i}] = ${x} и a[${j}] = ${y}. a[${i}] = ${y} теперь окончательный: индекс ${i} и хвост правее больше никто не трогает.`,
  },
  'shf.ev.self': {
    en: (i, v) => `j = i: ${v} stays at index ${i} and is final. Without this choice an element could never keep its place, and every permutation that keeps it would be lost.`,
    ru: (i, v) => `j = i: ${v} остаётся на индексе ${i} и теперь окончательный. Без этого варианта элемент никогда не оставался бы на своём месте, и все перестановки, где он стоит там же, пропали бы.`,
  },
  'shf.ev.done': {
    en: (a, count) => (count === 1 ? `Done: ${list(a)}.` : `i = 0: the last element has no choice left. Result ${list(a)} — one of ${count} permutations, and each of them is reached by exactly one j sequence: the shuffle is uniform.`),
    ru: (a, count) => (count === 1 ? `Готово: ${list(a)}.` : `i = 0: последнему элементу выбирать уже не из чего. Итог ${list(a)} — одна из ${count} перестановок, и к каждой ведёт ровно одна последовательность j, значит, все они равновероятны.`),
  },

  /* Random Pick with Weight */
  'wp.ev.start': {
    en: n => `Build the prefix sums of the ${en(n, 'weight', 'weights')}: prefix[i] = w[0] + … + w[i]. Then index i owns the segment [prefix[i] − w[i], prefix[i]), exactly w[i] whole numbers long.`,
    ru: () => 'Строим префиксные суммы весов: prefix[i] = w[0] + … + w[i]. Тогда индексу i принадлежит отрезок [prefix[i] − w[i], prefix[i]) длиной ровно w[i] целых чисел.',
  },
  'wp.ev.prefix': {
    en: (i, x, from, sum) => `prefix[${i}] = ${from} + ${x} = ${sum}. Index ${i} owns [${from}, ${sum}): ${en(x, 'value', 'values')} of r.`,
    ru: (i, x, from, sum) => `prefix[${i}] = ${from} + ${x} = ${sum}. Индексу ${i} достаётся [${from}, ${sum}): ${ru(x, 'значение', 'значения', 'значений')} r.`,
  },
  'wp.ev.pick': {
    en: (r, total, lo, hi) => `pickIndex(): r is drawn from [0, ${total}), here r = <b>${r}</b>. We need the first prefix greater than r (upper_bound): lo = ${lo}, hi = ${hi}.`,
    ru: (r, total, lo, hi) => `pickIndex(): r тянем из [0, ${total}), здесь r = <b>${r}</b>. Нужен первый префикс больше r (upper_bound): lo = ${lo}, hi = ${hi}.`,
  },
  'wp.ev.left': {
    en: (mid, v, r, lo, hi) => `mid = ${mid}: prefix = ${v} > ${r}. Segment ${mid} ends to the right of r, so it may be the answer — keep it: hi = mid = ${hi}.`,
    ru: (mid, v, r, lo, hi) => `mid = ${mid}: prefix = ${v} > ${r}. Отрезок ${mid} кончается правее r, значит, может оказаться ответом — оставляем его: hi = mid = ${hi}.`,
  },
  'wp.ev.edge': {
    en: (mid, v, r, lo) => `mid = ${mid}: prefix = ${v}, exactly r. Segment ${mid} is open on the right, so ${r} is not in it — it opens the next segment. Go right: lo = mid + 1 = ${lo}.`,
    ru: (mid, v, r, lo) => `mid = ${mid}: prefix = ${v} — ровно r. Отрезок ${mid} открыт справа, ${r} в него не входит, а открывает следующий. Вправо: lo = mid + 1 = ${lo}.`,
  },
  'wp.ev.right': {
    en: (mid, v, r, lo) => `mid = ${mid}: prefix = ${v} < ${r}. Segment ${mid} ends before r, it and everything to its left drop out: lo = mid + 1 = ${lo}.`,
    ru: (mid, v, r, lo) => `mid = ${mid}: prefix = ${v} < ${r}. Отрезок ${mid} кончается раньше r, он и всё левее отпадают: lo = mid + 1 = ${lo}.`,
  },
  'wp.ev.done': {
    en: (i, from, to, w, total, r) => `lo = hi: r = ${r} lies in [${from}, ${to}), the answer is index <b>${i}</b>.${r === from && from > 0 ? ' r sat right on a boundary and went to the segment it opens.' : ''} Index ${i} owns ${w} of the ${total} values of r, so it comes out with probability ${w}/${total}.`,
    ru: (i, from, to, w, total, r) => `lo = hi: r = ${r} лежит в [${from}, ${to}), ответ — индекс <b>${i}</b>.${r === from && from > 0 ? ' r стоял ровно на границе и достался отрезку, который она открывает.' : ''} На индекс ${i} приходится ${w} из ${total} значений r, поэтому он выпадает с вероятностью ${w}/${total}.`,
  },
};
