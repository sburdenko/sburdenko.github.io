/** Views for the structure-shaped rigs: stack, list, grid, tree, heap, decision tree. */
import { CELL, svg, text, rowWidth, cells, pointers, arrow, node, chip, chips } from './view-kit.js?v=202609241230';

const TOP = 40;

export const stack = {
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

export const list = {
  view(run, e) {
    const count = run.values.length + 2, gapX = 70, y = 96;
    const px = k => 40 + k * gapX;
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
      const cls = k === e.removed ? 'dim' : k === count - 1 ? 'nil' : k === e.slow || k === e.fast ? 'cur' : '';
      s += node(px(k), y, label(k), cls);
    }
    s += text(px(e.slow), y - 34, 'slow', 'sf s') + text(px(e.fast), y + 36, 'fast', 'sf f');
    s += text(px(0), y + 58, 'dummy', 'idx') + text(px(count - 1), y + 58, 'null', 'idx');
    return svg(px(count - 1) + 40, 170, s);
  },
  vars(run, e) {
    return [['var.n', chip(run.n)], ['var.gap', chip(e.fast - e.slow)]];
  },
};

export const graph = {
  view(run, e) {
    const size = 40, step = 44;
    let s = '';
    run.grid.forEach((row, r) => row.forEach((v, c) => {
      const x = 8 + c * step, y = 8 + r * step, island = e.color[r][c];
      const cls = v === 0 ? 'water' : island < 0 ? 'land' : `i${island % 5}`;
      const focus = e.cur && e.cur[0] === r && e.cur[1] === c ? ' focus' : '';
      s += `<rect class="gcell ${cls}${focus}" x="${x}" y="${y}" width="${size}" height="${size}" rx="5"/>` + text(x + size / 2, y + size / 2, v, v ? 'gt' : 'gt w');
    }));
    return svg(run.grid[0].length * step + 12, run.grid.length * step + 12, s);
  },
  vars(run, e) {
    return [['var.islands', chip(e.count)], ['var.calls', chips(e.stack.map(([r, c]) => chip(`(${r},${c})`)))]];
  },
};

export const tree = {
  view(run, e) {
    const px = n => 36 + n.x * 60, py = n => 32 + n.depth * 62;
    const width = 72 + (run.nodes.length - 1) * 60, height = 32 + Math.max(...run.nodes.map(n => n.depth)) * 62 + 36;
    let s = '';
    for (const n of run.nodes) {
      for (const child of [n.l, n.r]) {
        if (child < 0) continue;
        const c = run.nodes[child];
        s += `<line class="edge${e.stack.includes(child) ? ' on' : ''}" x1="${px(n)}" y1="${py(n)}" x2="${px(c)}" y2="${py(c)}"/>`;
      }
    }
    for (const n of run.nodes) {
      const cls = n.id === e.cur ? 'cur' : e.stack.includes(n.id) ? 'path' : e.ret[n.id] != null ? 'done' : '';
      s += node(px(n), py(n), n.v, cls);
      if (e.ret[n.id] != null) {
        s += `<rect class="badge-r" x="${px(n) + 12}" y="${py(n) - 30}" width="20" height="18" rx="4"/>` + text(px(n) + 22, py(n) - 21, e.ret[n.id], 'badge-t');
      }
    }
    return svg(width, height, s);
  },
  vars(run, e) {
    return [['var.calls', chips(e.stack.map(id => chip(run.nodes[id].v)))]];
  },
};

export const heap = {
  view(run, e) {
    const n = run.nums.length, width = rowWidth(n);
    const at = i => {
      const level = Math.floor(Math.log2(i + 1)), pos = i - (2 ** level - 1);
      return [10 + width * (pos + 0.5) / 2 ** level, 152 + level * 58];
    };
    const cls = run.nums.map((_, j) => (e.i != null && j < e.i ? 'seen' : j === e.i ? 'cur' : ''));
    let s = `<g transform="translate(10,0)">${cells(run.nums, cls, { y: TOP })}${pointers([{ i: e.i, label: 'x' }], { y: TOP, count: n })}</g>`;
    s += text(10, 122, 'min-heap', 'lbl');
    e.heap.forEach((_, j) => {
      if (!j) return;
      const [x1, y1] = at((j - 1) >> 1), [x2, y2] = at(j);
      s += `<line class="edge" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    });
    e.heap.forEach((v, j) => {
      const [x, y] = at(j);
      s += node(x, y, v, j === e.mark ? 'new' : j === 0 ? 'root' : '');
    });
    const levels = Math.max(1, Math.ceil(Math.log2(run.k + 2)));
    return svg(width + 20, 152 + (levels - 1) * 58 + 30, s);
  },
  vars(run, e) {
    return [['var.heap', chips(e.heap.map((v, j) => chip(v, j ? '' : 'new')))], ['var.size', chip(`${e.heap.length} / ${run.k}`)]];
  },
};

export const back = {
  view(run, e) {
    const px = n => 36 + n.x * 68, py = n => 26 + n.depth * 66;
    const leaves = 2 ** run.nums.length;
    const onPath = new Set();
    for (let p = e.cur; p != null && p >= 0; p = run.nodes[p].parent) onPath.add(p);
    const visited = n => e.cur == null || n.id <= e.cur;
    let s = '';
    for (const n of run.nodes) {
      if (n.parent < 0) continue;
      const p = run.nodes[n.parent], x1 = px(p), y1 = py(p) + 13, x2 = px(n), y2 = py(n) - 13;
      s += `<line class="edge ${onPath.has(n.id) ? 'on' : visited(n) ? '' : 'dim'}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
      s += text((x1 + x2) / 2 + (x2 < x1 ? -12 : 12), (y1 + y2) / 2, `${n.take ? '+' : '−'}${n.item}`, 'idx');
    }
    for (const n of run.nodes) {
      const leaf = n.depth === run.nums.length;
      const cls = n.id === e.cur ? 'cur' : onPath.has(n.id) ? 'path' : !visited(n) ? 'dim' : leaf ? 'ok' : '';
      s += `<rect class="node ${cls}" x="${px(n) - 26}" y="${py(n) - 13}" width="52" height="26" rx="6"/>`
        + text(px(n), py(n), n.set.length ? n.set.join(',') : '∅', `nt small ${cls}`);
    }
    return svg(72 + (leaves - 1) * 68, 26 + run.nums.length * 66 + 30, s);
  },
  vars(run, e) {
    const path = e.cur == null ? [] : run.nodes[e.cur].set;
    return [['var.path', chip(`[${path.join(', ')}]`)], ['var.answer', chips(e.res.map(r => chip(`[${r.join(',')}]`, 'hit')))]];
  },
};

