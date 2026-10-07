nums = [3, 1, 4, 1, 5, 9, 2, 6]
nums.append(7); nums.insert(0, 0); nums.remove(1)
print(nums, nums.pop(), nums.pop(0), nums.index(4), nums.count(1), len(nums))
b = nums; c = nums[:]; nums[0] = 99
print(b is nums, c is nums, b[0], c[0], nums[1:3], nums[-2:], nums[::-1])
nums.sort(); print(nums); nums.sort(reverse=True); print(nums)
print(sorted(["bb", "a", "ccc"], key=len), sorted([3, 1, 2], reverse=True), sorted("hello"))
words = ["banana", "Apple", "cherry"]
print(sorted(words), sorted(words, key=str.lower), min(words, key=len), max(words))
t = (1, 2, 3); x, y, z = t
print(t[0], t[-1], t + (4,), t * 2, (5,), (), len(t), t.index(2), 2 in t)
try:
    t[0] = 9
except TypeError as e:
    print("TypeError:", e)
d = {"a": 1, "b": 2}
d["c"] = 3; d.update(e=4); del d["a"]
print(d, d.get("zz"), d.get("zz", 0), list(d.keys()), list(d.values()), list(d.items()), "b" in d, len(d))
print(d.pop("b"), d.setdefault("f", 10), d.setdefault("c", 0), d, d.popitem(), d)
for k, v in {"x": 1, "y": 2}.items():
    print(k, v, end=" | ")
print()
try:
    d["nope"]
except KeyError as e:
    print("KeyError", e)
print({1: "a", True: "b", 1.0: "c"}, {(1, 2): "t"}, dict(a=1, b=2), dict([("k", "v")]), {**d, "new": 1})
s = {3, 1, 2}; s.add(2); s.add(10); s.discard(99)
print(s, len(s), 1 in s, s | {7}, s & {1, 10}, s - {1}, s ^ {1, 100}, {1, 2} <= {1, 2, 3}, set())
print(sorted({"b", "a", "c"}), {8, 1}, {16, 2, 1, 32}, frozenset([2, 1]))
try:
    {[1, 2]}
except TypeError as e:
    print("TypeError:", e)
from collections import deque, Counter, defaultdict, namedtuple, OrderedDict
q = deque([1, 2]); q.append(3); q.appendleft(0)
print(q, q.popleft(), q.pop(), q, len(q), deque("ab", maxlen=2))
cnt = Counter("mississippi")
print(cnt, cnt.most_common(2), cnt["s"], cnt["z"], sorted(cnt), sum(cnt.values()))
dd = defaultdict(list)
for w in ["apple", "avocado", "banana"]:
    dd[w[0]].append(w)
print(dd, dict(dd), dd["zz"], len(dd))
Point = namedtuple("Point", "x y")
p = Point(1, y=2)
print(p, p.x, p[1], p._asdict(), p._replace(x=5), isinstance(p, tuple))
import heapq
h = []
for v in [5, 1, 8, 3]:
    heapq.heappush(h, v)
print(h, heapq.heappop(h), h, heapq.nlargest(2, [4, 9, 1]), heapq.nsmallest(2, [4, 9, 1]))
hh = [9, 4, 7, 1]; heapq.heapify(hh); print(hh)
import itertools
print(list(itertools.chain([1], (2, 3))), list(itertools.product("ab", [0, 1])), list(itertools.permutations([1, 2, 3], 2)))
print(list(itertools.combinations("abc", 2)), list(itertools.islice(itertools.count(5), 3)), list(itertools.accumulate([1, 2, 3])))
print([(k, list(g)) for k, g in itertools.groupby("aabbbc")], list(itertools.zip_longest([1, 2], "a", fillvalue="-")))
import functools
print(functools.reduce(lambda a, b: a * b, [1, 2, 3, 4]), functools.reduce(lambda a, b: a + b, [], 0))
@functools.lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)
print(fib(60), fib.cache_info().hits > 0)
print(list(map(str, [1, 2])), list(filter(None, [0, 1, "", "a"])), list(zip(*[(1, "a"), (2, "b")])), list(reversed([1, 2, 3])), list(enumerate("ab")))
print(any([0, 0, 1]), all([]), all([1, 0]), sum(x * x for x in range(4)), [*"ab", *[1]], {**{"a": 1}})
nested = [[0] * 3] * 2; nested[0][0] = 1
print(nested, [[0] * 3 for _ in range(2)])
import copy
orig = [[1, 2], [3]]
sh = copy.copy(orig); dp = copy.deepcopy(orig)
orig[0].append(99)
print(sh, dp, sh[0] is orig[0], dp[0] is orig[0])
m = [[1, 2, 3], [4, 5, 6]]
print([row[1] for row in m], list(zip(*m)), [[r[i] for r in m] for i in range(3)], [v for row in m for v in row])
print("-".join(["a", "b"]), ",".join(str(i) for i in range(3)), " ".join("abc"))
print(list(range(5))[1:-1], "hello"[1:-1], (1, 2, 3)[::2], [1, 2, 3][5:], [1, 2, 3][-10:2])
lst = [1, 2, 3, 4, 5]; lst[1:3] = ["a"]; print(lst); del lst[0]; print(lst); lst[::2] = [0, 0]; print(lst)
a1 = [1]; b1 = a1; a1 += [2]; print(a1, b1, a1 is b1)
a2 = (1,); b2 = a2; a2 += (2,); print(a2, b2, a2 is b2)
a3 = "x"; b3 = a3; a3 += "y"; print(a3, b3)
print(sorted([(2, "b"), (1, "z"), (2, "a")]), sorted(["b1", "a2"], key=lambda s: s[1]))
