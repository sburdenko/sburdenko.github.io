/** PY-06 problems 20–30 and the bonus ones: strings and hashing, stack and queue, grids, backtracking and DP. */
import { lit } from '../shared/py-code.js?v=202610071708';
import { randInt, pick, randInts, shuffle } from '../../algorithms/patterns/rig-kit.js?v=202610071708';
import { tuplesOf, intOf } from '../shared/struct-views.js?v=202610071708';

const num = (key, extra = {}) => ({ key, type: 'int', min: 0, max: 999, ...extra });
const ints = (key, extra = {}) => ({ key, type: 'ints', minLen: 1, maxLen: 10, min: 0, max: 99, ...extra });
const text = (key, extra = {}) => ({ key, type: 'text', maxLen: 20, ...extra });
const CALLSTACK = { kind: 'callstack', label: 'call stack' };
const P = (id, num_, ch, diff, must, after, rig) => ({ id, num: num_, ch, diff, must, after, rig: { id, problem: id, ...rig } });
const innermost = (mem, name) => intOf(mem, name);

export const PROBLEMS_B = [
  /* ---------- 05 strings and hashing ---------- */
  P('anagram', 20, '05', 'Easy', true, '03', {
    fields: [text('a', { minLen: 1, maxLen: 12, chars: 'a-zA-Z', charsLabel: 'a-z' }), text('b', { minLen: 1, maxLen: 12, chars: 'a-zA-Z', charsLabel: 'a-z' })],
    example: { a: 'listen', b: 'silent' },
    random: next => pick(next, [{ a: 'listen', b: 'silent' }, { a: 'orbit', b: 'bitro' }, { a: 'comet', b: 'comes' }, { a: 'night', b: 'thing' }]),
    view: { kind: 'multi', views: [{ kind: 'counts', of: 'counts', title: 'counts' }] }, showMemory: true,
    code: p => `a = ${lit(p.a)}
b = ${lit(p.b)}
counts = {}
for ch in a.lower():
    counts[ch] = counts.get(ch, 0) + 1
for ch in b.lower():
    counts[ch] = counts.get(ch, 0) - 1
same = all(v == 0 for v in counts.values())
print("anagrams" if same else "not anagrams")
print(sorted(a.lower()) == sorted(b.lower()))
`,
  }),
  P('mostfreq', 21, '05', 'Easy', false, '03', {
    fields: [text('s', { minLen: 1, maxLen: 24 })],
    example: { s: 'mississippi' },
    random: next => ({ s: pick(next, ['mississippi', 'abracadabra', 'varvara', 'hello world', 'banana']) }),
    view: { kind: 'counts', of: 'freq' },
    code: p => `s = ${lit(p.s)}
freq = {}
for ch in s:
    if ch == " ":
        continue
    freq[ch] = freq.get(ch, 0) + 1
best = max(freq, key=freq.get)
print(best, freq[best])
from collections import Counter
print(Counter(s.replace(" ", "")).most_common(1))
`,
  }),
  P('twosum', 22, '05', 'Medium', true, '03', {
    fields: [ints('nums', { minLen: 2, maxLen: 10 }), num('target', { min: 0, max: 200 })],
    example: { nums: [2, 7, 11, 15, 4], target: 9 },
    random: next => { const nums = randInts(next, randInt(next, 5, 8), 1, 30); const [i, j] = shuffle(next, nums.map((_, k) => k)).slice(0, 2); return { nums, target: nums[i] + nums[j] }; },
    view: { kind: 'cells', of: 'nums', pointers: ['i'], counters: ['need'] }, showMemory: true,
    code: p => `nums = ${lit(p.nums)}
target = ${p.target}
seen = {}
for i in range(len(nums)):
    need = target - nums[i]
    if need in seen:
        print("pair:", seen[need], i)
        break
    seen[nums[i]] = i
else:
    print("no pair")
`,
  }),
  P('caesar', 23, '05', 'Easy', false, '02', {
    fields: [text('msg', { minLen: 1, maxLen: 16 }), num('shift', { min: -25, max: 25 })],
    example: { msg: 'Hello, Luna!', shift: 3 },
    random: next => ({ msg: pick(next, ['Hello, Luna!', 'attack at dawn', 'Varvara', 'meet me at 5']), shift: randInt(next, 1, 25) }),
    view: { kind: 'multi', views: [{ kind: 'string', of: 'msg', title: 'msg' }, { kind: 'string', of: 'out', title: 'out' }] },
    maxSteps: 600,
    code: p => `msg = ${lit(p.msg)}
shift = ${p.shift}
out = ""
for ch in msg:
    if ch.isalpha():
        base = ord("A") if ch.isupper() else ord("a")
        out += chr((ord(ch) - base + shift) % 26 + base)
    else:
        out += ch
print(out)

back = ""
for ch in out:
    if ch.isalpha():
        base = ord("A") if ch.isupper() else ord("a")
        back += chr((ord(ch) - base - shift) % 26 + base)
    else:
        back += ch
print(back)
`,
  }),

  /* ---------- 06 stack and queue ---------- */
  P('brackets', 24, '06', 'Easy', true, '03', {
    fields: [text('s', { minLen: 1, maxLen: 16, chars: '()\\[\\]{}', charsLabel: '()[]{}' })],
    example: { s: '([]{()})' },
    random: next => ({ s: pick(next, ['([]{()})', '([)]', '(((', '{[()]}', '())', '[]{}()']) }),
    view: { kind: 'multi', views: [{ kind: 'string', of: 's', title: 's' }, { kind: 'stack', of: 'stack', title: 'stack' }] },
    code: p => `s = ${lit(p.s)}
pairs = {")": "(", "]": "[", "}": "{"}
stack = []
ok = True
for ch in s:
    if ch in "([{":
        stack.append(ch)
    elif not stack or stack.pop() != pairs[ch]:
        ok = False
        break
print(ok and not stack)
`,
  }),
  P('rpn', 25, '06', 'Medium', false, '03', {
    fields: [{ key: 'expr', type: 'text', minLen: 1, maxLen: 30, chars: '0-9 +\\-*/', charsLabel: 'digits + - * / space' }],
    example: { expr: '3 4 + 2 * 7 -' },
    random: next => ({ expr: pick(next, ['3 4 + 2 * 7 -', '5 1 2 + 4 * + 3 -', '2 3 4 * +', '9 3 / 2 *']) }),
    view: { kind: 'multi', views: [{ kind: 'cells', of: 'tokens', title: 'tokens', pointers: ['i'] }, { kind: 'stack', of: 'stack', title: 'stack' }] },
    code: p => `expr = ${lit(p.expr)}
tokens = expr.split()
stack = []
for i in range(len(tokens)):
    t = tokens[i]
    if t in "+-*/":
        b = stack.pop()
        a = stack.pop()
        if t == "+":
            stack.append(a + b)
        elif t == "-":
            stack.append(a - b)
        elif t == "*":
            stack.append(a * b)
        else:
            stack.append(a / b)
    else:
        stack.append(int(t))
print(stack[0])
`,
  }),
  P('hanoi', 26, '06', 'Medium', true, '02', {
    fields: [num('disks', { min: 1, max: 4 })],
    example: { disks: 3 },
    random: next => ({ disks: randInt(next, 2, 4) }),
    view: { kind: 'multi', views: [{ kind: 'pegs', of: ['A', 'B', 'C'] }, { ...CALLSTACK, hide: ['moves'] }] },
    maxSteps: 700,
    code: p => `A = ${lit(Array.from({ length: p.disks }, (_, i) => p.disks - i))}
B = []
C = []
moves = 0

def hanoi(n, src, dst, tmp, src_name, dst_name):
    global moves
    if n == 0:
        return
    hanoi(n - 1, src, tmp, dst, src_name, tmp_name(src_name, dst_name))
    dst.append(src.pop())
    moves += 1
    print("move disk", dst[-1], src_name, "→", dst_name)
    hanoi(n - 1, tmp, dst, src, tmp_name(src_name, dst_name), dst_name)

def tmp_name(a, b):
    return ({"A", "B", "C"} - {a, b}).pop()

hanoi(${p.disks}, A, C, B, "A", "C")
print("moves:", moves)
`,
  }),

  /* ---------- 07 grids and graphs ---------- */
  P('floodfill', 27, '07', 'Medium', true, '02', {
    fields: [{ key: 'img', type: 'grid', maxRows: 5, maxCols: 6, maxDigit: 2 }, num('r', { min: 0, max: 4 }), num('c', { min: 0, max: 5 })],
    example: { img: [[1, 1, 0, 0], [1, 0, 0, 1], [1, 1, 1, 1], [0, 0, 1, 0]], r: 0, c: 0 },
    random: next => ({ img: Array.from({ length: 4 }, () => Array.from({ length: 5 }, () => (next() > 0.4 ? 1 : 0))), r: randInt(next, 0, 3), c: randInt(next, 0, 4) }),
    check: p => (p.r >= p.img.length || p.c >= p.img[0].length ? ['in.err.range', 0, Math.min(p.img.length, p.img[0].length) - 1] : null),
    view: { kind: 'multi', views: [{ kind: 'grid', of: 'img', cursor: ['r', 'c'], cell: v => ({ cls: v === '9' ? 'fill' : v === '1' ? 'land' : 'water', label: v }), title: 'img' }, { ...CALLSTACK, hide: ['img'] }] },
    maxSteps: 900,
    code: p => `img = ${lit(p.img)}
rows = len(img)
cols = len(img[0])

def fill(r, c, old, new):
    if r < 0 or r >= rows or c < 0 or c >= cols:
        return
    if img[r][c] != old:
        return
    img[r][c] = new
    fill(r + 1, c, old, new)
    fill(r - 1, c, old, new)
    fill(r, c + 1, old, new)
    fill(r, c - 1, old, new)

start = img[${p.r}][${p.c}]
if start != 9:
    fill(${p.r}, ${p.c}, start, 9)
for row in img:
    print(row)
`,
  }),
  P('bfsmaze', 28, '07', 'Medium', true, '03', {
    fields: [{ key: 'maze', type: 'maze', maxRows: 5, maxCols: 7 }],
    example: { maze: ['S.#..', '..#.E', '#....', '..##.'].map(r => [...r]) },
    random: next => ({ maze: pick(next, [['S.#..', '..#.E', '#....', '..##.'], ['S....', '.##.#', '...#E', '.#...'], ['S#...', '.#.#.', '...#E', '.#...']]).map(r => [...r]) }),
    check: p => { const flat = p.maze.flat(); return flat.includes('S') && flat.includes('E') ? null : ['in.err.boardLetters']; },
    view: { kind: 'multi', views: [{ kind: 'grid', of: 'maze', title: 'maze', cursor: mem => { const t = mem.frames[0].vars.find(([k]) => k === 'cur'); if (!t) return [null, null]; const tup = mem.objects[t[1]]; if (!tup || !tup.items) return [null, null]; return tup.items.map(id => Number(mem.objects[id].value)); }, cell: (v, r, c, mem) => { const seen = tuplesOf(mem, 'seen').some(([a, b]) => a === r && b === c); return { cls: v === '#' ? 'wall' : v === 'S' ? 'start' : v === 'E' ? 'goal' : seen ? 'seen' : 'water', label: v === '.' ? '' : v }; } }, { kind: 'queue', of: 'q', title: 'queue' }] },
    maxSteps: 900,
    code: p => `from collections import deque
maze = ${lit(p.maze.map(r => r.join('')))}
rows = len(maze)
cols = len(maze[0])
for r in range(rows):
    for c in range(cols):
        if maze[r][c] == "S":
            start = (r, c)
q = deque([(start, 0)])
seen = {start}
answer = -1
while q:
    cur, dist = q.popleft()
    r, c = cur
    if maze[r][c] == "E":
        answer = dist
        break
    for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
        nr, nc = r + dr, c + dc
        if 0 <= nr < rows and 0 <= nc < cols and maze[nr][nc] != "#" and (nr, nc) not in seen:
            seen.add((nr, nc))
            q.append(((nr, nc), dist + 1))
print("shortest path:", answer)
`,
  }),
  P('islands', 29, '07', 'Medium', true, '02', {
    fields: [{ key: 'grid', type: 'grid', maxRows: 5, maxCols: 6, maxDigit: 1 }],
    example: { grid: [[1, 1, 0, 0, 0], [1, 0, 0, 1, 1], [0, 0, 1, 0, 0], [0, 0, 0, 0, 1]] },
    random: next => ({ grid: Array.from({ length: 4 }, () => Array.from({ length: 5 }, () => (next() > 0.55 ? 1 : 0))) }),
    view: { kind: 'multi', views: [{ kind: 'grid', of: 'grid', cursor: ['r', 'c'], cell: v => ({ cls: v === '1' ? 'land' : v === '2' ? 'seen' : 'water', label: v === '0' ? '' : v }), title: 'grid' }, { ...CALLSTACK, hide: ['grid'] }] },
    maxSteps: 900,
    code: p => `grid = ${lit(p.grid)}
rows = len(grid)
cols = len(grid[0])
count = 0

def sink(r, c):
    if r < 0 or r >= rows or c < 0 or c >= cols:
        return
    if grid[r][c] != 1:
        return
    grid[r][c] = 2
    sink(r + 1, c)
    sink(r - 1, c)
    sink(r, c + 1)
    sink(r, c - 1)

for r in range(rows):
    for c in range(cols):
        if grid[r][c] == 1:
            count += 1
            sink(r, c)
print("islands:", count)
`,
  }),
  P('life', 32, '07', 'Medium', false, '02', {
    fields: [{ key: 'cells', type: 'grid', maxRows: 5, maxCols: 5, maxDigit: 1 }, num('gens', { min: 1, max: 3 })],
    example: { cells: [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 0, 0, 0]], gens: 2 },
    random: next => ({ cells: Array.from({ length: 4 }, () => Array.from({ length: 4 }, () => (next() > 0.6 ? 1 : 0))), gens: randInt(next, 1, 2) }),
    view: { kind: 'multi', views: [{ kind: 'grid', of: 'cells', cursor: ['r', 'c'], cell: v => ({ cls: v === '1' ? 'alive' : 'water', label: '' }), title: 'cells' }, { kind: 'grid', of: 'nxt', cell: v => ({ cls: v === '1' ? 'alive' : 'water', label: '' }), title: 'next' }] },
    maxSteps: 900,
    code: p => `cells = ${lit(p.cells)}
rows = len(cells)
cols = len(cells[0])
for gen in range(${p.gens}):
    nxt = [[0] * cols for _ in range(rows)]
    for r in range(rows):
        for c in range(cols):
            n = sum(cells[r + dr][c + dc]
                    for dr in (-1, 0, 1) for dc in (-1, 0, 1)
                    if (dr or dc) and 0 <= r + dr < rows and 0 <= c + dc < cols)
            if n == 3 or (n == 2 and cells[r][c]):
                nxt[r][c] = 1
    cells = nxt
    print("gen", gen + 1, sum(map(sum, cells)), "alive")
`,
  }),

  /* ---------- 08 backtracking and DP ---------- */
  P('queens', 30, '08', 'Hard', true, '02', {
    fields: [num('n', { min: 4, max: 5 })],
    example: { n: 4 },
    random: next => ({ n: randInt(next, 4, 5) }),
    view: { kind: 'multi', views: [{ kind: 'board', of: 'cols', size: 'n', title: 'board' }, { ...CALLSTACK, hide: ['cols', 'used_cols', 'used_d1', 'used_d2'] }] },
    maxSteps: 2500,
    code: p => `n = ${p.n}
cols = []
used_cols = set()
used_d1 = set()
used_d2 = set()
solutions = 0

def place(r):
    global solutions
    if r == n:
        solutions += 1
        print("solution:", cols)
        return
    for c in range(n):
        if c in used_cols or r - c in used_d1 or r + c in used_d2:
            continue
        cols.append(c)
        used_cols.add(c)
        used_d1.add(r - c)
        used_d2.add(r + c)
        place(r + 1)
        cols.pop()
        used_cols.remove(c)
        used_d1.remove(r - c)
        used_d2.remove(r + c)

place(0)
print("total:", solutions)
`,
  }),
  P('coins', 33, '08', 'Medium', false, '02', {
    fields: [num('amount', { min: 1, max: 15 }), ints('coins', { minLen: 1, maxLen: 4, min: 1, max: 10, distinct: true })],
    example: { amount: 11, coins: [1, 2, 5] },
    random: next => ({ amount: randInt(next, 6, 13), coins: pick(next, [[1, 2, 5], [2, 3], [1, 4, 6], [3, 5]]) }),
    view: { kind: 'cells', of: 'dp', pointers: ['a'], counters: ['coin'], marks: (mem, e, values) => Object.fromEntries(values.map((v, i) => [i, v === 'inf' ? 'dim' : ''])) },
    maxSteps: 900,
    code: p => `amount = ${p.amount}
coins = ${lit(p.coins)}
INF = float("inf")
dp = [0] + [INF] * amount
for a in range(1, amount + 1):
    for coin in coins:
        if coin <= a and dp[a - coin] + 1 < dp[a]:
            dp[a] = dp[a - coin] + 1
print(dp[amount] if dp[amount] != INF else -1)
`,
  }),
  P('tictactoe', 34, '08', 'Hard', false, '02', {
    fields: [{ key: 'board', type: 'board', maxRows: 3, maxCols: 3 }],
    example: { board: ['XOX', 'OX.', 'O..'].map(r => [...r]) },
    random: next => ({ board: pick(next, [['XOX', 'OX.', 'O..'], ['XO.', 'XO.', '...'], ['OX.', 'XO.', '..X'], ['XXO', 'OOX', 'X..']]).map(r => [...r]) }),
    check: p => (p.board.length === 3 && p.board[0].length === 3 ? null : ['in.err.gridRows', 3, 3]),
    view: { kind: 'multi', views: [{ kind: 'grid', of: 'board', cell: v => ({ cls: v === 'X' ? 'x' : v === 'O' ? 'o' : 'water', label: v === '.' ? '' : v, tcls: 'letter' }), title: 'board' }, { ...CALLSTACK, hide: ['board', 'lines'] }] },
    maxSteps: 2500,
    code: p => `board = ${lit(p.board.map(r => r.join('')))}

def winner(b):
    lines = [b[0], b[1], b[2]]
    for c in range(3):
        lines.append(b[0][c] + b[1][c] + b[2][c])
    lines.append(b[0][0] + b[1][1] + b[2][2])
    lines.append(b[0][2] + b[1][1] + b[2][0])
    for line in lines:
        if line in ("XXX", "OOO"):
            return line[0]
    return None

def minimax(b, player):
    w = winner(b)
    if w == "X":
        return 1
    if w == "O":
        return -1
    if all("." not in row for row in b):
        return 0
    best = -2 if player == "X" else 2
    for r in range(3):
        for c in range(3):
            if b[r][c] == ".":
                nb = list(b)
                nb[r] = b[r][:c] + player + b[r][c + 1:]
                score = minimax(nb, "O" if player == "X" else "X")
                best = max(best, score) if player == "X" else min(best, score)
    return best

print("winner now:", winner(board))
print("value for X to move:", minimax(board, "X"))
`,
  }),
];
