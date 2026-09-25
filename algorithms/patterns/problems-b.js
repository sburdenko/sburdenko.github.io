/** Problems and C# solutions for chapters 05–08: stack, linked list, DFS/BFS, trees. */
import { problem as p } from './problem.js?v=202609252015';

export const PROBLEMS_B = {
  stack: [
    p('parens', 'Valid Parentheses', 20, 'valid-parentheses', 'Easy', `public bool IsValid(string s) {
    var pairs = new Dictionary<char, char> { [')'] = '(', [']'] = '[', ['}'] = '{' };
    var stack = new Stack<char>();
    foreach (char c in s) {
        if (!pairs.TryGetValue(c, out char open)) stack.Push(c);
        else if (stack.Count == 0 || stack.Pop() != open) return false;
    }
    return stack.Count == 0;
}`),
    p('daily', 'Daily Temperatures', 739, 'daily-temperatures', 'Medium', `public int[] DailyTemperatures(int[] t) {
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
    p('minStack', 'Min Stack', 155, 'min-stack', 'Medium', `public class MinStack {
    private readonly Stack<(int val, int min)> stack = new Stack<(int, int)>();

    public void Push(int val) {
        int min = stack.Count == 0 ? val : Math.Min(val, stack.Peek().min);
        stack.Push((val, min));
    }
    public void Pop() => stack.Pop();
    public int Top() => stack.Peek().val;
    public int GetMin() => stack.Peek().min;
}`),
    p('histogram', 'Largest Rectangle in Histogram', 84, 'largest-rectangle-in-histogram', 'Hard', `public int LargestRectangleArea(int[] h) {
    var stack = new Stack<int>(); // indices, heights increasing
    int best = 0;
    for (int i = 0; i <= h.Length; i++) {
        int cur = i == h.Length ? 0 : h[i];
        while (stack.Count > 0 && h[stack.Peek()] >= cur) {
            int height = h[stack.Pop()];
            int left = stack.Count == 0 ? 0 : stack.Peek() + 1;
            best = Math.Max(best, height * (i - left));
        }
        stack.Push(i);
    }
    return best;
}`)
  ],
  list: [
    p('cycle', 'Linked List Cycle', 141, 'linked-list-cycle', 'Easy', `public bool HasCycle(ListNode head) {
    ListNode slow = head, fast = head;
    while (fast != null && fast.next != null) {
        slow = slow.next;
        fast = fast.next.next;
        if (slow == fast) return true;
    }
    return false;
}`),
    p('removeNth', 'Remove Nth Node From End of List', 19, 'remove-nth-node-from-end-of-list', 'Medium', `public ListNode RemoveNthFromEnd(ListNode head, int n) {
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
    p('reverse', 'Reverse Linked List', 206, 'reverse-linked-list', 'Easy', `public ListNode ReverseList(ListNode head) {
    ListNode prev = null, cur = head;
    while (cur != null) {
        var next = cur.next;
        cur.next = prev;
        prev = cur;
        cur = next;
    }
    return prev;
}`),
    p('reverseK', 'Reverse Nodes in k-Group', 25, 'reverse-nodes-in-k-group', 'Hard', `public ListNode ReverseKGroup(ListNode head, int k) {
    var dummy = new ListNode(0, head);
    var groupPrev = dummy;
    while (true) {
        var kth = groupPrev;
        for (int i = 0; i < k && kth != null; i++) kth = kth.next;
        if (kth == null) break; // fewer than k nodes left
        var groupNext = kth.next;
        ListNode prev = groupNext, cur = groupPrev.next;
        while (cur != groupNext) {
            var next = cur.next;
            cur.next = prev;
            prev = cur;
            cur = next;
        }
        var first = groupPrev.next;
        groupPrev.next = kth;
        groupPrev = first;
    }
    return dummy.next;
}`)
  ],
  graph: [
    p('flood', 'Flood Fill', 733, 'flood-fill', 'Easy', `public int[][] FloodFill(int[][] image, int sr, int sc, int color) {
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
    p('islands', 'Number of Islands', 200, 'number-of-islands', 'Medium', `public int NumIslands(char[][] grid) {
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
    p('oranges', 'Rotting Oranges', 994, 'rotting-oranges', 'Medium', `public int OrangesRotting(int[][] grid) {
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
    p('ladder', 'Word Ladder', 127, 'word-ladder', 'Hard', `public int LadderLength(string begin, string end, IList<string> wordList) {
    var words = new HashSet<string>(wordList);
    if (!words.Contains(end)) return 0;
    var queue = new Queue<string>();
    queue.Enqueue(begin);
    words.Remove(begin);
    for (int length = 1; queue.Count > 0; length++) {
        for (int k = queue.Count; k > 0; k--) {
            var word = queue.Dequeue().ToCharArray();
            if (new string(word) == end) return length;
            for (int i = 0; i < word.Length; i++) {
                char original = word[i];
                for (char c = 'a'; c <= 'z'; c++) {
                    word[i] = c;
                    var next = new string(word);
                    if (words.Remove(next)) queue.Enqueue(next);
                }
                word[i] = original;
            }
        }
    }
    return 0;
}`)
  ],
  tree: [
    p('maxDepth', 'Maximum Depth of Binary Tree', 104, 'maximum-depth-of-binary-tree', 'Easy', `public int MaxDepth(TreeNode root) =>
    root == null ? 0 : 1 + Math.Max(MaxDepth(root.left), MaxDepth(root.right));`),
    p('levelOrder', 'Binary Tree Level Order Traversal', 102, 'binary-tree-level-order-traversal', 'Medium', `public IList<IList<int>> LevelOrder(TreeNode root) {
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
    p('validBst', 'Validate Binary Search Tree', 98, 'validate-binary-search-tree', 'Medium', `public bool IsValidBST(TreeNode root) => Valid(root, long.MinValue, long.MaxValue);

private bool Valid(TreeNode node, long lo, long hi) {
    if (node == null) return true;
    if (node.val <= lo || node.val >= hi) return false;
    return Valid(node.left, lo, node.val) && Valid(node.right, node.val, hi);
}`),
    p('maxPath', 'Binary Tree Maximum Path Sum', 124, 'binary-tree-maximum-path-sum', 'Hard', `private int best;

public int MaxPathSum(TreeNode root) {
    best = int.MinValue;
    Gain(root);
    return best;
}

private int Gain(TreeNode node) {
    if (node == null) return 0;
    int left = Math.Max(0, Gain(node.left));
    int right = Math.Max(0, Gain(node.right));
    best = Math.Max(best, node.val + left + right); // path that turns here
    return node.val + Math.Max(left, right);        // path that continues up
}`)
  ],
};
