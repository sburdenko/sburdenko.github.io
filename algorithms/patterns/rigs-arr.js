/** Editable rigs for the problems that joined the two pointers, binary search, heap, greedy, dynamic programming and matrix chapters later (see model-arr.js). */
import * as M from './model-arr.js?v=202610262045';
import * as V from './views-arr.js?v=202610262045';
import { defineRig, randInt, randInts, pick } from './rig-kit.js?v=202610262045';

/** Sorted, pairwise disjoint intervals inside [0, max]: what Insert Interval promises. */
function randomDisjoint(next, count, max) {
  const out = [];
  let t = randInt(next, 0, 2);
  for (let k = 0; k < count && t < max; k++) {
    const b = Math.min(max, t + randInt(next, 1, 3));
    out.push([t, b]);
    t = b + randInt(next, 1, 3);
  }
  return out;
}

/** Meetings where some start exactly when another ends, so the tie rule matters. */
function randomMeetings(next) {
  const out = [];
  for (let k = randInt(next, 3, 7); k > 0; k--) {
    const a = out.length && next() < 0.35 ? pick(next, out)[1] : randInt(next, 0, 13);
    const b = Math.min(20, a + randInt(next, 1, 6));
    if (a < b) out.push([a, b]);
  }
  return out.length ? out : [[0, 3]];
}

export const RIGS_ARR = {
  kadane: defineRig({
    fields: [{ key: 'nums', type: 'ints', minLen: 1, maxLen: 12, min: -20, max: 20 }],
    example: { nums: [-2, 1, -3, 4, -1, 2, 1, -5, 4] },
    random: next => (next() < 0.2
      ? { nums: randInts(next, randInt(next, 4, 7), -9, -1) }
      : { nums: randInts(next, randInt(next, 6, 10), -8, 8) }),
    run: p => ({ ...M.kadaneTrace(p.nums), nums: p.nums }),
  }, V.kadane),
  insertIv: defineRig({
    fields: [
      { key: 'intervals', type: 'intervals', minLen: 0, maxLen: 7, max: 18 },
      { key: 'newInterval', type: 'intervals', minLen: 1, maxLen: 1, max: 18 },
    ],
    example: { intervals: [[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], newInterval: [[4, 8]] },
    random: next => {
      const a = randInt(next, 0, 14);
      return { intervals: randomDisjoint(next, randInt(next, 3, 6), 18), newInterval: [[a, Math.min(18, a + randInt(next, 1, 6))]] };
    },
    check: p => {
      const k = p.intervals.findIndex((iv, i) => i && p.intervals[i - 1][1] >= iv[0]);
      return k > 0 ? ['in.err.ivSorted', k, k + 1] : null;
    },
    run: p => ({ ...M.insertIntervalTrace(p.intervals, p.newInterval[0]), intervals: p.intervals, newInterval: p.newInterval[0] }),
  }, V.insertIv),
  sortColors: defineRig({
    fields: [{ key: 'nums', type: 'ints', minLen: 1, maxLen: 12, min: 0, max: 2 }],
    example: { nums: [2, 0, 2, 1, 1, 0] },
    random: next => ({ nums: randInts(next, randInt(next, 5, 10), 0, 2) }),
    run: p => ({ ...M.sortColorsTrace(p.nums), nums: p.nums }),
  }, V.sortColors),
  lisTails: defineRig({
    fields: [{ key: 'nums', type: 'ints', minLen: 1, maxLen: 12, min: -9, max: 99 }],
    example: { nums: [2, 5, 3, 7, 11, 8, 10, 13, 6, 3] },
    random: next => ({ nums: randInts(next, randInt(next, 6, 10), 0, 20) }),
    run: p => ({ ...M.lisTailsTrace(p.nums), nums: p.nums }),
  }, V.lisTails),
  uniquePaths: defineRig({
    fields: [
      { key: 'm', type: 'int', min: 1, max: 7 },
      { key: 'n', type: 'int', min: 1, max: 7 },
      { key: 'mode', type: 'choice', options: ['table', 'row'] },
    ],
    example: { m: 3, n: 7, mode: 'table' },
    random: next => ({ m: randInt(next, 2, 5), n: randInt(next, 2, 6), mode: pick(next, ['table', 'row']) }),
    run: p => ({ ...M.uniquePathsTrace(p.m, p.n, p.mode), m: p.m, n: p.n, mode: p.mode }),
  }, V.uniquePaths),
  coinOrder: defineRig({
    fields: [
      { key: 'coins', type: 'ints', minLen: 1, maxLen: 4, min: 1, max: 9, distinct: true },
      { key: 'amount', type: 'int', min: 0, max: 10 },
      { key: 'order', type: 'choice', options: M.ORDERS },
    ],
    example: { coins: [1, 2, 3], amount: 4, order: 'coins-outer' },
    random: next => ({
      coins: pick(next, [[1, 2, 3], [1, 2, 5], [2, 3], [1, 3, 4], [3, 1, 2], [2, 5], [1, 2]]),
      amount: randInt(next, 3, 8),
      order: pick(next, M.ORDERS),
    }),
    run: p => ({ ...M.coinOrderTrace(p.coins, p.amount, p.order), coins: p.coins, amount: p.amount, order: p.order }),
  }, V.coinOrder),
  meetingRooms: defineRig({
    fields: [{ key: 'intervals', type: 'intervals', minLen: 1, maxLen: 8, max: 20 }],
    example: { intervals: [[1, 4], [2, 5], [4, 7], [6, 9], [7, 8]] },
    random: next => ({ intervals: randomMeetings(next) }),
    run: p => ({ ...M.meetingRoomsTrace(p.intervals), intervals: p.intervals }),
  }, V.meetingRooms),
};
