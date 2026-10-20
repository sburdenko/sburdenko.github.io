/** Views for chapter 13: arrays and matrices. view(run, event) → SVG string, vars(run, event) → [[i18nKey, html]]. */
import {
  CELL, STEP, svg, text, rowWidth, cells, pointers, chip, chips,
  matrixXY, matrixCells, matrixIndex, matrixBox, matrixArrow,
} from './view-kit.js?v=202610201333';

const TOP = 40;
const has = (list, r, c) => list.some(([a, b]) => a === r && b === c);

/** The shared matrix stage: column and row numbers, an underlay (axes), the cells, then overlays drawn on top. */
function matrixStage(m, clsOf, { overlay = () => '', underlay = () => '', labelOf } = {}) {
  const x = 26, y = 26, rows = m.length, cols = m[0].length, at = { x, y };
  const inner = matrixIndex(rows, cols, at) + underlay(at) + matrixCells(m, clsOf, { ...at, labelOf }) + overlay(at);
  return svg(x + rowWidth(cols) + 10, y + rowWidth(rows) + 10, inner);
}

/* ---------- Product of Array Except Self ---------- */
export const productExcept = {
  view(run, e) {
    const n = run.nums.length, x = 52, y2 = TOP + CELL + 40, done = e.phase === 'done';
    const cover = j => (e.i == null ? false : e.phase === 'L' ? j < e.i : j > e.i);
    const clsN = run.nums.map((_, j) => (j === e.i ? 'cur' : cover(j) ? 'win' : ''));
    const clsA = e.ans.map((v, j) => {
      if (v === null) return 'dim';
      if (j === e.i) return 'cur';
      if (done || (e.phase === 'R' && (e.i == null ? false : j > e.i))) return 'ok';
      return 'src';
    });
    return svg(x + rowWidth(n) + 10, y2 + CELL + 22,
      text(4, TOP + CELL / 2, 'nums', 'lbl') + cells(run.nums, clsN, { x, y: TOP })
      + pointers([{ i: done ? null : e.i, label: 'i' }], { x, y: TOP, count: n })
      + text(4, y2 + CELL / 2, 'ans', 'lbl') + cells(e.ans.map(v => (v === null ? '·' : v)), clsA, { x, y: y2 }));
  },
  vars(run, e) {
    return [['var.prefixProd', chip(e.prefix, e.phase === 'L' ? 'new' : '')], ['var.suffixProd', chip(e.suffix, e.phase === 'R' ? 'new' : '')]];
  },
};

/* ---------- Rotate Image ---------- */
/** Transpose swaps go row by row over the cells above the diagonal: (a, b) is done once (r, c) has passed it. */
const swapped = (a, b, [r, c]) => a < r || (a === r && b <= c);

export const rotate = {
  view(run, e) {
    const n = e.m.length;
    const clsOf = (v, r, c) => {
      if (e.pair && has(e.pair, r, c)) return 'cur';
      if (e.phase === 'done') return 'ok';
      if (e.phase === 'T') return r === c ? 'win' : e.pair && swapped(Math.min(r, c), Math.max(r, c), e.pair[0]) ? 'src' : '';
      if (e.row != null && r < e.row) return 'ok';
      return r === e.row ? 'win' : '';
    };
    const underlay = at => {
      if (n < 2 || e.phase === 'done') return '';
      if (e.phase === 'T') {
        const [x1, y1] = matrixXY(0, 0, at), [x2, y2] = matrixXY(n - 1, n - 1, at);
        return `<line class="cutline" x1="${x1 - 4}" y1="${y1 - 4}" x2="${x2 + CELL + 4}" y2="${y2 + CELL + 4}"/>`;
      }
      const mid = at.x + (n * STEP - STEP + CELL) / 2;
      return `<line class="cutline" x1="${mid}" y1="${at.y - 4}" x2="${mid}" y2="${at.y + rowWidth(n) + 4}"/>`;
    };
    return matrixStage(e.m, clsOf, { underlay });
  },
  vars(run, e) {
    return [['var.swaps', chip(e.swaps, 'hit')]];
  },
};

/* ---------- Set Matrix Zeroes ---------- */
export const setZeroes = {
  view(run, e) {
    const clsOf = (v, r, c) => {
      if (e.at && e.at[0] === r && e.at[1] === c) return 'cur';
      if (has(e.changed, r, c)) return 'bad';
      if (has(e.marks, r, c)) return 'src';
      if (e.phase !== 'done' && (r === 0 || c === 0)) return v === 0 ? 'win src' : 'win';
      return v === 0 ? 'seen' : '';
    };
    const overlay = at => (e.key === 'smz.ev.row' ? matrixBox([e.args[0], 0, e.args[0], e.m[0].length - 1], 'cutline-box', at) : '');
    return matrixStage(e.m, clsOf, { overlay });
  },
  vars(run, e) {
    const flag = v => chip(v == null ? '?' : String(v), v ? 'amb' : '');
    return [['var.firstRowZero', flag(e.rowZero)], ['var.firstColZero', flag(e.colZero)]];
  },
};

/* ---------- Spiral Matrix ---------- */
export const spiral = {
  view(run, e) {
    const step = new Map(e.order.map(([r, c], k) => [`${r},${c}`, k + 1]));
    const clsOf = (v, r, c) => (has(e.run, r, c) ? 'cur' : step.has(`${r},${c}`) ? (e.key === 'spi.ev.done' ? 'ok' : 'seen') : '');
    const overlay = at => {
      let s = matrixBox([e.top, e.left, e.bottom, e.right], 'cutline-box', at);
      if (e.run.length > 1) s += matrixArrow(e.run[0], e.run.at(-1), 'edge on', at);
      for (const [key, k] of step) {
        const [r, c] = key.split(',').map(Number), [cx, cy] = matrixXY(r, c, at);
        s += text(cx + 9, cy + 9, k, 'idx');
      }
      return s;
    };
    return matrixStage(run.matrix, clsOf, { overlay });
  },
  vars(run, e) {
    const bounds = `${e.top} / ${e.bottom} / ${e.left} / ${e.right}`;
    return [['var.bounds', chip(bounds)], ['var.answer', chips(e.order.map(([r, c], k) => chip(run.matrix[r][c], k >= e.order.length - e.run.length ? 'new' : '')))]];
  },
};

/* ---------- Maximal Rectangle ---------- */
export const maxRect = {
  view(run, e) {
    const m = run.grid, rows = m.length, cols = m[0].length, x = 70, y = 26, at = { x, y };
    const yh = y + rowWidth(rows) + 34, done = e.key === 'mrect.ev.done';
    const inBox = (box, r, c) => box && r >= box[0] && r <= box[2] && c >= box[1] && c <= box[3];
    const clsOf = (v, r, c) => {
      if (done) return inBox(e.bestRect, r, c) ? 'ok' : v ? '' : 'dim';
      if (!v) return 'dim';
      if (e.r == null || r > e.r) return '';
      if (r === e.r && c === e.i) return 'cur';
      return r > e.r - e.h[c] ? 'win' : '';
    };
    let s = matrixIndex(rows, cols, at) + matrixCells(m, clsOf, at);
    if (e.r != null) s += text(x - 22, y + e.r * STEP + CELL / 2, '▶', 'idx need');
    if (e.rect) s += matrixBox(e.rect, 'water', at);
    if (e.bestRect && !done) s += matrixBox(e.bestRect, 'best', at);
    const clsH = e.h.map((_, c) => (c === e.i && !done ? 'cur' : e.stack.includes(c) ? 'src' : e.r == null || done ? 'dim' : ''));
    s += text(4, yh + CELL / 2, 'heights', 'lbl') + cells(e.h, clsH, { x, y: yh })
      + pointers([{ i: done ? null : e.i, label: 'i' }], { x, y: yh, count: cols });
    return svg(x + rowWidth(cols) + 10, yh + CELL + 22, s);
  },
  vars(run, e) {
    return [['var.stackCols', chips(e.stack.map(j => chip(`${j}:${e.h[j]}`, 'amb')))], ['var.best', chip(e.best, 'hit')]];
  },
};

/* ---------- Game of Life ---------- */
const bits = v => `${(v >> 1) & 1}${v & 1}`;

export const gameOfLife = {
  view(run, e) {
    const cols = e.b[0].length;
    const visited = (r, c) => e.at && (r < e.at[0] || (r === e.at[0] && c <= e.at[1]));
    const four = v => ['', 'g1', 'g2', 'g3'][v], now = v => (v & 1 ? 'g3' : '');
    const clsOf = (v, r, c) => {
      if (e.at && e.at[0] === r && e.at[1] === c) return 'cur';
      const near = has(e.around, r, c) || e.row === r ? ' win' : '';
      if (e.phase === 'count') return (visited(r, c) ? four(v) : now(v)) + near;
      if (e.phase === 'shift' && (e.row == null || r > e.row)) return four(v) + near;
      return now(v) + near;
    };
    const overlay = at => e.b.map((row, r) => row.map((v, c) => {
      const [x, y] = matrixXY(r, c, at);
      return text(x + CELL - 9, y + 9, bits(v), 'idx');
    }).join('')).join('') + (e.row != null ? matrixBox([e.row, 0, e.row, cols - 1], 'cutline-box', at) : '');
    return matrixStage(e.b, clsOf, { overlay });
  },
  vars(run, e) {
    const out = [];
    if (e.at) {
      const v = e.b[e.at[0]][e.at[1]];
      out.push(['var.liveAround', chip(e.live, 'amb')], ['var.cellBits', chip(`${v} = ${bits(v)}₂`, v > 1 ? 'hit' : '')]);
    }
    return out;
  },
};
