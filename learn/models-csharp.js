/**
 * Модели курса «C# глубже»: ограничения дженериков, замыкания, ленивый LINQ,
 * выделения памяти, защитные копии структур и порядок веток switch.
 * Без DOM — тесты проходят задания теми же действиями, что кнопки.
 */

/* =====================================================================
   Ограничения дженериков: что скомпилируется внутри метода и какие T подойдут.
   ===================================================================== */

export const GEN_TYPES = {
  int: { name: 'int', ref: false, ctor: true, cmp: true, unmanaged: true },
  string: { name: 'string', ref: true, ctor: false, cmp: true, unmanaged: false },
  list: { name: 'List<int>', ref: true, ctor: true, cmp: false, unmanaged: false },
  point: { name: 'Point (struct)', ref: false, ctor: true, cmp: false, unmanaged: true },
  stream: { name: 'Stream (abstract)', ref: true, ctor: false, cmp: false, unmanaged: false }
};

/** Порядок — как в where: сначала class/struct/unmanaged, потом интерфейсы, new() последним. */
export const GEN_CONSTRAINTS = { class: 'class', struct: 'struct', unmanaged: 'unmanaged', cmp: 'IComparable<T>', new: 'new()' };

const CONFLICTS = [
  ['class', 'struct', 'class и struct взаимоисключают друг друга'],
  ['class', 'unmanaged', 'unmanaged — всегда значимый тип, с class не сочетается'],
  ['struct', 'unmanaged', 'unmanaged уже включает struct — вместе их не пишут'],
  ['struct', 'new', 'у struct конструктор без параметров есть всегда — new() с ним запрещён'],
  ['unmanaged', 'new', 'unmanaged уже значимый тип — new() с ним запрещён']
];

export const GEN_OPS = {
  newT: { code: 'var x = new T();', ok: cs => cs.includes('new') || cs.includes('struct') || cs.includes('unmanaged'), why: 'нужно new(), struct или unmanaged' },
  cmp: { code: 'a.CompareTo(b)', ok: cs => cs.includes('cmp'), why: 'нужно IComparable<T>' },
  nullT: { code: 'T x = null;', ok: cs => cs.includes('class'), why: 'null можно только ссылочному типу — нужно class' },
  stack: { code: 'Span<T> buf = stackalloc T[16];', ok: cs => cs.includes('unmanaged'), why: 'stackalloc — только для unmanaged' }
};

/** Ошибки сочетания ограничений. */
export const genConflicts = cs => CONFLICTS.filter(([a, b]) => cs.includes(a) && cs.includes(b)).map(([, , why]) => why);

/** Подходит ли тип под ограничения. */
export function genFits(typeId, cs) {
  const t = GEN_TYPES[typeId];
  return (!cs.includes('class') || t.ref) && (!cs.includes('struct') || !t.ref) && (!cs.includes('unmanaged') || t.unmanaged)
    && (!cs.includes('new') || t.ctor) && (!cs.includes('cmp') || t.cmp);
}

/** where-часть объявления. */
export function genWhere(cs) {
  const list = Object.keys(GEN_CONSTRAINTS).filter(c => cs.includes(c)).map(c => GEN_CONSTRAINTS[c]);
  return list.length ? ` where T : ${list.join(', ')}` : '';
}

export const genRig = {
  init: card => ({ cs: [...(card.start ?? [])] }),
  act(card, s0, a) {
    const [k, v] = a.split(':');
    if (k === 'reset') return genRig.init(card);
    if (k !== 'c' || !(v in GEN_CONSTRAINTS)) throw new Error(`неизвестное действие ${a}`);
    return { cs: s0.cs.includes(v) ? s0.cs.filter(c => c !== v) : [...s0.cs, v] };
  },
  goal(card, s) {
    const g = card.goal;
    return !genConflicts(s.cs).length
      && card.ops.every(o => GEN_OPS[o].ok(s.cs))
      && (g.allow ?? []).every(t => genFits(t, s.cs))
      && (g.deny ?? []).every(t => !genFits(t, s.cs));
  }
};

/* =====================================================================
   Замыкания: лямбда захватывает переменную, а не значение.
   ===================================================================== */

export const CLOSURE_CODE = {
  for: 'var actions = new List<Action>();\nfor (int i = 0; i < 3; i++)\n    actions.Add(() => Console.Write(i));\n\nforeach (var a in actions) a();',
  copy: 'var actions = new List<Action>();\nfor (int i = 0; i < 3; i++)\n{\n    int j = i;                     // своя переменная на каждый круг\n    actions.Add(() => Console.Write(j));\n}\nforeach (var a in actions) a();',
  foreach: 'var actions = new List<Action>();\nforeach (var i in new[] { 0, 1, 2 })\n    actions.Add(() => Console.Write(i));\n\nforeach (var a in actions) a();'
};

/**
 * Кадры: line — строка кода, boxes — объекты-замыкания (скрытые классы компилятора) с их полями,
 * lambdas — на какой объект ссылается каждая лямбда, out — что напечатано.
 */
export function closureFrames(variant) {
  const F = (line, boxes, lambdas, out, note) => ({ line, boxes: boxes.map(b => ({ ...b })), lambdas: [...lambdas], out: [...out], note });
  const fr = [];
  const callLine = variant === 'copy' ? 6 : 4;
  if (variant === 'for') {
    const box = { id: 1, v: 'i', val: 0 };
    fr.push(F(1, [box], [], [], 'Компилятор видит, что i захвачена лямбдой, и делает i полем скрытого объекта. Объект один на весь цикл.'));
    const lam = [];
    for (let i = 0; i < 3; i++) {
      box.val = i; lam.push(1);
      fr.push(F(2, [box], lam, [], `i = ${i}. Лямбда №${i + 1} запоминает ссылку на тот же объект, а не число ${i}.`));
    }
    box.val = 3;
    fr.push(F(1, [box], lam, [], 'i++ сделала i = 3, условие i < 3 ложно — цикл закончился. Все три лямбды смотрят на одно поле i = 3.'));
    const out = [];
    for (let k = 0; k < 3; k++) { out.push(3); fr.push(F(callLine, [box], lam, out, `Лямбда №${k + 1} читает поле i прямо сейчас — там 3.`)); }
  } else {
    const boxes = [], lam = [];
    const v = variant === 'copy' ? 'j' : 'i';
    fr.push(F(1, [], [], [], variant === 'copy' ? 'Захвачена j, объявленная внутри тела цикла, — значит, объект нужен на каждый круг.' : 'В foreach (с C# 5) переменная i своя на каждый круг.'));
    for (let i = 0; i < 3; i++) {
      boxes.push({ id: i + 1, v, val: i }); lam.push(i + 1);
      fr.push(F(variant === 'copy' ? 4 : 2, boxes, lam, [], `Круг ${i + 1}: новый объект с ${v} = ${i}, лямбда №${i + 1} ссылается на него.`));
    }
    const out = [];
    for (let k = 0; k < 3; k++) { out.push(k); fr.push(F(callLine, boxes, lam, out, `Лямбда №${k + 1} читает свой объект: ${v} = ${k}.`)); }
  }
  return fr;
}

export const closureRig = {
  init(card) {
    const variant = card.start ?? 'for';
    return { variant, f: 0, frames: closureFrames(variant), done: [] };
  },
  act(card, s0, a) {
    const [k, v] = a.split(':');
    if (k === 'reset') return closureRig.init(card);
    const s = { ...s0, done: [...s0.done] };
    if (k === 'variant' && v in CLOSURE_CODE) { s.variant = v; s.frames = closureFrames(v); s.f = 0; }
    else if (k === 'step') s.f = Math.min(s.f + 1, s.frames.length - 1);
    else if (k === 'end') s.f = s.frames.length - 1;
    else throw new Error(`неизвестное действие ${a}`);
    if (s.f === s.frames.length - 1) s.done.push({ variant: s.variant, out: s.frames[s.f].out.join(' ') });
    return s;
  },
  /** Цель — досмотреть до конца вариант из goal.variants с выводом goal.out. */
  goal: (card, s) => s.done.some(d => d.out === card.goal.out && (!card.goal.variants || card.goal.variants.includes(d.variant)))
};

/* =====================================================================
   LINQ: ленивое выполнение, Take, ToList и повторный перебор.
   ===================================================================== */

export const LINQ_DATA = [1, 5, 2, 8, 3, 9];

export function linqCode(o) {
  return [
    'var query = numbers',
    o.orderBy ? '    .OrderBy(x => x)' : null,
    '    .Where(x => x > 2)',
    '    .Select(x => x * 10)',
    o.toList ? '    .ToList()                // выполняется сразу' : null,
    '    .Take(2);',
    o.twice ? 'Console.WriteLine(query.Count());' : null,
    'foreach (var n in query) Console.WriteLine(n);'
  ].filter(l => l !== null).join('\n');
}

/** Журнал вызовов и счётчики для всего фрагмента. */
export function linqRun(o) {
  const ev = [], c = { read: 0, where: 0, select: 0 };
  const passSource = (limit) => {
    // один перебор цепочки до ToList или до Take(limit)
    let src = LINQ_DATA;
    if (o.orderBy) {
      for (const x of LINQ_DATA) { c.read++; ev.push(`читаем ${x}`); }
      src = [...LINQ_DATA].sort((a, b) => a - b);
      ev.push(`OrderBy сортирует все ${LINQ_DATA.length} → ${src.join(', ')}`);
    }
    const got = [];
    for (const x of src) {
      if (!o.orderBy) { c.read++; ev.push(`читаем ${x}`); }
      c.where++;
      if (!(x > 2)) { ev.push(`Where(${x}) — нет`); continue; }
      c.select++; ev.push(`Where(${x}) — да → Select → ${x * 10}`);
      got.push(x * 10);
      if (limit && got.length === limit) { ev.push(`Take(${limit}) получил ${limit} — дальше не читаем`); break; }
    }
    return got;
  };
  const runs = o.twice ? ['Count()', 'foreach'] : ['foreach'];
  if (o.toList) {
    const list = passSource(0);
    ev.push(`ToList: список из ${list.length} готов ещё до перебора`);
    for (const r of runs) ev.push(`${r}: Take(2) берёт ${list.slice(0, 2).join(', ')} из готового списка`);
  } else {
    for (const r of runs) { ev.push(`— ${r} запускает запрос —`); passSource(2); }
  }
  return { ev, c };
}

export const linqRig = {
  init(card) {
    const o = { orderBy: false, toList: false, twice: false, ...(card.start ?? {}) };
    return { o, f: 0, ...linqRun(o), seen: [] };
  },
  act(card, s0, a) {
    if (a === 'reset') return linqRig.init(card);
    let s = { ...s0, seen: [...s0.seen] };
    if (['orderBy', 'toList', 'twice'].includes(a)) { const o = { ...s.o, [a]: !s.o[a] }; s = { ...s, o, f: 0, ...linqRun(o) }; }
    else if (a === 'step') s.f = Math.min(s.f + 1, s.ev.length);
    else if (a === 'end') s.f = s.ev.length;
    else throw new Error(`неизвестное действие ${a}`);
    if (s.f === s.ev.length) s.seen.push({ ...s.o, ...s.c });
    return s;
  },
  /** Цель — довести до конца вариант со счётчиками не выше goal.max и с флагами goal.o. */
  goal(card, s) {
    const g = card.goal;
    return s.seen.some(r => Object.entries(g.max ?? {}).every(([k, v]) => r[k] <= v)
      && Object.entries(g.min ?? {}).every(([k, v]) => r[k] >= v)
      && Object.entries(g.o ?? {}).every(([k, v]) => r[k] === v));
  }
};

/* =====================================================================
   Выделения памяти: разбор строки "12,34,56" тремя способами.
   ===================================================================== */

export const PARSE = {
  split: { name: 'Split', code: 'foreach (var part in line.Split(\',\'))\n    sum += int.Parse(part);', allocs: n => 1 + n, what: n => `массив string[${n}] и ${n} новых строк` },
  substring: { name: 'Substring', code: 'int start = 0;\nfor (int i = 0; i <= line.Length; i++)\n    if (i == line.Length || line[i] == \',\')\n    {\n        sum += int.Parse(line.Substring(start, i - start));\n        start = i + 1;\n    }', allocs: n => n, what: n => `${n} новых строк` },
  span: { name: 'Span', code: 'ReadOnlySpan<char> rest = line;\nwhile (!rest.IsEmpty)\n{\n    int comma = rest.IndexOf(\',\');\n    var part = comma < 0 ? rest : rest[..comma];\n    sum += int.Parse(part);\n    rest = comma < 0 ? default : rest[(comma + 1)..];\n}', allocs: () => 0, what: () => 'ничего: срезы смотрят в исходную строку' }
};

export const allocRig = {
  init: card => ({ way: card.start ?? 'split', n: 3 }),
  act(card, s0, a) {
    const [k, v] = a.split(':');
    if (k === 'reset') return allocRig.init(card);
    if (k === 'way' && v in PARSE) return { ...s0, way: v };
    throw new Error(`неизвестное действие ${a}`);
  },
  goal: (card, s) => PARSE[s.way].allocs(s.n) <= card.goal.max
};

/* =====================================================================
   Защитные копии: большая структура, параметр по значению / ref / in, readonly struct.
   ===================================================================== */

export const PASS = { value: 'по значению', ref: 'ref', in: 'in' };

/** Сколько копий 64-байтной структуры на один вызов Measure(…) с двумя вызовами методов внутри. */
export function copies(pass, ro) {
  if (pass === 'value') return { n: 1, why: 'аргумент копируется целиком при вызове', mutable: false };
  if (pass === 'ref') return { n: 0, why: 'передаётся ссылка — но метод может изменить структуру вызывающего', mutable: true };
  if (ro) return { n: 0, why: 'readonly struct: компилятор знает, что методы её не меняют, копий нет', mutable: false };
  return { n: 2, why: 'in + обычная структура: перед каждым вызовом метода — защитная копия (метод мог бы её изменить)', mutable: false };
}

export const copyRig = {
  init: card => ({ pass: 'value', ro: false, ...(card.start ?? {}) }),
  act(card, s0, a) {
    const [k, v] = a.split(':');
    if (k === 'reset') return copyRig.init(card);
    if (k === 'pass' && v in PASS) return { ...s0, pass: v };
    if (k === 'ro') return { ...s0, ro: !s0.ro };
    throw new Error(`неизвестное действие ${a}`);
  },
  goal(card, s) {
    const c = copies(s.pass, s.ro);
    return c.n <= card.goal.max && (card.goal.safe ? !c.mutable : true);
  }
};

/* =====================================================================
   switch-выражение: первая подходящая ветка побеждает.
   ===================================================================== */

export const ARMS = {
  point: { pat: 'Circle { R: 0 }', res: '"точка"', test: x => x?.k === 'circle' && x.r === 0 },
  circle: { pat: 'Circle c', res: '"круг"', test: x => x?.k === 'circle' },
  square: { pat: 'Rect { W: var w, H: var h } when w == h', res: '"квадрат"', test: x => x?.k === 'rect' && x.w === x.h, guarded: true },
  rect: { pat: 'Rect r', res: '"прямоугольник"', test: x => x?.k === 'rect' },
  nul: { pat: 'null', res: '"пусто"', test: x => x == null },
  any: { pat: '_', res: '"что-то ещё"', test: () => true }
};

export const SHAPES = [
  { label: 'new Circle(0)', v: { k: 'circle', r: 0 }, want: 'point' },
  { label: 'new Circle(2)', v: { k: 'circle', r: 2 }, want: 'circle' },
  { label: 'new Rect(3, 3)', v: { k: 'rect', w: 3, h: 3 }, want: 'square' },
  { label: 'new Rect(2, 5)', v: { k: 'rect', w: 2, h: 5 }, want: 'rect' },
  { label: 'null', v: null, want: 'nul' },
  { label: 'new Triangle()', v: { k: 'tri' }, want: 'any' }
];

/** Какая ветка сработает для каждой фигуры. */
export const switchHits = order => SHAPES.map(sh => order.find(id => ARMS[id].test(sh.v)));

/**
 * Недостижимые ветки (ошибка CS8510): всё, что ловит ветка, уже поймали ветки выше без when.
 * Проверяем на представительном наборе фигур; ветке с when хватает, чтобы выше стояла ветка того же типа.
 */
export function unreachable(order) {
  return order.filter((id, i) => {
    const above = order.slice(0, i).filter(a => !ARMS[a].guarded);
    const caught = SHAPES.filter(sh => ARMS[id].test(sh.v) || (ARMS[id].guarded && ARMS.rect.test(sh.v)));
    return caught.length > 0 && caught.every(sh => above.some(a => ARMS[a].test(sh.v)));
  });
}

export const switchRig = {
  init: card => ({ order: [...card.start] }),
  act(card, s0, a) {
    const [k, v] = a.split(':');
    if (k === 'reset') return switchRig.init(card);
    const i = s0.order.indexOf(v);
    if (k !== 'up' || i < 1) throw new Error(`неизвестное действие ${a}`);
    const order = [...s0.order];
    [order[i - 1], order[i]] = [order[i], order[i - 1]];
    return { order };
  },
  goal: (card, s) => !unreachable(s.order).length && switchHits(s.order).every((h, i) => h === SHAPES[i].want)
};
