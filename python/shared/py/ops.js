/** Operators, comparisons, truthiness, iteration and item access. Generators, because user dunders may run. */
import {
  PyInt, PyBool, PyFloat, PyStr, PyBytes, PyList, PyTuple, PyDict, PySet, PyRange, PyInstance, PyIterator, PyGenerator, PyClass, PySlice,
  NONE, TRUE, FALSE, int, float, bool, str, isTruthy, hashKey, UNHASHABLE, copiedSetSize, bigFloorDiv, bigMod, floatMod, typeName, isIntLike, normIndex, sliceIndices, toNumber,
} from './objects.js?v=202610071658';
import { raise, pyError, EXC } from './errors.js?v=202610071658';
import { TYPES } from './objects.js?v=202610071658';
import { percentFormat } from './convert.js?v=202610071658';

export const STOP = Symbol('StopIteration');

/** Computes a user-defined __hash__ once per object so hashKey() can use it synchronously. */
export function* hashReady(interp, o) {
  if (!(o instanceof PyInstance) || o.hashValue !== undefined) return o;
  const fn = o.cls.lookup('__hash__');
  if (fn === undefined || fn === NONE || fn.isDefault || (fn.fn && fn === TYPES.object.dict.get('__hash__'))) return o;
  const r = yield* interp.call(fn, [o], new Map());
  if (!isIntLike(r)) raise('TypeError', '__hash__ method should return an integer');
  o.hashValue = r.v.toString();
  return o;
}
export const NOT_IMPLEMENTED = { id: 0, cls: null, reprText: 'NotImplemented' };

const DUNDER = {
  '+': ['__add__', '__radd__'], '-': ['__sub__', '__rsub__'], '*': ['__mul__', '__rmul__'], '/': ['__truediv__', '__rtruediv__'],
  '//': ['__floordiv__', '__rfloordiv__'], '%': ['__mod__', '__rmod__'], '**': ['__pow__', '__rpow__'], '&': ['__and__', '__rand__'],
  '|': ['__or__', '__ror__'], '^': ['__xor__', '__rxor__'], '<<': ['__lshift__', '__rlshift__'], '>>': ['__rshift__', '__rrshift__'], '@': ['__matmul__', '__rmatmul__'],
};
const CMP_DUNDER = { '<': ['__lt__', '__gt__'], '>': ['__gt__', '__lt__'], '<=': ['__le__', '__ge__'], '>=': ['__ge__', '__le__'], '==': ['__eq__', '__eq__'], '!=': ['__ne__', '__ne__'] };

export function* truthy(interp, o) {
  const fast = isTruthy(o);
  if (fast !== null) return fast;
  if (o instanceof PyInstance) {
    const b = o.cls.lookup('__bool__');
    if (b !== undefined) {
      const r = yield* interp.call(b, [o], new Map());
      if (!(r instanceof PyBool)) raise('TypeError', `__bool__ should return bool, returned ${typeName(r)}`);
      return r === TRUE;
    }
    const l = o.cls.lookup('__len__');
    if (l !== undefined) { const r = yield* interp.call(l, [o], new Map()); return r.v !== 0n; }
  }
  if (o instanceof PyIterator || o instanceof PyGenerator) return true;
  return true;
}

const numeric = o => o instanceof PyInt || o instanceof PyFloat;
const asFloat = o => (o instanceof PyInt ? Number(o.v) : o.v);

function numBinop(op, a, b) {
  if (a instanceof PyInt && b instanceof PyInt) {
    const x = a.v, y = b.v;
    switch (op) {
      case '+': return int(x + y);
      case '-': return int(x - y);
      case '*': return int(x * y);
      case '/': if (y === 0n) raise('ZeroDivisionError', 'division by zero'); return float(Number(x) / Number(y));
      case '//': if (y === 0n) raise('ZeroDivisionError', 'integer division or modulo by zero'); return int(bigFloorDiv(x, y));
      case '%': if (y === 0n) raise('ZeroDivisionError', 'integer modulo by zero'); return int(bigMod(x, y));
      case '**': if (y < 0n) return float(Number(x) ** Number(y)); if (y > 100000n) raise('OverflowError', 'exponent too large'); return int(x ** y);
      case '&': return int(x & y);
      case '|': return int(x | y);
      case '^': return int(x ^ y);
      case '<<': if (y < 0n) raise('ValueError', 'negative shift count'); return int(x << y);
      case '>>': if (y < 0n) raise('ValueError', 'negative shift count'); return int(x >> y);
      default: return null;
    }
  }
  if (numeric(a) && numeric(b)) {
    const x = asFloat(a), y = asFloat(b);
    switch (op) {
      case '+': return float(x + y);
      case '-': return float(x - y);
      case '*': return float(x * y);
      case '/': if (y === 0) raise('ZeroDivisionError', 'float division by zero'); return float(x / y);
      case '//': if (y === 0) raise('ZeroDivisionError', 'float floor division by zero'); return float(Math.floor(x / y));
      case '%': if (y === 0) raise('ZeroDivisionError', 'float modulo by zero'); return float(floatMod(x, y));
      case '**': { if (x < 0 && !Number.isInteger(y)) raise('ValueError', 'negative number cannot be raised to a fractional power'); const r = x ** y; if (!Number.isFinite(r) && Number.isFinite(x) && Number.isFinite(y)) raise('OverflowError', '(34, \'Numerical result out of range\')'); return float(r); }
      default: return null;
    }
  }
  return null;
}

const repeat = (items, n) => { const times = Number(n < 0n ? 0n : n); const out = []; for (let i = 0; i < times; i++) out.push(...items); return out; };

export function* binop(interp, op, a, b) {
  const n = numBinop(op, a, b);
  if (n) return n;
  if (a instanceof PyStr && b instanceof PyStr && op === '+') return str(a.v + b.v);
  if (a instanceof PyStr && op === '%') return str(yield* percentFormat(interp, a.v, b));
  if (op === '*') {
    if (a instanceof PyStr && isIntLike(b)) return str(a.v.repeat(Number(b.v < 0n ? 0n : b.v)));
    if (b instanceof PyStr && isIntLike(a)) return str(b.v.repeat(Number(a.v < 0n ? 0n : a.v)));
    if (a instanceof PyList && isIntLike(b)) return new PyList(repeat(a.items, b.v));
    if (b instanceof PyList && isIntLike(a)) return new PyList(repeat(b.items, a.v));
    if (a instanceof PyTuple && isIntLike(b)) return new PyTuple(repeat(a.items, b.v));
    if (b instanceof PyTuple && isIntLike(a)) return new PyTuple(repeat(b.items, a.v));
  }
  if (op === '+') {
    if (a instanceof PyList && b instanceof PyList) return new PyList([...a.items, ...b.items]);
    if (a instanceof PyTuple && b instanceof PyTuple) return new PyTuple([...a.items, ...b.items]);
    if (a instanceof PyBytes && b instanceof PyBytes) return new PyBytes(new Uint8Array([...a.bytes, ...b.bytes]));
    if (a instanceof PyList && !(b instanceof PyList)) raise('TypeError', `can only concatenate list (not "${typeName(b)}") to list`);
    if (a instanceof PyStr && !(b instanceof PyStr)) raise('TypeError', `can only concatenate str (not "${typeName(b)}") to str`);
    if (a instanceof PyTuple && !(b instanceof PyTuple)) raise('TypeError', `can only concatenate tuple (not "${typeName(b)}") to tuple`);
  }
  if (a instanceof PySet && b instanceof PySet && ['|', '&', '-', '^'].includes(op)) return setOp(op, a, b);
  if (a instanceof PyDict && b instanceof PyDict && op === '|') { const d = new PyDict(); for (const e of [...a.entries(), ...b.entries()]) d.map.set(hashKey(e.k), { k: e.k, v: e.v }); return d; }
  if (a instanceof PyInstance || b instanceof PyInstance) {
    const [name, rname] = DUNDER[op];
    if (a instanceof PyInstance) {
      const fn = a.cls.lookup(name);
      if (fn !== undefined) { const r = yield* interp.call(fn, [a, b], new Map()); if (r !== NOT_IMPLEMENTED) return r; }
    }
    if (b instanceof PyInstance) {
      const fn = b.cls.lookup(rname);
      if (fn !== undefined) { const r = yield* interp.call(fn, [b, a], new Map()); if (r !== NOT_IMPLEMENTED) return r; }
    }
  }
  const sym = op === '%' && a instanceof PyStr ? '%' : op;
  return raise('TypeError', `unsupported operand type(s) for ${sym}: '${typeName(a)}' and '${typeName(b)}'`);
}

export function setOp(op, a, b) {
  const out = new PySet(a.frozen);
  const has = (s, v) => s.map.has(hashKey(v));
  const put = v => out.map.set(hashKey(v), v);
  if (op === '|') { out.initialSize = copiedSetSize(a.map.size); for (const v of a.items()) put(v); for (const v of b.items()) put(v); }
  if (op === '&') { const [small, big] = a.map.size <= b.map.size ? [a, b] : [b, a]; for (const v of small.items()) if (has(big, v)) put(v); }
  if (op === '-') for (const v of a.items()) if (!has(b, v)) put(v);
  if (op === '^') { out.initialSize = copiedSetSize(a.map.size); for (const v of a.items()) if (!has(b, v)) put(v); for (const v of b.items()) if (!has(a, v)) put(v); }
  return out;
}

export function* unary(interp, op, o) {
  if (op === 'not') return bool(!(yield* truthy(interp, o)));
  if (o instanceof PyBool) o = int(o.v);
  if (o instanceof PyInt) return op === '-' ? int(-o.v) : op === '+' ? o : int(~o.v);
  if (o instanceof PyFloat) { if (op === '~') raise('TypeError', "bad operand type for unary ~: 'float'"); return op === '-' ? float(-o.v) : o; }
  if (o instanceof PyInstance) {
    const fn = o.cls.lookup(op === '-' ? '__neg__' : op === '+' ? '__pos__' : '__invert__');
    if (fn !== undefined) return yield* interp.call(fn, [o], new Map());
  }
  return raise('TypeError', `bad operand type for unary ${op}: '${typeName(o)}'`);
}

/* ---------- equality and ordering ---------- */
export function* equals(interp, a, b) {
  if (a === b) return true;
  if (a instanceof PyInt && b instanceof PyInt) return a.v === b.v;
  if (numeric(a) && numeric(b)) return asFloat(a) === asFloat(b);
  if (a instanceof PyStr && b instanceof PyStr) return a.v === b.v;
  if (a instanceof PyBytes && b instanceof PyBytes) return a.bytes.length === b.bytes.length && a.bytes.every((x, i) => x === b.bytes[i]);
  if ((a instanceof PyList && b instanceof PyList) || (a instanceof PyTuple && b instanceof PyTuple)) {
    if (a.items.length !== b.items.length) return false;
    for (let i = 0; i < a.items.length; i++) if (!(yield* equals(interp, a.items[i], b.items[i]))) return false;
    return true;
  }
  if (a instanceof PyDict && b instanceof PyDict) {
    if (a.map.size !== b.map.size) return false;
    for (const [k, e] of a.map) { const o = b.map.get(k); if (!o || !(yield* equals(interp, e.v, o.v))) return false; }
    return true;
  }
  if (a instanceof PySet && b instanceof PySet) { if (a.map.size !== b.map.size) return false; for (const k of a.map.keys()) if (!b.map.has(k)) return false; return true; }
  if (a instanceof PyRange && b instanceof PyRange) return a.length === b.length && (a.length === 0n || (a.start === b.start && (a.length === 1n || a.step === b.step)));
  if (a instanceof PyInstance || b instanceof PyInstance) {
    if (a instanceof PyInstance) {
      const fn = a.cls.lookup('__eq__');
      if (fn !== undefined) { const r = yield* interp.call(fn, [a, b], new Map()); if (r !== NOT_IMPLEMENTED) return yield* truthy(interp, r); }
    }
    if (b instanceof PyInstance) {
      const fn = b.cls.lookup('__eq__');
      if (fn !== undefined) { const r = yield* interp.call(fn, [b, a], new Map()); if (r !== NOT_IMPLEMENTED) return yield* truthy(interp, r); }
    }
    return a === b;
  }
  return false;
}

function* lessThan(interp, a, b, op) {
  const cmp = (x, y) => (x < y ? -1 : x > y ? 1 : 0);
  const apply = c => (op === '<' ? c < 0 : op === '>' ? c > 0 : op === '<=' ? c <= 0 : c >= 0);
  if (a instanceof PyInt && b instanceof PyInt) return apply(cmp(a.v, b.v));
  if (numeric(a) && numeric(b)) return apply(cmp(asFloat(a), asFloat(b)));
  if (a instanceof PyStr && b instanceof PyStr) {
    const ac = a.chars, bc = b.chars;
    for (let i = 0; i < Math.min(ac.length, bc.length); i++) { const c = cmp(ac[i].codePointAt(0), bc[i].codePointAt(0)); if (c) return apply(c); }
    return apply(cmp(ac.length, bc.length));
  }
  if ((a instanceof PyList && b instanceof PyList) || (a instanceof PyTuple && b instanceof PyTuple)) {
    for (let i = 0; i < Math.min(a.items.length, b.items.length); i++) {
      if (yield* equals(interp, a.items[i], b.items[i])) continue;
      return yield* lessThan(interp, a.items[i], b.items[i], op);
    }
    return apply(cmp(a.items.length, b.items.length));
  }
  if (a instanceof PySet && b instanceof PySet) {
    const sub = (x, y) => [...x.map.keys()].every(k => y.map.has(k));
    if (op === '<') return sub(a, b) && a.map.size < b.map.size;
    if (op === '<=') return sub(a, b);
    if (op === '>') return sub(b, a) && a.map.size > b.map.size;
    return sub(b, a);
  }
  if (a instanceof PyInstance || b instanceof PyInstance) {
    const [name, rname] = CMP_DUNDER[op];
    if (a instanceof PyInstance) {
      const fn = a.cls.lookup(name);
      if (fn !== undefined) { const r = yield* interp.call(fn, [a, b], new Map()); if (r !== NOT_IMPLEMENTED) return yield* truthy(interp, r); }
    }
    if (b instanceof PyInstance) {
      const fn = b.cls.lookup(rname);
      if (fn !== undefined) { const r = yield* interp.call(fn, [b, a], new Map()); if (r !== NOT_IMPLEMENTED) return yield* truthy(interp, r); }
    }
  }
  return raise('TypeError', `'${op}' not supported between instances of '${typeName(a)}' and '${typeName(b)}'`);
}

export function* contains(interp, container, item) {
  if (container instanceof PyStr) { if (!(item instanceof PyStr)) raise('TypeError', `'in <string>' requires string as left operand, not ${typeName(item)}`); return container.v.includes(item.v); }
  if (container instanceof PyDict) { yield* hashReady(interp, item); const k = hashKey(item); if (k === UNHASHABLE) raise('TypeError', `cannot use '${typeName(item)}' as a dict key (unhashable type: '${typeName(item)}')`); return container.map.has(k); }
  if (container instanceof PySet) { yield* hashReady(interp, item); const k = hashKey(item); if (k === UNHASHABLE) raise('TypeError', `cannot use '${typeName(item)}' as a set element (unhashable type: '${typeName(item)}')`); return container.map.has(k); }
  if (container instanceof PyList || container instanceof PyTuple) { for (const it of container.items) if (yield* equals(interp, it, item)) return true; return false; }
  if (container instanceof PyRange) { if (!isIntLike(item)) return false; const v = item.v; const { start, step } = container; if (container.length === 0n) return false; const k = (v - start) / step; return (v - start) % step === 0n && k >= 0n && k < container.length; }
  if (container instanceof PyBytes) { const v = Number(item.v); return container.bytes.includes(v); }
  if (container instanceof PyInstance) {
    const fn = container.cls.lookup('__contains__');
    if (fn !== undefined) return yield* truthy(interp, yield* interp.call(fn, [container, item], new Map()));
  }
  const it = yield* iterate(interp, container);
  for (;;) { const v = yield* it.next(); if (v === STOP) return false; if (yield* equals(interp, v, item)) return true; }
}

export function* compare(interp, op, a, b) {
  switch (op) {
    case '==': return yield* equals(interp, a, b);
    case '!=': {
      if (a instanceof PyInstance) { const fn = a.cls.lookup('__ne__'); if (fn !== undefined) { const r = yield* interp.call(fn, [a, b], new Map()); if (r !== NOT_IMPLEMENTED) return yield* truthy(interp, r); } }
      return !(yield* equals(interp, a, b));
    }
    case 'is': return a === b;
    case 'is not': return a !== b;
    case 'in': return yield* contains(interp, b, a);
    case 'not in': return !(yield* contains(interp, b, a));
    default: return yield* lessThan(interp, a, b, op);
  }
}

/* ---------- iteration ---------- */
const indexIter = (items, typeName_ = 'list_iterator') => new PyIterator(typeName_, function* () { return this.i < this.items.length ? this.items[this.i++] : STOP; }, { i: 0, items });

export function* iterate(interp, o) {
  if (o instanceof PyIterator) return o;
  if (o instanceof PyGenerator) return new PyIterator('generator', function* () { return yield* interp.genNext(o, NONE, true); }, { gen: o });
  if (o instanceof PyList) return new PyIterator('list_iterator', function* () { return this.i < this.list.items.length ? this.list.items[this.i++] : STOP; }, { i: 0, list: o });
  if (o instanceof PyTuple) return indexIter(o.items, 'list_iterator');
  if (o instanceof PyStr) return indexIter(o.chars.map(c => str(c)), 'list_iterator');
  if (o instanceof PyBytes) return indexIter([...o.bytes].map(b => int(BigInt(b))), 'list_iterator');
  if (o instanceof PyDict) {
    const size = o.map.size;
    return new PyIterator('dict_keys', function* () {
      if (o.map.size !== size) raise('RuntimeError', 'dictionary changed size during iteration');
      return this.i < this.keys.length ? this.keys[this.i++] : STOP;
    }, { i: 0, keys: o.keys() });
  }
  if (o instanceof PySet) {
    const size = o.map.size;
    return new PyIterator('list_iterator', function* () {
      if (o.map.size !== size) raise('RuntimeError', 'Set changed size during iteration');
      return this.i < this.items.length ? this.items[this.i++] : STOP;
    }, { i: 0, items: o.items() });
  }
  if (o instanceof PyRange) return new PyIterator('list_iterator', function* () { return this.i < o.length ? int(o.at(this.i++)) : STOP; }, { i: 0n });
  if (o && o.methods && o.methods.__iter__) return o.methods.__iter__([]);
  if (o instanceof PyInstance) {
    const fn = o.cls.lookup('__iter__');
    if (fn !== undefined) {
      const it = yield* interp.call(fn, [o], new Map());
      if (it instanceof PyIterator || it instanceof PyGenerator) return yield* iterate(interp, it);
      if (!(it instanceof PyInstance) || it.cls.lookup('__next__') === undefined) raise('TypeError', `iter() returned non-iterator of type '${typeName(it)}'`);
      const nxt = it.cls.lookup('__next__');
      return new PyIterator('list_iterator', function* () {
        try { return yield* interp.call(nxt, [it], new Map()); } catch (e) { if (e.exc && e.exc.cls.mro.includes(EXC.StopIteration)) return STOP; throw e; }
      });
    }
    const gi = o.cls.lookup('__getitem__');
    if (gi !== undefined) return new PyIterator('list_iterator', function* () {
      try { return yield* interp.call(gi, [o, int(BigInt(this.i++))], new Map()); } catch (e) { if (e.exc && (e.exc.cls.mro.includes(EXC.IndexError) || e.exc.cls.mro.includes(EXC.StopIteration))) return STOP; throw e; }
    }, { i: 0 });
  }
  return raise('TypeError', `'${typeName(o)}' object is not iterable`);
}

export function* toList(interp, o) {
  if (o instanceof PyList || o instanceof PyTuple) return [...o.items];
  const it = yield* iterate(interp, o);
  const out = [];
  for (;;) { const v = yield* it.next(); if (v === STOP) return out; out.push(v); if (out.length > 200000) raise('MemoryError', 'iterable too large for this stand'); }
}

/* ---------- item access ---------- */
const needInt = (o, what) => { if (!isIntLike(o)) raise('TypeError', `${what} indices must be integers or slices, not ${typeName(o)}`); return Number(o.v); };
const keyOf = k => { const h = hashKey(k); if (h === UNHASHABLE) raise('TypeError', `cannot use '${typeName(k)}' as a dict key (unhashable type: '${typeName(k)}')`); return h; };

export function* getitem(interp, o, key) {
  if (o instanceof PyList || o instanceof PyTuple) {
    if (key instanceof PySlice) { const idx = sliceIndices(key, o.items.length, x => needInt(x, 'slice')); if (!idx) raise('ValueError', 'slice step cannot be zero'); const items = idx.map(i => o.items[i]); return o instanceof PyList ? new PyList(items) : new PyTuple(items); }
    const i = normIndex(needInt(key, typeName(o)), o.items.length);
    if (i === null) raise('IndexError', `${typeName(o)} index out of range`);
    interp.touch(o, i, 'read');
    return o.items[i];
  }
  if (o instanceof PyStr) {
    const chars = o.chars;
    if (key instanceof PySlice) { const idx = sliceIndices(key, chars.length, x => needInt(x, 'slice')); if (!idx) raise('ValueError', 'slice step cannot be zero'); return str(idx.map(i => chars[i]).join('')); }
    const i = normIndex(needInt(key, 'string'), chars.length);
    if (i === null) raise('IndexError', 'string index out of range');
    return str(chars[i]);
  }
  if (o instanceof PyDict) {
    yield* hashReady(interp, key);
    const k = keyOf(key);
    const e = o.map.get(k);
    if (e) { interp.touch(o, k, 'read'); return e.v; }
    if (o.defaultFactory !== undefined) {
      if (o.defaultFactory === NONE) throw pyError('KeyError', key);
      const v = yield* interp.call(o.defaultFactory, [], new Map());
      o.map.set(k, { k: key, v });
      interp.touch(o, k, 'write');
      return v;
    }
    if (o.missingZero) return int(0n);
    throw pyError('KeyError', key);
  }
  if (o instanceof PyRange) {
    if (key instanceof PySlice) { const idx = sliceIndices(key, Number(o.length), x => needInt(x, 'slice')); return new PyRange(idx.length ? o.at(BigInt(idx[0])) : 0n, idx.length ? o.at(BigInt(idx.at(-1))) + o.step : 0n, o.step * BigInt(key.step === NONE ? 1 : Number(key.step.v))); }
    const i = normIndex(needInt(key, 'range'), Number(o.length));
    if (i === null) raise('IndexError', 'range object index out of range');
    return int(o.at(BigInt(i)));
  }
  if (o instanceof PyBytes) {
    if (key instanceof PySlice) { const idx = sliceIndices(key, o.bytes.length, x => needInt(x, 'slice')); return new PyBytes(new Uint8Array(idx.map(i => o.bytes[i]))); }
    const i = normIndex(needInt(key, 'byte'), o.bytes.length);
    if (i === null) raise('IndexError', 'index out of range');
    return int(BigInt(o.bytes[i]));
  }
  if (o instanceof PyInstance) {
    const fn = o.cls.lookup('__getitem__');
    if (fn !== undefined) return yield* interp.call(fn, [o, key], new Map());
  }
  if (o instanceof PyClass) return o;
  return raise('TypeError', `'${typeName(o)}' object is not subscriptable`);
}

export function* setitem(interp, o, key, value) {
  if (o instanceof PyList) {
    if (key instanceof PySlice) {
      const items = yield* toList(interp, value);
      const idx = sliceIndices(key, o.items.length, x => needInt(x, 'slice'));
      if (key.step === NONE || Number(key.step.v) === 1) { const start = idx.length ? idx[0] : Math.min(o.items.length, Math.max(0, key.lower === NONE ? 0 : (Number(key.lower.v) < 0 ? Number(key.lower.v) + o.items.length : Number(key.lower.v)))); o.items.splice(start, idx.length, ...items); }
      else { if (items.length !== idx.length) raise('ValueError', `attempt to assign sequence of size ${items.length} to extended slice of size ${idx.length}`); idx.forEach((i, j) => { o.items[i] = items[j]; }); }
      return;
    }
    const i = normIndex(needInt(key, 'list'), o.items.length);
    if (i === null) raise('IndexError', 'list assignment index out of range');
    o.items[i] = value;
    interp.touch(o, i, 'write');
    return;
  }
  if (o instanceof PyDict) { yield* hashReady(interp, key); const k = keyOf(key); o.map.set(k, { k: o.map.get(k)?.k ?? key, v: value }); interp.touch(o, k, 'write'); return; }
  if (o instanceof PyInstance) {
    const fn = o.cls.lookup('__setitem__');
    if (fn !== undefined) { yield* interp.call(fn, [o, key, value], new Map()); return; }
  }
  if (o instanceof PyStr) raise('TypeError', "'str' object does not support item assignment");
  if (o instanceof PyTuple) raise('TypeError', "'tuple' object does not support item assignment");
  raise('TypeError', `'${typeName(o)}' object does not support item assignment`);
}

export function* delitem(interp, o, key) {
  if (o instanceof PyList) {
    if (key instanceof PySlice) { const idx = new Set(sliceIndices(key, o.items.length, x => needInt(x, 'slice'))); o.items = o.items.filter((_, i) => !idx.has(i)); return; }
    const i = normIndex(needInt(key, 'list'), o.items.length);
    if (i === null) raise('IndexError', 'list assignment index out of range');
    o.items.splice(i, 1);
    return;
  }
  if (o instanceof PyDict) { yield* hashReady(interp, key); const k = keyOf(key); if (!o.map.has(k)) throw pyError('KeyError', key); o.map.delete(k); return; }
  if (o instanceof PyInstance) {
    const fn = o.cls.lookup('__delitem__');
    if (fn !== undefined) { yield* interp.call(fn, [o, key], new Map()); return; }
  }
  raise('TypeError', `'${typeName(o)}' object doesn't support item deletion`);
}

export function* lengthOf(interp, o) {
  if (o instanceof PyList || o instanceof PyTuple) return o.items.length;
  if (o instanceof PyStr) return o.chars.length;
  if (o instanceof PyDict || o instanceof PySet) return o.map.size;
  if (o instanceof PyRange) return Number(o.length);
  if (o instanceof PyBytes) return o.bytes.length;
  if (o instanceof PyInstance) {
    const fn = o.cls.lookup('__len__');
    if (fn !== undefined) { const r = yield* interp.call(fn, [o], new Map()); if (!isIntLike(r)) raise('TypeError', `'${typeName(r)}' object cannot be interpreted as an integer`); if (r.v < 0n) raise('ValueError', '__len__() should return >= 0'); return Number(r.v); }
  }
  return raise('TypeError', `object of type '${typeName(o)}' has no len()`);
}

export const keyOfChecked = keyOf;
export { toNumber };
