/** PY-01 rigs: every rig is real Python that the stand executes; editable fields are spliced in as literals. */
import { lit } from '../shared/py-code.js?v=202610071658';
import { randInt, pick } from '../../algorithms/patterns/rig-kit.js?v=202610071658';

const text = (key, extra = {}) => ({ key, type: 'text', maxLen: 24, ...extra });
const num = (key, extra = {}) => ({ key, type: 'int', min: -999999, max: 999999, ...extra });
const NAMES = ['Varvara', 'Luna', 'Nova', 'Pixel', 'Mia', 'Kira'];

export const RIGS = [
  {
    id: 'hello',
    fields: [text('name'), num('times', { min: 1, max: 5 })],
    example: { name: 'Varvara', times: 3 },
    random: next => ({ name: pick(next, NAMES), times: randInt(next, 1, 5) }),
    code: p => `print("Hello, ${p.name}!")
print("Hello", "again", sep=" · ")
print("line without", end=" ")
print("a break")
print("${p.name} " * ${p.times})
print()
print(2 + 3, "is five?", 2 + 3 == 5)
`,
  },
  {
    id: 'names',
    fields: [num('a', { min: -1000, max: 1000 }), num('b', { min: -1000, max: 1000 })],
    example: { a: 5, b: 6 },
    random: next => ({ a: randInt(next, -20, 300), b: randInt(next, -20, 300) }),
    code: p => `a = ${lit(p.a)}
b = a
a = ${lit(p.b)}
print(a, b)
print(a is b, a == b)
`,
  },
  {
    id: 'isvs',
    code: `small = 7
also_small = 7
big = 1000
also_big = int("1000")
print(small is also_small)
print(big is also_big)
print(big == also_big)
word = "space"
same = "space"
print(word is same, word == same)
`,
  },
  {
    id: 'bigint',
    fields: [num('power', { min: 1, max: 400 })],
    example: { power: 100 },
    random: next => ({ power: randInt(next, 20, 300) }),
    code: p => `x = 2 ** ${p.power}
print(x)
print(len(str(x)), "digits")
print(type(x))
score = 10
score = score + 1
score += 5
print(score)
print(7 / 2, 7 // 2, 7 % 2)
print(-7 // 2, -7 % 2)
print(divmod(17, 5))
`,
  },
  {
    id: 'floats',
    code: `a = 0.1 + 0.2
print(a)
print(a == 0.3)
print(round(a, 2) == 0.3)
import math
print(math.isclose(a, 0.3))
print(1 / 3)
print(10 / 2, type(10 / 2))
print(2 ** 0.5)
print(round(2.5), round(3.5), round(2.675, 2))
`,
  },
  {
    id: 'strindex',
    fields: [text('word', { minLen: 2, maxLen: 12 })],
    example: { word: 'galaxy' },
    random: next => ({ word: pick(next, ['galaxy', 'planet', 'guitar', 'pixel', 'melody', 'Varvara', 'rocket']) }),
    code: p => `word = ${lit(p.word)}
print(len(word))
print(word[0], word[1], word[-1])
print(word[1:4])
print(word[:3], word[3:])
print(word[::-1])
print(word[::2])
print(word.upper(), word.title())
print(word * 2)
print("a" in word, "z" in word)
`,
  },
  {
    id: 'slices',
    fields: [text('s', { minLen: 4, maxLen: 12 }), num('start', { min: -12, max: 12 }), num('stop', { min: -12, max: 12 }), num('step', { min: -4, max: 4 })],
    example: { s: 'melodies', start: 1, stop: 7, step: 2 },
    random: next => ({ s: pick(next, ['melodies', 'asteroid', 'keyboard', 'treasure', 'spaceship']), start: randInt(next, -3, 3), stop: randInt(next, 3, 9), step: pick(next, [1, 2, 3, -1, -2]) }),
    check: p => (p.step === 0 ? ['in.err.range', -4, 4] : null),
    view: { kind: 'string', of: 's', negIndex: true, marks: (mem, event, values) => { const o = { start: null, stop: null, step: null }; for (const k of Object.keys(o)) { const f = mem.frames[0].vars.find(([n]) => n === k); o[k] = f ? Number(mem.objects[f[1]].value) : null; } if (o.step === null) return {}; const n = values.length; const norm = v => (v < 0 ? v + n : v); const marks = {}; const lo = o.start === null ? (o.step > 0 ? 0 : n - 1) : Math.max(o.step > 0 ? 0 : -1, Math.min(o.step > 0 ? n : n - 1, norm(o.start))); const hi = o.stop === null ? (o.step > 0 ? n : -1) : Math.max(o.step > 0 ? 0 : -1, Math.min(o.step > 0 ? n : n - 1, norm(o.stop))); if (o.step > 0) for (let i = lo; i < hi; i += o.step) marks[i] = 'ok'; else for (let i = lo; i > hi; i += o.step) marks[i] = 'ok'; return marks; } },
    code: p => `s = ${lit(p.s)}
start = ${p.start}
stop = ${p.stop}
step = ${p.step}
piece = s[start:stop:step]
print(piece)
print(s[start:stop])
print(s[:stop])
print(s[start:])
`,
  },
  {
    id: 'strimm',
    code: `name = "varvara"
name[0] = "V"
`,
  },
  {
    id: 'strnew',
    code: `name = "varvara"
fixed = "V" + name[1:]
print(fixed)
print(name)
name = fixed.upper()
print(name)
`,
  },
  {
    id: 'types',
    code: `things = [42, 3.5, "42", True, None, [1, 2], (1, 2)]
for thing in things:
    print(repr(thing), type(thing).__name__)
print(type(42) is int, isinstance(True, int))
`,
  },
  {
    id: 'convert',
    fields: [text('a', { maxLen: 6 }), num('b', { min: -99, max: 99 })],
    example: { a: '12', b: 3 },
    random: next => ({ a: String(randInt(next, 1, 50)), b: randInt(next, 1, 9) }),
    code: p => `a = ${lit(p.a)}
b = ${p.b}
print(int(a) + b)
print(a + str(b))
print(float(a) / b)
print(a * b)
print(a + b)
`,
  },
  {
    id: 'truth',
    code: `candidates = [0, 1, -3, 0.0, "", "0", " ", [], [0], None, True, False]
for value in candidates:
    print(repr(value).ljust(6), bool(value))
`,
  },
  {
    id: 'andor',
    fields: [num('hp', { min: 0, max: 100 }), text('item', { maxLen: 10 })],
    example: { hp: 0, item: 'potion' },
    random: next => ({ hp: pick(next, [0, 25, 100]), item: pick(next, ['potion', '', 'sword']) }),
    code: p => `hp = ${p.hp}
item = ${lit(p.item)}
print(hp and item)
print(hp or item)
print(item or "nothing")
print(not hp)
alive = hp > 0
print(alive and item)
if hp and item:
    print("fight!")
else:
    print("run!")
`,
  },
  {
    id: 'inputage',
    fields: [{ key: 'answers', type: 'lines', minLen: 2, maxLen: 2 }],
    example: { answers: ['Varvara', '12'] },
    random: next => ({ answers: [pick(next, NAMES), String(randInt(next, 7, 15))] }),
    stdin: 'answers',
    code: `name = input("Your name? ")
age = input("Your age? ")
print(type(age))
print(name + " will be " + str(int(age) + 1))
print(age + 1)
`,
  },
  {
    id: 'traceback',
    code: `def average(values):
    total = sum(values)
    return total / len(values)

def report(scores):
    print("report for", len(scores), "levels")
    print(average(scores))

report([10, 20, 30])
report([])
print("done")
`,
  },
  {
    id: 'errgallery',
    fields: [num('which', { min: 1, max: 8 })],
    example: { which: 1 },
    random: next => ({ which: randInt(next, 1, 8) }),
    code: p => `which = ${p.which}
if which == 1:
    print(undefined_name)
elif which == 2:
    print("age: " + 12)
elif which == 3:
    items = [1, 2, 3]
    print(items[3])
elif which == 4:
    scores = {"Luna": 10}
    print(scores["Nova"])
elif which == 5:
    print(int("twelve"))
elif which == 6:
    print(10 / 0)
elif which == 7:
    "abc".push("d")
elif which == 8:
    print(len(5))
`,
  },
  {
    id: 'mutable',
    code: `a = [1, 2]
b = a
b.append(3)
print(a)
print(a is b)
c = a[:]
c.append(4)
print(a, c)
t = (1, 2)
u = t
u = u + (3,)
print(t, u, t is u)
`,
  },
  {
    id: 'funcmut',
    code: `def add_coin(inventory):
    inventory.append("coin")
    return inventory

def add_score(score):
    score = score + 10
    return score

bag = ["sword"]
points = 5
add_coin(bag)
add_score(points)
print(bag)
print(points)
`,
  },
  {
    id: 'aliasdict',
    code: `player = {"name": "Varvara", "hp": 10}
backup = player
backup["hp"] = 0
print(player["hp"])
copy = dict(player)
copy["hp"] = 99
print(player["hp"], copy["hp"])
`,
  },
];
