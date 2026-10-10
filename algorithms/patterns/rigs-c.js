/** Editable rigs for chapters 09–12. */
import * as C from './model-c.js?v=202610100731';
import * as V from './views-c.js?v=202610100731';
import { defineRig, randInt, randInts, pick, shuffle, distinctInts } from './rig-kit.js?v=202610100731';

const nums = (extra = {}) => ({ key: 'nums', type: 'ints', minLen: 1, maxLen: 10, min: -99, max: 99, ...extra });
const word = key => ({ key, type: 'str', chars: 'a-z', charsLabel: 'a–z', minLen: 0, maxLen: 7 });
const WORDS = ['horse', 'ros', 'intent', 'execute', 'abcde', 'ace', 'kitten', 'sitting', 'sunday', 'saturday', 'flaw', 'lawn'];

export const RIGS_C = {
  /* 09 heap */
  kth: defineRig({
    fields: [{ key: 'k', type: 'int', min: 1, max: 6 }, nums()],
    example: { k: 3, nums: [4, 1, 7, 3, 8, 5, 9, 2] },
    random: next => ({ k: randInt(next, 2, 4), nums: randInts(next, randInt(next, 6, 10), 1, 30) }),
    check: p => (p.k > p.nums.length ? ['in.err.kLen', p.nums.length] : null),
    run: p => ({ ...C.kthLargestTrace(p.nums, p.k), nums: p.nums, k: p.k }),
  }, V.kth),
  stones: defineRig({
    fields: [{ key: 'stones', type: 'ints', minLen: 1, maxLen: 8, min: 1, max: 30 }],
    example: { stones: [2, 7, 4, 1, 8, 1] },
    random: next => ({ stones: randInts(next, randInt(next, 4, 8), 1, 12) }),
    run: p => ({ ...C.lastStoneTrace(p.stones), stones: p.stones }),
  }, V.stones),
  mergeK: defineRig({
    fields: [{ key: 'lists', type: 'lists', maxLists: 4, maxLen: 5, min: -99, max: 99 }],
    example: { lists: [[1, 4, 5], [1, 3, 4], [2, 6]] },
    random: next => ({ lists: Array.from({ length: randInt(next, 2, 4) }, () => randInts(next, randInt(next, 1, 4), 0, 12).sort((a, b) => a - b)) }),
    run: p => ({ ...C.mergeKTrace(p.lists), lists: p.lists }),
  }, V.mergeK),
  medianStream: defineRig({
    fields: [{ key: 'stream', type: 'ints', minLen: 1, maxLen: 10, min: -99, max: 999 }],
    example: { stream: [5, 15, 1, 3, 8, 7, 9, 10] },
    random: next => ({ stream: randInts(next, randInt(next, 6, 10), 1, 30) }),
    run: p => ({ ...C.medianStreamTrace(p.stream), nums: p.stream }),
  }, V.medianStream),

  /* 10 backtracking */
  subsets: defineRig({
    fields: [nums({ minLen: 0, maxLen: 4, min: -9, max: 99, distinct: true })],
    example: { nums: [1, 2, 3] },
    random: next => ({ nums: distinctInts(next, randInt(next, 2, 4), 1, 9) }),
    run: p => ({ ...C.subsetsTrace(p.nums), isAnswer: n => n.leaf, gapX: 64 }),
  }, V.subsets),
  perms: defineRig({
    fields: [nums({ maxLen: 4, min: -9, max: 99, distinct: true })],
    example: { nums: [1, 2, 3] },
    random: next => ({ nums: distinctInts(next, 3, 1, 9) }),
    run: p => ({ ...C.permutationsTrace(p.nums), isAnswer: n => n.state.path.length === p.nums.length, gapX: 60 }),
  }, V.perms),
  combSum: defineRig({
    fields: [{ key: 'candidates', type: 'ints', minLen: 1, maxLen: 4, min: 2, max: 20, distinct: true }, { key: 'target', type: 'int', min: 1, max: 12 }],
    example: { candidates: [2, 3, 6, 7], target: 7 },
    random: next => ({ candidates: distinctInts(next, randInt(next, 2, 4), 2, 8).sort((a, b) => a - b), target: randInt(next, 5, 9) }),
    run: p => ({ ...C.combinationSumTrace(p.candidates, p.target), isAnswer: n => n.state.remain === 0, gapX: 50 }),
  }, V.combSum),
  queens: defineRig({
    fields: [{ key: 'n', type: 'int', min: 1, max: 6 }],
    example: { n: 4 },
    random: next => ({ n: pick(next, [4, 5, 6]) }),
    run: p => ({ ...C.nQueensTrace(p.n, 1), n: p.n }),
  }, V.queens),

  /* 11 greedy */
  jump: defineRig({
    fields: [{ key: 'a', type: 'ints', minLen: 1, maxLen: 10, min: 0, max: 9 }],
    example: { a: [2, 0, 2, 0, 1, 3] },
    random: next => ({ a: randInts(next, randInt(next, 5, 9), 0, 3) }),
    run: p => ({ ...C.jumpTrace(p.a), a: p.a }),
  }, V.jump),
  stock: defineRig({
    fields: [{ key: 'prices', type: 'ints', minLen: 1, maxLen: 10, min: 0, max: 9 }],
    example: { prices: [7, 1, 5, 3, 6, 4] },
    random: next => ({ prices: randInts(next, randInt(next, 5, 9), 1, 9) }),
    run: p => ({ ...C.stockTrace(p.prices), prices: p.prices }),
  }, V.stock),
  intervals: defineRig({
    fields: [{ key: 'intervals', type: 'intervals', minLen: 1, maxLen: 8, max: 12 }],
    example: { intervals: [[1, 3], [2, 4], [3, 5], [1, 2], [5, 7], [4, 6]] },
    random: next => ({ intervals: Array.from({ length: randInt(next, 4, 7) }, () => { const a = randInt(next, 0, 8); return [a, a + randInt(next, 1, 4)]; }) }),
    run: p => C.intervalsTrace(p.intervals),
  }, V.intervals),
  candy: defineRig({
    fields: [{ key: 'ratings', type: 'ints', minLen: 1, maxLen: 10, min: 0, max: 99 }],
    example: { ratings: [1, 2, 87, 87, 87, 2, 1] },
    random: next => ({ ratings: randInts(next, randInt(next, 5, 9), 1, 6) }),
    run: p => ({ ...C.candyTrace(p.ratings), ratings: p.ratings }),
  }, V.candy),

  /* 12 dynamic programming */
  climb: defineRig({
    fields: [{ key: 'n', type: 'int', min: 1, max: 12 }],
    example: { n: 6 },
    random: next => ({ n: randInt(next, 4, 10) }),
    run: p => C.climbTrace(p.n),
  }, V.climb),
  coin: defineRig({
    fields: [{ key: 'coins', type: 'ints', minLen: 1, maxLen: 4, min: 1, max: 12, distinct: true }, { key: 'amount', type: 'int', min: 0, max: 12 }],
    example: { coins: [1, 3, 4], amount: 6 },
    random: next => ({ coins: pick(next, [[1, 3, 4], [1, 5, 6], [2, 5], [1, 4, 5], [3, 7], [2, 3]]), amount: randInt(next, 5, 12) }),
    run: p => ({ ...C.coinChangeTrace(p.coins, p.amount), coins: p.coins }),
  }, V.coin),
  lcs: defineRig({
    fields: [word('a'), word('b')],
    example: { a: 'abcde', b: 'ace' },
    random: next => ({ a: Array.from({ length: randInt(next, 4, 6) }, () => pick(next, 'abcd')).join(''), b: Array.from({ length: randInt(next, 3, 5) }, () => pick(next, 'abcd')).join('') }),
    run: p => ({ ...C.lcsTrace(p.a, p.b), a: p.a, b: p.b }),
  }, V.lcs),
  edit: defineRig({
    fields: [word('a'), word('b')],
    example: { a: 'horse', b: 'ros' },
    random: next => {
      const [a, b] = shuffle(next, WORDS.filter(w => w.length <= 7)).slice(0, 2);
      return { a, b };
    },
    run: p => ({ ...C.editDistanceTrace(p.a, p.b), a: p.a, b: p.b }),
  }, V.edit),

  /* must-know additions */
  topK: defineRig({
    fields: [{ key: 'k', type: 'int', min: 1, max: 4 }, { key: 'nums', type: 'ints', minLen: 1, maxLen: 14, min: -99, max: 99 }],
    example: { k: 2, nums: [1, 1, 1, 2, 2, 3, 4, 4, 4, 4, 5] },
    random: next => ({ k: randInt(next, 1, 3), nums: randInts(next, randInt(next, 8, 14), 1, 6) }),
    check: p => (p.k > new Set(p.nums).size ? ['in.err.kDistinct', new Set(p.nums).size] : null),
    run: p => ({ ...C.topKFrequentTrace(p.nums, p.k), k: p.k }),
  }, V.topK),
  wordSearch: defineRig({
    fields: [{ key: 'board', type: 'board', maxRows: 4, maxCols: 5 }, { key: 'word', type: 'str', chars: 'A-Za-z', charsLabel: 'A–Z', minLen: 1, maxLen: 6 }],
    example: { board: [[...'ABCE'], [...'SFCS'], [...'ADEE']], word: 'ABCCED' },
    random: next => {
      const board = Array.from({ length: 3 }, () => Array.from({ length: 4 }, () => pick(next, 'ABCDE')));
      let r = randInt(next, 0, 2), c = randInt(next, 0, 3), word = board[r][c];
      const seen = new Set([`${r},${c}`]);
      for (let step = 0; step < randInt(next, 2, 4); step++) {
        const moves = [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([dr, dc]) => [r + dr, c + dc]).filter(([y, x]) => y >= 0 && x >= 0 && y < 3 && x < 4 && !seen.has(`${y},${x}`));
        if (!moves.length) break;
        [r, c] = pick(next, moves);
        seen.add(`${r},${c}`);
        word += board[r][c];
      }
      return { board, word: next() < 0.25 ? `${word}E` : word };
    },
    run: p => ({ ...C.wordSearchTrace(p.board, p.word.toUpperCase()), board: p.board, word: p.word.toUpperCase() }),
  }, V.wordSearch),
  mergeIv: defineRig({
    fields: [{ key: 'intervals', type: 'intervals', minLen: 1, maxLen: 8, max: 18 }],
    example: { intervals: [[1, 3], [2, 6], [8, 10], [10, 12], [15, 18]] },
    random: next => ({ intervals: Array.from({ length: randInt(next, 4, 7) }, () => { const a = randInt(next, 0, 11); return [a, a + randInt(next, 1, 3)]; }) }),
    run: p => C.mergeIntervalsTrace(p.intervals),
  }, V.mergeIv),
  lis: defineRig({
    fields: [{ key: 'nums', type: 'ints', minLen: 1, maxLen: 10, min: -999, max: 999 }],
    example: { nums: [10, 9, 2, 5, 3, 7, 101, 18] },
    random: next => ({ nums: randInts(next, randInt(next, 6, 10), 0, 20) }),
    run: p => ({ ...C.lisTrace(p.nums), nums: p.nums }),
  }, V.lis),
  regex: defineRig({
    fields: [{ key: 's', type: 'str', chars: 'a-z', charsLabel: 'a–z', minLen: 0, maxLen: 6 }, { key: 'p', type: 'str', chars: 'a-z.*', charsLabel: 'a–z . *', minLen: 1, maxLen: 6 }],
    example: { s: 'aab', p: 'c*a*b' },
    random: next => {
      let p = '';
      while (p.length < randInt(next, 2, 5)) { p += pick(next, 'ab.'); if (next() < 0.45) p += '*'; }
      return { s: Array.from({ length: randInt(next, 1, 5) }, () => pick(next, 'ab')).join(''), p: p.slice(0, 6).replace(/^\*/, 'a*') };
    },
    check: p => (/^\*|\*\*/.test(p.p) ? ['in.err.pattern'] : null),
    run: p => ({ ...C.regexTrace(p.s, p.p), s: p.s, p: p.p }),
  }, V.regex),
};
