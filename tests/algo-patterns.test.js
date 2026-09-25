import test from 'node:test';
import assert from 'node:assert/strict';
import { rng } from '../assets/rand.js';
import {
  twoSumTrace, moveZeroesTrace, longestUniqueTrace, binarySearchTrace, jumpTrace, coinChangeTrace, greedyCoins,
} from '../algorithms/patterns/model-linear.js';
import {
  dailyTempsTrace, removeNthTrace, islandsTrace, layoutTree, maxDepthTrace, heapPush, heapPop, kthLargestTrace, subsetsTrace,
} from '../algorithms/patterns/model-structures.js';
import { RIGS, PATTERN_IDS } from '../algorithms/patterns/rigs.js';
import { PROBLEMS } from '../algorithms/patterns/problems.js';
import { DICT } from '../algorithms/patterns/i18n.js';

const randInts = (next, n, lo, hi) => Array.from({ length: n }, () => lo + Math.floor(next() * (hi - lo + 1)));

test('Two Sum trace finds a valid pair exactly when brute force does', () => {
  const next = rng(1);
  for (let round = 0; round < 300; round++) {
    const nums = randInts(next, Math.floor(next() * 8), -5, 9);
    const target = Math.floor(next() * 15) - 3;
    const { found, events } = twoSumTrace(nums, target);
    const exists = nums.some((v, i) => nums.some((w, j) => j > i && v + w === target));
    assert.equal(found !== null, exists, `${nums} → ${target}`);
    if (found) {
      assert.ok(found[0] < found[1]);
      assert.equal(nums[found[0]] + nums[found[1]], target);
    }
    assert.ok(events.length >= 1);
  }
});

test('Move Zeroes keeps the order of non-zeros and does not touch the input', () => {
  const next = rng(2);
  for (let round = 0; round < 200; round++) {
    const nums = randInts(next, Math.floor(next() * 9), 0, 3);
    const copy = [...nums];
    const { result } = moveZeroesTrace(nums);
    const nonZero = nums.filter(v => v !== 0);
    assert.deepEqual(result, [...nonZero, ...nums.filter(v => v === 0)]);
    assert.deepEqual(nums, copy);
  }
});

test('sliding window agrees with the brute-force longest unique substring', () => {
  const next = rng(3);
  const brute = s => {
    let best = 0;
    for (let i = 0; i < s.length; i++) for (let j = i; j < s.length; j++) {
      if (new Set(s.slice(i, j + 1)).size === j - i + 1) best = Math.max(best, j - i + 1);
    }
    return best;
  };
  for (let round = 0; round < 200; round++) {
    const s = Array.from({ length: Math.floor(next() * 10) }, () => 'abcd'[Math.floor(next() * 4)]).join('');
    assert.equal(longestUniqueTrace(s).best, brute(s), s);
  }
  assert.equal(longestUniqueTrace('abcbcad').best, 4);
});

test('binary search finds every value in O(log n) comparisons and reports misses', () => {
  const a = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
  for (let target = 0; target <= 95; target++) {
    const { index, events } = binarySearchTrace(a, target);
    assert.equal(index, a.indexOf(target));
    assert.ok(events.at(-1).step <= Math.ceil(Math.log2(a.length + 1)));
  }
});

test('greedy jump game matches exhaustive reachability', () => {
  const next = rng(4);
  const brute = a => {
    const seen = new Set([0]), queue = [0];
    while (queue.length) {
      const i = queue.shift();
      for (let j = i + 1; j <= i + a[i] && j < a.length; j++) if (!seen.has(j)) { seen.add(j); queue.push(j); }
    }
    return seen.has(a.length - 1);
  };
  for (let round = 0; round < 300; round++) {
    const a = randInts(next, 1 + Math.floor(next() * 8), 0, 3);
    assert.equal(jumpTrace(a).ok, brute(a), `${a}`);
  }
});

test('coin change DP beats greedy on [1, 3, 4] and matches BFS on random inputs', () => {
  const demo = coinChangeTrace([1, 3, 4], 6);
  assert.equal(demo.answer, 2);
  assert.deepEqual(demo.parts, [3, 3]);
  assert.deepEqual(greedyCoins([1, 3, 4], 6), [4, 1, 1]);
  const brute = (coins, amount) => {
    const dist = new Map([[0, 0]]), queue = [0];
    while (queue.length) {
      const s = queue.shift();
      for (const c of coins) if (s + c <= amount && !dist.has(s + c)) { dist.set(s + c, dist.get(s) + 1); queue.push(s + c); }
    }
    return dist.get(amount) ?? -1;
  };
  const next = rng(5);
  for (let round = 0; round < 150; round++) {
    const coins = [...new Set(randInts(next, 1 + Math.floor(next() * 3), 2, 7))];
    const amount = Math.floor(next() * 20);
    const { answer, parts } = coinChangeTrace(coins, amount);
    assert.equal(answer, brute(coins, amount), `${coins} → ${amount}`);
    if (answer >= 0) assert.equal(parts.reduce((s, c) => s + c, 0), amount);
  }
});

test('monotonic stack gives the same waits as the quadratic scan', () => {
  const next = rng(6);
  for (let round = 0; round < 200; round++) {
    const t = randInts(next, Math.floor(next() * 10), 60, 80);
    const brute = t.map((v, i) => { const j = t.findIndex((w, k) => k > i && w > v); return j < 0 ? 0 : j - i; });
    assert.deepEqual(dailyTempsTrace(t).ans, brute);
  }
});

test('remove n-th from the end removes the right node for every n, including the head', () => {
  for (let len = 1; len <= 7; len++) {
    const values = Array.from({ length: len }, (_, i) => (i + 1) * 10);
    for (let n = 1; n <= len; n++) {
      const expected = values.filter((_, i) => i !== len - n);
      assert.deepEqual(removeNthTrace(values, n).result, expected, `len ${len}, n ${n}`);
    }
  }
});

test('island count matches a union of flood fills on random grids', () => {
  const next = rng(7);
  const brute = rows => {
    const g = rows.map(r => [...r].map(Number)), seen = new Set();
    let count = 0;
    g.forEach((row, r) => row.forEach((v, c) => {
      if (!v || seen.has(`${r},${c}`)) return;
      count++;
      const stack = [[r, c]];
      while (stack.length) {
        const [y, x] = stack.pop();
        if (y < 0 || x < 0 || y >= g.length || x >= row.length || !g[y][x] || seen.has(`${y},${x}`)) continue;
        seen.add(`${y},${x}`);
        stack.push([y + 1, x], [y - 1, x], [y, x + 1], [y, x - 1]);
      }
    }));
    return count;
  };
  for (let round = 0; round < 100; round++) {
    const rows = Array.from({ length: 1 + Math.floor(next() * 5) }, () =>
      Array.from({ length: 6 }, () => (next() < 0.45 ? '1' : '0')).join(''));
    assert.equal(islandsTrace(rows).count, brute(rows));
  }
  assert.equal(islandsTrace(['110001', '100101', '001100', '000001', '110011']).count, 5);
});

test('tree layout is in-order and max depth trace returns the real depth', () => {
  const spec = [3, [9, [4], null], [20, [15], [7, null, [8]]]];
  const nodes = layoutTree(spec);
  assert.deepEqual([...nodes].sort((a, b) => a.x - b.x).map(n => n.v), [4, 9, 3, 15, 20, 7, 8]);
  assert.equal(maxDepthTrace(spec).depth, 4);
  assert.equal(maxDepthTrace([1]).depth, 1);
  assert.equal(maxDepthTrace([1, [2, [3, [4]]]]).depth, 4);
});

test('heap keeps its invariant and the k-th largest matches sorting', () => {
  const next = rng(8);
  for (let round = 0; round < 200; round++) {
    const nums = randInts(next, 1 + Math.floor(next() * 12), -20, 20);
    const k = 1 + Math.floor(next() * nums.length);
    const { kth, events } = kthLargestTrace(nums, k);
    assert.equal(kth, [...nums].sort((a, b) => b - a)[k - 1]);
    for (const event of events) {
      assert.ok(event.heap.length <= k + 1);
      event.heap.forEach((v, i) => { if (i) assert.ok(event.heap[(i - 1) >> 1] <= v); });
    }
  }
  let heap = [];
  for (const x of [5, 1, 4, 2, 3]) heap = heapPush(heap, x).heap;
  const drained = [];
  while (heap.length) { drained.push(heap[0]); heap = heapPop(heap); }
  assert.deepEqual(drained, [1, 2, 3, 4, 5]);
});

test('subsets tree yields all 2^n distinct subsets', () => {
  for (let n = 0; n <= 4; n++) {
    const nums = Array.from({ length: n }, (_, i) => i + 1);
    const { subsets, nodes } = subsetsTrace(nums);
    assert.equal(subsets.length, 2 ** n);
    assert.equal(new Set(subsets.map(s => s.join(','))).size, 2 ** n);
    assert.equal(nodes.length, 2 ** (n + 1) - 1);
  }
});

test('every rig renders every event, and every event text exists in both languages', () => {
  assert.equal(PATTERN_IDS.length, 12);
  for (const id of PATTERN_IDS) {
    const rig = RIGS[id];
    const run = rig.run();
    assert.ok(run.events.length > 2, id);
    for (const event of run.events) {
      const entry = DICT[event.key];
      assert.ok(entry, `${id}: no text for ${event.key}`);
      for (const lang of ['en', 'ru']) {
        const text = entry[lang](...event.args);
        assert.ok(typeof text === 'string' && text.trim(), `${event.key} (${lang})`);
      }
      assert.match(rig.view(run, event), /^<svg/);
      for (const [label] of rig.vars(run, event)) assert.ok(DICT[label], `${id}: no label ${label}`);
    }
  }
});

test('every chapter has its texts and three problems with code', () => {
  for (const id of PATTERN_IDS) {
    for (const part of ['h2', 'essence', 'signals', 'pitfall', 'tpl', 'viz', 'short', 'p']) {
      assert.ok(DICT[`${id}.${part}`], `${id}.${part}`);
    }
    assert.equal(PROBLEMS[id].length, 3, id);
    for (const lang of ['en', 'ru']) {
      const texts = DICT[`${id}.p`][lang];
      assert.equal(texts.length, 3, `${id}.p ${lang}`);
      for (const p of texts) for (const f of ['variant', 'task', 'idea', 'why', 'cx']) assert.ok(p[f], `${id} ${lang} ${f}`);
    }
    for (const p of PROBLEMS[id]) {
      assert.ok(p.name && p.num && p.slug && p.code.includes('('), `${id} ${p.name}`);
      assert.match(p.diff, /^(Easy|Medium|Hard)$/);
    }
  }
});
