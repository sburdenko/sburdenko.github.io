/** Full statements, chapters binary, stack, list, tree: what is given, what to return, limits and an example that matches the rig's example. */
export const ST_B = {
  /* binary */
  bsearch: {
    ex: { in: 'a = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], target = 23', out: '5' },
    ru: {
      text: 'Дан массив различных целых чисел <code>a</code>, отсортированный по возрастанию, и число <code>target</code>. Верни индекс <code>target</code> в массиве или <code>-1</code>, если его там нет. Решение должно работать за O(log n).',
      limits: '1 ≤ n ≤ 10⁴, −10⁴ &lt; a[i], target &lt; 10⁴, все элементы различны.',
      note: 'число 23 стоит на позиции 5 (счёт с нуля).',
      fact: 'В 2006 году Джошуа Блох нашёл в <code>Arrays.binarySearch</code> из JDK переполнение <code>(low + high) / 2</code> на массивах от 2³⁰ элементов. В .NET середину считают как <code>lo + ((hi - lo) &gt;&gt; 1)</code>.',
    },
    en: {
      text: 'You are given an array <code>a</code> of distinct integers sorted in ascending order and a number <code>target</code>. Return the index of <code>target</code> in the array, or <code>-1</code> if it is not there. The solution must run in O(log n).',
      limits: '1 ≤ n ≤ 10⁴, −10⁴ &lt; a[i], target &lt; 10⁴, all elements are distinct.',
      note: '23 sits at position 5 (counting from zero).',
      fact: 'In 2006 Joshua Bloch showed that <code>(low + high) / 2</code> in the JDK\'s <code>Arrays.binarySearch</code> overflows on arrays of 2³⁰+ elements. .NET computes the middle as <code>lo + ((hi - lo) &gt;&gt; 1)</code>.',
    },
  },
  rotated: {
    ex: { in: 'nums = [4, 5, 6, 7, 0, 1, 2], target = 0', out: '4' },
    ru: {
      text: 'Массив различных чисел <code>nums</code> был отсортирован по возрастанию, а потом его циклически сдвинули в неизвестной точке: например, [0, 1, 2, 4, 5, 6, 7] превратился в [4, 5, 6, 7, 0, 1, 2]. Дано число <code>target</code>: верни его индекс в <code>nums</code> или <code>-1</code>, если его нет. Нужно O(log n).',
      limits: '1 ≤ n ≤ 5000, −10⁴ ≤ nums[i], target ≤ 10⁴, все значения различны.',
      note: '0 стоит на позиции 4, сразу после точки поворота.',
      fact: 'Частое продолжение — дубликаты (#81). При <code>nums[lo] == nums[mid] == nums[hi]</code> не понять, какая половина отсортирована: остаётся сдвинуть оба края, и худший случай падает до O(n).',
    },
    en: {
      text: 'An array <code>nums</code> of distinct numbers was sorted in ascending order and then rotated at an unknown point: for example, [0, 1, 2, 4, 5, 6, 7] became [4, 5, 6, 7, 0, 1, 2]. Given a number <code>target</code>, return its index in <code>nums</code>, or <code>-1</code> if it is absent. O(log n) is required.',
      limits: '1 ≤ n ≤ 5000, −10⁴ ≤ nums[i], target ≤ 10⁴, all values are distinct.',
      note: '0 is at position 4, right after the rotation point.',
      fact: 'A common follow-up is duplicates (#81). When <code>nums[lo] == nums[mid] == nums[hi]</code> you cannot tell which half is sorted, so you shrink both ends, and the worst case degrades to O(n).',
    },
  },
  koko: {
    ex: { in: 'piles = [3, 6, 7, 11], h = 8', out: '4' },
    ru: {
      text: 'Даны кучи бананов <code>piles</code> и число часов <code>h</code>. Каждый час Коко выбирает одну кучу и съедает из неё <code>k</code> бананов; если в куче меньше <code>k</code>, она доедает кучу и до конца часа больше ничего не ест. Верни наименьшую целую скорость <code>k</code>, при которой все кучи будут съедены не больше чем за <code>h</code> часов.',
      limits: '1 ≤ piles.length ≤ 10⁴, piles.length ≤ h ≤ 10⁹, 1 ≤ piles[i] ≤ 10⁹.',
      note: 'при k = 4 уходит 1 + 2 + 2 + 3 = 8 часов, а при k = 3 — уже 10.',
      fact: 'Ловушка в подсчёте часов: при k = 1 сумма доходит до 10⁴ · 10⁹ = 10¹³ и переполняет int. Считай в long или прекращай сложение, как только сумма превысила h.',
    },
    en: {
      text: 'You are given banana piles <code>piles</code> and a number of hours <code>h</code>. Each hour Koko picks one pile and eats <code>k</code> bananas from it; if the pile has fewer than <code>k</code>, she finishes it and eats nothing else that hour. Return the smallest integer speed <code>k</code> that lets her eat all piles within <code>h</code> hours.',
      limits: '1 ≤ piles.length ≤ 10⁴, piles.length ≤ h ≤ 10⁹, 1 ≤ piles[i] ≤ 10⁹.',
      note: 'k = 4 takes 1 + 2 + 2 + 3 = 8 hours, while k = 3 already takes 10.',
      fact: 'The hour count is a trap: at k = 1 the total reaches 10⁴ · 10⁹ = 10¹³ and overflows int. Use long, or stop adding as soon as the total exceeds h.',
    },
  },
  weightedPick: {
    ex: { in: 'w = [3, 1, 4, 2], r = 4', out: '2' },
    ru: {
      text: 'Дан массив положительных весов <code>w</code>. Метод <code>pickIndex()</code> должен возвращать индекс <code>i</code> с вероятностью <code>w[i] / sum(w)</code>, а вызывать его будут много раз. На стенде случайность заменена явным числом: <code>r</code> — выпавшее случайное целое из [0, sum(w)), и нужно вернуть индекс, который <code>pickIndex()</code> выдаст для этого <code>r</code> (индексу i достаётся ровно w[i] значений r подряд).',
      limits: '1 ≤ w.length ≤ 10⁴, 1 ≤ w[i] ≤ 10⁵, до 10⁴ вызовов pickIndex.',
      note: 'индексу 0 достаются r = 0..2, индексу 1 — r = 3, индексу 2 — r = 4..7, поэтому r = 4 даёт 2.',
      fact: 'Если веса не меняются, а выборок миллионы, есть alias-метод Уолкера (1974): O(n) на подготовку и O(1) на выбор — одна случайная ячейка и одна «монетка». Вариант Воуза (1991) устойчив к округлению.',
    },
    en: {
      text: 'You are given an array of positive weights <code>w</code>. The method <code>pickIndex()</code> must return index <code>i</code> with probability <code>w[i] / sum(w)</code>, and it will be called many times. In the rig the randomness is replaced by an explicit number: <code>r</code> is the random integer drawn from [0, sum(w)), and you return the index that <code>pickIndex()</code> gives for that <code>r</code> (index i owns exactly w[i] consecutive values of r).',
      limits: '1 ≤ w.length ≤ 10⁴, 1 ≤ w[i] ≤ 10⁵, up to 10⁴ calls to pickIndex.',
      note: 'index 0 owns r = 0..2, index 1 owns r = 3, index 2 owns r = 4..7, so r = 4 gives 2.',
      fact: 'With fixed weights and millions of draws, Walker\'s alias method (1974) gives O(n) setup and O(1) per draw: one random slot plus one biased coin. Vose\'s 1991 variant is robust to rounding.',
    },
  },
  median: {
    ex: { in: 'A = [1, 3, 8, 9, 15], B = [7, 11, 18, 19, 21, 25]', out: '11.0' },
    ru: {
      text: 'Даны два массива <code>A</code> и <code>B</code>, каждый отсортирован по неубыванию (один из них может быть пустым). Верни медиану всех чисел обоих массивов вместе как дробное число: при чётном общем количестве это среднее двух средних чисел. Требуемая сложность — O(log(m + n)).',
      limits: '0 ≤ m, n ≤ 1000, 1 ≤ m + n ≤ 2000, −10⁶ ≤ A[i], B[i] ≤ 10⁶.',
      note: 'всего 11 чисел, шестое по порядку — 11.',
      fact: 'Если числа приходят потоком, нужен другой приём — две кучи (#295). В .NET 6+ это два <code>PriorityQueue</code>; он всегда min-куча, поэтому левую половину делают max-кучей через обратный компаратор.',
    },
    en: {
      text: 'You are given two arrays <code>A</code> and <code>B</code>, each sorted in non-decreasing order (one of them may be empty). Return the median of all numbers of both arrays together as a floating-point value: when the total count is even, it is the mean of the two middle numbers. The required complexity is O(log(m + n)).',
      limits: '0 ≤ m, n ≤ 1000, 1 ≤ m + n ≤ 2000, −10⁶ ≤ A[i], B[i] ≤ 10⁶.',
      note: 'there are 11 numbers in total, and the sixth one in order is 11.',
      fact: 'For a stream of numbers the trick is two heaps instead (#295). In .NET 6+ that is two <code>PriorityQueue</code>s; it is always a min-heap, so the left half becomes a max-heap via a reversed comparer.',
    },
  },
  lisTails: {
    ex: { in: 'nums = [2, 5, 3, 7, 11, 8, 10, 13, 6, 3]', out: '6' },
    ru: {
      text: 'Дан целочисленный массив <code>nums</code>. Верни длину самой длинной строго возрастающей подпоследовательности: элементы берутся в исходном порядке, но не обязательно подряд. Нужно решение быстрее O(n²) — за O(n log n).',
      limits: '1 ≤ n ≤ 2500, −10⁴ ≤ nums[i] ≤ 10⁴.',
      note: 'например, подпоследовательность [2, 3, 7, 8, 10, 13].',
      fact: 'Алгоритм хвостов — это пасьянс patience sorting: число стопок равно длине LIS. На нём построен patience diff Брэма Коэна, выравнивающий уникальные строки двух файлов; в git это <code>git diff --patience</code>.',
    },
    en: {
      text: 'You are given an integer array <code>nums</code>. Return the length of the longest strictly increasing subsequence: elements keep their original order but need not be adjacent. The solution must beat O(n²) and run in O(n log n).',
      limits: '1 ≤ n ≤ 2500, −10⁴ ≤ nums[i] ≤ 10⁴.',
      note: 'for example, the subsequence [2, 3, 7, 8, 10, 13].',
      fact: 'The tails trick is the patience sorting card game: the pile count equals the LIS length. Bram Cohen\'s patience diff aligns unique lines of two files with it; in git that is <code>git diff --patience</code>.',
    },
  },
  divideBits: {
    ex: { in: 'dividend = 100, divisor = -7', out: '-14' },
    ru: {
      text: 'Даны два 32-битных целых <code>dividend</code> и <code>divisor</code>. Верни их частное, отбросив дробную часть в сторону нуля, не используя умножение, деление и взятие остатка. Если частное не помещается в 32-битный int, верни <code>2³¹ − 1</code>.',
      limits: '−2³¹ ≤ dividend, divisor ≤ 2³¹ − 1, divisor ≠ 0.',
      note: '100 / −7 = −14,28…, дробная часть отбрасывается к нулю.',
      fact: 'Именно так — сдвигами и вычитаниями — делили в играх для 6502 (NES, Apple II) и Z80 (ZX Spectrum): инструкций умножения и деления у этих процессоров не было.',
    },
    en: {
      text: 'You are given two 32-bit integers <code>dividend</code> and <code>divisor</code>. Return their quotient truncated toward zero without using multiplication, division or the modulo operator. If the quotient does not fit into a 32-bit int, return <code>2³¹ − 1</code>.',
      limits: '−2³¹ ≤ dividend, divisor ≤ 2³¹ − 1, divisor ≠ 0.',
      note: '100 / −7 = −14.28…, and the fraction is truncated toward zero.',
      fact: 'This shift-and-subtract loop is exactly how games divided on the 6502 (NES, Apple II) and the Z80 (ZX Spectrum): those CPUs had no multiply or divide instructions.',
    },
  },

  /* stack */
  parens: {
    ex: { in: 's = "{[()()]}"', out: 'true' },
    ru: {
      text: 'Дана строка <code>s</code> только из символов <code>( ) [ ] { }</code>. Верни <code>true</code>, если скобки расставлены правильно: каждая открывающая закрыта скобкой того же типа и закрывающие идут в обратном порядке открытия. Иначе верни <code>false</code>.',
      limits: '1 ≤ s.length ≤ 10⁴.',
      note: 'каждая пара закрывается внутри своей внешней пары.',
      fact: 'Если тип скобок один, стек вырождается в счётчик: O(1) памяти, лишь бы он не уходил ниже нуля. А правильных расстановок из n пар ровно n-е число Каталана: 1, 2, 5, 14, 42…',
    },
    en: {
      text: 'You are given a string <code>s</code> made only of <code>( ) [ ] { }</code>. Return <code>true</code> if the brackets are balanced: every opening bracket is closed by one of the same type, and closings come in the reverse order of openings. Otherwise return <code>false</code>.',
      limits: '1 ≤ s.length ≤ 10⁴.',
      note: 'every pair is closed inside its enclosing pair.',
      fact: 'With a single bracket type the stack collapses into a counter: O(1) memory, as long as it never drops below zero. The number of valid strings of n pairs is the nth Catalan number: 1, 2, 5, 14, 42…',
    },
  },
  daily: {
    ex: { in: 't = [73, 74, 75, 71, 69, 72, 76, 73]', out: '[1, 1, 4, 2, 1, 1, 0, 0]' },
    ru: {
      text: 'Дан массив дневных температур <code>t</code>. Верни массив <code>answer</code> той же длины: <code>answer[i]</code> — через сколько дней после дня i впервые будет строго теплее, или 0, если такого дня нет.',
      limits: '1 ≤ n ≤ 10⁵, 30 ≤ t[i] ≤ 100.',
      note: 'после 75 первая более высокая температура — 76, через 4 дня.',
      fact: 'Online Stock Span (#901) — та же задача, повёрнутая назад: сколько дней подряд до сегодняшнего цена была не выше. Стек живёт между вызовами, и каждый вызов стоит амортизированно O(1).',
    },
    en: {
      text: 'You are given an array of daily temperatures <code>t</code>. Return an array <code>answer</code> of the same length where <code>answer[i]</code> is the number of days after day i until a strictly warmer day, or 0 if there is none.',
      limits: '1 ≤ n ≤ 10⁵, 30 ≤ t[i] ≤ 100.',
      note: 'after 75 the first higher temperature is 76, four days later.',
      fact: 'Online Stock Span (#901) is the same problem looking backwards: for how many consecutive days up to today the price was not higher. The stack lives between calls, and each call costs amortized O(1).',
    },
  },
  minStack: {
    ex: { in: 'ops = push 5, push 3, push 7, getMin, pop, push 1, getMin, pop, pop, getMin', out: 'getMin: 3, 1, 5' },
    ru: {
      text: 'Спроектируй стек с операциями <code>push(x)</code>, <code>pop()</code>, <code>top()</code> и <code>getMin()</code> — последняя возвращает наименьший элемент в стеке. Каждая операция должна работать за O(1). На стенде задаётся последовательность операций <code>ops</code>; ответ — значения, которые вернули вызовы <code>getMin</code>, по порядку.',
      limits: '−2³¹ ≤ x ≤ 2³¹ − 1; pop, top и getMin вызываются только на непустом стеке; до 3·10⁴ вызовов.',
      note: 'после pop 7 и push 1 минимум 1, после двух pop в стеке остаётся только 5.',
      fact: 'Из двух таких стеков собирается очередь с минимумом (или максимумом) за амортизированные O(1) — ещё одно решение Sliding Window Maximum (#239) без дека.',
    },
    en: {
      text: 'Design a stack with <code>push(x)</code>, <code>pop()</code>, <code>top()</code> and <code>getMin()</code>, the last one returning the smallest element in the stack. Every operation must take O(1). The rig takes a sequence of operations <code>ops</code>; the answer is the values returned by the <code>getMin</code> calls, in order.',
      limits: '−2³¹ ≤ x ≤ 2³¹ − 1; pop, top and getMin are called only on a non-empty stack; up to 3·10⁴ calls.',
      note: 'after popping 7 and pushing 1 the minimum is 1; after two more pops only 5 is left.',
      fact: 'Two such stacks make a queue with min (or max) in amortized O(1), which gives another solution to Sliding Window Maximum (#239) without a deque.',
    },
  },
  histogram: {
    ex: { in: 'heights = [2, 1, 5, 6, 2, 3]', out: '10' },
    ru: {
      text: 'Дан массив <code>heights</code> — высоты столбиков гистограммы, каждый шириной 1, стоящих вплотную. Верни площадь наибольшего прямоугольника, который целиком помещается внутри гистограммы.',
      limits: '1 ≤ n ≤ 10⁵, 0 ≤ heights[i] ≤ 10⁴.',
      note: 'столбики 5 и 6 дают прямоугольник высотой 5 и шириной 2.',
      fact: 'Монотонный стек тут неявно строит декартово дерево по минимуму (Жан Вюймен, 1980): поддерево узла — ровно отрезок, где его столбик самый низкий, а ответ — максимум «высота × размер поддерева».',
    },
    en: {
      text: 'You are given an array <code>heights</code> of histogram bar heights; every bar has width 1 and they stand side by side. Return the area of the largest rectangle that fits entirely inside the histogram.',
      limits: '1 ≤ n ≤ 10⁵, 0 ≤ heights[i] ≤ 10⁴.',
      note: 'the bars 5 and 6 give a rectangle of height 5 and width 2.',
      fact: 'The monotonic stack implicitly builds a min Cartesian tree (Jean Vuillemin, 1980): a node\'s subtree is exactly the span where its bar is the lowest, and the answer is the max of height × subtree size.',
    },
  },

  /* list */
  cycle: {
    ex: { in: 'n = 8, pos = 2', out: 'true' },
    ru: {
      text: 'Дана голова односвязного списка. Верни <code>true</code>, если, идя по ссылкам <code>next</code>, можно попасть в узел повторно (в списке есть цикл), иначе <code>false</code>. На стенде список задан числами: <code>n</code> узлов с номерами 0…n−1, а <code>next</code> последнего узла ведёт на узел <code>pos</code> (<code>-1</code> — на null). Сам <code>pos</code> решению не передаётся. Дополнительно: справиться с O(1) памяти.',
      limits: 'до 10⁴ узлов, −10⁵ ≤ val ≤ 10⁵, pos = −1 или корректный индекс.',
      note: 'последний узел 7 указывает на узел 2.',
      fact: '«Черепаху и зайца» принято приписывать Роберту Флойду, но в его опубликованных работах этого алгоритма нет. Ричард Брент в 1980 году предложил вариант с «телепортирующейся» черепахой.',
    },
    en: {
      text: 'You are given the head of a singly linked list. Return <code>true</code> if following the <code>next</code> links can reach some node again (the list has a cycle), otherwise <code>false</code>. In the rig the list is described by numbers: <code>n</code> nodes numbered 0…n−1, and the last node\'s <code>next</code> points to node <code>pos</code> (<code>-1</code> means null). The solution does not receive <code>pos</code>. Follow-up: use O(1) memory.',
      limits: 'up to 10⁴ nodes, −10⁵ ≤ val ≤ 10⁵, pos = −1 or a valid index.',
      note: 'the last node 7 points back to node 2.',
      fact: 'The tortoise and hare is usually credited to Robert Floyd, yet it appears in none of his published work. In 1980 Richard Brent proposed a variant with a "teleporting" tortoise.',
    },
  },
  cycleEntry: {
    ex: { in: 'n = 8, pos = 2', out: '2' },
    ru: {
      text: 'Дана голова односвязного списка. Верни узел, с которого начинается цикл, или null, если цикла нет; список менять нельзя, память — O(1). Список на стенде задан так же, как в Linked List Cycle: <code>n</code> узлов 0…n−1, последний ведёт на узел <code>pos</code> (<code>-1</code> — цикла нет). Стенд показывает номер узла входа вместо самого узла (и <code>-1</code> вместо null).',
      limits: 'до 10⁴ узлов, −10⁵ ≤ val ≤ 10⁵, pos = −1 или корректный индекс.',
      note: 'путь 0 → 1 → 2 впервые попадает в цикл в узле 2.',
      fact: 'Тот же поиск цикла работает в ρ-алгоритме Полларда (1975) для разложения чисел: последовательность x → x² + c mod n зацикливается, а хвост с петлёй на рисунке похожи на греческую букву ρ.',
    },
    en: {
      text: 'You are given the head of a singly linked list. Return the node where the cycle begins, or null if there is no cycle; the list must not be modified and memory must be O(1). The rig describes the list as in Linked List Cycle: <code>n</code> nodes 0…n−1, the last one points to node <code>pos</code> (<code>-1</code> means no cycle). The rig shows the number of the entry node instead of the node itself (and <code>-1</code> instead of null).',
      limits: 'up to 10⁴ nodes, −10⁵ ≤ val ≤ 10⁵, pos = −1 or a valid index.',
      note: 'the walk 0 → 1 → 2 first enters the cycle at node 2.',
      fact: 'The same cycle finding powers Pollard\'s rho factorization (1975): the sequence x → x² + c mod n falls into a cycle, and the tail plus loop drawn on paper look like the Greek letter ρ.',
    },
  },
  removeNth: {
    ex: { in: 'values = [1, 2, 3, 4, 5], n = 2', out: '[1, 2, 3, 5]' },
    ru: {
      text: 'Дан односвязный список со значениями <code>values</code> и число <code>n</code>. Удали из списка n-й узел, считая с конца, и верни голову получившегося списка (удалить могут и саму голову). Дополнительно: сделать это за один проход.',
      limits: '1 ≤ длина ≤ 30, 0 ≤ val ≤ 100, 1 ≤ n ≤ длина.',
      note: 'второй с конца — узел 4.',
      fact: 'Честный ответ на «чем это лучше двух проходов?»: по числу переходов — почти ничем, около 2n в обоих случаях. «Один проход» значит лишь, что второй указатель идёт следом, а не после.',
    },
    en: {
      text: 'You are given a singly linked list with values <code>values</code> and a number <code>n</code>. Remove the n-th node counting from the end and return the head of the resulting list (the head itself may be the one removed). Follow-up: do it in a single pass.',
      limits: '1 ≤ length ≤ 30, 0 ≤ val ≤ 100, 1 ≤ n ≤ length.',
      note: 'the second node from the end is 4.',
      fact: 'The honest answer to "why is this better than two passes?": by step count it barely is, about 2n either way. "One pass" only means the second pointer trails along instead of starting later.',
    },
  },
  reverse: {
    ex: { in: 'values = [1, 2, 3, 4, 5]', out: '[5, 4, 3, 2, 1]' },
    ru: {
      text: 'Дан односвязный список со значениями <code>values</code>. Разверни его, перенаправив ссылки узлов, и верни новую голову. Список может быть пустым.',
      limits: '0 ≤ длина ≤ 5000, −5000 ≤ val ≤ 5000.',
      fact: 'Рекурсивный разворот короче, но тратит O(n) стека. В .NET <code>StackOverflowException</code> нельзя поймать в <code>catch</code> — процесс просто завершается, поэтому для длинных списков берут цикл.',
    },
    en: {
      text: 'You are given a singly linked list with values <code>values</code>. Reverse it by redirecting the node links and return the new head. The list may be empty.',
      limits: '0 ≤ length ≤ 5000, −5000 ≤ val ≤ 5000.',
      fact: 'The recursive reversal is shorter but uses O(n) stack. In .NET a <code>StackOverflowException</code> cannot be caught: the process is simply terminated, so long lists call for the loop.',
    },
  },
  mergeTwo: {
    ex: { in: 'list1 = [1, 2, 4], list2 = [1, 3, 4, 6, 8]', out: '[1, 1, 2, 3, 4, 4, 6, 8]' },
    ru: {
      text: 'Даны головы двух связных списков <code>list1</code> и <code>list2</code>, каждый отсортирован по неубыванию. Слей их в один отсортированный список из тех же узлов (новые узлы не создаются) и верни его голову. Любой из списков может быть пустым.',
      limits: '0 ≤ длина каждого ≤ 50, −100 ≤ val ≤ 100.',
      note: 'когда list1 кончается, хвост 6, 8 из list2 переходит целиком.',
      fact: 'Слияние — сердце сортировки слиянием, которую Джон фон Нейман придумал в 1945 году. Sort List (#148) — её версия для списка: середина через slow/fast, рекурсия и вот это слияние.',
    },
    en: {
      text: 'You are given the heads of two linked lists <code>list1</code> and <code>list2</code>, each sorted in non-decreasing order. Merge them into one sorted list made of the same nodes (no new nodes) and return its head. Either list may be empty.',
      limits: '0 ≤ length of each ≤ 50, −100 ≤ val ≤ 100.',
      note: 'once list1 runs out, the tail 6, 8 of list2 is attached as a whole.',
      fact: 'Merging is the heart of merge sort, which John von Neumann invented in 1945. Sort List (#148) is its linked-list version: find the middle with slow/fast, recurse, then run exactly this merge.',
    },
  },
  lru: {
    ex: { in: 'capacity = 2, ops = put 1 1, put 2 2, get 1, put 3 3, get 2, put 4 4, get 1, get 3, get 4', out: 'get: 1, -1, -1, 3, 4' },
    ru: {
      text: 'Спроектируй кэш вместимостью <code>capacity</code> с операциями <code>get(key)</code> — значение по ключу или <code>-1</code>, если ключа нет, — и <code>put(key, value)</code> — вставить или обновить. Если после вставки ключей больше, чем <code>capacity</code>, выкидывается ключ, к которому дольше всех не обращались (и get, и put считаются обращением). Обе операции — O(1) в среднем. На стенде задана последовательность <code>ops</code>; ответ — результаты всех <code>get</code> по порядку.',
      limits: '1 ≤ capacity ≤ 3000, 0 ≤ key ≤ 10⁴, 0 ≤ value ≤ 10⁵, до 2·10⁵ вызовов.',
      note: 'put 3 вытесняет ключ 2, а put 4 — ключ 1, к которому обращались раньше, чем к 3.',
      fact: 'Redis не держит точный LRU — он стоил бы лишней памяти. Вместо этого берётся случайная выборка ключей (<code>maxmemory-samples</code>, по умолчанию 5) и вытесняется самый давно использованный из них.',
    },
    en: {
      text: 'Design a cache with capacity <code>capacity</code> and two operations: <code>get(key)</code> returns the value for the key or <code>-1</code> if it is absent, and <code>put(key, value)</code> inserts or updates it. If an insertion makes the number of keys exceed <code>capacity</code>, the key that was used least recently is evicted (both get and put count as a use). Both operations must take O(1) on average. The rig takes a sequence <code>ops</code>; the answer is the results of all <code>get</code> calls in order.',
      limits: '1 ≤ capacity ≤ 3000, 0 ≤ key ≤ 10⁴, 0 ≤ value ≤ 10⁵, up to 2·10⁵ calls.',
      note: 'put 3 evicts key 2, and put 4 evicts key 1, which was used before key 3.',
      fact: 'Redis does not keep an exact LRU, since it would cost extra memory. Instead it samples a few random keys (<code>maxmemory-samples</code>, 5 by default) and evicts the least recently used of them.',
    },
  },
  reverseK: {
    ex: { in: 'values = [1, 2, 3, 4, 5, 6, 7, 8], k = 3', out: '[3, 2, 1, 6, 5, 4, 7, 8]' },
    ru: {
      text: 'Дан односвязный список со значениями <code>values</code> и число <code>k</code>. Разверни узлы каждой следующей группы из <code>k</code> узлов; если в конце осталось меньше <code>k</code> узлов, они остаются в прежнем порядке. Менять можно только ссылки, не значения в узлах; верни новую голову. Дополнительно: O(1) дополнительной памяти.',
      limits: '1 ≤ k ≤ длина ≤ 5000, 0 ≤ val ≤ 1000.',
      note: 'группы [1, 2, 3] и [4, 5, 6] развёрнуты, хвост [7, 8] короче 3 и не тронут.',
      fact: 'Swap Nodes in Pairs (#24) — это она же при k = 2, а Reverse Linked List II (#92) — один её шаг: развернуть отрезок с left по right и пришить концы обратно.',
    },
    en: {
      text: 'You are given a singly linked list with values <code>values</code> and a number <code>k</code>. Reverse the nodes of each consecutive group of <code>k</code> nodes; if fewer than <code>k</code> nodes are left at the end, they keep their order. Only the links may change, not the values in the nodes; return the new head. Follow-up: O(1) extra memory.',
      limits: '1 ≤ k ≤ length ≤ 5000, 0 ≤ val ≤ 1000.',
      note: 'the groups [1, 2, 3] and [4, 5, 6] are reversed; the tail [7, 8] is shorter than 3 and stays.',
      fact: 'Swap Nodes in Pairs (#24) is this problem with k = 2, and Reverse Linked List II (#92) is a single step of it: reverse the segment from left to right and stitch the ends back.',
    },
  },

  /* tree */
  maxDepth: {
    ex: { in: 'root = [3, 9, 20, 4, null, 15, 7, null, null, null, null, null, 8]', out: '4' },
    ru: {
      text: 'Дан корень бинарного дерева <code>root</code> (на входе — значения по уровням, <code>null</code> — нет ребёнка). Верни максимальную глубину: число узлов на самом длинном пути от корня до листа. У пустого дерева глубина 0.',
      limits: '0 ≤ число узлов ≤ 10⁴, −100 ≤ val ≤ 100.',
      note: 'самый длинный путь 3 → 20 → 7 → 8.',
      fact: 'У сбалансированных деревьев глубина гарантирована: высота красно-чёрного дерева не больше 2·log₂(n + 1). На нём в .NET построены <code>SortedSet&lt;T&gt;</code> и <code>SortedDictionary&lt;K, V&gt;</code>.',
    },
    en: {
      text: 'You are given the root of a binary tree <code>root</code> (the input lists values level by level, <code>null</code> marks a missing child). Return its maximum depth: the number of nodes on the longest path from the root down to a leaf. An empty tree has depth 0.',
      limits: '0 ≤ number of nodes ≤ 10⁴, −100 ≤ val ≤ 100.',
      note: 'the longest path is 3 → 20 → 7 → 8.',
      fact: 'Balanced trees guarantee their depth: a red-black tree is at most 2·log₂(n + 1) tall. That is what backs <code>SortedSet&lt;T&gt;</code> and <code>SortedDictionary&lt;K, V&gt;</code> in .NET.',
    },
  },
  levelOrder: {
    ex: { in: 'root = [3, 9, 20, 4, null, 15, 7, null, null, null, null, null, 8]', out: '[[3], [9, 20], [4, 15, 7], [8]]' },
    ru: {
      text: 'Дан корень бинарного дерева <code>root</code>. Верни значения узлов по уровням: список списков, где первый — корень, следующий — его дети и так далее, внутри уровня — слева направо. Для пустого дерева верни пустой список.',
      limits: '0 ≤ число узлов ≤ 2000, −1000 ≤ val ≤ 1000.',
      fact: 'Обход в ширину придумал Конрад Цузе в 1945 году в отвергнутой диссертации о Plankalkül (напечатана в 1972), а в 1959 его заново открыл Эдвард Мур — искать кратчайший выход из лабиринта.',
    },
    en: {
      text: 'You are given the root of a binary tree <code>root</code>. Return the node values level by level: a list of lists where the first holds the root, the next holds its children and so on, each level from left to right. For an empty tree return an empty list.',
      limits: '0 ≤ number of nodes ≤ 2000, −1000 ≤ val ≤ 1000.',
      fact: 'Breadth-first search was invented by Konrad Zuse in 1945 in his rejected thesis on Plankalkül (printed in 1972) and rediscovered in 1959 by Edward F. Moore to find the shortest way out of a maze.',
    },
  },
  validBst: {
    ex: { in: 'root = [5, 3, 8, 1, 6, 7, 9]', out: 'false' },
    ru: {
      text: 'Дан корень бинарного дерева <code>root</code>. Верни <code>true</code>, если это корректное дерево поиска: для каждого узла все значения в левом поддереве строго меньше его значения, а все в правом — строго больше. Проверять нужно всё поддерево, а не только прямых детей.',
      limits: '1 ≤ число узлов ≤ 10⁴, −2³¹ ≤ val ≤ 2³¹ − 1.',
      note: 'узел 6 — правый ребёнок 3, но он лежит в левом поддереве корня 5, а 6 &gt; 5.',
      fact: 'Ловушка: <code>int.MinValue</code> и <code>int.MaxValue</code> в роли «бесконечных» границ ломаются уже на дереве из одного узла 2³¹ − 1. Держи границы в <code>long</code> или <code>int?</code>, где null — нет границы.',
    },
    en: {
      text: 'You are given the root of a binary tree <code>root</code>. Return <code>true</code> if it is a valid search tree: for every node, all values in its left subtree are strictly smaller than its value and all values in its right subtree are strictly larger. The whole subtree must be checked, not just the direct children.',
      limits: '1 ≤ number of nodes ≤ 10⁴, −2³¹ ≤ val ≤ 2³¹ − 1.',
      note: 'node 6 is the right child of 3, yet it lies in the left subtree of the root 5, and 6 &gt; 5.',
      fact: 'Trap: using <code>int.MinValue</code> and <code>int.MaxValue</code> as "infinite" bounds already fails on a single node holding 2³¹ − 1. Keep the bounds as <code>long</code> or <code>int?</code>, with null meaning no bound.',
    },
  },
  lca: {
    ex: { in: 'root = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p = 7, q = 8', out: '3' },
    ru: {
      text: 'Дан корень бинарного дерева <code>root</code> и два разных узла <code>p</code> и <code>q</code>, оба есть в дереве. Верни их наименьшего общего предка — самый глубокий узел, у которого в поддереве есть и <code>p</code>, и <code>q</code> (узел считается потомком самого себя). Все значения различны, поэтому на стенде <code>p</code> и <code>q</code> заданы значениями узлов.',
      limits: '2 ≤ число узлов ≤ 10⁵, −10⁹ ≤ val ≤ 10⁹, значения различны, p ≠ q.',
      note: '7 лежит в левом поддереве корня (через 5 и 2), 8 — в правом (через 1), поэтому ответ — сам корень.',
      fact: '<code>git merge-base</code> решает ту же задачу на графе коммитов: находит общего предка двух веток, от которого git строит трёхстороннее слияние.',
    },
    en: {
      text: 'You are given the root of a binary tree <code>root</code> and two different nodes <code>p</code> and <code>q</code>, both present in the tree. Return their lowest common ancestor: the deepest node whose subtree contains both <code>p</code> and <code>q</code> (a node counts as its own descendant). All values are distinct, so the rig gives <code>p</code> and <code>q</code> as node values.',
      limits: '2 ≤ number of nodes ≤ 10⁵, −10⁹ ≤ val ≤ 10⁹, values are distinct, p ≠ q.',
      note: '7 is in the root\'s left subtree (via 5 and 2) and 8 is in the right one (via 1), so the answer is the root itself.',
      fact: '<code>git merge-base</code> solves the same problem on the commit graph: it finds the common ancestor of two branches that git uses as the base of a three-way merge.',
    },
  },
  maxPath: {
    ex: { in: 'root = [-10, 9, 20, null, null, 15, 7]', out: '42' },
    ru: {
      text: 'Дан корень бинарного дерева <code>root</code>, значения могут быть отрицательными. Путь — цепочка узлов, где соседние связаны ребром и каждый узел встречается не больше раза; он может начинаться и кончаться где угодно и не обязан проходить через корень, но содержит хотя бы один узел. Верни наибольшую сумму значений на таком пути.',
      limits: '1 ≤ число узлов ≤ 3·10⁴, −1000 ≤ val ≤ 1000.',
      note: 'лучший путь 15 → 20 → 7, корень −10 только уменьшил бы сумму.',
      fact: 'Если дерево — одна цепочка, задача превращается в Maximum Subarray (#53), а «отрицательный спуск обрезаем до 0» — это ровно алгоритм Кадане, только перенесённый на дерево.',
    },
    en: {
      text: 'You are given the root of a binary tree <code>root</code>; values may be negative. A path is a chain of nodes where neighbours are joined by an edge and every node appears at most once; it may start and end anywhere, need not pass through the root, but holds at least one node. Return the largest sum of values on such a path.',
      limits: '1 ≤ number of nodes ≤ 3·10⁴, −1000 ≤ val ≤ 1000.',
      note: 'the best path is 15 → 20 → 7; the root −10 would only lower the sum.',
      fact: 'If the tree is a single chain, this becomes Maximum Subarray (#53), and "clip a negative branch to 0" is exactly Kadane\'s algorithm carried over to a tree.',
    },
  },
  invertTree: {
    ex: { in: 'root = [4, 2, 7, 1, 3, 6, 9]', out: '[4, 7, 2, 9, 6, 3, 1]' },
    ru: {
      text: 'Дан корень бинарного дерева <code>root</code>. Отрази дерево зеркально: у каждого узла поменяй местами левое и правое поддерево — и верни корень. Дерево может быть пустым.',
      limits: '0 ≤ число узлов ≤ 100, −100 ≤ val ≤ 100.',
      note: 'по уровням каждый ряд читается в обратном порядке.',
      fact: 'В 2015 году Макс Хауэлл, автор Homebrew, написал в твиттере, что Google отказал ему: он не смог инвертировать бинарное дерево на доске. LeetCode добавил #226 под впечатлением от этого твита.',
    },
    en: {
      text: 'You are given the root of a binary tree <code>root</code>. Mirror the tree by swapping the left and right subtrees of every node, and return the root. The tree may be empty.',
      limits: '0 ≤ number of nodes ≤ 100, −100 ≤ val ≤ 100.',
      note: 'level by level, every row reads in reverse.',
      fact: 'In 2015 Max Howell, the author of Homebrew, tweeted that Google turned him down because he could not invert a binary tree on a whiteboard. LeetCode added #226 inspired by that tweet.',
    },
  },
};
