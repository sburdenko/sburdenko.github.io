/**
 * Problems that joined existing chapters later, appended after each chapter's own list (problems.js merges them):
 * two pointers, binary search, backtracking, greedy, DP and matrices. C# 9 (Unity): no PriorityQueue, tuples are fine.
 */
import { problem as p } from './problem.js?v=202610201333';

export const PROBLEMS_ARR = {
  twoptr: [
    p('sortColors', 'Sort Colors', 75, 'sort-colors', 'Medium', `public void SortColors(int[] nums) {
    // [0, lo) zeros · [lo, mid) ones · [mid, hi] not seen yet · (hi, end) twos
    int lo = 0, mid = 0, hi = nums.Length - 1;
    while (mid <= hi) {
        if (nums[mid] == 0) {
            (nums[lo], nums[mid]) = (nums[mid], nums[lo]);   // nums[lo] was a 1 (or mid itself)
            lo++;
            mid++;
        } else if (nums[mid] == 1) {
            mid++;
        } else {
            (nums[mid], nums[hi]) = (nums[hi], nums[mid]);
            hi--;                                            // mid stays: the value from hi is not checked yet
        }
    }
}`),
  ],
  binary: [
    p('lisTails', 'Longest Increasing Subsequence · O(n log n)', 300, 'longest-increasing-subsequence', 'Medium', `public int LengthOfLIS(int[] nums) {
    // tails[k]: the smallest end of an increasing subsequence of length k + 1; tails is sorted
    var tails = new int[nums.Length];
    int len = 0;
    foreach (int x in nums) {
        int lo = 0, hi = len;                 // lower_bound: the first tail >= x
        while (lo < hi) {
            int mid = lo + (hi - lo) / 2;
            if (tails[mid] < x) lo = mid + 1;
            else hi = mid;
        }
        tails[lo] = x;                        // replace: the same length now ends lower
        if (lo == len) len++;                 // or extend: x is bigger than every tail
    }
    return len;                               // the length only: tails is not the subsequence
}`),
  ],
  back: [
    p('coinOrder', 'Coin Change II · Combination Sum IV', 518, 'coin-change-ii', 'Medium', `// #518 Coin Change II: combinations — coins in the outer loop
public int Change(int amount, int[] coins) {
    var dp = new int[amount + 1];
    dp[0] = 1;                                // one way to make 0: take nothing
    foreach (int c in coins)                  // coin c joins only after the coins before it
        for (int s = c; s <= amount; s++)
            dp[s] += dp[s - c];               // dp[s - c] still uses only coins up to c
    return dp[amount];
}

// #377 Combination Sum IV: ordered sequences — sums in the outer loop
public int CombinationSum4(int[] nums, int target) {
    var dp = new int[target + 1];
    dp[0] = 1;
    for (int s = 1; s <= target; s++)
        foreach (int c in nums)
            if (c <= s) dp[s] += dp[s - c];   // c is the last part; before it, any sequence
    return dp[target];
}`),
  ],
  greedy: [
    p('insertIv', 'Insert Interval', 57, 'insert-interval', 'Medium', `public int[][] Insert(int[][] intervals, int[] newInterval) {
    var res = new List<int[]>();
    int i = 0, n = intervals.Length;
    int s = newInterval[0], e = newInterval[1];
    while (i < n && intervals[i][1] < s)      // left: ends before the new one starts
        res.Add(intervals[i++]);
    while (i < n && intervals[i][0] <= e) {   // overlaps or touches: absorb it
        s = Math.Min(s, intervals[i][0]);
        e = Math.Max(e, intervals[i][1]);
        i++;
    }
    res.Add(new[] { s, e });
    while (i < n)                             // right: starts after the new one ends
        res.Add(intervals[i++]);
    return res.ToArray();
}`, true),
    p('meetingRooms', 'Meeting Rooms II', 253, 'meeting-rooms-ii', 'Medium', `public int MinMeetingRooms(int[][] intervals) {
    var events = new (int time, int delta)[2 * intervals.Length];
    for (int i = 0; i < intervals.Length; i++) {
        events[2 * i] = (intervals[i][0], +1);       // a meeting starts: one more room busy
        events[2 * i + 1] = (intervals[i][1], -1);   // it ends: the room is free
    }
    // by time; at the same time -1 before +1: [1, 4) frees its room for [4, 7)
    Array.Sort(events, (a, b) => a.time != b.time ? a.time.CompareTo(b.time) : a.delta.CompareTo(b.delta));
    int rooms = 0, peak = 0;
    foreach (var (time, delta) in events) {
        rooms += delta;
        peak = Math.Max(peak, rooms);
    }
    return peak;
}`, true),
  ],
  dp: [
    p('kadane', 'Maximum Subarray', 53, 'maximum-subarray', 'Medium', `public int MaxSubArray(int[] nums) {
    int cur = nums[0], best = nums[0];        // not 0: the subarray is never empty
    for (int i = 1; i < nums.Length; i++) {
        int x = nums[i];
        cur = x > cur + x ? x : cur + x;      // start over at i, or continue (= Math.Max)
        best = Math.Max(best, cur);
    }
    return best;
}`, true),
  ],
  matrix: [
    p('uniquePaths', 'Unique Paths', 62, 'unique-paths', 'Medium', `public int UniquePaths(int m, int n) {
    // dp[r][c] = dp[r - 1][c] + dp[r][c - 1], kept in one row:
    // before the +=, row[c] is still the cell above, row[c - 1] is already the cell to the left
    var row = new int[n];
    Array.Fill(row, 1);                       // the first row: one way to each cell
    for (int r = 1; r < m; r++)
        for (int c = 1; c < n; c++)
            row[c] += row[c - 1];             // row[0] stays 1: the first column
    return row[n - 1];
}

// The full table, m × n memory — the same numbers, row by row
public int UniquePathsTable(int m, int n) {
    var dp = new int[m, n];
    for (int r = 0; r < m; r++) dp[r, 0] = 1;
    for (int c = 0; c < n; c++) dp[0, c] = 1;
    for (int r = 1; r < m; r++)
        for (int c = 1; c < n; c++)
            dp[r, c] = dp[r - 1, c] + dp[r, c - 1];   // from above + from the left
    return dp[m - 1, n - 1];
}`, true),
  ],
};
