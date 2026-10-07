/**
 * Memory diagram: frames with names on the left, objects on the right, arrows in between.
 * Pure function of a snapshot (see py/snapshot.js), so it can be tested without a DOM.
 */
import { esc } from '../../assets/vhs.js?v=202610071646';

const ATOMS = new Set(['int', 'float', 'str', 'bool', 'NoneType', 'bytes', 'range']);
const CH = 7.3, FONT = 12;
const CELL = 34, ROW = 22, HEAD = 18, PAD = 8, GAP = 14;
const FRAME_W = 150, FRAME_ROW = 24;
const COL_GAP = 26, MAX_COL_H = 460;

const tw = s => Math.ceil(String(s).length * CH);
const short = (s, n = 14) => (s.length > n ? s.slice(0, n - 1) + '…' : s);
const text = (x, y, s, cls = '', anchor = 'start') => `<text x="${x}" y="${y}" class="${cls}${anchor === 'middle' ? ' mid' : ''}" dominant-baseline="central">${esc(s)}</text>`;

const isAtom = o => ATOMS.has(o.type);
const atomText = o => (o.type === 'str' ? o.value : o.value);

/** Decides for every object whether it gets its own box or is drawn inline inside a container cell. */
function plan(mem, hide) {
  const boxed = new Set(), order = [];
  const named = new Set();
  for (const f of mem.frames) for (const [name, id] of f.vars) if (!hide.has(name)) named.add(id);
  const visit = id => {
    if (boxed.has(id)) return;
    const o = mem.objects[id];
    if (!o) return;
    if (isAtom(o) && !named.has(id)) return;
    boxed.add(id);
    order.push(id);
    for (const child of childrenOf(o)) visit(child);
  };
  for (const f of mem.frames) for (const [name, id] of f.vars) if (!hide.has(name)) visit(id);
  return { boxed, order };
}

function childrenOf(o) {
  const ids = [];
  if (o.items) ids.push(...o.items);
  if (o.entries) for (const [k, v] of o.entries) ids.push(k, v);
  if (o.attrs) for (const [, v] of o.attrs) ids.push(v);
  if (o.closure) for (const [, v] of o.closure) ids.push(v);
  if (o.defaults) for (const [, v] of o.defaults) ids.push(v);
  if (o.vars) for (const [, v] of o.vars) ids.push(v);
  if (o.bases) ids.push(...o.bases);
  if (o.clsId) ids.push(o.clsId);
  if (o.fn) ids.push(o.fn);
  if (o.self) ids.push(o.self);
  if (o.fget) ids.push(o.fget);
  if (o.wrapped) ids.push(o.wrapped);
  if (o.factory) ids.push(o.factory);
  return ids.filter(id => id != null);
}

/** Measures and draws one object box. Returns { w, h, draw(x, y) → { svg, anchors: {childId: [x, y]} } }. */
function boxOf(id, o, mem, boxed, flags) {
  const cls = `obj ${o.type} ${o.immutable ? 'imm' : 'mut'}${flags.changed.has(id) ? ' changed' : ''}${flags.error === id ? ' err' : ''}`;
  const head = `${o.type === 'instance' ? o.cls : o.type === 'class' ? 'class' : o.type}${o.length != null && !isAtom(o) ? ` · ${o.length}` : ''}`;
  const inline = cid => { const c = mem.objects[cid]; return c && isAtom(c) && !boxed.has(cid) ? short(atomText(c), 10) : null; };
  const cellW = ids => Math.max(CELL, Math.min(96, ...ids.map(cid => { const v = inline(cid); return v === null ? CELL : tw(v) + 12; })));
  const cellsRow = (ids, y0, x0, showIndex, touchedKeys, cw) => {
    let svg = '';
    const anchors = {};
    ids.forEach((cid, i) => {
      const cx = x0 + i * cw, val = inline(cid);
      const op = touchedKeys.get(i);
      svg += `<rect class="cell${op ? ' ' + op : ''}" x="${cx}" y="${y0}" width="${cw}" height="${ROW + 4}" rx="4"/>`;
      if (val !== null) svg += text(cx + cw / 2, y0 + (ROW + 4) / 2, val, 'cv', 'middle');
      else { svg += `<circle class="dot" cx="${cx + cw / 2}" cy="${y0 + (ROW + 4) / 2}" r="3"/>`; anchors[cid] = [cx + cw / 2, y0 + (ROW + 4) / 2]; }
      if (showIndex) svg += text(cx + cw / 2, y0 - 7, i, 'idx', 'middle');
    });
    return { svg, anchors };
  };

  if (isAtom(o)) {
    const label = atomText(o);
    const w = Math.max(64, tw(label) + 2 * PAD), h = HEAD + ROW + 6;
    return { w, h, draw: (x, y) => ({ svg: `<g class="${cls}" data-id="${id}"><rect class="box" x="${x}" y="${y}" width="${w}" height="${h}" rx="7"/>${text(x + PAD, y + HEAD / 2 + 2, o.type, 'ty')}${text(x + w / 2, y + HEAD + ROW / 2 + 3, label, 'val', 'middle')}</g>`, anchors: {} }) };
  }
  if (o.type === 'list' || o.type === 'tuple' || o.type === 'set' || o.type === 'frozenset' || o.type === 'deque') {
    const n = o.items.length, extra = o.type === 'list' && o.allocated > n ? Math.min(o.allocated - n, 12) : 0;
    const more = o.length - n;
    const showIndex = (o.type === 'list' || o.type === 'tuple' || o.type === 'deque') && n <= 16;
    const cw = n ? cellW(o.items) : CELL;
    const w = Math.max(tw(head) + 2 * PAD, (n + extra) * cw + 2 * PAD + (more > 0 ? 40 : 0), 70);
    const h = HEAD + (showIndex ? 12 : 4) + ROW + 4 + (showIndex && o.type !== 'deque' && n <= 10 ? 14 : 0) + PAD;
    return { w, h, draw: (x, y) => {
      const y0 = y + HEAD + (showIndex ? 12 : 4);
      const touchedKeys = new Map(flags.touched.filter(tc => tc.id === id && typeof tc.key === 'number').map(tc => [tc.key, tc.op]));
      const row = cellsRow(o.items, y0, x + PAD, showIndex && !o.fields, touchedKeys, cw);
      let svg = `<g class="${cls}" data-id="${id}"><rect class="box" x="${x}" y="${y}" width="${w}" height="${h}" rx="7"/>${text(x + PAD, y + HEAD / 2 + 2, head, 'ty')}${row.svg}`;
      for (let i = 0; i < extra; i++) svg += `<rect class="cell free" x="${x + PAD + (n + i) * cw}" y="${y0}" width="${cw}" height="${ROW + 4}" rx="4"/>`;
      if (showIndex && o.type !== 'deque' && n <= 10 && !o.fields) o.items.forEach((_, i) => { svg += text(x + PAD + i * cw + cw / 2, y0 + ROW + 14, i - n, 'idx neg', 'middle'); });
      if (more > 0) svg += text(x + PAD + (n + extra) * cw + 6, y0 + (ROW + 4) / 2, `+${more}`, 'idx');
      if (o.fields) o.fields.slice(0, n).forEach((f, i) => { svg += text(x + PAD + i * cw + cw / 2, y0 - 7, f, 'idx', 'middle'); });
      return { svg: svg + '</g>', anchors: row.anchors };
    } };
  }
  if (o.type === 'dict' || o.type === 'Counter' || o.type === 'defaultdict' || o.type === 'OrderedDict' || o.type === 'mappingproxy') {
    const rows = o.entries;
    const kw = Math.max(40, ...rows.map(([k]) => tw(inline(k) ?? '•')));
    const vw = Math.max(40, ...rows.map(([, v]) => tw(inline(v) ?? '•')));
    const w = Math.max(tw(head) + 2 * PAD, kw + vw + 40 + 2 * PAD, 90);
    const h = HEAD + 4 + Math.max(1, rows.length) * ROW + PAD;
    return { w, h, draw: (x, y) => {
      const anchors = {};
      let svg = `<g class="${cls}" data-id="${id}"><rect class="box" x="${x}" y="${y}" width="${w}" height="${h}" rx="7"/>${text(x + PAD, y + HEAD / 2 + 2, head, 'ty')}`;
      const touchedKeys = new Map(flags.touched.filter(tc => tc.id === id && typeof tc.key === 'string').map(tc => [tc.key, tc.op]));
      rows.forEach(([k, v], i) => {
        const ry = y + HEAD + 4 + i * ROW, op = touchedKeys.get(o.keyTexts ? keyOfText(o.keyTexts[i]) : '');
        svg += `<rect class="krow${op ? ' ' + op : ''}" x="${x + 3}" y="${ry}" width="${w - 6}" height="${ROW}" rx="3"/>`;
        const kv = inline(k);
        if (kv !== null) svg += text(x + PAD, ry + ROW / 2, kv, 'key'); else { svg += `<circle class="dot" cx="${x + PAD + 4}" cy="${ry + ROW / 2}" r="3"/>`; anchors[k] = [x + PAD + 4, ry + ROW / 2]; }
        svg += text(x + PAD + kw + 10, ry + ROW / 2, '→', 'arrowt');
        const vv = inline(v);
        if (vv !== null) svg += text(x + PAD + kw + 28, ry + ROW / 2, vv, 'cv'); else { svg += `<circle class="dot" cx="${x + PAD + kw + 32}" cy="${ry + ROW / 2}" r="3"/>`; anchors[v] = [x + PAD + kw + 32, ry + ROW / 2]; }
      });
      if (!rows.length) svg += text(x + w / 2, y + HEAD + 4 + ROW / 2, '{ }', 'cv dim', 'middle');
      return { svg: svg + '</g>', anchors };
    } };
  }
  if (o.type === 'function' || o.type === 'builtin' || o.type === 'method' || o.type === 'generator' || o.type === 'module' || o.type === 'property' || o.type === 'staticmethod' || o.type === 'classmethod') {
    const label = o.type === 'function' ? `${o.name}(${(o.params || []).join(', ')})` : o.type === 'generator' ? `${o.name}() ${o.done ? '· done' : o.started ? '· paused' : '· not started'}` : o.type === 'method' ? `${o.name}()` : o.type === 'module' ? o.name : o.value || o.type;
    const rows = [...(o.closure || []).map(([k, v]) => [`${k} →`, v]), ...(o.defaults || []).map(([k, v]) => [`${k} =`, v])];
    const w = Math.max(tw(label) + 2 * PAD + 6, 90, ...rows.map(([k, v]) => tw(k) + 24 + (inline(v) !== null ? tw(inline(v)) : 16)));
    const h = HEAD + ROW + 4 + rows.length * ROW + (rows.length ? 4 : 0);
    const headLabel = o.type === 'function' && o.generator ? 'generator function' : o.type;
    return { w, h, draw: (x, y) => {
      const anchors = {};
      let svg = `<g class="${cls}" data-id="${id}"><rect class="box" x="${x}" y="${y}" width="${w}" height="${h}" rx="7"/>${text(x + PAD, y + HEAD / 2 + 2, headLabel, 'ty')}${text(x + PAD, y + HEAD + ROW / 2 + 2, label, 'val fn')}`;
      rows.forEach(([k, v], i) => { const ry = y + HEAD + ROW + 6 + i * ROW; svg += text(x + PAD, ry + ROW / 2, k, 'key'); const vv = inline(v); if (vv !== null) svg += text(x + PAD + tw(k) + 8, ry + ROW / 2, vv, 'cv'); else { svg += `<circle class="dot" cx="${x + w - 12}" cy="${ry + ROW / 2}" r="3"/>`; anchors[v] = [x + w - 12, ry + ROW / 2]; } });
      if (o.type === 'method' && o.self != null) anchors[o.self] = [x + w, y + HEAD + ROW / 2 + 2];
      if (o.type === 'builtin' && o.wrapped != null) anchors[o.wrapped] = [x + w, y + HEAD + ROW / 2 + 2];
      if (o.type === 'property' && o.fget != null) anchors[o.fget] = [x + w, y + HEAD + ROW / 2 + 2];
      return { svg: svg + '</g>', anchors };
    } };
  }
  if (o.type === 'class' || o.type === 'instance') {
    const rows = o.attrs || [];
    const label = o.type === 'class' ? `class ${o.name}` : `${o.cls}${o.exception ? ' (exception)' : ''}`;
    const w = Math.max(tw(label) + 2 * PAD + 6, 100, ...rows.map(([k, v]) => tw(k) + 30 + (inline(v) !== null ? tw(inline(v)) : 16)));
    const h = HEAD + 6 + Math.max(rows.length, 0) * ROW + (rows.length ? PAD : ROW);
    return { w, h, draw: (x, y) => {
      const anchors = {};
      let svg = `<g class="${cls}" data-id="${id}"><rect class="box" x="${x}" y="${y}" width="${w}" height="${h}" rx="7"/>${text(x + PAD, y + HEAD / 2 + 2, label, 'ty')}`;
      const touchedKeys = new Map(flags.touched.filter(tc => tc.id === id).map(tc => [tc.key, tc.op]));
      rows.forEach(([k, v], i) => {
        const ry = y + HEAD + 6 + i * ROW, op = touchedKeys.get(k);
        if (op) svg += `<rect class="krow ${op}" x="${x + 3}" y="${ry}" width="${w - 6}" height="${ROW}" rx="3"/>`;
        svg += text(x + PAD, ry + ROW / 2, k, 'key');
        const vv = inline(v);
        if (vv !== null) svg += text(x + PAD + tw(k) + 14, ry + ROW / 2, vv, 'cv'); else { svg += `<circle class="dot" cx="${x + w - 12}" cy="${ry + ROW / 2}" r="3"/>`; anchors[v] = [x + w - 12, ry + ROW / 2]; }
      });
      if (!rows.length) svg += text(x + w / 2, y + HEAD + ROW / 2 + 4, o.type === 'class' ? '(no attributes)' : '(empty)', 'cv dim', 'middle');
      if (o.type === 'instance' && o.clsId != null) anchors[o.clsId] = [x + w, y + HEAD / 2 + 2];
      if (o.type === 'class' && o.bases) for (const b of o.bases) anchors[b] = [x + w, y + HEAD / 2 + 2];
      return { svg: svg + '</g>', anchors };
    } };
  }
  const label = o.value || o.type;
  const w = Math.max(tw(label) + 2 * PAD, 70), h = HEAD + ROW + 4;
  return { w, h, draw: (x, y) => ({ svg: `<g class="${cls}" data-id="${id}"><rect class="box" x="${x}" y="${y}" width="${w}" height="${h}" rx="7"/>${text(x + PAD, y + HEAD / 2 + 2, o.type, 'ty')}${text(x + PAD, y + HEAD + ROW / 2 + 2, label, 'val')}</g>`, anchors: {} }) };
}

const keyOfText = t => (t.startsWith("'") || t.startsWith('"') ? 's' + t.slice(1, -1) : /^-?\d+$/.test(t) ? 'i' + t : t === 'None' ? 'N' : 'f' + t);

function changedIds(mem, prev) {
  const out = new Set();
  if (!prev) return out;
  for (const [id, o] of Object.entries(mem.objects)) {
    const p = prev.objects[id];
    if (!p) { out.add(Number(id)); continue; }
    if (JSON.stringify(o) !== JSON.stringify(p)) out.add(Number(id));
  }
  return out;
}

function changedNames(mem, prev) {
  const out = new Set();
  if (!prev) return out;
  mem.frames.forEach((f, i) => {
    const pf = prev.frames[i];
    const pv = pf && pf.name === f.name ? new Map(pf.vars) : new Map();
    for (const [name, id] of f.vars) if (pv.get(name) !== id) out.add(`${i}:${name}`);
  });
  return out;
}

export function memoryView(mem, { prev = null, touched = [], hide = [], errorId = null, labels = {} } = {}) {
  const hideSet = new Set(hide);
  const { boxed, order } = plan(mem, hideSet);
  const flags = { changed: changedIds(mem, prev), touched, error: errorId };
  const nameChanged = changedNames(mem, prev);

  /* frames column */
  let fy = 0, svgFrames = '';
  const nameAnchor = new Map();
  mem.frames.forEach((f, fi) => {
    const vars = f.vars.filter(([n]) => !hideSet.has(n));
    const h = HEAD + 6 + Math.max(vars.length, 1) * FRAME_ROW + 4;
    const title = fi === 0 ? (labels.globals || 'globals') : `${f.name}()${f.kind === 'generator' ? ' ⏸' : ''}`;
    svgFrames += `<g class="frame${fi === mem.frames.length - 1 && fi > 0 ? ' top' : ''}"><rect class="fbox" x="0" y="${fy}" width="${FRAME_W}" height="${h}" rx="7"/>${text(PAD, fy + HEAD / 2 + 3, title, 'ft')}`;
    vars.forEach(([name, id], i) => {
      const ry = fy + HEAD + 6 + i * FRAME_ROW;
      const changed = nameChanged.has(`${fi}:${name}`);
      svgFrames += `<rect class="nrow${changed ? ' changed' : ''}" x="4" y="${ry}" width="${FRAME_W - 8}" height="${FRAME_ROW - 2}" rx="3"/>${text(PAD + 2, ry + FRAME_ROW / 2 - 1, short(name, 16), 'name')}`;
      nameAnchor.set(`${fi}:${name}`, { id, x: FRAME_W, y: ry + FRAME_ROW / 2 - 1 });
    });
    if (!vars.length) svgFrames += text(PAD + 2, fy + HEAD + 6 + FRAME_ROW / 2, '—', 'name dim');
    svgFrames += '</g>';
    fy += h + 10;
  });

  /* objects: greedy columns */
  const boxes = new Map();
  for (const id of order) boxes.set(id, boxOf(id, mem.objects[id], mem, boxed, flags));
  const pos = new Map();
  let colX = FRAME_W + 70, y = 0, colW = 0, maxY = 0;
  for (const id of order) {
    const b = boxes.get(id);
    if (y > 0 && y + b.h > MAX_COL_H) { colX += colW + COL_GAP; y = 0; colW = 0; }
    pos.set(id, { x: colX, y });
    colW = Math.max(colW, b.w);
    y += b.h + GAP;
    maxY = Math.max(maxY, y);
  }
  const width = colX + colW + 10, height = Math.max(fy, maxY) + 4;

  let svgObjects = '', svgArrows = '';
  const anchorsOf = new Map();
  for (const id of order) {
    const { x, y: by } = pos.get(id);
    const { svg, anchors } = boxes.get(id).draw(x, by);
    svgObjects += svg;
    anchorsOf.set(id, anchors);
  }
  const target = id => { const p = pos.get(id), b = boxes.get(id); return p ? [p.x, p.y + Math.min(b.h / 2, HEAD + ROW / 2 + 2)] : null; };
  const arrow = (sx, sy, id, cls) => {
    const tgt = target(id);
    if (!tgt) return '';
    const [tx, ty] = tgt;
    const dx = Math.max(30, Math.abs(tx - sx) / 2);
    return `<path class="ref ${cls}" d="M${sx} ${sy} C${sx + dx} ${sy}, ${tx - dx} ${ty}, ${tx - 2} ${ty}" marker-end="url(#py-ah)"/>`;
  };
  for (const [key, a] of nameAnchor) svgArrows += arrow(a.x, a.y, a.id, nameChanged.has(key) ? 'changed' : '');
  for (const [, anchors] of anchorsOf) for (const [cid, [sx, sy]] of Object.entries(anchors)) svgArrows += arrow(sx, sy, Number(cid), 'inner');

  return `<svg class="memsvg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" role="img" font-size="${FONT}">
    <defs><marker id="py-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path class="ahead" d="M0 0L10 5L0 10z"/></marker></defs>
    ${svgFrames}${svgArrows}${svgObjects}</svg>`;
}

/** Innermost frame's bindings as [name, object] pairs — the "names right now" strip. */
export function currentNames(mem, hide = []) {
  const hideSet = new Set(hide);
  const frame = mem.frames[mem.frames.length - 1];
  return frame.vars.filter(([n]) => !hideSet.has(n)).map(([name, id]) => [name, mem.objects[id]]);
}

/** Finds a variable by name, innermost frame first; returns its encoded object or null. */
export function lookupVar(mem, name) {
  for (let i = mem.frames.length - 1; i >= 0; i--) {
    const hit = mem.frames[i].vars.find(([n]) => n === name);
    if (hit) return mem.objects[hit[1]] ?? null;
  }
  return null;
}

export const atomValue = (mem, o) => (o && isAtom(o) ? atomText(o) : null);
export const isAtomObj = isAtom;
