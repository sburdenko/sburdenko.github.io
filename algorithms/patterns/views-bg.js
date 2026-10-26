/** Views for the problems in model-bg.js. view(run, event) → SVG string, vars(run, event) → [[i18nKey, html]]. */
import {
  svg, text, node, chip, chips, register, hexOf, decOf, rowWidth,
  matrixCells, matrixIndex, matrixBox, matrixXY, CELL,
} from './view-kit.js?v=202610262021';

const ALL = -1;
const bit = i => (2 ** i) >>> 0;

/* ---------- Reverse Bits ---------- */
export const reverseBits = {
  view(run, e) {
    const opts = { bits: 32, labelChars: 6 };
    if (e.mode === 'masks') {
      if (e.width === null) {
        if (e.key === 'rb.ev.masks') return register([{ label: 'n', value: e.n }], opts);
        return register([{ label: 'n₀', value: run.n }, { label: 'n', value: e.n, marks: [[e.n, 'ok']], cls: 'res' }], opts);
      }
      const w = e.width, hiOut = e.hi >>> w, loOut = (e.lo << w) >>> 0;
      return register([
        { label: 'n', value: e.before, marks: [[e.hi, 'carry'], [e.lo, 'low']] },
        { label: `hi>>${w}`, value: (e.before & e.hi) >>> w, marks: [[hiOut, 'carry']] },
        { label: `lo<<${w}`, value: ((e.before & e.lo) << w) >>> 0, marks: [[loOut, 'low']] },
        { label: '→ n', value: e.n, marks: [[hiOut, 'carry'], [loOut, 'low']], cls: 'res' },
      ], opts);
    }
    if (e.key === 'rb.ev.start') return register([{ label: 'n', value: e.n, marks: [[1, 'low']] }, { label: 'r', value: 0 }], opts);
    if (e.key === 'rb.ev.done') return register([{ label: 'n₀', value: run.n }, { label: 'r', value: e.r, marks: [[e.r, 'ok']], cls: 'res' }], opts);
    return register([
      { label: 'n', value: e.before, marks: [[1, 'low']] },
      { label: 'r', value: e.r, marks: [[1, 'ok']], cls: 'res' },
    ], opts);
  },
  vars(run, e) {
    if (e.mode === 'masks') {
      const out = [['var.rbStep', chip(`${e.step} / 5`, 'hit')]];
      if (e.width !== null) out.push(['var.rbMasks', chips([chip(hexOf(e.hi), 'new'), chip(hexOf(e.lo), 'amb')])]);
      return out;
    }
    const out = [['var.rbRound', chip(`${e.i} / 32`, 'hit')]];
    if (e.bit !== null) out.push(['var.rbLands', chip(`n₀[${e.i - 1}] → r[${32 - e.i}]`, 'new')]);
    return out;
  },
};

/* ---------- Divide Two Integers ---------- */
export const divideBits = {
  view(run, e) {
    const wide = { bits: run.bitsSigned, labelChars: 5 }, opts = { bits: run.bits, labelChars: 5 };
    if (e.key === 'div.ev.start') {
      return register([{ label: 'a', value: run.dividend, signed: true }, { label: 'b', value: run.divisor, signed: true }], wide);
    }
    if (e.key === 'div.ev.overflow') {
      return register([
        { label: 'a', value: run.dividend, signed: true },
        { label: 'b', value: run.divisor, signed: true },
        { label: '2^31', value: 0x80000000, signed: false, marks: [[0x80000000, 'bad']] },
        { label: '→', value: e.args[2], signed: true, cls: 'res', marks: [[ALL, 'ok']] },
      ], wide);
    }
    if (e.key === 'div.ev.signPos' || e.key === 'div.ev.signNeg') {
      const sign = [[0x80000000, 'carry']];
      return register([
        { label: 'a', value: run.dividend, signed: true, marks: run.dividend < 0 ? sign : [] },
        { label: 'b', value: run.divisor, signed: true, marks: run.divisor < 0 ? sign : [] },
        { label: '|a|', value: e.a, signed: false, cls: 'act' },
        { label: '|b|', value: e.b, signed: false, cls: 'act' },
      ], wide);
    }
    if (e.key === 'div.ev.done') {
      return register([
        { label: 'q', value: e.args[5], signed: false },
        { label: 'rem', value: e.a, signed: false },
        { label: '→', value: e.args[2], signed: true, cls: 'res', marks: [[ALL, 'ok']] },
      ], e.args[2] < 0 ? wide : opts);
    }
    const k = e.k, undecided = k > 0 ? bit(k) - 1 : 0;
    const q = { label: 'q', value: e.q, unknown: e.key === 'div.ev.lead' ? (bit(k) - 1) >>> 0 : undecided };
    if (e.key === 'div.ev.lead') {
      const shifted = Math.floor(e.a / 2 ** k);
      return register([
        { label: 'a', value: e.a },
        { label: `a>>${k}`, value: shifted, cls: 'act' },
        { label: 'b', value: e.b },
        q,
      ], { ...opts, cursor: k < run.bits ? k : null });
    }
    if (e.key === 'div.ev.fit') {
      return register([
        { label: 'a', value: e.before },
        { label: `b<<${k}`, value: e.sub, marks: [[e.sub, 'bad']] },
        { label: '→ a', value: e.a, ref: e.before, cls: 'res' },
        { ...q, marks: [[bit(k), 'ok']] },
      ], { ...opts, cursor: k });
    }
    return register([
      { label: 'a', value: e.a },
      { label: `a>>${k}`, value: e.shifted, cls: 'act' },
      { label: 'b', value: e.b },
      { ...q, marks: [[bit(k), 'bad']] },
    ], { ...opts, cursor: k });
  },
  vars(run, e) {
    if (e.a === null) return [];
    const out = [['var.divSign', chip(e.neg ? '−' : '+', e.neg ? 'amb' : 'hit')]];
    if (e.k !== null && e.key !== 'div.ev.lead') out.push(['var.divTest', chip(`${e.shifted} ${e.shifted >= e.b ? '≥' : '<'} ${e.b}`, e.shifted >= e.b ? 'hit' : 'amb')]);
    out.push(['var.divQ', chip(decOf(e.q), 'new')]);
    return out;
  },
};

/* ---------- K Closest Points to Origin ---------- */
/** Heap slots by level: the root on top, children of j at 2j + 1 and 2j + 2. */
function heapSlots(size, width, top) {
  return Array.from({ length: size }, (_, i) => {
    const level = Math.floor(Math.log2(i + 1)), pos = i - (2 ** level - 1);
    return [width * (pos + 0.5) / 2 ** level, top + level * 56];
  });
}

/** A plane around the origin: R units each way, u pixels per unit, the origin at (c, c). */
function plane(R, u, pad = 16) {
  const c = pad + R * u, size = 2 * c;
  const px = x => c + x * u, py = y => c - y * u;
  const s = `<line class="axis" x1="${pad - 6}" y1="${c}" x2="${size - pad + 6}" y2="${c}"/>`
    + `<line class="axis" x1="${c}" y1="${pad - 6}" x2="${c}" y2="${size - pad + 6}"/>`
    + text(size - pad + 4, c + 11, R, 'idx') + text(c - 10, pad - 2, R, 'idx') + text(c - 9, c + 11, 0, 'idx');
  return { px, py, size, s };
}

export const kClosest = {
  view(run, e) {
    const R = run.R, u = Math.max(8, Math.min(24, Math.floor(110 / R))), P = plane(R, u);
    const inHeap = new Set(e.heap), root = e.heap[0], full = e.heap.length >= run.k;
    let s = P.s;
    if (e.heap.length && (full || e.key === 'kc.ev.done')) {
      s += `<circle class="sgq" cx="${P.px(0)}" cy="${P.py(0)}" r="${Math.sqrt(run.d[root]) * u}"/>`;
    }
    run.points.forEach(([x, y], i) => {
      const cls = i === e.cur && e.key !== 'kc.ev.done' ? (e.status[i] === 'out' ? 'pmiss' : 'pnew')
        : e.status[i] === 'out' ? 'pmiss pdim' : inHeap.has(i) ? 'phit' : 'pdim';
      s += `<circle class="pt ${cls}" cx="${P.px(x)}" cy="${P.py(y)}" r="5.5"/>` + text(P.px(x) + 9, P.py(y) - 8, i, `idx ptl ${cls}`);
    });
    const hw = 4 * 52, W = Math.max(P.size, hw + 10), hx = (W - hw) / 2, top = P.size + 52;
    const at = heapSlots(e.heap.length, hw, top);
    let h = text(8, P.size + 14, 'max-heap · d', 'lbl');
    e.heap.forEach((_, j) => {
      if (!j) return;
      const [x1, y1] = at[(j - 1) >> 1], [x2, y2] = at[j];
      h += `<line class="edge" x1="${hx + x1}" y1="${y1}" x2="${hx + x2}" y2="${y2}"/>`;
    });
    e.heap.forEach((i, j) => {
      const [x, y] = at[j], cls = j === e.mark ? 'new' : j === 0 ? 'root' : '';
      h += node(hx + x, y, run.d[i], cls) + text(hx + x, y + 30, `#${i}`, 'idx');
    });
    const levels = Math.max(1, Math.ceil(Math.log2(run.k + 2)));
    return svg(W, top + (levels - 1) * 56 + 44, `<g transform="translate(${(W - P.size) / 2},0)">${s}</g>` + h);
  },
  vars(run, e) {
    const out = [['var.kcHeap', chips(e.heap.map((i, j) => chip(`${run.d[i]}:(${run.points[i].join(',')})`, j === e.mark ? 'new' : j ? 'amb' : 'hit')))],
      ['var.size', chip(`${e.heap.length} / ${run.k}`)]];
    if (e.gone != null) out.push(['var.kcDropped', chip(`${run.d[e.gone]}:(${run.points[e.gone].join(',')})`, 'bad')]);
    return out;
  },
};

/* ---------- Clone Graph ---------- */
const ringAt = (n, cx, cy, r) => Array.from({ length: n + 1 }, (_, v) => {
  if (!v) return null;
  const a = -Math.PI / 2 + (v - 1) * 2 * Math.PI / n;
  return n > 1 ? [cx + r * Math.cos(a), cy + r * Math.sin(a)] : [cx, cy];
});

/** A reference from′ → to′ is drawn as half an edge, from′ to the midpoint: both halves make the copied edge. */
function halfEdge([x1, y1], [x2, y2], cls) {
  const mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = mx - x1, dy = my - y1, len = Math.hypot(dx, dy) || 1;
  return `<line class="${cls}" x1="${x1 + dx / len * 21}" y1="${y1 + dy / len * 21}" x2="${mx - dx / len * 2}" y2="${my - dy / len * 2}" marker-end="url(#pat-ah)"/>`;
}

export const cloneGraph = {
  view(run, e) {
    const n = run.n, r = n > 1 ? 66 : 0, W = 186, cy = 110;
    const left = ringAt(n, W / 2, cy, r), right = ringAt(n, W + 24 + W / 2, cy, r);
    const fresh = e.key === 'cg.ev.new' || e.key === 'cg.ev.root';
    let s = text(8, 14, 'original', 'lbl') + text(W + 32, 14, 'clone', 'lbl')
      + `<line class="cutline" x1="${W + 12}" y1="24" x2="${W + 12}" y2="${2 * cy - 10}"/>`;
    for (const [a, b] of run.edges) {
      const on = e.cur != null && ((a === e.cur && b === e.nb) || (b === e.cur && a === e.nb));
      s += `<line class="edge${on ? ' on' : ''}" x1="${left[a][0]}" y1="${left[a][1]}" x2="${left[b][0]}" y2="${left[b][1]}"/>`;
    }
    for (let v = 1; v <= n; v++) {
      const cls = v === e.cur ? 'cur' : v === e.nb ? 'path' : e.done.includes(v) ? 'done' : e.queue.includes(v) ? 'new' : '';
      s += node(left[v][0], left[v][1], v, cls);
    }
    e.refs.forEach(([a, b], j) => { s += halfEdge(right[a], right[b], `edge${j === e.refs.length - 1 && e.nb != null ? ' on' : ''}`); });
    for (const v of e.copies) {
      const cls = fresh && (v === e.nb || (e.key === 'cg.ev.root' && v === 1)) ? 'new' : v === e.cur ? 'cur' : e.key === 'cg.ev.done' ? 'done' : '';
      s += node(right[v][0], right[v][1], `${v}′`, cls);
    }
    return svg(2 * W + 30, 2 * cy, s);
  },
  vars(run, e) {
    const made = e.key === 'cg.ev.new' ? e.nb : e.key === 'cg.ev.root' ? 1 : null;
    return [
      ['var.cgMap', chips(e.copies.map(v => chip(`${v}→${v}′`, v === made ? 'new' : v === e.nb ? 'amb' : 'hit')))],
      ['var.queue', chips(e.queue.map(v => chip(v, 'amb')))],
      ['var.cgRefs', chip(`${e.refs.length} / ${2 * run.edges.length}`)],
    ];
  },
};

/* ---------- Min Cost to Connect All Points (Kruskal) ---------- */
/** Components with more than one point get a colour each, in order of their roots. */
const COMP = ['comp0', 'comp1', 'comp2', 'comp3', 'comp4'];

export const kruskal = {
  view(run, e) {
    const xs = run.points.map(p => p[0]), ys = run.points.map(p => p[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const span = Math.max(1, x1 - x0, y1 - y0), u = Math.max(10, Math.min(34, Math.floor(300 / span))), pad = 26;
    const px = x => pad + (x - x0) * u, py = y => pad + (y1 - y) * u;
    const P = run.points.map(([x, y]) => [px(x), py(y)]);
    let s = '';
    e.edges.forEach(([w, i, j], k) => {
      const st = e.status[k], cur = k === e.e;
      if (!st) return;
      const cls = st === 'take' ? 'edge tree' : 'edge miss';
      s += `<line class="${cls}${cur ? ' on' : ''}" x1="${P[i][0]}" y1="${P[i][1]}" x2="${P[j][0]}" y2="${P[j][1]}"/>`;
      if (cur || st === 'take') s += text((P[i][0] + P[j][0]) / 2, (P[i][1] + P[j][1]) / 2, w, `wt ${cur ? 'on' : st === 'take' ? 'tree' : 'miss'}`);
    });
    const sizes = new Map();
    e.comp.forEach(root => sizes.set(root, (sizes.get(root) || 0) + 1));
    const order = [...new Set(e.comp)].filter(root => sizes.get(root) > 1);
    const cur = e.e !== null ? e.edges[e.e] : null;
    run.points.forEach((_, v) => {
      const k = order.indexOf(e.comp[v]);
      const cls = cur && (cur[1] === v || cur[2] === v) ? (e.status[e.e] === 'skip' ? 'bad' : 'cur')
        : e.key === 'kr.ev.done' ? 'done' : k >= 0 ? COMP[k % COMP.length] : '';
      s += node(P[v][0], P[v][1], v, `${cls} small`, 14);
    });
    return svg(2 * pad + (x1 - x0) * u, 2 * pad + (y1 - y0) * u, s);
  },
  vars(run, e) {
    return [
      ['var.krEdges', chips(e.edges.map(([w, i, j], k) => chip(`${i}-${j}:${w}`, k === e.e ? 'new' : e.status[k] === 'take' ? 'hit' : e.status[k] === 'skip' ? 'bad stale' : '')))],
      ['var.krCost', chip(e.total, 'hit')],
      ['var.krTaken', chip(`${e.taken} / ${Math.max(0, run.points.length - 1)}`, 'amb')],
    ];
  },
};

/* ---------- Pacific Atlantic Water Flow ---------- */
export const pacificAtlantic = {
  view(run, e) {
    const m = run.heights.length, n = run.heights[0].length, at = { x: 34, y: 34 };
    const W = rowWidth(n), H = rowWidth(m), done = e.key === 'pa.ev.both';
    const clsOf = (v, r, c) => {
      const p = e.pac[r][c], a = e.atl[r][c];
      return p && a ? 'both' : p ? 'pac' : a ? 'atl' : '';
    };
    let s = `<rect class="pa-p" x="${at.x - 2}" y="${at.y - 26}" width="${W + 4}" height="6" rx="3"/>`
      + `<rect class="pa-p" x="${at.x - 28}" y="${at.y - 2}" width="6" height="${H + 4}" rx="3"/>`
      + `<rect class="pa-a" x="${at.x - 2}" y="${at.y + H + 8}" width="${W + 4}" height="6" rx="3"/>`
      + `<rect class="pa-a" x="${at.x + W + 8}" y="${at.y - 2}" width="6" height="${H + 4}" rx="3"/>`;
    s += matrixIndex(m, n, at) + matrixCells(run.heights, clsOf, at);
    for (const [r, c] of e.added) s += matrixBox([r, c, r, c], 'best', at);
    if (e.cur) s += matrixBox([e.cur[0], e.cur[1], e.cur[0], e.cur[1]], 'cutline-box', at);
    if (done) {
      for (const [r, c] of run.answer) {
        const [x, y] = matrixXY(r, c, at);
        s += text(x + CELL - 6, y + 9, '✓', 'idx corner pa-tick');
      }
    }
    return svg(at.x + W + 24, at.y + H + 24, s);
  },
  vars(run, e) {
    const count = g => g.flat().filter(Boolean).length;
    const out = [['var.paPacific', chip(count(e.pac), e.ocean === 'P' ? 'new' : 'hit')], ['var.paAtlantic', chip(count(e.atl), e.ocean === 'A' ? 'new' : 'hit')]];
    if (e.ocean) out.push(['var.queue', chips(e.queue.slice(0, 8).map(([r, c]) => chip(`(${r},${c})`, 'amb')).concat(e.queue.length > 8 ? [chip(`+${e.queue.length - 8}`, 'done')] : []))]);
    if (e.key === 'pa.ev.both') out.push(['var.paBoth', chips(run.answer.map(([r, c]) => chip(`[${r},${c}]`, 'hit')))]);
    return out;
  },
};
