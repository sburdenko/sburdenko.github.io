/** Problems and C# solutions for chapters 09–12: heap, backtracking, greedy, dynamic programming. */
import { problem as p } from './problem.js?v=202610071658';

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
    p('topK', 'Top K Frequent Elements', 347, 'top-k-frequent-elements', 'Medium', `public int[] TopKFrequent(int[] nums, int k) {
    var count = new Dictionary<int, int>();
    foreach (int x in nums) count[x] = count.GetValueOrDefault(x) + 1;
    var heap = new PriorityQueue<int, int>(); // min-heap by frequency
    foreach (var (x, f) in count) {
        heap.Enqueue(x, f);
        if (heap.Count > k) heap.Dequeue();
    }
    var res = new int[k];
    for (int i = k - 1; i >= 0; i--) res[i] = heap.Dequeue();
    return res;
}`, true),
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
}`, true),
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
}`, true)
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
    p('wordSearch', 'Word Search', 79, 'word-search', 'Medium', `public bool Exist(char[][] board, string word) {
    int rows = board.Length, cols = board[0].Length;
    bool Dfs(int r, int c, int i) {
        if (i == word.Length) return true;
        if (r < 0 || c < 0 || r >= rows || c >= cols || board[r][c] != word[i]) return false;
        char saved = board[r][c];
        board[r][c] = '#'; // used on the current path
        bool found = Dfs(r + 1, c, i + 1) || Dfs(r - 1, c, i + 1)
                  || Dfs(r, c + 1, i + 1) || Dfs(r, c - 1, i + 1);
        board[r][c] = saved; // undo
        return found;
    }
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            if (Dfs(r, c, 0)) return true;
    return false;
}`, true),
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
}`, true)
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
    p('mergeIv', 'Merge Intervals', 56, 'merge-intervals', 'Medium', `public int[][] Merge(int[][] intervals) {
    Array.Sort(intervals, (a, b) => a[0].CompareTo(b[0]));
    var res = new List<int[]>();
    foreach (var iv in intervals) {
        if (res.Count > 0 && iv[0] <= res[^1][1])
            res[^1][1] = Math.Max(res[^1][1], iv[1]); // overlaps: extend
        else
            res.Add(new[] { iv[0], iv[1] });           // gap: start a new block
    }
    return res.ToArray();
}`, true),
    p('candy', 'Candy', 135, 'candy', 'Hard', `public int Candy(int[] ratings) {
    int n = ratings.Length;
    var candies = new int[n];
    Array.Fill(candies, 1);
    for (int i = 1; i < n; i++)
        if (ratings[i] > ratings[i - 1]) candies[i] = candies[i - 1] + 1;
    for (int i = n - 2; i >= 0; i--)
        if (ratings[i] > ratings[i + 1]) candies[i] = Math.Max(candies[i], candies[i + 1] + 1);
    return candies.Sum();
}`, true)
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
    p('lis', 'Longest Increasing Subsequence', 300, 'longest-increasing-subsequence', 'Medium', `public int LengthOfLIS(int[] nums) {
    var dp = new int[nums.Length]; // dp[i]: longest increasing run ending at i
    int best = 0;
    for (int i = 0; i < nums.Length; i++) {
        dp[i] = 1;
        for (int j = 0; j < i; j++)
            if (nums[j] < nums[i]) dp[i] = Math.Max(dp[i], dp[j] + 1);
        best = Math.Max(best, dp[i]);
    }
    return best;
}`, true),
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
}`, true),
    p('regex', 'Regular Expression Matching', 10, 'regular-expression-matching', 'Hard', `public bool IsMatch(string s, string p) {
    var dp = new bool[s.Length + 1, p.Length + 1]; // dp[i, j]: s[..i] matches p[..j]
    dp[0, 0] = true;
    for (int j = 2; j <= p.Length; j++)
        dp[0, j] = p[j - 1] == '*' && dp[0, j - 2];
    for (int i = 1; i <= s.Length; i++)
        for (int j = 1; j <= p.Length; j++) {
            if (p[j - 1] == '*') {
                bool zero = dp[i, j - 2];
                bool more = (p[j - 2] == '.' || p[j - 2] == s[i - 1]) && dp[i - 1, j];
                dp[i, j] = zero || more;
            } else {
                dp[i, j] = (p[j - 1] == '.' || p[j - 1] == s[i - 1]) && dp[i - 1, j - 1];
            }
        }
    return dp[s.Length, p.Length];
}`, true)
  ],
};
