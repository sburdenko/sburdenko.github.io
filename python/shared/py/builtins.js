/** Builtin functions and the methods of builtin types. Installed into an Interp by installBuiltins(). */
import {
  PyInt, PyBool, PyFloat, PyStr, PyBytes, PyList, PyTuple, PyDict, PySet, PyRange, PyFunction, PyBuiltin, PyMethod, PyClass, PyInstance,
  PyGenerator, PyProperty, PyStaticMethod, PyClassMethod, PyIterator, PySlice, PyError, NONE, TRUE, FALSE,
  int, float, bool, str, internStr, hashKey, UNHASHABLE, typeName, typeOf, isIntLike, isInstance, isSubclass, TYPES, isCallable, pyHash, floatRepr, normIndex, growAllocation, copiedSetSize,
} from './objects.js?v=202609271602';
import { EXC, makeExc, raise, pyError, isExceptionClass, excArgs } from './errors.js?v=202609271602';
import { reprOf, strOf, formatValue, addr } from './convert.js?v=202609271602';
import { truthy, iterate, toList, getitem, STOP, equals, compare, lengthOf, setOp, NOT_IMPLEMENTED, hashReady } from './ops.js?v=202609271602';
import { PySuper } from './interp.js?v=202609271602';
import { installTypeMethods } from './methods.js?v=202609271602';

const argc = (name, args, min, max = min) => {
  if (args.length < min || args.length > max) {
    if (min === max) raise('TypeError', `${name}() takes exactly ${min} argument${min === 1 ? '' : 's'} (${args.length} given)`);
    if (args.length < min) raise('TypeError', `${name}() takes at least ${min} argument${min === 1 ? '' : 's'} (${args.length} given)`);
    raise('TypeError', `${name}() takes at most ${max} argument${max === 1 ? '' : 's'} (${args.length} given)`);
  }
};
const noKw = (name, kwargs) => { if (kwargs.size) raise('TypeError', `${name}() takes no keyword arguments`); };
const needIndex = (o, what = 'object') => { if (!isIntLike(o)) raise('TypeError', `'${typeName(o)}' object cannot be interpreted as an integer`); return o.v; };

/* ---------- number parsing ---------- */
export function parseIntLiteral(text, base) {
  let s = text.trim().replace(/_/g, '');
  let sign = 1n;
  if (s.startsWith('-')) { sign = -1n; s = s.slice(1); } else if (s.startsWith('+')) s = s.slice(1);
  if (base === 0) { base = /^0[xX]/.test(s) ? 16 : /^0[bB]/.test(s) ? 2 : /^0[oO]/.test(s) ? 8 : 10; }
  if (base === 16 && /^0[xX]/.test(s)) s = s.slice(2);
  if (base === 2 && /^0[bB]/.test(s)) s = s.slice(2);
  if (base === 8 && /^0[oO]/.test(s)) s = s.slice(2);
  if (!s.length) return null;
  const digits = '0123456789abcdefghijklmnopqrstuvwxyz'.slice(0, base);
  let v = 0n;
  for (const ch of s.toLowerCase()) { const d = digits.indexOf(ch); if (d < 0) return null; v = v * BigInt(base) + BigInt(d); }
  return sign * v;
}

export function* toInt(interp, o, base = null) {
  if (base !== null) {
    if (!(o instanceof PyStr)) raise('TypeError', "int() can't convert non-string with explicit base");
    const v = parseIntLiteral(o.v, base);
    if (v === null) raise('ValueError', `invalid literal for int() with base ${base}: ${yield* reprOf(interp, o)}`);
    return int(v);
  }
  if (o instanceof PyBool) return int(o.v);
  if (o instanceof PyInt) return o;
  if (o instanceof PyFloat) { if (!Number.isFinite(o.v)) raise(Number.isNaN(o.v) ? 'ValueError' : 'OverflowError', Number.isNaN(o.v) ? 'cannot convert float NaN to integer' : 'cannot convert float infinity to integer'); return int(BigInt(Math.trunc(o.v))); }
  if (o instanceof PyStr) { const v = parseIntLiteral(o.v, 10); if (v === null) raise('ValueError', `invalid literal for int() with base 10: ${yield* reprOf(interp, o)}`); return int(v); }
  if (o instanceof PyInstance) {
    const fn = o.cls.lookup('__int__') ?? o.cls.lookup('__index__');
    if (fn !== undefined) return yield* interp.call(fn, [o], new Map());
  }
  return raise('TypeError', `int() argument must be a string, a bytes-like object or a real number, not '${typeName(o)}'`);
}

export function* toFloat(interp, o) {
  if (o instanceof PyFloat) return o;
  if (o instanceof PyInt) return float(Number(o.v));
  if (o instanceof PyStr) {
    const t = o.v.trim().replace(/_/g, '').toLowerCase();
    if (t === 'inf' || t === '+inf' || t === 'infinity') return float(Infinity);
    if (t === '-inf' || t === '-infinity') return float(-Infinity);
    if (t === 'nan') return float(NaN);
    if (!/^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?$/.test(t)) raise('ValueError', `could not convert string to float: ${yield* reprOf(interp, o)}`);
    return float(Number(t));
  }
  if (o instanceof PyInstance) { const fn = o.cls.lookup('__float__'); if (fn !== undefined) return yield* interp.call(fn, [o], new Map()); }
  return raise('TypeError', `float() argument must be a string or a real number, not '${typeName(o)}'`);
}

/** Exact round-half-to-even of a double at `digits` decimals, returning the scaled integer. */
export function roundHalfEven(v, digits) {
  let num = v, den = 1n;
  while (!Number.isInteger(num)) { num *= 2; den *= 2n; }
  let n = BigInt(num);
  if (digits >= 0) n *= 10n ** BigInt(digits); else den *= 10n ** BigInt(-digits);
  const neg = n < 0n;
  if (neg) n = -n;
  let q = n / den;
  const r = n % den;
  if (r * 2n > den || (r * 2n === den && q % 2n === 1n)) q += 1n;
  return neg ? -q : q;
}

/* ---------- sorting (stable, with key and reverse, comparisons through the interpreter) ---------- */
export function* sortItems(interp, items, keyFn, reverse) {
  const keyed = [];
  for (const it of items) keyed.push({ it, k: keyFn && keyFn !== NONE ? yield* interp.call(keyFn, [it], new Map()) : it });
  const lt = function* (a, b) { return yield* compare(interp, '<', a, b); };
  const merge = function* (arr) {
    if (arr.length <= 1) return arr;
    const mid = arr.length >> 1;
    const left = yield* merge(arr.slice(0, mid)), right = yield* merge(arr.slice(mid));
    const out = [];
    let i = 0, j = 0;
    while (i < left.length && j < right.length) {
      const takeRight = reverse ? yield* lt(left[i].k, right[j].k) : yield* lt(right[j].k, left[i].k);
      out.push(takeRight ? right[j++] : left[i++]);
    }
    return out.concat(left.slice(i), right.slice(j));
  };
  return (yield* merge(keyed)).map(x => x.it);
}

function* minmax(interp, name, args, kwargs) {
  const keyFn = kwargs.get('key') ?? null;
  const hasDefault = kwargs.has('default');
  let items;
  if (args.length === 1) items = yield* toList(interp, args[0]);
  else { if (hasDefault) raise('TypeError', `Cannot specify a default for ${name}() with multiple positional arguments`); items = args; }
  if (!items.length) { if (hasDefault) return kwargs.get('default'); raise('ValueError', `${name}() iterable argument is empty`); }
  let best = items[0], bestKey = keyFn && keyFn !== NONE ? yield* interp.call(keyFn, [best], new Map()) : best;
  for (const it of items.slice(1)) {
    const k = keyFn && keyFn !== NONE ? yield* interp.call(keyFn, [it], new Map()) : it;
    const better = name === 'min' ? yield* compare(interp, '<', k, bestKey) : yield* compare(interp, '>', k, bestKey);
    if (better) { best = it; bestKey = k; }
  }
  return best;
}

export function* makeDict(interp, args, kwargs) {
  const d = new PyDict();
  if (args.length > 1) raise('TypeError', `dict expected at most 1 argument, got ${args.length}`);
  if (args.length === 1) {
    const src = args[0];
    if (src instanceof PyDict) { for (const e of src.entries()) d.map.set(hashKey(e.k), { k: e.k, v: e.v }); }
    else {
      const pairs = yield* toList(interp, src);
      for (let i = 0; i < pairs.length; i++) {
        const p = yield* toList(interp, pairs[i]);
        if (p.length !== 2) raise('ValueError', `dictionary update sequence element #${i} has length ${p.length}; 2 is required`);
        yield* hashReady(interp, p[0]);
        const hk = hashKey(p[0]); if (hk === UNHASHABLE) raise('TypeError', `unhashable type: '${typeName(p[0])}'`);
        d.map.set(hk, { k: p[0], v: p[1] });
      }
    }
  }
  for (const [k, v] of kwargs) d.map.set('s' + k, { k: internStr(k), v });
  return d;
}

export function* makeSet(interp, args, frozen = false) {
  const s = new PySet(frozen);
  if (args.length > 1) raise('TypeError', `${frozen ? 'frozenset' : 'set'} expected at most 1 argument, got ${args.length}`);
  if (args.length && args[0] instanceof PySet) { s.initialSize = copiedSetSize(args[0].map.size); for (const v of args[0].items()) s.map.set(hashKey(v), v); return s; }
  if (args.length) for (const v of yield* toList(interp, args[0])) interp.setAdd(s, yield* hashReady(interp, v));
  return s;
}

export function installBuiltins(interp) {
  const B = interp.builtins;
  const def = (name, fn) => B.set(name, new PyBuiltin(name, fn));

  def('print', function* (args, kwargs) {
    const sep = kwargs.has('sep') && kwargs.get('sep') !== NONE ? kwargs.get('sep').v : ' ';
    const end = kwargs.has('end') && kwargs.get('end') !== NONE ? kwargs.get('end').v : '\n';
    const parts = [];
    for (const a of args) parts.push(yield* strOf(interp, a));
    interp.write(parts.join(sep) + end);
    return NONE;
  });
  def('input', function* (args) {
    argc('input', args, 0, 1);
    const prompt = args.length ? yield* strOf(interp, args[0]) : '';
    interp.write(prompt);
    if (!interp.inputs.length) raise('EOFError', 'EOF when reading a line');
    const line = interp.inputs.shift();
    interp.inputUsed.push(line);
    interp.write(line + '\n', true);
    interp.touched.push({ input: line });
    return str(line);
  });
  def('len', function* (args) { argc('len', args, 1); return int(BigInt(yield* lengthOf(interp, args[0]))); });
  def('repr', function* (args) { argc('repr', args, 1); return str(yield* reprOf(interp, args[0])); });
  def('ascii', function* (args) { argc('ascii', args, 1); return str(yield* reprOf(interp, args[0])); });
  def('format', function* (args) { argc('format', args, 1, 2); return str(yield* formatValue(interp, args[0], args.length > 1 ? args[1].v : '')); });
  def('abs', function* (args) {
    argc('abs', args, 1);
    const o = args[0];
    if (o instanceof PyInt) return int(o.v < 0n ? -o.v : o.v);
    if (o instanceof PyFloat) return float(Math.abs(o.v));
    if (o instanceof PyInstance) { const fn = o.cls.lookup('__abs__'); if (fn !== undefined) return yield* interp.call(fn, [o], new Map()); }
    return raise('TypeError', `bad operand type for abs(): '${typeName(o)}'`);
  });
  def('round', function* (args) {
    argc('round', args, 1, 2);
    const [o, nd] = args;
    const digits = nd === undefined || nd === NONE ? null : Number(needIndex(nd));
    if (o instanceof PyInt) {
      if (digits === null || digits >= 0) return int(o.v);
      const p = 10n ** BigInt(-digits);
      const q = o.v / p, r = o.v % p, half = p / 2n;
      const absR = r < 0n ? -r : r;
      let rounded = q;
      if (absR > half || (absR === half && q % 2n !== 0n)) rounded += o.v < 0n ? -1n : 1n;
      return int(rounded * p);
    }
    if (!(o instanceof PyFloat)) { if (o instanceof PyInstance) { const fn = o.cls.lookup('__round__'); if (fn !== undefined) return yield* interp.call(fn, nd ? [o, nd] : [o], new Map()); } raise('TypeError', `type ${typeName(o)} doesn't define __round__ method`); }
    const v = o.v;
    if (digits === null) {
      if (!Number.isFinite(v)) raise(Number.isNaN(v) ? 'ValueError' : 'OverflowError', Number.isNaN(v) ? 'cannot convert float NaN to integer' : 'cannot convert float infinity to integer');
      return int(roundHalfEven(v, 0));
    }
    if (!Number.isFinite(v)) return o;
    const q = roundHalfEven(v, digits);
    return float(digits >= 0 ? Number(`${q}e-${digits}`) : Number(`${q}e${-digits}`));
  });
  def('divmod', function* (args) { argc('divmod', args, 2); return new PyTuple([yield* interp.binop('//', args[0], args[1]), yield* interp.binop('%', args[0], args[1])]); });
  def('pow', function* (args) {
    argc('pow', args, 2, 3);
    if (args.length === 3) { const [b, e, m] = args; if (!(isIntLike(b) && isIntLike(e) && isIntLike(m))) raise('TypeError', 'pow() 3rd argument not allowed unless all arguments are integers'); let r = 1n, base = ((b.v % m.v) + m.v) % m.v, exp = e.v; if (exp < 0n) raise('ValueError', 'pow() negative exponent with modulus'); while (exp > 0n) { if (exp & 1n) r = r * base % m.v; base = base * base % m.v; exp >>= 1n; } return int(r); }
    return yield* interp.binop('**', args[0], args[1]);
  });
  def('ord', args => { argc('ord', args, 1); const o = args[0]; if (!(o instanceof PyStr)) raise('TypeError', `ord() expected string of length 1, but ${typeName(o)} found`); if (o.chars.length !== 1) raise('TypeError', `ord() expected a character, but string of length ${o.chars.length} found`); return int(BigInt(o.v.codePointAt(0))); });
  def('chr', args => { argc('chr', args, 1); const v = Number(needIndex(args[0])); if (v < 0 || v > 0x10ffff) raise('ValueError', 'chr() arg not in range(0x110000)'); return str(String.fromCodePoint(v)); });
  def('bin', args => { const v = needIndex(args[0]); return str((v < 0n ? '-0b' : '0b') + (v < 0n ? -v : v).toString(2)); });
  def('oct', args => { const v = needIndex(args[0]); return str((v < 0n ? '-0o' : '0o') + (v < 0n ? -v : v).toString(8)); });
  def('hex', args => { const v = needIndex(args[0]); return str((v < 0n ? '-0x' : '0x') + (v < 0n ? -v : v).toString(16)); });
  def('hash', function* (args) { argc('hash', args, 1); yield* hashReady(interp, args[0]); const hk = hashKey(args[0]); if (hk === UNHASHABLE) raise('TypeError', `unhashable type: '${typeName(args[0])}'`); return int(pyHash(args[0])); });
  def('id', args => { argc('id', args, 1); return int(BigInt('0x' + addr(args[0]))); });
  def('callable', args => bool(isCallable(args[0])));
  def('type', function* (args, kwargs) {
    if (args.length === 1) return typeOf(args[0]);
    argc('type', args, 3);
    const [name, bases, dict] = args;
    const cls = new PyClass(name.v, bases.items.length ? bases.items : [TYPES.object], new Map(dict.entries().map(e => [e.k.v, e.v])), false);
    cls.cls = TYPES.type; cls.module = '__main__';
    return cls;
  });
  def('isinstance', args => {
    argc('isinstance', args, 2);
    const [o, t] = args;
    const types = t instanceof PyTuple ? t.items : [t];
    for (const c of types) { if (!(c instanceof PyClass)) raise('TypeError', 'isinstance() arg 2 must be a type, a tuple of types, or a union'); if (isInstance(o, c)) return TRUE; }
    return FALSE;
  });
  def('issubclass', args => {
    argc('issubclass', args, 2);
    if (!(args[0] instanceof PyClass)) raise('TypeError', 'issubclass() arg 1 must be a class');
    const types = args[1] instanceof PyTuple ? args[1].items : [args[1]];
    return bool(types.some(c => isSubclass(args[0], c)));
  });
  def('getattr', function* (args) { argc('getattr', args, 2, 3); const name = args[1]; if (!(name instanceof PyStr)) raise('TypeError', `attribute name must be string, not '${typeName(name)}'`); const v = yield* interp.getattr(args[0], name.v, args.length === 3); return v === undefined ? args[2] : v; });
  def('setattr', function* (args) { argc('setattr', args, 3); yield* interp.setattr(args[0], args[1].v, args[2]); return NONE; });
  def('hasattr', function* (args) { argc('hasattr', args, 2); return bool((yield* interp.getattr(args[0], args[1].v, true)) !== undefined); });
  def('delattr', function* (args) { argc('delattr', args, 2); yield* interp.delattr(args[0], args[1].v); return NONE; });
  def('vars', function* (args) { argc('vars', args, 0, 1); if (!args.length) { const d = new PyDict(); for (const [k, v] of (interp.frame ? interp.frame.scope : interp.globals).vars) d.map.set('s' + k, { k: internStr(k), v }); return d; } return yield* interp.getattr(args[0], '__dict__'); });
  def('dir', function* (args) {
    const names = new Set();
    const o = args[0];
    if (o instanceof PyInstance) { for (const k of o.dict.keys()) names.add(k); for (const c of o.cls.mro) for (const k of c.dict.keys()) names.add(k); }
    else if (o instanceof PyClass) for (const c of o.mro) for (const k of c.dict.keys()) names.add(k);
    else if (o instanceof PyInstance === false) for (const c of typeOf(o).mro) for (const k of c.dict.keys()) names.add(k);
    const list = new PyList([...names].sort().map(n => str(n)));
    return list;
  });
  def('globals', () => { const d = new PyDict(); for (const [k, v] of interp.globals.vars) d.map.set('s' + k, { k: internStr(k), v }); return d; });
  def('locals', () => { const d = new PyDict(); for (const [k, v] of (interp.frame ? interp.frame.scope : interp.globals).vars) d.map.set('s' + k, { k: internStr(k), v }); return d; });

  /* iteration helpers */
  def('iter', function* (args) {
    argc('iter', args, 1, 2);
    if (args.length === 2) { const [fn, sentinel] = args; return new PyIterator('list_iterator', function* () { const v = yield* interp.call(fn, [], new Map()); return (yield* equals(interp, v, sentinel)) ? STOP : v; }); }
    return yield* iterate(interp, args[0]);
  });
  def('next', function* (args) {
    argc('next', args, 1, 2);
    const it = args[0];
    if (it instanceof PyGenerator) { try { return yield* interp.genNext(it, NONE); } catch (e) { if (args.length === 2 && e instanceof PyError && e.exc.cls === EXC.StopIteration) return args[1]; throw e; } }
    if (!(it instanceof PyIterator)) {
      if (it instanceof PyInstance && it.cls.lookup('__next__') !== undefined) { try { return yield* interp.call(it.cls.lookup('__next__'), [it], new Map()); } catch (e) { if (args.length === 2 && e instanceof PyError && e.exc.cls === EXC.StopIteration) return args[1]; throw e; } }
      raise('TypeError', `'${typeName(it)}' object is not an iterator`);
    }
    const v = yield* it.next();
    if (v === STOP) { if (args.length === 2) return args[1]; throw new PyError(makeExc(EXC.StopIteration, [])); }
    return v;
  });
  def('range', args => {
    argc('range', args, 1, 3);
    const v = args.map(a => needIndex(a));
    const [start, stop, step] = v.length === 1 ? [0n, v[0], 1n] : v.length === 2 ? [v[0], v[1], 1n] : v;
    if (step === 0n) raise('ValueError', 'range() arg 3 must not be zero');
    return new PyRange(start, stop, step);
  });
  def('enumerate', function* (args, kwargs) {
    argc('enumerate', args, 1, 2);
    const it = yield* iterate(interp, args[0]);
    let i = args.length > 1 ? args[1].v : (kwargs.get('start')?.v ?? 0n);
    return new PyIterator('enumerate', function* () { const v = yield* it.next(); if (v === STOP) return STOP; return new PyTuple([int(i++), v]); });
  });
  def('zip', function* (args, kwargs) {
    const its = [];
    for (const a of args) its.push(yield* iterate(interp, a));
    const strict = kwargs.get('strict') === TRUE;
    return new PyIterator('zip', function* () {
      if (!its.length) return STOP;
      const row = [];
      for (let i = 0; i < its.length; i++) { const v = yield* its[i].next(); if (v === STOP) { if (strict && i > 0) raise('ValueError', `zip() argument ${i + 1} is shorter than argument${i === 1 ? '' : 's'} 1${i > 1 ? '-' + i : ''}`); if (strict && i === 0) { for (let j = 1; j < its.length; j++) if ((yield* its[j].next()) !== STOP) raise('ValueError', `zip() argument ${j + 1} is longer than argument${j === 1 ? '' : 's'} 1${j > 1 ? '-' + j : ''}`); } return STOP; } row.push(v); }
      return new PyTuple(row);
    });
  });
  def('map', function* (args) {
    if (args.length < 2) raise('TypeError', 'map() must have at least two arguments.');
    const fn = args[0], its = [];
    for (const a of args.slice(1)) its.push(yield* iterate(interp, a));
    return new PyIterator('map', function* () { const row = []; for (const it of its) { const v = yield* it.next(); if (v === STOP) return STOP; row.push(v); } return yield* interp.call(fn, row, new Map()); });
  });
  def('filter', function* (args) {
    argc('filter', args, 2);
    const [fn, src] = args;
    const it = yield* iterate(interp, src);
    return new PyIterator('filter', function* () { for (;;) { const v = yield* it.next(); if (v === STOP) return STOP; const keep = fn === NONE ? yield* truthy(interp, v) : yield* truthy(interp, yield* interp.call(fn, [v], new Map())); if (keep) return v; } });
  });
  def('reversed', function* (args) {
    argc('reversed', args, 1);
    const o = args[0];
    if (o instanceof PyInstance) { const fn = o.cls.lookup('__reversed__'); if (fn !== undefined) return yield* interp.call(fn, [o], new Map()); }
    let items;
    if (o instanceof PyList || o instanceof PyTuple) items = [...o.items].reverse();
    else if (o instanceof PyStr) items = [...o.chars].reverse().map(c => str(c));
    else if (o instanceof PyRange) { items = []; for (let i = o.length - 1n; i >= 0n; i--) items.push(int(o.at(i))); }
    else if (o instanceof PyDict) items = o.keys().reverse();
    else raise('TypeError', `'${typeName(o)}' object is not reversible`);
    let i = 0;
    return new PyIterator('reversed', function* () { return i < items.length ? items[i++] : STOP; });
  });
  def('sorted', function* (args, kwargs) {
    argc('sorted', args, 1);
    const items = yield* toList(interp, args[0]);
    const reverse = kwargs.has('reverse') ? yield* truthy(interp, kwargs.get('reverse')) : false;
    return new PyList(yield* sortItems(interp, items, kwargs.get('key') ?? null, reverse));
  });
  def('sum', function* (args, kwargs) {
    argc('sum', args, 1, 2);
    let acc = args.length > 1 ? args[1] : (kwargs.get('start') ?? int(0n));
    if (acc instanceof PyStr) raise('TypeError', "sum() can't sum strings [use ''.join(seq) instead]");
    for (const v of yield* toList(interp, args[0])) acc = yield* interp.binop('+', acc, v);
    return acc;
  });
  def('min', function* (args, kwargs) { return yield* minmax(interp, 'min', args, kwargs); });
  def('max', function* (args, kwargs) { return yield* minmax(interp, 'max', args, kwargs); });
  def('any', function* (args) { argc('any', args, 1); const it = yield* iterate(interp, args[0]); for (;;) { const v = yield* it.next(); if (v === STOP) return FALSE; if (yield* truthy(interp, v)) return TRUE; } });
  def('all', function* (args) { argc('all', args, 1); const it = yield* iterate(interp, args[0]); for (;;) { const v = yield* it.next(); if (v === STOP) return TRUE; if (!(yield* truthy(interp, v))) return FALSE; } });

  /* descriptors and class helpers */
  def('super', function* (args) {
    if (args.length === 0) { const { cls, self } = interp.superContext(); return new PySuper(cls, self); }
    argc('super', args, 2);
    return new PySuper(args[0], args[1]);
  });
  def('object', () => new PyInstance(TYPES.object));
  B.set('object', TYPES.object);
  B.set('type', B.get('type'));
  B.set('property', TYPES.property);
  TYPES.property.construct = (args, kwargs) => new PyProperty(args[0] ?? kwargs.get('fget') ?? null, args[1] ?? kwargs.get('fset') ?? null);
  B.set('staticmethod', TYPES.staticmethod);
  TYPES.staticmethod.construct = args => new PyStaticMethod(args[0]);
  B.set('classmethod', TYPES.classmethod);
  TYPES.classmethod.construct = args => new PyClassMethod(args[0]);
  B.set('NotImplemented', NOT_IMPLEMENTED);
  B.set('Ellipsis', NONE);
  B.set('__name__', internStr('__main__'));

  /* type constructors */
  const FN = Object.fromEntries(['range', 'enumerate', 'zip', 'map', 'filter', 'reversed', 'type'].map(n => [n, B.get(n).fn]));
  for (const [name, cls] of Object.entries(TYPES)) if (!['NoneType', 'function', 'builtin_function_or_method', 'method', 'generator', 'module', 'cell', 'ellipsis', 'TextIOWrapper', 'list_iterator', 'super', 'dict_keys', 'dict_values', 'dict_items'].includes(name)) B.set(name, cls);
  TYPES.int.construct = function* (args, kwargs, _interp, cls) {
    argc('int', args, 0, 2);
    if (kwargs.has('base')) args = [args[0], kwargs.get('base')];
    const r = args.length === 0 ? int(0n) : yield* toInt(interp, args[0], args.length === 2 ? Number(args[1].v) : null);
    return cls === TYPES.int || cls === TYPES.bool ? r : r;
  };
  TYPES.bool.construct = function* (args) { argc('bool', args, 0, 1); return args.length ? bool(yield* truthy(interp, args[0])) : FALSE; };
  TYPES.float.construct = function* (args) { argc('float', args, 0, 1); return args.length ? yield* toFloat(interp, args[0]) : float(0); };
  TYPES.str.construct = function* (args, kwargs) {
    argc('str', args, 0, 3);
    if (!args.length) return internStr('');
    if (args[0] instanceof PyBytes && (args.length > 1 || kwargs.has('encoding'))) return str(new TextDecoder().decode(args[0].bytes));
    return str(yield* strOf(interp, args[0]));
  };
  TYPES.bytes.construct = function* (args) {
    if (!args.length) return new PyBytes(new Uint8Array());
    if (args[0] instanceof PyStr) { if (args.length < 2) raise('TypeError', 'string argument without an encoding'); return new PyBytes(new TextEncoder().encode(args[0].v)); }
    if (isIntLike(args[0])) return new PyBytes(new Uint8Array(Number(args[0].v)));
    const items = yield* toList(interp, args[0]);
    return new PyBytes(new Uint8Array(items.map(i => { const v = Number(needIndex(i)); if (v < 0 || v > 255) raise('ValueError', 'bytes must be in range(0, 256)'); return v; })));
  };
  TYPES.list.construct = function* (args, kwargs, _i, cls) { argc('list', args, 0, 1); const l = new PyList(args.length ? yield* toList(interp, args[0]) : []); if (cls && cls !== TYPES.list) { l.cls = cls; l.dict = new Map(); } return l; };
  TYPES.tuple.construct = function* (args) { argc('tuple', args, 0, 1); return new PyTuple(args.length ? yield* toList(interp, args[0]) : []); };
  TYPES.dict.construct = function* (args, kwargs, _i, cls) { const d = yield* makeDict(interp, args, kwargs); if (cls && cls !== TYPES.dict) { d.cls = cls; d.dict = new Map(); } return d; };
  TYPES.set.construct = function* (args) { return yield* makeSet(interp, args, false); };
  TYPES.frozenset.construct = function* (args) { return yield* makeSet(interp, args, true); };
  TYPES.object.construct = (args, kwargs, _i, cls) => new PyInstance(cls || TYPES.object);
  TYPES.slice.construct = args => { argc('slice', args, 1, 3); const [a, b, c] = args.length === 1 ? [NONE, args[0], NONE] : [args[0], args[1], args[2] ?? NONE]; return new PySlice(a, b, c); };
  TYPES.range.construct = (args, kwargs) => FN.range(args, kwargs);
  TYPES.enumerate.construct = (args, kwargs) => FN.enumerate(args, kwargs);
  TYPES.zip.construct = (args, kwargs) => FN.zip(args, kwargs);
  TYPES.map.construct = (args, kwargs) => FN.map(args, kwargs);
  TYPES.filter.construct = (args, kwargs) => FN.filter(args, kwargs);
  TYPES.reversed.construct = (args, kwargs) => FN.reversed(args, kwargs);
  TYPES.type.construct = (args, kwargs) => FN.type(args, kwargs);
  TYPES.object.dict.set('__init__', Object.assign(new PyBuiltin('__init__', () => NONE), { isObjectInit: true }));
  TYPES.object.dict.set('__repr__', Object.assign(new PyBuiltin('__repr__', function* ([self]) { return str(yield* reprOf(interp, self)); }), { isDefault: true }));
  TYPES.object.dict.set('__str__', Object.assign(new PyBuiltin('__str__', function* ([self]) { return str(yield* strOf(interp, self)); }), { isDefault: true }));
  TYPES.object.dict.set('__eq__', new PyBuiltin('__eq__', ([self, other]) => (self === other ? TRUE : NOT_IMPLEMENTED)));
  TYPES.object.dict.set('__ne__', new PyBuiltin('__ne__', function* ([self, other]) { return bool(!(yield* equals(interp, self, other))); }));
  TYPES.object.dict.set('__hash__', new PyBuiltin('__hash__', ([self]) => int(pyHash(self))));
  TYPES.object.dict.set('__setattr__', new PyBuiltin('__setattr__', ([self, name, value]) => { self.dict.set(name.v, value); return NONE; }));
  TYPES.object.dict.set('__getattribute__', new PyBuiltin('__getattribute__', function* ([self, name]) { return yield* interp.getattr(self, name.v); }));
  TYPES.object.dict.set('__class__', TYPES.object);
  TYPES.object.dict.set('__new__', new PyBuiltin('__new__', (args) => new PyInstance(args[0])));
  TYPES.type.dict.set('mro', new PyBuiltin('mro', ([self]) => new PyList([...self.mro])));

  /* exceptions */
  for (const [name, cls] of Object.entries(EXC)) B.set(name, cls);
  EXC.BaseException.dict.set('__init__', new PyBuiltin('__init__', ([self, ...args]) => { self.dict.set('args', new PyTuple(args)); return NONE; }));
  EXC.BaseException.dict.set('__str__', Object.assign(new PyBuiltin('__str__', function* ([self]) { return str(yield* strOf(interp, self)); }), { isDefault: true }));
  EXC.BaseException.dict.set('__repr__', Object.assign(new PyBuiltin('__repr__', function* ([self]) { return str(yield* reprOf(interp, self)); }), { isDefault: true }));
  EXC.BaseException.dict.set('with_traceback', new PyBuiltin('with_traceback', ([self]) => self));
  EXC.BaseException.dict.set('add_note', new PyBuiltin('add_note', ([self, note]) => { const notes = self.dict.get('__notes__') ?? new PyList(); notes.push(note); self.dict.set('__notes__', notes); return NONE; }));
  for (const cls of Object.values(EXC)) cls.construct = undefined;

  def('open', function* (args, kwargs) {
    argc('open', args, 1, 3);
    const name = args[0].v, mode = (args[1] ?? kwargs.get('mode') ?? internStr('r')).v;
    return makeFile(interp, name, mode);
  });
  def('exit', () => { throw new PyError(makeExc(EXC.SystemExit, [])); });
  def('quit', () => { throw new PyError(makeExc(EXC.SystemExit, [])); });
  def('breakpoint', () => NONE);
  def('exec', () => raise('RuntimeError', 'exec() is not available on this stand'));
  def('eval', () => raise('RuntimeError', 'eval() is not available on this stand'));
  def('__import__', function* (args) { return yield* interp.importModule(args[0].v); });

  installTypeMethods(interp);
}

/* ---------- fake files ---------- */
export function makeFile(interp, name, mode) {
  const writing = mode.includes('w') || mode.includes('a') || mode.includes('x');
  if (!writing && !(name in interp.files)) raise('FileNotFoundError', `[Errno 2] No such file or directory: '${name}'`);
  if (mode.includes('x') && name in interp.files) raise('FileExistsError', `[Errno 17] File exists: '${name}'`);
  if (mode.includes('w')) interp.files[name] = '';
  if (mode.includes('a') && !(name in interp.files)) interp.files[name] = '';
  const file = { id: 0, cls: TYPES.TextIOWrapper, name, mode, pos: 0, closed: false, attrs: {}, attrsWritable: false };
  file.id = new PyInstance(TYPES.object).id;
  file.attrs.name = str(name);
  file.attrs.mode = str(mode);
  file.attrs.closed = FALSE;
  file.reprText = `<_io.TextIOWrapper name='${name}' mode='${mode}' encoding='UTF-8'>`;
  const check = () => { if (file.closed) raise('ValueError', 'I/O operation on closed file.'); };
  const lines = () => { const text = interp.files[name].slice(file.pos); file.pos = interp.files[name].length; return text.split(/(?<=\n)/).filter(l => l.length); };
  const methods = {
    read: () => { check(); if (writing && !mode.includes('+')) raise('UnsupportedOperation', 'not readable'); const t = interp.files[name].slice(file.pos); file.pos = interp.files[name].length; return str(t); },
    readline: () => { check(); const rest = interp.files[name].slice(file.pos); const nl = rest.indexOf('\n'); const line = nl < 0 ? rest : rest.slice(0, nl + 1); file.pos += line.length; return str(line); },
    readlines: () => { check(); return new PyList(lines().map(l => str(l))); },
    write: function* ([text]) { check(); if (!writing) raise('UnsupportedOperation', 'not writable'); if (!(text instanceof PyStr)) raise('TypeError', `write() argument must be str, not ${typeName(text)}`); interp.files[name] += text.v; return int(BigInt(text.chars.length)); },
    writelines: function* ([seq]) { check(); for (const l of yield* toList(interp, seq)) interp.files[name] += l.v; return NONE; },
    close: () => { file.closed = true; file.attrs.closed = TRUE; return NONE; },
    __enter__: () => file,
    __exit__: () => { file.closed = true; file.attrs.closed = TRUE; return FALSE; },
    __iter__: () => new PyIterator('list_iterator', function* () { check(); const l = methods.readline([]); return l.v.length ? l : STOP; }),
    seek: ([p]) => { file.pos = Number(p.v); return int(BigInt(file.pos)); },
    tell: () => int(BigInt(file.pos)),
  };
  file.methods = methods;
  return file;
}

if (!TYPES.TextIOWrapper.dict.size) {
  for (const name of ['read', 'readline', 'readlines', 'write', 'writelines', 'close', '__enter__', '__exit__', '__iter__', 'seek', 'tell']) {
    TYPES.TextIOWrapper.dict.set(name, new PyBuiltin(name, (args, kwargs, interp) => args[0].methods[name](args.slice(1), kwargs, interp)));
  }
}
