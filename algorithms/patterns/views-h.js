/** Views for chapter 17: data structure design. */
import { CELL, STEP, svg, text, cells, pointers, arcBelow, node, chip, chips } from './view-kit.js?v=202610261132';

/** Operations as chips: done ones carry their return value, the current one is lit. */
const opChips = (ops, e, label, result) => chips(ops.map((op, i) => {
  const r = i < e.results.length ? e.results[i] : null;
  return chip(`${label(op)}${r != null ? ` → ${result(r)}` : ''}`, i === e.op ? 'new' : i < e.results.length ? 'done' : '');
}));
const bool = v => (v === true ? 'true' : v === false ? 'false' : v);

/* ---------- Implement Trie ---------- */
const T_R = 15, T_DX = 40, T_DY = 48, T_PAD = 28, T_TOP = 24;
const SLOT = 20, SLOT_STEP = 22, LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const END_KEYS = new Set(['trie.ev.mark', 'trie.ev.word', 'trie.ev.notWord', 'trie.ev.prefix']);

/** The word a node spells, root to node. */
const spell = (nodes, id) => { let s = ''; for (let n = id; n > 0; n = nodes[n].parent) s = nodes[n].ch + s; return s; };

export const trie = {
  view(run, e) {
    const { nodes, leaves } = run.layout;
    const treeW = 2 * T_PAD + (leaves - 1) * T_DX, depth = Math.max(...nodes.map(n => n.depth));
    const W = Math.max(treeW, 13 * SLOT_STEP + 40), ox = (W - treeW) / 2;
    const px = n => ox + T_PAD + n.x * T_DX, py = n => T_TOP + n.depth * T_DY;
    const seen = n => n.id < e.created, onPath = new Set(e.path), ends = new Set(e.ends);
    const miss = e.key === 'trie.ev.miss', atEnd = END_KEYS.has(e.key);
    let s = '';
    for (const n of nodes) {
      if (!n.id || !seen(n)) continue;
      const p = nodes[n.parent];
      s += `<line class="edge${onPath.has(n.id) && onPath.has(p.id) ? ' on' : ''}" x1="${px(p)}" y1="${py(p)}" x2="${px(n)}" y2="${py(n)}"/>`;
    }
    for (const n of nodes) {
      if (!seen(n)) continue;
      const cls = n.id === e.made ? 'new'
        : n.id === e.cur ? (miss || e.key === 'trie.ev.notWord' ? 'bad' : atEnd && e.key !== 'trie.ev.mark' ? 'ok' : 'cur')
          : onPath.has(n.id) ? 'path' : '';
      if (ends.has(n.id)) s += `<circle class="endring${n.id === e.cur && atEnd ? ' on' : ''}" cx="${px(n)}" cy="${py(n)}" r="${T_R + 4}"/>`;
      s += node(px(n), py(n), n.id ? n.ch : '·', `${cls} small`, T_R);
    }
    s += text(px(nodes[0]) - T_R - 8, py(nodes[0]), 'root', 'cap corner');

    /* the probed node: its next[26] and its end flag */
    const from = nodes[e.from], y0 = T_TOP + depth * T_DY + T_R + 30;
    const name = e.from ? `"${spell(nodes, e.from)}"` : 'root';
    s += text(10, y0, `${name}.next[26]`, 'cap');
    if (atEnd || e.key === 'trie.ev.start' || e.key === 'trie.ev.done') {
      const flag = ends.has(e.from);
      s += text(W - 10, y0, `end = ${flag}`, `cap corner${flag ? ' on' : ''}`);
    }
    [...LETTERS].forEach((ch, i) => {
      const x = 10 + (i % 13) * SLOT_STEP, y = y0 + 12 + Math.floor(i / 13) * (SLOT + 6);
      const child = from.next[ch], has = child != null && child < e.created;
      const probe = ch === e.probe ? (miss ? 'bad' : child === e.made ? 'new' : 'ok') : '';
      s += `<rect class="slot${has ? ' on' : ''}${probe ? ` ${probe}` : ''}" x="${x}" y="${y}" width="${SLOT}" height="${SLOT}" rx="3"/>`
        + text(x + SLOT / 2, y + SLOT / 2 + 0.5, ch, `slot-t${has ? ' on' : ''}${probe ? ` ${probe}` : ''}`);
    });
    return svg(W, y0 + 12 + 2 * SLOT + 6 + 8, s);
  },
  vars(run, e) {
    const out = [];
    if (e.op != null) {
      const word = run.ops[e.op][1];
      out.push(['var.word', chips([...word].map((ch, i) => chip(ch, i === e.at ? (e.key === 'trie.ev.miss' ? 'amb' : 'new') : i < e.at ? 'hit' : '')))]);
    }
    out.push(['var.nodes', chip(e.created - 1, 'hit')]);
    out.push(['var.ops', opChips(run.ops, e, ([op, w]) => `${op} ${w}`, bool)]);
    return out;
  },
};

/* ---------- Serialize and Deserialize Binary Tree ---------- */
const S_DX = 50, S_DY = 64, S_X = 34, S_Y = 26, TOK_W = 30, TOK_H = 26, TOK_STEP = 33;

export const serialize = {
  view(run, e) {
    const { nodes, tokens } = run;
    const depth = Math.max(0, ...nodes.map(n => n.depth));
    const treeW = 2 * S_X + Math.max(0, nodes.length - 1) * S_DX;
    const W = Math.max(treeW, Math.min(tokens.length, 16) * TOK_STEP + 20), ox = (W - treeW) / 2;
    const px = n => ox + S_X + n.x * S_DX, py = n => S_Y + n.depth * S_DY;
    const tokOf = new Map(tokens.map((t, j) => [t.v === null ? `${t.parent}:${t.side}` : t.id, j]));
    const ser = e.phase === 'ser', stack = new Set(e.stack), done = e.key === 'des.ev.done';
    const visible = n => ser || n.id < e.built;
    const stubSeen = j => ser || j < e.pos;
    let s = '';
    for (const n of nodes) {
      if (!visible(n)) continue;
      for (const [child, side] of [[n.l, 'L'], [n.r, 'R']]) {
        if (child >= 0) {
          if (!visible(nodes[child])) continue;
          const on = stack.has(child) && stack.has(n.id);
          s += `<line class="edge${on ? ' on' : ''}" x1="${px(n)}" y1="${py(n)}" x2="${px(nodes[child])}" y2="${py(nodes[child])}"/>`;
          continue;
        }
        const j = tokOf.get(`${n.id}:${side}`);
        if (!stubSeen(j)) continue;
        const sx = px(n) + (side === 'L' ? -20 : 20), sy = py(n) + 38;
        const cls = j === e.nil ? 'cur' : ser && j < e.written ? 'done' : !ser ? 'done' : '';
        s += `<line class="stub ${cls}" x1="${px(n)}" y1="${py(n) + 14}" x2="${sx}" y2="${sy - 8}"/>` + text(sx, sy, '#', `stub-t ${cls}`);
      }
    }
    for (const n of nodes) {
      if (!visible(n)) continue;
      const j = tokOf.get(n.id);
      const cls = done || e.key === 'ser.ev.str' ? 'ok'
        : n.id === e.cur ? (e.key === 'des.ev.up' ? 'ok' : 'cur')
          : stack.has(n.id) ? 'path'
            : ser ? (j < e.written ? 'done' : '') : 'done';
      s += node(px(n), py(n), n.v, `${cls} small`, 17);
    }

    /* the string: token cells with the cursor */
    const perRow = Math.floor((W - 20) / TOK_STEP), y0 = S_Y + depth * S_DY + 76;
    s += text(10, y0 - 22, ser ? 'serialize → "…"' : 'deserialize ← "…"', 'cap');
    const cursor = ser ? e.written - 1 : e.pos - 1;
    tokens.forEach((t, j) => {
      const x = 10 + (j % perRow) * TOK_STEP, y = y0 + Math.floor(j / perRow) * (TOK_H + 22);
      const shown = !ser || j < e.written;
      const cls = !shown ? 'dim' : e.key === 'ser.ev.str' ? 'ok' : j === cursor && e.key !== 'des.ev.done' && e.key !== 'des.ev.up' ? 'cur'
        : !ser && j < e.pos ? 'seen' : t.v === null ? 'nilc' : '';
      s += `<rect class="cell ${cls}" x="${x}" y="${y}" width="${TOK_W}" height="${TOK_H}" rx="4"/>`;
      if (shown) s += text(x + TOK_W / 2, y + TOK_H / 2, t.v === null ? '#' : t.v, `cv small ${cls}${t.v === null ? ' nilt' : ''}`);
      if (j === cursor && shown && !done) s += `<g class="ptr${ser ? '' : ' p2'}"><path d="M${x + TOK_W / 2 - 5} ${y - 9}L${x + TOK_W / 2 + 5} ${y - 9}L${x + TOK_W / 2} ${y - 2}Z"/></g>`;
    });
    const rows = Math.ceil(tokens.length / perRow);
    return svg(W, y0 + rows * (TOK_H + 22) - 10, s);
  },
  vars(run, e) {
    const out = [['var.calls', chips(e.stack.map(id => chip(run.nodes[id].v, 'amb')))]];
    if (e.phase === 'ser') out.push(['var.written', chip(`${e.written} / ${run.tokens.length}`, 'hit')]);
    else out.push(['var.pos', chip(`${e.pos} / ${run.tokens.length}`, 'hit')]);
    return out;
  },
};

/* ---------- Design Circular Queue ---------- */
const Q_X = 40, Q_TOP = 44;
const LIVE_KEYS = new Set(['cq.ev.enq', 'cq.ev.wrap', 'cq.ev.full', 'cq.ev.deq', 'cq.ev.headWrap', 'cq.ev.front', 'cq.ev.rear']);

export const circularQueue = {
  view(run, e) {
    const k = run.k, live = j => (j - e.head + k) % k < e.count;
    const cls = e.a.map((v, j) => {
      if (j === e.slot && LIVE_KEYS.has(e.key)) {
        if (e.key === 'cq.ev.full') return 'bad';
        if (e.key === 'cq.ev.deq' || e.key === 'cq.ev.headWrap') return 'src';
        if (e.key === 'cq.ev.front' || e.key === 'cq.ev.rear') return 'ok';
        return 'cur';
      }
      return live(j) ? 'win' : v === null ? '' : 'dim';
    });
    let s = text(4, Q_TOP + CELL / 2, 'a', 'lbl') + cells(e.a.map(v => (v === null ? '' : v)), cls, { x: Q_X, y: Q_TOP });
    s += pointers([{ i: e.head, label: 'head' }, { i: e.tail, label: 'tail', cls: 'p2' }], { x: Q_X, y: Q_TOP, count: k });
    if (k > 1) s += arcBelow(k - 1, 0, Q_TOP + CELL + 22, 14, e.wrap ? 'pick' : '', '% k', Q_X);
    return svg(Q_X + k * STEP + 16, Q_TOP + CELL + 22 + 14 + 26, s);
  },
  vars(run, e) {
    return [
      ['var.countK', chip(`${e.count} / ${run.k}`, e.count === run.k ? 'amb' : 'hit')],
      ['var.tail', chip(`(${e.head} + ${e.count}) % ${run.k} = ${e.tail}`, 'new')],
      ['var.ops', opChips(run.ops, e, ([op, v]) => (v == null ? op : `${op} ${v}`), bool)],
    ];
  },
};

/* ---------- LFU Cache ---------- */
const L_X = 70, L_TOP = 40;

export const lfu = {
  view(run, e) {
    const rows = e.buckets.map(([f, entries]) => ({ f, entries }));
    if (e.emptied != null && !rows.some(r => r.f === e.emptied)) rows.push({ f: e.emptied, entries: [] });
    rows.sort((a, b) => a.f - b.f);
    const cap = run.capacity, W = L_X + cap * STEP + 90;
    let s = text(L_X, 14, 'LRU', 'lbl') + text(L_X + cap * STEP - 6, 14, 'MRU', 'lbl corner');
    if (!rows.length) s += text(L_X, L_TOP + CELL / 2, '∅', 'cap');
    rows.forEach(({ f, entries }, r) => {
      const y = L_TOP + r * STEP, isMin = f === e.minFreq;
      s += text(6, y + CELL / 2 - (isMin ? 7 : 0), `f = ${f}`, `cap${isMin ? ' on' : ''}`);
      if (isMin) s += text(6, y + CELL / 2 + 9, 'minFreq', 'cap on');
      if (!entries.length) {
        s += `<rect class="cell dim" x="${L_X}" y="${y}" width="${CELL}" height="${CELL}" rx="6"/>` + text(L_X + CELL / 2, y + CELL / 2, '∅', 'cv dim');
        return;
      }
      s += cells(entries.map(([key, v]) => `${key}:${v}`), entries.map(([key]) => (key === e.hit ? 'cur' : '')), { x: L_X, y, index: false });
    });
    if (e.evicted) {
      const x = L_X + cap * STEP + 24, [key, v, f] = e.evicted;
      s += `<rect class="cell bad" x="${x}" y="${L_TOP}" width="${CELL}" height="${CELL}" rx="6"/>` + text(x + CELL / 2, L_TOP + CELL / 2, `${key}:${v}`, 'cv small bad')
        + text(x + CELL / 2, L_TOP + CELL + 13, `✕ f=${f}`, 'idx');
    }
    return svg(W, L_TOP + Math.max(1, rows.length) * STEP + (e.evicted && rows.length < 2 ? 14 : 4), s);
  },
  vars(run, e) {
    const upto = e.key === 'lfu.ev.done' ? Infinity : e.op ?? -1;
    return [
      ['var.minFreq', chip(e.minFreq || '—', 'amb')],
      ['var.fill', chip(`${e.size} / ${run.capacity}`, e.size === run.capacity ? 'amb' : 'hit')],
      ['var.ops', chips(run.ops.map(([op, k, v], i) => {
        const r = i <= upto ? run.answers[i] : null;
        return chip(op === 'put' ? `put ${k} ${v}` : `get ${k}${r != null ? ` → ${r}` : ''}`, i === e.op ? 'new' : i <= upto ? 'done' : '');
      }))],
    ];
  },
};
