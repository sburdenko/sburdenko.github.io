/** SVG primitives for the pattern rigs. Pure string builders: no DOM, safe to call from tests. */
import { esc } from '../../assets/vhs.js?v=202610191738';

export const CELL = 44, GAP = 6, STEP = CELL + GAP;

export const text = (x, y, value, cls = '') =>
  `<text x="${x}" y="${y}" class="${cls}" dominant-baseline="central">${esc(value)}</text>`;

export const svg = (w, h, inner) =>
  `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg" role="img">${inner}</svg>`;

export const rowWidth = n => Math.max(0, n * STEP - GAP);

export const chip = (value, cls = '') => `<span class="vchip ${cls}">${esc(value)}</span>`;
export const chips = (list, empty = '—') => (list.length ? list.join('') : `<span class="vchip empty">${empty}</span>`);

export function cells(values, cls = [], { x = 0, y = 0, index = true } = {}) {
  return values.map((v, i) => {
    const cx = x + i * STEP, c = cls[i] || '';
    return `<rect class="cell ${c}" x="${cx}" y="${y}" width="${CELL}" height="${CELL}" rx="6"/>`
      + text(cx + CELL / 2, y + CELL / 2, v, `cv ${c}`)
      + (index ? text(cx + CELL / 2, y + CELL + 13, i, 'idx') : '');
  }).join('');
}

export function pointerAt(cx, y, label, cls = '') {
  return `<g class="ptr ${cls}"><path d="M${cx - 6} ${y - 13}L${cx + 6} ${y - 13}L${cx} ${y - 4}Z"/>${text(cx, y - 22, label)}</g>`;
}

/** Pointers that land on the same cell share one marker with a joined label. */
export function pointers(list, { x = 0, y = 0, count = Infinity } = {}) {
  const groups = new Map();
  for (const p of list) {
    if (p.i == null || p.i < 0 || p.i >= count) continue;
    groups.set(p.i, [...(groups.get(p.i) || []), p]);
  }
  return [...groups].map(([i, group]) =>
    pointerAt(x + i * STEP + CELL / 2, y, group.map(p => p.label).join(' '), group[0].cls || '')).join('');
}

export function arcBelow(from, to, y, depth, cls = '', label = '', x = 0) {
  const x1 = x + from * STEP + CELL / 2, x2 = x + to * STEP + CELL / 2;
  const marker = cls.includes('pick') ? 'pat-ah-ok' : 'pat-ah-amb';
  return `<path class="arc ${cls}" d="M${x1} ${y} Q${(x1 + x2) / 2} ${y + depth * 2} ${x2} ${y}" marker-end="url(#${marker})"/>`
    + (label ? text((x1 + x2) / 2, y + depth + 10, label, `arc-t ${cls}`) : '');
}

export function arrow(x1, y1, x2, y2, gap = 22, cls = 'edge') {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
  return `<line class="${cls}" x1="${x1 + ux * gap}" y1="${y1 + uy * gap}" x2="${x2 - ux * (gap + 2)}" y2="${y2 - uy * (gap + 2)}" marker-end="url(#pat-ah)"/>`;
}

export const node = (x, y, value, cls = '', r = 19) =>
  `<circle class="node ${cls}" cx="${x}" cy="${y}" r="${r}"/>` + text(x, y, value, `nt ${cls}`);

/** Bar chart used by container, trapping rain water, histogram and stock rigs. */
export function barLayout(values, { bw = 30, gap = 10, unit = 16, top = 46 } = {}) {
  const max = Math.max(1, ...values), base = top + max * unit;
  const x = i => 10 + i * (bw + gap), mid = i => x(i) + bw / 2;
  return { bw, unit, base, x, mid, width: values.length * (bw + gap) - gap + 20, height: base + 26 };
}

export function bars(values, lay, cls = []) {
  return values.map((v, i) => `<rect class="hbar ${cls[i] || ''}" x="${lay.x(i)}" y="${lay.base - v * lay.unit}" width="${lay.bw}" height="${v * lay.unit}" rx="3"/>`
    + text(lay.mid(i), lay.base + 14, v, 'idx')).join('')
    + `<line class="axis" x1="4" x2="${lay.width - 4}" y1="${lay.base}" y2="${lay.base}"/>`;
}

/** coords: row numbers on the left and column numbers on top (from 0), the grid moves right and down to make room. */
export function gridCells(rows, cellOf, { size = 40, step = 44, pad = 8, coords = false } = {}) {
  const ox = pad + (coords ? 16 : 0), oy = pad + (coords ? 16 : 0);
  let s = '';
  if (coords) {
    rows[0].forEach((_, c) => { s += text(ox + c * step + size / 2, oy - 10, c, 'idx'); });
    rows.forEach((_, r) => { s += text(ox - 12, oy + r * step + size / 2, r, 'idx'); });
  }
  rows.forEach((row, r) => row.forEach((v, c) => {
    const { cls, label, tcls = '' } = cellOf(v, r, c);
    const x = ox + c * step, y = oy + r * step;
    s += `<rect class="gcell ${cls}" x="${x}" y="${y}" width="${size}" height="${size}" rx="5"/>` + text(x + size / 2, y + size / 2, label, `gt ${tcls}`);
  }));
  return svg(rows[0].length * step + ox + 4, rows.length * step + oy + 4, s);
}

/** Binary tree from layoutTree(): clsOf(node) → class, badgeOf(node) → text or null, noteOf(node) → text under the node. */
export function binaryTree(nodes, { clsOf, badgeOf = () => null, noteOf = () => null, edgeOn = () => false }) {
  const px = n => 36 + n.x * 62, py = n => 34 + n.depth * 70;
  let s = '';
  for (const n of nodes) {
    for (const child of [n.l, n.r]) {
      if (child < 0) continue;
      const c = nodes[child];
      s += `<line class="edge${edgeOn(c) ? ' on' : ''}" x1="${px(n)}" y1="${py(n)}" x2="${px(c)}" y2="${py(c)}"/>`;
    }
  }
  for (const n of nodes) {
    const cls = clsOf(n);
    s += node(px(n), py(n), n.v, cls);
    const badge = badgeOf(n);
    if (badge != null) {
      const w = Math.max(20, String(badge).length * 8 + 8);
      s += `<rect class="badge-r" x="${px(n) + 12}" y="${py(n) - 31}" width="${w}" height="18" rx="4"/>` + text(px(n) + 12 + w / 2, py(n) - 22, badge, 'badge-t');
    }
    const note = noteOf(n);
    if (note != null) s += text(px(n), py(n) + 31, note, 'idx');
  }
  const depth = Math.max(0, ...nodes.map(n => n.depth));
  return svg(72 + Math.max(0, nodes.length - 1) * 62, 34 + depth * 70 + 48, s);
}

/** Decision tree from model-c: highlights the path to the current node, answers and pruned branches. */
export function decisionTreeView(nodes, cur, isAnswer, { gapX = 60 } = {}) {
  const px = n => 32 + n.x * gapX, py = n => 22 + n.depth * 58;
  const onPath = new Set();
  for (let p = cur; p != null && p >= 0; p = nodes[p].parent) onPath.add(p);
  const visited = n => cur == null || n.id <= cur;
  let s = '';
  for (const n of nodes) {
    if (n.parent < 0) continue;
    const p = nodes[n.parent], x1 = px(p), y1 = py(p) + 12, x2 = px(n), y2 = py(n) - 12;
    s += `<line class="edge ${onPath.has(n.id) ? 'on' : visited(n) ? '' : 'dim'}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
    s += text((x1 + x2) / 2 + (x2 < x1 ? -10 : x2 > x1 ? 10 : 12), (y1 + y2) / 2, n.edge, `idx${visited(n) ? '' : ' dim'}`);
  }
  for (const n of nodes) {
    const cls = n.id === cur ? (n.cut ? 'bad' : 'cur') : onPath.has(n.id) ? 'path' : !visited(n) ? 'dim'
      : n.cut ? 'cutn' : isAnswer(n) ? 'ok' : '';
    const w = Math.max(40, n.label.length * 9 + 14);
    s += `<rect class="node ${cls}" x="${px(n) - w / 2}" y="${py(n) - 12}" width="${w}" height="24" rx="6"/>` + text(px(n), py(n), n.label, `nt small ${cls}`);
  }
  const leaves = Math.max(1, ...nodes.map(n => n.x + 1)), depth = Math.max(...nodes.map(n => n.depth));
  return svg(64 + (leaves - 1) * gapX, 22 + depth * 58 + 26, s);
}

/** DP table for two strings: row labels from a, column labels from b. */
export function dpTable(a, b, dp, cur, src) {
  const size = 34, step = 38, ox = 56, oy = 48;
  const isSrc = (i, j) => src.some(([si, sj]) => si === i && sj === j);
  let s = '';
  ['∅', ...b].forEach((ch, j) => { s += text(ox + j * step + size / 2, oy - 16, ch, 'lbl-c'); });
  ['∅', ...a].forEach((ch, i) => { s += text(ox - 18, oy + i * step + size / 2, ch, 'lbl-c'); });
  dp.forEach((row, i) => row.forEach((v, j) => {
    const cls = cur && cur[0] === i && cur[1] === j ? 'cur' : isSrc(i, j) ? 'src' : v === null ? 'dim' : '';
    const x = ox + j * step, y = oy + i * step;
    s += `<rect class="cell ${cls}" x="${x}" y="${y}" width="${size}" height="${size}" rx="5"/>` + text(x + size / 2, y + size / 2, v === null ? '' : v, `cv ${cls}`);
  }));
  return svg(ox + dp[0].length * step + 10, oy + dp.length * step + 10, s);
}

/* ---------- integer matrices: cells line up with cells(), so a matrix and a row under it share columns ---------- */
export const matrixXY = (r, c, { x = 0, y = 0 } = {}) => [x + c * STEP, y + r * STEP];

/** Matrix cells at (x, y): clsOf(v, r, c) → class, labelOf(v, r, c) → text (the value by default). */
export function matrixCells(m, clsOf = () => '', { x = 0, y = 0, labelOf = v => v } = {}) {
  return m.map((row, r) => cells(row.map((v, c) => labelOf(v, r, c)), row.map((v, c) => clsOf(v, r, c)), { x, y: y + r * STEP, index: false })).join('');
}

/** Column numbers above and row numbers left of a matrix drawn at (x, y). */
export function matrixIndex(rows, cols, { x = 0, y = 0 } = {}) {
  let s = '';
  for (let c = 0; c < cols; c++) s += text(x + c * STEP + CELL / 2, y - 11, c, 'idx');
  for (let r = 0; r < rows; r++) s += text(x - 12, y + r * STEP + CELL / 2, r, 'idx');
  return s;
}

/** A rectangle around rows r1..r2 and columns c1..c2 (cls: best, water, cutline, …). */
export function matrixBox([r1, c1, r2, c2], cls, { x = 0, y = 0, pad = 3 } = {}) {
  if (r2 < r1 || c2 < c1) return '';
  const [bx, by] = matrixXY(r1, c1, { x, y });
  return `<rect class="${cls}" x="${bx - pad}" y="${by - pad}" width="${(c2 - c1) * STEP + CELL + 2 * pad}" height="${(r2 - r1) * STEP + CELL + 2 * pad}" rx="7"/>`;
}

/** An arrow from the centre of cell a to the centre of cell b. */
export function matrixArrow([r1, c1], [r2, c2], cls = 'edge on', { x = 0, y = 0 } = {}) {
  const [x1, y1] = matrixXY(r1, c1, { x, y }), [x2, y2] = matrixXY(r2, c2, { x, y });
  return arrow(x1 + CELL / 2, y1 + CELL / 2, x2 + CELL / 2, y2 + CELL / 2, 8, cls);
}

/* ---------- the register: a 32-bit word, high bit on the left ---------- */
export const BIT = 20, BIT_STEP = 22, NIBBLE_GAP = 5;
/** Drawn this much larger than its viewBox: roomy on a desktop, and max-width: 100% shrinks it on a phone. */
const REG_ZOOM = 1.35;

/** The smallest register that shows every value: 8, 16 or 32 bits. A negative int needs all 32. */
export function bitWidth(values) {
  const max = Math.max(0, ...values.filter(v => v != null).map(v => v >>> 0));
  return max < 0x100 ? 8 : max < 0x10000 ? 16 : 32;
}

export const hexOf = (v, bits = 32) =>
  `0x${(bits === 32 ? v >>> 0 : v & ((1 << bits) - 1)).toString(16).toUpperCase().padStart(bits / 4, '0')}`;
export const decOf = (v, signed = false) => String(signed ? v | 0 : v >>> 0).replace('-', '−');

/**
 * A register of 8, 16 or 32 bits: one row per operand, high bit on the left, nibbles spaced apart, the value in
 * decimal and hex above its bits. 32 bits wrap into two banks of 16 (bits 31–16, then 15–0), so a phone still
 * reads them and a column still lines up across the operands.
 * rows: [{ label, value, ref?, marks?: [[mask, cls]], unknown?: mask, cls?, caption?: string | false, signed? }]
 *   ref — bits that differ from ref are marked as changed; unknown — bits not decided yet, drawn as “·”.
 * opts: { bits, signed, cursor: bit index to frame across all rows, labelChars: the widest row name in the run,
 *   so the register does not shift sideways from step to step }.
 */
export function registerParts(rows, { bits = 32, signed = false, cursor = null, labelChars } = {}) {
  const per = Math.min(bits, 16), banks = bits / per;
  const REG_LABEL = Math.ceil((labelChars ?? Math.max(1, ...rows.map(r => String(r.label).length))) * 7.4) + 12;
  const xOf = p => REG_LABEL + p * BIT_STEP + Math.floor(p / 4) * NIBBLE_GAP;
  const width = xOf(per - 1) + BIT + 4;
  let back = '', s = text(0, 9, `${signed ? 'int32' : 'uint32'}${bits < 32 ? ` · ${31}…${bits} = 0` : ''}`, 'lbl');
  let y = 24;
  for (let bank = 0; bank < banks; bank++) {
    const hi = bits - 1 - bank * per;
    for (let p = 0; p < per; p++) s += text(xOf(p) + BIT / 2, y, hi - p, `idx${hi - p === cursor ? ' need' : ''}`);
    y += 12;
    const top = y;
    for (const row of rows) {
      const sg = row.signed ?? signed;
      if (bank === 0 && row.caption !== false) {
        s += text(xOf(0), y + 6, row.caption ?? `${decOf(row.value, sg)} · ${hexOf(row.value, bits)}`, `rcap ${row.cls || ''}`);
        y += 15;
      }
      s += text(REG_LABEL - 8, y + BIT / 2, row.label, `rlbl ${row.cls || ''}`);
      for (let p = 0; p < per; p++) {
        const i = hi - p, one = (row.value >>> i) & 1, unknown = row.unknown != null && (row.unknown >>> i) & 1;
        const marks = (row.marks || []).filter(([mask]) => (mask >>> i) & 1).map(([, cls]) => cls);
        if (row.ref != null && !unknown && ((row.ref ^ row.value) >>> i) & 1) marks.push('chg');
        const cls = [unknown ? 'unk' : one ? 'one' : 'zero', ...marks, row.cls || ''].join(' ');
        s += `<rect class="bit ${cls}" x="${xOf(p)}" y="${y}" width="${BIT}" height="${BIT}" rx="3"/>`
          + text(xOf(p) + BIT / 2, y + BIT / 2 + 0.5, unknown ? '·' : one, `bt ${cls}`);
      }
      y += BIT + 5;
    }
    if (cursor != null && cursor <= hi && cursor > hi - per) {
      const x = xOf(hi - cursor);
      back += `<rect class="bitcol" x="${x - 3}" y="${top - 3}" width="${BIT + 6}" height="${y - top + 1}" rx="4"/>`;
    }
    y += 10;
  }
  return { inner: back + s, width, height: y - 6 };
}

export function register(rows, opts) {
  const { inner, width, height } = registerParts(rows, opts);
  return `<svg viewBox="0 0 ${width} ${height}" width="${Math.round(width * REG_ZOOM)}" height="${Math.round(height * REG_ZOOM)}" xmlns="http://www.w3.org/2000/svg" role="img">${inner}</svg>`;
}
