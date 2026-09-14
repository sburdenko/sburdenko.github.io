/** Гонка: один и тот же лабиринт, слева BFS, справа DFS, общая перемотка. */
import { $, $$, fitCanvas, fmtI, press } from '../../assets/vhs.js';
import { t, onLang } from '../../assets/i18n.js';
import { makeGrid, gridNeighbors, traverse, stateAt, pathTo, FREE } from './traversal.js';
import { drawGrid, gridLayout } from './grid-view.js';
import { tile } from './panels.js';
import { createPlayer, bindTransport } from './player.js';

export function initRace() {
  const cvB = $('#raceB'), cvD = $('#raceD');
  if (!cvB) return;
  const S = { cols: innerWidth < 760 ? 17 : 25, kind: 'maze', seed: 11, density: 0.3 };
  let grid, runs;

  const player = createPlayer(f => paint(f));
  const syncTransport = bindTransport($('#raceTransport'), player);

  function rebuild() {
    const rows = 2 * Math.floor(S.cols * 0.32) + 1;
    grid = makeGrid({ cols: S.cols, rows, density: S.density, seed: S.seed, kind: S.kind });
    const nb = gridNeighbors(grid, false);
    runs = ['bfs', 'dfs'].map(order => {
      const run = traverse({ start: grid.start, goal: grid.goal, order, neighbors: nb, nodeCount: grid.cells.length, stopAtGoal: true });
      run.maxFrontier = run.events.reduce((m, e) => Math.max(m, e.frontier ? e.frontier.length : 0), 0);
      return run;
    });
    player.load(runs[0].events.length >= runs[1].events.length ? runs[0] : runs[1]);
  }

  function side(cv, run, index) {
    const W = cv.clientWidth;
    const cell = Math.max(5, Math.floor(W / grid.cols));
    const { c, w, h } = fitCanvas(cv, cell * grid.rows + 10);
    const lay = gridLayout(grid, w, h - 10);
    const st = stateAt(run, Math.min(index, run.events.length - 1), grid.cells.length);
    const path = st.visitIndex[grid.goal] >= 0 ? pathTo(st.parent, st.visitIndex, grid.goal) : [];
    drawGrid(c, w, h, grid, { state: st, order: run.order, lay, path, showTree: false, total: Math.max(1, run.visited), compact: true });
    return { st, path };
  }

  function paint(f = { index: player.index, playing: player.playing, total: player.total }) {
    if (!grid) return;
    const b = side(cvB, runs[0], f.index), d = side(cvD, runs[1], f.index);
    const free = grid.cells.reduce((s, v) => s + (v === FREE ? 1 : 0), 0);
    const line = (s, p) => t('race.line', s.visited, free, s.frontier.length, p.length ? fmtI(p.length - 1) : '—');
    $('#raceStatB').textContent = line(b.st, b.path);
    $('#raceStatD').textContent = line(d.st, d.path);

    const done = b.st.done && d.st.done;
    const pb = runs[0].path.length - 1, pd = runs[1].path.length - 1;
    const peak = (run, st) => run.events.slice(0, st.index + 1).reduce((m, e) => Math.max(m, e.frontier ? e.frontier.length : 0), 0);
    const len = p => p.length ? fmtI(p.length - 1) : '—';
    const steps = t('race.tileSteps');
    $('#raceStats').innerHTML =
      tile(t('race.tilePathB'), len(b.path), b.path.length ? steps : '', t(b.path.length ? 'race.footShortest' : 'race.footNotFound'), 'gpu-t') +
      tile(t('race.tilePathD'), len(d.path), d.path.length ? steps : '',
        !d.path.length ? t('race.footNotFound') : pd > pb ? t('race.footLonger', Math.round((pd / pb - 1) * 100)) : t('race.footSame'), 'cpu-t') +
      tile(t('race.tileCellsB'), fmtI(b.st.visited), '', t('race.footArea'), 'gpu-t') +
      tile(t('race.tileCellsD'), fmtI(d.st.visited), '', t(d.st.visited < b.st.visited ? 'race.footLucky' : 'race.footWander'), 'cpu-t') +
      tile(t('race.tilePeakB'), fmtI(peak(runs[0], b.st)), t('race.tilePeakUnit'), t('race.footWidth'), 'gpu-t') +
      tile(t('race.tilePeakD'), fmtI(peak(runs[1], d.st)), t('race.tilePeakUnit'), t('race.footDepth'), 'cpu-t');

    $('#raceVerdict').innerHTML = done
      ? t('race.verdictDone', runs[0].visited, pb, runs[1].visited, pd, runs[1].maxFrontier < runs[0].maxFrontier)
      : t('race.verdictRunning');
    syncTransport(f);
  }

  $('#raceRnd').onclick = () => { S.seed = Math.floor(Math.random() * 99999); rebuild(); };
  $$('#raceKind button').forEach(b => b.onclick = () => {
    S.kind = b.dataset.v;
    press($$('#raceKind button'), x => x.dataset.v === S.kind);
    rebuild();
  });
  press($$('#raceKind button'), b => b.dataset.v === S.kind);
  addEventListener('resize', () => paint());
  onLang(() => paint());
  rebuild();
}
