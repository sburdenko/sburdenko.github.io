/**
 * Pure traces for chapter 17: data structure design — a trie, tree serialization, a circular queue and an LFU
 * cache. Same contract as model-a.js: every event is a complete snapshot with an i18n key and its arguments.
 */
import { layoutTree } from './model-b.js?v=202610191738';

const event = (key, args, state) => ({ key, args, ...state });

/* ---------- Implement Trie ---------- */
/**
 * The trie every insert of ops builds, with ids in creation order, so a node id < created means “already made”.
 * x is the leaf order with children sorted by letter, depth is the word position (the root is 0).
 */
export function trieLayout(ops) {
  const nodes = [{ id: 0, ch: '', depth: 0, parent: -1, next: {} }];
  for (const [op, word] of ops) {
    if (op !== 'insert') continue;
    let cur = 0;
    for (const ch of word) {
      if (nodes[cur].next[ch] == null) {
        nodes[cur].next[ch] = nodes.length;
        nodes.push({ id: nodes.length, ch, depth: nodes[cur].depth + 1, parent: cur, next: {} });
      }
      cur = nodes[cur].next[ch];
    }
  }
  let leaf = 0;
  const place = id => {
    const kids = Object.keys(nodes[id].next).sort().map(ch => nodes[id].next[ch]);
    if (!kids.length) { nodes[id].x = leaf++; return; }
    kids.forEach(place);
    nodes[id].x = (nodes[kids[0]].x + nodes[kids.at(-1)].x) / 2;
  };
  place(0);
  return { nodes, leaves: Math.max(1, leaf) };
}

/**
 * ops: ['insert' | 'search' | 'startsWith', word]. Every node is next[26] (here: an object of the letters
 * present) plus an end flag. created — how many nodes exist, root included; ends — ids of nodes that end a word.
 */
export function trieTrace(ops) {
  const { nodes } = trieLayout(ops), ends = new Set(), results = [], events = [];
  const exists = nodes.map(() => false);
  exists[0] = true;
  let created = 1;
  const push = (key, args, extra = {}) => events.push(event(key, args, {
    op: null, at: null, cur: 0, from: 0, path: [0], probe: null, made: null, created, ends: [...ends], results: [...results], ...extra,
  }));
  push('trie.ev.start', []);
  ops.forEach(([op, word], k) => {
    let cur = 0;
    const path = [0];
    for (let i = 0; i < word.length; i++) {
      const ch = word[i], child = nodes[cur].next[ch];
      const there = child != null && exists[child];
      if (!there && op !== 'insert') {
        results.push(false);
        push('trie.ev.miss', [op, word, i, ch], { op: k, at: i, cur, from: cur, path: [...path], probe: ch });
        return;
      }
      if (!there) { exists[child] = true; created++; }
      const from = cur;
      cur = child;
      path.push(cur);
      push(there ? 'trie.ev.walk' : 'trie.ev.make', [op, word, i, ch, i === word.length - 1],
        { op: k, at: i, cur, from, path: [...path], probe: ch, made: there ? null : cur });
    }
    if (op === 'insert') {
      const again = ends.has(cur);
      ends.add(cur);
      results.push(null);
      push('trie.ev.mark', [word, again], { op: k, at: word.length, cur, from: cur, path });
    } else if (op === 'startsWith') {
      results.push(true);
      push('trie.ev.prefix', [word, ends.has(cur)], { op: k, at: word.length, cur, from: cur, path });
    } else {
      const found = ends.has(cur);
      results.push(found);
      push(found ? 'trie.ev.word' : 'trie.ev.notWord', [word], { op: k, at: word.length, cur, from: cur, path });
    }
  });
  push('trie.ev.done', [created - 1, ends.size]);
  return { events, nodes, results, size: created - 1 };
}

/* ---------- Serialize and Deserialize Binary Tree ---------- */
/**
 * Pre-order with “#” for every missing child. tokens[j] = { v, id } for a node or { v: null, parent, side } for a
 * marker; deserialize reads them back in the same order, so the k-th node it creates is pre-order node k.
 */
export function serializeTrace(spec) {
  const nodes = layoutTree(spec), tokens = [], events = [];
  const walk = (id, parent, side) => {
    if (id < 0) { tokens.push({ v: null, parent, side }); return; }
    tokens.push({ v: nodes[id].v, id });
    walk(nodes[id].l, id, 'L');
    walk(nodes[id].r, id, 'R');
  };
  walk(nodes.length ? 0 : -1, -1, null);
  const text = tokens.map(t => (t.v === null ? '#' : t.v)).join(',');

  let stack = [], written = 0;
  const push = (key, args, extra = {}) => events.push(event(key, args, {
    phase: 'ser', written, pos: 0, built: 0, cur: null, nil: null, stack: [...stack], ...extra,
  }));
  push('ser.ev.start', [nodes.length]);
  const write = (id, parent, side) => {
    const j = written++;
    if (id < 0) {
      push('ser.ev.nil', [parent >= 0 ? nodes[parent].v : null, side], { nil: j });
      return;
    }
    stack.push(id);
    push('ser.ev.val', [nodes[id].v, parent >= 0 ? nodes[parent].v : null, side], { cur: id });
    write(nodes[id].l, id, 'L');
    write(nodes[id].r, id, 'R');
    stack.pop();
  };
  write(nodes.length ? 0 : -1, -1, null);
  push('ser.ev.str', [tokens.length, nodes.length, tokens.length - nodes.length]);

  /* deserialize: Read() with a cursor that only moves forward */
  let pos = 0, built = 0;
  const rebuilt = [], parts = text.split(',');
  stack = [];
  const des = (key, args, extra = {}) => push(key, args, { phase: 'des', written, pos, built, ...extra });
  const read = (parent, side) => {
    const j = pos++, t = parts[j];
    if (t === '#') {
      des('des.ev.nil', [parent >= 0 ? rebuilt[parent].v : null, side], { nil: j });
      return null;
    }
    const id = built++;
    rebuilt[id] = { v: Number(t), l: null, r: null };
    stack.push(id);
    des('des.ev.node', [Number(t), parent >= 0 ? rebuilt[parent].v : null, side, j], { cur: id });
    rebuilt[id].l = read(id, 'L');
    rebuilt[id].r = read(id, 'R');
    stack.pop();
    des('des.ev.up', [rebuilt[id].v, parent >= 0 ? rebuilt[parent].v : null, side], { cur: id });
    return rebuilt[id];
  };
  const root = read(-1, null);
  const toSpec = n => (n ? [n.v, toSpec(n.l), toSpec(n.r)] : null);
  const back = toSpec(root);
  const same = JSON.stringify(back) === JSON.stringify(spec ?? null);
  des('des.ev.done', [built, same]);
  return { events, nodes, tokens, text, rebuilt: back, same };
}

/* ---------- Design Circular Queue ---------- */
/**
 * ops: ['enQueue', v] | ['deQueue'] | ['Front'] | ['Rear'] | ['isEmpty'] | ['isFull']. The state is head and count;
 * the tail (the next free slot) is (head + count) % k and is never stored. a keeps stale values after a deQueue.
 */
export function circularQueueTrace(k, ops) {
  const a = Array(k).fill(null), results = [], events = [];
  let head = 0, count = 0;
  const push = (key, args, extra = {}) => events.push(event(key, args, {
    a: [...a], head, count, tail: (head + count) % k, op: null, slot: null, results: [...results], wrap: false, ...extra,
  }));
  push('cq.ev.start', [k]);
  ops.forEach(([op, v], j) => {
    if (op === 'enQueue') {
      if (count === k) {
        results.push(false);
        push('cq.ev.full', [v, k], { op: j, slot: head });
        return;
      }
      const at = (head + count) % k, wrap = head + count >= k;
      a[at] = v;
      count++;
      results.push(true);
      push(wrap ? 'cq.ev.wrap' : 'cq.ev.enq', [v, at, head, count - 1, k], { op: j, slot: at, wrap });
      return;
    }
    if (op === 'deQueue') {
      if (!count) {
        results.push(false);
        push('cq.ev.empty', [op], { op: j });
        return;
      }
      const from = head, value = a[head];
      head = (head + 1) % k;
      count--;
      results.push(true);
      push(head === 0 && k > 1 ? 'cq.ev.headWrap' : 'cq.ev.deq', [value, from, head, count, k], { op: j, slot: from, wrap: head === 0 && k > 1 });
      return;
    }
    if (op === 'Front' || op === 'Rear') {
      if (!count) {
        results.push(-1);
        push('cq.ev.empty', [op], { op: j });
        return;
      }
      const at = op === 'Front' ? head : (head + count - 1) % k;
      results.push(a[at]);
      push(op === 'Front' ? 'cq.ev.front' : 'cq.ev.rear', [a[at], at, head, count, k], { op: j, slot: at });
      return;
    }
    const answer = op === 'isEmpty' ? count === 0 : count === k;
    results.push(answer);
    push(op === 'isEmpty' ? 'cq.ev.isEmpty' : 'cq.ev.isFull', [answer, count, k], { op: j });
  });
  push('cq.ev.done', [count, k]);
  return { events, results };
}

/* ---------- LFU Cache ---------- */
/**
 * ops: ['put', key, value] | ['get', key]. Buckets by frequency, each in LRU order (oldest first), and minFreq.
 * Snapshot: buckets [[freq, [[key, value], …]], …] ascending by freq, minFreq, the touched key, the bucket it
 * left (emptied when that left it empty) and the evicted entry [key, value, freq].
 */
export function lfuTrace(capacity, ops) {
  const val = new Map(), freq = new Map(), buckets = new Map(), gets = [], answers = [], events = [];
  let minFreq = 0;
  const snapshot = () => [...buckets].filter(([, keys]) => keys.length).sort((x, y) => x[0] - y[0])
    .map(([f, keys]) => [f, keys.map(key => [key, val.get(key)])]);
  const push = (key, args, extra = {}) => events.push(event(key, args, {
    buckets: snapshot(), minFreq, size: val.size, op: null, hit: null, emptied: null, evicted: null, ...extra,
  }));
  const bucket = f => { if (!buckets.has(f)) buckets.set(f, []); return buckets.get(f); };
  /** get or put on a present key: frequency + 1, the key moves to the newest end of the next bucket. */
  const touch = key => {
    const f = freq.get(key), from = bucket(f);
    from.splice(from.indexOf(key), 1);
    freq.set(key, f + 1);
    bucket(f + 1).push(key);
    return { f, emptied: from.length ? null : f, wasMin: minFreq === f };
  };
  push('lfu.ev.start', [capacity]);
  ops.forEach(([op, key, value], k) => {
    answers.push(op === 'get' ? (val.has(key) ? val.get(key) : -1) : null);
    if (op === 'get') {
      if (!val.has(key)) {
        gets.push(-1);
        push('lfu.ev.miss', [key], { op: k });
        return;
      }
      const { f, emptied, wasMin } = touch(key);
      gets.push(val.get(key));
      push('lfu.ev.hit', [key, val.get(key), f, f + 1, buckets.get(f).length], { op: k, hit: key, emptied });
      if (emptied !== null && wasMin) {
        minFreq = f + 1;
        push('lfu.ev.minUp', [f, f + 1, key], { op: k, hit: key, emptied });
      }
      return;
    }
    if (val.has(key)) {
      const old = val.get(key);
      val.set(key, value);
      const { f, emptied, wasMin } = touch(key);
      push('lfu.ev.update', [key, old, value, f, f + 1], { op: k, hit: key, emptied });
      if (emptied !== null && wasMin) {
        minFreq = f + 1;
        push('lfu.ev.minUp', [f, f + 1, key], { op: k, hit: key, emptied });
      }
      return;
    }
    if (val.size === capacity) {
      const victims = bucket(minFreq), gone = victims.shift(), tie = victims.length;
      const evicted = [gone, val.get(gone), minFreq];
      val.delete(gone);
      freq.delete(gone);
      push('lfu.ev.evict', [gone, minFreq, tie, [...victims]], { op: k, evicted, emptied: tie ? null : minFreq });
    }
    val.set(key, value);
    freq.set(key, 1);
    bucket(1).push(key);
    const was = minFreq;
    minFreq = 1;
    push('lfu.ev.put', [key, value, was], { op: k, hit: key });
  });
  push('lfu.ev.done', [gets.filter(g => g !== -1).length, gets.length]);
  return { events, gets, answers, contents: new Map(val), final: snapshot() };
}
