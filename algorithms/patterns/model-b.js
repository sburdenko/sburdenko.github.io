/** Pure traces for chapters 05–08: stack, linked list, grid and graph search, trees. Same contract as model-a.js. */
const event = (key, args, state) => ({ key, args, ...state });
const inf = v => (v === Infinity ? '+∞' : v === -Infinity ? '−∞' : v);
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

/* ---------- 05 stack ---------- */
export function validParensTrace(s) {
  const pairs = { ')': '(', ']': '[', '}': '{' }, stack = [], events = [];
  const push = (key, args, extra = {}) => events.push(event(key, args, { i: null, stack: [...stack], bad: false, ...extra }));
  push('par.ev.start', []);
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (!pairs[c]) { stack.push(c); push('par.ev.push', [c], { i }); continue; }
    const top = stack.length ? stack[stack.length - 1] : null;
    if (top !== pairs[c]) {
      push('par.ev.bad', [c, top], { i, bad: true });
      return { events, valid: false };
    }
    stack.pop();
    push('par.ev.pop', [c, top], { i });
  }
  const valid = stack.length === 0;
  push('par.ev.done', [valid, stack.length], { bad: !valid });
  return { events, valid };
}

export function dailyTempsTrace(t) {
  const ans = t.map(() => null), stack = [], events = [];
  const push = (key, args, extra = {}) => events.push(event(key, args, { i: null, stack: [...stack], ans: [...ans], popped: null, ...extra }));
  push('stack.ev.start', []);
  t.forEach((temp, i) => {
    while (stack.length && t[stack.at(-1)] < temp) {
      const j = stack.pop();
      ans[j] = i - j;
      push('stack.ev.pop', [temp, t[j], j, i, ans[j]], { i, popped: j });
    }
    stack.push(i);
    push('stack.ev.push', [i, temp, stack.length > 1 ? t[stack.at(-2)] : null], { i });
  });
  stack.forEach(j => { ans[j] = 0; });
  push('stack.ev.done', []);
  return { events, ans };
}

/** ops: ['push', v] | ['pop'] | ['getMin']. Each entry keeps the minimum at the moment it was pushed. */
export function minStackTrace(ops) {
  const stack = [], mins = [], events = [];
  const push = (key, args, extra = {}) => events.push(event(key, args, { op: null, stack: stack.map(p => [...p]), ...extra }));
  push('mins.ev.start', []);
  ops.forEach(([op, v], k) => {
    if (op === 'push') {
      const min = stack.length ? Math.min(v, stack.at(-1)[1]) : v;
      stack.push([v, min]);
      push('mins.ev.push', [v, min], { op: k });
    } else if (op === 'pop') {
      const [value] = stack.pop();
      push('mins.ev.pop', [value, stack.length ? stack.at(-1)[1] : null], { op: k });
    } else {
      const min = stack.at(-1)[1];
      mins.push(min);
      push('mins.ev.get', [min], { op: k });
    }
  });
  return { events, mins };
}

export function histogramTrace(h) {
  const stack = [], events = [];
  let best = 0, bestRect = null;
  const push = (key, args, extra = {}) => events.push(event(key, args, { i: null, stack: [...stack], best, bestRect, rect: null, ...extra }));
  push('hist.ev.start', []);
  for (let i = 0; i <= h.length; i++) {
    const cur = i === h.length ? 0 : h[i];
    while (stack.length && h[stack.at(-1)] >= cur) {
      const j = stack.pop(), left = stack.length ? stack.at(-1) + 1 : 0, width = i - left, area = h[j] * width;
      const record = area > best;
      if (record) { best = area; bestRect = [left, i - 1, h[j]]; }
      push('hist.ev.pop', [h[j], width, area, record, i === h.length], { i, rect: [left, i - 1, h[j]] });
    }
    if (i < h.length) {
      stack.push(i);
      push('hist.ev.push', [i, h[i]], { i });
    }
  }
  push('hist.ev.done', [best]);
  return { events, best };
}

/* ---------- 06 linked list ---------- */
/** next[k] is the index node k links to, -1 for null. */
export function cycleTrace(next) {
  let slow = 0, fast = 0;
  const events = [];
  const push = (key, args, extra = {}) => events.push(event(key, args, { slow, fast, meet: null, ...extra }));
  push('cyc.ev.start', []);
  while (fast !== -1 && next[fast] !== -1) {
    slow = next[slow];
    fast = next[next[fast]];
    if (slow === fast) {
      push('cyc.ev.meet', [slow], { meet: slow });
      return { events, hasCycle: true };
    }
    push('cyc.ev.move', [slow, fast]);
  }
  push('cyc.ev.none', []);
  return { events, hasCycle: false };
}

/** Node 0 is the dummy, node k holds values[k - 1], node values.length + 1 stands for null. */
export function removeNthTrace(values, n) {
  const nil = values.length + 1, events = [];
  const label = k => (k === 0 ? 'dummy' : k === nil ? 'null' : String(values[k - 1]));
  let fast = 0, slow = 0;
  const push = (key, args, extra = {}) => events.push(event(key, args, { fast, slow, removed: null, ...extra }));
  push('list.ev.start', [n]);
  for (let step = 1; step <= n + 1; step++) {
    fast++;
    push('list.ev.lead', [step, n + 1, fast === nil]);
  }
  while (fast !== nil) {
    fast++;
    slow++;
    push('list.ev.walk', [label(slow), fast === nil]);
  }
  const removed = slow + 1;
  push('list.ev.cut', [label(removed), slow === 0], { removed });
  return { events, result: values.filter((_, k) => k !== removed - 1) };
}

export function reverseListTrace(values) {
  const next = values.map((_, i) => (i + 1 < values.length ? i + 1 : -1)), events = [];
  let prev = -1, cur = values.length ? 0 : -1;
  const push = (key, args) => events.push(event(key, args, { next: [...next], prev, cur }));
  push('rev.ev.start', []);
  while (cur !== -1) {
    const following = next[cur], oldPrev = prev;
    next[cur] = prev;
    prev = cur;
    cur = following;
    push('rev.ev.step', [values[prev], oldPrev >= 0 ? values[oldPrev] : null]);
  }
  const result = [];
  for (let k = prev; k !== -1; k = next[k]) result.push(values[k]);
  push('rev.ev.done', [result]);
  return { events, result };
}

export function reverseKGroupTrace(values, k) {
  let order = [...values];
  const events = [];
  const push = (key, args, extra = {}) => events.push(event(key, args, { order: [...order], group: null, rest: false, ...extra }));
  push('revk.ev.start', [k]);
  let start = 0;
  for (; start + k <= order.length; start += k) {
    const chunk = order.slice(start, start + k);
    order = [...order.slice(0, start), ...[...chunk].reverse(), ...order.slice(start + k)];
    push('revk.ev.group', [chunk, [...chunk].reverse()], { group: [start, start + k - 1] });
  }
  if (start < order.length) push('revk.ev.rest', [order.slice(start), k], { group: [start, order.length - 1], rest: true });
  push('revk.ev.done', [order]);
  return { events, result: order };
}

/* ---------- 07 grids and graphs ---------- */
export function floodFillTrace(image, sr, sc, color) {
  const img = image.map(r => [...r]), from = img[sr][sc], events = [];
  let painted = 0;
  const push = (key, args, extra = {}) => events.push(event(key, args, { img: img.map(r => [...r]), cur: null, ...extra }));
  push('fill.ev.start', [sr, sc, from, color], { cur: [sr, sc] });
  if (from === color) {
    push('fill.ev.same', [color]);
    return { events, image: img };
  }
  const dfs = (r, c) => {
    if (r < 0 || c < 0 || r >= img.length || c >= img[r].length || img[r][c] !== from) return;
    img[r][c] = color;
    painted++;
    push('fill.ev.paint', [r, c], { cur: [r, c] });
    DIRS.forEach(([dr, dc]) => dfs(r + dr, c + dc));
  };
  dfs(sr, sc);
  push('fill.ev.done', [painted]);
  return { events, image: img };
}

export function islandsTrace(rows) {
  const grid = rows.map(r => [...r].map(Number));
  const color = grid.map(r => r.map(() => -1)), events = [];
  let count = 0;
  const push = (key, args, extra = {}) => events.push(event(key, args, {
    color: color.map(r => [...r]), cur: null, stack: [], count, ...extra,
  }));
  push('graph.ev.start', []);
  const dfs = (r, c, island, stack, first) => {
    if (r < 0 || c < 0 || r >= grid.length || c >= grid[r].length) return;
    if (grid[r][c] !== 1 || color[r][c] !== -1) return;
    color[r][c] = island;
    stack.push([r, c]);
    push(first ? 'graph.ev.found' : 'graph.ev.fill', first ? [r, c, island + 1] : [r, c],
      { cur: [r, c], stack: stack.map(p => [...p]) });
    DIRS.forEach(([dr, dc]) => dfs(r + dr, c + dc, island, stack, false));
    stack.pop();
  };
  grid.forEach((row, r) => row.forEach((v, c) => {
    if (v === 1 && color[r][c] === -1) { count++; dfs(r, c, count - 1, [], true); }
  }));
  push('graph.ev.done', [count]);
  return { events, count, grid };
}

/** 0 empty, 1 fresh, 2 rotten. BFS from every rotten orange at once; one level is one minute. */
export function orangesTrace(grid) {
  const g = grid.map(r => [...r]), events = [];
  let queue = [], fresh = 0, minute = 0;
  g.forEach((row, r) => row.forEach((v, c) => { if (v === 2) queue.push([r, c]); if (v === 1) fresh++; }));
  const push = (key, args, extra = {}) => events.push(event(key, args, { g: g.map(r => [...r]), newly: [], minute, ...extra }));
  push('orange.ev.start', [queue.length, fresh]);
  while (queue.length && fresh > 0) {
    const next = [];
    for (const [r, c] of queue) {
      for (const [dr, dc] of DIRS) {
        if (g[r + dr]?.[c + dc] !== 1) continue;
        g[r + dr][c + dc] = 2;
        fresh--;
        next.push([r + dr, c + dc]);
      }
    }
    minute++;
    queue = next;
    push('orange.ev.minute', [minute, next.length, fresh], { newly: next });
  }
  const minutes = fresh === 0 ? minute : -1;
  push('orange.ev.done', [minutes, fresh]);
  return { events, minutes };
}

export function wordLadderTrace(begin, end, words) {
  const dict = new Set(words), parent = { [begin]: null }, levels = [[begin]], events = [];
  const push = (key, args, extra = {}) => events.push(event(key, args, { levels: levels.map(l => [...l]), parent: { ...parent }, path: [], ...extra }));
  push('wl.ev.start', [begin, end]);
  if (!dict.has(end)) {
    push('wl.ev.none', [end]);
    return { events, length: 0, levels };
  }
  let frontier = [begin];
  while (frontier.length) {
    const next = [];
    for (const word of frontier) {
      for (let i = 0; i < word.length; i++) {
        for (const ch of 'abcdefghijklmnopqrstuvwxyz') {
          const candidate = word.slice(0, i) + ch + word.slice(i + 1);
          if (!dict.has(candidate) || candidate in parent) continue;
          parent[candidate] = word;
          next.push(candidate);
        }
      }
    }
    if (!next.length) break;
    levels.push(next);
    if (next.includes(end)) {
      const path = [];
      for (let w = end; w !== null; w = parent[w]) path.unshift(w);
      push('wl.ev.found', [levels.length, path], { path });
      return { events, length: levels.length, levels };
    }
    push('wl.ev.level', [levels.length, next]);
    frontier = next;
  }
  push('wl.ev.none', [end]);
  return { events, length: 0, levels };
}

/* ---------- 08 trees ---------- */
/** Tree spec: [value, left, right] with null for a missing child. x is the in-order position. */
export function layoutTree(spec) {
  const nodes = [];
  let order = 0;
  const walk = (s, depth, parent) => {
    if (!s) return -1;
    const id = nodes.length;
    nodes.push({ id, v: s[0], depth, parent, l: -1, r: -1, x: 0 });
    const l = walk(s[1], depth + 1, id);
    const x = order++;
    const r = walk(s[2], depth + 1, id);
    nodes[id] = { ...nodes[id], l, r, x };
    return id;
  };
  walk(spec, 0, -1);
  return nodes;
}

export function maxDepthTrace(spec) {
  const nodes = layoutTree(spec), ret = nodes.map(() => null), stack = [], events = [];
  const push = (key, args, extra = {}) => events.push(event(key, args, { cur: null, stack: [...stack], ret: [...ret], ...extra }));
  push('tree.ev.start', []);
  const go = id => {
    if (id < 0) return 0;
    const node = nodes[id];
    stack.push(id);
    push('tree.ev.enter', [node.v], { cur: id });
    const left = go(node.l), right = go(node.r), depth = 1 + Math.max(left, right);
    ret[id] = depth;
    push('tree.ev.return', [node.v, left, right, depth, node.l >= 0, node.r >= 0], { cur: id });
    stack.pop();
    return depth;
  };
  const depth = go(nodes.length ? 0 : -1);
  push('tree.ev.done', [depth]);
  return { events, nodes, depth };
}

export function levelOrderTrace(spec) {
  const nodes = layoutTree(spec), levels = [], events = [];
  let queue = nodes.length ? [0] : [];
  const push = (key, args, extra = {}) => events.push(event(key, args, { level: [], queue: [...queue], done: levels.length, ...extra }));
  push('lvl.ev.start', []);
  while (queue.length) {
    const ids = queue, values = ids.map(id => nodes[id].v);
    queue = ids.flatMap(id => [nodes[id].l, nodes[id].r].filter(c => c >= 0));
    levels.push(values);
    push('lvl.ev.level', [levels.length, values, queue.length], { level: ids, done: levels.length - 1 });
  }
  push('lvl.ev.done', [levels.length]);
  return { events, nodes, levels };
}

export function validBstTrace(spec) {
  const nodes = layoutTree(spec), checked = {}, events = [];
  const push = (key, args, extra = {}) => events.push(event(key, args, { cur: null, checked: { ...checked }, ...extra }));
  push('bst.ev.start', []);
  const go = (id, lo, hi) => {
    if (id < 0) return true;
    const node = nodes[id], ok = node.v > lo && node.v < hi;
    checked[id] = { lo: inf(lo), hi: inf(hi), ok };
    push(ok ? 'bst.ev.ok' : 'bst.ev.bad', [node.v, inf(lo), inf(hi)], { cur: id });
    return ok && go(node.l, lo, node.v) && go(node.r, node.v, hi);
  };
  const valid = go(nodes.length ? 0 : -1, -Infinity, Infinity);
  push('bst.ev.done', [valid]);
  return { events, nodes, valid };
}

export function maxPathSumTrace(spec) {
  const nodes = layoutTree(spec), ret = nodes.map(() => null), events = [];
  let best = -Infinity;
  const push = (key, args, extra = {}) => events.push(event(key, args, { cur: null, ret: [...ret], best: best === -Infinity ? null : best, ...extra }));
  push('mps.ev.start', []);
  const go = id => {
    if (id < 0) return 0;
    const node = nodes[id];
    const gl = Math.max(0, go(node.l)), gr = Math.max(0, go(node.r));
    const through = node.v + gl + gr, record = through > best;
    if (record) best = through;
    ret[id] = node.v + Math.max(gl, gr);
    push('mps.ev.ret', [node.v, gl, gr, through, ret[id], record], { cur: id });
    return ret[id];
  };
  go(0);
  push('mps.ev.done', [best]);
  return { events, nodes, best };
}
