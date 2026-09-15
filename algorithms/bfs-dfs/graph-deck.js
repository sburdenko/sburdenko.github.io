/** Пульт «граф»: узлы и рёбра, дерево обхода, слои BFS и глубина DFS. */
import { $, $$, fitCanvas, press, fmtI, onVisible } from '../../assets/vhs.js?v=202609150502';
import { t, onLang } from '../../assets/i18n.js?v=202609150502';
import { makeGraph, graphNeighbors, traverse, stateAt, pathTo } from './traversal.js?v=202609150502';
import { drawGraph, graphLayout, nodeAtPoint } from './graph-view.js?v=202609150502';
import { renderPseudo, renderFrontier, noteFor, tile, COL } from './panels.js?v=202609150502';
import { createPlayer, bindTransport } from './player.js?v=202609150502';

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

    const edges = graph.adj.reduce((sum, l) => sum + l.length, 0) / 2;
    $('#graphL').textContent = t('graph.osd', S.order, graph.nodes, edges, S.kind, S.seed);
    $('#graphR').textContent = st.done ? t('grid.osdDone') : t(f.playing ? 'grid.osdRec' : 'grid.osdPause');

    renderPseudo($('#graphCode'), S.order, st.event ? st.event.line : 0);
    renderFrontier($('#graphFront'), st.frontier, S.order, labelOf);
    renderSide(st, path, edges);
    const treeDepth = Math.max(0, ...[...st.depth].filter((d, i) => st.visitIndex[i] >= 0));
    statsEl.innerHTML =
      tile(t('graph.tileVisited'), fmtI(st.visited), t('graph.tileVisitedUnit', graph.nodes), t('graph.tileVisitedFoot')) +
      tile(t('graph.tileFrontier'), fmtI(st.frontier.length), t('grid.tileFrontierUnit', S.order), t('graph.tileFrontierFoot', run.maxFrontier), S.order === 'bfs' ? 'gpu-t' : 'cpu-t') +
      tile(t('graph.tileDepth'), fmtI(treeDepth), t('graph.tileDepthUnit'), t('graph.tileDepthFoot', S.order)) +
      tile(t('graph.tilePath'), path.length ? fmtI(path.length - 1) : '—', path.length ? t('graph.tilePathUnit') : '', t('graph.tilePathFoot', S.order));
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
        `<div><i style="background:${COL.bfs};opacity:${0.25 + 0.75 * Math.min(1, 1 - d / 8)}"></i><span>${t('graph.layer', d)}</span><b>${levels[d].map(labelOf).join(' ')}</b></div>`);
      return `<span class="lbl">${t('graph.layers')}</span><div class="legend">${rows.join('') || `<div><span>${t('graph.empty')}</span></div>`}</div>`;
    }
    const chain = st.current >= 0 ? pathTo(st.parent, st.visitIndex, st.current) : [];
    return `<span class="lbl">${t('graph.chain')}</span>
      <p style="font-family:var(--f-mono);font-size:13px;color:#fff;line-height:1.7">${chain.length
        ? chain.map(labelOf).join(' <span style="color:var(--ink3)">→</span> ')
        : `<span class="note">${t('graph.empty')}</span>`}</p>`;
  }

  function renderSide(st, path, edges) {
    const n = noteFor(S.order, st.event, labelOf);
    side.innerHTML = `
      <span class="lbl">${t('ui.stepTitle')}</span>
      <span class="badge ${badgeCls(st)}">${n.tag}</span>
      <p style="font-size:15px">${n.text}</p>
      <dl class="kv">
        <dt>${t('graph.kvBox', S.order)}</dt><dd>${st.frontier.map(labelOf).join(' ') || t('ui.empty')}</dd>
        <dt>${t('graph.kvVisited')}</dt><dd>${fmtI(st.visited)} / ${fmtI(graph.nodes)}</dd>
        <dt>${t('graph.kvEdges')}</dt><dd>${fmtI(edges)}</dd>
      </dl>
      ${ladder(st)}
      <p class="note">${t('graph.clickNote', labelOf(graph.goal))}</p>`;
  }

  const badgeCls = st => {
    const type = st.event ? st.event.t : '';
    if (type === 'skip' || type === 'dup') return 'warn';
    if (type === 'goal') return 'ok';
    if (type === 'done') return st.found ? 'ok' : 'warn';
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
  onLang(() => paint());

  cv.addEventListener('mousemove', e => {
    const r = cv.getBoundingClientRect();
    const id = nodeAtPoint(lay, e.clientX - r.left, e.clientY - r.top);
    if (id === hover) return;
    hover = id;
    if (tip) {
      if (id >= 0 && view) {
        const vi = view.visitIndex[id];
        tip.hidden = false;
        const state = vi >= 0 ? t('graph.tipVisited', vi + 1, view.depth[id])
          : view.inFrontier[id] ? t('graph.tipOpen') : t('graph.tipClosed');
        tip.textContent = t('graph.tip', labelOf(id), graph.adj[id].map(labelOf).join(' '), state);
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
