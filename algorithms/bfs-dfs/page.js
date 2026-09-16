/** Сборка кассеты «BFS и DFS»: язык, заставка, пульты, гонка, шпаргалка, вопросы. */
import { $, bootVhs, fitCanvas, RM, onVisible } from '../../assets/vhs.js?v=202609161139';
import { initI18n, t, onLang } from '../../assets/i18n.js?v=202609161139';
import { COMMON } from '../../assets/i18n-common.js?v=202609161139';
import { DICT } from './i18n.js?v=202609161139';
import { gridNeighbors, traverse, stateAt } from './traversal.js?v=202609161139';
import { drawGrid, gridLayout } from './grid-view.js?v=202609161139';
import { initGridDeck } from './grid-deck.js?v=202609161139';
import { initGraphDeck } from './graph-deck.js?v=202609161139';
import { initRace } from './race.js?v=202609161139';

initI18n({ ...COMMON, ...DICT });
bootVhs();

/* ---------------- заставка: волна против щупа ---------------- */
function initIntro() {
  const cv = $('#introCv');
  if (!cv) return;
  const cols = 17, rows = 11;
  const grid = { cols, rows, cells: new Uint8Array(cols * rows), start: Math.floor(rows / 2) * cols + Math.floor(cols / 2), goal: -1, kind: 'open', seed: 0 };
  const nb = gridNeighbors(grid, false);
  const runs = ['bfs', 'dfs'].map(order => traverse({ start: grid.start, neighbors: nb, order, nodeCount: grid.cells.length }));
  const maxLen = Math.max(...runs.map(r => r.events.length));
  let i = 0, last = 0, visible = true;

  function paint() {
    const paneW = (cv.clientWidth - 16) / 2;
    const cell = Math.max(5, Math.floor(Math.min(paneW / cols, 150 / rows)));
    const { c, w, h } = fitCanvas(cv, cell * rows + 12);
    c.clearRect(0, 0, w, h);
    c.fillStyle = '#07040f';
    c.fillRect(0, 0, w, h);
    runs.forEach((run, k) => {
      const st = stateAt(run, Math.min(i, run.events.length - 1), grid.cells.length);
      const lay = gridLayout(grid, paneW, h - 12);
      lay.ox += k * (paneW + 16);
      drawGrid(c, w, h, grid, { state: st, order: run.order, lay, total: run.visited, compact: true, clear: false });
    });
  }

  function loop(time) {
    if (visible && time - last > (RM ? 260 : 45)) {
      last = time;
      i = i >= maxLen + 24 ? 0 : i + 1;
      paint();
    }
    requestAnimationFrame(loop);
  }
  onVisible(cv, v => visible = v);
  addEventListener('resize', paint);
  paint();
  requestAnimationFrame(loop);
}

initIntro();
initGridDeck();
initGraphDeck();
initRace();

/* ---------------- шпаргалка и вопросы ---------------- */
function renderCheat() {
  $('#cheatBody').innerHTML = t('cheat.rows')
    .map(([prop, bfs, dfs]) => `<tr><td>${prop}</td><td>${bfs}</td><td>${dfs}</td></tr>`).join('');
}

function renderQa() {
  $('#qa').innerHTML = t('qa.items').map(([q, a], i) =>
    `<details><summary><span class="q">Q${String(i + 1).padStart(2, '0')}</span><span>${q}</span></summary><div class="a">${a}</div></details>`
  ).join('');
}

renderCheat();
renderQa();
onLang(() => { renderCheat(); renderQa(); });
