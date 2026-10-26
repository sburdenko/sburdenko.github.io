/** Full statements, chapters hash, twoptr, matrix, window: what is given, what to return, limits and an example that matches the rig's example. */
export const ST_A = {
  // ── hash ──
  twoSum: {
    ex: { in: 'nums = [3, 8, 2, 11, 7, 5], target = 9', out: '[2, 4]' },
    ru: {
      text: 'Дан целочисленный массив <code>nums</code> и число <code>target</code>. Верни индексы двух разных элементов, сумма которых равна <code>target</code>. Один и тот же элемент дважды брать нельзя; гарантируется, что подходящая пара ровно одна. Порядок индексов в ответе не важен.',
      limits: '2 ≤ n ≤ 10⁴, −10⁹ ≤ nums[i], target ≤ 10⁹.',
      note: 'nums[2] + nums[4] = 2 + 7 = 9.',
    },
    en: {
      text: 'Given an integer array <code>nums</code> and an integer <code>target</code>, return the indices of two different elements that add up to <code>target</code>. You may not use the same element twice, and exactly one valid pair is guaranteed. The indices may be returned in any order.',
      limits: '2 ≤ n ≤ 10⁴, −10⁹ ≤ nums[i], target ≤ 10⁹.',
      note: 'nums[2] + nums[4] = 2 + 7 = 9.',
    },
  },
  dup: {
    ex: { in: 'nums = [4, 7, 1, 9, 7, 3]', out: 'true' },
    ru: {
      text: 'Дан целочисленный массив <code>nums</code>. Верни <code>true</code>, если хотя бы одно значение встречается в нём два раза или больше, и <code>false</code>, если все элементы различны.',
      limits: '1 ≤ n ≤ 10⁵, −10⁹ ≤ nums[i] ≤ 10⁹.',
      note: 'число 7 стоит на позициях 1 и 4.',
    },
    en: {
      text: 'Given an integer array <code>nums</code>, return <code>true</code> if some value appears in it at least twice, and <code>false</code> if every element is distinct.',
      limits: '1 ≤ n ≤ 10⁵, −10⁹ ≤ nums[i] ≤ 10⁹.',
      note: 'the value 7 sits at positions 1 and 4.',
    },
  },
  anagram: {
    ex: { in: 'strs = ["eat", "tea", "tan", "ate", "nat", "bat"]', out: '[["eat","tea","ate"],["tan","nat"],["bat"]]' },
    ru: {
      text: 'Дан массив строк <code>strs</code>. Разложи их по группам так, чтобы в одной группе оказались анаграммы — слова из одного и того же набора букв с теми же количествами. Верни список групп; порядок групп и порядок слов внутри группы не важен.',
      limits: '1 ≤ strs.length ≤ 10⁴, 0 ≤ strs[i].length ≤ 100, только строчные латинские буквы.',
      note: '«eat», «tea» и «ate» состоят из букв a, e, t, а «bat» анаграмм не имеет.',
    },
    en: {
      text: 'Given an array of strings <code>strs</code>, group the anagrams together: words built from the same letters with the same counts go into one group. Return the list of groups; neither the order of the groups nor the order of words inside a group matters.',
      limits: '1 ≤ strs.length ≤ 10⁴, 0 ≤ strs[i].length ≤ 100, lowercase English letters only.',
      note: '"eat", "tea" and "ate" all use the letters a, e, t, while "bat" has no anagram.',
    },
  },
  longestConsec: {
    ex: { in: 'nums = [100, 4, 200, 1, 3, 2]', out: '4' },
    ru: {
      text: 'Дан неотсортированный целочисленный массив <code>nums</code>. Верни длину самой длинной серии значений, идущих подряд без пропусков (x, x + 1, x + 2, …); где эти значения стоят в массиве, не важно. Решение должно работать за O(n).',
      limits: '0 ≤ n ≤ 10⁵, −10⁹ ≤ nums[i] ≤ 10⁹.',
      note: 'самая длинная серия — 1, 2, 3, 4.',
    },
    en: {
      text: 'Given an unsorted integer array <code>nums</code>, return the length of the longest run of consecutive values (x, x + 1, x + 2, …); their positions in the array do not matter. The solution must run in O(n) time.',
      limits: '0 ≤ n ≤ 10⁵, −10⁹ ≤ nums[i] ≤ 10⁹.',
      note: 'the longest run is 1, 2, 3, 4.',
    },
  },
  psum: {
    ex: { in: 'nums = [1, 2, 3, -2, 2, 1], k = 3', out: '5' },
    ru: {
      text: 'Дан целочисленный массив <code>nums</code> и число <code>k</code>. Верни, сколько непрерывных непустых подмассивов имеют сумму ровно <code>k</code>. Числа в массиве могут быть отрицательными.',
      limits: '1 ≤ n ≤ 2·10⁴, −1000 ≤ nums[i] ≤ 1000, −10⁷ ≤ k ≤ 10⁷.',
      note: 'подходят [1, 2], [3], [2, 3, −2], [3, −2, 2] и [2, 1].',
    },
    en: {
      text: 'Given an integer array <code>nums</code> and an integer <code>k</code>, return how many contiguous non-empty subarrays sum to exactly <code>k</code>. The array may contain negative numbers.',
      limits: '1 ≤ n ≤ 2·10⁴, −1000 ≤ nums[i] ≤ 1000, −10⁷ ≤ k ≤ 10⁷.',
      note: 'the matches are [1, 2], [3], [2, 3, −2], [3, −2, 2] and [2, 1].',
    },
  },
  firstMissing: {
    ex: { in: 'nums = [3, 4, -1, 1, 6, 2]', out: '5' },
    ru: {
      text: 'Дан неотсортированный целочисленный массив <code>nums</code>. Верни наименьшее положительное целое число, которого в нём нет. Нужно O(n) времени и O(1) дополнительной памяти; сам массив менять можно.',
      limits: '1 ≤ n ≤ 10⁵, −2³¹ ≤ nums[i] ≤ 2³¹ − 1.',
      note: 'числа 1, 2, 3, 4 есть, а 5 нет.',
    },
    en: {
      text: 'Given an unsorted integer array <code>nums</code>, return the smallest positive integer that does not appear in it. The solution must use O(n) time and O(1) extra memory; modifying the array itself is allowed.',
      limits: '1 ≤ n ≤ 10⁵, −2³¹ ≤ nums[i] ≤ 2³¹ − 1.',
      note: '1, 2, 3 and 4 are present, 5 is not.',
    },
  },
  dupWindow: {
    ex: { in: 'nums = [1, 2, 3, 1, 4, 1], k = 2', out: 'true' },
    ru: {
      text: 'Дан целочисленный массив <code>nums</code> и число <code>k</code>. Верни <code>true</code>, если есть два разных индекса <code>i</code> и <code>j</code>, для которых <code>nums[i] == nums[j]</code> и <code>|i − j| ≤ k</code>, иначе <code>false</code>.',
      limits: '1 ≤ n ≤ 10⁵, −10⁹ ≤ nums[i] ≤ 10⁹, 0 ≤ k ≤ 10⁵.',
      note: 'единицы на индексах 3 и 5 стоят на расстоянии 2; пара 0 и 3 слишком далеко.',
    },
    en: {
      text: 'Given an integer array <code>nums</code> and an integer <code>k</code>, return <code>true</code> if there are two distinct indices <code>i</code> and <code>j</code> with <code>nums[i] == nums[j]</code> and <code>|i − j| ≤ k</code>, otherwise <code>false</code>.',
      limits: '1 ≤ n ≤ 10⁵, −10⁹ ≤ nums[i] ≤ 10⁹, 0 ≤ k ≤ 10⁵.',
      note: 'the ones at indices 3 and 5 are 2 apart; the pair 0 and 3 is too far.',
    },
  },

  // ── twoptr ──
  moveZeroes: {
    ex: { in: 'nums = [0, 1, 0, 3, 12, 0, 5]', out: '[1, 3, 12, 5, 0, 0, 0]' },
    ru: {
      text: 'Дан целочисленный массив <code>nums</code>. Перенеси все нули в его конец, сохранив относительный порядок ненулевых элементов. Менять нужно сам массив, на месте, без копии; функция ничего не возвращает.',
      limits: '1 ≤ n ≤ 10⁴, −2³¹ ≤ nums[i] ≤ 2³¹ − 1 (на стенде числа неотрицательные).',
    },
    en: {
      text: 'Given an integer array <code>nums</code>, move all zeros to its end while keeping the relative order of the non-zero elements. Change the array itself, in place, without making a copy; the function returns nothing.',
      limits: '1 ≤ n ≤ 10⁴, −2³¹ ≤ nums[i] ≤ 2³¹ − 1 (the rig uses non-negative numbers).',
    },
  },
  shuffle: {
    ex: { in: 'nums = [1, 2, 3, 4, 5, 6], j = [2, 4, 0, 1, 0]', out: '[6, 4, 2, 1, 5, 3]' },
    ru: {
      text: 'Реализуй класс <code>Solution(int[] nums)</code> с методами <code>shuffle()</code> — вернуть случайную перестановку массива, причём все n! перестановок должны быть равновероятны, — и <code>reset()</code> — вернуть исходный порядок. На стенде случайность зафиксирована: массив <code>j</code> задаёт n − 1 заранее выбранных случайных индексов, по одному на шаг, для позиций от последней к первой (<code>j[t] ≤ n − 1 − t</code>). Стенд показывает, какую перестановку даёт один вызов <code>shuffle()</code> с этими числами.',
      limits: '1 ≤ n ≤ 50, −10⁶ ≤ nums[i] ≤ 10⁶, все элементы различны, до 10⁴ вызовов reset и shuffle.',
    },
    en: {
      text: 'Implement a class <code>Solution(int[] nums)</code> with <code>shuffle()</code>, which returns a random permutation of the array with all n! permutations equally likely, and <code>reset()</code>, which returns the original order. In the rig the randomness is fixed: the array <code>j</code> holds n − 1 pre-drawn random indices, one per step, for positions from the last one down to the first (<code>j[t] ≤ n − 1 − t</code>). The rig shows which permutation one call to <code>shuffle()</code> produces with these numbers.',
      limits: '1 ≤ n ≤ 50, −10⁶ ≤ nums[i] ≤ 10⁶, all elements distinct, up to 10⁴ calls to reset and shuffle.',
    },
  },
  twoSumII: {
    ex: { in: 'numbers = [-3, 1, 2, 4, 7, 11, 15], target = 9', out: '[3, 5]' },
    ru: {
      text: 'Дан массив <code>numbers</code>, отсортированный по неубыванию, и число <code>target</code>. Найди два разных элемента с суммой <code>target</code> и верни их индексы, считая с 1, в порядке возрастания. Гарантируется, что ответ ровно один; один элемент дважды брать нельзя; дополнительная память — O(1).',
      limits: '2 ≤ n ≤ 3·10⁴, −1000 ≤ numbers[i], target ≤ 1000.',
      note: 'numbers[3] + numbers[5] = 2 + 7 = 9 (индексы с единицы).',
    },
    en: {
      text: 'Given an array <code>numbers</code> sorted in non-decreasing order and an integer <code>target</code>, find two different elements that add up to <code>target</code> and return their 1-based indices in increasing order. Exactly one answer is guaranteed, the same element cannot be used twice, and extra memory must be O(1).',
      limits: '2 ≤ n ≤ 3·10⁴, −1000 ≤ numbers[i], target ≤ 1000.',
      note: 'numbers[3] + numbers[5] = 2 + 7 = 9 (1-based indices).',
    },
  },
  container: {
    ex: { in: 'h = [1, 8, 6, 2, 5, 4, 8, 3, 7]', out: '49' },
    ru: {
      text: 'Дан массив <code>h</code>: в точке <code>i</code> стоит вертикальная линия высоты <code>h[i]</code>. Выбери две линии, которые вместе с осью X образуют сосуд с наибольшим объёмом воды, и верни этот объём: расстояние между линиями, умноженное на высоту меньшей из них. Наклонять сосуд нельзя.',
      limits: '2 ≤ n ≤ 10⁵, 0 ≤ h[i] ≤ 10⁴.',
      note: 'линии 1 и 8 высотой 8 и 7: min(8, 7) · (8 − 1) = 49.',
    },
    en: {
      text: 'Given an array <code>h</code> where point <code>i</code> has a vertical line of height <code>h[i]</code>, pick two lines that together with the x-axis form the container holding the most water, and return that amount: the distance between the lines times the height of the shorter one. The container cannot be tilted.',
      limits: '2 ≤ n ≤ 10⁵, 0 ≤ h[i] ≤ 10⁴.',
      note: 'lines 1 and 8 of heights 8 and 7: min(8, 7) · (8 − 1) = 49.',
    },
  },
  threeSum: {
    ex: { in: 'nums = [-1, 0, 1, 2, -1, -4]', out: '[[-1,-1,2],[-1,0,1]]' },
    ru: {
      text: 'Дан целочисленный массив <code>nums</code>. Верни все тройки значений <code>[nums[i], nums[j], nums[k]]</code> с тремя разными индексами, сумма которых равна 0. Одинаковых троек в ответе быть не должно; порядок троек и чисел в них не важен.',
      limits: '3 ≤ n ≤ 3000, −10⁵ ≤ nums[i] ≤ 10⁵.',
      note: 'тройка [−1, 0, 1] собирается двумя способами, но в ответе она одна.',
    },
    en: {
      text: 'Given an integer array <code>nums</code>, return every triple of values <code>[nums[i], nums[j], nums[k]]</code> at three distinct indices that sums to 0. The answer must not contain duplicate triples; the order of triples and of numbers inside them does not matter.',
      limits: '3 ≤ n ≤ 3000, −10⁵ ≤ nums[i] ≤ 10⁵.',
      note: 'the triple [−1, 0, 1] can be formed in two ways but appears once.',
    },
  },
  trap: {
    ex: { in: 'h = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]', out: '6' },
    ru: {
      text: 'Дан массив <code>h</code> из неотрицательных чисел — высоты столбиков ширины 1, стоящих вплотную. Верни, сколько единиц дождевой воды задержится между столбиками после дождя.',
      limits: '1 ≤ n ≤ 2·10⁴, 0 ≤ h[i] ≤ 10⁵.',
    },
    en: {
      text: 'Given an array <code>h</code> of non-negative numbers, the heights of width-1 bars standing side by side, return how many units of rainwater stay trapped between the bars after it rains.',
      limits: '1 ≤ n ≤ 2·10⁴, 0 ≤ h[i] ≤ 10⁵.',
    },
  },
  sortColors: {
    ex: { in: 'nums = [2, 0, 2, 1, 1, 0]', out: '[0, 0, 1, 1, 2, 2]' },
    ru: {
      text: 'Дан массив <code>nums</code>, в котором только 0, 1 и 2 (красный, белый и синий). Отсортируй его на месте, чтобы шли сначала все 0, потом все 1, потом все 2. Библиотечную сортировку использовать нельзя; цель — один проход и O(1) дополнительной памяти.',
      limits: '1 ≤ n ≤ 300, nums[i] ∈ {0, 1, 2}.',
    },
    en: {
      text: 'Given an array <code>nums</code> containing only 0, 1 and 2 (red, white and blue), sort it in place so that all 0s come first, then all 1s, then all 2s. Library sort is not allowed; the goal is a single pass with O(1) extra memory.',
      limits: '1 ≤ n ≤ 300, nums[i] ∈ {0, 1, 2}.',
    },
  },
  palindrome: {
    ex: { in: 's = "A man, a plan, a canal: Panama"', out: 'true' },
    ru: {
      text: 'Дана строка <code>s</code>. Она считается палиндромом, если после удаления всех символов, кроме букв и цифр, и перевода букв в нижний регистр читается одинаково слева направо и справа налево. Верни <code>true</code> или <code>false</code>; проверить нужно без построения новой строки. На стенде строка до 40 символов.',
      limits: '1 ≤ s.length ≤ 2·10⁵, только печатные ASCII-символы.',
      note: 'после очистки остаётся «amanaplanacanalpanama».',
    },
    en: {
      text: 'Given a string <code>s</code>, it counts as a palindrome if, after removing every character except letters and digits and lowering the case, it reads the same left to right and right to left. Return <code>true</code> or <code>false</code>, checking it without building a new string. In the rig the string is at most 40 characters.',
      limits: '1 ≤ s.length ≤ 2·10⁵, printable ASCII characters only.',
      note: 'after cleaning it becomes "amanaplanacanalpanama".',
    },
  },

  // ── matrix ──
  productExcept: {
    ex: { in: 'nums = [2, 3, 4, 5]', out: '[60, 40, 30, 24]' },
    ru: {
      text: 'Дан целочисленный массив <code>nums</code>. Верни массив <code>answer</code>, где <code>answer[i]</code> — произведение всех элементов <code>nums</code>, кроме <code>nums[i]</code>. Деление использовать нельзя, время — O(n); в идеале O(1) дополнительной памяти, не считая выходного массива.',
      limits: '2 ≤ n ≤ 10⁵, −30 ≤ nums[i] ≤ 30; каждое answer[i] помещается в 32-битный int.',
      note: 'answer[0] = 3 · 4 · 5 = 60.',
    },
    en: {
      text: 'Given an integer array <code>nums</code>, return an array <code>answer</code> where <code>answer[i]</code> is the product of all elements of <code>nums</code> except <code>nums[i]</code>. Division is not allowed and time must be O(n); ideally extra memory is O(1), not counting the output array.',
      limits: '2 ≤ n ≤ 10⁵, −30 ≤ nums[i] ≤ 30; every answer[i] fits in a 32-bit int.',
      note: 'answer[0] = 3 · 4 · 5 = 60.',
    },
  },
  rotate: {
    ex: { in: 'matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]]', out: '[[13,9,5,1],[14,10,6,2],[15,11,7,3],[16,12,8,4]]' },
    ru: {
      text: 'Дана квадратная матрица <code>matrix</code> размера n × n. Поверни её на 90° по часовой стрелке. Поворачивать нужно на месте: вторую матрицу заводить нельзя.',
      limits: '1 ≤ n ≤ 20, −1000 ≤ matrix[i][j] ≤ 1000.',
      note: 'первый столбец снизу вверх (13, 9, 5, 1) становится первой строкой.',
    },
    en: {
      text: 'Given an n × n square matrix <code>matrix</code>, rotate it by 90° clockwise. The rotation must happen in place: allocating a second matrix is not allowed.',
      limits: '1 ≤ n ≤ 20, −1000 ≤ matrix[i][j] ≤ 1000.',
      note: 'the first column read bottom-up (13, 9, 5, 1) becomes the first row.',
    },
  },
  setZeroes: {
    ex: { in: 'matrix = [[1,2,3,4],[5,0,6,7],[8,9,1,2],[0,3,4,5]]', out: '[[0,0,3,4],[0,0,0,0],[0,0,1,2],[0,0,0,0]]' },
    ru: {
      text: 'Дана матрица <code>matrix</code> размера m × n. Если какая-то клетка равна 0, обнули всю её строку и весь её столбец. Решать на месте; учитываются только нули исходной матрицы, а не появившиеся по ходу. Цель — O(1) дополнительной памяти.',
      limits: '1 ≤ m, n ≤ 200, −2³¹ ≤ matrix[i][j] ≤ 2³¹ − 1.',
      note: 'нули в (1, 1) и (3, 0) обнуляют строки 1 и 3 и столбцы 0 и 1.',
    },
    en: {
      text: 'Given an m × n matrix <code>matrix</code>, if a cell is 0, set its entire row and its entire column to 0. Do it in place; only zeros of the original matrix count, not the ones created along the way. The goal is O(1) extra memory.',
      limits: '1 ≤ m, n ≤ 200, −2³¹ ≤ matrix[i][j] ≤ 2³¹ − 1.',
      note: 'the zeros at (1, 1) and (3, 0) clear rows 1 and 3 and columns 0 and 1.',
    },
  },
  spiral: {
    ex: { in: 'matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]', out: '[1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7]' },
    ru: {
      text: 'Дана матрица <code>matrix</code> размера m × n (не обязательно квадратная). Верни все её элементы в порядке обхода по спирали: от левого верхнего угла вправо и дальше по часовой стрелке к центру. Каждый элемент — ровно один раз.',
      limits: '1 ≤ m, n ≤ 10, −100 ≤ matrix[i][j] ≤ 100.',
    },
    en: {
      text: 'Given an m × n matrix <code>matrix</code> (not necessarily square), return all its elements in spiral order: from the top-left corner to the right, then clockwise inward toward the center. Each element appears exactly once.',
      limits: '1 ≤ m, n ≤ 10, −100 ≤ matrix[i][j] ≤ 100.',
    },
  },
  gameOfLife: {
    ex: { in: 'board = [[0,0,0,0,0],[0,1,1,1,0],[0,0,0,0,0]]', out: '[[0,0,1,0,0],[0,0,1,0,0],[0,0,1,0,0]]' },
    ru: {
      text: 'Дана доска <code>board</code> m × n из 0 (мёртвая клетка) и 1 (живая) — игра «Жизнь» Конвея. Соседи — 8 окружающих клеток, за краем доски клеток нет. Живая клетка с 2 или 3 живыми соседями выживает, мёртвая ровно с 3 оживает, остальные умирают или остаются мёртвыми. Все клетки меняются одновременно, по состоянию текущего поколения; запиши следующее поколение на место <code>board</code>.',
      limits: '1 ≤ m, n ≤ 25, board[i][j] — 0 или 1.',
      note: 'горизонтальная палочка из трёх клеток становится вертикальной.',
    },
    en: {
      text: 'Given an m × n board <code>board</code> of 0 (dead cell) and 1 (live cell), play Conway’s Game of Life. Neighbors are the 8 surrounding cells; there are no cells beyond the edge. A live cell with 2 or 3 live neighbors survives, a dead cell with exactly 3 comes alive, all others die or stay dead. All cells change at once, based on the current generation; write the next generation into <code>board</code> in place.',
      limits: '1 ≤ m, n ≤ 25, board[i][j] is 0 or 1.',
      note: 'a horizontal bar of three cells turns vertical.',
    },
  },
  maxRect: {
    ex: { in: 'matrix = [["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]', out: '6' },
    ru: {
      text: 'Дана двоичная матрица <code>matrix</code> размера rows × cols из символов "0" и "1". Найди прямоугольник наибольшей площади, все клетки которого — "1", и верни его площадь.',
      limits: '1 ≤ rows, cols ≤ 200.',
      note: 'прямоугольник 2 × 3 в строках 1–2, столбцах 2–4.',
    },
    en: {
      text: 'Given a binary matrix <code>matrix</code> of size rows × cols filled with "0" and "1", find the largest-area rectangle whose cells are all "1" and return its area.',
      limits: '1 ≤ rows, cols ≤ 200.',
      note: 'a 2 × 3 rectangle in rows 1–2, columns 2–4.',
    },
  },
  uniquePaths: {
    ex: { in: 'm = 3, n = 7', out: '28' },
    ru: {
      text: 'Робот стоит в левом верхнем углу сетки из <code>m</code> строк и <code>n</code> столбцов и за один шаг сдвигается на клетку вправо или вниз. Верни, сколькими разными путями он может дойти до правого нижнего угла. Поле <code>mode</code> стенда меняет только способ заполнения (вся таблица или одна строка), ответ от него не зависит.',
      limits: '1 ≤ m, n ≤ 100; ответ не больше 2·10⁹.',
    },
    en: {
      text: 'A robot stands in the top-left corner of a grid with <code>m</code> rows and <code>n</code> columns and moves one cell right or down per step. Return how many different paths lead it to the bottom-right corner. The rig’s <code>mode</code> field only switches how the table is filled (full table or a single row); the answer does not depend on it.',
      limits: '1 ≤ m, n ≤ 100; the answer is at most 2·10⁹.',
    },
  },

  // ── window ──
  maxAvg: {
    ex: { in: 'nums = [1, 12, -5, -6, 50, 3], k = 4', out: '12.75' },
    ru: {
      text: 'Дан целочисленный массив <code>nums</code> и число <code>k</code>. Среди всех непрерывных подмассивов длины ровно <code>k</code> найди тот, у которого среднее арифметическое наибольшее, и верни это среднее (подойдёт ответ с погрешностью меньше 10⁻⁵).',
      limits: '1 ≤ k ≤ n ≤ 10⁵, −10⁴ ≤ nums[i] ≤ 10⁴.',
      note: 'подмассив [12, −5, −6, 50] даёт 51 / 4 = 12.75.',
    },
    en: {
      text: 'Given an integer array <code>nums</code> and an integer <code>k</code>, among all contiguous subarrays of length exactly <code>k</code> find the one with the largest average and return that average (an error below 10⁻⁵ is accepted).',
      limits: '1 ≤ k ≤ n ≤ 10⁵, −10⁴ ≤ nums[i] ≤ 10⁴.',
      note: 'the subarray [12, −5, −6, 50] gives 51 / 4 = 12.75.',
    },
  },
  longest: {
    ex: { in: 's = "abcbcad"', out: '4' },
    ru: {
      text: 'Дана строка <code>s</code>. Верни длину самой длинной подстроки — непрерывного куска строки, — в которой ни один символ не повторяется.',
      limits: '0 ≤ s.length ≤ 10⁵; буквы, цифры, знаки и пробелы (на стенде — строчные латинские).',
      note: 'подстрока «bcad».',
    },
    en: {
      text: 'Given a string <code>s</code>, return the length of the longest substring (a contiguous piece of the string) in which no character repeats.',
      limits: '0 ≤ s.length ≤ 10⁵; letters, digits, symbols and spaces (the rig uses lowercase letters).',
      note: 'the substring "bcad".',
    },
  },
  minLen: {
    ex: { in: 'target = 7, nums = [2, 3, 1, 2, 4, 3]', out: '2' },
    ru: {
      text: 'Дано положительное число <code>target</code> и массив положительных чисел <code>nums</code>. Верни наименьшую длину непрерывного подмассива, сумма которого не меньше <code>target</code>. Если такого подмассива нет, верни 0.',
      limits: '1 ≤ target ≤ 10⁹, 1 ≤ n ≤ 10⁵, 1 ≤ nums[i] ≤ 10⁴.',
      note: 'подмассив [4, 3] даёт ровно 7.',
    },
    en: {
      text: 'Given a positive integer <code>target</code> and an array of positive integers <code>nums</code>, return the smallest length of a contiguous subarray whose sum is at least <code>target</code>. If no such subarray exists, return 0.',
      limits: '1 ≤ target ≤ 10⁹, 1 ≤ n ≤ 10⁵, 1 ≤ nums[i] ≤ 10⁴.',
      note: 'the subarray [4, 3] sums to exactly 7.',
    },
  },
  charReplace: {
    ex: { in: 's = "AABABBA", k = 1', out: '4' },
    ru: {
      text: 'Дана строка <code>s</code> из заглавных латинских букв и число <code>k</code>. Можно заменить любой символ на любую другую заглавную букву, всего не больше <code>k</code> раз. Верни длину самой длинной подстроки из одинаковых букв, которую можно получить такими заменами.',
      limits: '1 ≤ s.length ≤ 10⁵, 0 ≤ k ≤ s.length.',
      note: 'заменив B на позиции 2, получаем «AAAA» в начале.',
    },
    en: {
      text: 'Given a string <code>s</code> of uppercase English letters and an integer <code>k</code>, you may change any character into any other uppercase letter, at most <code>k</code> times in total. Return the length of the longest substring of one repeated letter you can get this way.',
      limits: '1 ≤ s.length ≤ 10⁵, 0 ≤ k ≤ s.length.',
      note: 'replacing the B at position 2 gives "AAAA" at the start.',
    },
  },
  minWindow: {
    ex: { in: 's = "ADOBECODEBANC", t = "ABC"', out: '"BANC"' },
    ru: {
      text: 'Даны строки <code>s</code> и <code>t</code>. Верни самую короткую подстроку <code>s</code>, которая содержит каждый символ <code>t</code> с учётом повторов: если в <code>t</code> две «A», в окне их должно быть хотя бы две. Если такой подстроки нет, верни пустую строку; гарантируется, что кратчайший ответ единственный.',
      limits: '1 ≤ |s|, |t| ≤ 10⁵, заглавные и строчные латинские буквы; целевая сложность O(|s| + |t|).',
    },
    en: {
      text: 'Given strings <code>s</code> and <code>t</code>, return the shortest substring of <code>s</code> that contains every character of <code>t</code>, duplicates included: if <code>t</code> has two "A", the window needs at least two. If there is no such substring, return the empty string; the shortest answer is guaranteed to be unique.',
      limits: '1 ≤ |s|, |t| ≤ 10⁵, uppercase and lowercase English letters; target complexity O(|s| + |t|).',
    },
  },
  slidingMax: {
    ex: { in: 'nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3', out: '[3, 3, 5, 5, 6, 7]' },
    ru: {
      text: 'Дан целочисленный массив <code>nums</code> и число <code>k</code>. Окно длины <code>k</code> сдвигается по массиву на одну позицию слева направо. Верни массив максимумов окна для каждого его положения — всего n − k + 1 чисел.',
      limits: '1 ≤ k ≤ n ≤ 10⁵, −10⁴ ≤ nums[i] ≤ 10⁴.',
    },
    en: {
      text: 'Given an integer array <code>nums</code> and an integer <code>k</code>, a window of length <code>k</code> slides over the array one position at a time from left to right. Return the maximum of the window at each position, n − k + 1 numbers in total.',
      limits: '1 ≤ k ≤ n ≤ 10⁵, −10⁴ ≤ nums[i] ≤ 10⁴.',
    },
  },
};
