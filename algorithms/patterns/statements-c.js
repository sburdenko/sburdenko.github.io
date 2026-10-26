/** Full statements, chapters graph, heap, paths, back, greedy: what is given, what to return, limits and an example that matches the rig's example. */
export const ST_C = {
  /* graph */
  flood: {
    ex: { in: 'image = [[1,1,1,0],[1,1,0,0],[1,0,1,1],[0,1,1,1]], sr = 1, sc = 1, color = 2', out: '[[2,2,2,0],[2,2,0,0],[2,0,1,1],[0,1,1,1]]' },
    ru: {
      text: 'Дана картинка — матрица <code>image</code>, где число в клетке означает цвет пикселя, стартовая клетка <code>(sr, sc)</code> и новый цвет <code>color</code>. Перекрась стартовую клетку и все клетки того же исходного цвета, до которых от неё можно дойти шагами вверх, вниз, влево и вправо. Верни изменённую матрицу. Если исходный цвет уже равен <code>color</code>, картинка не меняется.',
      limits: '1 ≤ m, n ≤ 50, 0 ≤ image[i][j], color &lt; 2¹⁶.',
      note: 'единица в клетке (2, 2) не перекрашена: её отделяют нули.',
    },
    en: {
      text: 'You get an image as a matrix <code>image</code>, where each number is a pixel colour, a start cell <code>(sr, sc)</code> and a new colour <code>color</code>. Repaint the start cell and every cell of the same original colour reachable from it by steps up, down, left and right. Return the modified matrix. If the original colour already equals <code>color</code>, the image stays as it is.',
      limits: '1 ≤ m, n ≤ 50, 0 ≤ image[i][j], color &lt; 2¹⁶.',
      note: 'the 1 at cell (2, 2) keeps its colour: zeros cut it off.',
    },
  },
  islands: {
    ex: { in: 'grid = [["1","1","0","0","0","1"],["1","0","0","1","0","1"],["0","0","1","1","0","0"],["0","0","0","0","0","1"],["1","1","0","0","1","1"]]', out: '5' },
    ru: {
      text: 'Дана сетка <code>grid</code> из <code>"1"</code> (суша) и <code>"0"</code> (вода). Остров — группа клеток суши, соединённых по горизонтали или вертикали; соседство по диагонали не считается. Всё за краями сетки — вода. Верни число островов.',
      limits: '1 ≤ m, n ≤ 300.',
    },
    en: {
      text: 'You get a grid <code>grid</code> of <code>"1"</code> (land) and <code>"0"</code> (water). An island is a group of land cells joined horizontally or vertically; diagonal neighbours do not count. Everything beyond the edges is water. Return the number of islands.',
      limits: '1 ≤ m, n ≤ 300.',
    },
  },
  islandPerimeter: {
    ex: { in: 'grid = [[0,1,0,0],[1,1,1,0],[0,1,0,0],[1,1,0,0]]', out: '16' },
    ru: {
      text: 'Дана сетка <code>grid</code>: 1 — суша, 0 — вода, каждая клетка — квадрат со стороной 1. Суша образует ровно один остров (клетки связаны по горизонтали и вертикали), внутри острова нет озёр, вокруг сетки — вода. Верни периметр острова.',
      limits: '1 ≤ m, n ≤ 100.',
      note: '7 клеток суши дают 28 сторон, 6 общих сторон съедают по 2: 28 − 12 = 16.',
    },
    en: {
      text: 'You get a grid <code>grid</code>: 1 is land, 0 is water, and every cell is a unit square. The land forms exactly one island (cells joined horizontally and vertically), the island has no lakes, and water surrounds the grid. Return the perimeter of the island.',
      limits: '1 ≤ m, n ≤ 100.',
      note: '7 land cells give 28 sides, and 6 shared sides remove 2 each: 28 − 12 = 16.',
    },
  },
  oranges: {
    ex: { in: 'grid = [[2,1,1,0,1],[1,1,0,1,1],[0,1,1,1,1],[0,0,1,1,2]]', out: '3' },
    ru: {
      text: 'Дана сетка <code>grid</code>: 0 — пустая клетка, 1 — свежий апельсин, 2 — гнилой. Каждую минуту свежий апельсин, соседний по стороне с гнилым, сгнивает. Верни, через сколько минут не останется ни одного свежего апельсина, или −1, если какой-то не сгниёт никогда. Если свежих нет с самого начала, ответ 0.',
      limits: '1 ≤ m, n ≤ 10, grid[i][j] ∈ {0, 1, 2}.',
      note: 'гниль идёт из двух углов сразу, и последние свежие сгнивают на третьей минуте.',
    },
    en: {
      text: 'You get a grid <code>grid</code>: 0 is an empty cell, 1 a fresh orange, 2 a rotten one. Every minute each fresh orange next to a rotten one (sharing a side) turns rotten. Return the number of minutes until no fresh orange is left, or −1 if some orange never rots. If there are no fresh oranges at the start, the answer is 0.',
      limits: '1 ≤ m, n ≤ 10, grid[i][j] ∈ {0, 1, 2}.',
      note: 'rot spreads from two corners at once, and the last fresh oranges go bad in minute three.',
    },
  },
  course: {
    ex: { in: 'n = 6, prerequisites = [[1,0],[2,0],[3,1],[3,2],[4,3],[5,4]]', out: 'true' },
    ru: {
      text: 'Есть <code>n</code> курсов с номерами от 0 до n − 1 и список <code>prerequisites</code>: пара <code>[a, b]</code> значит, что перед курсом <code>a</code> нужно пройти курс <code>b</code>. Верни <code>true</code>, если все курсы можно пройти в каком-то порядке, и <code>false</code>, если нельзя.',
      limits: '1 ≤ n ≤ 2000, 0 ≤ prerequisites.length ≤ 5000, все пары различны.',
      note: 'подходит порядок 0, 1, 2, 3, 4, 5 — циклов в зависимостях нет.',
    },
    en: {
      text: 'There are <code>n</code> courses numbered 0 to n − 1 and a list <code>prerequisites</code>: the pair <code>[a, b]</code> means course <code>b</code> must be taken before course <code>a</code>. Return <code>true</code> if all courses can be finished in some order, and <code>false</code> otherwise.',
      limits: '1 ≤ n ≤ 2000, 0 ≤ prerequisites.length ≤ 5000, all pairs are distinct.',
      note: 'the order 0, 1, 2, 3, 4, 5 works — the dependencies have no cycle.',
    },
  },
  ladder: {
    ex: { in: 'begin = "hit", end = "cog", words = ["hot","dot","dog","lot","log","cog"]', out: '5' },
    ru: {
      text: 'Даны слова <code>begin</code> и <code>end</code> одной длины и словарь <code>words</code>. За один шаг можно заменить в слове ровно одну букву, и каждое получившееся слово должно быть в словаре (<code>begin</code> в словаре быть не обязано). Верни число слов в самой короткой цепочке от <code>begin</code> до <code>end</code>, считая оба конца, или 0, если такой цепочки нет.',
      limits: '1 ≤ длина слова ≤ 10, 1 ≤ words.length ≤ 5000, только строчные латинские буквы, слова словаря различны, begin ≠ end.',
      note: 'кратчайшая цепочка hit → hot → dot → dog → cog состоит из 5 слов.',
    },
    en: {
      text: 'You get two words <code>begin</code> and <code>end</code> of equal length and a word list <code>words</code>. One step changes exactly one letter, and every word you get must be in the list (<code>begin</code> itself need not be). Return the number of words in the shortest chain from <code>begin</code> to <code>end</code>, counting both ends, or 0 if no chain exists.',
      limits: '1 ≤ word length ≤ 10, 1 ≤ words.length ≤ 5000, lowercase English letters only, list words are distinct, begin ≠ end.',
      note: 'the shortest chain hit → hot → dot → dog → cog has 5 words.',
    },
  },
  cloneGraph: {
    ex: { in: 'edges = [[1,2],[1,4],[2,3],[3,4]]', out: '[[2,4],[1,3],[2,4],[1,3]]' },
    ru: {
      text: 'Дана ссылка на узел связного неориентированного графа; у каждого узла есть значение <code>val</code> и список соседей. Верни глубокую копию графа: каждому узлу — новый объект с тем же значением, связанный с копиями тех же соседей; ни одна ссылка не должна вести в старый граф. На стенде граф задан списком рёбер <code>edges</code> (пара <code>a b</code> — ребро), узлы пронумерованы 1..n, а исходная ссылка указывает на узел 1.',
      limits: 'до 100 узлов, значения 1..100 и различны, нет петель и кратных рёбер.',
      note: 'квадрат 1–2–3–4: у копий узлов 1 и 3 соседи 2 и 4, у копий 2 и 4 — соседи 1 и 3.',
    },
    en: {
      text: 'You get a reference to a node of a connected undirected graph; each node has a value <code>val</code> and a list of neighbours. Return a deep copy: a new object for every node with the same value, linked to the copies of the same neighbours, with no reference back into the old graph. In the rig the graph is a list of edges <code>edges</code> (the pair <code>a b</code> is an edge), nodes are numbered 1..n, and the given reference points to node 1.',
      limits: 'up to 100 nodes, values 1..100 and distinct, no self-loops or repeated edges.',
      note: 'a square 1–2–3–4: the copies of 1 and 3 link to 2 and 4, the copies of 2 and 4 link to 1 and 3.',
    },
  },

  /* heap */
  kth: {
    ex: { in: 'k = 3, nums = [4, 1, 7, 3, 8, 5, 9, 2]', out: '7' },
    ru: {
      text: 'Даны массив целых чисел <code>nums</code> и число <code>k</code>. Верни k-й по величине элемент — k-й в порядке убывания, а не k-й среди различных значений (повторы считаются отдельно).',
      limits: '1 ≤ k ≤ n ≤ 10⁵, −10⁴ ≤ nums[i] ≤ 10⁴.',
      note: 'по убыванию идут 9, 8, 7 — третий 7.',
    },
    en: {
      text: 'You get an integer array <code>nums</code> and a number <code>k</code>. Return the k-th largest element — k-th in descending order, not k-th among distinct values (duplicates count separately).',
      limits: '1 ≤ k ≤ n ≤ 10⁵, −10⁴ ≤ nums[i] ≤ 10⁴.',
      note: 'in descending order come 9, 8, 7 — the third is 7.',
    },
  },
  stones: {
    ex: { in: 'stones = [2, 7, 4, 1, 8, 1]', out: '1' },
    ru: {
      text: 'Дан массив весов камней <code>stones</code>. Каждый ход берутся два самых тяжёлых камня x ≤ y: если веса равны, оба исчезают, иначе остаётся один камень весом y − x. Игра идёт, пока камней больше одного. Верни вес оставшегося камня или 0, если не осталось ни одного.',
      limits: '1 ≤ stones.length ≤ 30, 1 ≤ stones[i] ≤ 1000.',
      note: '8 и 7 дают 1, 4 и 2 дают 2, 2 и 1 дают 1, 1 и 1 исчезают — остаётся 1.',
    },
    en: {
      text: 'You get an array of stone weights <code>stones</code>. Each turn take the two heaviest stones x ≤ y: if they are equal, both vanish, otherwise one stone of weight y − x remains. Play while more than one stone is left. Return the weight of the last stone, or 0 if none is left.',
      limits: '1 ≤ stones.length ≤ 30, 1 ≤ stones[i] ≤ 1000.',
      note: '8 and 7 leave 1, 4 and 2 leave 2, 2 and 1 leave 1, 1 and 1 vanish — 1 remains.',
    },
  },
  topK: {
    ex: { in: 'k = 2, nums = [1, 1, 1, 2, 2, 3, 4, 4, 4, 4, 5]', out: '[4, 1]' },
    ru: {
      text: 'Даны массив целых чисел <code>nums</code> и число <code>k</code>. Верни <code>k</code> значений, которые встречаются чаще всего, в любом порядке. Гарантируется, что ответ однозначен. Решение должно быть быстрее O(n log n).',
      limits: '1 ≤ n ≤ 10⁵, −10⁴ ≤ nums[i] ≤ 10⁴, k не больше числа различных значений.',
      note: '4 встречается четыре раза, 1 — три, остальные реже.',
    },
    en: {
      text: 'You get an integer array <code>nums</code> and a number <code>k</code>. Return the <code>k</code> most frequent values in any order. The answer is guaranteed to be unique. The solution must beat O(n log n).',
      limits: '1 ≤ n ≤ 10⁵, −10⁴ ≤ nums[i] ≤ 10⁴, k is at most the number of distinct values.',
      note: '4 occurs four times, 1 three times, the rest less often.',
    },
  },
  mergeK: {
    ex: { in: 'lists = [[1,4,5],[1,3,4],[2,6]]', out: '[1,1,2,3,4,4,5,6]' },
    ru: {
      text: 'Дан массив <code>lists</code> из k связных списков, каждый отсортирован по возрастанию. Слей их в один отсортированный список и верни его голову. Списки могут быть пустыми, как и сам массив.',
      limits: '0 ≤ k ≤ 10⁴, длина списка ≤ 500, суммарно ≤ 10⁴ узлов, −10⁴ ≤ val ≤ 10⁴.',
    },
    en: {
      text: 'You get an array <code>lists</code> of k linked lists, each sorted in ascending order. Merge them into one sorted list and return its head. Lists may be empty, and so may the array.',
      limits: '0 ≤ k ≤ 10⁴, list length ≤ 500, at most 10⁴ nodes in total, −10⁴ ≤ val ≤ 10⁴.',
    },
  },
  medianStream: {
    ex: { in: 'stream = [5, 15, 1, 3, 8, 7, 9, 10]', out: '[5, 10, 5, 4, 5, 6, 7, 7.5]' },
    ru: {
      text: 'Числа из <code>stream</code> приходят по одному. После каждого нужно назвать медиану всех пришедших: среднее по величине число, а при чётном количестве — полусумму двух средних. Верни список медиан. В оригинале это класс <code>MedianFinder</code> с методами <code>addNum</code> и <code>findMedian</code>; стенд вызывает <code>findMedian</code> после каждого <code>addNum</code>.',
      limits: '−10⁵ ≤ num ≤ 10⁵, до 5·10⁴ вызовов.',
      note: 'после всех восьми чисел средние — 7 и 8, медиана 7.5.',
    },
    en: {
      text: 'Numbers from <code>stream</code> arrive one at a time. After each one, report the median of everything so far: the middle value, or the mean of the two middle values when the count is even. Return the list of medians. The original is a class <code>MedianFinder</code> with <code>addNum</code> and <code>findMedian</code>; the rig calls <code>findMedian</code> after every <code>addNum</code>.',
      limits: '−10⁵ ≤ num ≤ 10⁵, up to 5·10⁴ calls.',
      note: 'after all eight numbers the middle ones are 7 and 8, so the median is 7.5.',
    },
  },
  kClosest: {
    ex: { in: 'points = [[3,3],[5,-1],[-2,4],[1,-2],[-4,-3],[0,2],[6,1]], k = 3', out: '[[3,3],[0,2],[1,-2]]' },
    ru: {
      text: 'Дан массив точек <code>points</code>, где <code>points[i] = [x, y]</code>, и число <code>k</code>. Верни <code>k</code> точек, ближайших к началу координат (0, 0) по обычному евклидову расстоянию. Порядок точек в ответе любой; гарантируется, что ответ однозначен.',
      limits: '1 ≤ k ≤ points.length ≤ 10⁴, −10⁴ ≤ x, y ≤ 10⁴.',
      note: 'квадраты расстояний у ответа 18, 4 и 5, у остальных точек — от 20.',
    },
    en: {
      text: 'You get an array of points <code>points</code>, where <code>points[i] = [x, y]</code>, and a number <code>k</code>. Return the <code>k</code> points closest to the origin (0, 0) by ordinary Euclidean distance. The points may come in any order; the answer is guaranteed to be unique.',
      limits: '1 ≤ k ≤ points.length ≤ 10⁴, −10⁴ ≤ x, y ≤ 10⁴.',
      note: 'the squared distances of the answer are 18, 4 and 5; every other point has 20 or more.',
    },
  },

  /* paths */
  nearestZero: {
    ex: { in: 'mat = [[1,1,1,0,1],[1,1,1,1,1],[0,1,1,1,1],[1,1,1,1,0]]', out: '[[2,2,1,0,1],[1,2,2,1,2],[0,1,2,2,1],[1,2,2,1,0]]' },
    ru: {
      text: 'Дана матрица <code>mat</code> из 0 и 1. Верни матрицу того же размера, где в каждой клетке стоит расстояние до ближайшего нуля. Ходить можно только вверх, вниз, влево и вправо, один шаг — расстояние 1. Хотя бы один ноль в матрице есть.',
      limits: '1 ≤ m, n ≤ 10⁴, m·n ≤ 10⁴.',
    },
    en: {
      text: 'You get a matrix <code>mat</code> of 0s and 1s. Return a matrix of the same size where each cell holds the distance to the nearest zero. Moves go only up, down, left and right, and one step is distance 1. The matrix has at least one zero.',
      limits: '1 ≤ m, n ≤ 10⁴, m·n ≤ 10⁴.',
    },
  },
  networkDelay: {
    ex: { in: 'times = [[1,2,4],[1,3,1],[3,2,2],[2,3,1],[2,4,1],[3,4,5],[3,5,7],[4,5,3]], n = 5, k = 1', out: '7' },
    ru: {
      text: 'Есть сеть из <code>n</code> узлов с номерами 1..n и список <code>times</code>: тройка <code>[u, v, w]</code> — ориентированное ребро из <code>u</code> в <code>v</code>, по которому сигнал идёт <code>w</code> единиц времени. Из узла <code>k</code> отправляют сигнал. Верни, через какое время его получат все узлы, или −1, если до какого-то узла он не дойдёт.',
      limits: '1 ≤ k ≤ n ≤ 100, 1 ≤ times.length ≤ 6000, 0 ≤ w ≤ 100, пары (u, v) различны, u ≠ v.',
      note: 'дольше всех ждёт узел 5: 1 → 3 → 2 → 4 → 5 за 1 + 2 + 1 + 3 = 7.',
    },
    en: {
      text: 'A network has <code>n</code> nodes numbered 1..n and a list <code>times</code>: the triple <code>[u, v, w]</code> is a directed edge from <code>u</code> to <code>v</code> that a signal crosses in <code>w</code> time units. A signal is sent from node <code>k</code>. Return how long it takes for every node to receive it, or −1 if some node never does.',
      limits: '1 ≤ k ≤ n ≤ 100, 1 ≤ times.length ≤ 6000, 0 ≤ w ≤ 100, pairs (u, v) are distinct, u ≠ v.',
      note: 'node 5 waits longest: 1 → 3 → 2 → 4 → 5 takes 1 + 2 + 1 + 3 = 7.',
    },
  },
  minEffort: {
    ex: { in: 'heights = [[5,5,6,2],[7,7,6,8],[3,1,6,4]]', out: '2' },
    ru: {
      text: 'Дана карта высот <code>heights</code>. Нужно пройти из левой верхней клетки в правую нижнюю, шагая вверх, вниз, влево или вправо. Усилие маршрута — наибольшая абсолютная разница высот между двумя соседними клетками на нём. Верни наименьшее возможное усилие.',
      limits: '1 ≤ m, n ≤ 100, 1 ≤ heights[i][j] ≤ 10⁶.',
      note: 'маршрут 5 → 5 → 6 → 6 → 6 → 4 обходится перепадом 2, а в угол с высотой 4 меньше чем за 2 не войти.',
    },
    en: {
      text: 'You get a height map <code>heights</code>. Walk from the top-left cell to the bottom-right one, stepping up, down, left or right. The effort of a route is the largest absolute height difference between two neighbouring cells on it. Return the smallest possible effort.',
      limits: '1 ≤ m, n ≤ 100, 1 ≤ heights[i][j] ≤ 10⁶.',
      note: 'the route 5 → 5 → 6 → 6 → 6 → 4 costs 2, and the corner of height 4 cannot be entered for less.',
    },
  },
  obstacles: {
    ex: { in: 'grid = [[0,0,0],[1,1,0],[0,0,0],[0,1,1],[0,0,0]], k = 1', out: '6' },
    ru: {
      text: 'Дана сетка <code>grid</code>: 0 — свободная клетка, 1 — стена. За шаг можно перейти в соседнюю по стороне клетку; по пути разрешено снести не больше <code>k</code> стен. Верни наименьшее число шагов от левой верхней клетки до правой нижней или −1, если дойти нельзя. Обе угловые клетки свободны.',
      limits: '1 ≤ m, n ≤ 40, 1 ≤ k ≤ m·n.',
      note: 'сломав стену в клетке (3, 2), идём прямо за 6 шагов; без ломаний путь занял бы 10.',
    },
    en: {
      text: 'You get a grid <code>grid</code>: 0 is a free cell, 1 a wall. A step moves to a cell sharing a side; along the way you may knock down at most <code>k</code> walls. Return the fewest steps from the top-left cell to the bottom-right one, or −1 if it cannot be reached. Both corner cells are free.',
      limits: '1 ≤ m, n ≤ 40, 1 ≤ k ≤ m·n.',
      note: 'breaking the wall at (3, 2) gives a straight route of 6 steps; without it the route takes 10.',
    },
  },

  /* back */
  subsets: {
    ex: { in: 'nums = [1, 2, 3]', out: '[[1,2,3],[1,2],[1,3],[1],[2,3],[2],[3],[]]' },
    ru: {
      text: 'Дан массив <code>nums</code> из различных целых чисел. Верни все его подмножества, включая пустое и сам массив. Повторов в ответе быть не должно; порядок подмножеств и чисел внутри них любой.',
      limits: '1 ≤ n ≤ 10, −10 ≤ nums[i] ≤ 10, числа различны.',
      note: 'у трёх чисел 2³ = 8 подмножеств.',
    },
    en: {
      text: 'You get an array <code>nums</code> of distinct integers. Return all of its subsets, including the empty one and the whole array. No subset may repeat; the order of subsets and of numbers inside them does not matter.',
      limits: '1 ≤ n ≤ 10, −10 ≤ nums[i] ≤ 10, numbers are distinct.',
      note: 'three numbers have 2³ = 8 subsets.',
    },
  },
  perms: {
    ex: { in: 'nums = [1, 2, 3]', out: '[[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]]' },
    ru: {
      text: 'Дан массив <code>nums</code> из различных целых чисел. Верни все перестановки — все способы выстроить эти числа в ряд, каждое ровно по одному разу. Порядок перестановок в ответе любой.',
      limits: '1 ≤ n ≤ 6, −10 ≤ nums[i] ≤ 10, числа различны.',
      note: 'у трёх чисел 3! = 6 перестановок.',
    },
    en: {
      text: 'You get an array <code>nums</code> of distinct integers. Return all permutations — every way to line the numbers up, each used exactly once. The permutations may come in any order.',
      limits: '1 ≤ n ≤ 6, −10 ≤ nums[i] ≤ 10, numbers are distinct.',
      note: 'three numbers have 3! = 6 permutations.',
    },
  },
  combSum: {
    ex: { in: 'candidates = [2, 3, 6, 7], target = 7', out: '[[2,2,3],[7]]' },
    ru: {
      text: 'Даны массив различных целых чисел <code>candidates</code> и число <code>target</code>. Верни все различные комбинации чисел из <code>candidates</code> с суммой <code>target</code>; одно число можно брать сколько угодно раз. Комбинации, отличающиеся только порядком, считаются одной; порядок ответа любой.',
      limits: '1 ≤ candidates.length ≤ 30, 2 ≤ candidates[i] ≤ 40, 1 ≤ target ≤ 40, комбинаций меньше 150.',
      note: '2 + 2 + 3 = 7 и 7 = 7; [3, 2, 2] — та же комбинация, что и [2, 2, 3].',
    },
    en: {
      text: 'You get an array of distinct integers <code>candidates</code> and a number <code>target</code>. Return all distinct combinations of numbers from <code>candidates</code> that add up to <code>target</code>; a number may be used any number of times. Combinations that differ only in order are the same; the answer may come in any order.',
      limits: '1 ≤ candidates.length ≤ 30, 2 ≤ candidates[i] ≤ 40, 1 ≤ target ≤ 40, fewer than 150 combinations.',
      note: '2 + 2 + 3 = 7 and 7 = 7; [3, 2, 2] is the same combination as [2, 2, 3].',
    },
  },
  wordSearch: {
    ex: { in: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', out: 'true' },
    ru: {
      text: 'Даны поле букв <code>board</code> и слово <code>word</code>. Верни <code>true</code>, если слово можно прочитать, двигаясь от клетки к соседней по горизонтали или вертикали и не заходя ни в одну клетку дважды, иначе <code>false</code>. Начинать можно с любой клетки.',
      limits: '1 ≤ m, n ≤ 6, 1 ≤ word.length ≤ 15, только латинские буквы обоих регистров.',
      note: 'путь A(0,0) → B → C → C(1,2) → E(2,2) → D(2,1).',
    },
    en: {
      text: 'You get a letter grid <code>board</code> and a word <code>word</code>. Return <code>true</code> if the word can be read by moving from a cell to a horizontally or vertically adjacent one without entering any cell twice, otherwise <code>false</code>. The path may start in any cell.',
      limits: '1 ≤ m, n ≤ 6, 1 ≤ word.length ≤ 15, upper- and lowercase English letters only.',
      note: 'the path is A(0,0) → B → C → C(1,2) → E(2,2) → D(2,1).',
    },
  },
  queens: {
    ex: { in: 'n = 4', out: '[[".Q..","...Q","Q...","..Q."],["..Q.","Q...","...Q",".Q.."]]' },
    ru: {
      text: 'Дано число <code>n</code>. Расставь <code>n</code> ферзей на доске n×n так, чтобы никакие два не били друг друга — не стояли в одной строке, одном столбце или на одной диагонали. Верни все такие расстановки в любом порядке; доска — список строк, где <code>"Q"</code> — ферзь, <code>"."</code> — пустая клетка. Стенд показывает перебор до первой найденной расстановки.',
      limits: '1 ≤ n ≤ 9.',
      note: 'при n = 4 расстановок две, и они зеркальны; стенд останавливается на первой.',
    },
    en: {
      text: 'You get a number <code>n</code>. Place <code>n</code> queens on an n×n board so that no two attack each other — no two share a row, a column or a diagonal. Return every such placement in any order; a board is a list of strings where <code>"Q"</code> is a queen and <code>"."</code> an empty cell. The rig shows the search up to the first placement found.',
      limits: '1 ≤ n ≤ 9.',
      note: 'for n = 4 there are two placements, mirror images of each other; the rig stops at the first.',
    },
  },
  coinOrder: {
    ex: { in: 'coins = [1, 2, 3], amount = 4', out: '4' },
    ru: {
      text: 'Даны различные номиналы монет <code>coins</code> (каждой сколько угодно) и сумма <code>amount</code>. В режиме <b>coins-outer</b> (#518 Coin Change II) верни число сочетаний монет с суммой <code>amount</code>: наборы, отличающиеся только порядком, — один способ. В режиме <b>sums-outer</b> (#377 Combination Sum IV) верни число упорядоченных последовательностей с этой суммой: 1 + 2 и 2 + 1 — разные. Пустой набор даёт сумму 0 одним способом.',
      limits: '#518: 1 ≤ coins.length ≤ 300, 1 ≤ coins[i] ≤ 5000, 0 ≤ amount ≤ 5000; #377: до 200 чисел, 1 ≤ nums[i], target ≤ 1000. Ответ помещается в 32-битное целое.',
      note: 'сочетаний четыре: 1+1+1+1, 1+1+2, 2+2, 1+3; в режиме sums-outer ответ 7.',
    },
    en: {
      text: 'You get distinct coin values <code>coins</code> (unlimited supply of each) and an amount <code>amount</code>. In <b>coins-outer</b> mode (#518 Coin Change II) return the number of coin combinations that make <code>amount</code>: sets that differ only in order count once. In <b>sums-outer</b> mode (#377 Combination Sum IV) return the number of ordered sequences with that sum: 1 + 2 and 2 + 1 are different. The empty set makes 0 in exactly one way.',
      limits: '#518: 1 ≤ coins.length ≤ 300, 1 ≤ coins[i] ≤ 5000, 0 ≤ amount ≤ 5000; #377: up to 200 numbers, 1 ≤ nums[i], target ≤ 1000. The answer fits in a 32-bit integer.',
      note: 'there are four combinations: 1+1+1+1, 1+1+2, 2+2, 1+3; in sums-outer mode the answer is 7.',
    },
  },

  /* greedy */
  jump: {
    ex: { in: 'a = [2, 0, 2, 0, 1, 3]', out: 'true' },
    ru: {
      text: 'Дан массив неотрицательных чисел <code>a</code>. Ты стоишь на индексе 0; из индекса <code>i</code> можно прыгнуть вперёд на любое расстояние от 1 до <code>a[i]</code>. Верни <code>true</code>, если можно добраться до последнего индекса, иначе <code>false</code>.',
      limits: '1 ≤ n ≤ 10⁴, 0 ≤ a[i] ≤ 10⁵.',
      note: 'прыжки 0 → 2 → 4 → 5 перескакивают оба нуля.',
    },
    en: {
      text: 'You get an array of non-negative numbers <code>a</code>. You stand at index 0; from index <code>i</code> you may jump forward any distance from 1 to <code>a[i]</code>. Return <code>true</code> if you can reach the last index, otherwise <code>false</code>.',
      limits: '1 ≤ n ≤ 10⁴, 0 ≤ a[i] ≤ 10⁵.',
      note: 'the jumps 0 → 2 → 4 → 5 clear both zeros.',
    },
  },
  stock: {
    ex: { in: 'prices = [7, 1, 5, 3, 6, 4]', out: '5' },
    ru: {
      text: 'Дан массив <code>prices</code>, где <code>prices[i]</code> — цена акции в день <code>i</code>. Можно один раз купить и один раз продать, причём продать только в более поздний день. Верни наибольшую прибыль или 0, если заработать нельзя.',
      limits: '1 ≤ n ≤ 10⁵, 0 ≤ prices[i] ≤ 10⁴.',
      note: 'купить за 1 в день 1 и продать за 6 в день 4.',
    },
    en: {
      text: 'You get an array <code>prices</code>, where <code>prices[i]</code> is the stock price on day <code>i</code>. You may buy once and sell once, and the sale must come on a later day. Return the largest profit, or 0 if no profit is possible.',
      limits: '1 ≤ n ≤ 10⁵, 0 ≤ prices[i] ≤ 10⁴.',
      note: 'buy at 1 on day 1 and sell at 6 on day 4.',
    },
  },
  intervals: {
    ex: { in: 'intervals = [[1,3],[2,4],[3,5],[1,2],[5,7],[4,6]]', out: '3' },
    ru: {
      text: 'Дан массив интервалов <code>intervals</code>, где <code>intervals[i] = [start, end]</code>. Верни наименьшее число интервалов, которые нужно удалить, чтобы оставшиеся попарно не пересекались. Интервалы, которые только касаются концами, как [1, 2] и [2, 3], не пересекаются.',
      limits: '1 ≤ n ≤ 10⁵, −5·10⁴ ≤ start &lt; end ≤ 5·10⁴.',
      note: 'остаются, например, [1,2], [2,4], [4,6] — больше трёх непересекающихся не выбрать.',
    },
    en: {
      text: 'You get an array of intervals <code>intervals</code>, where <code>intervals[i] = [start, end]</code>. Return the smallest number of intervals to remove so that the rest do not overlap pairwise. Intervals that only touch at an end, like [1, 2] and [2, 3], do not overlap.',
      limits: '1 ≤ n ≤ 10⁵, −5·10⁴ ≤ start &lt; end ≤ 5·10⁴.',
      note: 'for example [1,2], [2,4], [4,6] stay — no four of them are disjoint.',
    },
  },
  mergeIv: {
    ex: { in: 'intervals = [[1,3],[2,6],[8,10],[10,12],[15,18]]', out: '[[1,6],[8,12],[15,18]]' },
    ru: {
      text: 'Дан массив интервалов <code>intervals</code>, где <code>intervals[i] = [start, end]</code>, в произвольном порядке. Слей все пересекающиеся интервалы и верни массив непересекающихся интервалов, покрывающих те же точки. Интервалы, касающиеся концами, тоже сливаются.',
      limits: '1 ≤ n ≤ 10⁴, 0 ≤ start ≤ end ≤ 10⁴.',
      note: '[8,10] и [10,12] касаются в точке 10 и сливаются в [8,12].',
    },
    en: {
      text: 'You get an array of intervals <code>intervals</code>, where <code>intervals[i] = [start, end]</code>, in any order. Merge all overlapping intervals and return an array of non-overlapping intervals that cover the same points. Intervals that touch at an end merge too.',
      limits: '1 ≤ n ≤ 10⁴, 0 ≤ start ≤ end ≤ 10⁴.',
      note: '[8,10] and [10,12] touch at 10 and merge into [8,12].',
    },
  },
  candy: {
    ex: { in: 'ratings = [1, 2, 87, 87, 87, 2, 1]', out: '13' },
    ru: {
      text: 'Дети стоят в ряд, у каждого рейтинг <code>ratings[i]</code>. Раздай конфеты так, чтобы каждый получил хотя бы одну, а ребёнок с рейтингом выше, чем у соседа, получил больше этого соседа. При равных рейтингах ограничений нет. Верни наименьшее общее число конфет.',
      limits: '1 ≤ n ≤ 2·10⁴, 0 ≤ ratings[i] ≤ 2·10⁴.',
      note: 'раздача [1, 2, 3, 1, 3, 2, 1]: средний из трёх 87 соседствует с равными и получает одну.',
    },
    en: {
      text: 'Children stand in a row, each with a rating <code>ratings[i]</code>. Hand out candies so that everyone gets at least one and a child rated higher than a neighbour gets more than that neighbour. Equal ratings impose nothing. Return the smallest total number of candies.',
      limits: '1 ≤ n ≤ 2·10⁴, 0 ≤ ratings[i] ≤ 2·10⁴.',
      note: 'the split is [1, 2, 3, 1, 3, 2, 1]: the middle 87 sits between equal ratings and gets one.',
    },
  },
  insertIv: {
    ex: { in: 'intervals = [[1,2],[3,5],[6,7],[8,10],[12,16]], newInterval = [4,8]', out: '[[1,2],[3,10],[12,16]]' },
    ru: {
      text: 'Дан массив непересекающихся интервалов <code>intervals</code>, отсортированный по началу, и новый интервал <code>newInterval</code>. Вставь его так, чтобы массив остался отсортированным и без пересечений, сливая при необходимости пересекающиеся интервалы (касание концами тоже сливает). Верни получившийся массив.',
      limits: '0 ≤ n ≤ 10⁴, 0 ≤ start ≤ end ≤ 10⁵.',
      note: '[4,8] задевает [3,5], [6,7] и [8,10] — вместе они дают [3,10].',
    },
    en: {
      text: 'You get an array of non-overlapping intervals <code>intervals</code> sorted by start, and a new interval <code>newInterval</code>. Insert it so the array stays sorted and free of overlaps, merging overlapping intervals where needed (touching ends merge too). Return the resulting array.',
      limits: '0 ≤ n ≤ 10⁴, 0 ≤ start ≤ end ≤ 10⁵.',
      note: '[4,8] meets [3,5], [6,7] and [8,10] — together they make [3,10].',
    },
  },
  meetingRooms: {
    ex: { in: 'intervals = [[1,4],[2,5],[4,7],[6,9],[7,8]]', out: '2' },
    ru: {
      text: 'Дан массив встреч <code>intervals</code>, где <code>intervals[i] = [start, end]</code> — встреча от <code>start</code> до <code>end</code>, не включая <code>end</code>. Верни наименьшее число комнат, при котором все встречи пройдут и встречи в одной комнате не пересекаются. Встреча может начаться в комнате в тот же момент, когда предыдущая закончилась.',
      limits: '1 ≤ n ≤ 10⁴, 0 ≤ start &lt; end ≤ 10⁶.',
      note: 'одновременно идут не больше двух встреч: в момент 4 и 7 одна заканчивается, другая начинается.',
    },
    en: {
      text: 'You get an array of meetings <code>intervals</code>, where <code>intervals[i] = [start, end]</code> is a meeting from <code>start</code> up to but not including <code>end</code>. Return the fewest rooms that fit all meetings with no two meetings in one room overlapping. A meeting may start in a room at the very moment the previous one ends.',
      limits: '1 ≤ n ≤ 10⁴, 0 ≤ start &lt; end ≤ 10⁶.',
      note: 'at most two meetings run at once: at 4 and at 7 one ends as another begins.',
    },
  },
};
