/** Editable rigs for chapters 01–04. */
import * as A from './model-a.js?v=202610101649';
import * as V from './views-a.js?v=202610101649';
import { defineRig, randInt, randInts, pick, shuffle, distinctInts } from './rig-kit.js?v=202610101649';

const nums = (extra = {}) => ({ key: 'nums', type: 'ints', minLen: 1, maxLen: 12, min: -99, max: 99, ...extra });
const target = (extra = {}) => ({ key: 'target', type: 'int', min: -999, max: 999, ...extra });
const k = (extra = {}) => ({ key: 'k', type: 'int', min: 1, max: 12, ...extra });
const kWithin = p => (p.k > p.nums.length ? ['in.err.kLen', p.nums.length] : null);

export const RIGS_A = {
  /* 01 hash map */
  twoSum: defineRig({
    fields: [nums({ minLen: 2 }), target()],
    example: { nums: [3, 8, 2, 11, 7, 5], target: 9 },
    random: next => {
      const list = randInts(next, randInt(next, 4, 8), -5, 20);
      const [i, j] = shuffle(next, list.map((_, x) => x)).slice(0, 2);
      return { nums: list, target: list[i] + list[j] };
    },
    run: p => ({ ...A.twoSumTrace(p.nums, p.target), nums: p.nums, target: p.target }),
  }, V.twoSum),
  dup: defineRig({
    fields: [nums()],
    example: { nums: [4, 7, 1, 9, 7, 3] },
    random: next => ({ nums: randInts(next, randInt(next, 4, 9), 1, 12) }),
    run: p => ({ ...A.containsDupTrace(p.nums), nums: p.nums }),
  }, V.dup),
  anagram: defineRig({
    fields: [{ key: 'strs', type: 'words', minLen: 1, maxLen: 10, maxWord: 5 }],
    example: { strs: ['eat', 'tea', 'tan', 'ate', 'nat', 'bat'] },
    random: next => {
      const families = [['eat', 'tea', 'ate', 'eta'], ['tan', 'nat', 'ant'], ['bat', 'tab'], ['arc', 'car'], ['own', 'now', 'won'], ['pot', 'top', 'opt']];
      const words = shuffle(next, families).slice(0, 3).flatMap(f => shuffle(next, f).slice(0, randInt(next, 1, f.length)));
      return { strs: shuffle(next, words).slice(0, 10) };
    },
    run: p => ({ ...A.groupAnagramsTrace(p.strs), strs: p.strs }),
  }, V.anagram),
  psum: defineRig({
    fields: [nums({ min: -9, max: 9, maxLen: 10 }), k({ key: 'k', min: -20, max: 20 })],
    example: { nums: [1, 2, 3, -2, 2, 1], k: 3 },
    random: next => ({ nums: randInts(next, randInt(next, 5, 9), -3, 5), k: randInt(next, 1, 6) }),
    run: p => ({ ...A.subarraySumTrace(p.nums, p.k), nums: p.nums, k: p.k }),
  }, V.psum),

  /* 02 two pointers */
  moveZeroes: defineRig({
    fields: [nums({ min: 0, max: 99 })],
    example: { nums: [0, 1, 0, 3, 12, 0, 5] },
    random: next => ({ nums: randInts(next, randInt(next, 5, 10), 0, 9).map(v => (v < 4 ? 0 : v)) }),
    run: p => A.moveZeroesTrace(p.nums),
  }, V.moveZeroes),
  container: defineRig({
    fields: [{ key: 'h', type: 'ints', minLen: 2, maxLen: 12, min: 0, max: 9 }],
    example: { h: [1, 8, 6, 2, 5, 4, 8, 3, 7] },
    random: next => ({ h: randInts(next, randInt(next, 6, 11), 1, 9) }),
    run: p => ({ ...A.containerTrace(p.h), h: p.h }),
  }, V.container),
  threeSum: defineRig({
    fields: [nums({ minLen: 3, maxLen: 9, min: -9, max: 9 })],
    example: { nums: [-1, 0, 1, 2, -1, -4] },
    random: next => ({ nums: randInts(next, randInt(next, 5, 8), -5, 5) }),
    run: p => A.threeSumTrace(p.nums),
  }, V.threeSum),
  trap: defineRig({
    fields: [{ key: 'h', type: 'ints', minLen: 2, maxLen: 14, min: 0, max: 9 }],
    example: { h: [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1] },
    random: next => ({ h: randInts(next, randInt(next, 7, 12), 0, 6) }),
    run: p => ({ ...A.trapTrace(p.h), h: p.h }),
  }, V.trap),

  /* 03 sliding window */
  maxAvg: defineRig({
    fields: [nums({ maxLen: 10 }), k()],
    example: { nums: [1, 12, -5, -6, 50, 3], k: 4 },
    random: next => {
      const list = randInts(next, randInt(next, 5, 10), -9, 30);
      return { nums: list, k: randInt(next, 2, Math.min(4, list.length)) };
    },
    check: kWithin,
    run: p => ({ ...A.maxAverageTrace(p.nums, p.k), nums: p.nums }),
  }, V.maxAvg),
  longest: defineRig({
    fields: [{ key: 's', type: 'str', chars: 'a-z', charsLabel: 'a–z', minLen: 1, maxLen: 14 }],
    example: { s: 'abcbcad' },
    random: next => ({ s: Array.from({ length: randInt(next, 6, 12) }, () => pick(next, 'abcde')).join('') }),
    run: p => ({ ...A.longestUniqueTrace(p.s), s: p.s }),
  }, V.longest),
  minLen: defineRig({
    fields: [target({ min: 1, max: 200 }), nums({ min: 1, max: 20, maxLen: 10 })],
    example: { target: 7, nums: [2, 3, 1, 2, 4, 3] },
    random: next => ({ target: randInt(next, 6, 15), nums: randInts(next, randInt(next, 5, 9), 1, 6) }),
    run: p => ({ ...A.minSubArrayTrace(p.target, p.nums), nums: p.nums, target: p.target }),
  }, V.minLen),
  minWindow: defineRig({
    fields: [
      { key: 's', type: 'str', chars: 'A-Za-z', charsLabel: 'A–Z, a–z', minLen: 1, maxLen: 16 },
      { key: 't', type: 'str', chars: 'A-Za-z', charsLabel: 'A–Z, a–z', minLen: 1, maxLen: 4 },
    ],
    example: { s: 'ADOBECODEBANC', t: 'ABC' },
    random: next => ({ s: Array.from({ length: randInt(next, 9, 14) }, () => pick(next, 'ABCDEX')).join(''), t: shuffle(next, [...'ABC']).slice(0, randInt(next, 2, 3)).join('') }),
    run: p => ({ ...A.minWindowTrace(p.s, p.t), s: p.s, t: p.t }),
  }, V.minWindow),

  /* 04 binary search */
  bsearch: defineRig({
    fields: [{ key: 'a', type: 'ints', minLen: 1, maxLen: 12, min: -99, max: 999, sorted: true }, target()],
    example: { a: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], target: 23 },
    random: next => {
      const a = distinctInts(next, randInt(next, 7, 12), 1, 99).sort((x, y) => x - y);
      return { a, target: next() < 0.8 ? pick(next, a) : randInt(next, 1, 99) };
    },
    run: p => ({ ...A.binarySearchTrace(p.a, p.target), a: p.a }),
  }, V.bsearch),
  rotated: defineRig({
    fields: [{ key: 'nums', type: 'ints', minLen: 1, maxLen: 12, min: -99, max: 999, distinct: true }, target()],
    example: { nums: [4, 5, 6, 7, 0, 1, 2], target: 0 },
    random: next => {
      const sorted = distinctInts(next, randInt(next, 6, 10), 0, 40).sort((x, y) => x - y);
      const shift = randInt(next, 1, sorted.length - 1);
      const list = [...sorted.slice(shift), ...sorted.slice(0, shift)];
      return { nums: list, target: next() < 0.8 ? pick(next, list) : randInt(next, 0, 40) };
    },
    check: p => {
      const drops = p.nums.filter((v, i) => i && v < p.nums[i - 1]).length;
      const wraps = drops === 1 ? p.nums.at(-1) < p.nums[0] : drops === 0;
      return wraps ? null : ['in.err.rotated'];
    },
    run: p => ({ ...A.rotatedSearchTrace(p.nums, p.target), a: p.nums, target: p.target }),
  }, V.rotated),
  koko: defineRig({
    fields: [{ key: 'piles', type: 'ints', minLen: 1, maxLen: 6, min: 1, max: 20 }, { key: 'h', type: 'int', min: 1, max: 60 }],
    example: { piles: [3, 6, 7, 11], h: 8 },
    random: next => {
      const piles = randInts(next, randInt(next, 3, 5), 2, 20);
      return { piles, h: randInt(next, piles.length, piles.length * 3) };
    },
    check: p => (p.h < p.piles.length ? ['in.err.hours', p.piles.length] : null),
    run: p => ({ ...A.kokoTrace(p.piles, p.h), piles: p.piles, h: p.h }),
  }, V.koko),
  median: defineRig({
    fields: [
      { key: 'A', type: 'ints', minLen: 0, maxLen: 7, min: -99, max: 999, sorted: true },
      { key: 'B', type: 'ints', minLen: 1, maxLen: 7, min: -99, max: 999, sorted: true },
    ],
    example: { A: [1, 3, 8, 9, 15], B: [7, 11, 18, 19, 21, 25] },
    random: next => ({
      A: randInts(next, randInt(next, 2, 6), 0, 40).sort((x, y) => x - y),
      B: randInts(next, randInt(next, 2, 7), 0, 40).sort((x, y) => x - y),
    }),
    run: p => A.medianTwoTrace(p.A, p.B),
  }, V.median),

  /* must-know additions */
  longestConsec: defineRig({
    fields: [nums({ minLen: 0, maxLen: 12, max: 999 })],
    example: { nums: [100, 4, 200, 1, 3, 2] },
    random: next => ({ nums: randInts(next, randInt(next, 6, 11), 0, 14) }),
    run: p => ({ ...A.longestConsecutiveTrace(p.nums), nums: p.nums }),
  }, V.longestConsec),
  firstMissing: defineRig({
    fields: [nums({ maxLen: 10, min: -9, max: 20 })],
    example: { nums: [3, 4, -1, 1, 6, 2] },
    random: next => ({ nums: randInts(next, randInt(next, 4, 9), -2, 9) }),
    run: p => A.firstMissingTrace(p.nums),
  }, V.firstMissing),
  charReplace: defineRig({
    fields: [{ key: 's', type: 'str', chars: 'A-Z', charsLabel: 'A–Z', minLen: 1, maxLen: 14 }, { key: 'k', type: 'int', min: 0, max: 6 }],
    example: { s: 'AABABBA', k: 1 },
    random: next => ({ s: Array.from({ length: randInt(next, 7, 12) }, () => pick(next, 'AABBC')).join(''), k: randInt(next, 0, 2) }),
    run: p => ({ ...A.charReplacementTrace(p.s, p.k), s: p.s, k: p.k }),
  }, V.charReplace),
};
