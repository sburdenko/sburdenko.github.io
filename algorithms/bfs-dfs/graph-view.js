/** Отрисовка графа: рёбра, дерево обхода, фронт, путь до цели. */
import { COL, visitedColor, depthColor } from './panels.js?v=202609252015';

export function graphLayout(graph, w, h) {
  const r = Math.max(11, Math.min(26, Math.round(Math.min(w, h) / (Math.sqrt(graph.nodes) * 2.6))));
  const pad = r + 14;
  const pos = graph.pts.map(p => [pad + p.x * (w - pad * 2), pad + p.y * (h - pad * 2)]);
  return { r, pos };
}

export function nodeAtPoint(lay, x, y) {
  let hit = -1, best = lay.r * 1.4;
  lay.pos.forEach(([px, py], i) => {
    const d = Math.hypot(px - x, py - y);
    if (d < best) { best = d; hit = i; }
  });
  return hit;
}

export function drawGraph(c, w, h, graph, opts) {
  const { state, order, lay, path = [], colorBy = 'order', total = 1, hover = -1 } = opts;
  const { r, pos } = lay;
  const maxD = Math.max(1, ...state.depth);
  const inPath = new Set(path);

  c.clearRect(0, 0, w, h);
  c.fillStyle = '#07040f';
  c.fillRect(0, 0, w, h);

  c.strokeStyle = 'rgba(189,179,222,.22)';
  c.lineWidth = 1;
  c.beginPath();
  graph.adj.forEach((list, i) => list.forEach(j => {
    if (j < i) return;
    c.moveTo(pos[i][0], pos[i][1]);
    c.lineTo(pos[j][0], pos[j][1]);
  }));
  c.stroke();

  c.strokeStyle = order === 'bfs' ? 'rgba(38,227,234,.75)' : 'rgba(255,62,165,.75)';
  c.lineWidth = 2.4;
  c.beginPath();
  for (let i = 0; i < graph.nodes; i++) {
    const p = state.parent[i];
    if (p < 0) continue;
    c.moveTo(pos[i][0], pos[i][1]);
    c.lineTo(pos[p][0], pos[p][1]);
  }
  c.stroke();

  if (path.length > 1) {
    c.strokeStyle = COL.path;
    c.lineWidth = 4;
    c.lineCap = 'round';
    c.shadowColor = COL.path;
    c.shadowBlur = 14;
    c.beginPath();
    path.forEach((id, i) => { const [x, y] = pos[id]; i ? c.lineTo(x, y) : c.moveTo(x, y); });
    c.stroke();
    c.shadowBlur = 0;
  }

  c.font = `700 ${Math.round(r * 0.82)}px "JetBrains Mono", monospace`;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  for (let i = 0; i < graph.nodes; i++) {
    const [x, y] = pos[i];
    const vi = state.visitIndex[i];
    const visited = vi >= 0;
    c.beginPath();
    c.arc(x, y, r, 0, Math.PI * 2);
    c.fillStyle = visited
      ? (colorBy === 'depth' ? depthColor(state.depth[i], maxD) : visitedColor(vi, total, order))
      : '#150e28';
    if (inPath.has(i)) { c.shadowColor = COL.path; c.shadowBlur = 12; }
    c.fill();
    c.shadowBlur = 0;

    if (state.inFrontier[i]) {
      c.strokeStyle = order === 'bfs' ? COL.bfs : COL.dfs;
      c.lineWidth = 3;
      c.stroke();
    } else if (i === graph.start) {
      c.strokeStyle = COL.start; c.lineWidth = 2.5; c.stroke();
    } else if (i === graph.goal) {
      c.strokeStyle = COL.goal; c.lineWidth = 2.5; c.stroke();
    } else {
      c.strokeStyle = 'rgba(189,179,222,.35)'; c.lineWidth = 1; c.stroke();
    }

    if (i === state.current) {
      c.strokeStyle = '#fff'; c.lineWidth = 2.5;
      c.shadowColor = '#fff'; c.shadowBlur = 12;
      c.beginPath(); c.arc(x, y, r + 4, 0, Math.PI * 2); c.stroke();
      c.shadowBlur = 0;
    }
    if (i === hover) {
      c.strokeStyle = 'rgba(255,210,63,.9)'; c.lineWidth = 1.5;
      c.setLineDash([3, 3]);
      c.beginPath(); c.arc(x, y, r + 6, 0, Math.PI * 2); c.stroke();
      c.setLineDash([]);
    }

    c.fillStyle = visited ? '#fff' : 'rgba(189,179,222,.85)';
    c.fillText(graph.label(i), x, y + 1);
    if (visited && r >= 14) {
      c.fillStyle = 'rgba(11,7,21,.85)';
      c.beginPath(); c.arc(x + r * 0.82, y - r * 0.82, r * 0.52, 0, Math.PI * 2); c.fill();
      c.fillStyle = COL.path;
      c.font = `700 ${Math.round(r * 0.56)}px "JetBrains Mono", monospace`;
      c.fillText(String(colorBy === 'depth' ? state.depth[i] : vi + 1), x + r * 0.82, y - r * 0.8);
      c.font = `700 ${Math.round(r * 0.82)}px "JetBrains Mono", monospace`;
    }
  }
}
