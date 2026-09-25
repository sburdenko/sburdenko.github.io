/** Views for the array-shaped rigs. view(run, event) → SVG string, vars(run, event) → [[i18nKey, html]]. */
import { CELL, svg, text, rowWidth, cells, pointers, arcBelow, chip, chips } from './view-kit.js?v=202609241230';

const TOP = 40;
const framed = (n, h, inner) => svg(rowWidth(n) + 20, h, `<g transform="translate(10,0)">${inner}</g>`);

export const hash = {
  view(run, e) {
    const cls = run.nums.map((_, j) => (j < e.i ? 'seen' : j === e.i ? 'cur' : ''));
    if (e.found) e.found.forEach(j => { cls[j] = 'ok'; });
    return framed(run.nums.length, 104, cells(run.nums, cls, { y: TOP }) + pointers([{ i: e.i, label: 'i' }], { y: TOP, count: run.nums.length }));
  },
  vars(run, e) {
    const inRange = e.i >= 0 && e.i < run.nums.length;
    const mapHtml = chips(e.map.map(([k, v]) => chip(`${k} → ${v}`, k !== e.mark ? '' : e.found ? 'hit' : 'new')));
    return [['var.target', chip(run.target)], ...(inRange ? [['var.need', chip(run.target - run.nums[e.i])]] : []), ['var.map', mapHtml]];
  },
};

export const twoptr = {
  view(run, e) {
    const cls = e.a.map((_, j) => (j < e.write ? 'ok' : ''));
    if (e.read >= 0 && e.read < e.a.length) cls[e.read] = e.key === 'twoptr.ev.zero' ? 'bad' : 'cur';
    const marks = [{ i: e.write, label: 'write' }, { i: e.read, label: 'read', cls: 'p2' }];
    return framed(e.a.length, 104, cells(e.a, cls, { y: TOP }) + pointers(marks, { y: TOP, count: e.a.length }));
  },
  vars(run, e) {
    return [['var.write', chip(e.write)], ['var.result', chips(e.a.map((v, j) => chip(v, j < e.write ? 'hit' : '')))]];
  },
};

export const slidingWindow = {
  view(run, e) {
    const s = [...run.s];
    const cls = s.map((_, i) => (i < e.l ? 'dim' : i <= e.wr ? 'win' : ''));
    if (e.r != null) cls[e.r] = e.rCls;
    if (e.dup != null) cls[e.dup] = 'bad';
    const marks = [{ i: e.l, label: 'L' }, { i: e.r, label: 'R', cls: 'p2' }];
    return framed(s.length, 104, cells(s, cls, { y: TOP }) + pointers(marks, { y: TOP, count: s.length }));
  },
  vars(run, e) {
    return [['var.window', chips(e.set.map(c => chip(c)))], ['var.best', chip(e.best)]];
  },
};

export const binary = {
  view(run, e) {
    const cls = run.a.map((_, i) => (i < e.lo || i > e.hi ? 'dim' : ''));
    if (e.mid != null) cls[e.mid] = e.found ? 'ok' : 'cur';
    const marks = [{ i: e.lo, label: 'lo' }, { i: e.mid, label: 'mid', cls: 'p2' }, { i: e.hi, label: 'hi' }];
    return framed(run.a.length, 104, cells(run.a, cls, { y: TOP }) + pointers(marks, { y: TOP, count: run.a.length }));
  },
  vars(run, e) {
    return [['var.candidates', chip(Math.max(0, e.hi - e.lo + 1))], ['var.steps', chip(e.step)]];
  },
};

export const greedy = {
  view(run, e) {
    const n = run.a.length, arcY = TOP + CELL + 22;
    const cls = run.a.map((_, j) => (j === e.i ? (e.stuck ? 'bad' : 'cur') : j <= e.reach ? 'win' : ''));
    if (e.done) cls[n - 1] = 'ok';
    const marks = [{ i: e.i, label: 'i' }, { i: Math.min(e.reach, n - 1), label: 'reach', cls: 'p2' }];
    const jump = e.i != null && !e.stuck && run.a[e.i] > 0
      ? arcBelow(e.i, Math.min(e.i + run.a[e.i], n - 1), arcY, 16 + run.a[e.i] * 4, '', `+${run.a[e.i]}`) : '';
    return framed(n, 160, cells(run.a, cls, { y: TOP }) + pointers(marks, { y: TOP, count: n }) + jump);
  },
  vars(run, e) {
    return [['var.reach', chip(e.reach)]];
  },
};

export const dp = {
  view(run, e) {
    const arcY = TOP + CELL + 22;
    const sources = new Set(e.opts.map(o => e.i - o.c));
    const cls = e.dp.map((v, j) => (j === e.i ? 'cur' : sources.has(j) ? 'src' : v === null ? 'dim' : ''));
    let inner = cells(e.dp.map(v => (v === null ? '∞' : v)), cls, { y: TOP });
    if (e.i != null) {
      inner += e.opts.map(o => arcBelow(e.i - o.c, e.i, arcY, 10 + o.c * 6, o.c === e.pick ? 'pick' : '', `+${o.c}`)).join('');
      inner += pointers([{ i: e.i, label: `dp[${e.i}]` }], { y: TOP, count: e.dp.length });
    }
    return framed(e.dp.length, 190, inner);
  },
  vars(run, e) {
    const out = [['var.coins', chips(run.coins.map(c => chip(c)))]];
    if (e.key === 'dp.ev.done') {
      const [, , parts, greedyParts] = e.args;
      out.push(['var.dp', chip(parts.join(' + ') || '—', 'hit')], ['var.greedy', chip(greedyParts ? greedyParts.join(' + ') : '—', 'amb')]);
    }
    return out;
  },
};
