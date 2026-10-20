/** Editable rigs for chapter 15: bit manipulation. */
import * as F from './model-f.js?v=202610201301';
import * as V from './views-f.js?v=202610201301';
import { bitWidth } from './view-kit.js?v=202610201301';
import { defineRig, randInt, randInts, distinctInts, shuffle, pick } from './rig-kit.js?v=202610201301';

/** Every value a trace shows, so the register keeps one width for the whole run. */
const widthOf = (events, fields) => bitWidth(events.flatMap(e => fields.map(f => e[f])).filter(v => typeof v === 'number'));

export const RIGS_F = {
  popcount: defineRig({
    fields: [{ key: 'n', type: 'uint', min: 0, max: 4294967295 }],
    example: { n: 52 },
    random: next => {
      const kind = randInt(next, 0, 3);
      if (kind === 0) return { n: 2 ** randInt(next, 0, 31) };
      if (kind === 1) return { n: randInt(next, 1, 255) };
      let n = 0;
      for (const b of distinctInts(next, randInt(next, 2, 9), 0, 31)) n += 2 ** b;
      return { n };
    },
    run: p => {
      const r = F.popcountTrace(p.n);
      return { ...r, n: p.n, bits: bitWidth([p.n]) };
    },
  }, V.popcount),
  missingXor: defineRig({
    fields: [{ key: 'nums', type: 'ints', minLen: 1, maxLen: 12, min: 0, max: 12, distinct: true }],
    example: { nums: [9, 6, 4, 2, 3, 5, 7, 0, 1] },
    random: next => {
      const n = randInt(next, 2, 10), gone = randInt(next, 0, n);
      return { nums: shuffle(next, Array.from({ length: n + 1 }, (_, i) => i).filter(v => v !== gone)) };
    },
    check: p => (p.nums.some(v => v > p.nums.length) ? ['in.err.missing', p.nums.length] : null),
    run: p => ({ ...F.missingXorTrace(p.nums), nums: p.nums, bits: bitWidth([p.nums.length, ...p.nums]) }),
  }, V.missingXor),
  singleIII: defineRig({
    fields: [{ key: 'nums', type: 'ints', minLen: 2, maxLen: 14, min: -99, max: 99 }],
    example: { nums: [1, 2, 1, 3, 2, 5] },
    random: next => {
      const values = distinctInts(next, randInt(next, 3, 7), next() < 0.3 ? -20 : 0, 20);
      const [a, b, ...pairs] = values;
      return { nums: shuffle(next, [a, b, ...pairs, ...pairs]) };
    },
    check: p => {
      const count = new Map();
      p.nums.forEach(v => count.set(v, (count.get(v) || 0) + 1));
      const counts = [...count.values()];
      return counts.filter(c => c === 1).length === 2 && counts.every(c => c <= 2) ? null : ['in.err.twoSingles'];
    },
    run: p => {
      const r = F.singleIIITrace(p.nums);
      return { ...r, nums: p.nums, bits: widthOf(r.events, ['x', 'neg', 'v']) };
    },
  }, V.singleIII),
  countBits: defineRig({
    fields: [{ key: 'n', type: 'int', min: 0, max: 40 }],
    example: { n: 12 },
    random: next => ({ n: randInt(next, 4, 20) }),
    run: p => ({ ...F.countBitsTrace(p.n), n: p.n, bits: bitWidth([p.n]) }),
  }, V.countBits),
  sumBits: defineRig({
    fields: [{ key: 'a', type: 'int', min: -1000, max: 1000 }, { key: 'b', type: 'int', min: -1000, max: 1000 }],
    example: { a: 13, b: 11 },
    random: next => {
      const kind = randInt(next, 0, 3);
      if (kind === 0) return { a: randInt(next, -20, -1), b: randInt(next, 1, 60) };
      if (kind === 1) return { a: pick(next, [7, 15, 31, 63]), b: 1 };
      return { a: randInt(next, 0, 120), b: randInt(next, 0, 120) };
    },
    run: p => {
      const r = F.sumBitsTrace(p.a, p.b);
      return { ...r, a: p.a, b: p.b, bits: widthOf(r.events, ['a', 'b', 'both', 'carry', 's']) };
    },
  }, V.sumBits),
  maxXorLimit: defineRig({
    fields: [
      { key: 'nums', type: 'ints', minLen: 1, maxLen: 8, min: 0, max: 255 },
      { key: 'queries', type: 'matrix', minRows: 1, maxRows: 5, maxCols: 2, min: 0, max: 255 },
    ],
    example: { nums: [5, 2, 4, 6, 6, 3], queries: [[12, 4], [8, 1], [6, 3]] },
    random: next => {
      const nums = randInts(next, randInt(next, 3, 6), 0, 31);
      const queries = Array.from({ length: randInt(next, 2, 4) }, () => [randInt(next, 0, 31), randInt(next, 0, 31)]);
      return { nums, queries };
    },
    check: p => (p.queries[0].length !== 2 ? ['in.err.pairs'] : null),
    run: p => ({ ...F.maxXorLimitTrace(p.nums, p.queries), nums: p.nums, queries: p.queries, sorted: [...p.nums].sort((a, b) => a - b),
      bits: bitWidth([...p.nums, ...p.queries.flat()]) }),
  }, V.maxXorLimit),
};
