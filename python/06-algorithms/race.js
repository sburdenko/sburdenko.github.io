/**
 * Bonus A: six sorts race on the same array. The traces are produced by JS versions of the same algorithms the
 * Python problems show, counting comparisons and swaps; one transport steps all six in lockstep.
 */
import { $, $$, esc } from '../../assets/vhs.js?v=202610071658';
import { t, onLang } from '../../assets/i18n.js?v=202610071658';
import { createPlayer, bindTransport } from '../../algorithms/bfs-dfs/player.js?v=202610071658';
import { barLayout, bars, svg, text } from '../../algorithms/patterns/view-kit.js?v=202610071658';
import { parseField, formatField } from '../shared/fields.js?v=202610071658';
import { randInts, randInt } from '../../algorithms/patterns/rig-kit.js?v=202610071658';

const FIELD = { key: 'a', type: 'ints', minLen: 2, maxLen: 12, min: 1, max: 40 };
const EXAMPLE = [23, 7, 31, 12, 4, 19, 27, 9];

/** Each tracer records a frame after every comparison and every write. */
function tracer(values) {
  const a = [...values], frames = [];
  let comparisons = 0, swaps = 0;
  const done = new Set();
  const rec = (cmp = null, swap = null) => frames.push(Object.freeze({ a: [...a], cmp, swap, done: new Set(done), comparisons, swaps }));
  const less = (i, j) => { comparisons++; rec([i, j]); return a[i] < a[j]; };
  const lessVal = (x, y) => { comparisons++; rec(null); return x < y; };
  const swapAt = (i, j) => { if (i === j) return; [a[i], a[j]] = [a[j], a[i]]; swaps++; rec(null, [i, j]); };
  const write = (i, v) => { a[i] = v; swaps++; rec(null, [i]); };
  const finish = () => { for (let i = 0; i < a.length; i++) done.add(i); rec(); return { frames, comparisons, swaps, result: [...a] }; };
  return { a, less, lessVal, swapAt, write, done, rec, finish };
}

export const SORTS = {
  bubble(values) {
    const T = tracer(values), n = T.a.length;
    for (let i = 0; i < n - 1; i++) {
      let swapped = false;
      for (let j = 0; j < n - 1 - i; j++) if (T.less(j + 1, j)) { T.swapAt(j, j + 1); swapped = true; }
      T.done.add(n - 1 - i);
      if (!swapped) break;
    }
    return T.finish();
  },
  selection(values) {
    const T = tracer(values), n = T.a.length;
    for (let i = 0; i < n - 1; i++) {
      let m = i;
      for (let j = i + 1; j < n; j++) if (T.less(j, m)) m = j;
      T.swapAt(i, m);
      T.done.add(i);
    }
    return T.finish();
  },
  insertion(values) {
    const T = tracer(values), n = T.a.length;
    for (let i = 1; i < n; i++) {
      const key = T.a[i];
      let j = i - 1;
      while (j >= 0 && !T.lessVal(T.a[j], key) && T.a[j] !== key) { T.write(j + 1, T.a[j]); j--; }
      T.write(j + 1, key);
    }
    return T.finish();
  },
  merge(values) {
    const T = tracer(values);
    const sort = (lo, hi) => {
      if (hi - lo <= 1) return;
      const mid = (lo + hi) >> 1;
      sort(lo, mid); sort(mid, hi);
      const left = T.a.slice(lo, mid), right = T.a.slice(mid, hi);
      let i = 0, j = 0, k = lo;
      while (i < left.length && j < right.length) { if (!T.lessVal(right[j], left[i])) T.write(k++, left[i++]); else T.write(k++, right[j++]); }
      while (i < left.length) T.write(k++, left[i++]);
      while (j < right.length) T.write(k++, right[j++]);
    };
    sort(0, T.a.length);
    return T.finish();
  },
  quick(values) {
    const T = tracer(values);
    const sort = (lo, hi) => {
      if (lo >= hi) { if (lo === hi) T.done.add(lo); return; }
      const pivot = T.a[hi];
      let i = lo;
      for (let j = lo; j < hi; j++) if (T.lessVal(T.a[j], pivot)) { T.swapAt(i, j); i++; }
      T.swapAt(i, hi);
      T.done.add(i);
      sort(lo, i - 1); sort(i + 1, hi);
    };
    sort(0, T.a.length - 1);
    return T.finish();
  },
  counting(values) {
    const T = tracer(values);
    const max = Math.max(...T.a), count = new Array(max + 1).fill(0);
    for (const x of T.a) { count[x]++; T.rec(); }
    let k = 0;
    for (let v = 0; v <= max; v++) for (let c = 0; c < count[v]; c++) { T.write(k, v); T.done.add(k); k++; }
    return T.finish();
  },
};
export const SORT_IDS = Object.keys(SORTS);

function chart(run, frameIndex) {
  const f = run.frames[Math.min(frameIndex, run.frames.length - 1)];
  const lay = barLayout(f.a, { bw: 14, gap: 4, unit: Math.max(2, Math.min(5, 90 / Math.max(1, ...f.a))), top: 10 });
  const cls = f.a.map((_, i) => (f.swap && f.swap.includes(i) ? 'swap' : f.cmp && f.cmp.includes(i) ? 'cmp' : f.done.has(i) ? 'done' : ''));
  let s = bars(f.a, lay, cls).replace(/<text[^>]*class="idx"[^>]*>[^<]*<\/text>/g, '');
  const finished = frameIndex >= run.frames.length - 1;
  s += text(lay.width / 2, lay.height + 4, `${f.comparisons} cmp · ${f.swaps} wr${finished ? ' · ✓' : ''}`, 'lbl-c');
  return svg(lay.width, lay.height + 14, s);
}

export function mountRace(root) {
  root.classList.add('pyrig', 'sort-race');
  root.id = 'rig-race';
  root.innerHTML = `<div class="rig-head"><p class="lbl">${t('py.ui.rigTag')}</p><h3>${t('race.title')}</h3></div>
    <div class="editor"><div class="fields"><label class="fld"><span class="fk">a</span><input spellcheck="false" autocomplete="off"></label></div>
      <div class="ed-actions"><button type="button" class="btn" data-ed="random">${t('in.random')}</button><button type="button" class="btn" data-ed="example">${t('in.example')}</button><button type="button" class="btn" data-ed="sorted">${t('race.sorted')}</button><button type="button" class="btn" data-ed="reversed">${t('race.reversed')}</button></div>
      <p class="ed-msg" aria-live="polite"></p></div>
    <div class="race-grid"></div>
    <div class="explanation"></div>
    <div class="transport">
      <button class="btn" data-t="first">|◀</button><button class="btn" data-t="back">◀</button><button class="btn primary" data-t="play">► PLAY</button><button class="btn" data-t="fwd">▶</button><button class="btn" data-t="end">▶|</button>
      <span class="spd"><span>${t('tr.speedLabel')}</span><input type="range" min="1" max="8" value="3"><b data-t="sps">3</b><span>${t('tr.perSec')}</span></span><span class="lbl" data-t="pos"></span>
    </div>`;
  const grid = $('.race-grid', root), input = $('input', root), msg = $('.ed-msg', root), expl = $('.explanation', root);
  let runs = null, frame = null;
  const player = createPlayer(paint);
  const sync = bindTransport($('.transport', root), player);

  function paint(next) {
    frame = next;
    if (!runs) return;
    grid.innerHTML = SORT_IDS.map(id => `<div class="race-cell"><p class="lbl">${t(`race.${id}`)}</p><div class="stage">${chart(runs[id], next.index)}</div></div>`).join('');
    const finished = SORT_IDS.filter(id => next.index >= runs[id].frames.length - 1);
    expl.innerHTML = t('race.step', next.index, finished.map(id => t(`race.${id}`)).join(', ') || '—');
    sync(next);
  }
  function load(values) {
    runs = Object.fromEntries(SORT_IDS.map(id => [id, SORTS[id](values)]));
    const total = Math.max(...SORT_IDS.map(id => runs[id].frames.length));
    player.load({ events: Array.from({ length: total }, (_, i) => ({ i })) });
  }
  function apply() {
    const parsed = parseField(input.value, FIELD);
    if (parsed.error) { msg.classList.add('bad'); msg.textContent = `${t(...parsed.error)} ${t('in.stale')}`; return; }
    msg.classList.remove('bad'); msg.textContent = t('race.hint');
    load(parsed.value);
  }
  const set = values => { input.value = formatField(values, FIELD); apply(); };
  input.addEventListener('input', () => { clearTimeout(input.timer); input.timer = setTimeout(apply, 300); });
  $('[data-ed="random"]', root).addEventListener('click', () => set(randInts(Math.random, randInt(Math.random, 6, 10), 1, 40)));
  $('[data-ed="example"]', root).addEventListener('click', () => set(EXAMPLE));
  $('[data-ed="sorted"]', root).addEventListener('click', () => set([...EXAMPLE].sort((a, b) => a - b)));
  $('[data-ed="reversed"]', root).addEventListener('click', () => set([...EXAMPLE].sort((a, b) => b - a)));
  onLang(() => { if (frame) paint(frame); });
  set(EXAMPLE);
}
