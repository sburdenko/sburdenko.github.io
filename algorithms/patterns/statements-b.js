/** Full statements, chapters binary, stack, list, tree: what is given, what to return, limits and an example that matches the rig's example. */
export const ST_B = {
  /* binary */
  bsearch: {
    ex: { in: 'a = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], target = 23', out: '5' },
    ru: {
      text: 'Дан массив различных целых чисел <code>a</code>, отсортированный по возрастанию, и число <code>target</code>. Верни индекс <code>target</code> в массиве или <code>-1</code>, если его там нет. Решение должно работать за O(log n).',
      limits: '1 ≤ n ≤ 10⁴, −10⁴ &lt; a[i], target &lt; 10⁴, все элементы различны.',
      note: 'число 23 стоит на позиции 5 (счёт с нуля).',
    },
    en: {
      text: 'You are given an array <code>a</code> of distinct integers sorted in ascending order and a number <code>target</code>. Return the index of <code>target</code> in the array, or <code>-1</code> if it is not there. The solution must run in O(log n).',
      limits: '1 ≤ n ≤ 10⁴, −10⁴ &lt; a[i], target &lt; 10⁴, all elements are distinct.',
      note: '23 sits at position 5 (counting from zero).',
    },
  },
  rotated: {
    ex: { in: 'nums = [4, 5, 6, 7, 0, 1, 2], target = 0', out: '4' },
    ru: {
      text: 'Массив различных чисел <code>nums</code> был отсортирован по возрастанию, а потом его циклически сдвинули в неизвестной точке: например, [0, 1, 2, 4, 5, 6, 7] превратился в [4, 5, 6, 7, 0, 1, 2]. Дано число <code>target</code>: верни его индекс в <code>nums</code> или <code>-1</code>, если его нет. Нужно O(log n).',
      limits: '1 ≤ n ≤ 5000, −10⁴ ≤ nums[i], target ≤ 10⁴, все значения различны.',
      note: '0 стоит на позиции 4, сразу после точки поворота.',
    },
    en: {
      text: 'An array <code>nums</code> of distinct numbers was sorted in ascending order and then rotated at an unknown point: for example, [0, 1, 2, 4, 5, 6, 7] became [4, 5, 6, 7, 0, 1, 2]. Given a number <code>target</code>, return its index in <code>nums</code>, or <code>-1</code> if it is absent. O(log n) is required.',
      limits: '1 ≤ n ≤ 5000, −10⁴ ≤ nums[i], target ≤ 10⁴, all values are distinct.',
      note: '0 is at position 4, right after the rotation point.',
    },
  },
  koko: {
    ex: { in: 'piles = [3, 6, 7, 11], h = 8', out: '4' },
    ru: {
      text: 'Даны кучи бананов <code>piles</code> и число часов <code>h</code>. Каждый час Коко выбирает одну кучу и съедает из неё <code>k</code> бананов; если в куче меньше <code>k</code>, она доедает кучу и до конца часа больше ничего не ест. Верни наименьшую целую скорость <code>k</code>, при которой все кучи будут съедены не больше чем за <code>h</code> часов.',
      limits: '1 ≤ piles.length ≤ 10⁴, piles.length ≤ h ≤ 10⁹, 1 ≤ piles[i] ≤ 10⁹.',
      note: 'при k = 4 уходит 1 + 2 + 2 + 3 = 8 часов, а при k = 3 — уже 10.',
    },
    en: {
      text: 'You are given banana piles <code>piles</code> and a number of hours <code>h</code>. Each hour Koko picks one pile and eats <code>k</code> bananas from it; if the pile has fewer than <code>k</code>, she finishes it and eats nothing else that hour. Return the smallest integer speed <code>k</code> that lets her eat all piles within <code>h</code> hours.',
      limits: '1 ≤ piles.length ≤ 10⁴, piles.length ≤ h ≤ 10⁹, 1 ≤ piles[i] ≤ 10⁹.',
      note: 'k = 4 takes 1 + 2 + 2 + 3 = 8 hours, while k = 3 already takes 10.',
    },
  },
  weightedPick: {
    ex: { in: 'w = [3, 1, 4, 2], r = 4', out: '2' },
    ru: {
      text: 'Дан массив положительных весов <code>w</code>. Метод <code>pickIndex()</code> должен возвращать индекс <code>i</code> с вероятностью <code>w[i] / sum(w)</code>, а вызывать его будут много раз. На стенде случайность заменена явным числом: <code>r</code> — выпавшее случайное целое из [0, sum(w)), и нужно вернуть индекс, который <code>pickIndex()</code> выдаст для этого <code>r</code> (индексу i достаётся ровно w[i] значений r подряд).',
      limits: '1 ≤ w.length ≤ 10⁴, 1 ≤ w[i] ≤ 10⁵, до 10⁴ вызовов pickIndex.',
      note: 'индексу 0 достаются r = 0..2, индексу 1 — r = 3, индексу 2 — r = 4..7, поэтому r = 4 даёт 2.',
    },
    en: {
      text: 'You are given an array of positive weights <code>w</code>. The method <code>pickIndex()</code> must return index <code>i</code> with probability <code>w[i] / sum(w)</code>, and it will be called many times. In the rig the randomness is replaced by an explicit number: <code>r</code> is the random integer drawn from [0, sum(w)), and you return the index that <code>pickIndex()</code> gives for that <code>r</code> (index i owns exactly w[i] consecutive values of r).',
      limits: '1 ≤ w.length ≤ 10⁴, 1 ≤ w[i] ≤ 10⁵, up to 10⁴ calls to pickIndex.',
      note: 'index 0 owns r = 0..2, index 1 owns r = 3, index 2 owns r = 4..7, so r = 4 gives 2.',
    },
  },
  median: {
    ex: { in: 'A = [1, 3, 8, 9, 15], B = [7, 11, 18, 19, 21, 25]', out: '11.0' },
    ru: {
      text: 'Даны два массива <code>A</code> и <code>B</code>, каждый отсортирован по неубыванию (один из них может быть пустым). Верни медиану всех чисел обоих массивов вместе как дробное число: при чётном общем количестве это среднее двух средних чисел. Требуемая сложность — O(log(m + n)).',
      limits: '0 ≤ m, n ≤ 1000, 1 ≤ m + n ≤ 2000, −10⁶ ≤ A[i], B[i] ≤ 10⁶.',
      note: 'всего 11 чисел, шестое по порядку — 11.',
    },
    en: {
      text: 'You are given two arrays <code>A</code> and <code>B</code>, each sorted in non-decreasing order (one of them may be empty). Return the median of all numbers of both arrays together as a floating-point value: when the total count is even, it is the mean of the two middle numbers. The required complexity is O(log(m + n)).',
      limits: '0 ≤ m, n ≤ 1000, 1 ≤ m + n ≤ 2000, −10⁶ ≤ A[i], B[i] ≤ 10⁶.',
      note: 'there are 11 numbers in total, and the sixth one in order is 11.',
    },
  },
  lisTails: {
    ex: { in: 'nums = [2, 5, 3, 7, 11, 8, 10, 13, 6, 3]', out: '6' },
    ru: {
      text: 'Дан целочисленный массив <code>nums</code>. Верни длину самой длинной строго возрастающей подпоследовательности: элементы берутся в исходном порядке, но не обязательно подряд. Нужно решение быстрее O(n²) — за O(n log n).',
      limits: '1 ≤ n ≤ 2500, −10⁴ ≤ nums[i] ≤ 10⁴.',
      note: 'например, подпоследовательность [2, 3, 7, 8, 10, 13].',
    },
    en: {
      text: 'You are given an integer array <code>nums</code>. Return the length of the longest strictly increasing subsequence: elements keep their original order but need not be adjacent. The solution must beat O(n²) and run in O(n log n).',
      limits: '1 ≤ n ≤ 2500, −10⁴ ≤ nums[i] ≤ 10⁴.',
      note: 'for example, the subsequence [2, 3, 7, 8, 10, 13].',
    },
  },
  divideBits: {
    ex: { in: 'dividend = 100, divisor = -7', out: '-14' },
    ru: {
      text: 'Даны два 32-битных целых <code>dividend</code> и <code>divisor</code>. Верни их частное, отбросив дробную часть в сторону нуля, не используя умножение, деление и взятие остатка. Если частное не помещается в 32-битный int, верни <code>2³¹ − 1</code>.',
      limits: '−2³¹ ≤ dividend, divisor ≤ 2³¹ − 1, divisor ≠ 0.',
      note: '100 / −7 = −14,28…, дробная часть отбрасывается к нулю.',
    },
    en: {
      text: 'You are given two 32-bit integers <code>dividend</code> and <code>divisor</code>. Return their quotient truncated toward zero without using multiplication, division or the modulo operator. If the quotient does not fit into a 32-bit int, return <code>2³¹ − 1</code>.',
      limits: '−2³¹ ≤ dividend, divisor ≤ 2³¹ − 1, divisor ≠ 0.',
      note: '100 / −7 = −14.28…, and the fraction is truncated toward zero.',
    },
  },

  /* stack */
  parens: {
    ex: { in: 's = "{[()()]}"', out: 'true' },
    ru: {
      text: 'Дана строка <code>s</code> только из символов <code>( ) [ ] { }</code>. Верни <code>true</code>, если скобки расставлены правильно: каждая открывающая закрыта скобкой того же типа и закрывающие идут в обратном порядке открытия. Иначе верни <code>false</code>.',
      limits: '1 ≤ s.length ≤ 10⁴.',
      note: 'каждая пара закрывается внутри своей внешней пары.',
    },
    en: {
      text: 'You are given a string <code>s</code> made only of <code>( ) [ ] { }</code>. Return <code>true</code> if the brackets are balanced: every opening bracket is closed by one of the same type, and closings come in the reverse order of openings. Otherwise return <code>false</code>.',
      limits: '1 ≤ s.length ≤ 10⁴.',
      note: 'every pair is closed inside its enclosing pair.',
    },
  },
  daily: {
    ex: { in: 't = [73, 74, 75, 71, 69, 72, 76, 73]', out: '[1, 1, 4, 2, 1, 1, 0, 0]' },
    ru: {
      text: 'Дан массив дневных температур <code>t</code>. Верни массив <code>answer</code> той же длины: <code>answer[i]</code> — через сколько дней после дня i впервые будет строго теплее, или 0, если такого дня нет.',
      limits: '1 ≤ n ≤ 10⁵, 30 ≤ t[i] ≤ 100.',
      note: 'после 75 первая более высокая температура — 76, через 4 дня.',
    },
    en: {
      text: 'You are given an array of daily temperatures <code>t</code>. Return an array <code>answer</code> of the same length where <code>answer[i]</code> is the number of days after day i until a strictly warmer day, or 0 if there is none.',
      limits: '1 ≤ n ≤ 10⁵, 30 ≤ t[i] ≤ 100.',
      note: 'after 75 the first higher temperature is 76, four days later.',
    },
  },
  minStack: {
    ex: { in: 'ops = push 5, push 3, push 7, getMin, pop, push 1, getMin, pop, pop, getMin', out: 'getMin: 3, 1, 5' },
    ru: {
      text: 'Спроектируй стек с операциями <code>push(x)</code>, <code>pop()</code>, <code>top()</code> и <code>getMin()</code> — последняя возвращает наименьший элемент в стеке. Каждая операция должна работать за O(1). На стенде задаётся последовательность операций <code>ops</code>; ответ — значения, которые вернули вызовы <code>getMin</code>, по порядку.',
      limits: '−2³¹ ≤ x ≤ 2³¹ − 1; pop, top и getMin вызываются только на непустом стеке; до 3·10⁴ вызовов.',
      note: 'после pop 7 и push 1 минимум 1, после двух pop в стеке остаётся только 5.',
    },
    en: {
      text: 'Design a stack with <code>push(x)</code>, <code>pop()</code>, <code>top()</code> and <code>getMin()</code>, the last one returning the smallest element in the stack. Every operation must take O(1). The rig takes a sequence of operations <code>ops</code>; the answer is the values returned by the <code>getMin</code> calls, in order.',
      limits: '−2³¹ ≤ x ≤ 2³¹ − 1; pop, top and getMin are called only on a non-empty stack; up to 3·10⁴ calls.',
      note: 'after popping 7 and pushing 1 the minimum is 1; after two more pops only 5 is left.',
    },
  },
  histogram: {
    ex: { in: 'heights = [2, 1, 5, 6, 2, 3]', out: '10' },
    ru: {
      text: 'Дан массив <code>heights</code> — высоты столбиков гистограммы, каждый шириной 1, стоящих вплотную. Верни площадь наибольшего прямоугольника, который целиком помещается внутри гистограммы.',
      limits: '1 ≤ n ≤ 10⁵, 0 ≤ heights[i] ≤ 10⁴.',
      note: 'столбики 5 и 6 дают прямоугольник высотой 5 и шириной 2.',
    },
    en: {
      text: 'You are given an array <code>heights</code> of histogram bar heights; every bar has width 1 and they stand side by side. Return the area of the largest rectangle that fits entirely inside the histogram.',
      limits: '1 ≤ n ≤ 10⁵, 0 ≤ heights[i] ≤ 10⁴.',
      note: 'the bars 5 and 6 give a rectangle of height 5 and width 2.',
    },
  },

  /* list */
  cycle: {
    ex: { in: 'n = 8, pos = 2', out: 'true' },
    ru: {
      text: 'Дана голова односвязного списка. Верни <code>true</code>, если, идя по ссылкам <code>next</code>, можно попасть в узел повторно (в списке есть цикл), иначе <code>false</code>. На стенде список задан числами: <code>n</code> узлов с номерами 0…n−1, а <code>next</code> последнего узла ведёт на узел <code>pos</code> (<code>-1</code> — на null). Сам <code>pos</code> решению не передаётся. Дополнительно: справиться с O(1) памяти.',
      limits: 'до 10⁴ узлов, −10⁵ ≤ val ≤ 10⁵, pos = −1 или корректный индекс.',
      note: 'последний узел 7 указывает на узел 2.',
    },
    en: {
      text: 'You are given the head of a singly linked list. Return <code>true</code> if following the <code>next</code> links can reach some node again (the list has a cycle), otherwise <code>false</code>. In the rig the list is described by numbers: <code>n</code> nodes numbered 0…n−1, and the last node\'s <code>next</code> points to node <code>pos</code> (<code>-1</code> means null). The solution does not receive <code>pos</code>. Follow-up: use O(1) memory.',
      limits: 'up to 10⁴ nodes, −10⁵ ≤ val ≤ 10⁵, pos = −1 or a valid index.',
      note: 'the last node 7 points back to node 2.',
    },
  },
  cycleEntry: {
    ex: { in: 'n = 8, pos = 2', out: '2' },
    ru: {
      text: 'Дана голова односвязного списка. Верни узел, с которого начинается цикл, или null, если цикла нет; список менять нельзя, память — O(1). Список на стенде задан так же, как в Linked List Cycle: <code>n</code> узлов 0…n−1, последний ведёт на узел <code>pos</code> (<code>-1</code> — цикла нет). Стенд показывает номер узла входа вместо самого узла (и <code>-1</code> вместо null).',
      limits: 'до 10⁴ узлов, −10⁵ ≤ val ≤ 10⁵, pos = −1 или корректный индекс.',
      note: 'путь 0 → 1 → 2 впервые попадает в цикл в узле 2.',
    },
    en: {
      text: 'You are given the head of a singly linked list. Return the node where the cycle begins, or null if there is no cycle; the list must not be modified and memory must be O(1). The rig describes the list as in Linked List Cycle: <code>n</code> nodes 0…n−1, the last one points to node <code>pos</code> (<code>-1</code> means no cycle). The rig shows the number of the entry node instead of the node itself (and <code>-1</code> instead of null).',
      limits: 'up to 10⁴ nodes, −10⁵ ≤ val ≤ 10⁵, pos = −1 or a valid index.',
      note: 'the walk 0 → 1 → 2 first enters the cycle at node 2.',
    },
  },
  removeNth: {
    ex: { in: 'values = [1, 2, 3, 4, 5], n = 2', out: '[1, 2, 3, 5]' },
    ru: {
      text: 'Дан односвязный список со значениями <code>values</code> и число <code>n</code>. Удали из списка n-й узел, считая с конца, и верни голову получившегося списка (удалить могут и саму голову). Дополнительно: сделать это за один проход.',
      limits: '1 ≤ длина ≤ 30, 0 ≤ val ≤ 100, 1 ≤ n ≤ длина.',
      note: 'второй с конца — узел 4.',
    },
    en: {
      text: 'You are given a singly linked list with values <code>values</code> and a number <code>n</code>. Remove the n-th node counting from the end and return the head of the resulting list (the head itself may be the one removed). Follow-up: do it in a single pass.',
      limits: '1 ≤ length ≤ 30, 0 ≤ val ≤ 100, 1 ≤ n ≤ length.',
      note: 'the second node from the end is 4.',
    },
  },
  reverse: {
    ex: { in: 'values = [1, 2, 3, 4, 5]', out: '[5, 4, 3, 2, 1]' },
    ru: {
      text: 'Дан односвязный список со значениями <code>values</code>. Разверни его, перенаправив ссылки узлов, и верни новую голову. Список может быть пустым.',
      limits: '0 ≤ длина ≤ 5000, −5000 ≤ val ≤ 5000.',
    },
    en: {
      text: 'You are given a singly linked list with values <code>values</code>. Reverse it by redirecting the node links and return the new head. The list may be empty.',
      limits: '0 ≤ length ≤ 5000, −5000 ≤ val ≤ 5000.',
    },
  },
  mergeTwo: {
    ex: { in: 'list1 = [1, 2, 4], list2 = [1, 3, 4, 6, 8]', out: '[1, 1, 2, 3, 4, 4, 6, 8]' },
    ru: {
      text: 'Даны головы двух связных списков <code>list1</code> и <code>list2</code>, каждый отсортирован по неубыванию. Слей их в один отсортированный список из тех же узлов (новые узлы не создаются) и верни его голову. Любой из списков может быть пустым.',
      limits: '0 ≤ длина каждого ≤ 50, −100 ≤ val ≤ 100.',
      note: 'когда list1 кончается, хвост 6, 8 из list2 переходит целиком.',
    },
    en: {
      text: 'You are given the heads of two linked lists <code>list1</code> and <code>list2</code>, each sorted in non-decreasing order. Merge them into one sorted list made of the same nodes (no new nodes) and return its head. Either list may be empty.',
      limits: '0 ≤ length of each ≤ 50, −100 ≤ val ≤ 100.',
      note: 'once list1 runs out, the tail 6, 8 of list2 is attached as a whole.',
    },
  },
  lru: {
    ex: { in: 'capacity = 2, ops = put 1 1, put 2 2, get 1, put 3 3, get 2, put 4 4, get 1, get 3, get 4', out: 'get: 1, -1, -1, 3, 4' },
    ru: {
      text: 'Спроектируй кэш вместимостью <code>capacity</code> с операциями <code>get(key)</code> — значение по ключу или <code>-1</code>, если ключа нет, — и <code>put(key, value)</code> — вставить или обновить. Если после вставки ключей больше, чем <code>capacity</code>, выкидывается ключ, к которому дольше всех не обращались (и get, и put считаются обращением). Обе операции — O(1) в среднем. На стенде задана последовательность <code>ops</code>; ответ — результаты всех <code>get</code> по порядку.',
      limits: '1 ≤ capacity ≤ 3000, 0 ≤ key ≤ 10⁴, 0 ≤ value ≤ 10⁵, до 2·10⁵ вызовов.',
      note: 'put 3 вытесняет ключ 2, а put 4 — ключ 1, к которому обращались раньше, чем к 3.',
    },
    en: {
      text: 'Design a cache with capacity <code>capacity</code> and two operations: <code>get(key)</code> returns the value for the key or <code>-1</code> if it is absent, and <code>put(key, value)</code> inserts or updates it. If an insertion makes the number of keys exceed <code>capacity</code>, the key that was used least recently is evicted (both get and put count as a use). Both operations must take O(1) on average. The rig takes a sequence <code>ops</code>; the answer is the results of all <code>get</code> calls in order.',
      limits: '1 ≤ capacity ≤ 3000, 0 ≤ key ≤ 10⁴, 0 ≤ value ≤ 10⁵, up to 2·10⁵ calls.',
      note: 'put 3 evicts key 2, and put 4 evicts key 1, which was used before key 3.',
    },
  },
  reverseK: {
    ex: { in: 'values = [1, 2, 3, 4, 5, 6, 7, 8], k = 3', out: '[3, 2, 1, 6, 5, 4, 7, 8]' },
    ru: {
      text: 'Дан односвязный список со значениями <code>values</code> и число <code>k</code>. Разверни узлы каждой следующей группы из <code>k</code> узлов; если в конце осталось меньше <code>k</code> узлов, они остаются в прежнем порядке. Менять можно только ссылки, не значения в узлах; верни новую голову. Дополнительно: O(1) дополнительной памяти.',
      limits: '1 ≤ k ≤ длина ≤ 5000, 0 ≤ val ≤ 1000.',
      note: 'группы [1, 2, 3] и [4, 5, 6] развёрнуты, хвост [7, 8] короче 3 и не тронут.',
    },
    en: {
      text: 'You are given a singly linked list with values <code>values</code> and a number <code>k</code>. Reverse the nodes of each consecutive group of <code>k</code> nodes; if fewer than <code>k</code> nodes are left at the end, they keep their order. Only the links may change, not the values in the nodes; return the new head. Follow-up: O(1) extra memory.',
      limits: '1 ≤ k ≤ length ≤ 5000, 0 ≤ val ≤ 1000.',
      note: 'the groups [1, 2, 3] and [4, 5, 6] are reversed; the tail [7, 8] is shorter than 3 and stays.',
    },
  },

  /* tree */
  maxDepth: {
    ex: { in: 'root = [3, 9, 20, 4, null, 15, 7, null, null, null, null, null, 8]', out: '4' },
    ru: {
      text: 'Дан корень бинарного дерева <code>root</code> (на входе — значения по уровням, <code>null</code> — нет ребёнка). Верни максимальную глубину: число узлов на самом длинном пути от корня до листа. У пустого дерева глубина 0.',
      limits: '0 ≤ число узлов ≤ 10⁴, −100 ≤ val ≤ 100.',
      note: 'самый длинный путь 3 → 20 → 7 → 8.',
    },
    en: {
      text: 'You are given the root of a binary tree <code>root</code> (the input lists values level by level, <code>null</code> marks a missing child). Return its maximum depth: the number of nodes on the longest path from the root down to a leaf. An empty tree has depth 0.',
      limits: '0 ≤ number of nodes ≤ 10⁴, −100 ≤ val ≤ 100.',
      note: 'the longest path is 3 → 20 → 7 → 8.',
    },
  },
  levelOrder: {
    ex: { in: 'root = [3, 9, 20, 4, null, 15, 7, null, null, null, null, null, 8]', out: '[[3], [9, 20], [4, 15, 7], [8]]' },
    ru: {
      text: 'Дан корень бинарного дерева <code>root</code>. Верни значения узлов по уровням: список списков, где первый — корень, следующий — его дети и так далее, внутри уровня — слева направо. Для пустого дерева верни пустой список.',
      limits: '0 ≤ число узлов ≤ 2000, −1000 ≤ val ≤ 1000.',
    },
    en: {
      text: 'You are given the root of a binary tree <code>root</code>. Return the node values level by level: a list of lists where the first holds the root, the next holds its children and so on, each level from left to right. For an empty tree return an empty list.',
      limits: '0 ≤ number of nodes ≤ 2000, −1000 ≤ val ≤ 1000.',
    },
  },
  validBst: {
    ex: { in: 'root = [5, 3, 8, 1, 6, 7, 9]', out: 'false' },
    ru: {
      text: 'Дан корень бинарного дерева <code>root</code>. Верни <code>true</code>, если это корректное дерево поиска: для каждого узла все значения в левом поддереве строго меньше его значения, а все в правом — строго больше. Проверять нужно всё поддерево, а не только прямых детей.',
      limits: '1 ≤ число узлов ≤ 10⁴, −2³¹ ≤ val ≤ 2³¹ − 1.',
      note: 'узел 6 — правый ребёнок 3, но он лежит в левом поддереве корня 5, а 6 &gt; 5.',
    },
    en: {
      text: 'You are given the root of a binary tree <code>root</code>. Return <code>true</code> if it is a valid search tree: for every node, all values in its left subtree are strictly smaller than its value and all values in its right subtree are strictly larger. The whole subtree must be checked, not just the direct children.',
      limits: '1 ≤ number of nodes ≤ 10⁴, −2³¹ ≤ val ≤ 2³¹ − 1.',
      note: 'node 6 is the right child of 3, yet it lies in the left subtree of the root 5, and 6 &gt; 5.',
    },
  },
  lca: {
    ex: { in: 'root = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p = 7, q = 8', out: '3' },
    ru: {
      text: 'Дан корень бинарного дерева <code>root</code> и два разных узла <code>p</code> и <code>q</code>, оба есть в дереве. Верни их наименьшего общего предка — самый глубокий узел, у которого в поддереве есть и <code>p</code>, и <code>q</code> (узел считается потомком самого себя). Все значения различны, поэтому на стенде <code>p</code> и <code>q</code> заданы значениями узлов.',
      limits: '2 ≤ число узлов ≤ 10⁵, −10⁹ ≤ val ≤ 10⁹, значения различны, p ≠ q.',
      note: '7 лежит в левом поддереве корня (через 5 и 2), 8 — в правом (через 1), поэтому ответ — сам корень.',
    },
    en: {
      text: 'You are given the root of a binary tree <code>root</code> and two different nodes <code>p</code> and <code>q</code>, both present in the tree. Return their lowest common ancestor: the deepest node whose subtree contains both <code>p</code> and <code>q</code> (a node counts as its own descendant). All values are distinct, so the rig gives <code>p</code> and <code>q</code> as node values.',
      limits: '2 ≤ number of nodes ≤ 10⁵, −10⁹ ≤ val ≤ 10⁹, values are distinct, p ≠ q.',
      note: '7 is in the root\'s left subtree (via 5 and 2) and 8 is in the right one (via 1), so the answer is the root itself.',
    },
  },
  maxPath: {
    ex: { in: 'root = [-10, 9, 20, null, null, 15, 7]', out: '42' },
    ru: {
      text: 'Дан корень бинарного дерева <code>root</code>, значения могут быть отрицательными. Путь — цепочка узлов, где соседние связаны ребром и каждый узел встречается не больше раза; он может начинаться и кончаться где угодно и не обязан проходить через корень, но содержит хотя бы один узел. Верни наибольшую сумму значений на таком пути.',
      limits: '1 ≤ число узлов ≤ 3·10⁴, −1000 ≤ val ≤ 1000.',
      note: 'лучший путь 15 → 20 → 7, корень −10 только уменьшил бы сумму.',
    },
    en: {
      text: 'You are given the root of a binary tree <code>root</code>; values may be negative. A path is a chain of nodes where neighbours are joined by an edge and every node appears at most once; it may start and end anywhere, need not pass through the root, but holds at least one node. Return the largest sum of values on such a path.',
      limits: '1 ≤ number of nodes ≤ 3·10⁴, −1000 ≤ val ≤ 1000.',
      note: 'the best path is 15 → 20 → 7; the root −10 would only lower the sum.',
    },
  },
  invertTree: {
    ex: { in: 'root = [4, 2, 7, 1, 3, 6, 9]', out: '[4, 7, 2, 9, 6, 3, 1]' },
    ru: {
      text: 'Дан корень бинарного дерева <code>root</code>. Отрази дерево зеркально: у каждого узла поменяй местами левое и правое поддерево — и верни корень. Дерево может быть пустым.',
      limits: '0 ≤ число узлов ≤ 100, −100 ≤ val ≤ 100.',
      note: 'по уровням каждый ряд читается в обратном порядке.',
    },
    en: {
      text: 'You are given the root of a binary tree <code>root</code>. Mirror the tree by swapping the left and right subtrees of every node, and return the root. The tree may be empty.',
      limits: '0 ≤ number of nodes ≤ 100, −100 ≤ val ≤ 100.',
      note: 'level by level, every row reads in reverse.',
    },
  },
};
