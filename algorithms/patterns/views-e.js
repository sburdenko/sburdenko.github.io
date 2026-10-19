/** Views for chapter 14: shortest paths. view(run, event) → SVG string, vars(run, event) → [[i18nKey, html]]. */
import {
  CELL, svg, text, rowWidth, node, chip, chips,
  matrixXY, matrixCells, matrixIndex,
} from './view-kit.js?v=202610191242';

const has = (list, r, c) => list.some(([a, b]) => a === r && b === c);
const inf = d => (d === Infinity || d == null ? '∞' : d);
/** A long queue is shown by its head: the rest is only counted. */
const headChips = (list, toChip, max = 10) =>
  chips([...list.slice(0, max).map(toChip), ...(list.length > max ? [chip(`+${list.length - max}`, 'done')] : [])]);

/** The shared grid stage: column and row numbers, the cells, then overlays (corner notes, arrows) on top. */
function gridStage(m, clsOf, labelOf, overlay = () => '') {
  const at = { x: 26, y: 26 }, rows = m.length, cols = m[0].length;
  const inner = matrixIndex(rows, cols, at) + matrixCells(m, clsOf, { ...at, labelOf }) + overlay(at);
  return svg(at.x + rowWidth(cols) + 10, at.y + rowWidth(rows) + 10, inner);
}
const corner = (r, c, value, at, cls = 'idx') => {
  const [x, y] = matrixXY(r, c, at);
  return text(x + CELL - 4, y + 9, value, `${cls} corner`);
};

/* ---------- 01 Matrix ---------- */
export const nearestZero = {
  view(run, e) {
    const done = e.key === 'zom.ev.done';
    const clsOf = (v, r, c) => {
      if (e.cur && e.cur[0] === r && e.cur[1] === c) return 'cur';
      if (has(e.newly, r, c)) return 'win';
      if (!run.mat[r][c]) return 'src';
      if (e.dist[r][c] === null) return '';
      return done ? 'ok' : has(e.queue, r, c) ? 'g0' : 'seen';
    };
    const labelOf = (v, r, c) => (e.dist[r][c] === null ? '?' : e.dist[r][c]);
    return gridStage(run.mat, clsOf, labelOf);
  },
  vars(run, e) {
    return [['var.distLevel', chip(e.level, 'hit')], ['var.queue', headChips(e.queue, ([r, c]) => chip(`(${r},${c})`, has(e.newly, r, c) ? 'new' : 'amb'))]];
  },
};

/* ---------- Network Delay Time ---------- */
/** Directed weighted edge from p to q; bent to its left when the reverse edge exists, so the pair does not overlap. */
function weightedEdge([x1, y1], [x2, y2], w, bend, cls) {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, nx = -dy / len, ny = dx / len;
  const cx = (x1 + x2) / 2 + nx * bend, cy = (y1 + y2) / 2 + ny * bend;
  const toward = (ax, ay, gap) => { const ex = cx - ax, ey = cy - ay, el = Math.hypot(ex, ey) || 1; return [ax + ex / el * gap, ay + ey / el * gap]; };
  const [sx, sy] = toward(x1, y1, 22), [tx, ty] = toward(x2, y2, 25);
  const marker = cls.includes('tree') ? 'pat-ah-ok' : cls.includes('on') ? 'pat-ah-amb' : 'pat-ah';
  const mx = 0.25 * x1 + 0.5 * cx + 0.25 * x2 + nx * 11, my = 0.25 * y1 + 0.5 * cy + 0.25 * y2 + ny * 11;
  return `<path class="edge ${cls}" d="M${sx.toFixed(1)} ${sy.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}" marker-end="url(#${marker})"/>`
    + text(mx.toFixed(1), my.toFixed(1), w, `wt ${cls}`);
}

export const networkDelay = {
  view(run, e) {
    const n = run.n, cx = 150, cy = 136, rad = n > 1 ? 100 : 0;
    const pos = k => [cx + rad * Math.cos(-Math.PI / 2 + (k - 1) * 2 * Math.PI / n), cy + rad * Math.sin(-Math.PI / 2 + (k - 1) * 2 * Math.PI / n)];
    const pairs = new Set(run.times.map(([u, v]) => `${u},${v}`)), tree = new Set(e.parent.filter(id => id >= 0));
    const end = e.key === 'ndt.ev.done' || e.key === 'ndt.ev.unreach';
    let s = run.times.map(([u, v, w], id) => {
      const cls = id === e.edge ? e.edgeCls : tree.has(id) ? 'tree' : end ? 'dim' : '';
      return weightedEdge(pos(u), pos(v), w, pairs.has(`${v},${u}`) ? 20 : 0, cls);
    }).join('');
    for (let k = 1; k <= n; k++) {
      const [x, y] = pos(k), d = e.dist[k];
      const cls = k === e.cur && !end ? (e.key === 'ndt.ev.stale' ? 'bad' : 'cur') : e.done.includes(k) ? 'done' : d < Infinity ? 'new' : end ? 'bad' : '';
      s += node(x, y, k, cls);
      const label = String(inf(d)), w = Math.max(20, label.length * 8 + 8);
      s += `<rect class="badge-r${d === Infinity ? ' inf' : ''}" x="${x + 12}" y="${y - 31}" width="${w}" height="18" rx="4"/>` + text(x + 12 + w / 2, y - 22, label, 'badge-t');
    }
    return svg(310, 260, s);
  },
  vars(run, e) {
    const stale = ([d, v]) => d > e.dist[v];
    return [['var.pqueue', headChips(e.pq, p => chip(`${p[0]}:${p[1]}`, stale(p) ? 'done stale' : 'amb'))],
      ['var.finalized', chips(e.done.map(v => chip(v, 'hit')))]];
  },
};

/* ---------- Path With Minimum Effort ---------- */
export const minEffort = {
  view(run, e) {
    const done = e.key === 'eff.ev.done';
    const clsOf = (v, r, c) => {
      if (done) return has(e.path, r, c) ? 'ok' : 'dim';
      if (e.cur && e.cur[0] === r && e.cur[1] === c) return e.key === 'eff.ev.stale' ? 'bad' : 'cur';
      if (has(e.improved, r, c)) return 'win';
      if (e.done[r][c]) return 'seen';
      return e.effort[r][c] < Infinity ? 'g0' : '';
    };
    const overlay = at => {
      let s = '';
      e.effort.forEach((row, r) => row.forEach((v, c) => { s += corner(r, c, inf(v), at, v < Infinity ? 'idx need' : 'idx'); }));
      return s;
    };
    return gridStage(run.heights, clsOf, v => v, overlay);
  },
  vars(run, e) {
    const stale = ([d, r, c]) => d > e.effort[r][c];
    return [['var.pqueue', headChips(e.pq, p => chip(`${p[0]}:(${p[1]},${p[2]})`, stale(p) ? 'done stale' : 'amb'))]];
  },
};

/* ---------- Shortest Path with Obstacles Elimination ---------- */
export const obstacles = {
  view(run, e) {
    const found = e.key === 'obs.ev.found';
    const clsOf = (v, r, c) => {
      if (found && has(e.path, r, c)) return v ? 'bad' : 'ok';
      if (e.cur && e.cur[0] === r && e.cur[1] === c) return 'cur';
      if (has(e.newly, r, c)) return v ? 'bad' : 'win';
      if (v) return e.visits[r][c].length ? 'wall broken' : 'wall';
      return e.visits[r][c].length ? 'seen' : '';
    };
    const labelOf = (v, r, c) => (e.steps[r][c] === null ? (v ? '' : '·') : e.steps[r][c]);
    const overlay = at => {
      let s = '';
      e.visits.forEach((row, r) => row.forEach((list, c) => { if (list.length) s += corner(r, c, [...list].sort((a, b) => b - a).join('·'), at, 'idx need'); }));
      return s;
    };
    return gridStage(run.grid, clsOf, labelOf, overlay);
  },
  vars(run, e) {
    const state = e.cur ? [['var.state', chip(`(${e.cur[0]},${e.cur[1]}) · ${e.rem}`, 'new')]] : [];
    return [...state, ['var.queue', headChips(e.queue, ([r, c, rem]) => chip(`(${r},${c})·${rem}`, has(e.newly, r, c) ? 'new' : 'amb'))]];
  },
};
