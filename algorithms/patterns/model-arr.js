/**
 * Pure traces for problems that joined existing chapters later: Sort Colors (two pointers), LIS with tails
 * (binary search), Insert Interval and Meeting Rooms II (greedy), Maximum Subarray (DP), Unique Paths (matrices)
 * and Coin Change II against Combination Sum IV (backtracking). Same contract as model-a.js: every event is a
 * complete snapshot with an i18n key and its arguments.
 */
const event = (key, args, state) => ({ key, args, ...state });

/* ---------- Maximum Subarray (#53): Kadane ---------- */
/**
 * cur — the best sum of a subarray that ends at i, best — the best one so far. x > cur + x only when cur < 0:
 * then a fresh start at i beats any continuation. ending[i] is cur after step i — the DP row Kadane keeps one cell of.
 */
export function kadaneTrace(nums) {
  const ending = nums.map(() => null), events = [];
  let cur = nums[0], best = nums[0], from = 0, bestFrom = 0, bestTo = 0;
  ending[0] = cur;
  const push = (key, args, extra = {}) => events.push(event(key, args, {
    i: 0, cur, best, from, bestRange: [bestFrom, bestTo], ending: [...ending], ...extra,
  }));
  push('kad.ev.start', [nums[0]]);
  for (let i = 1; i < nums.length; i++) {
    const x = nums[i], old = cur;
    if (x > cur + x) {
      cur = x;
      from = i;
      ending[i] = cur;
      push('kad.ev.restart', [i, x, old, old + x], { i });
    } else {
      cur += x;
      ending[i] = cur;
      push('kad.ev.extend', [i, x, old, cur, from], { i });
    }
    if (cur > best) {
      const was = best;
      best = cur;
      bestFrom = from;
      bestTo = i;
      push('kad.ev.best', [i, was, best, from], { i });
    }
  }
  const allNegative = nums.every(v => v < 0);
  push(allNegative ? 'kad.ev.allNeg' : 'kad.ev.done', [best, bestFrom, bestTo, nums.length], { i: null });
  return { events, best, range: [bestFrom, bestTo] };
}

/* ---------- Insert Interval (#57) ---------- */
/**
 * intervals are sorted by start and do not overlap. Three phases: copy everything that ends before s, absorb
 * everything that starts no later than e (growing [s, e]), place [s, e], copy the rest. A touch — an end equal to s
 * or a start equal to e — still merges: closed intervals [1, 2] and [2, 3] share the point 2.
 */
export function insertIntervalTrace(intervals, newInterval) {
  const n = intervals.length, status = intervals.map(() => null), res = [], events = [];
  let [s, e] = newInterval, i = 0, phase = 'left', placed = null, absorbed = 0;
  const push = (key, args, extra = {}) => events.push(event(key, args, {
    i: null, s, e, phase, status: [...status], res: res.map(r => [...r]), placed, ...extra,
  }));
  push('ins.ev.start', [s, e, n]);
  while (i < n && intervals[i][1] < s) {
    const [a, b] = intervals[i];
    status[i] = 'left';
    res.push([a, b]);
    push('ins.ev.left', [i, a, b, s], { i });
    i++;
  }
  phase = 'absorb';
  while (i < n && intervals[i][0] <= e) {
    const [a, b] = intervals[i], s0 = s, e0 = e;
    const touch = a === e0 || b === s0;
    s = Math.min(s, a);
    e = Math.max(e, b);
    status[i] = 'absorb';
    absorbed++;
    push(touch ? 'ins.ev.touch' : 'ins.ev.absorb', [i, a, b, s0, e0, s, e], { i });
    i++;
  }
  res.push([s, e]);
  placed = res.length - 1;
  phase = 'place';
  push('ins.ev.place', [s, e, absorbed, newInterval[0], newInterval[1]]);
  phase = 'right';
  while (i < n) {
    const [a, b] = intervals[i];
    status[i] = 'right';
    res.push([a, b]);
    push('ins.ev.right', [i, a, b, e], { i });
    i++;
  }
  phase = 'done';
  push('ins.ev.done', [res.map(r => [...r])]);
  return { events, result: res };
}

/* ---------- Sort Colors (#75): the Dutch national flag ---------- */
/**
 * Four zones: [0, lo) zeros, [lo, mid) ones, [mid, hi] not looked at yet, (hi, n) twos. A 0 swaps with nums[lo] —
 * always a 1, or mid itself — and both pointers step; a 1 just steps mid; a 2 swaps with nums[hi] and only hi steps,
 * because the value that came from hi has not been looked at.
 */
export function sortColorsTrace(nums) {
  const a = [...nums], events = [];
  let lo = 0, mid = 0, hi = a.length - 1, looks = 0;
  const push = (key, args, extra = {}) => events.push(event(key, args, { a: [...a], lo, mid, hi, looks, swap: null, at: null, ...extra }));
  push('sc.ev.start', [a.length]);
  while (mid <= hi) {
    looks++;
    if (a[mid] === 0) {
      const self = lo === mid, l = lo, m = mid;
      [a[lo], a[mid]] = [a[mid], a[lo]];
      lo++;
      mid++;
      push('sc.ev.zero', [m, l, self], { swap: self ? null : [l, m], at: m });
    } else if (a[mid] === 1) {
      mid++;
      push('sc.ev.one', [mid - 1], { at: mid - 1 });
    } else {
      const h = hi, came = a[hi], self = mid === hi;
      [a[mid], a[hi]] = [a[hi], a[mid]];
      hi--;
      push('sc.ev.two', [mid, h, came, self], { swap: self ? null : [mid, h], at: mid });
    }
  }
  push('sc.ev.done', [[...a], looks]);
  return { events, result: a, looks };
}

/* ---------- Longest Increasing Subsequence (#300) in O(n log n) ---------- */
/**
 * tails[k] — the smallest value an increasing subsequence of length k + 1 can end with. For every x, lower_bound
 * finds the first tail ≥ x: x replaces it, or extends tails when every tail is smaller. tails stays sorted, so the
 * search is binary; its length is the answer, but tails itself is usually not a subsequence of nums.
 */
export function lisTailsTrace(nums) {
  const tails = [], tailIdx = [], prev = nums.map(() => -1), events = [];
  const push = (key, args, extra = {}) => events.push(event(key, args, {
    tails: [...tails], tailIdx: [...tailIdx], i: null, pos: null, probes: [], compared: [], ...extra,
  }));
  push('lt.ev.start', [nums.length]);
  nums.forEach((x, i) => {
    let lo = 0, hi = tails.length;
    const probes = [];
    while (lo < hi) {
      const m = (lo + hi) >> 1;
      probes.push(m);
      if (tails[m] < x) lo = m + 1;
      else hi = m;
    }
    const pos = lo, compared = probes.map(m => tails[m]);
    prev[i] = pos > 0 ? tailIdx[pos - 1] : -1;
    if (pos === tails.length) {
      tails.push(x);
      tailIdx.push(i);
      push('lt.ev.append', [i, x, pos, tails.length, pos ? tails[pos - 1] : null, probes.length], { i, pos, probes, compared });
    } else {
      const old = tails[pos];
      tails[pos] = x;
      tailIdx[pos] = i;
      push(old === x ? 'lt.ev.equal' : 'lt.ev.replace', [i, x, pos, old, probes.length], { i, pos, probes, compared });
    }
  });
  const lis = [];
  for (let k = tailIdx.at(-1); k >= 0; k = prev[k]) lis.unshift(nums[k]);
  const isSubsequence = tailIdx.every((v, k) => !k || tailIdx[k - 1] < v);
  push('lt.ev.done', [tails.length, [...tails], lis, isSubsequence]);
  return { events, length: tails.length, tails, lis };
}

/* ---------- Unique Paths (#62) ---------- */
/** C(a, b) without overflow for the small sizes the rig takes. */
export function binomial(a, b) {
  let r = 1;
  for (let k = 1; k <= b; k++) r = r * (a - b + k) / k;
  return Math.round(r);
}

/**
 * mode 'table': dp[r][c] = dp[r − 1][c] + dp[r][c − 1], the first row and column are 1.
 * mode 'row': one array row[c]; before row[c] += row[c − 1], row[c] still holds the cell above, row[c − 1] already
 * holds the cell to the left. table is drawn for reference: in row mode the rows above r − 1 are gone.
 */
export function uniquePathsTrace(m, n, mode) {
  const table = Array.from({ length: m }, () => Array(n).fill(null)), events = [];
  const row = mode === 'row' ? Array(n).fill(1) : null;
  const push = (key, args, extra = {}) => events.push(event(key, args, {
    table: table.map(r => [...r]), row: row ? [...row] : null, cur: null, r: null, ...extra,
  }));
  push('up.ev.start', [m, n, mode]);
  if (mode === 'row') {
    for (let c = 0; c < n; c++) table[0][c] = 1;
    push('up.ev.rowInit', [n], { r: 0 });
    for (let r = 1; r < m; r++) {
      table[r][0] = 1;
      for (let c = 1; c < n; c++) {
        const old = row[c], left = row[c - 1];
        row[c] += left;
        table[r][c] = row[c];
        push('up.ev.rowCell', [r, c, old, left, row[c]], { cur: [r, c], r });
      }
    }
  } else {
    for (let c = 0; c < n; c++) table[0][c] = 1;
    for (let r = 0; r < m; r++) table[r][0] = 1;
    push('up.ev.base', [m, n]);
    for (let r = 1; r < m; r++) {
      for (let c = 1; c < n; c++) {
        const up = table[r - 1][c], left = table[r][c - 1];
        table[r][c] = up + left;
        push('up.ev.cell', [r, c, up, left, table[r][c]], { cur: [r, c], r });
      }
    }
  }
  const paths = table[m - 1][n - 1];
  push('up.ev.done', [m, n, paths, mode, binomial(m + n - 2, m - 1)], { r: m - 1 });
  return { events, paths };
}

/* ---------- Coin Change II (#518) against Combination Sum IV (#377) ---------- */
export const ORDERS = ['coins-outer', 'sums-outer'];
/** How many ways the rig lists for one cell; the rest is a count. */
export const WAYS_SHOWN = 6;

/** The answer of one loop order, for the other order's closing comparison and for tests. */
export function countWays(coins, amount, order) {
  const dp = [1, ...Array(amount).fill(0)];
  if (order === 'coins-outer') {
    for (const c of coins) for (let s = c; s <= amount; s++) dp[s] += dp[s - c];
  } else {
    for (let s = 1; s <= amount; s++) for (const c of coins) if (c <= s) dp[s] += dp[s - c];
  }
  return dp[amount];
}

/**
 * One array dp[s] = 1 at s = 0, and dp[s] += dp[s − c]. table[k][s] is what coin k added to dp[s], so in both orders
 * dp[s] is the sum of its column (s > 0); only the fill order differs — row by row or column by column.
 * ways[s] lists the actual sums, written in the order the parts were added: the reason the counts differ.
 */
export function coinOrderTrace(coins, amount, order) {
  const dp = [1, ...Array(amount).fill(0)], ways = [[[]], ...Array.from({ length: amount }, () => [])];
  const table = coins.map(() => Array(amount + 1).fill(null)), events = [];
  const push = (key, args, extra = {}) => events.push(event(key, args, {
    dp: [...dp], table: table.map(r => [...r]), k: null, s: null, added: [], ...extra,
  }));
  push('co.ev.start', [coins, amount, order]);
  const step = (k, s) => {
    const c = coins[k], add = dp[s - c], old = dp[s];
    dp[s] += add;
    table[k][s] = add;
    const added = ways[s - c].map(w => [...w, c]);
    ways[s].push(...added);
    push(add ? 'co.ev.add' : 'co.ev.zero', [c, s, add, old, dp[s]], { k, s, added: added.slice(0, WAYS_SHOWN).map(w => w.join('+')), more: Math.max(0, added.length - WAYS_SHOWN) });
  };
  if (order === 'coins-outer') {
    coins.forEach((c, k) => {
      push('co.ev.coin', [c, k, amount], { k });
      for (let s = c; s <= amount; s++) step(k, s);
    });
  } else {
    for (let s = 1; s <= amount; s++) {
      push('co.ev.sum', [s, coins.filter(c => c <= s)], { s });
      coins.forEach((c, k) => { if (c <= s) step(k, s); });
    }
  }
  const other = countWays(coins, amount, order === 'coins-outer' ? 'sums-outer' : 'coins-outer');
  push('co.ev.done', [amount, dp[amount], order, other, ways[amount].slice(0, WAYS_SHOWN).map(w => w.join('+'))]);
  return { events, answer: dp[amount], ways: ways[amount] };
}

/* ---------- Meeting Rooms II (#253): a sweep over start and end events ---------- */
/**
 * Every meeting [a, b) gives two events, +1 at a and −1 at b. Sorted by time, and at equal times the end first:
 * a meeting that ends at 4 frees its room for one that starts at 4. The counter of running meetings peaks at the
 * answer. room[k] — the lowest free room meeting k takes; the greedy reuse needs exactly peak rooms.
 */
export function meetingRoomsTrace(intervals) {
  const n = intervals.length;
  const sweep = intervals.flatMap(([a, b], k) => [{ t: a, d: 1, k }, { t: b, d: -1, k }])
    .sort((x, y) => x.t - y.t || x.d - y.d || x.k - y.k);
  const starts = new Set(intervals.map(([a]) => a));
  const room = intervals.map(() => null), state = intervals.map(() => 'wait'), free = [], events = [];
  let rooms = 0, peak = 0, made = 0;
  const push = (key, args, extra = {}) => events.push(event(key, args, {
    j: null, t: null, k: null, rooms, peak, room: [...room], state: [...state], ...extra,
  }));
  push('mr.ev.start', [n, sweep.length]);
  sweep.forEach(({ t, d, k }, j) => {
    const [a, b] = intervals[k];
    if (d < 0) {
      rooms--;
      state[k] = 'done';
      free.push(room[k]);
      free.sort((x, y) => x - y);
      push(starts.has(t) ? 'mr.ev.free' : 'mr.ev.close', [t, k, a, b, rooms, room[k] + 1], { j, t, k });
    } else {
      rooms++;
      state[k] = 'open';
      const reused = free.length > 0;
      room[k] = reused ? free.shift() : made++;
      const record = rooms > peak;
      if (record) peak = rooms;
      push(record ? 'mr.ev.peak' : 'mr.ev.open', [t, k, a, b, rooms, peak, room[k] + 1, reused], { j, t, k });
    }
  });
  push('mr.ev.done', [peak, startsFirstPeak(intervals)]);
  return { events, peak, sweep, room, rooms: made };
}

/** The peak if starts were sorted before ends at equal times — the classic tie bug. */
export function startsFirstPeak(intervals) {
  const sweep = intervals.flatMap(([a, b]) => [[a, 1], [b, -1]]).sort((x, y) => x[0] - y[0] || y[1] - x[1]);
  let rooms = 0, peak = 0;
  for (const [, d] of sweep) { rooms += d; peak = Math.max(peak, rooms); }
  return peak;
}
