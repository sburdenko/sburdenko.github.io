/**
 * Pure traces for chapters 01–04: hash map, two pointers, sliding window, binary search.
 * Every event is a complete snapshot, so the player can rewind; texts are i18n keys with arguments.
 */
const event = (key, args, state) => ({ key, args, ...state });
const swap = (a, i, j) => a.map((v, k) => (k === i ? a[j] : k === j ? a[i] : v));
const inf = v => (v === Infinity ? '+∞' : v === -Infinity ? '−∞' : v);

/* ---------- 01 hash map ---------- */
export function twoSumTrace(nums, target) {
  const seen = new Map(), events = [];
  const push = (key, args, extra) => events.push(event(key, args, { i: -1, map: [...seen], mark: null, found: null, ...extra }));
  push('hash.ev.start', [target]);
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i], need = target - x;
    if (seen.has(need)) {
      const found = [seen.get(need), i];
      push('hash.ev.hit', [x, need, found[0], i], { i, mark: need, found });
      return { events, found };
    }
    seen.set(x, i);
    push('hash.ev.miss', [x, need, i], { i, mark: x });
  }
  push('hash.ev.none', [target], { i: nums.length });
  return { events, found: null };
}

export function containsDupTrace(nums) {
  const seen = new Map(), events = [];
  const push = (key, args, extra) => events.push(event(key, args, { i: -1, seen: [...seen.keys()], hit: null, ...extra }));
  push('dup.ev.start', []);
  for (let i = 0; i < nums.length; i++) {
    const x = nums[i];
    if (seen.has(x)) {
      push('dup.ev.hit', [x, seen.get(x), i], { i, hit: [seen.get(x), i] });
      return { events, dup: true };
    }
    seen.set(x, i);
    push('dup.ev.add', [x], { i });
  }
  push('dup.ev.none', [], { i: nums.length });
  return { events, dup: false };
}

export function groupAnagramsTrace(strs) {
  const groups = new Map(), events = [];
  const push = (key, args, extra) => events.push(event(key, args, {
    i: -1, groups: [...groups].map(([k, list]) => [k, [...list]]), ...extra,
  }));
  push('anag.ev.start', []);
  strs.forEach((s, i) => {
    const key = [...s].sort().join('');
    const isNew = !groups.has(key);
    groups.set(key, [...(groups.get(key) || []), s]);
    push('anag.ev.key', [s, key, isNew], { i });
  });
  push('anag.ev.done', [groups.size], { i: strs.length });
  return { events, groups: [...groups.values()] };
}

export function subarraySumTrace(nums, k) {
  const seen = new Map([[0, [-1]]]), events = [];
  let sum = 0, count = 0;
  const push = (key, args, extra) => events.push(event(key, args, {
    i: -1, sum, count, map: [...seen].map(([p, at]) => [p, at.length]), ranges: [], ...extra,
  }));
  push('psum.ev.start', [k]);
  nums.forEach((x, i) => {
    sum += x;
    const need = sum - k, starts = seen.get(need) || [];
    count += starts.length;
    seen.set(sum, [...(seen.get(sum) || []), i]);
    push('psum.ev.step', [i, x, sum, need, starts.length, count], { i, ranges: starts.map(p => [p + 1, i]) });
  });
  push('psum.ev.done', [count, k], { i: nums.length });
  return { events, count };
}

/* ---------- 02 two pointers ---------- */
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

export function containerTrace(h) {
  let l = 0, r = h.length - 1, best = 0, bestLR = null;
  const events = [];
  const push = (key, args) => events.push(event(key, args, { l, r, best, bestLR }));
  push('water.ev.start', []);
  while (l < r) {
    const area = Math.min(h[l], h[r]) * (r - l), record = area > best;
    if (record) { best = area; bestLR = [l, r]; }
    const move = h[l] < h[r] ? 'L' : h[l] > h[r] ? 'R' : '=';
    push('water.ev.step', [h[l], h[r], r - l, area, record, move]);
    if (h[l] < h[r]) l++; else r--;
  }
  push('water.ev.done', [best]);
  return { events, best };
}

export function threeSumTrace(nums) {
  const a = [...nums].sort((x, y) => x - y), triples = [], events = [];
  const push = (key, args, extra) => events.push(event(key, args, { a, i: null, l: null, r: null, triples: triples.map(t => [...t]), ...extra }));
  push('tsum.ev.start', [a]);
  for (let i = 0; i < a.length - 2; i++) {
    if (i > 0 && a[i] === a[i - 1]) { push('tsum.ev.skip', [a[i]], { i }); continue; }
    push('tsum.ev.fix', [a[i], -a[i]], { i });
    let l = i + 1, r = a.length - 1;
    while (l < r) {
      const sum = a[i] + a[l] + a[r];
      if (sum === 0) {
        triples.push([a[i], a[l], a[r]]);
        push('tsum.ev.found', [a[i], a[l], a[r]], { i, l, r });
        while (l < r && a[l] === a[l + 1]) l++;
        while (l < r && a[r] === a[r - 1]) r--;
        l++; r--;
      } else {
        push('tsum.ev.check', [a[i], a[l], a[r], sum, sum < 0], { i, l, r });
        if (sum < 0) l++; else r--;
      }
    }
  }
  push('tsum.ev.done', [triples.length]);
  return { events, triples };
}

export function trapTrace(h) {
  let l = 0, r = h.length - 1, lmax = 0, rmax = 0, total = 0;
  const water = h.map(() => 0), events = [];
  const push = (key, args, extra) => events.push(event(key, args, { l, r, lmax, rmax, total, water: [...water], at: null, ...extra }));
  push('trap.ev.start', []);
  while (l < r) {
    if (h[l] < h[r]) {
      const add = Math.max(0, lmax - h[l]);
      lmax = Math.max(lmax, h[l]);
      water[l] = add;
      total += add;
      push('trap.ev.left', [l, h[l], lmax, add, h[r]], { at: l });
      l++;
    } else {
      const add = Math.max(0, rmax - h[r]);
      rmax = Math.max(rmax, h[r]);
      water[r] = add;
      total += add;
      push('trap.ev.right', [r, h[r], rmax, add, h[l]], { at: r });
      r--;
    }
  }
  push('trap.ev.done', [total]);
  return { events, total };
}

/* ---------- 03 sliding window ---------- */
export function maxAverageTrace(nums, k) {
  let sum = 0;
  for (let i = 0; i < k; i++) sum += nums[i];
  let best = sum, bestAt = 0;
  const events = [];
  const push = (key, args, extra) => events.push(event(key, args, { l: 0, r: k - 1, sum, best, ...extra }));
  push('avg.ev.init', [k, sum]);
  for (let r = k; r < nums.length; r++) {
    const out = nums[r - k];
    sum += nums[r] - out;
    const record = sum > best;
    if (record) { best = sum; bestAt = r - k + 1; }
    push('avg.ev.slide', [nums[r], out, sum, record], { l: r - k + 1, r });
  }
  push('avg.ev.done', [best, k, (best / k).toFixed(2)], { l: bestAt, r: bestAt + k - 1 });
  return { events, best, average: best / k };
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

export function minSubArrayTrace(target, nums) {
  let l = 0, sum = 0, best = 0, bestLR = null;
  const events = [];
  const push = (key, args, extra) => events.push(event(key, args, { l, r: null, sum, best, bestLR, ...extra }));
  push('minw.ev.start', [target]);
  for (let r = 0; r < nums.length; r++) {
    sum += nums[r];
    push('minw.ev.grow', [nums[r], sum, target, sum >= target], { r });
    while (sum >= target) {
      const len = r - l + 1, record = !best || len < best;
      if (record) { best = len; bestLR = [l, r]; }
      const out = nums[l];
      sum -= out;
      l++;
      push('minw.ev.shrink', [len, record, out, sum], { r });
    }
  }
  push('minw.ev.done', [best]);
  return { events, best };
}

export function minWindowTrace(str, t) {
  const s = [...str], need = new Map(), have = new Map(), events = [];
  for (const c of t) need.set(c, (need.get(c) || 0) + 1);
  let formed = 0, l = 0, best = null;
  const push = (key, args, extra) => events.push(event(key, args, {
    l, r: null, best, counts: [...need].map(([c, n]) => [c, have.get(c) || 0, n]), ...extra,
  }));
  push('mwin.ev.start', [t, need.size]);
  for (let r = 0; r < s.length; r++) {
    const c = s[r];
    have.set(c, (have.get(c) || 0) + 1);
    if (need.has(c) && have.get(c) === need.get(c)) formed++;
    push('mwin.ev.grow', [c, need.has(c), formed, need.size], { r });
    while (formed === need.size) {
      const len = r - l + 1, record = !best || len < best[1] - best[0] + 1;
      if (record) best = [l, r];
      const out = s[l];
      have.set(out, have.get(out) - 1);
      if (need.has(out) && have.get(out) < need.get(out)) formed--;
      l++;
      push('mwin.ev.shrink', [s.slice(l - 1, r + 1).join(''), record, out, formed === need.size], { r });
    }
  }
  const window = best ? s.slice(best[0], best[1] + 1).join('') : '';
  push('mwin.ev.done', [window]);
  return { events, window };
}

/* ---------- 04 binary search ---------- */
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

export function rotatedSearchTrace(a, target) {
  let lo = 0, hi = a.length - 1;
  const events = [];
  const push = (key, args, extra = {}) => events.push(event(key, args, { lo, hi, mid: null, found: false, sorted: null, ...extra }));
  push('rsa.ev.start', [target]);
  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (a[mid] === target) {
      push('rsa.ev.found', [mid], { mid, found: true });
      return { events, index: mid };
    }
    const leftSorted = a[lo] <= a[mid];
    const sorted = leftSorted ? [lo, mid] : [mid, hi];
    const inside = leftSorted ? a[lo] <= target && target < a[mid] : a[mid] < target && target <= a[hi];
    const goLeft = leftSorted === inside;
    push('rsa.ev.probe', [mid, a[mid], leftSorted, a[sorted[0]], a[sorted[1]], target, inside, goLeft], { mid, sorted });
    if (goLeft) hi = mid - 1; else lo = mid + 1;
  }
  push('rsa.ev.none', [target]);
  return { events, index: -1 };
}

export function kokoTrace(piles, h) {
  let lo = 1, hi = Math.max(...piles);
  const probed = [], events = [];
  const push = (key, args, extra = {}) => events.push(event(key, args, { lo, hi, k: null, probed: probed.map(p => [...p]), ...extra }));
  push('koko.ev.start', [lo, hi, h]);
  while (lo < hi) {
    const k = lo + Math.floor((hi - lo) / 2);
    const per = piles.map(p => Math.ceil(p / k)), hours = per.reduce((s, v) => s + v, 0), fits = hours <= h;
    probed.push([k, fits]);
    push('koko.ev.probe', [k, per, hours, h, fits], { k });
    if (fits) hi = k; else lo = k + 1;
  }
  push('koko.ev.done', [lo], { k: lo });
  return { events, speed: lo };
}

export function medianTwoTrace(first, second) {
  const [a, b] = first.length <= second.length ? [first, second] : [second, first];
  const m = a.length, n = b.length, half = Math.floor((m + n + 1) / 2), events = [];
  let lo = 0, hi = m;
  const push = (key, args, extra = {}) => events.push(event(key, args, { i: null, j: null, verdict: null, ...extra }));
  push('med.ev.start', [m, n, half]);
  while (lo <= hi) {
    const i = Math.floor((lo + hi) / 2), j = half - i;
    const al = i > 0 ? a[i - 1] : -Infinity, ar = i < m ? a[i] : Infinity;
    const bl = j > 0 ? b[j - 1] : -Infinity, br = j < n ? b[j] : Infinity;
    const verdict = al > br ? 'left' : bl > ar ? 'right' : 'ok';
    push('med.ev.cut', [i, j, inf(al), inf(ar), inf(bl), inf(br), verdict], { i, j, verdict });
    if (verdict === 'ok') {
      const odd = (m + n) % 2 === 1;
      const median = odd ? Math.max(al, bl) : (Math.max(al, bl) + Math.min(ar, br)) / 2;
      push('med.ev.done', [median, odd], { i, j, verdict });
      return { events, median, a, b };
    }
    if (verdict === 'left') hi = i - 1; else lo = i + 1;
  }
  throw new Error('medianTwoTrace: inputs must be sorted');
}
