import test from 'node:test';
import assert from 'node:assert/strict';
import { rng } from '../assets/rand.js';
import * as A from '../algorithms/patterns/model-a.js';
import * as B from '../algorithms/patterns/model-b.js';
import * as C from '../algorithms/patterns/model-c.js';
import * as D from '../algorithms/patterns/model-d.js';
import * as E from '../algorithms/patterns/model-e.js';
import * as F from '../algorithms/patterns/model-f.js';
import * as GM from '../algorithms/patterns/model-games.js';
import { register, bitWidth, hexOf } from '../algorithms/patterns/view-kit.js';
import { RIGS, PATTERN_IDS, runWithInput, MAX_STEPS } from '../algorithms/patterns/rigs.js';
import { parseField, formatField, treeFromLevelOrder, levelOrderOf } from '../algorithms/patterns/inputs.js';
import { PROBLEMS } from '../algorithms/patterns/problems.js';
import { DICT } from '../algorithms/patterns/i18n.js';

const next = rng(42);
const ints = (n, lo, hi) => Array.from({ length: n }, () => lo + Math.floor(next() * (hi - lo + 1)));
const len = (lo, hi) => lo + Math.floor(next() * (hi - lo + 1));
const repeat = (times, fn) => { for (let i = 0; i < times; i++) fn(i); };

/** Keys of the events in a rig's example run. */
const keysOfRun = rig => new Set(rig.run(rig.example).events.map(e => e.key));

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

test('Fisher–Yates: every j sequence gives a different permutation, so all n! come out once', () => {
  for (let n = 1; n <= 5; n++) {
    const nums = Array.from({ length: n }, (_, i) => 10 + i), seen = new Set();
    const walk = (js, i) => {
      if (i === 0) {
        const { result, events } = A.shuffleTrace(nums, js);
        let ref = [...nums];
        js.forEach((j, k) => { const at = n - 1 - k; [ref[at], ref[j]] = [ref[j], ref[at]]; });
        assert.deepEqual(result, ref, `${js}`);
        assert.deepEqual([...result].sort((x, y) => x - y), nums, 'a permutation of the input');
        seen.add(result.join());
        assert.equal(events.filter(e => e.key === 'shf.ev.self').length, js.filter((j, k) => j === n - 1 - k).length);
        for (const e of events) if (e.i >= 0 && e.key !== 'shf.ev.start') assert.deepEqual(e.a.slice(e.i + 1), result.slice(e.i + 1), 'the tail right of i is final');
        return;
      }
      for (let j = 0; j <= i; j++) walk([...js, j], i - 1);
    };
    walk([], n - 1);
    assert.equal(seen.size, [1, 1, 2, 6, 24, 120][n], `n = ${n}: every permutation exactly once`);
  }
  assert.deepEqual(keysOfRun(RIGS.shuffle), new Set(['shf.ev.start', 'shf.ev.pick', 'shf.ev.swap', 'shf.ev.self', 'shf.ev.done']), 'the example shows a swap and j = i');
  assert.equal(runWithInput(RIGS.shuffle, { nums: '1 2 3', j: '0' }).error[0], 'in.err.jCount');
  assert.deepEqual(runWithInput(RIGS.shuffle, { nums: '1 2 3', j: '0 2' }).error, ['in.err.jRange', 2, 2, 1]);
  assert.ok(!runWithInput(RIGS.shuffle, { nums: '7', j: '' }).error, 'one element needs no j');
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

test('random pick with weight: upper_bound agrees with a linear scan, index i owns exactly w[i] values of r', () => {
  repeat(200, () => {
    const w = ints(len(1, 8), 1, 9), total = w.reduce((a, b) => a + b, 0), owned = w.map(() => 0);
    for (let r = 0; r < total; r++) {
      const { index, events } = A.weightedPickTrace(w, r);
      let sum = 0, linear = 0;
      while ((sum += w[linear]) <= r) linear++;
      assert.equal(index, linear, `${w} r=${r}`);
      owned[index]++;
      const boundary = w.slice(0, -1).some((_, i) => w.slice(0, i + 1).reduce((a, b) => a + b, 0) === r);
      if (events.some(e => e.key === 'wp.ev.edge')) assert.ok(boundary, 'an edge step means r sits on a boundary');
      assert.ok(events.filter(e => /wp\.ev\.(left|right|edge)/.test(e.key)).length <= Math.ceil(Math.log2(w.length)), 'O(log n) probes');
    }
    assert.deepEqual(owned, w, `${w}: probabilities are w[i] / total`);
  });
  assert.deepEqual(keysOfRun(RIGS.weightedPick), new Set(['wp.ev.start', 'wp.ev.prefix', 'wp.ev.pick', 'wp.ev.edge', 'wp.ev.left', 'wp.ev.done']), 'the example puts r on a boundary');
  assert.equal(A.weightedPickTrace([3, 1, 4, 2], 3).index, 1);
  assert.equal(A.weightedPickTrace([3, 1, 4, 2], 9).index, 3);
  assert.deepEqual(runWithInput(RIGS.weightedPick, { w: '3 1 4 2', r: '10' }).error, ['in.err.pickR', 9, 10]);
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

test('merge two lists and the cycle entrance agree with brute force', () => {
  repeat(300, () => {
    const x = ints(len(0, 6), 0, 6).sort((p, q) => p - q), y = ints(len(0, 6), 0, 6).sort((p, q) => p - q);
    const { result, merged, events } = B.mergeTwoTrace(x, y);
    const tagged = [...x.map((v, k) => [v, 1, k]), ...y.map((v, k) => [v, 2, k])].sort((p, q) => p[0] - q[0] || p[1] - q[1] || p[2] - q[2]);
    assert.deepEqual(result, tagged.map(([v]) => v), `${x} | ${y}`);
    assert.deepEqual(merged, tagged.map(([, list, k]) => [list, k]), 'stable: on a tie list1 goes first');
    assert.equal(events.filter(e => e.key === 'm2.ev.rest').length, 1, 'the rest is attached by one step');
    const rest = events.find(e => e.key === 'm2.ev.rest');
    assert.ok(merged.slice(rest.rest[0]).every(([list]) => list === rest.args[0]), 'the rest comes from one list');
  });
  const ex = B.mergeTwoTrace([1, 2, 4], [1, 3, 4, 6, 8]);
  assert.deepEqual(new Set(ex.events.map(e => e.key)), new Set(['m2.ev.start', 'm2.ev.tie', 'm2.ev.takeA', 'm2.ev.takeB', 'm2.ev.rest', 'm2.ev.done']));
  assert.deepEqual(ex.events.find(e => e.key === 'm2.ev.rest').args.slice(0, 2), [2, [4, 6, 8]]);

  for (let n = 1; n <= 9; n++) {
    for (let pos = -1; pos < n; pos++) {
      const nextLinks = Array.from({ length: n }, (_, i) => (i + 1 < n ? i + 1 : pos));
      const seen = new Set();
      let node = 0;
      while (node !== -1 && !seen.has(node)) { seen.add(node); node = nextLinks[node]; }
      const run = B.cycleEntryTrace(nextLinks);
      assert.equal(run.entry, node, `n=${n} pos=${pos}: the first node visited twice`);
      if (pos < 0) { assert.equal(run.mu, null); continue; }
      const mu = pos, lambda = n - pos;
      assert.deepEqual([run.mu, run.lambda], [mu, lambda]);
      assert.equal(run.k, lambda * Math.max(1, Math.ceil(mu / lambda)), 'phase 1 ends at the first multiple of λ that is at least μ');
      assert.equal(run.walks, mu, 'phase 2 takes exactly μ steps');
      const phase1 = B.cycleTrace(nextLinks).events.filter(e => e.key === 'cyc.ev.move').map(e => [e.slow, e.fast]);
      assert.deepEqual(run.events.filter(e => e.key === 'cye.ev.move').map(e => [e.slow, e.fast]), phase1, 'phase 1 is Linked List Cycle');
    }
  }
  assert.deepEqual(keysOfRun(RIGS.cycleEntry), new Set(['cye.ev.start', 'cye.ev.move', 'cye.ev.meet', 'cye.ev.reset', 'cye.ev.walk', 'cye.ev.entry']));
  assert.equal(runWithInput(RIGS.cycleEntry, { n: '4', pos: '4' }).error[0], 'in.err.pos');
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

/* ---------- must-know additions ---------- */
test('added hash map, window and list problems agree with brute force', () => {
  repeat(200, () => {
    const nums = ints(len(0, 10), -3, 12);
    const set = [...new Set(nums)].sort((a, b) => a - b);
    let longest = 0, run = 0;
    set.forEach((v, i) => { run = i && v === set[i - 1] + 1 ? run + 1 : 1; longest = Math.max(longest, run); });
    assert.equal(A.longestConsecutiveTrace(nums).best, longest, `${nums}`);
    let missing = 1;
    while (nums.includes(missing)) missing++;
    assert.equal(A.firstMissingTrace(nums).answer, missing, `${nums}`);
    const s = Array.from({ length: len(1, 10) }, () => 'ABC'[len(0, 2)]).join(''), k = len(0, 3);
    let best = 0;
    for (let i = 0; i < s.length; i++) for (let j = i; j < s.length; j++) {
      const w = s.slice(i, j + 1), top = Math.max(...[...'ABC'].map(c => [...w].filter(x => x === c).length));
      if (w.length - top <= k) best = Math.max(best, w.length);
    }
    assert.equal(A.charReplacementTrace(s, k).best, best, `${s} k=${k}`);
  });
  repeat(200, () => {
    const capacity = len(1, 3), ops = Array.from({ length: len(1, 10) }, () => (next() < 0.5 ? ['put', len(1, 4), len(1, 9)] : ['get', len(1, 4)]));
    const cache = new Map(), expected = [];
    for (const [op, key, value] of ops) {
      if (op === 'get') {
        if (!cache.has(key)) { expected.push(-1); continue; }
        const v = cache.get(key); cache.delete(key); cache.set(key, v); expected.push(v);
      } else {
        cache.delete(key); cache.set(key, value);
        if (cache.size > capacity) cache.delete(cache.keys().next().value);
      }
    }
    assert.deepEqual(B.lruTrace(capacity, ops).gets, expected, JSON.stringify(ops));
  });
});

test('added graph and tree problems agree with brute force', () => {
  repeat(200, () => {
    const n = len(2, 6), edges = Array.from({ length: len(0, 7) }, () => [len(0, n - 1), len(0, n - 1)]).filter(([a, b]) => a !== b);
    const adj = Array.from({ length: n }, () => []);
    edges.forEach(([a, b]) => adj[b].push(a));
    const state = Array(n).fill(0);
    const cyclic = u => { if (state[u] === 1) return true; if (state[u] === 2) return false; state[u] = 1; const c = adj[u].some(cyclic); state[u] = 2; return c; };
    const hasCycle = [...Array(n).keys()].some(cyclic);
    assert.equal(B.courseScheduleTrace(n, edges).ok, !hasCycle, `${n} ${JSON.stringify(edges)}`);
  });
  const distinctTree = depth => (depth > 3 || next() < 0.25 ? null : [0, distinctTree(depth + 1), distinctTree(depth + 1)]);
  repeat(150, () => {
    let label = 1;
    const number = s => (s ? [label++, number(s[1]), number(s[2])] : null);
    const spec = number(distinctTree(0) || [0]);
    const nodes = B.layoutTree(spec), values = nodes.map(n => n.v);
    const p = values[len(0, values.length - 1)], q = values[len(0, values.length - 1)];
    const chain = v => { const out = []; for (let n = nodes.find(x => x.v === v); n; n = n.parent >= 0 ? nodes[n.parent] : null) out.push(n.v); return out; };
    const expected = chain(p).find(v => chain(q).includes(v));
    assert.equal(B.lcaTrace(spec, p, q).answer, expected, `${JSON.stringify(spec)} ${p} ${q}`);
  });
});

test('added heap, backtracking, greedy and DP problems agree with brute force', () => {
  repeat(150, () => {
    const nums = ints(len(1, 12), 0, 5);
    const freq = new Map();
    nums.forEach(x => freq.set(x, (freq.get(x) || 0) + 1));
    const k = len(1, freq.size);
    const top = [...freq.values()].sort((a, b) => b - a).slice(0, k);
    const got = C.topKFrequentTrace(nums, k).top;
    assert.deepEqual(got.map(x => freq.get(x)).sort((a, b) => b - a), top);
    const board = Array.from({ length: len(1, 3) }, () => Array.from({ length: 3 }, () => 'AB'[len(0, 1)]));
    const word = Array.from({ length: len(1, 4) }, () => 'AB'[len(0, 1)]).join('');
    const search = (r, c, i, used) => {
      if (i === word.length) return true;
      if (r < 0 || c < 0 || r >= board.length || c >= 3 || used.has(`${r},${c}`) || board[r][c] !== word[i]) return false;
      const u = new Set(used).add(`${r},${c}`);
      return [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dr, dc]) => search(r + dr, c + dc, i + 1, u));
    };
    const exists = board.some((row, r) => row.some((_, c) => search(r, c, 0, new Set())));
    assert.equal(C.wordSearchTrace(board, word).found, exists, `${board.map(r => r.join('')).join('/')} ${word}`);
    const iv = Array.from({ length: len(1, 6) }, () => { const a = len(0, 10); return [a, a + len(0, 4)]; });
    const covered = new Set();
    iv.forEach(([a, b]) => { for (let x = a * 2; x <= b * 2; x++) covered.add(x); });
    const merged = C.mergeIntervalsTrace(iv).merged;
    const mine = new Set();
    merged.forEach(([a, b]) => { for (let x = a * 2; x <= b * 2; x++) mine.add(x); });
    assert.deepEqual([...mine].sort((a, b) => a - b), [...covered].sort((a, b) => a - b));
    assert.ok(merged.every((m, i) => !i || merged[i - 1][1] < m[0]), 'merged intervals must not touch');
    const a = ints(len(1, 9), 0, 9);
    let lis = 0;
    for (let mask = 1; mask < 1 << a.length; mask++) {
      const pickd = a.filter((_, i) => mask & (1 << i));
      if (pickd.every((v, i) => !i || pickd[i - 1] < v)) lis = Math.max(lis, pickd.length);
    }
    assert.equal(C.lisTrace(a).best, lis, `${a}`);
  });
  repeat(300, () => {
    const s = Array.from({ length: len(0, 5) }, () => 'ab'[len(0, 1)]).join('');
    let p = '';
    for (let i = 0; i < len(1, 5); i++) { p += 'ab.'[len(0, 2)]; if (next() < 0.4) p += '*'; }
    assert.equal(C.regexTrace(s, p).match, new RegExp(`^(?:${p})$`).test(s), `${s} ~ ${p}`);
  });
  assert.equal(C.regexTrace('aab', 'c*a*b').match, true);
  assert.equal(C.regexTrace('mississippi', 'mis*is*p*.').match, false);
});

/* ---------- sliding window maximum and chapter 13 ---------- */
const matrixOf = (rows, cols, lo, hi) => Array.from({ length: rows }, () => ints(cols, lo, hi));

test('sliding window maximum: the deque front is the window maximum, every index enters once', () => {
  repeat(300, () => {
    const nums = ints(len(1, 12), -5, 9), k = len(1, nums.length);
    const brute = nums.slice(0, nums.length - k + 1).map((_, l) => Math.max(...nums.slice(l, l + k)));
    const { ans, events } = A.slidingMaxTrace(nums, k);
    assert.deepEqual(ans, brute, `${nums} k=${k}`);
    assert.equal(events.filter(e => e.key === 'swm.ev.push').length, nums.length);
    for (const e of events) {
      assert.ok(e.dq.every((j, q) => !q || nums[e.dq[q - 1]] > nums[j]), `values in the deque decrease: ${e.dq}`);
      if (e.i != null) assert.ok(e.dq.every(j => j <= e.i && j > e.i - k), 'the deque holds window indices only');
    }
  });
  const keys = new Set(A.slidingMaxTrace([1, 3, -1, -3, 5, 3, 6, 7], 3).events.map(e => e.key));
  for (const key of ['swm.ev.push', 'swm.ev.pop', 'swm.ev.out', 'swm.ev.max']) assert.ok(keys.has(key), `the example shows ${key}`);
});

test('chapter 13 traces agree with brute force', () => {
  repeat(200, () => {
    const nums = ints(len(2, 8), -3, 4);
    const product = nums.map((_, i) => nums.reduce((p, v, j) => (j === i ? p : p * v), 1) || 0);
    assert.deepEqual(D.productExceptTrace(nums).ans, product, `${nums}`);

    const n = len(1, 6), sq = matrixOf(n, n, -9, 9);
    assert.deepEqual(D.rotateTrace(sq).result, sq.map((_, r) => sq.map((_, c) => sq[n - 1 - c][r])), JSON.stringify(sq));

    const rows = len(1, 6), cols = len(1, 6), m = matrixOf(rows, cols, 0, 4);
    const zr = m.map(row => row.includes(0)), zc = m[0].map((_, c) => m.some(row => row[c] === 0));
    assert.deepEqual(D.setZeroesTrace(m).result, m.map((row, r) => row.map((v, c) => (zr[r] || zc[c] ? 0 : v))), JSON.stringify(m));

    const spiral = [], seen = new Set();
    let r = 0, c = 0, d = 0;
    const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];
    for (let k = 0; k < rows * cols; k++) {
      spiral.push(m[r][c]); seen.add(`${r},${c}`);
      const [nr, nc] = [r + dirs[d][0], c + dirs[d][1]];
      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || seen.has(`${nr},${nc}`)) d = (d + 1) % 4;
      r += dirs[d][0]; c += dirs[d][1];
    }
    assert.deepEqual(D.spiralTrace(m).order, spiral, JSON.stringify(m));

    const grid = matrixOf(len(1, 5), len(1, 6), 0, 1);
    let best = 0;
    for (let r1 = 0; r1 < grid.length; r1++) for (let r2 = r1; r2 < grid.length; r2++)
      for (let c1 = 0; c1 < grid[0].length; c1++) for (let c2 = c1; c2 < grid[0].length; c2++) {
        let full = true;
        for (let y = r1; y <= r2 && full; y++) for (let x = c1; x <= c2; x++) if (!grid[y][x]) { full = false; break; }
        if (full) best = Math.max(best, (r2 - r1 + 1) * (c2 - c1 + 1));
      }
    assert.equal(D.maximalRectTrace(grid).best, best, JSON.stringify(grid));
  });
  assert.deepEqual(D.productExceptTrace([1, 2, 3, 4]).ans, [24, 12, 8, 6]);
  assert.deepEqual(D.productExceptTrace([-1, 1, 0, -3, 3]).ans, [0, 0, 9, 0, 0]);
  assert.deepEqual(D.setZeroesTrace([[0, 1, 2, 0], [3, 4, 5, 2], [1, 3, 1, 5]]).result, [[0, 0, 0, 0], [0, 4, 5, 0], [0, 3, 1, 0]]);
  assert.equal(D.maximalRectTrace(['10100', '10111', '11111', '10010'].map(r => [...r].map(Number))).best, 6);
  const guards = new Set([[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]], [[1], [2], [3]]].flatMap(m => D.spiralTrace(m).events.map(e => e.key)));
  assert.ok(guards.has('spi.ev.noRow') && guards.has('spi.ev.noCol'), 'both inner checks of the spiral show up');
});

test('the matrix field reads rows split by “|”, “;”, new lines or nested brackets', () => {
  const spec = { type: 'matrix', maxRows: 6, maxCols: 6, min: -99, max: 99 };
  for (const t of ['1 2 3 | 4 5 6', '[[1,2,3],[4,5,6]]', '1, 2, 3; 4, 5, 6', '1 2 3\n4 5 6']) assert.deepEqual(parseField(t, spec).value, [[1, 2, 3], [4, 5, 6]], t);
  assert.equal(formatField([[1, 2, 3], [4, 5, 6]], spec), '1 2 3 | 4 5 6');
  assert.deepEqual(parseField('1 2 | 3', spec).error, ['in.err.gridRagged']);
  assert.deepEqual(parseField('1 2 | 3 x', spec).error, ['in.err.notInt', 'x']);
  assert.deepEqual(parseField('1 2 3 | 4 5 6', { ...spec, square: true }).error, ['in.err.square', 2, 3]);
  assert.deepEqual(parseField('1 2 3 4 5 6 7', spec).error, ['in.err.gridCols', 6]);
  assert.deepEqual(parseField('', spec).error, ['in.err.matRows', 1, 6]);
  assert.deepEqual(parseField('1 | 2 | 3 | 4 | 5 | 6 | 7', spec).error, ['in.err.matRows', 1, 6]);
  assert.equal(parseField('100', spec).error[0], 'in.err.range');
  const rotate = runWithInput(RIGS.rotate, { matrix: '1 2 | 3 4 | 5 6' });
  assert.equal(rotate.error[0], 'in.err.square');
});

/* ---------- Two Sum II, Island Perimeter, Game of Life and chapter 14 ---------- */
const keysOf = run => new Set(run.events.map(e => e.key));
const grid01 = (rows, cols, p) => Array.from({ length: rows }, () => Array.from({ length: cols }, () => (next() < p ? 1 : 0)));
const N4 = [[1, 0], [-1, 0], [0, 1], [0, -1]];

test('two sum II: every pointer move drops a number that has no partner left', () => {
  repeat(300, () => {
    const a = ints(len(2, 10), -9, 15).sort((x, y) => x - y), target = len(-10, 25);
    const { found, events } = A.twoSumIITrace(a, target);
    assert.equal(found !== null, a.some((v, i) => a.some((w, j) => j > i && v + w === target)), `${a} t=${target}`);
    if (found) assert.ok(found[0] < found[1] && a[found[0] - 1] + a[found[1] - 1] === target);
    for (const e of events) {
      if (e.key === 'tsii.ev.big') assert.ok(a.slice(e.lo, e.hi).every(v => v + a[e.hi] !== target), 'hi had a partner');
      if (e.key === 'tsii.ev.small') assert.ok(a.slice(e.lo + 1, e.hi + 1).every(v => v + a[e.lo] !== target), 'lo had a partner');
    }
  });
  const keys = keysOf(A.twoSumIITrace([-3, 1, 2, 4, 7, 11, 15], 9));
  for (const key of ['tsii.ev.big', 'tsii.ev.small', 'tsii.ev.hit']) assert.ok(keys.has(key), `the example shows ${key}`);
  assert.deepEqual(A.twoSumIITrace([2, 7, 11, 15], 9).found, [1, 2]);
  assert.deepEqual(A.twoSumIITrace([-1, 0], -1).found, [1, 2]);
});

test('island perimeter and game of life agree with brute force', () => {
  repeat(200, () => {
    const g = grid01(len(1, 6), len(1, 6), 0.5);
    let sides = 0;
    g.forEach((row, r) => row.forEach((v, c) => { if (v) sides += N4.filter(([dr, dc]) => !g[r + dr]?.[c + dc]).length; }));
    assert.equal(B.islandPerimeterTrace(g).perimeter, sides, JSON.stringify(g));

    const b = grid01(len(1, 6), len(1, 6), 0.4);
    const nextGen = b.map((row, r) => row.map((v, c) => {
      let live = 0;
      for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) if ((dr || dc) && b[r + dr]?.[c + dc]) live++;
      return live === 3 || (v && live === 2) ? 1 : 0;
    }));
    const life = D.gameOfLifeTrace(b);
    assert.deepEqual(life.result, nextGen, JSON.stringify(b));
    for (const e of life.events) assert.ok(e.b.flat().every(v => v >= 0 && v <= 3), 'two bits per cell');
  });
  assert.equal(B.islandPerimeterTrace([[0, 1, 0, 0], [1, 1, 1, 0], [0, 1, 0, 0], [1, 1, 0, 0]]).perimeter, 16);
  const perKeys = keysOf(B.islandPerimeterTrace([[0, 1, 0, 0], [1, 1, 1, 0], [0, 1, 0, 0], [1, 1, 0, 0]]));
  for (const key of ['per.ev.land', 'per.ev.right', 'per.ev.down']) assert.ok(perKeys.has(key), `the example shows ${key}`);
  const blinker = D.gameOfLifeTrace([[0, 0, 0, 0, 0], [0, 1, 1, 1, 0], [0, 0, 0, 0, 0]]);
  assert.deepEqual(blinker.result, [[0, 0, 1, 0, 0], [0, 0, 1, 0, 0], [0, 0, 1, 0, 0]]);
  assert.deepEqual(D.gameOfLifeTrace(blinker.result).result, [[0, 0, 0, 0, 0], [0, 1, 1, 1, 0], [0, 0, 0, 0, 0]], 'the blinker flips back');
  for (const key of ['gol.ev.born', 'gol.ev.under', 'gol.ev.lives', 'gol.ev.empty']) assert.ok(keysOf(blinker).has(key), `the blinker shows ${key}`);
  assert.deepEqual(D.gameOfLifeTrace([[0, 1, 0], [0, 0, 1], [1, 1, 1], [0, 0, 0]]).result, [[0, 0, 0], [1, 0, 1], [0, 1, 1], [0, 1, 0]]);
});

/** Plain BFS steps from (0, 0) to the bottom-right corner through cells where pass(y, x) and step(r, c, y, x) hold; −1 if none. */
function bfsSteps(rows, cols, pass, step = () => true) {
  const dist = Array.from({ length: rows }, () => Array(cols).fill(-1)), queue = [[0, 0]];
  dist[0][0] = 0;
  while (queue.length) {
    const [r, c] = queue.shift();
    for (const [dr, dc] of N4) {
      const y = r + dr, x = c + dc;
      if (y < 0 || x < 0 || y >= rows || x >= cols || dist[y][x] >= 0 || !pass(y, x) || !step(r, c, y, x)) continue;
      dist[y][x] = dist[r][c] + 1;
      queue.push([y, x]);
    }
  }
  return dist[rows - 1][cols - 1];
}

test('chapter 14: BFS distances, Dijkstra and BFS over states agree with brute force', () => {
  repeat(150, () => {
    const mat = grid01(len(1, 6), len(1, 6), 0.75);
    mat[len(0, mat.length - 1)][len(0, mat[0].length - 1)] = 0;
    const zeros = mat.flatMap((row, r) => row.map((v, c) => (v ? null : [r, c])).filter(Boolean));
    const near = E.nearestZeroTrace(mat);
    assert.deepEqual(near.dist, mat.map((row, r) => row.map((_, c) => Math.min(...zeros.map(([y, x]) => Math.abs(y - r) + Math.abs(x - c))))), JSON.stringify(mat));
    assert.equal(near.events.filter(e => e.key === 'zom.ev.pop' || e.key === 'zom.ev.skip').length, mat.flat().length, 'every cell is dequeued once');

    const n = len(1, 6), times = [];
    for (let t = len(0, 10); t > 0; t--) {
      const u = len(1, n), v = len(1, n);
      if (u !== v && !times.some(([a, b]) => a === u && b === v)) times.push([u, v, len(0, 9)]);
    }
    const k = len(1, n), dist = Array(n + 1).fill(Infinity);
    dist[k] = 0;
    for (let round = 0; round < n; round++) for (const [u, v, w] of times) dist[v] = Math.min(dist[v], dist[u] + w);
    const worst = Math.max(...dist.slice(1));
    const delay = E.networkDelayTrace(times, n, k);
    assert.equal(delay.answer, worst === Infinity ? -1 : worst, `${JSON.stringify(times)} n=${n} k=${k}`);
    for (const e of delay.events) if (e.key === 'ndt.ev.stale') assert.ok(e.args[1] > e.args[2], 'a skipped entry is really stale');

    const hc = len(1, 4), h = Array.from({ length: len(1, 4) }, () => ints(hc, 1, 9));
    const climbable = limit => bfsSteps(h.length, hc, () => true, (r, c, y, x) => Math.abs(h[y][x] - h[r][c]) <= limit) >= 0;
    let effort = 0;
    while (!climbable(effort)) effort++;
    assert.equal(E.minEffortTrace(h).effort, effort, JSON.stringify(h));

    const grid = grid01(len(1, 4), len(1, 4), 0.4), walls = len(0, 2);
    grid[0][0] = 0;
    grid.at(-1)[grid[0].length - 1] = 0;
    const cellsWithWalls = grid.flatMap((row, r) => row.map((v, c) => (v ? [r, c] : null)).filter(Boolean));
    let best = -1;
    const tryBreak = (from, broken) => {
      const steps = bfsSteps(grid.length, grid[0].length, (y, x) => !grid[y][x] || broken.some(([a, b]) => a === y && b === x));
      if (grid.length * grid[0].length === 1) best = 0;
      else if (steps >= 0 && (best < 0 || steps < best)) best = steps;
      if (broken.length < walls) for (let i = from; i < cellsWithWalls.length; i++) tryBreak(i + 1, [...broken, cellsWithWalls[i]]);
    };
    tryBreak(0, []);
    assert.equal(E.obstaclesTrace(grid, walls).steps, best, `${JSON.stringify(grid)} k=${walls}`);
  });
  assert.deepEqual(E.nearestZeroTrace([[0, 0, 0], [0, 1, 0], [1, 1, 1]]).dist, [[0, 0, 0], [0, 1, 0], [1, 2, 1]]);
  assert.equal(E.networkDelayTrace([[2, 1, 1], [2, 3, 1], [3, 4, 1]], 4, 2).answer, 2);
  assert.equal(E.networkDelayTrace([[1, 2, 1]], 2, 2).answer, -1);
  assert.equal(E.minEffortTrace([[1, 2, 2], [3, 8, 2], [5, 3, 5]]).effort, 2);
  assert.equal(E.minEffortTrace([[1, 2, 3], [3, 8, 4], [5, 3, 5]]).effort, 1);
  assert.equal(E.minEffortTrace([[1, 2, 1, 1, 1], [1, 2, 1, 2, 1], [1, 2, 1, 2, 1], [1, 2, 1, 2, 1], [1, 1, 1, 2, 1]]).effort, 0);
  const lc = s => s.split(' ').map(r => [...r].map(Number));
  assert.equal(E.obstaclesTrace(lc('000 110 000 011 000'), 1).steps, 6);
  assert.equal(E.obstaclesTrace(lc('011 111 100'), 1).steps, -1);
  assert.equal(E.obstaclesTrace(lc('0'), 0).steps, 0);
  const shown = [
    [E.nearestZeroTrace(lc('11101 11111 01111 11110')), ['zom.ev.level', 'zom.ev.pop', 'zom.ev.skip']],
    [E.networkDelayTrace([[1, 2, 4], [1, 3, 1], [3, 2, 2], [2, 3, 1], [2, 4, 1], [3, 4, 5], [3, 5, 7], [4, 5, 3]], 5, 1), ['ndt.ev.relax', 'ndt.ev.keep', 'ndt.ev.stale', 'ndt.ev.done']],
    [E.minEffortTrace([[5, 5, 6, 2], [7, 7, 6, 8], [3, 1, 6, 4]]), ['eff.ev.relax', 'eff.ev.settle', 'eff.ev.stale', 'eff.ev.done']],
    [E.obstaclesTrace(lc('000 110 000 011 000'), 1), ['obs.ev.step', 'obs.ev.smash', 'obs.ev.dead', 'obs.ev.found']],
  ];
  for (const [run, keys] of shown) for (const key of keys) assert.ok(keysOf(run).has(key), `the example shows ${key}`);
});

test('the weighted edge field reads from>to:weight, triples or nested brackets', () => {
  const spec = { type: 'wedges', minLen: 1, maxLen: 14, maxW: 20 };
  for (const t of ['2>1:1 2>3:1', '[[2,1,1],[2,3,1]]', '2→1:1, 2→3:1', '2 1 1 2 3 1']) assert.deepEqual(parseField(t, spec).value, [[2, 1, 1], [2, 3, 1]], t);
  assert.equal(formatField([[2, 1, 1], [2, 3, 1]], spec), '2>1:1 2>3:1');
  assert.deepEqual(parseField('2>1:1 2>3', spec).error, ['in.err.wedges']);
  assert.deepEqual(parseField('2>2:1', spec).error, ['in.err.selfLoop']);
  assert.deepEqual(parseField('1>2:1 1>2:5', spec).error, ['in.err.dupEdge']);
  assert.equal(parseField('1>2:99', spec).error[0], 'in.err.range');
  assert.equal(runWithInput(RIGS.networkDelay, { times: '1>2:1 2>6:1', n: '5', k: '1' }).error[0], 'in.err.node');
  assert.equal(runWithInput(RIGS.networkDelay, { times: '1>2:1', n: '2', k: '3' }).error[0], 'in.err.node');
  assert.equal(runWithInput(RIGS.nearestZero, { mat: '111 111' }).error[0], 'in.err.needZero');
  assert.equal(runWithInput(RIGS.obstacles, { grid: '100 000', k: '1' }).error[0], 'in.err.corners');
});

/* ---------- chapter 15: bit manipulation ---------- */
/** Bits of a 32-bit word as a string, by division instead of bit operators: an independent reference. */
const binary = v => { let u = v < 0 ? v + 2 ** 32 : v, s = ''; for (let i = 0; i < 32; i++) { s = (u % 2) + s; u = Math.floor(u / 2); } return s; };

test('chapter 15: register traces agree with brute force', () => {
  repeat(300, () => {
    const n = Math.floor(next() * 2 ** 32);
    const pop = F.popcountTrace(n);
    const ones = [...binary(n)].filter(c => c === '1').length;
    assert.equal(pop.count, ones, `${n}`);
    assert.equal(pop.power, ones === 1);
    for (const e of pop.events) if (e.key === 'pop.ev.and') assert.equal(binary(e.x).replace(/1(0*)$/, '0$1'), binary(e.and), 'x & (x − 1) clears exactly the lowest 1');

    const size = len(1, 12), gone = len(0, size);
    const nums = Array.from({ length: size + 1 }, (_, i) => i).filter(v => v !== gone).sort(() => next() - 0.5);
    assert.equal(F.missingXorTrace(nums).answer, gone, `${nums}`);

    const vals = [...new Set(ints(len(3, 7), -40, 40))];
    if (vals.length >= 2) {
      const [a, b, ...pairs] = vals;
      const arr = [a, b, ...pairs, ...pairs].sort(() => next() - 0.5);
      const single = F.singleIIITrace(arr);
      assert.deepEqual(single.pair, [Math.min(a, b), Math.max(a, b)], `${arr}`);
      const low = single.events.find(e => e.key === 'sn3.ev.low');
      const diff = binary(a ^ b), at = 31 - diff.lastIndexOf('1');
      assert.equal(low.args[3], at, 'x & −x is the lowest bit where a and b differ');
    }

    const m = len(0, 40);
    assert.deepEqual(F.countBitsTrace(m).bits, Array.from({ length: m + 1 }, (_, i) => [...i.toString(2)].filter(c => c === '1').length));

    const x = len(-1000, 1000), y = len(-1000, 1000), sum = F.sumBitsTrace(x, y);
    assert.equal(sum.sum, x + y, `${x} + ${y}`);
    assert.ok(sum.events.length <= 40, 'at most 32 rounds');

    const pool = ints(len(1, 8), 0, 63), queries = Array.from({ length: len(1, 5) }, () => [len(0, 63), len(0, 63)]);
    const brute = queries.map(([qx, qm]) => { const ok = pool.filter(v => v <= qm); return ok.length ? Math.max(...ok.map(v => qx ^ v)) : -1; });
    assert.deepEqual(F.maxXorLimitTrace(pool, queries).answers, brute, `${pool} ${JSON.stringify(queries)}`);
  });
  assert.equal(F.popcountTrace(11).count, 3);
  assert.equal(F.popcountTrace(4294967293).count, 31);
  assert.equal(F.popcountTrace(0).count, 0);
  assert.equal(F.missingXorTrace([3, 0, 1]).answer, 2);
  assert.deepEqual(F.singleIIITrace([1, 2, 1, 3, 2, 5]).pair, [3, 5]);
  assert.deepEqual(F.singleIIITrace([-1, 0]).pair, [-1, 0]);
  assert.equal(F.sumBitsTrace(-1, 1).sum, 0);
  assert.equal(F.sumBitsTrace(-1000, -1000).sum, -2000);
  assert.deepEqual(F.maxXorLimitTrace([0, 1, 2, 3, 4], [[3, 1], [1, 3], [5, 6]]).answers, [3, 3, 7]);
  assert.deepEqual(F.maxXorLimitTrace([5, 2, 4, 6, 6, 3], [[12, 4], [8, 1], [6, 3]]).answers, [15, -1, 5]);
  const shown = [
    [F.popcountTrace(52), ['pop.ev.minus', 'pop.ev.and', 'pop.ev.done']],
    [F.popcountTrace(64), ['pop.ev.pow2']],
    [F.missingXorTrace([9, 6, 4, 2, 3, 5, 7, 0, 1]), ['mis.ev.wait', 'mis.ev.meet', 'mis.ev.done']],
    [F.singleIIITrace([1, 2, 1, 3, 2, 5]), ['sn3.ev.fold', 'sn3.ev.cancel', 'sn3.ev.neg', 'sn3.ev.low', 'sn3.ev.one', 'sn3.ev.zero']],
    [F.countBitsTrace(12), ['cb.ev.even', 'cb.ev.odd', 'cb.ev.pow']],
    [F.sumBitsTrace(13, 11), ['sum.ev.carry', 'sum.ev.nocarry']],
    [F.sumBitsTrace(-3, 5), ['sum.ev.drop']],
    [F.maxXorLimitTrace([5, 2, 4, 6, 6, 3], [[12, 4], [8, 1], [6, 3]]), ['mxl.ev.empty', 'mxl.ev.insert', 'mxl.ev.take', 'mxl.ev.same', 'mxl.ev.answer']],
  ];
  for (const [run, keys] of shown) for (const key of keys) assert.ok(keysOf(run).has(key), `the example shows ${key}`);
});

test('the register: width, hex, banks of 16 and marks', () => {
  assert.equal(bitWidth([0, 255]), 8);
  assert.equal(bitWidth([256]), 16);
  assert.equal(bitWidth([65536]), 32);
  assert.equal(bitWidth([-1]), 32, 'a negative int needs all 32 bits');
  assert.equal(hexOf(-1), '0xFFFFFFFF');
  assert.equal(hexOf(44, 8), '0x2C');
  const wide = register([{ label: 'x', value: -6, ref: -5 }], { bits: 32, signed: true, cursor: 0 });
  assert.equal((wide.match(/<rect class="bit /g) || []).length, 32);
  assert.match(wide, /−6 · 0xFFFFFFFA/);
  assert.equal((wide.match(/class="bit [^"]*chg/g) || []).length, 1, 'only bit 0 differs between −6 and −5');
  assert.match(wide, /class="bitcol"/);
  const narrow = register([{ label: 'n', value: 52 }], { bits: 8 });
  assert.equal((narrow.match(/<rect class="bit one/g) || []).length, 3);
  assert.match(narrow, /uint32 · 31…8 = 0/);
  const [w32, w8] = [wide, narrow].map(s => Number(s.match(/viewBox="0 0 (\d+)/)[1]));
  assert.ok(w32 <= 440 && w8 <= 250, `a 32-bit register wraps into two banks of 16: ${w32}, ${w8}`);
});

test('the uint field reads decimal, hex and binary', () => {
  const spec = { type: 'uint', min: 0, max: 4294967295 };
  for (const t of ['52', '0x34', '0b110100', '0b0011_0100', '0X34']) assert.equal(parseField(t, spec).value, 52, t);
  assert.equal(parseField('4294967295', spec).value, 4294967295);
  assert.equal(parseField('0xFFFFFFFF', spec).value, 4294967295);
  assert.equal(parseField('4294967296', spec).error[0], 'in.err.range');
  assert.equal(parseField('-1', spec).error[0], 'in.err.uint');
  assert.equal(parseField('0x', spec).error[0], 'in.err.uint');
  assert.equal(formatField(52, spec), '52');
  assert.equal(runWithInput(RIGS.missingXor, { nums: '0 1 5' }).error[0], 'in.err.missing');
  assert.equal(runWithInput(RIGS.missingXor, { nums: '0 1 1' }).error[0], 'in.err.distinct');
  assert.equal(runWithInput(RIGS.singleIII, { nums: '1 1 2 2' }).error[0], 'in.err.twoSingles');
  assert.equal(runWithInput(RIGS.singleIII, { nums: '1 2 3' }).error[0], 'in.err.twoSingles');
  assert.equal(runWithInput(RIGS.maxXorLimit, { nums: '1 2', queries: '1 | 2' }).error[0], 'in.err.pairs');
});

/* ---------- chapter 16: games — paths and space ---------- */
const N8 = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
/** Shortest clear path in cells over 8 directions, by a BFS written here, apart from the model. */
function bfs8Cells(grid) {
  const n = grid.length, m = grid[0].length;
  if (grid[0][0] || grid[n - 1][m - 1]) return -1;
  const dist = grid.map(r => r.map(() => -1)), queue = [[0, 0]];
  dist[0][0] = 1;
  while (queue.length) {
    const [r, c] = queue.shift();
    for (const [dr, dc] of N8) {
      const y = r + dr, x = c + dc;
      if (y < 0 || x < 0 || y >= n || x >= m || grid[y][x] || dist[y][x] > 0) continue;
      dist[y][x] = dist[r][c] + 1;
      queue.push([y, x]);
    }
  }
  return dist[n - 1][m - 1];
}

test('chapter 16: A* with an admissible h equals BFS, overestimating ones never beat it', () => {
  repeat(300, () => {
    const n = len(1, 7), grid = grid01(n, n, 0.3);
    if (next() < 0.8) { grid[0][0] = 0; grid[n - 1][n - 1] = 0; }
    const best = bfs8Cells(grid);
    const che = GM.astarTrace(grid, 'chebyshev'), zero = GM.astarTrace(grid, 'zero');
    assert.equal(che.length, best, JSON.stringify(grid));
    assert.equal(zero.length, best, 'h = 0 is Dijkstra, here BFS');
    assert.ok(che.expanded <= zero.expanded, `an admissible h never expands more than Dijkstra: ${che.expanded} > ${zero.expanded}`);
    for (const h of ['octile', 'manhattan']) {
      const r = GM.astarTrace(grid, h);
      assert.equal(r.length < 0, best < 0, `${h} finds a path whenever one exists`);
      if (best > 0) assert.ok(r.length >= best, `${h}: ${r.length} < ${best}`);
      assert.equal(keysOf(r).has('ast.ev.worse'), r.length > best);
    }
    for (const r of [che, zero]) {
      if (best < 0) { assert.deepEqual(r.path, []); continue; }
      assert.equal(r.path.length, best);
      assert.deepEqual(r.path[0], [0, 0]);
      assert.deepEqual(r.path.at(-1), [n - 1, n - 1]);
      r.path.forEach(([y, x], i) => {
        assert.equal(grid[y][x], 0, 'the path stays on free cells');
        if (i) assert.ok(Math.max(Math.abs(y - r.path[i - 1][0]), Math.abs(x - r.path[i - 1][1])) === 1, 'one king move per step');
      });
      const popped = r.events.filter(e => e.key === 'ast.ev.pop').map(e => e.args[0]);
      assert.equal(new Set(popped).size, popped.length, 'a closed cell is never expanded again');
      for (const e of r.events) if (e.key === 'ast.ev.stale') assert.ok(e.args[1] > e.args[2], 'a skipped entry is really stale');
    }
  });
  const lc = s => s.split(' ').map(r => [...r].map(Number));
  assert.equal(GM.astarTrace(lc('01 10'), 'chebyshev').length, 2);
  assert.equal(GM.astarTrace(lc('000 110 110'), 'chebyshev').length, 4);
  assert.equal(GM.astarTrace(lc('100 110 110'), 'chebyshev').length, -1);
  assert.equal(GM.astarTrace(lc('0'), 'zero').length, 1);
  const example = lc('0000000 0000010 0110010 0001110 0101010 0101010 0000000');
  assert.equal(GM.astarTrace(example, 'manhattan').length, 11, 'the example shows Manhattan returning a longer path');
  assert.ok(GM.astarTrace(example, 'zero').expanded >= 2 * GM.astarTrace(example, 'chebyshev').expanded);
  for (const key of ['ast.ev.pop', 'ast.ev.open', 'ast.ev.relax', 'ast.ev.closed', 'ast.ev.stale', 'ast.ev.found']) {
    assert.ok(keysOfRun(RIGS.astar).has(key), `the example shows ${key}`);
  }
});

test('chapter 16: every flow-field arrow goes downhill, and integration equals relaxation to a fixpoint', () => {
  repeat(200, () => {
    const rows = len(1, 6), cols = len(1, 7);
    const cost = Array.from({ length: rows }, () => Array.from({ length: cols }, () => (next() < 0.2 ? 0 : len(1, 9))));
    const goals = [[len(0, rows - 1), len(0, cols - 1)]];
    cost[goals[0][0]][goals[0][1]] = 1;
    if (next() < 0.3) { const g = [len(0, rows - 1), len(0, cols - 1)]; cost[g[0]][g[1]] = 1; if (g.join() !== goals[0].join()) goals.push(g); }
    const ref = cost.map(r => r.map(() => Infinity));
    for (const [r, c] of goals) ref[r][c] = 0;
    for (let changed = true; changed;) {
      changed = false;
      cost.forEach((row, r) => row.forEach((v, c) => {
        if (!v) return;
        for (const [dr, dc] of N4) {
          const y = r + dr, x = c + dc;
          if (y < 0 || x < 0 || y >= rows || x >= cols || !cost[y][x]) continue;
          if (ref[y][x] + v < ref[r][c]) { ref[r][c] = ref[y][x] + v; changed = true; }
        }
      }));
    }
    const { integ, dir } = GM.flowFieldTrace(cost, goals);
    assert.deepEqual(integ, ref, JSON.stringify({ cost, goals }));
    cost.forEach((row, r) => row.forEach((v, c) => {
      const goal = goals.some(([y, x]) => y === r && x === c);
      if (!v || goal || integ[r][c] === Infinity) { assert.equal(dir[r][c], null, 'walls, goals and cut-off cells have no arrow'); return; }
      const [dr, dc] = GM.FLOW_DIRS[dir[r][c]], y = r + dr, x = c + dc;
      assert.ok(integ[y][x] < integ[r][c], 'the arrow leads to a neighbour with a smaller integration');
      assert.equal(integ[r][c], v + integ[y][x], 'and to the cheapest one');
      let p = [r, c], steps = 0;
      while (!goals.some(([gy, gx]) => gy === p[0] && gx === p[1])) {
        const [ar, ac] = GM.FLOW_DIRS[dir[p[0]][p[1]]];
        p = [p[0] + ar, p[1] + ac];
        assert.ok(++steps <= rows * cols, 'following the arrows ends at a goal');
      }
    }));
  });
  for (const key of ['ff.ev.cost', 'ff.ev.seed', 'ff.ev.relax', 'ff.ev.settle', 'ff.ev.row', 'ff.ev.rowCut', 'ff.ev.done']) {
    assert.ok(keysOfRun(RIGS.flowField).has(key), `the example shows ${key}`);
  }
});

test('chapter 16: the spatial grid counts exactly what brute force counts, with fewer checks', () => {
  repeat(300, () => {
    const r = len(1, 5), cell = r + len(0, 3);
    const points = Array.from({ length: len(1, 16) }, () => [len(0, 24), len(0, 24)]);
    const queries = Array.from({ length: len(1, 3) }, () => [len(0, 24), len(0, 24), len(1, r)]);
    const brute = queries.map(([x, y, rr]) => points.filter(([a, b]) => (a - x) ** 2 + (b - y) ** 2 <= rr * rr).length);
    const run = GM.spatialGridTrace(points, queries, cell);
    assert.deepEqual(run.answers, brute, JSON.stringify({ points, queries, cell }));
    assert.ok(run.checks <= points.length * queries.length);
    const cellOf = ([x, y]) => [Math.floor(x / cell), Math.floor(y / cell)];
    for (const e of run.events) if (e.key === 'sg.ev.newCell' || e.key === 'sg.ev.put') assert.deepEqual([e.args[3], e.args[4]], cellOf(points[e.args[0]]));
  });
  assert.deepEqual(GM.spatialGridTrace([[1, 3], [3, 3], [5, 3], [2, 2]], [[2, 3, 1], [4, 3, 1], [1, 1, 2]], 2).answers, [3, 2, 2]);
  assert.deepEqual(GM.spatialGridTrace([[1, 1], [2, 2], [3, 3], [4, 4], [5, 5]], [[1, 2, 2], [2, 2, 2], [4, 3, 2], [4, 3, 3]], 3).answers, [2, 3, 2, 4]);
  const run = RIGS.spatialGrid.run(RIGS.spatialGrid.example);
  assert.ok(run.checks * 2 < run.points.length * run.queries.length, 'the example checks far fewer pairs than brute force');
  for (const key of ['sg.ev.newCell', 'sg.ev.put', 'sg.ev.query', 'sg.ev.empty', 'sg.ev.hit', 'sg.ev.miss', 'sg.ev.answer', 'sg.ev.done']) {
    assert.ok(keysOf(run).has(key), `the example shows ${key}`);
  }
});

test('chapter 16: union-find agrees with BFS connectivity and finds the last edge of the cycle', () => {
  const components = (n, edges) => {
    const seen = Array(n + 1).fill(0);
    let id = 0;
    for (let s = 1; s <= n; s++) {
      if (seen[s]) continue;
      seen[s] = ++id;
      for (const queue = [s]; queue.length;) {
        const v = queue.shift();
        for (const [a, b] of edges) for (const [p, q] of [[a, b], [b, a]]) if (p === v && !seen[q]) { seen[q] = id; queue.push(q); }
      }
    }
    return seen;
  };
  repeat(200, () => {
    const n = len(3, 10), edges = [];
    for (let v = 2; v <= n; v++) edges.push(next() < 0.5 ? [len(1, v - 1), v] : [v, len(1, v - 1)]);
    for (;;) {
      const a = len(1, n), b = len(1, n);
      if (a !== b && !edges.some(([p, q]) => (p === a && q === b) || (p === b && q === a))) { edges.push([a, b]); break; }
    }
    edges.sort(() => next() - 0.5);
    let expected = null;
    for (let k = n - 1; k >= 0 && !expected; k--) {
      const rest = edges.filter((_, i) => i !== k), comp = components(n, rest);
      if (comp.slice(1).every(c => c === comp[1])) expected = edges[k];
    }
    const run = GM.unionFindTrace(edges);
    assert.deepEqual(run.answer, expected, JSON.stringify(edges));
    for (const e of run.events) {
      if (e.key !== 'uf.ev.union' && e.key !== 'uf.ev.tie' && e.key !== 'uf.ev.cycle') continue;
      const comp = components(n, edges.slice(0, e.k + 1));
      const root = v => { while (e.parent[v] !== v) v = e.parent[v]; return v; };
      for (let a = 1; a <= n; a++) for (let b = a + 1; b <= n; b++) assert.equal(root(a) === root(b), comp[a] === comp[b], `after edge ${e.k}: ${a} and ${b}`);
      const height = v => (e.parent[v] === v ? 0 : 1 + height(e.parent[v]));
      for (let v = 1; v <= n; v++) if (e.parent[v] === v) assert.ok(e.rank[v] >= 0 && 2 ** e.rank[v] <= n, 'rank stays logarithmic');
      for (let v = 1; v <= n; v++) assert.ok(height(v) <= Math.log2(n), 'union by rank keeps trees shallow');
    }
  });
  assert.deepEqual(GM.unionFindTrace([[1, 2], [1, 3], [2, 3]]).answer, [2, 3]);
  assert.deepEqual(GM.unionFindTrace([[1, 2], [2, 3], [3, 4], [1, 4], [1, 5]]).answer, [1, 4]);
  for (const key of ['uf.ev.find', 'uf.ev.compress', 'uf.ev.union', 'uf.ev.tie', 'uf.ev.cycle']) {
    assert.ok(keysOfRun(RIGS.unionFind).has(key), `the example shows ${key}`);
  }
});

test('chapter 16: swim in rising water agrees with a BFS for every level', () => {
  repeat(200, () => {
    const n = len(1, 5), values = Array.from({ length: n * n }, (_, i) => i).sort(() => next() - 0.5);
    const grid = Array.from({ length: n }, (_, r) => values.slice(r * n, r * n + n));
    let t = 0;
    while (grid[0][0] > t || bfsSteps(n, n, (y, x) => grid[y][x] <= t) < 0) t++;
    const run = GM.swimTrace(grid);
    assert.equal(run.answer, t, JSON.stringify(grid));
    const path = run.events.at(-1).path;
    assert.ok(path.every(([y, x]) => grid[y][x] <= t), 'the drawn route stays under water');
  });
  assert.equal(GM.swimTrace([[0, 2], [1, 3]]).answer, 3);
  assert.equal(GM.swimTrace([[0, 1, 2, 3, 4], [24, 23, 22, 21, 5], [12, 13, 14, 15, 16], [11, 17, 18, 19, 20], [10, 9, 8, 7, 6]]).answer, 16);
  for (const key of ['sw.ev.island', 'sw.ev.grow', 'sw.ev.merge', 'sw.ev.done']) assert.ok(keysOfRun(RIGS.swim).has(key), `the example shows ${key}`);
});

test('chapter 16: the choice field and the cross-field checks', () => {
  const spec = { type: 'choice', options: GM.H_NAMES };
  for (const [t, v] of [['chebyshev', 'chebyshev'], ['cheb', 'chebyshev'], ['O', 'octile'], ['man', 'manhattan'], [' zero ', 'zero']]) assert.equal(parseField(t, spec).value, v, t);
  for (const t of ['', 'x', 'euclid']) assert.deepEqual(parseField(t, spec).error, ['in.err.choice', GM.H_NAMES.join(' · ')], t);
  assert.equal(formatField('octile', spec), 'octile');
  assert.deepEqual(runWithInput(RIGS.astar, { grid: '000 000', h: 'zero' }).error, ['in.err.square', 2, 3]);
  assert.equal(runWithInput(RIGS.flowField, { cost: '111 101', goals: '1 1' }).error[0], 'in.err.goalCell');
  assert.equal(runWithInput(RIGS.flowField, { cost: '111 101', goals: '1' }).error[0], 'in.err.goalPairs');
  assert.equal(runWithInput(RIGS.spatialGrid, { points: '1 2', queries: '1 1 4', cell: '3' }).error[0], 'in.err.radius');
  assert.equal(runWithInput(RIGS.spatialGrid, { points: '1 2', queries: '1 1 0', cell: '3' }).error[0], 'in.err.radiusMin');
  assert.equal(runWithInput(RIGS.spatialGrid, { points: '1 | 2', queries: '1 1 1', cell: '3' }).error[0], 'in.err.points');
  assert.equal(runWithInput(RIGS.spatialGrid, { points: '1 2', queries: '1 1', cell: '3' }).error[0], 'in.err.circles');
  assert.equal(runWithInput(RIGS.unionFind, { edges: '1 2 | 2 3 | 3 9' }).error[0], 'in.err.ufNodes');
  assert.equal(runWithInput(RIGS.unionFind, { edges: '1 2 | 2 1 | 2 3' }).error[0], 'in.err.ufEdge');
  assert.equal(runWithInput(RIGS.unionFind, { edges: '1 2 | 1 2 | 3 3' }).error[0], 'in.err.ufEdge');
  assert.equal(runWithInput(RIGS.unionFind, { edges: '1 2 | 2 3 | 1 3 | 1 2' }).error[0], 'in.err.ufEdge');
  assert.equal(runWithInput(RIGS.unionFind, { edges: '1 2 | 2 3 | 1 3 | 4 4' }).error[0], 'in.err.ufEdge');
  assert.equal(runWithInput(RIGS.unionFind, { edges: '1 2 | 2 3 | 1 3 | 3 1' }).error[0], 'in.err.ufEdge');
  assert.equal(runWithInput(RIGS.unionFind, { edges: '1 2 | 2 1 | 3 4 | 4 3' }).error[0], 'in.err.ufEdge');
  assert.equal(runWithInput(RIGS.unionFind, { edges: '1 2 | 1 3 | 2 3 | 1 4 | 5 6 | 6 7 | 5 7' }).error[0], 'in.err.ufTree');
  assert.equal(runWithInput(RIGS.swim, { grid: '0 1 | 1 3' }).error[0], 'in.err.perm');
  assert.equal(runWithInput(RIGS.swim, { grid: '0 1 | 2 4' }).error[0], 'in.err.perm');
});

/* ---------- wiring ---------- */
const textsOf = (rig, params) => Object.fromEntries(rig.fields.map(f => [f.key, formatField(params[f.key], f)]));

function checkRun(label, rig, run) {
  assert.ok(run.events.length >= 2, `${label}: too few steps`);
  for (const event of run.events) {
    const entry = DICT[event.key];
    assert.ok(entry, `${label}: no text for ${event.key}`);
    for (const lang of ['en', 'ru']) {
      const text = entry[lang](...event.args);
      assert.ok(typeof text === 'string' && text.trim() && !/undefined|NaN/.test(text), `${label} ${event.key} (${lang}): ${text}`);
    }
    assert.match(rig.view(run, event), /^<svg/, `${label}: ${event.key}`);
    assert.doesNotMatch(rig.view(run, event), /NaN|undefined/, `${label}: ${event.key} draws NaN`);
    for (const [key] of rig.vars(run, event)) assert.ok(DICT[key], `${label}: no label ${key}`);
  }
}

test('input fields parse what people type and format back losslessly', () => {
  assert.deepEqual(parseField('[1, 2,3]  −4', { type: 'ints' }).value, [1, 2, 3, -4]);
  assert.deepEqual(parseField('1 x 3', { type: 'ints' }).error, ['in.err.notInt', 'x']);
  assert.deepEqual(parseField('5 3 1', { type: 'ints', sorted: true }).value, [1, 3, 5]);
  assert.equal(parseField('1 1', { type: 'ints', distinct: true }).error[0], 'in.err.distinct');
  assert.equal(parseField('1 2 3', { type: 'ints', maxLen: 2 }).error[0], 'in.err.len');
  assert.deepEqual(parseField('110 011', { type: 'grid', maxRows: 6, maxCols: 8, maxDigit: 1 }).value, [[1, 1, 0], [0, 1, 1]]);
  assert.equal(parseField('110 01', { type: 'grid', maxRows: 6, maxCols: 8, maxDigit: 1 }).error[0], 'in.err.gridRagged');
  assert.deepEqual(parseField('[[1,3],[2,4]]', { type: 'intervals', max: 12 }).value, [[1, 3], [2, 4]]);
  assert.deepEqual(parseField('1-3 2-4', { type: 'intervals', max: 12 }).value, [[1, 3], [2, 4]]);
  assert.deepEqual(parseField('push 5, getMin, pop', { type: 'ops' }).value, [['push', 5], ['getMin'], ['pop']]);
  assert.equal(parseField('pop', { type: 'ops' }).error[0], 'in.err.opsEmpty');
  assert.deepEqual(parseField('1 4 | 3 2', { type: 'lists', maxLists: 4, maxLen: 5 }).value, [[1, 4], [2, 3]]);
  const order = [3, 9, 20, 4, null, 15, 7, null, null, null, null, null, 8];
  assert.deepEqual(treeFromLevelOrder(order), [3, [9, [4, null, null], null], [20, [15, null, null], [7, null, [8, null, null]]]]);
  assert.deepEqual(levelOrderOf(treeFromLevelOrder(order)), order);
  assert.equal(parseField('null, 1', { type: 'tree', maxNodes: 15, maxDepth: 4 }).error[0], 'in.err.treeRoot');
  for (const [key, entry] of Object.entries(DICT)) {
    if (key.startsWith('in.err.')) assert.equal(typeof entry.en, 'function', key);
  }
});

test('every problem owns an editable rig: the example and random inputs parse, run and render', () => {
  assert.equal(PATTERN_IDS.length, 16);
  const random = rng(7);
  for (const id of PATTERN_IDS) {
    for (const problem of PROBLEMS[id]) {
      const rig = RIGS[problem.rig];
      assert.ok(rig && rig.fields.length, `${id}: no editable rig ${problem.rig}`);
      const example = runWithInput(rig, textsOf(rig, rig.example));
      assert.ok(!example.error, `${problem.rig} example: ${example.error}`);
      assert.ok(example.run.events.length <= 90, `${problem.rig}: the example is too long to watch`);
      checkRun(`${problem.rig} example`, rig, example.run);
      for (let round = 0; round < 25; round++) {
        const params = rig.random(random);
        const texts = textsOf(rig, params);
        const result = runWithInput(rig, texts);
        assert.ok(!result.error, `${problem.rig} random ${JSON.stringify(texts)}: ${result.error}`);
        assert.ok(result.run.events.length <= MAX_STEPS);
        checkRun(`${problem.rig} random ${JSON.stringify(texts)}`, rig, result.run);
      }
    }
  }
});

test('edge inputs within the limits never crash a rig', () => {
  const extremes = spec => {
    if (spec.type === 'int') return [spec.min, spec.max, 0, 1].filter(v => v >= spec.min && v <= spec.max).map(String);
    if (spec.type !== 'ints') return [];
    const lo = Math.max(spec.min ?? -9, -9), hi = Math.min(spec.max ?? 9, 9), minLen = Math.max(spec.minLen ?? 0, 0), maxLen = spec.maxLen ?? 8;
    const make = (len, f) => Array.from({ length: len }, (_, i) => f(i)).join(' ');
    return [make(minLen, () => lo), make(maxLen, () => hi), make(maxLen, i => lo + (i % (hi - lo + 1))), make(minLen, () => hi), make(Math.min(maxLen, minLen + 1), i => (i ? lo : hi))];
  };
  let tried = 0;
  for (const [name, rig] of Object.entries(RIGS)) {
    const base = textsOf(rig, rig.example);
    for (const spec of rig.fields) {
      for (const value of extremes(spec)) {
        const result = runWithInput(rig, { ...base, [spec.key]: value });
        if (result.error) continue;
        tried++;
        checkRun(`${name} ${spec.key}=${value}`, rig, result.run);
      }
    }
  }
  assert.ok(tried > 150, `only ${tried} edge inputs ran`);
});

test('bad input is reported with a message, never thrown', () => {
  for (const texts of [{ n: '5', pos: '-1' }, { n: '1', pos: '-1' }, { n: '1', pos: '0' }, { n: '6', pos: '5' }]) {
    const result = runWithInput(RIGS.cycle, texts);
    checkRun(`cycle ${JSON.stringify(texts)}`, RIGS.cycle, result.run);
  }
  const cases = [['trap', { h: '1 2 x' }], ['rotated', { nums: '1 5 2 6', target: '2' }], ['koko', { piles: '3 6 7', h: '2' }],
    ['cycle', { n: '4', pos: '7' }], ['ladder', { begin: 'hit', end: 'cogs', words: 'hot dot' }], ['maxDepth', { root: 'null' }],
    ['combSum', { candidates: '1 2', target: '20' }], ['minStack', { ops: 'pop' }], ['flood', { image: '11 11', sr: '5', sc: '0', color: '2' }]];
  for (const [name, texts] of cases) {
    const result = runWithInput(RIGS[name], texts);
    assert.ok(result.error, `${name}: expected an error`);
    assert.ok(DICT[result.error[0]], `${name}: unknown message ${result.error[0]}`);
  }
});

test('every chapter has texts for each problem, at least one Hard, and code', () => {
  for (const id of PATTERN_IDS) {
    for (const part of ['h2', 'essence', 'signals', 'pitfall', 'tpl', 'short', 'p']) assert.ok(DICT[`${id}.${part}`], `${id}.${part}`);
    for (const lang of ['en', 'ru']) {
      const texts = DICT[`${id}.p`][lang];
      assert.equal(texts.length, PROBLEMS[id].length, `${id}.p ${lang}`);
      for (const p of texts) for (const f of ['variant', 'task', 'idea', 'why', 'cx']) assert.ok(p[f], `${id} ${lang} ${f}`);
    }
    for (const p of PROBLEMS[id]) {
      assert.ok(p.name && p.num && p.slug && p.code.includes('('), `${id} ${p.name}`);
      assert.match(p.diff, /^(Easy|Medium|Hard)$/);
    }
    assert.equal(new Set(PROBLEMS[id].map(p => p.rig)).size, PROBLEMS[id].length, `${id}: rigs must differ`);
    assert.ok(PROBLEMS[id].some(p => p.diff === 'Hard'), `${id}: no Hard problem`);
    assert.ok(PROBLEMS[id].length >= 4 && PROBLEMS[id].length <= 7, `${id}: 4–7 problems`);
  }
});
