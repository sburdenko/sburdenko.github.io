/** Step texts for the arrays and matrices rigs. */
const list = a => `[${a.join(', ')}]`;
/** Game of Life: a note when some neighbors already carry their future in bit 1. */
const hint = (marked, lang) => (!marked ? '' : lang === 'en'
  ? ` Neighbors already holding 2 or 3: ${marked} — & 1 still reads their present.`
  : ` Соседей, где уже записано 2 или 3: ${marked} — & 1 всё равно читает их настоящее.`);

export const EV_D = {
  /* Product of Array Except Self */
  'pes.ev.start': {
    en: () => 'ans[i] = (product left of i) × (product right of i). Pass 1 writes the left products into ans, pass 2 multiplies in the right ones. No division.',
    ru: () => 'ans[i] = (произведение слева от i) × (произведение справа от i). Первый проход пишет в ans произведения слева, второй домножает на произведения справа. Без деления.',
  },
  'pes.ev.left': {
    en: (i, before, x, prefix) => `ans[${i}] = prefix = <b>${before}</b> — ${i ? `the product of everything left of ${i} (highlighted)` : 'nothing is left of 0, so 1'}. Then prefix × ${x} → ${prefix}.`,
    ru: (i, before, x, prefix) => `ans[${i}] = prefix = <b>${before}</b> — ${i ? `произведение всего, что левее ${i} (подсвечено)` : 'левее 0 ничего нет, поэтому 1'}. Потом prefix × ${x} → ${prefix}.`,
  },
  'pes.ev.turn': {
    en: last => `Every ans[i] holds its left product. Now walk back from ${last} with suffix = 1 — the product of everything to the right.`,
    ru: last => `В каждом ans[i] лежит произведение слева. Теперь идём обратно от ${last} с suffix = 1 — произведением всего, что правее.`,
  },
  'pes.ev.right': {
    en: (i, left, right, ans, x, suffix) => `ans[${i}] = ${left} × suffix ${right} = <b>${ans}</b> — final. Then suffix × ${x} → ${suffix}.`,
    ru: (i, left, right, ans, x, suffix) => `ans[${i}] = ${left} × suffix ${right} = <b>${ans}</b> — готово. Потом suffix × ${x} → ${suffix}.`,
  },
  'pes.ev.done': {
    en: ans => `Answer: <b>${list(ans)}</b>. Two passes, no division, and the only extra memory is two numbers.`,
    ru: ans => `Ответ: <b>${list(ans)}</b>. Два прохода, без деления, а из лишней памяти — два числа.`,
  },

  /* Rotate Image */
  'rot.ev.start': {
    en: n => `Rotate ${n} × ${n} clockwise in two passes: transpose over the main diagonal (dashed), then mirror every row. Only cells above the diagonal start a swap, otherwise every pair would swap back.`,
    ru: n => `Поворачиваем ${n} × ${n} по часовой в два прохода: транспонируем относительно главной диагонали (пунктир), потом отражаем каждую строку. Обмен начинают только клетки над диагональю, иначе каждая пара поменялась бы обратно.`,
  },
  'rot.ev.tswap': {
    en: (r, c, a, b) => `Transpose: (${r}, ${c}) ↔ (${c}, ${r}) — ${a} and ${b} change places.`,
    ru: (r, c, a, b) => `Транспонируем: (${r}, ${c}) ↔ (${c}, ${r}) — ${a} и ${b} меняются местами.`,
  },
  'rot.ev.mirror': {
    en: () => 'Transposed: rows became columns. Now mirror every row left ↔ right around the dashed axis — that turns the transpose into a clockwise rotation.',
    ru: () => 'Транспонировали: строки стали столбцами. Теперь отражаем каждую строку слева направо относительно оси (пунктир) — так транспонирование превращается в поворот по часовой.',
  },
  'rot.ev.rswap': {
    en: (r, a, b, x, y) => `Row ${r}: swap columns ${a} and ${b} — ${x} ↔ ${y}.`,
    ru: (r, a, b, x, y) => `Строка ${r}: меняем столбцы ${a} и ${b} — ${x} ↔ ${y}.`,
  },
  'rot.ev.done': {
    en: swaps => `Rotated in place: <b>${swaps}</b> swaps and no second matrix.`,
    ru: swaps => `Повернули на месте: <b>${swaps}</b> обменов и никакой второй матрицы.`,
  },

  /* Set Matrix Zeroes */
  'smz.ev.start': {
    en: () => 'A zero clears its row and its column. Instead of two extra arrays, the first row and column (highlighted) will hold the markers.',
    ru: () => 'Ноль обнуляет свою строку и свой столбец. Вместо двух лишних массивов маркеры будут жить в первой строке и первом столбце (подсвечены).',
  },
  'smz.ev.flags': {
    en: (row, col) => `First two flags: the first row ${row ? 'has' : 'has no'} zero of its own, the first column ${col ? 'has' : 'has no'}. The markers will overwrite these cells, so remember it now.`,
    ru: (row, col) => `Сначала два флага: в первой строке ${row ? 'есть' : 'нет'} своего нуля, в первом столбце — ${col ? 'есть' : 'нет'}. Маркеры затрут эти клетки, поэтому запоминаем сейчас.`,
  },
  'smz.ev.mark': {
    en: (r, c) => `Zero at (${r}, ${c}): set the markers m[${r}][0] = 0 and m[0][${c}] = 0 — “row ${r} and column ${c} must go”.`,
    ru: (r, c) => `Ноль в (${r}, ${c}): ставим маркеры m[${r}][0] = 0 и m[0][${c}] = 0 — «строку ${r} и столбец ${c} обнулить».`,
  },
  'smz.ev.fill': {
    en: (found, inner) => (inner
      ? `Scan done: ${found === 1 ? 'one zero' : `${found} zeros`} inside. Now fill the inner cells from the markers; the first row and column are still needed, so they wait.`
      : 'No inner cells: the matrix is one row or one column wide. Only the flags decide.'),
    ru: (found, inner) => (inner
      ? `Обход закончен, нулей внутри: ${found}. Теперь заполняем внутренние клетки по маркерам; первая строка и столбец ещё нужны, поэтому ждут.`
      : 'Внутренних клеток нет: матрица в одну строку или в один столбец. Решают только флаги.'),
  },
  'smz.ev.row': {
    en: (r, byRow, cols) => (byRow
      ? `Row ${r}: its marker m[${r}][0] is 0 — the whole row becomes 0.`
      : `Row ${r}: column${cols.length > 1 ? 's' : ''} ${cols.join(', ')} ${cols.length > 1 ? 'have' : 'has'} a 0 marker in the first row — ${cols.length > 1 ? 'those cells become' : 'that cell becomes'} 0.`),
    ru: (r, byRow, cols) => (byRow
      ? `Строка ${r}: её маркер m[${r}][0] = 0 — обнуляем всю строку.`
      : `Строка ${r}: у ${cols.length > 1 ? 'столбцов' : 'столбца'} ${cols.join(', ')} маркер 0 в первой строке — обнуляем ${cols.length > 1 ? 'эти клетки' : 'эту клетку'}.`),
  },
  'smz.ev.keep': {
    en: r => `Row ${r}: no marker reaches a non-zero cell — nothing changes.`,
    ru: r => `Строка ${r}: ни один маркер не задевает ненулевую клетку — ничего не меняется.`,
  },
  'smz.ev.top': {
    en: (zero, n) => (zero
      ? `firstRowZero is true: clear the first row${n ? '' : ' (it is all zeros already)'}. Only now — its markers are no longer needed.`
      : 'firstRowZero is false: leave the first row. Its 0 markers are exactly the cells of the zeroed columns.'),
    ru: (zero, n) => (zero
      ? `firstRowZero = true: обнуляем первую строку${n ? '' : ' (она и так из нулей)'}. Только сейчас — её маркеры больше не нужны.`
      : 'firstRowZero = false: первую строку не трогаем. Её маркеры 0 — как раз клетки обнулённых столбцов.'),
  },
  'smz.ev.left': {
    en: (zero, n) => (zero
      ? `firstColZero is true: clear the first column${n ? '' : ' (it is all zeros already)'}.`
      : 'firstColZero is false: leave the first column. Its 0 markers are exactly the cells of the zeroed rows.'),
    ru: (zero, n) => (zero
      ? `firstColZero = true: обнуляем первый столбец${n ? '' : ' (он и так из нулей)'}.`
      : 'firstColZero = false: первый столбец не трогаем. Его маркеры 0 — как раз клетки обнулённых строк.'),
  },
  'smz.ev.done': {
    en: () => 'Done in place: all the bookkeeping lived in the matrix itself, O(1) extra memory.',
    ru: () => 'Готово на месте: весь учёт жил в самой матрице, O(1) доп. памяти.',
  },

  /* Spiral Matrix */
  'spi.ev.start': {
    en: (rows, cols) => `Four bounds: top = 0, bottom = ${rows - 1}, left = 0, right = ${cols - 1}. Walk the outer ring, then pull the bounds in (dashed frame).`,
    ru: (rows, cols) => `Четыре границы: top = 0, bottom = ${rows - 1}, left = 0, right = ${cols - 1}. Проходим внешнее кольцо и сдвигаем границы внутрь (пунктирная рамка).`,
  },
  'spi.ev.right': {
    en: (vals, top) => `→ along row ${top - 1}: ${vals.join(', ')}. That row is done: top → ${top}.`,
    ru: (vals, top) => `→ по строке ${top - 1}: ${vals.join(', ')}. Строка пройдена: top → ${top}.`,
  },
  'spi.ev.down': {
    en: (vals, top, bottom, left, right) => `↓ down column ${right + 1}: ${vals.join(', ')}. That column is done: right → ${right}.`,
    ru: (vals, top, bottom, left, right) => `↓ вниз по столбцу ${right + 1}: ${vals.join(', ')}. Столбец пройден: right → ${right}.`,
  },
  'spi.ev.left': {
    en: (vals, top, bottom) => `← back along row ${bottom + 1}: ${vals.join(', ')}. bottom → ${bottom}.`,
    ru: (vals, top, bottom) => `← обратно по строке ${bottom + 1}: ${vals.join(', ')}. bottom → ${bottom}.`,
  },
  'spi.ev.up': {
    en: (vals, top, bottom, left) => `↑ up column ${left - 1}: ${vals.join(', ')}. left → ${left}.`,
    ru: (vals, top, bottom, left) => `↑ вверх по столбцу ${left - 1}: ${vals.join(', ')}. left → ${left}.`,
  },
  'spi.ev.noRow': {
    en: (top, bottom) => `top = ${top} > bottom = ${bottom}: no row is left, so skip the way left. Without this check the last row would be read a second time.`,
    ru: (top, bottom) => `top = ${top} > bottom = ${bottom}: строк не осталось, путь влево пропускаем. Без этой проверки последняя строка прочиталась бы второй раз.`,
  },
  'spi.ev.noCol': {
    en: (left, right) => `left = ${left} > right = ${right}: no column is left, so skip the way up. Without this check the last column would be read a second time.`,
    ru: (left, right) => `left = ${left} > right = ${right}: столбцов не осталось, путь вверх пропускаем. Без этой проверки последний столбец прочитался бы второй раз.`,
  },
  'spi.ev.done': {
    en: values => `The bounds crossed, every cell was read once: <b>${list(values)}</b>.`,
    ru: values => `Границы сошлись, каждая клетка прочитана один раз: <b>${list(values)}</b>.`,
  },

  /* Maximal Rectangle */
  'mrect.ev.start': {
    en: () => 'Go row by row. heights[c] = how many 1s go up from the current row in column c. Every row is then a histogram for Largest Rectangle in Histogram with a monotonic stack.',
    ru: () => 'Идём по строкам. heights[c] — сколько единиц поднимается от текущей строки вверх в столбце c. Тогда каждая строка — гистограмма для Largest Rectangle in Histogram с монотонным стеком.',
  },
  'mrect.ev.row': {
    en: (r, h) => `Row ${r}: a 1 adds to its column’s height, a 0 resets it. heights = ${list(h)}. Clear the stack and scan this histogram.`,
    ru: (r, h) => `Строка ${r}: единица наращивает высоту своего столбца, ноль сбрасывает. heights = ${list(h)}. Очищаем стек и проходим эту гистограмму.`,
  },
  'mrect.ev.push': {
    en: (i, h) => `push column ${i} (height ${h}) — heights on the stack still grow.`,
    ru: (i, h) => `push столбца ${i} (высота ${h}) — высоты в стеке по-прежнему растут.`,
  },
  'mrect.ev.pop': {
    en: (j, h, w, area, rec, last) => `${last ? 'End of the row (height 0): ' : ''}pop column ${j}, height ${h}. It stretches over width ${w} → area ${area}${rec ? ' — <b>new best</b>' : ''}.`,
    ru: (j, h, w, area, rec, last) => `${last ? 'Конец строки (высота 0): ' : ''}pop столбца ${j}, высота ${h}. Она тянется на ширину ${w} → площадь ${area}${rec ? ' — <b>рекорд</b>' : ''}.`,
  },
  'mrect.ev.done': {
    en: best => `Largest rectangle of 1s: <b>${best}</b>. Each row costs O(cols), the whole matrix O(rows · cols).`,
    ru: best => `Самый большой прямоугольник из единиц: <b>${best}</b>. Каждая строка стоит O(cols), вся матрица — O(rows · cols).`,
  },

  /* Game of Life */
  'gol.ev.start': {
    en: (rows, cols) => `${rows} × ${cols}. Every cell gets two bits: bit 0 (right) is the state now, bit 1 (left) the state next. Pass 1 writes only bit 1, so the present stays readable for the neighbors not counted yet.`,
    ru: (rows, cols) => `${rows} × ${cols}. У каждой клетки два бита: бит 0 (правый) — состояние сейчас, бит 1 (левый) — состояние потом. Первый проход пишет только бит 1, поэтому настоящее остаётся читаемым для соседей, которых ещё не считали.`,
  },
  'gol.ev.lives': {
    en: (r, c, live, v, marked) => `(${r}, ${c}) is alive with ${live} live neighbors — it survives: bit 1 = 1, the cell becomes <b>${v}</b>.${hint(marked, 'en')}`,
    ru: (r, c, live, v, marked) => `(${r}, ${c}) жива, живых соседей ${live} — выживает: бит 1 = 1, в клетке теперь <b>${v}</b>.${hint(marked, 'ru')}`,
  },
  'gol.ev.under': {
    en: (r, c, live, v, marked) => `(${r}, ${c}) is alive but has only ${live} live neighbor(s) — it dies of loneliness. Bit 1 stays 0, the cell keeps <b>${v}</b>: alive now, dead next.${hint(marked, 'en')}`,
    ru: (r, c, live, v, marked) => `(${r}, ${c}) жива, но живых соседей всего ${live} — умирает от одиночества. Бит 1 остаётся 0, в клетке <b>${v}</b>: сейчас жива, потом нет.${hint(marked, 'ru')}`,
  },
  'gol.ev.over': {
    en: (r, c, live, v, marked) => `(${r}, ${c}) is alive with ${live} live neighbors — overcrowded, it dies. Bit 1 stays 0, the cell keeps <b>${v}</b>.${hint(marked, 'en')}`,
    ru: (r, c, live, v, marked) => `(${r}, ${c}) жива, живых соседей ${live} — перенаселение, умирает. Бит 1 остаётся 0, в клетке <b>${v}</b>.${hint(marked, 'ru')}`,
  },
  'gol.ev.born': {
    en: (r, c, live, v, marked) => `(${r}, ${c}) is dead with exactly 3 live neighbors — it is born: bit 1 = 1, the cell becomes <b>${v}</b> (dead now, alive next).${hint(marked, 'en')}`,
    ru: (r, c, live, v, marked) => `(${r}, ${c}) мертва, и живых соседей ровно 3 — рождается: бит 1 = 1, в клетке теперь <b>${v}</b> (сейчас мертва, потом жива).${hint(marked, 'ru')}`,
  },
  'gol.ev.empty': {
    en: (r, c, live, v, marked) => `(${r}, ${c}) is dead with ${live} live neighbor(s), not 3 — it stays dead, <b>${v}</b>.${hint(marked, 'en')}`,
    ru: (r, c, live, v, marked) => `(${r}, ${c}) мертва, живых соседей ${live}, а не 3 — остаётся мёртвой, <b>${v}</b>.${hint(marked, 'ru')}`,
  },
  'gol.ev.turn': {
    en: (born, died) => `Pass 1 is over: every cell knows its future (${born} born, ${died} die). Pass 2 forgets the present: board[r][c] >>= 1 moves bit 1 into bit 0.`,
    ru: (born, died) => `Первый проход закончен: каждая клетка знает своё будущее (родятся ${born}, умрут ${died}). Второй проход забывает настоящее: board[r][c] >>= 1 переносит бит 1 в бит 0.`,
  },
  'gol.ev.shift': {
    en: (r, before, after) => `Row ${r}: ${list(before)} >> 1 → <b>${list(after)}</b>.`,
    ru: (r, before, after) => `Строка ${r}: ${list(before)} >> 1 → <b>${list(after)}</b>.`,
  },
  'gol.ev.done': {
    en: (born, died) => `Next generation, in place: ${born} cell(s) born, ${died} died. Memory: one extra bit per cell that was already there.`,
    ru: (born, died) => `Следующее поколение готово на месте: родилось ${born}, умерло ${died}. Память — один лишний бит в каждой клетке, который и так был.`,
  },
};
