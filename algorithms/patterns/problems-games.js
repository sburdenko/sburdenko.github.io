/**
 * Problems and C# solutions for chapter 16: games — paths and space. Written for C# 9 (Unity): no PriorityQueue
 * (it is .NET 6+), so the searches bring a small binary heap of packed long keys.
 */
import { problem as p } from './problem.js?v=202610201414';

const HEAP = `// a min-heap of packed long keys: one compare per step, no IComparer, no garbage
static void Push(long[] heap, ref int count, long key) {
    int i = count++;
    while (i > 0 && heap[(i - 1) / 2] > key) { heap[i] = heap[(i - 1) / 2]; i = (i - 1) / 2; }
    heap[i] = key;
}

static long Pop(long[] heap, ref int count) {
    long top = heap[0], last = heap[--count];
    int i = 0;
    while (2 * i + 1 < count) {
        int k = 2 * i + 1;
        if (k + 1 < count && heap[k + 1] < heap[k]) k++;
        if (heap[k] >= last) break;
        heap[i] = heap[k];
        i = k;
    }
    heap[i] = last;
    return top;
}`;

export const PROBLEMS_GAMES = {
  games: [
    p('astar', 'Shortest Path in Binary Matrix', 1091, 'shortest-path-in-binary-matrix', 'Medium', `// A* over 8 directions. Nodes are structs in one array by cell index; Opened/Closed hold the number of
// the search that touched them, so a new search does search++ instead of clearing the arrays.
struct Node { public int G, Opened, Closed; }

Node[] nodes = new Node[0];
long[] heap = new long[0];
int search;

public int ShortestPathBinaryMatrix(int[][] grid) {
    int n = grid.Length, goal = n * n - 1, count = 0;
    if (grid[0][0] == 1 || grid[n - 1][n - 1] == 1) return -1;
    if (nodes.Length < n * n) { nodes = new Node[n * n]; heap = new long[8 * n * n + 1]; }
    search++;                                       // every older mark is out of date now
    nodes[0].G = 0;
    nodes[0].Opened = search;
    Push(heap, ref count, Key(H(0, n), H(0, n), 0));
    while (count > 0) {
        int cell = (int)(Pop(heap, ref count) & 0xFFFFF);
        if (nodes[cell].Closed == search) continue;  // stale: pushed again with a smaller g, closed already
        nodes[cell].Closed = search;
        int g = nodes[cell].G;
        if (cell == goal) return g + 1;               // the length counts cells, the start included
        int r = cell / n, c = cell % n;
        for (int dr = -1; dr <= 1; dr++)
            for (int dc = -1; dc <= 1; dc++) {
                int y = r + dr, x = c + dc;
                if ((dr | dc) == 0 || y < 0 || x < 0 || y >= n || x >= n || grid[y][x] == 1) continue;
                int next = y * n + x;
                ref Node nb = ref nodes[next];
                if (nb.Closed == search) continue;                       // closed: a consistent h never reopens
                if (nb.Opened == search && nb.G <= g + 1) continue;     // open already, and not worse
                nb.G = g + 1;
                nb.Opened = search;
                Push(heap, ref count, Key(g + 1 + H(next, n), H(next, n), next));
            }
    }
    return -1;
}

// Chebyshev: with 8 directions a diagonal costs 1, so max(dr, dc) is exact on an empty map — never more
static int H(int cell, int n) => Math.Max(n - 1 - cell / n, n - 1 - cell % n);

// order by f, then by h (a tie goes to the cell nearer the goal), then by cell
static long Key(int f, int h, int cell) => ((long)f << 40) | ((long)h << 20) | (long)cell;

${HEAP}`, true),
    p('flowField', 'Flow Field · 01 Matrix', 542, '01-matrix', 'Medium', `// cost[r][c]: 0 = wall, 1..9 = what crossing the cell costs. One Dijkstra from every goal at once fills
// Integration; Direction then tells any number of units where to step: O(1) per unit per frame.
public sealed class FlowField {
    static readonly int[] Dr = { -1, 0, 1, 0 }, Dc = { 0, 1, 0, -1 };  // up, right, down, left
    public int[] Integration;                       // int.MaxValue: unreachable
    public sbyte[] Direction;                       // 0..3 into Dr/Dc; −1: goal, wall or unreachable

    public void Build(int[][] cost, (int r, int c)[] goals) {
        int rows = cost.Length, cols = cost[0].Length, size = rows * cols, count = 0;
        Integration = new int[size];
        Direction = new sbyte[size];
        Array.Fill(Integration, int.MaxValue);
        Array.Fill(Direction, (sbyte)-1);
        var heap = new long[size + goals.Length];   // every cell enters once
        foreach (var (r, c) in goals) {
            Integration[r * cols + c] = 0;          // all goals start together, like the zeros of 01 Matrix
            Push(heap, ref count, r * cols + c);
        }
        while (count > 0) {
            long top = Pop(heap, ref count);
            int cell = (int)(top & 0xFFFFF), d = (int)(top >> 20), r = cell / cols, c = cell % cols;
            for (int k = 0; k < 4; k++) {
                int y = r + Dr[k], x = c + Dc[k], next = y * cols + x;
                if (y < 0 || x < 0 || y >= rows || x >= cols || cost[y][x] == 0) continue;
                if (Integration[next] != int.MaxValue) continue;  // the cost sits on the cell: first touch is final
                Integration[next] = d + cost[y][x];
                Push(heap, ref count, ((long)Integration[next] << 20) | (long)next);
            }
        }
        for (int cell = 0; cell < size; cell++) {
            if (Integration[cell] == 0 || Integration[cell] == int.MaxValue) continue;
            int r = cell / cols, c = cell % cols, best = int.MaxValue;
            for (int k = 0; k < 4; k++) {
                int y = r + Dr[k], x = c + Dc[k];
                if (y < 0 || x < 0 || y >= rows || x >= cols) continue;
                int v = Integration[y * cols + x];
                if (v < best) { best = v; Direction[cell] = (sbyte)k; }   // strict: a tie keeps the earlier side
            }
        }
    }

${HEAP.replace(/^/gm, '    ')}
}`),
    p('spatialGrid', 'Queries on Number of Points Inside a Circle', 1828, 'queries-on-number-of-points-inside-a-circle', 'Medium', `// A spatial hash: the cell side is the largest radius, so a circle around (x, y) fits into the 3 × 3
// cells around its own cell. Points are bucketed once; a query reads 9 buckets instead of every point.
public int[] CountPoints(int[][] points, int[][] queries) {
    int size = 1;
    foreach (var q in queries) size = Math.Max(size, q[2]);
    var grid = new Dictionary<long, List<int>>();
    for (int i = 0; i < points.Length; i++) {
        long key = Key(points[i][0] / size, points[i][1] / size);  // x, y ≥ 0 here; in a world: Mathf.FloorToInt
        if (!grid.TryGetValue(key, out var bucket)) grid[key] = bucket = new List<int>();
        bucket.Add(i);
    }
    var answer = new int[queries.Length];
    for (int j = 0; j < queries.Length; j++) {
        int x = queries[j][0], y = queries[j][1], r = queries[j][2], cx = x / size, cy = y / size;
        for (int gy = cy - 1; gy <= cy + 1; gy++)
            for (int gx = cx - 1; gx <= cx + 1; gx++) {
                if (!grid.TryGetValue(Key(gx, gy), out var bucket)) continue;  // an empty cell costs one lookup
                foreach (int i in bucket) {
                    int dx = points[i][0] - x, dy = points[i][1] - y;
                    if (dx * dx + dy * dy <= r * r) answer[j]++;            // squared: no square root
                }
            }
    }
    return answer;
}

// one long from two ints: cx in the high half, cy in the low half
static long Key(int cx, int cy) => ((long)cx << 32) | (uint)cy;`, true),
    p('unionFind', 'Redundant Connection', 684, 'redundant-connection', 'Medium', `public int[] FindRedundantConnection(int[][] edges) {
    int n = edges.Length;
    var parent = new int[n + 1];
    var rank = new byte[n + 1];                     // an upper bound on the tree height
    for (int v = 1; v <= n; v++) parent[v] = v;     // every node is its own set

    int Find(int x) {
        int root = x;
        while (parent[root] != root) root = parent[root];
        while (parent[x] != root) {                 // path compression: hang the walked path onto the root
            int up = parent[x];
            parent[x] = root;
            x = up;
        }
        return root;
    }

    foreach (var e in edges) {
        int a = Find(e[0]), b = Find(e[1]);
        if (a == b) return e;                       // already connected: this edge closes the cycle
        if (rank[a] < rank[b]) (a, b) = (b, a);     // union by rank: the lower tree goes under
        parent[b] = a;
        if (rank[a] == rank[b]) rank[a]++;
    }
    return new int[0];
}`, true),
    p('swim', 'Swim in Rising Water', 778, 'swim-in-rising-water', 'Hard', `public int SwimInWater(int[][] grid) {
    int n = grid.Length, total = n * n;
    var cellAt = new int[total];                    // heights are 0..n²−1, all different: time t → its cell
    for (int r = 0; r < n; r++)
        for (int c = 0; c < n; c++) cellAt[grid[r][c]] = r * n + c;
    var parent = new int[total];
    var rank = new byte[total];
    var wet = new bool[total];
    for (int i = 0; i < total; i++) parent[i] = i;

    int Find(int x) => parent[x] == x ? x : parent[x] = Find(parent[x]);  // depth stays ≤ log n with rank
    void Union(int a, int b) {
        a = Find(a); b = Find(b);
        if (a == b) return;
        if (rank[a] < rank[b]) (a, b) = (b, a);
        parent[b] = a;
        if (rank[a] == rank[b]) rank[a]++;
    }

    int[] dr = { -1, 0, 1, 0 }, dc = { 0, 1, 0, -1 };
    for (int t = 0; t < total; t++) {
        int cell = cellAt[t], r = cell / n, c = cell % n;
        wet[cell] = true;                           // the water reaches height t: exactly this cell gets wet
        for (int d = 0; d < 4; d++) {
            int y = r + dr[d], x = c + dc[d];
            if (y >= 0 && x >= 0 && y < n && x < n && wet[y * n + x]) Union(cell, y * n + x);
        }
        if (wet[0] && wet[total - 1] && Find(0) == Find(total - 1)) return t;
    }
    return total - 1;
}`),
  ],
};
