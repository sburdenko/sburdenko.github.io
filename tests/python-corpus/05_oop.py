class Cat:
    count = 0
    def __init__(self, name, age=1):
        self.name = name
        self.age = age
        Cat.count += 1
    def speak(self):
        return f"{self.name} says meow"
    def __repr__(self):
        return f"Cat({self.name!r}, {self.age})"
    def __str__(self):
        return f"cat {self.name}"
    def __eq__(self, other):
        return isinstance(other, Cat) and self.name == other.name
    def __lt__(self, other):
        return self.age < other.age
    def __len__(self):
        return len(self.name)
    def __add__(self, other):
        return Cat(self.name + other.name, self.age + other.age)
    def __getitem__(self, i):
        return self.name[i]
    def __contains__(self, ch):
        return ch in self.name
    def __call__(self, times):
        return "meow " * times
    def __bool__(self):
        return self.age > 0
    def __hash__(self):
        return hash(self.name)
a = Cat("Tom"); b = Cat("Kit", 3); c = Cat("Tom", 9)
print(a, repr(a), [a], a == c, a == b, a != b, a < b, b > a, len(a), a + b, a[0], "o" in a, a(2), bool(Cat("x", 0)), Cat.count, a.speak(), Cat.speak(b))
print(sorted([c, a, b]), {a, c}, a.__dict__, a.__class__.__name__, type(a) is Cat, isinstance(a, object), hasattr(a, "age"), getattr(a, "zzz", "default"))
a.color = "grey"; print(a.__dict__, vars(a) == a.__dict__)
try:
    a.nothing
except AttributeError as e:
    print("AttributeError:", e)
class Animal:
    kind = "animal"
    def __init__(self, name): self.name = name
    def describe(self): return f"{self.name} the {self.kind}"
    def sound(self): return "..."
class Dog(Animal):
    kind = "dog"
    def __init__(self, name, trick):
        super().__init__(name)
        self.trick = trick
    def sound(self): return "woof"
    def describe(self): return super().describe() + f" who can {self.trick}"
d = Dog("Rex", "sit")
print(d.describe(), d.sound(), Animal.sound(d), isinstance(d, Animal), issubclass(Dog, Animal), Dog.__mro__, Dog.__bases__, d.kind, Animal.kind)
class A:
    def who(self): return "A"
class B(A):
    def who(self): return "B" + super().who()
class C(A):
    def who(self): return "C" + super().who()
class D(B, C):
    def who(self): return "D" + super().who()
print(D().who(), [k.__name__ for k in D.__mro__])
class Temp:
    def __init__(self, c): self._c = c
    @property
    def celsius(self): return self._c
    @celsius.setter
    def celsius(self, v):
        if v < -273.15: raise ValueError("below absolute zero")
        self._c = v
    @property
    def fahrenheit(self): return self._c * 9 / 5 + 32
    @staticmethod
    def about(): return "static"
    @classmethod
    def freezing(cls): return cls(0)
t = Temp(25)
print(t.celsius, t.fahrenheit, Temp.about(), t.about(), Temp.freezing().celsius, type(Temp.freezing()).__name__)
t.celsius = 30; print(t.celsius)
try:
    t.celsius = -300
except ValueError as e: print(e)
try:
    t.fahrenheit = 1
except AttributeError as e: print("AttributeError:", e)
from dataclasses import dataclass, field
@dataclass
class Point:
    x: int
    y: int = 0
    tags: list = field(default_factory=list)
    def dist(self): return (self.x ** 2 + self.y ** 2) ** 0.5
p = Point(3, 4); q = Point(3, y=4); r = Point(1)
print(p, p == q, p == r, p.dist(), r, p.tags is r.tags, Point.__match_args__)
@dataclass(frozen=True, order=True)
class Ver:
    major: int
    minor: int = 0
v1 = Ver(1, 2); v2 = Ver(1, 10)
print(v1 < v2, sorted([v2, v1]), {v1: "a"}[Ver(1, 2)], v1 == Ver(1, 2))
try:
    v1.major = 5
except Exception as e: print(type(e).__name__, e)
try:
    Point()
except TypeError as e: print("TypeError:", e)
match p:
    case Point(x=3, y=yy): print("matched", yy)
def timer(fn):
    def wrapper(*args, **kwargs):
        print("calling", fn.__name__)
        result = fn(*args, **kwargs)
        print("done")
        return result
    return wrapper
@timer
def add(a, b): return a + b
print(add(2, 3), add.__name__)
import functools
def repeat(n):
    def deco(fn):
        @functools.wraps(fn)
        def wrapper(*a):
            return [fn(*a) for _ in range(n)]
        return wrapper
    return deco
@repeat(3)
def hello(name):
    """greets"""
    return f"hi {name}"
print(hello("V"), hello.__name__, hello.__doc__, hello.__wrapped__("Z"))
class Counter:
    def __init__(self, limit): self.i = 0; self.limit = limit
    def __iter__(self): return self
    def __next__(self):
        if self.i >= self.limit: raise StopIteration
        self.i += 1
        return self.i
print(list(Counter(3)), sum(Counter(4)), [x for x in Counter(2)])
class Stack:
    def __init__(self): self._items = []
    def push(self, x): self._items.append(x); return self
    def pop(self): return self._items.pop()
    def __len__(self): return len(self._items)
    def __iter__(self): yield from reversed(self._items)
st = Stack().push(1).push(2).push(3)
print(len(st), list(st), st.pop(), bool(st), bool(Stack()))
class Money:
    def __init__(self, cents): self.cents = cents
    def __add__(self, other):
        if isinstance(other, Money): return Money(self.cents + other.cents)
        return NotImplemented
    def __radd__(self, other):
        return self if other == 0 else NotImplemented
    def __format__(self, spec):
        return f"${self.cents / 100:{spec or '.2f'}}"
    def __repr__(self): return f"Money({self.cents})"
print(sum([Money(150), Money(250)]), f"{Money(1999)}", f"{Money(5):.1f}", format(Money(100)))
try:
    Money(1) + 2
except TypeError as e: print("TypeError:", e)
class Node:
    __slots__ = ("val", "next")
    def __init__(self, val, next=None): self.val = val; self.next = next
n = Node(1, Node(2)); print(n.next.val, n.next.next)
print(type(1), type("a"), type([]), type(None), type(Cat), type(type), int.__name__, (1).__class__, type(1.5).__name__)
def gen():
    try:
        yield 1
        yield 2
    finally:
        print("gen cleanup")
g = gen(); print(next(g)); print(list(g))
def squares():
    n = 0
    while True:
        n += 1
        yield n * n
import itertools
print(list(itertools.islice(squares(), 5)), list(itertools.takewhile(lambda x: x < 30, squares())))
class Vec:
    def __init__(self, *xs): self.xs = xs
    def __iter__(self): return iter(self.xs)
    def __mul__(self, k): return Vec(*[x * k for x in self.xs])
    def __rmul__(self, k): return self * k
    def __eq__(self, o): return self.xs == o.xs
    def __repr__(self): return f"Vec{self.xs}"
    def __abs__(self): return sum(x * x for x in self.xs) ** 0.5
print(2 * Vec(1, 2), Vec(1, 2) * 3, abs(Vec(3, 4)), list(Vec(5, 6)), Vec(1) == Vec(1), max(Vec(1, 5)))
class Meta: pass
print(Cat.__name__, Cat.__doc__, Cat("z").speak.__name__, callable(Cat), callable(a), callable(1))
obj = object(); print(type(obj).__name__, obj == obj, hash(obj) == hash(obj))
x = Cat("same"); y = x; print(x is y, x == y, x is Cat("same"), x == Cat("same"))
print(getattr(Cat, "count"), Cat.__dict__["count"], "speak" in Cat.__dict__, "name" in Cat.__dict__)
