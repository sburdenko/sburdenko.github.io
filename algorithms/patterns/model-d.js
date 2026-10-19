/**
 * Pure traces for chapter 13: arrays and matrices walked in a planned order.
 * Same contract as model-a.js: every event is a complete snapshot with an i18n key and its arguments.
 */
const event = (key, args, state) => ({ key, args, ...state });
const copy = m => m.map(r => [...r]);
const zero = v => v || 0; // −0 → 0, so products print and compare as plain zeros

/** Two passes over the output array: products on the left, then products on the right. No division. */
export function productExceptTrace(nums) {
  const n = nums.length, ans = nums.map(() => null), events = [];
  let prefix = 1, suffix = 1, phase = 'L';
  const push = (key, args, extra = {}) => events.push(event(key, args, { i: null, phase, prefix, suffix, ans: [...ans], ...extra }));
  push('pes.ev.start', [n]);
  for (let i = 0; i < n; i++) {
    ans[i] = prefix;
    const before = prefix;
    prefix = zero(prefix * nums[i]);
    push('pes.ev.left', [i, before, nums[i], prefix], { i });
  }
  phase = 'R';
  push('pes.ev.turn', [n - 1]);
  for (let i = n - 1; i >= 0; i--) {
    const left = ans[i], right = suffix;
    ans[i] = zero(left * right);
    suffix = zero(suffix * nums[i]);
    push('pes.ev.right', [i, left, right, ans[i], nums[i], suffix], { i });
  }
  phase = 'done';
  push('pes.ev.done', [[...ans]]);
  return { events, ans };
}

/** Rotate 90° clockwise in place: transpose over the main diagonal, then mirror every row. */
export function rotateTrace(input) {
  const m = copy(input), n = m.length, events = [];
  let phase = 'T', swaps = 0;
  const push = (key, args, extra = {}) => events.push(event(key, args, { m: copy(m), phase, swaps, pair: null, row: null, ...extra }));
  push('rot.ev.start', [n]);
  for (let r = 0; r < n; r++) {
    for (let c = r + 1; c < n; c++) {
      [m[r][c], m[c][r]] = [m[c][r], m[r][c]];
      swaps++;
      push('rot.ev.tswap', [r, c, m[c][r], m[r][c]], { pair: [[r, c], [c, r]] });
    }
  }
  phase = 'M';
  push('rot.ev.mirror', [n]);
  for (let r = 0; r < n; r++) {
    for (let a = 0, b = n - 1; a < b; a++, b--) {
      [m[r][a], m[r][b]] = [m[r][b], m[r][a]];
      swaps++;
      push('rot.ev.rswap', [r, a, b, m[r][b], m[r][a]], { pair: [[r, a], [r, b]], row: r });
    }
  }
  phase = 'done';
  push('rot.ev.done', [swaps]);
  return { events, result: m };
}

/** O(1) memory: the first row and column store the markers, two flags remember their own zeros. */
export function setZeroesTrace(input) {
  const m = copy(input), rows = m.length, cols = m[0].length, events = [];
  let rowZero = null, colZero = null, phase = 'scan';
  const push = (key, args, extra = {}) => events.push(event(key, args, { m: copy(m), phase, rowZero, colZero, at: null, marks: [], changed: [], ...extra }));
  push('smz.ev.start', [rows, cols]);
  rowZero = m[0].includes(0);
  colZero = m.some(r => r[0] === 0);
  const own = [...m[0].map((v, c) => [0, c]), ...m.map((_, r) => [r, 0])].filter(([r, c]) => m[r][c] === 0);
  push('smz.ev.flags', [rowZero, colZero], { marks: own });
  let found = 0;
  for (let r = 1; r < rows; r++) {
    for (let c = 1; c < cols; c++) {
      if (m[r][c] !== 0) continue;
      found++;
      m[r][0] = 0;
      m[0][c] = 0;
      push('smz.ev.mark', [r, c], { at: [r, c], marks: [[r, 0], [0, c]] });
    }
  }
  phase = 'fill';
  push('smz.ev.fill', [found, rows > 1 && cols > 1]);
  for (let r = 1; r < rows; r++) {
    const changed = [];
    for (let c = 1; c < cols; c++) {
      if (m[r][c] !== 0 && (m[r][0] === 0 || m[0][c] === 0)) { m[r][c] = 0; changed.push(c); }
    }
    const byRow = m[r][0] === 0;
    push(changed.length ? 'smz.ev.row' : 'smz.ev.keep', [r, byRow, changed], { changed: changed.map(c => [r, c]) });
  }
  phase = 'edges';
  const top = rowZero ? m[0].map((v, c) => [0, c]).filter(([, c]) => m[0][c] !== 0) : [];
  if (rowZero) m[0].fill(0);
  push('smz.ev.top', [rowZero, top.length], { changed: top });
  const left = colZero ? m.map((_, r) => [r, 0]).filter(([r]) => m[r][0] !== 0) : [];
  if (colZero) m.forEach(r => { r[0] = 0; });
  push('smz.ev.left', [colZero, left.length], { changed: left });
  phase = 'done';
  push('smz.ev.done', []);
  return { events, result: m };
}

/** Four bounds close in: a row to the right, a column down, a row to the left, a column up. */
export function spiralTrace(m) {
  const rows = m.length, cols = m[0].length, order = [], events = [];
  let top = 0, bottom = rows - 1, left = 0, right = cols - 1;
  const push = (key, args, extra = {}) => events.push(event(key, args, { top, bottom, left, right, order: order.map(p => [...p]), run: [], ...extra }));
  const walk = (key, cellsOf, after) => {
    const run = cellsOf();
    order.push(...run);
    after();
    if (run.length) push(key, [run.map(([r, c]) => m[r][c]), top, bottom, left, right], { run });
  };
  const range = (from, to) => (from <= to ? Array.from({ length: to - from + 1 }, (_, k) => from + k) : Array.from({ length: from - to + 1 }, (_, k) => from - k));
  push('spi.ev.start', [rows, cols]);
  while (top <= bottom && left <= right) {
    walk('spi.ev.right', () => range(left, right).map(c => [top, c]), () => { top++; });
    walk('spi.ev.down', () => (top <= bottom ? range(top, bottom).map(r => [r, right]) : []), () => { right--; });
    if (top <= bottom) walk('spi.ev.left', () => (left <= right ? range(right, left).map(c => [bottom, c]) : []), () => { bottom--; });
    else push('spi.ev.noRow', [top, bottom]);
    if (left <= right) walk('spi.ev.up', () => (top <= bottom ? range(bottom, top).map(r => [r, left]) : []), () => { left++; });
    else push('spi.ev.noCol', [left, right]);
  }
  const values = order.map(([r, c]) => m[r][c]);
  push('spi.ev.done', [values]);
  return { events, order: values };
}

/** Row by row the matrix becomes a histogram of heights; each row is Largest Rectangle in Histogram. */
export function maximalRectTrace(grid) {
  const rows = grid.length, cols = grid[0].length, h = Array(cols).fill(0), events = [];
  let stack = [], best = 0, bestRect = null;
  const push = (key, args, extra = {}) => events.push(event(key, args, { r: null, i: null, h: [...h], stack: [...stack], best, bestRect, rect: null, ...extra }));
  push('mrect.ev.start', [rows, cols]);
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) h[c] = grid[r][c] ? h[c] + 1 : 0;
    stack = [];
    push('mrect.ev.row', [r, [...h]], { r });
    for (let i = 0; i <= cols; i++) {
      const cur = i === cols ? 0 : h[i];
      while (stack.length && h[stack.at(-1)] >= cur) {
        const j = stack.pop(), from = stack.length ? stack.at(-1) + 1 : 0, width = i - from, area = h[j] * width;
        const rect = h[j] ? [r - h[j] + 1, from, r, i - 1] : null, record = area > best;
        if (record) { best = area; bestRect = rect; }
        push('mrect.ev.pop', [j, h[j], width, area, record, i === cols], { r, i, rect });
      }
      if (i < cols) {
        stack.push(i);
        push('mrect.ev.push', [i, h[i]], { r, i });
      }
    }
  }
  push('mrect.ev.done', [best]);
  return { events, best };
}
