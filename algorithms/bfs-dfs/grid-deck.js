/** Пульт «двумерный массив»: лабиринт, обход по клеткам, пошаговая перемотка. */
import { $, $$, fitCanvas, press, fmtI, onVisible } from '../../assets/vhs.js?v=202609161617';
import { t, onLang } from '../../assets/i18n.js?v=202609161617';
import { makeGrid, gridNeighbors, gridXY, traverse, stateAt, pathTo, WALL, FREE } from './traversal.js?v=202609161617';
import { drawGrid, gridLayout, cellAtPoint } from './grid-view.js?v=202609161617';
import { renderPseudo, renderFrontier, noteFor, tile, COL } from './panels.js?v=202609161617';
import { createPlayer, bindTransport } from './player.js?v=202609161617';

const ODD = n => (n % 2 ? n : n + 1);

export function initGridDeck() {
  const cv = $('#gridCv'), side = $('#gridSide'), statsEl = $('#gridStats');
  if (!cv) return;
  const tip = $('#gridTip');

  const S = {
    order: 'bfs', kind: 'maze', cols: innerWidth < 640 ? 21 : 31, density: 0.3,
    seed: 7, mode: 'wall', tree: true, colorBy: 'order', diagonal: false
  };
  let grid, run, lay, view, hover = -1, visible = true;

  const rows = () => ODD(Math.max(9, Math.round(S.cols * 0.58)));
  const labelOf = id => { const [x, y] = gridXY(grid, id); return `${x},${y}`; };

  const player = createPlayer(f => { view = null; paint(f); });
  const syncTransport = bindTransport($('#gridTransport'), player);

  function rebuild(keepGrid = false) {
    if (!keepGrid) grid = makeGrid({ cols: S.cols, rows: rows(), density: S.density, seed: S.seed, kind: S.kind });
    run = traverse({
      start: grid.start, goal: grid.goal, order: S.order,
      neighbors: gridNeighbors(grid, S.diagonal), nodeCount: grid.cells.length, stopAtGoal: true
    });
    run.maxFrontier = run.events.reduce((m, e) => Math.max(m, e.frontier ? e.frontier.length : 0), 0);
    player.load(run);
  }

  function paint(f = { index: player.index, playing: player.playing, total: player.total }) {
    if (!grid) return;
    const W = cv.clientWidth;
    const cell = Math.max(6, Math.floor(W / grid.cols));
    const H = cell * rows() + 12;
    const { c, w, h } = fitCanvas(cv, H);
    lay = gridLayout(grid, w, h - 12);
    const st = stateAt(run, f.index, grid.cells.length);
    view = st;
    const path = st.visitIndex[grid.goal] >= 0 ? pathTo(st.parent, st.visitIndex, grid.goal) : [];
    drawGrid(c, w, h, grid, {
      state: st, order: S.order, lay, path, showTree: S.tree,
      colorBy: S.colorBy, total: Math.max(1, run.visited), hover
    });

    $('#gridL').textContent = t('grid.osd', S.order, grid.cols, grid.rows, S.kind, S.seed);
    $('#gridR').textContent = st.done
      ? t(st.found ? 'grid.osdGoal' : 'grid.osdDone')
      : t(f.playing ? 'grid.osdRec' : 'grid.osdPause');

    renderPseudo($('#gridCode'), S.order, st.event ? st.event.line : 0);
    renderFrontier($('#gridFront'), st.frontier, S.order, labelOf);
    renderSide(st, path);
    renderStats(st, path);
    syncTransport(f);
  }

  function renderSide(st, path) {
    const n = noteFor(S.order, st.event, labelOf);
    const free = freeCells();
    const depthNow = st.current >= 0 && st.depth[st.current] >= 0 ? st.depth[st.current] : '—';
    side.innerHTML = `
      <span class="lbl">${t('ui.stepTitle')}</span>
      <span class="badge ${badgeCls(st)}">${n.tag}</span>
      <p style="font-size:15px">${n.text}</p>
      <dl class="kv">
        <dt>${t('grid.kvFrontier', S.order)}</dt><dd>${fmtI(st.frontier.length)}</dd>
        <dt>${t('grid.kvVisited')}</dt><dd>${t('grid.kvOf', st.visited, free)}</dd>
        <dt>${t('grid.kvDepth')}</dt><dd>${depthNow}</dd>
        <dt>${t('grid.kvPath')}</dt><dd>${path.length ? fmtI(path.length - 1) : '—'}</dd>
      </dl>
      <div class="legend">
        <div><i style="background:${COL.start}"></i><span>${t('grid.legStart')}</span><b>S</b></div>
        <div><i style="background:${COL.goal}"></i><span>${t('grid.legGoal')}</span><b>F</b></div>
        <div><i style="background:${S.order === 'bfs' ? COL.bfs : COL.dfs}"></i><span>${t('grid.legFrontier', S.order)}</span><b>${fmtI(st.frontier.length)}</b></div>
        <div><i style="background:${visitedRamp()}"></i><span>${t('grid.legVisited', S.colorBy === 'depth')}</span><b>${fmtI(st.visited)}</b></div>
        <div><i style="background:${COL.path}"></i><span>${t('grid.legPath')}</span><b>${path.length ? path.length - 1 : '—'}</b></div>
      </div>
      <p class="note">${t('grid.clickNote', S.mode)}</p>`;
  }

  const visitedRamp = () => S.colorBy === 'depth'
    ? 'linear-gradient(90deg,#1c9fd4,#d43b1c)'
    : S.order === 'bfs' ? 'linear-gradient(90deg,#265aa0,#46c8dc)' : 'linear-gradient(90deg,#82286e,#ff78be)';

  const freeCells = () => grid.cells.reduce((sum, v) => sum + (v === FREE ? 1 : 0), 0);

  const badgeCls = st => {
    const type = st.event ? st.event.t : '';
    if (type === 'skip' || type === 'dup') return 'warn';
    if (type === 'goal') return 'ok';
    if (type === 'done') return st.found ? 'ok' : 'warn';
    return 'neutral';
  };

  function renderStats(st, path) {
    const free = freeCells();
    statsEl.innerHTML =
      tile(t('grid.tileVisited'), fmtI(st.visited), t('grid.tileVisitedUnit', free), t('grid.tileVisitedFoot', st.done, st.found)) +
      tile(t('grid.tileFrontier'), fmtI(st.frontier.length), t('grid.tileFrontierUnit', S.order), t('grid.tileFrontierFoot', run.maxFrontier), S.order === 'bfs' ? 'gpu-t' : 'cpu-t') +
      tile(t('grid.tilePath'), path.length ? fmtI(path.length - 1) : '—', path.length ? t('grid.tilePathUnit') : '', t('grid.tilePathFoot', S.order)) +
      tile(t('grid.tileSteps'), fmtI(run.events.length), t('grid.tileStepsUnit'), t('grid.tileStepsFoot', st.index + 1));
  }

  /* ---------------- управление ---------------- */

  const segs = (sel, key, after) => $$(sel + ' button').forEach(b => b.onclick = () => {
    S[key] = b.dataset.v;
    press($$(sel + ' button'), x => x.dataset.v === S[key]);
    after && after();
  });

  segs('#gAlg', 'order', () => rebuild(true));
  segs('#gKind', 'kind', () => { S.density = S.kind === 'cave' ? +$('#gDens').value : S.density; rebuild(); syncDensity(); });
  segs('#gMode', 'mode', () => paint());

  $('#gRnd').onclick = () => { S.seed = Math.floor(Math.random() * 99999); rebuild(); };
  $('#gClear').onclick = () => { grid.cells.fill(FREE); rebuild(true); };

  const chip = (sel, fn) => { const b = $(sel); b.onclick = () => { fn(b.getAttribute('aria-pressed') !== 'true'); }; };
  chip('#gTree', v => { S.tree = v; $('#gTree').setAttribute('aria-pressed', v); paint(); });
  chip('#gDepth', v => { S.colorBy = v ? 'depth' : 'order'; $('#gDepth').setAttribute('aria-pressed', v); paint(); });
  chip('#gDiag', v => { S.diagonal = v; $('#gDiag').setAttribute('aria-pressed', v); rebuild(true); });

  const sizeIn = $('#gSize'), densIn = $('#gDens');
  sizeIn.oninput = () => { S.cols = ODD(+sizeIn.value); $('#gSizeOut').textContent = `${S.cols}×${rows()}`; rebuild(); };
  onLang(() => paint());
  densIn.oninput = () => { S.density = +densIn.value / 100; $('#gDensOut').textContent = densIn.value + '%'; if (S.kind === 'cave') rebuild(); };
  function syncDensity() {
    densIn.disabled = S.kind !== 'cave';
    densIn.closest('.ctl-group').style.opacity = S.kind === 'cave' ? 1 : .4;
  }

  cv.addEventListener('mousemove', e => {
    const r = cv.getBoundingClientRect();
    const id = cellAtPoint(grid, lay, e.clientX - r.left, e.clientY - r.top);
    if (id === hover) return;
    hover = id;
    if (tip) {
      if (id >= 0 && view) {
        const [x, y] = gridXY(grid, id);
        const vi = view.visitIndex[id];
        tip.hidden = false;
        tip.textContent = grid.cells[id] === WALL ? t('grid.tipWall', x, y)
          : vi >= 0 ? t('grid.tipVisited', x, y, vi + 1, view.depth[id])
          : view.inFrontier[id] ? t('grid.tipOpen', x, y) : t('grid.tipClosed', x, y);
        tip.style.left = Math.min(e.clientX - r.left + 14, r.width - 190) + 'px';
        tip.style.top = (e.clientY - r.top + 14) + 'px';
      } else tip.hidden = true;
    }
    paint();
  });
  cv.addEventListener('mouseleave', () => { hover = -1; if (tip) tip.hidden = true; paint(); });

  cv.addEventListener('click', e => {
    const r = cv.getBoundingClientRect();
    const id = cellAtPoint(grid, lay, e.clientX - r.left, e.clientY - r.top);
    if (id < 0) return;
    if (S.mode === 'wall') {
      if (id === grid.start || id === grid.goal) return;
      grid.cells[id] = grid.cells[id] === WALL ? FREE : WALL;
    } else {
      if (grid.cells[id] === WALL) grid.cells[id] = FREE;
      if (S.mode === 'start') grid.start = id; else grid.goal = id;
    }
    rebuild(true);
  });

  onVisible(cv, v => visible = v);
  addEventListener('resize', () => { if (visible) paint(); });

  press($$('#gAlg button'), b => b.dataset.v === S.order);
  press($$('#gKind button'), b => b.dataset.v === S.kind);
  press($$('#gMode button'), b => b.dataset.v === S.mode);
  $('#gTree').setAttribute('aria-pressed', S.tree);
  sizeIn.value = S.cols;
  $('#gSizeOut').textContent = `${S.cols}×${rows()}`;
  densIn.value = Math.round(S.density * 100);
  $('#gDensOut').textContent = densIn.value + '%';
  syncDensity();
  rebuild();

  return { presetMaze: () => { S.kind = 'maze'; press($$('#gKind button'), b => b.dataset.v === S.kind); syncDensity(); rebuild(); } };
}
