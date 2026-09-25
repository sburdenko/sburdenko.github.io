import test from 'node:test';
import assert from 'node:assert/strict';
import { rng } from '../assets/rand.js';
import * as A from '../algorithms/patterns/model-a.js';
import * as B from '../algorithms/patterns/model-b.js';
import * as C from '../algorithms/patterns/model-c.js';
import { RIGS, PATTERN_IDS } from '../algorithms/patterns/rigs.js';
import { PROBLEMS } from '../algorithms/patterns/problems.js';
import { DICT } from '../algorithms/patterns/i18n.js';

const next = rng(42);
const ints = (n, lo, hi) => Array.from({ length: n }, () => lo + Math.floor(next() * (hi - lo + 1)));
const len = (lo, hi) => lo + Math.floor(next() * (hi - lo + 1));
const repeat = (times, fn) => { for (let i = 0; i < times; i++) fn(i); };

/* ---------- chapters 01–04 ---------- */
test('hash map traces agree with brute force', () => {
  repeat(200, () => {
    const nums = ints(len(0, 8), -4, 8), target = len(-3, 10);
    const { found } = A.twoSumTrace(nums, target);
    const exists = nums.some((v, i) => nums.some((w, j) => j > i && v + w === target));
    assert.equal(found !== null, exists);
    if (found) assert.equal(nums[found[0]] + nums[found[1]], target);
    assert.equal(A.containsDupTrace(nums).dup, new Set(nums).size !== nums.length);
    let count = 0;
    for (let i = 0; i < nums.length; i++) for (let j = i; j < nums.length; j++) {
      if (nums.slice(i, j + 1).reduce((s, v) => s + v, 0) === target) count++;
    }
    assert.equal(A.subarraySumTrace(nums, target).count, count, `${nums} k=${target}`);
  });
  const groups = A.groupAnagramsTrace(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']).groups;
  assert.deepEqual(groups.map(g => g.join()).sort(), ['bat', 'eat,tea,ate', 'tan,nat']);
});

test('two pointer traces agree with brute force', () => {
  repeat(150, () => {
    const nums = ints(len(0, 8), 0, 3);
    assert.deepEqual(A.moveZeroesTrace(nums).result, [...nums.filter(v => v), ...nums.filter(v => !v)]);
    const h = ints(len(2, 9), 0, 8);
    let best = 0;
    h.forEach((a, i) => h.forEach((b, j) => { if (j > i) best = Math.max(best, Math.min(a, b) * (j - i)); }));
    assert.equal(A.containerTrace(h).best, best);
    const water = h.reduce((s, v, i) => s + Math.min(Math.max(...h.slice(0, i + 1)), Math.max(...h.slice(i))) - v, 0);
    assert.equal(A.trapTrace(h).total, water, `${h}`);
    const t = ints(len(0, 8), -4, 4);
    const brute = new Set();
    for (let i = 0; i < t.length; i++) for (let j = i + 1; j < t.length; j++) for (let k = j + 1; k < t.length; k++) {
      if (t[i] + t[j] + t[k] === 0) brute.add([t[i], t[j], t[k]].sort((x, y) => x - y).join());
    }
    assert.deepEqual(A.threeSumTrace(t).triples.map(x => x.join()).sort(), [...brute].sort(), `${t}`);
  });
  assert.equal(A.trapTrace([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]).total, 6);
});

test('sliding window traces agree with brute force', () => {
  repeat(150, () => {
    const s = Array.from({ length: len(0, 10) }, () => 'abcd'[len(0, 3)]).join('');
    let longest = 0;
    for (let i = 0; i < s.length; i++) for (let j = i; j < s.length; j++) {
      if (new Set(s.slice(i, j + 1)).size === j - i + 1) longest = Math.max(longest, j - i + 1);
    }
    assert.equal(A.longestUniqueTrace(s).best, longest);
    const nums = ints(len(1, 9), 1, 6), k = len(1, nums.length), target = len(1, 15);
    const sums = nums.map((_, i) => nums.slice(i, i + k)).filter(w => w.length === k).map(w => w.reduce((a, b) => a + b, 0));
    assert.equal(A.maxAverageTrace(nums, k).best, Math.max(...sums));
    let shortest = 0;
    for (let i = 0; i < nums.length; i++) for (let j = i; j < nums.length; j++) {
      if (nums.slice(i, j + 1).reduce((a, b) => a + b, 0) >= target && (!shortest || j - i + 1 < shortest)) shortest = j - i + 1;
    }
    assert.equal(A.minSubArrayTrace(target, nums).best, shortest);
    const tt = Array.from({ length: len(1, 3) }, () => 'abc'[len(0, 2)]).join('');
    const covers = w => [...tt].every(c => [...w].filter(x => x === c).length >= [...tt].filter(x => x === c).length);
    let win = '';
    for (let i = 0; i < s.length; i++) for (let j = i; j < s.length; j++) {
      const w = s.slice(i, j + 1);
      if (covers(w) && (!win || w.length < win.length)) win = w;
    }
    assert.equal(A.minWindowTrace(s, tt).window.length, win.length, `${s} / ${tt}`);
  });
  assert.equal(A.minWindowTrace('ADOBECODEBANC', 'ABC').window, 'BANC');
});

test('binary search traces agree with brute force', () => {
  const a = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91];
  for (let t = 0; t <= 95; t++) {
    assert.equal(A.binarySearchTrace(a, t).index, a.indexOf(t));
    for (let shift = 0; shift < a.length; shift++) {
      const rotated = [...a.slice(shift), ...a.slice(0, shift)];
      assert.equal(A.rotatedSearchTrace(rotated, t).index, rotated.indexOf(t));
    }
  }
  repeat(100, () => {
    const piles = ints(len(1, 5), 1, 30), h = len(piles.length, 20);
    const fits = k => piles.reduce((s, p) => s + Math.ceil(p / k), 0) <= h;
    let k = 1;
    while (!fits(k)) k++;
    assert.equal(A.kokoTrace(piles, h).speed, k);
    const x = ints(len(0, 6), 0, 30).sort((p, q) => p - q), y = ints(len(1, 7), 0, 30).sort((p, q) => p - q);
    const all = [...x, ...y].sort((p, q) => p - q), m = all.length;
    const median = m % 2 ? all[(m - 1) / 2] : (all[m / 2 - 1] + all[m / 2]) / 2;
    assert.equal(A.medianTwoTrace(x, y).median, median, `${x} | ${y}`);
  });
});

/* ---------- chapters 05–08 ---------- */
test('stack traces agree with brute force', () => {
  const balanced = s => { let t = s, prev; do { prev = t; t = t.replace(/\(\)|\[\]|\{\}/g, ''); } while (t !== prev); return t === ''; };
  repeat(300, () => {
    const s = Array.from({ length: len(0, 8) }, () => '()[]{}'[len(0, 5)]).join('');
    assert.equal(B.validParensTrace(s).valid, balanced(s), s);
    const t = ints(len(0, 9), 60, 80);
    assert.deepEqual(B.dailyTempsTrace(t).ans, t.map((v, i) => { const j = t.findIndex((w, q) => q > i && w > v); return j < 0 ? 0 : j - i; }));
    const h = ints(len(1, 8), 0, 6);
    let best = 0;
    for (let i = 0; i < h.length; i++) for (let j = i; j < h.length; j++) best = Math.max(best, Math.min(...h.slice(i, j + 1)) * (j - i + 1));
    assert.equal(B.histogramTrace(h).best, best, `${h}`);
  });
  const ops = [['push', 5], ['push', 3], ['push', 7], ['getMin'], ['pop'], ['push', 1], ['getMin'], ['pop'], ['pop'], ['getMin']];
  assert.deepEqual(B.minStackTrace(ops).mins, [3, 1, 5]);
});

test('linked list traces agree with brute force', () => {
  for (let n = 1; n <= 8; n++) {
    for (let entry = -1; entry < n; entry++) {
      const nextLinks = Array.from({ length: n }, (_, i) => (i + 1 < n ? i + 1 : entry));
      assert.equal(B.cycleTrace(nextLinks).hasCycle, entry >= 0);
    }
    const values = Array.from({ length: n }, (_, i) => i + 1);
    assert.deepEqual(B.reverseListTrace(values).result, [...values].reverse());
    for (let k = 1; k <= n; k++) {
      assert.deepEqual(B.removeNthTrace(values, k).result, values.filter((_, i) => i !== n - k));
      const expected = [];
      for (let i = 0; i < n; i += k) {
        const chunk = values.slice(i, i + k);
        expected.push(...(chunk.length === k ? chunk.reverse() : chunk));
      }
      assert.deepEqual(B.reverseKGroupTrace(values, k).result, expected, `n=${n} k=${k}`);
    }
  }
});

test('grid and graph traces agree with brute force', () => {
  const flood = (g, sr, sc, color) => {
    const out = g.map(r => [...r]), from = out[sr][sc];
    if (from === color) return out;
    const stack = [[sr, sc]];
    while (stack.length) {
      const [r, c] = stack.pop();
      if (r < 0 || c < 0 || r >= out.length || c >= out[0].length || out[r][c] !== from) continue;
      out[r][c] = color;
      stack.push([r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]);
    }
    return out;
  };
  const rot = g => {
    let cur = g.map(r => [...r]), minutes = 0;
    for (;;) {
      const nextGrid = cur.map((row, r) => row.map((v, c) => (v === 1 && [[1, 0], [-1, 0], [0, 1], [0, -1]]
        .some(([dr, dc]) => cur[r + dr]?.[c + dc] === 2) ? 2 : v)));
      if (JSON.stringify(nextGrid) === JSON.stringify(cur)) break;
      cur = nextGrid;
      minutes++;
    }
    return cur.flat().includes(1) ? -1 : minutes;
  };
  repeat(80, () => {
    const g = Array.from({ length: len(1, 4) }, () => ints(4, 0, 2));
    const sr = len(0, g.length - 1), sc = len(0, 3), color = len(0, 2);
    assert.deepEqual(B.floodFillTrace(g, sr, sc, color).image, flood(g, sr, sc, color));
    assert.equal(B.orangesTrace(g).minutes, rot(g), JSON.stringify(g));
  });
  assert.equal(B.islandsTrace(['110001', '100101', '001100', '000001', '110011']).count, 5);
  assert.equal(B.wordLadderTrace('hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log', 'cog']).length, 5);
  assert.equal(B.wordLadderTrace('hit', 'cog', ['hot', 'dot', 'dog', 'lot', 'log']).length, 0);
});

test('tree traces agree with brute force', () => {
  const randomTree = depth => (depth > 3 || next() < 0.25 ? null : [len(-6, 9), randomTree(depth + 1), randomTree(depth + 1)]);
  repeat(150, () => {
    const spec = randomTree(0) || [len(-6, 9)];
    const nodes = B.layoutTree(spec);
    const depthOf = s => (s ? 1 + Math.max(depthOf(s[1]), depthOf(s[2])) : 0);
    assert.equal(B.maxDepthTrace(spec).depth, depthOf(spec));
    const byLevel = [];
    nodes.forEach(n => { (byLevel[n.depth] ||= []).push(n); });
    assert.deepEqual(B.levelOrderTrace(spec).levels, byLevel.map(level => level.sort((a, b) => a.x - b.x).map(n => n.v)));
    const inorder = [...nodes].sort((a, b) => a.x - b.x).map(n => n.v);
    assert.equal(B.validBstTrace(spec).valid, inorder.every((v, i) => !i || inorder[i - 1] < v));
    const adj = nodes.map(() => []);
    nodes.forEach(n => { if (n.parent >= 0) { adj[n.id].push(n.parent); adj[n.parent].push(n.id); } });
    let best = -Infinity;
    nodes.forEach(start => {
      const walk = (u, from, sum) => { best = Math.max(best, sum); adj[u].forEach(w => { if (w !== from) walk(w, u, sum + nodes[w].v); }); };
      walk(start.id, -1, start.v);
    });
    assert.equal(B.maxPathSumTrace(spec).best, best);
  });
  assert.equal(B.maxPathSumTrace([-10, [9], [20, [15], [7]]]).best, 42);
  assert.equal(B.validBstTrace([5, [3, [1], [6]], [8, [7], [9]]]).valid, false);
});

/* ---------- chapters 09–12 ---------- */
test('heap traces agree with sorting', () => {
  repeat(150, () => {
    const nums = ints(len(1, 10), -9, 20), k = len(1, nums.length);
    assert.equal(C.kthLargestTrace(nums, k).kth, [...nums].sort((a, b) => b - a)[k - 1]);
    const stones = ints(len(1, 7), 1, 10);
    let pile = [...stones];
    while (pile.length > 1) {
      pile.sort((a, b) => b - a);
      const [a, b] = pile.splice(0, 2);
      if (a !== b) pile.push(a - b);
    }
    assert.equal(C.lastStoneTrace(stones).last, pile[0] ?? 0);
    const lists = Array.from({ length: len(1, 4) }, () => ints(len(0, 4), 0, 9).sort((a, b) => a - b));
    assert.deepEqual(C.mergeKTrace(lists).result, lists.flat().sort((a, b) => a - b));
    const stream = ints(len(1, 9), 0, 30);
    assert.deepEqual(C.medianStreamTrace(stream).medians, stream.map((_, i) => {
      const s = stream.slice(0, i + 1).sort((a, b) => a - b), m = s.length;
      return m % 2 ? s[(m - 1) / 2] : (s[m / 2 - 1] + s[m / 2]) / 2;
    }));
  });
  let heap = [];
  for (const x of [5, 1, 4, 2, 3]) heap = C.heapPush(heap, x).heap;
  const drained = [];
  while (heap.length) { drained.push(heap[0]); heap = C.heapPop(heap); }
  assert.deepEqual(drained, [1, 2, 3, 4, 5]);
});

test('backtracking traces enumerate exactly the right answers', () => {
  for (let n = 0; n <= 4; n++) {
    const nums = Array.from({ length: n }, (_, i) => i + 1);
    assert.equal(new Set(C.subsetsTrace(nums).subsets.map(s => s.join())).size, 2 ** n);
    const fact = [1, 1, 2, 6, 24][n];
    assert.equal(new Set(C.permutationsTrace(nums).perms.map(p => p.join())).size, fact);
  }
  assert.deepEqual(C.combinationSumTrace([2, 3, 6, 7], 7).combos.map(c => c.join()).sort(), ['2,2,3', '7']);
  assert.deepEqual(C.combinationSumTrace([2, 3, 5], 8).combos.map(c => c.join()).sort(), ['2,2,2,2', '2,3,3', '3,5']);
  assert.deepEqual([1, 2, 3, 4, 5, 6].map(n => C.nQueensTrace(n).solutions), [1, 0, 0, 2, 10, 4]);
});

test('greedy traces agree with brute force', () => {
  repeat(200, () => {
    const a = ints(len(1, 8), 0, 3);
    const seen = new Set([0]), queue = [0];
    while (queue.length) {
      const i = queue.shift();
      for (let j = i + 1; j <= i + a[i] && j < a.length; j++) if (!seen.has(j)) { seen.add(j); queue.push(j); }
    }
    assert.equal(C.jumpTrace(a).ok, seen.has(a.length - 1));
    const prices = ints(len(1, 8), 1, 9);
    let profit = 0;
    prices.forEach((p, i) => prices.forEach((q, j) => { if (j > i) profit = Math.max(profit, q - p); }));
    assert.equal(C.stockTrace(prices).best, profit);
    const iv = Array.from({ length: len(1, 6) }, () => { const s = len(0, 8); return [s, s + len(1, 4)]; });
    let keep = 0;
    for (let mask = 0; mask < 1 << iv.length; mask++) {
      const chosen = iv.filter((_, i) => mask & (1 << i)).sort((x, y) => x[0] - y[0]);
      if (chosen.every((x, i) => !i || chosen[i - 1][1] <= x[0])) keep = Math.max(keep, chosen.length);
    }
    assert.equal(C.intervalsTrace(iv).removed, iv.length - keep, JSON.stringify(iv));
    const ratings = ints(len(1, 8), 0, 4);
    const candies = ratings.map(() => 1);
    let changed = true;
    while (changed) {
      changed = false;
      ratings.forEach((r, i) => {
        const need = Math.max(i > 0 && r > ratings[i - 1] ? candies[i - 1] + 1 : 1, i < ratings.length - 1 && r > ratings[i + 1] ? candies[i + 1] + 1 : 1);
        if (candies[i] < need) { candies[i] = need; changed = true; }
      });
    }
    assert.equal(C.candyTrace(ratings).total, candies.reduce((s, c) => s + c, 0), `${ratings}`);
  });
});

test('dynamic programming traces agree with recursion', () => {
  const fib = n => (n < 2 ? 1 : fib(n - 1) + fib(n - 2));
  for (let n = 1; n <= 10; n++) assert.equal(C.climbTrace(n).ways, fib(n));
  const demo = C.coinChangeTrace([1, 3, 4], 6);
  assert.equal(demo.answer, 2);
  assert.deepEqual(demo.parts, [3, 3]);
  assert.deepEqual(C.greedyCoins([1, 3, 4], 6), [4, 1, 1]);
  const lcs = (a, b) => (!a || !b ? 0 : a[0] === b[0] ? 1 + lcs(a.slice(1), b.slice(1)) : Math.max(lcs(a.slice(1), b), lcs(a, b.slice(1))));
  const edit = (a, b) => (!a ? b.length : !b ? a.length : a[0] === b[0] ? edit(a.slice(1), b.slice(1))
    : 1 + Math.min(edit(a.slice(1), b), edit(a, b.slice(1)), edit(a.slice(1), b.slice(1))));
  repeat(100, () => {
    const a = Array.from({ length: len(0, 5) }, () => 'abc'[len(0, 2)]).join('');
    const b = Array.from({ length: len(0, 5) }, () => 'abc'[len(0, 2)]).join('');
    assert.equal(C.lcsTrace(a, b).length, lcs(a, b));
    assert.equal(C.editDistanceTrace(a, b).distance, edit(a, b));
  });
  assert.equal(C.editDistanceTrace('horse', 'ros').distance, 3);
});

/* ---------- wiring ---------- */
test('every problem owns a rig whose events all render and read in both languages', () => {
  assert.equal(PATTERN_IDS.length, 12);
  for (const id of PATTERN_IDS) {
    assert.equal(PROBLEMS[id].length, 4, id);
    for (const problem of PROBLEMS[id]) {
      const rig = RIGS[problem.rig];
      assert.ok(rig, `${id}: no rig ${problem.rig}`);
      assert.ok(rig.input, `${problem.rig}: no input caption`);
      const run = rig.run();
      assert.ok(run.events.length >= 3, `${problem.rig}: too few steps`);
      assert.ok(run.events.length <= 90, `${problem.rig}: ${run.events.length} steps is too long to watch`);
      for (const event of run.events) {
        const entry = DICT[event.key];
        assert.ok(entry, `${problem.rig}: no text for ${event.key}`);
        for (const lang of ['en', 'ru']) {
          const text = entry[lang](...event.args);
          assert.ok(typeof text === 'string' && text.trim(), `${event.key} (${lang})`);
        }
        assert.match(rig.view(run, event), /^<svg/, `${problem.rig}: ${event.key}`);
        for (const [label] of rig.vars(run, event)) assert.ok(DICT[label], `${problem.rig}: no label ${label}`);
      }
    }
  }
});

test('every chapter has its texts and four problems with code', () => {
  for (const id of PATTERN_IDS) {
    for (const part of ['h2', 'essence', 'signals', 'pitfall', 'tpl', 'short', 'p']) assert.ok(DICT[`${id}.${part}`], `${id}.${part}`);
    for (const lang of ['en', 'ru']) {
      const texts = DICT[`${id}.p`][lang];
      assert.equal(texts.length, 4, `${id}.p ${lang}`);
      for (const p of texts) for (const f of ['variant', 'task', 'idea', 'why', 'cx']) assert.ok(p[f], `${id} ${lang} ${f}`);
    }
    for (const p of PROBLEMS[id]) {
      assert.ok(p.name && p.num && p.slug && p.code.includes('('), `${id} ${p.name}`);
      assert.match(p.diff, /^(Easy|Medium|Hard)$/);
    }
    assert.equal(new Set(PROBLEMS[id].map(p => p.rig)).size, 4, `${id}: rigs must differ`);
  }
});
