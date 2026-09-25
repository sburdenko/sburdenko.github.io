/** SVG primitives for the pattern rigs. Pure string builders: no DOM, safe to call from tests. */
import { esc } from '../../assets/vhs.js?v=202609241230';

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
