/**
 * Pure traces added to existing chapters: Reverse Bits (bits), Divide Two Integers (binary search on the quotient's
 * bits), K Closest Points (heap), Clone Graph (DFS/BFS), Min Cost to Connect All Points and Pacific Atlantic
 * (games). Same contract as model-a.js: every event is a complete snapshot with an i18n key and its arguments.
 */
const event = (key, args, state) => ({ key, args, ...state });
const copy = m => m.map(r => [...r]);

/* ---------- Reverse Bits ---------- */
/** The five block swaps of the mask version: [block width, mask of the high blocks, mask of the low blocks]. */
export const REVERSE_MASKS = [
  [16, 0xFFFF0000, 0x0000FFFF],
  [8, 0xFF00FF00, 0x00FF00FF],
  [4, 0xF0F0F0F0, 0x0F0F0F0F],
  [2, 0xCCCCCCCC, 0x33333333],
  [1, 0xAAAAAAAA, 0x55555555],
];

/**
 * mode 'loop': 32 rounds of r = (r << 1) | (n & 1); n >>= 1 — the low bit of n is pushed into r from the right,
 * so the bit taken in round i ends at bit 31 − i once all 32 rounds are done (rounds with n = 0 still matter).
 * mode 'masks': swap the halves, then bytes, nibbles, pairs and bits inside every block — five steps.
 * Values are uint32 (JS numbers ≥ 0).
 */
export function reverseBitsTrace(n0, mode = 'loop') {
  const start = n0 >>> 0, events = [];
  if (mode === 'masks') {
    let n = start;
    events.push(event('rb.ev.masks', [start], { mode, n, before: null, step: 0, width: null, hi: null, lo: null }));
    REVERSE_MASKS.forEach(([width, hi, lo], s) => {
      const before = n;
      n = (((n & hi) >>> width) | ((n & lo) << width)) >>> 0;
      events.push(event(width === 16 ? 'rb.ev.halves' : 'rb.ev.swap', [width, before, n, s + 1, hi >>> 0, lo >>> 0],
        { mode, n, before, step: s + 1, width, hi: hi >>> 0, lo: lo >>> 0 }));
    });
    events.push(event('rb.ev.masksDone', [start, n], { mode, n, before: null, step: 5, width: null, hi: null, lo: null }));
    return { events, answer: n };
  }
  let n = start, r = 0;
  events.push(event('rb.ev.start', [start], { mode, i: 0, n, r, bit: null, before: null }));
  for (let i = 0; i < 32; i++) {
    const before = n, bit = n & 1;
    r = ((r << 1) | bit) >>> 0;
    n >>>= 1;
    const key = before === 0 ? 'rb.ev.pad' : bit ? 'rb.ev.one' : 'rb.ev.zero';
    events.push(event(key, [i + 1, bit, i, 31 - i, r, n], { mode, i: i + 1, n, r, bit, before }));
  }
  events.push(event('rb.ev.done', [start, r], { mode, i: 32, n, r, bit: null, before: null }));
  return { events, answer: r };
}

/* ---------- Divide Two Integers ---------- */
export const INT_MIN = -2147483648, INT_MAX = 2147483647;

/**
 * Long division in binary, in long: |dividend| and |divisor| fit (|int.MinValue| = 2^31 does not fit an int).
 * k runs from 31 down to 0; when (a >> k) >= b, b · 2^k still fits into what is left of a: subtract it and set
 * bit k of the quotient. Deciding the bits from the top halves the range of the quotient every step — a binary
 * search on the answer. The leading k with a >> k < b are one event. int.MinValue / −1 = 2^31 overflows:
 * LeetCode wants int.MaxValue.
 */
export function divideTrace(dividend, divisor) {
  const events = [];
  const base = { a: null, b: null, q: 0, k: null, shifted: null, sub: null, before: null, top: null, neg: null };
  const push = (key, args, extra = {}) => events.push(event(key, args, { ...base, ...extra }));
  push('div.ev.start', [dividend, divisor]);
  if (dividend === INT_MIN && divisor === -1) {
    push('div.ev.overflow', [dividend, divisor, INT_MAX]);
    return { events, answer: INT_MAX, overflow: true };
  }
  const neg = (dividend < 0) !== (divisor < 0);
  let a = Math.abs(dividend), q = 0;
  const b = Math.abs(divisor);
  let top = -1;
  for (let k = 31; k >= 0; k--) if (Math.floor(a / 2 ** k) >= b) { top = k; break; }
  Object.assign(base, { a, b, neg, top });
  push(neg ? 'div.ev.signNeg' : 'div.ev.signPos', [dividend, divisor, a, b]);
  if (top < 31) push('div.ev.lead', [31, top + 1, a, b, top], { k: top + 1 });
  for (let k = top; k >= 0; k--) {
    const before = a, shifted = Math.floor(a / 2 ** k);
    if (shifted >= b) {
      const sub = b * 2 ** k;
      a -= sub;
      q += 2 ** k;
      base.a = a;
      base.q = q;
      push('div.ev.fit', [k, shifted, b, sub, a, q, before], { k, shifted, sub, before });
    } else push('div.ev.skip', [k, shifted, b, a, q], { k, shifted, before });
  }
  const answer = neg ? -q : q;
  push('div.ev.done', [dividend, divisor, answer, a, neg, q]);
  return { events, answer, overflow: false };
}

/* ---------- K Closest Points to Origin ---------- */
/**
 * A max-heap of point indices by d = x² + y², at most k + 1 long: a new point goes to the bottom and rises past
 * every nearer parent; with k + 1 points the root — the farthest — leaves. Exactly the heap of the C# solution:
 * strict >, so equal distances never swap.
 */
export function kClosestTrace(points, k) {
  const d = points.map(([x, y]) => x * x + y * y), heap = [], status = points.map(() => null), events = [];
  const push = (key, args, extra = {}) => events.push(event(key, args, { heap: [...heap], status: [...status], cur: null, mark: null, ...extra }));
  const swap = (i, j) => { [heap[i], heap[j]] = [heap[j], heap[i]]; };
  push('kc.ev.start', [k, points.length]);
  points.forEach(([x, y], i) => {
    heap.push(i);
    status[i] = 'in';
    let j = heap.length - 1;
    push('kc.ev.add', [i, x, y, d[i], heap.length, k], { cur: i, mark: j });
    while (j > 0 && d[heap[j]] > d[heap[(j - 1) >> 1]]) {
      const p = (j - 1) >> 1, above = heap[p];
      swap(j, p);
      j = p;
      push('kc.ev.up', [i, d[i], above, d[above], j], { cur: i, mark: j });
    }
    if (heap.length > k) {
      const gone = heap[0];
      heap[0] = heap.at(-1);
      heap.pop();
      for (let p = 0; ;) {
        const l = 2 * p + 1, r = l + 1;
        let m = p;
        if (l < heap.length && d[heap[l]] > d[heap[m]]) m = l;
        if (r < heap.length && d[heap[r]] > d[heap[m]]) m = r;
        if (m === p) break;
        swap(p, m);
        p = m;
      }
      status[gone] = 'out';
      const [gx, gy] = points[gone];
      push(gone === i ? 'kc.ev.dropNew' : 'kc.ev.drop', [gone, gx, gy, d[gone], heap.length ? d[heap[0]] : null, i], { cur: i, gone });
    }
  });
  const answer = heap.map(i => [...points[i]]);
  push('kc.ev.done', [answer, k, heap.length ? d[heap[0]] : 0]);
  return { events, answer, d };
}

/* ---------- Clone Graph ---------- */
/** Undirected edges on 1..n → neighbour lists sorted ascending (LeetCode’s adjList, index 0 = node 1). */
export function adjacencyOf(n, edges) {
  const adj = Array.from({ length: n + 1 }, () => []);
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a); }
  adj.forEach(list => list.sort((x, y) => x - y));
  return adj;
}

/**
 * BFS from node 1 with the dictionary old → copy. A neighbour met for the first time gets its copy and joins the
 * queue; a neighbour that already has a copy only gets the reference. refs — the references every copy holds, in
 * the order they were added: [from, to] means to′ is in from′.neighbors.
 */
export function cloneGraphTrace(n, edges) {
  const adj = adjacencyOf(n, edges), copies = [1], refs = [], done = [], events = [];
  let queue = [1];
  const push = (key, args, extra = {}) => events.push(event(key, args, {
    copies: [...copies], refs: refs.map(r => [...r]), queue: [...queue], done: [...done], cur: null, nb: null, ...extra,
  }));
  push('cg.ev.start', [n, edges.length]);
  push('cg.ev.root', [1]);
  while (queue.length) {
    const cur = queue[0];
    queue = queue.slice(1);
    push('cg.ev.pop', [cur, adj[cur]], { cur });
    for (const nb of adj[cur]) {
      const fresh = !copies.includes(nb);
      if (fresh) { copies.push(nb); queue = [...queue, nb]; }
      const state = fresh ? 'new' : nb === cur ? 'self' : done.includes(nb) ? 'done' : 'queued';
      refs.push([cur, nb]);
      push(fresh ? 'cg.ev.new' : 'cg.ev.link', [cur, nb, state], { cur, nb });
    }
    done.push(cur);
  }
  push('cg.ev.done', [copies.length, refs.length, edges.length]);
  return { events, adj, copies, refs };
}

/* ---------- Min Cost to Connect All Points (Kruskal) ---------- */
export const manhattan = ([x1, y1], [x2, y2]) => Math.abs(x1 - x2) + Math.abs(y1 - y2);

/**
 * Every pair is an edge weighted by the Manhattan distance; sort them by (w, i, j) — the order of a C# tuple sort —
 * and take an edge whenever Union joins two different components. Stop after n − 1 taken edges.
 * Union-Find with path compression and union by rank; comp[v] is the root of v after the step.
 */
export function kruskalTrace(points) {
  const n = points.length, edges = [], events = [];
  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) edges.push([manhattan(points[i], points[j]), i, j]);
  edges.sort((x, y) => x[0] - y[0] || x[1] - y[1] || x[2] - y[2]);
  const parent = points.map((_, i) => i), rank = points.map(() => 0), status = edges.map(() => null);
  const find = x => (parent[x] === x ? x : (parent[x] = find(parent[x])));
  let total = 0, taken = 0;
  const push = (key, args, extra = {}) => events.push(event(key, args, {
    edges, status: [...status], e: null, total, taken, comp: points.map((_, v) => find(v)), ...extra,
  }));
  push('kr.ev.start', [n, edges.length]);
  if (n > 1) push('kr.ev.sort', [edges.length, edges[0][0], edges.at(-1)[0]]);
  for (let e = 0; e < edges.length && taken < n - 1; e++) {
    const [w, i, j] = edges[e];
    let a = find(i), b = find(j);
    if (a === b) {
      status[e] = 'skip';
      push('kr.ev.skip', [i, j, w, a, total], { e });
      continue;
    }
    if (rank[a] < rank[b]) [a, b] = [b, a];
    parent[b] = a;
    if (rank[a] === rank[b]) rank[a]++;
    total += w;
    taken++;
    status[e] = 'take';
    push('kr.ev.take', [i, j, w, total, taken, n - 1], { e });
  }
  const looked = status.filter(s => s !== null).length;
  push('kr.ev.done', [total, n - 1, edges.length - looked, edges.length]);
  return { events, total, edges };
}

/* ---------- Pacific Atlantic Water Flow ---------- */
const DIRS4 = [[-1, 0], [0, 1], [1, 0], [0, -1]];

/**
 * Water runs to a neighbour that is not higher. Instead of a search from every cell, search backwards from each
 * ocean: BFS from its border cells, stepping only to a neighbour that is at least as high (uphill). The cells
 * reached by both searches drain into both oceans. Pacific — the top row and the left column; Atlantic — the
 * bottom row and the right column.
 */
export function pacificAtlanticTrace(h) {
  const m = h.length, n = h[0].length, events = [];
  const reach = { P: h.map(r => r.map(() => false)), A: h.map(r => r.map(() => false)) };
  let ocean = null;
  const push = (key, args, extra = {}) => events.push(event(key, args, {
    ocean, pac: copy(reach.P), atl: copy(reach.A), queue: [], cur: null, added: [], ...extra,
  }));
  push('pa.ev.start', [m, n]);
  for (const side of ['P', 'A']) {
    ocean = side;
    const queue = [], seen = reach[side];
    const seed = (r, c) => { if (!seen[r][c]) { seen[r][c] = true; queue.push([r, c]); } };
    for (let c = 0; c < n; c++) seed(side === 'P' ? 0 : m - 1, c);
    for (let r = 0; r < m; r++) seed(r, side === 'P' ? 0 : n - 1);
    push('pa.ev.seed', [side, queue.length], { queue: queue.map(p => [...p]) });
    for (let head = 0; head < queue.length; head++) {
      const [r, c] = queue[head], added = [];
      let lower = 0;
      for (const [dr, dc] of DIRS4) {
        const y = r + dr, x = c + dc;
        if (y < 0 || x < 0 || y >= m || x >= n || seen[y][x]) continue;
        if (h[y][x] < h[r][c]) { lower++; continue; }
        seen[y][x] = true;
        queue.push([y, x]);
        added.push([y, x, h[y][x]]);
      }
      push(added.length ? 'pa.ev.climb' : 'pa.ev.stuck', [side, r, c, h[r][c], added, lower],
        { cur: [r, c], added, queue: queue.slice(head + 1).map(p => [...p]) });
    }
  }
  ocean = null;
  const both = [];
  for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (reach.P[r][c] && reach.A[r][c]) both.push([r, c]);
  push('pa.ev.both', [both, m * n]);
  return { events, answer: both, pac: reach.P, atl: reach.A };
}
