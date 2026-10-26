/** Extras for chapters dp, bits, games, design: tricky inputs, an operation counter, predict-the-step forks, interviewer follow-ups, related problems. */

/* ---------- counting helpers: plain simulations of the naive and the real solutions, no imports ---------- */

const DIRS4 = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const DIRS8 = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const inGrid = (m, r, c) => r >= 0 && c >= 0 && r < m.length && c < m[0].length;
const bitLength = v => 32 - Math.clz32(v);
const ones = v => { let c = 0; for (let x = v >>> 0; x; x = (x & (x - 1)) >>> 0) c++; return c; };

/** Size of a naive recursion tree over (i, j), counted with a memo of counts (the recursion itself has none). */
function treeCount(n, m, step) {
  const memo = new Map();
  const count = (i, j) => {
    if (i >= n || j >= m) return 0;
    const key = i * 64 + j;
    if (!memo.has(key)) memo.set(key, 1 + step(i, j).reduce((s, [y, x]) => s + count(y, x), 0));
    return memo.get(key);
  };
  return count(0, 0);
}

/** Coin Change by plain recursion: tries(r) = Σ over coins c ≤ r of (1 + tries(r − c)). */
function coinNaiveTries(coins, amount) {
  const t = [0];
  for (let r = 1; r <= amount; r++) t[r] = coins.filter(c => c <= r).reduce((s, c) => s + 1 + t[r - c], 0);
  return t[amount];
}

/** LIS by take/skip recursion: one comparison per call that still has an element to look at. */
function lisNaiveCompares(nums) {
  let compares = 0;
  const go = (i, prev) => {
    if (i === nums.length) return;
    compares++;
    if (nums[i] > prev) go(i + 1, nums[i]);
    go(i + 1, prev);
  };
  go(0, -Infinity);
  return compares;
}

/** Regex by backtracking (no memo): one character comparison per call with both s and p left. */
function regexNaiveCompares(s, p) {
  let compares = 0;
  const go = (i, j) => {
    if (j === p.length) return i === s.length;
    let first = false;
    if (i < s.length) { compares++; first = p[j] === '.' || p[j] === s[i]; }
    if (j + 1 < p.length && p[j + 1] === '*') return go(i, j + 2) || (first && go(i + 1, j));
    return first && go(i + 1, j + 1);
  };
  go(0, 0);
  return compares;
}

/** A* exactly as the rig runs it (heap by f, then h, then row, column); returns the number of expanded cells. */
const HEUR = {
  chebyshev: (dr, dc) => Math.max(dr, dc),
  octile: (dr, dc) => Math.max(dr, dc) + (Math.SQRT2 - 1) * Math.min(dr, dc),
  manhattan: (dr, dc) => dr + dc,
  zero: () => 0,
};
function astarExpanded(grid, hName) {
  const rows = grid.length, cols = grid[0].length, gr = rows - 1, gc = cols - 1, H = HEUR[hName] || HEUR.zero;
  if (grid[0][0] || grid[gr][gc]) return 0;
  const h = (r, c) => H(Math.abs(gr - r), Math.abs(gc - c));
  const g = grid.map(r => r.map(() => null)), closed = grid.map(r => r.map(() => false)), open = [];
  const less = (a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i]; return false; };
  const push = e => { let i = open.length; while (i > 0 && less(e, open[i - 1])) i--; open.splice(i, 0, e); };
  let expanded = 0;
  g[0][0] = 0;
  push([h(0, 0), h(0, 0), 0, 0]);
  while (open.length) {
    const [, , r, c] = open.shift();
    if (closed[r][c]) continue;
    closed[r][c] = true;
    expanded++;
    if (r === gr && c === gc) return expanded;
    for (const [dr, dc] of DIRS8) {
      const y = r + dr, x = c + dc;
      if (!inGrid(grid, y, x) || grid[y][x] || closed[y][x]) continue;
      const cand = g[r][c] + 1;
      if (g[y][x] === null || cand < g[y][x]) { g[y][x] = cand; push([cand + h(y, x), h(y, x), y, x]); }
    }
  }
  return expanded;
}

/** Plain BFS over 8 directions: cells taken off the queue until the far corner comes off (or the queue runs dry). */
function bfs8Dequeued(grid) {
  const rows = grid.length, cols = grid[0].length;
  if (grid[0][0] || grid[rows - 1][cols - 1]) return 0;
  const seen = grid.map(r => r.map(() => false)), queue = [[0, 0]];
  seen[0][0] = true;
  let head = 0;
  for (; head < queue.length; head++) {
    const [r, c] = queue[head];
    if (r === rows - 1 && c === cols - 1) return head + 1;
    for (const [dr, dc] of DIRS8) {
      const y = r + dr, x = c + dc;
      if (inGrid(grid, y, x) && !grid[y][x] && !seen[y][x]) { seen[y][x] = true; queue.push([y, x]); }
    }
  }
  return head;
}

/** Flow field: a separate Dijkstra from every open cell to the nearest goal (cost paid on leaving a cell), cells settled. */
function flowNaivePops(cost, goals) {
  const rows = cost.length, cols = cost[0].length, isGoal = (r, c) => goals.some(([y, x]) => y === r && x === c);
  let pops = 0;
  for (let sr = 0; sr < rows; sr++) {
    for (let sc = 0; sc < cols; sc++) {
      if (!cost[sr][sc] || isGoal(sr, sc)) continue;
      const dist = cost.map(r => r.map(() => Infinity)), done = cost.map(r => r.map(() => false));
      dist[sr][sc] = 0;
      for (;;) {
        let best = null;
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          if (!done[r][c] && dist[r][c] < Infinity && (!best || dist[r][c] < dist[best[0]][best[1]])) best = [r, c];
        }
        if (!best) break;
        const [r, c] = best;
        done[r][c] = true;
        pops++;
        if (isGoal(r, c)) break;
        for (const [dr, dc] of DIRS4) {
          const y = r + dr, x = c + dc;
          if (inGrid(cost, y, x) && cost[y][x] && dist[r][c] + cost[r][c] < dist[y][x]) dist[y][x] = dist[r][c] + cost[r][c];
        }
      }
    }
  }
  return pops;
}

/** Flow field: one wave from all goals at once settles every cell it can reach exactly once. */
function flowReachable(cost, goals) {
  const seen = cost.map(r => r.map(() => false)), queue = [];
  for (const [r, c] of goals) if (!seen[r][c]) { seen[r][c] = true; queue.push([r, c]); }
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head];
    for (const [dr, dc] of DIRS4) {
      const y = r + dr, x = c + dc;
      if (inGrid(cost, y, x) && cost[y][x] && !seen[y][x]) { seen[y][x] = true; queue.push([y, x]); }
    }
  }
  return queue.length;
}

/** Spatial grid: distance checks of the 3 × 3 window around each query's cell. */
function gridChecks(points, queries, size) {
  const buckets = new Map(), key = (cx, cy) => `${cx},${cy}`;
  for (const [x, y] of points) {
    const k = key(Math.floor(x / size), Math.floor(y / size));
    buckets.set(k, (buckets.get(k) || 0) + 1);
  }
  let checks = 0;
  for (const [x, y] of queries) {
    const cx = Math.floor(x / size), cy = Math.floor(y / size);
    for (let gy = cy - 1; gy <= cy + 1; gy++) for (let gx = cx - 1; gx <= cx + 1; gx++) {
      if (gx >= 0 && gy >= 0) checks += buckets.get(key(gx, gy)) || 0;
    }
  }
  return checks;
}

/** Vertices taken off a BFS queue from `from` until `to` comes off, over an adjacency list; found or not. */
function bfsVisits(adj, from, to) {
  const seen = new Set([from]), queue = [from];
  for (let head = 0; head < queue.length; head++) {
    if (queue[head] === to) return { visits: head + 1, found: true };
    for (const w of adj.get(queue[head]) || []) if (!seen.has(w)) { seen.add(w); queue.push(w); }
  }
  return { visits: queue.length, found: false };
}
const link = (adj, a, b) => {
  if (!adj.has(a)) adj.set(a, []);
  if (!adj.has(b)) adj.set(b, []);
  adj.get(a).push(b);
  adj.get(b).push(a);
};

/** Redundant Connection, naive: before adding an edge, search the graph built so far for a path between its ends. */
function redundantNaive(edges) {
  const adj = new Map();
  let visits = 0;
  for (const [u, v] of edges) {
    const r = bfsVisits(adj, u, v);
    visits += r.visits;
    if (r.found) break;
    link(adj, u, v);
  }
  return visits;
}

/** Redundant Connection with union by rank and path compression: vertices on both find paths. */
function redundantDsu(edges) {
  const n = edges.length, parent = Array.from({ length: n + 1 }, (_, i) => i), rank = Array(n + 1).fill(0);
  let visits = 0;
  const find = x => {
    const path = [x];
    while (parent[path.at(-1)] !== path.at(-1)) path.push(parent[path.at(-1)]);
    visits += path.length;
    const root = path.at(-1);
    for (const v of path) parent[v] = root;
    return root;
  };
  for (const [u, v] of edges) {
    let a = find(u), b = find(v);
    if (a === b) break;
    if (rank[a] < rank[b]) [a, b] = [b, a];
    parent[b] = a;
    if (rank[a] === rank[b]) rank[a]++;
  }
  return visits;
}

/** Swim in Rising Water: the in-grid neighbours of a cell. */
const neighbours4 = (n, r, c) => DIRS4.filter(([dr, dc]) => r + dr >= 0 && c + dc >= 0 && r + dr < n && c + dc < n).length;

/** Swim, naive: for t = 0, 1, 2… a fresh BFS over cells ≤ t until the far corner is reached; neighbour checks. */
function swimNaiveChecks(grid) {
  const n = grid.length;
  let checks = 0;
  for (let t = 0; t < n * n; t++) {
    if (grid[0][0] > t) continue;
    const seen = grid.map(r => r.map(() => false)), queue = [[0, 0]];
    seen[0][0] = true;
    for (let head = 0; head < queue.length; head++) {
      const [r, c] = queue[head];
      if (r === n - 1 && c === n - 1) return checks;
      for (const [dr, dc] of DIRS4) {
        const y = r + dr, x = c + dc;
        if (y < 0 || x < 0 || y >= n || x >= n) continue;
        checks++;
        if (!seen[y][x] && grid[y][x] <= t) { seen[y][x] = true; queue.push([y, x]); }
      }
    }
  }
  return checks;
}

/** Swim with union-find: the cell of height t gets wet and looks at its neighbours once; stop when the corners meet. */
function swimDsuChecks(grid) {
  const n = grid.length, total = n * n, parent = Array.from({ length: total }, (_, i) => i), wet = Array(total).fill(false), at = [];
  grid.forEach((row, r) => row.forEach((v, c) => { at[v] = r * n + c; }));
  const find = x => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
  let checks = 0;
  for (let t = 0; t < total; t++) {
    const cell = at[t], r = Math.floor(cell / n), c = cell % n;
    wet[cell] = true;
    for (const [dr, dc] of DIRS4) {
      const y = r + dr, x = c + dc;
      if (y < 0 || x < 0 || y >= n || x >= n) continue;
      checks++;
      if (wet[y * n + x]) parent[find(y * n + x)] = find(cell);
    }
    if (wet[0] && wet[total - 1] && find(0) === find(total - 1)) return checks;
  }
  return checks;
}

/** Edges of all pairs, sorted by Manhattan length, then by ends: what Kruskal walks through. */
function sortedEdges(points) {
  const edges = [];
  for (let i = 0; i < points.length; i++) for (let j = i + 1; j < points.length; j++) {
    edges.push([Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]), i, j]);
  }
  return edges.sort((x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2]);
}

/** Kruskal, naive cycle test: BFS through the forest taken so far from one end of the edge to the other. */
function kruskalNaive(points) {
  const n = points.length, adj = new Map();
  let visits = 0, taken = 0;
  for (const [, i, j] of sortedEdges(points)) {
    if (taken === n - 1) break;
    const r = bfsVisits(adj, i, j);
    visits += r.visits;
    if (r.found) continue;
    link(adj, i, j);
    taken++;
  }
  return visits;
}

/** Kruskal with union-find (recursive find with path compression, union by rank): vertices on the find paths. */
function kruskalDsu(points) {
  const n = points.length, parent = points.map((_, i) => i), rank = points.map(() => 0);
  let visits = 0, taken = 0;
  const find = x => { visits++; return parent[x] === x ? x : (parent[x] = find(parent[x])); };
  for (const [, i, j] of sortedEdges(points)) {
    if (taken === n - 1) break;
    let a = find(i), b = find(j);
    if (a === b) continue;
    if (rank[a] < rank[b]) [a, b] = [b, a];
    parent[b] = a;
    if (rank[a] === rank[b]) rank[a]++;
    taken++;
  }
  return visits;
}

/** Pacific Atlantic, naive: from every cell a DFS downhill (to neighbours not higher) until both oceans are touched. */
function oceansNaiveVisits(h) {
  const m = h.length, n = h[0].length;
  let visits = 0;
  for (let sr = 0; sr < m; sr++) for (let sc = 0; sc < n; sc++) {
    const seen = h.map(r => r.map(() => false)), stack = [[sr, sc]];
    let pac = false, atl = false;
    seen[sr][sc] = true;
    while (stack.length && !(pac && atl)) {
      const [r, c] = stack.pop();
      visits++;
      if (r === 0 || c === 0) pac = true;
      if (r === m - 1 || c === n - 1) atl = true;
      for (const [dr, dc] of DIRS4) {
        const y = r + dr, x = c + dc;
        if (inGrid(h, y, x) && !seen[y][x] && h[y][x] <= h[r][c]) { seen[y][x] = true; stack.push([y, x]); }
      }
    }
  }
  return visits;
}

/** Pacific Atlantic backwards: a BFS uphill from each ocean's border; every cell it reaches is visited once. */
function oceansReverseVisits(h) {
  const m = h.length, n = h[0].length;
  let visits = 0;
  for (const pacific of [true, false]) {
    const seen = h.map(r => r.map(() => false)), queue = [];
    const seed = (r, c) => { if (!seen[r][c]) { seen[r][c] = true; queue.push([r, c]); } };
    for (let c = 0; c < n; c++) seed(pacific ? 0 : m - 1, c);
    for (let r = 0; r < m; r++) seed(r, pacific ? 0 : n - 1);
    for (let head = 0; head < queue.length; head++) {
      const [r, c] = queue[head];
      for (const [dr, dc] of DIRS4) {
        const y = r + dr, x = c + dc;
        if (inGrid(h, y, x) && !seen[y][x] && h[y][x] >= h[r][c]) { seen[y][x] = true; queue.push([y, x]); }
      }
    }
    visits += queue.length;
  }
  return visits;
}

/** Trie ops on a plain list of words: search compares equal-length words, startsWith compares the prefix; first success stops. */
function wordListCompares(ops) {
  const words = [];
  let compares = 0;
  for (const [op, w] of ops) {
    if (op === 'insert') { words.push(w); continue; }
    for (const s of words) {
      if (op === 'search' ? s.length !== w.length : s.length < w.length) continue;
      let i = 0;
      while (i < w.length) { compares++; if (s[i] !== w[i]) break; i++; }
      if (i === w.length) break;
    }
  }
  return compares;
}

/** Trie: one step per character until the word ends or an edge is missing (insert never misses). */
function trieSteps(ops) {
  const root = new Map();
  let steps = 0;
  for (const [op, w] of ops) {
    let node = root;
    for (const ch of w) {
      steps++;
      if (!node.has(ch)) {
        if (op !== 'insert') break;
        node.set(ch, new Map());
      }
      node = node.get(ch);
    }
  }
  return steps;
}

/** Depth (levels) of a tree given in LeetCode level order. */
function levelOrderHeight(values) {
  if (!values.length || values[0] === null) return 0;
  const depth = [1], queue = [0];
  let i = 1, height = 1;
  while (queue.length && i < values.length) {
    const d = depth[queue.shift()];
    for (let side = 0; side < 2 && i < values.length; side++, i++) {
      if (values[i] === null) continue;
      depth[i] = d + 1;
      height = Math.max(height, d + 1);
      queue.push(i);
    }
  }
  return height;
}

/** Circular queue vs an array that shifts everything left on deQueue: element writes. */
function queueWrites(k, ops, shifting) {
  let count = 0, writes = 0;
  for (const [op] of ops) {
    if (op === 'enQueue' && count < k) { count++; writes++; }
    else if (op === 'deQueue' && count > 0) { if (shifting) writes += count - 1; count--; }
  }
  return writes;
}

/** LFU by its rules: how many puts of a new key hit a full cache and evict. */
function lfuEvictions(capacity, ops) {
  const entries = new Map();
  let time = 0, evictions = 0;
  for (const [op, key] of ops) {
    time++;
    const e = entries.get(key);
    if (e) { e.freq++; e.used = time; continue; }
    if (op === 'get') continue;
    if (entries.size === capacity) {
      let victim = null;
      for (const [k, x] of entries) if (!victim || x.freq < victim[1].freq || (x.freq === victim[1].freq && x.used < victim[1].used)) victim = [k, x];
      entries.delete(victim[0]);
      evictions++;
    }
    entries.set(key, { freq: 1, used: time });
  }
  return evictions;
}

export const EX_D = {
  /* ---------- dp ---------- */
  climb: {
    tricky: [
      { input: { n: '1' },
        ru: 'Одна ступень: цикл не делает ни шага, а код, который заранее пишет <code>dp[2]</code> в массив длины n + 1, падает. Ответ — 1.',
        en: 'One step: the loop never runs, and code that writes <code>dp[2]</code> up front into an array of length n + 1 crashes. The answer is 1.' },
      { input: { n: '2' },
        ru: 'Сдвиг на единицу: ответ — F(n + 1), а не F(n). Для n = 2 способов два (1 + 1 и 2), а «просто Фибоначчи» вернёт 1.',
        en: 'Off by one: the answer is F(n + 1), not F(n). For n = 2 there are two ways (1 + 1 and 2), while “plain Fibonacci” returns 1.' },
    ],
    ops: {
      unit: { ru: 'сложений', en: 'additions' },
      naive: { ru: 'рекурсия без памяти', en: 'recursion without memo', count: p => {
        let a = 1, b = 1;
        for (let i = 2; i <= p.n; i++) [a, b] = [b, a + b];
        return b - 1;
      } },
      ours: { ru: 'два числа', en: 'two numbers', count: p => Math.max(0, p.n - 1) },
    },
    predict: [
      { q: { ru: 'Считаем ещё одну ступень или уже дошли до n?', en: 'Compute one more step, or have we reached n?' },
        keys: { 'climb.ev.step': { ru: 'ещё ступень: сумма двух предыдущих', en: 'one more step: the sum of the previous two' },
                'climb.ev.done': { ru: 'i = n, ответ готов', en: 'i = n, the answer is ready' } } },
    ],
    followups: [
      { ru: { q: 'А если за шаг можно подняться на 1, 2 или 3 ступени?', a: 'ways[i] = ways[i − 1] + ways[i − 2] + ways[i − 3], и хранить нужно три последних значения. Для любого набора шагов S — сумма по s из S, O(n·|S|).' },
        en: { q: 'What if a move climbs 1, 2 or 3 steps?', a: 'ways[i] = ways[i − 1] + ways[i − 2] + ways[i − 3], keeping the last three values. For any set of moves S it is a sum over S, O(n·|S|).' } },
      { ru: { q: 'n до 10¹⁸, ответ по модулю 10⁹ + 7?', a: 'Возведи матрицу [[1, 1], [1, 0]] в степень n быстрым возведением: O(log n) умножений матриц 2 × 2.' },
        en: { q: 'n up to 10¹⁸, answer modulo 10⁹ + 7?', a: 'Raise the matrix [[1, 1], [1, 0]] to the n-th power by repeated squaring: O(log n) multiplications of 2 × 2 matrices.' } },
      { ru: { q: 'Часть ступеней сломана, на них вставать нельзя?', a: 'ways[i] = 0 для сломанной ступени, остальная рекуррента та же. Две сломанные подряд обнуляют всё, что выше.' },
        en: { q: 'Some steps are broken and cannot be stepped on?', a: 'Set ways[i] = 0 on a broken step and keep the same recurrence. Two broken steps in a row zero out everything above them.' } },
    ],
    related: [
      { id: 'uniquePaths', ru: 'та же сумма двух соседних состояний, только на сетке', en: 'the same sum of two neighbouring states, on a grid' },
      { id: 'countBits', ru: 'ответ собирается из уже посчитанного меньшего', en: 'each answer is built from a smaller one already computed' },
    ],
  },

  coin: {
    tricky: [
      { input: { coins: '1, 5, 6', amount: '10' },
        ru: 'Жадность берёт 6 + 1 + 1 + 1 + 1 — пять монет, а таблица находит 5 + 5: ответ 2.',
        en: 'Greedy takes 6 + 1 + 1 + 1 + 1, five coins, while the table finds 5 + 5: the answer is 2.' },
      { input: { coins: '2', amount: '3' },
        ru: 'Сумму не собрать: dp[3] так и остаётся «бесконечностью» (amount + 1), и без проверки в конце вернётся 4 вместо −1.',
        en: 'The amount cannot be made: dp[3] stays at “infinity” (amount + 1), and without the final check you return 4 instead of −1.' },
      { input: { coins: '5', amount: '0' },
        ru: 'Нулевая сумма: ноль монет, ответ 0, а не −1 — dp[0] = 0 и есть база.',
        en: 'A zero amount needs zero coins: the answer is 0, not −1 — dp[0] = 0 is the base case.' },
    ],
    ops: {
      unit: { ru: 'попыток взять монету', en: 'coin tries' },
      naive: { ru: 'рекурсия без памяти', en: 'recursion without memo', count: p => coinNaiveTries(p.coins, p.amount) },
      ours: { ru: 'таблица', en: 'table', count: p => {
        let c = 0;
        for (let i = 1; i <= p.amount; i++) c += p.coins.filter(x => x <= i).length;
        return c;
      } },
    },
    predict: [
      { q: { ru: 'Можно ли собрать следующую сумму i из этих монет?', en: 'Can the next amount i be made from these coins?' },
        keys: { 'dp.ev.fill': { ru: 'да, берём лучший вариант', en: 'yes, take the best option' },
                'dp.ev.skip': { ru: 'нет, ни одна монета не подходит', en: 'no, no coin fits' } } },
    ],
    followups: [
      { ru: { q: 'А сколько способов набрать сумму, а не минимум монет?', a: 'Это Coin Change II: dp[i] += dp[i − c]. Внешний цикл — по монетам, внутренний — по суммам; если наоборот, посчитаешь перестановки, а не наборы.' },
        en: { q: 'What about the number of ways to make the amount, not the fewest coins?', a: 'That is Coin Change II: dp[i] += dp[i − c]. Loop over coins outside and amounts inside; the other way round counts orderings, not multisets.' } },
      { ru: { q: 'Как вернуть сами монеты?', a: 'Для каждой суммы запомни монету, давшую минимум, и иди от amount вниз: amount −= coin[amount]. Памяти столько же, O(amount).' },
        en: { q: 'How do you return the coins themselves?', a: 'For every amount remember the coin that gave the minimum, then walk down from amount: amount −= coin[amount]. Same O(amount) memory.' } },
      { ru: { q: 'amount = 10⁹, монет всего три?', a: 'Таблица не влезет: в общем случае задача NP-трудная, и O(amount·k) — псевдополиномиальное время. Жадность честна только для «канонических» наборов вроде 1, 2, 5, 10.' },
        en: { q: 'amount = 10⁹ with only three coins?', a: 'The table will not fit: in general the problem is NP-hard, and O(amount·k) is only pseudo-polynomial. Greedy is safe only for “canonical” systems such as 1, 2, 5, 10.' } },
    ],
    related: [
      { id: 'ladder', ru: 'наименьшее число шагов — это BFS по состояниям-остаткам', en: 'the fewest steps is a BFS over remaining amounts' },
      { id: 'coinOrder', ru: 'те же монеты, но считаем способы, и порядок циклов решает', en: 'same coins, but counting ways, where the loop order matters' },
    ],
  },

  lcs: {
    tricky: [
      { input: { a: 'abc', b: 'cba' },
        ru: 'Общих букв три, но порядок важен: подсчёт общих символов даст 3, а самая длинная общая подпоследовательность — 1.',
        en: 'They share three letters, but order matters: counting common characters gives 3, while the longest common subsequence is 1.' },
      { input: { a: '', b: 'abc' },
        ru: 'Пустая строка: таблица из одной нулевой строки, ни одной клетки не считается, ответ 0. Обращение к a[0] здесь падает.',
        en: 'An empty string: the table is a single zero row, no cell is computed, the answer is 0. Touching a[0] here crashes.' },
      { input: { a: 'abcdefg', b: 'hijklmn' },
        ru: 'Ни одной общей буквы: рекурсия без памяти ветвится на каждом несовпадении и делает 3431 сравнение, таблица — 49. Ответ 0.',
        en: 'Not a single common letter: recursion without a memo branches on every mismatch and makes 3431 comparisons, the table 49. The answer is 0.' },
    ],
    ops: {
      unit: { ru: 'сравнений символов', en: 'character comparisons' },
      naive: { ru: 'рекурсия без памяти', en: 'recursion without memo', count: p => treeCount(p.a.length, p.b.length,
        (i, j) => (p.a[i] === p.b[j] ? [[i + 1, j + 1]] : [[i + 1, j], [i, j + 1]])) },
      ours: { ru: 'таблица', en: 'table', count: p => p.a.length * p.b.length },
    },
    predict: [
      { q: { ru: 'Осталась ли в таблице непосчитанная клетка?', en: 'Is there a cell of the table left to fill?' },
        keys: { 'lcs.ev.cell': { ru: 'да, считаем следующую', en: 'yes, fill the next one' },
                'lcs.ev.done': { ru: 'нет, ответ в правом нижнем углу', en: 'no, the answer is in the bottom-right corner' } } },
    ],
    followups: [
      { ru: { q: 'Память O(min(n, m))?', a: 'Клетке нужны только текущая и предыдущая строки: храни две строки длины короткой строки или одну плюс переменную для диагонали.' },
        en: { q: 'O(min(n, m)) memory?', a: 'A cell needs only the current and the previous row: keep two rows as long as the shorter string, or one row plus a variable for the diagonal.' } },
      { ru: { q: 'Нужна сама подпоследовательность, а не длина?', a: 'Иди от dp[n][m] назад: совпадение — берёшь символ и шагаешь по диагонали, иначе — к большему соседу. С двумя строками таблицы так не выйдет: тогда алгоритм Хиршберга, O(nm) времени и O(n + m) памяти.' },
        en: { q: 'You need the subsequence itself, not its length?', a: 'Walk back from dp[n][m]: on a match take the character and go diagonally, otherwise go to the larger neighbour. With only two rows that is impossible; use Hirschberg’s algorithm, O(nm) time and O(n + m) memory.' } },
      { ru: { q: 'А для трёх строк?', a: 'Таблица становится трёхмерной: dp[i][j][k], O(n·m·k) времени. Попарные LCS не помогают — общая для пар не обязана быть общей для всех трёх.' },
        en: { q: 'And for three strings?', a: 'The table becomes three-dimensional: dp[i][j][k], O(n·m·k) time. Pairwise LCS does not help: what pairs share need not be shared by all three.' } },
    ],
    related: [
      { id: 'edit', ru: 'та же таблица префиксов, другие переходы', en: 'the same table of prefixes with different transitions' },
      { id: 'uniquePaths', ru: 'клетка зависит от верхней и левой соседки', en: 'a cell depends on its upper and left neighbours' },
    ],
  },

  lis: {
    tricky: [
      { input: { nums: '2, 2, 2' },
        ru: 'Строгий рост: с условием <code>&lt;=</code> получится 3, а равные числа подряд не растут — ответ 1.',
        en: 'Strict growth: with <code>&lt;=</code> you get 3, but equal numbers do not grow — the answer is 1.' },
      { input: { nums: '3, 4, 5, 1' },
        ru: 'Ответ — максимум по всему dp, а не dp последнего элемента: dp[3] = 1, а верный ответ 3.',
        en: 'The answer is the maximum over all of dp, not the last dp: dp[3] = 1, while the right answer is 3.' },
    ],
    ops: {
      unit: { ru: 'сравнений', en: 'comparisons' },
      naive: { ru: 'взять или пропустить', en: 'take or skip', count: p => lisNaiveCompares(p.nums) },
      ours: { ru: 'dp за n²', en: 'n² dp', count: p => p.nums.length * (p.nums.length - 1) / 2 },
    },
    predict: [
      { q: { ru: 'Есть ли ещё элемент, для которого нужен dp?', en: 'Is there another element that needs its dp?' },
        keys: { 'lis.ev.cell': { ru: 'да, считаем dp[i]', en: 'yes, compute dp[i]' },
                'lis.ev.done': { ru: 'нет, берём максимум dp', en: 'no, take the maximum dp' } } },
    ],
    followups: [
      { ru: { q: 'Быстрее, чем n²?', a: 'Массив tails: tails[k] — наименьший хвост возрастающей подпоследовательности длины k + 1. Для каждого x бинарным поиском найди первый ≥ x и замени его: O(n log n).' },
        en: { q: 'Faster than n²?', a: 'Keep tails: tails[k] is the smallest tail of an increasing subsequence of length k + 1. For each x binary-search the first value ≥ x and replace it: O(n log n).' } },
      { ru: { q: 'А неубывающая подпоследовательность?', a: 'В dp сравнение <code>nums[j] &lt;= nums[i]</code>, а в версии с tails ищешь первый элемент строго больше x (upper bound).' },
        en: { q: 'And a non-decreasing subsequence?', a: 'In the dp compare <code>nums[j] &lt;= nums[i]</code>; in the tails version search for the first value strictly greater than x (upper bound).' } },
      { ru: { q: 'Сколько всего самых длинных?', a: 'Рядом с dp храни cnt[i]: если dp[j] + 1 больше dp[i] — cnt[i] = cnt[j], если равно — cnt[i] += cnt[j]. Ответ — сумма cnt там, где dp максимален.' },
        en: { q: 'How many longest ones are there?', a: 'Keep cnt[i] next to dp: if dp[j] + 1 beats dp[i], cnt[i] = cnt[j]; if it ties, cnt[i] += cnt[j]. The answer sums cnt where dp is maximal.' } },
    ],
    related: [
      { id: 'lisTails', ru: 'та же задача за n log n — бинарный поиск по хвостам', en: 'the same problem in n log n with a binary search over tails' },
      { id: 'kadane', ru: 'тоже «лучшее, что кончается здесь», только подряд', en: 'also “the best that ends here”, but contiguous' },
    ],
  },

  edit: {
    tricky: [
      { input: { a: 'ab', b: 'ba' },
        ru: 'Перестановки соседей среди операций нет: «ab» → «ba» стоит 2 замены, а не 1.',
        en: 'Swapping neighbours is not an operation: “ab” → “ba” costs 2 replacements, not 1.' },
      { input: { a: '', b: 'abc' },
        ru: 'Пустое слово: ответ берётся из базовой строки dp[0][j] = j — три вставки. Забудешь её заполнить — вернёшь 0.',
        en: 'An empty word: the answer comes from the base row dp[0][j] = j, three inserts. Forget to fill it and you return 0.' },
      { input: { a: 'abc', b: 'abd' },
        ru: 'Формула n + m − 2·LCS считает только вставки и удаления и даёт 2, а одна замена c → d решает за 1.',
        en: 'The formula n + m − 2·LCS counts only inserts and deletes and gives 2, while a single replacement c → d does it in 1.' },
    ],
    ops: {
      unit: { ru: 'сравнений символов', en: 'character comparisons' },
      naive: { ru: 'рекурсия без памяти', en: 'recursion without memo', count: p => treeCount(p.a.length, p.b.length,
        (i, j) => (p.a[i] === p.b[j] ? [[i + 1, j + 1]] : [[i + 1, j], [i, j + 1], [i + 1, j + 1]])) },
      ours: { ru: 'таблица', en: 'table', count: p => p.a.length * p.b.length },
    },
    predict: [
      { q: { ru: 'Осталась ли в таблице непосчитанная клетка?', en: 'Is there a cell of the table left to fill?' },
        keys: { 'ed.ev.cell': { ru: 'да, считаем следующую', en: 'yes, fill the next one' },
                'ed.ev.done': { ru: 'нет, ответ в правом нижнем углу', en: 'no, the answer is in the bottom-right corner' } } },
    ],
    followups: [
      { ru: { q: 'У вставки, удаления и замены разные цены?', a: 'Переходы те же, только вместо +1 прибавляй цену своей операции; базовые строка и столбец — накопленные цены вставок и удалений.' },
        en: { q: 'Insert, delete and replace have different costs?', a: 'Same transitions, add each operation’s own cost instead of 1; the base row and column hold accumulated insert and delete costs.' } },
      { ru: { q: 'Разрешить обмен соседних букв за 1?', a: 'Это расстояние Дамерау — Левенштейна: добавь переход dp[i − 2][j − 2] + 1, когда a[i − 1] = b[j − 2] и a[i − 2] = b[j − 1].' },
        en: { q: 'Allow swapping two adjacent letters for 1?', a: 'That is the Damerau–Levenshtein distance: add the transition dp[i − 2][j − 2] + 1 when a[i − 1] = b[j − 2] and a[i − 2] = b[j − 1].' } },
      { ru: { q: 'Нужно только узнать, не больше ли расстояние k?', a: 'Клетки с |i − j| &gt; k заведомо дороже k — считай только полосу шириной 2k + 1: O(n·k) вместо O(n·m).' },
        en: { q: 'You only need to know whether the distance is at most k?', a: 'Cells with |i − j| &gt; k already cost more than k, so compute only a band of width 2k + 1: O(n·k) instead of O(n·m).' } },
    ],
    related: [
      { id: 'lcs', ru: 'та же таблица префиксов двух строк', en: 'the same table over prefixes of two strings' },
      { id: 'ladder', ru: 'превращение слова по одной букве, но поиском в ширину', en: 'turning one word into another letter by letter, via BFS' },
    ],
  },

  regex: {
    tricky: [
      { input: { s: 'aaa', p: 'a*a' },
        ru: 'Жадная звезда съедает все три a, и последней a в шаблоне нечего сопоставить — false. Таблица перебирает и «меньше повторов»: true.',
        en: 'A greedy star eats all three a’s and leaves the last a of the pattern with nothing — false. The table also tries fewer repeats: true.' },
      { input: { s: '', p: 'c*' },
        ru: 'Пустая строка совпадает с «c*» — звезда берёт ноль повторов. Это первая строка таблицы dp[0][j]; без неё ответ false.',
        en: 'The empty string matches “c*”: the star takes zero copies. That is the table’s first row dp[0][j]; without it you answer false.' },
      { input: { s: 'aaaaab', p: 'a*a*a*' },
        ru: 'Три звезды подряд и b в конце: откаты перебирают все способы поделить a между звёздами — 83 сравнения против 36 в таблице, и с длиной это растёт экспоненциально. Ответ false.',
        en: 'Three stars in a row and a b at the end: backtracking tries every way to share the a’s among the stars, 83 comparisons against 36 in the table, growing exponentially with length. The answer is false.' },
    ],
    ops: {
      unit: { ru: 'сравнений символов', en: 'character comparisons' },
      naive: { ru: 'перебор с откатами', en: 'backtracking', count: p => regexNaiveCompares(p.s, p.p) },
      ours: { ru: 'таблица', en: 'table', count: p => p.s.length * p.p.length },
    },
    predict: [
      { q: { ru: 'Осталась ли в таблице непосчитанная клетка?', en: 'Is there a cell of the table left to fill?' },
        keys: { 'rx.ev.cell': { ru: 'да, считаем следующую', en: 'yes, fill the next one' },
                'rx.ev.done': { ru: 'нет, ответ в правом нижнем углу', en: 'no, the answer is in the bottom-right corner' } } },
    ],
    followups: [
      { ru: { q: 'Рекурсия с мемоизацией вместо таблицы?', a: 'Те же состояния (i, j), O(|s|·|p|), но считаются только достижимые; зато глубина рекурсии до |s| + |p|.' },
        en: { q: 'Memoized recursion instead of the table?', a: 'Same (i, j) states and O(|s|·|p|), but only reachable ones get computed; the price is recursion depth up to |s| + |p|.' } },
      { ru: { q: 'Добавить «+» — один и больше повторов?', a: 'x+ — это xx*: перепиши шаблон до разбора, и таблица не меняется.' },
        en: { q: 'Add “+”, one or more copies?', a: 'x+ is xx*: rewrite the pattern before matching and the table stays the same.' } },
      { ru: { q: 'Совпадение с частью строки, а не со всей?', a: 'Допиши «.*» в начало и в конец шаблона — или разреши старт с любой позиции s и принимай любое i в последнем столбце.' },
        en: { q: 'Match a part of the string, not all of it?', a: 'Wrap the pattern in “.*” on both sides, or allow a start at any position of s and accept any i in the last column.' } },
    ],
    related: [
      { id: 'lcs', ru: 'таблица по префиксам строки и шаблона', en: 'a table over prefixes of the string and the pattern' },
      { id: 'wordSearch', ru: 'перебор с откатами, который здесь заменяет таблица', en: 'backtracking, which the table replaces here' },
    ],
  },

  kadane: {
    tricky: [
      { input: { nums: '-3, -1, -2' },
        ru: 'Все числа отрицательные: если начать <code>best</code> с 0, вернётся 0 — пустой подмассив, а верный ответ −1.',
        en: 'All numbers are negative: start <code>best</code> at 0 and you return 0, an empty subarray, while the answer is −1.' },
      { input: { nums: '2, -1, 2' },
        ru: 'Начинать заново на каждом отрицательном числе нельзя: отрезок 2, −1, 2 даёт 3, а «сброс на −1» оставит 2.',
        en: 'Do not restart on every negative number: the run 2, −1, 2 gives 3, while “restart at −1” stops at 2.' },
    ],
    ops: {
      unit: { ru: 'сложений', en: 'additions' },
      naive: { ru: 'все подмассивы', en: 'all subarrays', count: p => p.nums.length * (p.nums.length - 1) / 2 },
      ours: { ru: 'Кадане', en: 'Kadane', count: p => p.nums.length - 1 },
    },
    predict: [
      { q: { ru: 'Следующий x: продолжить отрезок или начать заново с x?', en: 'Next x: extend the run or restart at x?' },
        keys: { 'kad.ev.extend': { ru: 'продолжить отрезок', en: 'extend the run' },
                'kad.ev.restart': { ru: 'начать заново с x', en: 'restart at x' } } },
    ],
    followups: [
      { ru: { q: 'А если нужно вернуть сам подмассив?', a: 'Храни начало текущего отрезка (сдвигается при рестарте) и при обновлении best запоминай пару [начало, i].' },
        en: { q: 'What if you must return the subarray itself?', a: 'Keep the start of the current run (it moves on a restart), and whenever best improves remember the pair [start, i].' } },
      { ru: { q: 'Массив кольцевой (#918)?', a: 'Ответ — max(обычный Кадане, сумма всего − минимальный подмассив). Если все числа отрицательные, вторая часть даст пустой подмассив — тогда берём только первую.' },
        en: { q: 'The array is circular (#918)?', a: 'The answer is max(plain Kadane, total − minimum subarray). If every number is negative the second part means an empty subarray, so take only the first.' } },
      { ru: { q: 'Наибольшее произведение (#152)?', a: 'Держи и максимум, и минимум произведения, кончающегося здесь: отрицательное число меняет их ролями.' },
        en: { q: 'Largest product instead (#152)?', a: 'Track both the maximum and the minimum product ending here: a negative number swaps their roles.' } },
    ],
    related: [
      { id: 'stock', ru: 'та же схема: лучший результат, кончающийся здесь', en: 'same shape: the best result ending here' },
      { id: 'psum', ru: 'сумма отрезка — разность префиксных сумм', en: 'a range sum is a difference of prefix sums' },
    ],
  },

  /* ---------- bits ---------- */
  popcount: {
    tricky: [
      { input: { n: '4294967295' },
        ru: 'Все 32 бита — единицы. В C# как <code>int</code> это −1, и цикл с <code>n &gt;&gt; 1</code> вечно тянет знаковый бит; нужен <code>uint</code>. Ответ 32.',
        en: 'All 32 bits are set. As a C# <code>int</code> this is −1, and a loop on <code>n &gt;&gt; 1</code> keeps dragging the sign bit forever; use <code>uint</code>. The answer is 32.' },
      { input: { n: '0' },
        ru: 'Ноль: цикл не делает ни шага, ответ 0. Цикл do-while насчитал бы лишнюю единицу.',
        en: 'Zero: the loop never runs, the answer is 0. A do-while loop would count one too many.' },
    ],
    ops: {
      unit: { ru: 'шагов цикла', en: 'loop turns' },
      naive: { ru: 'все 32 бита', en: 'all 32 bits', count: () => 32 },
      ours: { ru: 'снятие младшей единицы', en: 'clearing the lowest one', count: p => ones(p.n) },
    },
    predict: [
      { q: { ru: 'x после снятия младшей единицы. Что дальше?', en: 'x after clearing its lowest one. What next?' },
        keys: { 'pop.ev.minus': { ru: 'x ≠ 0, ещё круг', en: 'x ≠ 0, one more turn' },
                'pop.ev.done': { ru: 'x = 0, единиц было несколько', en: 'x = 0, there were several ones' },
                'pop.ev.pow2': { ru: 'x = 0, единица была одна — степень двойки', en: 'x = 0, a single one: a power of two' } } },
    ],
    followups: [
      { ru: { q: 'Без цикла вообще?', a: 'SWAR: x − ((x &gt;&gt; 1) &amp; 0x55555555), затем суммы по 4 и 8 битов масками и умножение на 0x01010101 со сдвигом на 24 — около 12 операций на любое число.' },
        en: { q: 'With no loop at all?', a: 'SWAR: x − ((x &gt;&gt; 1) &amp; 0x55555555), then sums over 4 and 8 bits with masks and a multiply by 0x01010101 shifted right by 24: about 12 operations for any value.' } },
      { ru: { q: 'Как на практике в .NET?', a: '<code>BitOperations.PopCount</code> — на x86 с POPCNT это одна инструкция; ручной цикл нужен только на собеседовании.' },
        en: { q: 'What do you use in .NET in practice?', a: '<code>BitOperations.PopCount</code>: on x86 with POPCNT it is a single instruction; the hand-written loop is for interviews.' } },
      { ru: { q: 'Расстояние Хэмминга двух чисел?', a: 'popcount(a ^ b): XOR оставляет единицы ровно там, где биты различаются.' },
        en: { q: 'The Hamming distance of two numbers?', a: 'popcount(a ^ b): XOR leaves ones exactly where the bits differ.' } },
    ],
    related: [
      { id: 'countBits', ru: 'то же число единиц, но сразу для всех 0..n', en: 'the same count of ones, for all of 0..n at once' },
      { id: 'singleIII', ru: 'родственный приём: x and −x оставляет младшую единицу', en: 'a sibling trick: x and −x keeps the lowest one' },
    ],
  },

  missingXor: {
    tricky: [
      { input: { nums: '0, 1, 2' },
        ru: 'Пропало само n = 3. Если начать XOR с 0, а не с n, вернётся 0 — у n нет своего индекса.',
        en: 'The missing one is n = 3 itself. Start the XOR at 0 instead of n and you return 0: n has no index of its own.' },
      { input: { nums: '1' },
        ru: 'Пропал ноль: ответ 0. Код, который считает 0 признаком «не нашли», здесь сломается.',
        en: 'Zero is missing: the answer is 0. Code that treats 0 as “not found” breaks here.' },
    ],
    ops: {
      unit: { ru: 'чтений массива', en: 'array reads' },
      naive: { ru: 'поиск каждого числа', en: 'search for each number', count: p => {
        let reads = 0;
        for (let v = 0; v <= p.nums.length; v++) {
          const at = p.nums.indexOf(v);
          if (at < 0) return reads + p.nums.length;
          reads += at + 1;
        }
        return reads;
      } },
      ours: { ru: 'один XOR-проход', en: 'one XOR pass', count: p => p.nums.length },
    },
    predict: [
      { q: { ru: 'Индекс i и значение v уходят в XOR. Что с ними станет?', en: 'Index i and value v go into the XOR. What happens to them?' },
        keys: { 'mis.ev.meet': { ru: 'кто-то встретил пару и погас', en: 'one of them meets its pair and cancels' },
                'mis.ev.wait': { ru: 'оба ждут своей пары', en: 'both wait for their pair' },
                'mis.ev.self': { ru: 'v = i, гасят друг друга сразу', en: 'v = i, they cancel at once' } } },
    ],
    followups: [
      { ru: { q: 'Пропали два числа?', a: 'XOR всего даёт a ^ b. Раздели числа по младшему различающемуся биту (x &amp; −x) и посчитай XOR в каждой группе отдельно — как в Single Number III.' },
        en: { q: 'Two numbers are missing?', a: 'The XOR of everything gives a ^ b. Split the numbers by their lowest differing bit (x &amp; −x) and XOR each group separately, as in Single Number III.' } },
      { ru: { q: 'Массив отсортирован?', a: 'Бинарный поиск первого i, где nums[i] ≠ i: O(log n) вместо O(n).' },
        en: { q: 'The array is sorted?', a: 'Binary-search the first i with nums[i] ≠ i: O(log n) instead of O(n).' } },
      { ru: { q: 'Массив можно менять?', a: 'Циклическая сортировка: ставь каждое v на индекс v, затем первый i, где nums[i] ≠ i, и есть ответ. Тоже O(n) и O(1) — так решают First Missing Positive.' },
        en: { q: 'May you modify the array?', a: 'Cyclic sort: put every v at index v, then the first i with nums[i] ≠ i is the answer. Also O(n) and O(1), the way First Missing Positive is solved.' } },
    ],
    related: [
      { id: 'firstMissing', ru: 'тоже ищем пропуск за O(1) памяти, но разметкой по индексам', en: 'also finds a gap in O(1) memory, by marking indices' },
      { id: 'singleIII', ru: 'пары гасят друг друга в XOR', en: 'pairs cancel each other in XOR' },
    ],
  },

  singleIII: {
    tricky: [
      { input: { nums: '0, 4, 2, 2' },
        ru: 'Одно из одиночных — ноль: ответ [0, 4]. Если считать 0 в группе «не найдено», потеряешь его.',
        en: 'One of the singles is zero: the answer is [0, 4]. Treat 0 in a group as “not found” and you lose it.' },
      { input: { nums: '-3, 5, 7, 7' },
        ru: 'Отрицательное число: x = −3 ^ 5 = −8, младший бит x &amp; −x = 8 — делить можно по любому биту, знак не мешает. Ответ [−3, 5].',
        en: 'A negative number: x = −3 ^ 5 = −8, its lowest bit x &amp; −x = 8; any set bit splits, the sign does not matter. The answer is [−3, 5].' },
    ],
    ops: {
      unit: { ru: 'чтений массива', en: 'array reads' },
      naive: { ru: 'искать пару каждому', en: 'look for a pair for each', count: p => {
        let reads = 0;
        p.nums.forEach((v, i) => {
          for (let j = 0; j < p.nums.length; j++) {
            if (j === i) continue;
            reads++;
            if (p.nums[j] === v) break;
          }
        });
        return reads;
      } },
      ours: { ru: 'два XOR-прохода', en: 'two XOR passes', count: p => 2 * p.nums.length },
    },
    predict: [
      { q: { ru: 'Число v уходит в XOR. Это первая встреча или вторая?', en: 'v goes into the XOR. Is this its first or second appearance?' },
        keys: { 'sn3.ev.fold': { ru: 'первая — v остаётся в x', en: 'first: v stays in x' },
                'sn3.ev.cancel': { ru: 'вторая — пара гаснет', en: 'second: the pair cancels' } } },
      { q: { ru: 'В какую группу попадёт следующее число?', en: 'Which group does the next number go to?' },
        keys: { 'sn3.ev.one': { ru: 'бит стоит — в группу a', en: 'the bit is set: group a' },
                'sn3.ev.zero': { ru: 'бита нет — в группу b', en: 'the bit is clear: group b' } } },
    ],
    followups: [
      { ru: { q: 'Все остальные встречаются трижды, одиночное одно (#137)?', a: 'XOR не помогает. Считай по каждому из 32 битов сумму по модулю 3 — остаток и есть бит ответа; или автомат из двух масок ones/twos.' },
        en: { q: 'Every other number appears three times and one appears once (#137)?', a: 'XOR does not help. For each of the 32 bits sum it modulo 3 — the remainder is the answer’s bit; or use the two-mask ones/twos automaton.' } },
      { ru: { q: 'Почему именно x &amp; −x, а не любой бит?', a: 'Подходит любая единица x, младшая просто достаётся одной операцией. Для int.MinValue в unchecked −x = x, и результат всё равно верный — сам старший бит.' },
        en: { q: 'Why x &amp; −x and not any bit?', a: 'Any set bit of x works; the lowest just costs one operation. For int.MinValue in unchecked code −x = x, and the result is still right: the top bit itself.' } },
      { ru: { q: 'Числа идут потоком, второго прохода нет?', a: 'Без памяти не выйдет: разделяющий бит известен только в конце. Придётся хранить множество ещё не встреченных пар, O(k).' },
        en: { q: 'The numbers arrive as a stream with no second pass?', a: 'Not without memory: the splitting bit is known only at the end. You have to keep a set of unmatched values, O(k).' } },
    ],
    related: [
      { id: 'missingXor', ru: 'то же гашение пар в XOR', en: 'the same pair cancellation in XOR' },
      { id: 'dup', ru: 'решение «в лоб» — множество встреченных', en: 'the brute-force way: a set of seen values' },
    ],
  },

  countBits: {
    tricky: [
      { input: { n: '0' },
        ru: 'n = 0: массив из одного нуля, цикл с 1 не идёт. Код, который заранее пишет bits[1] = 1, выйдет за границу.',
        en: 'n = 0: an array of a single zero, the loop from 1 never runs. Code that sets bits[1] = 1 up front writes out of bounds.' },
      { input: { n: '32' },
        ru: 'У степеней двойки одна единица: bits[32] = bits[16] + 0 = … = bits[1] = 1. Рекуррента bits[i − 1] + 1 даст здесь 6.',
        en: 'Powers of two have a single one: bits[32] = bits[16] + 0 = … = bits[1] = 1. The recurrence bits[i − 1] + 1 gives 6 here.' },
    ],
    ops: {
      unit: { ru: 'шагов цикла', en: 'loop turns' },
      naive: { ru: 'сдвигами каждое число', en: 'shift each number', count: p => {
        let turns = 0;
        for (let i = 1; i <= p.n; i++) turns += bitLength(i);
        return turns;
      } },
      ours: { ru: 'из ответа для i / 2', en: 'from the answer for i / 2', count: p => p.n },
    },
    predict: [
      { q: { ru: 'Какое число i следующее: нечётное, чётное или степень двойки?', en: 'What is the next i: odd, even, or a power of two?' },
        keys: { 'cb.ev.odd': { ru: 'нечётное: на 1 больше, чем у i / 2', en: 'odd: one more than i / 2' },
                'cb.ev.even': { ru: 'чётное: столько же, сколько у i / 2', en: 'even: the same as i / 2' },
                'cb.ev.pow': { ru: 'степень двойки: одна единица', en: 'a power of two: a single one' } } },
    ],
    followups: [
      { ru: { q: 'Есть другая рекуррента?', a: 'bits[i] = bits[i &amp; (i − 1)] + 1: i &amp; (i − 1) — то же число без младшей единицы, и оно меньше i.' },
        en: { q: 'Is there another recurrence?', a: 'bits[i] = bits[i &amp; (i − 1)] + 1: i &amp; (i − 1) is i without its lowest one, and it is smaller than i.' } },
      { ru: { q: 'Нужна только сумма единиц всех чисел 0..n?', a: 'Без массива, по битам: бит k даёт 2^k единиц на каждый полный блок длины 2^(k+1) и max(0, остаток − 2^k) в неполном. O(log n).' },
        en: { q: 'You only need the total number of ones over 0..n?', a: 'No array, bit by bit: bit k gives 2^k ones per full block of length 2^(k+1), plus max(0, remainder − 2^k) in the partial one. O(log n).' } },
    ],
    related: [
      { id: 'popcount', ru: 'то же число единиц, но для одного числа', en: 'the same count of ones, for a single number' },
      { id: 'climb', ru: 'ответ строится из уже посчитанного меньшего', en: 'each answer is built from a smaller one already computed' },
    ],
  },

  sumBits: {
    tricky: [
      { input: { a: '-1', b: '1' },
        ru: 'Перенос ползёт через все 32 разряда и в конце вываливается за 31-й бит — 32 раунда, ответ 0. В Python с бесконечными целыми цикл без маски не кончится.',
        en: 'The carry crawls through all 32 bits and finally falls off bit 31: 32 rounds, the answer is 0. In Python, with unbounded integers, the loop never ends without a mask.' },
      { input: { a: '0', b: '0' },
        ru: 'b = 0 с самого начала: цикл не делает ни шага, ответ 0.',
        en: 'b = 0 from the start: the loop never runs, the answer is 0.' },
    ],
    ops: {
      unit: { ru: 'шагов', en: 'steps' },
      naive: { ru: 'по разряду за шаг', en: 'one column per step', count: () => 32 },
      ours: { ru: 'пока есть перенос', en: 'while a carry is left', count: p => {
        let a = p.a | 0, b = p.b | 0, rounds = 0;
        while (b !== 0) { [a, b] = [a ^ b, (a & b) << 1]; rounds++; }
        return rounds;
      } },
    },
    predict: [
      { q: { ru: 'Что покажут общие единицы a и b в этом раунде?', en: 'What do the shared ones of a and b show this round?' },
        keys: { 'sum.ev.carry': { ru: 'есть перенос, ещё раунд', en: 'a carry, one more round' },
                'sum.ev.nocarry': { ru: 'переносов нет, готово', en: 'no carry, done' },
                'sum.ev.drop': { ru: 'перенос вылетает за 31-й бит', en: 'a carry falls off bit 31' } } },
    ],
    followups: [
      { ru: { q: 'А вычитание без минуса?', a: 'a − b = a + (~b + 1): то же сложение с дополнительным кодом b.' },
        en: { q: 'And subtraction without a minus?', a: 'a − b = a + (~b + 1): the same addition with b’s two’s complement.' } },
      { ru: { q: 'Умножение без *?', a: 'Сдвиги и сложения: для каждой единицы в b прибавь a &lt;&lt; k — «крестьянское» умножение, до 32 сложений.' },
        en: { q: 'Multiplication without *?', a: 'Shifts and additions: for every one bit k of b add a &lt;&lt; k — peasant multiplication, at most 32 additions.' } },
      { ru: { q: 'Сколько раундов в худшем случае?', a: 'До 32: каждый раунд сдвигает перенос минимум на разряд влево, и через 32 раунда он покидает слово.' },
        en: { q: 'How many rounds in the worst case?', a: 'Up to 32: each round moves the carry at least one column left, and after 32 rounds it leaves the word.' } },
    ],
    related: [
      { id: 'divideBits', ru: 'деление тоже собирают из сдвигов', en: 'division is also built from shifts' },
      { id: 'popcount', ru: 'ещё одна работа с битами по раундам', en: 'more round-by-round bit work' },
    ],
  },

  maxXorLimit: {
    tricky: [
      { input: { nums: '0, 7', queries: '5 0' },
        ru: 'Лимит m = 0, но число 0 в массиве есть: ответ 5 XOR 0 = 5. Кто читает «m = 0» как «ничего нет», вернёт −1.',
        en: 'The limit is m = 0, but 0 is in the array: the answer is 5 XOR 0 = 5. Read “m = 0” as “nothing” and you return −1.' },
      { input: { nums: '1, 6', queries: '1 7 | 1 2' },
        ru: 'Запросы сортируются по m, но ответы должны вернуться в исходном порядке: [7, 0], а не наоборот.',
        en: 'Queries are sorted by m, but answers must come back in the original order: [7, 0], not reversed.' },
    ],
    ops: {
      unit: { ru: 'элементарных шагов', en: 'elementary steps' },
      naive: { ru: 'перебор чисел на запрос', en: 'scan all numbers per query', count: p => p.nums.length * p.queries.length },
      ours: { ru: 'бор по битам', en: 'bitwise trie', count: p => {
        const top = Math.max(0, 31 - Math.clz32(Math.max(...p.nums, ...p.queries.map(q => q[0])))), levels = top + 1;
        const maxM = Math.max(...p.queries.map(q => q[1]));
        const inserted = p.nums.filter(v => v <= maxM).length, answered = p.queries.filter(q => p.nums.some(v => v <= q[1])).length;
        return (inserted + answered) * levels;
      } },
    },
    predict: [
      { q: { ru: 'Есть ли префикс с противоположным битом?', en: 'Is there a prefix with the opposite bit?' },
        keys: { 'mxl.ev.take': { ru: 'есть — бит ответа 1', en: 'yes: the answer bit is 1' },
                'mxl.ev.same': { ru: 'нет — идём туда же, бит 0', en: 'no: go the same way, bit 0' } } },
      { q: { ru: 'Новый запрос: что с набором чисел ≤ m?', en: 'A new query: what about the set of numbers ≤ m?' },
        keys: { 'mxl.ev.insert': { ru: 'добавятся новые числа', en: 'new numbers join' },
                'mxl.ev.keep': { ru: 'набор не меняется', en: 'the set stays as is' },
                'mxl.ev.empty': { ru: 'чисел ≤ m нет, ответ −1', en: 'no numbers ≤ m, the answer is −1' } } },
    ],
    followups: [
      { ru: { q: 'Запросы приходят онлайн, сортировать нельзя?', a: 'Вставь все числа сразу и храни в каждом узле бора минимум его поддерева: в ветку, где минимум больше m, не заходи.' },
        en: { q: 'Queries arrive online and cannot be sorted?', a: 'Insert every number up front and store the subtree minimum in each trie node: never step into a branch whose minimum exceeds m.' } },
      { ru: { q: 'Максимальный XOR двух чисел массива (#421)?', a: 'Тот же бор без лимита: вставляй числа и для каждого спускайся по противоположным битам, O(n·B).' },
        en: { q: 'Maximum XOR of two numbers in an array (#421)?', a: 'The same trie without a limit: insert the numbers and walk opposite bits for each, O(n·B).' } },
      { ru: { q: 'Числа ещё и удаляются?', a: 'Счётчик в каждом узле: вставка +1 по пути, удаление −1, а ходить можно только в узлы с ненулевым счётчиком.' },
        en: { q: 'Numbers can also be removed?', a: 'Keep a counter per node: +1 along the path on insert, −1 on removal, and only step into nodes whose counter is non-zero.' } },
    ],
    related: [
      { id: 'trie', ru: 'тот же бор, только алфавит из двух букв', en: 'the same trie with a two-letter alphabet' },
      { id: 'kruskal', ru: 'тоже обработка по возрастанию: сначала дешёвое, растущее множество', en: 'also processing in increasing order over a growing set' },
    ],
  },

  reverseBits: {
    tricky: [
      { input: { n: '1', mode: 'loop' },
        ru: 'Выйти из цикла, когда n стало 0, нельзя: единица должна доехать до 31-го бита. Ответ 2147483648, а не 1.',
        en: 'You cannot leave the loop once n becomes 0: the one has to travel up to bit 31. The answer is 2147483648, not 1.' },
      { input: { n: '2147483648', mode: 'masks' },
        ru: 'Только старший бит: ответ 1. Со знаковым <code>int</code> сдвиг <code>&gt;&gt;</code> размножит знак, и уже первый обмен половин даст 0xFFFF8000 — нужен <code>uint</code>.',
        en: 'Only the top bit is set: the answer is 1. With a signed <code>int</code> the <code>&gt;&gt;</code> shift copies the sign, and the very first swap of halves yields 0xFFFF8000; use <code>uint</code>.' },
    ],
    ops: {
      unit: { ru: 'шагов', en: 'steps' },
      naive: { ru: 'цикл по 32 битам', en: 'a loop over 32 bits', count: () => 32 },
      ours: { ru: 'пять обменов масками', en: 'five mask swaps', count: () => 5 },
    },
    predict: [
      { q: { ru: 'Какой бит n уходит в r на этом шаге?', en: 'Which bit of n goes into r on this step?' },
        keys: { 'rb.ev.one': { ru: 'единица', en: 'a one' },
                'rb.ev.zero': { ru: 'ноль', en: 'a zero' },
                'rb.ev.pad': { ru: 'n уже 0 — дописываем нули', en: 'n is 0 already: pad with zeros' } } },
    ],
    followups: [
      { ru: { q: 'Функцию зовут миллионы раз?', a: 'Таблица разворота байта на 256 значений: 4 обращения и сборка байтов в обратном порядке. Или аппаратная инструкция, где она есть (RBIT на ARM).' },
        en: { q: 'The function is called millions of times?', a: 'A 256-entry byte-reversal table: 4 lookups and the bytes assembled in reverse order. Or a hardware instruction where there is one (RBIT on ARM).' } },
      { ru: { q: 'А для 64 битов?', a: 'Маски шириной 64 и ещё один обмен половинами по 32: log₂ 64 = 6 шагов вместо 5.' },
        en: { q: 'And for 64 bits?', a: '64-bit masks plus one more swap of 32-bit halves: log₂ 64 = 6 steps instead of 5.' } },
      { ru: { q: 'Проверить, палиндром ли двоичная запись n?', a: 'Разверни и сдвинь вправо на 32 − длина записи; палиндром, если получилось само n.' },
        en: { q: 'Check whether n’s binary form is a palindrome?', a: 'Reverse it and shift right by 32 − the length of the binary form; it is a palindrome if you get n back.' } },
    ],
    related: [
      { id: 'popcount', ru: 'те же маски 0x5555…, 0x3333… считают единицы', en: 'the same 0x5555…, 0x3333… masks count ones' },
      { id: 'reverse', ru: 'разворот по шагам, только у списка', en: 'step-by-step reversal, of a list' },
    ],
  },

  /* ---------- games ---------- */
  astar: {
    tricky: [
      { input: { grid: '0', h: 'chebyshev' },
        ru: 'Сетка 1 × 1: старт и есть финиш. Длина считается в клетках, поэтому ответ 1, а не 0.',
        en: 'A 1 × 1 grid: the start is the goal. Length counts cells, so the answer is 1, not 0.' },
      { input: { grid: '000 010 001', h: 'chebyshev' },
        ru: 'Финиш занят: путь не нужен вовсе, ответ −1 — проверь углы до запуска поиска.',
        en: 'The goal cell is blocked: no search is needed at all, the answer is −1. Check the corners before searching.' },
      { input: { grid: '0000 0110 0000 0000', h: 'manhattan' },
        ru: 'Манхэттен считает диагональный шаг за два и переоценивает: A* закрывает клетку слишком рано и находит путь из 6 клеток, а кратчайший — 5.',
        en: 'Manhattan counts a diagonal step as two and overestimates: A* closes a cell too early and finds a 6-cell path, while the shortest has 5.' },
    ],
    ops: {
      unit: { ru: 'раскрытых клеток', en: 'cells expanded' },
      naive: { ru: 'BFS', en: 'BFS', count: p => bfs8Dequeued(p.grid) },
      ours: { ru: 'A*', en: 'A*', count: p => astarExpanded(p.grid, p.h) },
    },
    predict: [
      { q: { ru: 'Клетка раскрыта. Что найдётся среди её соседей?', en: 'The cell is expanded. What will its neighbours bring?' },
        keys: { 'ast.ev.open': { ru: 'новые клетки в открытый список', en: 'new cells for the open list' },
                'ast.ev.relax': { ru: 'путь короче к уже открытой', en: 'a shorter path to an open cell' },
                'ast.ev.closed': { ru: 'только закрытые клетки', en: 'only closed cells' },
                'ast.ev.dead': { ru: 'ничего — тупик', en: 'nothing: a dead end' } } },
      { q: { ru: 'Верх кучи: свежая запись или устаревшая?', en: 'The top of the heap: a fresh entry or a stale one?' },
        keys: { 'ast.ev.pop': { ru: 'свежая — раскрываем', en: 'fresh: expand it' },
                'ast.ev.stale': { ru: 'клетка уже закрыта — выбрасываем', en: 'the cell is closed already: drop it' } } },
    ],
    followups: [
      { ru: { q: 'Когда A* вернёт не кратчайший путь?', a: 'Когда h переоценивает расстояние, например Манхэттен при диагональных ходах: клетка закрывается слишком рано. Допустимая и согласованная h такого не допускает.' },
        en: { q: 'When does A* return a path that is not the shortest?', a: 'When h overestimates, e.g. Manhattan with diagonal moves: a cell gets closed too early. An admissible, consistent h rules that out.' } },
      { ru: { q: 'У клеток разная цена — болото, дорога?', a: 'g растёт на цену клетки, а h умножай на самую дешёвую цену шага, иначе она перестанет быть допустимой.' },
        en: { q: 'Cells have different costs — swamp, road?', a: 'g grows by the cell’s cost, and h must be scaled by the cheapest step cost, or it stops being admissible.' } },
      { ru: { q: 'Сотня юнитов идёт к одной цели?', a: 'Сто поисков A* — дорого; одна волна Дейкстры от цели (flow field) обслужит всех за O(1) на юнита в кадр.' },
        en: { q: 'A hundred units head to the same goal?', a: 'A hundred A* searches are expensive; one Dijkstra wave from the goal (a flow field) serves them all at O(1) per unit per frame.' } },
    ],
    related: [
      { id: 'networkDelay', ru: 'A* с h = 0 — это Дейкстра', en: 'A* with h = 0 is Dijkstra' },
      { id: 'obstacles', ru: 'кратчайший путь по сетке с препятствиями', en: 'a shortest path on a grid with obstacles' },
      { id: 'flowField', ru: 'одна волна от цели вместо поиска на каждого юнита', en: 'one wave from the goal instead of a search per unit' },
    ],
  },

  flowField: {
    tricky: [
      { input: { cost: '1101 1101 1101', goals: '0 0' },
        ru: 'Правый столбец отрезан стенами: волна до него не доходит, стрелок там нет. Ждать, что у каждой клетки будет стрелка, — ошибка.',
        en: 'The right column is cut off by walls: the wave never reaches it, so it gets no arrows. Expecting an arrow on every cell is a bug.' },
      { input: { cost: '11111 11111', goals: '0 0 | 1 4' },
        ru: 'Две цели: волна идёт от обеих сразу, и каждая клетка смотрит к ближайшей. Поле из одной цели здесь не годится.',
        en: 'Two goals: the wave starts from both at once, and each cell points to the nearer one. A field from a single goal does not do here.' },
      { input: { cost: '191 111', goals: '0 0' },
        ru: 'Через девятку дороже: клетка (0, 2) смотрит вниз, в обход — путь стоит 4, а налево через 9 стоил бы 10.',
        en: 'Crossing the nine costs more: cell (0, 2) points down and around, a path of cost 4, while going left through the 9 would cost 10.' },
    ],
    ops: {
      unit: { ru: 'извлечений из очереди', en: 'queue pops' },
      naive: { ru: 'поиск от каждой клетки', en: 'a search from every cell', count: p => flowNaivePops(p.cost, p.goals) },
      ours: { ru: 'одна волна от целей', en: 'one wave from the goals', count: p => flowReachable(p.cost, p.goals) },
    },
    predict: [
      { q: { ru: 'Клетка вынута из очереди. Достанет ли она кого-то нового?', en: 'A cell comes off the queue. Will it reach anyone new?' },
        keys: { 'ff.ev.relax': { ru: 'да, соседи получат цену', en: 'yes, neighbours get a cost' },
                'ff.ev.settle': { ru: 'нет, все соседи уже посчитаны', en: 'no, all neighbours are done' } } },
    ],
    followups: [
      { ru: { q: 'Цель двигается каждый кадр?', a: 'Пересчитывай поле не каждый кадр, а раз в N кадров или при смещении цели на клетку; для одного юнита дешевле обычный A*.' },
        en: { q: 'The goal moves every frame?', a: 'Rebuild the field every N frames or when the goal changes cell, not every frame; for a single unit a plain A* is cheaper.' } },
      { ru: { q: 'Карта 1000 × 1000?', a: 'Иерархия: карта режется на сектора, сверху — граф порталов между ними, а поля строятся лениво только в секторах на пути.' },
        en: { q: 'A 1000 × 1000 map?', a: 'Go hierarchical: split the map into sectors with a portal graph on top, and build fields lazily only in the sectors on the way.' } },
      { ru: { q: 'А если цена висит на переходе, а не на клетке?', a: 'Тогда первая запись уже не окончательна: нужна обычная Дейкстра с пропуском устаревших записей в куче.' },
        en: { q: 'What if the cost sits on the move, not on the cell?', a: 'Then the first write is no longer final: you need a regular Dijkstra that skips stale heap entries.' } },
    ],
    related: [
      { id: 'nearestZero', ru: 'та же волна от многих источников сразу', en: 'the same wave from many sources at once' },
      { id: 'oranges', ru: 'многоисточниковый BFS по сетке', en: 'a multi-source BFS on a grid' },
    ],
  },

  spatialGrid: {
    tricky: [
      { input: { points: '3 0 | 0 0', queries: '0 0 3', cell: '3' },
        ru: 'Точка (3, 0) лежит ровно на окружности и в соседней клетке: условие ≤ r² и окно 3 × 3 её ловят, ответ [2]. С «&lt;» вышло бы 1.',
        en: 'Point (3, 0) lies exactly on the circle and in the next cell: the ≤ r² test and the 3 × 3 window catch it, the answer is [2]. With “&lt;” you get 1.' },
      { input: { points: '1 1 | 5 5', queries: '0 0 2', cell: '2' },
        ru: 'Запрос у края мира: клетки с отрицательным номером пропускаются, а не дают исключение. Ответ [1].',
        en: 'A query at the edge of the world: cells with a negative index are skipped, not a crash. The answer is [1].' },
    ],
    ops: {
      unit: { ru: 'проверок расстояния', en: 'distance checks' },
      naive: { ru: 'все точки на запрос', en: 'every point per query', count: p => p.points.length * p.queries.length },
      ours: { ru: 'окно 3 × 3 клеток', en: 'a 3 × 3 window of cells', count: p => gridChecks(p.points, p.queries, p.cell) },
    },
    predict: [
      { q: { ru: 'В какую клетку ляжет следующая точка?', en: 'Which cell does the next point land in?' },
        keys: { 'sg.ev.newCell': { ru: 'в новую клетку', en: 'a new cell' },
                'sg.ev.put': { ru: 'в уже занятую', en: 'an occupied one' } } },
      { q: { ru: 'Следующая клетка окна: что в ней?', en: 'The next cell of the window: what is in it?' },
        keys: { 'sg.ev.hit': { ru: 'есть точки внутри круга', en: 'points inside the circle' },
                'sg.ev.miss': { ru: 'точки есть, но все мимо', en: 'points, all outside' },
                'sg.ev.empty': { ru: 'пусто', en: 'empty' } } },
    ],
    followups: [
      { ru: { q: 'Радиусы сильно разные?', a: 'Клетка по самому большому радиусу превращает поиск в перебор. Бери клетку по типичному радиусу и смотри (2⌈r / cell⌉ + 1)² клеток — или квадродерево.' },
        en: { q: 'Radii vary a lot?', a: 'A cell sized for the largest radius turns the search back into brute force. Size cells for a typical radius and scan (2⌈r / cell⌉ + 1)² cells, or use a quadtree.' } },
      { ru: { q: 'Тысяча юнитов двигаются каждый кадр?', a: 'Пересобирай сетку целиком: O(n) на кадр обычно дешевле точечных обновлений. Плотный массив клеток вместо словаря экономит хеширование.' },
        en: { q: 'A thousand units move every frame?', a: 'Rebuild the grid from scratch: O(n) per frame is usually cheaper than point updates. A dense cell array instead of a dictionary saves the hashing.' } },
      { ru: { q: 'Мир с отрицательными координатами?', a: 'Номер клетки — <code>Mathf.FloorToInt(x / cell)</code>: целочисленное деление округляет к нулю и склеивает клетки −1 и 0.' },
        en: { q: 'A world with negative coordinates?', a: 'The cell index is <code>Mathf.FloorToInt(x / cell)</code>: integer division rounds towards zero and merges cells −1 and 0.' } },
    ],
    related: [
      { id: 'kClosest', ru: 'ближайшие точки, но через кучу', en: 'nearest points, via a heap' },
      { id: 'anagram', ru: 'ключ корзины вместо попарного сравнения', en: 'a bucket key instead of pairwise comparison' },
    ],
  },

  unionFind: {
    tricky: [
      { input: { edges: '1 2 | 2 3 | 1 3 | 3 4' },
        ru: 'Цикл замыкается третьим ребром, а не последним: ответ [1, 3]. «Вернуть последнее ребро списка» даст [3, 4] — мост, без которого 4 отвалится.',
        en: 'The cycle closes with the third edge, not the last: the answer is [1, 3]. “Return the last edge” gives [3, 4], a bridge that would cut off 4.' },
      { input: { edges: '3 1 | 2 3 | 1 2' },
        ru: 'Вершины в ребре не по порядку — для неориентированного графа это всё равно: ответ [1, 2].',
        en: 'The endpoints are not in order, which does not matter for an undirected graph: the answer is [1, 2].' },
    ],
    ops: {
      unit: { ru: 'посещений вершин', en: 'vertex visits' },
      naive: { ru: 'обход графа на каждое ребро', en: 'a graph search per edge', count: p => redundantNaive(p.edges) },
      ours: { ru: 'find со сжатием', en: 'find with compression', count: p => redundantDsu(p.edges) },
    },
    predict: [
      { q: { ru: 'Корни концов ребра найдены. Что дальше?', en: 'Both roots are found. What next?' },
        keys: { 'uf.ev.union': { ru: 'разные корни: низкое дерево под высокое', en: 'different roots: the lower tree goes under' },
                'uf.ev.tie': { ru: 'разные корни, ранги равны: ранг +1', en: 'different roots, equal ranks: rank + 1' },
                'uf.ev.cycle': { ru: 'общий корень: ребро лишнее', en: 'a shared root: the edge is redundant' } } },
    ],
    followups: [
      { ru: { q: 'Граф ориентированный (#685)?', a: 'Сначала ищи вершину с двумя родителями: лишнее ребро — одно из двух входящих в неё; если такой нет — ребро, замкнувшее цикл.' },
        en: { q: 'The graph is directed (#685)?', a: 'First look for a vertex with two parents: the extra edge is one of its two incoming edges; if there is none, it is the edge that closes a cycle.' } },
      { ru: { q: 'Зачем ранг, если есть сжатие пути?', a: 'Каждое по отдельности даёт O(log n) амортизированно, а вместе — α(n), практически константу.' },
        en: { q: 'Why union by rank if you already compress paths?', a: 'Each alone gives O(log n) amortized; together they give α(n), effectively a constant.' } },
      { ru: { q: 'Рёбра ещё и удаляются?', a: 'DSU не умеет разъединять. Офлайн — иди по запросам с конца и добавляй вместо удаления; онлайн — DSU с откатами без сжатия пути.' },
        en: { q: 'Edges can also be removed?', a: 'A DSU cannot split. Offline, process the queries backwards and add instead of removing; online, use a DSU with rollback and no path compression.' } },
    ],
    related: [
      { id: 'kruskal', ru: 'та же проверка «уже связаны?» перед ребром', en: 'the same “already connected?” check before each edge' },
      { id: 'course', ru: 'поиск цикла, но в ориентированном графе', en: 'cycle detection, in a directed graph' },
    ],
  },

  swim: {
    tricky: [
      { input: { grid: '3 0 | 1 2' },
        ru: 'Стартовая клетка самая высокая: раньше t = 3 из неё не выплыть, ответ 3. BFS, который не учитывает высоту старта, вернёт 2.',
        en: 'The start is the highest cell: you cannot leave it before t = 3, so the answer is 3. A BFS that ignores the start’s height returns 2.' },
      { input: { grid: '0' },
        ru: 'Сетка 1 × 1: старт и финиш совпадают, ответ 0.',
        en: 'A 1 × 1 grid: start and finish coincide, the answer is 0.' },
    ],
    ops: {
      unit: { ru: 'проверок соседей', en: 'neighbour checks' },
      naive: { ru: 'новый BFS на каждое t', en: 'a fresh BFS for every t', count: p => swimNaiveChecks(p.grid) },
      ours: { ru: 'Union-Find по высотам', en: 'Union-Find by height', count: p => swimDsuChecks(p.grid) },
    },
    predict: [
      { q: { ru: 'Вода залила следующую клетку. С кем она соединится?', en: 'The water floods the next cell. What does it join?' },
        keys: { 'sw.ev.island': { ru: 'ни с кем — новый островок', en: 'nothing: a new islet' },
                'sw.ev.grow': { ru: 'с одной лужей', en: 'one pool' },
                'sw.ev.merge': { ru: 'сливает несколько луж', en: 'several pools merge' } } },
    ],
    followups: [
      { ru: { q: 'Высоты повторяются или не 0..n² − 1?', a: 'Сортируй клетки по высоте — или Дейкстра с кучей по максимуму высоты на пути: O(n² log n).' },
        en: { q: 'Heights repeat or are not 0..n² − 1?', a: 'Sort the cells by height, or run Dijkstra with a heap keyed by the maximum height on the path: O(n² log n).' } },
      { ru: { q: 'А через бинарный поиск?', a: 'Ответ монотонен: если доплыть можно при t, то и при t + 1. Бинарный поиск по t и BFS по клеткам ≤ t: O(n² log n).' },
        en: { q: 'What about binary search?', a: 'The answer is monotone: if you can swim at t, you can at t + 1. Binary-search t with a BFS over cells ≤ t: O(n² log n).' } },
    ],
    related: [
      { id: 'minEffort', ru: 'путь, где важен худший шаг, а не сумма', en: 'a path judged by its worst step, not its sum' },
      { id: 'unionFind', ru: 'тот же Union-Find с рангами', en: 'the same Union-Find with ranks' },
    ],
  },

  kruskal: {
    tricky: [
      { input: { points: '0 0' },
        ru: 'Одна точка: рёбер нет, соединять нечего, ответ 0.',
        en: 'One point: no edges, nothing to connect, the answer is 0.' },
      { input: { points: '-10 -10 | 20 20' },
        ru: 'Отрицательные координаты: |−10 − 20| + |−10 − 20| = 60. Без модуля получится −60.',
        en: 'Negative coordinates: |−10 − 20| + |−10 − 20| = 60. Drop the absolute value and you get −60.' },
      { input: { points: '0 0 | 1 0 | 0 1 | 1 1' },
        ru: 'Четыре ребра длины 1 образуют цикл: Краскал берёт три, четвёртое замкнуло бы цикл. Ответ 3, а не 4.',
        en: 'Four edges of length 1 form a cycle: Kruskal takes three, the fourth would close the loop. The answer is 3, not 4.' },
    ],
    ops: {
      unit: { ru: 'посещений вершин', en: 'vertex visits' },
      naive: { ru: 'обход леса на каждое ребро', en: 'a forest search per edge', count: p => kruskalNaive(p.points) },
      ours: { ru: 'Union-Find', en: 'Union-Find', count: p => kruskalDsu(p.points) },
    },
    predict: [
      { q: { ru: 'Следующее ребро по длине: берём?', en: 'The next edge by length: take it?' },
        keys: { 'kr.ev.take': { ru: 'да, концы в разных компонентах', en: 'yes, the ends are in different components' },
                'kr.ev.skip': { ru: 'нет, замкнёт цикл', en: 'no, it would close a cycle' } } },
    ],
    followups: [
      { ru: { q: 'Граф полный — все пары точек. Что быстрее?', a: 'Прим на массиве без кучи: O(n²) и O(n) памяти, против O(n² log n) у Краскала с сортировкой n²/2 рёбер.' },
        en: { q: 'The graph is complete, all pairs. What is faster?', a: 'Prim on a plain array with no heap: O(n²) time and O(n) memory, versus O(n² log n) for Kruskal sorting n²/2 edges.' } },
      { ru: { q: 'Сто тысяч точек?', a: 'Для манхэттенской метрики хватает O(n) кандидатов — ближайший сосед в каждом из 8 октантов (sweep line), потом Краскал: O(n log n).' },
        en: { q: 'A hundred thousand points?', a: 'For the Manhattan metric O(n) candidates suffice, the nearest neighbour in each of 8 octants (a sweep line), then Kruskal: O(n log n).' } },
      { ru: { q: 'Часть точек уже соединена кабелем?', a: 'Сначала union по готовым соединениям бесплатно, потом обычный Краскал по остальным рёбрам.' },
        en: { q: 'Some points are already wired?', a: 'Union the existing links for free first, then run plain Kruskal over the remaining edges.' } },
    ],
    related: [
      { id: 'unionFind', ru: 'та же проверка цикла через Union-Find', en: 'the same cycle check with Union-Find' },
      { id: 'networkDelay', ru: 'Прим растёт как Дейкстра, только ключ — вес ребра', en: 'Prim grows like Dijkstra, keyed by edge weight' },
    ],
  },

  pacificAtlantic: {
    tricky: [
      { input: { heights: '2 2 2 | 2 2 2 | 2 2 2' },
        ru: 'Плоская равнина: вода течёт и на равную высоту, поэтому подходят все 9 клеток. Со строгим «&gt;» центр не попадёт.',
        en: 'A flat plain: water flows to equal heights too, so all 9 cells qualify. With a strict “&gt;” the centre is lost.' },
      { input: { heights: '5' },
        ru: 'Одна клетка касается обоих океанов: ответ [[0, 0]].',
        en: 'A single cell touches both oceans: the answer is [[0, 0]].' },
      { input: { heights: '1 1 1 | 1 9 1 | 1 1 1' },
        ru: 'Пик в центре: из него вода стекает куда угодно — центр в ответе вместе со всем краем, все 9 клеток.',
        en: 'A peak in the centre: water runs off it anywhere, so the centre joins the whole border, all 9 cells.' },
    ],
    ops: {
      unit: { ru: 'посещений клеток', en: 'cell visits' },
      naive: { ru: 'спуск из каждой клетки', en: 'a descent from every cell', count: p => oceansNaiveVisits(p.heights) },
      ours: { ru: 'подъём от океанов', en: 'a climb from the oceans', count: p => oceansReverseVisits(p.heights) },
    },
    predict: [
      { q: { ru: 'Клетка вынута из очереди. Есть ли куда подняться?', en: 'A cell comes off the queue. Is there anywhere to climb?' },
        keys: { 'pa.ev.climb': { ru: 'да, новые соседи не ниже', en: 'yes, new neighbours that are not lower' },
                'pa.ev.stuck': { ru: 'нет, все ниже или уже отмечены', en: 'no, all lower or marked already' } } },
    ],
    followups: [
      { ru: { q: 'Почему не DFS из каждой клетки?', a: 'Каждый спуск может обойти всю карту: O((mn)²). Обратный подъём от океанов отмечает каждую клетку не больше двух раз — O(mn).' },
        en: { q: 'Why not a DFS from every cell?', a: 'Each descent may cover the whole map: O((mn)²). Climbing back from the oceans marks every cell at most twice: O(mn).' } },
      { ru: { q: 'DFS вместо BFS?', a: 'Тоже верно, но рекурсия на карте 200 × 200 может переполнить стек — бери явный стек или очередь.' },
        en: { q: 'DFS instead of BFS?', a: 'Also correct, but recursion on a 200 × 200 map can overflow the stack; use an explicit stack or a queue.' } },
      { ru: { q: 'Океанов не два, а k?', a: 'По обходу на каждый и битовая маска в клетке: O(k·mn). Ответ — клетки, где маска полна.' },
        en: { q: 'k oceans instead of two?', a: 'One sweep per ocean with a bit mask per cell: O(k·mn). The answer is the cells whose mask is full.' } },
    ],
    related: [
      { id: 'oranges', ru: 'BFS сразу от многих источников', en: 'a BFS from many sources at once' },
      { id: 'flood', ru: 'заливка по правилу соседства', en: 'a flood fill with a neighbour rule' },
    ],
  },

  /* ---------- design ---------- */
  trie: {
    tricky: [
      { input: { ops: 'insert app, insert apple, search app' },
        ru: '«app» лежит внутри «apple», но вставлено отдельно: метка конца стоит на внутреннем узле, ответ true. Кто ставит метку только листьям, вернёт false.',
        en: '“app” sits inside “apple” but was inserted on its own: the end mark is on an inner node, the answer is true. Marking only leaves returns false.' },
      { input: { ops: 'insert apple, startsWith apple, search appl' },
        ru: 'Префикс может совпадать со словом целиком — startsWith даёт true; а «appl» не вставляли — search даёт false.',
        en: 'A prefix may be the whole word, so startsWith gives true; “appl” was never inserted, so search gives false.' },
    ],
    ops: {
      unit: { ru: 'сравнений символов', en: 'character comparisons' },
      naive: { ru: 'список слов', en: 'a list of words', count: p => wordListCompares(p.ops) },
      ours: { ru: 'бор', en: 'trie', count: p => trieSteps(p.ops) },
    },
    predict: [
      { q: { ru: 'Следующая буква: есть ли ребро?', en: 'The next letter: is there an edge?' },
        keys: { 'trie.ev.walk': { ru: 'есть — идём по нему', en: 'yes: follow it' },
                'trie.ev.make': { ru: 'нет — создаём узел', en: 'no: create a node' },
                'trie.ev.miss': { ru: 'нет — поиск обрывается', en: 'no: the search stops' } } },
      { q: { ru: 'search дошёл до конца слова. Это слово?', en: 'search reached the end of the word. Is it a word?' },
        keys: { 'trie.ev.word': { ru: 'да, стоит метка конца', en: 'yes, the end mark is there' },
                'trie.ev.notWord': { ru: 'нет, это только префикс', en: 'no, just a prefix' } } },
    ],
    followups: [
      { ru: { q: 'Как удалить слово?', a: 'Сними метку конца, затем снизу вверх удаляй узлы без детей и без метки. Счётчик проходящих слов в узле делает это проще.' },
        en: { q: 'How do you delete a word?', a: 'Clear the end mark, then remove childless unmarked nodes bottom-up. A per-node counter of words passing through makes it simpler.' } },
      { ru: { q: 'Подсказки: все слова с этим префиксом?', a: 'Дойди до узла префикса и обойди его поддерево DFS. Для топ-k храни в каждом узле k лучших слов — запрос становится O(длина префикса).' },
        en: { q: 'Autocomplete: all words with this prefix?', a: 'Walk to the prefix node and DFS its subtree. For top-k keep the k best words in every node, and a query costs O(prefix length).' } },
      { ru: { q: 'Алфавит — весь Unicode?', a: 'Массив на 26 не годится: Dictionary&lt;char, Node&gt; в узле или сжатый бор (radix tree), где ребро несёт целую подстроку.' },
        en: { q: 'The alphabet is all of Unicode?', a: 'A 26-slot array will not do: a Dictionary&lt;char, Node&gt; per node, or a compressed trie (radix tree) whose edges carry whole substrings.' } },
    ],
    related: [
      { id: 'maxXorLimit', ru: 'бор по битам вместо букв', en: 'a trie over bits instead of letters' },
      { id: 'wordSearch', ru: 'с бором ищут сразу много слов (Word Search II)', en: 'with a trie you search many words at once (Word Search II)' },
    ],
  },

  serialize: {
    tricky: [
      { input: { root: '2, 2, null, 2' },
        ru: 'Одинаковые значения: прямой + симметричный обход без маркеров не различит форму. С # на каждом пустом ребёнке строка однозначна.',
        en: 'Equal values: pre-order plus in-order without markers cannot tell the shape apart. With # for every missing child the string is unambiguous.' },
      { input: { root: '1, null, 2, null, 3, null, 4' },
        ru: 'Цепочка вправо: формат «массив кучи» (дети в 2i + 1 и 2i + 2) тратит 15 мест на 4 узла, а на глубине 10⁴ — 2¹⁰⁰⁰⁰. Маркеры дают 2n + 1 = 9 токенов.',
        en: 'A right chain: the heap-array format (children at 2i + 1 and 2i + 2) spends 15 slots on 4 nodes, and 2¹⁰⁰⁰⁰ at depth 10⁴. Markers give 2n + 1 = 9 tokens.' },
      { input: { root: '-5' },
        ru: 'Одна вершина с отрицательным значением: строка «-5,#,#». Разбор по символам примет «-» за отдельный токен — делите по запятым.',
        en: 'A single node with a negative value: the string is “-5,#,#”. Parsing char by char takes “-” as its own token; split on commas.' },
    ],
    ops: {
      unit: { ru: 'токенов в строке', en: 'tokens in the string' },
      naive: { ru: 'массив кучи', en: 'heap array', count: p => 2 ** levelOrderHeight(p.root) - 1 },
      ours: { ru: 'прямой обход с #', en: 'pre-order with #', count: p => 2 * p.root.filter(v => v !== null).length + 1 },
    },
    predict: [
      { q: { ru: 'serialize: что запишем следующим?', en: 'serialize: what gets written next?' },
        keys: { 'ser.ev.val': { ru: 'значение узла', en: 'a node’s value' },
                'ser.ev.nil': { ru: 'маркер #', en: 'a # marker' } } },
      { q: { ru: 'deserialize: какой токен читаем?', en: 'deserialize: which token is read?' },
        keys: { 'des.ev.node': { ru: 'число — новый узел', en: 'a number: a new node' },
                'des.ev.nil': { ru: '# — пустой ребёнок', en: '#: an empty child' } } },
    ],
    followups: [
      { ru: { q: 'А если это BST (#449)?', a: 'Маркеры не нужны: прямой обход плюс границы (low, high) при разборе однозначно восстанавливают форму.' },
        en: { q: 'And if it is a BST (#449)?', a: 'No markers needed: pre-order plus (low, high) bounds while parsing restore the shape uniquely.' } },
      { ru: { q: 'Дерево — цепочка из 10⁴ узлов?', a: 'Рекурсия переполнит стек: обход с явным стеком или формат по уровням через очередь.' },
        en: { q: 'The tree is a chain of 10⁴ nodes?', a: 'Recursion overflows the stack: use an explicit stack, or a level-order format with a queue.' } },
      { ru: { q: 'Компактнее строки?', a: 'Бинарный формат: значение плюс два бита «есть левый / правый ребёнок» вместо текстовых # и запятых.' },
        en: { q: 'Something more compact than a string?', a: 'A binary format: the value plus two bits “has left / right child” instead of textual # and commas.' } },
    ],
    related: [
      { id: 'levelOrder', ru: 'обход по уровням — другой возможный формат', en: 'level-order traversal, another possible format' },
      { id: 'cloneGraph', ru: 'тоже воссоздаём структуру узел за узлом', en: 'also rebuilds a structure node by node' },
    ],
  },

  circularQueue: {
    tricky: [
      { input: { k: '2', ops: 'enQueue 1, enQueue 2, Rear' },
        ru: 'Хвост ушёл в 0: (tail − 1) % k в C# даёт −1 и выход за массив. Через (head + count − 1) % k ответ верный — 2.',
        en: 'The tail has wrapped to 0: (tail − 1) % k is −1 in C# and indexes out of range. With (head + count − 1) % k the answer is right: 2.' },
      { input: { k: '1', ops: 'enQueue 5, isFull, enQueue 6, deQueue, isEmpty, Front' },
        ru: 'k = 1: при head == tail очередь и полна, и пуста — различает только счётчик. Ответы: true, true, false, true, true, −1.',
        en: 'k = 1: with head == tail the queue is both full and empty; only the count tells them apart. Results: true, true, false, true, true, −1.' },
    ],
    ops: {
      unit: { ru: 'записей в массив', en: 'array writes' },
      naive: { ru: 'сдвиг при deQueue', en: 'shift on deQueue', count: p => queueWrites(p.k, p.ops, true) },
      ours: { ru: 'кольцо', en: 'ring', count: p => queueWrites(p.k, p.ops, false) },
    },
    predict: [
      { q: { ru: 'enQueue: куда ляжет значение?', en: 'enQueue: where does the value go?' },
        keys: { 'cq.ev.enq': { ru: 'в следующую ячейку', en: 'into the next slot' },
                'cq.ev.wrap': { ru: 'хвост перешёл через край', en: 'the tail wrapped around' },
                'cq.ev.full': { ru: 'никуда — очередь полна', en: 'nowhere: the queue is full' } } },
      { q: { ru: 'Что сделает очередь?', en: 'What will the queue do?' },
        keys: { 'cq.ev.deq': { ru: 'заберёт из головы', en: 'take from the head' },
                'cq.ev.headWrap': { ru: 'заберёт, голова вернётся в 0', en: 'take, and the head returns to 0' },
                'cq.ev.empty': { ru: 'откажет — пусто', en: 'refuse: it is empty' } } },
    ],
    followups: [
      { ru: { q: 'Один писатель и один читатель в разных потоках?', a: 'Lock-free кольцо: head меняет только читатель, tail — только писатель, через Volatile.Read/Write; блокировки не нужны.' },
        en: { q: 'One writer and one reader on different threads?', a: 'A lock-free ring: only the reader moves head, only the writer moves tail, with Volatile.Read/Write; no locks needed.' } },
      { ru: { q: 'k — степень двойки?', a: 'Индекс через &amp; (k − 1) вместо %, а head и tail растут без сброса: размер — просто tail − head.' },
        en: { q: 'k is a power of two?', a: 'Index with &amp; (k − 1) instead of %, and let head and tail grow forever: the size is just tail − head.' } },
      { ru: { q: 'Полную очередь нужно перезаписывать (кольцевой лог)?', a: 'При переполнении сдвинь head на 1 и пиши на освободившееся место — старейшая запись теряется.' },
        en: { q: 'A full queue should overwrite (a ring log)?', a: 'On overflow advance head by one and write into the freed slot: the oldest entry is lost.' } },
    ],
    related: [
      { id: 'slidingMax', ru: 'очередь с двух концов на массиве', en: 'a double-ended queue on an array' },
      { id: 'lru', ru: 'ещё одна структура с O(1) на операцию', en: 'another structure with O(1) per operation' },
    ],
  },

  lfu: {
    tricky: [
      { input: { capacity: '2', ops: 'put 1 1, put 2 2, put 1 10, put 3 3, get 2, get 1' },
        ru: 'put по существующему ключу — тоже обращение: у 1 частота 2, вытесняется 2. Ответы get: −1 и 10. Если put не считать, вылетит 1.',
        en: 'A put on an existing key is a use too: key 1 has frequency 2, so 2 is evicted. The gets return −1 and 10. Do not count the put and 1 is evicted instead.' },
      { input: { capacity: '2', ops: 'put 1 1, put 2 2, get 2, get 1, put 3 3, get 2, get 1' },
        ru: 'Частоты равны (по 2) — уходит тот, к кому дольше не обращались: 2, хотя вставлен он позже. Ответы get: 2, 1, −1, 1.',
        en: 'Equal frequencies (2 each): the least recently used goes, which is 2, though it was inserted later. The gets return 2, 1, −1, 1.' },
    ],
    ops: {
      unit: { ru: 'просмотров записей', en: 'entries examined' },
      naive: { ru: 'поиск жертвы перебором', en: 'scan for the victim', count: p => p.ops.length + lfuEvictions(p.capacity, p.ops) * p.capacity },
      ours: { ru: 'корзины частот', en: 'frequency buckets', count: p => p.ops.length + lfuEvictions(p.capacity, p.ops) },
    },
    predict: [
      { q: { ru: 'get: ключ в кэше?', en: 'get: is the key cached?' },
        keys: { 'lfu.ev.hit': { ru: 'да — частота +1', en: 'yes: frequency + 1' },
                'lfu.ev.miss': { ru: 'нет — −1', en: 'no: −1' } } },
      { q: { ru: 'put: что произойдёт?', en: 'put: what happens?' },
        keys: { 'lfu.ev.put': { ru: 'новый ключ, место есть', en: 'a new key with room to spare' },
                'lfu.ev.evict': { ru: 'сначала вытеснение', en: 'an eviction first' },
                'lfu.ev.update': { ru: 'ключ есть — обновить значение', en: 'the key exists: update the value' } } },
    ],
    followups: [
      { ru: { q: 'Почему не куча по частоте?', a: 'Частота меняется при каждом обращении: в куче это O(log n) и поиск элемента. Частота растёт ровно на 1, поэтому корзины со списками дают O(1).' },
        en: { q: 'Why not a heap keyed by frequency?', a: 'Frequency changes on every access: in a heap that is O(log n) plus finding the element. Frequency grows by exactly 1, so buckets of lists give O(1).' } },
      { ru: { q: 'Старые популярные ключи никогда не уходят?', a: 'Нужно старение: периодически делить счётчики пополам или затухание по времени, как в W-TinyLFU, — иначе кэш «застывает» на вчерашних хитах.' },
        en: { q: 'Old popular keys never leave?', a: 'Add aging: halve the counters periodically or decay them over time, as W-TinyLFU does; otherwise the cache freezes on yesterday’s hits.' } },
      { ru: { q: 'capacity = 0?', a: 'put ничего не делает, get всегда −1. Без этой проверки код полезет вытеснять из пустой корзины.' },
        en: { q: 'capacity = 0?', a: 'put does nothing and get always returns −1. Without that check the code tries to evict from an empty bucket.' } },
    ],
    related: [
      { id: 'lru', ru: 'тот же словарь плюс список, но одна корзина', en: 'the same map plus list, with a single bucket' },
      { id: 'topK', ru: 'корзины по частоте', en: 'buckets by frequency' },
    ],
  },
};
