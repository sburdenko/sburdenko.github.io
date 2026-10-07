/** Methods of the builtin types: str, list, tuple, dict, set, int, float, bytes, generator. */
import {
  PyInt, PyBool, PyFloat, PyStr, PyBytes, PyList, PyTuple, PyDict, PySet, PyBuiltin, PyInstance, PyGenerator, PyIterator, PyError,
  NONE, TRUE, FALSE, int, float, bool, str, internStr, hashKey, UNHASHABLE, typeName, isIntLike, TYPES, normIndex, growAllocation, floatRepr,
} from './objects.js?v=202610071637';
import { EXC, makeExc, raise, pyError } from './errors.js?v=202610071637';
import { reprOf, strOf, formatValue } from './convert.js?v=202610071637';
import { truthy, iterate, toList, STOP, equals, compare, setOp, hashReady } from './ops.js?v=202610071637';
import { copiedSetSize } from './objects.js?v=202610071637';
import { sortItems, toInt } from './builtins.js?v=202610071637';

const needInt = o => { if (!isIntLike(o)) raise('TypeError', `'${typeName(o)}' object cannot be interpreted as an integer`); return Number(o.v); };
const needStr = (o, what) => { if (!(o instanceof PyStr)) raise('TypeError', `${what} arg must be str, not ${typeName(o)}`); return o.v; };
const keyOf = k => { const h = hashKey(k); if (h === UNHASHABLE) raise('TypeError', `cannot use '${typeName(k)}' as a dict key (unhashable type: '${typeName(k)}')`); return h; };

export function installTypeMethods(interp) {
  const add = (type, name, fn) => TYPES[type].dict.set(name, new PyBuiltin(name, fn));

  /* ---------- str ---------- */
  const S = (name, fn) => add('str', name, fn);
  S('upper', ([s]) => str(s.v.toUpperCase()));
  S('lower', ([s]) => str(s.v.toLowerCase()));
  S('capitalize', ([s]) => str(s.v ? s.chars[0].toUpperCase() + s.chars.slice(1).join('').toLowerCase() : ''));
  S('title', ([s]) => str(s.v.replace(/[A-Za-zА-Яа-яЁё]+/g, w => w[0].toUpperCase() + w.slice(1).toLowerCase())));
  S('swapcase', ([s]) => str(s.chars.map(c => (c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase())).join('')));
  S('casefold', ([s]) => str(s.v.toLowerCase()));
  const strip = (s, chars, side) => {
    const set = chars === undefined || chars === NONE ? null : new Set(chars.chars);
    const isStrip = c => (set ? set.has(c) : /\s/.test(c));
    let a = 0, b = s.chars.length;
    if (side !== 'r') while (a < b && isStrip(s.chars[a])) a++;
    if (side !== 'l') while (b > a && isStrip(s.chars[b - 1])) b--;
    return str(s.chars.slice(a, b).join(''));
  };
  S('strip', ([s, c]) => strip(s, c, 'both'));
  S('lstrip', ([s, c]) => strip(s, c, 'l'));
  S('rstrip', ([s, c]) => strip(s, c, 'r'));
  S('split', ([s, sep, max], kwargs) => {
    sep = sep ?? kwargs.get('sep') ?? NONE; max = max ?? kwargs.get('maxsplit');
    const limit = max === undefined || max === NONE ? -1 : Number(max.v);
    if (sep === NONE) {
      const parts = s.v.split(/\s+/).filter(p => p.length);
      if (limit >= 0 && parts.length > limit + 1) { const re = /\S+/g; let m, count = 0, idx = 0; const out = []; while ((m = re.exec(s.v)) && count < limit) { out.push(m[0]); idx = re.lastIndex; count++; } out.push(s.v.slice(idx).replace(/^\s+/, '')); return new PyList(out.map(p => str(p))); }
      return new PyList(parts.map(p => str(p)));
    }
    if (sep.v === '') raise('ValueError', 'empty separator');
    const parts = s.v.split(sep.v);
    if (limit >= 0 && parts.length > limit + 1) return new PyList([...parts.slice(0, limit), parts.slice(limit).join(sep.v)].map(p => str(p)));
    return new PyList(parts.map(p => str(p)));
  });
  S('rsplit', ([s, sep, max], kwargs) => {
    sep = sep ?? kwargs.get('sep') ?? NONE; max = max ?? kwargs.get('maxsplit');
    const limit = max === undefined || max === NONE ? -1 : Number(max.v);
    const parts = sep === NONE ? s.v.split(/\s+/).filter(p => p.length) : s.v.split(sep.v);
    if (limit >= 0 && parts.length > limit + 1) { const head = parts.slice(0, parts.length - limit).join(sep === NONE ? ' ' : sep.v); return new PyList([head, ...parts.slice(parts.length - limit)].map(p => str(p))); }
    return new PyList(parts.map(p => str(p)));
  });
  S('splitlines', ([s, keep]) => { const parts = s.v.split(/(?<=\n)/).filter(p => p.length); return new PyList(parts.map(p => str(keep && keep === TRUE ? p : p.replace(/\r?\n$/, '')))); });
  S('join', function* ([s, it]) {
    const items = yield* toList(interp, it);
    const parts = [];
    items.forEach((x, i) => { if (!(x instanceof PyStr)) raise('TypeError', `sequence item ${i}: expected str instance, ${typeName(x)} found`); parts.push(x.v); });
    return str(parts.join(s.v));
  });
  S('replace', ([s, a, b, n]) => { const limit = n === undefined ? -1 : Number(n.v); if (limit < 0) return str(s.v.split(a.v).join(b.v)); let out = s.v, count = 0, idx = 0, res = ''; while (count < limit) { const i = out.indexOf(a.v, idx); if (i < 0 || a.v === '') break; res += out.slice(idx, i) + b.v; idx = i + a.v.length; count++; } return str(res + out.slice(idx)); });
  const findIn = (s, sub, start, end) => { const chars = s.chars; const a = start === undefined || start === NONE ? 0 : Math.max(0, Number(start.v) < 0 ? Number(start.v) + chars.length : Number(start.v)); const b = end === undefined || end === NONE ? chars.length : Math.min(chars.length, Number(end.v) < 0 ? Number(end.v) + chars.length : Number(end.v)); const hay = chars.slice(a, b).join(''); const i = hay.indexOf(sub.v); return i < 0 ? -1 : a + Array.from(hay.slice(0, i)).length; };
  S('find', ([s, sub, a, b]) => int(BigInt(findIn(s, sub, a, b))));
  S('rfind', ([s, sub]) => { const i = s.v.lastIndexOf(sub.v); return int(BigInt(i < 0 ? -1 : Array.from(s.v.slice(0, i)).length)); });
  S('index', ([s, sub, a, b]) => { const i = findIn(s, sub, a, b); if (i < 0) raise('ValueError', 'substring not found'); return int(BigInt(i)); });
  S('rindex', ([s, sub]) => { const i = s.v.lastIndexOf(sub.v); if (i < 0) raise('ValueError', 'substring not found'); return int(BigInt(Array.from(s.v.slice(0, i)).length)); });
  S('count', ([s, sub]) => { if (sub.v === '') return int(BigInt(s.chars.length + 1)); return int(BigInt(s.v.split(sub.v).length - 1)); });
  S('startswith', ([s, p, a]) => { const off = a === undefined ? 0 : Number(a.v); const hay = s.chars.slice(off).join(''); const ps = p instanceof PyTuple ? p.items : [p]; return bool(ps.some(x => hay.startsWith(x.v))); });
  S('endswith', ([s, p]) => { const ps = p instanceof PyTuple ? p.items : [p]; return bool(ps.some(x => s.v.endsWith(x.v))); });
  S('isdigit', ([s]) => bool(s.v.length > 0 && /^\d+$/.test(s.v)));
  S('isnumeric', ([s]) => bool(s.v.length > 0 && /^[\d²³¹¼-¾]+$/.test(s.v)));
  S('isdecimal', ([s]) => bool(s.v.length > 0 && /^\d+$/.test(s.v)));
  S('isalpha', ([s]) => bool(s.v.length > 0 && /^\p{L}+$/u.test(s.v)));
  S('isalnum', ([s]) => bool(s.v.length > 0 && /^[\p{L}\p{N}]+$/u.test(s.v)));
  S('isspace', ([s]) => bool(s.v.length > 0 && /^\s+$/.test(s.v)));
  S('isupper', ([s]) => bool(/\p{L}/u.test(s.v) && s.v === s.v.toUpperCase()));
  S('islower', ([s]) => bool(/\p{L}/u.test(s.v) && s.v === s.v.toLowerCase()));
  S('istitle', ([s]) => bool(/\p{L}/u.test(s.v) && s.v === s.v.replace(/[\p{L}]+/gu, w => w[0].toUpperCase() + w.slice(1).toLowerCase())));
  S('isidentifier', ([s]) => bool(/^[A-Za-z_][A-Za-z0-9_]*$/.test(s.v)));
  const justify = (s, width, fill, mode) => { const w = needInt(width), f = fill === undefined ? ' ' : fill.v; const n = s.chars.length; if (w <= n) return s; const space = w - n; if (mode === 'l') return str(s.v + f.repeat(space)); if (mode === 'r') return str(f.repeat(space) + s.v); const left = Math.floor(space / 2) + ((space % 2) && (w % 2) ? 1 : 0); return str(f.repeat(left) + s.v + f.repeat(space - left)); };
  S('ljust', ([s, w, f]) => justify(s, w, f, 'l'));
  S('rjust', ([s, w, f]) => justify(s, w, f, 'r'));
  S('center', ([s, w, f]) => justify(s, w, f, 'c'));
  S('zfill', ([s, w]) => { const width = needInt(w); const sign = /^[+-]/.test(s.v) ? s.v[0] : ''; const body = sign ? s.v.slice(1) : s.v; const n = s.chars.length; return n >= width ? s : str(sign + '0'.repeat(width - n) + body); });
  S('format', function* ([s, ...args], kwargs) {
    let auto = 0, out = '', i = 0;
    const t = s.v;
    while (i < t.length) {
      const c = t[i];
      if (c === '{') {
        if (t[i + 1] === '{') { out += '{'; i += 2; continue; }
        const end = t.indexOf('}', i);
        if (end < 0) raise('ValueError', "Single '{' encountered in format string");
        const field = t.slice(i + 1, end);
        const [nameConv, spec = ''] = splitSpec(field);
        const [name, conv] = nameConv.split('!');
        let value;
        const m = name.match(/^([^.[]*)(.*)$/);
        const base = m[1];
        if (base === '') value = args[auto++]; else if (/^\d+$/.test(base)) value = args[Number(base)]; else value = kwargs.get(base);
        if (value === undefined) raise(/^\d*$/.test(base) ? 'IndexError' : 'KeyError', /^\d*$/.test(base) ? 'Replacement index out of range for positional args tuple' : `'${base}'`);
        for (const part of m[2].matchAll(/\.(\w+)|\[(\w+)\]/g)) value = part[1] ? yield* interp.getattr(value, part[1]) : yield* interp.getitem(value, /^\d+$/.test(part[2]) ? int(BigInt(part[2])) : str(part[2]));
        if (conv === 'r') value = str(yield* reprOf(interp, value)); else if (conv === 's') value = str(yield* strOf(interp, value));
        out += yield* formatValue(interp, value, spec);
        i = end + 1;
        continue;
      }
      if (c === '}') { if (t[i + 1] === '}') { out += '}'; i += 2; continue; } raise('ValueError', "Single '}' encountered in format string"); }
      out += c; i++;
    }
    return str(out);
  });
  const splitSpec = field => { const i = field.indexOf(':'); return i < 0 ? [field] : [field.slice(0, i), field.slice(i + 1)]; };
  S('encode', ([s, enc]) => { const e = enc === undefined ? 'utf-8' : enc.v.toLowerCase().replace('_', '-'); if (e === 'ascii' || e === 'us-ascii') { for (const ch of s.v) if (ch.codePointAt(0) > 127) raise('UnicodeEncodeError', `'ascii' codec can't encode character '${ch}' in position ${Array.from(s.v).indexOf(ch)}: ordinal not in range(128)`); } if (e === 'utf-16' || e === 'utf-32' || e === 'cp1251' || e === 'latin-1' || e === 'iso-8859-1') { if (e === 'latin-1' || e === 'iso-8859-1') return new PyBytes(new Uint8Array(Array.from(s.v).map(ch => ch.codePointAt(0)))); } return new PyBytes(new TextEncoder().encode(s.v)); });
  S('partition', ([s, sep]) => { const i = s.v.indexOf(sep.v); return new PyTuple(i < 0 ? [s, internStr(''), internStr('')] : [str(s.v.slice(0, i)), sep, str(s.v.slice(i + sep.v.length))]); });
  S('rpartition', ([s, sep]) => { const i = s.v.lastIndexOf(sep.v); return new PyTuple(i < 0 ? [internStr(''), internStr(''), s] : [str(s.v.slice(0, i)), sep, str(s.v.slice(i + sep.v.length))]); });
  S('removeprefix', ([s, p]) => str(s.v.startsWith(p.v) ? s.v.slice(p.v.length) : s.v));
  S('removesuffix', ([s, p]) => str(p.v && s.v.endsWith(p.v) ? s.v.slice(0, -p.v.length) : s.v));
  S('expandtabs', ([s, n]) => { const size = n ? Number(n.v) : 8; let out = '', col = 0; for (const ch of s.v) { if (ch === '\t') { const k = size - (col % size); out += ' '.repeat(k); col += k; } else { out += ch; col = ch === '\n' ? 0 : col + 1; } } return str(out); });
  S('__len__', ([s]) => int(BigInt(s.chars.length)));
  S('__contains__', ([s, x]) => bool(s.v.includes(x.v)));
  S('__getitem__', function* ([s, k]) { return yield* interp.getitem(s, k); });
  S('__add__', ([s, o]) => (o instanceof PyStr ? str(s.v + o.v) : raise('TypeError', `can only concatenate str (not "${typeName(o)}") to str`)));
  S('__mul__', ([s, n]) => str(s.v.repeat(Math.max(0, needInt(n)))));
  S('__eq__', ([s, o]) => bool(o instanceof PyStr && s.v === o.v));
  S('__hash__', ([s]) => int(BigInt(s.v.length)));
  S('__str__', ([s]) => s);
  S('__repr__', function* ([s]) { return str(yield* reprOf(interp, s)); });
  S('maketrans', ([a, b]) => { const d = new PyDict(); if (a instanceof PyDict) return a; a.chars.forEach((c, i) => d.map.set('i' + c.codePointAt(0), { k: int(BigInt(c.codePointAt(0))), v: int(BigInt(b.chars[i].codePointAt(0))) })); return d; });
  S('translate', ([s, table]) => str(s.chars.map(c => { const e = table.map.get('i' + c.codePointAt(0)); if (!e) return c; return e.v === NONE ? '' : e.v instanceof PyStr ? e.v.v : String.fromCodePoint(Number(e.v.v)); }).join('')));
  TYPES.str.dict.set('maketrans', new PyBuiltin('maketrans', TYPES.str.dict.get('maketrans').fn));
  TYPES.str.dict.get('maketrans').isStatic = true;

  /* ---------- list ---------- */
  const L = (name, fn) => add('list', name, fn);
  L('append', ([l, x]) => { l.push(x); interp.touch(l, l.items.length - 1, 'write'); return NONE; });
  L('extend', function* ([l, it]) { const items = yield* toList(interp, it); for (const x of items) l.push(x); return NONE; });
  L('insert', ([l, i, x]) => { let idx = needInt(i); if (idx < 0) idx += l.items.length; idx = Math.max(0, Math.min(l.items.length, idx)); l.items.splice(idx, 0, x); if (l.items.length > l.allocated) l.allocated = growAllocation(l.items.length); interp.touch(l, idx, 'write'); return NONE; });
  L('pop', ([l, i]) => { if (!l.items.length) raise('IndexError', 'pop from empty list'); const idx = i === undefined ? l.items.length - 1 : normIndex(needInt(i), l.items.length); if (idx === null) raise('IndexError', 'pop index out of range'); interp.touch(l, idx, 'read'); return l.items.splice(idx, 1)[0]; });
  L('remove', function* ([l, x]) { for (let i = 0; i < l.items.length; i++) if (yield* equals(interp, l.items[i], x)) { l.items.splice(i, 1); return NONE; } raise('ValueError', 'list.remove(x): x not in list'); });
  L('index', function* ([l, x, start]) { const from = start ? needInt(start) : 0; for (let i = from; i < l.items.length; i++) if (yield* equals(interp, l.items[i], x)) { interp.touch(l, i, 'read'); return int(BigInt(i)); } raise('ValueError', `${yield* reprOf(interp, x)} is not in list`); });
  L('count', function* ([l, x]) { let n = 0; for (const it of l.items) if (yield* equals(interp, it, x)) n++; return int(BigInt(n)); });
  L('sort', function* ([l], kwargs) { const reverse = kwargs.has('reverse') ? yield* truthy(interp, kwargs.get('reverse')) : false; l.items = yield* sortItems(interp, l.items, kwargs.get('key') ?? null, reverse); return NONE; });
  L('reverse', ([l]) => { l.items.reverse(); return NONE; });
  L('copy', ([l]) => new PyList([...l.items]));
  L('clear', ([l]) => { l.items.length = 0; return NONE; });
  L('__len__', ([l]) => int(BigInt(l.items.length)));
  L('__getitem__', function* ([l, k]) { return yield* interp.getitem(l, k); });
  L('__setitem__', function* ([l, k, v]) { yield* interp.setitem(l, k, v); return NONE; });
  L('__contains__', function* ([l, x]) { return bool(yield* interp.compare('in', x, l)); });
  L('__iter__', function* ([l]) { return yield* iterate(interp, l); });
  L('__add__', function* ([a, b]) { return yield* interp.binop('+', a, b); });
  L('__eq__', function* ([a, b]) { return bool(yield* equals(interp, a, b)); });
  L('__repr__', function* ([l]) { return str(yield* reprOf(interp, l)); });

  /* ---------- tuple ---------- */
  add('tuple', 'count', function* ([t, x]) { let n = 0; for (const it of t.items) if (yield* equals(interp, it, x)) n++; return int(BigInt(n)); });
  add('tuple', 'index', function* ([t, x]) { for (let i = 0; i < t.items.length; i++) if (yield* equals(interp, t.items[i], x)) return int(BigInt(i)); raise('ValueError', 'tuple.index(x): x not in tuple'); });
  add('tuple', '__len__', ([t]) => int(BigInt(t.items.length)));
  add('tuple', '__getitem__', function* ([t, k]) { return yield* interp.getitem(t, k); });

  /* ---------- dict ---------- */
  const D = (name, fn) => add('dict', name, fn);
  const view = (d, kind) => new PyIterator(kind === 'keys' ? 'dict_keys' : kind === 'values' ? 'dict_values' : 'dict_items', function* () {
    if (this.i >= this.entries.length) return STOP;
    const e = this.entries[this.i++];
    return kind === 'keys' ? e.k : kind === 'values' ? e.v : new PyTuple([e.k, e.v]);
  }, { i: 0, entries: d.entries(), dictView: kind, dict: d, reprText: null });
  D('keys', ([d]) => view(d, 'keys'));
  D('values', ([d]) => view(d, 'values'));
  D('items', ([d]) => view(d, 'items'));
  D('get', function* ([d, k, def]) { yield* hashReady(interp, k); const e = d.map.get(keyOf(k)); if (e) interp.touch(d, keyOf(k), 'read'); return e ? e.v : (def ?? NONE); });
  D('setdefault', function* ([d, k, def]) { yield* hashReady(interp, k); const hk = keyOf(k); const e = d.map.get(hk); if (e) return e.v; const v = def ?? NONE; d.map.set(hk, { k, v }); interp.touch(d, hk, 'write'); return v; });
  D('pop', function* ([d, k, def]) { yield* hashReady(interp, k); const hk = keyOf(k); const e = d.map.get(hk); if (!e) { if (def !== undefined) return def; throw pyError('KeyError', k); } d.map.delete(hk); return e.v; });
  D('popitem', ([d]) => { if (!d.map.size) raise('KeyError', "'popitem(): dictionary is empty'"); const last = [...d.map.keys()].at(-1); const e = d.map.get(last); d.map.delete(last); return new PyTuple([e.k, e.v]); });
  D('update', function* ([d, other], kwargs) {
    if (other !== undefined) {
      if (other instanceof PyDict) for (const e of other.entries()) d.map.set(hashKey(e.k), { k: e.k, v: e.v });
      else for (const p of yield* toList(interp, other)) { const kv = yield* toList(interp, p); d.map.set(keyOf(kv[0]), { k: kv[0], v: kv[1] }); }
    }
    for (const [k, v] of kwargs) d.map.set('s' + k, { k: internStr(k), v });
    return NONE;
  });
  D('clear', ([d]) => { d.map.clear(); return NONE; });
  D('copy', ([d]) => { const c = new PyDict(); for (const [k, e] of d.map) c.map.set(k, { k: e.k, v: e.v }); if (d.defaultFactory !== undefined) { c.defaultFactory = d.defaultFactory; c.reprName = d.reprName; c.cls = d.cls; } return c; });
  D('fromkeys', function* ([src, value]) { const d = new PyDict(); const keys = src instanceof PyDict ? [] : yield* toList(interp, src); for (const k of keys) d.map.set(keyOf(k), { k, v: value ?? NONE }); return d; });
  D('__len__', ([d]) => int(BigInt(d.map.size)));
  D('__getitem__', function* ([d, k]) { return yield* interp.getitem(d, k); });
  D('__setitem__', function* ([d, k, v]) { yield* interp.setitem(d, k, v); return NONE; });
  D('__contains__', function* ([d, k]) { yield* hashReady(interp, k); return bool(d.map.has(keyOf(k))); });
  D('__iter__', function* ([d]) { return yield* iterate(interp, d); });
  D('__repr__', function* ([d]) { return str(yield* reprOf(interp, d)); });
  TYPES.dict.dict.get('fromkeys').isClassMethodLike = true;

  /* ---------- set ---------- */
  const SE = (name, fn) => { add('set', name, fn); add('frozenset', name, fn); };
  SE('add', function* ([s, x]) { if (s.frozen) raise('AttributeError', "'frozenset' object has no attribute 'add'"); yield* hashReady(interp, x); interp.setAdd(s, x); return NONE; });
  SE('remove', function* ([s, x]) { yield* hashReady(interp, x); const hk = keyOf(x); if (!s.map.has(hk)) throw pyError('KeyError', x); s.map.delete(hk); return NONE; });
  SE('discard', function* ([s, x]) { yield* hashReady(interp, x); s.map.delete(keyOf(x)); return NONE; });
  SE('pop', ([s]) => { const first = s.items()[0]; if (!first) raise('KeyError', "'pop from an empty set'"); s.map.delete(hashKey(first)); return first; });
  SE('clear', ([s]) => { s.map.clear(); return NONE; });
  SE('copy', ([s]) => { const c = new PySet(s.frozen); c.initialSize = copiedSetSize(s.map.size); for (const v of s.items()) c.map.set(hashKey(v), v); return c; });
  const asSet = function* (o) { if (o instanceof PySet) return o; const s = new PySet(); for (const v of yield* toList(interp, o)) interp.setAdd(s, yield* hashReady(interp, v)); return s; };
  SE('union', function* ([s, ...others]) { let r = setOp('|', s, new PySet()); for (const o of others) r = setOp('|', r, yield* asSet(o)); return r; });
  SE('intersection', function* ([s, ...others]) { let r = setOp('|', s, new PySet()); for (const o of others) r = setOp('&', r, yield* asSet(o)); return r; });
  SE('difference', function* ([s, ...others]) { let r = setOp('|', s, new PySet()); for (const o of others) r = setOp('-', r, yield* asSet(o)); return r; });
  SE('symmetric_difference', function* ([s, o]) { return setOp('^', s, yield* asSet(o)); });
  SE('update', function* ([s, ...others]) { for (const o of others) for (const v of yield* toList(interp, o)) interp.setAdd(s, yield* hashReady(interp, v)); return NONE; });
  SE('intersection_update', function* ([s, o]) { const r = setOp('&', s, yield* asSet(o)); s.map = r.map; return NONE; });
  SE('difference_update', function* ([s, o]) { const r = setOp('-', s, yield* asSet(o)); s.map = r.map; return NONE; });
  SE('issubset', function* ([s, o]) { const t = yield* asSet(o); return bool([...s.map.keys()].every(k => t.map.has(k))); });
  SE('issuperset', function* ([s, o]) { const t = yield* asSet(o); return bool([...t.map.keys()].every(k => s.map.has(k))); });
  SE('isdisjoint', function* ([s, o]) { const t = yield* asSet(o); return bool(![...s.map.keys()].some(k => t.map.has(k))); });
  SE('__len__', ([s]) => int(BigInt(s.map.size)));
  SE('__contains__', ([s, x]) => bool(s.map.has(keyOf(x))));
  SE('__iter__', function* ([s]) { return yield* iterate(interp, s); });

  /* ---------- int / float ---------- */
  add('int', 'bit_length', ([i]) => int(BigInt((i.v < 0n ? -i.v : i.v).toString(2).length - (i.v === 0n ? 1 : 0))));
  add('int', 'bit_count', ([i]) => int(BigInt([...(i.v < 0n ? -i.v : i.v).toString(2)].filter(c => c === '1').length)));
  add('int', 'to_bytes', ([i, n, order], kwargs) => { const len = n ? Number(n.v) : 1; const big = (order ?? kwargs.get('byteorder') ?? internStr('big')).v === 'big'; const out = new Uint8Array(len); let v = i.v; for (let k = 0; k < len; k++) { out[big ? len - 1 - k : k] = Number(v & 0xffn); v >>= 8n; } return new PyBytes(out); });
  add('int', '__add__', function* ([a, b]) { return yield* interp.binop('+', a, b); });
  add('int', '__sub__', function* ([a, b]) { return yield* interp.binop('-', a, b); });
  add('int', '__mul__', function* ([a, b]) { return yield* interp.binop('*', a, b); });
  add('int', '__eq__', function* ([a, b]) { return bool(yield* equals(interp, a, b)); });
  add('int', '__lt__', function* ([a, b]) { return bool(yield* compare(interp, '<', a, b)); });
  add('int', '__hash__', ([a]) => a);
  add('int', '__repr__', ([a]) => str(a.v.toString()));
  add('int', '__str__', ([a]) => str(a.v.toString()));
  add('int', '__bool__', ([a]) => bool(a.v !== 0n));
  add('int', '__abs__', ([a]) => int(a.v < 0n ? -a.v : a.v));
  add('int', '__index__', ([a]) => a);
  add('int', '__int__', ([a]) => a);
  add('int', '__float__', ([a]) => float(Number(a.v)));
  add('int', 'conjugate', ([a]) => a);
  add('int', 'as_integer_ratio', ([a]) => new PyTuple([a, int(1n)]));
  add('int', 'from_bytes', function* ([src, order], kwargs) { const bytes = src instanceof PyBytes ? src.bytes : src; const big = (order ?? kwargs.get('byteorder') ?? internStr('big')).v === 'big'; let v = 0n; const arr = [...bytes]; for (const b of big ? arr : arr.reverse()) v = (v << 8n) | BigInt(b); return int(v); });
  add('float', 'is_integer', ([f]) => bool(Number.isInteger(f.v)));
  add('float', 'as_integer_ratio', ([f]) => { if (!Number.isFinite(f.v)) raise('ValueError', 'cannot convert'); let num = f.v, den = 1n; while (!Number.isInteger(num)) { num *= 2; den *= 2n; } let n = BigInt(num); const g = (a, b) => (b === 0n ? a : g(b, a % b)); const gg = g(n < 0n ? -n : n, den); return new PyTuple([int(n / gg), int(den / gg)]); });
  add('float', 'hex', ([f]) => str(f.v.toString(16)));
  add('float', '__repr__', ([f]) => str(floatRepr(f.v)));
  add('float', '__round__', function* ([f, n]) { return yield* interp.builtins.get('round').fn(n ? [f, n] : [f], new Map(), interp); });
  add('float', '__abs__', ([f]) => float(Math.abs(f.v)));
  add('float', '__int__', ([f]) => int(BigInt(Math.trunc(f.v))));
  add('float', '__float__', ([f]) => f);
  add('float', '__eq__', function* ([a, b]) { return bool(yield* equals(interp, a, b)); });
  add('float', '__add__', function* ([a, b]) { return yield* interp.binop('+', a, b); });
  add('float', 'conjugate', ([f]) => f);
  add('float', '__trunc__', ([f]) => int(BigInt(Math.trunc(f.v))));

  /* ---------- bytes ---------- */
  add('bytes', 'decode', ([b, enc]) => { const e = enc === undefined ? 'utf-8' : enc.v.toLowerCase(); if (e === 'ascii') { for (const x of b.bytes) if (x > 127) raise('UnicodeDecodeError', `'ascii' codec can't decode byte 0x${x.toString(16)} in position ${b.bytes.indexOf(x)}: ordinal not in range(128)`); } try { return str(new TextDecoder('utf-8', { fatal: true }).decode(b.bytes)); } catch { return raise('UnicodeDecodeError', `'utf-8' codec can't decode bytes`); } });
  add('bytes', 'hex', ([b, sep]) => str([...b.bytes].map(x => x.toString(16).padStart(2, '0')).join(sep ? sep.v : '')));
  add('bytes', '__len__', ([b]) => int(BigInt(b.bytes.length)));
  add('bytes', 'fromhex', ([s]) => new PyBytes(new Uint8Array(s.v.replace(/\s/g, '').match(/../g).map(h => parseInt(h, 16)))));
  add('bytes', 'count', ([b, x]) => int(BigInt([...b.bytes].filter(v => v === Number(x.v)).length)));
  add('bytes', 'upper', ([b]) => new PyBytes(new Uint8Array([...b.bytes].map(v => (v >= 97 && v <= 122 ? v - 32 : v)))));
  add('bytes', 'startswith', ([b, p]) => bool(p.bytes.length <= b.bytes.length && p.bytes.every((v, i) => b.bytes[i] === v)));

  /* ---------- generator ---------- */
  add('generator', '__next__', function* ([g]) { return yield* interp.genNext(g, NONE); });
  add('generator', 'send', function* ([g, v]) { return yield* interp.genNext(g, v); });
  add('generator', 'close', ([g]) => { g.done = true; return NONE; });
  add('generator', '__iter__', ([g]) => g);
  add('generator', 'throw', function* ([g, exc]) { g.done = true; throw new PyError(exc instanceof PyInstance ? exc : makeExc(exc, [])); });

  /* ---------- iterator objects ---------- */
  for (const t of ['list_iterator', 'enumerate', 'zip', 'map', 'filter', 'reversed', 'dict_keys', 'dict_values', 'dict_items']) {
    add(t, '__next__', function* ([it]) { const v = yield* it.next(); if (v === STOP) throw new PyError(makeExc(EXC.StopIteration, [])); return v; });
    add(t, '__iter__', ([it]) => it);
  }
  for (const t of ['dict_keys', 'dict_items']) {
    add(t, '__contains__', function* ([it, x]) { if (it.dictView === 'keys') return bool(it.dict.map.has(keyOf(x))); for (const e of it.dict.entries()) if (yield* equals(interp, new PyTuple([e.k, e.v]), x)) return TRUE; return FALSE; });
    add(t, '__and__', function* ([it, other]) { const s = new PySet(); const o = yield* toList(interp, other); for (const e of it.dict.entries()) { const v = it.dictView === 'keys' ? e.k : new PyTuple([e.k, e.v]); for (const x of o) if (yield* equals(interp, v, x)) interp.setAdd(s, v); } return s; });
  }
  for (const t of ['dict_keys', 'dict_values', 'dict_items']) add(t, '__len__', ([it]) => int(BigInt(it.dict.map.size)));
}
