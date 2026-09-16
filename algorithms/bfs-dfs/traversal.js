/**
 * Чистая модель обхода графа: генерация данных, BFS, DFS и лента событий.
 * Ничего не знает про DOM — поэтому её можно проверять тестами (tests/traversal.test.js).
 */
import { rng } from '../../assets/rand.js?v=202609161554';

export const DIRS4 = [[0, -1], [1, 0], [0, 1], [-1, 0]];
export const DIRS8 = [[0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];

export const WALL = 1;
export const FREE = 0;

/* ------------------------------------------------------------------ сетка */

export function gridId(grid, x, y) { return y * grid.cols + x; }
export function gridXY(grid, id) { return [id % grid.cols, Math.floor(id / grid.cols)]; }
export function inside(grid, x, y) { return x >= 0 && y >= 0 && x < grid.cols && y < grid.rows; }

/** Соседи клетки: 4 или 8 направлений, стены пропускаются. */
export function gridNeighbors(grid, diagonal = false) {
  const dirs = diagonal ? DIRS8 : DIRS4;
  return id => {
    const [x, y] = gridXY(grid, id);
    const out = [];
    for (const [dx, dy] of dirs) {
      const nx = x + dx, ny = y + dy;
      if (!inside(grid, nx, ny)) continue;
      const nid = ny * grid.cols + nx;
      if (grid.cells[nid] === WALL) continue;
      out.push(nid);
    }
    return out;
  };
}

function emptyGrid(cols, rows) {
  return { cols, rows, cells: new Uint8Array(cols * rows), start: 0, goal: cols * rows - 1, kind: 'cave', seed: 0 };
}

/** Пещера: случайные стены заданной плотности. Проходимость гарантируется прокопанным коридором. */
export function makeCave({ cols, rows, density = 0.28, seed = 1 }) {
  const g = emptyGrid(cols, rows);
  g.seed = seed; g.kind = 'cave';
  const rand = rng(seed);
  for (let i = 0; i < g.cells.length; i++) g.cells[i] = rand() < density ? WALL : FREE;
  g.start = gridId(g, 1, Math.floor(rows / 2));
  g.goal = gridId(g, cols - 2, Math.floor(rows / 2));
  g.cells[g.start] = FREE;
  g.cells[g.goal] = FREE;
  ensureReachable(g);
  return g;
}

/** Идеальный лабиринт (randomized DFS) — у любой пары клеток ровно один путь. */
export function makeMaze({ cols, rows, seed = 1 }) {
  const g = emptyGrid(cols, rows);
  g.seed = seed; g.kind = 'maze';
  g.cells.fill(WALL);
  const rand = rng(seed);
  const cx = Math.floor((cols - 1) / 2), cy = Math.floor((rows - 1) / 2);
  const cellAt = (i, j) => gridId(g, i * 2 + 1, j * 2 + 1);
  const seen = new Uint8Array(cx * cy);
  const stack = [0];
  seen[0] = 1;
  g.cells[cellAt(0, 0)] = FREE;
  while (stack.length) {
    const cur = stack[stack.length - 1];
    const i = cur % cx, j = Math.floor(cur / cx);
    const options = [];
    for (const [dx, dy] of DIRS4) {
      const ni = i + dx, nj = j + dy;
      if (ni < 0 || nj < 0 || ni >= cx || nj >= cy) continue;
      if (seen[nj * cx + ni]) continue;
      options.push([ni, nj]);
    }
    if (!options.length) { stack.pop(); continue; }
    const [ni, nj] = options[Math.floor(rand() * options.length)];
    seen[nj * cx + ni] = 1;
    g.cells[cellAt(ni, nj)] = FREE;
    g.cells[gridId(g, i * 2 + 1 + (ni - i), j * 2 + 1 + (nj - j))] = FREE;
    stack.push(nj * cx + ni);
  }
  g.start = cellAt(0, 0);
  g.goal = cellAt(cx - 1, cy - 1);
  return g;
}

export function makeGrid(opts) {
  return opts.kind === 'maze' ? makeMaze(opts) : makeCave(opts);
}

/** Если цель недостижима — прокапывает Г-образный коридор от старта к цели. */
export function ensureReachable(grid) {
  const nb = gridNeighbors(grid, false);
  const run = traverse({ start: grid.start, neighbors: nb, order: 'bfs', nodeCount: grid.cells.length, record: false });
  if (run.visitIndex[grid.goal] >= 0) return grid;
  const [sx, sy] = gridXY(grid, grid.start), [gx, gy] = gridXY(grid, grid.goal);
  for (let x = Math.min(sx, gx); x <= Math.max(sx, gx); x++) grid.cells[gridId(grid, x, sy)] = FREE;
  for (let y = Math.min(sy, gy); y <= Math.max(sy, gy); y++) grid.cells[gridId(grid, gx, y)] = FREE;
  return grid;
}

/* ------------------------------------------------------------------ граф */

/**
 * Граф с координатами для отрисовки.
 * kind: 'geo' — геометрический (соседи по близости), 'tree' — дерево, 'ring' — кольцо с хордами.
 */
export function makeGraph({ nodes = 14, kind = 'geo', seed = 1, extra = 0.35 } = {}) {
  const rand = rng(seed);
  const pts = [];
  if (kind === 'ring') {
    for (let i = 0; i < nodes; i++) {
      const a = i / nodes * Math.PI * 2 - Math.PI / 2;
      pts.push({ x: 0.5 + Math.cos(a) * 0.38, y: 0.5 + Math.sin(a) * 0.4 });
    }
  } else if (kind === 'tree') {
    const depth = [];
    for (let i = 0; i < nodes; i++) depth.push(i === 0 ? 0 : depth[Math.floor((i - 1) / 2)] + 1);
    const levels = Math.max(...depth) + 1;
    const perLevel = depth.reduce((m, d) => (m[d] = (m[d] || 0) + 1, m), {});
    const usedLevel = {};
    for (let i = 0; i < nodes; i++) {
      const d = depth[i];
      usedLevel[d] = (usedLevel[d] || 0) + 1;
      pts.push({ x: usedLevel[d] / (perLevel[d] + 1), y: 0.12 + d / Math.max(1, levels - 1) * 0.76 });
    }
  } else {
    for (let i = 0; i < nodes; i++) {
      let best = null;
      for (let t = 0; t < 24; t++) {
        const c = { x: 0.08 + rand() * 0.84, y: 0.1 + rand() * 0.8 };
        const d = pts.reduce((m, p) => Math.min(m, Math.hypot(p.x - c.x, p.y - c.y)), 9);
        if (!best || d > best.d) best = { c, d };
      }
      pts.push(best.c);
    }
  }

  const adj = Array.from({ length: nodes }, () => []);
  const link = (a, b) => {
    if (a === b || adj[a].includes(b)) return;
    adj[a].push(b); adj[b].push(a);
  };

  if (kind === 'tree') {
    for (let i = 1; i < nodes; i++) link(i, Math.floor((i - 1) / 2));
  } else if (kind === 'ring') {
    for (let i = 0; i < nodes; i++) link(i, (i + 1) % nodes);
    const chords = Math.round(nodes * extra);
    for (let i = 0; i < chords; i++) link(Math.floor(rand() * nodes), Math.floor(rand() * nodes));
  } else {
    // остовное дерево по ближайшему уже подключённому узлу — граф гарантированно связный
    const connected = [0];
    for (let i = 1; i < nodes; i++) {
      let best = connected[0], bd = Infinity;
      for (const j of connected) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < bd) { bd = d; best = j; }
      }
      link(i, best);
      connected.push(i);
    }
    const extras = Math.round(nodes * extra);
    const pairs = [];
    for (let i = 0; i < nodes; i++) for (let j = i + 1; j < nodes; j++) {
      if (adj[i].includes(j)) continue;
      pairs.push([i, j, Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y)]);
    }
    pairs.sort((a, b) => a[2] - b[2]);
    for (let i = 0; i < Math.min(extras, pairs.length); i++) {
      const pick = pairs[Math.floor(rand() * Math.min(pairs.length, extras * 3))] || pairs[i];
      link(pick[0], pick[1]);
    }
  }

  adj.forEach(list => list.sort((a, b) => a - b));
  return { nodes, kind, seed, pts, adj, start: 0, goal: nodes - 1, label: i => String.fromCharCode(65 + i % 26) + (i >= 26 ? Math.floor(i / 26) : '') };
}

export const graphNeighbors = graph => id => graph.adj[id];

/* ------------------------------------------------------------------ обход */

/**
 * Разворачивает обход в ленту событий: каждое событие — один шаг плеера.
 * Событие: { t, node, from, line, frontier, order, depth, note }
 */
export function traverse({ start, neighbors, order = 'bfs', goal = null, stopAtGoal = true, nodeCount, record = true }) {
  const n = nodeCount;
  const parent = new Int32Array(n).fill(-1);
  const depth = new Int32Array(n).fill(-1);
  const visitIndex = new Int32Array(n).fill(-1);
  const events = [];
  const snap = f => record ? f.slice() : null;
  const push = e => { if (record) events.push(e); };

  let k = 0, found = false;
  const bfs = order === 'bfs';
  const frontier = [start];
  depth[start] = 0;
  const seen = new Uint8Array(n);
  seen[start] = 1;

  push({ t: 'init', node: start, line: 1, frontier: snap(frontier), note: bfs ? 'Кладём старт в очередь' : 'Кладём старт в стек' });

  let head = 0; // указатель головы очереди — dequeue за O(1)
  while (bfs ? head < frontier.length : frontier.length) {
    const v = bfs ? frontier[head++] : frontier.pop();
    const rest = bfs ? frontier.slice(head) : frontier;
    push({ t: 'pop', node: v, line: 4, frontier: snap(rest), note: bfs ? 'Берём из головы очереди' : 'Снимаем с вершины стека' });

    if (!bfs && visitIndex[v] >= 0) {
      push({ t: 'dup', node: v, line: 5, frontier: snap(rest), note: 'Уже посещён — пропускаем' });
      continue;
    }

    visitIndex[v] = k++;
    push({ t: 'visit', node: v, line: bfs ? 5 : 6, frontier: snap(rest), order: visitIndex[v], depth: depth[v], note: 'Посещаем' });

    if (goal != null && v === goal) {
      found = true;
      push({ t: 'goal', node: v, line: bfs ? 5 : 6, frontier: snap(rest), note: 'Цель найдена' });
      if (stopAtGoal) break;
    }

    const nb = neighbors(v);
    const seq = bfs ? nb : nb.slice().reverse();
    for (const u of seq) {
      if (bfs ? seen[u] : visitIndex[u] >= 0) {
        push({ t: 'skip', node: u, from: v, line: bfs ? 7 : 8, frontier: snap(bfs ? frontier.slice(head) : frontier), note: bfs ? 'Уже открыт' : 'Уже посещён' });
        continue;
      }
      if (bfs) seen[u] = 1;
      parent[u] = v;
      depth[u] = depth[v] + 1;
      frontier.push(u);
      push({ t: 'push', node: u, from: v, line: 9, frontier: snap(bfs ? frontier.slice(head) : frontier), depth: depth[u], note: bfs ? 'В хвост очереди' : 'На вершину стека' });
    }
  }

  push({ t: 'done', line: 3, frontier: [], found, note: found ? 'Цель достигнута' : 'Фронт пуст — обход закончен' });

  return {
    order, events, parent, depth, visitIndex, found,
    visited: k,
    path: goal == null ? [] : pathTo(parent, visitIndex, goal)
  };
}

/** Путь от старта до узла по массиву родителей (пустой, если узел не посещён). */
export function pathTo(parent, visitIndex, node) {
  if (visitIndex[node] < 0) return [];
  const path = [];
  for (let v = node; v >= 0; v = parent[v]) {
    path.push(v);
    if (path.length > parent.length) break;
  }
  return path.reverse();
}

/**
 * Состояние обхода после первых (index + 1) событий.
 * Позволяет мотать ленту в обе стороны без пересчёта самого алгоритма.
 */
export function stateAt(run, index, nodeCount) {
  const visitIndex = new Int32Array(nodeCount).fill(-1);
  const parent = new Int32Array(nodeCount).fill(-1);
  const depth = new Int32Array(nodeCount).fill(-1);
  const inFrontier = new Uint8Array(nodeCount);
  let current = -1, frontier = [], done = false, found = false, visited = 0;

  const last = Math.min(index, run.events.length - 1);
  for (let i = 0; i <= last; i++) {
    const e = run.events[i];
    if (e.frontier) frontier = e.frontier;
    if (e.t === 'init') { depth[e.node] = 0; current = e.node; }
    if (e.t === 'pop' || e.t === 'dup') current = e.node;
    if (e.t === 'visit') { visitIndex[e.node] = e.order; depth[e.node] = e.depth; current = e.node; visited++; }
    if (e.t === 'push') { parent[e.node] = e.from; depth[e.node] = e.depth; }
    if (e.t === 'goal') found = true;
    if (e.t === 'done') { done = true; current = -1; }
  }
  inFrontier.fill(0);
  for (const id of frontier) inFrontier[id] = 1;
  return { visitIndex, parent, depth, frontier, inFrontier, current, done, found, visited, event: run.events[last], index: last };
}
