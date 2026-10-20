/** Step texts for the rigs in rigs-arr.js: Kadane, Insert Interval, Sort Colors, LIS tails, Unique Paths, loop order, Meeting Rooms II. */
const list = a => `[${a.join(', ')}]`;
const ivs = a => (a.length ? a.map(([x, y]) => `[${x}, ${y}]`).join(' ') : '—');
const neg = v => String(v).replace('-', '−');
/** Второе слагаемое: отрицательное — в скобках, «2 + (−5)», а не «2 + −5». */
const term = v => (v < 0 ? `(${neg(v)})` : neg(v));
/** Russian plural: 1 комната, 2 комнаты, 5 комнат. */
const ruN = (n, one, few, many) => {
  const t = Math.abs(n) % 100, u = t % 10;
  return `${n} ${t > 10 && t < 20 ? many : u === 1 ? one : u >= 2 && u <= 4 ? few : many}`;
};
const enN = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

export const EV_ARR = {
  /* ---------- Maximum Subarray: Kadane ---------- */
  'kad.ev.start': {
    en: x => `cur — the best sum of a subarray that <b>ends here</b>, best — the best sum seen so far. Both start at nums[0] = ${neg(x)}, not at 0: the subarray must not be empty.`,
    ru: x => `cur — лучшая сумма подмассива, который <b>заканчивается здесь</b>, best — лучшая сумма на сейчас. Обе начинаются с nums[0] = ${neg(x)}, а не с 0: пустой подмассив не считается.`,
  },
  'kad.ev.extend': {
    en: (i, x, old, cur, from) => `i = ${i}, x = ${neg(x)}: continue — cur + x = ${neg(old)} + ${term(x)} = <b>${neg(cur)}</b> is not worse than x alone${old === 0 ? ' (cur was 0: continuing or starting over give the same sum, the code continues)' : ', because cur ≥ 0'}. The run is [${from}..${i}].`,
    ru: (i, x, old, cur, from) => `i = ${i}, x = ${neg(x)}: продолжаем — cur + x = ${neg(old)} + ${term(x)} = <b>${neg(cur)}</b> не хуже, чем x в одиночку${old === 0 ? ' (cur был 0: продолжить или начать заново — сумма одна и та же, код продолжает)' : ', потому что cur ≥ 0'}. Отрезок — [${from}..${i}].`,
  },
  'kad.ev.restart': {
    en: (i, x, old, sum) => `i = ${i}, x = ${neg(x)}: cur + x = ${neg(old)} + ${term(x)} = ${neg(sum)} < x. A negative cur only drags x down — <b>start over</b> at i: cur = ${neg(x)}, the run is [${i}..${i}].`,
    ru: (i, x, old, sum) => `i = ${i}, x = ${neg(x)}: cur + x = ${neg(old)} + ${term(x)} = ${neg(sum)} < x. Отрицательный cur только тянет x вниз — <b>начинаем заново</b> с i: cur = ${neg(x)}, отрезок — [${i}..${i}].`,
  },
  'kad.ev.best': {
    en: (i, was, best, from) => `cur = ${neg(best)} beats best = ${neg(was)}: best = <b>${neg(best)}</b>, the subarray [${from}..${i}].`,
    ru: (i, was, best, from) => `cur = ${neg(best)} больше best = ${neg(was)}: best = <b>${neg(best)}</b>, подмассив [${from}..${i}].`,
  },
  'kad.ev.done': {
    en: (best, from, to) => `Answer: <b>${neg(best)}</b>, the subarray [${from}..${to}]. One pass and two numbers: cur is the whole DP row dp[i] = max(x, dp[i − 1] + x), kept in one cell.`,
    ru: (best, from, to) => `Ответ: <b>${neg(best)}</b>, подмассив [${from}..${to}]. Один проход и два числа: cur — это вся строка DP dp[i] = max(x, dp[i − 1] + x), сжатая в одну ячейку.`,
  },
  'kad.ev.allNeg': {
    en: (best, from) => `Every number is negative, so every step started over and the answer is the largest single element: <b>${neg(best)}</b> at ${from}. Had cur and best started at 0, the answer would be 0 — the empty subarray, which is not allowed.`,
    ru: (best, from) => `Все числа отрицательные, поэтому каждый шаг начинал заново, а ответ — самый большой элемент: <b>${neg(best)}</b> на позиции ${from}. Если бы cur и best начинались с 0, вышел бы 0 — пустой подмассив, а он не разрешён.`,
  },

  /* ---------- Insert Interval ---------- */
  'ins.ev.start': {
    en: (s, e, n) => `${enN(n, 'interval')}, sorted and disjoint; insert [${s}, ${e}]. No re-sort: three phases left to right — copy what ends before s, absorb what overlaps [s, e], copy the rest.`,
    ru: (s, e, n) => `Интервалов: ${n}, они отсортированы и не пересекаются; вставляем [${s}, ${e}]. Без пересортировки: три фазы слева направо — копируем то, что кончается до s, поглощаем то, что задевает [s, e], копируем остальное.`,
  },
  'ins.ev.left': {
    en: (i, a, b, s) => `[${a}, ${b}]: it ends at ${b} < s = ${s} — entirely to the left. Copy it to res as is.`,
    ru: (i, a, b, s) => `[${a}, ${b}]: кончается в ${b} < s = ${s} — целиком левее. Копируем в res как есть.`,
  },
  'ins.ev.absorb': {
    en: (i, a, b, s0, e0, s, e) => `[${a}, ${b}]: it starts at ${a} ≤ e = ${e0} — it overlaps the new interval. Absorb it: s = min(${s0}, ${a}) = ${s}, e = max(${e0}, ${b}) = ${e}${s === s0 && e === e0 ? ' — it lies inside, nothing grows' : ''}.`,
    ru: (i, a, b, s0, e0, s, e) => `[${a}, ${b}]: начинается в ${a} ≤ e = ${e0} — задевает новый интервал. Поглощаем: s = min(${s0}, ${a}) = ${s}, e = max(${e0}, ${b}) = ${e}${s === s0 && e === e0 ? ' — он лежит внутри, ничего не растёт' : ''}.`,
  },
  'ins.ev.touch': {
    en: (i, a, b, s0, e0, s, e) => `[${a}, ${b}] only touches [${s0}, ${e0}]: ${a === e0 ? `its start ${a} equals e` : `its end ${b} equals s`}. The condition is ≤, not <, so a shared point still merges: [${s}, ${e}].`,
    ru: (i, a, b, s0, e0, s, e) => `[${a}, ${b}] только касается [${s0}, ${e0}]: ${a === e0 ? `его начало ${a} равно e` : `его конец ${b} равен s`}. В условии ≤, а не <, поэтому общая точка тоже сливает: [${s}, ${e}].`,
  },
  'ins.ev.place': {
    en: (s, e, absorbed, n0, n1) => `${absorbed ? `${enN(absorbed, 'interval')} absorbed, [${n0}, ${n1}] grew into` : 'Nothing overlaps, so the new interval goes in as it is:'} <b>[${s}, ${e}]</b>. It goes into res right here — everything before it is already there and ends before ${s}.`,
    ru: (s, e, absorbed, n0, n1) => `${absorbed ? `Поглощено интервалов: ${absorbed}, [${n0}, ${n1}] вырос в` : 'Ничего не задето, новый интервал встаёт как есть:'} <b>[${s}, ${e}]</b>. Кладём его в res прямо сейчас — всё, что до него, уже там и кончается раньше ${s}.`,
  },
  'ins.ev.right': {
    en: (i, a, b, e) => `[${a}, ${b}]: it starts at ${a} > e = ${e} — to the right. Copy it; all the rest is to the right too, since the input is sorted.`,
    ru: (i, a, b, e) => `[${a}, ${b}]: начинается в ${a} > e = ${e} — правее. Копируем; дальше всё тоже правее, вход ведь отсортирован.`,
  },
  'ins.ev.done': {
    en: res => `Result: <b>${ivs(res)}</b>. One pass, O(n), still sorted and disjoint — no sort needed.`,
    ru: res => `Итог: <b>${ivs(res)}</b>. Один проход, O(n), результат по-прежнему отсортирован и без пересечений — сортировка не нужна.`,
  },

  /* ---------- Sort Colors ---------- */
  'sc.ev.start': {
    en: n => `${enN(n, 'number')} of 0, 1 and 2 to sort in one pass. Four zones: [0, lo) zeros, [lo, mid) ones, [mid, hi] not looked at yet, (hi, end) twos. At the start everything is “?”.`,
    ru: n => `Чисел 0, 1 и 2: ${n}, сортируем за один проход. Четыре зоны: [0, lo) нули, [lo, mid) единицы, [mid, hi] ещё не смотрели, (hi, конец) двойки. В начале всё — «?».`,
  },
  'sc.ev.zero': {
    en: (m, l, self) => `nums[${m}] = 0 → ${self ? `lo = mid = ${m}, so the swap is with itself` : `swap with nums[${l}], which is a 1 (everything in [lo, mid) is 1)`}. The 0 joins the zeros; lo and mid both step right.`,
    ru: (m, l, self) => `nums[${m}] = 0 → ${self ? `lo = mid = ${m}, обмен с самим собой` : `меняем с nums[${l}] — там единица (в [lo, mid) только единицы)`}. Ноль встаёт к нулям; lo и mid оба шагают вправо.`,
  },
  'sc.ev.one': {
    en: m => `nums[${m}] = 1 — it is already in place: the ones zone just grows, mid steps right.`,
    ru: m => `nums[${m}] = 1 — уже на месте: зона единиц просто растёт, mid шагает вправо.`,
  },
  'sc.ev.two': {
    en: (m, h, came, self) => (self
      ? `nums[${m}] = 2 and mid = hi = ${m}: the swap is with itself. hi steps left; mid stays, and now mid > hi.`
      : `nums[${m}] = 2 → swap with nums[${h}]: the 2 goes to the twos, hi steps left. <b>mid stays</b>: the ${came} that came from hi has not been looked at yet.`),
    ru: (m, h, came, self) => (self
      ? `nums[${m}] = 2 и mid = hi = ${m}: обмен с самим собой. hi шагает влево; mid стоит, и теперь mid > hi.`
      : `nums[${m}] = 2 → меняем с nums[${h}]: двойка уходит к двойкам, hi шагает влево. <b>mid стоит на месте</b>: ${came}, пришедшую от hi, ещё не проверяли.`),
  },
  'sc.ev.done': {
    en: (a, looks) => `mid > hi — the “?” zone is empty. Sorted: <b>${list(a)}</b>, in one pass: ${enN(looks, 'look')} at nums[mid], at most n, no counting pass.`,
    ru: (a, looks) => `mid > hi — зона «?» пуста. Отсортировано: <b>${list(a)}</b> за один проход: nums[mid] смотрели ${ruN(looks, 'раз', 'раза', 'раз')}, не больше n, без отдельного подсчёта.`,
  },

  /* ---------- LIS: tails and lower_bound ---------- */
  'lt.ev.start': {
    en: n => `tails[k] — the smallest value an increasing subsequence of length k + 1 can end with. tails is always sorted, so for each of the ${n} numbers a binary search (lower_bound: the first tail ≥ x) says where x goes.`,
    ru: n => `tails[k] — наименьшее число, которым может заканчиваться возрастающая подпоследовательность длины k + 1. tails всегда отсортирован, поэтому для каждого из ${n} чисел бинарный поиск (lower_bound: первый хвост ≥ x) говорит, куда встаёт x.`,
  },
  'lt.ev.append': {
    en: (i, x, pos, len, prevTail) => `x = ${neg(x)} is bigger than every tail${prevTail === null ? ' (there are none yet)' : ` (the last one is ${neg(prevTail)})`} → <b>append</b>: tails[${pos}] = ${neg(x)}. A subsequence of length ${len} now exists.`,
    ru: (i, x, pos, len, prevTail) => `x = ${neg(x)} больше всех хвостов${prevTail === null ? ' (их пока нет)' : ` (последний — ${neg(prevTail)})`} → <b>дописываем</b>: tails[${pos}] = ${neg(x)}. Теперь есть подпоследовательность длины ${len}.`,
  },
  'lt.ev.replace': {
    en: (i, x, pos, old) => `lower_bound(${neg(x)}) = ${pos}: tails[${pos}] = ${neg(old)} is the first tail ≥ x → <b>replace</b> it with ${neg(x)}. The length ${pos + 1} can now end lower, which leaves more room for what comes later. The length of tails does not change.`,
    ru: (i, x, pos, old) => `lower_bound(${neg(x)}) = ${pos}: tails[${pos}] = ${neg(old)} — первый хвост ≥ x → <b>заменяем</b> его на ${neg(x)}. Длина ${pos + 1} теперь может кончаться ниже, и следующим числам проще её продолжить. Длина tails не меняется.`,
  },
  'lt.ev.equal': {
    en: (i, x, pos) => `lower_bound(${neg(x)}) = ${pos}: tails[${pos}] is already ${neg(x)}. An equal number cannot extend a strictly increasing run — that is why the search is lower_bound (≥), not upper_bound (>): nothing changes.`,
    ru: (i, x, pos) => `lower_bound(${neg(x)}) = ${pos}: tails[${pos}] уже равен ${neg(x)}. Равное число не продолжает строго возрастающую цепочку — поэтому ищем lower_bound (≥), а не upper_bound (>): ничего не меняется.`,
  },
  'lt.ev.done': {
    en: (len, tails, lis, isSeq) => `Answer: <b>${len}</b> — the length of tails. ${isSeq ? `Here tails ${list(tails)} happens to be a subsequence, but that is luck, not a rule.` : `But tails ${list(tails)} is <b>not</b> a subsequence of nums: its values were written at different moments, out of order.`} One real LIS: ${list(lis)} — rebuilding it needs a parent index per element.`,
    ru: (len, tails, lis, isSeq) => `Ответ: <b>${len}</b> — длина tails. ${isSeq ? `Здесь tails ${list(tails)} случайно оказался подпоследовательностью, но это совпадение, а не правило.` : `Но tails ${list(tails)} — <b>не</b> подпоследовательность nums: его числа записаны в разные моменты и не по порядку.`} Одна настоящая LIS: ${list(lis)} — чтобы её восстановить, нужен индекс родителя у каждого элемента.`,
  },

  /* ---------- Unique Paths ---------- */
  'up.ev.start': {
    en: (m, n, mode) => `A robot goes from the top-left to the bottom-right corner of ${m} × ${n}, only right or down. Paths to a cell = paths to the cell above + paths to the cell on the left. ${mode === 'row' ? 'Mode “row”: one array of n cells instead of the whole table.' : 'Mode “table”: the full m × n table.'}`,
    ru: (m, n, mode) => `Робот идёт из левого верхнего угла ${m} × ${n} в правый нижний, только вправо или вниз. Путей в клетку = путей в клетку сверху + путей в клетку слева. ${mode === 'row' ? 'Режим «row»: один массив из n клеток вместо всей таблицы.' : 'Режим «table»: вся таблица m × n.'}`,
  },
  'up.ev.base': {
    en: () => 'Base: every cell of the first row and of the first column has exactly one path — a straight line.',
    ru: () => 'База: в каждую клетку первой строки и первого столбца ведёт ровно один путь — по прямой.',
  },
  'up.ev.cell': {
    en: (r, c, up, left, v) => `dp[${r}][${c}] = from above ${up} + from the left ${left} = <b>${v}</b>.`,
    ru: (r, c, up, left, v) => `dp[${r}][${c}] = сверху ${up} + слева ${left} = <b>${v}</b>.`,
  },
  'up.ev.rowInit': {
    en: n => `row = [1, …, 1] — the first row of the table (${n} cells). From here on the same array is overwritten row by row.`,
    ru: n => `row = [1, …, 1] — первая строка таблицы (${ruN(n, 'клетка', 'клетки', 'клеток')}). Дальше этот же массив перезаписывается строка за строкой.`,
  },
  'up.ev.rowCell': {
    en: (r, c, old, left, v) => `${c === 1 ? `Row ${r}: row[0] stays 1. ` : ''}row[${c}] += row[${c - 1}]: before the write row[${c}] = ${old} is still the cell <b>above</b>, row[${c - 1}] = ${left} is already the cell on the <b>left</b> → ${v}.`,
    ru: (r, c, old, left, v) => `${c === 1 ? `Строка ${r}: row[0] остаётся 1. ` : ''}row[${c}] += row[${c - 1}]: до записи row[${c}] = ${old} — это ещё клетка <b>сверху</b>, а row[${c - 1}] = ${left} — уже клетка <b>слева</b> → ${v}.`,
  },
  'up.ev.done': {
    en: (m, n, paths, mode, binom) => `Paths: <b>${paths}</b>. ${mode === 'row' ? `Memory: ${enN(n, 'cell')} instead of ${m * n}.` : 'The same numbers fit in one row: row[c] += row[c − 1].'} Check by counting: every path is ${m - 1} downs and ${n - 1} rights in some order, C(${m + n - 2}, ${m - 1}) = ${binom}.`,
    ru: (m, n, paths, mode, binom) => `Путей: <b>${paths}</b>. ${mode === 'row' ? `Памяти: ${ruN(n, 'клетка', 'клетки', 'клеток')} вместо ${m * n}.` : 'Те же числа помещаются в одну строку: row[c] += row[c − 1].'} Проверка комбинаторикой: путь — это ${ruN(m - 1, 'шаг', 'шага', 'шагов')} вниз и ${n - 1} вправо в каком-то порядке, C(${m + n - 2}, ${m - 1}) = ${binom}.`,
  },

  /* ---------- Coin Change II against Combination Sum IV ---------- */
  'co.ev.start': {
    en: (coins, amount, order) => `Coins ${list(coins)}, sum ${amount}. dp[0] = 1 — the empty sum; then dp[s] += dp[s − c]. The table row c shows what coin c added to each dp[s]. ${order === 'coins-outer' ? 'Order coins-outer (#518): coin by coin, so the table fills <b>row by row</b>.' : 'Order sums-outer (#377): sum by sum, so the table fills <b>column by column</b>.'}`,
    ru: (coins, amount, order) => `Монеты ${list(coins)}, сумма ${amount}. dp[0] = 1 — пустая сумма; дальше dp[s] += dp[s − c]. Строка таблицы c — сколько монета c добавила в каждый dp[s]. ${order === 'coins-outer' ? 'Порядок coins-outer (#518): монета за монетой, таблица заполняется <b>по строкам</b>.' : 'Порядок sums-outer (#377): сумма за суммой, таблица заполняется <b>по столбцам</b>.'}`,
  },
  'co.ev.coin': {
    en: (c, k, amount) => `Coin ${c} joins${k ? ', after the coins before it are finished' : ''}. While s goes from ${c} to ${amount}, dp[s − c] counts only sums of the coins taken so far — so ${c} always comes after them, and every combination is built in one order only.`,
    ru: (c, k, amount) => `Подключаем монету ${c}${k ? ' — монеты до неё уже отработали' : ''}. Пока s идёт от ${c} до ${amount}, dp[s − c] считает только суммы из уже взятых монет — значит, ${c} всегда идёт после них, и каждое сочетание собирается в одном-единственном порядке.`,
  },
  'co.ev.sum': {
    en: (s, usable) => `Sum ${s}: try every coin ≤ ${s} (${list(usable)}) as the <b>last</b> part. dp[s − c] is already final and counts every sequence of any coins, so 1+2 and 2+1 both get counted.`,
    ru: (s, usable) => `Сумма ${s}: пробуем каждую монету ≤ ${s} (${list(usable)}) как <b>последнее</b> слагаемое. dp[s − c] уже окончательный и считает все последовательности из любых монет, поэтому 1+2 и 2+1 посчитаются обе.`,
  },
  'co.ev.add': {
    en: (c, s, add, old, now) => `dp[${s}] += dp[${s} − ${c}] = ${add}: ${old} → <b>${now}</b>. Every sum counted in dp[${s - c}] gets +${c} at the end.`,
    ru: (c, s, add, old, now) => `dp[${s}] += dp[${s} − ${c}] = ${add}: ${old} → <b>${now}</b>. Каждая сумма из dp[${s - c}] получает в конце +${c}.`,
  },
  'co.ev.zero': {
    en: (c, s, add, old) => `dp[${s} − ${c}] = dp[${s - c}] = 0 — no sum gives ${s - c} yet, so coin ${c} adds nothing: dp[${s}] stays ${old}.`,
    ru: (c, s, add, old) => `dp[${s} − ${c}] = dp[${s - c}] = 0 — суммы ${s - c} пока не собрать, поэтому монета ${c} ничего не добавляет: dp[${s}] остаётся ${old}.`,
  },
  'co.ev.done': {
    en: (amount, ans, order, other) => (order === 'coins-outer'
      ? `dp[${amount}] = <b>${ans}</b> combinations (#518, Coin Change II): order does not matter. The other loop order gives ${other} — it counts sequences (#377).`
      : `dp[${amount}] = <b>${ans}</b> sequences (#377, Combination Sum IV): 1+2 and 2+1 are different. The other loop order gives ${other} — it counts combinations (#518).`),
    ru: (amount, ans, order, other) => (order === 'coins-outer'
      ? `dp[${amount}] = <b>${ans}</b> — столько сочетаний (#518, Coin Change II): порядок монет не важен. Другой порядок циклов даёт ${other} — он считает последовательности (#377).`
      : `dp[${amount}] = <b>${ans}</b> — столько последовательностей (#377, Combination Sum IV): 1+2 и 2+1 — разные. Другой порядок циклов даёт ${other} — он считает сочетания (#518).`),
  },

  /* ---------- Meeting Rooms II ---------- */
  'mr.ev.start': {
    en: (n, events) => `${enN(n, 'meeting')} → ${events} events: +1 at a start, −1 at an end. Sort them by time; at equal times the <b>end goes first</b>, since a room freed at 4 can host a meeting that starts at 4. The answer is the peak of the counter.`,
    ru: (n, events) => `Встреч: ${n} → событий: ${events}: +1 в начале, −1 в конце. Сортируем по времени; при равном времени <b>конец идёт раньше</b>: комната, освободившаяся в 4, подходит для встречи, которая начинается в 4. Ответ — пик счётчика.`,
  },
  'mr.ev.open': {
    en: (t, k, a, b, rooms, peak, room, reused) => `t = ${t}: [${a}, ${b}) starts → ${enN(rooms, 'meeting')} at once. ${reused ? `It takes the free room R${room}.` : `It takes room R${room}.`} The peak stays ${peak}.`,
    ru: (t, k, a, b, rooms, peak, room, reused) => `t = ${t}: начинается [${a}, ${b}) → одновременно идёт ${ruN(rooms, 'встреча', 'встречи', 'встреч')}. ${reused ? `Она занимает свободную комнату R${room}.` : `Она занимает комнату R${room}.`} Пик остаётся ${peak}.`,
  },
  'mr.ev.peak': {
    en: (t, k, a, b, rooms, peak, room) => `t = ${t}: [${a}, ${b}) starts → ${enN(rooms, 'meeting')} at once, a new <b>peak ${peak}</b>. No room is free: open R${room}.`,
    ru: (t, k, a, b, rooms, peak, room) => `t = ${t}: начинается [${a}, ${b}) → одновременно ${ruN(rooms, 'встреча', 'встречи', 'встреч')}, новый <b>пик ${peak}</b>. Свободных комнат нет: открываем R${room}.`,
  },
  'mr.ev.close': {
    en: (t, k, a, b, rooms, room) => `t = ${t}: [${a}, ${b}) ends → ${enN(rooms, 'meeting')} left, room R${room} is free.`,
    ru: (t, k, a, b, rooms, room) => `t = ${t}: заканчивается [${a}, ${b}) → осталось ${ruN(rooms, 'встреча', 'встречи', 'встреч')}, комната R${room} свободна.`,
  },
  'mr.ev.free': {
    en: (t, k, a, b, rooms, room) => `t = ${t}: [${a}, ${b}) ends, and a meeting starts at the same ${t}. The end goes first: ${enN(rooms, 'meeting')} left, and R${room} is free just in time.`,
    ru: (t, k, a, b, rooms, room) => `t = ${t}: заканчивается [${a}, ${b}), а в тот же момент ${t} начинается другая встреча. Конец идёт первым: осталось ${ruN(rooms, 'встреча', 'встречи', 'встреч')}, и R${room} освобождается как раз вовремя.`,
  },
  'mr.ev.done': {
    en: (peak, wrong) => `Answer: <b>${enN(peak, 'room')}</b> — the peak of the counter, and exactly as many as the reuse above opened. ${wrong > peak ? `With starts sorted before ends at equal times the peak would be ${wrong}: one room too many.` : 'Here the tie order does not change the peak, but in general starts-first overcounts.'}`,
    ru: (peak, wrong) => `Ответ: <b>${ruN(peak, 'комната', 'комнаты', 'комнат')}</b> — пик счётчика, и ровно столько открыло повторное использование комнат выше. ${wrong > peak ? `Если при равном времени ставить начало раньше конца, пик вышел бы ${wrong}: лишняя комната.` : 'Здесь порядок при равенстве на пик не влияет, но в общем случае «начало раньше» даёт лишнее.'}`,
  },
};
