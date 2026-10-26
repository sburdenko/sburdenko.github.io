/**
 * Pure traces for the problems in problems-gap.js: Valid Palindrome (two pointers), Contains Duplicate II
 * (hash map) and Invert Binary Tree (trees). Same contract as model-a.js: every event is a complete snapshot
 * with an i18n key and its arguments.
 */
import { layoutTree } from './model-b.js?v=202610261206';

const event = (key, args, state) => ({ key, args, ...state });

/* ---------- Valid Palindrome (#125) ---------- */
/** char.IsLetterOrDigit on the printable ASCII the field accepts: Latin letters and digits. */
export const isAlnum = c => /^[A-Za-z0-9]$/.test(c);
/** char.ToLowerInvariant on ASCII. */
export const lower = c => c.toLowerCase();

/**
 * The loop of the C# solution, one event per pointer move or comparison. Both skip loops also check l < r, so when
 * skipping brings l onto r, the character there is compared with itself — harmless, and the loop ends.
 * status[j]: 'skip' (not a letter or digit, stepped over), 'ok' (matched), 'bad' (the mismatch), or null.
 */
export function palindromeTrace(s) {
  const chars = [...s], n = chars.length, status = chars.map(() => null), events = [];
  let l = 0, r = n - 1, pairs = 0;
  const push = (key, args, extra = {}) => events.push(event(key, args, { l, r, pairs, status: [...status], cmp: null, ...extra }));
  push('pal.ev.start', [n]);
  while (l < r) {
    while (l < r && !isAlnum(chars[l])) {
      status[l] = 'skip';
      l++;
      push('pal.ev.skipL', [l - 1, chars[l - 1], l, l === r]);
    }
    while (l < r && !isAlnum(chars[r])) {
      status[r] = 'skip';
      r--;
      push('pal.ev.skipR', [r + 1, chars[r + 1], r, l === r]);
    }
    const a = chars[l], b = chars[r];
    if (lower(a) !== lower(b)) {
      status[l] = 'bad';
      status[r] = 'bad';
      push('pal.ev.mismatch', [l, r, a, b], { cmp: [l, r] });
      return { events, answer: false, pair: [l, r] };
    }
    status[l] = 'ok';
    status[r] = 'ok';
    if (l < r) pairs++;
    push('pal.ev.match', [l, r, a, b, l === r ? 'self' : a === b ? 'same' : 'case'], { cmp: [l, r] });
    l++;
    r--;
  }
  push('pal.ev.done', [pairs, l, r]);
  return { events, answer: true, pair: null };
}

/* ---------- Contains Duplicate II (#219) ---------- */
/**
 * A HashSet of the last k values. Add first: false means the value is inside the window, at most k back. Then,
 * once the set holds k + 1 values, nums[i − k] leaves — after step i the window is nums[i − k + 1..i].
 * win — indices whose values are in the set, oldest first.
 */
export function dupWindowTrace(nums, k) {
  const set = new Set(), last = new Map(), win = [], events = [];
  const push = (key, args, extra = {}) => events.push(event(key, args, { i: null, win: [...win], hit: null, out: null, ...extra }));
  push('dw.ev.start', [k]);
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i];
    if (set.has(x)) {
      const j = last.get(x);
      push('dw.ev.hit', [i, x, j, i - j, k], { i, hit: [j, i] });
      return { events, answer: true, pair: [j, i] };
    }
    const prev = last.has(x) ? last.get(x) : null;
    set.add(x);
    last.set(x, i);
    win.push(i);
    push('dw.ev.add', [i, x, prev, prev === null ? null : i - prev, k], { i });
    if (set.size > k) {
      const j = win.shift();
      set.delete(nums[j]);
      push('dw.ev.evict', [i, nums[j], j, k], { i, out: j });
    }
  }
  push('dw.ev.done', [k, nums.length]);
  return { events, answer: false, pair: null };
}

/* ---------- Invert Binary Tree (#226) ---------- */
/** In-order positions and depths of the tree hanging from root under the current child links. */
export function layoutLinks(left, right, root) {
  const x = left.map(() => null), depth = left.map(() => null);
  let order = 0;
  const walk = (id, d) => {
    if (id < 0) return;
    walk(left[id], d + 1);
    x[id] = order++;
    depth[id] = d;
    walk(right[id], d + 1);
  };
  walk(root, 0);
  return { x, depth };
}

/**
 * Post-order, as in the C# solution: invert the left subtree, then the right one, then swap the node's children.
 * A leaf is one event (both calls return null, and swapping nulls changes nothing). left/right are the current
 * child links by node id (ids from layoutTree, so the input layout stays available for the “before” tree).
 */
export function invertTreeTrace(spec) {
  const nodes = layoutTree(spec), left = nodes.map(n => n.l), right = nodes.map(n => n.r);
  const stack = [], swapped = [], events = [];
  const val = id => (id < 0 ? null : nodes[id].v);
  const push = (key, args, extra = {}) => events.push(event(key, args, {
    cur: null, stack: [...stack], swapped: [...swapped], left: [...left], right: [...right], ...extra,
  }));
  push('inv.ev.start', [nodes.length]);
  const go = id => {
    if (id < 0) return;
    stack.push(id);
    if (left[id] < 0 && right[id] < 0) {
      swapped.push(id);
      push('inv.ev.leaf', [nodes[id].v, id === 0], { cur: id });
    } else {
      push('inv.ev.enter', [nodes[id].v, val(left[id]), val(right[id])], { cur: id });
      go(left[id]);
      go(right[id]);
      [left[id], right[id]] = [right[id], left[id]];
      swapped.push(id);
      push('inv.ev.swap', [nodes[id].v, val(left[id]), val(right[id]), id === 0], { cur: id });
    }
    stack.pop();
  };
  go(nodes.length ? 0 : -1);
  push('inv.ev.done', [nodes.length]);
  return { events, nodes, left, right };
}
