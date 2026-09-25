/** Problems and C# solutions for chapters 09–12: heap, backtracking, greedy, dynamic programming. */
import { problem as p } from './problem.js?v=202609252015';

export const PROBLEMS_C = {
  heap: [
    p('kth', 'Kth Largest Element in an Array', 215, 'kth-largest-element-in-an-array', 'Medium', `public int FindKthLargest(int[] nums, int k) {
    var heap = new PriorityQueue<int, int>(); // min-heap
    foreach (int x in nums) {
        heap.Enqueue(x, x);
        if (heap.Count > k) heap.Dequeue();
    }
    return heap.Peek();
}`),
    p('stones', 'Last Stone Weight', 1046, 'last-stone-weight', 'Easy', `public int LastStoneWeight(int[] stones) {
    var heap = new PriorityQueue<int, int>();
    foreach (int s in stones) heap.Enqueue(s, -s); // max-heap via negative priority
    while (heap.Count > 1) {
        int a = heap.Dequeue(), b = heap.Dequeue();
        if (a != b) heap.Enqueue(a - b, -(a - b));
    }
    return heap.Count == 0 ? 0 : heap.Peek();
}`),
    p('mergeK', 'Merge k Sorted Lists', 23, 'merge-k-sorted-lists', 'Hard', `public ListNode MergeKLists(ListNode[] lists) {
    var heap = new PriorityQueue<ListNode, int>();
    foreach (var node in lists)
        if (node != null) heap.Enqueue(node, node.val);

    var dummy = new ListNode();
    var tail = dummy;
    while (heap.Count > 0) {
        var node = heap.Dequeue();
        tail.next = node;
        tail = node;
        if (node.next != null) heap.Enqueue(node.next, node.next.val);
    }
    return dummy.next;
}`),
    p('medianStream', 'Find Median from Data Stream', 295, 'find-median-from-data-stream', 'Hard', `public class MedianFinder {
    private readonly PriorityQueue<int, int> low = new();  // max-heap via -x
    private readonly PriorityQueue<int, int> high = new(); // min-heap

    public void AddNum(int x) {
        if (low.Count == 0 || x <= low.Peek()) low.Enqueue(x, -x);
        else high.Enqueue(x, x);
        if (low.Count > high.Count + 1) { int m = low.Dequeue(); high.Enqueue(m, m); }
        else if (high.Count > low.Count) { int m = high.Dequeue(); low.Enqueue(m, -m); }
    }

    public double FindMedian() => low.Count > high.Count
        ? low.Peek()
        : (low.Peek() + high.Peek()) / 2.0;
}`)
  ],
  back: [
    p('subsets', 'Subsets', 78, 'subsets', 'Medium', `public IList<IList<int>> Subsets(int[] nums) {
    var res = new List<IList<int>>();
    var path = new List<int>();
    void Dfs(int i) {
        if (i == nums.Length) { res.Add(new List<int>(path)); return; }
        path.Add(nums[i]);
        Dfs(i + 1);
        path.RemoveAt(path.Count - 1);
        Dfs(i + 1);
    }
    Dfs(0);
    return res;
}`),
    p('perms', 'Permutations', 46, 'permutations', 'Medium', `public IList<IList<int>> Permute(int[] nums) {
    var res = new List<IList<int>>();
    var path = new List<int>();
    var used = new bool[nums.Length];
    void Dfs() {
        if (path.Count == nums.Length) { res.Add(new List<int>(path)); return; }
        for (int i = 0; i < nums.Length; i++) {
            if (used[i]) continue;
            used[i] = true; path.Add(nums[i]);
            Dfs();
            used[i] = false; path.RemoveAt(path.Count - 1);
        }
    }
    Dfs();
    return res;
}`),
    p('combSum', 'Combination Sum', 39, 'combination-sum', 'Medium', `public IList<IList<int>> CombinationSum(int[] candidates, int target) {
    Array.Sort(candidates);
    var res = new List<IList<int>>();
    var path = new List<int>();
    void Dfs(int start, int remain) {
        if (remain == 0) { res.Add(new List<int>(path)); return; }
        for (int i = start; i < candidates.Length; i++) {
            if (candidates[i] > remain) break;
            path.Add(candidates[i]);
            Dfs(i, remain - candidates[i]);
            path.RemoveAt(path.Count - 1);
        }
    }
    Dfs(0, target);
    return res;
}`),
    p('queens', 'N-Queens', 51, 'n-queens', 'Hard', `public IList<IList<string>> SolveNQueens(int n) {
    var res = new List<IList<string>>();
    var cols = new bool[n];
    var diag = new bool[2 * n]; // r + c
    var anti = new bool[2 * n]; // r - c + n
    var queens = new int[n];
    void Place(int r) {
        if (r == n) {
            res.Add(queens.Select(c => new string('.', c) + "Q" + new string('.', n - c - 1)).ToList());
            return;
        }
        for (int c = 0; c < n; c++) {
            if (cols[c] || diag[r + c] || anti[r - c + n]) continue;
            cols[c] = diag[r + c] = anti[r - c + n] = true;
            queens[r] = c;
            Place(r + 1);
            cols[c] = diag[r + c] = anti[r - c + n] = false;
        }
    }
    Place(0);
    return res;
}`)
  ],
  greedy: [
    p('jump', 'Jump Game', 55, 'jump-game', 'Medium', `public bool CanJump(int[] nums) {
    int reach = 0;
    for (int i = 0; i < nums.Length; i++) {
        if (i > reach) return false;
        reach = Math.Max(reach, i + nums[i]);
    }
    return true;
}`),
    p('stock', 'Best Time to Buy and Sell Stock', 121, 'best-time-to-buy-and-sell-stock', 'Easy', `public int MaxProfit(int[] prices) {
    int minPrice = int.MaxValue, best = 0;
    foreach (int p in prices) {
        minPrice = Math.Min(minPrice, p);
        best = Math.Max(best, p - minPrice);
    }
    return best;
}`),
    p('intervals', 'Non-overlapping Intervals', 435, 'non-overlapping-intervals', 'Medium', `public int EraseOverlapIntervals(int[][] intervals) {
    Array.Sort(intervals, (a, b) => a[1].CompareTo(b[1]));
    int removed = 0, end = int.MinValue;
    foreach (var iv in intervals) {
        if (iv[0] >= end) end = iv[1];
        else removed++;
    }
    return removed;
}`),
    p('candy', 'Candy', 135, 'candy', 'Hard', `public int Candy(int[] ratings) {
    int n = ratings.Length;
    var candies = new int[n];
    Array.Fill(candies, 1);
    for (int i = 1; i < n; i++)
        if (ratings[i] > ratings[i - 1]) candies[i] = candies[i - 1] + 1;
    for (int i = n - 2; i >= 0; i--)
        if (ratings[i] > ratings[i + 1]) candies[i] = Math.Max(candies[i], candies[i + 1] + 1);
    return candies.Sum();
}`)
  ],
  dp: [
    p('climb', 'Climbing Stairs', 70, 'climbing-stairs', 'Easy', `public int ClimbStairs(int n) {
    int prev = 1, cur = 1;
    for (int i = 2; i <= n; i++)
        (prev, cur) = (cur, prev + cur);
    return cur;
}`),
    p('coin', 'Coin Change', 322, 'coin-change', 'Medium', `public int CoinChange(int[] coins, int amount) {
    var dp = new int[amount + 1];
    Array.Fill(dp, amount + 1);
    dp[0] = 0;
    for (int i = 1; i <= amount; i++)
        foreach (int c in coins)
            if (c <= i) dp[i] = Math.Min(dp[i], dp[i - c] + 1);
    return dp[amount] > amount ? -1 : dp[amount];
}`),
    p('lcs', 'Longest Common Subsequence', 1143, 'longest-common-subsequence', 'Medium', `public int LongestCommonSubsequence(string a, string b) {
    var dp = new int[a.Length + 1, b.Length + 1];
    for (int i = 1; i <= a.Length; i++)
        for (int j = 1; j <= b.Length; j++)
            dp[i, j] = a[i - 1] == b[j - 1]
                ? dp[i - 1, j - 1] + 1
                : Math.Max(dp[i - 1, j], dp[i, j - 1]);
    return dp[a.Length, b.Length];
}`),
    p('edit', 'Edit Distance', 72, 'edit-distance', 'Medium', `public int MinDistance(string a, string b) {
    var dp = new int[a.Length + 1, b.Length + 1];
    for (int i = 0; i <= a.Length; i++) dp[i, 0] = i;
    for (int j = 0; j <= b.Length; j++) dp[0, j] = j;
    for (int i = 1; i <= a.Length; i++)
        for (int j = 1; j <= b.Length; j++)
            dp[i, j] = a[i - 1] == b[j - 1]
                ? dp[i - 1, j - 1]
                : 1 + Math.Min(dp[i - 1, j - 1], Math.Min(dp[i - 1, j], dp[i, j - 1]));
    return dp[a.Length, b.Length];
}`)
  ],
};
