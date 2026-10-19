/**
 * Pure traces for chapter 15: bit manipulation. Values are 32-bit words: int32 in JS bit operators,
 * shown as uint where the problem is unsigned. Same contract as model-a.js: every event is a complete
 * snapshot with an i18n key and its arguments.
 */
const event = (key, args, state) => ({ key, args, ...state });
/** Index of the highest set bit (for a single bit, its position); −1 for 0. */
export const highBit = v => 31 - Math.clz32(v);
/** The lowest set bit as a value: x & −x. */
export const lowBit = v => v & -v;
/** Number of set bits, by brute force over all 32 positions (an independent check for the traces). */
export const ones = v => { let c = 0; for (let i = 0; i < 32; i++) c += (v >>> i) & 1; return c; };
const bin = (v, width) => (v >>> 0).toString(2).padStart(width, '0');

/* ---------- Number of 1 Bits (and Power of Two) ---------- */
/** Kernighan: x & (x − 1) clears the lowest 1, so the loop runs once per set bit, not 32 times. */
export function popcountTrace(n) {
  const start = n >>> 0, events = [];
  let x = start, count = 0;
  const push = (key, args, extra = {}) => events.push(event(key, args, { x, count, minus: null, and: null, cleared: 0, ...extra }));
  push('pop.ev.start', [start, ones(start)]);
  if (!x) {
    push('pop.ev.zero', []);
    return { events, count: 0, power: false };
  }
  while (x) {
    const minus = (x - 1) >>> 0, low = lowBit(x) >>> 0, tz = highBit(low);
    push('pop.ev.minus', [count + 1, tz, x, minus], { minus });
    const and = (x & minus) >>> 0;
    count++;
    push('pop.ev.and', [count, tz, and], { minus, and, cleared: low });
    x = and;
  }
  const power = count === 1;
  push(power ? 'pop.ev.pow2' : 'pop.ev.done', [count, start, highBit(start)], { orig: start });
  return { events, count, power };
}

/* ---------- Missing Number ---------- */
/**
 * x starts at n and takes every index and every value: each number in 0..n arrives twice (as an index and as
 * a value) except the missing one, and a ^ a = 0 cancels the pairs. waiting = numbers seen an odd number of times.
 */
export function missingXorTrace(nums) {
  const n = nums.length, waiting = new Set([n]), events = [];
  let x = n;
  const flip = v => { if (waiting.has(v)) { waiting.delete(v); return true; } waiting.add(v); return false; };
  const push = (key, args, extra = {}) => events.push(event(key, args, { x, i: null, v: null, before: null, waiting: [...waiting].sort((a, b) => a - b), ...extra }));
  push('mis.ev.start', [n]);
  nums.forEach((v, i) => {
    const before = x;
    x ^= i ^ v;
    let key, met = [];
    if (v === i) key = 'mis.ev.self';
    else {
      if (flip(i)) met.push(i);
      if (flip(v)) met.push(v);
      key = met.length ? 'mis.ev.meet' : 'mis.ev.wait';
    }
    push(key, [i, v, before, x, met], { i, v, before });
  });
  push('mis.ev.done', [x, n]);
  return { events, answer: x };
}

/* ---------- Single Number III ---------- */
/** XOR of everything leaves a ^ b; its lowest set bit x & −x is a bit where a and b differ, and it splits the array in two. */
export function singleIIITrace(nums) {
  const seen = new Set(), events = [];
  let x = 0;
  const push = (key, args, extra = {}) => events.push(event(key, args, { phase: 'fold', x, before: null, v: null, i: null, ...extra }));
  push('sn3.ev.start', [nums.length]);
  nums.forEach((v, i) => {
    const before = x;
    x ^= v;
    const twice = seen.has(v);
    if (twice) seen.delete(v); else seen.add(v);
    push(twice ? 'sn3.ev.cancel' : 'sn3.ev.fold', [v, x, i], { before, v, i });
  });
  const neg = -x | 0, low = x & neg, bit = highBit(low >>> 0);
  push('sn3.ev.neg', [x, ~x, neg], { phase: 'neg', neg });
  push('sn3.ev.low', [x, neg, low, bit], { phase: 'low', neg, low });
  let a = 0, b = 0;
  nums.forEach((v, i) => {
    if (v & low) { a ^= v; events.push(event('sn3.ev.one', [v, bit, a], { phase: 'split', x, low, v, i, a, b })); }
    else { b ^= v; events.push(event('sn3.ev.zero', [v, bit, b], { phase: 'split', x, low, v, i, a, b })); }
  });
  const pair = [Math.min(a, b), Math.max(a, b)];
  events.push(event('sn3.ev.done', [pair[0], pair[1], bit], { phase: 'done', x, low, v: null, i: null, a, b }));
  return { events, pair };
}

/* ---------- Counting Bits ---------- */
/** bits[i] = bits[i >> 1] + (i & 1): i >> 1 is a smaller number whose answer is already in the table. */
export function countBitsTrace(n) {
  const bits = [0], events = [];
  events.push(event('cb.ev.start', [n], { i: 0, bits: [...bits] }));
  for (let i = 1; i <= n; i++) {
    const src = i >> 1, low = i & 1;
    bits[i] = bits[src] + low;
    const key = low ? 'cb.ev.odd' : (i & (i - 1)) === 0 ? 'cb.ev.pow' : 'cb.ev.even';
    events.push(event(key, [i, src, bits[src], low, bits[i]], { i, bits: [...bits] }));
  }
  events.push(event('cb.ev.done', [n, bits.slice()], { i: null, bits: [...bits] }));
  return { events, bits };
}

/* ---------- Sum of Two Integers ---------- */
/**
 * a ^ b adds every column without carries, (a & b) << 1 is the carries moved one column left. Repeat until no
 * carry is left. Carries out of bit 31 vanish, which is exactly two's complement wrap-around.
 */
export function sumBitsTrace(a0, b0) {
  const events = [];
  let a = a0 | 0, b = b0 | 0, round = 0;
  events.push(event('sum.ev.start', [a, b], { a, b, both: null, carry: null, s: null, round }));
  while (b !== 0) {
    round++;
    const both = a & b, carry = both << 1, s = a ^ b, lost = both < 0;
    const key = !both ? 'sum.ev.nocarry' : lost ? 'sum.ev.drop' : 'sum.ev.carry';
    events.push(event(key, [round, a, b, s, carry], { a, b, both, carry, s, round }));
    a = s;
    b = carry;
  }
  events.push(event('sum.ev.done', [a, a0, b0, round], { a, b, both: null, carry: null, s: null, round }));
  return { events, sum: a };
}

/* ---------- Maximum XOR With an Element From Array ---------- */
/**
 * Offline: sort nums and the queries by their limit m, insert nums ≤ m as the limit grows. levels[k] holds every
 * prefix v >> k of the inserted numbers — a binary trie stored level by level. For x, walk from the high bit and
 * take the opposite bit of x whenever such a prefix exists: one 1 high up beats every lower bit together.
 */
export function maxXorLimitTrace(nums, queries) {
  const sorted = [...nums].sort((a, b) => a - b);
  const order = queries.map((_, j) => j).sort((p, q) => queries[p][1] - queries[q][1] || p - q);
  const top = Math.max(0, highBit(Math.max(...nums, ...queries.map(q => q[0]))));
  const levels = Array.from({ length: top + 1 }, () => new Set());
  const answers = queries.map(() => null), events = [];
  let p = 0;
  const base = () => ({ answers: [...answers], inserted: sorted.slice(0, p), top, q: null, x: null, m: null, k: null, y: 0, known: 0, prefixes: [], want: null });
  events.push(event('mxl.ev.sort', [sorted, order.map(j => queries[j][1])], base()));
  for (const j of order) {
    const [x, m] = queries[j], added = [];
    while (p < sorted.length && sorted[p] <= m) {
      const v = sorted[p++];
      for (let k = 0; k <= top; k++) levels[k].add(v >> k);
      added.push(v);
    }
    if (!p) {
      answers[j] = -1;
      events.push(event('mxl.ev.empty', [x, m, sorted[0], j], { ...base(), q: j, x, m }));
      continue;
    }
    events.push(event(added.length ? 'mxl.ev.insert' : 'mxl.ev.keep', [x, m, added, p, j], { ...base(), q: j, x, m, added }));
    let node = 0, ans = 0, known = 0;
    for (let k = top; k >= 0; k--) {
      const xb = (x >> k) & 1, want = xb ^ 1, cand = (node << 1) | want, has = levels[k].has(cand);
      node = has ? cand : cand ^ 1;
      if (has) ans |= 1 << k;
      known |= 1 << k;
      events.push(event(has ? 'mxl.ev.take' : 'mxl.ev.same', [k, xb, want, bin(cand, top - k + 1), ans], {
        ...base(), q: j, x, m, k, y: node << k, known, cand, prefixes: [...levels[k]].sort((a, b) => a - b), want,
      }));
    }
    answers[j] = ans;
    events.push(event('mxl.ev.answer', [x, m, node, ans, j], { ...base(), q: j, x, m, y: node, known: (2 << top) - 1 }));
  }
  events.push(event('mxl.ev.done', [answers], base()));
  return { events, answers };
}
