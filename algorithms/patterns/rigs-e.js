/** Editable rigs for shortest paths. */
import * as E from './model-e.js?v=202610261132';
import * as V from './views-e.js?v=202610261132';
import { defineRig, randInt, shuffle } from './rig-kit.js?v=202610261132';

const bits = (key, maxRows, maxCols) => ({ key, type: 'grid', maxRows, maxCols, maxDigit: 1 });
const randomBits = (next, rows, cols, p) => Array.from({ length: rows }, () => Array.from({ length: cols }, () => (next() < p ? 1 : 0)));

export const RIGS_E = {
  nearestZero: defineRig({
    fields: [bits('mat', 6, 6)],
    example: { mat: ['11101', '11111', '01111', '11110'].map(r => [...r].map(Number)) },
    random: next => {
      const rows = randInt(next, 3, 5), cols = randInt(next, 3, 5), mat = randomBits(next, rows, cols, 0.78);
      mat[randInt(next, 0, rows - 1)][randInt(next, 0, cols - 1)] = 0;
      return { mat };
    },
    check: p => (p.mat.flat().includes(0) ? null : ['in.err.needZero']),
    run: p => ({ ...E.nearestZeroTrace(p.mat), mat: p.mat }),
  }, V.nearestZero),
  networkDelay: defineRig({
    fields: [
      { key: 'times', type: 'wedges', minLen: 1, maxLen: 14, maxW: 20 },
      { key: 'n', type: 'int', min: 1, max: 7 },
      { key: 'k', type: 'int', min: 1, max: 7 },
    ],
    example: { times: [[1, 2, 4], [1, 3, 1], [3, 2, 2], [2, 3, 1], [2, 4, 1], [3, 4, 5], [3, 5, 7], [4, 5, 3]], n: 5, k: 1 },
    random: next => {
      const n = randInt(next, 4, 6), times = [];
      for (let v = 2; v <= n; v++) times.push([randInt(next, 1, v - 1), v, randInt(next, 1, 9)]);
      for (let t = 0; t < n; t++) {
        const [u, v] = shuffle(next, Array.from({ length: n }, (_, i) => i + 1)).slice(0, 2);
        if (!times.some(([a, b]) => a === u && b === v)) times.push([u, v, randInt(next, 1, 9)]);
      }
      return { times: times.slice(0, 14), n, k: next() < 0.8 ? 1 : randInt(next, 1, n) };
    },
    check: p => (p.k > p.n || p.times.some(([u, v]) => u < 1 || v < 1 || u > p.n || v > p.n) ? ['in.err.node', p.n] : null),
    run: p => ({ ...E.networkDelayTrace(p.times, p.n, p.k), times: p.times, n: p.n, k: p.k }),
  }, V.networkDelay),
  minEffort: defineRig({
    fields: [{ key: 'heights', type: 'matrix', minRows: 1, maxRows: 5, maxCols: 5, min: 1, max: 99 }],
    example: { heights: [[5, 5, 6, 2], [7, 7, 6, 8], [3, 1, 6, 4]] },
    random: next => {
      const rows = randInt(next, 2, 4), cols = randInt(next, 3, 4);
      return { heights: Array.from({ length: rows }, () => Array.from({ length: cols }, () => randInt(next, 1, 9))) };
    },
    run: p => ({ ...E.minEffortTrace(p.heights), heights: p.heights }),
  }, V.minEffort),
  obstacles: defineRig({
    fields: [bits('grid', 5, 5), { key: 'k', type: 'int', min: 0, max: 4 }],
    example: { grid: ['000', '110', '000', '011', '000'].map(r => [...r].map(Number)), k: 1 },
    random: next => {
      const rows = randInt(next, 3, 5), cols = randInt(next, 3, 4), grid = randomBits(next, rows, cols, 0.4);
      grid[0][0] = 0;
      grid[rows - 1][cols - 1] = 0;
      return { grid, k: randInt(next, 0, 2) };
    },
    check: p => (p.grid[0][0] || p.grid.at(-1).at(-1) ? ['in.err.corners'] : null),
    run: p => ({ ...E.obstaclesTrace(p.grid, p.k), grid: p.grid, k: p.k }),
  }, V.obstacles),
};
