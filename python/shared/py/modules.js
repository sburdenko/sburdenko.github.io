/** Standard-library modules available on the stand. Each factory builds a PyModule for one Interp. */
import {
  PyInt, PyBool, PyFloat, PyStr, PyBytes, PyList, PyTuple, PyDict, PySet, PyBuiltin, PyFunction, PyClass, PyInstance, PyModule, PyIterator, PyMethod, PyError,
  NONE, TRUE, FALSE, int, float, bool, str, internStr, hashKey, UNHASHABLE, typeName, isIntLike, TYPES, growAllocation, bigFloorDiv, bigMod, isInstance, PyProperty,
} from './objects.js?v=202610071658';
import { EXC, makeExc, raise, pyError } from './errors.js?v=202610071658';
import { reprOf, strOf } from './convert.js?v=202610071658';
import { truthy, iterate, toList, STOP, equals, compare } from './ops.js?v=202610071658';
import { sortItems, toInt, toFloat, makeDict } from './builtins.js?v=202610071658';
import { MersenneTwister } from './random-mt.js?v=202610071658';

const needInt = o => { if (!isIntLike(o)) raise('TypeError', `'${typeName(o)}' object cannot be interpreted as an integer`); return o.v; };
const asNum = o => { if (o instanceof PyInt) return Number(o.v); if (o instanceof PyFloat) return o.v; raise('TypeError', `must be real number, not ${typeName(o)}`); };
const keyOf = k => { const h = hashKey(k); if (h === UNHASHABLE) raise('TypeError', `unhashable type: '${typeName(k)}'`); return h; };
const mod = (name, entries) => { const m = new PyModule(name, new Map()); for (const [k, v] of Object.entries(entries)) m.dict.set(k, typeof v === 'function' ? new PyBuiltin(k, v) : v); return m; };
const gcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };

export function installModules(interp) {
  const F = interp.moduleFactories;

  F.set('math', () => mod('math', {
    pi: float(Math.PI), e: float(Math.E), tau: float(2 * Math.PI), inf: float(Infinity), nan: float(NaN),
    sqrt: ([x]) => { const v = asNum(x); if (v < 0) raise('ValueError', 'math domain error'); return float(Math.sqrt(v)); },
    floor: ([x]) => (x instanceof PyInt ? x : int(BigInt(Math.floor(asNum(x))))),
    ceil: ([x]) => (x instanceof PyInt ? x : int(BigInt(Math.ceil(asNum(x))))),
    trunc: ([x]) => (x instanceof PyInt ? x : int(BigInt(Math.trunc(asNum(x))))),
    fabs: ([x]) => float(Math.abs(asNum(x))),
    pow: ([a, b]) => float(asNum(a) ** asNum(b)),
    exp: ([x]) => float(Math.exp(asNum(x))),
    log: ([x, b]) => { const v = asNum(x); if (v <= 0) raise('ValueError', 'math domain error'); return float(b ? Math.log(v) / Math.log(asNum(b)) : Math.log(v)); },
    log2: ([x]) => float(Math.log2(asNum(x))),
    log10: ([x]) => float(Math.log10(asNum(x))),
    sin: ([x]) => float(Math.sin(asNum(x))), cos: ([x]) => float(Math.cos(asNum(x))), tan: ([x]) => float(Math.tan(asNum(x))),
    asin: ([x]) => float(Math.asin(asNum(x))), acos: ([x]) => float(Math.acos(asNum(x))), atan: ([x]) => float(Math.atan(asNum(x))),
    atan2: ([y, x]) => float(Math.atan2(asNum(y), asNum(x))),
    degrees: ([x]) => float(asNum(x) * 180 / Math.PI), radians: ([x]) => float(asNum(x) * Math.PI / 180),
    hypot: args => float(Math.hypot(...args.map(asNum))),
    dist: function* ([a, b]) { const p = yield* toList(interp, a), q = yield* toList(interp, b); return float(Math.hypot(...p.map((x, i) => asNum(x) - asNum(q[i])))); },
    gcd: args => int(args.reduce((acc, x) => gcd(acc, needInt(x)), 0n)),
    lcm: args => int(args.reduce((acc, x) => { const v = needInt(x); const g = gcd(acc, v); return g === 0n ? 0n : (acc * v < 0n ? -(acc * v) : acc * v) / g; }, 1n)),
    factorial: ([n]) => { const v = needInt(n); if (v < 0n) raise('ValueError', 'factorial() not defined for negative values'); let r = 1n; for (let i = 2n; i <= v; i++) r *= i; return int(r); },
    comb: ([n, k]) => { let a = needInt(n), b = needInt(k); if (b < 0n || b > a) return int(0n); let r = 1n; for (let i = 1n; i <= b; i++) r = r * (a - b + i) / i; return int(r); },
    perm: ([n, k]) => { const a = needInt(n), b = k ? needInt(k) : needInt(n); let r = 1n; for (let i = 0n; i < b; i++) r *= a - i; return int(r); },
    isclose: ([a, b], kwargs) => { const x = asNum(a), y = asNum(b); const rel = kwargs.has('rel_tol') ? asNum(kwargs.get('rel_tol')) : 1e-9, abs = kwargs.has('abs_tol') ? asNum(kwargs.get('abs_tol')) : 0; return bool(Math.abs(x - y) <= Math.max(rel * Math.max(Math.abs(x), Math.abs(y)), abs)); },
    isqrt: ([n]) => { let v = needInt(n); if (v < 0n) raise('ValueError', 'isqrt() argument must be nonnegative'); if (v < 2n) return int(v); let x = BigInt(Math.floor(Math.sqrt(Number(v)))); while (x * x > v) x--; while ((x + 1n) * (x + 1n) <= v) x++; return int(x); },
    isnan: ([x]) => bool(Number.isNaN(asNum(x))), isinf: ([x]) => bool(!Number.isFinite(asNum(x)) && !Number.isNaN(asNum(x))), isfinite: ([x]) => bool(Number.isFinite(asNum(x))),
    prod: function* ([it], kwargs) { let acc = kwargs.get('start') ?? int(1n); for (const v of yield* toList(interp, it)) acc = yield* interp.binop('*', acc, v); return acc; },
    fsum: function* ([it]) { let s = 0; for (const v of yield* toList(interp, it)) s += asNum(v); return float(s); },
    copysign: ([a, b]) => float(Math.sign(asNum(b)) * Math.abs(asNum(a)) || (Object.is(asNum(b), -0) ? -Math.abs(asNum(a)) : Math.abs(asNum(a)))),
    modf: ([x]) => { const v = asNum(x); const i = Math.trunc(v); return new PyTuple([float(v - i), float(i)]); },
  }));

  F.set('random', () => {
    const mt = new MersenneTwister();
    mt.seed(BigInt(Date.now()) % 1000003n);
    interp.random = mt;
    const randbelow = n => mt.randbelow(n);
    return mod('random', {
      seed: ([s]) => { if (s === undefined || s === NONE) mt.seed(12345n); else if (s instanceof PyStr) { let h = 0n; for (const ch of s.v) h = h * 31n + BigInt(ch.codePointAt(0)); mt.seed(h); } else mt.seed(needInt(s)); return NONE; },
      random: () => float(mt.random()),
      randint: ([a, b]) => { const lo = needInt(a), hi = needInt(b); if (hi < lo) raise('ValueError', `empty range in randrange(${lo}, ${hi + 1n})`); return int(lo + randbelow(hi - lo + 1n)); },
      randrange: ([a, b, c]) => { const start = b === undefined ? 0n : needInt(a), stop = b === undefined ? needInt(a) : needInt(b), step = c === undefined ? 1n : needInt(c); const width = stop - start; if (step === 1n) { if (width <= 0n) raise('ValueError', `empty range for randrange() (${start}, ${stop}, ${width})`); return int(start + randbelow(width)); } const n = width > 0n ? (width + step - 1n) / step : 0n; if (n <= 0n) raise('ValueError', 'empty range for randrange()'); return int(start + step * randbelow(n)); },
      choice: function* ([seq]) { const items = yield* toList(interp, seq); if (!items.length) raise('IndexError', 'Cannot choose from an empty sequence'); return items[Number(randbelow(BigInt(items.length)))]; },
      choices: function* ([seq], kwargs) { const items = yield* toList(interp, seq); const k = kwargs.has('k') ? Number(kwargs.get('k').v) : 1; const out = []; for (let i = 0; i < k; i++) out.push(items[Math.floor(mt.random() * items.length)]); return new PyList(out); },
      shuffle: ([list]) => { if (!(list instanceof PyList)) raise('TypeError', "'tuple' object does not support item assignment"); const a = list.items; for (let i = a.length - 1; i > 0; i--) { const j = Number(randbelow(BigInt(i + 1))); [a[i], a[j]] = [a[j], a[i]]; } return NONE; },
      sample: function* ([seq, k]) { const items = yield* toList(interp, seq); const n = Number(k.v); if (n > items.length) raise('ValueError', 'Sample larger than population or is negative'); const pool = [...items], out = []; for (let i = 0; i < n; i++) { const j = Number(randbelow(BigInt(pool.length - i))); out.push(pool[j]); pool[j] = pool[pool.length - i - 1]; } return new PyList(out); },
      uniform: ([a, b]) => { const x = asNum(a), y = asNum(b); return float(x + (y - x) * mt.random()); },
      getrandbits: ([k]) => int(mt.getrandbits(Number(k.v))),
    });
  });

  F.set('collections', () => {
    const deque = new PyClass('deque', [TYPES.object]); deque.module = 'collections';
    deque.construct = function* (args, kwargs) {
      const d = new PyList(args.length ? yield* toList(interp, args[0]) : []);
      d.cls = deque; d.prefix = 'deque('; d.maxlen = kwargs.has('maxlen') && kwargs.get('maxlen') !== NONE ? Number(kwargs.get('maxlen').v) : (args[1] && args[1] !== NONE ? Number(args[1].v) : null);
      if (d.maxlen !== null) while (d.items.length > d.maxlen) d.items.shift();
      return d;
    };
    const dm = (name, fn) => deque.dict.set(name, new PyBuiltin(name, fn));
    const trim = (d, left) => { if (d.maxlen !== null) while (d.items.length > d.maxlen) (left ? d.items.pop() : d.items.shift()); };
    dm('append', ([d, x]) => { d.items.push(x); trim(d, false); interp.touch(d, d.items.length - 1, 'write'); return NONE; });
    dm('appendleft', ([d, x]) => { d.items.unshift(x); trim(d, true); interp.touch(d, 0, 'write'); return NONE; });
    dm('pop', ([d]) => { if (!d.items.length) raise('IndexError', 'pop from an empty deque'); return d.items.pop(); });
    dm('popleft', ([d]) => { if (!d.items.length) raise('IndexError', 'pop from an empty deque'); interp.touch(d, 0, 'read'); return d.items.shift(); });
    dm('extend', function* ([d, it]) { for (const x of yield* toList(interp, it)) d.items.push(x); trim(d, false); return NONE; });
    dm('extendleft', function* ([d, it]) { for (const x of yield* toList(interp, it)) d.items.unshift(x); trim(d, true); return NONE; });
    dm('clear', ([d]) => { d.items.length = 0; return NONE; });
    dm('rotate', ([d, n]) => { const k = n ? Number(n.v) : 1; const len = d.items.length; if (!len) return NONE; const r = ((k % len) + len) % len; d.items.unshift(...d.items.splice(len - r, r)); return NONE; });
    dm('__len__', ([d]) => int(BigInt(d.items.length)));
    dm('__iter__', function* ([d]) { return yield* iterate(interp, d); });
    dm('__getitem__', function* ([d, k]) { return yield* interp.getitem(d, k); });
    dm('__contains__', function* ([d, x]) { return bool(yield* interp.compare('in', x, d)); });
    dm('__bool__', ([d]) => bool(d.items.length > 0));
    dm('copy', ([d]) => { const c = new PyList([...d.items]); c.cls = deque; c.prefix = 'deque('; c.maxlen = d.maxlen; return c; });
    dm('__repr__', function* ([d]) { const parts = []; for (const x of d.items) parts.push(yield* reprOf(interp, x)); return str(d.maxlen === null ? `deque([${parts.join(', ')}])` : `deque([${parts.join(', ')}], maxlen=${d.maxlen})`); });
    dm('__eq__', function* ([a, b]) { return bool(b instanceof PyList && (yield* equals(interp, new PyList(a.items), new PyList(b.items)))); });

    const Counter = new PyClass('Counter', [TYPES.dict]); Counter.module = 'collections';
    Counter.construct = function* (args, kwargs) {
      const c = new PyDict(); c.cls = Counter; c.reprName = 'Counter'; c.missingZero = true;
      if (args.length) {
        const src = args[0];
        if (src instanceof PyDict) for (const e of src.entries()) c.map.set(hashKey(e.k), { k: e.k, v: e.v });
        else for (const x of yield* toList(interp, src)) { const hk = keyOf(x); const e = c.map.get(hk); c.map.set(hk, { k: x, v: int((e ? e.v.v : 0n) + 1n) }); }
      }
      for (const [k, v] of kwargs) c.map.set('s' + k, { k: internStr(k), v });
      return c;
    };
    const cm = (name, fn) => Counter.dict.set(name, new PyBuiltin(name, fn));
    cm('most_common', function* ([c, n]) { const items = yield* sortItems(interp, c.entries().map(e => new PyTuple([e.k, e.v])), new PyBuiltin('k', ([t]) => t.items[1]), true); return new PyList(n === undefined || n === NONE ? items : items.slice(0, Number(n.v))); });
    cm('elements', ([c]) => { const out = []; for (const e of c.entries()) for (let i = 0n; i < e.v.v; i++) out.push(e.k); return new PyList(out); });
    cm('total', ([c]) => int(c.entries().reduce((s, e) => s + e.v.v, 0n)));
    cm('update', function* ([c, src]) { if (src === undefined) return NONE; if (src instanceof PyDict) for (const e of src.entries()) { const hk = hashKey(e.k); const cur = c.map.get(hk); c.map.set(hk, { k: e.k, v: int((cur ? cur.v.v : 0n) + e.v.v) }); } else for (const x of yield* toList(interp, src)) { const hk = keyOf(x); const e = c.map.get(hk); c.map.set(hk, { k: x, v: int((e ? e.v.v : 0n) + 1n) }); } return NONE; });
    cm('subtract', function* ([c, src]) { for (const x of yield* toList(interp, src)) { const hk = keyOf(x); const e = c.map.get(hk); c.map.set(hk, { k: x, v: int((e ? e.v.v : 0n) - 1n) }); } return NONE; });
    cm('__repr__', function* ([c]) { const items = yield* sortItems(interp, c.entries().map(e => new PyTuple([e.k, e.v])), new PyBuiltin('k', ([t]) => t.items[1]), true); const parts = []; for (const t of items) parts.push(`${yield* reprOf(interp, t.items[0])}: ${yield* reprOf(interp, t.items[1])}`); return str(parts.length ? `Counter({${parts.join(', ')}})` : 'Counter()'); });
    cm('__add__', function* ([a, b]) { const c = yield* Counter.construct([], new Map()); for (const src of [a, b]) for (const e of src.entries()) { const hk = hashKey(e.k); const cur = c.map.get(hk); const v = (cur ? cur.v.v : 0n) + e.v.v; if (v > 0n) c.map.set(hk, { k: e.k, v: int(v) }); } return c; });
    cm('__sub__', function* ([a, b]) { const c = yield* Counter.construct([], new Map()); for (const e of a.entries()) { const o = b.map.get(hashKey(e.k)); const v = e.v.v - (o ? o.v.v : 0n); if (v > 0n) c.map.set(hashKey(e.k), { k: e.k, v: int(v) }); } return c; });

    const defaultdict = new PyClass('defaultdict', [TYPES.dict]); defaultdict.module = 'collections';
    defaultdict.construct = function* (args, kwargs) { const d = yield* makeDict(interp, args.slice(1), kwargs); d.cls = defaultdict; d.reprName = 'defaultdict'; d.defaultFactory = args[0] ?? NONE; return d; };

    const OrderedDict = new PyClass('OrderedDict', [TYPES.dict]); OrderedDict.module = 'collections';
    OrderedDict.construct = function* (args, kwargs) { const d = yield* makeDict(interp, args, kwargs); d.cls = OrderedDict; d.reprName = 'OrderedDict'; return d; };
    OrderedDict.dict.set('move_to_end', new PyBuiltin('move_to_end', ([d, k, last]) => { const hk = keyOf(k); const e = d.map.get(hk); if (!e) throw pyError('KeyError', k); d.map.delete(hk); if (last === undefined || last === TRUE) d.map.set(hk, e); else { const rest = [...d.map]; d.map.clear(); d.map.set(hk, e); for (const [kk, ee] of rest) d.map.set(kk, ee); } return NONE; }));

    const namedtuple = function* (args, kwargs) {
      const name = args[0].v;
      const fields = args[1] instanceof PyStr ? args[1].v.replace(/,/g, ' ').split(/\s+/).filter(Boolean) : (yield* toList(interp, args[1])).map(f => f.v);
      const cls = new PyClass(name, [TYPES.tuple], new Map(), false); cls.module = '__main__'; cls.fields = fields.map(f => ({ name: f })); cls.isNamedTuple = true;
      cls.dict.set('_fields', new PyTuple(fields.map(f => internStr(f))));
      cls.dict.set('__match_args__', new PyTuple(fields.map(f => internStr(f))));
      const defaults = kwargs.has('defaults') ? yield* toList(interp, kwargs.get('defaults')) : [];
      cls.construct = function* (cargs, ckwargs) {
        const values = [...cargs];
        for (let i = values.length; i < fields.length; i++) {
          if (ckwargs.has(fields[i])) values.push(ckwargs.get(fields[i]));
          else if (i >= fields.length - defaults.length) values.push(defaults[i - (fields.length - defaults.length)]);
          else raise('TypeError', `${name}.__new__() missing 1 required positional argument: '${fields[i]}'`);
        }
        if (values.length > fields.length) raise('TypeError', `${name}.__new__() takes ${fields.length + 1} positional arguments but ${values.length + 1} were given`);
        const t = new PyTuple(values); t.cls = cls; t.attrs = Object.fromEntries(fields.map((f, i) => [f, values[i]])); return t;
      };
      cls.dict.set('__repr__', new PyBuiltin('__repr__', function* ([t]) { const parts = []; for (let i = 0; i < fields.length; i++) parts.push(`${fields[i]}=${yield* reprOf(interp, t.items[i])}`); return str(`${name}(${parts.join(', ')})`); }));
      cls.dict.set('_asdict', new PyBuiltin('_asdict', ([t]) => { const d = new PyDict(); fields.forEach((f, i) => d.map.set('s' + f, { k: internStr(f), v: t.items[i] })); return d; }));
      cls.dict.set('_replace', new PyBuiltin('_replace', function* ([t], kw) { const vals = t.items.map((v, i) => kw.get(fields[i]) ?? v); return yield* cls.construct(vals, new Map()); }));
      return cls;
    };
    return mod('collections', { deque, Counter, defaultdict, OrderedDict, namedtuple });
  });

  F.set('heapq', () => {
    const lt = function* (a, b) { return yield* compare(interp, '<', a, b); };
    const siftdown = function* (heap, startpos, pos) {
      const item = heap[pos];
      while (pos > startpos) { const parent = (pos - 1) >> 1; if (yield* lt(item, heap[parent])) { heap[pos] = heap[parent]; pos = parent; continue; } break; }
      heap[pos] = item;
    };
    const siftup = function* (heap, pos) {
      const end = heap.length, start = pos, item = heap[pos];
      let child = 2 * pos + 1;
      while (child < end) { const right = child + 1; if (right < end && !(yield* lt(heap[child], heap[right]))) child = right; heap[pos] = heap[child]; pos = child; child = 2 * pos + 1; }
      heap[pos] = item;
      yield* siftdown(heap, start, pos);
    };
    const need = h => { if (!(h instanceof PyList)) raise('TypeError', `heap argument must be a list, not ${typeName(h)}`); return h.items; };
    return mod('heapq', {
      heappush: function* ([h, x]) { const a = need(h); a.push(x); h.allocated = Math.max(h.allocated, a.length); yield* siftdown(a, 0, a.length - 1); return NONE; },
      heappop: function* ([h]) { const a = need(h); if (!a.length) raise('IndexError', 'index out of range'); const last = a.pop(); if (a.length) { const r = a[0]; a[0] = last; yield* siftup(a, 0); return r; } return last; },
      heapify: function* ([h]) { const a = need(h); for (let i = (a.length >> 1) - 1; i >= 0; i--) yield* siftup(a, i); return NONE; },
      heappushpop: function* ([h, x]) { const a = need(h); if (a.length && (yield* lt(a[0], x))) { const r = a[0]; a[0] = x; yield* siftup(a, 0); return r; } return x; },
      heapreplace: function* ([h, x]) { const a = need(h); if (!a.length) raise('IndexError', 'index out of range'); const r = a[0]; a[0] = x; yield* siftup(a, 0); return r; },
      nlargest: function* ([n, it], kwargs) { const items = yield* toList(interp, it); const s = yield* sortItems(interp, items, kwargs.get('key') ?? null, true); return new PyList(s.slice(0, Number(n.v))); },
      nsmallest: function* ([n, it], kwargs) { const items = yield* toList(interp, it); const s = yield* sortItems(interp, items, kwargs.get('key') ?? null, false); return new PyList(s.slice(0, Number(n.v))); },
    });
  });

  F.set('itertools', () => {
    const lazy = (name, nextFn, extra) => new PyIterator(name, nextFn, extra);
    return mod('itertools', {
      count: ([start, step]) => { let v = start ? start.v : 0n; const s = step ? step.v : 1n; return lazy('count', function* () { const r = int(v); v += s; return r; }); },
      cycle: function* ([it]) { const items = yield* toList(interp, it); let i = 0; return lazy('cycle', function* () { if (!items.length) return STOP; return items[i++ % items.length]; }); },
      repeat: ([x, n]) => { let left = n ? Number(n.v) : Infinity; return lazy('repeat', function* () { if (left <= 0) return STOP; left--; return x; }); },
      chain: function* (args) { const its = []; for (const a of args) its.push(yield* iterate(interp, a)); let i = 0; return lazy('chain', function* () { while (i < its.length) { const v = yield* its[i].next(); if (v !== STOP) return v; i++; } return STOP; }); },
      islice: function* ([it, a, b, c]) { const src = yield* iterate(interp, it); const [start, stop, step] = b === undefined ? [0, a === NONE ? Infinity : Number(a.v), 1] : [Number(a.v), b === NONE ? Infinity : Number(b.v), c ? Number(c.v) : 1]; let i = 0, nextWanted = start; return lazy('islice', function* () { for (;;) { if (i >= stop) return STOP; const v = yield* src.next(); if (v === STOP) return STOP; const idx = i++; if (idx === nextWanted) { nextWanted += step; return v; } } }); },
      accumulate: function* ([it, fn], kwargs) { const src = yield* iterate(interp, it); let acc = kwargs.get('initial') ?? null; let first = true; return lazy('accumulate', function* () { if (first && acc !== null) { first = false; return acc; } const v = yield* src.next(); if (v === STOP) return STOP; if (first) { first = false; acc = v; return acc; } acc = fn && fn !== NONE ? yield* interp.call(fn, [acc, v], new Map()) : yield* interp.binop('+', acc, v); return acc; }); },
      product: function* (args, kwargs) { const pools = []; for (const a of args) pools.push(yield* toList(interp, a)); const rep = kwargs.has('repeat') ? Number(kwargs.get('repeat').v) : 1; const all = []; for (let r = 0; r < rep; r++) all.push(...pools); const idx = all.map(() => 0); let done = all.some(p => !p.length) || !all.length && false; let first = true; return lazy('product', function* () { if (done) return STOP; if (!all.length) { done = true; return new PyTuple([]); } if (!first) { let k = all.length - 1; while (k >= 0) { idx[k]++; if (idx[k] < all[k].length) break; idx[k] = 0; k--; } if (k < 0) { done = true; return STOP; } } first = false; return new PyTuple(all.map((p, i) => p[idx[i]])); }); },
      permutations: function* ([it, r]) { const pool = yield* toList(interp, it); const n = pool.length, k = r === undefined || r === NONE ? n : Number(r.v); const out = []; const rec = (chosen, used) => { if (chosen.length === k) { out.push(new PyTuple(chosen.map(i => pool[i]))); return; } for (let i = 0; i < n; i++) if (!used[i]) { used[i] = true; rec([...chosen, i], used); used[i] = false; } }; if (k <= n) rec([], new Array(n).fill(false)); let i = 0; return lazy('permutations', function* () { return i < out.length ? out[i++] : STOP; }); },
      combinations: function* ([it, r]) { const pool = yield* toList(interp, it); const k = Number(r.v); const out = []; const rec = (start, chosen) => { if (chosen.length === k) { out.push(new PyTuple(chosen.map(i => pool[i]))); return; } for (let i = start; i < pool.length; i++) rec(i + 1, [...chosen, i]); }; rec(0, []); let i = 0; return lazy('combinations', function* () { return i < out.length ? out[i++] : STOP; }); },
      combinations_with_replacement: function* ([it, r]) { const pool = yield* toList(interp, it); const k = Number(r.v); const out = []; const rec = (start, chosen) => { if (chosen.length === k) { out.push(new PyTuple(chosen.map(i => pool[i]))); return; } for (let i = start; i < pool.length; i++) rec(i, [...chosen, i]); }; rec(0, []); let i = 0; return lazy('combinations', function* () { return i < out.length ? out[i++] : STOP; }); },
      groupby: function* ([it, keyFn]) { const items = yield* toList(interp, it); const groups = []; for (const x of items) { const k = keyFn && keyFn !== NONE ? yield* interp.call(keyFn, [x], new Map()) : x; const last = groups.at(-1); if (last && (yield* equals(interp, last.k, k))) last.items.push(x); else groups.push({ k, items: [x] }); } let i = 0; return lazy('groupby', function* () { if (i >= groups.length) return STOP; const g = groups[i++]; return new PyTuple([g.k, new PyIterator('list_iterator', function* () { return this.j < g.items.length ? g.items[this.j++] : STOP; }, { j: 0 })]); }); },
      zip_longest: function* (args, kwargs) { const its = []; for (const a of args) its.push(yield* iterate(interp, a)); const fill = kwargs.get('fillvalue') ?? NONE; const done = its.map(() => false); return lazy('zip_longest', function* () { const row = []; let any = false; for (let i = 0; i < its.length; i++) { if (done[i]) { row.push(fill); continue; } const v = yield* its[i].next(); if (v === STOP) { done[i] = true; row.push(fill); } else { any = true; row.push(v); } } return any ? new PyTuple(row) : STOP; }); },
      pairwise: function* ([it]) { const items = yield* toList(interp, it); let i = 0; return lazy('pairwise', function* () { return i + 1 < items.length ? new PyTuple([items[i], items[++i]]) : STOP; }); },
      takewhile: function* ([fn, it]) { const src = yield* iterate(interp, it); let stopped = false; return lazy('takewhile', function* () { if (stopped) return STOP; const v = yield* src.next(); if (v === STOP || !(yield* truthy(interp, yield* interp.call(fn, [v], new Map())))) { stopped = true; return STOP; } return v; }); },
      dropwhile: function* ([fn, it]) { const src = yield* iterate(interp, it); let dropping = true; return lazy('dropwhile', function* () { for (;;) { const v = yield* src.next(); if (v === STOP) return STOP; if (dropping && (yield* truthy(interp, yield* interp.call(fn, [v], new Map())))) continue; dropping = false; return v; } }); },
      batched: function* ([it, n]) { const items = yield* toList(interp, it); const k = Number(n.v); let i = 0; return lazy('batched', function* () { if (i >= items.length) return STOP; const b = items.slice(i, i + k); i += k; return new PyTuple(b); }); },
    });
  });

  F.set('functools', () => mod('functools', {
    reduce: function* ([fn, it, init]) { const items = yield* toList(interp, it); let acc; let i = 0; if (init !== undefined) acc = init; else { if (!items.length) raise('TypeError', 'reduce() of empty iterable with no initial value'); acc = items[0]; i = 1; } for (; i < items.length; i++) acc = yield* interp.call(fn, [acc, items[i]], new Map()); return acc; },
    lru_cache: function* (args, kwargs) {
      const wrap = fn => {
        const cache = new Map(); let hits = 0, misses = 0; const maxsize = kwargs.has('maxsize') && kwargs.get('maxsize') !== NONE ? Number(kwargs.get('maxsize').v) : (args[0] instanceof PyInt ? Number(args[0].v) : 128);
        const wrapper = new PyBuiltin(fn.name, function* (cargs, ckwargs) {
          const key = cargs.map(a => hashKey(a)).join('|') + '#' + [...ckwargs].map(([k, v]) => k + '=' + hashKey(v)).join('|');
          if (cache.has(key)) { hits++; const v = cache.get(key); cache.delete(key); cache.set(key, v); interp.touched.push({ cacheHit: true }); return v; }
          misses++;
          const v = yield* interp.call(fn, cargs, ckwargs);
          cache.set(key, v);
          if (cache.size > maxsize) cache.delete(cache.keys().next().value);
          return v;
        });
        wrapper.wrapped = fn;
        wrapper.attrs = { __wrapped__: fn, __name__: internStr(fn.name) };
        wrapper.cache = cache;
        wrapper.attrs.cache_info = new PyBuiltin('cache_info', () => { const t = new PyTuple([int(BigInt(hits)), int(BigInt(misses)), int(BigInt(maxsize)), int(BigInt(cache.size))]); t.reprText = `CacheInfo(hits=${hits}, misses=${misses}, maxsize=${maxsize}, currsize=${cache.size})`; t.attrs = { hits: t.items[0], misses: t.items[1], maxsize: t.items[2], currsize: t.items[3] }; return t; });
        wrapper.attrs.cache_clear = new PyBuiltin('cache_clear', () => { cache.clear(); hits = 0; misses = 0; return NONE; });
        return wrapper;
      };
      if (args.length === 1 && (args[0] instanceof PyFunction)) return wrap(args[0]);
      return new PyBuiltin('lru_cache', ([fn]) => wrap(fn));
    },
    cache: ([fn]) => F.get('functools')().dict.get('lru_cache').fn([fn], new Map(), interp),
    wraps: ([wrapped]) => new PyBuiltin('wraps', function* ([fn]) { if (fn instanceof PyFunction) { fn.name = wrapped instanceof PyFunction ? wrapped.name : wrapped.name ?? fn.name; fn.qualname = wrapped.qualname ?? fn.name; fn.doc = wrapped.doc ?? null; fn.dict.set('__wrapped__', wrapped); } return fn; }),
    partial: ([fn, ...pre], pkw) => { const p = new PyBuiltin('partial', function* (cargs, ckwargs) { const kw = new Map([...pkw, ...ckwargs]); return yield* interp.call(fn, [...pre, ...cargs], kw); }); p.attrs = { func: fn, args: new PyTuple(pre) }; p.reprText = `functools.partial(<function ${fn.name}>, ...)`; return p; },
    cmp_to_key: ([cmp]) => new PyBuiltin('cmp_to_key', ([x]) => { const K = new PyInstance(keyClass); K.dict.set('obj', x); K.cmp = cmp; return K; }),
    total_ordering: ([cls]) => { const has = n => cls.dict.has(n); const lt = cls.lookup('__lt__'), gt = cls.lookup('__gt__'), le = cls.lookup('__le__'), ge = cls.lookup('__ge__'); const mk = (name, fn) => { if (!has(name)) cls.dict.set(name, new PyBuiltin(name, fn)); }; if (has('__lt__')) { mk('__gt__', function* ([a, b]) { return bool(!(yield* truthy(interp, yield* interp.call(lt, [a, b], new Map()))) && !(yield* equals(interp, a, b))); }); mk('__le__', function* ([a, b]) { return bool((yield* truthy(interp, yield* interp.call(lt, [a, b], new Map()))) || (yield* equals(interp, a, b))); }); mk('__ge__', function* ([a, b]) { return bool(!(yield* truthy(interp, yield* interp.call(lt, [a, b], new Map())))); }); } else if (has('__gt__')) { mk('__lt__', function* ([a, b]) { return bool(!(yield* truthy(interp, yield* interp.call(gt, [a, b], new Map()))) && !(yield* equals(interp, a, b))); }); mk('__ge__', function* ([a, b]) { return bool((yield* truthy(interp, yield* interp.call(gt, [a, b], new Map()))) || (yield* equals(interp, a, b))); }); mk('__le__', function* ([a, b]) { return bool(!(yield* truthy(interp, yield* interp.call(gt, [a, b], new Map())))); }); } void le; void ge; return cls; },
  }));
  const keyClass = new PyClass('K', [TYPES.object], new Map(), false);
  keyClass.dict.set('__lt__', new PyBuiltin('__lt__', function* ([a, b]) { const r = yield* interp.call(a.cmp, [a.dict.get('obj'), b.dict.get('obj')], new Map()); return bool(r.v < 0n); }));
  keyClass.dict.set('__gt__', new PyBuiltin('__gt__', function* ([a, b]) { const r = yield* interp.call(a.cmp, [a.dict.get('obj'), b.dict.get('obj')], new Map()); return bool(r.v > 0n); }));
  keyClass.dict.set('__eq__', new PyBuiltin('__eq__', function* ([a, b]) { const r = yield* interp.call(a.cmp, [a.dict.get('obj'), b.dict.get('obj')], new Map()); return bool(r.v === 0n); }));

  F.set('copy', () => {
    const shallow = o => {
      if (o instanceof PyList) { const l = new PyList([...o.items]); l.cls = o.cls; l.prefix = o.prefix; l.maxlen = o.maxlen; return l; }
      if (o instanceof PyDict) { const d = new PyDict(); for (const [k, e] of o.map) d.map.set(k, { k: e.k, v: e.v }); d.cls = o.cls; d.reprName = o.reprName; d.defaultFactory = o.defaultFactory; d.missingZero = o.missingZero; return d; }
      if (o instanceof PySet) { const s = new PySet(o.frozen); for (const [k, v] of o.map) s.map.set(k, v); return s; }
      if (o instanceof PyInstance) { const i = new PyInstance(o.cls); for (const [k, v] of o.dict) i.dict.set(k, v); return i; }
      return o;
    };
    const deep = (o, memo) => {
      if (memo.has(o)) return memo.get(o);
      if (o instanceof PyList) { const l = new PyList([]); l.cls = o.cls; l.prefix = o.prefix; memo.set(o, l); l.items = o.items.map(x => deep(x, memo)); l.allocated = l.items.length; return l; }
      if (o instanceof PyTuple) { if (o.items.every(x => x instanceof PyInt || x instanceof PyStr || x instanceof PyFloat || x === NONE)) return o; const t = new PyTuple(o.items.map(x => deep(x, memo))); memo.set(o, t); return t; }
      if (o instanceof PyDict) { const d = new PyDict(); d.cls = o.cls; d.reprName = o.reprName; d.defaultFactory = o.defaultFactory; d.missingZero = o.missingZero; memo.set(o, d); for (const [k, e] of o.map) d.map.set(k, { k: deep(e.k, memo), v: deep(e.v, memo) }); return d; }
      if (o instanceof PySet) { const s = new PySet(o.frozen); memo.set(o, s); for (const [k, v] of o.map) s.map.set(k, deep(v, memo)); return s; }
      if (o instanceof PyInstance) { const i = new PyInstance(o.cls); memo.set(o, i); for (const [k, v] of o.dict) i.dict.set(k, deep(v, memo)); return i; }
      return o;
    };
    return mod('copy', { copy: ([o]) => shallow(o), deepcopy: ([o]) => deep(o, new Map()) });
  });

  F.set('json', () => {
    const dumps = function* (o, indent, level, sortKeys, ensureAscii) {
      const nl = indent === null ? '' : '\n' + ' '.repeat(indent * (level + 1)), close = indent === null ? '' : '\n' + ' '.repeat(indent * level), sep = indent === null ? ', ' : ',';
      if (o === NONE) return 'null';
      if (o === TRUE) return 'true';
      if (o === FALSE) return 'false';
      if (o instanceof PyInt) return o.v.toString();
      if (o instanceof PyFloat) return Number.isFinite(o.v) ? (yield* reprOf(interp, o)) : (Number.isNaN(o.v) ? 'NaN' : o.v > 0 ? 'Infinity' : '-Infinity');
      if (o instanceof PyStr) { const j = JSON.stringify(o.v); return ensureAscii ? j.replace(/[\u007f-￿]/g, c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')) : j; }
      if (o instanceof PyList || o instanceof PyTuple) { if (!o.items.length) return '[]'; const parts = []; for (const x of o.items) parts.push(yield* dumps(x, indent, level + 1, sortKeys, ensureAscii)); return `[${nl}${parts.join(sep + (indent === null ? '' : nl))}${close}]`; }
      if (o instanceof PyDict) {
        if (!o.map.size) return '{}';
        let entries = o.entries();
        if (sortKeys) entries = yield* sortItems(interp, entries, new PyBuiltin('k', ([e]) => e.k), false);
        const parts = [];
        for (const e of entries) { const k = e.k instanceof PyStr ? e.k.v : e.k === NONE ? 'null' : e.k === TRUE ? 'true' : e.k === FALSE ? 'false' : (e.k instanceof PyInt || e.k instanceof PyFloat) ? yield* strOf(interp, e.k) : raise('TypeError', `keys must be str, int, float, bool or None, not ${typeName(e.k)}`); parts.push(`${JSON.stringify(k)}: ${yield* dumps(e.v, indent, level + 1, sortKeys, ensureAscii)}`); }
        return `{${nl}${parts.join(sep + (indent === null ? '' : nl))}${close}}`;
      }
      raise('TypeError', `Object of type ${typeName(o)} is not JSON serializable`);
    };
    const load = v => {
      if (v === null) return NONE;
      if (v === true) return TRUE;
      if (v === false) return FALSE;
      if (typeof v === 'bigint') return int(v);
      if (typeof v === 'number') return float(v);
      if (typeof v === 'string') return str(v);
      if (Array.isArray(v)) return new PyList(v.map(load));
      const d = new PyDict(); for (const [k, x] of v) d.map.set('s' + k, { k: str(k), v: load(x) }); return d;
    };
    /** Own JSON reader so 2 stays int and 2.0 becomes float, like Python. */
    const parse = text => {
      let i = 0;
      const err = () => raise('JSONDecodeError', `Expecting value: line 1 column ${i + 1} (char ${i})`);
      const ws = () => { while (i < text.length && /\s/.test(text[i])) i++; };
      const value = () => {
        ws();
        const c = text[i];
        if (c === '{') { i++; const out = new Map(); ws(); if (text[i] === '}') { i++; return out; } for (;;) { ws(); if (text[i] !== '"') err(); const k = string(); ws(); if (text[i] !== ':') err(); i++; out.set(k, value()); ws(); if (text[i] === ',') { i++; continue; } if (text[i] === '}') { i++; return out; } err(); } }
        if (c === '[') { i++; const out = []; ws(); if (text[i] === ']') { i++; return out; } for (;;) { out.push(value()); ws(); if (text[i] === ',') { i++; continue; } if (text[i] === ']') { i++; return out; } err(); } }
        if (c === '"') return string();
        if (text.startsWith('true', i)) { i += 4; return true; }
        if (text.startsWith('false', i)) { i += 5; return false; }
        if (text.startsWith('null', i)) { i += 4; return null; }
        if (text.startsWith('NaN', i)) { i += 3; return NaN; }
        if (text.startsWith('Infinity', i)) { i += 8; return Infinity; }
        if (text.startsWith('-Infinity', i)) { i += 9; return -Infinity; }
        const m = text.slice(i).match(/^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?/);
        if (!m) err();
        i += m[0].length;
        return m[2] || m[3] ? Number(m[0]) : BigInt(m[0]);
      };
      const string = () => { let j = i + 1, out = ''; for (;;) { if (j >= text.length) raise('JSONDecodeError', `Unterminated string starting at: line 1 column ${i + 1} (char ${i})`); const c = text[j]; if (c === '"') break; if (c === '\\') { const n = text[j + 1]; if (n === 'u') { out += String.fromCharCode(parseInt(text.slice(j + 2, j + 6), 16)); j += 6; continue; } out += { n: '\n', t: '\t', r: '\r', b: '\b', f: '\f', '/': '/', '\\': '\\', '"': '"' }[n] ?? n; j += 2; continue; } out += c; j++; } i = j + 1; return out; };
      const v = value();
      ws();
      if (i < text.length) raise('JSONDecodeError', `Extra data: line 1 column ${i + 1} (char ${i})`);
      return load(v);
    };
    const JSONDecodeError = new PyClass('JSONDecodeError', [EXC.ValueError]); JSONDecodeError.isException = true; EXC.JSONDecodeError = JSONDecodeError;
    return mod('json', {
      dumps: function* ([o], kwargs) { const indent = kwargs.has('indent') && kwargs.get('indent') !== NONE ? Number(kwargs.get('indent').v) : null; const sortKeys = kwargs.get('sort_keys') === TRUE; const ensureAscii = !(kwargs.has('ensure_ascii') && kwargs.get('ensure_ascii') === FALSE); return str(yield* dumps(o, indent, 0, sortKeys, ensureAscii)); },
      loads: ([s]) => parse(s.v),
      dump: function* ([o, f], kwargs) { const indent = kwargs.has('indent') && kwargs.get('indent') !== NONE ? Number(kwargs.get('indent').v) : null; const text = yield* dumps(o, indent, 0, false, true); yield* interp.call(yield* interp.getattr(f, 'write'), [str(text)], new Map()); return NONE; },
      load: function* ([f]) { const text = yield* interp.call(yield* interp.getattr(f, 'read'), [], new Map()); return parse(text.v); },
      JSONDecodeError,
    });
  });

  F.set('string', () => mod('string', {
    ascii_lowercase: internStr('abcdefghijklmnopqrstuvwxyz'), ascii_uppercase: internStr('ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
    ascii_letters: internStr('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'), digits: internStr('0123456789'), hexdigits: internStr('0123456789abcdefABCDEF'),
    punctuation: internStr('!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~'), whitespace: internStr(' \t\n\r\x0b\x0c'),
  }));

  F.set('dataclasses', () => {
    const FrozenInstanceError = new PyClass('FrozenInstanceError', [EXC.AttributeError]); FrozenInstanceError.isException = true; EXC.FrozenInstanceError = FrozenInstanceError;
    const MISSING = { id: 0, cls: TYPES.object, reprText: 'MISSING' };
    const fieldObj = (args, kwargs) => { const f = new PyInstance(TYPES.object); f.isField = true; f.default = kwargs.get('default') ?? MISSING; f.factory = kwargs.get('default_factory') ?? MISSING; return f; };
    const decorate = function* (cls, opts) {
      const fields = [];
      for (const base of [...cls.mro].reverse()) if (base.dcFields) for (const f of base.dcFields) if (!fields.some(x => x.name === f.name)) fields.push(f);
      for (const { name, default: def } of cls.fields || []) {
        const spec = { name, default: MISSING, factory: MISSING };
        if (def !== undefined) { if (def instanceof PyInstance && def.isField) { spec.default = def.default; spec.factory = def.factory; cls.dict.delete(name); if (def.default !== MISSING) cls.dict.set(name, def.default); } else { if (def instanceof PyList || def instanceof PyDict || def instanceof PySet) raise('ValueError', `mutable default <class '${typeName(def)}'> for field ${name} is not allowed: use default_factory`); spec.default = def; } }
        const i = fields.findIndex(f => f.name === name);
        if (i >= 0) fields[i] = spec; else fields.push(spec);
      }
      cls.dcFields = fields;
      cls.dict.set('__dataclass_fields__', new PyTuple(fields.map(f => internStr(f.name))));
      cls.dict.set('__match_args__', new PyTuple(fields.map(f => internStr(f.name))));
      if (opts.init && !cls.dict.has('__init__')) {
        cls.dict.set('__init__', new PyBuiltin('__init__', function* ([self, ...args], kwargs) {
          if (args.length > fields.length) raise('TypeError', `${cls.name}.__init__() takes ${fields.length + 1} positional arguments but ${args.length + 1} were given`);
          const missing = [];
          for (let i = 0; i < fields.length; i++) {
            const f = fields[i];
            let v;
            if (i < args.length) v = args[i];
            else if (kwargs.has(f.name)) v = kwargs.get(f.name);
            else if (f.default !== MISSING) v = f.default;
            else if (f.factory !== MISSING) v = yield* interp.call(f.factory, [], new Map());
            else { missing.push(f.name); continue; }
            self.dict.set(f.name, v);
          }
          for (const k of kwargs.keys()) if (!fields.some(f => f.name === k)) raise('TypeError', `${cls.name}.__init__() got an unexpected keyword argument '${k}'`);
          if (missing.length) raise('TypeError', `${cls.name}.__init__() missing ${missing.length} required positional argument${missing.length > 1 ? 's' : ''}: ${missing.map(m => `'${m}'`).join(missing.length === 2 ? ' and ' : ', ')}`);
          if (opts.frozen) self.frozen = true;
          const post = cls.lookup('__post_init__');
          if (post !== undefined) yield* interp.call(post, [self], new Map());
          return NONE;
        }));
        if (opts.frozen) cls.dict.set('__setattr__', new PyBuiltin('__setattr__', ([self, name]) => raise('FrozenInstanceError', `cannot assign to field '${name.v}'`)));
      }
      if (opts.repr && !cls.dict.has('__repr__')) cls.dict.set('__repr__', new PyBuiltin('__repr__', function* ([self]) { const parts = []; for (const f of fields) parts.push(`${f.name}=${yield* reprOf(interp, self.dict.get(f.name) ?? NONE)}`); return str(`${cls.name}(${parts.join(', ')})`); }));
      if (opts.eq && !cls.dict.has('__eq__')) cls.dict.set('__eq__', new PyBuiltin('__eq__', function* ([a, b]) { if (!(b instanceof PyInstance) || b.cls !== a.cls) return FALSE; for (const f of fields) if (!(yield* equals(interp, a.dict.get(f.name), b.dict.get(f.name)))) return FALSE; return TRUE; }));
      if (opts.order) { const tupleOf = s => new PyTuple(fields.map(f => s.dict.get(f.name))); for (const op of ['__lt__', '__le__', '__gt__', '__ge__']) cls.dict.set(op, new PyBuiltin(op, function* ([a, b]) { if (!(b instanceof PyInstance) || b.cls !== a.cls) raise('TypeError', `'${op.slice(2, 4)}' not supported between instances of '${a.cls.name}' and '${typeName(b)}'`); return bool(yield* compare(interp, { __lt__: '<', __le__: '<=', __gt__: '>', __ge__: '>=' }[op], tupleOf(a), tupleOf(b))); })); }
      if (opts.frozen && opts.eq && !cls.dict.has('__hash__')) cls.dict.set('__hash__', new PyBuiltin('__hash__', ([self]) => { let h = 7n; for (const f of fields) { const k = hashKey(self.dict.get(f.name)); for (const ch of String(k)) h = (h * 31n + BigInt(ch.charCodeAt(0))) & 0xffffffffn; } return int(h); }));
      else if (opts.eq && !opts.frozen && !cls.dict.has('__hash__')) cls.dict.set('__hash__', NONE);
      return cls;
    };
    const dataclass = function* (args, kwargs) {
      const opts = { init: kwargs.get('init') !== FALSE, repr: kwargs.get('repr') !== FALSE, eq: kwargs.get('eq') !== FALSE, order: kwargs.get('order') === TRUE, frozen: kwargs.get('frozen') === TRUE };
      if (args.length === 1 && args[0] instanceof PyClass) return yield* decorate(args[0], opts);
      return new PyBuiltin('dataclass', function* ([cls]) { return yield* decorate(cls, opts); });
    };
    return mod('dataclasses', {
      dataclass, field: fieldObj, FrozenInstanceError,
      asdict: ([o]) => { const d = new PyDict(); for (const f of o.cls.dcFields || []) d.map.set('s' + f.name, { k: internStr(f.name), v: o.dict.get(f.name) }); return d; },
      astuple: ([o]) => new PyTuple((o.cls.dcFields || []).map(f => o.dict.get(f.name))),
      fields: ([o]) => new PyTuple(((o instanceof PyClass ? o : o.cls).dcFields || []).map(f => { const i = new PyInstance(TYPES.object); i.attrs = { name: internStr(f.name) }; i.reprText = `Field(name='${f.name}')`; return i; })),
      replace: function* ([o], kwargs) { const args = (o.cls.dcFields || []).map(f => kwargs.get(f.name) ?? o.dict.get(f.name)); return yield* interp.call(o.cls, args, new Map()); },
    });
  });

  F.set('typing', () => {
    const any = name => { const c = new PyClass(name, [TYPES.object]); c.reprText = `typing.${name}`; return c; };
    const names = ['Any', 'List', 'Dict', 'Set', 'Tuple', 'Optional', 'Union', 'Callable', 'Iterable', 'Iterator', 'Sequence', 'Mapping', 'TypeVar', 'Generic', 'Protocol', 'Final', 'ClassVar', 'Literal', 'TypedDict', 'NamedTuple', 'Self', 'Generator', 'Deque', 'DefaultDict', 'Type', 'NoReturn', 'Never'];
    const entries = {};
    for (const n of names) entries[n] = any(n);
    entries.TypeVar = ([name]) => { const c = new PyClass(name.v, [TYPES.object]); c.reprText = `~${name.v}`; return c; };
    entries.NamedTuple = entries.NamedTuple;
    entries.cast = ([, v]) => v;
    entries.overload = ([f]) => f;
    entries.final = ([f]) => f;
    entries.runtime_checkable = ([c]) => c;
    entries.get_type_hints = () => new PyDict();
    entries.TYPE_CHECKING = FALSE;
    return mod('typing', entries);
  });
  F.set('abc', () => { const ABC = new PyClass('ABC', [TYPES.object]); return mod('abc', { ABC, abstractmethod: ([f]) => { f.abstract = true; return f; }, ABCMeta: TYPES.type }); });
  F.set('enum', () => {
    const Enum = new PyClass('Enum', [TYPES.object]); Enum.module = 'enum';
    const auto = () => { const a = new PyInstance(TYPES.object); a.isAuto = true; return a; };
    return mod('enum', { Enum, auto, IntEnum: Enum });
  });

  F.set('sys', () => mod('sys', {
    maxsize: int(9223372036854775807n), version: internStr('3.12.0 (stand)'), platform: internStr('stand'), argv: new PyList([internStr('main.py')]),
    getsizeof: ([o]) => {
      if (o instanceof PyBool) return int(28n);
      if (o instanceof PyInt) { const bits = (o.v < 0n ? -o.v : o.v).toString(2).length; return int(BigInt(o.v === 0n ? 28 : 28 + 4 * Math.max(0, Math.ceil(bits / 30) - 1))); }
      if (o instanceof PyFloat) return int(24n);
      if (o instanceof PyStr) return int(BigInt(49 + new TextEncoder().encode(o.v).length + (/[^\x00-\x7f]/.test(o.v) ? 25 : 0)));
      if (o instanceof PyList) return int(BigInt(56 + 8 * o.allocated));
      if (o instanceof PyTuple) return int(BigInt(40 + 8 * o.items.length));
      if (o instanceof PyDict) { let size = 8; while (o.map.size * 3 >= size * 2) size *= 2; return int(BigInt(o.map.size === 0 ? 64 : 48 + size + 24 * Math.floor(size * 2 / 3) + (size > 128 ? 0 : 0))); }
      if (o instanceof PySet) { let size = 8; while (o.map.size * 5 >= size * 3) size *= 4; return int(BigInt(200 + (size > 8 ? 16 * size : 0))); }
      if (o === NONE) return int(16n);
      if (o instanceof PyInstance) return int(56n);
      return int(64n);
    },
    getrecursionlimit: () => int(BigInt(interp.recursionLimit)),
    setrecursionlimit: ([n]) => { interp.recursionLimit = Number(n.v); return NONE; },
    getrefcount: ([o]) => { let n = 1; const count = v => { if (v === o) n++; }; for (const v of interp.globals.vars.values()) { count(v); if (v instanceof PyList || v instanceof PyTuple) v.items.forEach(count); if (v instanceof PyDict) v.entries().forEach(e => { count(e.k); count(e.v); }); } for (const f of interp.frames) for (const v of f.scope.vars.values()) count(v); if (o instanceof PyInt && o.v >= -5n && o.v <= 256n) n += 2; return int(BigInt(n + 1)); },
    intern: ([s]) => internStr(s.v),
    exit: () => { throw new PyError(makeExc(EXC.SystemExit, [])); },
    stdout: { id: 0, cls: TYPES.TextIOWrapper, reprText: '<stdout>', methods: { write: ([t]) => { interp.write(t.v); return int(BigInt(t.chars.length)); }, flush: () => NONE } },
  }));

  F.set('time', () => mod('time', {
    time: () => float(1700000000 + (interp.clock += 0.001)),
    perf_counter: () => float(interp.clock += 0.0005),
    monotonic: () => float(interp.clock += 0.0005),
    sleep: ([s]) => { interp.clock += asNum(s); return NONE; },
    strftime: ([fmt]) => str(fmt.v.replace('%Y', '2026').replace('%m', '10').replace('%d', '07').replace('%H', '12').replace('%M', '00')),
  }));

  F.set('operator', () => mod('operator', {
    itemgetter: args => new PyBuiltin('itemgetter', function* ([o]) { if (args.length === 1) return yield* interp.getitem(o, args[0]); const out = []; for (const k of args) out.push(yield* interp.getitem(o, k)); return new PyTuple(out); }),
    attrgetter: ([name]) => new PyBuiltin('attrgetter', function* ([o]) { let v = o; for (const part of name.v.split('.')) v = yield* interp.getattr(v, part); return v; }),
    add: function* ([a, b]) { return yield* interp.binop('+', a, b); }, mul: function* ([a, b]) { return yield* interp.binop('*', a, b); }, sub: function* ([a, b]) { return yield* interp.binop('-', a, b); },
    neg: function* ([a]) { return yield* interp.binop('-', int(0n), a); },
  }));

  F.set('statistics', () => mod('statistics', {
    mean: function* ([it]) { const items = yield* toList(interp, it); if (!items.length) raise('StatisticsError', 'mean requires at least one data point'); const s = items.reduce((a, x) => a + asNum(x), 0); const r = s / items.length; return items.every(x => x instanceof PyInt) && Number.isInteger(r) ? int(BigInt(r)) : float(r); },
    median: function* ([it]) { const items = (yield* toList(interp, it)).map(asNum).sort((a, b) => a - b); const n = items.length; if (!n) raise('StatisticsError', 'no median for empty data'); const m = n % 2 ? items[(n - 1) / 2] : (items[n / 2 - 1] + items[n / 2]) / 2; return Number.isInteger(m) && n % 2 ? int(BigInt(m)) : float(m); },
    mode: function* ([it]) { const items = yield* toList(interp, it); const counts = new Map(); let best = null, bestN = 0; for (const x of items) { const k = hashKey(x); const n = (counts.get(k) || 0) + 1; counts.set(k, n); if (n > bestN) { bestN = n; best = x; } } return best; },
    stdev: function* ([it]) { const items = (yield* toList(interp, it)).map(asNum); const m = items.reduce((a, b) => a + b, 0) / items.length; return float(Math.sqrt(items.reduce((a, x) => a + (x - m) ** 2, 0) / (items.length - 1))); },
  }));

  F.set('fractions', () => {
    const Fraction = new PyClass('Fraction', [TYPES.object]); Fraction.module = 'fractions';
    const make = (n, d) => { if (d === 0n) raise('ZeroDivisionError', 'Fraction(…, 0)'); if (d < 0n) { n = -n; d = -d; } const g = gcd(n, d) || 1n; const f = new PyInstance(Fraction); f.num = n / g; f.den = d / g; f.attrs = { numerator: int(f.num), denominator: int(f.den) }; return f; };
    const from = o => { if (o instanceof PyInstance && o.cls === Fraction) return [o.num, o.den]; if (o instanceof PyInt) return [o.v, 1n]; if (o instanceof PyFloat) { let d = 1n, v = o.v; while (!Number.isInteger(v)) { v *= 2; d *= 2n; } return [BigInt(v), d]; } if (o instanceof PyStr) { const m = o.v.trim().match(/^(-?\d+)(?:\/(\d+))?$/); if (!m) { const dec = o.v.trim().match(/^(-?)(\d*)\.(\d+)$/); if (!dec) raise('ValueError', `Invalid literal for Fraction: '${o.v}'`); const scale = 10n ** BigInt(dec[3].length); return [BigInt((dec[1] || '') + (dec[2] || '0') + dec[3]), scale]; } return [BigInt(m[1]), BigInt(m[2] || 1)]; } raise('TypeError', 'argument should be a string or a Rational instance'); };
    Fraction.construct = args => { if (!args.length) return make(0n, 1n); const [n, d] = from(args[0]); if (args.length > 1) { const [n2, d2] = from(args[1]); return make(n * d2, d * n2); } return make(n, d); };
    const fm = (name, fn) => Fraction.dict.set(name, new PyBuiltin(name, fn));
    const arith = (op) => ([a, b]) => { const [n1, d1] = from(a), [n2, d2] = from(b); if (b instanceof PyFloat) { const x = Number(n1) / Number(d1), y = b.v; return float(op === '+' ? x + y : op === '-' ? x - y : op === '*' ? x * y : x / y); } switch (op) { case '+': return make(n1 * d2 + n2 * d1, d1 * d2); case '-': return make(n1 * d2 - n2 * d1, d1 * d2); case '*': return make(n1 * n2, d1 * d2); default: return make(n1 * d2, d1 * n2); } };
    fm('__add__', arith('+')); fm('__radd__', ([a, b]) => arith('+')([b, a])); fm('__sub__', arith('-')); fm('__rsub__', ([a, b]) => arith('-')([b, a])); fm('__mul__', arith('*')); fm('__rmul__', ([a, b]) => arith('*')([b, a])); fm('__truediv__', arith('/')); fm('__rtruediv__', ([a, b]) => arith('/')([b, a]));
    fm('__eq__', ([a, b]) => { const [n1, d1] = from(a); if (b instanceof PyFloat) return bool(Number(n1) / Number(d1) === b.v); const [n2, d2] = from(b); return bool(n1 === n2 && d1 === d2); });
    fm('__lt__', ([a, b]) => { const [n1, d1] = from(a), [n2, d2] = from(b); return bool(n1 * d2 < n2 * d1); });
    fm('__gt__', ([a, b]) => { const [n1, d1] = from(a), [n2, d2] = from(b); return bool(n1 * d2 > n2 * d1); });
    fm('__le__', ([a, b]) => { const [n1, d1] = from(a), [n2, d2] = from(b); return bool(n1 * d2 <= n2 * d1); });
    fm('__neg__', ([a]) => make(-a.num, a.den));
    fm('__abs__', ([a]) => make(a.num < 0n ? -a.num : a.num, a.den));
    fm('__float__', ([a]) => float(Number(a.num) / Number(a.den)));
    fm('__int__', ([a]) => int(a.num / a.den));
    fm('__hash__', ([a]) => int(a.den === 1n ? a.num : a.num * 1000003n + a.den));
    fm('__bool__', ([a]) => bool(a.num !== 0n));
    fm('__repr__', ([a]) => str(`Fraction(${a.num}, ${a.den})`));
    fm('__str__', ([a]) => str(a.den === 1n ? `${a.num}` : `${a.num}/${a.den}`));
    fm('limit_denominator', ([a, m]) => { const max = m ? m.v : 1000000n; if (a.den <= max) return a; let [p0, q0, p1, q1] = [0n, 1n, 1n, 0n]; let n = a.num, d = a.den; for (;;) { const k = n / d; const q2 = q0 + k * q1; if (q2 > max) break; [p0, q0, p1, q1] = [p1, q1, p0 + k * p1, q2]; [n, d] = [d, n - k * d]; } const k = (max - q0) / q1; const b1 = make(p0 + k * p1, q0 + k * q1), b2 = make(p1, q1); const diff = f => { const x = Number(f.num) / Number(f.den) - Number(a.num) / Number(a.den); return Math.abs(x); }; return diff(b2) <= diff(b1) ? b2 : b1; });
    return mod('fractions', { Fraction });
  });

  F.set('decimal', () => {
    const Decimal = new PyClass('Decimal', [TYPES.object]); Decimal.module = 'decimal';
    const make = (mant, exp) => { const d = new PyInstance(Decimal); d.mant = mant; d.exp = exp; return d; };
    const parse = o => { if (o instanceof PyInstance && o.cls === Decimal) return o; if (o instanceof PyInt) return make(o.v, 0); if (o instanceof PyFloat) { const s = o.v.toPrecision(60).replace(/0+$/, ''); return parse(str(s.includes('.') ? s.replace(/\.$/, '') : s)); } const m = o.v.trim().match(/^(-?)(\d*)\.?(\d*)(?:[eE]([+-]?\d+))?$/); if (!m || (!m[2] && !m[3])) raise('InvalidOperation', '[<class \'decimal.ConversionSyntax\'>]'); const digits = (m[2] || '') + (m[3] || ''); return make(BigInt((m[1] || '') + (digits || '0')), -(m[3] || '').length + Number(m[4] || 0)); };
    const align = (a, b) => { const e = Math.min(a.exp, b.exp); return [a.mant * 10n ** BigInt(a.exp - e), b.mant * 10n ** BigInt(b.exp - e), e]; };
    const toStr = d => { let s = (d.mant < 0n ? -d.mant : d.mant).toString(); const sign = d.mant < 0n ? '-' : ''; if (d.exp >= 0) return sign + s + (d.exp > 0 && s !== '0' ? 'E+' + d.exp : (d.exp > 0 ? 'E+' + d.exp : '')); const k = -d.exp; if (s.length <= k) s = '0'.repeat(k - s.length + 1) + s; return sign + s.slice(0, s.length - k) + '.' + s.slice(s.length - k); };
    Decimal.construct = args => (args.length ? parse(args[0]) : make(0n, 0));
    const dm = (name, fn) => Decimal.dict.set(name, new PyBuiltin(name, fn));
    dm('__add__', ([a, b]) => { const [x, y, e] = align(a, parse(b)); return make(x + y, e); });
    dm('__sub__', ([a, b]) => { const [x, y, e] = align(a, parse(b)); return make(x - y, e); });
    dm('__mul__', ([a, b]) => { const q = parse(b); return make(a.mant * q.mant, a.exp + q.exp); });
    dm('__truediv__', ([a, b]) => { const q = parse(b); if (q.mant === 0n) raise('ZeroDivisionError', '[<class \'decimal.DivisionByZero\'>]'); let num = a.mant, exp = a.exp - q.exp; let scale = 0; while (scale < 28 && (num % q.mant !== 0n)) { num *= 10n; scale++; } const r = make(num / q.mant, exp - scale); while (r.exp < 0 && r.mant % 10n === 0n && r.mant !== 0n) { r.mant /= 10n; r.exp++; } return r; });
    dm('__eq__', ([a, b]) => { const [x, y] = align(a, parse(b)); return bool(x === y); });
    dm('__lt__', ([a, b]) => { const [x, y] = align(a, parse(b)); return bool(x < y); });
    dm('__gt__', ([a, b]) => { const [x, y] = align(a, parse(b)); return bool(x > y); });
    dm('__str__', ([a]) => str(toStr(a)));
    dm('__repr__', ([a]) => str(`Decimal('${toStr(a)}')`));
    dm('__hash__', ([a]) => int(a.mant));
    dm('__float__', ([a]) => float(Number(a.mant) * 10 ** a.exp));
    dm('quantize', ([a, q]) => { const target = parse(q).exp; const [x] = align(a, make(0n, target)); const scale = 10n ** BigInt(target - Math.min(a.exp, target)); let m = x / scale; const rem = x % scale; if (rem * 2n > scale || (rem * 2n === scale && m % 2n !== 0n)) m += 1n; else if (rem * 2n < -scale || (rem * 2n === -scale && m % 2n !== 0n)) m -= 1n; return make(m, target); });
    return mod('decimal', { Decimal, getcontext: () => { const c = new PyInstance(TYPES.object); c.attrs = { prec: int(28n) }; c.attrsWritable = true; return c; } });
  });

  F.set('re', () => {
    const toJs = (pattern, flags) => { let f = 'gu'; if (flags && (flags.v & 2n)) f += 'i'; if (flags && (flags.v & 8n)) f += 'm'; if (flags && (flags.v & 16n)) f += 's'; const src = pattern.v.replace(/\(\?P<(\w+)>/g, '(?<$1>').replace(/\(\?P=(\w+)\)/g, '\\k<$1>'); try { return new RegExp(src, f); } catch (e) { return raise('error', e.message); } };
    const Match = new PyClass('Match', [TYPES.object]); Match.module = 're';
    const matchObj = (m, text) => { const o = new PyInstance(Match); o.m = m; o.text = text; o.reprText = `<re.Match object; span=(${m.index}, ${m.index + m[0].length}), match=${JSON.stringify(m[0]).replace(/^"|"$/g, "'")}>`; return o; };
    const mm = (name, fn) => Match.dict.set(name, new PyBuiltin(name, fn));
    mm('group', ([o, ...idx]) => { if (!idx.length) return str(o.m[0]); const get = i => { const v = i instanceof PyStr ? o.m.groups?.[i.v] : o.m[Number(i.v)]; return v === undefined ? NONE : str(v); }; return idx.length === 1 ? get(idx[0]) : new PyTuple(idx.map(get)); });
    mm('groups', ([o]) => new PyTuple(o.m.slice(1).map(g => (g === undefined ? NONE : str(g)))));
    mm('groupdict', ([o]) => { const d = new PyDict(); for (const [k, v] of Object.entries(o.m.groups || {})) d.map.set('s' + k, { k: str(k), v: v === undefined ? NONE : str(v) }); return d; });
    mm('start', ([o]) => int(BigInt(o.m.index)));
    mm('end', ([o]) => int(BigInt(o.m.index + o.m[0].length)));
    mm('span', ([o]) => new PyTuple([int(BigInt(o.m.index)), int(BigInt(o.m.index + o.m[0].length))]));
    mm('__getitem__', ([o, i]) => str(i instanceof PyStr ? o.m.groups[i.v] : o.m[Number(i.v)]));
    mm('__bool__', () => TRUE);
    const Pattern = new PyClass('Pattern', [TYPES.object]); Pattern.module = 're';
    const fns = {
      findall: ([p, s, fl]) => { const re = toJs(p instanceof PyInstance ? p.pat : p, fl); const out = []; for (const m of s.v.matchAll(re)) out.push(m.length > 2 ? new PyTuple(m.slice(1).map(g => str(g ?? ''))) : str(m.length === 2 ? (m[1] ?? '') : m[0])); return new PyList(out); },
      search: ([p, s, fl]) => { const re = toJs(p instanceof PyInstance ? p.pat : p, fl); re.lastIndex = 0; const m = re.exec(s.v); return m ? matchObj(m, s.v) : NONE; },
      match: ([p, s, fl]) => { const re = toJs(p instanceof PyInstance ? p.pat : p, fl); re.lastIndex = 0; const m = re.exec(s.v); return m && m.index === 0 ? matchObj(m, s.v) : NONE; },
      fullmatch: ([p, s, fl]) => { const re = toJs(p instanceof PyInstance ? p.pat : p, fl); const m = re.exec(s.v); return m && m.index === 0 && m[0].length === s.v.length ? matchObj(m, s.v) : NONE; },
      sub: function* ([p, repl, s, count]) { const re = toJs(p instanceof PyInstance ? p.pat : p); let n = 0; const limit = count ? Number(count.v) : Infinity; const parts = []; let last = 0; for (const m of s.v.matchAll(re)) { if (n >= limit) break; parts.push(s.v.slice(last, m.index)); if (repl instanceof PyStr) parts.push(repl.v.replace(/\\(\d)/g, (_, g) => m[Number(g)] ?? '').replace(/\\g<(\w+)>/g, (_, g) => (m.groups?.[g] ?? m[Number(g)] ?? ''))); else parts.push((yield* interp.call(repl, [matchObj(m, s.v)], new Map())).v); last = m.index + m[0].length; n++; } parts.push(s.v.slice(last)); return str(parts.join('')); },
      split: ([p, s]) => { const re = toJs(p instanceof PyInstance ? p.pat : p); return new PyList(s.v.split(re).map(x => str(x ?? ''))); },
      finditer: ([p, s]) => { const re = toJs(p instanceof PyInstance ? p.pat : p); const ms = [...s.v.matchAll(re)]; let i = 0; return new PyIterator('list_iterator', function* () { return i < ms.length ? matchObj(ms[i++], s.v) : STOP; }); },
      compile: ([p, fl]) => { const o = new PyInstance(Pattern); o.pat = p; o.flags = fl; o.reprText = `re.compile(${JSON.stringify(p.v).replace(/^"|"$/g, "'")})`; return o; },
      escape: ([s]) => str(s.v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      IGNORECASE: int(2n), I: int(2n), MULTILINE: int(8n), M: int(8n), DOTALL: int(16n), S: int(16n), VERBOSE: int(64n),
    };
    for (const name of ['findall', 'search', 'match', 'fullmatch', 'sub', 'split', 'finditer']) Pattern.dict.set(name, new PyBuiltin(name, (args, kw) => fns[name]([args[0], ...args.slice(1)], kw)));
    return mod('re', { ...fns, Match, Pattern });
  });

  F.set('datetime', () => {
    const date = new PyClass('date', [TYPES.object]); date.module = 'datetime';
    date.construct = ([y, m, d]) => { const o = new PyInstance(date); o.attrs = { year: y, month: m, day: d }; o.reprText = `datetime.date(${y.v}, ${m.v}, ${d.v})`; return o; };
    date.dict.set('__str__', new PyBuiltin('__str__', ([o]) => str(`${o.attrs.year.v}-${String(o.attrs.month.v).padStart(2, '0')}-${String(o.attrs.day.v).padStart(2, '0')}`)));
    date.dict.set('today', new PyBuiltin('today', () => date.construct([int(2026n), int(10n), int(7n)])));
    date.dict.set('weekday', new PyBuiltin('weekday', ([o]) => int(BigInt((new Date(Date.UTC(Number(o.attrs.year.v), Number(o.attrs.month.v) - 1, Number(o.attrs.day.v))).getUTCDay() + 6) % 7))));
    date.dict.set('__sub__', new PyBuiltin('__sub__', ([a, b]) => { const ms = Date.UTC(Number(a.attrs.year.v), Number(a.attrs.month.v) - 1, Number(a.attrs.day.v)) - Date.UTC(Number(b.attrs.year.v), Number(b.attrs.month.v) - 1, Number(b.attrs.day.v)); const td = new PyInstance(TYPES.object); td.attrs = { days: int(BigInt(Math.round(ms / 86400000))) }; td.reprText = `datetime.timedelta(days=${Math.round(ms / 86400000)})`; return td; }));
    date.dict.set('__lt__', new PyBuiltin('__lt__', ([a, b]) => bool(String(a.attrs.year.v).padStart(4, '0') + String(a.attrs.month.v).padStart(2, '0') + String(a.attrs.day.v).padStart(2, '0') < String(b.attrs.year.v).padStart(4, '0') + String(b.attrs.month.v).padStart(2, '0') + String(b.attrs.day.v).padStart(2, '0'))));
    return mod('datetime', { date, datetime: date });
  });

  F.set('os', () => mod('os', { getcwd: () => internStr('/home/varvara'), linesep: internStr('\n'), sep: internStr('/'), listdir: () => new PyList(Object.keys(interp.files).map(f => str(f))), path: mod('os.path', { exists: ([p]) => bool(p.v in interp.files), join: args => str(args.map(a => a.v).join('/')), basename: ([p]) => str(p.v.split('/').pop()), splitext: ([p]) => { const i = p.v.lastIndexOf('.'); return new PyTuple(i > 0 ? [str(p.v.slice(0, i)), str(p.v.slice(i))] : [p, internStr('')]); } }), remove: ([p]) => { if (!(p.v in interp.files)) raise('FileNotFoundError', `[Errno 2] No such file or directory: '${p.v}'`); delete interp.files[p.v]; return NONE; } }));
  F.set('os.path', () => F.get('os')().dict.get('path'));
  F.set('pathlib', () => {
    const Path = new PyClass('Path', [TYPES.object]); Path.module = 'pathlib';
    Path.construct = args => { const p = new PyInstance(Path); p.path = args.map(a => a.v).join('/') || '.'; p.reprText = `PosixPath('${p.path}')`; return p; };
    const pm = (name, fn) => Path.dict.set(name, new PyBuiltin(name, fn));
    pm('__str__', ([p]) => str(p.path));
    pm('__truediv__', ([p, o]) => Path.construct([str(p.path + '/' + (o instanceof PyStr ? o.v : o.path))]));
    pm('exists', ([p]) => bool(p.path in interp.files));
    pm('read_text', ([p]) => { if (!(p.path in interp.files)) raise('FileNotFoundError', `[Errno 2] No such file or directory: '${p.path}'`); return str(interp.files[p.path]); });
    pm('write_text', ([p, t]) => { interp.files[p.path] = t.v; return int(BigInt(t.chars.length)); });
    pm('open', ([p, m]) => interp.builtins.get('open').fn([str(p.path), m ?? internStr('r')], new Map(), interp));
    Path.dict.set('name', new PyProperty(new PyBuiltin('name', ([p]) => str(p.path.split('/').pop()))));
    Path.dict.set('suffix', new PyProperty(new PyBuiltin('suffix', ([p]) => { const n = p.path.split('/').pop(); const i = n.lastIndexOf('.'); return str(i > 0 ? n.slice(i) : ''); })));
    Path.dict.set('stem', new PyProperty(new PyBuiltin('stem', ([p]) => { const n = p.path.split('/').pop(); const i = n.lastIndexOf('.'); return str(i > 0 ? n.slice(0, i) : n); })));
    Path.dict.set('parent', new PyProperty(new PyBuiltin('parent', ([p]) => Path.construct([str(p.path.includes('/') ? p.path.slice(0, p.path.lastIndexOf('/')) : '.')]))));
    return mod('pathlib', { Path });
  });
  F.set('__future__', () => mod('__future__', { annotations: NONE }));
  F.set('threading', () => mod('threading', {}));
  F.set('asyncio', () => mod('asyncio', {}));
}

