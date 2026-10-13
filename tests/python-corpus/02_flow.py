total = 0
for i in range(1, 11):
    if i % 2 == 0:
        continue
    if i > 7:
        break
    total += i
else:
    print("never")
print(total)
n = 5
while n > 0:
    n -= 1
    if n == 2: break
else:
    print("no break")
for i, ch in enumerate("abc", start=1):
    print(i, ch, end=" ")
print()
for a, b in zip([1, 2, 3], "xyz"):
    print(a, b, sep="-", end=";")
print()
print(list(range(10, 0, -3)), list(range(3)), len(range(0, 100, 7)), 5 in range(0, 10, 5), range(3) == range(0, 3))
def f(a, b=2, *args, k=3, **kw):
    return a, b, args, k, kw
print(f(1), f(1, 5, 6, 7, k=9, z=1), f(*[1, 2], **{"k": 0}))
def g(x=[]):
    x.append(1)
    return x
print(g(), g(), g([9]))
def outer():
    count = 0
    def inner():
        nonlocal count
        count += 1
        return count
    return inner
c = outer()
print(c(), c(), c())
adders = [lambda x: x + i for i in range(3)]
print([a(10) for a in adders])
def fact(n):
    return 1 if n <= 1 else n * fact(n - 1)
print(fact(20))
try:
    def bad():
        return bad()
    import sys
    sys.setrecursionlimit(50)
    bad()
except RecursionError as e:
    print("RecursionError", str(e)[:35])
x = 10
def h():
    print(x)
h()
def k():
    try:
        print(x)
        x = 1
    except UnboundLocalError as e:
        print(type(e).__name__)
k()
print((lambda a, b=1: a + b)(2), [i * j for i in range(3) for j in range(3) if i != j])
print({x: x * x for x in range(4)}, {c for c in "hello"} == set("hello"), sorted({c for c in "hello"}))
sq = (i * i for i in range(5))
print(next(sq), next(sq), list(sq))
def gen():
    yield 1
    x = yield 2
    print("got", x)
    yield 3
g = gen()
print(next(g), next(g), g.send("hi"), list(g))
def countdown(n):
    while n > 0:
        yield n
        n -= 1
print(list(countdown(4)), sum(countdown(3)))
def chain2():
    yield from range(2)
    yield from "ab"
print(list(chain2()))
a, *b, c = 1, 2, 3, 4, 5
print(a, b, c)
(p, q), r = (1, 2), 3
print(p, q, r)
print(10 if 3 > 2 else 20, [x if x > 2 else -x for x in range(5)])
match [1, 2, 3]:
    case [1, *rest]:
        print("rest", rest)
cmd = {"go": "north", "speed": 3}
match cmd:
    case {"go": direction, **other}:
        print(direction, other)
def area(shape):
    match shape:
        case ("circle", r): return 3 * r * r
        case ("rect", w, h) if w == h: return "square", w * h
        case ("rect", w, h): return w * h
        case _: return None
print(area(("circle", 2)), area(("rect", 2, 2)), area(("rect", 2, 3)), area("x"))
i = 0
while (i := i + 1) < 3:
    print("walrus", i)
