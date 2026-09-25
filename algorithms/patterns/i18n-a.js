/** Tape 06 chapters 01–04: hash map, two pointers, sliding window, binary search. */
export const CH_A = {
  /* ---------- 01 HashMap / HashSet ---------- */
  'hash.short': { en: 'Find a pair, a repeat or a group faster than O(n²)', ru: 'Найти пару, повтор или группу быстрее O(n²)' },
  'hash.h2': { en: 'Trade memory for time', ru: 'Платим памятью за время' },
  'hash.essence': {
    en: 'Instead of a second loop, ask a dictionary in O(1): “have I seen this already?” One pass, one lookup per element.',
    ru: 'Вместо второго цикла спрашиваем словарь за O(1): «я это уже видел?». Один проход, один запрос на элемент.',
  },
  'hash.signals': {
    en: '<li>You need a pair or an element with a condition, and a nested loop is tempting</li><li>“Is there a repeat”, “how many times”, “first unique”</li><li>Elements must be grouped by a shared feature</li>',
    ru: '<li>Нужно найти пару или элемент с условием, и напрашивается вложенный цикл</li><li>«Есть ли повтор», «сколько раз встречается», «первый уникальный»</li><li>Элементы надо сгруппировать по общему признаку</li>',
  },
  'hash.pitfall': {
    en: '<b>Trap.</b> In Two Sum look up before inserting. Otherwise with target = 2x the number finds itself.',
    ru: '<b>Ловушка.</b> В Two Sum сначала проверяй map, потом вставляй. Иначе при target = 2x число найдёт само себя.',
  },
  'hash.tpl': {
    en: `var seen = new Dictionary<TKey, TValue>();
for (int i = 0; i < n; i++) {
    var key = /* what we look for */;
    if (seen.TryGetValue(key, out var found)) { /* answer */ }
    seen[/* what we remember */] = i;
}`,
    ru: `var seen = new Dictionary<TKey, TValue>();
for (int i = 0; i < n; i++) {
    var key = /* что ищем */;
    if (seen.TryGetValue(key, out var found)) { /* ответ */ }
    seen[/* что запоминаем */] = i;
}`,
  },
  'hash.viz': { en: 'Two Sum · nums = [3, 8, 2, 11, 7, 5], target = 9', ru: 'Two Sum · nums = [3, 8, 2, 11, 7, 5], target = 9' },
  'hash.p': {
    en: [
      { variant: 'Look up the complement', task: 'Given an array and a target, return the indices of two numbers that add up to the target.', idea: 'For each x ask the dictionary: have I seen target − x? If not, store x → index and move on. One pass.', why: 'The dictionary stores not “what was there” but “where it was”: key is the value, value is the index.', cx: 'O(n) time · O(n) memory' },
      { variant: '“Seen it” set', task: 'Does any value appear at least twice?', idea: 'HashSet.Add returns false when the element is already there — that is the answer.', why: 'No payload is needed, only presence, so a HashSet instead of a Dictionary. The counting cousin is Valid Anagram (#242).', cx: 'O(n) time · O(n) memory' },
      { variant: 'Group by a key', task: 'Group anagrams: ["eat","tea","tan","ate","nat","bat"] → [[eat,tea,ate],[tan,nat],[bat]].', idea: 'Invent a key shared by all anagrams: the sorted letters ("aet"). Dictionary: key → list of strings.', why: 'All the difficulty is inventing the key. The dictionary then just sorts strings into buckets.', cx: 'O(n · k log k), k = string length' },
    ],
    ru: [
      { variant: 'Поиск дополнения', task: 'Дан массив и target. Верни индексы двух чисел, сумма которых равна target.', idea: 'Для каждого x спрашиваем словарь: встречалось ли target − x? Если нет — кладём x → индекс и идём дальше. Один проход.', why: 'Словарь хранит не «что было», а «где было»: ключ — число, значение — индекс.', cx: 'O(n) время · O(n) память' },
      { variant: 'Множество «уже видел»', task: 'Есть ли в массиве число, которое встречается хотя бы дважды?', idea: 'HashSet.Add возвращает false, если элемент уже есть. Это и есть ответ.', why: 'Значение не нужно, важен только факт присутствия — поэтому HashSet, а не Dictionary. Близкий вариант с подсчётом частот — Valid Anagram (#242).', cx: 'O(n) время · O(n) память' },
      { variant: 'Группировка по ключу', task: 'Сгруппируй анаграммы: ["eat","tea","tan","ate","nat","bat"] → [[eat,tea,ate],[tan,nat],[bat]].', idea: 'Придумываем ключ, одинаковый у всех анаграмм: отсортированные буквы ("aet"). Словарь: ключ → список строк.', why: 'Вся сложность — придумать ключ. Словарь дальше просто раскладывает строки по корзинам.', cx: 'O(n · k log k), k — длина строки' },
    ],
  },
  'hash.ev.start': {
    en: t => `Looking for a pair that sums to <b>${t}</b>. One pass left to right, remembering everything seen so far.`,
    ru: t => `Ищем пару с суммой <b>${t}</b>. Один проход слева направо, запоминаем всё, что уже видели.`,
  },
  'hash.ev.miss': {
    en: (x, need, i) => `x = ${x}, need ${need}. Not in the map — remember <b>${x} → ${i}</b> and move on.`,
    ru: (x, need, i) => `x = ${x}, ищем ${need}. В map его нет — запоминаем <b>${x} → ${i}</b> и идём дальше.`,
  },
  'hash.ev.hit': {
    en: (x, need, j, i) => `x = ${x}, need ${need}. It is already in the map at index ${j} → answer <b>[${j}, ${i}]</b>.`,
    ru: (x, need, j, i) => `x = ${x}, ищем ${need}. Оно уже в map на индексе ${j} → ответ <b>[${j}, ${i}]</b>.`,
  },
  'hash.ev.none': { en: t => `The array is over: no pair sums to ${t}.`, ru: t => `Массив кончился: пары с суммой ${t} нет.` },

  /* ---------- 02 Two Pointers ---------- */
  'twoptr.short': { en: 'Sorted array, in-place rearranging, a pair from both ends', ru: 'Отсортированный массив, перестановка на месте, пара с двух концов' },
  'twoptr.h2': { en: 'Two indices instead of a nested loop', ru: 'Два индекса вместо вложенного цикла' },
  'twoptr.essence': {
    en: 'Either they walk towards each other from both ends, or both go the same way: one reads, the other writes.',
    ru: 'Либо идут навстречу с двух концов, либо в одну сторону: один читает, другой пишет.',
  },
  'twoptr.signals': {
    en: '<li>The array is sorted, or can be sorted</li><li>Rearrange in place with O(1) memory</li><li>A pair or triple with a given sum, or “the best” between two ends</li>',
    ru: '<li>Массив отсортирован или его можно отсортировать</li><li>Нужно переставить элементы на месте, с памятью O(1)</li><li>Пара или тройка с заданной суммой, или «лучшее» между двумя концами</li>',
  },
  'twoptr.pitfall': {
    en: '<b>Trap.</b> Move the pointer whose move can improve the answer, and be able to say why moving the other one is pointless.',
    ru: '<b>Ловушка.</b> Двигай тот указатель, чей сдвиг может улучшить ответ, и умей объяснить, почему второй двигать бессмысленно.',
  },
  'twoptr.tape': {
    en: '<b>Already on the shelf:</b> opposite pointers on a sorted array and Floyd’s fast &amp; slow are taken apart on <a href="../two-pointers/#opposite">Tape 03 · Two Pointers</a>. The rig below adds the variant that tape does not have: both pointers moving the same way.',
    ru: '<b>Уже на полке:</b> указатели навстречу на отсортированном массиве и fast &amp; slow по Floyd разобраны на <a href="../two-pointers/#opposite">кассете 03 · Two Pointers</a>. Стенд ниже добавляет вариант, которого там нет: оба указателя идут в одну сторону.',
  },
  'twoptr.tpl': {
    en: `int l = 0, r = n - 1;
while (l < r) {
    if (/* found */) { /* answer */ }
    else if (/* need more */) l++;
    else r--;
}`,
    ru: `int l = 0, r = n - 1;
while (l < r) {
    if (/* нашли */) { /* ответ */ }
    else if (/* нужно больше */) l++;
    else r--;
}`,
  },
  'twoptr.viz': { en: 'Move Zeroes · [0, 1, 0, 3, 12, 0, 5] · read and write', ru: 'Move Zeroes · [0, 1, 0, 3, 12, 0, 5] · read и write' },
  'twoptr.p': {
    en: [
      { variant: 'Same way: reader and writer', task: 'Move all zeros to the end, keeping the order of the other elements. In place.', idea: 'read walks every element, write marks where the next non-zero goes. Swap and advance write.', why: 'Both pointers go forward, at different speeds. Twin: Remove Element (#27) — same code with != val.', cx: 'O(n) time · O(1) memory' },
      { variant: 'Towards each other: move the weak side', task: 'Pick two lines that, with the x-axis, hold the most water.', idea: 'Start with the outermost lines. The area is capped by the lower one, so move it: moving the higher one can never help.', why: 'The pointers converge, and every “which one moves” decision provably drops a whole batch of pairs.', cx: 'O(n) time · O(1) memory' },
      { variant: 'Sort + fix one', task: 'Find all unique triples that sum to 0.', idea: 'Sort. Fix nums[i] and look for the rest with pointers moving towards each other. Skip equal values to avoid duplicates.', why: 'Two pointers become the inner loop of an outer one. O(n³) turns into O(n²).', cx: 'O(n²) time · O(1) extra' },
    ],
    ru: [
      { variant: 'В одну сторону: читатель и писатель', task: 'Сдвинь все нули в конец, сохранив порядок остальных. На месте.', idea: 'read идёт по всем элементам, write указывает, куда положить следующий ненулевой. Меняем местами и сдвигаем write.', why: 'Оба указателя идут вперёд, но с разной скоростью. Близнец — Remove Element (#27): тот же код с условием != val.', cx: 'O(n) время · O(1) память' },
      { variant: 'Навстречу: двигаем слабую сторону', task: 'Выбери две линии, которые вместе с осью X держат больше всего воды.', idea: 'Начинаем с крайних линий. Площадь ограничена меньшей высотой, поэтому двигаем её: сдвиг большей гарантированно не поможет.', why: 'Указатели сходятся, и каждое решение «кого двигать» доказуемо отсекает целую пачку пар.', cx: 'O(n) время · O(1) память' },
      { variant: 'Сортировка + фиксируем один', task: 'Найди все уникальные тройки с суммой 0.', idea: 'Сортируем. Фиксируем nums[i], остаток ищем указателями навстречу. Одинаковые значения пропускаем, чтобы не было дублей.', why: 'Два указателя становятся внутренним циклом внешнего. O(n³) превращается в O(n²).', cx: 'O(n²) время · O(1) доп. память' },
    ],
  },
  'twoptr.ev.start': {
    en: () => 'read scans every element, write marks where the next non-zero goes. Everything left of write is already final.',
    ru: () => 'read проходит по всем элементам, write указывает, куда положить следующий ненулевой. Всё левее write уже на месте.',
  },
  'twoptr.ev.zero': { en: read => `a[${read}] = 0 — skip it. Only read moves.`, ru: read => `a[${read}] = 0 — пропускаем. Двигается только read.` },
  'twoptr.ev.stay': {
    en: (v, read) => `a[${read}] = ${v} is already in place (read = write). Both advance.`,
    ru: (v, read) => `a[${read}] = ${v} уже на месте (read = write). Сдвигаем оба.`,
  },
  'twoptr.ev.swap': {
    en: (v, read, to) => `a[${read}] = ${v} ≠ 0 → swap it into position ${to}. write → ${to + 1}.`,
    ru: (v, read, to) => `a[${read}] = ${v} ≠ 0 → меняем местами с позицией ${to}. write → ${to + 1}.`,
  },
  'twoptr.ev.done': {
    en: w => `read reached the end. Non-zeros fill [0..${w - 1}], zeros sit at the tail. One pass, O(1) memory.`,
    ru: w => `read дошёл до конца. Ненулевые занимают [0..${w - 1}], нули — в хвосте. Один проход, O(1) памяти.`,
  },

  /* ---------- 03 Sliding Window ---------- */
  'window.short': { en: 'A contiguous subarray or substring with a condition', ru: 'Непрерывный подмассив или подстрока с условием' },
  'window.h2': { en: 'The window crawls, nothing is rescanned', ru: 'Окно ползёт, ничего не пересчитывается' },
  'window.essence': {
    en: 'The window [l..r] crawls along the array: the right edge grows it, the left edge shrinks it. Each element enters and leaves once — O(n).',
    ru: 'Окно [l..r] ползёт по массиву: правый край расширяет, левый сжимает. Каждый элемент входит и выходит один раз — O(n).',
  },
  'window.signals': {
    en: '<li>The statement says “subarray” or “substring” — a contiguous piece</li><li>Longest, shortest, maximum sum</li><li>The condition can be updated when one element is added or removed</li>',
    ru: '<li>В условии «подмассив» или «подстрока», то есть непрерывный кусок</li><li>Самый длинный, самый короткий, с максимальной суммой</li><li>Условие пересчитывается при добавлении и удалении одного элемента</li>',
  },
  'window.pitfall': {
    en: '<b>Trap.</b> A window only works when shrinking from the left changes the condition predictably. With negative numbers in a sum it is prefix sums instead (#560).',
    ru: '<b>Ловушка.</b> Окно работает, только если сжатие слева предсказуемо меняет условие. С отрицательными числами в сумме это уже префиксные суммы (#560).',
  },
  'window.tpl': {
    en: `int l = 0, best = 0;
for (int r = 0; r < n; r++) {
    /* add a[r] to the window */
    while (/* window is invalid */) {
        /* remove a[l] */
        l++;
    }
    best = Math.Max(best, r - l + 1);
}`,
    ru: `int l = 0, best = 0;
for (int r = 0; r < n; r++) {
    /* добавить a[r] в окно */
    while (/* окно невалидно */) {
        /* убрать a[l] */
        l++;
    }
    best = Math.Max(best, r - l + 1);
}`,
  },
  'window.viz': { en: 'Longest Substring Without Repeating · s = "abcbcad"', ru: 'Longest Substring Without Repeating · s = "abcbcad"' },
  'window.p': {
    en: [
      { variant: 'Fixed-size window', task: 'Find the contiguous subarray of length k with the largest average.', idea: 'Sum the first k. Then at every step add the new element on the right and subtract the one leaving on the left.', why: 'The size is given, so l moves in lockstep with r and no while loop is needed.', cx: 'O(n) time · O(1) memory' },
      { variant: 'Variable window: maximise', task: 'Length of the longest substring without repeating characters.', idea: 'Grow r. If the new character is already inside, shrink from the left until the duplicate is gone. Then the window is valid — update the best.', why: 'Shrink while the window is INVALID; take the answer after the while, once it is valid again.', cx: 'O(n) time · O(alphabet) memory' },
      { variant: 'Variable window: minimise', task: 'Minimal length of a subarray with sum ≥ target. All numbers are positive.', idea: 'Grow r and accumulate. While the sum is ≥ target the window qualifies: record its length and shrink from the left to make it shorter.', why: 'The mirror of #3: shrink while the window is VALID, and take the answer inside the while.', cx: 'O(n) time · O(1) memory' },
    ],
    ru: [
      { variant: 'Окно фиксированного размера', task: 'Найди непрерывный подмассив длины k с максимальным средним.', idea: 'Считаем сумму первых k. Дальше на каждом шаге прибавляем новый элемент справа и вычитаем ушедший слева.', why: 'Размер задан, поэтому l двигается строго вместе с r и while не нужен.', cx: 'O(n) время · O(1) память' },
      { variant: 'Переменное окно: максимум', task: 'Длина самой длинной подстроки без повторяющихся символов.', idea: 'Расширяем r. Если новый символ уже в окне — сжимаем слева, пока дубль не уйдёт. После этого окно валидно, обновляем максимум.', why: 'Сжимаем, пока окно НЕвалидно; ответ берём после while, когда окно снова валидно.', cx: 'O(n) время · O(алфавит) память' },
      { variant: 'Переменное окно: минимум', task: 'Минимальная длина подмассива с суммой ≥ target. Все числа положительные.', idea: 'Расширяем r и копим сумму. Пока сумма ≥ target, окно подходит: записываем длину и сжимаем слева, пытаясь сделать короче.', why: 'Зеркально задаче #3: сжимаем, пока окно ВАЛИДНО, и ответ берём внутри while.', cx: 'O(n) время · O(1) память' },
    ],
  },
  'window.ev.start': {
    en: () => 'R grows the window, L shrinks it. Invariant: no repeats inside.',
    ru: () => 'R расширяет окно, L сжимает. Инвариант: внутри нет повторов.',
  },
  'window.ev.conflict': {
    en: c => `“${c}” is already in the window — we cannot just add it. Shrink from the left.`,
    ru: c => `«${c}» уже есть в окне — просто добавить нельзя. Сжимаем слева.`,
  },
  'window.ev.shrink': {
    en: (out, l, still) => `Removed “${out}”, L → ${l}.${still ? ' The duplicate is still inside.' : ' The duplicate is gone.'}`,
    ru: (out, l, still) => `Убрали «${out}», L → ${l}.${still ? ' Дубль ещё внутри.' : ' Дубля больше нет.'}`,
  },
  'window.ev.add': {
    en: (c, win, len, rec) => `Added “${c}”. Window “${win}”, length ${len}${rec ? ' — <b>new best</b>.' : '.'}`,
    ru: (c, win, len, rec) => `Добавили «${c}». Окно «${win}», длина ${len}${rec ? ' — <b>рекорд</b>.' : '.'}`,
  },
  'window.ev.done': {
    en: best => `Done: <b>${best}</b>. Each character entered and left the window at most once → O(n).`,
    ru: best => `Готово: <b>${best}</b>. Каждый символ вошёл в окно и вышел из него не больше раза → O(n).`,
  },

  /* ---------- 04 Binary Search ---------- */
  'binary.short': { en: 'Sorted, or the answer is monotonic: “the least X such that…”', ru: 'Отсортировано или ответ монотонен: «минимальное X, при котором…»' },
  'binary.h2': { en: 'Every comparison halves the candidates', ru: 'Каждое сравнение выкидывает половину' },
  'binary.essence': {
    en: 'Works not only on a sorted array but anywhere the answer looks like “no, no, no, yes, yes, yes”.',
    ru: 'Работает не только на отсортированном массиве, а везде, где ответ выглядит как «нет, нет, нет, да, да, да».',
  },
  'binary.signals': {
    en: '<li>The array is sorted, even if “rotated”</li><li>O(log n) is required, or values go up to 10⁹</li><li>“The minimal speed / capacity / time such that…” — search on the answer</li>',
    ru: '<li>Массив отсортирован, даже если «повёрнут»</li><li>Нужно O(log n), или значения доходят до 10⁹</li><li>«Минимальная скорость / вместимость / время, при которой…» — поиск по ответу</li>',
  },
  'binary.pitfall': {
    en: '<b>Trap.</b> Pick one invariant (lo &lt;= hi or lo &lt; hi) and keep it everywhere. Compute the middle as lo + (hi − lo) / 2 to avoid overflow.',
    ru: '<b>Ловушка.</b> Выбери один инвариант (lo &lt;= hi или lo &lt; hi) и держись его во всём коде. Середину считай как lo + (hi − lo) / 2, иначе переполнение.',
  },
  'binary.tpl': {
    en: `int lo = 0, hi = n - 1;
while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    if (/* a[mid] fits */) return mid;
    if (/* answer is to the right */) lo = mid + 1;
    else hi = mid - 1;
}`,
    ru: `int lo = 0, hi = n - 1;
while (lo <= hi) {
    int mid = lo + (hi - lo) / 2;
    if (/* a[mid] подходит */) return mid;
    if (/* ответ правее */) lo = mid + 1;
    else hi = mid - 1;
}`,
  },
  'binary.viz': { en: 'Looking for 23 in a sorted array', ru: 'Ищем 23 в отсортированном массиве' },
  'binary.p': {
    en: [
      { variant: 'Search for an index', task: 'Return the index of target in a sorted array, or −1.', idea: 'Look at the middle. Smaller than target — the answer is to the right, otherwise to the left. The range halves every time.', why: 'The reference version. All the difficulty is in the boundaries.', cx: 'O(log n) time · O(1) memory' },
      { variant: 'Which half is sorted?', task: 'A sorted array was rotated at an unknown point: [4,5,6,7,0,1,2]. Find target in O(log n).', idea: 'One of [lo..mid] and [mid..hi] is always sorted. If target lies in its range go there, otherwise go to the other half.', why: 'The array as a whole is not sorted, yet the “left or right” decision is still O(1).', cx: 'O(log n) time · O(1) memory' },
      { variant: 'Search on the answer', task: 'Piles of bananas and h hours. Find the minimal speed k to eat everything in time.', idea: 'Search the range of speeds [1..max], not an array. For mid count the hours: if it fits, try slower, otherwise faster.', why: 'There is no array to search at all — only a monotonic predicate “fits(k)”: false…false, true…true. Find the first true.', cx: 'O(n · log max) time · O(1) memory' },
    ],
    ru: [
      { variant: 'Поиск индекса', task: 'Найди индекс target в отсортированном массиве или верни −1.', idea: 'Смотрим середину. Меньше target — ответ правее, иначе левее. Отрезок каждый раз сужается вдвое.', why: 'Эталонный вариант. Вся сложность — в аккуратных границах.', cx: 'O(log n) время · O(1) память' },
      { variant: 'Какая половина отсортирована?', task: 'Отсортированный массив повернули в неизвестной точке: [4,5,6,7,0,1,2]. Найди target за O(log n).', idea: 'Одна из половин [lo..mid] и [mid..hi] всегда отсортирована. Если target в её диапазоне — идём туда, иначе в другую.', why: 'Целиком массив не отсортирован, но решение «влево или вправо» всё равно принимается за O(1).', cx: 'O(log n) время · O(1) память' },
      { variant: 'Бинпоиск по ответу', task: 'Кучи бананов и h часов. Найди минимальную скорость k, чтобы успеть съесть всё.', idea: 'Ищем не в массиве, а в диапазоне скоростей [1..max]. Для mid считаем часы: успеваем — пробуем медленнее, иначе быстрее.', why: 'Массива для поиска нет вообще. Есть монотонная функция «успеваю(k)»: false…false, true…true. Ищем первую true.', cx: 'O(n · log max) время · O(1) память' },
    ],
  },
  'binary.ev.start': {
    en: (t, lo, hi) => `Looking for ${t}. Candidates: the whole array [${lo}..${hi}].`,
    ru: (t, lo, hi) => `Ищем ${t}. Кандидаты — весь массив [${lo}..${hi}].`,
  },
  'binary.ev.probe': {
    en: (lo, hi, mid, v, t, right) => `mid = ${lo} + (${hi} − ${lo}) / 2 = ${mid}. a[mid] = ${v} ${right ? '<' : '>'} ${t} → the answer is to the ${right ? 'right' : 'left'}; drop the other half.`,
    ru: (lo, hi, mid, v, t, right) => `mid = ${lo} + (${hi} − ${lo}) / 2 = ${mid}. a[mid] = ${v} ${right ? '<' : '>'} ${t} → ответ ${right ? 'правее' : 'левее'}, другую половину выкидываем.`,
  },
  'binary.ev.narrow': {
    en: (right, lo, hi) => `${right ? 'lo = mid + 1' : 'hi = mid − 1'}. Left: [${lo}..${hi}], ${Math.max(0, hi - lo + 1)} candidates.`,
    ru: (right, lo, hi) => `${right ? 'lo = mid + 1' : 'hi = mid − 1'}. Осталось [${lo}..${hi}], кандидатов: ${Math.max(0, hi - lo + 1)}.`,
  },
  'binary.ev.found': {
    en: (mid, step, linear) => `a[${mid}] is the target — found in <b>${step}</b> comparisons. A linear scan would need ${linear}.`,
    ru: (mid, step, linear) => `a[${mid}] — искомое, нашли за <b>${step}</b> сравнения. Линейный поиск сделал бы ${linear}.`,
  },
  'binary.ev.none': { en: t => `lo passed hi: ${t} is not in the array.`, ru: t => `lo обогнал hi: ${t} в массиве нет.` },
};
