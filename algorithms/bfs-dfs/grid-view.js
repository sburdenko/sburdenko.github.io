/** Отрисовка двумерного массива клеток: стены, волна обхода, дерево родителей, путь. */
import { WALL, gridXY } from './traversal.js?v=202609161139';
import { COL, visitedColor, depthColor } from './panels.js?v=202609161139';

export function gridLayout(grid, w, maxH) {
  const cell = Math.max(6, Math.floor(Math.min(w / grid.cols, maxH / grid.rows)));
  const gw = cell * grid.cols, gh = cell * grid.rows;
  return { cell, gw, gh, ox: Math.round((w - gw) / 2), oy: 6 };
}

export function cellAtPoint(grid, lay, px, py) {
  const x = Math.floor((px - lay.ox) / lay.cell), y = Math.floor((py - lay.oy) / lay.cell);
  if (x < 0 || y < 0 || x >= grid.cols || y >= grid.rows) return -1;
  return y * grid.cols + x;
}

export function drawGrid(c, w, h, grid, opts) {
  const { state, order, lay, path = [], showTree = false, colorBy = 'order', total = 1, hover = -1, compact = false, clear = true } = opts;
  const { cell, ox, oy } = lay;
  const px = id => { const [x, y] = gridXY(grid, id); return [ox + x * cell + cell / 2, oy + y * cell + cell / 2]; };
  const maxD = Math.max(1, ...state.depth);

  if (clear) {
    c.clearRect(0, 0, w, h);
    c.fillStyle = '#07040f';
    c.fillRect(0, 0, w, h);
  }

  for (let id = 0; id < grid.cells.length; id++) {
    const [x, y] = gridXY(grid, id);
    const X = ox + x * cell, Y = oy + y * cell;
    const wall = grid.cells[id] === WALL;
    if (wall) {
      c.fillStyle = COL.wall;
      c.fillRect(X, Y, cell, cell);
      c.fillStyle = 'rgba(255,255,255,.09)';
      c.fillRect(X, Y, cell, Math.max(1, cell * 0.12));
      continue;
    }
    const vi = state.visitIndex[id];
    c.fillStyle = vi >= 0
      ? (colorBy === 'depth' ? depthColor(state.depth[id], maxD) : visitedColor(vi, total, order))
      : COL.free;
    c.fillRect(X, Y, cell - 1, cell - 1);
    if (state.inFrontier[id]) {
      c.fillStyle = order === 'bfs' ? 'rgba(38,227,234,.28)' : 'rgba(255,62,165,.28)';
      c.fillRect(X, Y, cell - 1, cell - 1);
      c.strokeStyle = order === 'bfs' ? COL.bfs : COL.dfs;
      c.lineWidth = 1.5;
      c.strokeRect(X + 1, Y + 1, cell - 3, cell - 3);
    }
  }

  if (showTree && cell >= 8) {
    c.strokeStyle = 'rgba(255,255,255,.28)';
    c.lineWidth = 1;
    c.beginPath();
    for (let id = 0; id < grid.cells.length; id++) {
      const p = state.parent[id];
      if (p < 0 || state.visitIndex[id] < 0) continue;
      const a = px(id), b = px(p);
      c.moveTo(a[0], a[1]);
      c.lineTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
    }
    c.stroke();
  }

  if (path.length > 1) {
    c.strokeStyle = COL.path;
    c.lineWidth = Math.max(2, cell * 0.22);
    c.lineJoin = c.lineCap = 'round';
    c.shadowColor = COL.path;
    c.shadowBlur = 12;
    c.beginPath();
    path.forEach((id, i) => { const [X, Y] = px(id); i ? c.lineTo(X, Y) : c.moveTo(X, Y); });
    c.stroke();
    c.shadowBlur = 0;
  }

  const marker = (id, col, glyph) => {
    const [X, Y] = px(id);
    c.fillStyle = col;
    c.shadowColor = col;
    c.shadowBlur = 14;
    c.beginPath();
    c.arc(X, Y, Math.max(3, cell * 0.34), 0, Math.PI * 2);
    c.fill();
    c.shadowBlur = 0;
    if (cell >= 14) {
      c.fillStyle = '#0b0715';
      c.font = `700 ${Math.round(cell * 0.46)}px "JetBrains Mono", monospace`;
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(glyph, X, Y + 1);
    }
  };
  marker(grid.start, COL.start, 'S');
  marker(grid.goal, COL.goal, 'F');

  if (state.current >= 0) {
    const [x, y] = gridXY(grid, state.current);
    c.strokeStyle = '#fff';
    c.lineWidth = 2;
    c.shadowColor = '#fff';
    c.shadowBlur = 10;
    c.strokeRect(ox + x * cell - 1, oy + y * cell - 1, cell + 1, cell + 1);
    c.shadowBlur = 0;
  }

  if (hover >= 0 && !compact) {
    const [x, y] = gridXY(grid, hover);
    c.strokeStyle = 'rgba(255,210,63,.9)';
    c.setLineDash([3, 3]);
    c.strokeRect(ox + x * cell - 1, oy + y * cell - 1, cell + 1, cell + 1);
    c.setLineDash([]);
  }

  if (cell >= 19 && !compact) {
    c.font = `600 ${Math.round(cell * 0.38)}px "JetBrains Mono", monospace`;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    for (let id = 0; id < grid.cells.length; id++) {
      const vi = state.visitIndex[id];
      if (vi < 0 || id === grid.start || id === grid.goal) continue;
      const [X, Y] = px(id);
      c.fillStyle = 'rgba(255,255,255,.78)';
      c.fillText(String(colorBy === 'depth' ? state.depth[id] : vi + 1), X, Y + 1);
    }
  }
}
