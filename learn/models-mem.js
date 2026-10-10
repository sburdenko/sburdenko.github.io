/**
 * Модели раздела про память: стек и куча, сборщик мусора, дескрипторы ОС. Без DOM — покрыты тестами.
 *
 * У каждого стенда одинаковый вход: init(card) → состояние, act(состояние, 'действие') → новое
 * состояние, goal(card.goal, состояние) → выполнено ли задание. Те же действия шлют кнопки стенда
 * и тесты, поэтому тест может пройти задание «руками» и проверить, что оно выполнимо.
 */
import { tr } from './i18n.js?v=202610100802';

const clone = x => structuredClone(x);

/* =====================================================================
   Стек и куча. Программа — список шагов { line, note, ops }, op меняет память.
   Переменная: { name, type, kind, value }
     kind 'int' — число прямо в стеке; 'val' — структура, её поля прямо в стеке;
     'ref' — ссылка (номер объекта в куче или null); 'alias' — параметр ref, указывает на чужую переменную.
   Объект в куче: { id, type, fields, box?, text? }. Ссылка внутри полей — { ref: id }.
   ===================================================================== */

function top(s) { return s.frames.at(-1); }

function findVar(s, name, frameIdx = s.frames.length - 1) {
  const v = s.frames[frameIdx].vars.find(x => x.name === name);
  if (!v) throw new Error(tr({ ru: `нет переменной ${name}`, en: `no variable ${name}` }));
  if (v.kind === 'alias') return findVar(s, v.value.name, v.value.frame);
  return v;
}

function put(s, v, changed) {
  const vars = top(s).vars;
  const i = vars.findIndex(x => x.name === v.name);
  if (i >= 0) vars[i] = v; else vars.push(v);
  changed.push(`v:${s.frames.length - 1}:${v.name}`);
}

function alloc(s, obj, changed) {
  const id = s.next++;
  s.heap.push({ id, ...obj });
  changed.push(`h:${id}`);
  return id;
}

function setPath(fields, path, value) {
  const keys = path.split('.');
  let o = fields;
  for (const k of keys.slice(0, -1)) o = o[k];
  o[keys.at(-1)] = value;
}

/** Копия значения по правилам C#: структура копируется целиком, у ссылки копируется только адрес. */
const copyOf = v => ({ ...v, value: clone(v.value) });

function apply(s, op, changed) {
  switch (op.op) {
    case 'int': put(s, { name: op.name, type: op.type ?? 'int', kind: 'int', value: op.value }, changed); break;
    case 'new':
      if (op.kind === 'val') put(s, { name: op.name, type: op.type, kind: 'val', value: clone(op.fields) }, changed);
      else put(s, { name: op.name, type: op.type, kind: 'ref', value: alloc(s, { type: op.type, fields: clone(op.fields ?? {}) }, changed) }, changed);
      break;
    case 'str':
      put(s, { name: op.name, type: 'string', kind: 'ref', value: alloc(s, { type: 'string', text: op.text, fields: {} }, changed) }, changed);
      break;
    case 'concat': {
      const src = s.heap.find(o => o.id === findVar(s, op.from).value);
      put(s, { name: op.name, type: 'string', kind: 'ref', value: alloc(s, { type: 'string', text: src.text + op.text, fields: {} }, changed) }, changed);
      break;
    }
    case 'arr': {
      const fields = {};
      op.items.forEach((it, i) => {
        fields[i] = op.kind === 'val' ? clone(it) : it === null ? null : { ref: alloc(s, { type: op.elem, fields: clone(it) }, changed) };
      });
      put(s, { name: op.name, type: `${op.elem}[]`, kind: 'ref', value: alloc(s, { type: `${op.elem}[]`, fields }, changed) }, changed);
      break;
    }
    case 'newin': {
      const holder = s.heap.find(o => o.id === findVar(s, op.target).value);
      holder.fields[op.field] = { ref: alloc(s, { type: op.type, fields: clone(op.fields) }, changed) };
      changed.push(`h:${holder.id}`);
      break;
    }
    case 'copy': put(s, { ...copyOf(findVar(s, op.from)), name: op.to }, changed); break;
    case 'set': {
      const v = findVar(s, op.target);
      if (v.kind === 'int') v.value = op.value;
      else if (v.kind === 'val') setPath(v.value, op.field, op.value);
      else {
        const o = s.heap.find(x => x.id === v.value);
        setPath(o.fields, op.field, op.value);
        changed.push(`h:${o.id}`);
      }
      changed.push(...s.frames.flatMap((f, fi) => f.vars.filter(x => x === v).map(x => `v:${fi}:${x.name}`)));
      break;
    }
    case 'box': {
      const v = findVar(s, op.from);
      const id = alloc(s, { type: v.type, box: true, fields: v.kind === 'int' ? { value: v.value } : clone(v.value) }, changed);
      put(s, { name: op.name, type: op.as ?? 'object', kind: 'ref', value: id }, changed);
      break;
    }
    case 'unbox': {
      const o = s.heap.find(x => x.id === findVar(s, op.from).value);
      put(s, o.fields.value !== undefined && Object.keys(o.fields).length === 1
        ? { name: op.name, type: o.type, kind: 'int', value: o.fields.value }
        : { name: op.name, type: o.type, kind: 'val', value: clone(o.fields) }, changed);
      break;
    }
    case 'null': findVar(s, op.name).value = null; changed.push(`v:${s.frames.length - 1}:${op.name}`); break;
    case 'call': {
      const caller = s.frames.length - 1;
      const vars = op.params.map(p => {
        if (p.ref) return { name: p.name, type: findVar(s, p.from).type, kind: 'alias', value: { frame: caller, name: p.from } };
        return { ...copyOf(findVar(s, p.from)), name: p.name };
      });
      s.frames.push({ fn: op.fn, vars });
      vars.forEach(v => changed.push(`v:${s.frames.length - 1}:${v.name}`));
      break;
    }
    case 'ret': s.frames.pop(); break;
    default: throw new Error(tr({ ru: `неизвестная операция ${op.op}`, en: `unknown operation ${op.op}` }));
  }
}

/** Достижимые объекты: от ссылок в стеке по ссылкам в полях. Остальное — мусор для GC. */
export function memReachable(s) {
  const seen = new Set();
  const walk = id => {
    if (id == null || seen.has(id)) return;
    seen.add(id);
    const o = s.heap.find(x => x.id === id);
    const scan = v => {
      if (v && typeof v === 'object') {
        if ('ref' in v) walk(v.ref);
        else Object.values(v).forEach(scan);
      }
    };
    scan(o.fields);
  };
  for (const f of s.frames) for (const v of f.vars) if (v.kind === 'ref') walk(v.value);
  return seen;
}

/** Исполняет программу: кадр 0 — до начала, дальше по кадру на шаг. */
export function memRun(steps) {
  const s = { frames: [{ fn: 'Main', vars: [] }], heap: [], next: 1 };
  const out = [{ s: clone(s), line: -1, note: tr({ ru: 'Программа ещё не начала работу: стек и куча пусты.', en: 'The program hasn\'t started yet: the stack and the heap are empty.' }), changed: [] }];
  for (const st of steps) {
    const changed = [];
    for (const op of st.ops) apply(s, op, changed);
    out.push({ s: clone(s), line: st.line, note: st.note, changed });
  }
  return out;
}

/** Программа карточки: одна или две (struct / class) версии. */
export const memVariants = card => card.variants ? Object.keys(card.variants) : ['main'];
export const memProgram = (card, v) => card.variants ? card.variants[v] : { code: card.code, steps: card.steps };

export const memRig = {
  init(card) {
    const variant = memVariants(card)[0];
    return { variant, f: 0, frames: memRun(memProgram(card, variant).steps), finished: [] };
  },
  act(card, s, a) {
    const n = { ...s, finished: [...s.finished] };
    if (a === 'step' && n.f < n.frames.length - 1) n.f++;
    else if (a === 'reset') n.f = 0;
    else if (a.startsWith('variant:')) {
      n.variant = a.slice(8);
      n.frames = memRun(memProgram(card, n.variant).steps);
      n.f = 0;
    }
    if (n.f === n.frames.length - 1 && !n.finished.includes(n.variant)) n.finished.push(n.variant);
    return n;
  },
  goal(card, s) {
    return card.goal === 'both' ? memVariants(card).every(v => s.finished.includes(v)) : s.finished.length > 0;
  }
};

/* =====================================================================
   Сборщик мусора: корни, поколения, очередь финализации.
   ===================================================================== */

export function gcInit(card) {
  const objs = {};
  for (const o of card.objects) {
    objs[o.id] = { refs: [...(o.refs ?? [])], fin: Boolean(o.fin), big: Boolean(o.big), gen: o.big ? 2 : (o.gen ?? 0), alive: true, queued: false, finalized: false };
  }
  return { objs, order: card.objects.map(o => o.id), roots: card.roots.map(r => ({ ...r })), log: [], gcs: 0 };
}

export function gcReach(s) {
  const seen = new Set();
  const walk = id => {
    if (!id || seen.has(id) || !s.objs[id]?.alive) return;
    seen.add(id);
    s.objs[id].refs.forEach(walk);
  };
  s.roots.forEach(r => walk(r.to));
  s.order.filter(id => s.objs[id].queued).forEach(walk);   // очередь финализации — тоже корень
  return seen;
}

const list = ids => ids.join(', ');

export function gcCollect(s0, gen) {
  const s = clone(s0);
  const marked = gcReach(s);
  const inGen = id => s.objs[id].alive && s.objs[id].gen <= gen;
  // объекты с финализатором не удаляются сразу: встают в очередь и «оживают» до вызова финализатора
  const toQueue = s.order.filter(id => inGen(id) && !marked.has(id) && s.objs[id].fin && !s.objs[id].finalized && !s.objs[id].queued);
  toQueue.forEach(id => { s.objs[id].queued = true; });
  const marked2 = gcReach(s);
  const dead = s.order.filter(id => inGen(id) && !marked2.has(id));
  dead.forEach(id => { s.objs[id].alive = false; });
  const survived = s.order.filter(id => inGen(id));
  survived.forEach(id => { if (!s.objs[id].big) s.objs[id].gen = Math.min(2, s.objs[id].gen + 1); });
  s.gcs++;
  const parts = [gen === 2
    ? tr({ ru: 'Полная сборка (поколения 0, 1, 2).', en: 'Full collection (generations 0, 1, 2).' })
    : tr({ ru: `Сборка поколения ${gen}${gen ? ' (и младших)' : ''}.`, en: `Generation ${gen} collection${gen ? ' (and younger)' : ''}.` })];
  if (dead.length) parts.push(tr({ ru: `Удалены: ${list(dead)}.`, en: `Removed: ${list(dead)}.` }));
  if (toQueue.length) parts.push(tr({ ru: `${list(toQueue)} — недостижимы, но с финализатором: встали в очередь финализации и пережили сборку.`, en: `${list(toQueue)}: unreachable but with a finalizer: moved to the finalization queue and survived the collection.` }));
  const promoted = survived.filter(id => !s.objs[id].big);
  const moves = promoted.map(id => `${id} → Gen ${s.objs[id].gen}`).join(', ');
  if (promoted.length) parts.push(tr({ ru: `Выжили и повзрослели: ${moves}.`, en: `Survived and got promoted: ${moves}.` }));
  if (!dead.length && !toQueue.length && !promoted.length) parts.push(tr({ ru: 'В этих поколениях нечего собирать.', en: 'Nothing to collect in these generations.' }));
  s.log = [...s.log, parts.join(' ')].slice(-5);
  return s;
}

export function gcFinalize(s0) {
  const s = clone(s0);
  const q = s.order.filter(id => s.objs[id].queued);
  q.forEach(id => { s.objs[id].queued = false; s.objs[id].finalized = true; });
  s.log = [...s.log, q.length
    ? tr({ ru: `Поток финализации вызвал финализатор у ${list(q)}. Теперь их можно удалить — но только на следующей сборке их поколения.`, en: `The finalizer thread ran the finalizer of ${list(q)}. Now they can be removed, but only at the next collection of their generation.` })
    : tr({ ru: 'Очередь финализации пуста.', en: 'The finalization queue is empty.' })].slice(-5);
  return s;
}

export const gcRig = {
  init: card => gcInit(card),
  act(card, s, a) {
    const [cmd, arg] = a.split(':');
    if (cmd === 'gc') return gcCollect(s, +arg);
    if (cmd === 'fin') return gcFinalize(s);
    if (cmd === 'reset') return gcInit(card);
    if (cmd === 'root') {
      const n = clone(s);
      const r = n.roots.find(x => x.name === arg);
      const what = r.cut ?? `${arg} = null`;
      n.log = [...n.log, tr({ ru: `${what}: корень больше не держит ${r.to}.`, en: `${what}: the root no longer holds ${r.to}.` })].slice(-5);
      r.to = null;
      return n;
    }
    if (cmd === 'cut') {
      const [from, to] = arg.split('>');
      const n = clone(s);
      n.objs[from].refs = n.objs[from].refs.filter(x => x !== to);
      n.log = [...n.log, tr({ ru: `${from} больше не ссылается на ${to}.`, en: `${from} no longer references ${to}.` })].slice(-5);
      return n;
    }
    throw new Error(tr({ ru: `неизвестное действие ${a}`, en: `unknown action ${a}` }));
  },
  goal(card, s) {
    const g = card.goal, o = id => s.objs[id];
    if (g.kind === 'dead') return g.ids.every(id => !o(id).alive) && (g.keep ?? []).every(id => o(id).alive);
    if (g.kind === 'gen') return o(g.id).alive && o(g.id).gen >= g.gen && (g.dead ?? []).every(id => !o(id).alive);
    if (g.kind === 'queued') return o(g.id).queued;
    return false;
  }
};

/* =====================================================================
   Дескрипторы ОС: файл можно открыть, только когда предыдущий дескриптор закрыт.
   ===================================================================== */

export function fileInit() {
  return { vars: [], objs: {}, next: 1, opened: 0, disposed: 0, log: [], error: null };
}

const H = n => '0x' + (0x1a0 + n * 4).toString(16).toUpperCase();

export const fileRig = {
  init: () => fileInit(),
  act(card, s0, a) {
    const s = clone(s0);
    const [cmd, v] = a.split(':');
    s.error = null;
    const say = t => { s.log = [...s.log, t].slice(-5); };
    const openHandle = () => Object.values(s.objs).find(o => o.handleOpen);
    if (cmd === 'reset') return fileInit();
    if (cmd === 'open' || cmd === 'using') {
      const busy = openHandle();
      if (busy) {
        s.error = 'IOException: The process cannot access the file \'log.txt\' because it is being used by another process.';
        say(tr({ ru: `Открыть не вышло: дескриптор ${busy.handle} от ${busy.name} всё ещё открыт.`, en: `Couldn't open: handle ${busy.handle} from ${busy.name} is still open.` }));
        return s;
      }
      const name = `fs${s.next}`, id = s.next++;
      s.objs[id] = { id, name, handle: H(id), handleOpen: true, disposed: false, alive: true, queued: false };
      s.opened++;
      if (cmd === 'using') {
        s.objs[id].handleOpen = false; s.objs[id].disposed = true; s.objs[id].alive = false; s.disposed++;
        say(tr({ ru: `using: открыли log.txt (${H(id)}), поработали, на выходе из блока Dispose() закрыл дескриптор.`, en: `using: opened log.txt (${H(id)}), did the work, and on leaving the block Dispose() closed the handle.` }));
      } else {
        s.vars.push({ name, id });
        say(tr({ ru: `${name} = new FileStream("log.txt") — ОС выдала дескриптор ${H(id)}.`, en: `${name} = new FileStream("log.txt"): the OS handed out handle ${H(id)}.` }));
      }
      return s;
    }
    const ref = s.vars.find(x => x.name === v);
    const o = ref && s.objs[ref.id];
    if (cmd === 'dispose' && o) {
      if (o.disposed) { say(tr({ ru: `${v} уже закрыт — повторный Dispose() ничего не делает.`, en: `${v} is already closed: calling Dispose() again does nothing.` })); return s; }
      o.disposed = true; o.handleOpen = false; s.disposed++;
      say(tr({ ru: `${v}.Dispose() — дескриптор ${o.handle} закрыт сразу.`, en: `${v}.Dispose(): handle ${o.handle} is closed right away.` }));
      return s;
    }
    if (cmd === 'forget' && o) {
      s.vars = s.vars.filter(x => x !== ref);
      say(o.handleOpen
        ? tr({ ru: `${v} = null — объект стал мусором, но дескриптор ${o.handle} всё ещё открыт!`, en: `${v} = null: the object is now garbage, but handle ${o.handle} is still open!` })
        : tr({ ru: `${v} = null — объект стал мусором, но дескриптор ${o.handle} уже закрыт.`, en: `${v} = null: the object is now garbage, and handle ${o.handle} is already closed.` }));
      return s;
    }
    if (cmd === 'gc') {
      const live = new Set(s.vars.map(x => x.id));
      const lost = Object.values(s.objs).filter(x => x.alive && !live.has(x.id));
      const fin = lost.filter(x => x.handleOpen && !x.queued);
      const gone = lost.filter(x => !x.handleOpen);
      fin.forEach(x => { x.queued = true; });
      gone.forEach(x => { x.alive = false; });
      say(fin.length
        ? tr({ ru: `GC: ${fin.map(x => x.name).join(', ')} — мусор с открытым дескриптором, ждёт финализатора. Дескриптор пока открыт.`, en: `GC: ${fin.map(x => x.name).join(', ')}: garbage with an open handle, waiting for the finalizer. The handle is still open.` })
        : gone.length ? tr({ ru: `GC: удалены ${gone.map(x => x.name).join(', ')}.`, en: `GC: removed ${gone.map(x => x.name).join(', ')}.` }) : tr({ ru: 'GC: мусора нет.', en: 'GC: no garbage.' }));
      return s;
    }
    if (cmd === 'fin') {
      const q = Object.values(s.objs).filter(x => x.queued);
      q.forEach(x => { x.queued = false; x.handleOpen = false; x.alive = false; });
      say(q.length
        ? tr({ ru: `Финализатор закрыл ${q.map(x => x.handle).join(', ')} — когда-нибудь потом, а не когда было нужно.`, en: `The finalizer closed ${q.map(x => x.handle).join(', ')}: eventually, not when it was needed.` })
        : tr({ ru: 'Очередь финализации пуста.', en: 'The finalization queue is empty.' }));
      return s;
    }
    return s;
  },
  goal(card, s) {
    const g = card.goal;
    return s.opened >= g.n && (!g.noDispose || s.disposed === 0);
  }
};
