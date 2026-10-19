/**
 * Pure traces for chapter 16: games — paths and space. A* on a grid, a flow field, a spatial hash grid,
 * Union-Find and Swim in Rising Water solved with it. Same contract as model-a.js: every event is a complete
 * snapshot with an i18n key and its arguments.
 */
const event = (key, args, state) => ({ key, args, ...state });
const copy = m => m.map(r => [...r]);
const DIRS4 = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const DIRS8 = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const inside = (m, r, c) => r >= 0 && c >= 0 && r < m.length && c < m[0].length;
const at = ([r, c]) => `(${r}, ${c})`;

/** Lexicographic “a before b” for priority-queue entries written as arrays. */
const less = (a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i]; return false; };
/** A priority queue small enough to show whole: entries stay sorted, the smallest first. */
function pqPush(pq, entry, key = e => e) {
  let i = pq.length;
  while (i > 0 && less(key(entry), key(pq[i - 1]))) i--;
  pq.splice(i, 0, entry);
}

/* ---------- A* on a grid (Shortest Path in Binary Matrix) ---------- */
/** Heuristics for 8 directions where a diagonal step costs 1, like a straight one. Only Chebyshev fits that cost. */
export const HEURISTICS = {
  chebyshev: (dr, dc) => Math.max(dr, dc),
  octile: (dr, dc) => Math.max(dr, dc) + (Math.SQRT2 - 1) * Math.min(dr, dc),
  manhattan: (dr, dc) => dr + dc,
  zero: () => 0,
};
export const H_NAMES = Object.keys(HEURISTICS);

/** Plain BFS over 8 directions: the length of the shortest clear path in cells, or −1. */
export function bfs8(grid) {
  const rows = grid.length, cols = grid[0].length;
  if (grid[0][0] || grid[rows - 1][cols - 1]) return -1;
  const dist = grid.map(r => r.map(() => 0)), queue = [[0, 0]];
  dist[0][0] = 1;
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head];
    if (r === rows - 1 && c === cols - 1) return dist[r][c];
    for (const [dr, dc] of DIRS8) {
      const y = r + dr, x = c + dc;
      if (!inside(grid, y, x) || grid[y][x] || dist[y][x]) continue;
      dist[y][x] = dist[r][c] + 1;
      queue.push([y, x]);
    }
  }
  return -1;
}

/**
 * A* from the top-left to the bottom-right corner. The open set is a heap ordered by f = g + h, ties broken by the
 * smaller h (the cell nearer the goal), then by row and column. Closed cells are never reopened — right for a
 * consistent h; an h that overestimates can close a cell too early and return a longer path.
 * emit(key, args, extra) gets every step; a search without emit only counts.
 */
function astarSearch(grid, hName, emit = null) {
  const rows = grid.length, cols = grid[0].length, gr = rows - 1, gc = cols - 1, H = HEURISTICS[hName];
  const h = (r, c) => H(Math.abs(gr - r), Math.abs(gc - c));
  const g = grid.map(r => r.map(() => null)), from = grid.map(r => r.map(() => null));
  const closed = grid.map(r => r.map(() => false)), open = [];
  let expanded = 0;
  const say = (key, args, extra = {}) => emit && emit(key, args, {
    g: copy(g), closed: copy(closed), open: open.map(e => [...e]), expanded, cur: null, nb: [], path: [], ...extra,
  });
  const pathTo = (r, c) => { const out = []; for (let p = [r, c]; p; p = from[p[0]][p[1]]) out.unshift(p); return out; };
  say('ast.ev.start', [hName, h(0, 0), rows, cols]);
  if (grid[0][0] || grid[gr][gc]) {
    say('ast.ev.blocked', [grid[0][0] ? at([0, 0]) : at([gr, gc])]);
    return { length: -1, expanded, path: [] };
  }
  g[0][0] = 0;
  pqPush(open, [h(0, 0), h(0, 0), 0, 0, 0]);                 // [f, h, r, c, g]
  while (open.length) {
    const [f, hh, r, c, ge] = open.shift();
    if (closed[r][c]) {
      say('ast.ev.stale', [at([r, c]), ge, g[r][c]], { cur: [r, c] });
      continue;
    }
    closed[r][c] = true;
    expanded++;
    if (r === gr && c === gc) {
      const path = pathTo(r, c), length = g[r][c] + 1, best = bfs8(grid);
      const zero = hName === 'zero' ? expanded : astarSearch(grid, 'zero').expanded;
      say(length > best ? 'ast.ev.worse' : 'ast.ev.found', [length, expanded, hName, zero, best], { cur: [r, c], path });
      return { length, expanded, path };
    }
    say('ast.ev.pop', [at([r, c]), g[r][c], hh, f, open.length], { cur: [r, c] });
    const nb = [];
    let missed = 0;
    for (const [dr, dc] of DIRS8) {
      const y = r + dr, x = c + dc;
      if (!inside(grid, y, x) || grid[y][x]) continue;
      const cand = g[r][c] + 1;
      if (closed[y][x]) {
        if (cand < g[y][x]) missed++;
        nb.push([y, x, 'closed']);
      } else if (g[y][x] === null || cand < g[y][x]) {
        nb.push([y, x, g[y][x] === null ? 'open' : 'better']);
        g[y][x] = cand;
        from[y][x] = [r, c];
        pqPush(open, [cand + h(y, x), h(y, x), y, x, cand]);
      } else nb.push([y, x, 'kept']);
    }
    const count = kind => nb.filter(n => n[2] === kind).length;
    const list = kinds => nb.filter(n => kinds.includes(n[2])).map(([y, x]) => `${at([y, x])} g=${g[y][x]}`);
    const key = count('better') ? 'ast.ev.relax' : count('open') ? 'ast.ev.open' : count('closed') ? 'ast.ev.closed' : 'ast.ev.dead';
    say(key, [at([r, c]), list(['open']), list(['better']), count('closed'), count('kept'), missed], { cur: [r, c], nb });
  }
  say('ast.ev.none', [expanded]);
  return { length: -1, expanded, path: [] };
}

export function astarTrace(grid, hName = 'chebyshev') {
  const events = [];
  const result = astarSearch(grid, hName, (key, args, state) => events.push(event(key, args, state)));
  return { events, ...result };
}

/* ---------- Flow field ---------- */
/**
 * cost: 0 is a wall, 1..9 is what it costs to cross a cell. Phase 1: the cost field as given. Phase 2: the
 * integration field — Dijkstra from every goal at once, integration[cell] = cost[cell] + the smallest integration
 * of a neighbour. Phase 3: the direction field — every cell points at its neighbour with the smallest integration
 * (ties: up, right, down, left). One field steers any number of agents. Costs sit on cells, not on moves, so the
 * first time Dijkstra reaches a cell is already its cheapest: like BFS, the value is set on enqueue.
 */
export function flowFieldTrace(cost, goals) {
  const rows = cost.length, cols = cost[0].length, isGoal = (r, c) => goals.some(([y, x]) => y === r && x === c);
  const integ = cost.map(r => r.map(() => Infinity)), done = cost.map(r => r.map(() => false));
  const dir = cost.map(r => r.map(() => null)), pq = [], events = [];
  const push = (key, args, extra = {}) => events.push(event(key, args, {
    phase: 'int', integ: copy(integ), done: copy(done), dir: copy(dir), pq: pq.map(p => [...p]), cur: null, improved: [], row: null, path: [], ...extra,
  }));
  const walls = cost.flat().filter(v => !v).length;
  push('ff.ev.cost', [rows, cols, walls, Math.max(...cost.flat())], { phase: 'cost' });
  for (const [r, c] of goals) {
    integ[r][c] = 0;
    pqPush(pq, [0, r, c]);
  }
  push('ff.ev.seed', [goals.map(at)]);
  while (pq.length) {
    const [d, r, c] = pq.shift();
    done[r][c] = true;
    const improved = [];
    for (const [dr, dc] of DIRS4) {
      const y = r + dr, x = c + dc;
      // A cell's cost is paid on entering it, from whichever side: the first neighbour to reach it left the queue
      // first, so it is already the cheapest — integration is set once, and no stale entries ever appear.
      if (!inside(cost, y, x) || !cost[y][x] || integ[y][x] < Infinity) continue;
      const cand = d + cost[y][x];
      integ[y][x] = cand;
      pqPush(pq, [cand, y, x]);
      improved.push([y, x, `${at([y, x])}: ${d} + ${cost[y][x]} = ${cand}`]);
    }
    push(improved.length ? 'ff.ev.relax' : 'ff.ev.settle', [at([r, c]), d, improved.map(m => m[2])],
      { cur: [r, c], improved: improved.map(([y, x]) => [y, x]) });
  }
  for (let r = 0; r < rows; r++) {
    let arrows = 0, cut = 0, open = 0;
    for (let c = 0; c < cols; c++) {
      if (!cost[r][c] || isGoal(r, c)) continue;
      open++;
      if (integ[r][c] === Infinity) { cut++; continue; }
      let best = -1;
      DIRS4.forEach(([dr, dc], k) => {
        const y = r + dr, x = c + dc;
        if (inside(cost, y, x) && cost[y][x] && (best < 0 || integ[y][x] < integ[r + DIRS4[best][0]][c + DIRS4[best][1]])) best = k;
      });
      dir[r][c] = best;
      arrows++;
    }
    push(cut ? 'ff.ev.rowCut' : 'ff.ev.row', [r, arrows, cut, open], { phase: 'dir', row: r });
  }
  let start = null;
  cost.forEach((row, r) => row.forEach((v, c) => {
    if (v && !isGoal(r, c) && integ[r][c] < Infinity && (!start || integ[r][c] > integ[start[0]][start[1]])) start = [r, c];
  }));
  const path = [];
  for (let p = start; p; ) {
    path.push(p);
    const k = dir[p[0]][p[1]];
    p = k === null ? null : [p[0] + DIRS4[k][0], p[1] + DIRS4[k][1]];
  }
  push('ff.ev.done', start ? [at(start), integ[start[0]][start[1]], path.length - 1] : [null, 0, 0], { phase: 'done', path, row: rows - 1 });
  return { events, integ, dir };
}
export const FLOW_DIRS = DIRS4;

/* ---------- Spatial hash grid (Queries on Number of Points Inside a Circle) ---------- */
/**
 * Points go into square cells of side `size`, keyed by (⌊x / size⌋, ⌊y / size⌋). A circle of radius r ≤ size
 * around (x, y) fits into the 3 × 3 cells around its own cell, so a query looks only there. Cells beyond the map
 * (a negative column or row) cannot hold points and are skipped.
 */
export function spatialGridTrace(points, queries, size) {
  const buckets = new Map(), events = [], answers = queries.map(() => null);
  const keyOf = (cx, cy) => `${cx},${cy}`;
  let checks = 0, placed = 0;
  const push = (key, args, extra = {}) => events.push(event(key, args, {
    placed, buckets: [...buckets].map(([k, list]) => [k, [...list]]), answers: [...answers], checks,
    q: null, cell: null, window: null, tested: [], point: null, ...extra,
  }));
  const cellOf = (x, y) => [Math.floor(x / size), Math.floor(y / size)];
  push('sg.ev.start', [points.length, size, queries.length]);
  points.forEach(([x, y], i) => {
    const [cx, cy] = cellOf(x, y), k = keyOf(cx, cy), fresh = !buckets.has(k);
    if (fresh) buckets.set(k, []);
    buckets.get(k).push(i);
    placed++;
    push(fresh ? 'sg.ev.newCell' : 'sg.ev.put', [i, x, y, cx, cy, buckets.get(k).length], { point: i, cell: [cx, cy] });
  });
  queries.forEach(([x, y, r], j) => {
    const [cx, cy] = cellOf(x, y), window = [cx - 1, cy - 1, cx + 1, cy + 1], tested = [];
    let count = 0, own = 0;
    push('sg.ev.query', [j, x, y, r, cx, cy, buckets.size], { q: j, cell: [cx, cy], window });
    for (let gy = cy - 1; gy <= cy + 1; gy++) {
      for (let gx = cx - 1; gx <= cx + 1; gx++) {
        if (gx < 0 || gy < 0) continue;
        const list = buckets.get(keyOf(gx, gy)) || [];
        const hits = [];
        for (const i of list) {
          const dx = points[i][0] - x, dy = points[i][1] - y, hit = dx * dx + dy * dy <= r * r;
          checks++;
          own++;
          tested.push([i, hit]);
          if (hit) { hits.push(i); count++; }
        }
        const key = !list.length ? 'sg.ev.empty' : hits.length ? 'sg.ev.hit' : 'sg.ev.miss';
        push(key, [gx, gy, list.length, hits, r * r], { q: j, cell: [gx, gy], window, tested: tested.map(t => [...t]) });
      }
    }
    answers[j] = count;
    push('sg.ev.answer', [j, count, own, points.length], { q: j, window, tested: tested.map(t => [...t]) });
  });
  push('sg.ev.done', [[...answers], checks, points.length * queries.length]);
  return { events, answers, checks };
}

/* ---------- Union-Find (Redundant Connection) ---------- */
/** Root of x and the path walked to it; every node on the path is re-hung straight onto the root. */
function findCompress(parent, x) {
  const path = [x];
  while (parent[path.at(-1)] !== path.at(-1)) path.push(parent[path.at(-1)]);
  const root = path.at(-1), moved = [];
  for (const v of path.slice(0, -1)) if (parent[v] !== root) { parent[v] = root; moved.push(v); }
  return { root, path, moved };
}

/**
 * Edges come one by one. find walks to the root with path compression, union hangs the root of the lower tree
 * under the root of the higher one (union by rank). An edge whose ends already share a root closes a cycle:
 * in a tree plus one edge it is the redundant one — and the last edge of that cycle in the input.
 */
export function unionFindTrace(edges) {
  const n = edges.length, parent = Array.from({ length: n + 1 }, (_, i) => i), rank = Array(n + 1).fill(0), events = [];
  const status = edges.map(() => null);
  const push = (key, args, extra = {}) => events.push(event(key, args, {
    parent: [...parent], rank: [...rank], status: [...status], k: null, edge: null, path: [], moved: [], roots: [], ...extra,
  }));
  push('uf.ev.start', [n]);
  for (let k = 0; k < n; k++) {
    const [u, v] = edges[k], a = findCompress(parent, u), b = findCompress(parent, v);
    const moved = [...a.moved, ...b.moved], path = [...new Set([...a.path, ...b.path])];
    push(moved.length ? 'uf.ev.compress' : 'uf.ev.find', [u, v, a.path, b.path, moved, a.root, b.root],
      { k, edge: [u, v], path, moved, roots: [a.root, b.root] });
    if (a.root === b.root) {
      status[k] = 'cycle';
      push('uf.ev.cycle', [u, v, a.root, k + 1], { k, edge: [u, v], roots: [a.root] });
      return { events, answer: [u, v] };
    }
    let [hi, lo] = [a.root, b.root];
    if (rank[hi] < rank[lo]) [hi, lo] = [lo, hi];
    parent[lo] = hi;
    const tie = rank[hi] === rank[lo];
    if (tie) rank[hi]++;
    status[k] = 'join';
    push(tie ? 'uf.ev.tie' : 'uf.ev.union', [u, v, lo, hi, rank[hi]], { k, edge: [u, v], roots: [hi], moved: [lo] });
  }
  push('uf.ev.none', [n]);
  return { events, answer: null };
}

/* ---------- Swim in Rising Water ---------- */
/**
 * At time t the water stands at t, so the cell of height t joins the pool: union it with every neighbour that is
 * already under water. The answer is the first t at which (0, 0) and (n−1, n−1) share a root. Heights are 0..n²−1,
 * all different, so the cell of each t is known up front — no sorting.
 */
export function swimTrace(grid) {
  const n = grid.length, total = n * n, parent = Array.from({ length: total }, (_, i) => i), rank = Array(total).fill(0);
  const wet = Array(total).fill(false), cellAt = Array(total), events = [];
  grid.forEach((row, r) => row.forEach((v, c) => { cellAt[v] = r * n + c; }));
  const find = x => { let root = x; while (parent[root] !== root) root = parent[root]; while (parent[x] !== root) { const up = parent[x]; parent[x] = root; x = up; } return root; };
  const union = (a, b) => {
    let [x, y] = [find(a), find(b)];
    if (x === y) return false;
    if (rank[x] < rank[y]) [x, y] = [y, x];
    parent[y] = x;
    if (rank[x] === rank[y]) rank[x]++;
    return true;
  };
  const pools = () => grid.map((row, r) => row.map((_, c) => (wet[r * n + c] ? find(r * n + c) : null)));
  const push = (key, args, extra = {}) => events.push(event(key, args, { t: null, cur: null, pool: pools(), path: [], ...extra }));
  push('sw.ev.start', [n, grid[0][0], grid[n - 1][n - 1]]);
  for (let t = 0; t < total; t++) {
    const cell = cellAt[t], r = Math.floor(cell / n), c = cell % n;
    wet[cell] = true;
    const touching = new Set();
    for (const [dr, dc] of DIRS4) {
      const y = r + dr, x = c + dc;
      if (inside(grid, y, x) && wet[y * n + x]) touching.add(find(y * n + x));
    }
    for (const [dr, dc] of DIRS4) {
      const y = r + dr, x = c + dc;
      if (inside(grid, y, x) && wet[y * n + x]) union(cell, y * n + x);
    }
    const key = !touching.size ? 'sw.ev.island' : touching.size === 1 ? 'sw.ev.grow' : 'sw.ev.merge';
    push(key, [t, at([r, c]), touching.size], { t, cur: [r, c] });
    if (wet[0] && wet[total - 1] && find(0) === find(total - 1)) {
      push('sw.ev.done', [t, n], { t, cur: [r, c], path: wetPath(grid, t) });
      return { events, answer: t };
    }
  }
  return { events, answer: total - 1 };
}

/** A path of cells with height ≤ t from (0, 0) to the far corner, found by BFS (only for the picture). */
function wetPath(grid, t) {
  const n = grid.length, from = grid.map(r => r.map(() => null)), queue = [[0, 0]];
  from[0][0] = [-1, -1];
  for (let head = 0; head < queue.length; head++) {
    const [r, c] = queue[head];
    if (r === n - 1 && c === n - 1) break;
    for (const [dr, dc] of DIRS4) {
      const y = r + dr, x = c + dc;
      if (!inside(grid, y, x) || from[y][x] || grid[y][x] > t) continue;
      from[y][x] = [r, c];
      queue.push([y, x]);
    }
  }
  const out = [];
  for (let p = [n - 1, n - 1]; p && p[0] >= 0; p = from[p[0]][p[1]]) out.unshift(p);
  return out;
}
