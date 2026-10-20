/** Tape 06 chapter 13: arrays and matrices walked in a planned order. */
export const CH_D = {
  'matrix.short': {
    en: 'Rotate, spiral, zero out, multiply the rest — in place, without extra memory',
    ru: 'Повернуть, обойти спиралью, обнулить, перемножить остальные — на месте, без лишней памяти',
  },
  'matrix.h2': { en: 'The order of the passes is the algorithm', ru: 'Порядок проходов и есть алгоритм' },
  'matrix.essence': {
    en: 'No clever data structure here. The whole move is the order of the walk and where the bookkeeping lives: in the output array, in the first row of the matrix itself, in four shrinking bounds, in a row of column heights.',
    ru: 'Хитрой структуры данных здесь нет. Весь приём — в каком порядке обходить и где держать учёт: в выходном массиве, в первой строке самой матрицы, в четырёх сужающихся границах, в строке высот столбцов.',
  },
  'matrix.signals': {
    en: '<li>Transform a matrix “in place” or “with O(1) extra memory”</li><li>The answer for an element depends on everything to its left and everything to its right</li><li>Walk a matrix in an unusual order: a spiral, by layers, by diagonals</li><li>A 2D problem that turns into a 1D one row by row</li>',
    ru: '<li>Матрицу нужно преобразовать «на месте» или «с O(1) доп. памяти»</li><li>Ответ для элемента зависит от всего, что левее, и всего, что правее</li><li>Матрицу нужно обойти в необычном порядке: спиралью, по слоям, по диагоналям</li><li>Двумерная задача, которая по строкам сводится к одномерной</li>',
  },
  'matrix.pitfall': {
    en: '<b>Trap.</b> Overwriting a value that is still needed. For every write ask: has everyone who reads this cell already read it? That is why Set Matrix Zeroes clears the marker row last, and why a rotation is done with swaps rather than by writing over cells.',
    ru: '<b>Ловушка.</b> Затереть значение, которое ещё понадобится. Для каждой записи спроси: все, кто читает эту клетку, её уже прочитали? Поэтому в Set Matrix Zeroes строку маркеров обнуляют последней, а поворот делают обменами, а не записью поверх.',
  },
  'matrix.tpl': {
    en: `int rows = m.Length, cols = m[0].Length;
for (int r = 0; r < rows; r++)        // pass 1: gather what the answer depends on
    for (int c = 0; c < cols; c++)
        /* markers, prefixes, heights — in the output or in m itself */;
for (int r = 0; r < rows; r++)        // pass 2: write the answer
    for (int c = 0; c < cols; c++)
        m[r][c] = /* from the bookkeeping */;
/* the cells that held the bookkeeping are written last */`,
    ru: `int rows = m.Length, cols = m[0].Length;
for (int r = 0; r < rows; r++)        // проход 1: собираем, от чего зависит ответ
    for (int c = 0; c < cols; c++)
        /* маркеры, префиксы, высоты — в выходном массиве или в самой m */;
for (int r = 0; r < rows; r++)        // проход 2: пишем ответ
    for (int c = 0; c < cols; c++)
        m[r][c] = /* по собранному учёту */;
/* клетки, где лежал учёт, записываем последними */`,
  },
  'matrix.p': {
    en: [
      { variant: 'Prefix and suffix in the output', task: 'Return an array where answer[i] is the product of all numbers except nums[i]. No division, O(n).', idea: 'answer[i] = (product of everything left of i) × (product of everything right of i). The first pass writes the left products into the answer; the second walks back with one running suffix and multiplies it in.', why: 'Division looks shorter but breaks on zeros: one zero turns the total into 0, and you cannot divide by it. It is the prefix sums of #560 with × instead of +, and keeping the left half in the output leaves O(1) extra memory.', cx: 'O(n) time · O(1) extra (the output does not count)' },
      { variant: 'Transpose, then mirror', task: 'Rotate an n × n matrix 90° clockwise, in place.', idea: 'A clockwise turn = a transpose (swap m[r][c] and m[c][r] for the cells above the diagonal) + a mirror of every row. Two plain passes instead of index formulas for cycles of four cells.', why: 'The direct way moves four cells in a ring per step, and the indices are easy to get wrong. Counterclockwise is the same two steps with columns mirrored instead of rows. In Unity: turning a Tetris piece or a room prefab on a grid.', cx: 'O(n²) time · O(1) memory' },
      { variant: 'Markers in the first row and column', task: 'If a cell is 0, set its whole row and column to 0. In place, with O(1) extra memory.', idea: 'Use m[r][0] and m[0][c] as the flags “row r / column c must go”. Two booleans remember whether the first row and column had zeros of their own. Fill the inner cells from the markers, the marker row and column last.', why: 'The obvious solution keeps two arrays for rows and columns — O(rows + cols). Zeroing on the spot is wrong: new zeros would spread further. Order matters here too: clear the first row too early and the markers are gone.', cx: 'O(rows · cols) time · O(1) memory' },
      { variant: 'Four bounds close in', task: 'Return all elements of a matrix in spiral order, clockwise from the top-left corner.', idea: 'Keep top, bottom, left and right. Go right along top, then top++; down along right, right−−; left along bottom, bottom−−; up along left, left++. Repeat while top ≤ bottom and left ≤ right.', why: 'The two inner checks are the whole difficulty: when one row or one column is left, without them the way back reads it a second time. Spiral Matrix II (#59) walks the same path and fills it instead of reading.', cx: 'O(rows · cols) time · O(1) extra' },
      { variant: 'Two bits per cell', task: 'Conway’s Game of Life: a live cell with 2 or 3 live neighbors (out of 8) survives, a dead one with exactly 3 comes alive, all others die or stay dead. Compute the next generation in place.', idea: 'Every cell keeps two states: bit 0 is now, bit 1 is next. Pass 1 counts neighbors by board[y][x] & 1 and sets bit 1 where the cell will live (values 0–3). Pass 2 is board[r][c] >>= 1.', why: 'Writing the new state straight away breaks the neighbors that have not been counted yet; a copy of the board costs O(R·C). The extra bit keeps the present readable until everyone has read it — the chapter’s question “has every reader read this cell?” answered by encoding instead of order.', cx: 'O(R·C) time · O(1) memory' },
      { variant: 'Row by row into histograms', task: 'A matrix of 0s and 1s. Find the largest rectangle that contains only 1s and return its area.', idea: 'For every row compute heights: how many 1s go up from it in each column. Each row is then Largest Rectangle in Histogram (#84), solved by a monotonic stack in O(cols).', why: 'The leap is turning 2D into 1D: the heights carry everything about the rows above. Maximal Square (#221) asks the same about squares and is a DP instead.', cx: 'O(rows · cols) time · O(cols) memory' },
    ],
    ru: [
      { variant: 'Префикс и суффикс в выходном массиве', task: 'Верни массив, где answer[i] — произведение всех чисел, кроме nums[i]. Без деления, за O(n).', idea: 'answer[i] = (произведение всего, что левее i) × (произведение всего, что правее i). Первый проход пишет в ответ произведения слева, второй идёт обратно с одной бегущей переменной suffix и домножает на неё.', why: 'Деление выглядит короче, но ломается на нулях: один ноль превращает общее произведение в 0, а делить на него нельзя. Это префиксные суммы из #560, только × вместо +, а левая половина в выходном массиве оставляет O(1) доп. памяти.', cx: 'O(n) время · O(1) доп. память (выходной массив не в счёт)' },
      { variant: 'Транспонировать, потом отразить', task: 'Поверни матрицу n × n на 90° по часовой стрелке, на месте.', idea: 'Поворот по часовой = транспонирование (обмен m[r][c] и m[c][r] для клеток над диагональю) + отражение каждой строки. Два простых прохода вместо формул индексов для циклов из четырёх клеток.', why: 'Прямой способ за шаг двигает по кругу четыре клетки, и в индексах легко ошибиться. Против часовой — те же два шага, только отражаются столбцы, а не строки. В Unity: поворот фигуры тетриса или префаба комнаты на сетке.', cx: 'O(n²) время · O(1) память' },
      { variant: 'Маркеры в первой строке и столбце', task: 'Если клетка равна 0, обнули всю её строку и весь столбец. На месте, с O(1) доп. памяти.', idea: 'm[r][0] и m[0][c] служат флагами «строку r / столбец c обнулить». Два bool запоминают, были ли в первой строке и первом столбце свои нули. Внутренние клетки заполняем по маркерам, строку и столбец маркеров — последними.', why: 'Очевидное решение держит два массива — для строк и для столбцов, это O(rows + cols). Обнулять сразу нельзя: новые нули расползутся дальше. И здесь важен порядок: обнулишь первую строку слишком рано — пропадут маркеры.', cx: 'O(rows · cols) время · O(1) память' },
      { variant: 'Четыре границы сходятся', task: 'Верни все элементы матрицы по спирали: по часовой стрелке от левого верхнего угла.', idea: 'Держим top, bottom, left и right. Идём вправо по top, потом top++; вниз по right, right−−; влево по bottom, bottom−−; вверх по left, left++. Повторяем, пока top ≤ bottom и left ≤ right.', why: 'Вся сложность — в двух внутренних проверках: когда осталась одна строка или один столбец, без них обратный путь прочитает её второй раз. Spiral Matrix II (#59) идёт тем же путём, только заполняет, а не читает.', cx: 'O(rows · cols) время · O(1) доп. память' },
      { variant: 'Два бита на клетку', task: 'Игра «Жизнь» Конвея: живая клетка с 2 или 3 живыми соседями (из 8) выживает, мёртвая ровно с 3 оживает, остальные умирают или остаются мёртвыми. Посчитай следующее поколение на месте.', idea: 'В каждой клетке два состояния: бит 0 — сейчас, бит 1 — потом. Первый проход считает соседей по board[y][x] & 1 и ставит бит 1 там, где клетка будет жить (значения 0–3). Второй проход — board[r][c] >>= 1.', why: 'Если сразу записать новое состояние, сломаются соседи, которых ещё не посчитали; копия доски стоит O(R·C). Лишний бит сохраняет настоящее читаемым, пока его не прочитают все, — ответ на вопрос главы «все читатели уже прочитали клетку?» не порядком, а кодированием.', cx: 'O(R·C) время · O(1) память' },
      { variant: 'По строкам — в гистограммы', task: 'Матрица из 0 и 1. Найди самый большой прямоугольник только из единиц и верни его площадь.', idea: 'Для каждой строки считаем высоты: сколько единиц поднимается от неё вверх в каждом столбце. Тогда каждая строка — это Largest Rectangle in Histogram (#84), и монотонный стек решает её за O(cols).', why: 'Главный ход — свести 2D к 1D: высоты несут всё, что важно о строках выше. Maximal Square (#221) спрашивает то же про квадраты и решается уже через DP.', cx: 'O(rows · cols) время · O(cols) память' },
    ],
  },

  /* labels of the chapter 13 rig variables */
  'var.prefixProd': { en: 'prefix', ru: 'prefix' },
  'var.suffixProd': { en: 'suffix', ru: 'suffix' },
  'var.swaps': { en: 'swaps', ru: 'обменов' },
  'var.firstRowZero': { en: 'firstRowZero', ru: 'firstRowZero' },
  'var.firstColZero': { en: 'firstColZero', ru: 'firstColZero' },
  'var.bounds': { en: 'top / bottom / left / right', ru: 'top / bottom / left / right' },
  'var.liveAround': { en: 'live neighbors', ru: 'живых соседей' },
  'var.cellBits': { en: 'cell = next|now', ru: 'клетка = потом|сейчас' },
  'var.stackCols': { en: 'stack, bottom → top (column:height)', ru: 'стек, низ → верх (столбец:высота)' },
};
