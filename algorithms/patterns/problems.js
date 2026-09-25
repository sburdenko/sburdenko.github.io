/** Language-neutral problem metadata and C# solutions. Texts about them live in the i18n files. */
export const NAMES = {
  hash: 'HashMap / HashSet', twoptr: 'Two Pointers', window: 'Sliding Window', binary: 'Binary Search',
  stack: 'Stack / Monotonic Stack', list: 'Linked List · Fast & Slow', graph: 'DFS / BFS', tree: 'Trees',
  heap: 'Heap / PriorityQueue', back: 'Backtracking', greedy: 'Greedy', dp: 'Dynamic Programming',
};

const p = (name, num, slug, diff, code) => ({ name, num, slug, diff, code });

export const PROBLEMS = {
  hash: [
    p('Two Sum', 1, 'two-sum', 'Easy', `public int[] TwoSum(int[] nums, int target) {
    var seen = new Dictionary<int, int>(); // value → index
    for (int i = 0; i < nums.Length; i++) {
        int need = target - nums[i];
        if (seen.TryGetValue(need, out int j)) return new[] { j, i };
        seen[nums[i]] = i;
    }
    return new int[0];
}`),
    p('Contains Duplicate', 217, 'contains-duplicate', 'Easy', `public bool ContainsDuplicate(int[] nums) {
    var seen = new HashSet<int>();
    foreach (int x in nums)
        if (!seen.Add(x)) return true;
    return false;
}`),
    p('Group Anagrams', 49, 'group-anagrams', 'Medium', `public IList<IList<string>> GroupAnagrams(string[] strs) {
    var groups = new Dictionary<string, List<string>>();
    foreach (var s in strs) {
        var chars = s.ToCharArray();
        Array.Sort(chars);
        var key = new string(chars);
        if (!groups.TryGetValue(key, out var list))
            groups[key] = list = new List<string>();
        list.Add(s);
    }
    return new List<IList<string>>(groups.Values);
}`),
  ],
  twoptr: [
    p('Move Zeroes', 283, 'move-zeroes', 'Easy', `public void MoveZeroes(int[] nums) {
    int write = 0;
    for (int read = 0; read < nums.Length; read++) {
        if (nums[read] == 0) continue;
        (nums[write], nums[read]) = (nums[read], nums[write]);
        write++;
    }
}`),
    p('Container With Most Water', 11, 'container-with-most-water', 'Medium', `public int MaxArea(int[] h) {
    int l = 0, r = h.Length - 1, best = 0;
    while (l < r) {
        best = Math.Max(best, Math.Min(h[l], h[r]) * (r - l));
        if (h[l] < h[r]) l++; else r--;
    }
    return best;
}`),
    p('3Sum', 15, '3sum', 'Medium', `public IList<IList<int>> ThreeSum(int[] nums) {
    Array.Sort(nums);
    var res = new List<IList<int>>();
    for (int i = 0; i < nums.Length - 2; i++) {
        if (i > 0 && nums[i] == nums[i - 1]) continue;
        int l = i + 1, r = nums.Length - 1;
        while (l < r) {
            int sum = nums[i] + nums[l] + nums[r];
            if (sum < 0) l++;
            else if (sum > 0) r--;
            else {
                res.Add(new[] { nums[i], nums[l], nums[r] });
                while (l < r && nums[l] == nums[l + 1]) l++;
                while (l < r && nums[r] == nums[r - 1]) r--;
                l++; r--;
            }
        }
    }
    return res;
}`),
  ],
  window: [
    p('Maximum Average Subarray I', 643, 'maximum-average-subarray-i', 'Easy', `public double FindMaxAverage(int[] nums, int k) {
    int sum = 0;
    for (int i = 0; i < k; i++) sum += nums[i];
    int best = sum;
    for (int r = k; r < nums.Length; r++) {
        sum += nums[r] - nums[r - k];
        best = Math.Max(best, sum);
    }
    return (double)best / k;
}`),
    p('Longest Substring Without Repeating Characters', 3, 'longest-substring-without-repeating-characters', 'Medium', `public int LengthOfLongestSubstring(string s) {
    var window = new HashSet<char>();
    int l = 0, best = 0;
    for (int r = 0; r < s.Length; r++) {
        while (window.Contains(s[r])) window.Remove(s[l++]);
        window.Add(s[r]);
        best = Math.Max(best, r - l + 1);
    }
    return best;
}`),
    p('Minimum Size Subarray Sum', 209, 'minimum-size-subarray-sum', 'Medium', `public int MinSubArrayLen(int target, int[] nums) {
    int l = 0, sum = 0, best = int.MaxValue;
    for (int r = 0; r < nums.Length; r++) {
        sum += nums[r];
        while (sum >= target) {
            best = Math.Min(best, r - l + 1);
            sum -= nums[l++];
        }
    }
    return best == int.MaxValue ? 0 : best;
}`),
  ],
  binary: [
    p('Binary Search', 704, 'binary-search', 'Easy', `public int Search(int[] nums, int target) {
    int lo = 0, hi = nums.Length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;
    }
    return -1;
}`),
    p('Search in Rotated Sorted Array', 33, 'search-in-rotated-sorted-array', 'Medium', `public int Search(int[] nums, int target) {
    int lo = 0, hi = nums.Length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;
        if (nums[lo] <= nums[mid]) {          // left half is sorted
            if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
            else lo = mid + 1;
        } else {                              // right half is sorted
            if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
            else hi = mid - 1;
        }
    }
    return -1;
}`),
    p('Koko Eating Bananas', 875, 'koko-eating-bananas', 'Medium', `public int MinEatingSpeed(int[] piles, int h) {
    int lo = 1, hi = piles.Max();
    while (lo < hi) {
        int k = lo + (hi - lo) / 2;
        long hours = 0;
        foreach (int p in piles) hours += (p - 1) / k + 1;
        if (hours <= h) hi = k; else lo = k + 1;
    }
    return lo;
}`),
  ],
  stack: [
    p('Valid Parentheses', 20, 'valid-parentheses', 'Easy', `public bool IsValid(string s) {
    var pairs = new Dictionary<char, char> { [')'] = '(', [']'] = '[', ['}'] = '{' };
    var stack = new Stack<char>();
    foreach (char c in s) {
        if (!pairs.TryGetValue(c, out char open)) stack.Push(c);
        else if (stack.Count == 0 || stack.Pop() != open) return false;
    }
    return stack.Count == 0;
}`),
    p('Daily Temperatures', 739, 'daily-temperatures', 'Medium', `public int[] DailyTemperatures(int[] t) {
    var ans = new int[t.Length];
    var stack = new Stack<int>(); // indices, temperatures decreasing
    for (int i = 0; i < t.Length; i++) {
        while (stack.Count > 0 && t[stack.Peek()] < t[i]) {
            int j = stack.Pop();
            ans[j] = i - j;
        }
        stack.Push(i);
    }
    return ans;
}`),
    p('Min Stack', 155, 'min-stack', 'Medium', `public class MinStack {
    private readonly Stack<(int val, int min)> stack = new Stack<(int, int)>();

    public void Push(int val) {
        int min = stack.Count == 0 ? val : Math.Min(val, stack.Peek().min);
        stack.Push((val, min));
    }
    public void Pop() => stack.Pop();
    public int Top() => stack.Peek().val;
    public int GetMin() => stack.Peek().min;
}`),
  ],
  list: [
    p('Linked List Cycle', 141, 'linked-list-cycle', 'Easy', `public bool HasCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true;
    }
    return false;
}`),
    p('Remove Nth Node From End of List', 19, 'remove-nth-node-from-end-of-list', 'Medium', `public ListNode RemoveNthFromEnd(ListNode head, int n) {
    var dummy = new ListNode(0, head);
    ListNode fast = dummy, slow = dummy;
    for (int i = 0; i <= n; i++) fast = fast.next;
    while (fast != null) {
        fast = fast.next;
        slow = slow.next;
    }
    slow.next = slow.next.next;
    return dummy.next;
}`),
    p('Reverse Linked List', 206, 'reverse-linked-list', 'Easy', `public ListNode ReverseList(ListNode head) {
    ListNode prev = null, cur = head;
    while (cur != null) {
        var next = cur.next;
        cur.next = prev;
        prev = cur;
        cur = next;
    }
    return prev;
}`),
  ],
  graph: [
    p('Flood Fill', 733, 'flood-fill', 'Easy', `public int[][] FloodFill(int[][] image, int sr, int sc, int color) {
    int start = image[sr][sc];
    if (start != color) Fill(image, sr, sc, start, color);
    return image;
}

private void Fill(int[][] img, int r, int c, int from, int to) {
    if (r < 0 || c < 0 || r >= img.Length || c >= img[0].Length || img[r][c] != from) return;
    img[r][c] = to;
    Fill(img, r + 1, c, from, to);
    Fill(img, r - 1, c, from, to);
    Fill(img, r, c + 1, from, to);
    Fill(img, r, c - 1, from, to);
}`),
    p('Number of Islands', 200, 'number-of-islands', 'Medium', `public int NumIslands(char[][] grid) {
    int count = 0;
    for (int r = 0; r < grid.Length; r++)
        for (int c = 0; c < grid[0].Length; c++)
            if (grid[r][c] == '1') {
                count++;
                Sink(grid, r, c);
            }
    return count;
}

private void Sink(char[][] g, int r, int c) {
    if (r < 0 || c < 0 || r >= g.Length || c >= g[0].Length || g[r][c] != '1') return;
    g[r][c] = '0';
    Sink(g, r + 1, c); Sink(g, r - 1, c);
    Sink(g, r, c + 1); Sink(g, r, c - 1);
}`),
    p('Rotting Oranges', 994, 'rotting-oranges', 'Medium', `public int OrangesRotting(int[][] grid) {
    int rows = grid.Length, cols = grid[0].Length, fresh = 0;
    var queue = new Queue<(int r, int c)>();
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == 2) queue.Enqueue((r, c));
            else if (grid[r][c] == 1) fresh++;
        }

    var dirs = new[] { (1, 0), (-1, 0), (0, 1), (0, -1) };
    int minutes = 0;
    while (queue.Count > 0 && fresh > 0) {
        for (int k = queue.Count; k > 0; k--) {
            var (r, c) = queue.Dequeue();
            foreach (var (dr, dc) in dirs) {
                int nr = r + dr, nc = c + dc;
                if (nr < 0 || nc < 0 || nr >= rows || nc >= cols || grid[nr][nc] != 1) continue;
                grid[nr][nc] = 2;
                fresh--;
                queue.Enqueue((nr, nc));
            }
        }
        minutes++;
    }
    return fresh == 0 ? minutes : -1;
}`),
  ],
  tree: [
    p('Maximum Depth of Binary Tree', 104, 'maximum-depth-of-binary-tree', 'Easy', `public int MaxDepth(TreeNode root) =>
    root == null ? 0 : 1 + Math.Max(MaxDepth(root.left), MaxDepth(root.right));`),
    p('Binary Tree Level Order Traversal', 102, 'binary-tree-level-order-traversal', 'Medium', `public IList<IList<int>> LevelOrder(TreeNode root) {
    var res = new List<IList<int>>();
    if (root == null) return res;
    var queue = new Queue<TreeNode>();
    queue.Enqueue(root);
    while (queue.Count > 0) {
        var level = new List<int>();
        for (int k = queue.Count; k > 0; k--) {
            var node = queue.Dequeue();
            level.Add(node.val);
            if (node.left != null) queue.Enqueue(node.left);
            if (node.right != null) queue.Enqueue(node.right);
        }
        res.Add(level);
    }
    return res;
}`),
    p('Validate Binary Search Tree', 98, 'validate-binary-search-tree', 'Medium', `public bool IsValidBST(TreeNode root) => Valid(root, long.MinValue, long.MaxValue);

private bool Valid(TreeNode node, long lo, long hi) {
    if (node == null) return true;
    if (node.val <= lo || node.val >= hi) return false;
    return Valid(node.left, lo, node.val) && Valid(node.right, node.val, hi);
}`),
  ],
  heap: [
    p('Kth Largest Element in an Array', 215, 'kth-largest-element-in-an-array', 'Medium', `public int FindKthLargest(int[] nums, int k) {
    var heap = new PriorityQueue<int, int>(); // min-heap
    foreach (int x in nums) {
        heap.Enqueue(x, x);
        if (heap.Count > k) heap.Dequeue();
    }
    return heap.Peek();
}`),
    p('Last Stone Weight', 1046, 'last-stone-weight', 'Easy', `public int LastStoneWeight(int[] stones) {
    var heap = new PriorityQueue<int, int>();
    foreach (int s in stones) heap.Enqueue(s, -s); // max-heap via negative priority
    while (heap.Count > 1) {
        int a = heap.Dequeue(), b = heap.Dequeue();
        if (a != b) heap.Enqueue(a - b, -(a - b));
    }
    return heap.Count == 0 ? 0 : heap.Peek();
}`),
    p('Merge k Sorted Lists', 23, 'merge-k-sorted-lists', 'Hard', `public ListNode MergeKLists(ListNode[] lists) {
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
  ],
  back: [
    p('Subsets', 78, 'subsets', 'Medium', `public IList<IList<int>> Subsets(int[] nums) {
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
    p('Permutations', 46, 'permutations', 'Medium', `public IList<IList<int>> Permute(int[] nums) {
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
    p('Combination Sum', 39, 'combination-sum', 'Medium', `public IList<IList<int>> CombinationSum(int[] candidates, int target) {
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
  ],
  greedy: [
    p('Jump Game', 55, 'jump-game', 'Medium', `public bool CanJump(int[] nums) {
    int reach = 0;
    for (int i = 0; i < nums.Length; i++) {
        if (i > reach) return false;
        reach = Math.Max(reach, i + nums[i]);
    }
    return true;
}`),
    p('Best Time to Buy and Sell Stock', 121, 'best-time-to-buy-and-sell-stock', 'Easy', `public int MaxProfit(int[] prices) {
    int minPrice = int.MaxValue, best = 0;
    foreach (int p in prices) {
        minPrice = Math.Min(minPrice, p);
        best = Math.Max(best, p - minPrice);
    }
    return best;
}`),
    p('Non-overlapping Intervals', 435, 'non-overlapping-intervals', 'Medium', `public int EraseOverlapIntervals(int[][] intervals) {
    Array.Sort(intervals, (a, b) => a[1].CompareTo(b[1]));
    int removed = 0, end = int.MinValue;
    foreach (var iv in intervals) {
        if (iv[0] >= end) end = iv[1];
        else removed++;
    }
    return removed;
}`),
  ],
  dp: [
    p('Climbing Stairs', 70, 'climbing-stairs', 'Easy', `public int ClimbStairs(int n) {
    int prev = 1, cur = 1;
    for (int i = 2; i <= n; i++)
        (prev, cur) = (cur, prev + cur);
    return cur;
}`),
    p('Coin Change', 322, 'coin-change', 'Medium', `public int CoinChange(int[] coins, int amount) {
    var dp = new int[amount + 1];
    Array.Fill(dp, amount + 1);
    dp[0] = 0;
    for (int i = 1; i <= amount; i++)
        foreach (int c in coins)
            if (c <= i) dp[i] = Math.Min(dp[i], dp[i - c] + 1);
    return dp[amount] > amount ? -1 : dp[amount];
}`),
    p('Longest Common Subsequence', 1143, 'longest-common-subsequence', 'Medium', `public int LongestCommonSubsequence(string a, string b) {
    var dp = new int[a.Length + 1, b.Length + 1];
    for (int i = 1; i <= a.Length; i++)
        for (int j = 1; j <= b.Length; j++)
            dp[i, j] = a[i - 1] == b[j - 1]
                ? dp[i - 1, j - 1] + 1
                : Math.Max(dp[i - 1, j], dp[i, j - 1]);
    return dp[a.Length, b.Length];
}`),
  ],
};
