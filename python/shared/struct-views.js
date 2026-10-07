/**
 * Structure views for algorithm rigs: bars, cells, grid, stack, queue, call stack… drawn from the memory snapshot.
 * A rig declares `view: { kind, of: 'nums', pointers: ['i', 'j'], … }`; the data is whatever those names hold right now.
 */
import { svg, text, cells, pointers, barLayout, bars, gridCells, CELL, STEP, rowWidth } from '../../algorithms/patterns/view-kit.js?v=202610071646';
import { esc } from '../../assets/vhs.js?v=202610071646';

function find(mem, name) {
  for (let i = mem.frames.length - 1; i >= 0; i--) {
    const hit = mem.frames[i].vars.find(([n]) => n === name);
    if (hit) return { id: hit[1], obj: mem.objects[hit[1]] };
  }
  return { id: null, obj: null };
}
const atom = o => (o && o.value !== undefined ? o.value : null);
const intOf = (mem, name) => { const { obj } = find(mem, name); const v = atom(obj); return v !== null && /^-?\d+$/.test(v) ? Number(v) : null; };
const strOf = (mem, name) => { const { obj } = find(mem, name); return obj && obj.type === 'str' ? unquote(obj.value) : null; };
const unquote = s => (s.length >= 2 && (s[0] === "'" || s[0] === '"') ? s.slice(1, -1).replace(/\\n/g, '↵').replace(/\\'/g, "'").replace(/\\\\/g, '\\') : s);
const itemsOf = (mem, o) => (o && o.items ? o.items.map(id => mem.objects[id]) : []);
const listOf = (mem, name) => { const { id, obj } = find(mem, name); return { id, obj, items: itemsOf(mem, obj) }; };
const valueText = o => (!o ? '' : o.value !== undefined ? unquote(String(o.value)) : o.type === 'list' ? `[${o.length}]` : o.type);
const numberOf = o => { const v = atom(o); return v !== null && /^-?\d+(\.\d+)?$/.test(v) ? Number(v) : null; };

function pointerList(spec, mem, count) {
  return (spec.pointers || []).map(p => {
    const name = typeof p === 'string' ? p : p.name;
    const v = intOf(mem, name);
    if (v === null) return null;
    const i = v < 0 ? v + count : v;
    return { i, label: typeof p === 'string' ? p : (p.label || p.name), cls: typeof p === 'string' ? '' : (p.cls || '') };
  }).filter(Boolean);
}

function touchedOn(event, id) {
  const map = new Map();
  for (const t of event.touched || []) if (t.id === id && typeof t.key === 'number') map.set(t.key, t.op);
  return map;
}

const framed = (w, h, inner) => svg(w + 20, h, `<g transform="translate(10,0)">${inner}</g>`);

/* ---------- bars ---------- */
function barsView(spec, mem, event) {
  const { id, items } = listOf(mem, spec.of);
  const values = items.map(numberOf);
  if (!values.length || values.some(v => v === null)) return empty(spec.of);
  const lay = barLayout(values.map(v => Math.max(0, v)), { bw: values.length > 14 ? 18 : 28, gap: values.length > 14 ? 6 : 10, unit: Math.max(4, Math.min(16, 180 / Math.max(1, ...values))) });
  const touched = touchedOn(event, id);
  const done = spec.done ? spec.done(mem, event, values) : new Set();
  const cls = values.map((_, i) => (touched.get(i) === 'write' ? 'swap' : touched.get(i) === 'read' ? 'cmp' : done.has(i) ? 'done' : ''));
  const ranges = (spec.ranges || []).map(r => ({ lo: intOf(mem, r.from), hi: intOf(mem, r.to), cls: r.cls || 'win' })).filter(r => r.lo !== null && r.hi !== null);
  for (const r of ranges) for (let i = Math.max(0, r.lo); i <= Math.min(values.length - 1, r.hi); i++) if (!cls[i]) cls[i] = r.cls;
  let s = bars(values.map(v => Math.max(0, v)), lay, cls);
  for (const p of pointerList(spec, mem, values.length)) if (p.i >= 0 && p.i < values.length) s += `<g class="ptr ${p.cls}"><path d="M${lay.mid(p.i) - 6} ${lay.base + 30}L${lay.mid(p.i) + 6} ${lay.base + 30}L${lay.mid(p.i)} ${lay.base + 21}Z"/>${text(lay.mid(p.i), lay.base + 40, p.label)}</g>`;
  const extra = (spec.counters || []).map(c => `${c}=${intOf(mem, c) ?? '?'}`).join('  ');
  if (extra) s += text(lay.width / 2, 14, extra, 'lbl-c');
  return svg(lay.width, lay.height + 26, s);
}

/* ---------- cells (list of anything) / string ---------- */
function cellsView(spec, mem, event) {
  const isStr = spec.kind === 'string';
  let values, id;
  if (isStr) { const s = strOf(mem, spec.of); if (s === null) return empty(spec.of); values = [...s]; id = find(mem, spec.of).id; }
  else { const l = listOf(mem, spec.of); values = l.items.map(valueText); id = l.id; if (!l.obj) return empty(spec.of); }
  const touched = touchedOn(event, id);
  const marks = spec.marks ? spec.marks(mem, event, values) : {};
  const cls = values.map((_, i) => marks[i] || (touched.get(i) === 'write' ? 'ok' : touched.get(i) === 'read' ? 'cur' : ''));
  const ranges = (spec.ranges || []).map(r => ({ lo: intOf(mem, r.from), hi: intOf(mem, r.to), cls: r.cls || 'win' })).filter(r => r.lo !== null && r.hi !== null);
  for (const r of ranges) for (let i = Math.max(0, r.lo); i <= Math.min(values.length - 1, r.hi); i++) if (!cls[i]) cls[i] = r.cls;
  const top = 40;
  let s = cells(values.map(v => (String(v).length > 5 ? String(v).slice(0, 4) + '…' : v)), cls, { y: top }) + pointers(pointerList(spec, mem, values.length), { y: top, count: values.length });
  if (spec.negIndex) values.forEach((_, i) => { s += text(i * STEP + CELL / 2, top + CELL + 28, i - values.length, 'idx neg'); });
  if (!values.length) s += text(30, top + CELL / 2, '∅', 'idx');
  const extra = (spec.counters || []).map(c => `${c} = ${find(mem, c).obj ? valueText(find(mem, c).obj) : '?'}`).join('   ');
  if (extra) s += text(Math.max(60, rowWidth(values.length)) / 2, 16, extra, 'lbl-c');
  return framed(Math.max(60, rowWidth(values.length)), top + CELL + (spec.negIndex ? 40 : 24), s);
}

/* ---------- grid (list of lists, or list of strings) ---------- */
function gridView(spec, mem, event) {
  const { obj } = listOf(mem, spec.of);
  if (!obj) return empty(spec.of);
  const rows = itemsOf(mem, obj).map(r => (r.type === 'str' ? [...unquote(r.value)] : itemsOf(mem, r).map(valueText)));
  if (!rows.length || !rows[0].length) return empty(spec.of);
  const cursor = spec.cursor ? spec.cursor.map(n => intOf(mem, n)) : [null, null];
  const touchedRows = new Set((event.touched || []).filter(t => rows.some((_, i) => itemsOf(mem, obj)[i] && t.id === obj.items[i])).map(t => t.key));
  void touchedRows;
  const cellOf = (v, r, c) => {
    const custom = spec.cell ? spec.cell(v, r, c, mem, event) : null;
    const base = custom || { cls: v === '#' || v === '1' && spec.binary ? 'land' : v === '.' || v === '0' ? 'water' : '', label: v };
    if (cursor[0] === r && cursor[1] === c) base.cls += ' focus';
    return { tcls: '', ...base };
  };
  return gridCells(rows, cellOf, { size: rows[0].length > 12 ? 26 : 36, step: rows[0].length > 12 ? 29 : 40 });
}

/* ---------- stack / queue ---------- */
function stackView(spec, mem) {
  const { items } = listOf(mem, spec.of);
  const values = items.map(valueText);
  const w = 120, h = Math.max(1, values.length) * 30 + 44;
  let s = `<rect class="span" x="20" y="10" width="${w - 40}" height="${h - 30}" rx="6"/>`;
  values.forEach((v, i) => { const y = h - 30 - (i + 1) * 30 + 4; s += `<rect class="cell${i === values.length - 1 ? ' cur' : ''}" x="28" y="${y}" width="${w - 56}" height="26" rx="5"/>${text(w / 2, y + 13, String(v).length > 8 ? String(v).slice(0, 7) + '…' : v, 'cv')}`; });
  s += text(w / 2, h - 10, spec.label || spec.of, 'idx');
  if (values.length) s += text(w - 8, h - 30 - values.length * 30 + 17, '← top', 'idx');
  if (!values.length) s += text(w / 2, h / 2 - 6, 'empty', 'idx');
  return svg(w + 40, h, s);
}
function queueView(spec, mem) {
  const { items } = listOf(mem, spec.of);
  const values = items.map(valueText);
  const w = Math.max(80, values.length * STEP + 20);
  let s = cells(values.map(v => (String(v).length > 5 ? String(v).slice(0, 4) + '…' : v)), values.map((_, i) => (i === 0 ? 'cur' : '')), { y: 30, index: false });
  s += text(0, 16, 'front →', 'lbl') + text(Math.max(0, rowWidth(values.length) - 44), 16, '← back', 'lbl');
  if (!values.length) s += text(30, 52, 'empty', 'idx');
  return framed(w, 90, s);
}

/* ---------- call stack (recursion) ---------- */
function callStackView(spec, mem) {
  const frames = mem.frames.slice(1);
  const w = 220, rowH = 34, h = Math.max(1, frames.length) * rowH + 30;
  let s = text(w / 2, 14, spec.label || 'call stack', 'lbl-c');
  frames.forEach((f, i) => {
    const y = h - (i + 1) * rowH + 2;
    const args = f.vars.filter(([n]) => !spec.hide || !spec.hide.includes(n)).slice(0, 4).map(([n, id]) => `${n}=${valueText(mem.objects[id])}`).join(', ');
    s += `<rect class="cell${i === frames.length - 1 ? ' cur' : ''}" x="10" y="${y}" width="${w - 20}" height="${rowH - 6}" rx="5"/>${text(w / 2, y + (rowH - 6) / 2, `${f.name}(${args})`, 'cv small')}`;
  });
  if (!frames.length) s += text(w / 2, h / 2 + 6, '— no calls —', 'idx');
  return svg(w, h, s);
}

/* ---------- counts (dict of int) ---------- */
function countsView(spec, mem) {
  const { obj } = find(mem, spec.of);
  if (!obj || !obj.entries) return empty(spec.of);
  const rows = obj.entries.map(([k, v]) => [valueText(mem.objects[k]), numberOf(mem.objects[v])]);
  const max = Math.max(1, ...rows.map(r => r[1] || 0));
  const h = rows.length * 24 + 16;
  let s = '';
  rows.forEach(([k, v], i) => { const y = 8 + i * 24; s += text(40, y + 11, k, 'cv', ) + `<rect class="hbar" x="56" y="${y + 2}" width="${Math.max(2, (v || 0) / max * 160)}" height="18" rx="3"/>` + text(60 + Math.max(2, (v || 0) / max * 160) + 6, y + 11, v, 'idx'); });
  if (!rows.length) s += text(100, 20, 'empty', 'idx');
  return svg(260, h, s);
}

/* ---------- pegs (Hanoi) ---------- */
function pegsView(spec, mem) {
  const names = spec.of;
  const pegs = names.map(n => listOf(mem, n).items.map(numberOf));
  const maxDisk = Math.max(1, ...pegs.flat().filter(x => x !== null));
  const pw = 120, h = 150;
  let s = '';
  pegs.forEach((disks, p) => {
    const cx = p * pw + pw / 2;
    s += `<rect class="axis" x="${cx - 2}" y="20" width="4" height="110"/><rect class="span" x="${cx - 50}" y="128" width="100" height="6" rx="2"/>` + text(cx, 146, names[p], 'idx');
    disks.forEach((d, i) => { const w = 20 + (d / maxDisk) * 76; s += `<rect class="hbar l" x="${cx - w / 2}" y="${118 - i * 16}" width="${w}" height="14" rx="4"/>` + text(cx, 125 - i * 16, d, 'badge-t'); });
  });
  return svg(names.length * pw, h, s);
}

/* ---------- board (list of column indices → queens) ---------- */
function boardView(spec, mem) {
  const { items } = listOf(mem, spec.of);
  const n = intOf(mem, spec.size) ?? items.length;
  const cols = items.map(numberOf);
  const rows = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => (cols[r] === c ? 'Q' : '')));
  return gridCells(rows, (v, r, c) => ({ cls: (r + c) % 2 ? 'sq-d' : 'sq-l', label: v ? '♛' : '', tcls: v ? 'queen' : '' }), { size: 34, step: 36 });
}

const empty = name => svg(160, 40, text(80, 20, `${name} = ?`, 'idx'));

export function structView(spec, mem, event, run) {
  switch (spec.kind) {
    case 'bars': return barsView(spec, mem, event);
    case 'cells': case 'string': return cellsView(spec, mem, event);
    case 'grid': return gridView(spec, mem, event);
    case 'stack': return stackView(spec, mem);
    case 'queue': return queueView(spec, mem);
    case 'callstack': return callStackView(spec, mem);
    case 'counts': return countsView(spec, mem);
    case 'pegs': return pegsView(spec, mem);
    case 'board': return boardView(spec, mem);
    case 'multi': return `<div class="multi">${spec.views.map(v => `<div class="mv"><p class="lbl">${esc(v.title || v.of || '')}</p>${structView(v, mem, event, run)}</div>`).join('')}</div>`;
    case 'custom': return spec.render(mem, event, run);
    default: return empty(spec.of || spec.kind);
  }
}

export { find as findVar, intOf, strOf, listOf, valueText, numberOf, unquote };
