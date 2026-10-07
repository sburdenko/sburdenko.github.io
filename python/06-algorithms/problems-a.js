/** PY-06 problems 1–19: first steps, numbers, search, sorting. Each problem carries its rig. */
import { lit } from '../shared/py-code.js?v=202610071708';
import { randInt, pick, randInts, distinctInts, shuffle } from '../../algorithms/patterns/rig-kit.js?v=202610071708';
import { tuplesOf } from '../shared/struct-views.js?v=202610071708';

const num = (key, extra = {}) => ({ key, type: 'int', min: 0, max: 999, ...extra });
const ints = (key, extra = {}) => ({ key, type: 'ints', minLen: 1, maxLen: 10, min: 0, max: 99, ...extra });
const text = (key, extra = {}) => ({ key, type: 'text', maxLen: 20, ...extra });
const CALLSTACK = { kind: 'callstack', label: 'call stack' };
const P = (id, num_, ch, diff, must, after, rig) => ({ id, num: num_, ch, diff, must, after, rig: { id, problem: id, ...rig } });

export const PROBLEMS_A = [
  /* ---------- 01 first steps ---------- */
  P('fizzbuzz', 1, '01', 'Easy', true, '02', {
    fields: [num('upto', { min: 1, max: 30 })],
    example: { upto: 15 },
    random: next => ({ upto: randInt(next, 5, 20) }),
    code: p => `for n in range(1, ${p.upto} + 1):
    if n % 15 == 0:
        print("FizzBuzz")
    elif n % 3 == 0:
        print("Fizz")
    elif n % 5 == 0:
        print("Buzz")
    else:
        print(n)
`,
  }),
  P('digitsum', 2, '01', 'Easy', false, '02', {
    fields: [num('n', { min: 0, max: 999999 })],
    example: { n: 2026 },
    random: next => ({ n: randInt(next, 10, 99999) }),
    view: { kind: 'string', of: 's', counters: ['total'] },
    code: p => `n = ${p.n}
s = str(n)
total = 0
for digit in s:
    total += int(digit)
print(total)

m = ${p.n}
total2 = 0
while m > 0:
    total2 += m % 10
    m //= 10
print(total2)
`,
  }),
  P('reverse', 3, '01', 'Easy', true, '02', {
    fields: [text('word', { minLen: 1, maxLen: 12 })],
    example: { word: 'stressed' },
    random: next => ({ word: pick(next, ['stressed', 'drawer', 'rocket', 'Varvara', 'nebula']) }),
    view: { kind: 'multi', views: [{ kind: 'string', of: 'word', title: 'word' }, { kind: 'string', of: 'out', title: 'out' }] },
    code: p => `word = ${lit(p.word)}
out = ""
for ch in word:
    out = ch + out
print(out)
print(word[::-1])
print("".join(reversed(word)))
`,
  }),
  P('palindrome', 4, '01', 'Easy', true, '02', {
    fields: [text('phrase', { minLen: 1, maxLen: 24 })],
    example: { phrase: 'A man, a plan: Panama' },
    random: next => ({ phrase: pick(next, ['A man, a plan: Panama', 'never odd or even', 'Varvara', 'Was it a cat I saw', 'hello']) }),
    view: { kind: 'string', of: 's', pointers: ['i', { name: 'j', cls: 'p2' }] },
    code: p => `phrase = ${lit(p.phrase)}
s = ""
for ch in phrase:
    if ch.isalnum():
        s += ch.lower()
i = 0
j = len(s) - 1
while i < j:
    if s[i] != s[j]:
        print("not a palindrome")
        break
    i += 1
    j -= 1
else:
    print("palindrome!")
`,
  }),
  P('maxof', 5, '01', 'Easy', false, '02', {
    fields: [ints('nums', { minLen: 1, maxLen: 10 })],
    example: { nums: [12, 7, 31, 4, 25] },
    random: next => ({ nums: randInts(next, randInt(next, 4, 8), 1, 60) }),
    view: { kind: 'bars', of: 'nums', pointers: ['i'], counters: ['best'] },
    code: p => `nums = ${lit(p.nums)}
best = nums[0]
for i in range(1, len(nums)):
    if nums[i] > best:
        best = nums[i]
print(best)
print(max(nums))
`,
  }),

  /* ---------- 02 numbers ---------- */
  P('isprime', 6, '02', 'Easy', true, '02', {
    fields: [num('n', { min: 2, max: 400 })],
    example: { n: 91 },
    random: next => ({ n: pick(next, [37, 51, 91, 97, 121, 131, 143, 169, 173]) }),
    code: p => `n = ${p.n}
is_prime = True
d = 2
while d * d <= n:
    if n % d == 0:
        is_prime = False
        print(n, "=", d, "*", n // d)
        break
    d += 1
if is_prime:
    print(n, "is prime")
`,
  }),
  P('sieve', 7, '02', 'Medium', true, '02', {
    fields: [num('n', { min: 5, max: 30 })],
    example: { n: 20 },
    random: next => ({ n: randInt(next, 12, 26) }),
    view: { kind: 'cells', of: 'is_prime', pointers: ['i', { name: 'j', cls: 'p2' }], touchedCls: { write: 'bad' }, marks: (mem, event, values) => Object.fromEntries(values.map((v, i) => [i, v === 'True' ? 'win' : 'seen'])) },
    maxSteps: 600,
    code: p => `n = ${p.n}
is_prime = [True] * (n + 1)
is_prime[0] = False
is_prime[1] = False
i = 2
while i * i <= n:
    if is_prime[i]:
        for j in range(i * i, n + 1, i):
            is_prime[j] = False
    i += 1
primes = [k for k in range(n + 1) if is_prime[k]]
print(primes)
`,
  }),
  P('gcd', 8, '02', 'Easy', true, '02', {
    fields: [num('a', { min: 1, max: 200 }), num('b', { min: 1, max: 200 })],
    example: { a: 48, b: 18 },
    random: next => { const g = randInt(next, 2, 12); return { a: g * randInt(next, 2, 12), b: g * randInt(next, 2, 12) }; },
    view: { kind: 'numbers', of: ['a', 'b'] },
    code: p => `a = ${p.a}
b = ${p.b}
while b != 0:
    a, b = b, a % b
print("gcd:", a)

import math
print(math.gcd(${p.a}, ${p.b}))
`,
  }),
  P('binary', 9, '02', 'Easy', false, '02', {
    fields: [num('n', { min: 0, max: 255 })],
    example: { n: 37 },
    random: next => ({ n: randInt(next, 5, 200) }),
    view: { kind: 'string', of: 'bits', counters: ['n'] },
    code: p => `n = ${p.n}
bits = ""
while n > 0:
    bits = str(n % 2) + bits
    n = n // 2
print(bits or "0")
print(bin(${p.n}))
print(int(bits or "0", 2))
`,
  }),
  P('fib', 10, '02', 'Medium', true, '02', {
    fields: [num('n', { min: 1, max: 7 })],
    example: { n: 5 },
    random: next => ({ n: randInt(next, 3, 6) }),
    view: CALLSTACK, showMemory: true, maxSteps: 700,
    code: p => `def fib_rec(n):
    if n < 2:
        return n
    return fib_rec(n - 1) + fib_rec(n - 2)

def fib_loop(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

from functools import lru_cache

@lru_cache(maxsize=None)
def fib_cached(n):
    if n < 2:
        return n
    return fib_cached(n - 1) + fib_cached(n - 2)

print(fib_rec(${p.n}))
print(fib_loop(${p.n}))
print(fib_cached(${p.n}))
`,
  }),

  /* ---------- 03 search ---------- */
  P('linear', 11, '03', 'Easy', false, '02', {
    fields: [ints('items', { minLen: 1, maxLen: 10 }), num('target', { min: 0, max: 99 })],
    example: { items: [14, 3, 27, 8, 19, 42], target: 19 },
    random: next => { const items = randInts(next, randInt(next, 5, 9), 1, 50); return { items, target: next() > 0.3 ? pick(next, items) : 77 }; },
    view: { kind: 'cells', of: 'items', pointers: ['i'], counters: ['steps'] },
    code: p => `items = ${lit(p.items)}
target = ${p.target}
steps = 0
found = -1
for i in range(len(items)):
    steps += 1
    if items[i] == target:
        found = i
        break
print("index:", found, "after", steps, "looks")
`,
  }),
  P('bsearch', 12, '03', 'Medium', true, '02', {
    fields: [ints('items', { minLen: 1, maxLen: 12, sorted: true, distinct: true }), num('target', { min: 0, max: 99 })],
    example: { items: [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], target: 23 },
    random: next => { const items = distinctInts(next, randInt(next, 6, 11), 1, 60).sort((a, b) => a - b); return { items, target: next() > 0.3 ? pick(next, items) : 33 }; },
    view: { kind: 'cells', of: 'items', pointers: ['lo', { name: 'mid', cls: 'p2' }, { name: 'hi', cls: 'p3' }], ranges: [{ from: 'lo', to: 'hi', cls: 'win' }], counters: ['steps'] },
    code: p => `items = ${lit(p.items)}
target = ${p.target}
lo = 0
hi = len(items) - 1
steps = 0
while lo <= hi:
    mid = (lo + hi) // 2
    steps += 1
    if items[mid] == target:
        print("found at", mid, "in", steps, "steps")
        break
    if items[mid] < target:
        lo = mid + 1
    else:
        hi = mid - 1
else:
    print("not found after", steps, "steps")
`,
  }),
  P('guessgame', 13, '03', 'Easy', false, '02', {
    fields: [num('secret', { min: 1, max: 100 })],
    example: { secret: 42 },
    random: next => ({ secret: randInt(next, 1, 100) }),
    view: { kind: 'numbers', of: ['lo', 'guess', 'hi'] },
    code: p => `secret = ${p.secret}
lo = 1
hi = 100
tries = 0
while True:
    guess = (lo + hi) // 2
    tries += 1
    if guess == secret:
        print("got", secret, "in", tries, "tries")
        break
    if guess < secret:
        print(guess, "is too low")
        lo = guess + 1
    else:
        print(guess, "is too high")
        hi = guess - 1
`,
  }),

  /* ---------- 04 sorting ---------- */
  P('bubble', 14, '04', 'Easy', true, '02', {
    fields: [ints('a', { minLen: 2, maxLen: 8 })],
    example: { a: [5, 3, 8, 4, 2] },
    random: next => ({ a: randInts(next, randInt(next, 5, 7), 1, 40) }),
    view: { kind: 'bars', of: 'a', pointers: ['j', { name: 'k', cls: 'p2' }], counters: ['swaps'], done: mem => { const f = n => { for (let i = mem.frames.length - 1; i >= 0; i--) { const h = mem.frames[i].vars.find(([k]) => k === n); if (h) return Number(mem.objects[h[1]].value); } return null; }; const n = f('n'), i = f('i'); const s = new Set(); if (n !== null && i !== null) for (let x = n - i; x < n; x++) s.add(x); return s; } },
    maxSteps: 700,
    code: p => `a = ${lit(p.a)}
n = len(a)
swaps = 0
for i in range(n - 1):
    swapped = False
    for j in range(n - 1 - i):
        k = j + 1
        if a[j] > a[k]:
            a[j], a[k] = a[k], a[j]
            swaps += 1
            swapped = True
    if not swapped:
        break
print(a, "swaps:", swaps)
`,
  }),
  P('selection', 15, '04', 'Easy', false, '02', {
    fields: [ints('a', { minLen: 2, maxLen: 8 })],
    example: { a: [29, 10, 14, 37, 13] },
    random: next => ({ a: randInts(next, randInt(next, 5, 7), 1, 40) }),
    view: { kind: 'bars', of: 'a', pointers: ['i', { name: 'j', cls: 'p2' }, { name: 'm', cls: 'p3' }], done: mem => { const h = mem.frames[0].vars.find(([k]) => k === 'i'); const i = h ? Number(mem.objects[h[1]].value) : null; const s = new Set(); if (i !== null) for (let x = 0; x < i; x++) s.add(x); return s; } },
    maxSteps: 700,
    code: p => `a = ${lit(p.a)}
n = len(a)
for i in range(n - 1):
    m = i
    for j in range(i + 1, n):
        if a[j] < a[m]:
            m = j
    a[i], a[m] = a[m], a[i]
print(a)
`,
  }),
  P('insertion', 16, '04', 'Easy', true, '02', {
    fields: [ints('a', { minLen: 2, maxLen: 8 })],
    example: { a: [12, 11, 13, 5, 6] },
    random: next => ({ a: randInts(next, randInt(next, 5, 7), 1, 40) }),
    view: { kind: 'bars', of: 'a', pointers: ['i', { name: 'j', cls: 'p2' }], counters: ['key'], done: mem => { const h = mem.frames[0].vars.find(([k]) => k === 'i'); const i = h ? Number(mem.objects[h[1]].value) : null; const s = new Set(); if (i !== null) for (let x = 0; x < i; x++) s.add(x); return s; } },
    maxSteps: 700,
    code: p => `a = ${lit(p.a)}
for i in range(1, len(a)):
    key = a[i]
    j = i - 1
    while j >= 0 and a[j] > key:
        a[j + 1] = a[j]
        j -= 1
    a[j + 1] = key
print(a)
`,
  }),
  P('mergesort', 17, '04', 'Medium', true, '02', {
    fields: [ints('a', { minLen: 2, maxLen: 8 })],
    example: { a: [38, 27, 43, 3, 9, 82, 10] },
    random: next => ({ a: randInts(next, randInt(next, 5, 7), 1, 60) }),
    view: { kind: 'multi', views: [{ kind: 'bars', of: 'left', title: 'left' }, { kind: 'bars', of: 'right', title: 'right' }, { kind: 'bars', of: 'out', title: 'out' }, { ...CALLSTACK, title: 'calls', hide: ['left', 'right', 'out', 'i', 'j', 'mid'] }] },
    maxSteps: 900,
    code: p => `def merge_sort(a):
    if len(a) <= 1:
        return a
    mid = len(a) // 2
    left = merge_sort(a[:mid])
    right = merge_sort(a[mid:])
    out = []
    i = 0
    j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:
            out.append(left[i])
            i += 1
        else:
            out.append(right[j])
            j += 1
    out.extend(left[i:])
    out.extend(right[j:])
    return out

print(merge_sort(${lit(p.a)}))
`,
  }),
  P('quicksort', 18, '04', 'Medium', true, '02', {
    fields: [ints('a', { minLen: 2, maxLen: 8 })],
    example: { a: [33, 10, 55, 71, 29, 3, 42] },
    random: next => ({ a: randInts(next, randInt(next, 5, 7), 1, 80) }),
    view: { kind: 'bars', of: 'a', pointers: ['lo', { name: 'i', cls: 'p2' }, { name: 'j', cls: 'p3' }, 'hi'], ranges: [{ from: 'lo', to: 'hi', cls: 'win' }], counters: ['pivot'] },
    showMemory: false, maxSteps: 900,
    code: p => `def quicksort(a, lo, hi):
    if lo >= hi:
        return
    pivot = a[hi]
    i = lo
    for j in range(lo, hi):
        if a[j] < pivot:
            a[i], a[j] = a[j], a[i]
            i += 1
    a[i], a[hi] = a[hi], a[i]
    quicksort(a, lo, i - 1)
    quicksort(a, i + 1, hi)

a = ${lit(p.a)}
quicksort(a, 0, len(a) - 1)
print(a)
`,
  }),
  P('counting', 19, '04', 'Easy', false, '02', {
    fields: [ints('a', { minLen: 2, maxLen: 10, min: 0, max: 9 })],
    example: { a: [4, 2, 2, 8, 3, 3, 1] },
    random: next => ({ a: randInts(next, randInt(next, 6, 9), 0, 9) }),
    view: { kind: 'multi', views: [{ kind: 'cells', of: 'a', title: 'a' }, { kind: 'bars', of: 'count', title: 'count[value]' }, { kind: 'cells', of: 'out', title: 'out' }] },
    maxSteps: 600,
    code: p => `a = ${lit(p.a)}
count = [0] * (max(a) + 1)
for x in a:
    count[x] += 1
out = []
for value in range(len(count)):
    for _ in range(count[value]):
        out.append(value)
print(out)
`,
  }),
];

export { tuplesOf };
