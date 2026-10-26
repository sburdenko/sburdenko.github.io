/** Views for the problems in model-gap.js. view(run, event) → SVG string, vars(run, event) → [[i18nKey, html]]. */
import { CELL, STEP, svg, text, rowWidth, cells, pointers, pointerAt, node, chip, chips } from './view-kit.js?v=202610262021';
import { layoutLinks } from './model-gap.js?v=202610262021';

/* ---------- Valid Palindrome: the string wraps into rows of small cells ---------- */
const PC = 30, PSTEP = 33, PER_ROW = 12, PROW = 80, PTOP = 34;
const shown = c => (c === ' ' ? '␣' : c);

export const palindrome = {
  view(run, e) {
    const n = run.chars.length, per = Math.min(PER_ROW, Math.max(1, n)), rows = Math.max(1, Math.ceil(n / per));
    const done = e.key === 'pal.ev.done' || e.key === 'pal.ev.mismatch';
    const at = j => [10 + (j % per) * PSTEP, PTOP + Math.floor(j / per) * PROW];
    let s = '';
    run.chars.forEach((c, j) => {
      const st = e.status[j], [x, y] = at(j);
      const cls = st === 'skip' ? 'dim' : st === 'ok' ? 'ok' : st === 'bad' ? 'bad' : '';
      const cur = !done && e.cmp == null && (j === e.l || j === e.r) ? ' cur' : '';
      s += `<rect class="cell ${cls}${cur}" x="${x}" y="${y}" width="${PC}" height="${PC}" rx="5"/>`
        + text(x + PC / 2, y + PC / 2, shown(c), `cv ${cls}${c === ' ' ? ' seen' : ''}`)
        + text(x + PC / 2, y + PC + 11, j, 'idx');
    });
    if (e.key !== 'pal.ev.done') {
      const marks = e.l === e.r ? [[e.l, 'l r', '']] : [[e.l, 'l', ''], [e.r, 'r', 'p2']];
      for (const [j, label, cls] of marks) {
        if (j < 0 || j >= n) continue;
        const [x, y] = at(j);
        s += pointerAt(x + PC / 2, y, label, cls);
      }
    }
    return svg(20 + per * PSTEP - (PSTEP - PC), PTOP + (rows - 1) * PROW + PC + 22, s);
  },
  vars(run, e) {
    const out = [['var.palLR', chip(`l = ${e.l} · r = ${e.r}`, 'new')]];
    if (e.cmp) {
      const [a, b] = e.cmp.map(j => run.chars[j]);
      const same = a.toLowerCase() === b.toLowerCase();
      out.push(['var.palCmp', chip(`'${a}' → '${a.toLowerCase()}'  ${same ? '==' : '!='}  '${b}' → '${b.toLowerCase()}'`, same ? 'hit' : 'bad')]);
    }
    out.push(['var.palPairs', chip(e.pairs)]);
    return out;
  },
};

/* ---------- Contains Duplicate II: the window frame over the array ---------- */
const TOP = 40;
export const dupWindow = {
  view(run, e) {
    const n = run.nums.length, x = 10;
    const cls = run.nums.map((_, j) => (e.hit && e.hit.includes(j) ? 'bad' : j === e.out ? 'seen' : e.win.includes(j) ? 'win' : e.i != null && j < e.i ? 'seen' : ''));
    if (e.i != null && !e.hit && e.key === 'dw.ev.add') cls[e.i] = 'cur';
    let s = cells(run.nums.map(v => String(v).replace('-', '−')), cls, { x, y: TOP });
    if (e.out != null) s += text(x + e.out * STEP + CELL / 2, TOP + CELL + 28, '✕', 'idx need');
    s += pointers([{ i: e.i, label: 'i' }], { x, y: TOP, count: n });
    return svg(x + rowWidth(n) + 10, TOP + CELL + 40, s);
  },
  vars(run, e) {
    const hitValue = e.hit ? run.nums[e.hit[1]] : null;
    return [
      ['var.k', chip(run.k)],
      ['var.dwWindow', chips(e.win.map(j => chip(String(run.nums[j]).replace('-', '−'), run.nums[j] === hitValue ? 'amb' : j === e.i ? 'new' : '')))],
      ['var.dwCount', chip(`${e.win.length} / ${run.k}`)],
    ];
  },
};

/* ---------- Invert Binary Tree: the input on top, the tree as the code changes it below ---------- */
const TX = 46, TY = 58, TR = 17;

/** One tree drawn at offset oy: x, depth by node id; left/right links decide the edges. */
function treeAt(nodes, { x, depth }, left, right, oy, clsOf, edgeOn) {
  const px = id => 26 + x[id] * TX, py = id => oy + 24 + depth[id] * TY;
  let s = '';
  nodes.forEach((_, id) => {
    if (x[id] == null) return;
    for (const c of [left[id], right[id]]) {
      if (c >= 0) s += `<line class="edge${edgeOn(c) ? ' on' : ''}" x1="${px(id)}" y1="${py(id)}" x2="${px(c)}" y2="${py(c)}"/>`;
    }
  });
  nodes.forEach((nd, id) => { if (x[id] != null) s += node(px(id), py(id), String(nd.v).replace('-', '−'), clsOf(id), TR); });
  return s;
}

export const invertTree = {
  view(run, e) {
    const { nodes } = run;
    const before = { x: nodes.map(n => n.x), depth: nodes.map(n => n.depth) };
    const after = layoutLinks(e.left, e.right, 0);
    const levels = Math.max(...nodes.map(n => n.depth)) + 1, h = 24 + (levels - 1) * TY + 26;
    const clsOf = id => (id === e.cur ? 'cur' : e.stack.includes(id) ? 'path' : e.swapped.includes(id) ? 'done' : '');
    const edgeOn = id => e.stack.includes(id);
    const w = 52 + (nodes.length - 1) * TX;
    let s = treeAt(nodes, before, nodes.map(n => n.l), nodes.map(n => n.r), 0, clsOf, edgeOn);
    s += `<line class="axis" x1="6" x2="${w - 6}" y1="${h + 8}" y2="${h + 8}" stroke-dasharray="4 5"/>` + text(w / 2, h + 8, '⇣', 'idx need');
    s += treeAt(nodes, after, e.left, e.right, h + 16, clsOf, edgeOn);
    return svg(w, 2 * h + 16, s);
  },
  vars(run, e) {
    return [
      ['var.calls', chips(e.stack.map(id => chip(String(run.nodes[id].v).replace('-', '−'))))],
      ['var.invDone', chip(`${e.swapped.length} / ${run.nodes.length}`, 'hit')],
    ];
  },
};
