/** Extras for chapters hash, twoptr, matrix, window: tricky inputs, an operation counter, predict-the-step forks, interviewer follow-ups, related problems. */

/* Counting helpers: pure, no imports, fast on rig-sized inputs. */

/** Checks every pair i < j in order until hit(i, j) is true; returns how many pairs were checked. */
function pairScan(a, hit) {
  let c = 0;
  for (let i = 0; i < a.length; i++) {
    for (let j = i + 1; j < a.length; j++) {
      c++;
      if (hit(i, j)) return c;
    }
  }
  return c;
}

const sortKey = s => [...s].sort().join('');
const isAlnum = ch => /[A-Za-z0-9]/.test(ch);

/** Number of all-ones checks if every sub-rectangle of an R × C grid is checked cell by cell. */
function allRectCells(rows, cols) {
  let sr = 0, sc = 0;
  for (let h = 1; h <= rows; h++) sr += (rows - h + 1) * h;
  for (let w = 1; w <= cols; w++) sc += (cols - w + 1) * w;
  return sr * sc;
}

function binomial(n, k) {
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}

export const EX_A = {
  /* ───────────── hash ───────────── */
  twoSum: {
    tricky: [
      { input: { nums: '3, 2, 4', target: '6' },
        ru: 'Если сначала положить x в словарь, а потом искать <code>target − x</code>, тройка найдёт саму себя и вернёт [0, 0]. Верный ответ — [1, 2].',
        en: 'Insert x before looking up <code>target − x</code> and the 3 finds itself, returning [0, 0]. The right answer is [1, 2].' },
      { input: { nums: '-4, 9, 1, -6', target: '-10' },
        ru: 'Отрицательные числа: «оптимизация» вида «пропускай x &gt; target» выбросит всё подряд. Ответ — [0, 3]: −4 + (−6) = −10.',
        en: 'Negative numbers: an “optimization” that skips x &gt; target throws everything away. The answer is [0, 3]: −4 + (−6) = −10.' },
    ],
    ops: {
      unit: { ru: 'проверок', en: 'checks' },
      naive: { ru: 'перебор пар', en: 'all pairs', count: p => pairScan(p.nums, (i, j) => p.nums[i] + p.nums[j] === p.target) },
      ours: { ru: 'словарь', en: 'dictionary', count: p => {
        const seen = new Set();
        let c = 0;
        for (const x of p.nums) {
          c++;
          if (seen.has(p.target - x)) return c;
          seen.add(x);
        }
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Следующий x: нужное ему число уже лежит в словаре?', en: 'Next x: is the number it needs already in the dictionary?' },
        keys: { 'hash.ev.miss': { ru: 'нет — запоминаем x и идём дальше', en: 'no: remember x and move on' },
                'hash.ev.hit': { ru: 'да — пара найдена', en: 'yes: the pair is found' } } },
    ],
    followups: [
      { ru: { q: 'А если нужно посчитать все пары i &lt; j с суммой target?', a: 'Храни частоты: на каждом x делай <code>count += freq[target − x]</code>, потом <code>freq[x]++</code>. Тот же один проход, O(n), и дубликаты учитываются сами.' },
        en: { q: 'What if you must count all pairs i &lt; j with sum target?', a: 'Keep frequencies: for each x do <code>count += freq[target − x]</code>, then <code>freq[x]++</code>. Still one O(n) pass, and duplicates are handled for free.' } },
      { ru: { q: 'Можно без O(n) памяти?', a: 'Отсортировать и пустить встречные указатели: O(n log n) времени. Но сортировка теряет индексы, поэтому сортируют пары (значение, индекс) — и память снова O(n). Без доп. памяти можно, только если нужны значения, а не индексы.' },
        en: { q: 'Can you do it without O(n) memory?', a: 'Sort and run two pointers toward each other: O(n log n) time. Sorting loses the indices, though, so you sort (value, index) pairs and the memory is O(n) again. Truly extra-memory-free works only when values, not indices, are wanted.' } },
      { ru: { q: 'Числа приходят потоком, а запросы «есть ли пара с суммой t» — вперемешку с ними?', a: 'Это Two Sum III: храни <code>Dictionary</code> значение → сколько раз. <code>Add</code> за O(1), <code>Find(t)</code> за O(число различных значений): для каждого x проверь t − x (при t − x = x нужна частота ≥ 2).' },
        en: { q: 'Numbers arrive as a stream, mixed with queries “is there a pair summing to t”?', a: 'That is Two Sum III: keep a <code>Dictionary</code> value → count. <code>Add</code> is O(1), <code>Find(t)</code> is O(distinct values): for each x check t − x (when t − x = x you need a count of at least 2).' } },
    ],
    related: [
      { id: 'twoSumII', ru: 'та же пара, но сортировка заменяет словарь', en: 'the same pair, with sorted order instead of a dictionary' },
      { id: 'psum', ru: 'тот же поиск дополнения, только дополняем префиксную сумму', en: 'the same complement lookup, applied to prefix sums' },
      { id: 'threeSum', ru: 'Two Sum внутри внешнего цикла', en: 'Two Sum inside an outer loop' },
    ],
  },

  dup: {
    tricky: [
      { input: { nums: '1, 2, 1' },
        ru: 'Сравнивать только соседей можно лишь после сортировки: без неё 1 и 1 не рядом, и ответ выйдет false. Верно — true.',
        en: 'Comparing neighbours only works after sorting: without it the two 1s are not adjacent and you get false. The answer is true.' },
      { input: { nums: '9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2' },
        ru: 'Все числа разные: ранний выход не сработает, придётся положить в множество все 12. Ответ — false.',
        en: 'All values are distinct: no early exit, all 12 go into the set. The answer is false.' },
    ],
    ops: {
      unit: { ru: 'проверок', en: 'checks' },
      naive: { ru: 'перебор пар', en: 'all pairs', count: p => pairScan(p.nums, (i, j) => p.nums[i] === p.nums[j]) },
      ours: { ru: 'HashSet.Add', en: 'HashSet.Add', count: p => {
        const seen = new Set();
        let c = 0;
        for (const x of p.nums) {
          c++;
          if (seen.has(x)) return c;
          seen.add(x);
        }
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Следующее число уже есть в множестве?', en: 'Is the next number already in the set?' },
        keys: { 'dup.ev.add': { ru: 'нет — Add вернёт true', en: 'no: Add returns true' },
                'dup.ev.hit': { ru: 'да — Add вернёт false, это повтор', en: 'yes: Add returns false, a repeat' } } },
    ],
    followups: [
      { ru: { q: 'Доп. память запрещена, а массив можно портить?', a: 'Отсортируй на месте и сравни соседей: O(n log n) времени, O(1) доп. памяти (если сортировка не рекурсивная). Если значения лежат в 1..n, хватит пометок знаком прямо в массиве — O(n).' },
        en: { q: 'No extra memory, but you may modify the array?', a: 'Sort in place and compare neighbours: O(n log n) time, O(1) extra memory (with a non-recursive sort). If the values lie in 1..n, sign marks inside the array itself give O(n).' } },
      { ru: { q: 'Данные лежат на нескольких машинах?', a: 'Раскидай числа по шардам по <code>hash(x) % m</code>: равные значения попадут на одну машину, и каждая проверяет свой кусок своим HashSet. Ответ — OR по машинам.' },
        en: { q: 'The data is spread across several machines?', a: 'Shard by <code>hash(x) % m</code>: equal values land on the same machine, and each checks its part with its own HashSet. The answer is the OR over machines.' } },
    ],
    related: [
      { id: 'dupWindow', ru: 'то же множество, но помнит только последние k', en: 'the same set, remembering only the last k' },
      { id: 'firstMissing', ru: 'когда памяти нет, множеством служат сами индексы', en: 'with no spare memory the indices themselves act as the set' },
    ],
  },

  anagram: {
    tricky: [
      { input: { strs: 'ad, bc, da' },
        ru: 'Ключ «сумма кодов букв» склеит ad и bc: 97 + 100 = 98 + 99. Верно — две группы: [ad, da] и [bc].',
        en: 'A “sum of letter codes” key merges ad and bc: 97 + 100 = 98 + 99. The right answer is two groups: [ad, da] and [bc].' },
      { input: { strs: 'aab, abb, ab, ba' },
        ru: 'Ключ «множество букв» теряет количества и сложит все слова в одну корзину {a, b}. Верно — три группы: [aab], [abb], [ab, ba].',
        en: 'A “set of letters” key loses the counts and drops every word into one bucket {a, b}. The answer is three groups: [aab], [abb], [ab, ba].' },
      { input: { strs: 'a, a, a' },
        ru: 'Повторы одного слова: в группе должны остаться все три, а не одно — HashSet вместо List их бы схлопнул. Ответ — одна группа [a, a, a].',
        en: 'The same word repeated: all three must stay in the group, not one; a HashSet instead of a List would collapse them. The answer is one group [a, a, a].' },
    ],
    ops: {
      unit: { ru: 'проверок', en: 'checks' },
      naive: { ru: 'попарное сравнение слов', en: 'pairwise word checks', count: p => {
        const keys = p.strs.map(sortKey), used = keys.map(() => false);
        let c = 0;
        for (let i = 0; i < keys.length; i++) {
          if (used[i]) continue;
          for (let j = i + 1; j < keys.length; j++) {
            if (used[j]) continue;
            c++;
            if (keys[i] === keys[j]) used[j] = true;
          }
        }
        return c;
      } },
      ours: { ru: 'поиск ключа в словаре', en: 'dictionary key lookups', count: p => p.strs.length },
    },
    predict: [],
    followups: [
      { ru: { q: 'Слова длинные, а алфавит — 26 букв. Как сделать ключ быстрее сортировки?', a: 'Посчитай буквы в <code>int[26]</code> и склей счётчики в строку вроде «1#0#2#…». Ключ строится за O(k) вместо O(k log k).' },
        en: { q: 'Words are long and the alphabet has 26 letters. How do you build the key faster than sorting?', a: 'Count letters into an <code>int[26]</code> and join the counts into a string like “1#0#2#…”. The key costs O(k) instead of O(k log k).' } },
      { ru: { q: 'Нужно найти все анаграммы шаблона p внутри длинной строки s?', a: 'Это Find All Anagrams (#438): окно длины |p| скользит по s, а счётчики букв обновляются за O(1) на шаг. Сортировать каждое окно не нужно.' },
        en: { q: 'You must find every anagram of a pattern p inside a long string s?', a: 'That is Find All Anagrams (#438): a window of length |p| slides over s and the letter counts update in O(1) per step. No need to sort each window.' } },
    ],
    related: [
      { id: 'minWindow', ru: 'те же счётчики букв, только в скользящем окне', en: 'the same letter counts, inside a sliding window' },
      { id: 'dup', ru: 'хеш-таблица как корзины по признаку', en: 'a hash table as buckets keyed by a feature' },
    ],
  },

  longestConsec: {
    tricky: [
      { input: { nums: '' },
        ru: 'Пустой массив: если завести <code>best = 1</code> «на всякий случай», вернётся 1. Ответ — 0.',
        en: 'An empty array: start with <code>best = 1</code> “just in case” and you return 1. The answer is 0.' },
      { input: { nums: '1, 2, 2, 3' },
        ru: 'Решение сортировкой, которое сбрасывает серию на равных соседях, насчитает 2. Дубликаты надо пропускать: серия 1, 2, 3 — ответ 3.',
        en: 'A sorting solution that resets the run on equal neighbours counts 2. Duplicates must be skipped: the run is 1, 2, 3, so the answer is 3.' },
    ],
    ops: {
      unit: { ru: 'проверок «x есть?»', en: 'membership checks' },
      naive: { ru: 'считать от каждого числа', en: 'count up from every number', count: p => {
        const set = new Set(p.nums);
        let c = 0;
        for (const x of p.nums) {
          let len = 0;
          do { c++; len++; } while (set.has(x + len));
        }
        return c;
      } },
      ours: { ru: 'только от начала серии', en: 'only from run starts', count: p => {
        const set = new Set(p.nums);
        let c = 0;
        for (const x of set) {
          c++;
          if (set.has(x - 1)) continue;
          let len = 0;
          do { c++; len++; } while (set.has(x + len));
        }
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Следующее число множества: с него начинается серия?', en: 'Next number of the set: does a run start here?' },
        keys: { 'lcq.ev.run': { ru: 'да — x − 1 нет, считаем серию', en: 'yes: x − 1 is absent, count the run' },
                'lcq.ev.skip': { ru: 'нет — x − 1 есть, пропускаем', en: 'no: x − 1 is present, skip' } } },
    ],
    followups: [
      { ru: { q: 'Числа приходят по одному, а ответ нужен после каждого?', a: 'Храни длину серии в её концах: для нового x возьми left = len[x − 1], right = len[x + 1], новая длина left + right + 1, запиши её в x − left и x + right. O(1) на вставку. Другой путь — union-find по соседним числам.' },
        en: { q: 'Numbers arrive one by one and you need the answer after each?', a: 'Store each run’s length at its ends: for a new x take left = len[x − 1], right = len[x + 1]; the new length is left + right + 1, written at x − left and x + right. O(1) per insert. Union-find over adjacent numbers works too.' } },
      { ru: { q: 'Памяти под множество нет?', a: 'Сортировка на месте и один проход: равные соседи пропускаются, разница 1 продлевает серию, остальное её обрывает. O(n log n) времени, O(1) доп. памяти.' },
        en: { q: 'No memory for a set?', a: 'Sort in place and make one pass: equal neighbours are skipped, a difference of 1 extends the run, anything else breaks it. O(n log n) time, O(1) extra memory.' } },
    ],
    related: [
      { id: 'unionFind', ru: 'серии можно склеивать объединением множеств', en: 'runs can be glued together with union-find' },
      { id: 'dup', ru: 'HashSet как быстрый ответ «было ли такое число»', en: 'a HashSet as a fast “have I seen this number” check' },
    ],
  },

  psum: {
    tricky: [
      { input: { nums: '1, -1, 1, -1', k: '0' },
        ru: 'С отрицательными числами скользящее окно не работает: сжатие не обязано уменьшать сумму. Подмассивов с суммой 0 здесь 4.',
        en: 'With negative numbers a sliding window fails: shrinking need not lower the sum. There are 4 subarrays with sum 0 here.' },
      { input: { nums: '2, 1, 3', k: '3' },
        ru: 'Забудешь положить в словарь префикс 0 — потеряешь подмассивы от самого начала, как [2, 1], и получишь 1. Ответ — 2.',
        en: 'Forget to seed the dictionary with prefix 0 and you lose subarrays starting at index 0, like [2, 1], getting 1. The answer is 2.' },
      { input: { nums: '0, 0, 0', k: '0' },
        ru: 'Нули при k = 0: каждый префикс повторяется, и считать надо, сколько раз он встречался, а не был ли. Ответ — 6.',
        en: 'Zeros with k = 0: every prefix repeats, so you must count how many times it occurred, not whether it did. The answer is 6.' },
    ],
    ops: {
      unit: { ru: 'проверок', en: 'checks' },
      naive: { ru: 'все подмассивы', en: 'all subarrays', count: p => (p.nums.length * (p.nums.length + 1)) / 2 },
      ours: { ru: 'префиксы в словаре', en: 'prefix sums in a dictionary', count: p => p.nums.length },
    },
    predict: [],
    followups: [
      { ru: { q: 'А если нужна самая длинная такая подстрока, а не их число?', a: 'В словаре храни не счётчик, а первый индекс каждого префикса и не перезаписывай его. Длина — i − first[sum − k]. Это #325.' },
        en: { q: 'What if you need the longest such subarray instead of the count?', a: 'Store the first index of each prefix instead of a count and never overwrite it. The length is i − first[sum − k]. That is #325.' } },
      { ru: { q: 'Нужны подмассивы с суммой, делящейся на k?', a: 'Ключ — остаток префикса: <code>((sum % k) + k) % k</code>. В C# % от отрицательного числа отрицателен, поэтому поправка + k обязательна. Это #974.' },
        en: { q: 'You need subarrays whose sum is divisible by k?', a: 'Key on the prefix remainder: <code>((sum % k) + k) % k</code>. In C# % of a negative number is negative, so the + k fix is required. That is #974.' } },
      { ru: { q: 'Та же задача для подматриц?', a: 'Зафиксируй пару строк (top, bottom), сложи столбцы между ними в одномерный массив и реши на нём эту задачу. O(R² · C) времени.' },
        en: { q: 'The same task for submatrices?', a: 'Fix a pair of rows (top, bottom), collapse the columns between them into a 1D array and solve this problem on it. O(R² · C) time.' } },
    ],
    related: [
      { id: 'twoSum', ru: 'тот же поиск «чего не хватает» в словаре', en: 'the same “what is missing” dictionary lookup' },
      { id: 'minLen', ru: 'когда все числа положительные, хватает окна', en: 'when all numbers are positive, a window is enough' },
      { id: 'kadane', ru: 'тоже текущая сумма, кончающаяся здесь', en: 'also a running sum ending at the current index' },
    ],
  },

  firstMissing: {
    tricky: [
      { input: { nums: '1, 2, 3' },
        ru: 'Все ячейки 1..n заняты: ответ не внутри массива, а n + 1 = 4. Код, который ищет только «первую ячейку без своего числа», здесь ничего не найдёт.',
        en: 'Every slot 1..n is filled: the answer is outside the array, n + 1 = 4. Code that only looks for “the first slot missing its value” finds nothing here.' },
      { input: { nums: '7, 8, 9' },
        ru: 'Ответ «максимум + 1» здесь даст 10. Но 1 нет вовсе, значит ответ 1.',
        en: '“Maximum + 1” gives 10 here. But 1 is missing altogether, so the answer is 1.' },
      { input: { nums: '-3, 0, -1' },
        ru: 'Ни одного положительного: 0 — не положительное число, его не ставят в ячейку. Ответ — 1.',
        en: 'No positive numbers: 0 is not positive and gets no slot. The answer is 1.' },
    ],
    ops: {
      unit: { ru: 'сравнений', en: 'comparisons' },
      naive: { ru: 'искать 1, 2, 3… линейно', en: 'scan for 1, 2, 3… linearly', count: p => {
        const a = p.nums;
        let c = 0;
        for (let x = 1; ; x++) {
          let found = false;
          for (const v of a) { c++; if (v === x) { found = true; break; } }
          if (!found) return c;
        }
      } },
      ours: { ru: 'расстановка по ячейкам', en: 'cyclic placement', count: p => {
        const a = [...p.nums], n = a.length;
        let c = 0;
        for (let i = 0; i < n; i++) {
          for (;;) {
            c++;
            const v = a[i];
            if (v >= 1 && v <= n && a[v - 1] !== v) { a[i] = a[v - 1]; a[v - 1] = v; } else break;
          }
        }
        for (let i = 0; i < n; i++) { c++; if (a[i] !== i + 1) break; }
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Текущая ячейка: меняем ещё раз или оставляем и идём дальше?', en: 'Current slot: swap again or leave it and move on?' },
        keys: { 'fmp.ev.swap': { ru: 'меняем — значение ещё не в своей ячейке', en: 'swap: the value is not in its slot yet' },
                'fmp.ev.stay': { ru: 'оставляем', en: 'leave it' } } },
    ],
    followups: [
      { ru: { q: 'Обмены нельзя, но массив менять можно?', a: 'Пометки знаком: сначала замени все значения вне 1..n на n + 1, потом для каждого v = |a[i]| ≤ n сделай a[v − 1] отрицательным. Первый положительный индекс i даёт ответ i + 1, иначе n + 1.' },
        en: { q: 'No swaps, but the array may be modified?', a: 'Sign marks: first replace every value outside 1..n with n + 1, then for each v = |a[i]| ≤ n make a[v − 1] negative. The first positive index i gives i + 1, otherwise n + 1.' } },
      { ru: { q: 'Вход только для чтения?', a: 'Тогда без O(n) памяти не обойтись: заведи <code>BitArray</code> на n + 1 бит и отметь в нём значения из 1..n. Время O(n), память — n бит.' },
        en: { q: 'The input is read-only?', a: 'Then O(n) memory is unavoidable: allocate a <code>BitArray</code> of n + 1 bits and mark the values in 1..n. O(n) time, n bits of memory.' } },
    ],
    related: [
      { id: 'missingXor', ru: 'тоже ищем пропуск в 1..n, но пропуск один и хватает XOR', en: 'also finds a gap in 1..n, but there is one gap and XOR suffices' },
      { id: 'sortColors', ru: 'перестановка на месте, где значение знает свою зону', en: 'in-place rearranging where a value knows its zone' },
    ],
  },

  dupWindow: {
    tricky: [
      { input: { nums: '1, 1', k: '0' },
        ru: 'k = 0: подходящих пар индексов нет вовсе, хотя единицы стоят рядом. Ответ — false.',
        en: 'k = 0: no pair of indices qualifies, even though the 1s are neighbours. The answer is false.' },
      { input: { nums: '1, 0, 1, 1', k: '1' },
        ru: 'Словарь, который хранит первый индекс числа и не обновляет его, сравнит 3 − 0 &gt; 1 и ответит false. Пара (2, 3) рядом: ответ true.',
        en: 'A dictionary that keeps the first index and never updates it compares 3 − 0 &gt; 1 and answers false. The pair (2, 3) is adjacent: the answer is true.' },
      { input: { nums: '1, 2, 1', k: '2' },
        ru: 'Расстояние ровно k: граница включается. С условием «&lt; k» или с вытеснением при размере k ответ ошибочно false. Верно — true.',
        en: 'Distance exactly k: the bound is inclusive. With “&lt; k” or evicting at size k you wrongly get false. The answer is true.' },
    ],
    ops: {
      unit: { ru: 'операций', en: 'operations' },
      naive: { ru: 'сравнить с k соседями справа', en: 'compare with the next k numbers', count: p => {
        const a = p.nums;
        let c = 0;
        for (let i = 0; i < a.length; i++) {
          for (let j = i + 1; j <= Math.min(a.length - 1, i + p.k); j++) {
            c++;
            if (a[i] === a[j]) return c;
          }
        }
        return c;
      } },
      ours: { ru: 'HashSet-окно (Add и Remove)', en: 'HashSet window (Add and Remove)', count: p => {
        const set = new Set();
        let c = 0;
        for (let i = 0; i < p.nums.length; i++) {
          c++;
          if (set.has(p.nums[i])) return c;
          set.add(p.nums[i]);
          if (set.size > p.k) { set.delete(p.nums[i - p.k]); c++; }
        }
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Следующее число уже есть в окне?', en: 'Is the next number already in the window?' },
        keys: { 'dw.ev.add': { ru: 'нет — Add вернёт true', en: 'no: Add returns true' },
                'dw.ev.hit': { ru: 'да — повтор не дальше k', en: 'yes: a repeat within k' } } },
    ],
    followups: [
      { ru: { q: 'Нужно минимальное расстояние между равными числами?', a: 'Словарь «значение → последний индекс»: на каждом i обнови ответ <code>min(i − last[x])</code> и перезапиши last[x] = i. O(n) времени, O(число различных) памяти.' },
        en: { q: 'You need the minimum distance between equal numbers?', a: 'A dictionary value → last index: at each i update the answer with <code>min(i − last[x])</code> and overwrite last[x] = i. O(n) time, O(distinct values) memory.' } },
      { ru: { q: 'Вместо индексов — время: отбросить повтор события, если такое же было меньше T секунд назад?', a: 'Словарь «ключ события → время последнего» и проверка now − last ≤ T. Чтобы словарь не рос вечно, старые ключи чистят очередью по времени. Так гасят дребезг ввода и повторы сетевых пакетов.' },
        en: { q: 'Time instead of indices: drop an event if the same one came less than T seconds ago?', a: 'A dictionary event key → last time, and check now − last ≤ T. So that it does not grow forever, evict old keys with a queue ordered by time. This is how input bounce and duplicate network packets get filtered.' } },
    ],
    related: [
      { id: 'longest', ru: 'тоже окно-множество без повторов', en: 'also a window kept as a set without repeats' },
      { id: 'dup', ru: 'то же, когда окно бесконечное', en: 'the same with an infinite window' },
    ],
  },

  /* ───────────── twoptr ───────────── */
  moveZeroes: {
    tricky: [
      { input: { nums: '0, 2, 0, 1' },
        ru: 'Менять ноль с последним ненулевым с конца быстро, но ломает порядок: выйдет [1, 2, 0, 0]. Верно — [2, 1, 0, 0].',
        en: 'Swapping a zero with the last non-zero from the end is quick but breaks the order: you get [1, 2, 0, 0]. The answer is [2, 1, 0, 0].' },
      { input: { nums: '0, 0, 0, 7' },
        ru: '<code>RemoveAt(i)</code> + <code>Add(0)</code> в цикле с i++ перепрыгивает через ноль, который сдвинулся на место удалённого: останется [0, 7, 0, 0]. Верно — [7, 0, 0, 0].',
        en: '<code>RemoveAt(i)</code> + <code>Add(0)</code> in a loop with i++ skips the zero that slid into the removed slot, leaving [0, 7, 0, 0]. The answer is [7, 0, 0, 0].' },
      { input: { nums: '1, 2, 3' },
        ru: 'Нулей нет: read и write идут вместе, и ни одного обмена не нужно. Массив не меняется.',
        en: 'No zeros: read and write move together and no swap is needed. The array stays as it is.' },
    ],
    ops: {
      unit: { ru: 'перемещений', en: 'element moves' },
      naive: { ru: 'RemoveAt + Add(0)', en: 'RemoveAt + Add(0)', count: p => {
        const a = [...p.nums], n = a.length;
        let i = 0, c = 0;
        for (let seen = 0; seen < n; seen++) {
          if (a[i] === 0) { c += n - 1 - i + 1; a.splice(i, 1); a.push(0); } else i++;
        }
        return c;
      } },
      ours: { ru: 'читатель и писатель', en: 'reader and writer', count: p => {
        let write = 0, c = 0;
        for (let read = 0; read < p.nums.length; read++) {
          if (p.nums[read] === 0) continue;
          if (read !== write) c += 2;
          write++;
        }
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Что read сделает со следующим числом?', en: 'What will read do with the next number?' },
        keys: { 'twoptr.ev.zero': { ru: 'это ноль — пропустить', en: 'it is zero: skip it' },
                'twoptr.ev.swap': { ru: 'не ноль — обменять с позицией write', en: 'non-zero: swap with the write slot' },
                'twoptr.ev.stay': { ru: 'не ноль и уже на месте', en: 'non-zero and already in place' } } },
    ],
    followups: [
      { ru: { q: 'Порядок ненулевых не важен. Можно меньше записей?', a: 'Встречные указатели: левый ищет ноль, правый — ненулевое, меняем. Обменов не больше, чем нулей в левой части, а не по одному на каждое ненулевое число после первого нуля.' },
        en: { q: 'The order of non-zeros does not matter. Can you write less?', a: 'Pointers from both ends: the left one finds a zero, the right one a non-zero, swap. There are at most as many swaps as zeros on the left, instead of one per non-zero after the first zero.' } },
      { ru: { q: 'А если нули нужно собрать в начале, сохранив порядок остальных?', a: 'То же самое зеркально: read и write идут с конца к началу, write указывает, куда положить следующее ненулевое справа.' },
        en: { q: 'What if zeros must go to the front, keeping the others in order?', a: 'The mirror image: read and write go from the end to the start, and write marks where the next non-zero goes from the right.' } },
    ],
    related: [
      { id: 'sortColors', ru: 'то же разбиение на месте, только зон три', en: 'the same in-place partition, with three zones' },
      { id: 'firstMissing', ru: 'перестановка на месте без доп. памяти', en: 'in-place rearranging with no extra memory' },
    ],
  },

  shuffle: {
    tricky: [
      { input: { nums: '1, 2, 3', j: '2, 1' },
        ru: 'Каждый раз j = i: все элементы остаются на местах, и выходит [1, 2, 3]. Это не ошибка — тождественная перестановка обязана выпадать с вероятностью 1/n!.',
        en: 'Every time j = i: every element stays put and you get [1, 2, 3]. Not a bug: the identity permutation must come up with probability 1/n!.' },
      { input: { nums: '42', j: '' },
        ru: 'Один элемент: цикл от i = n − 1 = 0 до 1 не делает ни шага, случайных чисел не тянем. Ответ — [42].',
        en: 'One element: the loop from i = n − 1 = 0 down to 1 runs zero times and draws no random numbers. The answer is [42].' },
    ],
    ops: {
      unit: { ru: 'перемещений', en: 'element moves' },
      naive: { ru: 'тянуть из списка и RemoveAt', en: 'draw from a list and RemoveAt', count: p => {
        const list = [...p.nums];
        let c = 0;
        for (const j of p.j) { c += 1 + (list.length - 1 - j); list.splice(j, 1); }
        return c + list.length;
      } },
      ours: { ru: 'Фишер–Йетс', en: 'Fisher–Yates', count: p => {
        let c = 0, i = p.nums.length - 1;
        for (const j of p.j) { if (j !== i) c += 2; i--; }
        return c;
      } },
    },
    predict: [
      { q: { ru: 'j выпало. Что дальше?', en: 'j is drawn. What happens next?' },
        keys: { 'shf.ev.swap': { ru: 'обмен a[i] и a[j]', en: 'swap a[i] and a[j]' },
                'shf.ev.self': { ru: 'j = i — элемент остаётся', en: 'j = i: the element stays' } } },
    ],
    followups: [
      { ru: { q: 'Нужны k случайных элементов из потока неизвестной длины?', a: 'Reservoir sampling: первые k кладём в резервуар, а i-й элемент (с 0) тянет j из [0, i] и при j &lt; k заменяет res[j]. Каждый элемент в итоге попадает с вероятностью k / n.' },
        en: { q: 'You need k random items from a stream of unknown length?', a: 'Reservoir sampling: the first k go into the reservoir, then the i-th item (0-based) draws j from [0, i] and replaces res[j] if j &lt; k. Every item ends up chosen with probability k / n.' } },
      { ru: { q: 'Из колоды в 52 карты нужны только первые 5 случайных?', a: 'Сделай всего 5 шагов Фишера–Йетса: хвост из 5 позиций уже равномерно случайная выборка с порядком. O(k) вместо O(n).' },
        en: { q: 'From a 52-card deck you only need the first 5 random cards?', a: 'Run just 5 steps of Fisher–Yates: the last 5 positions are already a uniform random ordered sample. O(k) instead of O(n).' } },
      { ru: { q: 'В Unity нужен воспроизводимый шафл для реплея?', a: 'Заведи свой <code>System.Random(seed)</code> и передавай его явно. <code>UnityEngine.Random</code> — общее статическое состояние, его сдвигает любой другой код, и последовательность поплывёт.' },
        en: { q: 'In Unity you need a reproducible shuffle for a replay?', a: 'Create your own <code>System.Random(seed)</code> and pass it explicitly. <code>UnityEngine.Random</code> is shared static state that any other code advances, so the sequence drifts.' } },
    ],
    related: [
      { id: 'weightedPick', ru: 'тоже честная случайность через индексы', en: 'also fair randomness through indices' },
      { id: 'moveZeroes', ru: 'индекс делит массив на готовую часть и остальное', en: 'an index splits the array into a finished part and the rest' },
    ],
  },

  twoSumII: {
    tricky: [
      { input: { numbers: '2, 2, 3', target: '4' },
        ru: 'Бинпоиск дополнения по всему массиву может вернуть тот же индекс: 2 найдёт само себя. Ответ — [1, 2], два разных элемента.',
        en: 'Binary searching the complement over the whole array can return the same index: 2 finds itself. The answer is [1, 2], two different elements.' },
      { input: { numbers: '1, 2, 3', target: '6' },
        ru: 'С условием <code>lo &lt;= hi</code> тройка сложится сама с собой и вернётся [3, 3]. Пары нет — указатели должны встретиться и остановиться.',
        en: 'With <code>lo &lt;= hi</code> the 3 is added to itself and you return [3, 3]. There is no pair: the pointers must meet and stop.' },
    ],
    ops: {
      unit: { ru: 'проверок суммы', en: 'sum checks' },
      naive: { ru: 'перебор пар', en: 'all pairs', count: p => pairScan(p.numbers, (i, j) => p.numbers[i] + p.numbers[j] === p.target) },
      ours: { ru: 'встречные указатели', en: 'two pointers', count: p => {
        const a = p.numbers;
        let lo = 0, hi = a.length - 1, c = 0;
        while (lo < hi) {
          c++;
          const s = a[lo] + a[hi];
          if (s === p.target) break;
          if (s > p.target) hi--; else lo++;
        }
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Сумма под указателями — больше, меньше или равна target?', en: 'Is the sum under the pointers greater than, less than or equal to the target?' },
        keys: { 'tsii.ev.big': { ru: 'больше — hi−−', en: 'greater: hi−−' },
                'tsii.ev.small': { ru: 'меньше — lo++', en: 'less: lo++' },
                'tsii.ev.hit': { ru: 'равна — нашли', en: 'equal: found' } } },
    ],
    followups: [
      { ru: { q: 'Посчитать пары с суммой меньше target?', a: 'Если a[lo] + a[hi] &lt; target, то lo подходит со всеми hi′ из (lo, hi]: <code>count += hi − lo; lo++</code>. Иначе hi−−. Один проход, O(n).' },
        en: { q: 'Count the pairs with sum below the target?', a: 'If a[lo] + a[hi] &lt; target, lo pairs with every hi′ in (lo, hi]: <code>count += hi − lo; lo++</code>. Otherwise hi−−. One pass, O(n).' } },
      { ru: { q: 'Точной пары нет — нужна ближайшая сумма?', a: 'Тот же цикл, но на каждом шаге обновляй лучший <code>|sum − target|</code>. Отсечение работает так же: большую сумму уменьшает только hi−−.' },
        en: { q: 'No exact pair — you need the closest sum?', a: 'Same loop, updating the best <code>|sum − target|</code> at each step. The pruning still holds: only hi−− can lower a sum that is too big.' } },
    ],
    related: [
      { id: 'twoSum', ru: 'та же задача без сортировки — нужен словарь', en: 'the same task unsorted needs a dictionary' },
      { id: 'threeSum', ru: 'этот цикл — внутренний в 3Sum', en: 'this loop is the inner loop of 3Sum' },
      { id: 'container', ru: 'встречные указатели, каждый шаг отсекает пачку пар', en: 'pointers from both ends, each step prunes a batch of pairs' },
    ],
  },

  container: {
    tricky: [
      { input: { h: '1, 9, 9, 1, 1, 1, 1, 1, 1, 1, 1, 1' },
        ru: 'Две самые высокие линии стоят рядом и дают 9 × 1 = 9. А крайние единицы — 1 × 11 = 11: ширина важнее высоты. Ответ — 11.',
        en: 'The two tallest lines are neighbours and give 9 × 1 = 9. The outer 1s give 1 × 11 = 11: width beats height. The answer is 11.' },
      { input: { h: '4, 4, 4, 4, 4' },
        ru: 'Все высоты равны: лучший ответ — самые крайние, 4 × 4 = 16, и он находится на первом же шаге.',
        en: 'All heights are equal: the best is the outermost pair, 4 × 4 = 16, found on the very first step.' },
    ],
    ops: {
      unit: { ru: 'площадей', en: 'areas' },
      naive: { ru: 'все пары линий', en: 'all pairs of lines', count: p => (p.h.length * (p.h.length - 1)) / 2 },
      ours: { ru: 'встречные указатели', en: 'two pointers', count: p => p.h.length - 1 },
    },
    predict: [],
    followups: [
      { ru: { q: 'Линии стоят не через 1, а в точках x[i] (по возрастанию)?', a: 'Ширина — x[r] − x[l], и она по-прежнему только убывает, пока указатели сходятся. Значит, довод «двигай низкую» не меняется, алгоритм тот же.' },
        en: { q: 'Lines are not 1 apart but at positions x[i] (increasing)?', a: 'Width becomes x[r] − x[l], and it still only shrinks as the pointers close in. So the “move the shorter one” argument holds and the algorithm is the same.' } },
      { ru: { q: 'Можно ли пропускать линии быстрее?', a: 'Да: после сдвига низкой стороны пропускай подряд все линии не выше неё — ширина уменьшилась, а высота не выросла, площадь не побьётся. Асимптотика та же, но площадей считается меньше.' },
        en: { q: 'Can you skip lines faster?', a: 'Yes: after moving the shorter side, skip every line no taller than it — width shrank and height did not grow, so the area cannot win. Same asymptotics, fewer areas computed.' } },
    ],
    related: [
      { id: 'trap', ru: 'тот же довод: двигай более низкую сторону', en: 'the same argument: move the shorter side' },
      { id: 'histogram', ru: 'площадь = минимальная высота × ширина', en: 'area = minimum height × width' },
    ],
  },

  threeSum: {
    tricky: [
      { input: { nums: '0, 0, 0, 0' },
        ru: 'Без пропуска повторов [0, 0, 0] выйдет несколько раз. Уникальная тройка одна.',
        en: 'Without skipping repeats [0, 0, 0] comes out several times. There is exactly one unique triple.' },
      { input: { nums: '-2, 0, 1, 1, 2' },
        ru: 'Если пропускать равные значения до проверки суммы, а не после находки, потеряется [−2, 1, 1]. Ответ — две тройки: [−2, 0, 2] и [−2, 1, 1].',
        en: 'Skip equal values before checking the sum instead of after a hit and you lose [−2, 1, 1]. The answer is two triples: [−2, 0, 2] and [−2, 1, 1].' },
      { input: { nums: '1, 2, 3' },
        ru: 'Все числа положительные: сумма трёх нулю не равна. Ответ — ни одной тройки, а как только зафиксированное a[i] &gt; 0, дальше можно не искать.',
        en: 'All numbers are positive: no three sum to zero. The answer is no triples, and once the fixed a[i] &gt; 0 you can stop.' },
    ],
    ops: {
      unit: { ru: 'сумм', en: 'sums' },
      naive: { ru: 'все тройки', en: 'all triples', count: p => { const n = p.nums.length; return (n * (n - 1) * (n - 2)) / 6; } },
      ours: { ru: 'сортировка + указатели', en: 'sort + two pointers', count: p => {
        const a = [...p.nums].sort((x, y) => x - y);
        let c = 0;
        for (let i = 0; i < a.length - 2; i++) {
          if (i > 0 && a[i] === a[i - 1]) continue;
          let l = i + 1, r = a.length - 1;
          while (l < r) {
            c++;
            const s = a[i] + a[l] + a[r];
            if (s === 0) {
              while (l < r && a[l] === a[l + 1]) l++;
              while (l < r && a[r] === a[r - 1]) r--;
              l++; r--;
            } else if (s < 0) l++; else r--;
          }
        }
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Следующее a[i]: фиксируем или пропускаем?', en: 'Next a[i]: fix it or skip it?' },
        keys: { 'tsum.ev.fix': { ru: 'фиксируем и ищем пару', en: 'fix it and search for a pair' },
                'tsum.ev.skip': { ru: 'повтор — пропускаем', en: 'a repeat: skip' } } },
      { q: { ru: 'Сумма трёх под указателями — ноль или нет?', en: 'Is the sum of the three under the pointers zero?' },
        keys: { 'tsum.ev.check': { ru: 'нет — двигаем L или R', en: 'no: move L or R' },
                'tsum.ev.found': { ru: 'ноль — тройка найдена', en: 'zero: a triple is found' } } },
    ],
    followups: [
      { ru: { q: 'Нужна тройка с суммой, ближайшей к target (#16)?', a: 'Тот же цикл: сортировка, фиксируем i, указатели навстречу, и на каждом шаге обновляем лучший |sum − target|. O(n²).' },
        en: { q: 'You need the triple with sum closest to the target (#16)?', a: 'Same loop: sort, fix i, move the pointers inward, updating the best |sum − target| at each step. O(n²).' } },
      { ru: { q: 'А 4Sum или kSum?', a: 'Рекурсия: фиксируем по одному числу, пока не останется 2Sum на указателях. Получается O(n^(k−1)), пропуск повторов — на каждом уровне.' },
        en: { q: 'And 4Sum or kSum?', a: 'Recurse: fix one number at a time until a two-pointer 2Sum remains. That is O(n^(k−1)), with repeat-skipping at every level.' } },
      { ru: { q: 'Сортировать нельзя — нужны исходные индексы?', a: 'Для каждого i ищи пару хеш-множеством, как в Two Sum: O(n²) времени и O(n) памяти. Повторы гаси, кладя отсортированные тройки значений в HashSet.' },
        en: { q: 'You may not sort because original indices are needed?', a: 'For each i find the pair with a hash set, as in Two Sum: O(n²) time, O(n) memory. Kill repeats by putting sorted value triples into a HashSet.' } },
    ],
    related: [
      { id: 'twoSumII', ru: 'внутренний цикл — это он', en: 'this is the inner loop' },
      { id: 'twoSum', ru: 'вариант с хешем вместо сортировки', en: 'the hashing alternative to sorting' },
    ],
  },

  trap: {
    tricky: [
      { input: { h: '1, 2, 3, 4' },
        ru: 'Высоты только растут: справа от каждого столбика стена, а слева нет — вода стекает. Ответ — 0.',
        en: 'Heights only grow: each bar has a wall on the right but none on the left, so water runs off. The answer is 0.' },
      { input: { h: '5, 0, 0, 0, 1' },
        ru: 'Воду держит более низкая стена: уровень 1, а не 5. Если брать максимум с одной стороны, выйдет 15, а верно — 3.',
        en: 'The lower wall holds the water: level 1, not 5. Take the max from one side only and you get 15; the answer is 3.' },
    ],
    ops: {
      unit: { ru: 'чтений высот', en: 'height reads' },
      naive: { ru: 'для каждого столбика искать максимумы', en: 'scan for maxima at every bar', count: p => p.h.length * (p.h.length + 1) },
      ours: { ru: 'два указателя', en: 'two pointers', count: p => 2 * (p.h.length - 1) },
    },
    predict: [
      { q: { ru: 'Какую сторону обработаем следующей?', en: 'Which side gets processed next?' },
        keys: { 'trap.ev.left': { ru: 'левую — h[L] ниже', en: 'the left: h[L] is lower' },
                'trap.ev.right': { ru: 'правую — h[R] не выше', en: 'the right: h[R] is not higher' } } },
    ],
    followups: [
      { ru: { q: 'Высоты приходят потоком слева направо?', a: 'Монотонный стек убывающих высот: столбик выше вершины выталкивает дно и добавляет слой воды <code>(min(h[left], h[i]) − h[bottom]) × (i − left − 1)</code>. Вода считается по мере поступления, без прохода справа.' },
        en: { q: 'Heights arrive as a stream from left to right?', a: 'A monotonic stack of decreasing heights: a bar taller than the top pops the bottom and adds a layer of water <code>(min(h[left], h[i]) − h[bottom]) × (i − left − 1)</code>. Water is counted as bars arrive, with no right-to-left pass.' } },
      { ru: { q: 'Как объяснить решение проще, чем указателями?', a: 'Два массива: leftMax[i] и rightMax[i], потом вода = min(leftMax, rightMax) − h. Тоже O(n), но O(n) памяти; указатели — то же самое, где массивы заменены двумя бегущими максимумами.' },
        en: { q: 'How do you explain it more simply than with pointers?', a: 'Two arrays leftMax[i] and rightMax[i], then water = min(leftMax, rightMax) − h. Also O(n), but O(n) memory; the pointers do the same with two running maxima instead of arrays.' } },
    ],
    related: [
      { id: 'container', ru: 'тот же довод «двигай низкую сторону»', en: 'the same “move the lower side” argument' },
      { id: 'histogram', ru: 'монотонный стек считает воду слоями', en: 'a monotonic stack counts water layer by layer' },
    ],
  },

  sortColors: {
    tricky: [
      { input: { nums: '1, 2, 0' },
        ru: 'Сдвинешь mid после обмена с hi — пропустишь пришедший оттуда 0 и получишь [1, 0, 2]. Верно — [0, 1, 2].',
        en: 'Advance mid after swapping with hi and you skip the 0 that came from there, getting [1, 0, 2]. The answer is [0, 1, 2].' },
      { input: { nums: '1, 0' },
        ru: 'С условием <code>mid &lt; hi</code> вместо <code>mid &lt;= hi</code> последний элемент не проверится, и [1, 0] останется как есть. Верно — [0, 1].',
        en: 'With <code>mid &lt; hi</code> instead of <code>mid &lt;= hi</code> the last element is never checked and [1, 0] stays as is. The answer is [0, 1].' },
    ],
    ops: {
      unit: { ru: 'сравнений', en: 'comparisons' },
      naive: { ru: 'сортировка вставками', en: 'insertion sort', count: p => {
        const a = [...p.nums];
        let c = 0;
        for (let i = 1; i < a.length; i++) {
          for (let j = i; j > 0; j--) {
            c++;
            if (a[j - 1] > a[j]) [a[j - 1], a[j]] = [a[j], a[j - 1]]; else break;
          }
        }
        return c;
      } },
      ours: { ru: 'флаг Дейкстры', en: 'Dutch national flag', count: p => {
        const a = [...p.nums];
        let lo = 0, mid = 0, hi = a.length - 1, c = 0;
        while (mid <= hi) {
          c++;
          if (a[mid] === 0) { [a[lo], a[mid]] = [a[mid], a[lo]]; lo++; mid++; continue; }
          c++;
          if (a[mid] === 1) mid++;
          else { [a[mid], a[hi]] = [a[hi], a[mid]]; hi--; }
        }
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Что сделаем с nums[mid]?', en: 'What happens to nums[mid]?' },
        keys: { 'sc.ev.zero': { ru: 'обмен с lo, шагают lo и mid', en: 'swap with lo, both lo and mid step' },
                'sc.ev.one': { ru: 'шагает только mid', en: 'only mid steps' },
                'sc.ev.two': { ru: 'обмен с hi, шагает только hi', en: 'swap with hi, only hi steps' } } },
    ],
    followups: [
      { ru: { q: 'Цветов не 3, а k?', a: 'Сортировка подсчётом: O(n + k) времени и O(k) памяти. Если памяти под счётчики нет, рекурсивно дели диапазон цветов пополам разбиением: O(n log k).' },
        en: { q: 'Not 3 colours but k?', a: 'Counting sort: O(n + k) time and O(k) memory. With no memory for counters, recursively split the colour range in half by partitioning: O(n log k).' } },
      { ru: { q: 'Сортируем объекты по цвету, и порядок равных важен?', a: 'Флаг не устойчив: обмены переставляют равные. Нужен устойчивый подсчёт: посчитать цвета, перевести в стартовые позиции и разложить в буфер по одному проходу — O(n) памяти.' },
        en: { q: 'You sort objects by colour and the order of equals matters?', a: 'The flag is not stable: swaps reorder equal items. Use a stable counting sort: count colours, turn counts into start offsets and place items into a buffer in one pass — O(n) memory.' } },
    ],
    related: [
      { id: 'moveZeroes', ru: 'то же разбиение, но зон две', en: 'the same partition with two zones' },
      { id: 'firstMissing', ru: 'перестановка на месте без доп. памяти', en: 'in-place rearranging with no extra memory' },
    ],
  },

  palindrome: {
    tricky: [
      { input: { s: '0P' },
        ru: 'Цифры тоже считаются: если пропускать всё, что не буква, останется «P», и ответ выйдет true. Верно — false: «0» ≠ «p».',
        en: 'Digits count too: skip everything that is not a letter and only “P” is left, giving true. The answer is false: “0” ≠ “p”.' },
      { input: { s: 'Aa' },
        ru: 'Без приведения регистра «A» ≠ «a». Сравнение без учёта регистра даёт true.',
        en: 'Without case folding “A” ≠ “a”. A case-insensitive comparison gives true.' },
      { input: { s: 'a.' },
        ru: 'Строка не совпадает со своим разворотом «.a», но после очистки остаётся «a». Ответ — true.',
        en: 'The string differs from its reverse “.a”, but after cleaning only “a” remains. The answer is true.' },
    ],
    ops: {
      unit: { ru: 'чтений символов', en: 'character reads' },
      naive: { ru: 'очистить, развернуть, сравнить', en: 'clean, reverse, compare', count: p => {
        const clean = [...p.s].filter(isAlnum).map(ch => ch.toLowerCase());
        const m = clean.length;
        let c = p.s.length + m;
        for (let i = 0; i < m; i++) { c++; if (clean[i] !== clean[m - 1 - i]) break; }
        return c;
      } },
      ours: { ru: 'встречные указатели', en: 'two pointers', count: p => {
        const s = [...p.s];
        let l = 0, r = s.length - 1, c = 0;
        while (l < r) {
          while (l < r && !isAlnum(s[l])) { c++; l++; }
          while (l < r && !isAlnum(s[r])) { c++; r--; }
          c += l === r ? 1 : 2;
          if (s[l].toLowerCase() !== s[r].toLowerCase()) break;
          l++; r--;
        }
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Следующий шаг: пропуск или сравнение?', en: 'Next step: a skip or a comparison?' },
        keys: { 'pal.ev.skipL': { ru: 'l пропускает символ', en: 'l skips a character' },
                'pal.ev.skipR': { ru: 'r пропускает символ', en: 'r skips a character' },
                'pal.ev.match': { ru: 'сравнение — совпало', en: 'compare: a match' },
                'pal.ev.mismatch': { ru: 'сравнение — не совпало', en: 'compare: a mismatch' } } },
    ],
    followups: [
      { ru: { q: 'Строка на любом языке, с эмодзи?', a: '<code>char</code> в .NET — это UTF-16 код, и эмодзи из суррогатной пары развалится при сравнении «с конца». Идти надо по <code>Rune</code> (или по текстовым элементам <code>StringInfo</code>), а «é» из двух кодов сначала нормализовать через <code>Normalize()</code>.' },
        en: { q: 'A string in any language, with emoji?', a: 'A .NET <code>char</code> is a UTF-16 unit, so an emoji made of a surrogate pair breaks when compared “from the end”. Walk by <code>Rune</code> (or <code>StringInfo</code> text elements), and normalize a two-code “é” first with <code>Normalize()</code>.' } },
      { ru: { q: 'Проверить палиндром в односвязном списке за O(1) памяти (#234)?', a: 'Найди середину быстрым и медленным указателями, разверни вторую половину, сравни половины, потом разверни обратно. O(n) времени.' },
        en: { q: 'Check a palindrome in a singly linked list with O(1) memory (#234)?', a: 'Find the middle with fast and slow pointers, reverse the second half, compare the halves, then reverse it back. O(n) time.' } },
    ],
    related: [
      { id: 'twoSumII', ru: 'те же встречные указатели', en: 'the same pointers moving toward each other' },
      { id: 'reverse', ru: 'палиндром в списке требует развернуть половину', en: 'a list palindrome needs half of it reversed' },
    ],
  },

  /* ───────────── matrix ───────────── */
  productExcept: {
    tricky: [
      { input: { nums: '1, 2, 0, 4' },
        ru: 'Один ноль: «общее произведение / nums[i]» делит на 0. Верно — [0, 0, 8, 0]: только у самого нуля ответ ненулевой.',
        en: 'One zero: “total product / nums[i]” divides by 0. The answer is [0, 0, 8, 0]: only the zero itself gets a non-zero result.' },
      { input: { nums: '0, 3, 0' },
        ru: 'Два нуля: в каждом произведении «без себя» остаётся хотя бы один ноль. Ответ — [0, 0, 0].',
        en: 'Two zeros: every “all but me” product still contains a zero. The answer is [0, 0, 0].' },
    ],
    ops: {
      unit: { ru: 'умножений', en: 'multiplications' },
      naive: { ru: 'для каждого i перемножить остальные', en: 'multiply the others for each i', count: p => p.nums.length * (p.nums.length - 1) },
      ours: { ru: 'префикс и суффикс', en: 'prefix and suffix', count: p => 3 * p.nums.length },
    },
    predict: [
      { q: { ru: 'Левый проход: ещё шаг или разворот?', en: 'Left pass: another step or turn around?' },
        keys: { 'pes.ev.left': { ru: 'ещё шаг вправо', en: 'one more step right' },
                'pes.ev.turn': { ru: 'разворот — пошёл суффикс', en: 'turn around: the suffix pass starts' } } },
    ],
    followups: [
      { ru: { q: 'А если деление разрешено?', a: 'Посчитай нули. Нет нулей — total / x. Один ноль — ненулевой ответ только на его месте (произведение остальных). Два и больше — все нули.' },
        en: { q: 'What if division is allowed?', a: 'Count the zeros. None: total / x. One: only its position gets a non-zero answer, the product of the rest. Two or more: all zeros.' } },
      { ru: { q: 'Ответ нужен по модулю простого p?', a: 'Деление по модулю — умножение на обратный, а у чисел, кратных p, его нет. Префикс и суффикс обходятся одними умножениями, поэтому работают при любом входе.' },
        en: { q: 'The answer is needed modulo a prime p?', a: 'Modular division is multiplying by an inverse, and multiples of p have none. Prefix and suffix need only multiplications, so they work for any input.' } },
    ],
    related: [
      { id: 'psum', ru: 'префиксы, только × вместо +', en: 'prefixes, with × instead of +' },
      { id: 'candy', ru: 'два прохода: слева направо и обратно', en: 'two passes: left to right and back' },
      { id: 'trap', ru: 'тоже «что слева» и «что справа» от каждого i', en: 'also “what is left” and “what is right” of each i' },
    ],
  },

  rotate: {
    tricky: [
      { input: { matrix: '1 2 | 3 4' },
        ru: 'Транспонируешь по всем клеткам, а не только над диагональю, — каждая пара поменяется дважды и вернётся на место; останется одно отражение [[2, 1], [4, 3]]. Верно — [[3, 1], [4, 2]].',
        en: 'Transpose every cell instead of only those above the diagonal and each pair swaps twice, back to where it was; only the mirror remains: [[2, 1], [4, 3]]. The answer is [[3, 1], [4, 2]].' },
      { input: { matrix: '1 2 3 | 4 5 6 | 7 8 9' },
        ru: 'Порядок шагов важен: отразить строки и потом транспонировать — это поворот против часовой, [[3, 6, 9], [2, 5, 8], [1, 4, 7]]. По часовой — [[7, 4, 1], [8, 5, 2], [9, 6, 3]].',
        en: 'Order matters: mirroring rows first and then transposing turns counterclockwise, [[3, 6, 9], [2, 5, 8], [1, 4, 7]]. Clockwise is [[7, 4, 1], [8, 5, 2], [9, 6, 3]].' },
    ],
    ops: {
      unit: { ru: 'записей клеток', en: 'cell writes' },
      naive: { ru: 'новая матрица и копия обратно', en: 'a new matrix, then copy back', count: p => 2 * p.matrix.length * p.matrix.length },
      ours: { ru: 'транспонировать + отразить', en: 'transpose + mirror', count: p => { const n = p.matrix.length; return 2 * ((n * (n - 1)) / 2 + n * Math.floor(n / 2)); } },
    },
    predict: [
      { q: { ru: 'Транспонирование ещё идёт или пора отражать?', en: 'Is the transpose still running, or is it time to mirror?' },
        keys: { 'rot.ev.tswap': { ru: 'ещё обмен над диагональю', en: 'another swap above the diagonal' },
                'rot.ev.mirror': { ru: 'переходим к отражению строк', en: 'move on to mirroring rows' } } },
    ],
    followups: [
      { ru: { q: 'Против часовой? На 180°?', a: 'Против часовой: транспонировать и поменять местами строки (верх ↔ низ). 180°: поменять местами строки и развернуть каждую строку.' },
        en: { q: 'Counterclockwise? By 180°?', a: 'Counterclockwise: transpose, then swap rows top ↔ bottom. 180°: swap rows top ↔ bottom and reverse each row.' } },
      { ru: { q: 'Матрица не квадратная?', a: 'На месте в общем случае не выйдет: размеры меняются. Заводим массив n × m и пишем <code>res[c][m − 1 − r] = a[r][c]</code>.' },
        en: { q: 'The matrix is not square?', a: 'In place is generally impossible since the shape changes. Allocate n × m and write <code>res[c][m − 1 − r] = a[r][c]</code>.' } },
    ],
    related: [
      { id: 'spiral', ru: 'матрица как набор колец от края к центру', en: 'the matrix as rings from the edge inward' },
      { id: 'setZeroes', ru: 'тоже меняем матрицу на месте, без второй копии', en: 'also transforms the matrix in place, with no second copy' },
    ],
  },

  setZeroes: {
    tricky: [
      { input: { matrix: '1 0 3 | 4 5 6' },
        ru: 'Если флагом первой строки сделать m[0][0], он заодно скажет «обнули первый столбец», и 4 пропадёт зря. Нужны два отдельных флага: ответ [[0, 0, 0], [4, 0, 6]].',
        en: 'Use m[0][0] as the first-row flag and it also says “zero the first column”, wiping the 4 for nothing. You need two separate flags: the answer is [[0, 0, 0], [4, 0, 6]].' },
      { input: { matrix: '1 0 1 | 1 1 1 | 1 1 1' },
        ru: 'Обнулять сразу при находке нельзя: новые нули примутся за исходные, и обнулится всё. Верно — [[0, 0, 0], [1, 0, 1], [1, 0, 1]].',
        en: 'Zeroing on sight is wrong: new zeros look like original ones and everything gets wiped. The answer is [[0, 0, 0], [1, 0, 1], [1, 0, 1]].' },
    ],
    ops: {
      unit: { ru: 'посещений клеток', en: 'cell visits' },
      naive: { ru: 'копия и обнуление по ней', en: 'copy, then zero from it', count: p => {
        const R = p.matrix.length, C = p.matrix[0].length;
        let zeros = 0;
        p.matrix.forEach(row => row.forEach(v => { if (v === 0) zeros++; }));
        return 2 * R * C + zeros * (R + C);
      } },
      ours: { ru: 'маркеры в самой матрице', en: 'markers inside the matrix', count: p => {
        const m = p.matrix, R = m.length, C = m[0].length;
        const rowZero = m[0].includes(0), colZero = m.some(r => r[0] === 0);
        let inner = 0;
        for (let r = 1; r < R; r++) for (let c = 1; c < C; c++) if (m[r][c] === 0) inner++;
        return R + C + 2 * (R - 1) * (C - 1) + 2 * inner + (rowZero ? C : 0) + (colZero ? R : 0);
      } },
    },
    predict: [
      { q: { ru: 'Следующая строка: что-то в ней обнулится?', en: 'Next row: will anything in it be zeroed?' },
        keys: { 'smz.ev.row': { ru: 'да — по маркерам', en: 'yes: by the markers' },
                'smz.ev.keep': { ru: 'нет — строка не меняется', en: 'no: the row stays' } } },
    ],
    followups: [
      { ru: { q: 'Матрица огромная и разреженная, а читают её редко?', a: 'Не переписывай её вовсе: собери множества нулевых строк и столбцов и отвечай на чтение лениво — <code>get(r, c) = zeroRow[r] || zeroCol[c] ? 0 : a[r][c]</code>.' },
        en: { q: 'The matrix is huge and sparse, and reads are rare?', a: 'Do not rewrite it at all: collect the sets of zero rows and columns and answer reads lazily — <code>get(r, c) = zeroRow[r] || zeroCol[c] ? 0 : a[r][c]</code>.' } },
      { ru: { q: 'Как распараллелить?', a: 'Две фазы с барьером между ними. Пометки потоки пишут в общую первую строку (все пишут 0, но надёжнее собрать флаги каждого потока и слить). Заполнение строк независимо и делится по строкам без блокировок.' },
        en: { q: 'How do you parallelize it?', a: 'Two phases with a barrier between them. Threads write marks into the shared first row (all write 0, but merging per-thread flags is safer). Filling rows is independent and splits by rows with no locks.' } },
    ],
    related: [
      { id: 'gameOfLife', ru: 'служебные пометки живут в самой матрице', en: 'bookkeeping lives inside the matrix itself' },
      { id: 'firstMissing', ru: 'массив сам служит множеством меток', en: 'the array itself serves as the set of marks' },
    ],
  },

  spiral: {
    tricky: [
      { input: { matrix: '1 2 3' },
        ru: 'Одна строка: без проверки <code>top &lt;= bottom</code> обратный путь влево прочитает её второй раз — [1, 2, 3, 2, 1]. Верно — [1, 2, 3].',
        en: 'One row: without the <code>top &lt;= bottom</code> check the leftward pass reads it again — [1, 2, 3, 2, 1]. The answer is [1, 2, 3].' },
      { input: { matrix: '1 | 2 | 3' },
        ru: 'Один столбец: без проверки <code>left &lt;= right</code> путь вверх добавит лишнюю 2 — [1, 2, 3, 2]. Верно — [1, 2, 3].',
        en: 'One column: without the <code>left &lt;= right</code> check the upward pass adds an extra 2 — [1, 2, 3, 2]. The answer is [1, 2, 3].' },
    ],
    ops: {
      unit: { ru: 'операций', en: 'operations' },
      naive: { ru: 'симуляция с матрицей visited', en: 'simulation with a visited matrix', count: p => {
        const R = p.matrix.length, C = p.matrix[0].length, seen = p.matrix.map(row => row.map(() => false));
        const dr = [0, 1, 0, -1], dc = [1, 0, -1, 0];
        let r = 0, c = 0, d = 0, ops = 0;
        for (let k = 0; k < R * C; k++) {
          ops += 2;
          seen[r][c] = true;
          if (k === R * C - 1) break;
          for (let t = 0; t < 4; t++) {
            ops++;
            const nr = r + dr[d], nc = c + dc[d];
            if (nr >= 0 && nr < R && nc >= 0 && nc < C && !seen[nr][nc]) { r = nr; c = nc; break; }
            d = (d + 1) % 4;
          }
        }
        return ops;
      } },
      ours: { ru: 'четыре границы', en: 'four bounds', count: p => {
        const R = p.matrix.length, C = p.matrix[0].length;
        let top = 0, bottom = R - 1, left = 0, right = C - 1, ops = R * C;
        while ((ops++, top <= bottom && left <= right)) {
          top++;
          ops++;
          right--;
          if ((ops++, top <= bottom)) { ops++; bottom--; }
          if ((ops++, left <= right)) { ops++; left++; }
        }
        return ops;
      } },
    },
    predict: [
      { q: { ru: 'После спуска: осталась ли строка для пути влево?', en: 'After going down: is there a row left for the leftward pass?' },
        keys: { 'spi.ev.left': { ru: 'да — идём влево', en: 'yes: go left' },
                'spi.ev.noRow': { ru: 'нет — путь влево пропускаем', en: 'no: skip the leftward pass' } } },
      { q: { ru: 'Остался ли столбец для пути вверх?', en: 'Is there a column left for the upward pass?' },
        keys: { 'spi.ev.up': { ru: 'да — идём вверх', en: 'yes: go up' },
                'spi.ev.noCol': { ru: 'нет — путь вверх пропускаем', en: 'no: skip the upward pass' } } },
    ],
    followups: [
      { ru: { q: 'Нужна спираль от центра наружу?', a: 'Разверни готовый ответ: обход снаружи внутрь по часовой, прочитанный задом наперёд, — это обход изнутри наружу против часовой.' },
        en: { q: 'You need the spiral from the centre outward?', a: 'Reverse the finished answer: an outside-in clockwise walk read backwards is an inside-out counterclockwise walk.' } },
      { ru: { q: 'Нужен только k-й элемент обхода?', a: 'Пропускай кольца целиком: у кольца h × w ровно 2(h + w) − 4 клеток (или h·w, если h или w равно 1). Найдя кольцо, вычисли позицию на нём. O(min(R, C)) вместо O(R · C).' },
        en: { q: 'You only need the k-th element of the walk?', a: 'Skip whole rings: a ring of h × w has 2(h + w) − 4 cells (or h·w if h or w is 1). Once you find the ring, compute the position on it. O(min(R, C)) instead of O(R · C).' } },
    ],
    related: [
      { id: 'rotate', ru: 'та же матрица из колец', en: 'the same matrix of rings' },
      { id: 'islands', ru: 'тоже обход клеток сетки, но по соседству', en: 'also walks grid cells, but by adjacency' },
    ],
  },

  gameOfLife: {
    tricky: [
      { input: { board: '111' },
        ru: 'Если писать новое состояние сразу, первая клетка умрёт, средняя увидит лишь одного соседа и тоже умрёт — выйдет 000. Верно — 010: средняя выживает с двумя соседями.',
        en: 'Write the new state immediately and the first cell dies, the middle sees only one neighbour and dies too — you get 000. The answer is 010: the middle survives with two neighbours.' },
      { input: { board: '11 11' },
        ru: 'Края не склеены: у каждой клетки блока 2 × 2 ровно 3 соседа, блок неподвижен. С ошибочным «тором» соседи посчитаются по нескольку раз, и блок умрёт от перенаселения.',
        en: 'Edges do not wrap: every cell of the 2 × 2 block has exactly 3 neighbours, so the block is still. With an accidental torus neighbours are counted several times and the block dies of overcrowding.' },
    ],
    ops: {
      unit: { ru: 'записей', en: 'writes' },
      naive: { ru: 'копия доски', en: 'a copy of the board', count: p => 2 * p.board.length * p.board[0].length },
      ours: { ru: 'два бита на клетку', en: 'two bits per cell', count: p => {
        const b = p.board, R = b.length, C = b[0].length;
        let c = R * C;
        for (let r = 0; r < R; r++) {
          for (let x = 0; x < C; x++) {
            let live = 0;
            for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
              if ((dr || dc) && r + dr >= 0 && r + dr < R && x + dc >= 0 && x + dc < C) live += b[r + dr][x + dc];
            }
            if (live === 3 || (live === 2 && b[r][x])) c++;
          }
        }
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Живая клетка: что с ней будет?', en: 'A live cell: what happens to it?' },
        keys: { 'gol.ev.lives': { ru: 'выживет', en: 'it survives' },
                'gol.ev.under': { ru: 'умрёт от одиночества', en: 'it dies of loneliness' },
                'gol.ev.over': { ru: 'умрёт от перенаселения', en: 'it dies of overcrowding' } } },
      { q: { ru: 'Мёртвая клетка: родится?', en: 'A dead cell: will it be born?' },
        keys: { 'gol.ev.born': { ru: 'да — ровно 3 соседа', en: 'yes: exactly 3 neighbours' },
                'gol.ev.empty': { ru: 'нет — останется мёртвой', en: 'no: it stays dead' } } },
    ],
    followups: [
      { ru: { q: 'Поле бесконечное?', a: 'Храни только живые клетки в <code>HashSet&lt;(int, int)&gt;</code>. Каждая живая добавляет +1 восьми соседям в <code>Dictionary</code>; рождаются клетки со счётом 3, выживают живые со счётом 2 или 3. O(живых) на поколение.' },
        en: { q: 'The board is infinite?', a: 'Keep only live cells in a <code>HashSet&lt;(int, int)&gt;</code>. Each live cell adds +1 to its eight neighbours in a <code>Dictionary</code>; cells with a count of 3 are born, live cells with 2 or 3 survive. O(live cells) per generation.' } },
      { ru: { q: 'Как это делают на GPU, например compute-шейдером в Unity?', a: 'Двойной буфер: читают из одной текстуры, пишут в другую, потом меняют их местами. Трюк с битами там не нужен — тысячи потоков всё равно не могут договориться о порядке, и запись на место дала бы гонку.' },
        en: { q: 'How is this done on the GPU, say with a compute shader in Unity?', a: 'Double buffering: read from one texture, write to another, then swap them. The bit trick is unnecessary there — thousands of threads cannot agree on an order anyway, and writing in place would race.' } },
    ],
    related: [
      { id: 'setZeroes', ru: 'тоже прячем служебное состояние в самой матрице', en: 'also hides bookkeeping inside the matrix' },
      { id: 'islands', ru: 'соседи клетки в сетке', en: 'neighbours of a grid cell' },
    ],
  },

  maxRect: {
    tricky: [
      { input: { matrix: '111' },
        ru: 'Забудешь в конце строки вытолкнуть остаток стека нулевой высотой — самый широкий прямоугольник не посчитается, и выйдет 2. Верно — 3.',
        en: 'Forget to flush the rest of the stack with a zero height at the end of the row and the widest rectangle is never measured, giving 2. The answer is 3.' },
      { input: { matrix: '0110 1111 0110' },
        ru: 'Самая длинная строка единиц даёт 4, но выше прямоугольник 3 × 2 по средним столбцам. Ответ — 6.',
        en: 'The longest row of ones gives 4, but the 3 × 2 rectangle in the middle columns is bigger. The answer is 6.' },
      { input: { matrix: '000 000' },
        ru: 'Одни нули: все высоты 0, ни одного прямоугольника. Ответ — 0.',
        en: 'All zeros: every height is 0, no rectangle at all. The answer is 0.' },
    ],
    ops: {
      unit: { ru: 'операций', en: 'operations' },
      naive: { ru: 'проверить каждый прямоугольник', en: 'check every rectangle', count: p => allRectCells(p.matrix.length, p.matrix[0].length) },
      ours: { ru: 'гистограммы + стек', en: 'histograms + a stack', count: p => {
        const R = p.matrix.length, C = p.matrix[0].length, h = Array(C).fill(0);
        let c = 0;
        for (let r = 0; r < R; r++) {
          for (let x = 0; x < C; x++) { h[x] = p.matrix[r][x] ? h[x] + 1 : 0; c++; }
          const st = [];
          for (let i = 0; i <= C; i++) {
            const cur = i === C ? 0 : h[i];
            while (st.length && h[st.at(-1)] >= cur) { st.pop(); c++; }
            if (i < C) { st.push(i); c++; }
          }
        }
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Следующая высота: сразу в стек или сначала кого-то вытолкнуть?', en: 'Next height: straight onto the stack, or pop something first?' },
        keys: { 'mrect.ev.push': { ru: 'push — стек по-прежнему растёт', en: 'push: the stack keeps growing' },
                'mrect.ev.pop': { ru: 'pop — вершина не ниже новой высоты', en: 'pop: the top is not lower than the new height' } } },
    ],
    followups: [
      { ru: { q: 'Нужно посчитать все подматрицы из единиц (#1504)?', a: 'Те же высоты по строкам, а в монотонном стеке храни, сколько прямоугольников кончается в каждом столбце: cnt[i] = cnt[prev] + h[i] × (i − prev). Сумма по всем строкам — ответ, O(R · C).' },
        en: { q: 'You must count all submatrices of ones (#1504)?', a: 'The same row heights, and the monotonic stack keeps how many rectangles end at each column: cnt[i] = cnt[prev] + h[i] × (i − prev). The sum over all rows is the answer, O(R · C).' } },
      { ru: { q: 'Столбцов намного больше, чем строк?', a: 'Транспонируй задачу: веди высоты по столбцам, а гистограмму — по строкам. Память станет O(min(R, C)), время то же.' },
        en: { q: 'There are far more columns than rows?', a: 'Transpose the problem: build heights along columns and the histogram along rows. Memory becomes O(min(R, C)), time stays the same.' } },
    ],
    related: [
      { id: 'histogram', ru: 'каждая строка — ровно эта задача', en: 'every row is exactly this problem' },
      { id: 'container', ru: 'площадь ограничена самой низкой высотой', en: 'area is limited by the lowest height' },
    ],
  },

  uniquePaths: {
    tricky: [
      { input: { m: '1', n: '1', mode: 'table' },
        ru: 'Старт совпадает с финишем: путь один — пустой. Если в базе написать «в клетку старта 0 путей», ответ выйдет 0. Верно — 1.',
        en: 'Start equals finish: there is one path, the empty one. Seed the start cell with “0 paths” and you return 0. The answer is 1.' },
      { input: { m: '1', n: '7', mode: 'row' },
        ru: 'Одна строка: идти можно только вправо, путь один. Ответ — 1, а внутренний цикл не делает ни шага.',
        en: 'One row: you can only go right, so there is one path. The answer is 1, and the inner loop never runs.' },
      { input: { m: '7', n: '7', mode: 'table' },
        ru: 'Рекурсия без запоминания сделает 2 · 924 − 1 = 1847 вызовов, а таблица — 49 клеток. Ответ — 924.',
        en: 'Recursion without memoization makes 2 · 924 − 1 = 1847 calls; the table fills 49 cells. The answer is 924.' },
    ],
    ops: {
      unit: { ru: 'вычислений', en: 'evaluations' },
      naive: { ru: 'рекурсия без запоминания', en: 'recursion without memo', count: p => 2 * binomial(p.m + p.n - 2, p.m - 1) - 1 },
      ours: { ru: 'таблица DP', en: 'DP table', count: p => p.m * p.n },
    },
    predict: [],
    followups: [
      { ru: { q: 'm и n до 10⁵, ответ по модулю 10⁹ + 7?', a: 'Таблица уже велика, нужна формула C(m + n − 2, m − 1): предпосчитай факториалы и обратные к ним по малой теореме Ферма. O(m + n).' },
        en: { q: 'm and n up to 10⁵, answer modulo 10⁹ + 7?', a: 'The table is too big now; use the formula C(m + n − 2, m − 1): precompute factorials and their inverses via Fermat’s little theorem. O(m + n).' } },
      { ru: { q: 'Можно ходить ещё и по диагонали?', a: 'Добавь третье слагаемое: <code>dp[r][c] = up + left + diag</code>. Получатся числа Деланнуа; в режиме одной строки придётся отдельно помнить старое значение row[c − 1].' },
        en: { q: 'Diagonal moves are allowed too?', a: 'Add a third term: <code>dp[r][c] = up + left + diag</code>. These are the Delannoy numbers; in single-row mode you must keep the old row[c − 1] aside.' } },
      { ru: { q: 'У клеток есть цена, нужен самый дешёвый путь (#64)?', a: 'Та же таблица, но <code>dp = cost + min(up, left)</code> вместо суммы. Порядок обхода и трюк с одной строкой не меняются.' },
        en: { q: 'Cells have costs and you need the cheapest path (#64)?', a: 'The same table with <code>dp = cost + min(up, left)</code> instead of a sum. The fill order and the one-row trick stay the same.' } },
    ],
    related: [
      { id: 'climb', ru: 'тот же переход «сумма двух предыдущих», только в 1D', en: 'the same “sum of the two previous” step, in 1D' },
      { id: 'lcs', ru: 'двумерная таблица с переходом от соседей сверху и слева', en: 'a 2D table filled from the neighbours above and to the left' },
    ],
  },

  /* ───────────── window ───────────── */
  maxAvg: {
    tricky: [
      { input: { nums: '-5, -2, -9', k: '2' },
        ru: 'Все числа отрицательные: начнёшь <code>best</code> с 0 — вернёшь 0. Лучшее окно [−5, −2], среднее −3.50.',
        en: 'All numbers are negative: start <code>best</code> at 0 and you return 0. The best window is [−5, −2], average −3.50.' },
      { input: { nums: '1, 2', k: '2' },
        ru: 'Делишь int на int — получишь 1. Среднее — 1.50, делить нужно в double.',
        en: 'Divide an int by an int and you get 1. The average is 1.50: divide in double.' },
    ],
    ops: {
      unit: { ru: 'сложений', en: 'additions' },
      naive: { ru: 'сумма каждого окна заново', en: 'sum every window from scratch', count: p => (p.nums.length - p.k + 1) * p.k },
      ours: { ru: 'скользящая сумма', en: 'running window sum', count: p => p.k + 2 * (p.nums.length - p.k) },
    },
    predict: [],
    followups: [
      { ru: { q: 'Много запросов с разными k по одному массиву?', a: 'Префиксные суммы один раз: сумма окна [l, r] = P[r + 1] − P[l] за O(1). Каждый запрос — O(n) без пересчёта окон.' },
        en: { q: 'Many queries with different k over the same array?', a: 'Prefix sums once: the sum of window [l, r] is P[r + 1] − P[l] in O(1). Each query is O(n) with no window recomputation.' } },
      { ru: { q: 'А медиану каждого окна (#480)?', a: 'Сумма обновляется за O(1), медиана — нет. Две кучи с ленивым удалением или отсортированное мультимножество: O(n log k).' },
        en: { q: 'And the median of each window (#480)?', a: 'A sum updates in O(1), a median does not. Two heaps with lazy deletion or a sorted multiset: O(n log k).' } },
    ],
    related: [
      { id: 'slidingMax', ru: 'то же окно k, но максимум за O(1) не обновить', en: 'the same window of k, but a maximum cannot update in O(1)' },
      { id: 'psum', ru: 'сумма окна — разность двух префиксов', en: 'a window sum is a difference of two prefixes' },
    ],
  },

  longest: {
    tricky: [
      { input: { s: 'abba' },
        ru: 'Если прыгать <code>l = last[c] + 1</code> без <code>max</code>, на последней «a» l откатится назад и окно «bba» посчитается за 3. Ответ — 2.',
        en: 'Jump <code>l = last[c] + 1</code> without <code>max</code> and at the last “a” l moves backwards, counting “bba” as 3. The answer is 2.' },
      { input: { s: 'dvdf' },
        ru: 'Начинать окно заново с повторного символа нельзя: потеряешь «vdf». Ответ — 3, а не 2.',
        en: 'Restarting the window at the repeated character loses “vdf”. The answer is 3, not 2.' },
      { input: { s: 'bbbb' },
        ru: 'Все символы одинаковые: окно не растёт больше одного. Ответ — 1.',
        en: 'All characters are the same: the window never grows past one. The answer is 1.' },
    ],
    ops: {
      unit: { ru: 'шагов указателей', en: 'pointer steps' },
      naive: { ru: 'от каждого начала', en: 'from every start', count: p => {
        const s = [...p.s];
        let c = 0;
        for (let i = 0; i < s.length; i++) {
          const set = new Set();
          for (let j = i; j < s.length && !set.has(s[j]); j++) { set.add(s[j]); c++; }
        }
        return c;
      } },
      ours: { ru: 'скользящее окно', en: 'sliding window', count: p => {
        const s = [...p.s], set = new Set();
        let l = 0, c = 0;
        for (let r = 0; r < s.length; r++) {
          while (set.has(s[r])) { set.delete(s[l]); l++; c++; }
          set.add(s[r]);
          c++;
        }
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Следующий шаг окна?', en: 'Next window step?' },
        keys: { 'window.ev.add': { ru: 'добавить символ справа', en: 'add the character on the right' },
                'window.ev.conflict': { ru: 'символ уже в окне — конфликт', en: 'the character is already in the window: conflict' },
                'window.ev.shrink': { ru: 'сжать слева', en: 'shrink from the left' } } },
    ],
    followups: [
      { ru: { q: 'Как обойтись без пошагового сжатия?', a: 'Храни последний индекс каждого символа и прыгай <code>l = max(l, last[c] + 1)</code>. Указатель l больше не шагает по одному, но асимптотика та же — O(n).' },
        en: { q: 'How do you avoid shrinking step by step?', a: 'Keep each character’s last index and jump <code>l = max(l, last[c] + 1)</code>. l no longer moves one by one, but the bound is the same O(n).' } },
      { ru: { q: 'Допускается не больше k разных символов (#340)?', a: 'Вместо множества — словарь счётчиков. Сжимай, пока <code>Count &gt; k</code>, удаляя ключ, когда его счётчик падает до 0.' },
        en: { q: 'At most k distinct characters are allowed (#340)?', a: 'Use a dictionary of counts instead of a set. Shrink while <code>Count &gt; k</code>, removing a key when its count drops to 0.' } },
    ],
    related: [
      { id: 'dupWindow', ru: 'то же окно-множество, но фиксированного размера', en: 'the same set window, with a fixed size' },
      { id: 'minWindow', ru: 'тот же расширяй-сжимай, но окно ищем минимальное', en: 'the same grow-and-shrink, minimizing instead' },
    ],
  },

  minLen: {
    tricky: [
      { input: { target: '6', nums: '1, 1, 1, 1, 6' },
        ru: 'С <code>if</code> вместо <code>while</code> окно сожмётся лишь на шаг, и ответ останется 5. Сжимать надо до упора: ответ — 1.',
        en: 'With <code>if</code> instead of <code>while</code> the window shrinks only one step and the answer stays 5. Shrink all the way: the answer is 1.' },
      { input: { target: '100', nums: '1, 2, 3' },
        ru: 'Сумма всего массива меньше target: подходящего окна нет. Вернуть надо 0, а не <code>int.MaxValue</code>, которым инициализировали минимум.',
        en: 'The whole array sums to less than the target: no window qualifies. Return 0, not the <code>int.MaxValue</code> the minimum started at.' },
    ],
    ops: {
      unit: { ru: 'шагов указателей', en: 'pointer steps' },
      naive: { ru: 'от каждого начала', en: 'from every start', count: p => {
        let c = 0;
        for (let i = 0; i < p.nums.length; i++) {
          let sum = 0;
          for (let j = i; j < p.nums.length; j++) { sum += p.nums[j]; c++; if (sum >= p.target) break; }
        }
        return c;
      } },
      ours: { ru: 'скользящее окно', en: 'sliding window', count: p => {
        let l = 0, sum = 0, c = 0;
        for (let r = 0; r < p.nums.length; r++) {
          sum += p.nums[r];
          c++;
          while (sum >= p.target) { sum -= p.nums[l]; l++; c++; }
        }
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Окно набрало target? Сжимаем или расширяем?', en: 'Has the window reached the target? Shrink or grow?' },
        keys: { 'minw.ev.grow': { ru: 'расширяем — r вправо', en: 'grow: r moves right' },
                'minw.ev.shrink': { ru: 'сжимаем — l вправо', en: 'shrink: l moves right' } } },
    ],
    followups: [
      { ru: { q: 'LeetCode просит ещё решение за O(n log n). Какое?', a: 'Префиксные суммы строго растут (все числа положительные). Для каждого i бинпоиском найди первый j с <code>P[j] ≥ P[i] + target</code>, длина j − i.' },
        en: { q: 'LeetCode also asks for an O(n log n) solution. Which one?', a: 'Prefix sums strictly increase (all numbers are positive). For each i binary-search the first j with <code>P[j] ≥ P[i] + target</code>; the length is j − i.' } },
      { ru: { q: 'Нужна ровно сумма target, а не «не меньше»?', a: 'С положительными числами то же окно: сжимай, пока sum &gt; target, и проверяй равенство. С любыми знаками — префиксные суммы в словаре.' },
        en: { q: 'You need a sum of exactly target, not “at least”?', a: 'With positive numbers the same window works: shrink while sum &gt; target and test for equality. With any signs, use prefix sums in a dictionary.' } },
    ],
    related: [
      { id: 'psum', ru: 'то же для чисел любого знака — уже словарём', en: 'the same for numbers of any sign, with a dictionary' },
      { id: 'minWindow', ru: 'тот же «сжимай, пока окно годится»', en: 'the same “shrink while the window is valid”' },
    ],
  },

  charReplace: {
    tricky: [
      { input: { s: 'ABC', k: '5' },
        ru: 'k больше длины: формула «maxFreq + k» даст 6, но окно не длиннее строки. Ответ — 3.',
        en: 'k exceeds the length: “maxFreq + k” gives 6, but the window cannot be longer than the string. The answer is 3.' },
      { input: { s: 'AABBB', k: '0' },
        ru: 'k = 0: заменять нельзя, ответ — самая длинная серия одинаковых, BBB. Ответ — 3.',
        en: 'k = 0: no replacements, so the answer is the longest run of one letter, BBB. The answer is 3.' },
    ],
    ops: {
      unit: { ru: 'шагов указателей', en: 'pointer steps' },
      naive: { ru: 'от каждого начала', en: 'from every start', count: p => {
        const s = [...p.s];
        let c = 0;
        for (let i = 0; i < s.length; i++) {
          const cnt = {};
          let top = 0;
          for (let j = i; j < s.length; j++) {
            c++;
            cnt[s[j]] = (cnt[s[j]] || 0) + 1;
            top = Math.max(top, cnt[s[j]]);
            if (j - i + 1 - top > p.k) break;
          }
        }
        return c;
      } },
      ours: { ru: 'скользящее окно', en: 'sliding window', count: p => {
        const s = [...p.s], cnt = {};
        let l = 0, c = 0;
        const top = () => Math.max(0, ...Object.values(cnt));
        for (let r = 0; r < s.length; r++) {
          cnt[s[r]] = (cnt[s[r]] || 0) + 1;
          c++;
          while (r - l + 1 - top() > p.k) { cnt[s[l]]--; l++; c++; }
        }
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Окно в бюджете замен? Расширяем дальше или сжимаем?', en: 'Is the window within the replacement budget? Grow further or shrink?' },
        keys: { 'lrc.ev.grow': { ru: 'расширяем — r вправо', en: 'grow: r moves right' },
                'lrc.ev.shrink': { ru: 'сжимаем — бюджет превышен', en: 'shrink: over budget' } } },
    ],
    followups: [
      { ru: { q: 'Вернуть не длину, а итоговую строку?', a: 'Запомни границы лучшего окна, найди в нём самую частую букву и замени на неё остальные. Это ещё один проход по окну, O(n).' },
        en: { q: 'Return the resulting string, not the length?', a: 'Remember the best window’s bounds, find its most frequent letter and replace the others with it. One more pass over the window, O(n).' } },
      { ru: { q: 'Буквы можно не заменять, а удалять — не больше k штук (#2831)?', a: 'Для каждой буквы c возьми список её позиций p. Окно p[i..j] стоит (p[j] − p[i] + 1) − (j − i + 1) удалений; двигай i, пока это &gt; k. Ответ — максимум j − i + 1, всего O(n).' },
        en: { q: 'Letters may be deleted instead of replaced, at most k of them (#2831)?', a: 'For each letter c take the list p of its positions. Window p[i..j] costs (p[j] − p[i] + 1) − (j − i + 1) deletions; advance i while that exceeds k. The answer is the maximum j − i + 1, O(n) overall.' } },
    ],
    related: [
      { id: 'longest', ru: 'переменное окно: растёт, пока годится', en: 'a variable window that grows while valid' },
      { id: 'minWindow', ru: 'тоже окно со счётчиками букв', en: 'also a window with letter counters' },
    ],
  },

  minWindow: {
    tricky: [
      { input: { s: 'ABAACBAB', t: 'AAB' },
        ru: 'В t две буквы A. Если превратить t во множество, найдётся «AB» длины 2 — без второй A. Верно — «ABA».',
        en: 't has two As. Turn t into a set and you find “AB” of length 2, missing the second A. The answer is “ABA”.' },
      { input: { s: 'aBc', t: 'AB' },
        ru: 'Регистр важен: «a» не заменяет «A». Сравнение без учёта регистра найдёт «aB», а верный ответ — пустая строка.',
        en: 'Case matters: “a” does not stand in for “A”. A case-insensitive check finds “aB”; the right answer is the empty string.' },
      { input: { s: 'A', t: 'AA' },
        ru: 't длиннее s — покрыть нельзя. Ответ — пустая строка, а не «A».',
        en: 't is longer than s, so it cannot be covered. The answer is the empty string, not “A”.' },
    ],
    ops: {
      unit: { ru: 'шагов указателей', en: 'pointer steps' },
      naive: { ru: 'от каждого начала', en: 'from every start', count: p => {
        const s = [...p.s], need = {};
        for (const ch of p.t) need[ch] = (need[ch] || 0) + 1;
        const kinds = Object.keys(need).length;
        let c = 0;
        for (let i = 0; i < s.length; i++) {
          const have = {};
          let formed = 0;
          for (let j = i; j < s.length; j++) {
            c++;
            have[s[j]] = (have[s[j]] || 0) + 1;
            if (have[s[j]] === need[s[j]]) formed++;
            if (formed === kinds) break;
          }
        }
        return c;
      } },
      ours: { ru: 'скользящее окно', en: 'sliding window', count: p => {
        const s = [...p.s], need = {}, have = {};
        for (const ch of p.t) need[ch] = (need[ch] || 0) + 1;
        const kinds = Object.keys(need).length;
        let l = 0, formed = 0, c = 0;
        for (let r = 0; r < s.length; r++) {
          have[s[r]] = (have[s[r]] || 0) + 1;
          if (have[s[r]] === need[s[r]]) formed++;
          c++;
          while (formed === kinds) {
            const out = s[l];
            have[out]--;
            if (need[out] && have[out] < need[out]) formed--;
            l++;
            c++;
          }
        }
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Окно покрывает t? Сжимаем или расширяем?', en: 'Does the window cover t? Shrink or grow?' },
        keys: { 'mwin.ev.grow': { ru: 'расширяем — r вправо', en: 'grow: r moves right' },
                'mwin.ev.shrink': { ru: 'сжимаем — l вправо', en: 'shrink: l moves right' } } },
    ],
    followups: [
      { ru: { q: 'Буквы t должны идти в окне по порядку (#727)?', a: 'Это уже подпоследовательность: идём вперёд, пока не соберём t по порядку, потом от этой точки назад ищем самое правое начало. Повторяем со следующей позиции — O(|s| · |t|).' },
        en: { q: 'The letters of t must appear in order (#727)?', a: 'Now it is a subsequence: scan forward until t is matched in order, then walk back from there to find the rightmost start. Repeat from the next position — O(|s| · |t|).' } },
      { ru: { q: 's огромная, а t из пары букв?', a: 'Сначала выпиши позиции s, где стоят буквы из t, и гоняй окно только по ним. Счётчики — <code>int[128]</code> вместо Dictionary: без хеширования и аллокаций.' },
        en: { q: 's is huge and t has just a couple of letters?', a: 'First list the positions in s holding letters of t and slide the window over those only. Use <code>int[128]</code> counters instead of a Dictionary: no hashing, no allocations.' } },
    ],
    related: [
      { id: 'anagram', ru: 'те же счётчики букв как ключ', en: 'the same letter counts used as a key' },
      { id: 'minLen', ru: 'тоже минимальное окно: сжимай, пока годится', en: 'also a minimal window: shrink while valid' },
    ],
  },

  slidingMax: {
    tricky: [
      { input: { nums: '9, 7, 5, 3, 1', k: '2' },
        ru: 'Числа убывают, и максимум каждый раз выпадает слева. Не выкинешь его из начала деки — получишь [9, 9, 9, 9]. Верно — [9, 7, 5, 3].',
        en: 'Values decrease, so the maximum drops out on the left every time. Forget to remove it from the deque front and you get [9, 9, 9, 9]. The answer is [9, 7, 5, 3].' },
      { input: { nums: '2, 8, 1', k: '3' },
        ru: 'k = n: окно одно, и ответ появляется только после последнего числа. Ответ — [8].',
        en: 'k = n: there is a single window, and the answer appears only after the last number. The answer is [8].' },
    ],
    ops: {
      unit: { ru: 'сравнений', en: 'comparisons' },
      naive: { ru: 'максимум каждого окна заново', en: 'rescan every window', count: p => (p.nums.length - p.k + 1) * (p.k - 1) },
      ours: { ru: 'монотонная дека', en: 'monotonic deque', count: p => {
        const dq = [];
        let c = 0;
        for (let i = 0; i < p.nums.length; i++) {
          while (dq.length && dq[0] <= i - p.k) dq.shift();
          while (dq.length) {
            c++;
            if (p.nums[dq.at(-1)] <= p.nums[i]) dq.pop(); else break;
          }
          dq.push(i);
        }
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Новое число: вытолкнет конец деки или сразу ляжет в конец?', en: 'New number: does it pop the deque’s back, or go straight to the back?' },
        keys: { 'swm.ev.pop': { ru: 'выталкивает — конец не больше нового', en: 'pops: the back is not greater than it' },
                'swm.ev.push': { ru: 'сразу в конец', en: 'straight to the back' } } },
    ],
    followups: [
      { ru: { q: 'Нужен минимум окна, а не максимум?', a: 'Та же дека, но значения в ней возрастают: новое число выталкивает с конца всех, кто больше или равен ему.' },
        en: { q: 'You need the window minimum instead?', a: 'The same deque with increasing values: a new number pops from the back everything greater than or equal to it.' } },
      { ru: { q: 'Самый длинный подмассив, где max − min ≤ limit (#1438)?', a: 'Две деки — на максимум и на минимум — и окно переменной длины: сдвигай l, пока <code>max − min &gt; limit</code>, выкидывая из начала дек ушедшие индексы. O(n).' },
        en: { q: 'The longest subarray where max − min ≤ limit (#1438)?', a: 'Two deques, for the max and the min, plus a variable window: advance l while <code>max − min &gt; limit</code>, dropping departed indices from the deque fronts. O(n).' } },
      { ru: { q: 'Окно по времени, а не по числу элементов?', a: 'Кладите в деку пары (время, значение) и выкидывайте из начала всё старше now − T. Так считают, например, пик пинга за последние 5 секунд.' },
        en: { q: 'The window is defined by time, not by count?', a: 'Store (time, value) pairs in the deque and drop from the front everything older than now − T. That is how you track, say, peak ping over the last 5 seconds.' } },
    ],
    related: [
      { id: 'histogram', ru: 'монотонная структура выталкивает тех, кто уже не победит', en: 'a monotonic structure pops whoever can no longer win' },
      { id: 'maxAvg', ru: 'то же окно k, где хватает бегущей суммы', en: 'the same window of k, where a running sum suffices' },
    ],
  },
};
