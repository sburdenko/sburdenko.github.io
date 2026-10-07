/** PY-03 rigs: lists, tuples, dicts, sets, stack/queue, heap, comprehensions, iterators, sorting. */
import { lit } from '../shared/py-code.js?v=202610071708';
import { randInt, pick, randInts, shuffle, distinctInts } from '../../algorithms/patterns/rig-kit.js?v=202610071708';

const num = (key, extra = {}) => ({ key, type: 'int', min: -99, max: 99, ...extra });
const ints = (key, extra = {}) => ({ key, type: 'ints', minLen: 1, maxLen: 10, min: -99, max: 99, ...extra });
const words = (key, extra = {}) => ({ key, type: 'wordsAny', minLen: 1, maxLen: 8, maxWord: 10, ...extra });

export const RIGS = [
  /* ---------- 01 list ---------- */
  {
    id: 'listops',
    fields: [ints('songs', { minLen: 2, maxLen: 6, min: 1, max: 99 })],
    example: { songs: [4, 8, 15, 16] },
    random: next => ({ songs: randInts(next, randInt(next, 3, 6), 1, 50) }),
    code: p => `songs = ${lit(p.songs)}
songs.append(23)
songs.insert(0, 42)
songs.pop()
songs.pop(1)
songs.remove(${p.songs[1]})
print(songs, len(songs))
print(songs.index(${p.songs[0] === p.songs[1] ? 42 : p.songs[0]}), 42 in songs)
songs[0] = 7
songs.reverse()
print(songs)
`,
  },
  {
    id: 'listcopy',
    code: `a = [[1, 2], [3, 4]]
b = a
c = a[:]
import copy
d = copy.deepcopy(a)
a[0].append(99)
a.append([5])
print(b)
print(c)
print(d)
print(b is a, c is a, c[0] is a[0], d[0] is a[0])
`,
  },
  {
    id: 'listgrow',
    fields: [num('n', { min: 1, max: 12 })],
    example: { n: 9 },
    random: next => ({ n: randInt(next, 5, 12) }),
    code: p => `import sys
items = []
for i in range(${p.n}):
    items.append(i)
    print(len(items), sys.getsizeof(items))
`,
  },
  {
    id: 'listcost',
    code: `items = list(range(6))
items.append(6)
items.insert(0, -1)
items.pop()
items.pop(0)
print(items)
`,
  },

  /* ---------- 02 tuple ---------- */
  {
    id: 'tuples',
    code: `point = (3, 4)
x, y = point
print(x, y)
x, y = y, x
print(x, y)
first, *rest = (10, 20, 30, 40)
print(first, rest)
single = (5,)
not_a_tuple = (5)
print(type(single).__name__, type(not_a_tuple).__name__)
def min_max(values):
    return min(values), max(values)
lo, hi = min_max([7, 2, 9])
print(lo, hi)
`,
  },
  {
    id: 'tuplekey',
    code: `visited = {}
visited[(0, 0)] = "start"
visited[(2, 1)] = "treasure"
print(visited[(2, 1)])
print((2, 1) in visited)
try:
    visited[[1, 2]] = "nope"
except TypeError as e:
    print("TypeError:", e)
from collections import namedtuple
Pos = namedtuple("Pos", "row col")
p = Pos(2, 1)
print(p, p.row, p[1], p == (2, 1))
`,
  },

  /* ---------- 03 dict ---------- */
  {
    id: 'dictbasic',
    fields: [words('names', { minLen: 1, maxLen: 5, maxWord: 8 })],
    example: { names: ['Luna', 'Nova', 'Kira'] },
    random: next => ({ names: shuffle(next, ['Luna', 'Nova', 'Kira', 'Pixel', 'Mia', 'Zed']).slice(0, randInt(next, 2, 5)) }),
    code: p => `scores = {}
for name in ${lit(p.names)}:
    scores[name] = len(name) * 3
scores["Varvara"] = 21
print(scores)
print(scores.get("Nobody"), scores.get("Nobody", 0))
print(scores.pop("Varvara"))
for name, score in scores.items():
    print(name, "→", score)
print(list(scores.keys()), list(scores.values()))
print(max(scores, key=scores.get))
`,
  },
  {
    id: 'hashtable',
    fields: [words('keys', { minLen: 1, maxLen: 6, maxWord: 7 })],
    example: { keys: ['sword', 'bow', 'map', 'gem', 'rope'] },
    random: next => ({ keys: shuffle(next, ['sword', 'bow', 'map', 'gem', 'rope', 'torch', 'coin', 'key', 'boat']).slice(0, randInt(next, 3, 6)) }),
    view: { kind: 'hashtable', of: 'bag', label: 'hash table (illustrative hashes)' }, showMemory: true,
    code: p => `bag = {}
${p.keys.map((k, i) => `bag[${lit(k)}] = ${i + 1}`).join('\n')}
print(bag[${lit(p.keys[0])}])
print(${lit(p.keys[p.keys.length - 1])} in bag)
print(hash(${lit(p.keys[0])}) == hash(${lit(p.keys[0])}))
`,
  },
  {
    id: 'defaultdict',
    fields: [words('items', { minLen: 1, maxLen: 8, maxWord: 8 })],
    example: { items: ['apple', 'avocado', 'banana', 'blueberry', 'cherry'] },
    random: next => ({ items: shuffle(next, ['apple', 'avocado', 'banana', 'blueberry', 'cherry', 'cocoa', 'date', 'fig']).slice(0, randInt(next, 4, 7)) }),
    code: p => `items = ${lit(p.items)}
groups = {}
for item in items:
    groups.setdefault(item[0], []).append(item)
print(groups)

from collections import defaultdict, Counter
by_letter = defaultdict(list)
for item in items:
    by_letter[item[0]].append(item)
print(dict(by_letter))
lengths = Counter(len(item) for item in items)
print(lengths, lengths.most_common(1))
`,
  },

  /* ---------- 04 set ---------- */
  {
    id: 'setops',
    fields: [ints('a', { minLen: 1, maxLen: 8, min: 0, max: 20, distinct: true }), ints('b', { minLen: 1, maxLen: 8, min: 0, max: 20, distinct: true })],
    example: { a: [1, 2, 3, 4, 5], b: [4, 5, 6, 7] },
    random: next => ({ a: distinctInts(next, randInt(next, 3, 6), 0, 12), b: distinctInts(next, randInt(next, 3, 6), 0, 12) }),
    code: p => `a = set(${lit(p.a)})
b = set(${lit(p.b)})
print(a | b)
print(a & b)
print(a - b)
print(a ^ b)
a.add(100)
a.discard(999)
print(len(a), 100 in a, a <= b, {4, 5} <= a)
print(sorted(set("mississippi")))
`,
  },
  {
    id: 'setvslist',
    fields: [num('n', { min: 5, max: 40 })],
    example: { n: 20 },
    random: next => ({ n: randInt(next, 8, 40) }),
    code: p => `n = ${p.n}
as_list = list(range(n))
as_set = set(as_list)
target = n - 1
looks = 0
for value in as_list:
    looks += 1
    if value == target:
        break
print("list: found after", looks, "looks")
print("set:", target in as_set, "— one hash, one look")
try:
    bad = {[1, 2]}
except TypeError as e:
    print("TypeError:", e)
`,
  },

  /* ---------- 05 stack and queue ---------- */
  {
    id: 'stackq',
    view: { kind: 'multi', views: [{ kind: 'stack', of: 'stack', title: 'stack' }, { kind: 'queue', of: 'queue', title: 'queue' }] }, showMemory: true,
    code: `from collections import deque
stack = []
stack.append("a")
stack.append("b")
stack.append("c")
print(stack.pop(), stack.pop())
queue = deque()
queue.append("a")
queue.append("b")
queue.append("c")
print(queue.popleft(), queue.popleft())
queue.appendleft("z")
print(stack, queue)
`,
  },
  {
    id: 'popzero',
    code: `line = list(range(8))
line.pop(0)
print(line)
from collections import deque
fast = deque(range(8))
fast.popleft()
print(fast)
`,
  },

  /* ---------- 06 heap ---------- */
  {
    id: 'heap',
    fields: [ints('values', { minLen: 2, maxLen: 9, min: 1, max: 99 })],
    example: { values: [20, 7, 15, 3, 11, 9] },
    random: next => ({ values: randInts(next, randInt(next, 5, 8), 1, 60) }),
    view: { kind: 'multi', views: [{ kind: 'heaptree', of: 'heap', title: 'heap as a tree' }, { kind: 'cells', of: 'heap', title: 'heap as a list' }] },
    maxSteps: 600,
    code: p => `import heapq
heap = []
for value in ${lit(p.values)}:
    heapq.heappush(heap, value)
print(heap)
print(heapq.heappop(heap), heapq.heappop(heap))
print(heap)
print(heapq.nsmallest(2, ${lit(p.values)}), heapq.nlargest(2, ${lit(p.values)}))
`,
  },

  /* ---------- 07 comprehensions ---------- */
  {
    id: 'listcomp',
    fields: [num('n', { min: 1, max: 10 })],
    example: { n: 6 },
    random: next => ({ n: randInt(next, 4, 9) }),
    code: p => `n = ${p.n}
squares = []
for x in range(n):
    if x % 2 == 0:
        squares.append(x * x)
print(squares)
print([x * x for x in range(n) if x % 2 == 0])
print([(x, y) for x in range(3) for y in range(2)])
print([[0] * 3 for _ in range(2)])
`,
  },
  {
    id: 'dictcomp',
    fields: [words('words', { minLen: 1, maxLen: 6, maxWord: 8 })],
    example: { words: ['comet', 'orbit', 'nova', 'pulsar'] },
    random: next => ({ words: shuffle(next, ['comet', 'orbit', 'nova', 'pulsar', 'quasar', 'aurora', 'lunar']).slice(0, randInt(next, 3, 6)) }),
    code: p => `words = ${lit(p.words)}
lengths = {w: len(w) for w in words}
print(lengths)
first_letters = {w[0] for w in words}
print(sorted(first_letters))
long_upper = {w.upper(): len(w) for w in words if len(w) > 4}
print(long_upper)
inverted = {v: k for k, v in lengths.items()}
print(inverted)
`,
  },

  /* ---------- 08 iterators and generators ---------- */
  {
    id: 'iterproto',
    code: `songs = ["Nebula", "Orbit", "Comet"]
it = iter(songs)
print(next(it))
print(next(it))
print(next(it))
try:
    next(it)
except StopIteration:
    print("StopIteration: nothing left")
for song in songs:
    print(song, end=" ")
print()
`,
  },
  {
    id: 'generator',
    fields: [num('limit', { min: 1, max: 6 })],
    example: { limit: 3 },
    random: next => ({ limit: randInt(next, 2, 5) }),
    code: p => `def countdown(n):
    print("ignition")
    while n > 0:
        yield n
        n -= 1
    print("liftoff")

g = countdown(${p.limit})
print(type(g).__name__)
print(next(g))
print(next(g))
for value in g:
    print("loop got", value)
`,
  },
  {
    id: 'lazy',
    code: `big = range(10 ** 9)
print(len(big), big[-1])
squares = (x * x for x in range(10 ** 9))
print(next(squares), next(squares))
first_big = next(x for x in squares if x > 50)
print(first_big)
evens = map(lambda x: x * 2, range(3))
print(list(evens), list(evens))
`,
  },
  {
    id: 'itertools',
    code: `from itertools import chain, product, permutations, combinations, islice, count
print(list(chain([1, 2], "ab")))
print(list(product("xy", [0, 1])))
print(list(permutations([1, 2, 3], 2)))
print(list(combinations("abc", 2)))
print(list(islice(count(10, 5), 4)))
`,
  },

  /* ---------- 09 sorting ---------- */
  {
    id: 'sortkey',
    fields: [words('players', { minLen: 2, maxLen: 6, maxWord: 8 })],
    example: { players: ['Luna', 'nova', 'Kira', 'pixel', 'Mia'] },
    random: next => ({ players: shuffle(next, ['Luna', 'nova', 'Kira', 'pixel', 'Mia', 'zed', 'Ash']).slice(0, randInt(next, 3, 6)) }),
    code: p => `players = ${lit(p.players)}
print(sorted(players))
print(sorted(players, key=str.lower))
print(sorted(players, key=len, reverse=True))
scores = {name: len(name) * 7 % 10 for name in players}
print(sorted(scores.items(), key=lambda kv: kv[1]))
players.sort(key=lambda s: (len(s), s.lower()))
print(players)
`,
  },
  {
    id: 'stable',
    code: `cards = [("Luna", 3), ("Nova", 1), ("Kira", 3), ("Mia", 2), ("Zed", 1)]
by_score = sorted(cards, key=lambda c: c[1])
print(by_score)
by_name = sorted(cards, key=lambda c: c[0])
by_name_then_score = sorted(by_name, key=lambda c: c[1])
print(by_name_then_score)
print(sorted(cards, key=lambda c: (c[1], c[0])))
print(sorted(cards, key=lambda c: (-c[1], c[0])))
`,
  },
];
