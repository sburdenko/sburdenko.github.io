/** Problems and C# solutions for chapter 13: arrays and matrices. */
import { problem as p } from './problem.js?v=202610191216';

export const PROBLEMS_D = {
  matrix: [
    p('productExcept', 'Product of Array Except Self', 238, 'product-of-array-except-self', 'Medium', `public int[] ProductExceptSelf(int[] nums) {
    int n = nums.Length;
    var ans = new int[n];
    int prefix = 1;                       // product of nums[0..i-1]
    for (int i = 0; i < n; i++) {
        ans[i] = prefix;
        prefix *= nums[i];
    }
    int suffix = 1;                       // product of nums[i+1..n-1]
    for (int i = n - 1; i >= 0; i--) {
        ans[i] *= suffix;
        suffix *= nums[i];
    }
    return ans;
}`, true),
    p('rotate', 'Rotate Image', 48, 'rotate-image', 'Medium', `public void Rotate(int[][] m) {
    int n = m.Length;
    for (int r = 0; r < n; r++)           // transpose: mirror over the main diagonal
        for (int c = r + 1; c < n; c++)
            (m[r][c], m[c][r]) = (m[c][r], m[r][c]);
    for (int r = 0; r < n; r++)           // then mirror every row left ↔ right
        for (int a = 0, b = n - 1; a < b; a++, b--)
            (m[r][a], m[r][b]) = (m[r][b], m[r][a]);
}`, true),
    p('setZeroes', 'Set Matrix Zeroes', 73, 'set-matrix-zeroes', 'Medium', `public void SetZeroes(int[][] m) {
    int rows = m.Length, cols = m[0].Length;
    bool firstRowZero = Array.IndexOf(m[0], 0) >= 0;
    bool firstColZero = false;
    for (int r = 0; r < rows; r++) if (m[r][0] == 0) firstColZero = true;
    for (int r = 1; r < rows; r++)        // markers live in the first row and column
        for (int c = 1; c < cols; c++)
            if (m[r][c] == 0) { m[r][0] = 0; m[0][c] = 0; }
    for (int r = 1; r < rows; r++)
        for (int c = 1; c < cols; c++)
            if (m[r][0] == 0 || m[0][c] == 0) m[r][c] = 0;
    if (firstRowZero) for (int c = 0; c < cols; c++) m[0][c] = 0;   // the markers go last
    if (firstColZero) for (int r = 0; r < rows; r++) m[r][0] = 0;
}`),
    p('spiral', 'Spiral Matrix', 54, 'spiral-matrix', 'Medium', `public IList<int> SpiralOrder(int[][] m) {
    var res = new List<int>();
    int top = 0, bottom = m.Length - 1, left = 0, right = m[0].Length - 1;
    while (top <= bottom && left <= right) {
        for (int c = left; c <= right; c++) res.Add(m[top][c]);
        top++;
        for (int r = top; r <= bottom; r++) res.Add(m[r][right]);
        right--;
        if (top <= bottom) {              // a row is still left
            for (int c = right; c >= left; c--) res.Add(m[bottom][c]);
            bottom--;
        }
        if (left <= right) {              // a column is still left
            for (int r = bottom; r >= top; r--) res.Add(m[r][left]);
            left++;
        }
    }
    return res;
}`, true),
    p('gameOfLife', 'Game of Life', 289, 'game-of-life', 'Medium', `public void GameOfLife(int[][] board) {
    int rows = board.Length, cols = board[0].Length;
    for (int r = 0; r < rows; r++)        // pass 1: bit 0 = now, bit 1 = next
        for (int c = 0; c < cols; c++) {
            int live = 0;
            for (int dr = -1; dr <= 1; dr++)
                for (int dc = -1; dc <= 1; dc++) {
                    int y = r + dr, x = c + dc;
                    if ((dr != 0 || dc != 0) && y >= 0 && y < rows && x >= 0 && x < cols)
                        live += board[y][x] & 1;          // & 1: the present, even if bit 1 is set
                }
            bool alive = (board[r][c] & 1) == 1;
            if (live == 3 || (alive && live == 2)) board[r][c] |= 2;   // lives on or is born
        }
    for (int r = 0; r < rows; r++)        // pass 2: the future becomes the present
        for (int c = 0; c < cols; c++)
            board[r][c] >>= 1;
}`),
    p('maxRect', 'Maximal Rectangle', 85, 'maximal-rectangle', 'Hard', `public int MaximalRectangle(char[][] matrix) {
    int cols = matrix[0].Length, best = 0;
    var h = new int[cols];                // column of 1s ending at this row
    var stack = new Stack<int>();
    foreach (var row in matrix) {
        for (int c = 0; c < cols; c++) h[c] = row[c] == '1' ? h[c] + 1 : 0;
        stack.Clear();
        for (int i = 0; i <= cols; i++) { // Largest Rectangle in Histogram (#84)
            int cur = i == cols ? 0 : h[i];
            while (stack.Count > 0 && h[stack.Peek()] >= cur) {
                int height = h[stack.Pop()];
                int left = stack.Count > 0 ? stack.Peek() + 1 : 0;
                best = Math.Max(best, height * (i - left));
            }
            stack.Push(i);
        }
    }
    return best;
}`),
  ],
};
