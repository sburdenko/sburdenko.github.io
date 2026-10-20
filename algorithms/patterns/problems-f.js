/** Problems and C# solutions for chapter 15: bit manipulation. C# 9: no >>> (it arrived in C# 11), so unsigned shifts go through uint. */
import { problem as p } from './problem.js?v=202610202014';

export const PROBLEMS_F = {
  bits: [
    p('popcount', 'Number of 1 Bits', 191, 'number-of-1-bits', 'Easy', `public int HammingWeight(int n) {
    uint x = (uint)n;              // as raw bits: no sign to worry about
    int count = 0;
    while (x != 0) {
        x &= x - 1;                // clears the lowest 1: ...1000 - 1 = ...0111
        count++;                   // one turn per set bit, not 32
    }
    return count;
}

// Power of Two (#231): exactly one 1, so one step of the loop above reaches 0
public bool IsPowerOfTwo(int n) => n > 0 && (n & (n - 1)) == 0;`, true),
    p('missingXor', 'Missing Number', 268, 'missing-number', 'Easy', `public int MissingNumber(int[] nums) {
    int x = nums.Length;           // index n has no slot of its own
    for (int i = 0; i < nums.Length; i++)
        x ^= i ^ nums[i];          // a present number meets itself: a ^ a = 0
    return x;                      // what is left never met its pair
}`, true),
    p('singleIII', 'Single Number III', 260, 'single-number-iii', 'Medium', `public int[] SingleNumber(int[] nums) {
    int x = 0;
    foreach (int v in nums) x ^= v;    // pairs cancel: x = a ^ b, not 0 because a != b
    int low = x & -x;                  // lowest 1 of x: a and b differ in this bit
    int a = 0, b = 0;
    foreach (int v in nums) {
        if ((v & low) != 0) a ^= v;    // group with the bit: a and whole pairs
        else b ^= v;                   // group without it: b and whole pairs
    }
    return new[] { a, b };
}`),
    p('countBits', 'Counting Bits', 338, 'counting-bits', 'Easy', `public int[] CountBits(int n) {
    var bits = new int[n + 1];         // bits[0] = 0
    for (int i = 1; i <= n; i++)
        bits[i] = bits[i >> 1] + (i & 1);   // i >> 1 is smaller: its answer is already there
    return bits;
}`),
    p('sumBits', 'Sum of Two Integers', 371, 'sum-of-two-integers', 'Medium', `public int GetSum(int a, int b) {
    while (b != 0) {
        int carry = (a & b) << 1;      // columns where both are 1 carry into the next one
        a ^= b;                        // add every column, ignoring carries
        b = carry;                     // then add the carries; one out of bit 31 just drops off
    }
    return a;
}`, true),
    p('maxXorLimit', 'Maximum XOR With an Element From Array', 1707, 'maximum-xor-with-an-element-from-array', 'Hard', `public int[] MaximizeXor(int[] nums, int[][] queries) {
    const int Top = 29;                              // values up to 10^9 < 2^30
    Array.Sort(nums);
    var order = new int[queries.Length];
    for (int j = 0; j < order.Length; j++) order[j] = j;
    Array.Sort(order, (p, q) => queries[p][1].CompareTo(queries[q][1]));   // by the limit m
    var levels = new HashSet<int>[Top + 1];          // levels[k]: prefixes v >> k — a trie, level by level
    for (int k = 0; k <= Top; k++) levels[k] = new HashSet<int>();
    var ans = new int[queries.Length];
    int next = 0;
    foreach (int j in order) {
        int x = queries[j][0], m = queries[j][1];
        while (next < nums.Length && nums[next] <= m) {    // the set only grows
            for (int k = 0; k <= Top; k++) levels[k].Add(nums[next] >> k);
            next++;
        }
        if (next == 0) { ans[j] = -1; continue; }         // nothing is <= m
        int node = 0, best = 0;
        for (int k = Top; k >= 0; k--) {
            int want = ((x >> k) & 1) ^ 1;               // the opposite bit makes a 1 in x ^ y
            int cand = (node << 1) | want;
            if (levels[k].Contains(cand)) { node = cand; best |= 1 << k; }
            else node = cand ^ 1;                        // forced: some number goes this way
        }
        ans[j] = best;
    }
    return ans;
}`),
  ],
};
