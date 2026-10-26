/** Views for chapter 16: games — paths and space. view(run, event) → SVG string, vars(run, event) → [[i18nKey, html]]. */
import {
  CELL, STEP, svg, text, rowWidth, node, chip, chips, arrow,
  matrixXY, matrixCells, matrixIndex,
} from './view-kit.js?v=202610262045';
import { HEURISTICS } from './model-games.js?v=202610262045';

const has = (list, r, c) => list.some(([a, b]) => a === r && b === c);
const fx = v => (Number.isInteger(v) ? String(v) : v.toFixed(1));
/** A long list is shown by its head: the rest is only counted. */
const headChips = (list, toChip, max = 8) =>
  chips([...list.slice(0, max).map(toChip), ...(list.length > max ? [chip(`+${list.length - max}`, 'done')] : [])]);

/** Column and row numbers, the cells, then overlays (corner notes, arrows) on top. */
function gridStage(m, clsOf, labelOf, overlay = () => '') {
  const at = { x: 26, y: 26 }, rows = m.length, cols = m[0].length;
  const inner = matrixIndex(rows, cols, at) + matrixCells(m, clsOf, { ...at, labelOf }) + overlay(at);
  return svg(at.x + rowWidth(cols) + 10, at.y + rowWidth(rows) + 10, inner);
}
/** Small notes in a cell: top-right (default), top-left or bottom-left. */
function note(r, c, value, at, cls = 'idx', where = 'tr') {
  const [x, y] = matrixXY(r, c, at);
  if (where === 'tl') return text(x + 4, y + 9, value, `${cls} corner-l`);
  if (where === 'bl') return text(x + 4, y + CELL - 8, value, `${cls} corner-l`);
  return text(x + CELL - 4, y + 9, value, `${cls} corner`);
}

/* ---------- A* on a grid ---------- */
export const astar = {
  view(run, e) {
    const n = run.grid.length, end = e.key === 'ast.ev.found' || e.key === 'ast.ev.worse';
    const kinds = new Map(e.nb.map(([r, c, k]) => [`${r},${c}`, k]));
    const inOpen = (r, c) => e.open.some(o => o[2] === r && o[3] === c && !e.closed[r][c]);
    const hOf = (r, c) => HEURISTICS[run.h](n - 1 - r, n - 1 - c);
    const clsOf = (v, r, c) => {
      if (v) return 'wall';
      if (end && has(e.path, r, c)) return 'ok';
      if (e.cur && e.cur[0] === r && e.cur[1] === c) return e.key === 'ast.ev.stale' ? 'bad' : 'cur';
      const k = kinds.get(`${r},${c}`);
      if (k === 'open' || k === 'better') return 'win';
      if (k === 'closed') return 'seen skip';
      if (e.closed[r][c]) return 'seen';
      return inOpen(r, c) ? 'g0' : '';
    };
    const labelOf = (v, r, c) => (v || e.g[r][c] === null ? '' : fx(e.g[r][c] + hOf(r, c)));
    const overlay = at => {
      let s = '';
      run.grid.forEach((row, r) => row.forEach((v, c) => {
        if (v) return;
        s += note(r, c, fx(hOf(r, c)), at, 'idx');
        if (e.g[r][c] !== null) s += note(r, c, e.g[r][c], at, 'idx need', 'tl');
      }));
      s += note(0, 0, 'S', at, 'idx sg-mark', 'bl') + note(n - 1, n - 1, 'G', at, 'idx sg-mark', 'bl');
      return s;
    };
    return gridStage(run.grid, clsOf, labelOf, overlay);
  },
  vars(run, e) {
    const live = e.open.filter(o => !e.closed[o[2]][o[3]] && o[4] === e.g[o[2]][o[3]]);
    return [
      ['var.heuristic', chip(run.h, 'amb')],
      ['var.openHeap', headChips(e.open, o => chip(`${fx(o[0])}:(${o[2]},${o[3]})`, live.includes(o) ? 'amb' : 'done stale'))],
      ['var.expanded', chip(e.expanded, 'hit')],
    ];
  },
};

/* ---------- Flow field ---------- */
const ARROW_DEG = [-90, 0, 90, 180];
const flowArrow = (r, c, k, at, cls = '') => {
  const [x, y] = matrixXY(r, c, at);
  return `<g transform="translate(${x + CELL / 2} ${y + CELL / 2 + 3}) rotate(${ARROW_DEG[k]})"><path class="ffa ${cls}" d="M-11 0H9M3-6L10 0L3 6"/></g>`;
};
const costCls = v => (v >= 5 ? 'deep' : v >= 2 ? 'mud' : '');

export const flowField = {
  view(run, e) {
    const goal = (r, c) => has(run.goals, r, c), cost = run.cost, inf = v => v === Infinity;
    const arrows = (r, c) => (e.phase === 'dir' || e.phase === 'done') && r <= e.row;
    const clsOf = (v, r, c) => {
      if (!v) return 'wall';
      if (goal(r, c)) return 'ok';
      if (e.phase === 'cost') return costCls(v);
      if (e.phase === 'done') return e.path[0] && e.path[0][0] === r && e.path[0][1] === c ? 'cur' : has(e.path, r, c) ? 'win' : inf(e.integ[r][c]) ? 'bad' : '';
      if (arrows(r, c)) return inf(e.integ[r][c]) ? 'bad' : r === e.row ? 'win' : '';
      if (e.cur && e.cur[0] === r && e.cur[1] === c) return 'cur';
      if (has(e.improved, r, c)) return 'win';
      if (e.done[r][c]) return 'seen';
      return inf(e.integ[r][c]) ? '' : 'g0';
    };
    const labelOf = (v, r, c) => {
      if (!v) return '';
      if (goal(r, c)) return 'G';
      if (e.phase === 'cost') return v;
      if (arrows(r, c)) return inf(e.integ[r][c]) ? '×' : '';
      return inf(e.integ[r][c]) ? '' : e.integ[r][c];
    };
    const overlay = at => {
      let s = '';
      cost.forEach((row, r) => row.forEach((v, c) => {
        if (!v || e.phase === 'cost') return;
        if (arrows(r, c)) {
          if (e.dir[r][c] !== null) s += flowArrow(r, c, e.dir[r][c], at, e.phase === 'done' && has(e.path, r, c) ? 'on' : '');
          if (!inf(e.integ[r][c])) s += note(r, c, e.integ[r][c], at, 'idx need');
        } else s += note(r, c, v, at, `idx ${costCls(v)}`);
      }));
      return s;
    };
    return gridStage(cost, clsOf, labelOf, overlay);
  },
  vars(run, e) {
    if (e.phase === 'cost') return [['var.costField', chip(`${run.cost.flat().filter(v => !v).length} / ${Math.max(...run.cost.flat())}`, 'amb')]];
    if (e.phase === 'int') return [['var.pqueue', headChips(e.pq, p => chip(`${p[0]}:(${p[1]},${p[2]})`, 'amb'))]];
    const made = e.dir.flat().filter(d => d !== null).length;
    return [['var.arrows', chip(made, 'hit')], ...(e.phase === 'done' ? [['var.agentPath', chip(e.path.length ? e.path.length - 1 : 0, 'new')]] : [])];
  },
};

/* ---------- Spatial hash grid ---------- */
export const spatialGrid = {
  view(run, e) {
    const s = run.cell, pts = run.points, all = [...pts, ...run.queries.map(([x, y]) => [x, y])];
    const cellsX = Math.max(...all.map(p => Math.floor(p[0] / s))) + 2, cellsY = Math.max(...all.map(p => Math.floor(p[1] / s))) + 2;
    const W = cellsX * s, H = cellsY * s, u = Math.max(9, Math.min(26, Math.floor(460 / Math.max(W, H))));
    const ox = 24, oy = 14, px = x => ox + x * u, py = y => oy + (H - y) * u;
    const bucketOf = new Map(e.buckets);
    const tested = new Map(e.tested.map(([i, hit]) => [i, hit]));
    let out = '';
    for (let cy = 0; cy < cellsY; cy++) {
      for (let cx = 0; cx < cellsX; cx++) {
        const inWin = e.window && cx >= e.window[0] && cx <= e.window[2] && cy >= e.window[1] && cy <= e.window[3];
        const cur = e.cell && e.cell[0] === cx && e.cell[1] === cy && e.key !== 'sg.ev.query';
        const full = bucketOf.has(`${cx},${cy}`);
        const cls = cur ? 'sgcur' : inWin ? 'sgwin' : full ? 'sgfull' : '';
        out += `<rect class="sgcell ${cls}" x="${px(cx * s)}" y="${py((cy + 1) * s)}" width="${s * u}" height="${s * u}"/>`;
        if ((inWin || full) && s * u >= 30) out += text(px(cx * s) + 3, py((cy + 1) * s) + 7, `${cx},${cy}`, 'idx corner-l sgkey');
      }
    }
    for (let cx = 0; cx <= cellsX; cx += Math.max(1, Math.ceil(cellsX / 8))) out += text(px(cx * s), py(0) + 11, cx * s, 'idx');
    for (let cy = 0; cy <= cellsY; cy += Math.max(1, Math.ceil(cellsY / 8))) out += text(ox - 10, py(cy * s), cy * s, 'idx');
    if (e.q !== null) {
      const [x, y, r] = run.queries[e.q];
      out += `<circle class="sgq" cx="${px(x)}" cy="${py(y)}" r="${r * u}"/>`
        + `<path class="sgx" d="M${px(x) - 5} ${py(y)}h10M${px(x)} ${py(y) - 5}v10"/>`;
    }
    pts.forEach(([x, y], i) => {
      if (i >= e.placed) return;
      const cls = i === e.point ? 'pnew' : tested.has(i) ? (tested.get(i) ? 'phit' : 'pmiss') : e.q !== null ? 'pdim' : '';
      out += `<circle class="pt ${cls}" cx="${px(x)}" cy="${py(y)}" r="5.5"/>` + text(px(x) + 10, py(y) - 8, i, `idx ptl ${cls}`);
    });
    return svg(ox + W * u + 14, oy + H * u + 22, out);
  },
  vars(run, e) {
    const out = [['var.sgChecks', chip(`${e.checks} / ${run.points.length * run.queries.length}`, 'hit')]];
    if (e.cell && e.key !== 'sg.ev.query') {
      const list = (new Map(e.buckets)).get(`${e.cell[0]},${e.cell[1]}`) || [];
      out.push(['var.bucket', chips(list.map(i => chip(`${i}:(${run.points[i].join(',')})`, i === e.point ? 'new' : 'amb')))]);
    }
    if (e.placed === run.points.length) {
      out.push(['var.sgAnswers', chips(run.queries.map(([x, y, r], j) => chip(`(${x},${y}) r${r} → ${e.answers[j] ?? '?'}`, j === e.q ? 'new' : e.answers[j] === null ? '' : 'hit')))]);
    }
    return out;
  },
};

/* ---------- Union-Find ---------- */
/** The parent forest: roots on top, children below, every node points up at its parent. */
function forestLayout(parent, n) {
  const kids = Array.from({ length: n + 1 }, () => []), pos = [];
  for (let v = 1; v <= n; v++) if (parent[v] !== v) kids[parent[v]].push(v);
  let leaf = 0;
  const place = (v, depth) => {
    const xs = kids[v].map(k => place(k, depth + 1));
    const x = xs.length ? (xs[0] + xs.at(-1)) / 2 : leaf++;
    pos[v] = { x, depth };
    return x;
  };
  for (let v = 1; v <= n; v++) if (parent[v] === v) { place(v, 0); leaf += 0.35; }
  return pos;
}

export const unionFind = {
  view(run, e) {
    const n = run.n, pos = forestLayout(e.parent, n), gap = 50;
    const X = v => 26 + pos[v].x * gap, Y = v => 34 + pos[v].depth * 62;
    const depth = Math.max(...pos.slice(1).map(p => p.depth)), width = Math.max(...pos.slice(1).map(p => p.x));
    const ends = e.edge || [], cycle = e.key === 'uf.ev.cycle';
    let s = '';
    for (let v = 1; v <= n; v++) {
      const p = e.parent[v];
      if (p !== v) s += arrow(X(v), Y(v), X(p), Y(p), 21, `edge${e.moved.includes(v) ? ' on' : ''}`);
    }
    for (let v = 1; v <= n; v++) {
      const cls = ends.includes(v) ? (cycle ? 'bad' : 'cur') : e.roots.includes(v) ? 'root' : e.path.includes(v) ? 'path' : '';
      s += node(X(v), Y(v), v, cls);
      if (e.parent[v] === v) {
        const label = `r${e.rank[v]}`;
        s += `<rect class="badge-r" x="${X(v) + 12}" y="${Y(v) - 31}" width="26" height="18" rx="4"/>` + text(X(v) + 25, Y(v) - 22, label, 'badge-t');
      }
    }
    const top = 34 + depth * 62 + 46, ax = 60;
    s += text(0, top + CELL / 2, 'parent', 'lbl');
    for (let v = 1; v <= n; v++) {
      const x = ax + (v - 1) * STEP, cls = e.moved.includes(v) ? 'win' : ends.includes(v) ? (cycle ? 'bad' : 'cur') : e.parent[v] === v ? 'src' : '';
      s += `<rect class="cell ${cls}" x="${x}" y="${top}" width="${CELL}" height="${CELL}" rx="6"/>` + text(x + CELL / 2, top + CELL / 2, e.parent[v], `cv ${cls}`)
        + text(x + CELL / 2, top + CELL + 13, v, 'idx');
    }
    return svg(Math.max(52 + width * gap + 40, ax + n * STEP), top + CELL + 22, s);
  },
  vars(run, e) {
    const sets = e.parent.filter((p, v) => v && p === v).length;
    return [
      ['var.edges', chips(run.edges.map(([a, b], k) => chip(`${a}-${b}`, k === e.k ? 'new' : e.status[k] === 'join' ? 'hit' : e.status[k] === 'cycle' ? 'bad' : '')))],
      ['var.sets', chip(sets, 'amb')],
    ];
  },
};

/* ---------- Swim in Rising Water ---------- */
export const swim = {
  view(run, e) {
    const n = run.grid.length, startPool = e.pool[0][0], endPool = e.pool[n - 1][n - 1], done = e.key === 'sw.ev.done';
    const clsOf = (v, r, c) => {
      if (done && has(e.path, r, c)) return 'ok';
      if (e.cur && e.cur[0] === r && e.cur[1] === c) return 'cur';
      const pool = e.pool[r][c];
      if (pool === null) return '';
      if (pool === startPool) return 'g3';
      if (pool === endPool) return 'g1';
      return 'g0';
    };
    const overlay = at => note(0, 0, 'S', at, 'idx sg-mark', 'bl') + note(n - 1, n - 1, 'E', at, 'idx sg-mark', 'bl');
    return gridStage(run.grid, clsOf, v => v, overlay);
  },
  vars(run, e) {
    const pools = new Set(e.pool.flat().filter(p => p !== null)).size;
    return [['var.waterLevel', chip(e.t === null ? '—' : e.t, 'hit')], ['var.pools', chip(pools, 'amb')]];
  },
};
