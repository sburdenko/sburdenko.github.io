/** Гонка: один и тот же лабиринт, слева BFS, справа DFS, общая перемотка. */
import { $, $$, fitCanvas, fmtI, press, plural } from '../../assets/vhs.js';
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
    const stat = (r, s, p) => `${fmtI(s.visited)} / ${fmtI(free)} клеток · фронт ${fmtI(s.frontier.length)} · путь ${p.length ? fmtI(p.length - 1) : '—'}`;
    $('#raceStatB').textContent = stat(runs[0], b.st, b.path);
    $('#raceStatD').textContent = stat(runs[1], d.st, d.path);

    const done = b.st.done && d.st.done;
    const pb = runs[0].path.length - 1, pd = runs[1].path.length - 1;
    const peak = (run, st) => run.events.slice(0, st.index + 1).reduce((m, e) => Math.max(m, e.frontier ? e.frontier.length : 0), 0);
    const len = p => p.length ? fmtI(p.length - 1) : '—';
    $('#raceStats').innerHTML =
      tile('Путь BFS', len(b.path), b.path.length ? 'шагов' : '', b.path.length ? 'кратчайший по определению' : 'финиш ещё не найден', 'gpu-t') +
      tile('Путь DFS', len(d.path), d.path.length ? 'шагов' : '', !d.path.length ? 'финиш ещё не найден' : pd > pb ? `длиннее BFS на ${Math.round((pd / pb - 1) * 100)}%` : 'здесь совпал с кратчайшим', 'cpu-t') +
      tile('Обошёл клеток · BFS', fmtI(b.st.visited), '', 'растёт как площадь круга', 'gpu-t') +
      tile('Обошёл клеток · DFS', fmtI(d.st.visited), '', d.st.visited < b.st.visited ? 'пока меньше: коридор ведёт к цели' : 'блуждает дольше', 'cpu-t') +
      tile('Пик фронта · BFS', fmtI(peak(runs[0], b.st)), 'клеток', 'память = ширина волны', 'gpu-t') +
      tile('Пик фронта · DFS', fmtI(peak(runs[1], d.st)), 'клеток', 'память = глубина спуска', 'cpu-t');

    $('#raceVerdict').innerHTML = done
      ? `<b>Итог.</b> BFS обошёл ${fmtI(runs[0].visited)} ${plural(runs[0].visited, 'клетку', 'клетки', 'клеток')} и выдал путь в ${fmtI(pb)} ${plural(pb, 'шаг', 'шага', 'шагов')} — короче не бывает. DFS обошёл ${fmtI(runs[1].visited)} и выдал ${fmtI(pd)}. ${pd > pb ? 'Дальше от оптимума, зато фронт ' + (runs[1].maxFrontier < runs[0].maxFrontier ? 'уже' : 'не шире') + ': DFS хранит одну ветку, BFS — весь слой.' : 'В идеальном лабиринте путь единственный, поэтому длина совпала — разница осталась только в порядке обхода и в памяти.'}`
      : '<b>Идёт прогон.</b> Слева волна расходится кругами, справа щуп уходит в один коридор до упора и возвращается только в тупике.';
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
  rebuild();
}
