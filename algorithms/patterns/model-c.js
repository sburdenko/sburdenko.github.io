/** Pure traces for chapters 09–12: heap, backtracking, greedy, dynamic programming. Same contract as model-a.js. */
const event = (key, args, state) => ({ key, args, ...state });
const byValue = (a, b) => a < b;

/* ---------- 09 heap ---------- */
/** Binary heap on a plain array. `less` decides who rises to the top: a < b gives a min-heap. */
export function heapPush(heap, x, less = byValue) {
  const a = [...heap, x];
  let i = a.length - 1;
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (!less(a[i], a[p])) break;
    [a[p], a[i]] = [a[i], a[p]];
    i = p;
  }
  return { heap: a, at: i };
}

export function heapPop(heap, less = byValue) {
  const a = heap.slice(0, -1);
  if (!a.length) return a;
  a[0] = heap.at(-1);
  let i = 0;
  for (;;) {
    const l = 2 * i + 1, r = l + 1;
    let m = i;
    if (l < a.length && less(a[l], a[m])) m = l;
    if (r < a.length && less(a[r], a[m])) m = r;
    if (m === i) return a;
    [a[m], a[i]] = [a[i], a[m]];
    i = m;
  }
}

export function kthLargestTrace(nums, k) {
  let heap = [];
  const events = [];
  const push = (key, args, extra = {}) => events.push(event(key, args, { i: null, heap: [...heap], mark: -1, ...extra }));
  push('heap.ev.start', [k]);
  nums.forEach((x, i) => {
    const pushed = heapPush(heap, x);
    heap = pushed.heap;
    push('heap.ev.push', [x, heap.length, heap.length > k], { i, mark: pushed.at });
    if (heap.length > k) {
      const min = heap[0];
      heap = heapPop(heap);
      push('heap.ev.pop', [min, heap[0], k], { i });
    }
  });
  const kth = heap.length === k ? heap[0] : null;
  push('heap.ev.done', [kth, k], { i: nums.length });
  return { events, kth };
}

export function lastStoneTrace(stones) {
  const max = (a, b) => a > b;
  let heap = stones.reduce((h, s) => heapPush(h, s, max).heap, []);
  const events = [];
  const push = (key, args, extra = {}) => events.push(event(key, args, { heap: [...heap], mark: -1, ...extra }));
  push('stone.ev.start', [heap.length]);
  while (heap.length > 1) {
    const a = heap[0];
    heap = heapPop(heap, max);
    const b = heap[0];
    heap = heapPop(heap, max);
    if (a === b) { push('stone.ev.equal', [a]); continue; }
    const pushed = heapPush(heap, a - b, max);
    heap = pushed.heap;
    push('stone.ev.smash', [a, b, a - b], { mark: pushed.at });
  }
  const last = heap[0] ?? 0;
  push('stone.ev.done', [last]);
  return { events, last };
}

export function mergeKTrace(lists) {
  const less = (a, b) => a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]);
  const heads = lists.map(() => 0), out = [], events = [];
  let heap = lists.reduce((h, list, i) => (list.length ? heapPush(h, [list[0], i], less).heap : h), []);
  const push = (key, args, extra = {}) => events.push(event(key, args, { heads: [...heads], out: [...out], heap: heap.map(p => [...p]), took: null, ...extra }));
  push('mk.ev.start', [lists.length]);
  while (heap.length) {
    const [value, i] = heap[0];
    heap = heapPop(heap, less);
    out.push(value);
    heads[i]++;
    const following = lists[i][heads[i]];
    if (following !== undefined) heap = heapPush(heap, [following, i], less).heap;
    push('mk.ev.take', [value, i + 1, following ?? null], { took: i });
  }
  push('mk.ev.done', [out.length]);
  return { events, result: out };
}

export function medianStreamTrace(nums) {
  const maxFirst = (a, b) => a > b;
  let low = [], high = [];
  const medians = [], events = [];
  const push = (key, args, extra = {}) => events.push(event(key, args, {
    low: [...low].sort((a, b) => a - b), high: [...high].sort((a, b) => a - b), x: null, ...extra,
  }));
  push('mstr.ev.start', []);
  nums.forEach(x => {
    const toLow = !low.length || x <= low[0];
    if (toLow) low = heapPush(low, x, maxFirst).heap; else high = heapPush(high, x).heap;
    let moved = null;
    if (low.length > high.length + 1) {
      moved = [low[0], 'high'];
      high = heapPush(high, low[0]).heap;
      low = heapPop(low, maxFirst);
    } else if (high.length > low.length) {
      moved = [high[0], 'low'];
      low = heapPush(low, high[0], maxFirst).heap;
      high = heapPop(high);
    }
    const median = low.length > high.length ? low[0] : (low[0] + high[0]) / 2;
    medians.push(median);
    push('mstr.ev.add', [x, toLow, moved ? moved[0] : null, moved ? moved[1] : null, median], { x });
  });
  return { events, medians };
}

/* ---------- 10 backtracking ---------- */
/**
 * Builds a decision tree in visiting order. expand(state) returns children
 * [{ state, edge, cut }]; a child with cut: true is shown but never expanded.
 */
function decisionTree(root, expand, label) {
  const nodes = [];
  let leaf = 0;
  const visit = (state, depth, parent, edge, cut) => {
    const id = nodes.length;
    nodes.push({ id, depth, parent, edge, cut, label: cut ? '✕' : label(state), state, leaf: false, x: 0 });
    const kids = cut ? [] : expand(state);
    if (!kids.length) {
      nodes[id] = { ...nodes[id], leaf: true, x: leaf++ };
      return id;
    }
    const ids = kids.map(k => visit(k.state, depth + 1, id, k.edge, !!k.cut));
    nodes[id] = { ...nodes[id], x: (nodes[ids[0]].x + nodes[ids.at(-1)].x) / 2 };
    return id;
  };
  visit(root, 0, -1, null, false);
  return nodes;
}

function walkTree(nodes, isAnswer, keyOf, argsOf, doneKey) {
  const found = [];
  const events = nodes.map(node => {
    const hit = isAnswer(node);
    if (hit) found.push(node.state.path);
    return event(keyOf(node, hit), argsOf(node, hit), { cur: node.id, res: found.map(p => [...p]) });
  });
  events.push(event(doneKey, [found.length], { cur: null, res: found.map(p => [...p]) }));
  return { events, found };
}

export function subsetsTrace(nums) {
  const nodes = decisionTree({ i: 0, path: [] },
    ({ i, path }) => (i === nums.length ? [] : [
      { state: { i: i + 1, path: [...path, nums[i]] }, edge: `+${nums[i]}` },
      { state: { i: i + 1, path }, edge: `−${nums[i]}` },
    ]),
    ({ path }) => (path.length ? path.join(',') : '∅'));
  const { events, found } = walkTree(nodes, n => n.leaf,
    n => (n.parent < 0 ? 'back.ev.start' : n.edge[0] === '+' ? 'back.ev.take' : 'back.ev.skip'),
    (n, hit) => [n.edge ? Number(n.edge.slice(1)) : null, n.state.path, hit], 'back.ev.done');
  return { events, nodes, subsets: found };
}

export function permutationsTrace(nums) {
  const nodes = decisionTree({ path: [] },
    ({ path }) => nums.filter(x => !path.includes(x)).map(x => ({ state: { path: [...path, x] }, edge: `+${x}` })),
    ({ path }) => (path.length ? path.join('') : '∅'));
  const { events, found } = walkTree(nodes, n => n.state.path.length === nums.length,
    (n, hit) => (n.parent < 0 ? 'perm.ev.start' : hit ? 'perm.ev.hit' : 'perm.ev.pick'),
    n => [n.edge ? Number(n.edge.slice(1)) : null, n.state.path, nums.length - n.state.path.length], 'perm.ev.done');
  return { events, nodes, perms: found };
}

export function combinationSumTrace(candidates, target) {
  const sorted = [...candidates].sort((a, b) => a - b);
  const nodes = decisionTree({ start: 0, remain: target, path: [] },
    ({ start, remain, path }) => {
      if (remain === 0) return [];
      const kids = [];
      for (let i = start; i < sorted.length; i++) {
        const c = sorted[i];
        if (c > remain) { kids.push({ state: { start: i, remain: remain - c, path: [...path, c] }, edge: `+${c}`, cut: true }); break; }
        kids.push({ state: { start: i, remain: remain - c, path: [...path, c] }, edge: `+${c}` });
      }
      return kids;
    },
    ({ remain }) => String(remain));
  const { events, found } = walkTree(nodes, n => n.state.remain === 0 && !n.cut,
    (n, hit) => (n.parent < 0 ? 'comb.ev.start' : n.cut ? 'comb.ev.cut' : hit ? 'comb.ev.hit' : 'comb.ev.step'),
    n => [n.edge ? Number(n.edge.slice(1)) : target, n.state.path, n.state.remain + (n.cut ? Number(n.edge.slice(1)) : 0)], 'comb.ev.done');
  return { events, nodes, combos: found };
}

export function nQueensTrace(n, stopAfter = Infinity) {
  const cols = [], events = [];
  let solutions = 0;
  const push = (key, args, extra = {}) => events.push(event(key, args, { queens: [...cols], tryAt: null, clash: null, solutions, ...extra }));
  push('nq.ev.start', [n]);
  const place = row => {
    if (row === n) {
      solutions++;
      push('nq.ev.solution', [solutions]);
      return;
    }
    for (let c = 0; c < n && solutions < stopAfter; c++) {
      const clash = cols.findIndex((qc, qr) => qc === c || Math.abs(qc - c) === row - qr);
      if (clash >= 0) {
        push('nq.ev.clash', [row, c, clash, cols[clash]], { tryAt: [row, c], clash: [clash, cols[clash]] });
        continue;
      }
      cols.push(c);
      push('nq.ev.place', [row, c], { tryAt: [row, c] });
      place(row + 1);
      cols.pop();
      if (solutions < stopAfter) push('nq.ev.undo', [row, c]);
    }
  };
  place(0);
  push('nq.ev.done', [solutions, n, solutions >= stopAfter]);
  return { events, solutions };
}

/* ---------- 11 greedy ---------- */
export function jumpTrace(a) {
  let reach = 0;
  const events = [];
  const push = (key, args, extra = {}) => events.push(event(key, args, { i: null, reach, done: false, stuck: false, ...extra }));
  push('greedy.ev.start', []);
  for (let i = 0; i < a.length; i++) {
    if (i > reach) {
      push('greedy.ev.stuck', [i, reach], { i, stuck: true });
      return { events, ok: false };
    }
    const before = reach;
    reach = Math.max(reach, i + a[i]);
    const done = reach >= a.length - 1;
    push(done ? 'greedy.ev.win' : a[i] === 0 ? 'greedy.ev.zero' : 'greedy.ev.step', [i, before, a[i], reach, a.length - 1], { i, done });
    if (done) return { events, ok: true };
  }
  return { events, ok: true };
}

export function stockTrace(prices) {
  let min = Infinity, minAt = -1, best = 0, bestPair = null;
  const events = [];
  const push = (key, args, extra = {}) => events.push(event(key, args, { i: null, minAt, best, bestPair, ...extra }));
  push('stk.ev.start', []);
  prices.forEach((p, i) => {
    if (p < min) {
      min = p;
      minAt = i;
      push('stk.ev.low', [i, p], { i });
      return;
    }
    const profit = p - min, record = profit > best;
    if (record) { best = profit; bestPair = [minAt, i]; }
    push('stk.ev.sell', [i, p, min, profit, record], { i });
  });
  push('stk.ev.done', [best]);
  return { events, best };
}

export function intervalsTrace(intervals) {
  const sorted = intervals.map(iv => [...iv]).sort((a, b) => a[1] - b[1]);
  const status = sorted.map(() => null), events = [];
  let end = -Infinity, removed = 0;
  const push = (key, args, extra = {}) => events.push(event(key, args, {
    sorted, status: [...status], end: end === -Infinity ? null : end, i: null, ...extra,
  }));
  push('int.ev.start', [sorted.length]);
  sorted.forEach(([a, b], i) => {
    if (a >= end) {
      const previous = end === -Infinity ? null : end;
      status[i] = 'keep';
      end = b;
      push('int.ev.keep', [a, b, previous], { i });
    } else {
      status[i] = 'drop';
      removed++;
      push('int.ev.drop', [a, b, end], { i });
    }
  });
  push('int.ev.done', [removed, sorted.length - removed]);
  return { events, removed };
}

export function candyTrace(ratings) {
  const c = ratings.map(() => 1), events = [];
  const push = (key, args, extra = {}) => events.push(event(key, args, { c: [...c], i: null, pass: null, ...extra }));
  push('candy.ev.start', [ratings.length]);
  push('candy.ev.pass1', [], { pass: 'L' });
  for (let i = 1; i < ratings.length; i++) {
    if (ratings[i] <= ratings[i - 1]) continue;
    c[i] = c[i - 1] + 1;
    push('candy.ev.left', [i, ratings[i], ratings[i - 1], c[i]], { i, pass: 'L' });
  }
  push('candy.ev.pass2', [], { pass: 'R' });
  for (let i = ratings.length - 2; i >= 0; i--) {
    if (ratings[i] <= ratings[i + 1] || c[i] > c[i + 1]) continue;
    const old = c[i];
    c[i] = c[i + 1] + 1;
    push('candy.ev.right', [i, ratings[i], ratings[i + 1], old, c[i]], { i, pass: 'R' });
  }
  const total = c.reduce((s, v) => s + v, 0);
  push('candy.ev.done', [total]);
  return { events, total, candies: c };
}

/* ---------- 12 dynamic programming ---------- */
export function climbTrace(n) {
  const dp = Array(n + 1).fill(null), events = [];
  dp[0] = 1;
  dp[1] = 1;
  const push = (key, args, extra = {}) => events.push(event(key, args, { dp: [...dp], i: null, ...extra }));
  push('climb.ev.start', [n]);
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
    push('climb.ev.step', [i, dp[i - 1], dp[i - 2], dp[i]], { i });
  }
  push('climb.ev.done', [n, dp[n]]);
  return { events, ways: dp[n] };
}

/** Coins the "largest first" strategy picks, or null when it gets stuck. */
export function greedyCoins(coins, amount) {
  const parts = [];
  let left = amount;
  for (const c of [...coins].sort((x, y) => y - x)) {
    while (left >= c) { parts.push(c); left -= c; }
  }
  return left === 0 ? parts : null;
}

export function coinChangeTrace(coins, amount) {
  const dp = [0, ...Array(amount).fill(null)], lastCoin = [null, ...Array(amount).fill(null)], events = [];
  const push = (key, args, extra = {}) => events.push(event(key, args, { dp: [...dp], i: null, opts: [], pick: null, ...extra }));
  push('dp.ev.start', [coins]);
  for (let i = 1; i <= amount; i++) {
    const opts = coins.filter(c => c <= i && dp[i - c] !== null).map(c => ({ c, v: dp[i - c] + 1 }));
    const best = opts.reduce((m, o) => (!m || o.v < m.v ? o : m), null);
    dp[i] = best ? best.v : null;
    lastCoin[i] = best ? best.c : null;
    push(best ? 'dp.ev.fill' : 'dp.ev.skip', [i, opts, dp[i], best?.c], { i, opts, pick: best?.c ?? null });
  }
  const parts = [];
  for (let s = amount; s > 0 && lastCoin[s] !== null; s -= lastCoin[s]) parts.push(lastCoin[s]);
  const answer = dp[amount] ?? -1;
  push('dp.ev.done', [amount, answer, parts, greedyCoins(coins, amount)]);
  return { events, answer, parts };
}

function tableTrace(a, b, base, cell, keys) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => Array.from({ length: b.length + 1 }, (_, j) => base(i, j)));
  const events = [];
  const push = (key, args, extra = {}) => events.push(event(key, args, { dp: dp.map(r => [...r]), cur: null, src: [], ...extra }));
  push(keys.start, [a, b]);
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const { value, src, op } = cell(dp, i, j);
      dp[i][j] = value;
      push(keys.cell, [i, j, a[i - 1], b[j - 1], op, value], { cur: [i, j], src });
    }
  }
  push(keys.done, [dp[a.length][b.length], a, b]);
  return { events, value: dp[a.length][b.length] };
}

export function lcsTrace(a, b) {
  const { events, value } = tableTrace(a, b, (i, j) => (i === 0 || j === 0 ? 0 : null), (dp, i, j) => {
    if (a[i - 1] === b[j - 1]) return { value: dp[i - 1][j - 1] + 1, src: [[i - 1, j - 1]], op: 'match' };
    const up = dp[i - 1][j], left = dp[i][j - 1];
    return up >= left ? { value: up, src: [[i - 1, j]], op: 'up' } : { value: left, src: [[i, j - 1]], op: 'left' };
  }, { start: 'lcs.ev.start', cell: 'lcs.ev.cell', done: 'lcs.ev.done' });
  return { events, length: value };
}

export function editDistanceTrace(a, b) {
  const { events, value } = tableTrace(a, b, (i, j) => (i === 0 ? j : j === 0 ? i : null), (dp, i, j) => {
    if (a[i - 1] === b[j - 1]) return { value: dp[i - 1][j - 1], src: [[i - 1, j - 1]], op: 'keep' };
    const options = [
      { value: dp[i - 1][j - 1] + 1, src: [[i - 1, j - 1]], op: 'replace' },
      { value: dp[i - 1][j] + 1, src: [[i - 1, j]], op: 'delete' },
      { value: dp[i][j - 1] + 1, src: [[i, j - 1]], op: 'insert' },
    ];
    return options.reduce((m, o) => (o.value < m.value ? o : m));
  }, { start: 'ed.ev.start', cell: 'ed.ev.cell', done: 'ed.ev.done' });
  return { events, distance: value };
}
