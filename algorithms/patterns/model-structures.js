/**
 * Pure traces for the structure-shaped rigs: monotonic stack, linked list gap,
 * grid DFS, tree recursion, heap and backtracking. Same contract as model-linear.js.
 */
const event = (key, args, state) => ({ key, args, ...state });

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
    dfs(r + 1, c, island, stack, false);
    dfs(r - 1, c, island, stack, false);
    dfs(r, c + 1, island, stack, false);
    dfs(r, c - 1, island, stack, false);
    stack.pop();
  };
  grid.forEach((row, r) => row.forEach((v, c) => {
    if (v === 1 && color[r][c] === -1) { count++; dfs(r, c, count - 1, [], true); }
  }));
  push('graph.ev.done', [count]);
  return { events, count, grid };
}

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

export function heapPush(heap, x) {
  const a = [...heap, x];
  let i = a.length - 1;
  while (i > 0) {
    const p = (i - 1) >> 1;
    if (a[p] <= a[i]) break;
    [a[p], a[i]] = [a[i], a[p]];
    i = p;
  }
  return { heap: a, at: i };
}

export function heapPop(heap) {
  const a = heap.slice(0, -1);
  if (!a.length) return a;
  a[0] = heap.at(-1);
  let i = 0;
  for (;;) {
    const l = 2 * i + 1, r = l + 1;
    let m = i;
    if (l < a.length && a[l] < a[m]) m = l;
    if (r < a.length && a[r] < a[m]) m = r;
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

export function subsetsTrace(nums) {
  const nodes = [];
  let leaf = 0;
  const build = (depth, set, parent, take) => {
    const id = nodes.length;
    nodes.push({ id, depth, set, parent, take, item: depth > 0 ? nums[depth - 1] : null, x: 0 });
    if (depth === nums.length) {
      nodes[id] = { ...nodes[id], x: leaf++ };
    } else {
      const a = build(depth + 1, [...set, nums[depth]], id, true);
      const b = build(depth + 1, set, id, false);
      nodes[id] = { ...nodes[id], x: (nodes[a].x + nodes[b].x) / 2 };
    }
    return id;
  };
  build(0, [], -1, null);
  const subsets = [];
  const events = nodes.map(node => {
    const isLeaf = node.depth === nums.length;
    if (isLeaf) subsets.push(node.set);
    const key = node.parent < 0 ? 'back.ev.start' : node.take ? 'back.ev.take' : 'back.ev.skip';
    return event(key, [node.item, node.set, isLeaf], { cur: node.id, res: subsets.map(s => [...s]) });
  });
  events.push(event('back.ev.done', [subsets.length], { cur: null, res: subsets.map(s => [...s]) }));
  return { events, nodes, subsets };
}
