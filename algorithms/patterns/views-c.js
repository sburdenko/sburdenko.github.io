/** Views for chapters 09–12: heap, backtracking, greedy, dynamic programming. */
import {
  CELL, STEP, svg, text, rowWidth, cells, pointers, arcBelow, node, chip, chips,
  barLayout, bars, gridCells, decisionTreeView, dpTable,
} from './view-kit.js?v=202609252015';

const TOP = 40;
const framed = (n, h, inner) => svg(rowWidth(n) + 20, h, `<g transform="translate(10,0)">${inner}</g>`);

function heapTree(heap, width, top, clsOf) {
  const at = i => {
    const level = Math.floor(Math.log2(i + 1)), pos = i - (2 ** level - 1);
    return [10 + width * (pos + 0.5) / 2 ** level, top + level * 58];
  };
  let s = '';
  heap.forEach((_, j) => {
    if (!j) return;
    const [x1, y1] = at((j - 1) >> 1), [x2, y2] = at(j);
    s += `<line class="edge" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
  });
  heap.forEach((v, j) => { const [x, y] = at(j); s += node(x, y, v, clsOf(j)); });
  return s;
}
const heapHeight = size => 58 * Math.max(0, Math.ceil(Math.log2(size + 1)) - 1);

/* ---------- 09 heap ---------- */
export const kth = {
  view(run, e) {
    const n = run.nums.length, width = rowWidth(n);
    const cls = run.nums.map((_, j) => (e.i != null && j < e.i ? 'seen' : j === e.i ? 'cur' : ''));
    let s = `<g transform="translate(10,0)">${cells(run.nums, cls, { y: TOP })}${pointers([{ i: e.i, label: 'x' }], { y: TOP, count: n })}</g>`;
    s += text(10, 122, 'min-heap', 'lbl') + heapTree(e.heap, width, 152, j => (j === e.mark ? 'new' : j === 0 ? 'root' : ''));
    return svg(width + 20, 152 + heapHeight(run.k + 1) + 30, s);
  },
  vars(run, e) {
    return [['var.heap', chips(e.heap.map((v, j) => chip(v, j ? '' : 'new')))], ['var.size', chip(`${e.heap.length} / ${run.k}`)]];
  },
};

export const stones = {
  view(run, e) {
    const width = 360;
    return svg(width + 20, 30 + heapHeight(run.stones.length) + 30,
      heapTree(e.heap, width, 30, j => (j === e.mark ? 'new' : j === 0 ? 'root' : '')));
  },
  vars(run, e) {
    return [['var.heap', chips(e.heap.map((v, j) => chip(v, j ? '' : 'new')))]];
  },
};

export const mergeK = {
  view(run, e) {
    const x0 = 40, gapY = CELL + 18;
    let s = '';
    run.lists.forEach((list, r) => {
      const y = 16 + r * gapY;
      s += text(4, y + CELL / 2, `L${r + 1}`, 'lbl');
      s += cells(list, list.map((_, j) => (j < e.heads[r] ? 'dim' : j === e.heads[r] ? (r === e.took ? 'ok' : 'cur') : '')), { x: x0, y, index: false });
    });
    const yOut = 16 + run.lists.length * gapY + 10;
    s += text(4, yOut + CELL / 2, 'out', 'lbl') + cells(e.out, e.out.map((_, j) => (j === e.out.length - 1 ? 'ok' : '')), { x: x0, y: yOut, index: false });
    const longest = Math.max(e.out.length, ...run.lists.map(l => l.length), run.lists.flat().length);
    return svg(x0 + rowWidth(longest) + 10, yOut + CELL + 10, s);
  },
  vars(run, e) {
    return [['var.heap', chips(e.heap.map(([v, i]) => chip(`${v}·L${i + 1}`, 'amb')))]];
  },
};

export const medianStream = {
  view(run, e) {
    const slots = Math.ceil(run.nums.length / 2) + 1, mid = 20 + slots * STEP;
    const low = e.low, high = e.high;
    let s = text(mid - 8 - slots * STEP / 2, 14, 'low · max-heap', 'lbl-c') + text(mid + 8 + slots * STEP / 2, 14, 'high · min-heap', 'lbl-c');
    s += cells(low, low.map((_, j) => (j === low.length - 1 ? 'src' : '')), { x: mid - 8 - low.length * STEP, y: 30, index: false });
    s += cells(high, high.map((_, j) => (j === 0 ? 'win' : '')), { x: mid + 14, y: 30, index: false });
    s += `<line class="cutline" x1="${mid + 3}" y1="22" x2="${mid + 3}" y2="${30 + CELL + 8}"/>`;
    return svg(mid * 2 + 10, 30 + CELL + 16, s);
  },
  vars(run, e) {
    const median = e.key === 'mstr.ev.add' ? e.args[4] : null;
    return median == null ? [] : [['var.median', chip(median, 'hit')]];
  },
};

/* ---------- 10 backtracking ---------- */
const answers = (key) => ({
  view(run, e) {
    return decisionTreeView(run.nodes, e.cur, n => n.leaf && !n.cut && run.isAnswer(n), { gapX: run.gapX || 60 });
  },
  vars(run, e) {
    const path = e.cur == null ? [] : run.nodes[e.cur].state.path;
    return [['var.path', chip(`[${path.join(', ')}]`)], [key, chips(e.res.map(r => chip(`[${r.join(',')}]`, 'hit')))]];
  },
});
export const subsets = answers('var.answer');
export const perms = answers('var.answer');
export const combSum = answers('var.answer');

export const queens = {
  view(run, e) {
    const board = Array.from({ length: run.n }, () => Array(run.n).fill(0));
    return gridCells(board, (_, r, c) => {
      const queen = e.queens[r] === c;
      const trying = e.tryAt && e.tryAt[0] === r && e.tryAt[1] === c;
      const blocker = e.clash && e.clash[0] === r && e.clash[1] === c;
      const cls = `${(r + c) % 2 ? 'sq-d' : 'sq-l'}${trying ? (e.clash ? ' bad-c' : ' focus') : ''}${blocker ? ' bad-c' : ''}`;
      return { cls, label: queen ? '♛' : trying && e.clash ? '✕' : '', tcls: queen ? 'queen' : '' };
    }, { size: 46, step: 48 });
  },
  vars(run, e) {
    return [['var.solutions', chip(e.solutions, 'hit')]];
  },
};

/* ---------- 11 greedy ---------- */
export const jump = {
  view(run, e) {
    const n = run.a.length, arcY = TOP + CELL + 22;
    const cls = run.a.map((_, j) => (j === e.i ? (e.stuck ? 'bad' : 'cur') : j <= e.reach ? 'win' : ''));
    if (e.done) cls[n - 1] = 'ok';
    const hop = e.i != null && !e.stuck && run.a[e.i] > 0
      ? arcBelow(e.i, Math.min(e.i + run.a[e.i], n - 1), arcY, 16 + run.a[e.i] * 4, '', `+${run.a[e.i]}`) : '';
    return framed(n, 160, cells(run.a, cls, { y: TOP }) + pointers([{ i: e.i, label: 'i' }, { i: Math.min(e.reach, n - 1), label: 'reach', cls: 'p2' }], { y: TOP, count: n }) + hop);
  },
  vars(run, e) {
    return [['var.reach', chip(e.reach, 'hit')]];
  },
};

export const stock = {
  view(run, e) {
    const lay = barLayout(run.prices, { unit: 18 });
    const cls = run.prices.map((_, j) => (e.bestPair && (j === e.bestPair[0] || j === e.bestPair[1]) ? 'okb'
      : j === e.minAt ? 'r' : j === e.i ? 'l' : e.i != null && j > e.i ? 'dim' : ''));
    return svg(lay.width, lay.height, bars(run.prices, lay, cls));
  },
  vars(run, e) {
    return [['var.minPrice', chip(e.minAt >= 0 ? run.prices[e.minAt] : '—', 'amb')], ['var.best', chip(e.best, 'hit')]];
  },
};

export const intervals = {
  view(run, e) {
    const unit = 34, x0 = 20, rowH = 26;
    const maxEnd = Math.max(...e.sorted.map(iv => iv[1]));
    let s = '';
    for (let t = 0; t <= maxEnd; t++) s += `<line class="tick" x1="${x0 + t * unit}" y1="14" x2="${x0 + t * unit}" y2="${20 + e.sorted.length * rowH}"/>` + text(x0 + t * unit, 8, t, 'idx');
    e.sorted.forEach(([a, b], k) => {
      const cls = k === e.i ? `${e.status[k] || ''} curi` : e.status[k] || '';
      s += `<rect class="span ${cls}" x="${x0 + a * unit}" y="${20 + k * rowH}" width="${(b - a) * unit}" height="${rowH - 8}" rx="4"/>`
        + text(x0 + (a + b) * unit / 2, 20 + k * rowH + (rowH - 8) / 2, `${a}–${b}`, 'span-t');
    });
    if (e.end != null) s += `<line class="cutline" x1="${x0 + e.end * unit}" y1="14" x2="${x0 + e.end * unit}" y2="${24 + e.sorted.length * rowH}"/>`;
    return svg(x0 * 2 + maxEnd * unit, 28 + e.sorted.length * rowH, s);
  },
  vars(run, e) {
    return [['var.end', chip(e.end ?? '−∞')], ['var.removed', chip(e.status.filter(v => v === 'drop').length, 'amb')]];
  },
};

export const candy = {
  view(run, e) {
    const n = run.ratings.length, x = 60, y2 = TOP + CELL + 40;
    const clsR = run.ratings.map((_, j) => (j === e.i ? 'cur' : ''));
    const clsC = e.c.map((_, j) => (j === e.i ? 'ok' : ''));
    const marks = e.i == null ? [] : [{ i: e.i, label: e.pass === 'L' ? '→' : '←' }];
    return svg(x + rowWidth(n) + 10, y2 + CELL + 12,
      text(4, TOP + CELL / 2, 'rating', 'lbl') + cells(run.ratings, clsR, { x, y: TOP }) + pointers(marks, { x, y: TOP, count: n })
      + text(4, y2 + CELL / 2, 'candy', 'lbl') + cells(e.c, clsC, { x, y: y2, index: false }));
  },
  vars(run, e) {
    return [['var.total', chip(e.c.reduce((s, v) => s + v, 0), 'hit')]];
  },
};

/* ---------- 12 dynamic programming ---------- */
export const climb = {
  view(run, e) {
    const arcY = TOP + CELL + 22;
    const cls = e.dp.map((v, j) => (j === e.i ? 'cur' : e.i != null && (j === e.i - 1 || j === e.i - 2) ? 'src' : v === null ? 'dim' : ''));
    let inner = cells(e.dp.map(v => (v === null ? '·' : v)), cls, { y: TOP });
    if (e.i != null) inner += arcBelow(e.i - 1, e.i, arcY, 14, '', '+1') + arcBelow(e.i - 2, e.i, arcY, 26, '', '+2');
    return framed(e.dp.length, 170, inner + pointers([{ i: e.i, label: `ways[${e.i}]` }], { y: TOP, count: e.dp.length }));
  },
  vars() {
    return [];
  },
};

export const coin = {
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

const table = {
  view(run, e) {
    return dpTable(run.a, run.b, e.dp, e.cur, e.src);
  },
  vars() {
    return [];
  },
};
export const lcs = table;
export const edit = table;
