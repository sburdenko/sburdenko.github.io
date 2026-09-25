/**
 * Pure traces for the array-shaped rigs: hash map, two pointers, sliding window,
 * binary search, greedy and DP. Every event is a complete snapshot, so the player
 * can rewind; texts are i18n keys with arguments, never ready-made sentences.
 */
const event = (key, args, state) => ({ key, args, ...state });
const swap = (a, i, j) => a.map((v, k) => (k === i ? a[j] : k === j ? a[i] : v));

export function twoSumTrace(nums, target) {
  const seen = new Map(), events = [];
  const snap = () => [...seen];
  events.push(event('hash.ev.start', [target], { i: -1, map: [], mark: null, found: null }));
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i], need = target - x;
    if (seen.has(need)) {
      const found = [seen.get(need), i];
      events.push(event('hash.ev.hit', [x, need, found[0], i], { i, map: snap(), mark: need, found }));
      return { events, found };
    }
    seen.set(x, i);
    events.push(event('hash.ev.miss', [x, need, i], { i, map: snap(), mark: x, found: null }));
  }
  events.push(event('hash.ev.none', [target], { i: nums.length, map: snap(), mark: null, found: null }));
  return { events, found: null };
}

export function moveZeroesTrace(input) {
  let a = [...input], write = 0;
  const events = [];
  const push = (key, args, read) => events.push(event(key, args, { a: [...a], read, write }));
  push('twoptr.ev.start', [], -1);
  for (let read = 0; read < a.length; read++) {
    if (a[read] === 0) { push('twoptr.ev.zero', [read], read); continue; }
    const value = a[read], to = write;
    if (read !== to) a = swap(a, read, to);
    write++;
    push(read === to ? 'twoptr.ev.stay' : 'twoptr.ev.swap', [value, read, to], read);
  }
  push('twoptr.ev.done', [write], a.length);
  return { events, result: a };
}

export function longestUniqueTrace(str) {
  const s = [...str], inWindow = new Set(), events = [];
  let l = 0, best = 0;
  const push = (key, args, extra = {}) => events.push(event(key, args, {
    l, best, set: [...inWindow], wr: -1, r: null, rCls: '', dup: null, ...extra,
  }));
  push('window.ev.start', []);
  for (let r = 0; r < s.length; r++) {
    const c = s[r];
    if (inWindow.has(c)) {
      push('window.ev.conflict', [c], { wr: r - 1, r, rCls: 'bad', dup: s.indexOf(c, l) });
      while (inWindow.has(c)) {
        const out = s[l];
        inWindow.delete(out);
        l++;
        const still = inWindow.has(c);
        push('window.ev.shrink', [out, l, still], { wr: r - 1, r, rCls: still ? 'bad' : 'cur', dup: still ? s.indexOf(c, l) : null });
      }
    }
    inWindow.add(c);
    const len = r - l + 1, record = len > best;
    if (record) best = len;
    push('window.ev.add', [c, s.slice(l, r + 1).join(''), len, record], { wr: r, r, rCls: 'cur' });
  }
  push('window.ev.done', [best], { wr: s.length - 1 });
  return { events, best };
}

export function binarySearchTrace(a, target) {
  let lo = 0, hi = a.length - 1, step = 0;
  const events = [];
  const push = (key, args, extra = {}) => events.push(event(key, args, { lo, hi, mid: null, found: false, step, ...extra }));
  push('binary.ev.start', [target, lo, hi]);
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    step++;
    if (a[mid] === target) {
      push('binary.ev.found', [mid, step, mid + 1], { mid, found: true });
      return { events, index: mid };
    }
    const right = a[mid] < target;
    push('binary.ev.probe', [lo, hi, mid, a[mid], target, right], { mid });
    if (right) lo = mid + 1; else hi = mid - 1;
    push('binary.ev.narrow', [right, lo, hi]);
  }
  push('binary.ev.none', [target]);
  return { events, index: -1 };
}

export function jumpTrace(a) {
  let reach = 0;
  const events = [];
  const push = (key, args, extra = {}) => events.push(event(key, args, { i: null, reach, done: false, stuck: false, ...extra }));
  push('greedy.ev.start', []);
  for (let i = 0; i < a.length; i++) {
    if (i > reach) {
      push('greedy.ev.stuck', [i, reach], { i, stuck: true });
      return { events, ok: false };
    }
    const before = reach;
    reach = Math.max(reach, i + a[i]);
    const done = reach >= a.length - 1;
    const key = done ? 'greedy.ev.win' : a[i] === 0 ? 'greedy.ev.zero' : 'greedy.ev.step';
    push(key, [i, before, a[i], reach, a.length - 1], { i, done });
    if (done) return { events, ok: true };
  }
  return { events, ok: true };
}

/** Coins the "largest first" strategy picks, or null when it gets stuck. */
export function greedyCoins(coins, amount) {
  const parts = [];
  let left = amount;
  for (const c of [...coins].sort((x, y) => y - x)) {
    while (left >= c) { parts.push(c); left -= c; }
  }
  return left === 0 ? parts : null;
}

export function coinChangeTrace(coins, amount) {
  const dp = [0, ...Array(amount).fill(null)], lastCoin = [null, ...Array(amount).fill(null)], events = [];
  const push = (key, args, extra = {}) => events.push(event(key, args, { dp: [...dp], i: null, opts: [], pick: null, ...extra }));
  push('dp.ev.start', [coins]);
  for (let i = 1; i <= amount; i++) {
    const opts = coins.filter(c => c <= i && dp[i - c] !== null).map(c => ({ c, v: dp[i - c] + 1 }));
    const best = opts.reduce((m, o) => (!m || o.v < m.v ? o : m), null);
    dp[i] = best ? best.v : null;
    lastCoin[i] = best ? best.c : null;
    push(best ? 'dp.ev.fill' : 'dp.ev.skip', [i, opts, dp[i], best?.c], { i, opts, pick: best?.c ?? null });
  }
  const parts = [];
  for (let s = amount; s > 0 && lastCoin[s] !== null; s -= lastCoin[s]) parts.push(lastCoin[s]);
  const answer = dp[amount] ?? -1;
  push('dp.ev.done', [amount, answer, parts, greedyCoins(coins, amount)]);
  return { events, answer, parts };
}
