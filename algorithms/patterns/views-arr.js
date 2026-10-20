/** Views for the problems in model-arr.js. view(run, event) → SVG string, vars(run, event) → [[i18nKey, html]]. */
import {
  CELL, STEP, svg, text, rowWidth, cells, pointers, arcBelow, arrow, chip, chips,
  matrixXY, matrixCells, matrixIndex, matrixArrow,
} from './view-kit.js?v=202610201333';

const TOP = 40;
/** A dashed frame around cells i..j of a row drawn at (x, y). */
const frame = (i, j, x, y, cls) => (j < i ? '' : `<rect class="${cls}" x="${x + i * STEP - 4}" y="${y - 4}" width="${(j - i) * STEP + CELL + 8}" height="${CELL + 8}" rx="8"/>`);

/* ---------- Maximum Subarray: Kadane ---------- */
const sumText = terms => terms.map((v, k) => (k ? `${v < 0 ? '−' : '+'} ${Math.abs(v)}` : String(v).replace('-', '−'))).join(' ');
export const kadane = {
  view(run, e) {
    const n = run.nums.length, x = 52, y2 = TOP + CELL + 44, arcY = y2 + CELL + 18, done = e.i == null;
    const inRun = j => !done && j >= e.from && j <= e.i;
    const clsN = run.nums.map((_, j) => (j === e.i ? 'cur' : inRun(j) ? 'win' : ''));
    const clsC = e.ending.map((v, j) => (v === null ? 'dim' : j === e.i ? (e.key === 'kad.ev.best' ? 'ok' : 'cur') : j === e.bestRange[1] ? 'ok' : ''));
    let s = text(4, TOP + CELL / 2, 'nums', 'lbl') + cells(run.nums, clsN, { x, y: TOP })
      + frame(e.bestRange[0], e.bestRange[1], x, TOP, 'best')
      + pointers([{ i: e.i, label: 'i' }], { x, y: TOP, count: n })
      + text(4, y2 + CELL / 2, 'cur', 'lbl') + cells(e.ending.map(v => (v === null ? '·' : v)), clsC, { x, y: y2, index: false });
    if (e.key === 'kad.ev.extend') s += arcBelow(e.i - 1, e.i, arcY, 12, 'pick', `+${run.nums[e.i]}`, x);
    if (e.key === 'kad.ev.restart') {
      const cut = x + e.i * STEP - 3;
      s += `<line class="cutline" x1="${cut}" y1="${TOP - 6}" x2="${cut}" y2="${y2 + CELL + 6}"/>`;
    }
    return svg(x + rowWidth(n) + 10, arcY + 44, s);
  },
  vars(run, e) {
    const [a, b] = e.bestRange;
    return [
      ['var.curSum', chip(e.cur, e.i != null ? 'new' : '')],
      ['var.best', chip(e.best, 'hit')],
      ['var.bestRange', chip(`[${a}..${b}] = ${sumText(run.nums.slice(a, b + 1))}`, 'hit')],
    ];
  },
};

/* ---------- Insert Interval ---------- */
const IV_UNIT = 28, IV_X = 46, IV_H = 22;
const span = (a, b, y, cls, label = true) => `<rect class="span ${cls}" x="${IV_X + a * IV_UNIT}" y="${y}" width="${Math.max(4, (b - a) * IV_UNIT)}" height="${IV_H}" rx="4"/>`
  + (label ? text(IV_X + (a + b) * IV_UNIT / 2, y + IV_H / 2, `${a}–${b}`, 'span-t') : '');

export const insertIv = {
  view(run, e) {
    const max = Math.max(1, run.newInterval[1], ...run.intervals.map(iv => iv[1]));
    const yNew = 22, yIn = yNew + 36, yRes = yIn + 46, bottom = yRes + IV_H + 8;
    let s = '';
    for (let t = 0; t <= max; t++) s += `<line class="tick" x1="${IV_X + t * IV_UNIT}" y1="14" x2="${IV_X + t * IV_UNIT}" y2="${bottom}"/>` + text(IV_X + t * IV_UNIT, 7, t, 'idx');
    s += text(4, yNew + IV_H / 2, 'new', 'lbl') + text(4, yIn + IV_H / 2, 'in', 'lbl') + text(4, yRes + IV_H / 2, 'res', 'lbl');
    const [n0, n1] = run.newInterval, grown = e.s !== n0 || e.e !== n1;
    if (grown) s += span(n0, n1, yNew, 'ghost', false);
    if (e.phase !== 'done' && e.placed === null) s += span(e.s, e.e, yNew, `merged${e.phase === 'absorb' && e.i != null ? ' curi' : ''}`);
    run.intervals.forEach(([a, b], k) => {
      const st = e.status[k], cls = `${st === 'absorb' ? 'absorbed' : st ? 'keep' : ''}${k === e.i ? ' curi' : ''}`;
      s += span(a, b, yIn, cls);
    });
    e.res.forEach(([a, b], k) => { s += span(a, b, yRes, `merged${k === e.placed && e.key === 'ins.ev.place' ? ' curi' : ''}`); });
    if (e.placed === null && e.phase !== 'done') {
      for (const v of new Set([e.s, e.e])) s += `<line class="cutline" x1="${IV_X + v * IV_UNIT}" y1="${yNew - 4}" x2="${IV_X + v * IV_UNIT}" y2="${yIn + IV_H + 6}"/>`;
    }
    return svg(IV_X + max * IV_UNIT + 20, bottom + 6, s);
  },
  vars(run, e) {
    const phases = [['left', 'end < s'], ['absorb', 'start ≤ e'], ['right', 'start > e']];
    const at = e.phase === 'place' ? 2 : e.phase === 'done' ? 3 : phases.findIndex(([p]) => p === e.phase);
    return [
      ['var.ivPhase', chips(phases.map(([p, label], k) => chip(label, p === e.phase && e.key !== 'ins.ev.start' ? 'new' : k < at || e.phase === 'done' ? 'done' : '')))],
      ['var.se', chip(`[${e.s}, ${e.e}]`, e.placed === null ? 'amb' : 'hit')],
      ['var.insResult', chips(e.res.map(([a, b], k) => chip(`[${a}, ${b}]`, k === e.placed ? 'hit' : '')))],
    ];
  },
};

/* ---------- Sort Colors ---------- */
export const sortColors = {
  view(run, e) {
    const n = e.a.length, x = 10, bandY = TOP + CELL + 22, arcY = bandY + 26, done = e.key === 'sc.ev.done';
    const cls = e.a.map((v, j) => `col${v}${j === e.mid && !done ? ' mid' : ''}${e.swap && e.swap.includes(j) ? ' swapped' : ''}`);
    let s = cells(e.a, cls, { x, y: TOP });
    const zones = [[0, e.lo - 1, 'z0', '0'], [e.lo, e.mid - 1, 'z1', '1'], [e.mid, e.hi, 'zq', '?'], [e.hi + 1, n - 1, 'z2', '2']];
    for (const [i, j, c, label] of zones) {
      if (j < i) continue;
      s += `<rect class="zone ${c}" x="${x + i * STEP}" y="${bandY}" width="${(j - i) * STEP + CELL}" height="16" rx="3"/>`
        + text(x + (i * STEP + (j * STEP + CELL)) / 2, bandY + 8.5, label, `zone-t ${c}`);
    }
    if (e.swap) s += arcBelow(e.swap[0], e.swap[1], arcY, 10 + (e.swap[1] - e.swap[0]) * 4, 'pick', '⇄', x);
    const marks = done ? [] : [{ i: e.lo, label: 'lo', cls: 'p2' }, { i: e.mid, label: 'mid' }, { i: e.hi, label: 'hi', cls: 'p3' }];
    s += pointers(marks.filter(p => p.i < n), { x, y: TOP, count: n });
    if (!done && e.hi < e.mid && e.mid < n) s += text(x + e.mid * STEP + CELL / 2, TOP - 38, 'mid > hi', 'idx need');
    return svg(x + rowWidth(n) + 10, arcY + 52, s);
  },
  vars(run, e) {
    const n = e.a.length;
    return [
      ['var.loMidHi', chip(`${e.lo} / ${e.mid} / ${e.hi}`, 'new')],
      ['var.zones', chips([
        chip(`0 × ${e.lo}`, 'g1'), chip(`1 × ${Math.max(0, e.mid - e.lo)}`),
        chip(`? × ${Math.max(0, e.hi - e.mid + 1)}`, 'amb'), chip(`2 × ${n - 1 - e.hi}`, 'g0'),
      ])],
      ['var.looks', chip(e.looks)],
    ];
  },
};

/* ---------- LIS: tails and lower_bound ---------- */
export const lisTails = {
  view(run, e) {
    const n = run.nums.length, x = 56, y2 = TOP + CELL + 84, slots = Math.max(1, run.length);
    const inTails = new Set(e.tailIdx);
    const clsN = run.nums.map((_, j) => (j === e.i ? 'cur' : inTails.has(j) ? 'ok' : e.i != null && j > e.i ? 'dim' : e.i == null && !inTails.has(j) ? '' : 'seen'));
    const probes = new Set(e.probes);
    const shown = Array.from({ length: slots }, (_, k) => (k < e.tails.length ? e.tails[k] : '·'));
    const clsT = shown.map((_, k) => (k === e.pos ? (e.key === 'lt.ev.append' ? 'new' : e.key === 'lt.ev.equal' ? 'win' : 'cur')
      : probes.has(k) ? 'src' : k >= e.tails.length ? 'dim' : ''));
    let s = text(4, TOP + CELL / 2, 'nums', 'lbl') + cells(run.nums, clsN, { x, y: TOP })
      + pointers([{ i: e.i, label: 'x' }], { x, y: TOP, count: n })
      + text(4, y2 + CELL / 2, 'tails', 'lbl') + cells(shown, clsT.map(c => (c === 'new' ? 'ok' : c)), { x, y: y2 });
    if (e.i != null && e.pos != null) {
      s += arrow(x + e.i * STEP + CELL / 2, TOP + CELL + 16, x + e.pos * STEP + CELL / 2, y2 - 30, 2, 'edge on');
      s += pointers([{ i: e.pos, label: 'pos', cls: 'p3' }], { x, y: y2, count: slots });
    }
    return svg(x + rowWidth(Math.max(n, slots)) + 10, y2 + CELL + 22, s);
  },
  vars(run, e) {
    const out = [['var.lisLen', chip(e.tails.length, 'hit')]];
    if (e.key === 'lt.ev.done') out.push(['var.oneLis', chips(e.args[2].map(v => chip(v, 'hit')))]);
    else if (e.i != null) {
      const x = run.nums[e.i];
      out.push(['var.probes', chips(e.probes.map((m, q) => chip(`tails[${m}] = ${e.compared[q]} ${e.compared[q] < x ? '<' : '≥'} ${x}`, e.compared[q] < x ? '' : 'amb')))]);
    }
    return out;
  },
};

/* ---------- Unique Paths ---------- */
export const uniquePaths = {
  view(run, e) {
    const { m, n } = run, at = { x: 30, y: 26 }, rowMode = run.mode === 'row', done = e.key === 'up.ev.done';
    const [cr, cc] = e.cur || [-1, -1];
    const clsOf = (v, r, c) => {
      if (r === cr && c === cc) return 'cur';
      if ((r === cr - 1 && c === cc) || (r === cr && c === cc - 1)) return 'src';
      if (done && r === m - 1 && c === n - 1) return 'ok';
      if (v === null) return 'dim';
      if (e.key === 'up.ev.base' && (r === 0 || c === 0)) return 'win';
      if (rowMode && e.r != null && r < e.r - 1 && !done) return 'seen';
      return '';
    };
    let inner = matrixIndex(m, n, at) + matrixCells(e.table, clsOf, { ...at, labelOf: v => (v === null ? '' : v) });
    if (e.cur) {
      if (cr > 0) inner += matrixArrow([cr - 1, cc], [cr, cc], 'edge on', at);
      if (cc > 0) inner += matrixArrow([cr, cc - 1], [cr, cc], 'edge on', at);
    }
    let h = at.y + rowWidth(m) + 12;
    if (rowMode) {
      const y = h + 26;
      const clsR = e.row.map((_, c) => (c === cc ? 'cur' : c === cc - 1 ? 'src' : e.cur && c < cc ? 'win' : ''));
      inner += text(at.x - 26, y - 14, 'row[]', 'lbl') + cells(e.row, clsR, { x: at.x, y });
      if (e.cur) inner += arcBelow(cc - 1, cc, y + CELL + 16, 10, 'pick', '+=', at.x);
      h = y + CELL + 48;
    }
    const [, lastY] = matrixXY(m - 1, n - 1, at);
    return svg(at.x + rowWidth(n) + 12, Math.max(h, lastY + CELL + 12), inner);
  },
  vars(run, e) {
    const out = [['var.pathsMode', chip(run.mode === 'row' ? 'row[c] += row[c − 1]' : 'dp[r][c] = up + left', 'new')]];
    out.push(['var.memory', chip(run.mode === 'row' ? `${run.n}` : `${run.m} × ${run.n}`)]);
    return out;
  },
};

/* ---------- Coin Change II against Combination Sum IV ---------- */
export const coinOrder = {
  view(run, e) {
    const { coins, amount } = run, cols = amount + 1, x = 58, y0 = 30, coinsOuter = run.order === 'coins-outer';
    const yDp = y0 + coins.length * STEP + 24, arcY = yDp + CELL + 18;
    let s = '';
    for (let c = 0; c < cols; c++) s += text(x + c * STEP + CELL / 2, y0 - 12, c, 'idx');
    coins.forEach((coin, k) => {
      const y = y0 + k * STEP;
      const cls = e.table[k].map((v, c) => {
        if (k === e.k && c === e.s) return v ? 'cur' : 'bad';
        const active = coinsOuter ? k === e.k : c === e.s;
        if (v === null) return active ? 'win dim' : 'dim';
        return active ? 'win' : '';
      });
      s += text(x - 10, y + CELL / 2, `c=${coin}`, 'lbl-c corner') + cells(e.table[k].map(v => (v === null ? '' : v)), cls, { x, y, index: false });
    });
    const clsD = e.dp.map((_, c) => (c === e.s && e.k != null ? 'cur' : e.k != null && e.s != null && c === e.s - coins[e.k] ? 'src' : ''));
    s += text(x - 10, yDp + CELL / 2, 'dp', 'lbl-c corner') + cells(e.dp, clsD, { x, y: yDp, index: false });
    if (e.k != null && e.s != null) {
      const c = coins[e.k];
      s += arcBelow(e.s - c, e.s, arcY, 8 + c * 5, e.dp[e.s - c] ? 'pick' : '', `+${c}`, x);
    }
    return svg(x + rowWidth(cols) + 10, arcY + 34 + Math.max(...coins) * 5, s);
  },
  vars(run, e) {
    const out = [['var.loopOrder', chip(run.order === 'coins-outer' ? 'foreach c { for s }' : 'for s { foreach c }', 'new')]];
    if (e.key === 'co.ev.add' || e.key === 'co.ev.zero') {
      out.push(['var.waysAdded', chips([...e.added.map(w => chip(w, 'hit')), ...(e.more ? [chip(`+${e.more}`)] : [])])]);
    }
    if (e.key === 'co.ev.done') out.push(['var.waysAll', chips([...e.args[4].map(w => chip(w, 'hit')), ...(e.args[1] > e.args[4].length ? [chip(`+${e.args[1] - e.args[4].length}`)] : [])])]);
    return out;
  },
};

/* ---------- Meeting Rooms II: the sweep ---------- */
const MR_UNIT = 26, MR_X = 40, MR_H = 18, MR_ROW = 24;

export const meetingRooms = {
  view(run, e) {
    const list = run.intervals, n = list.length, max = Math.max(1, ...list.map(iv => iv[1]));
    const order = list.map((_, k) => k).sort((p, q) => list[p][0] - list[q][0] || p - q);
    const yM = 22, yR = yM + n * MR_ROW + 26, lanes = Math.max(1, run.rooms), bottom = yR + lanes * MR_ROW;
    let s = '';
    for (let t = 0; t <= max; t++) s += `<line class="tick" x1="${MR_X + t * MR_UNIT}" y1="14" x2="${MR_X + t * MR_UNIT}" y2="${bottom}"/>` + text(MR_X + t * MR_UNIT, 7, t, 'idx');
    const bar = (k, y, cls) => {
      const [a, b] = list[k];
      return `<rect class="span ${cls}" x="${MR_X + a * MR_UNIT}" y="${y}" width="${(b - a) * MR_UNIT}" height="${MR_H}" rx="4"/>`
        + text(MR_X + (a + b) * MR_UNIT / 2, y + MR_H / 2, `${a}–${b}`, 'span-t');
    };
    order.forEach((k, row) => {
      const st = e.state[k], cls = `${st === 'open' ? 'keep' : st === 'done' ? 'past' : ''}${k === e.k ? ' curi' : ''}`;
      s += bar(k, yM + row * MR_ROW, cls);
    });
    s += text(4, yR - 12, 'rooms', 'lbl');
    for (let r = 0; r < lanes; r++) s += text(MR_X - 10, yR + r * MR_ROW + MR_H / 2, `R${r + 1}`, 'lbl-c corner');
    list.forEach((_, k) => {
      if (e.room[k] == null) return;
      s += bar(k, yR + e.room[k] * MR_ROW, `${e.state[k] === 'open' ? 'merged' : 'past'}${k === e.k ? ' curi' : ''}`);
    });
    if (e.t != null) {
      const lx = MR_X + e.t * MR_UNIT;
      s += `<line class="cutline" x1="${lx}" y1="12" x2="${lx}" y2="${bottom + 4}"/>`;
    }
    return svg(MR_X + max * MR_UNIT + 24, bottom + 8, s);
  },
  vars(run, e) {
    const sweep = run.sweep.map(({ t, d }, j) => chip(`${t}${d > 0 ? '+' : '−'}`, j === e.j ? (d > 0 ? 'new' : 'amb') : e.j != null && j < e.j ? 'done' : e.key === 'mr.ev.done' ? 'done' : ''));
    return [['var.sweep', chips(sweep)], ['var.roomsPeak', chip(`${e.rooms} · ${e.peak}`, 'hit')]];
  },
};
