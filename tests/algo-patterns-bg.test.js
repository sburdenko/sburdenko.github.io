/* Problems added to existing chapters of tape 06 (model-bg.js): traces against independent brute force. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { rng } from '../assets/rand.js';
import * as M from '../algorithms/patterns/model-bg.js';
import { RIGS, runWithInput } from '../algorithms/patterns/rigs.js';
import { PROBLEMS } from '../algorithms/patterns/problems.js';
import { DICT } from '../algorithms/patterns/i18n.js';

const next = rng(2026);
const len = (lo, hi) => lo + Math.floor(next() * (hi - lo + 1));
const repeat = (times, fn) => { for (let i = 0; i < times; i++) fn(i); };
const keysOf = run => new Set(run.events.map(e => e.key));
const N4 = [[-1, 0], [0, 1], [1, 0], [0, -1]];

test('added problems sit at the end of their chapters, and their texts line up', () => {
  const where = { bits: 'reverseBits', binary: 'divideBits', heap: 'kClosest', graph: 'cloneGraph' };
  for (const [chapter, id] of Object.entries(where)) assert.equal(PROBLEMS[chapter].at(-1).rig, id, chapter);
  assert.deepEqual(PROBLEMS.games.slice(-2).map(p => p.rig), ['kruskal', 'pacificAtlantic']);
  assert.equal(Object.values(PROBLEMS).flat().length, 104);
  const names = { reverseBits: 190, divideBits: 29, kClosest: 973, cloneGraph: 133, kruskal: 1584, pacificAtlantic: 417 };
  for (const [chapter, list] of Object.entries(PROBLEMS)) {
    list.forEach((p, j) => {
      if (!(p.rig in names)) return;
      assert.equal(p.num, names[p.rig]);
      for (const lang of ['en', 'ru']) assert.ok(DICT[`${chapter}.p`][lang][j].task, `${p.rig} ${lang}: texts at index ${j}`);
    });
  }
});

test('Reverse Bits: both versions agree with reversing the binary string', () => {
  const rev = v => parseInt((v >>> 0).toString(2).padStart(32, '0').split('').reverse().join(''), 2);
  repeat(300, () => {
    const n = Math.floor(next() * 2 ** 32);
    const loop = M.reverseBitsTrace(n), masks = M.reverseBitsTrace(n, 'masks');
    assert.equal(loop.answer, rev(n), `${n}`);
    assert.equal(masks.answer, rev(n), `${n} masks`);
    assert.equal(loop.events.length, 34, '32 rounds plus start and done');
    assert.equal(masks.events.length, 7, '5 swaps plus start and done');
    for (const e of loop.events.slice(1, -1)) {
      assert.equal(e.bit, Math.floor(n / 2 ** (e.i - 1)) % 2, 'round i takes bit i − 1 of n');
      assert.equal(e.key === 'rb.ev.pad', e.before === 0);
    }
  });
  assert.equal(M.reverseBitsTrace(43261596).answer, 964176192, 'LeetCode #190 example 1');
  assert.equal(M.reverseBitsTrace(4294967293).answer, 3221225471, 'LeetCode #190 example 2');
  assert.equal(M.reverseBitsTrace(0).answer, 0);
  assert.equal(M.reverseBitsTrace(1).answer, 2 ** 31);
  const ex = RIGS.reverseBits.run(RIGS.reverseBits.example);
  for (const key of ['rb.ev.one', 'rb.ev.zero', 'rb.ev.pad']) assert.ok(keysOf(ex).has(key), key);
  assert.deepEqual([...keysOf(M.reverseBitsTrace(5, 'masks'))], ['rb.ev.masks', 'rb.ev.halves', 'rb.ev.swap', 'rb.ev.masksDone']);
  assert.equal(runWithInput(RIGS.reverseBits, { n: '0b1011', mode: 'mask' }).run.answer, rev(11), 'a unique beginning picks the mode');
  assert.equal(runWithInput(RIGS.reverseBits, { n: '5', mode: 'x' }).error[0], 'in.err.choice');
});

test('Divide Two Integers: long division agrees with Math.trunc, int.MinValue / −1 gives int.MaxValue', () => {
  const expect = (a, b) => Math.max(M.INT_MIN, Math.min(M.INT_MAX, Math.trunc(a / b)));
  const any = () => Math.floor(next() * 2 ** 32) - 2 ** 31;
  repeat(400, round => {
    const a = round % 3 ? len(-300, 300) : any();
    let b = round % 4 ? len(-20, 20) : any();
    if (b === 0) b = 1;
    const run = M.divideTrace(a, b);
    assert.equal(run.answer, expect(a, b), `${a} / ${b}`);
    let q = 0;
    for (const e of run.events) if (e.key === 'div.ev.fit') q += 2 ** e.k;
    if (!run.overflow) assert.equal(Math.abs(run.answer), q, 'the quotient is the sum of the bits set by fit');
    const ks = run.events.filter(e => e.key === 'div.ev.fit' || e.key === 'div.ev.skip').map(e => e.k);
    assert.deepEqual(ks, [...ks].sort((x, y) => y - x), 'k goes down');
  });
  for (const [a, b] of [[10, 3], [7, -3], [0, 1], [1, 1], [-1, 1], [M.INT_MIN, 1], [M.INT_MIN, 2], [M.INT_MIN, M.INT_MIN], [M.INT_MAX, M.INT_MIN], [M.INT_MAX, 1], [M.INT_MAX, -1]]) {
    assert.equal(M.divideTrace(a, b).answer, expect(a, b), `${a} / ${b}`);
  }
  const over = M.divideTrace(M.INT_MIN, -1);
  assert.equal(over.answer, M.INT_MAX);
  assert.deepEqual([...keysOf(over)], ['div.ev.start', 'div.ev.overflow']);
  assert.ok(keysOf(M.divideTrace(10, 3)).has('div.ev.signPos'));
  const ex = RIGS.divideBits.run(RIGS.divideBits.example);
  for (const key of ['div.ev.signNeg', 'div.ev.lead', 'div.ev.fit', 'div.ev.skip']) assert.ok(keysOf(ex).has(key), key);
  assert.equal(runWithInput(RIGS.divideBits, { dividend: '5', divisor: '0' }).error[0], 'in.err.divZero');
  assert.equal(runWithInput(RIGS.divideBits, { dividend: '2147483648', divisor: '1' }).error[0], 'in.err.range');
  assert.equal(runWithInput(RIGS.divideBits, { dividend: '-2147483648', divisor: '-1' }).run.answer, M.INT_MAX);
});

test('K Closest Points: the heap keeps the k smallest distances and stays a max-heap', () => {
  repeat(300, () => {
    const n = len(1, 8), k = len(1, n);
    const points = Array.from({ length: n }, () => [len(-9, 9), len(-9, 9)]);
    const run = M.kClosestTrace(points, k), d = ([x, y]) => x * x + y * y;
    assert.deepEqual(run.answer.map(d).sort((a, b) => a - b), points.map(d).sort((a, b) => a - b).slice(0, k), JSON.stringify(points));
    for (const e of run.events) {
      if (e.key !== 'kc.ev.add' && e.key !== 'kc.ev.up') e.heap.forEach((i, j) => { if (j) assert.ok(run.d[e.heap[(j - 1) >> 1]] >= run.d[i], 'a parent is never nearer than its child'); });
      if (e.key === 'kc.ev.drop' || e.key === 'kc.ev.dropNew') {
        assert.equal(e.heap.length, k);
        assert.ok(e.heap.every(i => run.d[i] <= run.d[e.gone]), 'the dropped point is the farthest of k + 1');
        assert.equal(e.key === 'kc.ev.dropNew', e.gone === e.cur);
      }
    }
  });
  const ex = RIGS.kClosest.run(RIGS.kClosest.example);
  assert.deepEqual(new Set(keysOf(ex)), new Set(['kc.ev.start', 'kc.ev.add', 'kc.ev.up', 'kc.ev.drop', 'kc.ev.dropNew', 'kc.ev.done']));
  assert.deepEqual(M.kClosestTrace([[1, 3], [-2, 2]], 1).answer, [[-2, 2]], 'LeetCode #973 example 1');
  assert.deepEqual(M.kClosestTrace([[3, 3], [5, -1], [-2, 4]], 2).answer.sort(), [[-2, 4], [3, 3]], 'LeetCode #973 example 2');
  assert.equal(runWithInput(RIGS.kClosest, { points: '1 2 | 3 4', k: '3' }).error[0], 'in.err.kPoints');
  assert.equal(runWithInput(RIGS.kClosest, { points: '1 | 2', k: '1' }).error[0], 'in.err.points');
});

test('Clone Graph: every copy gets the neighbour list of its original, in BFS order', () => {
  repeat(200, () => {
    const n = len(2, 7), edges = [], has = new Set();
    for (let v = 2; v <= n; v++) { const u = len(1, v - 1); edges.push([u, v]); has.add(`${u},${v}`); }
    repeat(len(0, 3), () => { const a = len(1, n), b = len(1, n); if (a < b && !has.has(`${a},${b}`)) { edges.push([a, b]); has.add(`${a},${b}`); } });
    const run = M.cloneGraphTrace(n, edges);
    const adj = Array.from({ length: n + 1 }, () => []);
    for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a); }
    const lists = Array.from({ length: n + 1 }, () => []);
    for (const [a, b] of run.refs) lists[a].push(b);
    for (let v = 1; v <= n; v++) assert.deepEqual(lists[v], [...adj[v]].sort((x, y) => x - y), `copy of ${v}`);
    const order = [1], seen = new Set([1]);
    for (let h = 0; h < order.length; h++) for (const w of [...adj[order[h]]].sort((x, y) => x - y)) if (!seen.has(w)) { seen.add(w); order.push(w); }
    assert.deepEqual(run.events.filter(e => e.key === 'cg.ev.pop').map(e => e.cur), order, 'nodes leave the queue in BFS order');
    assert.equal(run.events.filter(e => e.key === 'cg.ev.new').length, n - 1, 'one new copy per node besides the start');
    assert.equal(run.events.filter(e => e.key === 'cg.ev.link').length, 2 * edges.length - (n - 1), 'every other reference only links');
  });
  const ex = RIGS.cloneGraph.run(RIGS.cloneGraph.example);
  assert.ok(ex.events.some(e => e.key === 'cg.ev.link' && e.args[2] === 'queued') && ex.events.some(e => e.key === 'cg.ev.link' && e.args[2] === 'done'));
  assert.equal(runWithInput(RIGS.cloneGraph, { edges: '1 2 | 2 1' }).error[0], 'in.err.cgEdge');
  assert.equal(runWithInput(RIGS.cloneGraph, { edges: '1 3' }).error[0], 'in.err.cgLabels');
  assert.equal(runWithInput(RIGS.cloneGraph, { edges: '1 2 | 3 4' }).error[0], 'in.err.cgConnected');
  assert.equal(runWithInput(RIGS.cloneGraph, { edges: '1 | 2' }).error[0], 'in.err.cgPairs');
});

test('Kruskal: the cost agrees with Prim, and the taken edges form a spanning tree', () => {
  const prim = pts => {
    const n = pts.length, best = Array(n).fill(Infinity), done = Array(n).fill(false);
    best[0] = 0;
    let total = 0;
    for (let round = 0; round < n; round++) {
      let u = -1;
      for (let v = 0; v < n; v++) if (!done[v] && (u < 0 || best[v] < best[u])) u = v;
      done[u] = true;
      total += best[u];
      for (let v = 0; v < n; v++) if (!done[v]) best[v] = Math.min(best[v], M.manhattan(pts[u], pts[v]));
    }
    return total;
  };
  repeat(300, () => {
    const pts = [], seen = new Set();
    for (let n = len(1, 7); pts.length < n;) { const p = [len(-10, 20), len(-10, 20)]; if (!seen.has(`${p}`)) { seen.add(`${p}`); pts.push(p); } }
    const run = M.kruskalTrace(pts);
    assert.equal(run.total, prim(pts), JSON.stringify(pts));
    const last = run.events.at(-1), taken = run.edges.filter((_, k) => last.status[k] === 'take');
    assert.equal(taken.length, pts.length - 1);
    assert.equal(new Set(last.comp).size, 1, 'one component at the end');
    for (const e of run.events) if (e.key === 'kr.ev.skip') assert.ok(e.args[2] >= 0);
  });
  assert.equal(M.kruskalTrace([[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]]).total, 20, 'LeetCode #1584 example 1');
  assert.equal(M.kruskalTrace([[3, 12], [-2, 5], [-4, 1]]).total, 18, 'LeetCode #1584 example 2');
  assert.equal(M.kruskalTrace([[0, 0]]).total, 0);
  const ex = RIGS.kruskal.run(RIGS.kruskal.example);
  for (const key of ['kr.ev.sort', 'kr.ev.take', 'kr.ev.skip', 'kr.ev.done']) assert.ok(keysOf(ex).has(key), key);
  assert.equal(runWithInput(RIGS.kruskal, { points: '1 1 | 1 1' }).error[0], 'in.err.samePoint');
});

test('Pacific Atlantic: the backward searches agree with a downhill search from every cell', () => {
  const downhill = (h, r0, c0) => {
    const m = h.length, n = h[0].length, seen = new Set([`${r0},${c0}`]), stack = [[r0, c0]];
    let P = false, A = false;
    while (stack.length) {
      const [r, c] = stack.pop();
      if (r === 0 || c === 0) P = true;
      if (r === m - 1 || c === n - 1) A = true;
      for (const [dr, dc] of N4) {
        const y = r + dr, x = c + dc;
        if (y < 0 || x < 0 || y >= m || x >= n || seen.has(`${y},${x}`) || h[y][x] > h[r][c]) continue;
        seen.add(`${y},${x}`);
        stack.push([y, x]);
      }
    }
    return P && A;
  };
  repeat(200, () => {
    const m = len(1, 6), n = len(1, 6), h = Array.from({ length: m }, () => Array.from({ length: n }, () => len(0, 5)));
    const expect = [];
    for (let r = 0; r < m; r++) for (let c = 0; c < n; c++) if (downhill(h, r, c)) expect.push([r, c]);
    const run = M.pacificAtlanticTrace(h);
    assert.deepEqual(run.answer, expect, JSON.stringify(h));
    assert.ok(run.events.length <= 2 * m * n + 4);
  });
  const ex = RIGS.pacificAtlantic.run(RIGS.pacificAtlantic.example);
  assert.deepEqual(ex.answer, [[0, 4], [1, 3], [1, 4], [2, 2], [3, 0], [3, 1], [4, 0]], 'LeetCode #417 example 1');
  for (const key of ['pa.ev.seed', 'pa.ev.climb', 'pa.ev.stuck', 'pa.ev.both']) assert.ok(keysOf(ex).has(key), key);
  assert.deepEqual(M.pacificAtlanticTrace([[1]]).answer, [[0, 0]], 'LeetCode #417 example 2');
});

test('Word Search shows row and column numbers; other grids keep their picture', () => {
  const ws = RIGS.wordSearch, run = ws.run(ws.example), pic = ws.view(run, run.events[1]);
  for (const c of [0, 1, 2, 3]) assert.match(pic, new RegExp(`class="idx" dominant-baseline="central">${c}</text>`));
  const before = RIGS.wordSearch.run(ws.example).events.map(e => e.key);
  assert.deepEqual(run.events.map(e => e.key), before);
  const flood = RIGS.flood, fr = flood.run(flood.example);
  assert.doesNotMatch(flood.view(fr, fr.events[0]), /class="idx"/, 'coordinates are opt-in');
});
