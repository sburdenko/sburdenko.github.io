/**
 * Pure traces for shortest paths. BFS when every step costs 1, Dijkstra when steps have weights.
 * Same contract as model-a.js: every event is a complete snapshot with an i18n key and its arguments.
 */
const event = (key, args, state) => ({ key, args, ...state });
const copy = m => m.map(r => [...r]);
const DIRS = [[-1, 0], [0, 1], [1, 0], [0, -1]];
const inside = (m, r, c) => r >= 0 && c >= 0 && r < m.length && c < m[0].length;

/** A priority queue small enough to show whole: entries stay sorted by (priority, then the rest). */
function pqPush(pq, entry) {
  const less = (a, b) => { for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] < b[i]; return false; };
  let at = pq.length;
  while (at > 0 && less(entry, pq[at - 1])) at--;
  pq.splice(at, 0, entry);
}

/* ---------- 01 Matrix ---------- */
/** Multi-source BFS: every 0 enters the queue at distance 0, and the wave reaches each 1 from its nearest 0 first. */
export function nearestZeroTrace(mat) {
  const dist = mat.map(r => r.map(v => (v ? null : 0))), queue = [], events = [];
  mat.forEach((row, r) => row.forEach((v, c) => { if (!v) queue.push([r, c]); }));
  let head = 0, level = 0;
  const push = (key, args, extra = {}) => events.push(event(key, args, {
    dist: copy(dist), cur: null, newly: [], queue: queue.slice(head).map(p => [...p]), level, ...extra,
  }));
  push('zom.ev.start', [queue.length, mat.flat().length - queue.length]);
  while (head < queue.length) {
    const [r, c] = queue[head], d = dist[r][c];
    if (d > level) {
      level = d;
      push('zom.ev.level', [d, queue.length - head]);
    }
    head++;
    const newly = [];
    for (const [dr, dc] of DIRS) {
      const y = r + dr, x = c + dc;
      if (!inside(mat, y, x) || dist[y][x] !== null) continue;
      dist[y][x] = d + 1;                 // marked on enqueue: nobody can offer a shorter distance later
      queue.push([y, x]);
      newly.push([y, x]);
    }
    push(newly.length ? 'zom.ev.pop' : 'zom.ev.skip', [r, c, d, newly.length, d + 1], { cur: [r, c], newly });
  }
  const max = Math.max(...dist.flat());
  push('zom.ev.done', [max]);
  return { events, dist };
}

/* ---------- Network Delay Time ---------- */
/** Dijkstra with lazy deletion: an improved distance pushes a new entry, the old one stays and is skipped when it surfaces. */
export function networkDelayTrace(times, n, k) {
  const adj = Array.from({ length: n + 1 }, () => []);
  times.forEach(([u, v, w], id) => adj[u].push([v, w, id]));
  const dist = Array(n + 1).fill(Infinity), parent = Array(n + 1).fill(-1), done = [], pq = [], events = [];
  dist[k] = 0;
  pqPush(pq, [0, k]);
  const push = (key, args, extra = {}) => events.push(event(key, args, {
    dist: [...dist], parent: [...parent], done: [...done], pq: pq.map(p => [...p]), cur: null, edge: null, edgeCls: null, ...extra,
  }));
  push('ndt.ev.start', [k, n]);
  while (pq.length) {
    const [d, u] = pq.shift();
    if (d > dist[u]) {
      push('ndt.ev.stale', [u, d, dist[u]], { cur: u, popped: [d, u] });
      continue;
    }
    done.push(u);
    push('ndt.ev.pop', [u, d, adj[u].length], { cur: u, popped: [d, u] });
    for (const [v, w, id] of adj[u]) {
      const cand = d + w, old = dist[v];
      if (cand < old) {
        dist[v] = cand;
        parent[v] = id;
        pqPush(pq, [cand, v]);
        push('ndt.ev.relax', [u, v, w, d, cand, old === Infinity ? '∞' : old], { cur: u, edge: id, edgeCls: 'on' });
      } else {
        push('ndt.ev.keep', [u, v, w, d, cand, old], { cur: u, edge: id, edgeCls: 'miss' });
      }
    }
  }
  const lost = dist.map((d, v) => (v && d === Infinity ? v : null)).filter(v => v !== null);
  const answer = lost.length ? -1 : Math.max(...dist.slice(1));
  if (lost.length) push('ndt.ev.unreach', [lost]);
  else push('ndt.ev.done', [answer, dist.indexOf(answer, 1)]);
  return { events, answer, dist };
}

/* ---------- Path With Minimum Effort ---------- */
/** Dijkstra where a path costs its steepest step: max(effort so far, |height difference|) instead of a sum. */
export function minEffortTrace(h) {
  const rows = h.length, cols = h[0].length, effort = h.map(r => r.map(() => Infinity)), from = h.map(r => r.map(() => null));
  const done = h.map(r => r.map(() => false)), pq = [], events = [];
  effort[0][0] = 0;
  pqPush(pq, [0, 0, 0]);
  const push = (key, args, extra = {}) => events.push(event(key, args, {
    effort: copy(effort), done: copy(done), pq: pq.map(p => [...p]), cur: null, improved: [], path: [], ...extra,
  }));
  push('eff.ev.start', [rows, cols]);
  while (pq.length) {
    const [e, r, c] = pq.shift();
    if (e > effort[r][c]) {
      push('eff.ev.stale', [r, c, e, effort[r][c]], { cur: [r, c] });
      continue;
    }
    done[r][c] = true;
    if (r === rows - 1 && c === cols - 1) {
      const path = [];
      for (let p = [r, c]; p; p = from[p[0]][p[1]]) path.unshift(p);
      push('eff.ev.done', [e, path.map(([y, x]) => h[y][x])], { cur: [r, c], path });
      return { events, effort: e };
    }
    const improved = [];
    for (const [dr, dc] of DIRS) {
      const y = r + dr, x = c + dc;
      if (!inside(h, y, x) || done[y][x]) continue;
      const step = Math.abs(h[y][x] - h[r][c]), cost = Math.max(e, step);
      if (cost >= effort[y][x]) continue;
      effort[y][x] = cost;
      from[y][x] = [r, c];
      pqPush(pq, [cost, y, x]);
      improved.push([y, x, step, cost]);
    }
    push(improved.length ? 'eff.ev.relax' : 'eff.ev.settle', [r, c, e, improved.map(([y, x, step, cost]) => `(${y}, ${x}): max(${e}, ${step}) = ${cost}`)],
      { cur: [r, c], improved: improved.map(([y, x]) => [y, x]) });
  }
  return { events, effort: effort[rows - 1][cols - 1] };
}

/* ---------- Shortest Path in a Grid with Obstacles Elimination ---------- */
/**
 * BFS over states (r, c, rem): rem is how many walls may still be broken. The same cell with more rem left
 * is a different, more hopeful state, so visited is keyed by all three.
 */
export function obstaclesTrace(grid, k) {
  const rows = grid.length, cols = grid[0].length, states = [], seen = new Set(), events = [];
  const visits = grid.map(r => r.map(() => []));
  const steps = grid.map(r => r.map(() => null));
  let head = 0;
  const add = (r, c, rem, d, parent) => {
    seen.add(`${r},${c},${rem}`);
    states.push({ r, c, rem, d, parent });
    visits[r][c].push(rem);
    if (steps[r][c] === null) steps[r][c] = d;
    return states.length - 1;
  };
  const pathOf = id => { const out = []; for (let s = id; s >= 0; s = states[s].parent) out.unshift([states[s].r, states[s].c]); return out; };
  const push = (key, args, extra = {}) => events.push(event(key, args, {
    visits: visits.map(r => r.map(v => [...v])), steps: copy(steps), cur: null, rem: null, newly: [],
    queue: states.slice(head).map(s => [s.r, s.c, s.rem]), path: [], ...extra,
  }));
  add(0, 0, k, 0, -1);
  push('obs.ev.start', [k, rows, cols]);
  if (rows === 1 && cols === 1) {
    push('obs.ev.found', [0, 0, 0, k], { path: [[0, 0]] });
    return { events, steps: 0 };
  }
  while (head < states.length) {
    const id = head++, s = states[id], newly = [];
    let broke = 0, blocked = 0;
    for (const [dr, dc] of DIRS) {
      const y = s.r + dr, x = s.c + dc;
      if (!inside(grid, y, x)) continue;
      const rem = s.rem - grid[y][x];
      if (rem < 0) { blocked++; continue; }
      if (seen.has(`${y},${x},${rem}`)) continue;
      const nid = add(y, x, rem, s.d + 1, id);
      newly.push([y, x, rem]);
      if (grid[y][x]) broke++;
      if (y === rows - 1 && x === cols - 1) {
        push('obs.ev.found', [s.d + 1, y, x, rem], { cur: [s.r, s.c], rem: s.rem, newly, path: pathOf(nid) });
        return { events, steps: s.d + 1 };
      }
    }
    const key = !newly.length ? 'obs.ev.dead' : broke ? 'obs.ev.smash' : 'obs.ev.step';
    push(key, [s.r, s.c, s.rem, s.d, newly.length, broke, blocked], { cur: [s.r, s.c], rem: s.rem, newly });
  }
  push('obs.ev.none', [k]);
  return { events, steps: -1 };
}
