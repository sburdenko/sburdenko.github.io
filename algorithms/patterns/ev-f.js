/** Step texts for the chapter 15 rigs: bit manipulation. */
const list = a => a.join(', ');
/** Russian plural: 1 шаг, 2 шага, 5 шагов. */
const ru = (n, one, few, many) => {
  const t = Math.abs(n) % 100, u = t % 10;
  return `${n} ${t > 10 && t < 20 ? many : u === 1 ? one : u > 1 && u < 5 ? few : many}`;
};

export const EV_F = {
  /* Number of 1 Bits */
  'pop.ev.start': {
    en: n => `n = ${n}. Kernighan’s trick: n & (n − 1) clears exactly one 1 — the lowest — so the loop turns once per 1 bit, not 32 times.`,
    ru: n => `n = ${n}. Приём Кернигана: n & (n − 1) снимает ровно одну единицу — самую младшую, поэтому цикл делает по шагу на каждую единицу, а не 32 шага.`,
  },
  'pop.ev.zero': {
    en: () => 'n = 0 has no 1 bits: the loop does not run even once. Answer <b>0</b> — and 0 is not a power of two.',
    ru: () => 'В n = 0 единиц нет: цикл не выполнится ни разу. Ответ <b>0</b> — и 0 не степень двойки.',
  },
  'pop.ev.minus': {
    en: (step, tz) => `Step ${step}: n − 1. Subtracting 1 borrows from the lowest 1 (bit ${tz}): it becomes 0, ${tz ? `the ${tz} zero(s) below it become 1s` : 'there are no zeros below it'}; every bit above stays as it was.`,
    ru: (step, tz) => `Шаг ${step}: n − 1. Вычитание занимает у младшей единицы (бит ${tz}): она становится 0, ${tz ? `нули под ней (${tz}) — единицами` : 'нулей под ней нет'}; все биты выше остаются как были.`,
  },
  'pop.ev.and': {
    en: (count, tz, and) => `n & (n − 1): above bit ${tz} the two rows agree, from bit ${tz} down they are opposite — so only the lowest 1 disappears. count = <b>${count}</b>${and ? `, n = ${and}` : ', and n = 0: the loop ends'}.`,
    ru: (count, tz, and) => `n & (n − 1): выше бита ${tz} строки совпадают, начиная с него и ниже — противоположны, поэтому исчезает только младшая единица. count = <b>${count}</b>${and ? `, n = ${and}` : ', а n = 0 — цикл закончен'}.`,
  },
  'pop.ev.done': {
    en: (count, n) => `n = 0 after <b>${count}</b> steps: ${n} has ${count} one bits. More than one step, so it is not a power of two — the very first n & (n − 1) != 0 already told that.`,
    ru: (count, n) => `n = 0 через <b>${ru(count, 'шаг', 'шага', 'шагов')}</b>: в числе ${n} — ${ru(count, 'единица', 'единицы', 'единиц')}. Шагов больше одного, значит, это не степень двойки — это видно уже по первому n & (n − 1) != 0.`,
  },
  'pop.ev.pow2': {
    en: (count, n, hi) => `One step and n = 0: ${n} has exactly <b>1</b> one bit, so it is a power of two, 2^${hi}. That is Power of Two (#231): n > 0 && (n & (n − 1)) == 0.`,
    ru: (count, n, hi) => `Один шаг — и n = 0: в ${n} ровно <b>1</b> единица, значит, это степень двойки, 2^${hi}. Это и есть Power of Two (#231): n > 0 && (n & (n − 1)) == 0.`,
  },

  /* Missing Number */
  'mis.ev.start': {
    en: n => `${n} numbers from 0..${n}, one is missing. x starts as n = ${n}: index ${n} has no slot, so it goes in up front. Now every number should arrive twice — as an index and as a value — except the missing one.`,
    ru: n => `${ru(n, 'число', 'числа', 'чисел')} из 0..${n}, одного не хватает. x начинается с n = ${n}: у индекса ${n} нет ячейки, поэтому его кладём сразу. Теперь каждое число должно прийти дважды — как индекс и как значение, — кроме пропавшего.`,
  },
  'mis.ev.self': {
    en: (i, v, before, x) => `i = ${i}, nums[${i}] = ${v}: the same number twice in one step — i ^ nums[i] = 0, x stays ${x}.`,
    ru: (i, v, before, x) => `i = ${i}, nums[${i}] = ${v}: одно и то же число дважды за один шаг — i ^ nums[i] = 0, x остаётся ${x}.`,
  },
  'mis.ev.meet': {
    en: (i, v, before, x, met) => `i = ${i}, nums[${i}] = ${v}: x ^= ${i} ^ ${v} → ${x}. ${met.join(' and ')} arrived for the second time and ${met.length > 1 ? 'both cancelled' : 'cancelled'} out (a ^ a = 0).`,
    ru: (i, v, before, x, met) => `i = ${i}, nums[${i}] = ${v}: x ^= ${i} ^ ${v} → ${x}. ${met.length > 1 ? `${met.join(' и ')} пришли второй раз и сократились` : `${met[0]} пришло второй раз и сократилось`} (a ^ a = 0).`,
  },
  'mis.ev.wait': {
    en: (i, v, before, x) => `i = ${i}, nums[${i}] = ${v}: x ^= ${i} ^ ${v} → ${x}. Both arrive for the first time and wait for their pair inside x.`,
    ru: (i, v, before, x) => `i = ${i}, nums[${i}] = ${v}: x ^= ${i} ^ ${v} → ${x}. Оба приходят впервые и ждут пару внутри x.`,
  },
  'mis.ev.done': {
    en: x => `Every present number met its pair and cancelled out. What is left in x never got one: the missing number is <b>${x}</b>.`,
    ru: x => `Каждое число, которое есть, встретило пару и сократилось. В x осталось то, у которого пары не было: пропущено число <b>${x}</b>.`,
  },

  /* Single Number III */
  'sn3.ev.start': {
    en: len => `Pass 1: XOR all ${len} numbers. Each pair cancels itself, so x ends up as a ^ b — the two singles mixed together.`,
    ru: len => `Проход 1: XOR всех чисел (${len}). Каждая пара сокращается, и в x остаётся a ^ b — оба одиночных числа вперемешку.`,
  },
  'sn3.ev.fold': {
    en: (v, x, i) => `nums[${i}] = ${v} comes in for the first time: x = ${x}.`,
    ru: (v, x, i) => `nums[${i}] = ${v} приходит впервые: x = ${x}.`,
  },
  'sn3.ev.cancel': {
    en: (v, x) => `${v} comes in for the second time and cancels its first copy: x = ${x}.`,
    ru: (v, x) => `${v} приходит второй раз и гасит первую копию: x = ${x}.`,
  },
  'sn3.ev.neg': {
    en: (x, notx, neg) => `x = a ^ b = ${x}. It is not 0, since a ≠ b: its 1s are the bits where a and b differ. To pick one, take −x = ~x + 1 = ${neg}: the +1 runs through the trailing 1s of ~x and stops at its lowest 0 — exactly where x has its lowest 1.`,
    ru: (x, notx, neg) => `x = a ^ b = ${x}. Это не 0, ведь a ≠ b: единицы x — биты, в которых a и b различаются. Чтобы выбрать один, берём −x = ~x + 1 = ${neg}: +1 проходит по младшим единицам ~x и останавливается на его младшем нуле — ровно там, где у x младшая единица.`,
  },
  'sn3.ev.low': {
    en: (x, neg, low, bit) => `x & −x = ${low}: above that bit −x is ~x, so the rows cancel; below it both are 0. Only bit ${bit} survives — a and b differ in it. Pass 2 splits the numbers by this bit.`,
    ru: (x, neg, low, bit) => `x & −x = ${low}: выше этого бита −x — это ~x, и строки гасят друг друга; ниже оба равны 0. Остаётся только бит ${bit} — в нём a и b различаются. Проход 2 делит числа по этому биту.`,
  },
  'sn3.ev.one': {
    en: (v, bit, a) => `${v} has bit ${bit} set → group a: a ^= ${v}, a = ${a}.`,
    ru: (v, bit, a) => `У ${v} бит ${bit} равен 1 → группа a: a ^= ${v}, a = ${a}.`,
  },
  'sn3.ev.zero': {
    en: (v, bit, b) => `${v} has bit ${bit} clear → group b: b ^= ${v}, b = ${b}.`,
    ru: (v, bit, b) => `У ${v} бит ${bit} равен 0 → группа b: b ^= ${v}, b = ${b}.`,
  },
  'sn3.ev.done': {
    en: (p0, p1, bit) => `Both copies of a pair land in the same group and cancel there; the two singles were split by bit ${bit}. Answer <b>[${p0}, ${p1}]</b>.`,
    ru: (p0, p1, bit) => `Обе копии каждой пары попали в одну группу и там сократились, а одиночные числа бит ${bit} развёл по разным. Ответ <b>[${p0}, ${p1}]</b>.`,
  },

  /* Counting Bits */
  'cb.ev.start': {
    en: n => `bits[0] = 0. For each i up to ${n}: i >> 1 drops the last bit and is smaller than i, so its answer is already in the table.`,
    ru: n => `bits[0] = 0. Для каждого i до ${n}: i >> 1 отбрасывает последний бит и меньше i, значит, его ответ уже есть в таблице.`,
  },
  'cb.ev.even': {
    en: (i, src, bsrc, low, bi) => `i = ${i} is even: its last bit is 0, so i >> 1 = ${src} has the same 1s. bits[${i}] = bits[${src}] + 0 = <b>${bi}</b>.`,
    ru: (i, src, bsrc, low, bi) => `i = ${i} чётное: последний бит 0, и у i >> 1 = ${src} те же единицы. bits[${i}] = bits[${src}] + 0 = <b>${bi}</b>.`,
  },
  'cb.ev.odd': {
    en: (i, src, bsrc, low, bi) => `i = ${i} is odd: the shift drops a 1. bits[${i}] = bits[${src}] + 1 = ${bsrc} + 1 = <b>${bi}</b>.`,
    ru: (i, src, bsrc, low, bi) => `i = ${i} нечётное: сдвиг отбрасывает единицу. bits[${i}] = bits[${src}] + 1 = ${bsrc} + 1 = <b>${bi}</b>.`,
  },
  'cb.ev.pow': {
    en: (i, src) => `i = ${i} is a power of two: a new highest bit, and it is the only 1. bits[${i}] = bits[${src}] = <b>1</b>. From here up to ${2 * i - 1}, the table so far repeats with one more 1.`,
    ru: (i, src) => `i = ${i} — степень двойки: новый старший бит, и это единственная единица. bits[${i}] = bits[${src}] = <b>1</b>. Отсюда и до ${2 * i - 1} таблица повторяется с одной лишней единицей.`,
  },
  'cb.ev.done': {
    en: (n, bits) => `The table is full: [${list(bits)}]. One addition per number — O(n), no popcount at all.`,
    ru: (n, bits) => `Таблица заполнена: [${list(bits)}]. По одному сложению на число — O(n), и никакого popcount.`,
  },

  /* Sum of Two Integers */
  'sum.ev.start': {
    en: (a, b) => `a = ${a}, b = ${b}. No + allowed, so add column by column: a ^ b is the sum without carries, (a & b) << 1 is the carries, moved one column left.`,
    ru: (a, b) => `a = ${a}, b = ${b}. Плюс нельзя — складываем по столбцам: a ^ b — сумма без переносов, (a & b) << 1 — сами переносы, сдвинутые на столбец влево.`,
  },
  'sum.ev.carry': {
    en: (round, a, b, s, carry) => `Round ${round}: a ^ b = ${s} — every column added, carries ignored. Where both are 1, a carry goes left: (a & b) << 1 = ${carry}. It still has to be added: a = ${s}, b = ${carry}.`,
    ru: (round, a, b, s, carry) => `Раунд ${round}: a ^ b = ${s} — все столбцы сложены, переносы пока не учтены. Где обе единицы, перенос уходит влево: (a & b) << 1 = ${carry}. Его ещё нужно прибавить: a = ${s}, b = ${carry}.`,
  },
  'sum.ev.nocarry': {
    en: (round, a, b, s) => `Round ${round}: a & b = 0 — no column has two 1s, nothing to carry. So a ^ b = <b>${s}</b> already is the sum.`,
    ru: (round, a, b, s) => `Раунд ${round}: a & b = 0 — ни в одном столбце нет двух единиц, переносить нечего. Значит, a ^ b = <b>${s}</b> — это уже сумма.`,
  },
  'sum.ev.drop': {
    en: (round, a, b, s, carry) => `Round ${round}: a ^ b = ${s}, carries (a & b) << 1 = ${carry} — and the carry out of bit 31 falls off the register. Not a bug: in two’s complement this is exactly how a negative and a positive number add up.`,
    ru: (round, a, b, s, carry) => `Раунд ${round}: a ^ b = ${s}, переносы (a & b) << 1 = ${carry} — а перенос из бита 31 выпадает за край регистра. Это не ошибка: в дополнительном коде именно так и складываются отрицательное и положительное число.`,
  },
  'sum.ev.done': {
    en: (sum, a0, b0, rounds) => `b = 0: no carries left after ${rounds} round(s). ${a0} + ${b0} = <b>${sum}</b> without a single +.`,
    ru: (sum, a0, b0, rounds) => `b = 0: переносов не осталось, понадобилось ${ru(rounds, 'раунд', 'раунда', 'раундов')}. ${a0} + ${b0} = <b>${sum}</b> — ни одного плюса.`,
  },

  /* Maximum XOR With an Element From Array */
  'mxl.ev.sort': {
    en: (sorted, ms) => `Offline: sort nums → [${list(sorted)}] and take the queries by growing m: ${list(ms)}. Before each query the numbers ≤ m join the prefix sets; nothing is ever removed.`,
    ru: (sorted, ms) => `Офлайн: сортируем nums → [${list(sorted)}] и берём запросы по возрастанию m: ${list(ms)}. Перед каждым запросом числа ≤ m добавляются в множества префиксов; удалять ничего не придётся.`,
  },
  'mxl.ev.empty': {
    en: (x, m, min) => `Query ${x}:${m}: the smallest number is ${min} > ${m} — nothing may pair with x. Answer <b>−1</b>.`,
    ru: (x, m, min) => `Запрос ${x}:${m}: даже самое маленькое число ${min} > ${m} — x не с чем сочетать. Ответ <b>−1</b>.`,
  },
  'mxl.ev.insert': {
    en: (x, m, added, p) => `Query ${x}:${m}: insert ${list(added)} (≤ ${m}). Each number adds its prefix v >> k on every level — a binary trie, stored level by level. ${p} number(s) in the set.`,
    ru: (x, m, added, p) => `Запрос ${x}:${m}: добавляем ${list(added)} (≤ ${m}). Каждое число кладёт свой префикс v >> k на каждый уровень — это двоичный бор, записанный по уровням. Чисел в множестве: ${p}.`,
  },
  'mxl.ev.keep': {
    en: (x, m, added, p) => `Query ${x}:${m}: no new number ≤ ${m} — the same ${p} number(s) as for the previous query.`,
    ru: (x, m, added, p) => `Запрос ${x}:${m}: новых чисел ≤ ${m} нет — те же числа (${p}), что и для прошлого запроса.`,
  },
  'mxl.ev.take': {
    en: (k, xb, want, cand) => `Bit ${k}: x has ${xb}, so y wants ${want}. Prefix ${cand} exists — some number continues this way. Take it: bit ${k} of x ^ y is <b>1</b>, worth more than all lower bits together.`,
    ru: (k, xb, want, cand) => `Бит ${k}: у x здесь ${xb}, значит, y нужен ${want}. Префикс ${cand} есть — какое-то число идёт дальше этим путём. Берём: бит ${k} в x ^ y — <b>1</b>, и он дороже всех младших битов вместе.`,
  },
  'mxl.ev.same': {
    en: (k, xb, want, cand) => `Bit ${k}: x has ${xb}, y wants ${want}, but no number has prefix ${cand}. y has to go on with ${xb}: bit ${k} of x ^ y is 0.`,
    ru: (k, xb, want, cand) => `Бит ${k}: у x здесь ${xb}, y нужен ${want}, но префикса ${cand} нет ни у одного числа. y приходится идти с ${xb}: бит ${k} в x ^ y — 0.`,
  },
  'mxl.ev.answer': {
    en: (x, m, y, ans) => `Every bit is decided: y = ${y} ≤ ${m}, and ${x} ^ ${y} = <b>${ans}</b> is the best this query can get.`,
    ru: (x, m, y, ans) => `Все биты решены: y = ${y} ≤ ${m}, и ${x} ^ ${y} = <b>${ans}</b> — лучшее для этого запроса.`,
  },
  'mxl.ev.done': {
    en: answers => `All queries are answered, back in input order: <b>[${list(answers)}]</b>.`,
    ru: answers => `Ответы на все запросы, в исходном порядке: <b>[${list(answers)}]</b>.`,
  },
};
