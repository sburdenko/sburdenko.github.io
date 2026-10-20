/**
 * Problems added to existing chapters, with C# 9 solutions (Unity: no PriorityQueue, so the heap is hand-made).
 * problems.js appends each list to the end of its chapter; the texts in i18n-bg.js follow the same order.
 */
import { problem as p } from './problem.js?v=202610202037';

export const PROBLEMS_BG = {
  bits: [
    p('reverseBits', 'Reverse Bits', 190, 'reverse-bits', 'Easy', `public uint reverseBits(uint n) {
    uint r = 0;
    for (int i = 0; i < 32; i++) {
        r = (r << 1) | (n & 1);   // the low bit of n enters r from the right, r's earlier bits move up
        n >>= 1;                  // uint: a logical shift, zeros come in from the left
    }
    return r;                     // always 32 rounds: even when n is 0, r still has to move up
}

// The same in five steps without a loop: swap the halves, then bytes, nibbles, pairs and single bits.
public uint ReverseBitsMasks(uint n) {
    n = (n >> 16) | (n << 16);
    n = ((n & 0xFF00FF00) >> 8) | ((n & 0x00FF00FF) << 8);
    n = ((n & 0xF0F0F0F0) >> 4) | ((n & 0x0F0F0F0F) << 4);
    n = ((n & 0xCCCCCCCC) >> 2) | ((n & 0x33333333) << 2);
    n = ((n & 0xAAAAAAAA) >> 1) | ((n & 0x55555555) << 1);
    return n;
}`),
  ],
  binary: [
    p('divideBits', 'Divide Two Integers', 29, 'divide-two-integers', 'Medium', `public int Divide(int dividend, int divisor) {
    if (dividend == int.MinValue && divisor == -1) return int.MaxValue;   // 2^31 does not fit into an int
    bool negative = (dividend < 0) != (divisor < 0);
    long a = Math.Abs((long)dividend), b = Math.Abs((long)divisor);       // |int.MinValue| needs a long
    long q = 0;
    for (int k = 31; k >= 0; k--) {
        if ((a >> k) >= b) {        // b · 2^k still fits into what is left of a
            a -= b << k;
            q |= 1L << k;           // bit k of the quotient is 1
        }
    }
    return (int)(negative ? -q : q);   // toward zero: the remainder a is dropped
}`),
  ],
  heap: [
    p('kClosest', 'K Closest Points to Origin', 973, 'k-closest-points-to-origin', 'Medium', `public int[][] KClosest(int[][] points, int k) {
    var heap = new int[k + 1];     // indices of points, a max-heap by distance: the farthest on top
    int size = 0;
    int D(int i) => points[i][0] * points[i][0] + points[i][1] * points[i][1];   // no Math.Sqrt: same order

    for (int i = 0; i < points.Length; i++) {
        int j = size++;
        heap[j] = i;                                         // the new point goes to the bottom
        while (j > 0 && D(heap[j]) > D(heap[(j - 1) / 2])) { // and rises past every nearer parent
            (heap[j], heap[(j - 1) / 2]) = (heap[(j - 1) / 2], heap[j]);
            j = (j - 1) / 2;
        }
        if (size > k) {                                      // k + 1 points: the root, the farthest, leaves
            heap[0] = heap[--size];
            for (int p = 0; ; ) {
                int l = 2 * p + 1, r = l + 1, m = p;
                if (l < size && D(heap[l]) > D(heap[m])) m = l;
                if (r < size && D(heap[r]) > D(heap[m])) m = r;
                if (m == p) break;
                (heap[p], heap[m]) = (heap[m], heap[p]);
                p = m;
            }
        }
    }
    var res = new int[k][];
    for (int i = 0; i < k; i++) res[i] = points[heap[i]];
    return res;
}`),
  ],
  graph: [
    p('cloneGraph', 'Clone Graph', 133, 'clone-graph', 'Medium', `public Node CloneGraph(Node node) {
    if (node == null) return null;
    var copies = new Dictionary<Node, Node> { [node] = new Node(node.val) };   // old → new
    var queue = new Queue<Node>();
    queue.Enqueue(node);
    while (queue.Count > 0) {
        var cur = queue.Dequeue();
        foreach (var nb in cur.neighbors) {
            if (!copies.TryGetValue(nb, out var copy)) {
                copy = new Node(nb.val);       // first meeting: make the copy, visit nb later
                copies[nb] = copy;
                queue.Enqueue(nb);
            }
            copies[cur].neighbors.Add(copy);   // a copy already there: only the reference
        }
    }
    return copies[node];
}`, true),
  ],
  games: [
    p('kruskal', 'Min Cost to Connect All Points', 1584, 'min-cost-to-connect-all-points', 'Medium', `public int MinCostConnectPoints(int[][] points) {
    int n = points.Length;
    var edges = new List<(int w, int i, int j)>();
    for (int i = 0; i < n; i++)
        for (int j = i + 1; j < n; j++)
            edges.Add((Math.Abs(points[i][0] - points[j][0]) + Math.Abs(points[i][1] - points[j][1]), i, j));
    edges.Sort();                          // tuples compare by w, then i, then j

    var parent = new int[n];
    var rank = new int[n];
    for (int i = 0; i < n; i++) parent[i] = i;
    int Find(int x) => parent[x] == x ? x : parent[x] = Find(parent[x]);

    int total = 0, taken = 0;
    foreach (var (w, i, j) in edges) {
        if (taken == n - 1) break;         // n − 1 edges already make a spanning tree
        int a = Find(i), b = Find(j);
        if (a == b) continue;              // one component: this edge would close a cycle
        if (rank[a] < rank[b]) (a, b) = (b, a);
        parent[b] = a;                     // union by rank
        if (rank[a] == rank[b]) rank[a]++;
        total += w;
        taken++;
    }
    return total;
}`),
    p('pacificAtlantic', 'Pacific Atlantic Water Flow', 417, 'pacific-atlantic-water-flow', 'Medium', `public IList<IList<int>> PacificAtlantic(int[][] heights) {
    int m = heights.Length, n = heights[0].Length;
    bool[,] pacific = Reach(heights, true), atlantic = Reach(heights, false);
    var res = new List<IList<int>>();
    for (int r = 0; r < m; r++)
        for (int c = 0; c < n; c++)
            if (pacific[r, c] && atlantic[r, c]) res.Add(new[] { r, c });
    return res;
}

// Backwards from the ocean: BFS from its edge, only uphill. A cell is reached iff its water gets to the ocean.
private static bool[,] Reach(int[][] h, bool pacific) {
    int m = h.Length, n = h[0].Length;
    var seen = new bool[m, n];
    var queue = new Queue<(int r, int c)>();
    void Seed(int r, int c) { if (!seen[r, c]) { seen[r, c] = true; queue.Enqueue((r, c)); } }
    for (int c = 0; c < n; c++) Seed(pacific ? 0 : m - 1, c);   // the top row or the bottom row
    for (int r = 0; r < m; r++) Seed(r, pacific ? 0 : n - 1);   // the left column or the right column
    var dirs = new (int dr, int dc)[] { (-1, 0), (0, 1), (1, 0), (0, -1) };
    while (queue.Count > 0) {
        var (r, c) = queue.Dequeue();
        foreach (var (dr, dc) in dirs) {
            int y = r + dr, x = c + dc;
            if (y < 0 || x < 0 || y >= m || x >= n || seen[y, x]) continue;
            if (h[y][x] < h[r][c]) continue;   // lower: water from (y, x) cannot run up to (r, c)
            seen[y, x] = true;
            queue.Enqueue((y, x));
        }
    }
    return seen;
}`),
  ],
};
