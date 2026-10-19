/** Editable rigs for chapter 13: arrays and matrices. */
import * as D from './model-d.js?v=202610191642';
import * as V from './views-d.js?v=202610191642';
import { defineRig, randInt, randInts, shuffle } from './rig-kit.js?v=202610191642';

const matrix = (extra = {}) => ({ key: 'matrix', type: 'matrix', minRows: 1, maxRows: 6, maxCols: 6, min: -99, max: 99, ...extra });
const counting = (rows, cols) => Array.from({ length: rows }, (_, r) => Array.from({ length: cols }, (_, c) => r * cols + c + 1));

export const RIGS_D = {
  productExcept: defineRig({
    fields: [{ key: 'nums', type: 'ints', minLen: 2, maxLen: 8, min: -9, max: 9 }],
    example: { nums: [2, 3, 4, 5] },
    random: next => ({ nums: randInts(next, randInt(next, 3, 6), -3, 6).map(v => (v === 0 && next() < 0.6 ? 2 : v)) }),
    run: p => ({ ...D.productExceptTrace(p.nums), nums: p.nums }),
  }, V.productExcept),
  rotate: defineRig({
    fields: [matrix({ square: true })],
    example: { matrix: counting(4, 4) },
    random: next => {
      const n = randInt(next, 2, 5), values = shuffle(next, Array.from({ length: n * n }, (_, k) => k + 1));
      return { matrix: Array.from({ length: n }, (_, r) => values.slice(r * n, r * n + n)) };
    },
    run: p => ({ ...D.rotateTrace(p.matrix), matrix: p.matrix }),
  }, V.rotate),
  setZeroes: defineRig({
    fields: [matrix()],
    example: { matrix: [[1, 2, 3, 4], [5, 0, 6, 7], [8, 9, 1, 2], [0, 3, 4, 5]] },
    random: next => {
      const rows = randInt(next, 2, 5), cols = randInt(next, 2, 5);
      return { matrix: Array.from({ length: rows }, () => randInts(next, cols, 1, 9).map(v => (next() < 0.14 ? 0 : v))) };
    },
    run: p => ({ ...D.setZeroesTrace(p.matrix), matrix: p.matrix }),
  }, V.setZeroes),
  spiral: defineRig({
    fields: [matrix()],
    example: { matrix: counting(3, 4) },
    random: next => ({ matrix: counting(randInt(next, 1, 5), randInt(next, 1, 5)) }),
    run: p => ({ ...D.spiralTrace(p.matrix), matrix: p.matrix }),
  }, V.spiral),
  gameOfLife: defineRig({
    fields: [{ key: 'board', type: 'grid', maxRows: 6, maxCols: 6, maxDigit: 1 }],
    example: { board: [[0, 0, 0, 0, 0], [0, 1, 1, 1, 0], [0, 0, 0, 0, 0]] },
    random: next => {
      const rows = randInt(next, 3, 5), cols = randInt(next, 3, 5);
      return { board: Array.from({ length: rows }, () => Array.from({ length: cols }, () => (next() < 0.4 ? 1 : 0))) };
    },
    run: p => ({ ...D.gameOfLifeTrace(p.board), board: p.board }),
  }, V.gameOfLife),
  maxRect: defineRig({
    fields: [{ key: 'matrix', type: 'grid', maxRows: 5, maxCols: 6, maxDigit: 1 }],
    example: { matrix: ['10100', '10111', '11111', '10010'].map(r => [...r].map(Number)) },
    random: next => {
      const rows = randInt(next, 3, 5), cols = randInt(next, 4, 6);
      return { matrix: Array.from({ length: rows }, () => Array.from({ length: cols }, () => (next() < 0.68 ? 1 : 0))) };
    },
    run: p => ({ ...D.maximalRectTrace(p.matrix), grid: p.matrix }),
  }, V.maxRect),
};
