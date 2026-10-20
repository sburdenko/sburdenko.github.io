/** Editable rigs for chapter 16: games — paths and space. */
import * as G from './model-games.js?v=202610201316';
import * as V from './views-games.js?v=202610201316';
import { defineRig, randInt, shuffle, pick } from './rig-kit.js?v=202610201316';

const rows = text => text.split(' ').map(r => [...r].map(Number));
const randomBits = (next, n, m, p) => Array.from({ length: n }, () => Array.from({ length: m }, () => (next() < p ? 1 : 0)));

/** A tree on 1..n plus one extra edge, in random order and orientation: the input of Redundant Connection. */
function randomTreePlusOne(next, n) {
  const label = shuffle(next, Array.from({ length: n }, (_, i) => i + 1)), edges = [], has = new Set();
  const add = (a, b) => { edges.push(next() < 0.5 ? [a, b] : [b, a]); has.add(`${Math.min(a, b)},${Math.max(a, b)}`); };
  for (let i = 1; i < n; i++) add(label[randInt(next, 0, i - 1)], label[i]);
  for (;;) {
    const a = randInt(next, 1, n), b = randInt(next, 1, n);
    if (a !== b && !has.has(`${Math.min(a, b)},${Math.max(a, b)}`)) { add(a, b); break; }
  }
  return shuffle(next, edges);
}

/** Connected as an undirected graph? Checked by BFS, separately from the union-find being shown. */
function connected(n, edges) {
  const adj = Array.from({ length: n + 1 }, () => []);
  for (const [a, b] of edges) { adj[a].push(b); adj[b].push(a); }
  const seen = new Set([1]), queue = [1];
  for (let h = 0; h < queue.length; h++) for (const w of adj[queue[h]]) if (!seen.has(w)) { seen.add(w); queue.push(w); }
  return seen.size === n;
}

export const RIGS_GAMES = {
  astar: defineRig({
    fields: [
      { key: 'grid', type: 'grid', maxRows: 7, maxCols: 7, maxDigit: 1 },
      { key: 'h', type: 'choice', options: G.H_NAMES },
    ],
    example: { grid: rows('0000000 0000010 0110010 0001110 0101010 0101010 0000000'), h: 'chebyshev' },
    random: next => {
      const n = randInt(next, 4, 7), grid = randomBits(next, n, n, 0.28);
      grid[0][0] = 0;
      grid[n - 1][n - 1] = 0;
      return { grid, h: next() < 0.4 ? 'chebyshev' : pick(next, G.H_NAMES) };
    },
    check: p => (p.grid.length !== p.grid[0].length ? ['in.err.square', p.grid.length, p.grid[0].length] : null),
    run: p => ({ ...G.astarTrace(p.grid, p.h), grid: p.grid, h: p.h }),
  }, V.astar),
  flowField: defineRig({
    fields: [
      { key: 'cost', type: 'grid', maxRows: 6, maxCols: 8, maxDigit: 9 },
      { key: 'goals', type: 'matrix', minRows: 1, maxRows: 3, maxCols: 2, min: 0, max: 7 },
    ],
    example: { cost: rows('1111101 1100110 1139911 1100111 1111111'), goals: [[2, 6]] },
    random: next => {
      const n = randInt(next, 4, 6), m = randInt(next, 5, 7);
      const cost = Array.from({ length: n }, () => Array.from({ length: m }, () => {
        const x = next();
        return x < 0.6 ? 1 : x < 0.72 ? 2 : x < 0.8 ? 3 : x < 0.85 ? 9 : 0;
      }));
      const goals = Array.from({ length: next() < 0.75 ? 1 : 2 }, () => [randInt(next, 0, n - 1), randInt(next, 0, m - 1)]);
      for (const [r, c] of goals) cost[r][c] = 1;
      return { cost, goals };
    },
    check: p => {
      if (p.goals[0].length !== 2) return ['in.err.goalPairs'];
      const bad = p.goals.find(([r, c]) => r >= p.cost.length || c >= p.cost[0].length || !p.cost[r][c]);
      return bad ? ['in.err.goalCell', bad[0], bad[1], p.cost.length - 1, p.cost[0].length - 1] : null;
    },
    run: p => {
      const goals = p.goals.filter(([r, c], i) => p.goals.findIndex(([y, x]) => y === r && x === c) === i);
      return { ...G.flowFieldTrace(p.cost, goals), cost: p.cost, goals };
    },
  }, V.flowField),
  spatialGrid: defineRig({
    fields: [
      { key: 'points', type: 'matrix', minRows: 1, maxRows: 16, maxCols: 2, min: 0, max: 24 },
      { key: 'queries', type: 'matrix', minRows: 1, maxRows: 3, maxCols: 3, min: 0, max: 24 },
      { key: 'cell', type: 'int', min: 1, max: 12 },
    ],
    example: {
      points: [[1, 3], [3, 3], [5, 3], [2, 2], [7, 8], [9, 1], [11, 4], [4, 10], [6, 6], [12, 11], [8, 5], [3, 7]],
      queries: [[2, 3, 1], [6, 5, 3], [10, 10, 3]],
      cell: 3,
    },
    random: next => {
      const r = randInt(next, 1, 4), cell = r + (next() < 0.7 ? 0 : randInt(next, 1, 2));
      const points = Array.from({ length: randInt(next, 6, 14) }, () => [randInt(next, 0, 14), randInt(next, 0, 14)]);
      const queries = Array.from({ length: randInt(next, 1, 3) }, () => [randInt(next, 0, 14), randInt(next, 0, 14), randInt(next, 1, r)]);
      return { points, queries, cell };
    },
    check: p => {
      if (p.points[0].length !== 2) return ['in.err.points'];
      if (p.queries[0].length !== 3) return ['in.err.circles'];
      const r = Math.max(...p.queries.map(q => q[2]));
      if (p.queries.some(q => q[2] < 1)) return ['in.err.radiusMin'];
      return r > p.cell ? ['in.err.radius', r, p.cell] : null;
    },
    run: p => ({ ...G.spatialGridTrace(p.points, p.queries, p.cell), points: p.points, queries: p.queries, cell: p.cell }),
  }, V.spatialGrid),
  unionFind: defineRig({
    fields: [{ key: 'edges', type: 'matrix', minRows: 3, maxRows: 10, maxCols: 2, min: 1, max: 10 }],
    example: { edges: [[1, 2], [3, 4], [1, 3], [5, 6], [4, 5], [2, 6]] },
    random: next => ({ edges: randomTreePlusOne(next, randInt(next, 4, 9)) }),
    check: p => {
      const n = p.edges.length;
      if (p.edges[0].length !== 2) return ['in.err.ufPairs'];
      if (p.edges.some(([a, b]) => a > n || b > n)) return ['in.err.ufNodes', n];
      const keys = p.edges.map(([a, b]) => `${Math.min(a, b)},${Math.max(a, b)}`);
      if (p.edges.some(([a, b]) => a === b) || new Set(keys).size !== n) return ['in.err.ufEdge'];
      return connected(n, p.edges) ? null : ['in.err.ufTree', n];
    },
    run: p => ({ ...G.unionFindTrace(p.edges), edges: p.edges, n: p.edges.length }),
  }, V.unionFind),
  swim: defineRig({
    fields: [{ key: 'grid', type: 'matrix', minRows: 1, maxRows: 6, maxCols: 6, min: 0, max: 35, square: true }],
    example: { grid: [[0, 1, 2, 3, 4], [24, 23, 22, 21, 5], [12, 13, 14, 15, 16], [11, 17, 18, 19, 20], [10, 9, 8, 7, 6]] },
    random: next => {
      const n = randInt(next, 3, 5), values = shuffle(next, Array.from({ length: n * n }, (_, i) => i));
      return { grid: Array.from({ length: n }, (_, r) => values.slice(r * n, r * n + n)) };
    },
    check: p => {
      const n = p.grid.length, seen = new Set(p.grid.flat());
      return seen.size === n * n && p.grid.flat().every(v => v < n * n) ? null : ['in.err.perm', n * n - 1];
    },
    run: p => ({ ...G.swimTrace(p.grid), grid: p.grid }),
  }, V.swim),
};
