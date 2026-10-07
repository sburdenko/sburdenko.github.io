/**
 * Tree-walking interpreter. Every exec/eval method is a JS generator that yields step events
 * ({ kind, line, … }) so the stand can pause after each statement and take a snapshot of memory.
 */
import {
  PyInt, PyBool, PyFloat, PyStr, PyBytes, PyList, PyTuple, PyDict, PySet, PyRange, PyFunction, PyBuiltin, PyMethod, PyClass, PyInstance,
  PyGenerator, PyModule, PyProperty, PyStaticMethod, PyClassMethod, PyIterator, PySlice, PyError, NONE, TRUE, FALSE, ELLIPSIS,
  int, float, bool, str, internStr, hashKey, UNHASHABLE, typeName, typeOf, isIntLike, isInstance, TYPES, isCallable,
} from './objects.js?v=202610071658';
import { EXC, makeExc, raise, pyError, isExceptionClass, excArgs } from './errors.js?v=202610071658';
import { reprOf, strOf, formatValue } from './convert.js?v=202610071658';
import { binop, unary, compare, truthy, iterate, toList, getitem, setitem, delitem, STOP, NOT_IMPLEMENTED, equals, hashReady } from './ops.js?v=202610071658';

export class StepLimit extends Error { constructor(max) { super(`step limit ${max}`); this.max = max; } }

const isJsGen = r => r && typeof r.next === 'function' && typeof r[Symbol.iterator] === 'function' && r.cls === undefined;

/* ---------- scopes ---------- */
export class Scope {
  constructor(kind, parent, globals, name = '') {
    this.kind = kind; this.parent = parent; this.globals = globals || this; this.name = name;
    this.vars = new Map(); this.locals = null; this.globalDecl = new Set(); this.nonlocalDecl = new Set(); this.annotations = [];
  }
  enclosingFunctions() {
    const out = [];
    for (let s = this.parent; s; s = s.parent) if (s.kind === 'function' || s.kind === 'comp') out.push(s);
    return out;
  }
}

function scanNames(body) {
  const locals = new Set(), globals = new Set(), nonlocals = new Set();
  const target = t => {
    if (!t) return;
    if (t.t === 'Name') locals.add(t.id);
    else if (t.t === 'Tuple' || t.t === 'List') t.elts.forEach(target);
    else if (t.t === 'Starred') target(t.value);
  };
  const pattern = p => {
    if (!p) return;
    if (p.p === 'capture' || p.p === 'star') locals.add(p.name);
    if (p.p === 'as') { locals.add(p.name); pattern(p.pattern); }
    if (p.p === 'sequence') p.items.forEach(pattern);
    if (p.p === 'mapping') { p.items.forEach(i => pattern(i.pattern)); if (p.rest) locals.add(p.rest); }
    if (p.p === 'class') { p.args.forEach(pattern); p.kwargs.forEach(k => pattern(k.pattern)); }
    if (p.p === 'or') p.alts.forEach(pattern);
  };
  const expr = e => {
    if (!e || typeof e !== 'object') return;
    if (Array.isArray(e)) { e.forEach(expr); return; }
    if (e.t === 'NamedExpr') { locals.add(e.target.id); expr(e.value); return; }
    if (e.t === 'Lambda') return;
    if (e.t === 'ListComp' || e.t === 'SetComp' || e.t === 'GeneratorExp' || e.t === 'DictComp') { e.gens.forEach(g => { expr(g.iter); g.ifs.forEach(expr); }); return; }
    for (const k of Object.keys(e)) if (k !== 't') expr(e[k]);
  };
  const stmt = s => {
    switch (s.t) {
      case 'Assign': s.targets.forEach(target); expr(s.value); break;
      case 'AugAssign': target(s.target); expr(s.value); break;
      case 'AnnAssign': target(s.target); expr(s.value); break;
      case 'For': target(s.target); expr(s.iter); s.body.forEach(stmt); s.orelse.forEach(stmt); break;
      case 'While': expr(s.test); s.body.forEach(stmt); s.orelse.forEach(stmt); break;
      case 'If': expr(s.test); s.body.forEach(stmt); s.orelse.forEach(stmt); break;
      case 'With': s.items.forEach(i => { expr(i.expr); target(i.target); }); s.body.forEach(stmt); break;
      case 'Try': s.body.forEach(stmt); s.handlers.forEach(h => { if (h.name) locals.add(h.name); h.body.forEach(stmt); }); s.orelse.forEach(stmt); s.finalbody.forEach(stmt); break;
      case 'FunctionDef': case 'ClassDef': locals.add(s.name); s.decorators.forEach(expr); break;
      case 'Import': s.names.forEach(n => locals.add(n.asname || n.name.split('.')[0])); break;
      case 'ImportFrom': s.names.forEach(n => { if (n.name !== '*') locals.add(n.asname || n.name); }); break;
      case 'Global': s.names.forEach(n => globals.add(n)); break;
      case 'Nonlocal': s.names.forEach(n => nonlocals.add(n)); break;
      case 'Del': s.targets.forEach(target); break;
      case 'Match': expr(s.subject); s.cases.forEach(c => { pattern(c.pattern); expr(c.guard); c.body.forEach(stmt); }); break;
      case 'Expr': case 'Return': case 'Raise': case 'Assert': expr(s.value ?? s.expr ?? s.exc ?? s.test); if (s.msg) expr(s.msg); if (s.cause) expr(s.cause); break;
      default: break;
    }
  };
  body.forEach(stmt);
  for (const g of globals) locals.delete(g);
  for (const n of nonlocals) locals.delete(n);
  return { locals, globals, nonlocals };
}

function freeNames(body, params) {
  const names = new Set();
  const walk = n => {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) { n.forEach(walk); return; }
    if (n.t === 'Name') names.add(n.id);
    for (const k of Object.keys(n)) if (k !== 't') walk(n[k]);
  };
  walk(body);
  for (const p of params) names.delete(p);
  return names;
}

export class Interp {
  constructor({ inputs = [], maxSteps = 400, recursionLimit = 1000, files = {} } = {}) {
    this.globals = new Scope('module', null, null, '<module>');
    this.globals.vars.set('__name__', internStr('__main__'));
    this.builtins = new Map();
    this.modules = new Map();
    this.moduleFactories = new Map();
    this.frames = [];
    this.out = '';
    this.transcript = '';
    this.stepOut = [];
    this.inputs = [...inputs];
    this.inputUsed = [];
    this.steps = 0;
    this.maxSteps = maxSteps;
    this.recursionLimit = recursionLimit;
    this.touched = [];
    this.files = Object.fromEntries(Object.entries(files).map(([k, v]) => [k, String(v)]));
    this.curLine = 0;
    this.lastEvent = null;
    this.random = null;
    this.clock = 0;
    /* Like CPython, identical literals in one program share one constant object. */
    this.constTuples = new Map();
    this.constants = new Map();
    this.quiet = 0;
    this.captureError = null;
  }

  /** stdout and the console transcript differ only by the echo of what the user typed into input(). */
  write(text, echo = false) {
    if (!echo) this.out += text;
    this.transcript += text;
    this.stepOut.push(text);
  }
  touch(obj, key, op) { if (this.touched.length < 64) this.touched.push({ id: obj.id, key: typeof key === 'string' ? key : key, op }); }

  /** repr for step events: user __repr__ runs silently (no events, no output) and never recurses forever. */
  *safeRepr(o) { return yield* this.quietly(() => reprOf(this, o), o); }
  *safeStr(o) { return yield* this.quietly(() => strOf(this, o), o); }
  *quietly(make, o) {
    if (this.quiet > 2) return `<${typeName(o)}>`;
    this.quiet++;
    const out = this.out, transcript = this.transcript, stepOut = this.stepOut.slice(), touched = this.touched.slice();
    try { return yield* make(); }
    catch (e) { if (e instanceof PyError) return `<${typeName(o)} object>`; throw e; }
    finally { this.quiet--; this.out = out; this.transcript = transcript; this.stepOut = stepOut; this.touched = touched; }
  }

  *step(kind, line, data = {}) {
    if (this.quiet) return;
    this.steps++;
    if (this.steps > this.maxSteps) throw new StepLimit(this.maxSteps);
    const printed = this.stepOut.join('');
    this.stepOut = [];
    const ev = { kind, line, printed, touched: this.touched, ...data };
    this.touched = [];
    this.lastEvent = ev;
    yield ev;
  }

  get frame() { return this.frames.length ? this.frames[this.frames.length - 1] : null; }
  setLine(line) { this.curLine = line; const f = this.frame; if (f) f.line = line; }

  *repr(o) { return yield* reprOf(this, o); }
  *str(o) { return yield* strOf(this, o); }
  *truthy(o) { return yield* truthy(this, o); }
  *iter(o) { return yield* iterate(this, o); }
  *list(o) { return yield* toList(this, o); }
  *getitem(o, k) { return yield* getitem(this, o, k); }
  *setitem(o, k, v) { return yield* setitem(this, o, k, v); }
  *binop(op, a, b) { return yield* binop(this, op, a, b); }
  *equals(a, b) { return yield* equals(this, a, b); }
  *compare(op, a, b) { return yield* compare(this, op, a, b); }

  /* ---------- names ---------- */
  lookup(name, scope) {
    if (scope.kind === 'function') {
      if (scope.globalDecl.has(name)) return this.lookupGlobal(name);
      if (scope.nonlocalDecl.has(name)) { const s = this.findEnclosing(name, scope); if (s && s.vars.has(name)) return s.vars.get(name); raise('NameError', `name '${name}' is not defined`); }
      if (scope.locals && scope.locals.has(name)) {
        if (scope.vars.has(name)) return scope.vars.get(name);
        raise('UnboundLocalError', `cannot access local variable '${name}' where it is not associated with a value`);
      }
      if (scope.vars.has(name)) return scope.vars.get(name);
      for (const s of scope.enclosingFunctions()) if (s.vars.has(name)) return s.vars.get(name);
      return this.lookupGlobal(name, scope.globals);
    }
    if (scope.kind === 'comp' || scope.kind === 'class') {
      if (scope.vars.has(name)) return scope.vars.get(name);
      return this.lookup(name, scope.parent);
    }
    return this.lookupGlobal(name, scope);
  }
  lookupGlobal(name, globals = this.globals) {
    if (globals.vars.has(name)) return globals.vars.get(name);
    if (this.builtins.has(name)) return this.builtins.get(name);
    return raise('NameError', `name '${name}' is not defined`);
  }
  findEnclosing(name, scope) {
    for (const s of scope.enclosingFunctions()) if ((s.locals && s.locals.has(name)) || s.vars.has(name)) return s;
    return null;
  }
  store(name, value, scope) {
    if (scope.kind === 'function' || scope.kind === 'comp') {
      if (scope.globalDecl.has(name)) { scope.globals.vars.set(name, value); return; }
      if (scope.nonlocalDecl.has(name)) { const s = this.findEnclosing(name, scope); if (!s) raise('SyntaxError', `no binding for nonlocal '${name}' found`); s.vars.set(name, value); return; }
    }
    scope.vars.set(name, value);
  }
  remove(name, scope) {
    const target = scope.globalDecl.has(name) ? scope.globals : scope.nonlocalDecl.has(name) ? this.findEnclosing(name, scope) : scope;
    if (!target || !target.vars.has(name)) raise('NameError', `name '${name}' is not defined`);
    target.vars.delete(name);
  }

  /* ---------- program ---------- */
  *run(ast) {
    const ctl = yield* this.execBlock(ast.body, this.globals);
    return ctl;
  }

  *execBlock(stmts, scope) {
    for (const s of stmts) {
      const ctl = yield* this.exec(s, scope);
      if (ctl) return ctl;
    }
    return null;
  }

  *exec(s, scope) {
    this.setLine(s.line);
    switch (s.t) {
      case 'Expr': {
        const v = yield* this.eval(s.expr, scope);
        if (s.expr.t === 'Yield' || s.expr.t === 'YieldFrom') return null;
        const isCall = s.expr.t === 'Call';
        yield* this.step('expr', s.line, { repr: v === NONE ? null : yield* this.safeRepr(v), call: isCall ? this.describeCall(s.expr) : null });
        return null;
      }
      case 'Assign': {
        const value = yield* this.eval(s.value, scope);
        for (const target of s.targets) yield* this.assign(target, value, scope);
        yield* this.step('assign', s.line, { names: this.targetNames(s.targets), repr: yield* this.safeRepr(value), type: typeName(value), id: value.id, mutable: this.isMutable(value) });
        return null;
      }
      case 'AugAssign': {
        const cur = yield* this.eval(s.target, scope);
        const rhs = yield* this.eval(s.value, scope);
        const result = yield* this.inplace(s.op, cur, rhs);
        yield* this.assign(s.target, result, scope);
        yield* this.step('augassign', s.line, { names: this.targetNames([s.target]), op: s.op, repr: yield* this.safeRepr(result), type: typeName(result), id: result.id, sameObject: result === cur });
        return null;
      }
      case 'AnnAssign': {
        if (s.target.t === 'Name' && scope.kind === 'class') scope.annotations.push(s.target.id);
        if (s.value) {
          const value = yield* this.eval(s.value, scope);
          yield* this.assign(s.target, value, scope);
          yield* this.step('assign', s.line, { names: this.targetNames([s.target]), repr: yield* this.safeRepr(value), type: typeName(value), id: value.id, mutable: this.isMutable(value) });
        } else yield* this.step('annotation', s.line, { names: this.targetNames([s.target]) });
        return null;
      }
      case 'Pass': yield* this.step('pass', s.line); return null;
      case 'Break': yield* this.step('break', s.line); return { type: 'break' };
      case 'Continue': yield* this.step('continue', s.line); return { type: 'continue' };
      case 'Return': {
        const value = s.value ? yield* this.eval(s.value, scope) : NONE;
        yield* this.step('return', s.line, { repr: yield* this.safeRepr(value), fn: this.frame ? this.frame.name : '<module>', id: value.id });
        return { type: 'return', value };
      }
      case 'If': {
        const test = yield* this.truthy(yield* this.eval(s.test, scope));
        yield* this.step('if', s.line, { result: test, elif: s.isElif || false });
        return yield* this.execBlock(test ? s.body : s.orelse, scope);
      }
      case 'While': {
        let n = 0;
        for (;;) {
          const test = yield* this.truthy(yield* this.eval(s.test, scope));
          yield* this.step('while', s.line, { result: test, iteration: n });
          if (!test) break;
          n++;
          const ctl = yield* this.execBlock(s.body, scope);
          if (ctl) { if (ctl.type === 'break') return null; if (ctl.type === 'return') return ctl; }
          this.setLine(s.line);
        }
        return yield* this.execBlock(s.orelse, scope);
      }
      case 'For': {
        const iterable = yield* this.eval(s.iter, scope);
        const it = yield* this.iter(iterable);
        let n = 0;
        for (;;) {
          this.setLine(s.line);
          const v = yield* it.next();
          if (v === STOP) { yield* this.step('for-end', s.line, { names: this.targetNames([s.target]), count: n }); break; }
          yield* this.assign(s.target, v, scope);
          yield* this.step('for', s.line, { names: this.targetNames([s.target]), repr: yield* this.safeRepr(v), index: n, id: v.id });
          n++;
          const ctl = yield* this.execBlock(s.body, scope);
          if (ctl) { if (ctl.type === 'break') return null; if (ctl.type === 'return') return ctl; }
        }
        return yield* this.execBlock(s.orelse, scope);
      }
      case 'FunctionDef': {
        const fn = yield* this.makeFunction(s, scope);
        let value = fn;
        for (const d of [...s.decorators].reverse()) value = yield* this.call(yield* this.eval(d, scope), [value], new Map(), s.line);
        this.store(s.name, value, scope);
        yield* this.step('def', s.line, { name: s.name, decorated: s.decorators.length > 0, id: value.id, params: s.params.args.map(a => a.name) });
        return null;
      }
      case 'ClassDef': {
        const cls = yield* this.makeClass(s, scope);
        yield* this.step('class', s.line, { name: s.name, id: cls.id, bases: cls.bases.map(b => b.name) });
        return null;
      }
      case 'Raise': {
        if (!s.exc) { if (!this.handling) raise('RuntimeError', 'No active exception to reraise'); yield* this.step('raise', s.line, { exc: this.handling.cls.name, msg: yield* this.safeStr(this.handling), bare: true }); throw new PyError(this.handling); }
        let exc = yield* this.eval(s.exc, scope);
        if (exc instanceof PyClass) exc = yield* this.call(exc, [], new Map(), s.line);
        if (!(exc instanceof PyInstance) || !isExceptionClass(exc.cls)) raise('TypeError', 'exceptions must derive from BaseException');
        if (s.cause) { let cause = yield* this.eval(s.cause, scope); if (cause instanceof PyClass) cause = yield* this.call(cause, [], new Map(), s.line); exc.dict.set('__cause__', cause); }
        if (this.handling) exc.dict.set('__context__', this.handling);
        yield* this.step('raise', s.line, { exc: exc.cls.name, msg: yield* this.safeStr(exc), id: exc.id });
        throw new PyError(exc);
      }
      case 'Global': s.names.forEach(n => scope.globalDecl.add(n)); yield* this.step('global', s.line, { names: s.names }); return null;
      case 'Nonlocal': s.names.forEach(n => scope.nonlocalDecl.add(n)); yield* this.step('nonlocal', s.line, { names: s.names }); return null;
      case 'Import': {
        for (const { name, asname } of s.names) {
          const mod = yield* this.importModule(name);
          this.store(asname || name.split('.')[0], mod, scope);
        }
        yield* this.step('import', s.line, { names: s.names.map(n => n.asname || n.name) });
        return null;
      }
      case 'ImportFrom': {
        const mod = yield* this.importModule(s.module);
        const names = [];
        for (const { name, asname } of s.names) {
          if (name === '*') { for (const [k, v] of mod.dict) if (!k.startsWith('_')) { this.store(k, v, scope); names.push(k); } continue; }
          if (!mod.dict.has(name)) raise('ImportError', `cannot import name '${name}' from '${s.module}'`);
          this.store(asname || name, mod.dict.get(name), scope);
          names.push(asname || name);
        }
        yield* this.step('import', s.line, { names, from: s.module });
        return null;
      }
      case 'Del': {
        for (const t of s.targets) yield* this.deleteTarget(t, scope);
        yield* this.step('del', s.line, { names: this.targetNames(s.targets) });
        return null;
      }
      case 'Assert': {
        const ok = yield* this.truthy(yield* this.eval(s.test, scope));
        yield* this.step('assert', s.line, { result: ok });
        if (!ok) { const msg = s.msg ? yield* this.eval(s.msg, scope) : null; throw new PyError(makeExc(EXC.AssertionError, msg ? [msg] : [])); }
        return null;
      }
      case 'Try': return yield* this.execTry(s, scope);
      case 'With': return yield* this.execWith(s, scope, 0);
      case 'Match': return yield* this.execMatch(s, scope);
      default: raise('SyntaxError', `unsupported statement ${s.t}`);
    }
    return null;
  }

  describeCall(e) {
    const f = e.func;
    return f.t === 'Name' ? f.id : f.t === 'Attribute' ? `${f.value.t === 'Name' ? f.value.id + '.' : ''}${f.attr}` : 'call';
  }
  targetNames(targets) {
    const out = [];
    const walk = t => {
      if (t.t === 'Name') out.push(t.id);
      else if (t.t === 'Tuple' || t.t === 'List') t.elts.forEach(walk);
      else if (t.t === 'Starred') walk(t.value);
      else if (t.t === 'Attribute') out.push(`${t.value.t === 'Name' ? t.value.id : '…'}.${t.attr}`);
      else if (t.t === 'Subscript') out.push(`${t.value.t === 'Name' ? t.value.id : '…'}[…]`);
    };
    targets.forEach(walk);
    return out;
  }
  isMutable(v) { return v instanceof PyList || v instanceof PyDict || (v instanceof PySet && !v.frozen) || v instanceof PyInstance; }

  *inplace(op, cur, rhs) {
    if (cur instanceof PyList && op === '+') { const items = yield* this.list(rhs); cur.items.push(...items); cur.allocated = Math.max(cur.allocated, cur.items.length); return cur; }
    if (cur instanceof PyList && op === '*' && isIntLike(rhs)) { const copy = [...cur.items]; cur.items.length = 0; for (let i = 0n; i < rhs.v; i++) cur.items.push(...copy); return cur; }
    if (cur instanceof PySet && !cur.frozen && rhs instanceof PySet && ['|', '&', '-', '^'].includes(op)) {
      const r = yield* this.binop(op, cur, rhs); cur.map = r.map; return cur;
    }
    if (cur instanceof PyDict && rhs instanceof PyDict && op === '|') { for (const e of rhs.entries()) cur.map.set(hashKey(e.k), { k: e.k, v: e.v }); return cur; }
    if (cur instanceof PyInstance) {
      const name = { '+': '__iadd__', '-': '__isub__', '*': '__imul__' }[op];
      const fn = name && cur.cls.lookup(name);
      if (fn !== undefined && fn) { const r = yield* this.call(fn, [cur, rhs], new Map()); if (r !== NOT_IMPLEMENTED) return r; }
    }
    return yield* this.binop(op, cur, rhs);
  }

  /* ---------- try / with / match ---------- */
  *execTry(s, scope) {
    let ctl = null, pending = null;
    try {
      ctl = yield* this.execBlock(s.body, scope);
      if (!ctl) ctl = yield* this.execBlock(s.orelse, scope);
    } catch (e) {
      if (!(e instanceof PyError)) throw e;
      const exc = e.exc;
      let handled = false;
      for (const h of s.handlers) {
        let matches = h.type === null;
        if (!matches) {
          const t = yield* this.eval(h.type, scope);
          const types = t instanceof PyTuple ? t.items : [t];
          for (const cls of types) { if (!(cls instanceof PyClass)) raise('TypeError', 'catching classes that do not inherit from BaseException is not allowed'); if (isInstance(exc, cls)) matches = true; }
        }
        if (!matches) continue;
        handled = true;
        this.setLine(h.line);
        if (h.name) this.store(h.name, exc, scope);
        yield* this.step('except', h.line, { exc: exc.cls.name, msg: yield* this.safeStr(exc), name: h.name, id: exc.id });
        const prev = this.handling;
        this.handling = exc;
        try { ctl = yield* this.execBlock(h.body, scope); }
        catch (inner) { pending = inner; }
        finally { this.handling = prev; if (h.name) scope.vars.delete(h.name); }
        break;
      }
      if (!handled) pending = e;
    }
    if (s.finalbody.length) {
      yield* this.step('finally', s.finalbody[0].line - 1, {});
      const fctl = yield* this.execBlock(s.finalbody, scope);
      if (fctl) return fctl;
    }
    if (pending) throw pending;
    return ctl;
  }

  *execWith(s, scope, i) {
    if (i >= s.items.length) return yield* this.execBlock(s.body, scope);
    const item = s.items[i];
    const mgr = yield* this.eval(item.expr, scope);
    const enter = yield* this.getattr(mgr, '__enter__', true);
    const exit = yield* this.getattr(mgr, '__exit__', true);
    if (enter === undefined || exit === undefined) raise('TypeError', `'${typeName(mgr)}' object does not support the context manager protocol`);
    const value = yield* this.call(enter, [], new Map(), s.line);
    if (item.target) yield* this.assign(item.target, value, scope);
    yield* this.step('with', s.line, { names: item.target ? this.targetNames([item.target]) : [], repr: yield* this.safeRepr(value), enter: true });
    let ctl = null;
    try {
      ctl = yield* this.execWith(s, scope, i + 1);
    } catch (e) {
      if (!(e instanceof PyError)) throw e;
      const suppress = yield* this.truthy(yield* this.call(exit, [e.exc.cls, e.exc, NONE], new Map(), s.line));
      yield* this.step('with-exit', s.line, { exc: e.exc.cls.name, suppressed: suppress });
      if (!suppress) throw e;
      return null;
    }
    yield* this.call(exit, [NONE, NONE, NONE], new Map(), s.line);
    yield* this.step('with-exit', s.line, { exc: null, suppressed: false });
    return ctl;
  }

  *execMatch(s, scope) {
    const subject = yield* this.eval(s.subject, scope);
    for (const c of s.cases) {
      this.setLine(c.line);
      const bindings = new Map();
      const ok = yield* this.matchPattern(c.pattern, subject, bindings, scope);
      let guardOk = ok;
      if (ok) { for (const [k, v] of bindings) this.store(k, v, scope); if (c.guard) guardOk = yield* this.truthy(yield* this.eval(c.guard, scope)); }
      yield* this.step('case', c.line, { matched: ok && guardOk, names: [...bindings.keys()], guardFailed: ok && !guardOk });
      if (ok && guardOk) return yield* this.execBlock(c.body, scope);
    }
    return null;
  }

  *matchPattern(p, subject, bindings, scope) {
    switch (p.p) {
      case 'wildcard': return true;
      case 'capture': bindings.set(p.name, subject); return true;
      case 'literal': {
        const v = yield* this.eval(p.value, scope);
        if (v === NONE || v === TRUE || v === FALSE) return subject === v;
        return yield* this.equals(subject, v);
      }
      case 'value': return yield* this.equals(subject, yield* this.eval(p.expr, scope));
      case 'as': { if (!(yield* this.matchPattern(p.pattern, subject, bindings, scope))) return false; bindings.set(p.name, subject); return true; }
      case 'or': {
        for (const alt of p.alts) { const b = new Map(); if (yield* this.matchPattern(alt, subject, b, scope)) { for (const [k, v] of b) bindings.set(k, v); return true; } }
        return false;
      }
      case 'sequence': {
        if (!(subject instanceof PyList || subject instanceof PyTuple || subject instanceof PyRange)) return false;
        const items = subject instanceof PyRange ? yield* this.list(subject) : subject.items;
        const starAt = p.items.findIndex(x => x.p === 'star');
        if (starAt < 0) {
          if (items.length !== p.items.length) return false;
          for (let i = 0; i < items.length; i++) if (!(yield* this.matchPattern(p.items[i], items[i], bindings, scope))) return false;
          return true;
        }
        const before = p.items.slice(0, starAt), after = p.items.slice(starAt + 1);
        if (items.length < before.length + after.length) return false;
        for (let i = 0; i < before.length; i++) if (!(yield* this.matchPattern(before[i], items[i], bindings, scope))) return false;
        for (let i = 0; i < after.length; i++) if (!(yield* this.matchPattern(after[i], items[items.length - after.length + i], bindings, scope))) return false;
        if (p.items[starAt].name !== '_') bindings.set(p.items[starAt].name, new PyList(items.slice(before.length, items.length - after.length)));
        return true;
      }
      case 'mapping': {
        if (!(subject instanceof PyDict)) return false;
        const used = new Set();
        for (const { key, pattern } of p.items) {
          const k = yield* this.eval(key, scope);
          const hk = hashKey(k);
          const e = subject.map.get(hk);
          if (!e) return false;
          used.add(hk);
          if (!(yield* this.matchPattern(pattern, e.v, bindings, scope))) return false;
        }
        if (p.rest) { const d = new PyDict(); for (const [hk, e] of subject.map) if (!used.has(hk)) d.map.set(hk, e); bindings.set(p.rest, d); }
        return true;
      }
      case 'class': {
        const cls = yield* this.eval(p.cls, scope);
        if (!(cls instanceof PyClass)) raise('TypeError', 'called match pattern must be a class');
        if (!isInstance(subject, cls)) return false;
        if (p.args.length) {
          const selfMatch = [TYPES.int, TYPES.float, TYPES.str, TYPES.bool, TYPES.list, TYPES.tuple, TYPES.dict, TYPES.set, TYPES.bytes].includes(cls);
          if (selfMatch) { if (p.args.length > 1) raise('TypeError', `${cls.name}() accepts 1 positional sub-pattern (${p.args.length} given)`); if (!(yield* this.matchPattern(p.args[0], subject, bindings, scope))) return false; }
          else {
            const ma = cls.lookup('__match_args__');
            if (ma === undefined) raise('TypeError', `${cls.name}() accepts 0 positional sub-patterns (${p.args.length} given)`);
            if (p.args.length > ma.items.length) raise('TypeError', `${cls.name}() accepts ${ma.items.length} positional sub-patterns (${p.args.length} given)`);
            for (let i = 0; i < p.args.length; i++) {
              const attr = yield* this.getattr(subject, ma.items[i].v, true);
              if (attr === undefined) return false;
              if (!(yield* this.matchPattern(p.args[i], attr, bindings, scope))) return false;
            }
          }
        }
        for (const { name, pattern } of p.kwargs) {
          const attr = yield* this.getattr(subject, name, true);
          if (attr === undefined) return false;
          if (!(yield* this.matchPattern(pattern, attr, bindings, scope))) return false;
        }
        return true;
      }
      default: return false;
    }
  }

  /* ---------- assignment ---------- */
  *assign(target, value, scope) {
    switch (target.t) {
      case 'Name': this.store(target.id, value, scope); return;
      case 'Attribute': { const obj = yield* this.eval(target.value, scope); yield* this.setattr(obj, target.attr, value); return; }
      case 'Subscript': { const obj = yield* this.eval(target.value, scope); const key = yield* this.eval(target.index, scope); yield* this.setitem(obj, key, value); return; }
      case 'Tuple': case 'List': {
        const items = yield* this.list(value);
        const starAt = target.elts.findIndex(e => e.t === 'Starred');
        if (starAt < 0) {
          if (items.length > target.elts.length) raise('ValueError', `too many values to unpack (expected ${target.elts.length})`);
          if (items.length < target.elts.length) raise('ValueError', `not enough values to unpack (expected ${target.elts.length}, got ${items.length})`);
          for (let i = 0; i < items.length; i++) yield* this.assign(target.elts[i], items[i], scope);
          return;
        }
        const after = target.elts.length - starAt - 1;
        if (items.length < starAt + after) raise('ValueError', `not enough values to unpack (expected at least ${starAt + after}, got ${items.length})`);
        for (let i = 0; i < starAt; i++) yield* this.assign(target.elts[i], items[i], scope);
        yield* this.assign(target.elts[starAt].value, new PyList(items.slice(starAt, items.length - after)), scope);
        for (let i = 0; i < after; i++) yield* this.assign(target.elts[starAt + 1 + i], items[items.length - after + i], scope);
        return;
      }
      case 'Starred': raise('SyntaxError', 'starred assignment target must be in a list or tuple'); return;
      default: raise('SyntaxError', 'cannot assign to expression');
    }
  }

  *deleteTarget(t, scope) {
    if (t.t === 'Name') { this.remove(t.id, scope); return; }
    if (t.t === 'Subscript') { const obj = yield* this.eval(t.value, scope); const key = yield* this.eval(t.index, scope); yield* delitem(this, obj, key); return; }
    if (t.t === 'Attribute') { const obj = yield* this.eval(t.value, scope); yield* this.delattr(obj, t.attr); return; }
    if (t.t === 'Tuple' || t.t === 'List') { for (const e of t.elts) yield* this.deleteTarget(e, scope); return; }
    raise('SyntaxError', 'cannot delete expression');
  }

  /* ---------- expressions ---------- */
  *eval(e, scope) {
    switch (e.t) {
      case 'Constant':
        switch (e.kind) {
          case 'int': {
            if (e.value >= -5n && e.value <= 256n) return int(e.value);
            const key = 'i' + e.value;
            if (!this.constants.has(key)) this.constants.set(key, int(e.value));
            return this.constants.get(key);
          }
          case 'float': {
            const key = 'f' + e.value;
            if (!this.constants.has(key)) this.constants.set(key, float(e.value));
            return this.constants.get(key);
          }
          case 'str': return internStr(e.value);
          case 'bytes': return new PyBytes(Uint8Array.from(e.value, c => c.charCodeAt(0) & 0xff));
          case 'bool': return e.value ? TRUE : FALSE;
          case 'none': return NONE;
          default: return ELLIPSIS;
        }
      case 'Name': return this.lookup(e.id, scope);
      case 'FString': {
        let out = '';
        for (const part of e.parts) {
          if (part.str !== undefined) { out += part.str; continue; }
          let v = yield* this.eval(part.expr, scope);
          if (part.conv === 'r') v = str(yield* this.repr(v));
          else if (part.conv === 's') v = str(yield* this.str(v));
          else if (part.conv === 'a') v = str(yield* this.repr(v));
          let spec = '';
          if (part.spec) for (const sp of part.spec) spec += sp.str !== undefined ? sp.str : yield* this.str(yield* this.eval(sp.expr, scope));
          out += yield* formatValue(this, v, spec);
        }
        return str(out);
      }
      case 'Tuple': {
        if (e.elts.length && e.elts.every(x => x.t === 'Constant' && x.kind !== 'ellipsis')) {
          const key = e.elts.map(x => `${x.kind}:${String(x.value)}`).join('\u0001');
          if (!this.constTuples.has(key)) this.constTuples.set(key, new PyTuple(yield* this.evalElts(e.elts, scope)));
          return this.constTuples.get(key);
        }
        return new PyTuple(yield* this.evalElts(e.elts, scope));
      }
      case 'List': return new PyList(yield* this.evalElts(e.elts, scope));
      case 'Set': { const s = new PySet(); for (const v of yield* this.evalElts(e.elts, scope)) { yield* hashReady(this, v); this.setAdd(s, v); } return s; }
      case 'Dict': {
        const d = new PyDict();
        for (const { key, value } of e.items) {
          if (key === null) { const src = yield* this.eval(value, scope); if (!(src instanceof PyDict)) raise('TypeError', `'${typeName(src)}' object is not a mapping`); for (const en of src.entries()) d.map.set(hashKey(en.k), { k: en.k, v: en.v }); continue; }
          const k = yield* hashReady(this, yield* this.eval(key, scope));
          const v = yield* this.eval(value, scope);
          const hk = hashKey(k);
          if (hk === UNHASHABLE) raise('TypeError', `cannot use '${typeName(k)}' as a dict key (unhashable type: '${typeName(k)}')`);
          d.map.set(hk, { k: d.map.get(hk)?.k ?? k, v });
        }
        return d;
      }
      case 'ListComp': { const out = new PyList(); yield* this.comprehend(e.gens, 0, new Scope('comp', scope, scope.globals), function* (interp, sc) { out.push(yield* interp.eval(e.elt, sc)); }); return out; }
      case 'SetComp': { const out = new PySet(); yield* this.comprehend(e.gens, 0, new Scope('comp', scope, scope.globals), function* (interp, sc) { interp.setAdd(out, yield* hashReady(interp, yield* interp.eval(e.elt, sc))); }); return out; }
      case 'DictComp': { const out = new PyDict(); yield* this.comprehend(e.gens, 0, new Scope('comp', scope, scope.globals), function* (interp, sc) { const k = yield* hashReady(interp, yield* interp.eval(e.key, sc)); const v = yield* interp.eval(e.value, sc); const hk = hashKey(k); if (hk === UNHASHABLE) raise('TypeError', `unhashable type: '${typeName(k)}'`); out.map.set(hk, { k, v }); }); return out; }
      case 'GeneratorExp': {
        const self = this;
        const sc = new Scope('comp', scope, scope.globals);
        const first = yield* this.eval(e.gens[0].iter, scope);
        const body = (function* () {
          yield* self.comprehend(e.gens, 0, sc, function* (interp, s2) { yield { pyYield: yield* interp.eval(e.elt, s2) }; }, first);
          return NONE;
        })();
        const gen = new PyGenerator('<genexpr>', body);
        gen.scope = sc;
        return gen;
      }
      case 'BinOp': { const a = yield* this.eval(e.left, scope); const b = yield* this.eval(e.right, scope); return yield* this.binop(e.op, a, b); }
      case 'UnaryOp': return yield* unary(this, e.op, yield* this.eval(e.operand, scope));
      case 'BoolOp': {
        let v = NONE;
        for (const part of e.values) {
          v = yield* this.eval(part, scope);
          const t = yield* this.truthy(v);
          if (e.op === 'and' ? !t : t) return v;
        }
        return v;
      }
      case 'Compare': {
        let left = yield* this.eval(e.left, scope);
        for (let i = 0; i < e.ops.length; i++) {
          const right = yield* this.eval(e.comparators[i], scope);
          if (!(yield* this.compare(e.ops[i], left, right))) return FALSE;
          left = right;
        }
        return TRUE;
      }
      case 'IfExp': return (yield* this.truthy(yield* this.eval(e.test, scope))) ? yield* this.eval(e.body, scope) : yield* this.eval(e.orelse, scope);
      case 'Lambda': return yield* this.makeFunction({ name: '<lambda>', params: e.params, body: [{ t: 'Return', value: e.body, line: e.line }], line: e.line, isGen: false, isLambda: true }, scope);
      case 'Call': return yield* this.evalCall(e, scope);
      case 'Attribute': return yield* this.getattr(yield* this.eval(e.value, scope), e.attr);
      case 'Subscript': { const obj = yield* this.eval(e.value, scope); const key = yield* this.eval(e.index, scope); return yield* this.getitem(obj, key); }
      case 'Slice': return new PySlice(e.lower ? yield* this.eval(e.lower, scope) : NONE, e.upper ? yield* this.eval(e.upper, scope) : NONE, e.step ? yield* this.eval(e.step, scope) : NONE);
      case 'NamedExpr': { const v = yield* this.eval(e.value, scope); this.store(e.target.id, v, scope.kind === 'comp' ? scope.parent : scope); return v; }
      case 'Starred': raise('SyntaxError', "can't use starred expression here"); return NONE;
      case 'Yield': {
        const v = e.value ? yield* this.eval(e.value, scope) : NONE;
        yield* this.step('yield', e.line, { repr: yield* this.safeRepr(v), fn: this.frame ? this.frame.name : '' });
        const sent = yield { pyYield: v };
        return sent ?? NONE;
      }
      case 'YieldFrom': {
        const it = yield* this.iter(yield* this.eval(e.value, scope));
        for (;;) {
          const v = yield* it.next();
          if (v === STOP) return it.gen && it.gen.returnValue ? it.gen.returnValue : NONE;
          yield* this.step('yield', e.line, { repr: yield* this.safeRepr(v), fn: this.frame ? this.frame.name : '', from: true });
          yield { pyYield: v };
        }
      }
      default: return raise('SyntaxError', `unsupported expression ${e.t}`);
    }
  }

  setAdd(set, v) { const hk = hashKey(v); if (hk === UNHASHABLE) raise('TypeError', `cannot use '${typeName(v)}' as a set element (unhashable type: '${typeName(v)}')`); if (!set.map.has(hk)) set.map.set(hk, v); }

  *evalElts(elts, scope) {
    const out = [];
    for (const el of elts) {
      if (el.t === 'Starred') out.push(...(yield* this.list(yield* this.eval(el.value, scope))));
      else out.push(yield* this.eval(el, scope));
    }
    return out;
  }

  *comprehend(gens, i, scope, emit, firstIter = null) {
    if (i >= gens.length) { yield* emit(this, scope); return; }
    const g = gens[i];
    const iterable = firstIter ?? (yield* this.eval(g.iter, i === 0 ? scope.parent : scope));
    const it = yield* this.iter(iterable);
    for (;;) {
      const v = yield* it.next();
      if (v === STOP) return;
      yield* this.assign(g.target, v, scope);
      let ok = true;
      for (const cond of g.ifs) if (!(yield* this.truthy(yield* this.eval(cond, scope)))) { ok = false; break; }
      if (ok) yield* this.comprehend(gens, i + 1, scope, emit);
    }
  }

  *evalCall(e, scope) {
    let fn;
    if (e.func.t === 'Attribute') {
      const obj = yield* this.eval(e.func.value, scope);
      fn = yield* this.getattr(obj, e.func.attr);
    } else fn = yield* this.eval(e.func, scope);
    const args = [];
    for (const a of e.args) {
      if (a.t === 'Starred') args.push(...(yield* this.list(yield* this.eval(a.value, scope))));
      else args.push(yield* this.eval(a, scope));
    }
    const kwargs = new Map();
    for (const k of e.keywords) {
      if (k.name === null) {
        const d = yield* this.eval(k.value, scope);
        if (!(d instanceof PyDict)) raise('TypeError', `argument after ** must be a mapping, not ${typeName(d)}`);
        for (const en of d.entries()) { if (!(en.k instanceof PyStr)) raise('TypeError', 'keywords must be strings'); if (kwargs.has(en.k.v)) raise('TypeError', `got multiple values for keyword argument '${en.k.v}'`); kwargs.set(en.k.v, en.v); }
      } else kwargs.set(k.name, yield* this.eval(k.value, scope));
    }
    return yield* this.call(fn, args, kwargs, e.line);
  }

  /* ---------- functions ---------- */
  *makeFunction(s, scope) {
    const defaults = [];
    for (const a of s.params.args) if (a.default) defaults.push(yield* this.eval(a.default, scope));
    const kwdefaults = new Map();
    for (const a of s.params.kwonly) if (a.default) kwdefaults.set(a.name, yield* this.eval(a.default, scope));
    const paramNames = [...s.params.args.map(a => a.name), ...s.params.kwonly.map(a => a.name), s.params.vararg, s.params.kwarg].filter(Boolean);
    const scan = scanNames(s.body);
    const used = freeNames(s.body, paramNames);
    const enclosing = scope.kind === 'function' ? [scope, ...scope.enclosingFunctions()] : scope.enclosingFunctions();
    const freeVars = [...used].filter(n => !scan.locals.has(n) && enclosing.some(sc => (sc.locals && sc.locals.has(n)) || sc.vars.has(n)) && !scan.globals.has(n));
    const fn = new PyFunction(s.name, s.params, s.body, scope, { defaults, kwdefaults, isGen: s.isGen, isLambda: !!s.isLambda, freeVars });
    fn.scan = scan;
    fn.line = s.line;
    if (scope.kind === 'class') fn.qualname = `${scope.name}.${s.name}`;
    if (scope.kind === 'function') fn.qualname = `${scope.name}.<locals>.${s.name}`;
    const first = s.body[0];
    if (first && first.t === 'Expr' && first.expr.t === 'Constant' && first.expr.kind === 'str') fn.doc = first.expr.value;
    return fn;
  }

  bindArgs(fn, args, kwargs) {
    const scope = new Scope('function', fn.scope, fn.scope.globals, fn.name);
    scope.locals = new Set([...fn.scan.locals, ...fn.params.args.map(a => a.name), ...fn.params.kwonly.map(a => a.name)]);
    if (fn.params.vararg) scope.locals.add(fn.params.vararg);
    if (fn.params.kwarg) scope.locals.add(fn.params.kwarg);
    scope.globalDecl = new Set(fn.scan.globals);
    scope.nonlocalDecl = new Set(fn.scan.nonlocals);
    const { args: pos, vararg, kwonly, kwarg } = fn.params;
    const label = fn.qualname && fn.qualname !== fn.name ? fn.qualname.split('.').at(-1) : fn.name;
    const firstDefault = pos.length - fn.defaults.length;
    if (args.length > pos.length && !vararg) {
      const req = firstDefault;
      const takes = pos.length === req ? `${pos.length} positional argument${pos.length === 1 ? '' : 's'}` : `from ${req} to ${pos.length} positional arguments`;
      raise('TypeError', `${label}() takes ${takes} but ${args.length} ${args.length === 1 ? 'was' : 'were'} given`);
    }
    pos.forEach((p, i) => { if (i < args.length) scope.vars.set(p.name, args[i]); });
    if (vararg) scope.vars.set(vararg, new PyTuple(args.slice(pos.length)));
    const extra = new PyDict();
    for (const [k, v] of kwargs) {
      const pi = pos.findIndex(p => p.name === k);
      if (pi >= 0) { if (pi < args.length) raise('TypeError', `${label}() got multiple values for argument '${k}'`); scope.vars.set(k, v); continue; }
      if (kwonly.some(p => p.name === k)) { scope.vars.set(k, v); continue; }
      if (kwarg) { extra.map.set('s' + k, { k: internStr(k), v }); continue; }
      raise('TypeError', `${label}() got an unexpected keyword argument '${k}'`);
    }
    if (kwarg) scope.vars.set(kwarg, extra);
    const missing = [];
    pos.forEach((p, i) => {
      if (scope.vars.has(p.name)) return;
      if (i >= firstDefault) scope.vars.set(p.name, fn.defaults[i - firstDefault]);
      else missing.push(p.name);
    });
    if (missing.length) {
      const names = missing.map(n => `'${n}'`);
      const list = names.length === 1 ? names[0] : names.length === 2 ? `${names[0]} and ${names[1]}` : `${names.slice(0, -1).join(', ')}, and ${names.at(-1)}`;
      raise('TypeError', `${label}() missing ${missing.length} required positional argument${missing.length === 1 ? '' : 's'}: ${list}`);
    }
    const missingKw = [];
    for (const p of kwonly) { if (scope.vars.has(p.name)) continue; if (fn.kwdefaults.has(p.name)) scope.vars.set(p.name, fn.kwdefaults.get(p.name)); else missingKw.push(p.name); }
    if (missingKw.length) raise('TypeError', `${label}() missing ${missingKw.length} required keyword-only argument${missingKw.length === 1 ? '' : 's'}: ${missingKw.map(n => `'${n}'`).join(', ')}`);
    return scope;
  }

  *call(fn, args, kwargs = new Map(), line = this.curLine) {
    if (fn instanceof PyBuiltin) {
      const all = fn.self !== null && fn.self !== undefined ? [fn.self, ...args] : args;
      let r = fn.fn(all, kwargs, this);
      if (isJsGen(r)) r = yield* r;
      return r === undefined ? NONE : r;
    }
    if (fn instanceof PyMethod) return yield* this.call(fn.fn, [fn.self, ...args], kwargs, line);
    if (fn instanceof PyFunction) return yield* this.callFunction(fn, args, kwargs, line);
    if (fn instanceof PyClass) return yield* this.construct(fn, args, kwargs, line);
    if (fn instanceof PyInstance) {
      const c = fn.cls.lookup('__call__');
      if (c !== undefined) return yield* this.call(c, [fn, ...args], kwargs, line);
    }
    if (fn instanceof PyStaticMethod) return yield* this.call(fn.fn, args, kwargs, line);
    return raise('TypeError', `'${typeName(fn)}' object is not callable`);
  }

  *callFunction(fn, args, kwargs, line) {
    const scope = this.bindArgs(fn, args, kwargs);
    if (fn.isGen) {
      const self = this;
      const gen = new PyGenerator(fn.name, null);
      gen.scope = scope; gen.fn = fn;
      gen.body = (function* () {
        const ctl = yield* self.execBlock(fn.body, scope);
        return ctl && ctl.type === 'return' ? ctl.value : NONE;
      })();
      return gen;
    }
    if (this.frames.length + 1 >= this.recursionLimit) raise('RecursionError', 'maximum recursion depth exceeded');
    const frame = { name: fn.name, scope, line: fn.line, fn, callLine: line };
    this.frames.push(frame);
    const argReprs = [];
    for (const [name, v] of scope.vars) argReprs.push([name, yield* this.safeRepr(v)]);
    yield* this.step('call', fn.line, { fn: fn.name, args: argReprs, depth: this.frames.length, id: fn.id, callLine: line });
    try {
      const ctl = yield* this.execBlock(fn.body, scope);
      return ctl && ctl.type === 'return' ? ctl.value : NONE;
    } catch (e) {
      if (e instanceof PyError) {
        e.tb = e.tb || [];
        e.tb.unshift({ name: fn.name, line: frame.line });
        if (!e.mem && this.captureError) e.mem = this.captureError();
      }
      throw e;
    } finally {
      this.frames.pop();
      this.setLine(line);
    }
  }

  /** Resumes a generator: runs its body until the next `yield`, re-emitting step events on the way. */
  *genNext(gen, send = NONE, asIter = false) {
    if (gen.done) { if (asIter) return STOP; throw new PyError(makeExc(EXC.StopIteration, [])); }
    if (gen.running) raise('ValueError', 'generator already executing');
    if (!gen.started && send !== NONE) raise('TypeError', "can't send non-None value to a just-started generator");
    const frame = { name: gen.name, scope: gen.scope, line: gen.fn ? gen.fn.line : this.curLine, fn: gen.fn, gen: true };
    const outerLine = this.curLine;
    this.frames.push(frame);
    gen.running = true;
    const wasStarted = gen.started;
    gen.started = true;
    /* Generator expressions are silent, like comprehensions: no step per item. */
    const silent = gen.name === '<genexpr>';
    try {
      if (silent) { /* no event */ }
      else if (!wasStarted) yield* this.step('gen-start', frame.line, { fn: gen.name, id: gen.id });
      else yield* this.step('gen-resume', frame.line, { fn: gen.name, id: gen.id, sent: send === NONE ? null : yield* this.safeRepr(send) });
      let r = gen.body.next(send);
      for (;;) {
        if (r.done) {
          gen.done = true;
          gen.returnValue = r.value;
          if (!silent) yield* this.step('gen-done', frame.line, { fn: gen.name, id: gen.id });
          if (asIter) return STOP;
          throw new PyError(makeExc(EXC.StopIteration, r.value === NONE || r.value === undefined ? [] : [r.value]));
        }
        if (r.value && r.value.pyYield !== undefined) return r.value.pyYield;
        const sent = yield r.value;
        r = gen.body.next(sent);
      }
    } catch (e) {
      if (e instanceof PyError && !(e.exc.cls === EXC.StopIteration && gen.done)) gen.done = true;
      throw e;
    } finally {
      gen.running = false;
      this.frames.pop();
      this.setLine(outerLine);
    }
  }

  /* ---------- classes ---------- */
  *makeClass(s, scope) {
    const bases = [];
    for (const b of s.bases) { const v = yield* this.eval(b, scope); if (!(v instanceof PyClass)) raise('TypeError', 'bases must be classes'); bases.push(v); }
    const classScope = new Scope('class', scope, scope.globals, s.name);
    const ctl = yield* this.execBlock(s.body, classScope);
    void ctl;
    const dict = new Map(classScope.vars);
    let cls;
    try { cls = new PyClass(s.name, bases.length ? bases : [TYPES.object], dict, false); }
    catch (e) { raise('TypeError', e.message); }
    cls.cls = TYPES.type;
    cls.module = '__main__';
    cls.fields = classScope.annotations.map(name => ({ name, default: dict.has(name) ? dict.get(name) : undefined }));
    cls.isException = bases.some(b => b.isException);
    cls.line = s.line;
    for (const v of dict.values()) {
      const fn = v instanceof PyFunction ? v : (v instanceof PyProperty ? v.fget : (v instanceof PyStaticMethod || v instanceof PyClassMethod) ? v.fn : null);
      if (fn instanceof PyFunction) fn.ownerClass = cls;
      if (v instanceof PyProperty && v.fset instanceof PyFunction) v.fset.ownerClass = cls;
    }
    const doc = s.body[0];
    if (doc && doc.t === 'Expr' && doc.expr.t === 'Constant' && doc.expr.kind === 'str') cls.doc = doc.expr.value;
    let value = cls;
    for (const d of [...s.decorators].reverse()) value = yield* this.call(yield* this.eval(d, scope), [value], new Map(), s.line);
    this.store(s.name, value, scope);
    return value;
  }

  *construct(cls, args, kwargs, line) {
    if (cls.construct) { let r = cls.construct(args, kwargs, this, cls); if (isJsGen(r)) r = yield* r; return r; }
    if (cls.builtin && !cls.isException) {
      const base = cls.mro.find(c => c.construct);
      if (base) { let r = base.construct(args, kwargs, this, cls); if (isJsGen(r)) r = yield* r; return r; }
      raise('TypeError', `cannot create '${cls.name}' instances`);
    }
    const base = cls.mro.find(c => c.construct && c !== TYPES.object);
    let inst;
    if (base) { let r = base.construct([], new Map(), this, cls); if (isJsGen(r)) r = yield* r; inst = r; inst.cls = cls; if (!inst.dict) inst.dict = new Map(); }
    else inst = new PyInstance(cls);
    if (cls.isException) inst.dict.set('args', new PyTuple(args)), inst.dict.set('__cause__', NONE), inst.dict.set('__context__', NONE);
    const init = cls.lookup('__init__');
    if (init !== undefined && !(init instanceof PyBuiltin && init.isObjectInit)) {
      const r = yield* this.call(init, [inst, ...args], kwargs, line);
      if (r !== NONE) raise('TypeError', `__init__() should return None, not '${typeName(r)}'`);
    } else if ((args.length || kwargs.size) && !cls.isException && !base) raise('TypeError', `${cls.name}() takes no arguments`);
    return inst;
  }

  /* ---------- attributes ---------- */
  *getattr(obj, name, soft = false) {
    const miss = () => { if (soft) return undefined; const what = obj instanceof PyModule ? `module '${obj.name}'` : obj instanceof PyClass ? `type object '${obj.name}'` : `'${typeName(obj)}' object`; return raise('AttributeError', `${what} has no attribute '${name}'`); };
    if (name === '__class__') return typeOf(obj);
    if (obj instanceof PyModule) return obj.dict.has(name) ? obj.dict.get(name) : miss();
    if (obj instanceof PySuper) {
      const start = obj.cls, mro = typeOf(obj.self).mro;
      const idx = mro.indexOf(start);
      for (const c of mro.slice(idx + 1)) {
        if (!c.dict.has(name)) continue;
        return yield* this.bindClassAttr(c.dict.get(name), obj.self, obj.self instanceof PyClass ? obj.self : typeOf(obj.self));
      }
      return miss();
    }
    if (obj instanceof PyClass) {
      if (name === '__name__') return internStr(obj.name);
      if (name === '__mro__') return new PyTuple(obj.mro);
      if (name === '__bases__') return new PyTuple(obj.bases);
      if (name === '__doc__') return obj.doc ? str(obj.doc) : NONE;
      if (name === '__dict__') { const d = new PyDict(); for (const [k, v] of obj.dict) d.map.set('s' + k, { k: internStr(k), v }); d.reprName = 'mappingproxy'; return d; }
      if (name === '__annotations__' && obj.fields) { const d = new PyDict(); for (const f of obj.fields) d.map.set('s' + f.name, { k: internStr(f.name), v: NONE }); return d; }
      const v = obj.lookup(name);
      if (v === undefined) { const meta = TYPES.type.dict.get(name); if (meta !== undefined) return new PyBuiltin(name, meta.fn, obj); return miss(); }
      if (v instanceof PyClassMethod) return new PyMethod(v.fn, obj);
      if (v instanceof PyStaticMethod) return v.fn;
      if (v instanceof PyBuiltin && obj.builtin) return v;
      return v;
    }
    if (obj instanceof PyInstance) {
      const cv = obj.cls.lookup(name);
      if (cv instanceof PyProperty) { if (!cv.fget) raise('AttributeError', `property '${name}' of '${obj.cls.name}' object has no getter`); return yield* this.call(cv.fget, [obj], new Map()); }
      if (obj.dict.has(name)) return obj.dict.get(name);
      if (name === '__dict__') { const d = new PyDict(); for (const [k, v] of obj.dict) d.map.set('s' + k, { k: internStr(k), v }); return d; }
      if (cv !== undefined) return yield* this.bindClassAttr(cv, obj, obj.cls);
      if (name === '__doc__') return obj.cls.doc ? str(obj.cls.doc) : NONE;
      const ga = obj.cls.lookup('__getattr__');
      if (ga !== undefined && !soft) return yield* this.call(ga, [obj, internStr(name)], new Map());
      return miss();
    }
    if (obj instanceof PyFunction) {
      if (name === '__name__') return internStr(obj.name);
      if (name === '__qualname__') return internStr(obj.qualname);
      if (name === '__doc__') return obj.doc === null ? NONE : str(obj.doc);
      if (name === '__defaults__') return obj.defaults.length ? new PyTuple(obj.defaults) : NONE;
      if (name === '__closure__') { if (!obj.freeVars.length) return NONE; return new PyTuple(obj.freeVars.map(n => ({ id: obj.id * 1000 + n.length, cls: TYPES.cell, reprText: `<cell: ${n}>` }))); }
      if (name === '__module__') return internStr('__main__');
      if (obj.dict.has(name)) return obj.dict.get(name);
      if (name === '__wrapped__') return miss();
      return miss();
    }
    if (obj instanceof PyBuiltin || obj instanceof PyMethod) {
      if (obj.attrs && name in obj.attrs) return obj.attrs[name];
      if (name === '__name__') return internStr(obj instanceof PyMethod ? obj.fn.name : obj.name);
      if (name === '__doc__') return NONE;
      if (name === '__self__') return obj.self ?? NONE;
      if (obj instanceof PyMethod) return yield* this.getattr(obj.fn, name, soft);
      return miss();
    }
    if (obj instanceof PyProperty) {
      if (name === 'setter') return new PyBuiltin('setter', ([f]) => new PyProperty(obj.fget, f));
      if (name === 'getter') return new PyBuiltin('getter', ([f]) => new PyProperty(f, obj.fset));
      if (name === 'fget') return obj.fget ?? NONE;
      if (name === 'fset') return obj.fset ?? NONE;
      return miss();
    }
    if (obj instanceof PyGenerator) {
      if (name === '__name__') return internStr(obj.name);
      const m = TYPES.generator.dict.get(name);
      if (m) return new PyBuiltin(name, m.fn, obj);
      return miss();
    }
    const type = typeOf(obj);
    const m = type.lookup(name);
    if (m instanceof PyBuiltin) return new PyBuiltin(name, m.fn, obj);
    if (m !== undefined) return m;
    if (name === '__doc__') return NONE;
    if (obj instanceof PyInt && (name === 'real' || name === 'numerator')) return obj;
    if (obj instanceof PyInt && name === 'imag') return int(0n);
    if (obj instanceof PyInt && name === 'denominator') return int(1n);
    if (obj instanceof PyFloat && name === 'real') return obj;
    if (obj instanceof PyFloat && name === 'imag') return float(0);
    if (obj instanceof PyRange && ['start', 'stop', 'step'].includes(name)) return int(obj[name]);
    if (obj && obj.attrs && name in obj.attrs) return obj.attrs[name];
    return miss();
  }

  *bindClassAttr(v, self, cls) {
    if (v instanceof PyFunction) return new PyMethod(v, self);
    if (v instanceof PyClassMethod) return new PyMethod(v.fn, cls);
    if (v instanceof PyStaticMethod) return v.fn;
    if (v instanceof PyBuiltin) return new PyBuiltin(v.name, v.fn, self);
    if (v instanceof PyProperty) { if (!v.fget) raise('AttributeError', 'unreadable attribute'); return yield* this.call(v.fget, [self], new Map()); }
    return v;
  }

  *setattr(obj, name, value) {
    if (obj instanceof PyInstance) {
      const cv = obj.cls.lookup(name);
      if (cv instanceof PyProperty) {
        if (!cv.fset) raise('AttributeError', `property '${name}' of '${obj.cls.name}' object has no setter`);
        yield* this.call(cv.fset, [obj, value], new Map());
        return;
      }
      const sa = obj.cls.lookup('__setattr__');
      if (sa !== undefined && !this.inSetattr) { this.inSetattr = true; try { yield* this.call(sa, [obj, internStr(name), value], new Map()); } finally { this.inSetattr = false; } return; }
      if (obj.frozen) raise('FrozenInstanceError', `cannot assign to field '${name}'`);
      obj.dict.set(name, value);
      this.touch(obj, name, 'write');
      return;
    }
    if (obj instanceof PyClass) { if (obj.builtin) raise('TypeError', `cannot set '${name}' attribute of immutable type '${obj.name}'`); obj.dict.set(name, value); this.touch(obj, name, 'write'); return; }
    if (obj instanceof PyFunction) {
      if (name === '__name__') obj.name = value.v; else if (name === '__qualname__') obj.qualname = value.v; else if (name === '__doc__') obj.doc = value === NONE ? null : value.v; else obj.dict.set(name, value);
      return;
    }
    if (obj instanceof PyModule) { obj.dict.set(name, value); return; }
    if (obj && obj.attrs && obj.attrsWritable) { obj.attrs[name] = value; return; }
    raise('AttributeError', `'${typeName(obj)}' object has no attribute '${name}' and no __dict__ for setting new attributes`);
  }

  *delattr(obj, name) {
    if (obj instanceof PyInstance) { if (!obj.dict.has(name)) raise('AttributeError', `'${obj.cls.name}' object has no attribute '${name}'`); obj.dict.delete(name); return; }
    if (obj instanceof PyClass) { if (!obj.dict.has(name)) raise('AttributeError', name); obj.dict.delete(name); return; }
    raise('AttributeError', `'${typeName(obj)}' object has no attribute '${name}'`);
  }

  /* ---------- modules ---------- */
  *importModule(name) {
    if (this.modules.has(name)) return this.modules.get(name);
    const factory = this.moduleFactories.get(name);
    if (!factory) raise('ModuleNotFoundError', `No module named '${name}'`);
    let mod = factory(this);
    if (isJsGen(mod)) mod = yield* mod;
    this.modules.set(name, mod);
    return mod;
  }

  /** The function and `self` of the innermost user frame, for zero-argument super(). */
  superContext() {
    for (let i = this.frames.length - 1; i >= 0; i--) {
      const f = this.frames[i];
      if (!f.fn || !f.fn.ownerClass) continue;
      const first = f.fn.params.args[0];
      if (!first) raise('RuntimeError', 'super(): no arguments');
      return { cls: f.fn.ownerClass, self: f.scope.vars.get(first.name) };
    }
    return raise('RuntimeError', 'super(): no arguments');
  }
}

export class PySuper { constructor(cls, self) { this.id = cls.id * 7919 + self.id; this.cls = cls; this.self = self; this.reprText = `<super: <class '${cls.name}'>, <${typeName(self)} object>>`; } }
