/** Пульт «граф»: узлы и рёбра, дерево обхода, слои BFS и глубина DFS. */
import { $, $$, fitCanvas, press, fmtI, esc, onVisible } from '../../assets/vhs.js';
import { makeGraph, graphNeighbors, traverse, stateAt, pathTo } from './traversal.js';
import { drawGraph, graphLayout, nodeAtPoint } from './graph-view.js';
import { renderPseudo, renderFrontier, noteFor, tile, COL } from './panels.js';
import { createPlayer, bindTransport } from './player.js';

export function initGraphDeck() {
  const cv = $('#graphCv'), side = $('#graphSide'), statsEl = $('#graphStats'), tip = $('#graphTip');
  if (!cv) return;

  const S = { order: 'bfs', kind: 'geo', nodes: 16, seed: 3, colorBy: 'order' };
  let graph, run, lay, view, hover = -1, visible = true;
  const labelOf = id => graph.label(id);

  const player = createPlayer(f => paint(f));
  const syncTransport = bindTransport($('#graphTransport'), player);

  function rebuild(keepGraph = false) {
    if (!keepGraph) {
      graph = makeGraph({ nodes: S.nodes, kind: S.kind, seed: S.seed });
      graph.goal = S.nodes - 1;
    }
    run = traverse({
      start: graph.start, goal: graph.goal, order: S.order,
      neighbors: graphNeighbors(graph), nodeCount: graph.nodes, stopAtGoal: false
    });
    run.maxFrontier = run.events.reduce((m, e) => Math.max(m, e.frontier ? e.frontier.length : 0), 0);
    player.load(run);
  }

  function paint(f = { index: player.index, playing: player.playing, total: player.total }) {
    if (!graph) return;
    const H = Math.round(Math.max(320, Math.min(480, cv.clientWidth * 0.62)));
    const { c, w, h } = fitCanvas(cv, H);
    lay = graphLayout(graph, w, h);
    const st = stateAt(run, f.index, graph.nodes);
    view = st;
    const path = st.visitIndex[graph.goal] >= 0 ? pathTo(st.parent, st.visitIndex, graph.goal) : [];
    drawGraph(c, w, h, graph, { state: st, order: S.order, lay, path, colorBy: S.colorBy, total: Math.max(1, run.visited), hover });

    const edges = graph.adj.reduce((s, l) => s + l.length, 0) / 2;
    $('#graphL').textContent = `${S.order.toUpperCase()} · V=${graph.nodes} E=${edges} · ${({ geo: 'СЛУЧАЙНЫЙ', tree: 'ДЕРЕВО', ring: 'КОЛЬЦО' })[S.kind]} #${S.seed}`;
    $('#graphR').textContent = st.done ? '■ ОБХОД ЗАКОНЧЕН' : (f.playing ? '● REC' : '❚❚ PAUSE');

    renderPseudo($('#graphCode'), S.order, st.event ? st.event.line : 0);
    renderFrontier($('#graphFront'), st.frontier, S.order, labelOf);
    renderSide(st, path, edges);
    statsEl.innerHTML =
      tile('Посещено', fmtI(st.visited), `из ${fmtI(graph.nodes)}`, 'узлов графа') +
      tile('Фронт', fmtI(st.frontier.length), S.order === 'bfs' ? 'в очереди' : 'в стеке', `максимум: ${fmtI(run.maxFrontier)}`, S.order === 'bfs' ? 'gpu-t' : 'cpu-t') +
      tile('Глубина дерева', fmtI(Math.max(0, ...[...st.depth].filter((d, i) => st.visitIndex[i] >= 0))), 'ур.', S.order === 'bfs' ? 'BFS: это и есть расстояние' : 'DFS: длина спуска') +
      tile('Путь S → F', path.length ? fmtI(path.length - 1) : '—', path.length ? 'рёбер' : '', S.order === 'bfs' ? 'кратчайший' : 'какой получился');
    syncTransport(f);
  }

  function ladder(st) {
    if (S.order === 'bfs') {
      const levels = {};
      for (let i = 0; i < graph.nodes; i++) {
        if (st.visitIndex[i] < 0 && !st.inFrontier[i]) continue;
        (levels[st.depth[i]] ||= []).push(i);
      }
      const rows = Object.keys(levels).sort((a, b) => a - b).map(d =>
        `<div><i style="background:${COL.bfs};opacity:${0.25 + 0.75 * Math.min(1, 1 - d / 8)}"></i><span>слой ${d}</span><b>${levels[d].map(labelOf).join(' ')}</b></div>`);
      return `<span class="lbl">Слои от старта</span><div class="legend">${rows.join('') || '<div><span>пока пусто</span></div>'}</div>`;
    }
    const chain = st.current >= 0 ? pathTo(st.parent, st.visitIndex, st.current) : [];
    return `<span class="lbl">Цепочка спуска (как рекурсия)</span>
      <p style="font-family:var(--f-mono);font-size:13px;color:#fff;line-height:1.7">${chain.length ? chain.map(labelOf).join(' <span style="color:var(--ink3)">→</span> ') : '<span class="note">пока пусто</span>'}</p>`;
  }

  function renderSide(st, path, edges) {
    const n = noteFor(S.order, st.event, labelOf);
    side.innerHTML = `
      <span class="lbl">Что происходит на этом шаге</span>
      <span class="badge ${badgeCls(st)}">${n.tag}</span>
      <p style="font-size:15px">${n.text}</p>
      <dl class="kv">
        <dt>${S.order === 'bfs' ? 'Очередь' : 'Стек'}</dt><dd>${st.frontier.map(labelOf).join(' ') || 'пусто'}</dd>
        <dt>Посещено</dt><dd>${fmtI(st.visited)} / ${fmtI(graph.nodes)}</dd>
        <dt>Рёбер в графе</dt><dd>${fmtI(edges)}</dd>
      </dl>
      ${ladder(st)}
      <p class="note">Клик по узлу — сделать его стартом. Финиш — последний узел (${labelOf(graph.goal)}).</p>`;
  }

  const badgeCls = st => {
    const t = st.event ? st.event.t : '';
    if (t === 'skip' || t === 'dup') return 'warn';
    if (t === 'goal') return 'ok';
    if (t === 'done') return st.found ? 'ok' : 'warn';
    return 'neutral';
  };

  $$('#hAlg button').forEach(b => b.onclick = () => { S.order = b.dataset.v; press($$('#hAlg button'), x => x.dataset.v === S.order); rebuild(true); });
  $$('#hKind button').forEach(b => b.onclick = () => { S.kind = b.dataset.v; press($$('#hKind button'), x => x.dataset.v === S.kind); rebuild(); });
  $('#hRnd').onclick = () => { S.seed = Math.floor(Math.random() * 99999); rebuild(); };
  $('#hDepth').onclick = () => {
    const v = $('#hDepth').getAttribute('aria-pressed') !== 'true';
    S.colorBy = v ? 'depth' : 'order';
    $('#hDepth').setAttribute('aria-pressed', v);
    paint();
  };
  const nIn = $('#hNodes');
  nIn.oninput = () => { S.nodes = +nIn.value; $('#hNodesOut').textContent = S.nodes; rebuild(); };

  cv.addEventListener('mousemove', e => {
    const r = cv.getBoundingClientRect();
    const id = nodeAtPoint(lay, e.clientX - r.left, e.clientY - r.top);
    if (id === hover) return;
    hover = id;
    if (tip) {
      if (id >= 0 && view) {
        const vi = view.visitIndex[id];
        tip.hidden = false;
        tip.textContent = `${labelOf(id)} · соседи: ${graph.adj[id].map(labelOf).join(' ')} · ${vi >= 0 ? `посещён ${vi + 1}-м, глубина ${view.depth[id]}` : view.inFrontier[id] ? 'открыт, ждёт' : 'ещё не открыт'}`;
        tip.style.left = Math.min(e.clientX - r.left + 14, Math.max(4, r.width - 260)) + 'px';
        tip.style.top = (e.clientY - r.top + 14) + 'px';
      } else tip.hidden = true;
    }
    paint();
  });
  cv.addEventListener('mouseleave', () => { hover = -1; if (tip) tip.hidden = true; paint(); });
  cv.addEventListener('click', e => {
    const r = cv.getBoundingClientRect();
    const id = nodeAtPoint(lay, e.clientX - r.left, e.clientY - r.top);
    if (id < 0) return;
    graph.start = id;
    rebuild(true);
  });

  onVisible(cv, v => visible = v);
  addEventListener('resize', () => { if (visible) paint(); });

  press($$('#hAlg button'), b => b.dataset.v === S.order);
  press($$('#hKind button'), b => b.dataset.v === S.kind);
  nIn.value = S.nodes;
  $('#hNodesOut').textContent = S.nodes;
  rebuild();
}
