def bubble(a):
    a = a[:]
    n = len(a)
    for i in range(n):
        swapped = False
        for j in range(n - 1 - i):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:
            break
    return a
def merge_sort(a):
    if len(a) <= 1: return a
    mid = len(a) // 2
    left, right = merge_sort(a[:mid]), merge_sort(a[mid:])
    out, i, j = [], 0, 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]: out.append(left[i]); i += 1
        else: out.append(right[j]); j += 1
    return out + left[i:] + right[j:]
def quick(a):
    if len(a) <= 1: return a
    p = a[len(a) // 2]
    return quick([x for x in a if x < p]) + [x for x in a if x == p] + quick([x for x in a if x > p])
def binary_search(a, target):
    lo, hi = 0, len(a) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if a[mid] == target: return mid
        if a[mid] < target: lo = mid + 1
        else: hi = mid - 1
    return -1
data = [5, 2, 9, 1, 5, 6]
print(bubble(data), merge_sort(data), quick(data), data, binary_search(sorted(data), 6), binary_search(sorted(data), 7))
def sieve(n):
    is_p = [True] * (n + 1); is_p[0] = is_p[1] = False
    for i in range(2, int(n ** 0.5) + 1):
        if is_p[i]:
            for j in range(i * i, n + 1, i): is_p[j] = False
    return [i for i, p in enumerate(is_p) if p]
print(sieve(30))
def gcd(a, b):
    while b: a, b = b, a % b
    return a
def to_binary(n):
    bits = ""
    while n: bits = str(n % 2) + bits; n //= 2
    return bits or "0"
print(gcd(48, 18), to_binary(37), bin(37), int("100101", 2), int("ff", 16), hex(255), oct(8))
def hanoi(n, src, dst, tmp, moves):
    if n == 0: return
    hanoi(n - 1, src, tmp, dst, moves)
    moves.append((src, dst))
    hanoi(n - 1, tmp, dst, src, moves)
mv = []; hanoi(3, "A", "C", "B", mv); print(len(mv), mv[:3])
def balanced(s):
    pairs = {")": "(", "]": "[", "}": "{"}; st = []
    for ch in s:
        if ch in "([{": st.append(ch)
        elif ch in pairs:
            if not st or st.pop() != pairs[ch]: return False
    return not st
print(balanced("([]{})"), balanced("(]"), balanced("(("))
def rpn(tokens):
    st = []
    for t in tokens:
        if t in "+-*/":
            b, a = st.pop(), st.pop()
            st.append(a + b if t == "+" else a - b if t == "-" else a * b if t == "*" else a / b)
        else: st.append(int(t))
    return st[0]
print(rpn("3 4 + 2 *".split()))
from collections import deque
grid = ["S.#", "..#", "#.E"]
def bfs(grid):
    R, C = len(grid), len(grid[0])
    start = next((r, c) for r in range(R) for c in range(C) if grid[r][c] == "S")
    q = deque([(start, 0)]); seen = {start}
    while q:
        (r, c), d = q.popleft()
        if grid[r][c] == "E": return d
        for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nr, nc = r + dr, c + dc
            if 0 <= nr < R and 0 <= nc < C and grid[nr][nc] != "#" and (nr, nc) not in seen:
                seen.add((nr, nc)); q.append(((nr, nc), d + 1))
    return -1
print(bfs(grid))
def islands(g):
    g = [list(r) for r in g]; n = 0
    def sink(r, c):
        if 0 <= r < len(g) and 0 <= c < len(g[0]) and g[r][c] == "1":
            g[r][c] = "0"
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)): sink(r + dr, c + dc)
    for r in range(len(g)):
        for c in range(len(g[0])):
            if g[r][c] == "1": n += 1; sink(r, c)
    return n
print(islands(["110", "010", "001"]))
def queens(n):
    sols = []; cols = set(); d1 = set(); d2 = set(); pos = []
    def place(r):
        if r == n: sols.append(pos[:]); return
        for c in range(n):
            if c in cols or r - c in d1 or r + c in d2: continue
            cols.add(c); d1.add(r - c); d2.add(r + c); pos.append(c)
            place(r + 1)
            cols.remove(c); d1.remove(r - c); d2.remove(r + c); pos.pop()
    place(0); return sols
print(len(queens(6)), queens(4))
def coins(amount, cs):
    dp = [0] + [float("inf")] * amount
    for a in range(1, amount + 1):
        for c in cs:
            if c <= a: dp[a] = min(dp[a], dp[a - c] + 1)
    return dp[amount] if dp[amount] != float("inf") else -1
print(coins(11, [1, 2, 5]), coins(3, [2]))
def kadane(a):
    best = cur = a[0]
    for x in a[1:]:
        cur = max(x, cur + x); best = max(best, cur)
    return best
print(kadane([-2, 1, -3, 4, -1, 2, 1, -5, 4]))
def caesar(text, k):
    out = ""
    for ch in text:
        if ch.isalpha():
            base = ord("A") if ch.isupper() else ord("a")
            out += chr((ord(ch) - base + k) % 26 + base)
        else: out += ch
    return out
print(caesar("Hello, World!", 3), caesar(caesar("Hello, World!", 3), -3))
from collections import Counter
print(Counter("listen") == Counter("silent"), sorted("listen") == sorted("silent"), Counter("hello").most_common(1)[0])
def life(cells):
    rows, cols = len(cells), len(cells[0])
    nxt = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            n = sum(cells[(r + dr) % rows][(c + dc) % cols] for dr in (-1, 0, 1) for dc in (-1, 0, 1) if dr or dc)
            nxt[r][c] = 1 if n == 3 or (n == 2 and cells[r][c]) else 0
    return nxt
print(life([[0, 1, 0], [0, 1, 0], [0, 1, 0]]))
def winner(b):
    lines = [b[0], b[1], b[2], [b[0][0], b[1][0], b[2][0]], [b[0][1], b[1][1], b[2][1]], [b[0][2], b[1][2], b[2][2]], [b[0][0], b[1][1], b[2][2]], [b[0][2], b[1][1], b[2][0]]]
    for l in lines:
        if l[0] != "." and l[0] == l[1] == l[2]: return l[0]
    return None
print(winner(["XOX", "OXO", "..X"]), winner(["XOX", "OXO", "O.."]))
def fib_iter(n):
    a, b = 0, 1
    for _ in range(n): a, b = b, a + b
    return a
print(fib_iter(90), [fib_iter(i) for i in range(10)])
def digits_sum(n): return sum(int(d) for d in str(n))
def is_pal(s):
    s = "".join(c.lower() for c in s if c.isalnum())
    return s == s[::-1]
print(digits_sum(12345), is_pal("A man, a plan, a canal: Panama"), is_pal("hello"), "stressed"[::-1])
for i in range(1, 16):
    print("FizzBuzz" if i % 15 == 0 else "Fizz" if i % 3 == 0 else "Buzz" if i % 5 == 0 else i, end=" ")
print()
def two_sum(nums, t):
    seen = {}
    for i, x in enumerate(nums):
        if t - x in seen: return seen[t - x], i
        seen[x] = i
print(two_sum([2, 7, 11, 15], 9), two_sum([3, 3], 6))
def flood(img, r, c, color):
    old = img[r][c]
    if old == color: return img
    def fill(r, c):
        if 0 <= r < len(img) and 0 <= c < len(img[0]) and img[r][c] == old:
            img[r][c] = color
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)): fill(r + dr, c + dc)
    fill(r, c); return img
print(flood([[1, 1, 0], [1, 0, 0], [0, 0, 1]], 0, 0, 9))
def spiral(m):
    out = []
    while m:
        out += m.pop(0)
        m = [list(r) for r in zip(*m)][::-1]
    return out
print(spiral([[1, 2, 3], [4, 5, 6], [7, 8, 9]]))
def selection(a):
    a = a[:]
    for i in range(len(a)):
        m = min(range(i, len(a)), key=lambda j: a[j])
        a[i], a[m] = a[m], a[i]
    return a
def insertion(a):
    a = a[:]
    for i in range(1, len(a)):
        key = a[i]; j = i - 1
        while j >= 0 and a[j] > key:
            a[j + 1] = a[j]; j -= 1
        a[j + 1] = key
    return a
def counting(a):
    cnt = [0] * (max(a) + 1)
    for x in a: cnt[x] += 1
    return [i for i, c in enumerate(cnt) for _ in range(c)]
print(selection(data), insertion(data), counting(data))
def minimax(board, player):
    w = winner(board)
    if w == "X": return 1
    if w == "O": return -1
    if all(ch != "." for row in board for ch in row): return 0
    scores = []
    for r in range(3):
        for c in range(3):
            if board[r][c] == ".":
                nb = [row[:c] + player + row[c + 1:] for row in board] if False else [row[:c] + player + row[c + 1:] if i == r else row for i, row in enumerate(board)]
                scores.append(minimax(nb, "O" if player == "X" else "X"))
    return max(scores) if player == "X" else min(scores)
print(minimax(["XOX", "OX.", "O.."], "X"))
