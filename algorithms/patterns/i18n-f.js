/** Tape 06 chapter 15: bit manipulation — a number is 32 switches, and a handful of identities do the work. */
export const CH_F = {
  'bits.short': {
    en: 'Masks, XOR that cancels pairs, the lowest bit, carries — all on one 32-bit register',
    ru: 'Маски, XOR, который гасит пары, младший бит, переносы — всё на одном 32-битном регистре',
  },
  'bits.h2': { en: 'A number is 32 switches', ru: 'Число — это 32 переключателя' },
  'bits.essence': {
    en: 'An int is a row of 32 bits, and &, |, ^, <<, >> work on all of them at once, in one instruction. A handful of identities do most of the work: x & (x − 1) clears the lowest 1, x & −x keeps only it, a ^ a = 0 cancels pairs, and a ^ b with (a & b) << 1 is a sum split into “no carries” and “the carries”. Read a bit problem column by column: every bit is its own small yes/no question.',
    ru: 'int — это ряд из 32 битов, и &, |, ^, <<, >> работают со всеми сразу, одной инструкцией. Почти всю работу делают несколько тождеств: x & (x − 1) снимает младшую единицу, x & −x оставляет только её, a ^ a = 0 гасит пары, а a ^ b вместе с (a & b) << 1 — это сумма, разложенная на «без переносов» и «сами переносы». Задачу на биты читай по столбцам: каждый бит — свой маленький вопрос «да или нет».',
  },
  'bits.signals': {
    en: '<li>“Every element appears twice except…”, “O(1) extra memory” — XOR cancels the pairs</li><li>Flags, or a set of up to 32 (64) small items — one int (long) as a mask</li><li>“Without + and −”, “without * and /” — carries and shifts by hand</li><li>Maximise a XOR — greedy from the high bit: one 1 up there beats all lower bits together</li><li>Unity: LayerMask is exactly this — 1 &lt;&lt; layer, mask &amp; (1 &lt;&lt; go.layer), [Flags] enums</li>',
    ru: '<li>«Каждый элемент встречается дважды, кроме…», «O(1) дополнительной памяти» — XOR гасит пары</li><li>Флаги или множество из 32 (64) маленьких элементов — один int (long) как маска</li><li>«Без + и −», «без * и /» — переносы и сдвиги вручную</li><li>Максимизировать XOR — жадно от старшего бита: одна единица наверху дороже всех младших битов вместе</li><li>Unity: LayerMask — ровно это: 1 &lt;&lt; layer, mask &amp; (1 &lt;&lt; go.layer), перечисления с [Flags]</li>',
  },
  'bits.pitfall': {
    en: '<b>Trap.</b> In C#, >> on an int is arithmetic: −8 >> 1 is −4, the sign bit is copied in. For raw bits, cast to uint first, or use >>> — but that operator only exists since C# 11, and Unity (C# 9) does not have it. And mind the precedence: x & 1 == 0 means x & (1 == 0) and does not compile; write (x & 1) == 0.',
    ru: '<b>Ловушка.</b> В C# >> для int арифметический: −8 >> 1 даёт −4, знаковый бит копируется внутрь. Для «сырых» битов сначала приведи к uint или используй >>>, но этот оператор есть только с C# 11, а в Unity (C# 9) его нет. И следи за приоритетом: x & 1 == 0 значит x & (1 == 0) и не компилируется — пиши (x & 1) == 0.',
  },
  'bits.tpl': {
    en: `bool has = (mask & (1 << i)) != 0;  // test bit i
mask |= 1 << i;                      // set
mask &= ~(1 << i);                   // clear
mask ^= 1 << i;                      // flip
x &= x - 1;              // drop the lowest 1
int low = x & -x;        // keep only the lowest 1
// .NET Core 3.0+:
int ones = BitOperations.PopCount((uint)x);
// Unity: math.countbits(x), Unity.Mathematics
// LayerMask: (mask.value & (1 << go.layer)) != 0`,
    ru: `bool has = (mask & (1 << i)) != 0;  // бит i стоит?
mask |= 1 << i;                      // поставить
mask &= ~(1 << i);                   // снять
mask ^= 1 << i;                      // переключить
x &= x - 1;              // снять младшую единицу
int low = x & -x;        // оставить только её
// .NET Core 3.0+:
int ones = BitOperations.PopCount((uint)x);
// Unity: math.countbits(x), Unity.Mathematics
// LayerMask: (mask.value & (1 << go.layer)) != 0`,
  },
  'bits.p': {
    en: [
      { variant: 'Kernighan: x & (x − 1)', task: 'Return how many 1 bits a 32-bit number has (its Hamming weight).', idea: 'x − 1 turns the lowest 1 into 0 and every 0 below it into 1; the bits above stay. So x & (x − 1) is x without its lowest 1. Repeat until x is 0 and count the turns: the loop runs once per set bit, not 32 times.', why: 'Testing all 32 bits with x & 1 and a shift also works, but loops 32 times on a sparse number — and on an int, >> drags the sign in, so go through uint. The same step answers Power of Two (#231): n > 0 && (n & (n − 1)) == 0 — exactly one 1. Hamming Distance (#461) and Minimum Bit Flips (#2220) are popcount(a ^ b). In production code: BitOperations.PopCount from System.Numerics (.NET Core 3.0+, a single CPU instruction where there is one). Unity’s profile does not have it — use math.countbits from Unity.Mathematics.', cx: 'O(number of 1 bits) ≤ 32 time · O(1) memory' },
      { variant: 'XOR of indices and values', task: 'nums holds n distinct numbers from 0..n. Exactly one of them is missing — return it.', idea: 'Start with x = n and XOR in every index i and every value nums[i]. Each present number comes in twice — as an index and as a value — and cancels itself; order does not matter, XOR is commutative. The missing number comes in only once, and that is what stays in x.', why: 'The sum formula n(n + 1)/2 − Σnums is the other O(1)-memory answer, but the sum can overflow int for a large n (use long, or subtract as you go); XOR cannot overflow. Single Number (#136) is the same cancelling without the indices. Sorting costs O(n log n), a HashSet costs O(n) memory.', cx: 'O(n) time · O(1) memory' },
      { variant: 'Split by the lowest bit x & −x', task: 'Every number appears exactly twice, except two that appear once. Return those two in O(n) time and O(1) memory.', idea: 'XOR of everything leaves x = a ^ b: the pairs cancel. a ≠ b, so x has a 1 somewhere — a bit where a and b differ. Take the lowest one, low = x & −x, and split the numbers by that bit: a and b fall into different groups, and both copies of each pair stay together. XOR inside each group gives a and b.', why: 'In two’s complement −x = ~x + 1: the +1 carries through the trailing zeros of x up to its lowest 1, so x & −x keeps exactly that bit. Any 1 of x would split the array; the lowest is just the cheapest to get. If x is int.MinValue, −x is int.MinValue again and the trick still works — unchecked, the C# default; inside checked it throws. Unlike Single Number (#136), the second unknown needs a second pass.', cx: 'O(n) time · O(1) memory' },
      { variant: 'A table: bits[i >> 1] + (i & 1)', task: 'For every i from 0 to n return the number of 1 bits in i, as an array, in O(n) — without counting every number from scratch.', idea: 'i >> 1 is i without its last bit: the same 1s except perhaps that last one, and a smaller number, so its answer is already in the table. bits[i] = bits[i >> 1] + (i & 1). This is DP: the answer for a number comes from the answer for a smaller one.', why: 'A popcount per number costs O(n · 32). Other recurrences work too: bits[i] = bits[i & (i − 1)] + 1 (Kernighan: one 1 fewer), or bits[i] = bits[i − hi] + 1, where hi is the highest power of two ≤ i — every power of two starts a new block in which the table so far repeats with one more 1. Reverse Bits (#190) is the same shift-by-one bookkeeping: take the low bit of n, push it into the result from the right, 32 times.', cx: 'O(n) time · O(n) memory for the answer' },
      { variant: 'XOR is a sum without carries', task: 'Return a + b without using the operators + and −.', idea: 'In one column 1 + 1 = 10: the column keeps a ^ b, and a carry goes one column left wherever both were 1, which is (a & b) << 1. The carries still have to be added, so repeat with a = a ^ b, b = carry until no carry is left. Every round pushes the lowest carry at least one column left, so there are at most 32 rounds.', why: 'Negative numbers need nothing special: two’s complement addition is the same column arithmetic, and a carry out of bit 31 drops off, as it does in the CPU’s adder. In C# and Java the loop works as is (shifts are never overflow-checked); in Python integers are unbounded and need a 32-bit mask, or −1 + 1 loops forever. Divide Two Integers (#29) uses the same tools: shift the divisor left and subtract.', cx: 'O(32) time · O(1) memory' },
      { variant: 'Greedy from the high bit, queries offline', task: 'For every query [x, m] return the largest x XOR nums[j] over all nums[j] ≤ m, or −1 if no number is ≤ m.', idea: 'Without the limit this is #421: go from the high bit down and take the opposite bit of x whenever some number continues that way — a 1 high up is worth more than all lower bits together. The limit is handled offline: sort nums and the queries by m, and before each query insert the numbers that are now ≤ m. The set only grows, so every number is inserted once.', why: '“Some number continues this way” is a question to a binary trie; here the trie is kept as one HashSet of prefixes v >> k per level, the same trie written level by level (an array-based trie saves the hashing). To answer online, in input order, store the minimum value under each trie node and walk only where it is ≤ m. Maximum XOR of Two Numbers in an Array (#421) is this with m = ∞ and every number as a query.', cx: 'O(n log n + q log q + (n + q) · B) time, B = 30 bits · O(n · B) memory' },
    ],
    ru: [
      { variant: 'Керниган: x & (x − 1)', task: 'Верни, сколько единичных битов в 32-битном числе (его вес Хэмминга).', idea: 'x − 1 превращает младшую единицу в 0, а все нули под ней — в единицы; биты выше не меняются. Значит, x & (x − 1) — это x без младшей единицы. Повторяем, пока x не станет 0, и считаем шаги: цикл делает по шагу на каждую единицу, а не 32.', why: 'Можно проверить все 32 бита через x & 1 и сдвиг, но на редких единицах это 32 шага, а у int сдвиг >> тащит знак — иди через uint. Тот же шаг отвечает на Power of Two (#231): n > 0 && (n & (n − 1)) == 0 — ровно одна единица. Hamming Distance (#461) и Minimum Bit Flips (#2220) — это popcount(a ^ b). В рабочем коде — BitOperations.PopCount из System.Numerics (.NET Core 3.0+, одна инструкция процессора, если она есть). В профиле Unity его нет — бери math.countbits из Unity.Mathematics.', cx: 'O(число единиц) ≤ 32 время · O(1) память' },
      { variant: 'XOR индексов и значений', task: 'В nums n разных чисел из 0..n. Ровно одного не хватает — верни его.', idea: 'Начинаем с x = n и добавляем через XOR каждый индекс i и каждое значение nums[i]. Каждое число, которое есть, приходит дважды — как индекс и как значение — и гасит само себя; порядок не важен, XOR коммутативен. Пропавшее число приходит один раз, оно и остаётся в x.', why: 'Формула суммы n(n + 1)/2 − Σnums — второй способ с O(1) памяти, но сумма может переполнить int при большом n (бери long или вычитай по ходу), а XOR переполниться не может. Single Number (#136) — то же гашение, только без индексов. Сортировка стоит O(n log n), HashSet — O(n) памяти.', cx: 'O(n) время · O(1) память' },
      { variant: 'Разделить по младшему биту x & −x', task: 'Каждое число встречается ровно дважды, кроме двух, которые встречаются по одному разу. Верни эти два за O(n) времени и O(1) памяти.', idea: 'XOR всех чисел оставляет x = a ^ b: пары гасятся. a ≠ b, значит, в x есть единица — бит, в котором a и b различаются. Берём младшую: low = x & −x — и делим числа по этому биту: a и b попадают в разные группы, а обе копии каждой пары — в одну. XOR внутри каждой группы даёт a и b.', why: 'В дополнительном коде −x = ~x + 1: +1 проходит перенос по младшим нулям x до его младшей единицы, поэтому x & −x оставляет ровно этот бит. Делить можно по любой единице x, младшая просто достаётся дешевле всех. Если x = int.MinValue, то −x снова int.MinValue, и приём работает — в unchecked, как в C# по умолчанию; внутри checked будет исключение. В отличие от Single Number (#136), для второго неизвестного нужен второй проход.', cx: 'O(n) время · O(1) память' },
      { variant: 'Таблица: bits[i >> 1] + (i & 1)', task: 'Для каждого i от 0 до n верни число единичных битов в i — массивом, за O(n), не пересчитывая каждое число с нуля.', idea: 'i >> 1 — это i без последнего бита: те же единицы, кроме, может быть, последней, и число меньше, значит, его ответ уже в таблице. bits[i] = bits[i >> 1] + (i & 1). Это DP: ответ для числа берётся из ответа для меньшего.', why: 'popcount для каждого числа стоит O(n · 32). Работают и другие формулы: bits[i] = bits[i & (i − 1)] + 1 (Керниган: на одну единицу меньше) или bits[i] = bits[i − hi] + 1, где hi — старшая степень двойки ≤ i: каждая степень двойки начинает блок, в котором таблица повторяется с одной лишней единицей. Reverse Bits (#190) — тот же учёт со сдвигом на один бит: берём младший бит n и вдвигаем его в результат справа, 32 раза.', cx: 'O(n) время · O(n) память на ответ' },
      { variant: 'XOR — сумма без переносов', task: 'Верни a + b, не используя операторы + и −.', idea: 'В одном столбце 1 + 1 = 10: в столбце остаётся a ^ b, а там, где обе единицы, перенос уходит на столбец влево — это (a & b) << 1. Переносы ещё нужно прибавить, поэтому повторяем с a = a ^ b, b = перенос, пока переносов не останется. Каждый раунд сдвигает младший перенос хотя бы на столбец влево, так что раундов не больше 32.', why: 'Отрицательные числа ничего особого не требуют: сложение в дополнительном коде — та же арифметика по столбцам, а перенос из бита 31 просто выпадает, как в сумматоре процессора. В C# и Java цикл работает как есть (сдвиги не проверяются на переполнение); в Python целые неограниченные — нужна 32-битная маска, иначе −1 + 1 зациклится. Divide Two Integers (#29) собирается из тех же инструментов: сдвигаем делитель влево и вычитаем.', cx: 'O(32) время · O(1) память' },
      { variant: 'Жадно от старшего бита, запросы офлайн', task: 'Для каждого запроса [x, m] верни наибольшее x XOR nums[j] среди nums[j] ≤ m или −1, если ни одно число не ≤ m.', idea: 'Без ограничения это #421: идём от старшего бита вниз и берём бит, противоположный биту x, если хоть одно число продолжается этим путём, — единица наверху дороже всех младших битов вместе. Ограничение решается офлайн: сортируем nums и запросы по m и перед каждым запросом добавляем числа, которые теперь ≤ m. Множество только растёт, поэтому каждое число добавляется один раз.', why: '«Какое-то число продолжается этим путём» — это вопрос к двоичному бору; здесь бор хранится как HashSet префиксов v >> k на каждом уровне — тот же бор, записанный по уровням (бор на массиве обходится без хеширования). Чтобы отвечать онлайн, в исходном порядке, храни в каждом узле бора минимальное значение под ним и иди только туда, где оно ≤ m. Maximum XOR of Two Numbers in an Array (#421) — это то же самое с m = ∞, где запросом служит каждое число.', cx: 'O(n log n + q log q + (n + q) · B) время, B = 30 битов · O(n · B) память' },
    ],
  },

  /* labels of the chapter 15 rig variables */
  'var.lowBit': { en: 'lowest 1: x & −x', ru: 'младшая единица: x & −x' },
  'var.unpaired': { en: 'still without a pair', ru: 'пока без пары' },
  'var.xor': { en: 'x', ru: 'x' },
  'var.groupOne': { en: 'group a: the bit is 1', ru: 'группа a: бит равен 1' },
  'var.groupZero': { en: 'group b: the bit is 0', ru: 'группа b: бит равен 0' },
  'var.bitsTable': { en: 'bits[i] (i:count)', ru: 'bits[i] (i:единиц)' },
  'var.round': { en: 'round', ru: 'раунд' },
  'var.nextAB': { en: 'next round', ru: 'следующий раунд' },
  'var.answers': { en: 'queries x:m → answer', ru: 'запросы x:m → ответ' },
  'var.prefixes': { en: 'prefixes v >> k in the set', ru: 'префиксы v >> k в множестве' },
  'var.inserted': { en: 'numbers in the set', ru: 'числа в множестве' },

  /* input errors of the chapter 15 rigs */
  'in.err.uint': {
    en: t => `“${t}” is not a 32-bit number: write 52, 0x34 or 0b110100.`,
    ru: t => `«${t}» — не 32-битное число: пиши 52, 0x34 или 0b110100.`,
  },
  'in.err.missing': {
    en: n => `With ${n} numbers the values go from 0 to ${n}.`,
    ru: n => `Если чисел ${n}, значения — от 0 до ${n}.`,
  },
  'in.err.twoSingles': {
    en: () => 'Exactly two values must appear once, every other value exactly twice.',
    ru: () => 'Ровно два значения должны встречаться по разу, все остальные — ровно по два.',
  },
  'in.err.pairs': {
    en: () => 'Every query is a pair x m, e.g. 12 4 | 8 1.',
    ru: () => 'Каждый запрос — пара x m, например 12 4 | 8 1.',
  },
};
