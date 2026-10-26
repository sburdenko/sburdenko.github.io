/**
 * Problems that close gaps in existing chapters, with C# 9 solutions: Valid Palindrome (two pointers),
 * Contains Duplicate II (hash map) and Invert Binary Tree (trees). problems.js appends each list to the end of its
 * chapter; the texts in i18n-gap.js follow the same order.
 */
import { problem as p } from './problem.js?v=202610262121';

export const PROBLEMS_GAP = {
  twoptr: [
    p('palindrome', 'Valid Palindrome', 125, 'valid-palindrome', 'Easy', `public bool IsPalindrome(string s) {
    int l = 0, r = s.Length - 1;
    while (l < r) {
        // both skips check l < r too: on ".," l must not run off the end
        while (l < r && !char.IsLetterOrDigit(s[l])) l++;
        while (l < r && !char.IsLetterOrDigit(s[r])) r--;
        if (char.ToLowerInvariant(s[l]) != char.ToLowerInvariant(s[r])) return false;
        l++; r--;
    }
    return true;   // the pointers met: every pair matched
}`),
  ],
  hash: [
    p('dupWindow', 'Contains Duplicate II', 219, 'contains-duplicate-ii', 'Easy', `public bool ContainsNearbyDuplicate(int[] nums, int k) {
    var window = new HashSet<int>();                       // the last k values
    for (int i = 0; i < nums.Length; i++) {
        if (!window.Add(nums[i])) return true;             // the same value at most k back
        if (window.Count > k) window.Remove(nums[i - k]);  // the oldest one leaves
    }
    return false;
}`),
  ],
  tree: [
    p('invertTree', 'Invert Binary Tree', 226, 'invert-binary-tree', 'Easy', `public TreeNode InvertTree(TreeNode root) {
    if (root == null) return null;              // 1. an empty tree
    TreeNode left = InvertTree(root.left);      // 2. invert both children
    TreeNode right = InvertTree(root.right);
    root.left = right;                          // 3. swap: the node's answer
    root.right = left;
    return root;
}`),
  ],
};
