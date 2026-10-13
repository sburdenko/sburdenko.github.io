/**
 * Value model of the mini Python: every value is an object with a class and an identity, so the
 * memory view can draw names → objects and `is` / `id()` behave like CPython.
 */
let nextId = 1;
/** Object ids look like CPython addresses but stay small and readable. */
export const freshId = () => nextId++;
/** Ids below 10000 belong to objects created at import time (small ints, interned strings, types). */
export const resetIds = () => { nextId = 10000; };

export class PyError extends Error {
  constructor(exc) { super(exc && exc.message ? exc.message : 'python error'); this.exc = exc; }
}

/* ---------- classes ---------- */
export class PyClass {
  constructor(name, bases = [], dict = new Map(), builtin = true) {
    this.id = freshId();
    this.name = name;
    this.bases = bases;
    this.dict = dict;
    this.builtin = builtin;
    this.cls = null;
    this.mro = computeMro(this);
    this.module = 'builtins';
  }
  lookup(name) {
    for (const c of this.mro) if (c.dict.has(name)) return c.dict.get(name);
    return undefined;
  }
}

/** C3 linearisation, like CPython; falls back to a depth-first order if the hierarchy is inconsistent. */
export function computeMro(cls) {
  const merge = seqs => {
    const result = [];
    seqs = seqs.map(s => [...s]);
    for (;;) {
      seqs = seqs.filter(s => s.length);
      if (!seqs.length) return result;
      let head = null;
      for (const s of seqs) {
        const cand = s[0];
        if (!seqs.some(o => o.slice(1).includes(cand))) { head = cand; break; }
      }
      if (!head) throw new Error('Cannot create a consistent method resolution order (MRO)');
      result.push(head);
      seqs.forEach(s => { if (s[0] === head) s.shift(); });
    }
  };
  return [cls, ...merge([...cls.bases.map(b => b.mro), cls.bases])];
}

export const TYPES = {};
const mk = (name, bases = []) => { const c = new PyClass(name, bases); TYPES[name] = c; return c; };

mk('object');
mk('type', [TYPES.object]);
for (const name of ['int', 'float', 'str', 'bytes', 'list', 'tuple', 'dict', 'set', 'frozenset', 'NoneType', 'function', 'builtin_function_or_method', 'method',
  'range', 'generator', 'module', 'property', 'staticmethod', 'classmethod', 'slice', 'ellipsis', 'TextIOWrapper', 'enumerate', 'zip', 'map', 'filter',
  'reversed', 'list_iterator', 'dict_keys', 'dict_values', 'dict_items', 'super', 'cell']) mk(name, [TYPES.object]);
mk('bool', [TYPES.int]);
TYPES.object.cls = TYPES.type;
for (const c of Object.values(TYPES)) c.cls = TYPES.type;

/* ---------- primitive values ---------- */
export class PyInt { constructor(v) { this.id = freshId(); this.cls = TYPES.int; this.v = v; } }
export class PyFloat { constructor(v) { this.id = freshId(); this.cls = TYPES.float; this.v = v; } }
export class PyStr { constructor(v) { this.id = freshId(); this.cls = TYPES.str; this.v = v; this._chars = null; }
  get chars() { if (!this._chars) this._chars = Array.from(this.v); return this._chars; } }
export class PyBytes { constructor(bytes) { this.id = freshId(); this.cls = TYPES.bytes; this.bytes = bytes; } }
export class PyBool extends PyInt { constructor(v) { super(v ? 1n : 0n); this.cls = TYPES.bool; } }
export class PyNoneType { constructor() { this.id = freshId(); this.cls = TYPES.NoneType; } }

export const NONE = new PyNoneType();
export const TRUE = new PyBool(true);
export const FALSE = new PyBool(false);
export const ELLIPSIS = { id: freshId(), cls: TYPES.ellipsis };

const SMALL = new Map();
for (let i = -5; i <= 256; i++) SMALL.set(i, new PyInt(BigInt(i)));
/** Small ints are cached like CPython, so `a is b` holds for 5 and fails for 1000. */
export const int = v => {
  if (typeof v === 'number') v = BigInt(Math.trunc(v));
  if (v >= -5n && v <= 256n) return SMALL.get(Number(v));
  return new PyInt(v);
};
export const float = v => new PyFloat(v);
export const bool = v => (v ? TRUE : FALSE);
const INTERNED = new Map();
/** String constants from the source are interned, like CPython does for identifier-like literals. */
export const internStr = v => {
  if (!INTERNED.has(v)) INTERNED.set(v, new PyStr(v));
  return INTERNED.get(v);
};
export const str = v => (v.length <= 1 ? internStr(v) : new PyStr(v));

/* ---------- containers ---------- */
/** CPython's list over-allocation, so sys.getsizeof() tells the real story. */
export const growAllocation = n => (n === 0 ? 0 : (n + (n >> 3) + 6) & ~3);

export class PyList {
  constructor(items = []) { this.id = freshId(); this.cls = TYPES.list; this.items = items; this.allocated = items.length; }
  push(x) { this.items.push(x); if (this.items.length > this.allocated) this.allocated = growAllocation(this.items.length); }
}
export class PyTuple { constructor(items = []) { this.id = freshId(); this.cls = TYPES.tuple; this.items = items; } }
export class PyDict {
  constructor() { this.id = freshId(); this.cls = TYPES.dict; this.map = new Map(); }
  get size() { return this.map.size; }
  entries() { return [...this.map.values()]; }
  keys() { return this.entries().map(e => e.k); }
  values() { return this.entries().map(e => e.v); }
}
export class PySet {
  constructor(frozen = false) { this.id = freshId(); this.cls = frozen ? TYPES.frozenset : TYPES.set; this.map = new Map(); this.frozen = frozen; }
  get size() { return this.map.size; }
  items() { return orderedSetItems(this); }
}
export class PyRange {
  constructor(start, stop, step) { this.id = freshId(); this.cls = TYPES.range; this.start = start; this.stop = stop; this.step = step; }
  get length() {
    const { start, stop, step } = this;
    if (step > 0n) return stop > start ? (stop - start + step - 1n) / step : 0n;
    return start > stop ? (start - stop - step - 1n) / -step : 0n;
  }
  at(i) { return this.start + this.step * i; }
}
export class PySlice { constructor(lower, upper, step) { this.id = freshId(); this.cls = TYPES.slice; this.lower = lower; this.upper = upper; this.step = step; } }

/* ---------- callables and user objects ---------- */
export class PyFunction {
  constructor(name, params, body, scope, { defaults = [], kwdefaults = new Map(), isGen = false, isLambda = false, freeVars = [], module = '__main__' } = {}) {
    this.id = freshId(); this.cls = TYPES.function;
    this.name = name; this.params = params; this.body = body; this.scope = scope;
    this.defaults = defaults; this.kwdefaults = kwdefaults; this.isGen = isGen; this.isLambda = isLambda;
    this.freeVars = freeVars; this.dict = new Map(); this.qualname = name; this.module = module; this.doc = null;
  }
}
export class PyBuiltin {
  constructor(name, fn, self = null) { this.id = freshId(); this.cls = TYPES.builtin_function_or_method; this.name = name; this.fn = fn; this.self = self; }
}
export class PyMethod { constructor(fn, self) { this.id = freshId(); this.cls = TYPES.method; this.fn = fn; this.self = self; } }
export class PyInstance {
  constructor(cls) { this.id = freshId(); this.cls = cls; this.dict = new Map(); }
}
export class PyGenerator {
  constructor(name, body) { this.id = freshId(); this.cls = TYPES.generator; this.name = name; this.body = body; this.done = false; this.running = false; this.started = false; }
}
export class PyModule { constructor(name, dict) { this.id = freshId(); this.cls = TYPES.module; this.name = name; this.dict = dict; } }
export class PyProperty { constructor(fget, fset = null) { this.id = freshId(); this.cls = TYPES.property; this.fget = fget; this.fset = fset; } }
export class PyStaticMethod { constructor(fn) { this.id = freshId(); this.cls = TYPES.staticmethod; this.fn = fn; } }
export class PyClassMethod { constructor(fn) { this.id = freshId(); this.cls = TYPES.classmethod; this.fn = fn; } }
export class PyCell { constructor(scope, name) { this.id = freshId(); this.cls = TYPES.cell; this.scope = scope; this.name = name; } }
/** A lazy builtin iterator (enumerate, zip, map, …): `next` is a generator function yielding step events and returning the value. */
export class PyIterator {
  constructor(typeName, nextFn, extra = {}) { this.id = freshId(); this.cls = TYPES[typeName] || TYPES.generator; this.next = nextFn; this.done = false; Object.assign(this, extra); }
}

/* ---------- type tests ---------- */
export const isInt = o => o instanceof PyInt && !(o instanceof PyBool);
export const isBool = o => o instanceof PyBool;
export const isIntLike = o => o instanceof PyInt;
export const isFloat = o => o instanceof PyFloat;
export const isStr = o => o instanceof PyStr;
export const isList = o => o instanceof PyList;
export const isTuple = o => o instanceof PyTuple;
export const isDict = o => o instanceof PyDict;
export const isSet = o => o instanceof PySet;
export const isNone = o => o === NONE;
export const isClass = o => o instanceof PyClass;
export const isCallable = o => o instanceof PyFunction || o instanceof PyBuiltin || o instanceof PyMethod || o instanceof PyClass
  || (o instanceof PyInstance && o.cls.lookup('__call__') !== undefined);
export const typeOf = o => (o instanceof PyClass ? (o.cls || TYPES.type) : o.cls);
export const isSubclass = (c, base) => c.mro.includes(base);
export const isInstance = (o, cls) => isSubclass(typeOf(o), cls);
export const typeName = o => typeOf(o).name;

/* ---------- hashing (dict and set keys) ---------- */
export const UNHASHABLE = Symbol('unhashable');

/** A string key that is equal for Python-equal values, e.g. 1, 1.0 and True share one. */
export function hashKey(o) {
  if (o instanceof PyInt) return 'i' + o.v;
  if (o instanceof PyFloat) return Number.isInteger(o.v) && Number.isFinite(o.v) ? 'i' + BigInt(o.v) : 'f' + o.v;
  if (o instanceof PyStr) return 's' + o.v;
  if (o === NONE) return 'N';
  if (o instanceof PyBytes) return 'b' + Array.from(o.bytes).join(',');
  if (o instanceof PyTuple) { const ks = o.items.map(hashKey); return ks.includes(UNHASHABLE) ? UNHASHABLE : 't(' + ks.join('|') + ')'; }
  if (o instanceof PySet && o.frozen) return 'F(' + [...o.map.keys()].sort().join('|') + ')';
  if (o instanceof PyList || o instanceof PyDict || o instanceof PySet) return UNHASHABLE;
  if (o instanceof PyInstance) {
    if (o.cls.lookup('__eq__') !== undefined && o.cls.lookup('__hash__') === undefined) return UNHASHABLE;
    if (o.cls.lookup('__hash__') === NONE) return UNHASHABLE;
    if (o.hashValue !== undefined) return 'h' + o.hashValue;
    return 'o' + o.id;
  }
  return 'o' + o.id;
}

/** Numeric hash like CPython for ints and strings (strings use a stable FNV, CPython randomises). */
export function pyHash(o) {
  if (o instanceof PyInt) { const m = o.v % 2305843009213693951n; return m === -1n ? -2n : m; }
  if (o instanceof PyFloat) { return Number.isInteger(o.v) ? pyHash(int(BigInt(o.v))) : BigInt(Math.floor(o.v * 1000003)) % 2305843009213693951n; }
  if (o instanceof PyStr) {
    let h = 2166136261n;
    for (const ch of o.v) h = ((h ^ BigInt(ch.codePointAt(0))) * 16777619n) & 0xffffffffffffffffn;
    return h % 2305843009213693951n;
  }
  if (o === NONE) return 0xfca86420n >> 4n;
  if (o instanceof PyTuple) { let acc = 0x27d4eb2f165667c5n; for (const it of o.items) acc = (acc + pyHash(it) * 0xc2b2ae3d27d4eb4fn) & 0xffffffffffffffffn; return acc % 2305843009213693951n; }
  if (o instanceof PyInstance && o.hashValue !== undefined) return BigInt(o.hashValue);
  if (o instanceof PyInstance && o.cls.lookup('__hash__') === NONE) return 0n;
  return BigInt(o.id) * 16n;
}

/* ---------- set order emulation (CPython open addressing for int keys) ---------- */
const LINEAR_PROBES = 9, PERTURB_SHIFT = 5n;
function probeSlot(table, mask, hash) {
  const h = BigInt.asUintN(64, hash);
  let i = Number(h & BigInt(mask)), perturb = h;
  for (;;) {
    if (table[i] === null) return i;
    if (i + LINEAR_PROBES <= mask) for (let j = 1; j <= LINEAR_PROBES; j++) if (table[i + j] === null) return i + j;
    perturb >>= PERTURB_SHIFT;
    i = Number((BigInt(i) * 5n + 1n + perturb) & BigInt(mask));
  }
}
/** Replays the insertions into a CPython-sized table, including resizes, to get the iteration order. */
function orderedSetItems(set) {
  const values = [...set.map.values()];
  if (!values.length || !values.every(v => v instanceof PyInt)) return values;
  let size = set.initialSize || 8, table = new Array(size).fill(null), fill = 0;
  const resize = minused => { let newsize = 8; while (newsize <= minused) newsize <<= 1; const old = table.filter(x => x !== null); size = newsize; table = new Array(size).fill(null); for (const v of old) table[probeSlot(table, size - 1, pyHash(v))] = v; };
  for (const v of values) {
    table[probeSlot(table, size - 1, pyHash(v))] = v;
    fill++;
    if (fill * 5 >= (size - 1) * 3) resize(fill > 50000 ? fill * 2 : fill * 4);
  }
  return table.filter(x => x !== null);
}
/** Table size CPython picks when a set is built as a copy of another (set(s), s.copy(), s | t). */
export const copiedSetSize = used => { let n = 8; while (n <= used * 2) n <<= 1; return n; };

/* ---------- repr ---------- */
export function reprStr(s) {
  const useDouble = s.includes("'") && !s.includes('"');
  const q = useDouble ? '"' : "'";
  let out = q;
  for (const ch of s) {
    const code = ch.codePointAt(0);
    if (ch === '\\') out += '\\\\';
    else if (ch === q) out += '\\' + q;
    else if (ch === '\n') out += '\\n';
    else if (ch === '\t') out += '\\t';
    else if (ch === '\r') out += '\\r';
    else if (code < 32 || code === 127) out += '\\x' + code.toString(16).padStart(2, '0');
    else out += ch;
  }
  return out + q;
}

export function reprBytes(bytes) {
  let out = "b'";
  for (const b of bytes) {
    if (b === 0x5c) out += '\\\\';
    else if (b === 0x27) out += "\\'";
    else if (b === 0x0a) out += '\\n';
    else if (b === 0x0d) out += '\\r';
    else if (b === 0x09) out += '\\t';
    else if (b >= 32 && b < 127) out += String.fromCharCode(b);
    else out += '\\x' + b.toString(16).padStart(2, '0');
  }
  return out + "'";
}

/** Python's repr for floats: shortest round-trip digits, '.0' for integers, exponent at 1e16 / 1e-4. */
export function floatRepr(v) {
  if (Number.isNaN(v)) return 'nan';
  if (v === Infinity) return 'inf';
  if (v === -Infinity) return '-inf';
  if (v === 0) return Object.is(v, -0) ? '-0.0' : '0.0';
  const abs = Math.abs(v);
  if (abs >= 1e16 || abs < 1e-4) {
    const [mant, exp] = v.toExponential().split('e');
    const e = Number(exp);
    const m = mant.includes('.') ? mant : mant;
    return `${m}e${e < 0 ? '-' : '+'}${String(Math.abs(e)).padStart(2, '0')}`;
  }
  const s = String(v);
  if (s.includes('e')) {
    const [mant, exp] = s.split('e');
    const e = Number(exp);
    const digits = mant.replace('.', '').replace('-', '');
    const neg = v < 0 ? '-' : '';
    const pointAt = (mant.indexOf('.') < 0 ? mant.replace('-', '').length : mant.replace('-', '').indexOf('.')) + e;
    if (pointAt <= 0) return `${neg}0.${'0'.repeat(-pointAt)}${digits}`;
    if (pointAt >= digits.length) return `${neg}${digits}${'0'.repeat(pointAt - digits.length)}.0`;
    return `${neg}${digits.slice(0, pointAt)}.${digits.slice(pointAt)}`;
  }
  return s.includes('.') ? s : s + '.0';
}

export function isTruthy(o) {
  if (o === TRUE) return true;
  if (o === FALSE || o === NONE) return false;
  if (o instanceof PyInt) return o.v !== 0n;
  if (o instanceof PyFloat) return o.v !== 0;
  if (o instanceof PyStr) return o.v.length > 0;
  if (o instanceof PyList || o instanceof PyTuple) return o.items.length > 0;
  if (o instanceof PyDict || o instanceof PySet) return o.map.size > 0;
  if (o instanceof PyBytes) return o.bytes.length > 0;
  if (o instanceof PyRange) return o.length > 0n;
  return null;
}

/* ---------- number helpers ---------- */
export const toNumber = o => (o instanceof PyInt ? Number(o.v) : o.v);
export const bigFloorDiv = (a, b) => { const q = a / b; return (a % b !== 0n && ((a < 0n) !== (b < 0n))) ? q - 1n : q; };
export const bigMod = (a, b) => { const m = a % b; return m !== 0n && ((m < 0n) !== (b < 0n)) ? m + b : m; };
export const floatMod = (a, b) => { const m = a % b; return m !== 0 && ((m < 0) !== (b < 0)) ? m + b : m; };
export const bigPow = (a, b) => a ** b;

/** Index helper: Python index semantics (negative from the end), returns null when out of range. */
export function normIndex(i, length) {
  const n = Number(i);
  const j = n < 0 ? n + length : n;
  return j < 0 || j >= length ? null : j;
}

export function sliceIndices(slice, length, toInt) {
  const step = slice.step === NONE ? 1 : toInt(slice.step);
  if (step === 0) return null;
  const clampLo = v => Math.max(step < 0 ? -1 : 0, Math.min(step < 0 ? length - 1 : length, v < 0 ? v + length : v));
  const lower = slice.lower === NONE ? (step < 0 ? length - 1 : 0) : clampLo(toInt(slice.lower));
  const upper = slice.upper === NONE ? (step < 0 ? -1 : length) : clampLo(toInt(slice.upper));
  const idx = [];
  if (step > 0) for (let i = lower; i < upper; i += step) idx.push(i);
  else for (let i = lower; i > upper; i += step) idx.push(i);
  return idx;
}
