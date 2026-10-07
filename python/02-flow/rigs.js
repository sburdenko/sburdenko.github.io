/** PY-02 rigs: conditions, loops, functions, scope, recursion, closures. */
import { lit } from '../shared/py-code.js?v=202610071658';
import { randInt, pick, randInts } from '../../algorithms/patterns/rig-kit.js?v=202610071658';

const num = (key, extra = {}) => ({ key, type: 'int', min: -999, max: 999, ...extra });
const CALLSTACK = { kind: 'callstack', label: 'call stack' };

export const RIGS = [
  {
    id: 'ifelse',
    fields: [num('hp', { min: 0, max: 100 }), num('potions', { min: 0, max: 9 })],
    example: { hp: 35, potions: 2 },
    random: next => ({ hp: pick(next, [0, 10, 35, 60, 100]), potions: randInt(next, 0, 3) }),
    code: p => `hp = ${p.hp}
potions = ${p.potions}
if hp == 0:
    print("game over")
elif hp < 50 and potions > 0:
    potions -= 1
    hp += 30
    print("drank a potion, hp is", hp)
elif hp < 50:
    print("low hp and no potions, run!")
else:
    print("all good, keep exploring")
print("potions left:", potions)
`,
  },
  {
    id: 'indent',
    fields: [num('score', { min: 0, max: 100 })],
    example: { score: 40 },
    random: next => ({ score: pick(next, [0, 40, 80]) }),
    code: p => `score = ${p.score}
if score > 50:
    print("over fifty")
    if score > 75:
        print("really high")
    print("still inside the first if")
print("this line always runs")
if score > 50:
    print("A")
print("B")
`,
  },
  {
    id: 'whileloop',
    fields: [num('fuel', { min: 1, max: 12 })],
    example: { fuel: 5 },
    random: next => ({ fuel: randInt(next, 2, 9) }),
    code: p => `fuel = ${p.fuel}
distance = 0
while fuel > 0:
    fuel -= 1
    distance += 10
    if distance == 30:
        print("pit stop!")
        break
print("fuel", fuel, "distance", distance)
`,
  },
  {
    id: 'guess',
    fields: [{ key: 'guesses', type: 'lines', minLen: 1, maxLen: 6 }],
    example: { guesses: ['50', '25', '37', '42'] },
    random: next => { const target = 42; const g = []; let lo = 1, hi = 100; for (let i = 0; i < 4; i++) { const mid = Math.floor((lo + hi) / 2); g.push(String(mid)); if (mid === target) break; if (mid < target) lo = mid + 1; else hi = mid - 1; } void next; return { guesses: g }; },
    stdin: 'guesses',
    code: `secret = 42
tries = 0
while True:
    guess = int(input("Your guess? "))
    tries += 1
    if guess < secret:
        print("higher")
    elif guess > secret:
        print("lower")
    else:
        print("got it in", tries, "tries")
        break
`,
  },
  {
    id: 'rangelab',
    fields: [num('start', { min: -20, max: 20 }), num('stop', { min: -20, max: 30 }), num('step', { min: -5, max: 5 })],
    example: { start: 2, stop: 11, step: 3 },
    random: next => ({ start: randInt(next, -3, 5), stop: randInt(next, 5, 15), step: pick(next, [1, 2, 3, -1, -2]) }),
    check: p => (p.step === 0 ? ['in.err.range', -5, 5] : null),
    code: p => `r = range(${p.start}, ${p.stop}, ${p.step})
print(list(r))
print(len(r))
for n in r:
    print(n, end=" ")
print()
print(list(range(4)))
print(list(range(1, 5)))
`,
  },
  {
    id: 'forlist',
    fields: [{ key: 'songs', type: 'wordsAny', minLen: 1, maxLen: 6, maxWord: 10 }],
    example: { songs: ['Nebula', 'Orbit', 'Comet'] },
    random: next => ({ songs: ['Nebula', 'Orbit', 'Comet', 'Pulsar', 'Quasar', 'Aurora'].filter(() => next() > 0.4) }),
    code: p => `playlist = ${lit(p.songs)}
total = 0
for song in playlist:
    total += len(song)
    print(song, "has", len(song), "letters")
print("total letters:", total)
for i, song in enumerate(playlist, start=1):
    print(i, song)
`,
  },
  {
    id: 'enumzip',
    code: `names = ["Luna", "Nova", "Kira"]
scores = [12, 9, 15]
for name, score in zip(names, scores):
    print(name, "→", score)
for i, (name, score) in enumerate(zip(names, scores)):
    print(i, name, score)
best = max(zip(scores, names))
print(best)
`,
  },
  {
    id: 'nested',
    fields: [num('size', { min: 1, max: 5 })],
    example: { size: 3 },
    random: next => ({ size: randInt(next, 2, 4) }),
    code: p => `size = ${p.size}
for row in range(1, size + 1):
    line = ""
    for col in range(1, size + 1):
        line += str(row * col).rjust(3)
    print(line)
`,
  },
  {
    id: 'forelse',
    fields: [{ key: 'inventory', type: 'wordsAny', minLen: 1, maxLen: 6, maxWord: 8 }, { key: 'wanted', type: 'text', maxLen: 8 }],
    example: { inventory: ['rope', 'torch', 'map'], wanted: 'key' },
    random: next => ({ inventory: ['rope', 'torch', 'map', 'key', 'coin'].filter(() => next() > 0.4), wanted: pick(next, ['key', 'torch', 'gem']) }),
    code: p => `inventory = ${lit(p.inventory)}
wanted = ${lit(p.wanted)}
for item in inventory:
    if item == wanted:
        print("found", wanted)
        break
    print("not", item)
else:
    print("no", wanted, "in the bag")
`,
  },
  {
    id: 'funcframe',
    fields: [num('w', { min: 1, max: 50 }), num('h', { min: 1, max: 50 })],
    example: { w: 4, h: 3 },
    random: next => ({ w: randInt(next, 2, 9), h: randInt(next, 2, 9) }),
    code: p => `def area(width, height):
    result = width * height
    return result

w = ${p.w}
h = ${p.h}
room = area(w, h)
print("room:", room)
print(area(2, 2) + area(1, 1))
`,
  },
  {
    id: 'stackdepth',
    view: CALLSTACK, showMemory: true,
    code: `def greet(name):
    return "hi " + shout(name)

def shout(text):
    loud = text.upper()
    return loud + "!"

message = greet("Varvara")
print(message)
`,
  },
  {
    id: 'args',
    code: `def craft(item, count=1, *extras, color="red", **tags):
    print(item, count, extras, color, tags)

craft("sword")
craft("arrow", 20)
craft("arrow", 20, "feather", "flint")
craft("shield", color="blue")
craft(count=3, item="gem")
craft("bow", 1, "string", color="green", rare=True, level=5)
`,
  },
  {
    id: 'mutdefault',
    code: `def add_item(item, bag=[]):
    bag.append(item)
    return bag

print(add_item("sword"))
print(add_item("shield"))
print(add_item("arrow", []))

def add_item_safe(item, bag=None):
    if bag is None:
        bag = []
    bag.append(item)
    return bag

print(add_item_safe("sword"))
print(add_item_safe("shield"))
`,
  },
  {
    id: 'legb',
    code: `level = "global"

def outer():
    level = "enclosing"
    def inner():
        level = "local"
        print("inner sees:", level)
    inner()
    print("outer sees:", level)

outer()
print("module sees:", level)
print(len)
`,
  },
  {
    id: 'globalkw',
    code: `coins = 0

def earn(n):
    global coins
    coins += n

def make_counter():
    count = 0
    def tick():
        nonlocal count
        count += 1
        return count
    return tick

earn(5)
earn(3)
print("coins:", coins)
tick = make_counter()
print(tick(), tick(), tick())
`,
  },
  {
    id: 'unbound',
    code: `lives = 3

def lose_life():
    print("lives before:", lives)
    lives = lives - 1
    print("lives after:", lives)

lose_life()
`,
  },
  {
    id: 'factorial',
    fields: [num('n', { min: 0, max: 7 })],
    example: { n: 4 },
    random: next => ({ n: randInt(next, 2, 6) }),
    view: { ...CALLSTACK, hide: [] }, showMemory: false,
    code: p => `def factorial(n):
    if n <= 1:
        return 1
    smaller = factorial(n - 1)
    return n * smaller

print(factorial(${p.n}))
`,
  },
  {
    id: 'fibtree',
    fields: [num('n', { min: 1, max: 6 })],
    example: { n: 4 },
    random: next => ({ n: randInt(next, 3, 5) }),
    view: CALLSTACK, showMemory: false, maxSteps: 600,
    code: p => `calls = 0

def fib(n):
    global calls
    calls += 1
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print(fib(${p.n}))
print("calls:", calls)
`,
  },
  {
    id: 'norecbase',
    view: CALLSTACK, showMemory: false, recursionLimit: 14, maxSteps: 300,
    code: `import sys
sys.setrecursionlimit(14)

def countdown(n):
    print(n)
    countdown(n - 1)

countdown(3)
`,
  },
  {
    id: 'closure',
    code: `def make_greeter(greeting):
    def greet(name):
        return greeting + ", " + name + "!"
    return greet

hello = make_greeter("Hello")
privet = make_greeter("Privet")
print(hello("Varvara"))
print(privet("Luna"))
print(hello.__closure__ is not None)
`,
  },
  {
    id: 'lambdaloop',
    code: `multipliers = []
for i in range(3):
    multipliers.append(lambda x: x * i)
print([m(10) for m in multipliers])

fixed = []
for i in range(3):
    fixed.append(lambda x, i=i: x * i)
print([m(10) for m in fixed])
`,
  },
  {
    id: 'lambdasort',
    fields: [{ key: 'scores', type: 'ints', minLen: 2, maxLen: 6, min: 0, max: 99 }],
    example: { scores: [42, 7, 19, 88] },
    random: next => ({ scores: randInts(next, randInt(next, 3, 6), 0, 99) }),
    code: p => `players = ["Luna", "Nova", "Kira", "Pixel", "Mia", "Zed"]
scores = ${lit(p.scores)}
pairs = list(zip(players, scores))
print(pairs)
by_score = sorted(pairs, key=lambda pair: pair[1], reverse=True)
print(by_score)
square = lambda x: x * x
print(square(7), (lambda a, b: a + b)(2, 3))
`,
  },
];
