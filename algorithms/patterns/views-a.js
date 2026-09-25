/** Views for chapters 01–04. view(run, event) → SVG string, vars(run, event) → [[i18nKey, html]]. */
import { CELL, STEP, svg, text, rowWidth, cells, pointers, chip, chips, barLayout, bars, pointerAt } from './view-kit.js?v=202609252015';

const TOP = 40;
const framed = (n, h, inner) => svg(rowWidth(n) + 20, h, `<g transform="translate(10,0)">${inner}</g>`);
const row = (values, cls, marks, h = 104) =>
  framed(values.length, h, cells(values, cls, { y: TOP }) + pointers(marks, { y: TOP, count: values.length }));
const range = (cls, [from, to], name) => { for (let j = from; j <= to; j++) cls[j] = name; return cls; };

/* ---------- 01 hash map ---------- */
export const twoSum = {
  view(run, e) {
    const cls = run.nums.map((_, j) => (j < e.i ? 'seen' : j === e.i ? 'cur' : ''));
    if (e.found) e.found.forEach(j => { cls[j] = 'ok'; });
    return row(run.nums, cls, [{ i: e.i, label: 'i' }]);
  },
  vars(run, e) {
    const need = e.i >= 0 && e.i < run.nums.length ? [['var.need', chip(run.target - run.nums[e.i])]] : [];
    const map = chips(e.map.map(([k, v]) => chip(`${k} → ${v}`, k !== e.mark ? '' : e.found ? 'hit' : 'new')));
    return [['var.target', chip(run.target)], ...need, ['var.map', map]];
  },
};

export const dup = {
  view(run, e) {
    const cls = run.nums.map((_, j) => (j < e.i ? 'seen' : j === e.i ? 'cur' : ''));
    if (e.hit) e.hit.forEach(j => { cls[j] = 'bad'; });
    return row(run.nums, cls, [{ i: e.i, label: 'i' }]);
  },
  vars(run, e) {
    return [['var.set', chips(e.seen.map(v => chip(v, e.hit && v === run.nums[e.hit[1]] ? 'amb' : '')))]];
  },
};

export const anagram = {
  view(run, e) {
    const keys = e.groups.map(([k]) => k);
    const keyOf = s => [...s].sort().join('');
    const cls = run.strs.map((s, j) => (j <= e.i ? `g${keys.indexOf(keyOf(s)) % 5}${j === e.i ? ' cur' : ''}` : ''));
    let inner = cells(run.strs, cls, { y: TOP, index: false });
    run.strs.forEach((s, j) => { if (j <= e.i) inner += text(j * STEP + CELL / 2, TOP + CELL + 13, keyOf(s), 'idx'); });
    return framed(run.strs.length, 104, inner + pointers([{ i: e.i, label: 'i' }], { y: TOP, count: run.strs.length }));
  },
  vars(run, e) {
    return [['var.groups', chips(e.groups.map(([k, list], g) => chip(`${k}: ${list.join(', ')}`, `g${g % 5}`)))]];
  },
};

export const psum = {
  view(run, e) {
    const cls = run.nums.map((_, j) => (j < e.i ? 'seen' : ''));
    e.ranges.forEach(r => range(cls, r, 'win'));
    if (e.i >= 0 && e.i < run.nums.length) cls[e.i] = e.ranges.length ? 'ok' : 'cur';
    return row(run.nums, cls, [{ i: e.i, label: 'i' }]);
  },
  vars(run, e) {
    return [['var.target', chip(run.k)], ['var.sum', chip(e.sum)], ['var.count', chip(e.count, 'hit')],
      ['var.prefix', chips(e.map.map(([p, n]) => chip(`${p} ×${n}`)))]];
  },
};

/* ---------- 02 two pointers ---------- */
export const moveZeroes = {
  view(run, e) {
    const cls = e.a.map((_, j) => (j < e.write ? 'ok' : ''));
    if (e.read >= 0 && e.read < e.a.length) cls[e.read] = e.key === 'twoptr.ev.zero' ? 'bad' : 'cur';
    return row(e.a, cls, [{ i: e.write, label: 'write' }, { i: e.read, label: 'read', cls: 'p2' }]);
  },
  vars(run, e) {
    return [['var.write', chip(e.write)], ['var.result', chips(e.a.map((v, j) => chip(v, j < e.write ? 'hit' : '')))]];
  },
};

export const container = {
  view(run, e) {
    const h = run.h, lay = barLayout(h, { unit: 15 });
    let s = '';
    if (e.l < e.r) {
      const wh = Math.min(h[e.l], h[e.r]) * lay.unit;
      s += `<rect class="water" x="${lay.mid(e.l)}" y="${lay.base - wh}" width="${lay.mid(e.r) - lay.mid(e.l)}" height="${wh}"/>`;
    }
    s += bars(h, lay, h.map((_, i) => (i === e.l ? 'l' : i === e.r ? 'r' : i < e.l || i > e.r ? 'dim' : '')));
    if (e.bestLR) {
      const [bl, br] = e.bestLR, bh = Math.min(h[bl], h[br]) * lay.unit;
      s += `<rect class="best" x="${lay.mid(bl)}" y="${lay.base - bh}" width="${lay.mid(br) - lay.mid(bl)}" height="${bh}"/>`;
    }
    s += e.l === e.r ? pointerAt(lay.mid(e.l), 36, 'L R') : pointerAt(lay.mid(e.l), 36, 'L') + pointerAt(lay.mid(e.r), 36, 'R', 'p2');
    return svg(lay.width, lay.height, s);
  },
  vars(run, e) {
    return [['var.best', chip(e.best, 'hit')]];
  },
};

export const threeSum = {
  view(run, e) {
    const cls = e.a.map(() => '');
    if (e.i != null) cls[e.i] = 'src';
    const found = e.key === 'tsum.ev.found';
    if (e.l != null) { cls[e.l] = found ? 'ok' : 'cur'; cls[e.r] = found ? 'ok' : 'cur'; }
    if (found) cls[e.i] = 'ok';
    return row(e.a, cls, [{ i: e.i, label: 'i', cls: 'p3' }, { i: e.l, label: 'L' }, { i: e.r, label: 'R', cls: 'p2' }]);
  },
  vars(run, e) {
    return [['var.triples', chips(e.triples.map(t => chip(`[${t.join(', ')}]`, 'hit')))]];
  },
};

export const trap = {
  view(run, e) {
    const h = run.h, lay = barLayout(h.map((v, i) => v + e.water[i]), { unit: 18 });
    let s = h.map((v, i) => (e.water[i] ? `<rect class="water-b" x="${lay.x(i)}" y="${lay.base - (v + e.water[i]) * lay.unit}" width="${lay.bw}" height="${e.water[i] * lay.unit}"/>` : '')).join('');
    s += bars(h, lay, h.map((_, i) => (i === e.at ? 'l' : i < e.l || i > e.r ? 'done' : '')));
    s += e.l === e.r ? pointerAt(lay.mid(e.l), 36, 'L R') : pointerAt(lay.mid(e.l), 36, 'L') + pointerAt(lay.mid(e.r), 36, 'R', 'p2');
    return svg(lay.width, lay.height, s);
  },
  vars(run, e) {
    return [['var.lmax', chip(e.lmax)], ['var.rmax', chip(e.rmax)], ['var.water', chip(e.total, 'hit')]];
  },
};

/* ---------- 03 sliding window ---------- */
export const maxAvg = {
  view(run, e) {
    const cls = range(run.nums.map(() => ''), [e.l, e.r], e.key === 'avg.ev.done' ? 'ok' : 'win');
    return row(run.nums, cls, [{ i: e.l, label: 'L' }, { i: e.r, label: 'R', cls: 'p2' }]);
  },
  vars(run, e) {
    return [['var.sum', chip(e.sum)], ['var.best', chip(e.best, 'hit')]];
  },
};

export const longest = {
  view(run, e) {
    const s = [...run.s];
    const cls = s.map((_, i) => (i < e.l ? 'dim' : i <= e.wr ? 'win' : ''));
    if (e.r != null) cls[e.r] = e.rCls;
    if (e.dup != null) cls[e.dup] = 'bad';
    return row(s, cls, [{ i: e.l, label: 'L' }, { i: e.r, label: 'R', cls: 'p2' }]);
  },
  vars(run, e) {
    return [['var.window', chips(e.set.map(c => chip(c)))], ['var.best', chip(e.best, 'hit')]];
  },
};

export const minLen = {
  view(run, e) {
    const cls = run.nums.map((_, j) => (j < e.l ? 'dim' : ''));
    if (e.r != null && e.l <= e.r) range(cls, [e.l, e.r], 'win');
    if (e.key === 'minw.ev.done' && e.bestLR) range(cls, e.bestLR, 'ok');
    return row(run.nums, cls, [{ i: e.l, label: 'L' }, { i: e.r, label: 'R', cls: 'p2' }]);
  },
  vars(run, e) {
    return [['var.target', chip(run.target)], ['var.sum', chip(e.sum)], ['var.best', chip(e.best || '—', 'hit')]];
  },
};

export const minWindow = {
  view(run, e) {
    const s = [...run.s], need = new Set(run.t);
    const cls = s.map((c, j) => (j < e.l ? 'dim' : ''));
    if (e.r != null && e.l <= e.r) range(cls, [e.l, e.r], 'win');
    if (e.r == null && e.best) range(cls, e.best, 'ok');
    let inner = cells(s, cls, { y: TOP, index: false });
    s.forEach((c, j) => { if (need.has(c)) inner += text(j * STEP + CELL / 2, TOP + CELL + 13, '•', 'idx need'); });
    return framed(s.length, 104, inner + pointers([{ i: e.l, label: 'L' }, { i: e.r, label: 'R', cls: 'p2' }], { y: TOP, count: s.length }));
  },
  vars(run, e) {
    const best = e.best ? run.s.slice(e.best[0], e.best[1] + 1) : '—';
    return [['var.need2', chips(e.counts.map(([c, have, n]) => chip(`${c} ${have}/${n}`, have >= n ? 'hit' : '')))], ['var.best', chip(best, 'hit')]];
  },
};

/* ---------- 04 binary search ---------- */
export const bsearch = {
  view(run, e) {
    const cls = run.a.map((_, i) => (i < e.lo || i > e.hi ? 'dim' : ''));
    if (e.mid != null) cls[e.mid] = e.found ? 'ok' : 'cur';
    return row(run.a, cls, [{ i: e.lo, label: 'lo' }, { i: e.mid, label: 'mid', cls: 'p2' }, { i: e.hi, label: 'hi' }]);
  },
  vars(run, e) {
    return [['var.candidates', chip(Math.max(0, e.hi - e.lo + 1))], ['var.steps', chip(e.step)]];
  },
};

export const rotated = {
  view(run, e) {
    const cls = run.a.map((_, i) => (i < e.lo || i > e.hi ? 'dim' : ''));
    if (e.sorted) range(cls, e.sorted, 'win');
    if (e.mid != null) cls[e.mid] = e.found ? 'ok' : 'cur';
    return row(run.a, cls, [{ i: e.lo, label: 'lo' }, { i: e.mid, label: 'mid', cls: 'p2' }, { i: e.hi, label: 'hi' }]);
  },
  vars(run) {
    return [['var.target', chip(run.target)]];
  },
};

export const koko = {
  view(run, e) {
    const speeds = Array.from({ length: Math.max(...run.piles) }, (_, i) => i + 1);
    const verdict = new Map(e.probed);
    const cls = speeds.map(k => (verdict.has(k) ? (verdict.get(k) ? 'ok' : 'bad') : k < e.lo || k > e.hi ? 'dim' : ''));
    if (e.k != null) cls[e.k - 1] = e.key === 'koko.ev.done' ? 'ok' : `${cls[e.k - 1]} cur`;
    const marks = [{ i: e.lo - 1, label: 'lo' }, { i: e.k == null ? null : e.k - 1, label: 'k', cls: 'p2' }, { i: e.hi - 1, label: 'hi' }];
    return framed(speeds.length, 104, cells(speeds, cls, { y: TOP, index: false }) + pointers(marks, { y: TOP, count: speeds.length }));
  },
  vars(run, e) {
    const [, per = [], hours] = e.key === 'koko.ev.probe' ? e.args : [];
    return [['var.piles', chips(run.piles.map((p, i) => chip(per.length ? `${p}→${per[i]}h` : p)))], ...(hours != null ? [['var.hours', chip(`${hours} / ${run.h}`)]] : [])];
  },
};

export const median = {
  view(run, e) {
    const { a, b } = run, x0 = 30, yA = TOP, yB = TOP + CELL + 44;
    const mark = (list, cut, left, right) => list.map((_, j) => (j < cut ? 'win' : '')).map((c, j) => {
      if (e.verdict == null) return '';
      if (j === cut - 1) return left;
      if (j === cut) return right;
      return c;
    });
    const tone = side => (e.verdict === 'ok' ? 'ok' : e.verdict === side ? 'bad' : 'win');
    const clsA = e.i == null ? a.map(() => '') : mark(a, e.i, tone('left'), tone('right'));
    const clsB = e.j == null ? b.map(() => '') : mark(b, e.j, tone('right'), tone('left'));
    const cut = (idx, y) => (idx == null ? '' : `<line class="cutline" x1="${x0 + idx * STEP - 3}" y1="${y - 12}" x2="${x0 + idx * STEP - 3}" y2="${y + CELL + 6}"/>`);
    const s = text(6, yA + CELL / 2, 'A', 'lbl') + cells(a, clsA, { x: x0, y: yA }) + cut(e.i, yA)
      + text(6, yB + CELL / 2, 'B', 'lbl') + cells(b, clsB, { x: x0, y: yB }) + cut(e.j, yB);
    return svg(x0 + rowWidth(Math.max(a.length, b.length)) + 12, yB + CELL + 24, s);
  },
  vars(run, e) {
    return e.i == null ? [] : [['var.cut', chip(`i = ${e.i}, j = ${e.j}`)]];
  },
};
