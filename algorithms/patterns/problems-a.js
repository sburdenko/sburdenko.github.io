/** Problems and C# solutions for chapters 01–04: hash map, two pointers, sliding window, binary search. */
import { problem as p } from './problem.js?v=202609252015';

export const PROBLEMS_A = {
  hash: [
    p('twoSum', 'Two Sum', 1, 'two-sum', 'Easy', `public int[] TwoSum(int[] nums, int target) {
    var seen = new Dictionary<int, int>(); // value → index
    for (int i = 0; i < nums.Length; i++) {
        int need = target - nums[i];
        if (seen.TryGetValue(need, out int j)) return new[] { j, i };
        seen[nums[i]] = i;
    }
    return new int[0];
}`),
    p('dup', 'Contains Duplicate', 217, 'contains-duplicate', 'Easy', `public bool ContainsDuplicate(int[] nums) {
    var seen = new HashSet<int>();
    foreach (int x in nums)
        if (!seen.Add(x)) return true;
    return false;
}`),
    p('anagram', 'Group Anagrams', 49, 'group-anagrams', 'Medium', `public IList<IList<string>> GroupAnagrams(string[] strs) {
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
    p('psum', 'Subarray Sum Equals K', 560, 'subarray-sum-equals-k', 'Medium', `public int SubarraySum(int[] nums, int k) {
    var seen = new Dictionary<int, int> { [0] = 1 }; // prefix sum → how many times
    int sum = 0, count = 0;
    foreach (int x in nums) {
        sum += x;
        if (seen.TryGetValue(sum - k, out int times)) count += times;
        seen[sum] = seen.GetValueOrDefault(sum) + 1;
    }
    return count;
}`)
  ],
  twoptr: [
    p('moveZeroes', 'Move Zeroes', 283, 'move-zeroes', 'Easy', `public void MoveZeroes(int[] nums) {
    int write = 0;
    for (int read = 0; read < nums.Length; read++) {
        if (nums[read] == 0) continue;
        (nums[write], nums[read]) = (nums[read], nums[write]);
        write++;
    }
}`),
    p('container', 'Container With Most Water', 11, 'container-with-most-water', 'Medium', `public int MaxArea(int[] h) {
    int l = 0, r = h.Length - 1, best = 0;
    while (l < r) {
        best = Math.Max(best, Math.Min(h[l], h[r]) * (r - l));
        if (h[l] < h[r]) l++; else r--;
    }
    return best;
}`),
    p('threeSum', '3Sum', 15, '3sum', 'Medium', `public IList<IList<int>> ThreeSum(int[] nums) {
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
    p('trap', 'Trapping Rain Water', 42, 'trapping-rain-water', 'Hard', `public int Trap(int[] h) {
    int l = 0, r = h.Length - 1, lmax = 0, rmax = 0, total = 0;
    while (l < r) {
        if (h[l] < h[r]) {
            lmax = Math.Max(lmax, h[l]);
            total += lmax - h[l++];
        } else {
            rmax = Math.Max(rmax, h[r]);
            total += rmax - h[r--];
        }
    }
    return total;
}`)
  ],
  window: [
    p('maxAvg', 'Maximum Average Subarray I', 643, 'maximum-average-subarray-i', 'Easy', `public double FindMaxAverage(int[] nums, int k) {
    int sum = 0;
    for (int i = 0; i < k; i++) sum += nums[i];
    int best = sum;
    for (int r = k; r < nums.Length; r++) {
        sum += nums[r] - nums[r - k];
        best = Math.Max(best, sum);
    }
    return (double)best / k;
}`),
    p('longest', 'Longest Substring Without Repeating Characters', 3, 'longest-substring-without-repeating-characters', 'Medium', `public int LengthOfLongestSubstring(string s) {
    var window = new HashSet<char>();
    int l = 0, best = 0;
    for (int r = 0; r < s.Length; r++) {
        while (window.Contains(s[r])) window.Remove(s[l++]);
        window.Add(s[r]);
        best = Math.Max(best, r - l + 1);
    }
    return best;
}`),
    p('minLen', 'Minimum Size Subarray Sum', 209, 'minimum-size-subarray-sum', 'Medium', `public int MinSubArrayLen(int target, int[] nums) {
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
    p('minWindow', 'Minimum Window Substring', 76, 'minimum-window-substring', 'Hard', `public string MinWindow(string s, string t) {
    var need = new Dictionary<char, int>();
    foreach (char c in t) need[c] = need.GetValueOrDefault(c) + 1;
    var have = new Dictionary<char, int>();
    int formed = 0, l = 0, bestL = 0, bestLen = int.MaxValue;
    for (int r = 0; r < s.Length; r++) {
        char c = s[r];
        have[c] = have.GetValueOrDefault(c) + 1;
        if (need.TryGetValue(c, out int n) && have[c] == n) formed++;
        while (formed == need.Count) {
            if (r - l + 1 < bestLen) { bestLen = r - l + 1; bestL = l; }
            char gone = s[l++];
            have[gone]--;
            if (need.TryGetValue(gone, out int m) && have[gone] < m) formed--;
        }
    }
    return bestLen == int.MaxValue ? "" : s.Substring(bestL, bestLen);
}`)
  ],
  binary: [
    p('bsearch', 'Binary Search', 704, 'binary-search', 'Easy', `public int Search(int[] nums, int target) {
    int lo = 0, hi = nums.Length - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;
        if (nums[mid] == target) return mid;
        if (nums[mid] < target) lo = mid + 1; else hi = mid - 1;
    }
    return -1;
}`),
    p('rotated', 'Search in Rotated Sorted Array', 33, 'search-in-rotated-sorted-array', 'Medium', `public int Search(int[] nums, int target) {
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
    p('koko', 'Koko Eating Bananas', 875, 'koko-eating-bananas', 'Medium', `public int MinEatingSpeed(int[] piles, int h) {
    int lo = 1, hi = piles.Max();
    while (lo < hi) {
        int k = lo + (hi - lo) / 2;
        long hours = 0;
        foreach (int p in piles) hours += (p - 1) / k + 1;
        if (hours <= h) hi = k; else lo = k + 1;
    }
    return lo;
}`),
    p('median', 'Median of Two Sorted Arrays', 4, 'median-of-two-sorted-arrays', 'Hard', `public double FindMedianSortedArrays(int[] a, int[] b) {
    if (a.Length > b.Length) return FindMedianSortedArrays(b, a);
    int m = a.Length, n = b.Length, half = (m + n + 1) / 2;
    int lo = 0, hi = m;
    while (lo <= hi) {
        int i = (lo + hi) / 2, j = half - i;
        int al = i > 0 ? a[i - 1] : int.MinValue, ar = i < m ? a[i] : int.MaxValue;
        int bl = j > 0 ? b[j - 1] : int.MinValue, br = j < n ? b[j] : int.MaxValue;
        if (al > br) hi = i - 1;
        else if (bl > ar) lo = i + 1;
        else return (m + n) % 2 == 1
            ? Math.Max(al, bl)
            : (Math.Max(al, bl) + Math.Min(ar, br)) / 2.0;
    }
    throw new ArgumentException("Inputs must be sorted");
}`)
  ],
};
