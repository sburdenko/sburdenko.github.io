s = "  Hello, World!  "
print(s.strip(), s.lstrip(), s.rstrip(), s.strip().lower(), s.strip().swapcase(), s.strip().title(), "hi there".capitalize())
print("a,b,,c".split(","), "a b  c".split(), "a b c".split(" ", 1), "a-b-c".rsplit("-", 1), "line1\nline2".splitlines(), "x".split(","))
print("hello".replace("l", "L"), "hello".replace("l", "L", 1), "hello".find("l"), "hello".find("z"), "hello".rfind("l"), "hello".index("e"), "hello".count("l"))
print("hello".startswith("he"), "hello".endswith(("lo", "x")), "123".isdigit(), "abc".isalpha(), "ab1".isalnum(), " ".isspace(), "ABC".isupper(), "abc".islower())
print("hi".center(10, "*"), "hi".ljust(5, "."), "hi".rjust(5), "42".zfill(5), "-42".zfill(5), "a\tb".expandtabs(4))
print("{} and {}".format(1, 2), "{1}{0}".format("a", "b"), "{name}: {x:.1f}".format(name="pi", x=3.14159), "{:>6}|{:<6}|{:^6}|".format("r", "l", "c"))
print(ord("A"), chr(66), ord("я"), chr(0x1F600), len("привет"), len("😀"), "привет".encode("utf-8"), len("привет".encode()), "é".encode("utf-8"))
print(b"abc", b"abc".decode(), bytes([72, 105]), list(b"hi"), b"\xd0\xbf".decode("utf-8"), "abc".encode().hex())
print("abc" * 2, "a" + "b", "abc"[1], "abc"[-1], "abc"[1:], "abc"[:-1], "x" in "xyz", "" in "a", "abc" == "abc", "a" < "b")
print(f"{'nested'!r}", f"{1 + 1}", f"{'a':>3}{'b':<3}|", f"{3.0}", f"{2 ** 10:_}", f"{0.1 + 0.2:.17f}", f"{42:08.3f}", f"{42:b}", f"{255:o}", f"{1e6:e}", f"{12345.678:,.2f}", f"{'x' * 3}")
w = 7
print(f"{w = }", f"{w=}", f"{w:>{w}}|", f"{w!s:3}|", f"{'{'}{w}{'}'}")
import re
print(re.findall(r"\d+", "a1b22c333"), re.sub(r"\s+", " ", "a   b \n c"), re.split(r"[,;]", "a,b;c"), bool(re.match(r"\w+@\w+\.\w+", "me@x.io")), re.search(r"(\d+)-(\d+)", "tel 12-34").groups())
m = re.search(r"(?P<y>\d{4})-(?P<m>\d{2})", "on 2026-10-07")
print(m.group("y"), m.group(2), m.span(), m[0], re.findall(r"(a)(b)?", "ab a"))
def risky(x):
    try:
        print("try", x)
        return 10 / x
    except ZeroDivisionError as e:
        print("except", e)
        return None
    else:
        print("else")
    finally:
        print("finally")
print(risky(2), risky(0))
class TooLoud(Exception):
    def __init__(self, level):
        super().__init__(f"level {level} is too loud")
        self.level = level
try:
    raise TooLoud(11)
except TooLoud as e:
    print(e, e.level, e.args, repr(e), isinstance(e, Exception), type(e).__name__)
try:
    try:
        int("x")
    except ValueError as e:
        raise RuntimeError("wrapped") from e
except RuntimeError as e:
    print(e, type(e.__cause__).__name__, e.__cause__)
for bad in ["1", "x", None, [1]]:
    try:
        print(int(bad))
    except (ValueError, TypeError) as e:
        print(type(e).__name__, e)
try:
    [][0]
except IndexError as e:
    print("IndexError:", e)
try:
    {}["k"]
except KeyError as e:
    print("KeyError:", e, repr(e), str(e))
try:
    undefined_name
except NameError as e:
    print("NameError:", e)
try:
    "a" + 1
except TypeError as e:
    print("TypeError:", e)
try:
    None.x
except AttributeError as e:
    print("AttributeError:", e)
try:
    assert 1 == 2, "math broke"
except AssertionError as e:
    print("AssertionError:", e)
try:
    raise ValueError
except ValueError as e:
    print("bare", repr(e), str(e) == "")
def f():
    try:
        return "from try"
    finally:
        print("cleanup")
print(f())
with open("notes.txt", "w") as fh:
    fh.write("line one\nline two\n")
    print(fh.closed, fh.name, fh.mode)
print(fh.closed)
with open("notes.txt") as fh:
    for i, line in enumerate(fh):
        print(i, line.rstrip())
with open("notes.txt") as fh:
    print(fh.read().split("\n"), fh.read())
with open("notes.txt", "a") as fh:
    fh.write("three\n")
print(open("notes.txt").readlines())
try:
    open("missing.txt")
except FileNotFoundError as e:
    print("FileNotFoundError:", e)
class Timer:
    def __enter__(self):
        print("enter"); return self
    def __exit__(self, t, v, tb):
        print("exit", t.__name__ if t else None); return True
with Timer() as t:
    print("inside")
    raise ValueError("boom")
print("after")
import json
data = {"name": "Varvara", "tags": ["py", 1, 2.5, None, True], "nested": {"k": [1, {"z": 0}]}}
text = json.dumps(data)
print(text)
print(json.dumps(data, indent=2, ensure_ascii=False, sort_keys=True))
back = json.loads(text)
print(back == data, back["tags"][3], type(back["tags"][2]).__name__, json.loads("[1, 2.0, \"x\", null, true]"))
import math, random, string
print(math.sqrt(16), math.pi, math.floor(2.7), math.ceil(2.1), math.gcd(12, 18), math.factorial(5), math.isclose(0.1 + 0.2, 0.3), math.log2(8), math.hypot(3, 4), math.inf > 10 ** 100)
random.seed(42)
print(random.random(), random.randint(1, 100), random.randint(1, 6), random.choice("abcdef"), random.uniform(0, 1))
lst = list(range(10)); random.shuffle(lst); print(lst, random.sample(range(100), 3), random.randrange(0, 10, 2), random.getrandbits(40))
random.seed(7); print([random.randint(0, 9) for _ in range(12)])
print(string.ascii_lowercase[:5], string.digits)
from fractions import Fraction
from decimal import Decimal
print(Fraction(1, 3) + Fraction(1, 6), Fraction(0.5), Fraction("3/9"), Fraction(1, 3) * 3 == 1, float(Fraction(1, 4)), Decimal("0.1") + Decimal("0.2"), Decimal("1.10") * 3, Decimal(1) / Decimal(3))
