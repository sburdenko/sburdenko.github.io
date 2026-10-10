/** Editable rigs for chapters 05–08. */
import * as B from './model-b.js?v=202610100741';
import * as V from './views-b.js?v=202610100741';
import { treeFromLevelOrder, levelOrderOf } from './inputs.js?v=202610100741';
import { defineRig, randInt, randInts, pick, shuffle, distinctInts } from './rig-kit.js?v=202610100741';

const values = (extra = {}) => ({ key: 'values', type: 'ints', minLen: 1, maxLen: 8, min: -99, max: 99, ...extra });
const tree = { key: 'root', type: 'tree', maxNodes: 15, maxDepth: 4, min: -99, max: 99 };
const grid = maxDigit => ({ key: 'grid', type: 'grid', maxRows: 6, maxCols: 8, maxDigit });
const randomGrid = (next, weights) => Array.from({ length: randInt(next, 3, 5) }, () =>
  Array.from({ length: 5 }, () => { const x = next(); return weights.findIndex(w => x < w); }));

function randomTree(next, depth = 0) {
  if (depth > 3 || (depth > 0 && next() < 0.28)) return null;
  return [randInt(next, -9, 20), randomTree(next, depth + 1), randomTree(next, depth + 1)];
}

function randomBst(next) {
  const insert = (s, v) => (!s ? [v, null, null] : v < s[0] ? [s[0], insert(s[1], v), s[2]] : [s[0], s[1], insert(s[2], v)]);
  let spec = null;
  for (const v of distinctInts(next, 7, 1, 30)) spec = insert(spec, v);
  const order = levelOrderOf(spec);
  const depth = s => (s ? 1 + Math.max(depth(s[1]), depth(s[2])) : 0);
  if (depth(spec) > 4) return [8, 4, 12, 2, 6, 10, 14];
  if (next() < 0.5) {
    const filled = order.map((v, i) => (v === null ? -1 : i)).filter(i => i > 0);
    const [i, j] = shuffle(next, filled).slice(0, 2);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

const LADDER_WORDS = ['hot', 'dot', 'dog', 'lot', 'log', 'cog', 'hog', 'cot', 'cat', 'bat', 'bag', 'big', 'dig', 'dug', 'bug', 'hug', 'hut', 'cut', 'hat'];

export const RIGS_B = {
  /* 05 stack */
  parens: defineRig({
    fields: [{ key: 's', type: 'str', chars: '()\\[\\]{}', charsLabel: '( ) [ ] { }', minLen: 1, maxLen: 14 }],
    example: { s: '{[()()]}' },
    random: next => {
      const build = depth => (depth > 2 || next() < 0.3 ? '' : pick(next, ['()', '[]', '{}']).replace(/^(.)/, `$1${build(depth + 1)}`) + build(depth + 1));
      let s = build(0) || '()';
      if (next() < 0.35) s = s.slice(0, -1) + pick(next, [')', ']', '}']);
      return { s: s.slice(0, 14) };
    },
    run: p => ({ ...B.validParensTrace(p.s), s: p.s }),
  }, V.parens),
  daily: defineRig({
    fields: [{ key: 't', type: 'ints', minLen: 1, maxLen: 10, min: -50, max: 130 }],
    example: { t: [73, 74, 75, 71, 69, 72, 76, 73] },
    random: next => ({ t: randInts(next, randInt(next, 6, 9), 60, 80) }),
    run: p => ({ ...B.dailyTempsTrace(p.t), t: p.t }),
  }, V.daily),
  minStack: defineRig({
    fields: [{ key: 'ops', type: 'ops', minLen: 1, maxLen: 12 }],
    example: { ops: [['push', 5], ['push', 3], ['push', 7], ['getMin'], ['pop'], ['push', 1], ['getMin'], ['pop'], ['pop'], ['getMin']] },
    random: next => {
      const ops = [];
      let size = 0;
      while (ops.length < 10) {
        const roll = next();
        if (!size || roll < 0.5) { ops.push(['push', randInt(next, 1, 9)]); size++; }
        else if (roll < 0.75) { ops.push(['getMin']); }
        else { ops.push(['pop']); size--; }
      }
      return { ops };
    },
    run: p => ({ ...B.minStackTrace(p.ops), ops: p.ops }),
  }, V.minStack),
  histogram: defineRig({
    fields: [{ key: 'heights', type: 'ints', minLen: 1, maxLen: 10, min: 0, max: 9 }],
    example: { heights: [2, 1, 5, 6, 2, 3] },
    random: next => ({ heights: randInts(next, randInt(next, 5, 9), 1, 8) }),
    run: p => ({ ...B.histogramTrace(p.heights), h: p.heights }),
  }, V.histogram),

  /* 06 linked list */
  cycle: defineRig({
    fields: [{ key: 'n', type: 'int', min: 1, max: 9 }, { key: 'pos', type: 'int', min: -1, max: 8 }],
    example: { n: 8, pos: 2 },
    random: next => {
      const n = randInt(next, 4, 9);
      return { n, pos: next() < 0.2 ? -1 : randInt(next, 0, n - 1) };
    },
    check: p => (p.pos >= p.n ? ['in.err.pos', p.n - 1] : null),
    run: p => {
      const next = Array.from({ length: p.n }, (_, i) => (i + 1 < p.n ? i + 1 : p.pos));
      return { ...B.cycleTrace(next), next };
    },
  }, V.cycle),
  removeNth: defineRig({
    fields: [values(), { key: 'n', type: 'int', min: 1, max: 8 }],
    example: { values: [1, 2, 3, 4, 5], n: 2 },
    random: next => {
      const list = Array.from({ length: randInt(next, 3, 7) }, (_, i) => i + 1);
      return { values: list, n: randInt(next, 1, list.length) };
    },
    check: p => (p.n > p.values.length ? ['in.err.kLen', p.values.length] : null),
    run: p => ({ ...B.removeNthTrace(p.values, p.n), values: p.values, n: p.n }),
  }, V.removeNth),
  reverse: defineRig({
    fields: [values()],
    example: { values: [1, 2, 3, 4, 5] },
    random: next => ({ values: randInts(next, randInt(next, 3, 7), 1, 9) }),
    run: p => ({ ...B.reverseListTrace(p.values), values: p.values }),
  }, V.reverse),
  reverseK: defineRig({
    fields: [values({ maxLen: 10 }), { key: 'k', type: 'int', min: 1, max: 10 }],
    example: { values: [1, 2, 3, 4, 5, 6, 7, 8], k: 3 },
    random: next => {
      const list = Array.from({ length: randInt(next, 5, 10) }, (_, i) => i + 1);
      return { values: list, k: randInt(next, 2, 4) };
    },
    check: p => (p.k > p.values.length ? ['in.err.kLen', p.values.length] : null),
    run: p => ({ ...B.reverseKGroupTrace(p.values, p.k), k: p.k }),
  }, V.reverseK),

  /* 07 grids and graphs */
  flood: defineRig({
    fields: [{ ...grid(3), key: 'image' }, { key: 'sr', type: 'int', min: 0, max: 5 }, { key: 'sc', type: 'int', min: 0, max: 7 }, { key: 'color', type: 'int', min: 0, max: 3 }],
    example: { image: [[1, 1, 1, 0], [1, 1, 0, 0], [1, 0, 1, 1], [0, 1, 1, 1]], sr: 1, sc: 1, color: 2 },
    random: next => {
      const image = randomGrid(next, [0.3, 1]).map(r => r.map(v => v));
      return { image, sr: randInt(next, 0, image.length - 1), sc: randInt(next, 0, 4), color: 2 };
    },
    check: p => (p.sr >= p.image.length || p.sc >= p.image[0].length ? ['in.err.cell', p.image.length - 1, p.image[0].length - 1] : null),
    run: p => ({ ...B.floodFillTrace(p.image, p.sr, p.sc, p.color), image: p.image, sr: p.sr, sc: p.sc, color: p.color }),
  }, V.flood),
  islands: defineRig({
    fields: [grid(1)],
    example: { grid: [[1, 1, 0, 0, 0, 1], [1, 0, 0, 1, 0, 1], [0, 0, 1, 1, 0, 0], [0, 0, 0, 0, 0, 1], [1, 1, 0, 0, 1, 1]] },
    random: next => ({ grid: randomGrid(next, [0.55, 1]) }),
    run: p => B.islandsTrace(p.grid.map(r => r.join(''))),
  }, V.islands),
  oranges: defineRig({
    fields: [grid(2)],
    example: { grid: [[2, 1, 1, 0, 1], [1, 1, 0, 1, 1], [0, 1, 1, 1, 1], [0, 0, 1, 1, 2]] },
    random: next => ({ grid: randomGrid(next, [0.2, 0.9, 1]) }),
    run: p => B.orangesTrace(p.grid),
  }, V.oranges),
  ladder: defineRig({
    fields: [
      { key: 'begin', type: 'str', chars: 'a-z', charsLabel: 'a–z', minLen: 2, maxLen: 5 },
      { key: 'end', type: 'str', chars: 'a-z', charsLabel: 'a–z', minLen: 2, maxLen: 5 },
      { key: 'words', type: 'words', minLen: 1, maxLen: 12, maxWord: 5 },
    ],
    example: { begin: 'hit', end: 'cog', words: ['hot', 'dot', 'dog', 'lot', 'log', 'cog'] },
    random: next => {
      const words = shuffle(next, LADDER_WORDS).slice(0, 9);
      return { begin: 'hit', end: pick(next, words), words };
    },
    check: p => ([p.end, ...p.words].some(w => w.length !== p.begin.length) ? ['in.err.sameLen', p.begin.length] : null),
    run: p => ({ ...B.wordLadderTrace(p.begin, p.end, p.words), end: p.end }),
  }, V.ladder),

  /* 08 trees */
  maxDepth: defineRig({
    fields: [tree],
    example: { root: [3, 9, 20, 4, null, 15, 7, null, null, null, null, null, 8] },
    random: next => ({ root: levelOrderOf(randomTree(next)) }),
    run: p => B.maxDepthTrace(treeFromLevelOrder(p.root)),
  }, V.maxDepth),
  levelOrder: defineRig({
    fields: [tree],
    example: { root: [3, 9, 20, 4, null, 15, 7, null, null, null, null, null, 8] },
    random: next => ({ root: levelOrderOf(randomTree(next)) }),
    run: p => B.levelOrderTrace(treeFromLevelOrder(p.root)),
  }, V.levelOrder),
  validBst: defineRig({
    fields: [tree],
    example: { root: [5, 3, 8, 1, 6, 7, 9] },
    random: next => ({ root: randomBst(next) }),
    run: p => B.validBstTrace(treeFromLevelOrder(p.root)),
  }, V.validBst),
  maxPath: defineRig({
    fields: [tree],
    example: { root: [-10, 9, 20, null, null, 15, 7] },
    random: next => ({ root: levelOrderOf(randomTree(next)) }),
    run: p => B.maxPathSumTrace(treeFromLevelOrder(p.root)),
  }, V.maxPath),

  /* must-know additions */
  lru: defineRig({
    fields: [{ key: 'capacity', type: 'int', min: 1, max: 4 }, { key: 'ops', type: 'cache', minLen: 1, maxLen: 12 }],
    example: { capacity: 2, ops: [['put', 1, 1], ['put', 2, 2], ['get', 1], ['put', 3, 3], ['get', 2], ['put', 4, 4], ['get', 1], ['get', 3], ['get', 4]] },
    random: next => ({
      capacity: randInt(next, 2, 3),
      ops: Array.from({ length: randInt(next, 7, 11) }, () => (next() < 0.55 ? ['put', randInt(next, 1, 5), randInt(next, 1, 9)] : ['get', randInt(next, 1, 5)])),
    }),
    run: p => ({ ...B.lruTrace(p.capacity, p.ops), capacity: p.capacity, ops: p.ops }),
  }, V.lru),
  course: defineRig({
    fields: [{ key: 'n', type: 'int', min: 1, max: 7 }, { key: 'prerequisites', type: 'edges', minLen: 0, maxLen: 12 }],
    example: { n: 6, prerequisites: [[1, 0], [2, 0], [3, 1], [3, 2], [4, 3], [5, 4]] },
    random: next => {
      const n = randInt(next, 4, 7), order = shuffle(next, Array.from({ length: n }, (_, i) => i)), edges = [];
      for (let t = 0; t < n + 1; t++) {
        const [a, b] = shuffle(next, order).slice(0, 2);
        const [early, late] = order.indexOf(a) < order.indexOf(b) ? [a, b] : [b, a];
        if (!edges.some(([x, y]) => x === late && y === early)) edges.push([late, early]);
      }
      if (next() < 0.3 && edges.length) edges.push([edges[0][1], edges[0][0]]);
      return { n, prerequisites: edges };
    },
    check: p => (p.prerequisites.flat().some(c => c >= p.n) ? ['in.err.course', p.n - 1] : null),
    run: p => ({ ...B.courseScheduleTrace(p.n, p.prerequisites), n: p.n, edges: p.prerequisites }),
  }, V.course),
  lca: defineRig({
    fields: [tree, { key: 'p', type: 'int', min: -99, max: 99 }, { key: 'q', type: 'int', min: -99, max: 99 }],
    example: { root: [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p: 7, q: 8 },
    random: next => {
      const spec = randomTree(next) || [1, null, null];
      let label = 1;
      const renumber = s => (s ? [label++, renumber(s[1]), renumber(s[2])] : null);
      const root = levelOrderOf(renumber(spec)), values = root.filter(v => v !== null);
      return { root, p: pick(next, values), q: pick(next, values) };
    },
    check: p => {
      const values = p.root.filter(v => v !== null);
      if (new Set(values).size !== values.length) return ['in.err.treeDistinct'];
      return values.includes(p.p) && values.includes(p.q) ? null : ['in.err.inTree'];
    },
    run: p => B.lcaTrace(treeFromLevelOrder(p.root), p.p, p.q),
  }, V.lca),
};
