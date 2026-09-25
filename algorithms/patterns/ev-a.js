/** Step texts for the chapter 01–04 rigs added next to the original ones in i18n-a.js. */
const list = a => `[${a.join(', ')}]`;

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
    en: (m, n, half) => `Cut A (${m} items, the smaller) at i and B at j = ${half} − i, so the left side holds ${half} numbers. Binary search over i.`,
    ru: (m, n, half) => `Режем A (${m} элементов, меньший) по i, B — по j = ${half} − i, чтобы слева было ${half} чисел. Бинпоиск по i.`,
  },
  'med.ev.cut': {
    en: (i, j, al, ar, bl, br, verdict) => `i = ${i}, j = ${j}: A left ${al} | right ${ar}, B left ${bl} | right ${br}. ${verdict === 'ok' ? 'Both left ends ≤ both right ends — <b>the cut is right</b>.' : verdict === 'left' ? `${al} > ${br}: A gives too much — move i left.` : `${bl} > ${ar}: A gives too little — move i right.`}`,
    ru: (i, j, al, ar, bl, br, verdict) => `i = ${i}, j = ${j}: A слева ${al} | справа ${ar}, B слева ${bl} | справа ${br}. ${verdict === 'ok' ? 'Оба левых края ≤ обоих правых — <b>разрез верный</b>.' : verdict === 'left' ? `${al} > ${br}: A отдаёт слишком много — двигаем i влево.` : `${bl} > ${ar}: A отдаёт слишком мало — двигаем i вправо.`}`,
  },
  'med.ev.done': {
    en: (median, odd) => `Median = <b>${median}</b> (${odd ? 'odd total: the larger left end' : 'even total: the average of the two ends around the cut'}).`,
    ru: (median, odd) => `Медиана = <b>${median}</b> (${odd ? 'всего нечётно: больший из левых краёв' : 'всего чётно: среднее двух краёв у разреза'}).`,
  },
};
