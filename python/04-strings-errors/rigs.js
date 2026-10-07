/** PY-04 rigs: string methods, formatting, Unicode, regex, exceptions, files, modules, stdlib tour. */
import { lit } from '../shared/py-code.js?v=202610071708';
import { randInt, pick, randInts, shuffle } from '../../algorithms/patterns/rig-kit.js?v=202610071708';

const num = (key, extra = {}) => ({ key, type: 'int', min: -999, max: 9999, ...extra });
const text = (key, extra = {}) => ({ key, type: 'text', maxLen: 30, ...extra });
const flt = (key, extra = {}) => ({ key, type: 'float', min: -99999, max: 99999, ...extra });

export const RIGS = [
  /* ---------- 01 string methods ---------- */
  {
    id: 'strmethods',
    fields: [text('s', { minLen: 1, maxLen: 30 })],
    example: { s: '  Hello, Space Cadet!  ' },
    random: next => ({ s: pick(next, ['  Hello, Space Cadet!  ', 'the quick brown fox', 'VARVARA plays guitar', 'a,b,,c', 'mission: orbit']) }),
    code: p => `s = ${lit(p.s)}
print(repr(s.strip()))
print(s.strip().lower(), "|", s.strip().upper(), "|", s.strip().title())
words = s.split()
print(words, len(words))
print("-".join(words))
print(s.strip().replace("l", "L"))
print(s.find("Space"), s.find("Moon"), s.count("e"))
print(s.strip().startswith("Hello"), s.strip().endswith("!"))
print("42".isdigit(), "abc".isalpha(), "  ".isspace())
print("7".zfill(3), "hi".center(8, "*"), "x".ljust(4, ".") + "|")
`,
  },
  {
    id: 'splitjoin',
    code: `line = "Luna,12,guitar"
name, age, hobby = line.split(",")
print(name, int(age) + 1, hobby)
csv = ",".join(["Nova", "13", "drums"])
print(csv)
sentence = "to be or not to be"
print(sentence.split(" ", 2))
print(sentence.rsplit(" ", 1))
print("a--b----c".split("-"))
print(" spaced   out ".split())
`,
  },

  /* ---------- 02 formatting ---------- */
  {
    id: 'fstrings',
    fields: [text('name', { minLen: 1, maxLen: 12 }), flt('price', { min: 0, max: 99999 }), num('qty', { min: 0, max: 999 })],
    example: { name: 'Varvara', price: 1234.5, qty: 3 },
    random: next => ({ name: pick(next, ['Varvara', 'Luna', 'Nova']), price: randInt(next, 1, 99999) / 10, qty: randInt(next, 1, 99) }),
    code: p => `name = ${lit(p.name)}
price = ${p.price}
qty = ${p.qty}
print(f"{name} buys {qty} for {price * qty}")
print(f"{price:.2f} | {price:10.2f} | {price:<10.2f}| {price:,.1f}")
print(f"{qty:03d} | {qty:>5} | {qty:^5} | {qty:b} | {qty:x}")
print(f"{name:>10}|{name:<10}|{name:^10}|{name:*^11}")
print(f"{0.256:.1%} {1234567:,} {2 ** 10:_}")
print(f"{name!r} {name = } {len(name)=}")
width = 8
print(f"[{price:{width}.1f}]")
`,
  },
  {
    id: 'formatspec',
    fields: [flt('x', { min: -99999, max: 99999 }), num('width', { min: 0, max: 20 }), num('prec', { min: 0, max: 6 })],
    example: { x: 3.14159, width: 10, prec: 2 },
    random: next => ({ x: pick(next, [3.14159, -2.5, 1234.5678, 0.000123]), width: randInt(next, 6, 14), prec: randInt(next, 0, 4) }),
    code: p => `x = ${p.x}
width = ${p.width}
prec = ${p.prec}
for align in ("<", ">", "^"):
    spec = align + str(width) + "." + str(prec) + "f"
    print(spec.rjust(7), "→", "[" + format(x, spec) + "]")
print(format(x, "e"), format(x, "+.1f"), format(x, "010.3f"))
print("{:>8} {:08.3f} {!r}".format("old", x, "style"))
print("%d items at %.2f each" % (3, x))
`,
  },

  /* ---------- 03 unicode and bytes ---------- */
  {
    id: 'unicode',
    fields: [text('word', { minLen: 1, maxLen: 12 })],
    example: { word: 'Привет' },
    random: next => ({ word: pick(next, ['Привет', 'café', 'naïve', 'Zoë', 'hello']) }),
    code: p => `word = ${lit(p.word)}
data = word.encode("utf-8")
print(len(word), "characters,", len(data), "bytes")
print(data)
print([ord(ch) for ch in word])
print(data.decode("utf-8") == word)
print(chr(1055), chr(0x1F600), ord("€"))
try:
    word.encode("ascii")
except UnicodeEncodeError as e:
    print("UnicodeEncodeError:", str(e)[:40])
`,
  },

  /* ---------- 04 regex ---------- */
  {
    id: 'regex',
    fields: [text('pattern', { minLen: 1, maxLen: 24 })],
    example: { pattern: '\\d+' },
    random: next => ({ pattern: pick(next, ['\\d+', '[A-Z]\\w+', '\\w+@\\w+\\.\\w+', 'o.', '\\b\\w{5}\\b']) }),
    code: p => `import re
text = "Luna scored 42, Nova 7 and Kira 115 at luna@orbit.io"
pattern = ${lit(p.pattern)}
print(re.findall(pattern, text))
m = re.search(pattern, text)
print(m.group(), m.span())
print(re.sub(r"\\d+", "#", text))
print(re.split(r",\\s*|\\s+and\\s+", text))
print(re.findall(r"(\\w+) scored (\\d+)", text))
print(bool(re.fullmatch(r"[a-z]+@[a-z]+\\.[a-z]+", "me@orbit.io")))
`,
  },

  /* ---------- 05 exceptions ---------- */
  {
    id: 'tryflow',
    fields: [{ key: 'values', type: 'wordsAny', minLen: 1, maxLen: 5, maxWord: 6 }],
    example: { values: ['10', 'x', '0', '4'] },
    random: next => ({ values: shuffle(next, ['10', 'x', '0', '4', '2.5', '-3']).slice(0, randInt(next, 2, 5)) }),
    code: p => `def divide(text):
    try:
        n = int(text)
        result = 100 / n
    except ValueError:
        print("not a whole number:", repr(text))
    except ZeroDivisionError as e:
        print("cannot divide:", e)
    else:
        print("100 /", n, "=", result)
    finally:
        print("-- done with", repr(text))

for value in ${lit(p.values)}:
    divide(value)
`,
  },
  {
    id: 'raisechain',
    code: `class InventoryError(Exception):
    pass

class OutOfStock(InventoryError):
    def __init__(self, item, wanted, have):
        super().__init__(f"{item}: wanted {wanted}, have {have}")
        self.item = item

stock = {"potion": 2, "arrow": 20}

def take(item, n):
    if item not in stock:
        raise KeyError(item)
    if stock[item] < n:
        raise OutOfStock(item, n, stock[item])
    stock[item] -= n

try:
    take("potion", 1)
    take("potion", 5)
except OutOfStock as e:
    print("OutOfStock:", e, "| item:", e.item)
try:
    take("sword", 1)
except KeyError as e:
    raise InventoryError("no such item") from e
`,
  },
  {
    id: 'eafp',
    code: `scores = {"Luna": 12, "Nova": 9}
name = "Kira"
if name in scores:
    print(scores[name])
else:
    print("LBYL: no score for", name)
try:
    print(scores[name])
except KeyError:
    print("EAFP: no score for", name)
print(scores.get(name, "no score"))
`,
  },

  /* ---------- 06 files and with ---------- */
  {
    id: 'fileio',
    fields: [{ key: 'lines', type: 'lines', minLen: 1, maxLen: 5 }],
    example: { lines: ['Nebula', 'Orbit', 'Comet'] },
    random: next => ({ lines: shuffle(next, ['Nebula', 'Orbit', 'Comet', 'Pulsar', 'Aurora']).slice(0, randInt(next, 2, 4)) }),
    code: p => `songs = ${lit(p.lines)}
with open("playlist.txt", "w") as f:
    for song in songs:
        f.write(song + "\\n")
print("closed after with:", f.closed)

with open("playlist.txt") as f:
    for number, line in enumerate(f, start=1):
        print(number, line.rstrip())

with open("playlist.txt", "a") as f:
    f.write("Bonus track\\n")

with open("playlist.txt") as f:
    text = f.read()
print(text.split("\\n"))
print(len(text.splitlines()), "lines")
`,
  },
  {
    id: 'contextmgr',
    code: `class Timer:
    def __init__(self, label):
        self.label = label
    def __enter__(self):
        print("start", self.label)
        return self
    def __exit__(self, exc_type, exc, tb):
        print("stop", self.label, "| error:", exc_type.__name__ if exc_type else None)
        return False

with Timer("ok") as t:
    print("working inside", t.label)

try:
    with Timer("boom"):
        raise ValueError("something broke")
except ValueError as e:
    print("caught outside:", e)
`,
  },

  /* ---------- 07 modules ---------- */
  {
    id: 'imports',
    code: `import math
from math import sqrt, pi as PI
import random as rnd
print(math.sqrt(16), sqrt(2), PI)
rnd.seed(7)
print(rnd.randint(1, 6), rnd.choice(["rock", "paper", "scissors"]))
print(type(math).__name__, math.__name__)
print(__name__)
if __name__ == "__main__":
    print("running as a script, not imported")
`,
  },

  /* ---------- 08 standard library tour ---------- */
  {
    id: 'stdlib',
    fields: [{ key: 'tasks', type: 'wordsAny', minLen: 1, maxLen: 5, maxWord: 10 }],
    example: { tasks: ['practice', 'homework', 'draw'] },
    random: next => ({ tasks: shuffle(next, ['practice', 'homework', 'draw', 'read', 'code', 'walk']).slice(0, randInt(next, 2, 4)) }),
    code: p => `import json
from collections import Counter
from dataclasses import dataclass, asdict
from pathlib import Path
import statistics

@dataclass
class Task:
    title: str
    done: bool = False

tasks = [Task(t) for t in ${lit(p.tasks)}]
tasks[0].done = True
text = json.dumps([asdict(t) for t in tasks], indent=2)
print(text)
Path("todo.json").write_text(text)
back = json.loads(Path("todo.json").read_text())
print(Counter(t["done"] for t in back))
print(statistics.mean([len(t["title"]) for t in back]))
`,
  },
];
