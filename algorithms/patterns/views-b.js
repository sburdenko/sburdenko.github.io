/** Views for chapters 05–08: stack, linked list, grids and graphs, trees. */
import {
  CELL, STEP, svg, text, rowWidth, cells, pointers, arrow, node, chip, chips,
  barLayout, bars, gridCells, binaryTree,
} from './view-kit.js?v=202609252015';

const TOP = 40, GAP_HALF = 3;
const framed = (n, h, inner) => svg(rowWidth(n) + 20, h, `<g transform="translate(10,0)">${inner}</g>`);

/* ---------- 05 stack ---------- */
export const parens = {
  view(run, e) {
    const s = [...run.s];
    const cls = s.map((_, j) => (e.i != null && j < e.i ? 'seen' : ''));
    if (e.i != null) cls[e.i] = e.bad ? 'bad' : 'cur';
    return framed(s.length, 104, cells(s, cls, { y: TOP }) + pointers([{ i: e.i, label: 'i' }], { y: TOP, count: s.length }));
  },
  vars(run, e) {
    return [['var.stack', chips(e.stack.map(c => chip(c, 'amb')))]];
  },
};

export const daily = {
  view(run, e) {
    const n = run.t.length, x = 40, y2 = TOP + CELL + 40;
    const clsT = run.t.map((_, j) => (j === e.i ? 'cur' : e.stack.includes(j) ? 'src' : e.i != null && j < e.i ? 'seen' : ''));
    if (e.popped != null) clsT[e.popped] = 'ok';
    const clsA = e.ans.map((v, j) => (v === null ? 'dim' : j === e.popped ? 'ok' : ''));
    return svg(x + rowWidth(n) + 10, y2 + CELL + 12,
      text(4, TOP + CELL / 2, 't', 'lbl') + cells(run.t, clsT, { x, y: TOP })
      + pointers([{ i: e.i, label: 'i' }], { x, y: TOP, count: n })
      + text(4, y2 + CELL / 2, 'ans', 'lbl') + cells(e.ans.map(v => (v === null ? '·' : v)), clsA, { x, y: y2, index: false }));
  },
  vars(run, e) {
    return [['var.stack', chips(e.stack.map(j => chip(`${j}:${run.t[j]}°`, 'amb')))]];
  },
};

export const minStack = {
  view(run, e) {
    const w = 64, h = 34, x = 60, rows = Math.max(4, ...run.events.map(ev => ev.stack.length));
    const base = 30 + rows * (h + 6);
    let s = text(x + w / 2, 16, 'val', 'lbl-c') + text(x + w + 8 + w / 2, 16, 'min', 'lbl-c');
    e.stack.forEach(([val, min], k) => {
      const y = base - (k + 1) * (h + 6), top = k === e.stack.length - 1;
      s += `<rect class="cell ${top ? 'cur' : ''}" x="${x}" y="${y}" width="${w}" height="${h}" rx="5"/>` + text(x + w / 2, y + h / 2, val, 'cv')
        + `<rect class="cell src" x="${x + w + 8}" y="${y}" width="${w}" height="${h}" rx="5"/>` + text(x + w + 8 + w / 2, y + h / 2, min, 'cv');
    });
    s += `<line class="axis" x1="${x - 10}" x2="${x + 2 * w + 18}" y1="${base}" y2="${base}"/>`;
    return svg(x + 2 * w + 60, base + 10, s);
  },
  vars(run, e) {
    return [['var.ops', chips(run.ops.map(([op, v], k) => chip(v == null ? op : `${op} ${v}`, k === e.op ? 'new' : k < (e.op ?? -1) ? 'done' : '')))]];
  },
};

export const histogram = {
  view(run, e) {
    const h = run.h, lay = barLayout(h, { unit: 20 });
    const rect = (r, cls) => (r ? `<rect class="${cls}" x="${lay.x(r[0])}" y="${lay.base - r[2] * lay.unit}" width="${lay.x(r[1]) + lay.bw - lay.x(r[0])}" height="${r[2] * lay.unit}"/>` : '');
    let s = rect(e.rect, 'water');
    s += bars(h, lay, h.map((_, i) => (e.stack.includes(i) ? 'r' : i === e.i ? 'l' : '')));
    s += rect(e.bestRect, 'best');
    return svg(lay.width, lay.height, s);
  },
  vars(run, e) {
    return [['var.stack', chips(e.stack.map(j => chip(`${j}:${run.h[j]}`, 'amb')))], ['var.best', chip(e.best, 'hit')]];
  },
};

/* ---------- 06 linked list ---------- */
export const cycle = {
  view(run, e) {
    const entry = run.next.at(-1), tail = entry < 0 ? run.next.length : entry;
    const loop = run.next.length - tail, pos = [];
    for (let k = 0; k < tail; k++) pos.push([44 + k * 88, 122]);
    const cx = 44 + tail * 88 + 80, r = 80;
    for (let k = 0; k < loop; k++) {
      const ang = Math.PI + k * 2 * Math.PI / loop;
      pos.push([cx + r * Math.cos(ang), 122 + r * Math.sin(ang)]);
    }
    let s = run.next.map((b, a) => (b < 0 ? '' : arrow(pos[a][0], pos[a][1], pos[b][0], pos[b][1], 21))).join('');
    pos.forEach(([x, y], k) => { s += node(x, y, k, k === e.meet ? 'ok' : k === e.slow || k === e.fast ? 'cur' : ''); });
    const [sx, sy] = pos[e.slow], [fx, fy] = pos[e.fast];
    s += text(sx, sy - 31, 'slow', 'sf s') + text(fx, fy + 32, 'fast', 'sf f');
    return svg(cx + r + 40, 250, s);
  },
  vars(run, e) {
    return [['var.slowFast', chip(`${e.slow} / ${e.fast}`)]];
  },
};

export const removeNth = {
  view(run, e) {
    const count = run.values.length + 2, y = 96, px = k => 40 + k * 70;
    const label = k => (k === 0 ? 'D' : k === count - 1 ? '∅' : run.values[k - 1]);
    let s = '';
    for (let k = 0; k < count - 1; k++) {
      const touchesRemoved = e.removed != null && (k === e.removed || k + 1 === e.removed);
      s += arrow(px(k), y, px(k + 1), y, 21, touchesRemoved ? 'edge dim' : 'edge');
    }
    if (e.removed != null) {
      const a = px(e.removed - 1), b = px(e.removed + 1);
      s += `<path class="edge on" d="M${a + 8} ${y - 18} Q${(a + b) / 2} ${y - 70} ${b - 8} ${y - 18}" marker-end="url(#pat-ah)"/>`;
    }
    for (let k = 0; k < count; k++) {
      s += node(px(k), y, label(k), k === e.removed ? 'dim' : k === count - 1 ? 'nil' : k === e.slow || k === e.fast ? 'cur' : '');
    }
    s += text(px(e.slow), y - 34, 'slow', 'sf s') + text(px(e.fast), y + 36, 'fast', 'sf f');
    s += text(px(0), y + 58, 'dummy', 'idx') + text(px(count - 1), y + 58, 'null', 'idx');
    return svg(px(count - 1) + 40, 170, s);
  },
  vars(run, e) {
    return [['var.n', chip(run.n)], ['var.gap', chip(e.fast - e.slow)]];
  },
};

export const reverse = {
  view(run, e) {
    const n = run.values.length, y = 90, px = k => 50 + k * 76;
    let s = '';
    e.next.forEach((to, k) => {
      if (to < 0) return;
      s += to > k ? arrow(px(k), y, px(to), y, 21) : `<path class="edge on" d="M${px(k) - 14} ${y + 16} Q${(px(k) + px(to)) / 2} ${y + 52} ${px(to) + 14} ${y + 16}" marker-end="url(#pat-ah)"/>`;
    });
    run.values.forEach((v, k) => { s += node(px(k), y, v, k === e.cur ? 'cur' : k === e.prev ? 'path' : ''); });
    if (e.prev >= 0) s += text(px(e.prev), y - 34, 'prev', 'sf s');
    if (e.cur >= 0) s += text(px(e.cur), y - 34, 'cur', 'sf f');
    return svg(px(n - 1) + 50, 160, s);
  },
  vars(run, e) {
    return [['var.prevCur', chip(`${e.prev >= 0 ? run.values[e.prev] : 'null'} / ${e.cur >= 0 ? run.values[e.cur] : 'null'}`)]];
  },
};

export const reverseK = {
  view(run, e) {
    const cls = e.order.map((_, j) => (e.group && j >= e.group[0] && j <= e.group[1] ? (e.rest ? 'dim' : 'ok') : e.group && j < e.group[0] ? 'seen' : ''));
    let s = cells(e.order, cls, { y: TOP, index: false });
    for (let j = 0; j < e.order.length - 1; j++) s += arrow(j * STEP + CELL, TOP + CELL / 2, (j + 1) * STEP, TOP + CELL / 2, 0);
    for (let g = run.k; g < e.order.length; g += run.k) s += `<line class="cutline" x1="${g * STEP - GAP_HALF}" y1="${TOP - 8}" x2="${g * STEP - GAP_HALF}" y2="${TOP + CELL + 8}"/>`;
    return framed(e.order.length, 100, s);
  },
  vars(run) {
    return [['var.k', chip(run.k)]];
  },
};

/* ---------- 07 grids and graphs ---------- */
export const flood = {
  view(run, e) {
    return gridCells(e.img, (v, r, c) => ({ cls: `v${v}${e.cur && e.cur[0] === r && e.cur[1] === c ? ' focus' : ''}`, label: v }));
  },
  vars(run) {
    return [['var.color', chip(`${run.image[run.sr][run.sc]} → ${run.color}`)]];
  },
};

export const islands = {
  view(run, e) {
    return gridCells(run.grid, (v, r, c) => {
      const island = e.color[r][c];
      const focus = e.cur && e.cur[0] === r && e.cur[1] === c ? ' focus' : '';
      return { cls: `${v === 0 ? 'water' : island < 0 ? 'land' : `i${island % 5}`}${focus}`, label: v };
    });
  },
  vars(run, e) {
    return [['var.islands', chip(e.count, 'hit')], ['var.calls', chips(e.stack.map(([r, c]) => chip(`(${r},${c})`)))]];
  },
};

export const oranges = {
  view(run, e) {
    const fresh = new Set(e.newly.map(([r, c]) => `${r},${c}`));
    return gridCells(e.g, (v, r, c) => ({
      cls: `${['water', 'fresh', 'rotten'][v]}${fresh.has(`${r},${c}`) ? ' focus' : ''}`,
      label: v === 0 ? '' : v === 1 ? '●' : '✕',
    }));
  },
  vars(run, e) {
    return [['var.minute', chip(e.minute, 'hit')]];
  },
};

export const ladder = {
  view(run, e) {
    const colW = 96, rowH = 40, x0 = 16, y0 = 20;
    const onPath = new Set(e.path);
    const posOf = new Map();
    e.levels.forEach((words, d) => words.forEach((w, k) => posOf.set(w, [x0 + d * colW, y0 + k * rowH])));
    let s = '';
    e.levels.forEach(words => words.forEach(w => {
      const from = e.parent[w];
      if (from == null) return;
      const [x1, y1] = posOf.get(from), [x2, y2] = posOf.get(w);
      s += `<line class="edge${onPath.has(w) && onPath.has(from) ? ' on' : ''}" x1="${x1 + 64}" y1="${y1 + 13}" x2="${x2}" y2="${y2 + 13}"/>`;
    }));
    e.levels.forEach((words, d) => words.forEach(w => {
      const [x, y] = posOf.get(w), last = d === e.levels.length - 1;
      const cls = onPath.has(w) ? 'ok' : w === run.end ? 'src' : last ? 'cur' : '';
      s += `<rect class="cell ${cls}" x="${x}" y="${y}" width="64" height="26" rx="5"/>` + text(x + 32, y + 13, w, `cv small ${cls}`);
    }));
    e.levels.forEach((_, d) => { s += text(x0 + d * colW + 32, 8, d + 1, 'idx'); });
    const rows = Math.max(...e.levels.map(l => l.length));
    return svg(x0 + e.levels.length * colW, y0 + rows * rowH + 6, s);
  },
  vars(run, e) {
    return [['var.level', chip(e.levels.length, 'hit')]];
  },
};

/* ---------- 08 trees ---------- */
export const maxDepth = {
  view(run, e) {
    return binaryTree(run.nodes, {
      clsOf: n => (n.id === e.cur ? 'cur' : e.stack.includes(n.id) ? 'path' : e.ret[n.id] != null ? 'done' : ''),
      badgeOf: n => e.ret[n.id],
      edgeOn: n => e.stack.includes(n.id),
    });
  },
  vars(run, e) {
    return [['var.calls', chips(e.stack.map(id => chip(run.nodes[id].v)))]];
  },
};

export const levelOrder = {
  view(run, e) {
    return binaryTree(run.nodes, {
      clsOf: n => (e.level.includes(n.id) ? 'cur' : n.depth < e.done ? 'done' : e.queue.includes(n.id) ? 'new' : ''),
    });
  },
  vars(run, e) {
    return [['var.queue', chips(e.queue.map(id => chip(run.nodes[id].v, 'amb')))]];
  },
};

export const validBst = {
  view(run, e) {
    return binaryTree(run.nodes, {
      clsOf: n => {
        const c = e.checked[n.id];
        if (!c) return '';
        if (!c.ok) return 'bad';
        return n.id === e.cur ? 'cur' : 'done';
      },
      noteOf: n => (e.checked[n.id] ? `(${e.checked[n.id].lo}, ${e.checked[n.id].hi})` : null),
    });
  },
  vars() {
    return [];
  },
};

export const maxPath = {
  view(run, e) {
    return binaryTree(run.nodes, {
      clsOf: n => (n.id === e.cur ? 'cur' : e.ret[n.id] != null ? 'done' : ''),
      badgeOf: n => e.ret[n.id],
    });
  },
  vars(run, e) {
    return [['var.best', chip(e.best ?? '—', 'hit')]];
  },
};
