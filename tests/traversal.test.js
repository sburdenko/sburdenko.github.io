import test from 'node:test';
import assert from 'node:assert/strict';
import {
  makeCave, makeMaze, makeGraph, gridNeighbors, graphNeighbors,
  traverse, stateAt, pathTo, gridId, WALL, FREE
} from '../algorithms/bfs-dfs/traversal.js';

const openGrid = (cols, rows) => ({ cols, rows, cells: new Uint8Array(cols * rows), start: 0, goal: cols * rows - 1, kind: 'open', seed: 0 });
const runGrid = (grid, order, opts = {}) => traverse({
  start: grid.start, goal: grid.goal, neighbors: gridNeighbors(grid, opts.diagonal),
  order, nodeCount: grid.cells.length, stopAtGoal: opts.stopAtGoal ?? true
});

test('BFS на пустой сетке даёт кратчайший путь (манхэттенское расстояние)', () => {
  const g = openGrid(11, 9);
  g.start = gridId(g, 0, 0);
  g.goal = gridId(g, 10, 8);
  const run = runGrid(g, 'bfs');
  assert.equal(run.found, true);
  assert.equal(run.path.length - 1, 10 + 8);
  assert.equal(run.depth[g.goal], 18);
});

test('BFS посещает узлы по неубывающей глубине — это и есть волна по слоям', () => {
  const g = openGrid(9, 7);
  g.start = gridId(g, 4, 3);
  const run = traverse({ start: g.start, neighbors: gridNeighbors(g), order: 'bfs', nodeCount: g.cells.length });
  const visited = [...run.visitIndex.keys()].filter(i => run.visitIndex[i] >= 0).sort((a, b) => run.visitIndex[a] - run.visitIndex[b]);
  for (let i = 1; i < visited.length; i++) {
    assert.ok(run.depth[visited[i]] >= run.depth[visited[i - 1]], 'глубина не должна убывать');
  }
  assert.equal(run.visited, 63, 'должны обойти все клетки пустой сетки');
});

test('DFS уходит вглубь: путь до цели не короче BFS, дерево глубже', () => {
  const g = openGrid(12, 10);
  g.start = gridId(g, 0, 0);
  g.goal = gridId(g, 11, 9);
  const bfs = runGrid(g, 'bfs');
  const dfs = runGrid(g, 'dfs');
  assert.equal(dfs.found, true);
  assert.ok(dfs.path.length >= bfs.path.length, 'DFS не даёт кратчайший путь');

  const bfsFull = runGrid(g, 'bfs', { stopAtGoal: false });
  const dfsFull = runGrid(g, 'dfs', { stopAtGoal: false });
  assert.ok(Math.max(...dfsFull.depth) > Math.max(...bfsFull.depth), 'дерево DFS глубже дерева BFS');
  assert.equal(bfsFull.visited, dfsFull.visited, 'обходят одно и то же множество узлов');
});

test('в любом обходе родитель посещается раньше ребёнка, а путь ведёт из старта', () => {
  const g = makeCave({ cols: 21, rows: 15, density: 0.3, seed: 7 });
  for (const order of ['bfs', 'dfs']) {
    const run = runGrid(g, order, { stopAtGoal: false });
    for (let v = 0; v < g.cells.length; v++) {
      if (run.visitIndex[v] < 0 || run.parent[v] < 0) continue;
      assert.ok(run.visitIndex[run.parent[v]] >= 0, `${order}: родитель должен быть посещён`);
      assert.ok(run.visitIndex[run.parent[v]] < run.visitIndex[v], `${order}: родитель раньше ребёнка`);
    }
    assert.equal(run.path[0], g.start);
    assert.equal(run.path.at(-1), g.goal);
  }
});

test('стены непроходимы, а цель всегда достижима из старта', () => {
  for (const seed of [1, 2, 3, 42, 777]) {
    const g = makeCave({ cols: 25, rows: 17, density: 0.42, seed });
    const run = runGrid(g, 'bfs');
    assert.equal(run.found, true, `seed ${seed}: цель должна быть достижима`);
    for (const id of run.path) assert.equal(g.cells[id], FREE, 'путь не проходит сквозь стены');
  }
});

test('идеальный лабиринт связен и даёт единственный путь', () => {
  const g = makeMaze({ cols: 21, rows: 15, seed: 5 });
  const run = runGrid(g, 'bfs', { stopAtGoal: false });
  const free = [...g.cells].filter(c => c === FREE).length;
  assert.equal(run.visited, free, 'из старта достижимы все свободные клетки');
  assert.ok([...g.cells].some(c => c === WALL));
  const dfs = runGrid(g, 'dfs');
  assert.deepEqual(dfs.path, run.path.slice(0, dfs.path.length), 'в идеальном лабиринте путь один и тот же');
  assert.equal(dfs.path.at(-1), g.goal);
});

test('генератор графа даёт связный симметричный граф без петель', () => {
  for (const kind of ['geo', 'tree', 'ring']) {
    const graph = makeGraph({ nodes: 16, kind, seed: 3 });
    graph.adj.forEach((list, i) => {
      assert.ok(!list.includes(i), 'нет петель');
      list.forEach(j => assert.ok(graph.adj[j].includes(i), 'рёбра двусторонние'));
    });
    const run = traverse({ start: 0, neighbors: graphNeighbors(graph), order: 'bfs', nodeCount: graph.nodes });
    assert.equal(run.visited, graph.nodes, `${kind}: граф должен быть связным`);
  }
});

test('лента событий воспроизводит финальное состояние обхода', () => {
  const graph = makeGraph({ nodes: 18, kind: 'geo', seed: 11 });
  for (const order of ['bfs', 'dfs']) {
    const run = traverse({ start: 0, goal: 17, neighbors: graphNeighbors(graph), order, nodeCount: graph.nodes, stopAtGoal: false });
    const last = stateAt(run, run.events.length - 1, graph.nodes);
    assert.deepEqual([...last.visitIndex], [...run.visitIndex]);
    assert.deepEqual([...last.parent], [...run.parent]);
    assert.equal(last.done, true);
    assert.equal(last.frontier.length, 0, 'в конце фронт пуст');
    assert.equal(last.visited, run.visited);

    const mid = stateAt(run, Math.floor(run.events.length / 2), graph.nodes);
    assert.ok(mid.visited <= last.visited);
    mid.frontier.forEach(id => assert.equal(mid.inFrontier[id], 1));
  }
});

test('события BFS и DFS описывают разную структуру фронта', () => {
  const graph = makeGraph({ nodes: 20, kind: 'geo', seed: 9 });
  const bfs = traverse({ start: 0, neighbors: graphNeighbors(graph), order: 'bfs', nodeCount: graph.nodes });
  const dfs = traverse({ start: 0, neighbors: graphNeighbors(graph), order: 'dfs', nodeCount: graph.nodes });
  const pushes = run => run.events.filter(e => e.t === 'push').length;
  assert.equal(pushes(bfs), graph.nodes - 1, 'BFS кладёт каждый узел в очередь ровно один раз');
  assert.ok(pushes(dfs) >= graph.nodes - 1, 'DFS может класть узел в стек несколько раз');
  assert.ok(dfs.events.some(e => e.t === 'dup'), 'DFS отбрасывает повторные копии при снятии со стека');
  assert.equal(bfs.events.some(e => e.t === 'dup'), false);
  assert.equal(bfs.events.at(-1).t, 'done');
});

test('pathTo возвращает пустой путь для непосещённого узла', () => {
  const g = openGrid(5, 5);
  g.cells[gridId(g, 4, 3)] = WALL;
  g.cells[gridId(g, 3, 4)] = WALL;
  const run = traverse({ start: 0, neighbors: gridNeighbors(g), order: 'bfs', nodeCount: g.cells.length });
  const corner = gridId(g, 4, 4);
  assert.equal(run.visitIndex[corner], -1);
  assert.deepEqual(pathTo(run.parent, run.visitIndex, corner), []);
});
