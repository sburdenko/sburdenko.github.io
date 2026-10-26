/** Editable rigs for the problems in model-bg.js; the chapters they belong to are listed in problems-bg.js. */
import * as M from './model-bg.js?v=202610261206';
import * as V from './views-bg.js?v=202610261206';
import { bitWidth } from './view-kit.js?v=202610261206';
import { defineRig, randInt, shuffle, pick } from './rig-kit.js?v=202610261206';

const pairs = m => m[0].length === 2;
const keyOf = (a, b) => `${Math.min(a, b)},${Math.max(a, b)}`;

/** Connected as an undirected graph on 1..n? A plain BFS, separate from the traces. */
function connected(n, edges) {
  const adj = Array.from({ length: n + 1 }, () => []);
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a); }
  const seen = new Set([1]), queue = [1];
  for (let h = 0; h < queue.length; h++) for (const w of adj[queue[h]]) if (!seen.has(w)) { seen.add(w); queue.push(w); }
  return seen.size === n;
}

/** A random connected graph on 1..n: a random tree plus a few extra edges. */
function randomGraph(next, n, extra) {
  const label = shuffle(next, Array.from({ length: n }, (_, i) => i + 1)), edges = [], has = new Set();
  const add = (a, b) => { edges.push(a < b ? [a, b] : [b, a]); has.add(keyOf(a, b)); };
  for (let i = 1; i < n; i++) add(label[randInt(next, 0, i - 1)], label[i]);
  for (let tries = 0; tries < 20 && extra > 0; tries++) {
    const a = randInt(next, 1, n), b = randInt(next, 1, n);
    if (a !== b && !has.has(keyOf(a, b))) { add(a, b); extra--; }
  }
  return edges.sort((x, y) => x[0] - y[0] || x[1] - y[1]);
}

function distinctPoints(next, n, lo, hi) {
  const seen = new Set(), out = [];
  while (out.length < n) {
    const p = [randInt(next, lo, hi), randInt(next, lo, hi)];
    if (!seen.has(`${p}`)) { seen.add(`${p}`); out.push(p); }
  }
  return out;
}

export const RIGS_BG = {
  reverseBits: defineRig({
    fields: [{ key: 'n', type: 'uint', min: 0, max: 4294967295 }, { key: 'mode', type: 'choice', options: ['loop', 'masks'] }],
    example: { n: 43261596, mode: 'loop' },
    random: next => {
      const kind = randInt(next, 0, 3);
      const n = kind === 0 ? 2 ** randInt(next, 0, 31) : kind === 1 ? randInt(next, 1, 4095) : Math.floor(next() * 2 ** 32);
      return { n, mode: next() < 0.35 ? 'masks' : 'loop' };
    },
    run: p => ({ ...M.reverseBitsTrace(p.n, p.mode), n: p.n, mode: p.mode }),
  }, V.reverseBits),
  divideBits: defineRig({
    fields: [
      { key: 'dividend', type: 'int', min: M.INT_MIN, max: M.INT_MAX },
      { key: 'divisor', type: 'int', min: M.INT_MIN, max: M.INT_MAX },
    ],
    example: { dividend: 100, divisor: -7 },
    random: next => {
      const kind = randInt(next, 0, 9);
      if (kind === 0) return { dividend: M.INT_MIN, divisor: -1 };
      if (kind === 1) return { dividend: M.INT_MIN, divisor: pick(next, [1, 2, -3, 7, M.INT_MIN]) };
      const sign = () => (next() < 0.5 ? -1 : 1);
      if (kind === 2) return { dividend: sign() * randInt(next, 0, 2 ** 31 - 1), divisor: sign() * randInt(next, 1, 2 ** 16) };
      const divisor = sign() * randInt(next, 1, 12);
      return { dividend: sign() * randInt(next, 0, 255), divisor };
    },
    check: p => (p.divisor === 0 ? ['in.err.divZero'] : null),
    run: p => {
      const r = M.divideTrace(p.dividend, p.divisor);
      return { ...r, dividend: p.dividend, divisor: p.divisor,
        bits: bitWidth([Math.abs(p.dividend), Math.abs(p.divisor)]), bitsSigned: bitWidth([p.dividend, p.divisor, r.answer]) };
    },
  }, V.divideBits),
  kClosest: defineRig({
    fields: [
      { key: 'points', type: 'matrix', minRows: 1, maxRows: 8, maxCols: 2, min: -9, max: 9 },
      { key: 'k', type: 'int', min: 1, max: 6 },
    ],
    example: { points: [[3, 3], [5, -1], [-2, 4], [1, -2], [-4, -3], [0, 2], [6, 1]], k: 3 },
    random: next => {
      const n = randInt(next, 4, 8);
      return { points: Array.from({ length: n }, () => [randInt(next, -6, 6), randInt(next, -6, 6)]), k: randInt(next, 1, Math.min(4, n - 1)) };
    },
    check: p => (!pairs(p.points) ? ['in.err.points'] : p.k > p.points.length ? ['in.err.kPoints', p.points.length] : null),
    run: p => ({ ...M.kClosestTrace(p.points, p.k), points: p.points, k: p.k, R: Math.max(3, ...p.points.flat().map(Math.abs)) }),
  }, V.kClosest),
  cloneGraph: defineRig({
    fields: [{ key: 'edges', type: 'matrix', minRows: 1, maxRows: 10, maxCols: 2, min: 1, max: 7 }],
    example: { edges: [[1, 2], [1, 4], [2, 3], [3, 4]] },
    random: next => {
      const n = randInt(next, 3, 6);
      return { edges: randomGraph(next, n, randInt(next, 0, 2)) };
    },
    check: p => {
      if (!pairs(p.edges)) return ['in.err.cgPairs'];
      const keys = p.edges.map(([a, b]) => keyOf(a, b));
      if (p.edges.some(([a, b]) => a === b) || new Set(keys).size !== keys.length) return ['in.err.cgEdge'];
      const n = Math.max(...p.edges.flat()), used = new Set(p.edges.flat());
      if (used.size !== n) return ['in.err.cgLabels', n];
      return connected(n, p.edges) ? null : ['in.err.cgConnected', n];
    },
    run: p => {
      const n = Math.max(...p.edges.flat());
      return { ...M.cloneGraphTrace(n, p.edges), n, edges: p.edges };
    },
  }, V.cloneGraph),
  kruskal: defineRig({
    fields: [{ key: 'points', type: 'matrix', minRows: 1, maxRows: 7, maxCols: 2, min: -10, max: 20 }],
    example: { points: [[0, 0], [2, 2], [3, 10], [5, 2], [7, 0]] },
    random: next => ({ points: distinctPoints(next, randInt(next, 4, 7), 0, 10) }),
    check: p => {
      if (!pairs(p.points)) return ['in.err.points'];
      return new Set(p.points.map(q => `${q}`)).size !== p.points.length ? ['in.err.samePoint'] : null;
    },
    run: p => ({ ...M.kruskalTrace(p.points), points: p.points }),
  }, V.kruskal),
  pacificAtlantic: defineRig({
    fields: [{ key: 'heights', type: 'matrix', minRows: 1, maxRows: 6, maxCols: 6, min: 0, max: 20 }],
    example: { heights: [[1, 2, 2, 3, 5], [3, 2, 3, 4, 4], [2, 4, 5, 3, 1], [6, 7, 1, 4, 5], [5, 1, 1, 2, 4]] },
    random: next => {
      const m = randInt(next, 3, 5), n = randInt(next, 3, 5), peak = [randInt(next, 0, m - 1), randInt(next, 0, n - 1)];
      return {
        heights: Array.from({ length: m }, (_, r) => Array.from({ length: n }, (_, c) =>
          Math.max(0, 6 - Math.abs(r - peak[0]) - Math.abs(c - peak[1]) + randInt(next, -2, 1)))),
      };
    },
    run: p => ({ ...M.pacificAtlanticTrace(p.heights), heights: p.heights }),
  }, V.pacificAtlantic),
};
