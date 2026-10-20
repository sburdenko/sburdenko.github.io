/** Problems and C# solutions for chapter 14: shortest paths. */
import { problem as p } from './problem.js?v=202610201312';

export const PROBLEMS_E = {
  paths: [
    p('nearestZero', '01 Matrix', 542, '01-matrix', 'Medium', `public int[][] UpdateMatrix(int[][] mat) {
    int rows = mat.Length, cols = mat[0].Length;
    var dist = new int[rows][];
    var queue = new Queue<(int r, int c)>();
    for (int r = 0; r < rows; r++) {
        dist[r] = new int[cols];
        for (int c = 0; c < cols; c++) {
            if (mat[r][c] == 0) queue.Enqueue((r, c));   // every 0 is a source
            else dist[r][c] = -1;                        // not reached yet
        }
    }
    int[] dr = { -1, 0, 1, 0 }, dc = { 0, 1, 0, -1 };
    while (queue.Count > 0) {
        var (r, c) = queue.Dequeue();
        for (int d = 0; d < 4; d++) {
            int y = r + dr[d], x = c + dc[d];
            if (y < 0 || x < 0 || y >= rows || x >= cols || dist[y][x] != -1) continue;
            dist[y][x] = dist[r][c] + 1;                 // set on enqueue: the first wave is the nearest
            queue.Enqueue((y, x));
        }
    }
    return dist;
}`),
    p('networkDelay', 'Network Delay Time', 743, 'network-delay-time', 'Medium', `public int NetworkDelayTime(int[][] times, int n, int k) {
    var adj = new List<(int to, int w)>[n + 1];
    for (int v = 1; v <= n; v++) adj[v] = new List<(int, int)>();
    foreach (var t in times) adj[t[0]].Add((t[1], t[2]));
    var dist = new int[n + 1];
    Array.Fill(dist, int.MaxValue);
    dist[k] = 0;
    var pq = new PriorityQueue<int, int>();      // node by distance
    pq.Enqueue(k, 0);
    while (pq.TryDequeue(out int u, out int d)) {
        if (d > dist[u]) continue;               // stale entry: u was improved after it was queued
        foreach (var (v, w) in adj[u])
            if (d + w < dist[v]) {
                dist[v] = d + w;
                pq.Enqueue(v, dist[v]);          // no decrease-key: just push again
            }
    }
    int max = 0;
    for (int v = 1; v <= n; v++) {
        if (dist[v] == int.MaxValue) return -1;  // some node never hears the signal
        max = Math.Max(max, dist[v]);
    }
    return max;
}`, true),
    p('minEffort', 'Path With Minimum Effort', 1631, 'path-with-minimum-effort', 'Medium', `public int MinimumEffortPath(int[][] heights) {
    int rows = heights.Length, cols = heights[0].Length;
    var effort = new int[rows, cols];
    for (int r = 0; r < rows; r++) for (int c = 0; c < cols; c++) effort[r, c] = int.MaxValue;
    effort[0, 0] = 0;
    var pq = new PriorityQueue<(int r, int c), int>();
    pq.Enqueue((0, 0), 0);
    int[] dr = { -1, 0, 1, 0 }, dc = { 0, 1, 0, -1 };
    while (pq.TryDequeue(out var cell, out int e)) {
        var (r, c) = cell;
        if (e > effort[r, c]) continue;          // stale
        if (r == rows - 1 && c == cols - 1) return e;   // popped = final
        for (int d = 0; d < 4; d++) {
            int y = r + dr[d], x = c + dc[d];
            if (y < 0 || x < 0 || y >= rows || x >= cols) continue;
            int cost = Math.Max(e, Math.Abs(heights[y][x] - heights[r][c]));  // max, not +
            if (cost < effort[y, x]) {
                effort[y, x] = cost;
                pq.Enqueue((y, x), cost);
            }
        }
    }
    return 0;
}`),
    p('obstacles', 'Shortest Path in a Grid with Obstacles Elimination', 1293, 'shortest-path-in-a-grid-with-obstacles-elimination', 'Hard', `public int ShortestPath(int[][] grid, int k) {
    int rows = grid.Length, cols = grid[0].Length;
    if (rows == 1 && cols == 1) return 0;
    var seen = new bool[rows, cols, k + 1];      // a state is (cell, walls still breakable)
    var queue = new Queue<(int r, int c, int rem)>();
    queue.Enqueue((0, 0, k));
    seen[0, 0, k] = true;
    int[] dr = { -1, 0, 1, 0 }, dc = { 0, 1, 0, -1 };
    for (int steps = 1; queue.Count > 0; steps++) {
        for (int size = queue.Count; size > 0; size--) {     // one BFS level = one step
            var (r, c, rem) = queue.Dequeue();
            for (int d = 0; d < 4; d++) {
                int y = r + dr[d], x = c + dc[d];
                if (y < 0 || x < 0 || y >= rows || x >= cols) continue;
                int left = rem - grid[y][x];     // stepping on a wall spends one break
                if (left < 0 || seen[y, x, left]) continue;
                if (y == rows - 1 && x == cols - 1) return steps;
                seen[y, x, left] = true;
                queue.Enqueue((y, x, left));
            }
        }
    }
    return -1;
}`),
  ],
};
