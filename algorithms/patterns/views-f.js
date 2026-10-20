/** Views for chapter 15: bit manipulation. Every problem is drawn on the shared register from view-kit.js. */
import { register, chip, chips, decOf } from './view-kit.js?v=202610201414';

const ALL = -1;
const bit = i => (1 << i) >>> 0;
const bin = (v, width) => (v >>> 0).toString(2).padStart(width, '0');

/* ---------- Number of 1 Bits ---------- */
export const popcount = {
  view(run, e) {
    const opts = { bits: run.bits, labelChars: 3 };
    if (e.key === 'pop.ev.done' || e.key === 'pop.ev.pow2') return register([{ label: 'n', value: e.orig, marks: [[e.orig, 'ok']] }], opts);
    const rows = [{ label: 'n', value: e.x, marks: e.x ? [[e.x & -e.x, 'low']] : [] }];
    if (e.minus !== null) rows.push({ label: 'n−1', value: e.minus, ref: e.x });
    if (e.and !== null) rows.push({ label: '&', value: e.and, ref: e.x, cls: 'res', marks: [[e.cleared, 'bad']] });
    return register(rows, opts);
  },
  vars(run, e) {
    const low = e.x & -e.x;
    return [['var.count', chip(e.count, 'hit')], ...(e.x && e.minus === null || e.key === 'pop.ev.minus'
      ? [['var.lowBit', chip(`${decOf(low)} = 1 << ${31 - Math.clz32(low)}`, 'amb')]] : [])];
  },
};

/* ---------- Missing Number ---------- */
export const missingXor = {
  view(run, e) {
    const opts = { bits: run.bits, labelChars: 7 };
    if (e.key === 'mis.ev.start') return register([{ label: 'x = n', value: e.x }], opts);
    if (e.key === 'mis.ev.done') return register([{ label: 'x', value: e.x, marks: [[ALL, 'ok']], cls: 'res' }], opts);
    return register([
      { label: 'x', value: e.before },
      { label: 'i', value: e.i },
      { label: 'nums[i]', value: e.v },
      { label: '→ x', value: e.x, ref: e.before, cls: 'res' },
    ], opts);
  },
  vars(run, e) {
    return [['var.unpaired', chips(e.waiting.map(v => chip(v, e.key === 'mis.ev.done' ? 'hit' : (v === e.i || v === e.v) ? 'new' : 'amb')))]];
  },
};

/* ---------- Single Number III ---------- */
export const singleIII = {
  view(run, e) {
    const opts = { bits: run.bits, signed: true, labelChars: 4 };
    if (e.phase === 'fold') {
      if (e.v === null) return register([{ label: 'x', value: 0 }], opts);
      return register([{ label: 'x', value: e.before }, { label: 'v', value: e.v }, { label: '→ x', value: e.x, ref: e.before, cls: 'res' }], opts);
    }
    if (e.phase === 'neg') return register([{ label: 'x', value: e.x }, { label: '~x', value: ~e.x, ref: e.x }, { label: '−x', value: e.neg, ref: ~e.x, cls: 'res' }], opts);
    const cursor = 31 - Math.clz32(e.low >>> 0);
    if (e.phase === 'low') {
      return register([{ label: 'x', value: e.x }, { label: '−x', value: e.neg }, { label: 'x&−x', value: e.low, marks: [[e.low, 'ok']], cls: 'res' }], { ...opts, cursor });
    }
    const into = e.v !== null && e.v & e.low ? 'a' : 'b';
    return register([
      { label: 'low', value: e.low, signed: false },
      ...(e.v !== null ? [{ label: 'v', value: e.v, marks: [[e.low, e.v & e.low ? 'ok' : 'bad']] }] : []),
      { label: 'a', value: e.a, cls: e.phase === 'done' ? 'res' : into === 'a' ? 'act' : '' },
      { label: 'b', value: e.b, cls: e.phase === 'done' ? 'res' : into === 'b' ? 'act' : '' },
    ], { ...opts, cursor });
  },
  vars(run, e) {
    if (e.phase !== 'split' && e.phase !== 'done') return [['var.xor', chip(decOf(e.x, true), 'hit')]];
    const upto = e.i === null ? run.nums.length : e.i + 1, seen = run.nums.slice(0, upto);
    const group = one => chips(seen.filter(v => !!(v & e.low) === one).map(v => chip(decOf(v, true), v === e.v ? 'new' : 'amb')));
    return [['var.groupOne', group(true)], ['var.groupZero', group(false)]];
  },
};

/* ---------- Counting Bits ---------- */
export const countBits = {
  view(run, e) {
    const opts = { bits: run.bits, cursor: e.i ? 0 : null, labelChars: 6 };
    if (e.i === null) return register([{ label: 'n', value: run.n }], opts);
    const i = e.i;
    return register([
      { label: 'i', value: i, marks: [[1, 'low']] },
      { label: 'i >> 1', value: i >> 1, caption: `${i >> 1} · bits[${i >> 1}] = ${e.bits[i >> 1]}` },
      { label: 'i & 1', value: i & 1, cls: 'res' },
    ], opts);
  },
  vars(run, e) {
    const src = e.i ? e.i >> 1 : null;
    return [['var.bitsTable', chips(e.bits.map((b, j) => chip(`${j}:${b}`, j === e.i ? 'new' : j === src ? 'amb' : e.i === null ? 'hit' : '')))]];
  },
};

/* ---------- Sum of Two Integers ---------- */
export const sumBits = {
  view(run, e) {
    const opts = { bits: run.bits, signed: true, labelChars: 3 };
    if (e.key === 'sum.ev.start') return register([{ label: 'a', value: e.a }, { label: 'b', value: e.b }], opts);
    if (e.key === 'sum.ev.done') {
      return register([{ label: 'a', value: run.a }, { label: 'b', value: run.b }, { label: 'a+b', value: e.a, marks: [[ALL, 'ok']], cls: 'res' }], opts);
    }
    return register([
      { label: 'a', value: e.a },
      { label: 'b', value: e.b },
      { label: 'a^b', value: e.s, cls: 'res' },
      { label: 'a&b', value: e.both, marks: [[e.both, 'carry'], [e.both & 0x80000000, 'bad']] },
      { label: '<<1', value: e.carry, marks: [[e.carry, 'carry']] },
    ], opts);
  },
  vars(run, e) {
    return [['var.round', chip(e.round, 'hit')], ...(e.s !== null ? [['var.nextAB', chip(`a = ${decOf(e.s, true)}, b = ${decOf(e.carry, true)}`, 'new')]] : [])];
  },
};

/* ---------- Maximum XOR With an Element From Array ---------- */
export const maxXorLimit = {
  view(run, e) {
    const opts = { bits: run.bits, labelChars: 5 };
    if (e.key === 'mxl.ev.sort' || e.key === 'mxl.ev.done') {
      return register(run.sorted.map((v, i) => ({ label: `[${i}]`, value: v })), opts);
    }
    if (e.key === 'mxl.ev.empty') {
      return register([{ label: 'x', value: e.x }, { label: 'm', value: e.m, cls: 'res' }, { label: 'min', value: run.sorted[0], marks: [[ALL, 'bad']] }], opts);
    }
    if (e.key === 'mxl.ev.insert' || e.key === 'mxl.ev.keep') {
      return register([{ label: 'x', value: e.x }, { label: 'm', value: e.m }, ...e.added.map(v => ({ label: '+', value: v, cls: 'act' }))], opts);
    }
    const unknown = e.key === 'mxl.ev.answer' ? 0 : ~e.known;
    const xy = (e.x ^ e.y) & ~unknown;
    const marks = e.k === null ? [[ALL, 'ok']] : [[bit(e.k), e.key === 'mxl.ev.take' ? 'ok' : 'bad']];
    return register([
      { label: 'x', value: e.x },
      { label: 'y', value: e.y, unknown, caption: e.key === 'mxl.ev.answer' ? undefined : '?' },
      { label: 'x ^ y', value: xy, unknown, marks, cls: 'res', caption: e.key === 'mxl.ev.answer' ? undefined : `≥ ${decOf(xy)}` },
    ], { ...opts, cursor: e.k });
  },
  vars(run, e) {
    const out = [['var.answers', chips(run.queries.map(([x, m], j) => chip(`${x}:${m} → ${e.answers[j] ?? '?'}`, j === e.q ? 'new' : e.answers[j] === null ? '' : 'hit')))]];
    if (e.k !== null) {
      const width = e.top - e.k + 1;
      out.push(['var.prefixes', chips(e.prefixes.map(v => chip(bin(v, width), v === e.cand ? 'hit' : 'amb')))]);
    } else out.push(['var.inserted', chips(e.inserted.map(v => chip(v, e.added?.includes(v) ? 'new' : 'amb')))]);
    return out;
  },
};
