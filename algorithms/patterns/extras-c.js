/** Extras for chapters graph, heap, paths, back, greedy: tricky inputs, an operation counter, predict-the-step forks, interviewer follow-ups, related problems. */

/* ---------- counting helpers (pure, no imports) ---------- */

const DIR4 = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const inGrid = (g, r, c) => r >= 0 && c >= 0 && r < g.length && c < g[0].length;
const sum = a => a.reduce((s, x) => s + x, 0);

/** Comparisons made by a top-down merge sort of `items` under `cmp`. */
function sortComparisons(items, cmp) {
  let n = 0;
  const ms = a => {
    if (a.length < 2) return a;
    const mid = a.length >> 1, L = ms(a.slice(0, mid)), R = ms(a.slice(mid)), out = [];
    let i = 0, j = 0;
    while (i < L.length && j < R.length) { n++; out.push(cmp(L[i], R[j]) <= 0 ? L[i++] : R[j++]); }
    return out.concat(L.slice(i), R.slice(j));
  };
  ms([...items]);
  return n;
}

/** A binary heap that counts its comparisons; above(a, b) is true when a belongs higher than b. */
function countingHeap(above) {
  const h = [];
  let cmp = 0;
  const up = (i, j) => { cmp++; return above(h[i], h[j]); };
  return {
    get size() { return h.length; },
    get cmp() { return cmp; },
    top: () => h[0],
    push(x) {
      h.push(x);
      for (let i = h.length - 1; i > 0;) {
        const p = (i - 1) >> 1;
        if (!up(i, p)) break;
        [h[i], h[p]] = [h[p], h[i]];
        i = p;
      }
    },
    pop() {
      const top = h[0], last = h.pop();
      if (h.length) {
        h[0] = last;
        for (let i = 0; ;) {
          const l = 2 * i + 1, r = l + 1;
          let m = i;
          if (l < h.length && up(l, m)) m = l;
          if (r < h.length && up(r, m)) m = r;
          if (m === i) break;
          [h[i], h[m]] = [h[m], h[i]];
          i = m;
        }
      }
      return top;
    },
  };
}

/** Size of the 4-connected region of value `v` around (r, c). */
function regionSize(g, r, c, v) {
  const seen = new Set([`${r},${c}`]), stack = [[r, c]];
  while (stack.length) {
    const [y, x] = stack.pop();
    for (const [dy, dx] of DIR4) {
      const ny = y + dy, nx = x + dx;
      if (inGrid(g, ny, nx) && g[ny][nx] === v && !seen.has(`${ny},${nx}`)) { seen.add(`${ny},${nx}`); stack.push([ny, nx]); }
    }
  }
  return seen.size;
}

const oneApart = (a, b) => {
  let d = 0;
  for (let i = 0; i < a.length && d < 2; i++) if (a[i] !== b[i]) d++;
  return d === 1;
};

/** Mirrors the C# BFS of Word Ladder: words dequeued until the end word comes out (or the queue runs dry). */
function ladderBfsVisits(begin, end, list) {
  const words = new Set(list);
  if (!words.has(end)) return 0;
  let queue = [begin], visits = 0;
  words.delete(begin);
  while (queue.length) {
    const next = [];
    for (const w of queue) {
      visits++;
      if (w === end) return visits;
      for (let i = 0; i < w.length; i++) {
        for (let k = 0; k < 26; k++) {
          const cand = w.slice(0, i) + String.fromCharCode(97 + k) + w.slice(i + 1);
          if (words.delete(cand)) next.push(cand);
        }
      }
    }
    queue = next;
  }
  return visits;
}

/** DFS over every simple chain from begin (a chain stops at the end word): number of calls, by a DP over visited sets. */
function ladderDfsVisits(begin, end, list) {
  const words = [...new Set(list)].filter(w => w !== begin);
  if (!words.includes(end)) return 0;
  const n = words.length, endI = words.indexOf(end);
  const adj = words.map(a => words.map((b, j) => (oneApart(a, b) ? j : -1)).filter(j => j >= 0));
  const dp = new Float64Array((1 << n) * n);
  let total = 1;
  words.forEach((w, j) => { if (oneApart(begin, w)) dp[(1 << j) * n + j] = 1; });
  for (let mask = 1; mask < 1 << n; mask++) {
    for (let v = 0; v < n; v++) {
      const ways = dp[mask * n + v];
      if (!ways) continue;
      total += ways;
      if (v === endI) continue;
      for (const u of adj[v]) if (!((mask >> u) & 1)) dp[(mask | (1 << u)) * n + u] += ways;
    }
  }
  return total;
}

/** Dijkstra on the effort grid (stable ties): neighbour checks made before the corner is popped. */
function effortDijkstraChecks(h) {
  const R = h.length, C = h[0].length, best = h.map(r => r.map(() => Infinity));
  if (R === 1 && C === 1) return 0;
  best[0][0] = 0;
  const pq = [[0, 0, 0, 0]];
  let seq = 1, checks = 0;
  while (pq.length) {
    let bi = 0;
    for (let i = 1; i < pq.length; i++) if (pq[i][0] < pq[bi][0] || (pq[i][0] === pq[bi][0] && pq[i][3] < pq[bi][3])) bi = i;
    const [e, r, c] = pq.splice(bi, 1)[0];
    if (e > best[r][c]) continue;
    if (r === R - 1 && c === C - 1) return checks;
    for (const [dr, dc] of DIR4) {
      const y = r + dr, x = c + dc;
      if (!inGrid(h, y, x)) continue;
      checks++;
      const cost = Math.max(e, Math.abs(h[y][x] - h[r][c]));
      if (cost < best[y][x]) { best[y][x] = cost; pq.push([cost, y, x, seq++]); }
    }
  }
  return checks;
}

/** Minimum effort itself (small grids): binary-free Dijkstra without counting. */
function minEffortValue(h) {
  const R = h.length, C = h[0].length, best = h.map(r => r.map(() => Infinity)), done = h.map(r => r.map(() => false));
  best[0][0] = 0;
  for (;;) {
    let br = -1, bc = -1;
    for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (!done[r][c] && (br < 0 || best[r][c] < best[br][bc])) { br = r; bc = c; }
    if (br === R - 1 && bc === C - 1) return best[br][bc];
    done[br][bc] = true;
    for (const [dr, dc] of DIR4) {
      const y = br + dr, x = bc + dc;
      if (inGrid(h, y, x)) best[y][x] = Math.min(best[y][x], Math.max(best[br][bc], Math.abs(h[y][x] - h[br][bc])));
    }
  }
}

/** Grid with obstacles: the C# state BFS, counting states marked as seen (the start included). */
function obstacleStates(grid, k) {
  const R = grid.length, C = grid[0].length;
  if (R === 1 && C === 1) return 1;
  const seen = new Set([`0,0,${k}`]);
  let queue = [[0, 0, k]];
  while (queue.length) {
    const next = [];
    for (const [r, c, rem] of queue) {
      for (const [dr, dc] of DIR4) {
        const y = r + dr, x = c + dc;
        if (!inGrid(grid, y, x)) continue;
        const left = rem - grid[y][x];
        if (left < 0 || seen.has(`${y},${x},${left}`)) continue;
        if (y === R - 1 && x === C - 1) return seen.size;
        seen.add(`${y},${x},${left}`);
        next.push([y, x, left]);
      }
    }
    queue = next;
  }
  return seen.size;
}

/** Grid with obstacles, naive: for every set of at most k walls, a BFS (bit-parallel) over the grid with those walls gone. */
function obstacleSubsets(grid, k) {
  const R = grid.length, C = grid[0].length;
  if (R === 1 && C === 1) return 1;
  const bit = (r, c) => 2 ** (r * C + c);
  let free = 0, notFirst = 0, notLast = 0;
  const walls = [];
  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c]) walls.push(bit(r, c)); else free += bit(r, c);
      if (c > 0) notFirst += bit(r, c);
      if (c < C - 1) notLast += bit(r, c);
    }
  }
  const target = bit(R - 1, C - 1), all = 2 ** (R * C) - 1;
  const pop = x => { let n = 0; while (x) { x &= x - 1; n++; } return n; };
  const flood = open => {
    let reach = 1;
    for (;;) {
      const grow = (reach | ((reach << 1) & notFirst) | ((reach >>> 1) & notLast) | (reach << C) | (reach >>> C)) & open & all;
      const next = (reach | grow) >>> 0;
      if (next & target || next === reach) return pop(next);
      reach = next;
    }
  };
  let total = 0;
  const pick = (from, left, open) => {
    total += flood(open);
    if (!left) return;
    for (let i = from; i < walls.length; i++) pick(i + 1, left - 1, open | walls[i]);
  };
  pick(0, Math.min(k, walls.length), free);
  return total;
}

/** N-Queens: squares tried by the backtracking until the first solution (or the end). */
function queensFirst(n) {
  const cols = [], d1 = [], d2 = [], q = [];
  let tried = 0;
  const place = r => {
    if (r === n) return true;
    for (let c = 0; c < n; c++) {
      tried++;
      if (cols[c] || d1[r + c] || d2[r - c + n]) continue;
      cols[c] = d1[r + c] = d2[r - c + n] = true;
      q[r] = c;
      if (place(r + 1)) return true;
      cols[c] = d1[r + c] = d2[r - c + n] = false;
    }
    return false;
  };
  const found = place(0);
  return { tried, solution: found ? q.slice(0, n) : null };
}

/** Word Search: cells stepped on (in the grid, not on the current path), with or without the letter check. */
function wordSearchCells(board, word, prune) {
  const R = board.length, C = board[0].length, on = board.map(r => r.map(() => false)), L = word.length;
  let cells = 0;
  const dfs = (r, c, i, built) => {
    if (r < 0 || c < 0 || r >= R || c >= C || on[r][c]) return false;
    cells++;
    if (prune && board[r][c] !== word[i]) return false;
    const s = built + board[r][c];
    if (i === L - 1) return s === word;
    on[r][c] = true;
    const found = DIR4.some(([dr, dc]) => dfs(r + dr, c + dc, i + 1, s));
    on[r][c] = false;
    return found;
  };
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (dfs(r, c, 0, '')) return cells;
  return cells;
}

/* ---------- the extras ---------- */

export const EX_C = {
  /* ===== graph ===== */
  flood: {
    tricky: [
      { input: { image: '1110 1100 1011 0111', sr: '1', sc: '1', color: '1' },
        ru: 'Новый цвет совпадает со старым: без проверки <code>start != color</code> DFS бесконечно ходит по «уже покрашенным» клеткам и роняет стек. Верно — вернуть картинку без изменений.',
        en: 'The new colour equals the old one: without the <code>start != color</code> check the DFS keeps walking over "already painted" cells and overflows the stack. Correct: return the image unchanged.' },
      { input: { image: '101 010 101', sr: '1', sc: '1', color: '2' },
        ru: 'Единицы касаются центра только углами. С восемью направлениями перекрасились бы все пять, а верно — одна клетка: соседи только по сторонам.',
        en: 'The ones touch the centre only at the corners. With eight directions all five would turn, but the answer is a single cell: neighbours share a side.' },
    ],
    ops: {
      unit: { ru: 'проверок клеток', en: 'cell checks' },
      naive: { ru: 'проходы по всей картинке, пока что-то меняется', en: 'full-image sweeps until nothing changes',
        count: p => {
          const g = p.image, from = g[p.sr][p.sc];
          if (from === p.color) return 1;
          const R = g.length, C = g[0].length, mark = g.map(r => r.map(() => false));
          mark[p.sr][p.sc] = true;
          let checks = 0, changed = true;
          while (changed) {
            changed = false;
            for (let r = 0; r < R; r++) {
              for (let c = 0; c < C; c++) {
                checks++;
                if (mark[r][c] || g[r][c] !== from) continue;
                if (DIR4.some(([dr, dc]) => inGrid(g, r + dr, c + dc) && mark[r + dr][c + dc])) { mark[r][c] = true; changed = true; }
              }
            }
          }
          return checks;
        } },
      ours: { ru: 'DFS от стартовой клетки', en: 'DFS from the start cell',
        count: p => (p.image[p.sr][p.sc] === p.color ? 1 : 1 + 4 * regionSize(p.image, p.sr, p.sc, p.image[p.sr][p.sc])) },
    },
    predict: [
      { q: { ru: 'Клетка покрашена. DFS найдёт ещё клетку старого цвета или заливка закончена?', en: 'A cell is painted. Will the DFS find another cell of the old colour, or is the fill done?' },
        keys: { 'fill.ev.paint': { ru: 'красим ещё клетку', en: 'paint another cell' },
                'fill.ev.done': { ru: 'заливка закончена', en: 'the fill is done' } } },
    ],
    followups: [
      { ru: { q: 'А если соседями считаются и диагональные клетки?', a: 'Добавь четыре диагональных направления — O(R·C) не меняется. Но области, которые касаются только углом, сольются в одну.' },
        en: { q: 'What if diagonal cells count as neighbours too?', a: 'Add the four diagonal directions; it is still O(R·C). Regions that touch only at a corner now merge into one.' } },
      { ru: { q: 'Перекрасить только границу области (#1034 Coloring A Border)?', a: 'Тот же обход, но клетку красим, только если у неё есть сосед не из области или край сетки. Красить надо после обхода: иначе новый цвет собьёт проверку «сосед из области».' },
        en: { q: 'Recolour only the border of the region (#1034 Coloring A Border)?', a: 'Same traversal, but a cell is painted only if it has a neighbour outside the region or sits on the edge. Paint after the traversal, or the new colour breaks the "neighbour is in the region" test.' } },
    ],
    related: [
      { id: 'islands', ru: 'тот же DFS, только запускается из каждой непосещённой клетки', en: 'the same DFS, launched from every unvisited cell' },
      { id: 'flowField', ru: 'обход сетки от одной клетки, но BFS с расстояниями', en: 'a grid walk from one cell, but a BFS with distances' },
    ],
  },

  islands: {
    tricky: [
      { input: { grid: '101 010 101' },
        ru: 'Клетки касаются только углами — это пять отдельных островов. Обход в восемь сторон склеил бы их в один.',
        en: 'The cells touch only at corners, so these are five separate islands. An eight-way walk would glue them into one.' },
      { input: { grid: '101 111' },
        ru: 'Остров в форме U — один. Подсчёт «суши без соседа сверху и слева» насчитает два верхних угла и ответит 2.',
        en: 'The U-shaped island is one island. Counting "land with no land above or to the left" sees two top corners and answers 2.' },
    ],
    ops: {
      unit: { ru: 'посещений клеток', en: 'cell visits' },
      naive: { ru: 'новый BFS от каждой клетки суши', en: 'a fresh BFS from every land cell',
        count: p => {
          const g = p.grid;
          let visits = g.length * g[0].length;
          g.forEach((row, r) => row.forEach((v, c) => { if (v === 1) visits += regionSize(g, r, c, 1); }));
          return visits;
        } },
      ours: { ru: 'один DFS на остров', en: 'one DFS per island',
        count: p => p.grid.length * p.grid[0].length + sum(p.grid.map(r => sum(r))) },
    },
    predict: [
      { q: { ru: 'Что дальше: DFS красит ещё клетку этого острова или цикл находит новый остров?', en: 'What next: the DFS paints another cell of this island, or the loop finds a new island?' },
        keys: { 'graph.ev.fill': { ru: 'ещё клетка этого острова', en: 'another cell of this island' },
                'graph.ev.found': { ru: 'новый остров', en: 'a new island' } } },
    ],
    followups: [
      { ru: { q: 'Сетку нельзя портить. Как помечать посещённые?', a: 'Отдельный <code>bool[R, C]</code> или <code>HashSet</code> координат. Время то же, плюс O(R·C) памяти.' },
        en: { q: 'You may not modify the grid. How do you mark visited cells?', a: 'A separate <code>bool[R, C]</code> or a <code>HashSet</code> of coordinates. Same time, plus O(R·C) memory.' } },
      { ru: { q: 'Сетка огромная и читается по строкам, целиком в память не влезает.', a: 'Держи метки только двух соседних строк и сливай их через union-find: клетка берёт метку соседа сверху или слева. Памяти O(C), острова считаются по числу корней.' },
        en: { q: 'The grid is huge and streamed row by row; it does not fit in memory.', a: 'Keep labels for only two adjacent rows and merge them with union-find: a cell takes the label of its upper or left neighbour. O(C) memory; islands are counted as roots.' } },
      { ru: { q: 'Сколько островов разной формы (#694)?', a: 'Записывай форму острова: координаты клеток относительно первой найденной клетки. Строку формы клади в <code>HashSet</code>, ответ — его размер.' },
        en: { q: 'How many differently shaped islands are there (#694)?', a: 'Record each island\'s shape as cell offsets from its first cell. Put the shape string into a <code>HashSet</code>; the answer is its size.' } },
    ],
    related: [
      { id: 'unionFind', ru: 'те же компоненты связности, но слиянием множеств', en: 'the same connected components, found by merging sets' },
      { id: 'flood', ru: 'DFS, который топит один остров', en: 'the DFS that sinks a single island' },
    ],
  },

  islandPerimeter: {
    tricky: [
      { input: { grid: '1' },
        ru: 'Одна клетка суши: соседей нет, периметр 4. Код, который ищет остров DFS-ом от «первой клетки с соседями», тут ничего не найдёт.',
        en: 'A single land cell: no neighbours, perimeter 4. Code that starts its DFS from "the first cell with neighbours" finds nothing here.' },
      { input: { grid: '11 11' },
        ru: 'Квадрат 2 × 2: 16 сторон, 4 общие. Вычитай по 2 за каждую общую — будет 8; вычтешь по 1 — получишь 12.',
        en: 'A 2 × 2 square: 16 sides, 4 shared. Subtract 2 per shared side and you get 8; subtract 1 and you get 12.' },
    ],
    ops: {
      unit: { ru: 'проверок соседей', en: 'neighbour checks' },
      naive: { ru: 'все 4 соседа у каждой суши', en: 'all 4 neighbours of every land cell',
        count: p => 4 * sum(p.grid.map(r => sum(r))) },
      ours: { ru: 'только справа и снизу', en: 'only right and below',
        count: p => 2 * sum(p.grid.map(r => sum(r))) },
    },
    predict: [
      { q: { ru: 'Что следующее: общая сторона справа, общая сторона снизу или следующая клетка суши?', en: 'What comes next: a shared side on the right, a shared side below, or the next land cell?' },
        keys: { 'per.ev.right': { ru: 'общая сторона справа', en: 'shared side on the right' },
                'per.ev.down': { ru: 'общая сторона снизу', en: 'shared side below' },
                'per.ev.land': { ru: 'следующая клетка суши', en: 'the next land cell' } } },
    ],
    followups: [
      { ru: { q: 'Даны только координаты n клеток суши, сетка огромная.', a: 'Положи координаты в <code>HashSet</code> и для каждой клетки проверь соседа справа и снизу: O(n) вместо O(R·C).' },
        en: { q: 'You get only the coordinates of n land cells; the grid is huge.', a: 'Put the coordinates into a <code>HashSet</code> and test the right and lower neighbour of each: O(n) instead of O(R·C).' } },
      { ru: { q: 'Внутри острова есть озёра, а нужен только внешний берег.', a: 'Сначала залей воду BFS-ом от краёв сетки. Потом считай только стороны суши, которые смотрят на эту внешнюю воду или на край.' },
        en: { q: 'The island has lakes inside, and only the outer coastline counts.', a: 'First flood the water with a BFS from the grid edges. Then count only land sides that face this outer water or the edge.' } },
    ],
    related: [
      { id: 'spatialGrid', ru: 'клетки в хеше, соседей ищем по координатам', en: 'cells in a hash, neighbours looked up by coordinates' },
      { id: 'gameOfLife', ru: 'тоже один проход по сетке с подсчётом соседей', en: 'also one pass over the grid counting neighbours' },
    ],
  },

  oranges: {
    tricky: [
      { input: { grid: '1' },
        ru: 'Один свежий апельсин и ни одного гнилого: цикл BFS не делает ни шага. Вернуть 0 — ошибка, верно −1.',
        en: 'One fresh orange and no rotten ones: the BFS loop never runs. Returning 0 is wrong; the answer is −1.' },
      { input: { grid: '00 00' },
        ru: 'Апельсинов нет вовсе: свежих 0, значит, ответ 0 минут, а не −1.',
        en: 'No oranges at all: zero fresh ones, so the answer is 0 minutes, not −1.' },
      { input: { grid: '210 011 102' },
        ru: 'Апельсин в (2, 0) окружён пустыми клетками: гниль до него не дойдёт, ответ −1, хотя волна идёт ещё две минуты.',
        en: 'The orange at (2, 0) is boxed in by empty cells: rot never reaches it, so the answer is −1 even though the wave runs two more minutes.' },
    ],
    ops: {
      unit: { ru: 'обращений к клеткам', en: 'cell reads' },
      naive: { ru: 'каждую минуту обходить всю сетку', en: 'rescan the whole grid every minute',
        count: p => {
          let g = p.grid.map(r => [...r]);
          const R = g.length, C = g[0].length;
          let reads = R * C, fresh = sum(g.map(r => r.filter(v => v === 1).length));
          while (fresh > 0) {
            const next = g.map(r => [...r]);
            let rotted = 0;
            for (let r = 0; r < R; r++) {
              for (let c = 0; c < C; c++) {
                reads++;
                if (g[r][c] !== 1) continue;
                for (const [dr, dc] of DIR4) {
                  if (!inGrid(g, r + dr, c + dc)) continue;
                  reads++;
                  if (g[r + dr][c + dc] === 2) { next[r][c] = 2; rotted++; break; }
                }
              }
            }
            g = next;
            fresh -= rotted;
            if (!rotted) break;
          }
          return reads;
        } },
      ours: { ru: 'BFS сразу от всех гнилых', en: 'BFS from all rotten oranges at once',
        count: p => {
          const g = p.grid.map(r => [...r]);
          let reads = g.length * g[0].length, fresh = 0, queue = [];
          g.forEach((row, r) => row.forEach((v, c) => { if (v === 2) queue.push([r, c]); if (v === 1) fresh++; }));
          while (queue.length && fresh > 0) {
            const next = [];
            for (const [r, c] of queue) {
              for (const [dr, dc] of DIR4) {
                const y = r + dr, x = c + dc;
                if (!inGrid(g, y, x)) continue;
                reads++;
                if (g[y][x] !== 1) continue;
                g[y][x] = 2;
                fresh--;
                next.push([y, x]);
              }
            }
            queue = next;
          }
          return reads;
        } },
    },
    predict: [
      { q: { ru: 'Будет ли ещё минута гниения, или процесс закончен?', en: 'Will there be another minute of rotting, or is it over?' },
        keys: { 'orange.ev.minute': { ru: 'ещё минута', en: 'another minute' },
                'orange.ev.done': { ru: 'всё, итог', en: 'over, final answer' } } },
    ],
    followups: [
      { ru: { q: 'У клеток разное время заражения: из одной в другую гниль идёт w минут.', a: 'Слои BFS больше не равны минутам. Нужна Дейкстра из всех гнилых сразу: все они в очереди с приоритетом с временем 0, ответ — наибольшее расстояние.' },
        en: { q: 'Cells differ: rot takes w minutes to cross from one to the next.', a: 'BFS layers no longer equal minutes. Run Dijkstra from all rotten oranges at once: put them all in the priority queue at time 0; the answer is the largest distance.' } },
      { ru: { q: 'Как обойтись без подсчёта уровней в очереди?', a: 'Пиши в клетку минуту заражения: <code>grid[y][x] = grid[r][c] + 1</code>, начиная с 2. Ответ — максимум минус 2, если свежих не осталось.' },
        en: { q: 'How can you avoid tracking levels in the queue?', a: 'Store the infection minute in the cell: <code>grid[y][x] = grid[r][c] + 1</code>, starting from 2. The answer is the maximum minus 2, if no fresh orange is left.' } },
    ],
    related: [
      { id: 'nearestZero', ru: 'тот же BFS из многих источников, но нужна вся карта', en: 'the same multi-source BFS, but the whole map is the answer' },
      { id: 'flowField', ru: 'волна расстояний от цели по сетке', en: 'a distance wave from the goal across a grid' },
    ],
  },

  course: {
    tricky: [
      { input: { n: '4', prerequisites: '1-0 2-1 1-2 3-0' },
        ru: 'Курсы 1 и 2 ждут друг друга, а 0 и 3 проходятся спокойно. Ответ false: проверять надо, что взяты все n, а не что очередь вообще стартовала.',
        en: 'Courses 1 and 2 wait for each other, while 0 and 3 go through fine. The answer is false: check that all n were taken, not that the queue started at all.' },
      { input: { n: '3', prerequisites: '1-0 1-0' },
        ru: 'Одно и то же требование дважды. Степень курса 1 равна 2, и оба ребра её уменьшат — ответ true. Если убрать дубль из списка, но не из степени, курс 1 «застрянет».',
        en: 'The same prerequisite twice. Course 1 has in-degree 2 and both edges decrement it, so the answer is true. Dedupe the list but not the degree and course 1 gets "stuck".' },
    ],
    ops: {
      unit: { ru: 'просмотров рёбер', en: 'edge reads' },
      naive: { ru: 'после каждого курса заново искать свободный', en: 'search for a free course again after each one',
        count: p => {
          const E = p.prerequisites.length, taken = new Array(p.n).fill(false);
          let reads = 0;
          for (;;) {
            let found = -1;
            for (let c = 0; c < p.n && found < 0; c++) {
              if (taken[c]) continue;
              reads += E;
              if (p.prerequisites.every(([a, b]) => a !== c || taken[b])) found = c;
            }
            if (found < 0) return reads;
            taken[found] = true;
          }
        } },
      ours: { ru: 'Кан: степени и очередь', en: 'Kahn: in-degrees and a queue',
        count: p => {
          const next = Array.from({ length: p.n }, () => []), deg = new Array(p.n).fill(0);
          for (const [a, b] of p.prerequisites) { next[b].push(a); deg[a]++; }
          let reads = p.prerequisites.length;
          const queue = [];
          deg.forEach((d, i) => { if (!d) queue.push(i); });
          while (queue.length) {
            const c = queue.shift();
            for (const d of next[c]) { reads++; if (--deg[d] === 0) queue.push(d); }
          }
          return reads;
        } },
    },
    predict: [
      { q: { ru: 'Остался ли курс, у которого все требования уже выполнены?', en: 'Is there still a course whose prerequisites are all done?' },
        keys: { 'crs.ev.take': { ru: 'да, берём его', en: 'yes, take it' },
                'crs.ev.done': { ru: 'нет, итог', en: 'no, final answer' } } },
    ],
    followups: [
      { ru: { q: 'Ответ «нельзя» — покажи сам цикл.', a: 'DFS с тремя цветами: белый, серый (на стеке), чёрный. Ребро в серую вершину — цикл; его вершины — хвост стека от этой вершины.' },
        en: { q: 'The answer is "impossible": show the cycle itself.', a: 'DFS with three colours: white, grey (on the stack), black. An edge into a grey vertex closes a cycle; its vertices are the stack tail from that vertex.' } },
      { ru: { q: 'Курсы без зависимостей можно брать параллельно. Сколько семестров нужно минимум?', a: 'Кан по уровням: семестр — один слой очереди. Ответ — число слоёв; если взяли не все курсы, ответ −1.' },
        en: { q: 'Independent courses can run in parallel. What is the minimum number of semesters?', a: 'Kahn by levels: one semester is one layer of the queue. The answer is the number of layers, or −1 if some course was never taken.' } },
    ],
    related: [
      { id: 'cloneGraph', ru: 'BFS по спискам смежности ориентированного графа', en: 'a BFS over adjacency lists' },
      { id: 'unionFind', ru: 'цикл в неориентированном графе ловит union-find', en: 'union-find catches a cycle in an undirected graph' },
    ],
  },

  ladder: {
    tricky: [
      { input: { begin: 'hit', end: 'cog', words: 'hot, dot, dog, lot, log' },
        ru: '<code>cog</code> нет в словаре — ответ 0 сразу. BFS без этой проверки прочешет весь словарь и всё равно вернёт 0.',
        en: '<code>cog</code> is not in the dictionary, so the answer is 0 right away. A BFS without this check combs the whole dictionary and still returns 0.' },
      { input: { begin: 'hit', end: 'hot', words: 'hot' },
        ru: 'Ответ — число слов в цепочке, а не число замен: hit → hot — это 2, а не 1.',
        en: 'The answer counts words in the chain, not changes: hit → hot is 2, not 1.' },
    ],
    ops: {
      unit: { ru: 'посещений слов', en: 'word visits' },
      naive: { ru: 'DFS по всем цепочкам', en: 'DFS over every chain', count: p => ladderDfsVisits(p.begin, p.end, p.words) },
      ours: { ru: 'BFS по уровням', en: 'BFS by levels', count: p => ladderBfsVisits(p.begin, p.end, p.words) },
    },
    predict: [
      { q: { ru: 'Следующий уровень BFS: новые слова, цель или слова кончились?', en: 'Next BFS level: new words, the target, or no words left?' },
        keys: { 'wl.ev.level': { ru: 'новые слова', en: 'new words' },
                'wl.ev.found': { ru: 'цель найдена', en: 'target found' },
                'wl.ev.none': { ru: 'слова кончились', en: 'no words left' } } },
    ],
    followups: [
      { ru: { q: 'Верни все кратчайшие цепочки (#126).', a: 'BFS по уровням, но у слова запоминай всех родителей с предыдущего уровня; из словаря удаляй слова только после окончания уровня. Потом DFS от цели по родителям.' },
        en: { q: 'Return all shortest chains (#126).', a: 'BFS by levels, but keep every parent from the previous level; remove words from the dictionary only after the level ends. Then DFS from the target through the parents.' } },
      { ru: { q: 'Когда 26·L проб хуже простого сравнения со всеми словами?', a: 'Когда словарь маленький: при N &lt; 26·L сравнить слово со всеми N словами дешевле. Для длинных слов помогают шаблоны <code>h*t</code> → [hot, hit]: соседи без перебора букв.' },
        en: { q: 'When are 26·L probes worse than comparing with every word?', a: 'When the dictionary is small: with N &lt; 26·L, comparing against all N words is cheaper. For long words, patterns like <code>h*t</code> → [hot, hit] give neighbours without trying letters.' } },
    ],
    related: [
      { id: 'obstacles', ru: 'BFS по неявному графу: вершины рождаются на лету', en: 'BFS over an implicit graph whose vertices are generated on the fly' },
      { id: 'oranges', ru: 'BFS по уровням: уровень = шаг', en: 'BFS by levels: one level is one step' },
    ],
  },

  cloneGraph: {
    tricky: [
      { input: { edges: '1 2' },
        ru: 'Два узла: копия 2′ должна ссылаться на уже созданную 1′. Без проверки словаря DFS создаст новую копию 1, потом новую 2 — и так без конца.',
        en: 'Two nodes: copy 2′ must point at the existing 1′. Without the dictionary check a DFS makes a new copy of 1, then of 2, and never stops.' },
      { input: { edges: '1 2 | 2 3 | 3 1' },
        ru: 'Треугольник: когда 2 смотрит на 3, узел 3 ещё в очереди. Если искать копию только среди обработанных, появится вторая 3′. Верно: 3 копии и 6 ссылок.',
        en: 'A triangle: when 2 looks at 3, node 3 is still queued. Search for copies only among processed nodes and a second 3′ appears. Correct: 3 copies, 6 links.' },
    ],
    ops: {
      unit: { ru: 'шагов поиска копии', en: 'copy-lookup steps' },
      naive: { ru: 'копии в списке, поиск перебором', en: 'copies in a list, linear search',
        count: p => {
          const n = Math.max(...p.edges.flat()), adj = Array.from({ length: n + 1 }, () => []);
          for (const [a, b] of p.edges) { adj[a].push(b); adj[b].push(a); }
          adj.forEach(l => l.sort((x, y) => x - y));
          const made = [1], queue = [1];
          let steps = 0;
          while (queue.length) {
            const u = queue.shift();
            for (const v of adj[u]) {
              const at = made.indexOf(v);
              steps += at < 0 ? made.length : at + 1;
              if (at < 0) { made.push(v); queue.push(v); }
            }
          }
          return steps;
        } },
      ours: { ru: 'словарь «старый → новый»', en: 'an old → new dictionary', count: p => 2 * p.edges.length },
    },
    predict: [
      { q: { ru: 'У этого соседа уже есть копия?', en: 'Does this neighbour already have a copy?' },
        keys: { 'cg.ev.new': { ru: 'нет — создаём', en: 'no, create it' },
                'cg.ev.link': { ru: 'есть — только ссылка', en: 'yes, just a link' } } },
    ],
    followups: [
      { ru: { q: 'А если писать рекурсивным DFS?', a: 'Клади копию в словарь до того, как идёшь по соседям. Иначе цикл 1 → 2 → 1 не увидит копию 1′ и уйдёт в бесконечную рекурсию.' },
        en: { q: 'What if you write it as a recursive DFS?', a: 'Put the copy into the dictionary before visiting the neighbours. Otherwise the cycle 1 → 2 → 1 never sees 1′ and recursion never ends.' } },
      { ru: { q: 'Список со случайными указателями (#138): можно без словаря?', a: 'Да: вставь копию сразу после каждого узла, проставь <code>copy.random = node.random.next</code>, потом расплети два списка. Доп. память O(1).' },
        en: { q: 'A list with random pointers (#138): can you do it without a dictionary?', a: 'Yes: insert each copy right after its node, set <code>copy.random = node.random.next</code>, then unweave the two lists. O(1) extra memory.' } },
      { ru: { q: 'Граф несвязный, дан список всех узлов.', a: 'Запусти тот же BFS из каждого узла, у которого ещё нет копии; словарь общий на все запуски.' },
        en: { q: 'The graph is disconnected and you get a list of all nodes.', a: 'Run the same BFS from every node that has no copy yet, sharing one dictionary across the runs.' } },
    ],
    related: [
      { id: 'serialize', ru: 'обход, который восстанавливает связи структуры', en: 'a traversal that rebuilds a structure\'s links' },
      { id: 'lru', ru: 'словарь, который выдаёт узел по ключу', en: 'a dictionary that hands you the node by key' },
    ],
  },

  /* ===== heap ===== */
  kth: {
    tricky: [
      { input: { k: '2', nums: '3, 3, 3, 1' },
        ru: 'Дубликаты считаются: второе по величине — снова 3. Если выкинуть повторы через <code>HashSet</code>, выйдет 1.',
        en: 'Duplicates count: the second largest is 3 again. Dedupe through a <code>HashSet</code> and you get 1.' },
      { input: { k: '1', nums: '-5, -2, -9' },
        ru: 'Все числа отрицательные. Если начать «максимум» с 0, вернётся 0, а ответ −2.',
        en: 'All numbers are negative. Start the "maximum" at 0 and you return 0, while the answer is −2.' },
    ],
    ops: {
      unit: { ru: 'сравнений', en: 'comparisons' },
      naive: { ru: 'сортировка всего массива', en: 'sorting the whole array', count: p => sortComparisons(p.nums, (a, b) => b - a) },
      ours: { ru: 'min-heap размера k', en: 'a min-heap of size k',
        count: p => {
          const h = countingHeap((a, b) => a < b);
          for (const x of p.nums) { h.push(x); if (h.size > p.k) h.pop(); }
          return h.cmp;
        } },
    },
    predict: [
      { q: { ru: 'Следующий шаг: положить следующее число или выкинуть минимум?', en: 'Next step: push the next number or drop the minimum?' },
        keys: { 'heap.ev.push': { ru: 'кладём число', en: 'push a number' },
                'heap.ev.pop': { ru: 'выкидываем минимум', en: 'drop the minimum' } } },
    ],
    followups: [
      { ru: { q: 'Числа приходят потоком, k-й наибольший нужен после каждого (#703).', a: 'Та же куча размера k живёт между вызовами. Ответ — её корень, O(log k) на число.' },
        en: { q: 'Numbers arrive as a stream; you need the kth largest after each one (#703).', a: 'Keep the same size-k heap between calls. The answer is its root, O(log k) per number.' } },
      { ru: { q: 'А если k почти равно n?', a: 'k-й наибольший — это (n − k + 1)-й наименьший: держи max-heap на n − k + 1 элементов. Память min(k, n − k + 1).' },
        en: { q: 'What if k is close to n?', a: 'The kth largest is the (n − k + 1)th smallest: keep a max-heap of n − k + 1 elements. Memory is min(k, n − k + 1).' } },
      { ru: { q: 'Значения в узком диапазоне, скажем −10⁴…10⁴.', a: 'Массив счётчиков по значению и проход сверху вниз, пока не наберётся k: O(n + диапазон), без сравнений.' },
        en: { q: 'Values lie in a narrow range, say −10⁴…10⁴.', a: 'A counting array by value, then walk down from the top until k are collected: O(n + range), no comparisons.' } },
    ],
    related: [
      { id: 'kClosest', ru: 'зеркально: max-heap размера k оставляет ближайшие', en: 'the mirror: a size-k max-heap keeps the nearest' },
      { id: 'median', ru: 'k-й элемент двух массивов — бинарным поиском', en: 'the kth element of two arrays, by binary search' },
    ],
  },

  stones: {
    tricky: [
      { input: { stones: '4, 4' },
        ru: 'Два равных камня исчезают, куча пуста — ответ 0. <code>heap.Peek()</code> без проверки на пустоту бросит исключение.',
        en: 'Two equal stones vanish and the heap is empty, so the answer is 0. Calling <code>heap.Peek()</code> without an emptiness check throws.' },
      { input: { stones: '3, 3, 3' },
        ru: 'Два камня по 3 уничтожают друг друга, третий остаётся — ответ 3, а не 0.',
        en: 'Two 3s destroy each other and the third one survives: the answer is 3, not 0.' },
    ],
    ops: {
      unit: { ru: 'сравнений', en: 'comparisons' },
      naive: { ru: 'каждый ход искать два максимума перебором', en: 'scan for the two heaviest every turn',
        count: p => {
          const s = [...p.stones];
          let cmp = 0;
          while (s.length > 1) {
            cmp += 2 * s.length - 3;
            s.sort((a, b) => b - a);
            const [a, b] = s.splice(0, 2);
            if (a !== b) s.push(a - b);
          }
          return cmp;
        } },
      ours: { ru: 'max-heap', en: 'a max-heap',
        count: p => {
          const h = countingHeap((a, b) => a > b);
          p.stones.forEach(x => h.push(x));
          while (h.size > 1) { const a = h.pop(), b = h.pop(); if (a !== b) h.push(a - b); }
          return h.cmp;
        } },
    },
    predict: [
      { q: { ru: 'Два самых тяжёлых камня на вершине: они разные или равные?', en: 'The two heaviest stones are on top: are they different or equal?' },
        keys: { 'stone.ev.smash': { ru: 'разные — остаток в кучу', en: 'different, the rest goes back' },
                'stone.ev.equal': { ru: 'равные — оба исчезают', en: 'equal, both vanish' } } },
    ],
    followups: [
      { ru: { q: 'Камни можно сталкивать в любом порядке; как оставить минимальный вес (#1049)?', a: 'Это разбиение камней на две группы с наименьшей разницей сумм. Рюкзак по суммам до total / 2, O(n·sum).' },
        en: { q: 'Stones may be smashed in any order; how small can the last one be (#1049)?', a: 'It is splitting the stones into two groups with the smallest difference of sums: a knapsack over sums up to total / 2, O(n·sum).' } },
      { ru: { q: 'Веса не больше 1000. Можно без кучи?', a: 'Массив счётчиков по весу и указатель сверху вниз: самый тяжёлый ищется сдвигом указателя, остаток кладётся в счётчик ниже. O(n + W).' },
        en: { q: 'Weights are at most 1000. Can you skip the heap?', a: 'A counting array by weight with a pointer moving down: the heaviest is found by moving the pointer, the remainder goes into a lower counter. O(n + W).' } },
    ],
    related: [
      { id: 'kth', ru: 'та же куча, только как фильтр k лучших', en: 'the same heap, used as a filter for the best k' },
      { id: 'coin', ru: 'вариант #1049 решается DP по суммам', en: 'the #1049 variant is a DP over sums' },
    ],
  },

  topK: {
    tricky: [
      { input: { k: '1', nums: '9, 1, 1' },
        ru: 'Куча должна сравнивать частоты, а не значения: по значению вылетит 1 и ответ будет 9, а верно [1].',
        en: 'The heap must compare frequencies, not values: by value it evicts 1 and answers 9, while the answer is [1].' },
      { input: { k: '1', nums: '-1, -1, 2' },
        ru: 'Отрицательные значения: массив счётчиков с индексом-значением тут упадёт, а словарь спокойно даст [−1].',
        en: 'Negative values: a counting array indexed by value crashes here, while a dictionary calmly gives [−1].' },
    ],
    ops: {
      unit: { ru: 'сравнений', en: 'comparisons' },
      naive: { ru: 'сортировка значений по частоте', en: 'sorting the values by frequency',
        count: p => {
          const f = new Map();
          p.nums.forEach(x => f.set(x, (f.get(x) || 0) + 1));
          return sortComparisons([...f.values()], (a, b) => b - a);
        } },
      ours: { ru: 'min-heap размера k по частоте', en: 'a size-k min-heap by frequency',
        count: p => {
          const f = new Map();
          p.nums.forEach(x => f.set(x, (f.get(x) || 0) + 1));
          const h = countingHeap((a, b) => a < b);
          for (const c of f.values()) { h.push(c); if (h.size > p.k) h.pop(); }
          while (h.size) h.pop();
          return h.cmp;
        } },
    },
    predict: [
      { q: { ru: 'Куча переполнена или ещё нет: кладём следующее значение или выкидываем самое редкое?', en: 'Is the heap over k yet: push the next value or evict the rarest?' },
        keys: { 'topk.ev.push': { ru: 'кладём значение', en: 'push a value' },
                'topk.ev.pop': { ru: 'выкидываем самое редкое', en: 'evict the rarest' } } },
    ],
    followups: [
      { ru: { q: 'Слова вместо чисел, при равной частоте — по алфавиту (#692).', a: 'Компаратор кучи: сначала частота, при равенстве слово в обратном алфавитном порядке. Вылетать должен «худший» — более редкий или более поздний по алфавиту.' },
        en: { q: 'Words instead of numbers, ties broken alphabetically (#692).', a: 'Heap comparator: frequency first, then the word in reverse alphabetical order. The one evicted must be the "worst": rarer, or later in the alphabet.' } },
      { ru: { q: 'k почти равно числу разных значений.', a: 'Quickselect по массиву пар (значение, частота): O(m) в среднем, где m — число разных значений. Или куча на m − k самых редких.' },
        en: { q: 'k is almost the number of distinct values.', a: 'Quickselect over the (value, frequency) pairs: O(m) on average, m being the number of distinct values. Or a heap of the m − k rarest.' } },
    ],
    related: [
      { id: 'anagram', ru: 'тот же подсчёт словарём', en: 'the same counting with a dictionary' },
      { id: 'lfu', ru: 'частоты, которые меняются онлайн', en: 'frequencies that change online' },
    ],
  },

  mergeK: {
    tricky: [
      { input: { lists: ' | 1 | ' },
        ru: 'Два списка пусты. Положишь в кучу их <code>null</code>-головы — упадёшь на <code>node.val</code>. Ответ: [1].',
        en: 'Two lists are empty. Push their <code>null</code> heads into the heap and <code>node.val</code> blows up. The answer is [1].' },
      { input: { lists: '2 2 | 2 | 1 2' },
        ru: 'Одинаковые значения. Если вместо кучи взять <code>SortedSet</code> по значению, дубли схлопнутся: из пяти узлов останется два. Верно: 1, 2, 2, 2, 2.',
        en: 'Equal values. Use a <code>SortedSet</code> keyed by value instead of a heap and duplicates collapse: five nodes become two. Correct: 1, 2, 2, 2, 2.' },
    ],
    ops: {
      unit: { ru: 'сравнений', en: 'comparisons' },
      naive: { ru: 'каждый раз сравнивать все головы', en: 'compare all heads every time',
        count: p => {
          const at = p.lists.map(() => 0);
          let cmp = 0;
          for (;;) {
            const live = p.lists.map((l, i) => i).filter(i => at[i] < p.lists[i].length);
            if (!live.length) return cmp;
            cmp += live.length - 1;
            const best = live.reduce((b, i) => (p.lists[i][at[i]] < p.lists[b][at[b]] ? i : b));
            at[best]++;
          }
        } },
      ours: { ru: 'куча из k голов', en: 'a heap of k heads',
        count: p => {
          const h = countingHeap((a, b) => a[0] < b[0]);
          p.lists.forEach((l, i) => { if (l.length) h.push([l[0], i, 0]); });
          while (h.size) {
            const [, i, j] = h.pop();
            if (j + 1 < p.lists[i].length) h.push([p.lists[i][j + 1], i, j + 1]);
          }
          return h.cmp;
        } },
    },
    predict: [
      { q: { ru: 'В куче ещё есть головы?', en: 'Are there heads left in the heap?' },
        keys: { 'mk.ev.take': { ru: 'да, достаём минимальную', en: 'yes, take the smallest' },
                'mk.ev.done': { ru: 'нет, слияние закончено', en: 'no, the merge is done' } } },
    ],
    followups: [
      { ru: { q: 'Можно без кучи за то же O(N log k)?', a: 'Сливай списки парами, как в сортировке слиянием: log k раундов, каждый O(N). Доп. память O(1), если сливать узлы на месте.' },
        en: { q: 'Can you match O(N log k) without a heap?', a: 'Merge the lists in pairs, as in merge sort: log k rounds of O(N) each. O(1) extra memory if you relink the nodes in place.' } },
      { ru: { q: 'Нужно убрать повторы при слиянии.', a: 'Перед тем как прицепить узел, сравни его с хвостом ответа: равный пропускай. Куча остаётся та же.' },
        en: { q: 'Remove duplicates while merging.', a: 'Before appending a node, compare it with the tail of the result and skip it if equal. The heap stays the same.' } },
      { ru: { q: 'Равные значения должны идти в порядке номеров списков.', a: 'Приоритет — пара (значение, номер списка). Куча сама по себе нестабильна, поэтому порядок задаёт второй ключ.' },
        en: { q: 'Equal values must come out in list order.', a: 'Make the priority the pair (value, list index). A heap is not stable by itself, so the second key fixes the order.' } },
    ],
    related: [
      { id: 'mergeTwo', ru: 'слияние двух списков — частный случай k = 2', en: 'merging two lists is the k = 2 case' },
      { id: 'kth', ru: 'куча как быстрый доступ к минимуму', en: 'the heap as fast access to the minimum' },
    ],
  },

  medianStream: {
    tricky: [
      { input: { stream: '1, 2' },
        ru: 'Чётное число элементов: медиана 1.5. Деление <code>(a + b) / 2</code> в int даст 1 — нужно <code>/ 2.0</code>.',
        en: 'An even count: the median is 1.5. Integer <code>(a + b) / 2</code> gives 1; use <code>/ 2.0</code>.' },
      { input: { stream: '-1, -2, -3' },
        ru: 'Отрицательные: после двух чисел медиана −1.5. Целочисленное деление в C# обрезает к нулю и даст −1.',
        en: 'Negatives: after two numbers the median is −1.5. C# integer division truncates toward zero and gives −1.' },
    ],
    ops: {
      unit: { ru: 'сравнений', en: 'comparisons' },
      naive: { ru: 'сортировать всё заново после каждого числа', en: 're-sort everything after each number',
        count: p => sum(p.stream.map((_, i) => sortComparisons(p.stream.slice(0, i + 1), (a, b) => a - b))) },
      ours: { ru: 'две кучи', en: 'two heaps',
        count: p => {
          const low = countingHeap((a, b) => a > b), high = countingHeap((a, b) => a < b);
          let extra = 0;
          for (const x of p.stream) {
            if (low.size) extra++;
            if (!low.size || x <= low.top()) low.push(x); else high.push(x);
            if (low.size > high.size + 1) high.push(low.pop());
            else if (high.size > low.size) low.push(high.pop());
          }
          return low.cmp + high.cmp + extra;
        } },
    },
    predict: [],
    followups: [
      { ru: { q: 'Нужна не медиана, а 90-й перцентиль.', a: 'Те же две кучи, только баланс другой: нижняя держит ⌈0,9·n⌉ элементов, верхняя — остальные. Ответ — вершина нижней.' },
        en: { q: 'You need the 90th percentile, not the median.', a: 'The same two heaps with a different balance: the lower one holds ⌈0.9·n⌉ elements, the upper one the rest. The answer is the lower top.' } },
      { ru: { q: 'Почему не <code>SortedSet</code>?', a: 'Он не хранит дубликаты, и в .NET у него нет доступа к середине за O(log n): <code>ElementAt</code> идёт перебором. Пришлось бы хранить пары (значение, id) и всё равно искать середину за O(n).' },
        en: { q: 'Why not a <code>SortedSet</code>?', a: 'It drops duplicates, and in .NET it cannot reach the middle in O(log n): <code>ElementAt</code> walks the set. You would store (value, id) pairs and still find the middle in O(n).' } },
    ],
    related: [
      { id: 'median', ru: 'медиана двух отсортированных массивов', en: 'the median of two sorted arrays' },
      { id: 'kth', ru: 'куча, которая держит «верхнюю часть»', en: 'a heap that holds the "upper part"' },
    ],
  },

  kClosest: {
    tricky: [
      { input: { points: '2 2 | 0 3', k: '1' },
        ru: 'Нужно евклидово расстояние: у (2, 2) d = 8, у (0, 3) d = 9, ответ [2, 2]. С манхэттенским |x| + |y| ближе оказалась бы (0, 3).',
        en: 'Distance is Euclidean: (2, 2) has d = 8 and (0, 3) has d = 9, so the answer is [2, 2]. With Manhattan |x| + |y|, (0, 3) would look nearer.' },
      { input: { points: '9 9 | -9 -9', k: '2' },
        ru: 'k равно числу точек: из кучи ничего не уходит, ответ — обе точки. Индексация кучи на k + 1 ячейку не должна тут вылезти за край.',
        en: 'k equals the number of points: nothing leaves the heap, and both points are the answer. A heap sized k + 1 must not run off the end here.' },
    ],
    ops: {
      unit: { ru: 'сравнений', en: 'comparisons' },
      naive: { ru: 'сортировка всех точек по d', en: 'sorting all points by d',
        count: p => sortComparisons(p.points.map(([x, y]) => x * x + y * y), (a, b) => a - b) },
      ours: { ru: 'max-heap размера k', en: 'a size-k max-heap',
        count: p => {
          const h = countingHeap((a, b) => a > b);
          for (const [x, y] of p.points) { h.push(x * x + y * y); if (h.size > p.k) h.pop(); }
          return h.cmp;
        } },
    },
    predict: [
      { q: { ru: 'Что дальше: точка поднимается, кто-то уходит из кучи или берём следующую точку?', en: 'What next: the point rises, someone leaves the heap, or we take the next point?' },
        keys: { 'kc.ev.up': { ru: 'поднимается выше', en: 'it rises' },
                'kc.ev.drop': { ru: 'уходит корень', en: 'the root leaves' },
                'kc.ev.dropNew': { ru: 'уходит сама новая точка', en: 'the new point itself leaves' },
                'kc.ev.add': { ru: 'берём следующую точку', en: 'take the next point' } } },
    ],
    followups: [
      { ru: { q: 'Можно быстрее O(n log k)?', a: 'Quickselect по d: делим вокруг опорного, пока k-я граница не встанет на место. O(n) в среднем, порядок внутри ответа произвольный.' },
        en: { q: 'Can you beat O(n log k)?', a: 'Quickselect on d: partition around a pivot until the kth boundary settles. O(n) on average; the order inside the answer is arbitrary.' } },
      { ru: { q: 'Запросов много, и центр каждый раз свой.', a: 'Предварительно разложи точки по пространственной структуре: k-d дерево или сетка-хеш. Запрос смотрит только ближайшие ячейки, а не все n точек.' },
        en: { q: 'There are many queries, each with its own centre.', a: 'Pre-index the points in a spatial structure: a k-d tree or a hashed grid. A query looks only at nearby cells, not all n points.' } },
    ],
    related: [
      { id: 'spatialGrid', ru: 'точки рядом с центром через сетку-хеш', en: 'points near a centre via a hashed grid' },
      { id: 'kth', ru: 'то же «держим k лучших», только min-heap', en: 'the same keep-the-best-k, with a min-heap' },
    ],
  },

  /* ===== paths ===== */
  nearestZero: {
    tricky: [
      { input: { mat: '111 111 110' },
        ru: 'Единственный 0 в правом нижнем углу. Один проход DP только сверху-слева не увидит его вовсе; BFS даёт 4 в углу (0, 0).',
        en: 'The only 0 is in the bottom-right corner. A single top-left DP pass never sees it; BFS gives 4 at (0, 0).' },
      { input: { mat: '0' },
        ru: 'Одна клетка, и это 0: ответ [[0]], а BFS просто вынимает её и заканчивает.',
        en: 'One cell, and it is 0: the answer is [[0]]; BFS just pops it and stops.' },
    ],
    ops: {
      unit: { ru: 'посещений клеток', en: 'cell visits' },
      naive: { ru: 'BFS от каждой клетки до ближайшего 0', en: 'a BFS from every cell to its nearest 0',
        count: p => {
          const m = p.mat;
          let visits = 0;
          m.forEach((row, r) => row.forEach((_, c) => {
            const seen = new Set([`${r},${c}`]), queue = [[r, c]];
            while (queue.length) {
              const [y, x] = queue.shift();
              visits++;
              if (m[y][x] === 0) break;
              for (const [dy, dx] of DIR4) {
                const ny = y + dy, nx = x + dx;
                if (inGrid(m, ny, nx) && !seen.has(`${ny},${nx}`)) { seen.add(`${ny},${nx}`); queue.push([ny, nx]); }
              }
            }
          }));
          return visits;
        } },
      ours: { ru: 'один BFS от всех нулей', en: 'one BFS from all zeros', count: p => p.mat.length * p.mat[0].length },
    },
    predict: [
      { q: { ru: 'У вынутой клетки есть соседи без расстояния?', en: 'Does the popped cell have neighbours without a distance?' },
        keys: { 'zom.ev.pop': { ru: 'да, ставим им расстояние', en: 'yes, they get a distance' },
                'zom.ev.skip': { ru: 'нет, добавлять нечего', en: 'no, nothing to add' } } },
    ],
    followups: [
      { ru: { q: 'Одна единица превратилась в 0. Пересчитывать всё?', a: 'Нет: запусти BFS из нового нуля и обновляй только клетки, где новое расстояние меньше старого. Затронется лишь область, которая стала ближе.' },
        en: { q: 'One 1 has turned into a 0. Recompute everything?', a: 'No: run a BFS from the new zero and update only cells whose new distance is smaller. Only the area that got closer is touched.' } },
      { ru: { q: 'Ходить можно и по диагонали.', a: 'Восемь соседей в том же BFS — получится расстояние Чебышёва max(|dx|, |dy|). Сложность та же.' },
        en: { q: 'Diagonal moves are allowed too.', a: 'Use eight neighbours in the same BFS and you get the Chebyshev distance max(|dx|, |dy|). Same complexity.' } },
    ],
    related: [
      { id: 'oranges', ru: 'BFS из многих источников, ответ — одно число', en: 'a multi-source BFS whose answer is a single number' },
      { id: 'flowField', ru: 'карта расстояний до цели для ИИ', en: 'a distance map to the goal for game AI' },
    ],
  },

  networkDelay: {
    tricky: [
      { input: { times: '1>2:5 1>3:1 3>4:1 4>2:1', n: '4', k: '1' },
        ru: 'Прямое ребро 1→2 стоит 5, а обход 1→3→4→2 — 3. BFS, который фиксирует узел при первой встрече, ответит 5; верно 3.',
        en: 'The direct edge 1→2 costs 5, the detour 1→3→4→2 costs 3. A BFS that fixes a node on first sight answers 5; the answer is 3.' },
      { input: { times: '2>1:1', n: '2', k: '1' },
        ru: 'Рёбра ориентированные: из 1 в 2 пути нет, ответ −1. Неориентированный граф дал бы 1.',
        en: 'Edges are directed: there is no way from 1 to 2, so the answer is −1. An undirected graph would give 1.' },
    ],
    ops: {
      unit: { ru: 'проверок рёбер', en: 'edge checks' },
      naive: { ru: 'Беллман — Форд: все рёбра, раунд за раундом', en: 'Bellman–Ford: every edge, round after round',
        count: p => {
          const dist = new Array(p.n + 1).fill(Infinity);
          dist[p.k] = 0;
          let checks = 0;
          for (let round = 1; round < p.n; round++) {
            let changed = false;
            for (const [u, v, w] of p.times) {
              checks++;
              if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; changed = true; }
            }
            if (!changed) break;
          }
          return checks;
        } },
      ours: { ru: 'Дейкстра с кучей', en: 'Dijkstra with a heap',
        count: p => {
          const out = new Array(p.n + 1).fill(0), adj = Array.from({ length: p.n + 1 }, () => []);
          for (const [u, v] of p.times) { out[u]++; adj[u].push(v); }
          const seen = new Set([p.k]), stack = [p.k];
          while (stack.length) for (const v of adj[stack.pop()]) if (!seen.has(v)) { seen.add(v); stack.push(v); }
          return sum([...seen].map(v => out[v]));
        } },
    },
    predict: [
      { q: { ru: 'Это ребро улучшит расстояние до соседа?', en: 'Will this edge improve the neighbour\'s distance?' },
        keys: { 'ndt.ev.relax': { ru: 'да, короче', en: 'yes, shorter' },
                'ndt.ev.keep': { ru: 'нет, не лучше', en: 'no, not better' } } },
      { q: { ru: 'Вынутая из очереди запись свежая или устаревшая?', en: 'Is the entry popped from the queue fresh or stale?' },
        keys: { 'ndt.ev.pop': { ru: 'свежая — расстояние окончательно', en: 'fresh, the distance is final' },
                'ndt.ev.stale': { ru: 'устаревшая — пропускаем', en: 'stale, skip it' } } },
    ],
    followups: [
      { ru: { q: 'А если веса бывают отрицательными?', a: 'Дейкстра ломается: вынутое расстояние уже не окончательно. Нужен Беллман — Форд за O(V·E); если и n-й раунд что-то улучшает, есть отрицательный цикл.' },
        en: { q: 'What if weights can be negative?', a: 'Dijkstra breaks: a popped distance is no longer final. Use Bellman–Ford in O(V·E); if round n still improves something, there is a negative cycle.' } },
      { ru: { q: 'Не больше K пересадок (#787 Cheapest Flights).', a: 'Беллман — Форд ровно на K + 1 раундов, и в каждом раунде читаешь копию dist с прошлого. Или BFS по состояниям (узел, пересадки).' },
        en: { q: 'At most K stops (#787 Cheapest Flights).', a: 'Bellman–Ford for exactly K + 1 rounds, each reading a copy of the previous dist. Or a BFS over (node, stops) states.' } },
      { ru: { q: 'Граф плотный, E ≈ V².', a: 'Версия без кучи: каждый раз ищи минимум перебором массива. O(V²) лучше, чем O(E log E) = O(V² log V).' },
        en: { q: 'The graph is dense, E ≈ V².', a: 'Drop the heap and find the minimum by scanning an array each time. O(V²) beats O(E log E) = O(V² log V).' } },
    ],
    related: [
      { id: 'astar', ru: 'Дейкстра с эвристикой до цели', en: 'Dijkstra plus a heuristic toward the goal' },
      { id: 'kruskal', ru: 'ещё один жадный алгоритм на взвешенном графе', en: 'another greedy algorithm on a weighted graph' },
    ],
  },

  minEffort: {
    tricky: [
      { input: { heights: '1 9 1 | 1 9 1 | 1 1 1' },
        ru: 'Короткий путь через девятки стоит 8, а обход по краю — 0. Жадный шаг «в ближайшую по высоте клетку» или кратчайший BFS тут промахиваются.',
        en: 'The short path through the nines costs 8, the detour along the edge costs 0. A greedy "closest height" step or a shortest-path BFS misses it.' },
      { input: { heights: '1 2 3 4 5' },
        ru: 'Цена — самый крутой шаг, а не сумма: ответ 1. Со сложением, как в обычной Дейкстре, вышло бы 4.',
        en: 'The cost is the steepest step, not the sum: the answer is 1. Adding, as in plain Dijkstra, would give 4.' },
      { input: { heights: '7' },
        ru: 'Одна клетка: старт уже в углу, усилие 0.',
        en: 'One cell: the start is already the corner, so the effort is 0.' },
    ],
    ops: {
      unit: { ru: 'проверок соседей', en: 'neighbour checks' },
      naive: { ru: 'пробуем усилие 0, 1, 2… и BFS на каждое', en: 'try effort 0, 1, 2… with a BFS each',
        count: p => {
          const h = p.heights, R = h.length, C = h[0].length;
          if (R === 1 && C === 1) return 0;
          const answer = minEffortValue(h);
          let checks = 0;
          for (let t = 0; t <= answer; t++) {
            const seen = new Set(['0,0']), queue = [[0, 0]];
            let reached = false;
            while (queue.length && !reached) {
              const [r, c] = queue.shift();
              for (const [dr, dc] of DIR4) {
                const y = r + dr, x = c + dc;
                if (!inGrid(h, y, x)) continue;
                checks++;
                if (seen.has(`${y},${x}`) || Math.abs(h[y][x] - h[r][c]) > t) continue;
                if (y === R - 1 && x === C - 1) { reached = true; break; }
                seen.add(`${y},${x}`);
                queue.push([y, x]);
              }
            }
          }
          return checks;
        } },
      ours: { ru: 'Дейкстра с max вместо +', en: 'Dijkstra with max instead of +', count: p => effortDijkstraChecks(p.heights) },
    },
    predict: [
      { q: { ru: 'Что окажется вынутой записью: соседям станет лучше, никому не станет, или запись устарела?', en: 'What is the popped entry: neighbours improve, nobody does, or the entry is stale?' },
        keys: { 'eff.ev.relax': { ru: 'соседям стало лучше', en: 'neighbours improve' },
                'eff.ev.settle': { ru: 'окончательна, но никому не лучше', en: 'final, but nobody improves' },
                'eff.ev.stale': { ru: 'устаревшая запись', en: 'a stale entry' } } },
    ],
    followups: [
      { ru: { q: 'Почему нельзя вернуть ответ, как только угол попал в очередь?', a: 'Запись в очереди — лишь кандидат: другой путь может потом дать углу меньшее усилие. Окончательно только то, что вынуто из очереди.' },
        en: { q: 'Why not return as soon as the corner enters the queue?', a: 'A queued entry is only a candidate: another path may later give the corner a smaller effort. Only a popped value is final.' } },
      { ru: { q: 'Нужна сумма перепадов, а не самый крутой шаг.', a: 'Замени max на + — это обычная Дейкстра с весами |Δh|. Каркас не меняется, меняется только «сложение» цены.' },
        en: { q: 'You need the sum of climbs, not the steepest step.', a: 'Replace max with + and it is plain Dijkstra with weights |Δh|. The skeleton stays; only how costs combine changes.' } },
    ],
    related: [
      { id: 'swim', ru: 'тот же минимакс, только по высотам клеток', en: 'the same minimax, over cell heights' },
      { id: 'kruskal', ru: 'минимакс-путь лежит в минимальном остовном дереве', en: 'a minimax path lies in the minimum spanning tree' },
    ],
  },

  obstacles: {
    tricky: [
      { input: { grid: '01 00 11 10', k: '1' },
        ru: 'В (1, 1) первым приходит путь, сломавший стену, и <code>visited[r][c]</code> отбрасывает путь с целым запасом — дальше стену в (2, 1) не пробить, ответ −1. С запасом в состоянии верно: 4.',
        en: 'The path that broke a wall reaches (1, 1) first, and <code>visited[r][c]</code> drops the one with its break still unused, so the wall at (2, 1) is never broken and you get −1. With the budget in the state the answer is 4.' },
      { input: { grid: '0', k: '0' },
        ru: 'Сетка 1 × 1: старт и есть цель, ответ 0. BFS, проверяющий цель только у соседей, его не заметит.',
        en: 'A 1 × 1 grid: the start is the goal, the answer is 0. A BFS that only checks neighbours for the goal never notices.' },
    ],
    ops: {
      unit: { ru: 'посещений клеток', en: 'cell visits' },
      naive: { ru: 'перебрать, какие ≤ k стен сломать, и BFS на каждый набор', en: 'try every set of ≤ k walls to break, a BFS for each', count: p => obstacleSubsets(p.grid, p.k) },
      ours: { ru: 'BFS по состояниям (клетка, запас)', en: 'BFS over (cell, budget) states', count: p => obstacleStates(p.grid, p.k) },
    },
    predict: [
      { q: { ru: 'Что даст это состояние: шаги по пустым клеткам, ломание стены или ничего нового?', en: 'What does this state yield: steps onto empty cells, a broken wall, or nothing new?' },
        keys: { 'obs.ev.step': { ru: 'шаги по пустым клеткам', en: 'steps onto empty cells' },
                'obs.ev.smash': { ru: 'ломаем стену', en: 'break a wall' },
                'obs.ev.dead': { ru: 'ничего нового', en: 'nothing new' } } },
    ],
    followups: [
      { ru: { q: 'Память O(R·C·k) слишком велика.', a: 'Храни для клетки лучший запас <code>best[r][c]</code> и пускай состояние, только если его запас больше. BFS идёт по шагам, поэтому позднее состояние с не большим запасом ничем не лучше. Память O(R·C).' },
        en: { q: 'O(R·C·k) memory is too much.', a: 'Keep the best budget <code>best[r][c]</code> per cell and admit a state only if its budget is larger. BFS goes step by step, so a later state with no more budget is never better. O(R·C) memory.' } },
      { ru: { q: 'Нужно не число шагов, а минимум сломанных стен (#2290).', a: '0-1 BFS на деке: шаг в пустую клетку стоит 0 и идёт в начало дека, в стену — 1 и в конец. Это Дейкстра для весов 0 и 1 за O(R·C).' },
        en: { q: 'Minimise walls broken, not steps (#2290).', a: '0-1 BFS with a deque: an empty cell costs 0 and goes to the front, a wall costs 1 and goes to the back. It is Dijkstra for 0/1 weights in O(R·C).' } },
    ],
    related: [
      { id: 'astar', ru: 'те же состояния, но поиск с эвристикой', en: 'the same states searched with a heuristic' },
      { id: 'ladder', ru: 'BFS по графу, которого нет в памяти', en: 'BFS over a graph that is never stored' },
    ],
  },

  /* ===== back ===== */
  subsets: {
    tricky: [
      { input: { nums: '' },
        ru: 'Пустой массив: подмножество одно — пустое, ответ [[]], а не [].',
        en: 'An empty array: there is one subset, the empty one, so the answer is [[]], not [].' },
      { input: { nums: '5' },
        ru: 'Одно число — два подмножества: [5] и []. Тот, кто сохраняет только непустые пути, потеряет [].',
        en: 'One number gives two subsets: [5] and []. Saving only non-empty paths loses [].' },
    ],
    ops: {
      unit: { ru: 'вызовов рекурсии', en: 'recursive calls' },
      naive: { ru: 'цикл с 0, как в перестановках, потом убрать повторы', en: 'loop from 0 as in permutations, then drop repeats',
        count: p => { const n = p.nums.length; let total = 0, run = 1; for (let j = 0; j <= n; j++) { total += run; run *= n - j; } return total; } },
      ours: { ru: 'брать / не брать', en: 'take / skip', count: p => 2 ** (p.nums.length + 1) - 1 },
    },
    predict: [
      { q: { ru: 'Следующий шаг: берём число или откатываемся и идём без него?', en: 'Next step: take the number, or undo and go on without it?' },
        keys: { 'back.ev.take': { ru: 'берём', en: 'take' },
                'back.ev.skip': { ru: 'откат, без него', en: 'undo, go without it' } } },
    ],
    followups: [
      { ru: { q: 'В массиве есть дубликаты (#90).', a: 'Отсортируй. В ветке «не брать» пропусти все числа, равные текущему, — иначе одинаковые подмножества появятся несколько раз.' },
        en: { q: 'The array has duplicates (#90).', a: 'Sort first. In the "skip" branch, skip every number equal to the current one, or identical subsets show up several times.' } },
      { ru: { q: 'Нужны только подмножества размера k (#77).', a: 'Остановись, когда path.Count == k, и обрежь ветку, если оставшихся чисел не хватит до k. Узлов C(n, k), а не 2ⁿ.' },
        en: { q: 'Only subsets of size k are needed (#77).', a: 'Stop when path.Count == k and prune a branch when too few numbers remain to reach k. You visit C(n, k) leaves, not 2ⁿ.' } },
    ],
    related: [
      { id: 'coinOrder', ru: 'то же дерево «брать или нет», но посчитанное DP', en: 'the same take-or-skip tree, counted by DP' },
      { id: 'popcount', ru: 'подмножество — это маска, бит на число', en: 'a subset is a mask, one bit per number' },
    ],
  },

  perms: {
    tricky: [
      { input: { nums: '7' },
        ru: 'Одно число — одна перестановка [7]. Рекурсия должна сохранить её на первом же уровне.',
        en: 'One number, one permutation [7]. The recursion must record it on the very first level.' },
      { input: { nums: '-9, 99' },
        ru: 'Отрицательное число: <code>used</code> по значению (массив с индексом-числом) упадёт. Отмечай индексы — ответ [−9, 99] и [99, −9].',
        en: 'A negative number: <code>used</code> keyed by value (an array indexed by the number) crashes. Mark indices: the answer is [−9, 99] and [99, −9].' },
    ],
    ops: {
      unit: { ru: 'вызовов рекурсии', en: 'recursive calls' },
      naive: { ru: 'все nⁿ наборов, потом проверка на повторы', en: 'all nⁿ sequences, then a repeat check',
        count: p => { const n = p.nums.length; let total = 0; for (let j = 0; j <= n; j++) total += n ** j; return total; } },
      ours: { ru: 'только неиспользованные числа', en: 'only unused numbers',
        count: p => { const n = p.nums.length; let total = 0, run = 1; for (let j = 0; j <= n; j++) { total += run; run *= n - j; } return total; } },
    },
    predict: [
      { q: { ru: 'Это число завершит перестановку?', en: 'Will this number complete the permutation?' },
        keys: { 'perm.ev.pick': { ru: 'нет, идём глубже', en: 'no, go deeper' },
                'perm.ev.hit': { ru: 'да, сохраняем', en: 'yes, save it' } } },
    ],
    followups: [
      { ru: { q: 'Числа повторяются (#47).', a: 'Отсортируй и пропускай <code>nums[i]</code>, если оно равно <code>nums[i − 1]</code>, а тот сейчас не используется: так равные числа встают только в одном порядке.' },
        en: { q: 'Numbers repeat (#47).', a: 'Sort and skip <code>nums[i]</code> when it equals <code>nums[i − 1]</code> and that one is not in use: equal numbers then appear in only one order.' } },
      { ru: { q: 'Нужна только k-я перестановка (#60).', a: 'Без перебора: первое число — (k − 1) / (n − 1)! по списку оставшихся, дальше то же с остатком. O(n²).' },
        en: { q: 'Only the kth permutation is needed (#60).', a: 'No enumeration: the first number is index (k − 1) / (n − 1)! among those left, then repeat with the remainder. O(n²).' } },
      { ru: { q: 'Можно без <code>used[]</code>?', a: 'Да, обменами: <code>swap(start, i)</code>, рекурсия от start + 1, обмен обратно. Префикс массива и есть текущий путь.' },
        en: { q: 'Can you drop <code>used[]</code>?', a: 'Yes, with swaps: <code>swap(start, i)</code>, recurse from start + 1, swap back. The array prefix is the current path.' } },
    ],
    related: [
      { id: 'shuffle', ru: 'одна случайная перестановка обменами', en: 'one random permutation built by swaps' },
      { id: 'queens', ru: 'перестановка столбцов с ограничениями', en: 'a permutation of columns with constraints' },
    ],
  },

  combSum: {
    tricky: [
      { input: { candidates: '5, 2', target: '4' },
        ru: '<code>break</code> работает только на отсортированных кандидатах. Без сортировки 5 &gt; 4 оборвёт цикл и ответ будет пустым, а верно [[2, 2]].',
        en: '<code>break</code> works only on sorted candidates. Unsorted, 5 &gt; 4 ends the loop and the answer is empty, while it should be [[2, 2]].' },
      { input: { candidates: '2', target: '7' },
        ru: 'Из двоек нечётное не собрать: ответ пустой. Рекурсия должна закончиться отсечением, а не уйти в минус.',
        en: 'Odd sums cannot be built from twos: the answer is empty. The recursion must end with a cut, not dive below zero.' },
    ],
    ops: {
      unit: { ru: 'вызовов рекурсии', en: 'recursive calls' },
      naive: { ru: 'без сортировки и break: в каждую ветку, пока остаток не уйдёт в минус', en: 'no sort, no break: every branch until the rest drops below zero',
        count: p => {
          let calls = 0;
          const dfs = (start, remain) => {
            calls++;
            if (remain <= 0) return;
            for (let i = start; i < p.candidates.length; i++) dfs(i, remain - p.candidates[i]);
          };
          dfs(0, p.target);
          return calls;
        } },
      ours: { ru: 'сортировка и break', en: 'sort and break',
        count: p => {
          const c = [...p.candidates].sort((a, b) => a - b);
          let calls = 0;
          const dfs = (start, remain) => {
            calls++;
            if (remain === 0) return;
            for (let i = start; i < c.length && c[i] <= remain; i++) dfs(i, remain - c[i]);
          };
          dfs(0, p.target);
          return calls;
        } },
    },
    predict: [
      { q: { ru: 'Следующий кандидат: берём, попадаем ровно в 0 или отсекаем?', en: 'Next candidate: take it, hit exactly 0, or cut?' },
        keys: { 'comb.ev.step': { ru: 'берём, остаток ещё есть', en: 'take it, something remains' },
                'comb.ev.hit': { ru: 'ровно 0 — в ответ', en: 'exactly 0, into the answer' },
                'comb.ev.cut': { ru: 'больше остатка — break', en: 'bigger than the rest, break' } } },
    ],
    followups: [
      { ru: { q: 'Каждое число можно взять один раз, и в списке есть повторы (#40).', a: 'Рекурсия идёт с <code>i + 1</code>, а на одном уровне пропускаем <code>candidates[i] == candidates[i − 1]</code> при i &gt; start.' },
        en: { q: 'Each number may be used once, and the list has repeats (#40).', a: 'Recurse with <code>i + 1</code>, and on one level skip <code>candidates[i] == candidates[i − 1]</code> when i &gt; start.' } },
      { ru: { q: 'Нужно только число комбинаций.', a: 'Перебор не нужен: DP по суммам, монеты во внешнем цикле, как в Coin Change II. O(n·target).' },
        en: { q: 'Only the number of combinations is needed.', a: 'No enumeration: a DP over sums with coins in the outer loop, as in Coin Change II. O(n·target).' } },
    ],
    related: [
      { id: 'coinOrder', ru: 'те же комбинации, только посчитанные DP', en: 'the same combinations, counted by DP' },
      { id: 'coin', ru: 'минимум монет вместо всех вариантов', en: 'the fewest coins instead of all options' },
    ],
  },

  wordSearch: {
    tricky: [
      { input: { board: 'ABCE SFCS ADEE', word: 'ABCB' },
        ru: 'Вторая B есть только в уже занятой клетке. Без пометки «на пути» слово найдётся, а верно false.',
        en: 'The second B exists only in the cell already used. Without the on-path mark the word is "found"; the answer is false.' },
      { input: { board: 'AA AB', word: 'ABAA' },
        ru: 'Без снятия пометки неудачный старт из (0, 0) оставит клетку занятой, и путь A → B → A → A(0, 0) не сложится. Верно true.',
        en: 'Without unmarking, the failed start at (0, 0) leaves that cell taken, so A → B → A → A(0, 0) never forms. The answer is true.' },
      { input: { board: 'A', word: 'AA' },
        ru: 'Одна клетка не может дать две буквы: ответ false.',
        en: 'One cell cannot supply two letters: the answer is false.' },
    ],
    ops: {
      unit: { ru: 'просмотров клеток', en: 'cells examined' },
      naive: { ru: 'все пути длины L, слово сверяется в конце', en: 'every path of length L, the word checked at the end', count: p => wordSearchCells(p.board, p.word.toUpperCase(), false) },
      ours: { ru: 'отсечение по букве', en: 'pruning on each letter', count: p => wordSearchCells(p.board, p.word.toUpperCase(), true) },
    },
    predict: [
      { q: { ru: 'Следующий шаг: клетка подходит, не подходит, или тупик и откат?', en: 'Next step: the cell fits, it does not, or a dead end and an undo?' },
        keys: { 'ws.ev.match': { ru: 'подходит', en: 'it fits' },
                'ws.ev.miss': { ru: 'не та буква', en: 'wrong letter' },
                'ws.ev.undo': { ru: 'тупик, снимаем пометку', en: 'dead end, unmark' } } },
    ],
    followups: [
      { ru: { q: 'Какие дешёвые отсечения есть до DFS?', a: 'Если какой-то буквы в слове больше, чем на доске, — сразу false. Если первая буква слова встречается на доске чаще последней, ищи перевёрнутое слово: стартов будет меньше.' },
        en: { q: 'What cheap pruning exists before the DFS?', a: 'If the word needs more of some letter than the board has, return false at once. If the first letter is more common on the board than the last, search the reversed word: fewer starts.' } },
      { ru: { q: 'Можно ходить и по диагонали.', a: 'Восемь направлений вместо четырёх: оценка становится O(R·C·8·7^(L−1)), код тот же.' },
        en: { q: 'Diagonal moves are allowed too.', a: 'Eight directions instead of four: the bound becomes O(R·C·8·7^(L−1)); the code stays the same.' } },
    ],
    related: [
      { id: 'trie', ru: 'много слов сразу — DFS по доске вместе с trie', en: 'many words at once: a board DFS walking a trie' },
      { id: 'islands', ru: 'DFS по сетке, но без отката пометок', en: 'a grid DFS, but marks are never undone' },
    ],
  },

  queens: {
    tricky: [
      { input: { n: '3' },
        ru: 'При n = 2 и n = 3 расстановок нет: перебор должен закончиться с пустым ответом, а не зациклиться.',
        en: 'For n = 2 and n = 3 there are no placements: the search must end with an empty answer, not loop.' },
      { input: { n: '1' },
        ru: 'n = 1: один ферзь на доске 1 × 1 — одно решение, ["Q"].',
        en: 'n = 1: one queen on a 1 × 1 board, one solution, ["Q"].' },
    ],
    ops: {
      unit: { ru: 'проверок клеток', en: 'squares tried' },
      naive: { ru: 'все nⁿ расстановок по строкам, проверка в конце', en: 'all nⁿ row-by-row placements, checked at the end',
        count: p => {
          const n = p.n, { solution } = queensFirst(n);
          if (!solution) { let t = 0; for (let j = 1; j <= n; j++) t += n ** j; return t; }
          let total = 0, rank = 0;
          for (let j = 0; j < n; j++) { rank = rank * n + solution[j]; total += rank + 1; }
          return total;
        } },
      ours: { ru: 'откат с проверкой столбца и диагоналей', en: 'backtracking with column and diagonal checks', count: p => queensFirst(p.n).tried },
    },
    predict: [
      { q: { ru: 'Следующая клетка: ставим ферзя, её бьют, или строка исчерпана и откат?', en: 'Next square: place a queen, it is attacked, or the row is exhausted and we undo?' },
        keys: { 'nq.ev.place': { ru: 'ставим ферзя', en: 'place a queen' },
                'nq.ev.clash': { ru: 'клетку бьют', en: 'the square is attacked' },
                'nq.ev.undo': { ru: 'откат', en: 'undo' } } },
    ],
    followups: [
      { ru: { q: 'Нужно только число решений (#52). Как ускорить?', a: 'Не собирай доски и держи столбцы и диагонали в битовых масках: свободные клетки — <code>~(cols | d1 | d2) &amp; full</code>, перебор по младшему биту <code>x &amp; -x</code>.' },
        en: { q: 'Only the number of solutions is needed (#52). How to speed it up?', a: 'Skip building boards and keep columns and diagonals as bit masks: free squares are <code>~(cols | d1 | d2) &amp; full</code>; iterate over the lowest bit <code>x &amp; -x</code>.' } },
      { ru: { q: 'Где ещё эта схема?', a: 'Судоку (#37): клетка — выбор цифры, строки, столбцы и квадраты — булевы массивы ограничений, тупик — откат.' },
        en: { q: 'Where else does this scheme apply?', a: 'Sudoku (#37): a cell is a digit choice, rows, columns and boxes are boolean constraint arrays, a dead end means undo.' } },
    ],
    related: [
      { id: 'popcount', ru: 'битовые маски свободных столбцов', en: 'bit masks of free columns' },
      { id: 'perms', ru: 'по сути перестановка столбцов', en: 'in essence a permutation of columns' },
    ],
  },

  coinOrder: {
    tricky: [
      { input: { coins: '1, 2', amount: '0', order: 'coins-outer' },
        ru: 'Сумма 0 собирается одним способом — ничего не брать. dp[0] = 1, а не 0: иначе весь массив останется нулями.',
        en: 'A sum of 0 has exactly one way: take nothing. dp[0] = 1, not 0, or the whole array stays zero.' },
      { input: { coins: '2', amount: '3', order: 'coins-outer' },
        ru: 'Тройку из двоек не собрать: dp[3] берёт dp[1] = 0, ответ 0.',
        en: 'Three cannot be made from twos: dp[3] reads dp[1] = 0, and the answer is 0.' },
    ],
    ops: {
      unit: { ru: 'шагов', en: 'steps' },
      naive: { ru: 'рекурсивный перебор без памяти', en: 'plain recursion without memo',
        count: p => {
          const a = p.amount, c = p.coins;
          if (p.order === 'sums-outer') {
            const calls = new Array(a + 1).fill(0);
            for (let s = 0; s <= a; s++) calls[s] = 1 + (s ? sum(c.filter(x => x <= s).map(x => calls[s - x])) : 0);
            return calls[a];
          }
          const m = c.length, calls = Array.from({ length: m + 1 }, () => new Array(a + 1).fill(1));
          for (let i = m - 1; i >= 0; i--) {
            for (let s = 1; s <= a; s++) calls[i][s] = 1 + calls[i + 1][s] + (c[i] <= s ? calls[i][s - c[i]] : 0);
          }
          return calls[0][a];
        } },
      ours: { ru: 'одномерный dp', en: 'a one-row dp',
        count: p => sum(p.coins.map(c => Math.max(0, p.amount - c + 1))) },
    },
    predict: [
      { q: { ru: 'dp[s − c] уже не ноль?', en: 'Is dp[s − c] already non-zero?' },
        keys: { 'co.ev.add': { ru: 'да, dp[s] растёт', en: 'yes, dp[s] grows' },
                'co.ev.zero': { ru: 'нет, ничего не добавится', en: 'no, nothing is added' } } },
    ],
    followups: [
      { ru: { q: 'Каждую монету можно взять не больше одного раза.', a: 'Это 0/1-рюкзак: внутренний цикл по s идёт сверху вниз, от amount до c. Тогда dp[s − c] ещё не учитывает текущую монету.' },
        en: { q: 'Each coin may be used at most once.', a: 'That is a 0/1 knapsack: run the inner loop over s downward, from amount to c. Then dp[s − c] does not yet include the current coin.' } },
      { ru: { q: 'Ответ влезает в int — значит, переполнения не будет?', a: 'В #377 промежуточные dp[s] могут переполнить int, даже если dp[target] влезает. Считай в long или по модулю, если условие его даёт.' },
        en: { q: 'The answer fits in int, so no overflow?', a: 'In #377 intermediate dp[s] values can overflow int even when dp[target] fits. Use long, or a modulus if the problem gives one.' } },
    ],
    related: [
      { id: 'climb', ru: 'лестница — это #377 с монетами 1 и 2', en: 'Climbing Stairs is #377 with coins 1 and 2' },
      { id: 'combSum', ru: 'те же сочетания, но перечисленные перебором', en: 'the same combinations, enumerated by backtracking' },
    ],
  },

  /* ===== greedy ===== */
  jump: {
    tricky: [
      { input: { a: '0' },
        ru: 'Один элемент: мы уже на последнем индексе, ответ true, хотя прыгнуть нельзя.',
        en: 'One element: we already stand on the last index, so the answer is true even though no jump is possible.' },
      { input: { a: '2, 5, 0, 0' },
        ru: 'Прыжок «всегда на максимум» из 0 попадёт на ноль в индексе 2 и застрянет. Верно true: через индекс 1 reach сразу 6.',
        en: 'Always jumping as far as possible lands on the zero at index 2 and gets stuck. The answer is true: via index 1, reach becomes 6.' },
      { input: { a: '3, 2, 1, 0, 4' },
        ru: 'Все пути упираются в 0 на индексе 3: reach застывает на 3, ответ false.',
        en: 'Every route runs into the 0 at index 3: reach freezes at 3 and the answer is false.' },
    ],
    ops: {
      unit: { ru: 'посещений позиций', en: 'position visits' },
      naive: { ru: 'рекурсия: пробовать каждый прыжок', en: 'recursion trying every jump length',
        count: p => {
          const a = p.a, last = a.length - 1;
          let calls = 0;
          const go = i => {
            calls++;
            if (i >= last) return true;
            for (let j = 1; j <= a[i]; j++) if (go(i + j)) return true;
            return false;
          };
          go(0);
          return calls;
        } },
      ours: { ru: 'один проход с reach', en: 'one pass with reach',
        count: p => {
          let reach = 0, visits = 0;
          for (let i = 0; i < p.a.length; i++) { visits++; if (i > reach) break; reach = Math.max(reach, i + p.a[i]); }
          return visits;
        } },
    },
    predict: [
      { q: { ru: 'Что покажет следующий индекс?', en: 'What will the next index show?' },
        keys: { 'greedy.ev.step': { ru: 'обычный шаг, reach растёт или стоит', en: 'a normal step, reach grows or holds' },
                'greedy.ev.zero': { ru: 'ноль на пути', en: 'a zero on the way' },
                'greedy.ev.win': { ru: 'reach дотянулся до конца', en: 'reach covers the end' },
                'greedy.ev.stuck': { ru: 'сюда не добраться', en: 'this index is unreachable' } } },
    ],
    followups: [
      { ru: { q: 'Из i можно прыгнуть в i + a[i] или i − a[i]; дойти до любого нуля (#1306).', a: 'Жадность тут не работает — прыжки в обе стороны. Обычный BFS или DFS по индексам с visited, O(n).' },
        en: { q: 'From i you may jump to i + a[i] or i − a[i]; reach any zero (#1306).', a: 'Greed fails with jumps in both directions. Use a plain BFS or DFS over indices with visited, O(n).' } },
      { ru: { q: 'Как решить, идя справа налево?', a: 'Держи goal = последний индекс; если i + a[i] ≥ goal, сдвигай goal = i. Ответ — goal == 0. Тот же O(n).' },
        en: { q: 'How do you solve it walking right to left?', a: 'Keep goal = the last index; whenever i + a[i] ≥ goal, move goal = i. The answer is goal == 0. Same O(n).' } },
    ],
    related: [
      { id: 'kadane', ru: 'одно число вместо перебора всех вариантов', en: 'one running number instead of trying everything' },
      { id: 'climb', ru: 'тоже прыжки вперёд, но там считаем способы', en: 'also forward jumps, but counting the ways' },
    ],
  },

  stock: {
    tricky: [
      { input: { prices: '3, 8, 1, 4' },
        ru: '«Максимум минус минимум» даёт 8 − 1 = 7, но минимум идёт после максимума. Продать раньше покупки нельзя — ответ 5.',
        en: '"Max minus min" gives 8 − 1 = 7, but the minimum comes after the maximum. You cannot sell before buying, so the answer is 5.' },
      { input: { prices: '7, 6, 4, 3, 1' },
        ru: 'Цена только падает: не торговать выгоднее, ответ 0, а не отрицательная «лучшая» сделка.',
        en: 'The price only falls: not trading is best, so the answer is 0, not a negative "best" trade.' },
    ],
    ops: {
      unit: { ru: 'вычислений прибыли', en: 'profit checks' },
      naive: { ru: 'все пары (купить, продать)', en: 'every (buy, sell) pair', count: p => (p.prices.length * (p.prices.length - 1)) / 2 },
      ours: { ru: 'один проход с минимумом', en: 'one pass keeping the minimum', count: p => p.prices.length },
    },
    predict: [
      { q: { ru: 'Сегодняшняя цена — новый минимум или день для продажи?', en: 'Is today\'s price a new low or a day to sell?' },
        keys: { 'stk.ev.low': { ru: 'новый минимум', en: 'a new low' },
                'stk.ev.sell': { ru: 'продаём', en: 'sell' } } },
    ],
    followups: [
      { ru: { q: 'Сделок сколько угодно (#122).', a: 'Сложи все положительные разности соседних дней: каждый рост цены можно забрать отдельной сделкой.' },
        en: { q: 'Any number of trades (#122).', a: 'Sum all positive differences between neighbouring days: every rise can be taken as its own trade.' } },
      { ru: { q: 'Не больше двух сделок (#123).', a: 'Четыре переменные за один проход: buy1, sell1, buy2, sell2; buy2 считается от sell1. O(n), O(1) памяти.' },
        en: { q: 'At most two trades (#123).', a: 'Four variables in one pass: buy1, sell1, buy2, sell2, with buy2 based on sell1. O(n) time, O(1) memory.' } },
    ],
    related: [
      { id: 'kadane', ru: 'на разностях дней это Кадане', en: 'on day-to-day differences this is Kadane' },
      { id: 'daily', ru: 'тоже ответ про будущие дни, но стеком', en: 'also about future days, but with a stack' },
    ],
  },

  intervals: {
    tricky: [
      { input: { intervals: '1-10 2-3 4-5 6-7' },
        ru: 'Сортировка по началу оставит длинный [1, 10] и удалит три коротких. По концу удаляется только [1, 10] — ответ 1.',
        en: 'Sorting by start keeps the long [1, 10] and removes three short ones. Sorting by end removes only [1, 10]: the answer is 1.' },
      { input: { intervals: '1-2 2-3 3-4' },
        ru: 'Интервалы только касаются концами — это не пересечение, удалять нечего: ответ 0. Сравнение <code>&gt;</code> вместо <code>≥</code> удалит два.',
        en: 'The intervals only touch at their ends, which is not an overlap, so the answer is 0. Using <code>&gt;</code> instead of <code>≥</code> removes two.' },
    ],
    ops: {
      unit: { ru: 'сравнений', en: 'comparisons' },
      naive: { ru: 'сортировка и DP по всем парам', en: 'sorting plus a DP over all pairs',
        count: p => { const n = p.intervals.length; return sortComparisons(p.intervals, (a, b) => a[1] - b[1]) + (n * (n - 1)) / 2; } },
      ours: { ru: 'сортировка по концу и один проход', en: 'sort by end and one pass',
        count: p => sortComparisons(p.intervals, (a, b) => a[1] - b[1]) + p.intervals.length },
    },
    predict: [
      { q: { ru: 'Следующий интервал начинается не раньше линии?', en: 'Does the next interval start at or after the line?' },
        keys: { 'int.ev.keep': { ru: 'да, оставляем', en: 'yes, keep it' },
                'int.ev.drop': { ru: 'нет, удаляем', en: 'no, remove it' } } },
    ],
    followups: [
      { ru: { q: 'Минимум стрел, чтобы лопнуть все шарики (#452).', a: 'Та же сортировка по концу: стрела в конце первого шарика, новая — когда начало шарика больше позиции стрелы. Тут касание считается пересечением.' },
        en: { q: 'The fewest arrows to burst all balloons (#452).', a: 'Same sort by end: shoot at the first balloon\'s end, and add an arrow when a balloon starts after it. Here touching counts as overlapping.' } },
      { ru: { q: 'Верни, какие именно интервалы удалить.', a: 'Сортируй индексы, а не сами интервалы; всё, что попало в ветку «удаляем», — ответ.' },
        en: { q: 'Return which intervals to remove.', a: 'Sort indices instead of the intervals; everything that takes the "remove" branch is the answer.' } },
    ],
    related: [
      { id: 'meetingRooms', ru: 'те же интервалы, но считаем пик пересечений', en: 'the same intervals, but counting peak overlap' },
      { id: 'lisTails', ru: 'DP по парам — та же схема, что в LIS', en: 'the pairwise DP is the LIS scheme' },
    ],
  },

  mergeIv: {
    tricky: [
      { input: { intervals: '1-4 4-5' },
        ru: 'Касание в точке 4 сливает: ответ [1, 5]. С <code>&lt;</code> вместо <code>≤</code> останутся два блока.',
        en: 'Touching at 4 merges: the answer is [1, 5]. With <code>&lt;</code> instead of <code>≤</code> two blocks remain.' },
      { input: { intervals: '1-10 2-3 4-5' },
        ru: 'Конец блока — максимум, а не конец последнего интервала: иначе [1, 10] съёжится до [1, 5]. Ответ [1, 10].',
        en: 'The block end is a maximum, not the last interval\'s end, or [1, 10] shrinks to [1, 5]. The answer is [1, 10].' },
      { input: { intervals: '8-10 1-3 2-6' },
        ru: 'Вход не отсортирован. Без сортировки [8, 10] откроет блок первым и [1, 3] к нему не прилипнет. Ответ [1, 6], [8, 10].',
        en: 'The input is unsorted. Without sorting, [8, 10] opens a block first and [1, 3] never joins anything. The answer is [1, 6], [8, 10].' },
    ],
    ops: {
      unit: { ru: 'сравнений', en: 'comparisons' },
      naive: { ru: 'искать любую пересекающуюся пару, пока она есть', en: 'look for any overlapping pair while one exists',
        count: p => {
          const list = p.intervals.map(x => [...x]);
          let cmp = 0;
          for (;;) {
            let hit = null;
            for (let i = 0; i < list.length && !hit; i++) {
              for (let j = i + 1; j < list.length; j++) {
                cmp++;
                if (list[i][0] <= list[j][1] && list[j][0] <= list[i][1]) { hit = [i, j]; break; }
              }
            }
            if (!hit) return cmp;
            const [i, j] = hit;
            list[i] = [Math.min(list[i][0], list[j][0]), Math.max(list[i][1], list[j][1])];
            list.splice(j, 1);
          }
        } },
      ours: { ru: 'сортировка по началу и один проход', en: 'sort by start and one pass',
        count: p => sortComparisons(p.intervals, (a, b) => a[0] - b[0]) + Math.max(0, p.intervals.length - 1) },
    },
    predict: [
      { q: { ru: 'Следующий интервал начинается не позже конца блока?', en: 'Does the next interval start no later than the block\'s end?' },
        keys: { 'mrg.ev.merge': { ru: 'да, продлеваем блок', en: 'yes, extend the block' },
                'mrg.ev.new': { ru: 'нет, новый блок', en: 'no, a new block' } } },
    ],
    followups: [
      { ru: { q: 'Пересечение двух отсортированных списков интервалов (#986).', a: 'Два указателя: пересечение — [max(начал), min(концов)], если оно непусто. Сдвигай тот интервал, что кончается раньше. O(n + m).' },
        en: { q: 'Intersect two sorted interval lists (#986).', a: 'Two pointers: the overlap is [max(starts), min(ends)] when non-empty. Advance whichever interval ends first. O(n + m).' } },
      { ru: { q: 'Интервалов столько, что они не влезают в память.', a: 'Внешняя сортировка по началу, потом тот же проход потоком: в памяти только текущий блок.' },
        en: { q: 'There are too many intervals to fit in memory.', a: 'External sort by start, then the same pass as a stream: only the current block lives in memory.' } },
    ],
    related: [
      { id: 'insertIv', ru: 'вставка в уже слитый список — без сортировки', en: 'inserting into an already merged list, no sorting' },
      { id: 'meetingRooms', ru: 'те же пересечения, но считаем их число', en: 'the same overlaps, but counted' },
    ],
  },

  candy: {
    tricky: [
      { input: { ratings: '1, 2, 2' },
        ru: 'Равный рейтинг не требует больше конфет: раздача 1, 2, 1, всего 4. С <code>≥</code> вместо <code>&gt;</code> вышло бы 6.',
        en: 'An equal rating needs no extra candy: 1, 2, 1, total 4. Using <code>≥</code> instead of <code>&gt;</code> gives 6.' },
      { input: { ratings: '5, 4, 3, 2, 1' },
        ru: 'Один проход слева направо ничего не увидит и раздаст 5 конфет. Нужен обратный: 5, 4, 3, 2, 1 — всего 15.',
        en: 'A single left-to-right pass sees nothing and hands out 5 candies. The backward pass is needed: 5, 4, 3, 2, 1, total 15.' },
    ],
    ops: {
      unit: { ru: 'сравнений', en: 'comparisons' },
      naive: { ru: 'проходы, пока где-то нарушено правило', en: 'repeat passes while a rule is broken',
        count: p => {
          const r = p.ratings, n = r.length, c = new Array(n).fill(1);
          let cmp = 0, changed = true;
          while (changed) {
            changed = false;
            for (let i = 0; i < n; i++) {
              if (i > 0) { cmp++; if (r[i] > r[i - 1] && c[i] <= c[i - 1]) { c[i] = c[i - 1] + 1; changed = true; } }
              if (i < n - 1) { cmp++; if (r[i] > r[i + 1] && c[i] <= c[i + 1]) { c[i] = c[i + 1] + 1; changed = true; } }
            }
          }
          return cmp;
        } },
      ours: { ru: 'два прохода навстречу', en: 'two passes in opposite directions', count: p => 2 * (p.ratings.length - 1) },
    },
    predict: [
      { q: { ru: 'В проходе 1 ещё кто-то получит прибавку, или проход закончен?', en: 'Will anyone else get a raise in pass 1, or is the pass over?' },
        keys: { 'candy.ev.left': { ru: 'ещё прибавка', en: 'another raise' },
                'candy.ev.pass2': { ru: 'проход 1 закончен', en: 'pass 1 is over' } } },
    ],
    followups: [
      { ru: { q: 'Дети сидят по кругу.', a: 'Разрежь круг у ребёнка с минимальным рейтингом и поставь его на оба конца ряда: он всё равно получает 1. Посчитай как для ряда и вычти одну лишнюю конфету.' },
        en: { q: 'The children sit in a circle.', a: 'Cut the circle at a child with the lowest rating and put that child at both ends of the row: they get 1 anyway. Solve the row and subtract the one extra candy.' } },
      { ru: { q: 'Проверить, честна ли уже готовая раздача.', a: 'Один проход по парам соседей: где рейтинг выше, конфет должно быть строго больше. O(n). Минимальность так не проверить — для неё нужен сам алгоритм.' },
        en: { q: 'Check whether a given distribution is fair.', a: 'One pass over neighbouring pairs: a higher rating must have strictly more candy. O(n). Minimality is another matter; that needs the algorithm itself.' } },
    ],
    related: [
      { id: 'trap', ru: 'тоже два прохода навстречу', en: 'also two passes from opposite ends' },
      { id: 'productExcept', ru: 'префикс слева и суффикс справа', en: 'a prefix from the left and a suffix from the right' },
    ],
  },

  insertIv: {
    tricky: [
      { input: { intervals: '', newInterval: '5-7' },
        ru: 'Список пуст: ни одна фаза не крутится, но [5, 7] всё равно надо добавить. Ответ [[5, 7]].',
        en: 'The list is empty: no phase loops, yet [5, 7] must still be added. The answer is [[5, 7]].' },
      { input: { intervals: '1-3 6-9', newInterval: '3-6' },
        ru: 'Новый интервал касается обоих соседей: с <code>≤</code> всё сливается в [1, 9]; со строгим сравнением останутся три куска.',
        en: 'The new interval touches both neighbours: with <code>≤</code> everything merges into [1, 9]; a strict comparison leaves three pieces.' },
      { input: { intervals: '1-5', newInterval: '2-3' },
        ru: 'Новый лежит целиком внутри [1, 5]: s и e берут min и max, и ответ остаётся [1, 5], а не [2, 3].',
        en: 'The new one lies inside [1, 5]: s and e take min and max, so the answer stays [1, 5], not [2, 3].' },
    ],
    ops: {
      unit: { ru: 'сравнений', en: 'comparisons' },
      naive: { ru: 'дописать, отсортировать и слить заново', en: 'append, sort and merge again',
        count: p => { const all = [...p.intervals, p.newInterval[0]]; return sortComparisons(all, (a, b) => a[0] - b[0]) + all.length - 1; } },
      ours: { ru: 'три фазы за один проход', en: 'three phases in one pass',
        count: p => {
          const iv = p.intervals, n = iv.length;
          let [s, e] = p.newInterval[0], i = 0, cmp = 0;
          while (i < n) { cmp++; if (iv[i][1] < s) i++; else break; }
          while (i < n) { cmp++; if (iv[i][0] <= e) { s = Math.min(s, iv[i][0]); e = Math.max(e, iv[i][1]); i++; } else break; }
          return cmp;
        } },
    },
    predict: [
      { q: { ru: 'Очередной интервал: целиком левее, задевает новый, только касается — или поглощать больше нечего?', en: 'The next interval: entirely to the left, overlapping the new one, only touching, or nothing left to absorb?' },
        keys: { 'ins.ev.left': { ru: 'целиком левее', en: 'entirely to the left' },
                'ins.ev.absorb': { ru: 'задевает — поглощаем', en: 'overlaps, absorb it' },
                'ins.ev.touch': { ru: 'только касается', en: 'only touches' },
                'ins.ev.place': { ru: 'ставим новый интервал', en: 'place the new interval' } } },
    ],
    followups: [
      { ru: { q: 'Удалить отрезок [s, e) из списка (#1272).', a: 'Тот же проход: интервалы левее и правее копируем, задетые режем на [a, s) и [e, b) и оставляем непустые куски.' },
        en: { q: 'Remove the range [s, e) from the list (#1272).', a: 'The same pass: copy intervals to the left and right, cut the touched ones into [a, s) and [e, b), and keep the non-empty pieces.' } },
      { ru: { q: 'Можно ли найти фазы бинарным поиском?', a: 'Да, обе границы — за O(log n). Но собрать новый список всё равно стоит O(n), так что выигрыш есть, только если список меняется на месте в дереве.' },
        en: { q: 'Can you find the phases with binary search?', a: 'Yes, both boundaries in O(log n). Building the new list still costs O(n), so it only pays off when the list lives in a tree and is edited in place.' } },
    ],
    related: [
      { id: 'mergeIv', ru: 'тот же критерий слияния, но с сортировкой', en: 'the same merge rule, but with sorting' },
      { id: 'bsearch', ru: 'границы фаз ищутся бинарным поиском', en: 'the phase boundaries can be binary-searched' },
    ],
  },

  meetingRooms: {
    tricky: [
      { input: { intervals: '1-4 4-7' },
        ru: 'Встреча в 4 кончается, другая в 4 начинается: хватит одной комнаты. Если ставить начало раньше конца, выйдет 2.',
        en: 'One meeting ends at 4 and another starts at 4: one room is enough. Put starts before ends at equal times and you get 2.' },
      { input: { intervals: '1-10 2-3 4-5 6-7' },
        ru: 'Длинная встреча пересекается с тремя, но короткие между собой не пересекаются: нужно 2 комнаты, а не 4.',
        en: 'The long meeting overlaps three others, but the short ones do not overlap each other: 2 rooms, not 4.' },
    ],
    ops: {
      unit: { ru: 'сравнений', en: 'comparisons' },
      naive: { ru: 'для каждого начала пересчитать идущие встречи', en: 'for each start, count the meetings in progress',
        count: p => {
          let cmp = 0;
          for (const [t] of p.intervals) for (const [a, b] of p.intervals) { cmp++; if (a <= t) cmp++; void b; }
          return cmp;
        } },
      ours: { ru: 'развёртка по событиям', en: 'a sweep over events',
        count: p => {
          const ev = p.intervals.flatMap(([a, b]) => [[a, 1], [b, -1]]);
          return sortComparisons(ev, (x, y) => (x[0] !== y[0] ? x[0] - y[0] : x[1] - y[1])) + ev.length;
        } },
    },
    predict: [
      { q: { ru: 'Следующее событие: начало в свободную комнату, новый пик, конец или конец, который тут же отдаёт комнату?', en: 'Next event: a start in a free room, a new peak, an end, or an end that hands its room straight over?' },
        keys: { 'mr.ev.open': { ru: 'начало, комната есть', en: 'a start, a room is free' },
                'mr.ev.peak': { ru: 'начало, новый пик', en: 'a start, a new peak' },
                'mr.ev.close': { ru: 'конец встречи', en: 'a meeting ends' },
                'mr.ev.free': { ru: 'конец в момент чужого начала', en: 'an end at the same moment as a start' } } },
    ],
    followups: [
      { ru: { q: 'Нужно не число, а какая встреча в какой комнате.', a: 'Сортируй встречи по началу и держи min-heap занятых комнат по времени конца. Если корень освободился к началу встречи — забираешь его комнату, иначе открываешь новую.' },
        en: { q: 'You need which meeting goes to which room, not just the count.', a: 'Sort meetings by start and keep a min-heap of busy rooms by end time. If the root is free by the meeting\'s start, take its room; otherwise open a new one.' } },
      { ru: { q: 'Время — целые до 10⁶, встреч 10⁵.', a: 'Разностный массив: +1 в начале, −1 в конце, потом префиксная сумма. O(n + T) без сортировки.' },
        en: { q: 'Times are integers up to 10⁶, with 10⁵ meetings.', a: 'A difference array: +1 at the start, −1 at the end, then a prefix sum. O(n + T) with no sorting.' } },
    ],
    related: [
      { id: 'mergeIv', ru: 'те же интервалы, но склеиваем их', en: 'the same intervals, glued together instead' },
      { id: 'psum', ru: 'бегущая сумма +1/−1 вместо пересчёта', en: 'a running +1/−1 sum instead of recounting' },
    ],
  },
};
