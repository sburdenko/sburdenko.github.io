/** Full statements, chapters dp, bits, games, design: what is given, what to return, limits and an example that matches the rig's example. */
export const ST_D = {
  /* ---------- dp ---------- */
  climb: {
    ex: { in: 'n = 6', out: '13' },
    ru: {
      text: 'Лестница из <code>n</code> ступеней. За один шаг можно подняться на 1 или на 2 ступени. Верни, сколькими разными способами можно дойти до верха; способы различаются порядком шагов.',
      limits: '1 ≤ n ≤ 45.',
      note: '1 + 1 + 2 + 2 и 2 + 1 + 1 + 2 — разные способы, всего их 13.',
    },
    en: {
      text: 'A staircase has <code>n</code> steps. Each move climbs 1 or 2 steps. Return the number of distinct ways to reach the top; two ways differ if their sequences of moves differ.',
      limits: '1 ≤ n ≤ 45.',
      note: '1 + 1 + 2 + 2 and 2 + 1 + 1 + 2 count as different ways; there are 13 in total.',
    },
  },
  coin: {
    ex: { in: 'coins = [1, 3, 4], amount = 6', out: '2' },
    ru: {
      text: 'Даны номиналы монет <code>coins</code> (каждой монеты сколько угодно) и сумма <code>amount</code>. Верни наименьшее число монет, которыми можно набрать ровно <code>amount</code>, или −1, если эту сумму не собрать. Для <code>amount</code> = 0 ответ 0.',
      limits: '1 ≤ coins.length ≤ 12, 1 ≤ coins[i] ≤ 2³¹ − 1, 0 ≤ amount ≤ 10⁴.',
      note: '6 = 3 + 3; жадный выбор 4 + 1 + 1 дал бы три монеты.',
    },
    en: {
      text: 'Given coin denominations <code>coins</code> (an unlimited supply of each) and a total <code>amount</code>, return the fewest coins that add up to exactly <code>amount</code>, or −1 if that total cannot be made. For <code>amount</code> = 0 the answer is 0.',
      limits: '1 ≤ coins.length ≤ 12, 1 ≤ coins[i] ≤ 2³¹ − 1, 0 ≤ amount ≤ 10⁴.',
      note: '6 = 3 + 3; taking the largest coin first, 4 + 1 + 1, would need three coins.',
    },
  },
  lcs: {
    ex: { in: 'a = "abcde", b = "ace"', out: '3' },
    ru: {
      text: 'Даны строки <code>a</code> и <code>b</code>. Верни длину самой длинной их общей подпоследовательности или 0, если общих символов нет. Подпоследовательность получается из строки удалением части символов без перестановки остальных: «ace» — подпоследовательность «abcde», а «aec» — нет.',
      limits: '1 ≤ длина каждой строки ≤ 1000, только строчные латинские буквы.',
      note: 'общая подпоследовательность наибольшей длины — «ace».',
    },
    en: {
      text: 'Given strings <code>a</code> and <code>b</code>, return the length of their longest common subsequence, or 0 if they share no characters. A subsequence is what remains after deleting some characters without reordering the rest: “ace” is a subsequence of “abcde”, “aec” is not.',
      limits: '1 ≤ length of each string ≤ 1000, lowercase English letters only.',
      note: 'the longest common subsequence is “ace”.',
    },
  },
  lis: {
    ex: { in: 'nums = [10, 9, 2, 5, 3, 7, 101, 18]', out: '4' },
    ru: {
      text: 'Дан целочисленный массив <code>nums</code>. Верни длину самой длинной строго возрастающей подпоследовательности. Подпоследовательность сохраняет порядок элементов, но не обязана быть непрерывной; два равных числа подряд строгий рост нарушают.',
      limits: '1 ≤ n ≤ 2500, −10⁴ ≤ nums[i] ≤ 10⁴.',
      note: 'например, [2, 3, 7, 101] или [2, 5, 7, 18].',
    },
    en: {
      text: 'Given an integer array <code>nums</code>, return the length of its longest strictly increasing subsequence. A subsequence keeps the order of the elements but need not be contiguous; two equal values in a row break strict growth.',
      limits: '1 ≤ n ≤ 2500, −10⁴ ≤ nums[i] ≤ 10⁴.',
      note: 'for example [2, 3, 7, 101] or [2, 5, 7, 18].',
    },
  },
  edit: {
    ex: { in: 'a = "horse", b = "ros"', out: '3' },
    ru: {
      text: 'Даны слова <code>a</code> и <code>b</code>. За одну операцию можно вставить символ, удалить символ или заменить один символ другим. Верни наименьшее число операций, которое превращает <code>a</code> в <code>b</code>.',
      limits: '0 ≤ длина каждого слова ≤ 500, только строчные латинские буквы.',
      note: 'horse → rorse (замена h на r) → rose (удаление r) → ros (удаление e).',
    },
    en: {
      text: 'Given words <code>a</code> and <code>b</code>, one operation inserts a character, deletes a character or replaces one character with another. Return the fewest operations that turn <code>a</code> into <code>b</code>.',
      limits: '0 ≤ length of each word ≤ 500, lowercase English letters only.',
      note: 'horse → rorse (replace h with r) → rose (delete r) → ros (delete e).',
    },
  },
  regex: {
    ex: { in: 's = "aab", p = "c*a*b"', out: 'true' },
    ru: {
      text: 'Даны строка <code>s</code> и шаблон <code>p</code>. В шаблоне «.» совпадает с любым одним символом, а «*» означает ноль или больше повторов символа, который стоит перед ней. Верни <code>true</code>, если шаблон совпадает со всей строкой целиком, а не с её частью.',
      limits: '1 ≤ |s|, |p| ≤ 20; s — строчные латинские буквы, p — они же, «.» и «*»; перед каждой «*» стоит буква или «.».',
      note: '«c*» берёт ноль букв c, «a*» — обе a, «b» совпадает с b.',
    },
    en: {
      text: 'Given a string <code>s</code> and a pattern <code>p</code>, where “.” matches any single character and “*” means zero or more copies of the character right before it. Return <code>true</code> if the pattern matches the whole string, not just a part of it.',
      limits: '1 ≤ |s|, |p| ≤ 20; s is lowercase English letters, p is lowercase letters, “.” and “*”; every “*” follows a letter or “.”.',
      note: '“c*” takes zero c’s, “a*” takes both a’s, and “b” matches b.',
    },
  },
  kadane: {
    ex: { in: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', out: '6' },
    ru: {
      text: 'Дан целочисленный массив <code>nums</code>. Найди непрерывный непустой подмассив с наибольшей суммой и верни эту сумму.',
      limits: '1 ≤ n ≤ 10⁵, −10⁴ ≤ nums[i] ≤ 10⁴.',
      note: 'наибольшую сумму даёт подмассив [4, −1, 2, 1].',
    },
    en: {
      text: 'Given an integer array <code>nums</code>, find the contiguous non-empty subarray with the largest sum and return that sum.',
      limits: '1 ≤ n ≤ 10⁵, −10⁴ ≤ nums[i] ≤ 10⁴.',
      note: 'the subarray [4, −1, 2, 1] has the largest sum.',
    },
  },

  /* ---------- bits ---------- */
  popcount: {
    ex: { in: 'n = 52', out: '3' },
    ru: {
      text: 'Дано неотрицательное целое число <code>n</code>. Верни, сколько единиц в его двоичной записи (вес Хэмминга).',
      limits: 'в оригинале 1 ≤ n ≤ 2³¹ − 1 (в старой версии — любое 32-битное беззнаковое); на стенде 0 ≤ n ≤ 2³² − 1.',
      note: '52 = 110100₂.',
    },
    en: {
      text: 'Given a non-negative integer <code>n</code>, return how many 1 bits its binary form has (its Hamming weight).',
      limits: 'in the original 1 ≤ n ≤ 2³¹ − 1 (an older version allowed any 32-bit unsigned value); in the rig 0 ≤ n ≤ 2³² − 1.',
      note: '52 = 110100₂.',
    },
  },
  missingXor: {
    ex: { in: 'nums = [9, 6, 4, 2, 3, 5, 7, 0, 1]', out: '8' },
    ru: {
      text: 'Массив <code>nums</code> длины n содержит разные числа из диапазона 0..n — все, кроме одного. Верни пропущенное число. Желательно уложиться в O(n) времени и O(1) дополнительной памяти.',
      limits: '1 ≤ n ≤ 10⁴, 0 ≤ nums[i] ≤ n, все числа разные.',
      note: 'n = 9, и из чисел 0..9 нет только 8.',
    },
    en: {
      text: 'An array <code>nums</code> of length n holds distinct numbers from the range 0..n — all of them but one. Return the missing number. Aim for O(n) time and O(1) extra memory.',
      limits: '1 ≤ n ≤ 10⁴, 0 ≤ nums[i] ≤ n, all numbers distinct.',
      note: 'n = 9, and 8 is the only number from 0..9 that is absent.',
    },
  },
  singleIII: {
    ex: { in: 'nums = [1, 2, 1, 3, 2, 5]', out: '[3, 5]' },
    ru: {
      text: 'В массиве <code>nums</code> ровно два числа встречаются по одному разу, а все остальные — ровно по два. Верни эти два числа в любом порядке. Нужно O(n) времени и O(1) дополнительной памяти.',
      limits: '2 ≤ n ≤ 3·10⁴, −2³¹ ≤ nums[i] ≤ 2³¹ − 1.',
      note: 'ответ [5, 3] тоже верен.',
    },
    en: {
      text: 'In the array <code>nums</code> exactly two numbers appear once and every other number appears exactly twice. Return those two numbers in any order, in O(n) time and O(1) extra memory.',
      limits: '2 ≤ n ≤ 3·10⁴, −2³¹ ≤ nums[i] ≤ 2³¹ − 1.',
      note: '[5, 3] is accepted too.',
    },
  },
  countBits: {
    ex: { in: 'n = 12', out: '[0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2]' },
    ru: {
      text: 'Дано число <code>n</code>. Верни массив длины n + 1, где элемент i — число единиц в двоичной записи i, для всех i от 0 до n. Цель — O(n) на весь массив, без отдельного подсчёта битов для каждого числа.',
      limits: '0 ≤ n ≤ 10⁵.',
      note: '7 = 111₂ даёт три единицы, 8 = 1000₂ — одну.',
    },
    en: {
      text: 'Given <code>n</code>, return an array of length n + 1 whose element i is the number of 1 bits in i, for every i from 0 to n. The goal is O(n) for the whole array, without counting the bits of each number separately.',
      limits: '0 ≤ n ≤ 10⁵.',
      note: '7 = 111₂ has three ones, 8 = 1000₂ has one.',
    },
  },
  sumBits: {
    ex: { in: 'a = 13, b = 11', out: '24' },
    ru: {
      text: 'Даны целые числа <code>a</code> и <code>b</code>, возможно отрицательные. Верни их сумму, не пользуясь операторами + и −.',
      limits: '−1000 ≤ a, b ≤ 1000.',
    },
    en: {
      text: 'Given integers <code>a</code> and <code>b</code>, possibly negative, return their sum without using the operators + and −.',
      limits: '−1000 ≤ a, b ≤ 1000.',
    },
  },
  maxXorLimit: {
    ex: { in: 'nums = [5, 2, 4, 6, 6, 3], queries = [[12, 4], [8, 1], [6, 3]]', out: '[15, -1, 5]' },
    ru: {
      text: 'Даны массив неотрицательных чисел <code>nums</code> и запросы <code>queries</code>, каждый — пара [x, m]. Для запроса найди наибольшее x XOR nums[j] среди всех nums[j] ≤ m или −1, если в <code>nums</code> нет ни одного числа ≤ m. Верни массив ответов в порядке запросов.',
      limits: '1 ≤ nums.length, queries.length ≤ 10⁵; 0 ≤ nums[j], x, m ≤ 10⁹.',
      note: '12 XOR 3 = 15; чисел ≤ 1 в nums нет; 6 XOR 3 = 5.',
    },
    en: {
      text: 'Given an array of non-negative numbers <code>nums</code> and queries <code>queries</code>, each a pair [x, m]. For a query find the largest x XOR nums[j] over all nums[j] ≤ m, or −1 if <code>nums</code> has no number ≤ m. Return the answers as an array in query order.',
      limits: '1 ≤ nums.length, queries.length ≤ 10⁵; 0 ≤ nums[j], x, m ≤ 10⁹.',
      note: '12 XOR 3 = 15; nums has no number ≤ 1; 6 XOR 3 = 5.',
    },
  },
  reverseBits: {
    ex: { in: 'n = 43261596, mode = "loop"', out: '964176192' },
    ru: {
      text: 'Дано 32-битное беззнаковое число <code>n</code>. Разверни порядок его битов — бит 0 становится битом 31, бит 1 — битом 30 и так далее — и верни полученное число. Поле <code>mode</code> стенда выбирает, как показать разворот: циклом по битам (loop) или пятью обменами по маскам (masks); ответ от него не зависит.',
      limits: 'в оригинале 0 ≤ n ≤ 2³¹ − 2 и n чётное (в старой версии — любое 32-битное беззнаковое); на стенде 0 ≤ n ≤ 2³² − 1.',
      note: '00000010100101000001111010011100₂ превращается в 00111001011110000010100101000000₂.',
    },
    en: {
      text: 'Given a 32-bit unsigned integer <code>n</code>, reverse the order of its bits — bit 0 becomes bit 31, bit 1 becomes bit 30, and so on — and return the resulting number. The rig field <code>mode</code> picks how the reversal is shown: a loop over the bits (loop) or five mask swaps (masks); the answer does not depend on it.',
      limits: 'in the original 0 ≤ n ≤ 2³¹ − 2 and n is even (an older version allowed any 32-bit unsigned value); in the rig 0 ≤ n ≤ 2³² − 1.',
      note: '00000010100101000001111010011100₂ becomes 00111001011110000010100101000000₂.',
    },
  },

  /* ---------- games ---------- */
  astar: {
    ex: {
      in: 'grid = [[0,0,0,0,0,0,0],[0,0,0,0,0,1,0],[0,1,1,0,0,1,0],[0,0,0,1,1,1,0],[0,1,0,1,0,1,0],[0,1,0,1,0,1,0],[0,0,0,0,0,0,0]], h = "chebyshev"',
      out: '10',
    },
    ru: {
      text: 'Дана квадратная сетка <code>grid</code> из 0 (свободно) и 1 (занято). Путь ведёт из левой верхней клетки в правую нижнюю только по свободным клеткам, и из клетки можно шагнуть в любую из 8 соседних, включая диагональные. Верни длину кратчайшего такого пути в клетках, считая первую и последнюю, или −1, если пути нет (в том числе когда занят один из углов). Поле <code>h</code> стенда выбирает эвристику поиска (chebyshev, octile, manhattan, zero); верный ответ от неё не зависит.',
      limits: '1 ≤ n ≤ 100, grid[i][j] — 0 или 1.',
      note: 'кратчайший путь занимает 10 клеток, то есть 9 шагов.',
    },
    en: {
      text: 'Given a square grid <code>grid</code> of 0 (open) and 1 (blocked). A path goes from the top-left cell to the bottom-right cell over open cells only, and from a cell you may step to any of its 8 neighbors, diagonals included. Return the length of the shortest such path in cells, counting the first and the last, or −1 if there is none (including when a corner is blocked). The rig field <code>h</code> picks the search heuristic (chebyshev, octile, manhattan, zero); the correct answer does not depend on it.',
      limits: '1 ≤ n ≤ 100, grid[i][j] is 0 or 1.',
      note: 'the shortest path covers 10 cells, that is 9 steps.',
    },
  },
  flowField: {
    ex: {
      in: 'cost = [[1,1,1,1,1,0,1],[1,1,0,0,1,1,0],[1,1,3,9,9,1,1],[1,1,0,0,1,1,1],[1,1,1,1,1,1,1]], goals = [[2,6]]',
      out: '→→→→↓#· / ↑↑##→↓# / ↑↑←→→→G / →↓##→↑↑ / →→→→↑↑↑',
    },
    ru: {
      text: 'Это вариант 01 Matrix (#542), где у клеток есть цена, а ответ — стрелки вместо расстояний. Дана карта <code>cost</code> (0 — стена, 1–9 — цена клетки) и цели <code>goals</code> — пары [строка, столбец]; ходить можно в 4 стороны, цена пути — сумма цен его клеток без самой цели. Для каждой свободной клетки, кроме целей, верни, к какому соседу шагнуть, чтобы путь до самой дешёвой из целей был наименьшим по цене; если таких соседей несколько, бери первого в порядке вверх, вправо, вниз, влево. Клетки, от которых до целей не дойти, стрелки не получают.',
      limits: 'на стенде карта до 6 × 8, цены 0–9, от 1 до 3 целей на свободных клетках; в 01 Matrix — до 10⁴ клеток.',
      note: '# — стена, G — цель, · — клетка, отрезанная стенами; клетка (2, 2) ведёт влево — обойти девятки дешевле, чем пройти через них.',
    },
    en: {
      text: 'This is a variant of 01 Matrix (#542) where cells have a cost and the answer is arrows instead of distances. Given a map <code>cost</code> (0 is a wall, 1–9 is the cost of a cell) and goals <code>goals</code> as [row, column] pairs; moves go in 4 directions, and a path costs the sum of its cells, the goal itself excluded. For every open cell except the goals, return which neighbor to step to so that the path to the cheapest goal costs the least; if several neighbors tie, take the first in the order up, right, down, left. Cells that cannot reach any goal get no arrow.',
      limits: 'in the rig the map is up to 6 × 8, costs 0–9, 1 to 3 goals on open cells; 01 Matrix allows up to 10⁴ cells.',
      note: '# is a wall, G the goal, · a cell cut off by walls; cell (2, 2) points left because going around the nines is cheaper than crossing them.',
    },
  },
  spatialGrid: {
    ex: {
      in: 'points = [[1,3],[3,3],[5,3],[2,2],[7,8],[9,1],[11,4],[4,10],[6,6],[12,11],[8,5],[3,7]], queries = [[2,3,1],[6,5,3],[10,10,3]], cell = 3',
      out: '[3, 3, 1]',
    },
    ru: {
      text: 'Даны точки <code>points</code> — пары [x, y] — и запросы <code>queries</code> — тройки [x, y, r], окружности с центром (x, y) и радиусом r. Для каждого запроса посчитай точки внутри окружности или на ней и верни массив ответов в порядке запросов. Стенд принимает ещё размер клетки сетки <code>cell</code>, которого нет в оригинале: каждый r должен быть не больше <code>cell</code>.',
      limits: '1 ≤ points.length, queries.length ≤ 500; 0 ≤ x, y ≤ 500; 1 ≤ r ≤ 500; координаты целые.',
      note: 'в первую окружность попадают (1, 3), (3, 3) и (2, 2) — все на расстоянии 1 от центра.',
    },
    en: {
      text: 'Given points <code>points</code> as [x, y] pairs and queries <code>queries</code> as [x, y, r] triples, circles centered at (x, y) with radius r. For each query count the points inside the circle or on its border, and return the counts as an array in query order. The rig also takes a grid cell size <code>cell</code> that the original lacks: every r must be at most <code>cell</code>.',
      limits: '1 ≤ points.length, queries.length ≤ 500; 0 ≤ x, y ≤ 500; 1 ≤ r ≤ 500; integer coordinates.',
      note: 'the first circle holds (1, 3), (3, 3) and (2, 2), each at distance 1 from the center.',
    },
  },
  unionFind: {
    ex: { in: 'edges = [[1, 2], [3, 4], [1, 3], [5, 6], [4, 5], [2, 6]]', out: '[2, 6]' },
    ru: {
      text: 'Граф был деревом на вершинах 1..n, а потом в него добавили одно ребро между двумя разными вершинами. Дан список его рёбер <code>edges</code> длины n. Верни ребро, после удаления которого граф снова станет деревом; если подходит несколько, верни то, что стоит в <code>edges</code> последним.',
      limits: '3 ≤ n ≤ 1000, 1 ≤ a &lt; b ≤ n, повторных рёбер нет, граф связный.',
      note: 'все шесть рёбер образуют один цикл, и [2, 6] в нём последнее.',
    },
    en: {
      text: 'A graph was a tree on the nodes 1..n, and then one edge between two different nodes was added. Given its edge list <code>edges</code> of length n, return an edge whose removal makes the graph a tree again; if several fit, return the one that comes last in <code>edges</code>.',
      limits: '3 ≤ n ≤ 1000, 1 ≤ a &lt; b ≤ n, no repeated edges, the graph is connected.',
      note: 'all six edges form a single cycle, and [2, 6] is the last of them.',
    },
  },
  swim: {
    ex: { in: 'grid = [[0, 1, 2, 3, 4], [24, 23, 22, 21, 5], [12, 13, 14, 15, 16], [11, 17, 18, 19, 20], [10, 9, 8, 7, 6]]', out: '16' },
    ru: {
      text: 'Дана сетка высот <code>grid</code> n × n, в клетках — разные числа от 0 до n² − 1. В момент t вода стоит на уровне t, и между соседними по стороне клетками можно переплыть мгновенно, если обе не выше t. Верни наименьшее t, при котором можно доплыть из клетки (0, 0) в клетку (n − 1, n − 1).',
      limits: '1 ≤ n ≤ 50, значения различны, 0 ≤ grid[i][j] &lt; n².',
      note: 'путь идёт по спирали: верхний ряд, 5, 16, третья строка справа налево, 11, 10 и нижний ряд до 6.',
    },
    en: {
      text: 'Given an n × n height grid <code>grid</code> holding distinct numbers from 0 to n² − 1. At time t the water level is t, and you can swim instantly between side-adjacent cells if both are no higher than t. Return the smallest t at which you can swim from cell (0, 0) to cell (n − 1, n − 1).',
      limits: '1 ≤ n ≤ 50, values distinct, 0 ≤ grid[i][j] &lt; n².',
      note: 'the path spirals: the top row, 5, 16, the third row right to left, 11, 10 and the bottom row to 6.',
    },
  },
  kruskal: {
    ex: { in: 'points = [[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]]', out: '20' },
    ru: {
      text: 'Даны точки <code>points</code> на плоскости — пары [x, y]. Соединить точки (x₁, y₁) и (x₂, y₂) стоит |x₁ − x₂| + |y₁ − y₂|. Верни наименьшую общую стоимость соединений, при которой все точки связаны, то есть между любыми двумя есть ровно один путь.',
      limits: '1 ≤ n ≤ 1000, −10⁶ ≤ x, y ≤ 10⁶, все точки разные.',
      note: 'соединения (2, 2)–(5, 2), (0, 0)–(2, 2), (5, 2)–(7, 0) и (2, 2)–(3, 10) стоят 3 + 4 + 4 + 9.',
    },
    en: {
      text: 'Given points <code>points</code> on a plane as [x, y] pairs. Connecting (x₁, y₁) and (x₂, y₂) costs |x₁ − x₂| + |y₁ − y₂|. Return the minimum total cost of connections that link all the points, so that any two are joined by exactly one path.',
      limits: '1 ≤ n ≤ 1000, −10⁶ ≤ x, y ≤ 10⁶, all points distinct.',
      note: 'the links (2, 2)–(5, 2), (0, 0)–(2, 2), (5, 2)–(7, 0) and (2, 2)–(3, 10) cost 3 + 4 + 4 + 9.',
    },
  },
  pacificAtlantic: {
    ex: {
      in: 'heights = [[1, 2, 2, 3, 5], [3, 2, 3, 4, 4], [2, 4, 5, 3, 1], [6, 7, 1, 4, 5], [5, 1, 1, 2, 4]]',
      out: '[[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]]',
    },
    ru: {
      text: 'Дана карта высот <code>heights</code> m × n. Тихий океан омывает верхний и левый края, Атлантический — нижний и правый. Вода перетекает из клетки в соседнюю по стороне, если та не выше, а из краевой клетки — в прилегающий океан. Верни координаты [r, c] всех клеток, из которых вода может дойти и до Тихого, и до Атлантического; порядок не важен.',
      limits: '1 ≤ m, n ≤ 200, 0 ≤ heights[r][c] ≤ 10⁵.',
      note: 'из (2, 2) высотой 5 вода доходит до Тихого через (1, 2) и (0, 2), а до Атлантического — через (2, 3) и (2, 4).',
    },
    en: {
      text: 'Given an m × n height map <code>heights</code>. The Pacific touches the top and left edges, the Atlantic the bottom and right edges. Water flows from a cell to a side-adjacent cell that is not higher, and from an edge cell into the ocean it borders. Return the coordinates [r, c] of all cells from which water can reach both the Pacific and the Atlantic, in any order.',
      limits: '1 ≤ m, n ≤ 200, 0 ≤ heights[r][c] ≤ 10⁵.',
      note: 'from (2, 2), height 5, water reaches the Pacific through (1, 2) and (0, 2) and the Atlantic through (2, 3) and (2, 4).',
    },
  },

  /* ---------- design ---------- */
  trie: {
    ex: {
      in: 'ops = insert "apple", search "apple", search "app", startsWith "app", insert "app", search "app", insert "ape", search "apt"',
      out: 'null, true, false, true, null, true, null, false',
    },
    ru: {
      text: 'Реализуй префиксное дерево с тремя операциями: <code>insert(word)</code> сохраняет слово, <code>search(word)</code> отвечает, сохранено ли ровно это слово, <code>startsWith(prefix)</code> — начинается ли с <code>prefix</code> хоть одно сохранённое слово. Дана последовательность операций <code>ops</code>; верни их результаты по порядку (у insert — null).',
      limits: '1 ≤ длина слова и префикса ≤ 2000, только строчные латинские буквы, всего не больше 3·10⁴ вызовов.',
      note: 'пока «app» не вставлено, это лишь префикс «apple»: search даёт false, а startsWith — true.',
    },
    en: {
      text: 'Implement a prefix tree with three operations: <code>insert(word)</code> stores a word, <code>search(word)</code> tells whether exactly this word is stored, <code>startsWith(prefix)</code> tells whether any stored word begins with <code>prefix</code>. Given a sequence of operations <code>ops</code>, return their results in order (null for insert).',
      limits: '1 ≤ word and prefix length ≤ 2000, lowercase English letters only, at most 3·10⁴ calls in total.',
      note: 'until “app” is inserted it is only a prefix of “apple”: search returns false, startsWith returns true.',
    },
  },
  serialize: {
    ex: { in: 'root = [1, 2, 3, null, null, 4, 5]', out: '[1, 2, 3, null, null, 4, 5]' },
    ru: {
      text: 'Напиши две функции: <code>serialize(root)</code> превращает двоичное дерево в строку, а <code>deserialize(data)</code> строит по этой строке дерево той же формы и с теми же значениями. Формат строки выбираешь сам; важно лишь, чтобы deserialize(serialize(root)) возвращал исходное дерево — и пустое, и с повторяющимися или отрицательными значениями.',
      limits: 'от 0 до 10⁴ узлов, −1000 ≤ Node.val ≤ 1000.',
      note: 'после serialize и deserialize получается то же дерево; промежуточная строка может быть любой.',
    },
    en: {
      text: 'Write two functions: <code>serialize(root)</code> turns a binary tree into a string, and <code>deserialize(data)</code> builds from that string a tree of the same shape with the same values. The string format is up to you; all that matters is that deserialize(serialize(root)) returns the original tree, including an empty one and one with repeated or negative values.',
      limits: '0 to 10⁴ nodes, −1000 ≤ Node.val ≤ 1000.',
      note: 'serialize followed by deserialize gives back the same tree; the string in between can be anything.',
    },
  },
  circularQueue: {
    ex: {
      in: 'k = 3, ops = enQueue 1, enQueue 2, enQueue 3, enQueue 4, Rear, isFull, deQueue, enQueue 4, Rear, deQueue, deQueue, Front, deQueue, deQueue, isEmpty',
      out: 'true, true, true, false, 3, true, true, true, 4, true, true, 4, true, false, true',
    },
    ru: {
      text: 'Реализуй очередь FIFO на <code>k</code> ячейках фиксированного размера, где освободившиеся ячейки используются снова. <code>enQueue(x)</code> добавляет в хвост, <code>deQueue()</code> убирает из головы, обе возвращают true или false, если очередь полна или пуста; <code>Front()</code> и <code>Rear()</code> возвращают первый и последний элемент или −1 на пустой очереди; есть ещё <code>isEmpty()</code> и <code>isFull()</code>. Дана последовательность операций <code>ops</code>; верни их результаты по порядку.',
      limits: '1 ≤ k ≤ 1000, 0 ≤ x ≤ 1000, не больше 3000 вызовов.',
      note: 'четвёртый enQueue не помещается в три ячейки, а после deQueue освободившееся место занимает 4.',
    },
    en: {
      text: 'Implement a FIFO queue on <code>k</code> fixed slots where freed slots are reused. <code>enQueue(x)</code> adds to the tail and <code>deQueue()</code> removes from the head, both returning true, or false when the queue is full or empty; <code>Front()</code> and <code>Rear()</code> return the first and last element, or −1 on an empty queue; there are also <code>isEmpty()</code> and <code>isFull()</code>. Given a sequence of operations <code>ops</code>, return their results in order.',
      limits: '1 ≤ k ≤ 1000, 0 ≤ x ≤ 1000, at most 3000 calls.',
      note: 'the fourth enQueue does not fit into three slots; after a deQueue the freed slot takes 4.',
    },
  },
  lfu: {
    ex: {
      in: 'capacity = 2, ops = put 1 1, put 2 2, get 1, put 3 3, get 2, get 3, put 4 4, get 1, get 3, get 4, put 4 7',
      out: 'null, null, 1, null, -1, 3, null, -1, 3, 4, null',
    },
    ru: {
      text: 'Реализуй кэш вместимостью <code>capacity</code> с операциями <code>get(key)</code> — значение или −1, если ключа нет, — и <code>put(key, value)</code> — вставить ключ или обновить его значение; обе за O(1) в среднем. Каждый get и put по ключу увеличивает его счётчик обращений. Если put добавляет новый ключ в полный кэш, сначала вытесняется ключ с наименьшим счётчиком, а среди равных — тот, к которому дольше всего не обращались. Дана последовательность операций <code>ops</code>; верни их результаты по порядку (у put — null).',
      limits: '1 ≤ capacity ≤ 10⁴, 0 ≤ key ≤ 10⁵, 0 ≤ value ≤ 10⁹, не больше 2·10⁵ вызовов.',
      note: 'put 3 вытесняет ключ 2 (одно обращение против двух), а put 4 — ключ 1: у 1 и 3 по два обращения, но 1 трогали раньше.',
    },
    en: {
      text: 'Implement a cache of capacity <code>capacity</code> with <code>get(key)</code> — the value, or −1 if the key is absent — and <code>put(key, value)</code> — insert the key or update its value; both in O(1) on average. Every get and put on a key raises its use counter. When put adds a new key to a full cache, it first evicts the key with the smallest counter, and among ties the one used longest ago. Given a sequence of operations <code>ops</code>, return their results in order (null for put).',
      limits: '1 ≤ capacity ≤ 10⁴, 0 ≤ key ≤ 10⁵, 0 ≤ value ≤ 10⁹, at most 2·10⁵ calls.',
      note: 'put 3 evicts key 2 (one use against two), and put 4 evicts key 1: keys 1 and 3 both have two uses, but 1 was touched earlier.',
    },
  },
};
