/** Turns the interpreter state into a plain, frozen picture of memory: frames with names → object ids, and the objects themselves. */
import {
  PyInt, PyBool, PyFloat, PyStr, PyBytes, PyList, PyTuple, PyDict, PySet, PyRange, PyFunction, PyBuiltin, PyMethod, PyClass, PyInstance,
  PyGenerator, PyModule, PyProperty, PyStaticMethod, PyClassMethod, PyIterator, NONE, TRUE, FALSE, reprStr, floatRepr, reprBytes,
} from './objects.js?v=202609271602';

const MAX_ITEMS = 80;
const shortRepr = s => (s.length > 40 ? s.slice(0, 37) + '…' : s);
const keyText = hk => (hk.startsWith('s') ? reprStr(hk.slice(1)) : hk.startsWith('i') ? hk.slice(1) : hk.startsWith('f') ? hk.slice(1) : hk === 'N' ? 'None' : hk.slice(1));

export function snapshot(interp, { showBuiltins = false } = {}) {
  const objects = {};
  const queue = [];
  const seen = new Set();
  const ref = o => {
    if (o === undefined || o === null) return null;
    if (!seen.has(o)) { seen.add(o); queue.push(o); }
    return o.id;
  };
  const encodeVars = vars => [...vars].filter(([k]) => showBuiltins || !(k.startsWith('__') && k.endsWith('__')) || k === '__name__' && false).map(([k, v]) => [k, ref(v)]);

  const frames = [{ name: '<module>', kind: 'module', line: interp.frames.length ? interp.frames[0].callLine ?? interp.curLine : interp.curLine, vars: encodeVars(interp.globals.vars) }];
  interp.frames.forEach((f, i) => {
    const next = interp.frames[i + 1];
    frames.push({ name: f.name, kind: f.gen ? 'generator' : 'function', line: next ? (next.callLine ?? f.line) : f.line, vars: encodeVars(f.scope.vars), fnId: f.fn ? f.fn.id : null });
  });

  while (queue.length) {
    const o = queue.shift();
    objects[o.id] = encode(o, ref);
  }
  const snap = { frames, objects, out: interp.transcript, steps: interp.steps };
  Object.freeze(snap.frames);
  Object.freeze(snap.objects);
  return Object.freeze(snap);
}

function encode(o, ref) {
  const base = { type: o.cls ? o.cls.name : 'object' };
  if (o instanceof PyBool) return freeze({ ...base, type: 'bool', value: o === TRUE ? 'True' : 'False', immutable: true });
  if (o instanceof PyInt) return freeze({ ...base, type: 'int', value: o.v.toString(), immutable: true });
  if (o instanceof PyFloat) return freeze({ ...base, type: 'float', value: floatRepr(o.v), immutable: true });
  if (o instanceof PyStr) return freeze({ ...base, type: 'str', value: shortRepr(reprStr(o.v)), length: o.chars.length, immutable: true });
  if (o instanceof PyBytes) return freeze({ ...base, type: 'bytes', value: shortRepr(reprBytes(o.bytes)), length: o.bytes.length, immutable: true });
  if (o === NONE) return freeze({ ...base, type: 'NoneType', value: 'None', immutable: true });
  if (o instanceof PyList) return freeze({ ...base, items: o.items.slice(0, MAX_ITEMS).map(ref), length: o.items.length, allocated: o.allocated, immutable: false, maxlen: o.maxlen ?? null });
  if (o instanceof PyTuple) return freeze({ ...base, items: o.items.slice(0, MAX_ITEMS).map(ref), length: o.items.length, immutable: true, fields: o.cls.fields ? o.cls.fields.map(f => f.name) : null });
  if (o instanceof PyDict) return freeze({ ...base, entries: o.entries().slice(0, MAX_ITEMS).map(e => [ref(e.k), ref(e.v)]), length: o.map.size, immutable: false, keyTexts: [...o.map.keys()].slice(0, MAX_ITEMS).map(keyText), factory: o.defaultFactory ? ref(o.defaultFactory) : null });
  if (o instanceof PySet) return freeze({ ...base, items: o.items().slice(0, MAX_ITEMS).map(ref), length: o.map.size, immutable: o.frozen });
  if (o instanceof PyRange) return freeze({ ...base, type: 'range', value: o.step === 1n ? `range(${o.start}, ${o.stop})` : `range(${o.start}, ${o.stop}, ${o.step})`, immutable: true, length: Number(o.length) });
  if (o instanceof PyFunction) {
    const closure = o.freeVars.map(n => { for (const s of [o.scope, ...o.scope.enclosingFunctions()]) if (s.vars.has(n)) return [n, ref(s.vars.get(n))]; return null; }).filter(Boolean);
    return freeze({ ...base, type: 'function', name: o.isLambda ? 'lambda' : o.name, params: o.params.args.map(a => a.name), closure, immutable: true, line: o.line, generator: o.isGen, attrs: [...o.dict].map(([k, v]) => [k, ref(v)]) });
  }
  if (o instanceof PyBuiltin) return freeze({ ...base, type: 'builtin', name: o.name, value: o.self ? `${o.name}()` : `${o.name}()`, immutable: true, wrapped: o.wrapped ? ref(o.wrapped) : null, cacheSize: o.cache ? o.cache.size : null });
  if (o instanceof PyMethod) return freeze({ ...base, type: 'method', name: o.fn.name, self: ref(o.self), fn: ref(o.fn), immutable: true });
  if (o instanceof PyClass) return freeze({ ...base, type: 'class', name: o.name, bases: o.bases.filter(b => b.name !== 'object').map(b => ref(b)), attrs: o.builtin ? [] : [...o.dict].filter(([k]) => !k.startsWith('__') || k === '__init__').map(([k, v]) => [k, ref(v)]), mro: o.mro.map(c => c.name), immutable: false, builtin: o.builtin });
  if (o instanceof PyInstance) return freeze({ ...base, type: 'instance', cls: o.cls.name, clsId: ref(o.cls), attrs: [...o.dict].filter(([k]) => !(k === '__cause__' || k === '__context__')).map(([k, v]) => [k, ref(v)]), immutable: !!o.frozen, exception: !!o.cls.isException, value: o.reprText || null });
  if (o instanceof PyGenerator) return freeze({ ...base, type: 'generator', name: o.name, done: o.done, started: o.started, immutable: false, vars: o.scope ? [...o.scope.vars].map(([k, v]) => [k, ref(v)]) : [] });
  if (o instanceof PyModule) return freeze({ ...base, type: 'module', name: o.name, value: `module ${o.name}`, immutable: false });
  if (o instanceof PyProperty) return freeze({ ...base, type: 'property', fget: o.fget ? ref(o.fget) : null, fset: o.fset ? ref(o.fset) : null, immutable: true });
  if (o instanceof PyStaticMethod || o instanceof PyClassMethod) return freeze({ ...base, type: o instanceof PyStaticMethod ? 'staticmethod' : 'classmethod', fn: ref(o.fn), immutable: true });
  if (o instanceof PyIterator) return freeze({ ...base, type: o.cls.name, value: `${o.cls.name} object`, immutable: false });
  return freeze({ ...base, value: o.reprText || `${base.type} object`, immutable: true });
}

const freeze = o => Object.freeze(o);
