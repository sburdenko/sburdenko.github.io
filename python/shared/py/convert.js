/** str(), repr() and format specs for every builtin value; user classes get their dunders called through the interpreter. */
import {
  PyInt, PyBool, PyFloat, PyStr, PyBytes, PyList, PyTuple, PyDict, PySet, PyRange, PyFunction, PyBuiltin, PyMethod, PyClass, PyInstance,
  PyGenerator, PyModule, PyProperty, PyIterator, PySlice, NONE, ELLIPSIS, TRUE, FALSE, reprStr, reprBytes, floatRepr, str, isInt, typeName, isIntLike, TYPES,
} from './objects.js?v=202610071646';
import { raise, excArgs, isExceptionClass } from './errors.js?v=202610071646';

export function* reprOf(interp, o, seen = new Set()) {
  if ((o instanceof PyList || o instanceof PyDict || o instanceof PyTuple) && o.cls && o.cls.dict.has('__repr__') && !o.cls.builtin) {
    const r = yield* interp.call(o.cls.dict.get('__repr__'), [o], new Map());
    return r.v;
  }
  if ((o instanceof PyList || o instanceof PyDict || o instanceof PyTuple) && o.cls && o.cls.dict.has('__repr__') && o.cls.dict.get('__repr__') instanceof PyBuiltin && o.cls !== TYPES.list && o.cls !== TYPES.dict && o.cls !== TYPES.tuple) {
    const r = yield* interp.call(o.cls.dict.get('__repr__'), [o], new Map());
    return r.v;
  }
  if (o instanceof PyBool) return o === TRUE ? 'True' : 'False';
  if (o instanceof PyInt) return o.v.toString();
  if (o instanceof PyFloat) return floatRepr(o.v);
  if (o instanceof PyStr) return reprStr(o.v);
  if (o instanceof PyBytes) return reprBytes(o.bytes);
  if (o === NONE) return 'None';
  if (o === ELLIPSIS) return 'Ellipsis';
  if (o instanceof PyList || o instanceof PyTuple) {
    if (seen.has(o)) return o instanceof PyList ? '[...]' : '(...)';
    seen.add(o);
    const parts = [];
    for (const it of o.items) parts.push(yield* reprOf(interp, it, seen));
    seen.delete(o);
    if (o instanceof PyList) return `${o.prefix ?? ''}[${parts.join(', ')}]${o.prefix ? ')' : ''}`;
    return parts.length === 1 ? `(${parts[0]},)` : `(${parts.join(', ')})`;
  }
  if (o instanceof PyDict) {
    if (seen.has(o)) return '{...}';
    seen.add(o);
    const parts = [];
    for (const { k, v } of o.entries()) parts.push(`${yield* reprOf(interp, k, seen)}: ${yield* reprOf(interp, v, seen)}`);
    seen.delete(o);
    const body = `{${parts.join(', ')}}`;
    if (o.reprName) return o.reprName === 'defaultdict' ? `defaultdict(${yield* reprOf(interp, o.defaultFactory, seen)}, ${body})` : `${o.reprName}(${parts.length ? body : ''})`;
    return body;
  }
  if (o instanceof PySet) {
    const parts = [];
    for (const it of o.items()) parts.push(yield* reprOf(interp, it, seen));
    if (o.frozen) return parts.length ? `frozenset({${parts.join(', ')}})` : 'frozenset()';
    return parts.length ? `{${parts.join(', ')}}` : 'set()';
  }
  if (o instanceof PyRange) return o.step === 1n ? `range(${o.start}, ${o.stop})` : `range(${o.start}, ${o.stop}, ${o.step})`;
  if (o instanceof PySlice) return `slice(${yield* reprOf(interp, o.lower)}, ${yield* reprOf(interp, o.upper)}, ${yield* reprOf(interp, o.step)})`;
  if (o instanceof PyFunction) return o.isLambda ? `<function <lambda> at 0x${addr(o)}>` : `<function ${o.qualname} at 0x${addr(o)}>`;
  if (o instanceof PyBuiltin) return o.self ? `<built-in method ${o.name} of ${typeName(o.self)} object at 0x${addr(o.self)}>` : `<built-in function ${o.name}>`;
  if (o instanceof PyMethod) return `<bound method ${o.self instanceof PyClass ? o.self.name : typeName(o.self)}.${o.fn.name} of ${yield* reprOf(interp, o.self, seen)}>`;
  if (o instanceof PyClass) return o.builtin && !o.isException ? `<class '${o.name}'>` : `<class '${o.module === 'builtins' ? '' : o.module + '.'}${o.name}'>`;
  if (o instanceof PyGenerator) return `<generator object ${o.name} at 0x${addr(o)}>`;
  if (o instanceof PyModule) return `<module '${o.name}' (built-in)>`;
  if (o instanceof PyProperty) return `<property object at 0x${addr(o)}>`;
  if (o instanceof PyIterator) return `<${o.cls.name} object at 0x${addr(o)}>`;
  if (o instanceof PyInstance) {
    const fn = o.cls.lookup('__repr__');
    if (fn !== undefined && !fn.isDefault) {
      const r = yield* interp.call(fn, [o], new Map());
      if (!(r instanceof PyStr)) raise('TypeError', `__repr__ returned non-string (type ${typeName(r)})`);
      return r.v;
    }
    if (isExceptionClass(o.cls)) {
      const parts = [];
      for (const a of excArgs(o)) parts.push(yield* reprOf(interp, a, seen));
      return `${o.cls.name}(${parts.join(', ')})`;
    }
    return `<${o.cls.module === 'builtins' ? '' : o.cls.module + '.'}${o.cls.name} object at 0x${addr(o)}>`;
  }
  if (o && o.reprText) return o.reprText;
  return `<${typeName(o)} object at 0x${addr(o)}>`;
}

export function* strOf(interp, o) {
  if (o instanceof PyStr) return o.v;
  if (o instanceof PyInstance) {
    const fn = o.cls.lookup('__str__');
    if (fn !== undefined && !fn.isDefault) {
      const r = yield* interp.call(fn, [o], new Map());
      if (!(r instanceof PyStr)) raise('TypeError', `__str__ returned non-string (type ${typeName(r)})`);
      return r.v;
    }
    const rp = o.cls.lookup('__repr__');
    if (rp !== undefined && !rp.isDefault && isExceptionClass(o.cls) === false) return yield* reprOf(interp, o);
    if (isExceptionClass(o.cls)) {
      const args = excArgs(o);
      if (!args.length) return '';
      if (args.length === 1) return o.cls.name === 'KeyError' ? yield* reprOf(interp, args[0]) : yield* strOf(interp, args[0]);
      return yield* reprOf(interp, new PyTuple(args));
    }
  }
  return yield* reprOf(interp, o);
}

/** A fake address derived from the id, stable within one run. */
export const addr = o => (0x7f3a00000000 + o.id * 0x40).toString(16);

/* ---------- format specs ---------- */
const SPEC = /^(?:(.)?([<>=^]))?([+\- ])?(#)?(0)?(\d+)?([,_])?(?:\.(\d+))?([bcdeEfFgGnosxX%])?$/;

function group(intPart, sep) {
  return intPart.replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

function pad(body, fill, align, width, sign = '') {
  const total = sign.length + [...body].length;
  if (!width || total >= width) return sign + body;
  const space = width - total;
  if (align === '<') return sign + body + fill.repeat(space);
  if (align === '^') return fill.repeat(Math.floor(space / 2)) + sign + body + fill.repeat(space - Math.floor(space / 2));
  if (align === '=') return sign + fill.repeat(space) + body;
  return fill.repeat(space) + sign + body;
}

function formatFloatDigits(v, type, precision) {
  const p = precision ?? 6;
  switch (type) {
    case 'f': case 'F': return Math.abs(v).toFixed(p);
    case 'e': case 'E': {
      const [m, e] = Math.abs(v).toExponential(p).split('e');
      const s = `${m}e${e[0] === '-' ? '-' : '+'}${String(Math.abs(Number(e))).padStart(2, '0')}`;
      return type === 'E' ? s.toUpperCase() : s;
    }
    case '%': return Math.abs(v * 100).toFixed(p) + '%';
    case 'g': case 'G': {
      const pp = p === 0 ? 1 : p;
      const exp = Math.abs(v) === 0 ? 0 : Math.floor(Math.log10(Math.abs(v)));
      let s;
      if (exp < -4 || exp >= pp) {
        const [m, e] = Math.abs(v).toExponential(pp - 1).split('e');
        s = `${m.includes('.') ? m.replace(/\.?0+$/, '') : m}e${e[0] === '-' ? '-' : '+'}${String(Math.abs(Number(e))).padStart(2, '0')}`;
      } else {
        s = Math.abs(v).toFixed(Math.max(0, pp - 1 - exp));
        if (s.includes('.')) s = s.replace(/\.?0+$/, '');
      }
      return type === 'G' ? s.toUpperCase() : s;
    }
    default: {
      if (precision === undefined) return floatRepr(Math.abs(v));
      return formatFloatDigits(v, 'g', precision);
    }
  }
}

/** format(value, spec) for ints, floats and strings. Returns null when the type is not handled here. */
export function formatBuiltin(o, spec) {
  if (spec === '') return null;
  const m = spec.match(SPEC);
  if (!m) raise('ValueError', `Invalid format specifier '${spec}'`);
  const [, fillIn, alignIn, signOpt, alt, zero, widthStr, grouping, precStr, type] = m;
  const width = widthStr ? Number(widthStr) : 0;
  const precision = precStr !== undefined ? Number(precStr) : undefined;
  let fill = fillIn ?? (zero ? '0' : ' ');
  let align = alignIn ?? (zero ? '=' : null);

  if (o instanceof PyStr) {
    if (type && type !== 's') raise('ValueError', `Unknown format code '${type}' for object of type 'str'`);
    if (signOpt) raise('ValueError', 'Sign not allowed in string format specifier');
    let body = o.v;
    if (precision !== undefined) body = [...body].slice(0, precision).join('');
    return pad(body, fill, align ?? '<', width);
  }
  const signOf = neg => (neg ? '-' : signOpt === '+' ? '+' : signOpt === ' ' ? ' ' : '');
  if (o instanceof PyInt && !(o instanceof PyBool && type === 's')) {
    const v = o.v, neg = v < 0n, a = neg ? -v : v;
    let body;
    switch (type ?? 'd') {
      case 'd': case 'n': body = a.toString(); break;
      case 'b': body = (alt ? '0b' : '') + a.toString(2); break;
      case 'o': body = (alt ? '0o' : '') + a.toString(8); break;
      case 'x': body = (alt ? '0x' : '') + a.toString(16); break;
      case 'X': body = (alt ? '0X' : '') + a.toString(16).toUpperCase(); break;
      case 'c': body = String.fromCodePoint(Number(a)); break;
      case 'f': case 'F': case 'e': case 'E': case 'g': case 'G': case '%': return formatBuiltin(new PyFloat(Number(v)), spec);
      case 's': raise('ValueError', "Unknown format code 's' for object of type 'int'"); break;
      default: raise('ValueError', `Unknown format code '${type}' for object of type 'int'`);
    }
    if (grouping) body = group(body, grouping);
    return pad(body, fill, align ?? '>', width, signOf(neg));
  }
  if (o instanceof PyFloat) {
    const v = o.v, neg = v < 0 || Object.is(v, -0);
    if (type === 's' || type === 'd' || type === 'x' || type === 'b' || type === 'o' || type === 'c') raise('ValueError', `Unknown format code '${type}' for object of type 'float'`);
    let body = Number.isFinite(v) ? formatFloatDigits(v, type, precision) : (Number.isNaN(v) ? 'nan' : 'inf');
    if (!type && precision === undefined && Number.isFinite(v) && !body.includes('.') && !body.includes('e')) body += '.0';
    if (grouping) { const [ip, rest] = body.split(/(?=[.e%])/); body = group(ip, grouping) + (rest ? body.slice(ip.length) : ''); }
    return pad(body, fill, align ?? '>', width, signOf(neg));
  }
  return null;
}

export function* formatValue(interp, o, spec) {
  if (o instanceof PyInstance) {
    const fn = o.cls.lookup('__format__');
    if (fn !== undefined) {
      const r = yield* interp.call(fn, [o, str(spec)], new Map());
      return r.v;
    }
    if (spec !== '') raise('TypeError', `unsupported format string passed to ${o.cls.name}.__format__`);
    return yield* strOf(interp, o);
  }
  const built = formatBuiltin(o, spec);
  if (built !== null) return built;
  if (spec !== '' && !(o instanceof PyStr || isIntLike(o) || o instanceof PyFloat)) raise('TypeError', `unsupported format string passed to ${typeName(o)}.__format__`);
  return yield* strOf(interp, o);
}

/** printf-style `%` formatting used by `"%d" % x`. */
export function* percentFormat(interp, template, right) {
  const values = right instanceof PyTuple ? right.items : [right];
  let i = 0, out = '';
  const re = /%(\((\w+)\))?([-+ 0#]*)(\d+|\*)?(?:\.(\d+))?([sdifrxXoeEgG%c])/g;
  let last = 0, m;
  while ((m = re.exec(template))) {
    out += template.slice(last, m.index);
    last = re.lastIndex;
    const [, , key, flags, widthStr, precStr, type] = m;
    if (type === '%') { out += '%'; continue; }
    let value;
    if (key) { if (!(right instanceof PyDict)) raise('TypeError', 'format requires a mapping'); value = right.map.get('s' + key)?.v; if (value === undefined) raise('KeyError', `'${key}'`); }
    else { if (i >= values.length) raise('TypeError', 'not enough arguments for format string'); value = values[i++]; }
    let body;
    if (type === 's') body = yield* strOf(interp, value);
    else if (type === 'r') body = yield* reprOf(interp, value);
    else if (type === 'c') body = value instanceof PyStr ? value.v : String.fromCodePoint(Number(value.v));
    else {
      if (!(value instanceof PyInt || value instanceof PyFloat)) raise('TypeError', `%${type} format: a real number is required, not ${typeName(value)}`);
      const specType = type === 'i' ? 'd' : type;
      const num = (specType === 'd' || specType === 'x' || specType === 'X' || specType === 'o') && value instanceof PyFloat ? new PyInt(BigInt(Math.trunc(value.v))) : value;
      const specStr = `${flags.includes('+') ? '+' : flags.includes(' ') ? ' ' : ''}${flags.includes('#') ? '#' : ''}${precStr !== undefined ? '.' + precStr : ''}${specType}`;
      body = formatBuiltin(num, specStr);
    }
    const width = widthStr === '*' ? Number(values[i++].v) : widthStr ? Number(widthStr) : 0;
    if (width && [...body].length < width) {
      const space = width - [...body].length;
      body = flags.includes('-') ? body + ' '.repeat(space) : (flags.includes('0') && type !== 's' ? body.replace(/^([+-]?)/, `$1${'0'.repeat(space)}`) : ' '.repeat(space) + body);
    }
    out += body;
  }
  out += template.slice(last);
  if (!(right instanceof PyDict) && i < values.length) raise('TypeError', 'not all arguments converted during string formatting');
  return out;
}
